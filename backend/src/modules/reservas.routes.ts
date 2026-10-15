import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { ApiError } from '../lib/errors';
import { autenticar, requierePermiso } from '../middleware/auth';
import { moverStock } from '../services/inventario';
import { siguienteConsecutivo } from '../services/consecutivos';
import { verificarPeriodoAbierto } from '../services/cierres';
import { registrarAuditoria } from '../services/auditoria';
import { cumpleFraccionMinima } from '../lib/numeros';

export const reservasRouter = Router();
reservasRouter.use(autenticar);

const reservaSchema = z
  .object({
    clienteId: z.coerce.number().int().positive(),
    pedidoRef: z.string().min(1).max(60),
    fechaLimite: z.string(),
    detalles: z
      .array(z.object({ referenciaId: z.coerce.number().int().positive(), cantidad: z.coerce.number().positive() }))
      .min(1),
  })
  .refine((d) => new Set(d.detalles.map((x) => x.referenciaId)).size === d.detalles.length, {
    message: 'No se permiten líneas duplicadas de la misma referencia',
  });

function serializar(r: {
  id: number;
  consecutivo: string;
  cliente: { identificacion: string; razonSocial: string | null; nombre: string | null; apellido: string | null };
  pedidoRef: string;
  fechaLimite: Date;
  estado: string;
  motivoLiberacion: string | null;
  fecha: Date;
  fechaLiberacion: Date | null;
  usuario: { nombreCompleto: string };
  detalles: { referencia: { codigoBarras: string; nombre: string | null; producto: { nombre: string }; marca: { nombre: string }; presentacion: { nombre: string } }; cantidad: unknown }[];
}) {
  return {
    id: r.id,
    consecutivo: r.consecutivo,
    cliente: r.cliente.razonSocial ?? [r.cliente.nombre, r.cliente.apellido].filter(Boolean).join(' '),
    pedidoRef: r.pedidoRef,
    fechaLimite: r.fechaLimite,
    estado: r.estado,
    motivoLiberacion: r.motivoLiberacion,
    fecha: r.fecha,
    fechaLiberacion: r.fechaLiberacion,
    usuario: r.usuario.nombreCompleto,
    vencida: r.estado === 'ACTIVA' && r.fechaLimite < new Date(),
    detalles: r.detalles.map((d) => ({
      descripcion: d.referencia.nombre ?? `${d.referencia.producto.nombre} - ${d.referencia.marca.nombre} - ${d.referencia.presentacion.nombre}`,
      codigoBarras: d.referencia.codigoBarras,
      cantidad: Number(d.cantidad),
    })),
  };
}

/** GET /api/reservas?estado=ACTIVA — lista; además libera automáticamente las vencidas (RF-05). */
reservasRouter.get('/', requierePermiso('reservas.ver'), async (req, res, next) => {
  try {
    await liberarVencidas(req.usuario!.id);
    const estado = req.query.estado as string | undefined;
    const reservas = await prisma.reserva.findMany({
      where: estado ? { estado } : {},
      include: {
        cliente: { select: { identificacion: true, razonSocial: true, nombre: true, apellido: true } },
        usuario: { select: { nombreCompleto: true } },
        detalles: { include: { referencia: { include: { producto: true, marca: true, presentacion: true } } } },
      },
      orderBy: { id: 'desc' },
      take: 200,
    });
    res.json(reservas.map(serializar));
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/reservas — aparta mercancía del pool DISPONIBLE hacia RESERVADA — RF-05.
 * El motor bloquea la creación si deja el disponible en negativo.
 */
reservasRouter.post('/', requierePermiso('reservas.crear'), async (req, res, next) => {
  try {
    const dato = reservaSchema.parse(req.body);
    const fechaLimite = new Date(dato.fechaLimite);
    if (Number.isNaN(fechaLimite.getTime()) || fechaLimite <= new Date()) {
      throw ApiError.badRequest('La fecha límite debe ser una fecha futura');
    }
    const cliente = await prisma.tercero.findUnique({ where: { id: dato.clienteId } });
    if (!cliente?.esCliente) throw ApiError.badRequest('El tercero indicado no está marcado como cliente');

    const fecha = new Date();
    const resultado = await prisma.$transaction(async (tx) => {
      await verificarPeriodoAbierto(tx, fecha);
      const referencias = await tx.referenciaVendible.findMany({
        where: { id: { in: dato.detalles.map((d) => d.referenciaId) } },
      });
      const mapaRef = new Map(referencias.map((r) => [r.id, r]));
      for (const linea of dato.detalles) {
        const ref = mapaRef.get(linea.referenciaId);
        if (!ref) throw ApiError.badRequest(`La referencia ${linea.referenciaId} no existe`);
        if (!cumpleFraccionMinima(linea.cantidad, Number(ref.fraccionMinima))) {
          throw ApiError.badRequest(
            `La cantidad ${linea.cantidad} no respeta la fracción mínima (${Number(ref.fraccionMinima)}) del producto ${ref.codigoBarras}`,
          );
        }
      }
      const consecutivo = await siguienteConsecutivo(tx, 'RES');
      const reserva = await tx.reserva.create({
        data: {
          consecutivo,
          clienteId: dato.clienteId,
          pedidoRef: dato.pedidoRef,
          fechaLimite,
          estado: 'ACTIVA',
          usuarioId: req.usuario!.id,
          fecha,
          detalles: { create: dato.detalles },
        },
      });
      for (const linea of dato.detalles) {
        await moverStock(tx, {
          referenciaId: linea.referenciaId,
          cantidad: linea.cantidad,
          desde: 'DISPONIBLE',
          hacia: 'RESERVADA',
          clase: 'RESERVA',
          docTipo: 'Reserva',
          docId: reserva.id,
          usuarioId: req.usuario!.id,
          detalle: `Reserva ${consecutivo} — pedido ${dato.pedidoRef}`,
        });
      }
      await registrarAuditoria(tx, {
        tablaAfectada: 'reservas',
        registroId: reserva.id,
        accion: 'INSERT',
        entidad: 'reservas',
        usuarioId: req.usuario!.id,
        direccionIp: req.ipCliente,
        estadoNuevo: { consecutivo, clienteId: dato.clienteId, pedidoRef: dato.pedidoRef, detalles: dato.detalles },
      });
      return reserva;
    });
    res.status(201).json({ id: resultado.id, consecutivo: resultado.consecutivo });
  } catch (e) {
    next(e);
  }
});

/** Libera todas las reservas ACTIVAS cuya fecha límite ya pasó (RF-05). */
export async function liberarVencidas(usuarioId: number): Promise<void> {
  const vencidas = await prisma.reserva.findMany({
    where: { estado: 'ACTIVA', fechaLimite: { lt: new Date() } },
    include: { detalles: true },
  });
  for (const reserva of vencidas) {
    await prisma.$transaction(async (tx) => {
      await verificarPeriodoAbierto(tx, new Date());
      for (const linea of reserva.detalles) {
        await moverStock(tx, {
          referenciaId: linea.referenciaId,
          cantidad: Number(linea.cantidad),
          desde: 'RESERVADA',
          hacia: 'DISPONIBLE',
          clase: 'LIBERACION_RESERVA',
          docTipo: 'Reserva',
          docId: reserva.id,
          usuarioId,
          detalle: `Liberación automática por vencimiento de la reserva ${reserva.consecutivo}`,
        });
      }
      await tx.reserva.update({
        where: { id: reserva.id },
        data: {
          estado: 'LIBERADA',
          motivoLiberacion: 'Vencimiento de la fecha límite (automático)',
          fechaLiberacion: new Date(),
        },
      });
      await registrarAuditoria(tx, {
        tablaAfectada: 'reservas',
        registroId: reserva.id,
        accion: 'UPDATE',
        entidad: 'reservas',
        usuarioId,
        estadoAnterior: { estado: 'ACTIVA' },
        estadoNuevo: { estado: 'LIBERADA', motivo: 'vencimiento automático' },
      });
    });
  }
}

/** POST /api/reservas/:id/liberar — liberación manual por usuario autorizado (RF-05). */
reservasRouter.post('/:id/liberar', requierePermiso('reservas.liberar'), async (req, res, next) => {
  try {
    const { motivo } = z.object({ motivo: z.string().min(5) }).parse(req.body);
    const id = Number(req.params.id);
    const reserva = await prisma.reserva.findUnique({ where: { id }, include: { detalles: true } });
    if (!reserva) throw ApiError.noEncontrado('Reserva no encontrada');
    if (reserva.estado !== 'ACTIVA') throw ApiError.conflicto(`La reserva está en estado ${reserva.estado}`);

    const fecha = new Date();
    await prisma.$transaction(async (tx) => {
      await verificarPeriodoAbierto(tx, fecha);
      for (const linea of reserva.detalles) {
        await moverStock(tx, {
          referenciaId: linea.referenciaId,
          cantidad: Number(linea.cantidad),
          desde: 'RESERVADA',
          hacia: 'DISPONIBLE',
          clase: 'LIBERACION_RESERVA',
          docTipo: 'Reserva',
          docId: reserva.id,
          usuarioId: req.usuario!.id,
          detalle: `Liberación manual de la reserva ${reserva.consecutivo}: ${motivo}`,
        });
      }
      await tx.reserva.update({
        where: { id },
        data: { estado: 'LIBERADA', motivoLiberacion: motivo, fechaLiberacion: fecha },
      });
      await registrarAuditoria(tx, {
        tablaAfectada: 'reservas',
        registroId: id,
        accion: 'UPDATE',
        entidad: 'reservas',
        usuarioId: req.usuario!.id,
        direccionIp: req.ipCliente,
        estadoAnterior: { estado: 'ACTIVA' },
        estadoNuevo: { estado: 'LIBERADA', motivo },
      });
    });
    res.json({ id, estado: 'LIBERADA' });
  } catch (e) {
    next(e);
  }
});
