import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { ApiError } from '../lib/errors';
import { autenticar, requierePermiso } from '../middleware/auth';
import { moverStock } from '../services/inventario';
import { siguienteConsecutivo } from '../services/consecutivos';
import { verificarPeriodoAbierto } from '../services/cierres';
import { registrarAuditoria } from '../services/auditoria';
import { redondear, cumpleFraccionMinima } from '../lib/numeros';

export const ventasRouter = Router();
ventasRouter.use(autenticar);

const lineaVentaSchema = z.object({
  referenciaId: z.coerce.number().int().positive(),
  cantidad: z.coerce.number().positive(),
  precioUnitario: z.coerce.number().min(0).optional(), // si no, toma el precio vigente
  descuento: z.coerce.number().min(0).optional(), // valor monetario de línea
});

const ventaSchema = z
  .object({
    clienteId: z.coerce.number().int().positive().optional().nullable(),
    reservaId: z.coerce.number().int().positive().optional().nullable(),
    descuentoGlobal: z.coerce.number().min(0).optional(),
    detalles: z.array(lineaVentaSchema).optional(),
  })
  .refine((d) => d.reservaId || (d.detalles && d.detalles.length > 0), {
    message: 'Debe enviar líneas de venta o el identificador de una reserva a convertir',
  });

function serializarVenta(v: {
  id: number;
  cliente: { identificacion: string; razonSocial: string | null; nombre: string | null; apellido: string | null } | null;
  usuario: { nombreCompleto: string };
  reservaId: number | null;
  subtotal: unknown;
  descuento: unknown;
  impuestos: unknown;
  total: unknown;
  fecha: Date;
  detalles: {
    id: number;
    referencia: { codigoBarras: string; nombre: string | null; producto: { nombre: string }; marca: { nombre: string }; presentacion: { nombre: string }; unidadBase: { codigo: string } };
    cantidad: unknown;
    precioUnitario: unknown;
    descuento: unknown;
    ivaPorcentaje: unknown;
    subtotal: unknown;
    devuelto: unknown;
  }[];
  factura: { consecutivo: string; tipo: string; estado: string; fechaEmision: Date } | null;
}) {
  return {
    id: v.id,
    factura: v.factura?.consecutivo ?? null,
    tipoFactura: v.factura?.tipo ?? null,
    estadoFactura: v.factura?.estado ?? null,
    cliente: v.cliente
      ? v.cliente.razonSocial ?? [v.cliente.nombre, v.cliente.apellido].filter(Boolean).join(' ')
      : 'Consumidor final',
    usuario: v.usuario.nombreCompleto,
    reservaId: v.reservaId,
    subtotal: Number(v.subtotal),
    descuento: Number(v.descuento),
    impuestos: Number(v.impuestos),
    total: Number(v.total),
    fecha: v.fecha,
    detalles: v.detalles.map((d) => ({
      id: d.id,
      descripcion: d.referencia.nombre ?? `${d.referencia.producto.nombre} - ${d.referencia.marca.nombre} - ${d.referencia.presentacion.nombre}`,
      codigoBarras: d.referencia.codigoBarras,
      unidad: d.referencia.unidadBase.codigo,
      cantidad: Number(d.cantidad),
      precioUnitario: Number(d.precioUnitario),
      descuento: Number(d.descuento),
      ivaPorcentaje: Number(d.ivaPorcentaje),
      subtotal: Number(d.subtotal),
      devuelto: Number(d.devuelto),
    })),
  };
}

/** GET /api/ventas?desde=&haste= — historial (permiso ventas.ver). */
ventasRouter.get('/', requierePermiso('ventas.ver'), async (req, res, next) => {
  try {
    const ventas = await prisma.venta.findMany({
      where: {
        ...(req.query.desde ? { fecha: { gte: new Date(String(req.query.desde)) } } : {}),
      },
      include: {
        cliente: { select: { identificacion: true, razonSocial: true, nombre: true, apellido: true } },
        usuario: { select: { nombreCompleto: true } },
        detalles: {
          include: {
            referencia: {
              include: {
                producto: { select: { nombre: true } },
                marca: { select: { nombre: true } },
                presentacion: { select: { nombre: true } },
                unidadBase: { select: { codigo: true } },
              },
            },
          },
        },
        factura: true,
      },
      orderBy: { id: 'desc' },
      take: 200,
    });
    res.json(ventas.map(serializarVenta));
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/ventas — registra la venta y emite la factura — RF-08, RF-09, RF-17.
 *
 * Concurrencia (RF-09/RNF-03): cada línea se descuenta vía el motor de
 * inventario, que bloquea la fila de saldos con SELECT FOR UPDATE; la segunda
 * transacción concurrente lee el saldo ya reducido y es rechazada. La primera
 * transacción confirmada gana; el inventario nunca queda negativo.
 *
 * Si `reservaId` viene informado, convierte la reserva a venta (RF-10): las
 * unidades salen del pool RESERVADO sin volver a tocar el DISPONIBLE.
 */
ventasRouter.post('/', requierePermiso('ventas.facturar'), async (req, res, next) => {
  try {
    const dato = ventaSchema.parse(req.body);
    if (dato.clienteId) {
      const cliente = await prisma.tercero.findUnique({ where: { id: dato.clienteId } });
      if (!cliente?.esCliente) throw ApiError.badRequest('El tercero indicado no está marcado como cliente');
    }

    const fecha = new Date();
    const resultado = await prisma.$transaction(
      async (tx) => {
        await verificarPeriodoAbierto(tx, fecha);

        // ---- Definir líneas: reserva (RF-10) o carrito (RF-08) ----
        let reserva: { id: number; consecutivo: string; estado: string; clienteId: number; detalles: { referenciaId: number; cantidad: unknown }[] } | null = null;
        let lineas: { referenciaId: number; cantidad: number; descuentoValor: number }[] = [];
        let clienteId = dato.clienteId ?? null;

        if (dato.reservaId) {
          const r = await tx.reserva.findUnique({ where: { id: dato.reservaId }, include: { detalles: true } });
          if (!r) throw ApiError.noEncontrado('Reserva no encontrada');
          if (r.estado !== 'ACTIVA') {
            throw ApiError.conflicto(
              'No se puede facturar una reserva que ya fue liberada o completada (sus existencias fueron devueltas a disponibilidad)',
            );
          }
          reserva = r;
          clienteId = r.clienteId;
          lineas = r.detalles.map((d) => ({ referenciaId: d.referenciaId, cantidad: Number(d.cantidad), descuentoValor: 0 }));
        } else {
          lineas = dato.detalles!.map((d) => ({
            referenciaId: d.referenciaId,
            cantidad: d.cantidad,
            descuentoValor: d.descuento ?? 0,
          }));
        }

        // ---- Cargar referencias y validar ----
        const referencias = await tx.referenciaVendible.findMany({
          where: { id: { in: lineas.map((l) => l.referenciaId) } },
          include: { producto: true },
        });
        const mapaRef = new Map(referencias.map((r) => [r.id, r]));
        for (const linea of lineas) {
          const ref = mapaRef.get(linea.referenciaId);
          if (!ref) throw ApiError.badRequest(`La referencia ${linea.referenciaId} no existe`);
          if (ref.estado !== 'ACTIVO') throw ApiError.badRequest(`La referencia ${ref.codigoBarras} está inactiva`);
          if (!cumpleFraccionMinima(linea.cantidad, Number(ref.fraccionMinima))) {
            throw ApiError.badRequest(
              `La cantidad ${linea.cantidad} no respeta la fracción mínima (${Number(ref.fraccionMinima)}) del producto ${ref.codigoBarras}`,
            );
          }
        }

        // ---- Descuento de inventario (bloqueo por línea — RF-09) ----
        const descontosPorLinea: { disponibleDespues: number }[] = [];
        for (const linea of lineas) {
          const ref = mapaRef.get(linea.referenciaId)!;
          const mov = await moverStock(tx, {
            referenciaId: linea.referenciaId,
            cantidad: linea.cantidad,
            desde: reserva ? 'RESERVADA' : 'DISPONIBLE',
            hacia: null,
            clase: reserva ? 'CONSUMO_RESERVA' : 'VENTA',
            docTipo: 'Venta',
            usuarioId: req.usuario!.id,
            detalle: reserva ? `Conversión de reserva ${reserva.consecutivo}` : 'Venta de mostrador',
          });
          descontosPorLinea.push({ disponibleDespues: mov.saldos.DISPONIBLE });
        }

        // ---- Cálculos financieros (RNF-02) ----
        const lineasCalculadas = lineas.map((l) => {
          const ref = mapaRef.get(l.referenciaId)!;
          const precio = ref.precioVenta;
          const bruto = redondear(Number(precio) * l.cantidad, 2);
          const descuentoLinea = Math.min(l.descuentoValor, bruto);
          const base = redondear(bruto - descuentoLinea, 2);
          const iva = redondear((base * Number(ref.ivaPorcentaje)) / 100, 2);
          return {
            referenciaId: l.referenciaId,
            cantidad: l.cantidad,
            precioUnitario: Number(precio),
            descuento: descuentoLinea,
            ivaPorcentaje: Number(ref.ivaPorcentaje),
            subtotal: base,
            iva,
          };
        });
        const descuentoGlobal = dato.descuentoGlobal ?? 0;
        const subtotal = redondear(lineasCalculadas.reduce((s, l) => s + l.subtotal, 0), 2);
        const descuentoTotal = redondear(
          Math.min(descuentoGlobal + lineasCalculadas.reduce((s, l) => s + l.descuento, 0), subtotal),
          2,
        );
        const baseImponible = redondear(subtotal - descuentoTotal, 2);
        // Proporción del descuento global aplicada a cada línea para el IVA
        const factor = subtotal > 0 ? baseImponible / subtotal : 0;
        const impuestos = redondear(lineasCalculadas.reduce((s, l) => s + redondear(l.iva * factor, 2), 0), 2);
        const total = redondear(baseImponible + impuestos, 2);
        if (total < 0) throw ApiError.badRequest('No se puede emitir una factura con valor total negativo');

        // ---- Persistir venta ----
        const venta = await tx.venta.create({
          data: {
            clienteId,
            usuarioId: req.usuario!.id,
            reservaId: reserva?.id ?? null,
            subtotal,
            descuento: descuentoTotal,
            impuestos,
            total,
            fecha,
            detalles: {
              create: lineasCalculadas.map((l) => ({
                referenciaId: l.referenciaId,
                cantidad: l.cantidad,
                precioUnitario: l.precioUnitario,
                descuento: l.descuento,
                ivaPorcentaje: l.ivaPorcentaje,
                subtotal: l.subtotal,
              })),
            },
          },
          include: { detalles: true },
        });

        // ---- Factura con consecutivo interno (RF-17; DIAN pendiente) ----
        const consecutivoFV = await siguienteConsecutivo(tx, 'FV');
        await tx.factura.create({
          data: { ventaId: venta.id, consecutivo: consecutivoFV, tipo: 'INTERNA', estado: 'EMITIDA' },
        });

        // ---- Garantías automáticas para productos parametrizados (RF-13) ----
        for (const l of lineasCalculadas) {
          const ref = mapaRef.get(l.referenciaId)!;
          if (ref.producto.mesesGarantia > 0) {
            const detalleVenta = venta.detalles.find((d) => d.referenciaId === l.referenciaId)!;
            const fin = new Date(fecha);
            fin.setMonth(fin.getMonth() + ref.producto.mesesGarantia);
            await tx.garantia.create({
              data: {
                ventaDetalleId: detalleVenta.id,
                referenciaId: l.referenciaId,
                fechaInicio: fecha,
                mesesCobertura: ref.producto.mesesGarantia,
                fechaFin: fin,
              },
            });
          }
        }

        // ---- Cierre de la reserva (RF-10) ----
        if (reserva) {
          await tx.reserva.update({
            where: { id: reserva.id },
            data: { estado: 'COMPLETADA' },
          });
        }

        await registrarAuditoria(tx, {
          tablaAfectada: 'ventas',
          registroId: venta.id,
          accion: 'INSERT',
          entidad: 'ventas',
          usuarioId: req.usuario!.id,
          direccionIp: req.ipCliente,
          estadoNuevo: {
            factura: consecutivoFV,
            total,
            lineas: lineasCalculadas,
            ...(reserva ? { reservaConvertida: reserva.consecutivo } : {}),
          },
        });
        return { ventaId: venta.id, factura: consecutivoFV };
      },
      // Timeout generoso: con dos ventas concurrentes sobre la misma fila,
      // la segunda espera el bloqueo de la primera (RF-09)
      { timeout: 20_000 },
    );

    const venta = await prisma.venta.findUnique({
      where: { id: resultado.ventaId },
      include: {
        cliente: { select: { identificacion: true, razonSocial: true, nombre: true, apellido: true } },
        usuario: { select: { nombreCompleto: true } },
        detalles: {
          include: {
            referencia: {
              include: {
                producto: { select: { nombre: true } },
                marca: { select: { nombre: true } },
                presentacion: { select: { nombre: true } },
                unidadBase: { select: { codigo: true } },
              },
            },
          },
        },
        factura: true,
      },
    });
    res.status(201).json({ ...serializarVenta(venta!), factura: resultado.factura });
  } catch (e) {
    next(e);
  }
});

// ---------------- Devoluciones de clientes (RF-18) ----------------
const devolucionSchema = z.object({
  ventaId: z.coerce.number().int().positive(),
  motivo: z.string().min(5),
  aprobadorUsuario: z.string().min(1),
  aprobadorPassword: z.string().min(1),
  detalles: z
    .array(
      z.object({
        ventaDetalleId: z.coerce.number().int().positive(),
        cantidad: z.coerce.number().positive(),
        estadoReingreso: z.enum(['DISPONIBLE', 'DANADO']),
      }),
    )
    .min(1),
});

ventasRouter.get('/devoluciones', requierePermiso('ventas.ver'), async (_req, res, next) => {
  try {
    const devoluciones = await prisma.devolucionCliente.findMany({
      include: {
        venta: { include: { factura: true } },
        usuarioRecibeRel: { select: { nombreCompleto: true } },
        usuarioApruebaRel: { select: { nombreCompleto: true } },
        detalles: { include: { referencia: { select: { codigoBarras: true, nombre: true, producto: { select: { nombre: true } } } } } },
      },
      orderBy: { id: 'desc' },
      take: 100,
    });
    res.json(
      devoluciones.map((d) => ({
        id: d.id,
        consecutivo: d.consecutivo,
        factura: d.venta.factura?.consecutivo ?? null,
        motivo: d.motivo,
        recibe: d.usuarioRecibeRel.nombreCompleto,
        aprueba: d.usuarioApruebaRel.nombreCompleto,
        fecha: d.fecha,
        detalles: d.detalles.map((x) => ({
          descripcion: x.referencia.nombre ?? x.referencia.producto.nombre,
          cantidad: Number(x.cantidad),
          estadoReingreso: x.estadoReingreso,
        })),
      })),
    );
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/ventas/devoluciones — reingreso de mercancía ligado a la factura — RF-18.
 * Requiere credenciales de un segundo usuario autorizado (aprobación superior).
 * Las cantidades no pueden superar lo facturado menos lo ya devuelto.
 */
ventasRouter.post('/devoluciones', requierePermiso('ventas.devoluciones'), async (req, res, next) => {
  try {
    const dato = devolucionSchema.parse(req.body);

    // Aprobación superior: segundo usuario con permiso explícito de aprobación
    const aprobador = await prisma.usuario.findUnique({ where: { nombreUsuario: dato.aprobadorUsuario } });
    if (!aprobador || !aprobador.activo || !(await bcrypt.compare(dato.aprobadorPassword, aprobador.passwordHash))) {
      throw ApiError.noAutorizado('Credenciales del aprobador inválidas');
    }
    if (aprobador.id === req.usuario!.id) {
      throw ApiError.prohibido('La devolución debe ser aprobada por un usuario distinto al que la recibe');
    }
    const rolesAprobador = await prisma.usuarioRol.findMany({
      where: { usuarioId: aprobador.id },
      include: { rol: { include: { permisos: { include: { permiso: true } } } } },
    });
    const permisosAprobador = new Set(rolesAprobador.flatMap((ur) => ur.rol.permisos.map((p) => p.permiso.codigo)));
    if (!permisosAprobador.has('ventas.devoluciones.aprobar')) {
      throw ApiError.prohibido('El usuario aprobador no tiene el permiso de aprobar devoluciones');
    }

    const fecha = new Date();
    const resultado = await prisma.$transaction(async (tx) => {
      await verificarPeriodoAbierto(tx, fecha);
      const venta = await tx.venta.findUnique({ where: { id: dato.ventaId }, include: { detalles: true, factura: true } });
      if (!venta) throw ApiError.noEncontrado('Venta no encontrada');
      if (venta.factura?.estado === 'ANULADA') throw ApiError.conflicto('No se pueden devolver productos de una factura anulada');

      for (const det of dato.detalles) {
        const lineaVenta = venta.detalles.find((v) => v.id === det.ventaDetalleId);
        if (!lineaVenta) throw ApiError.badRequest('Los productos a devolver deben pertenecer a la factura consultada');
        const yaDevuelto = Number(lineaVenta.devuelto);
        if (yaDevuelto + det.cantidad > Number(lineaVenta.cantidad)) {
          throw ApiError.conflicto(
            `La cantidad devuelta (${det.cantidad}) supera la cantidad original vendida (${Number(lineaVenta.cantidad)}) menos lo ya devuelto (${yaDevuelto})`,
          );
        }
      }

      const consecutivo = await siguienteConsecutivo(tx, 'DC');
      const devolucion = await tx.devolucionCliente.create({
        data: {
          consecutivo,
          ventaId: dato.ventaId,
          usuarioRecibe: req.usuario!.id,
          usuarioAprueba: aprobador.id,
          motivo: dato.motivo,
          fecha,
          detalles: {
            create: dato.detalles.map((d) => ({
              ventaDetalleId: d.ventaDetalleId,
              referenciaId: venta.detalles.find((v) => v.id === d.ventaDetalleId)!.referenciaId,
              cantidad: d.cantidad,
              estadoReingreso: d.estadoReingreso,
            })),
          },
        },
      });

      for (const d of dato.detalles) {
        const lineaVenta = venta.detalles.find((v) => v.id === d.ventaDetalleId)!;
        await moverStock(tx, {
          referenciaId: lineaVenta.referenciaId,
          cantidad: d.cantidad,
          desde: null,
          hacia: d.estadoReingreso === 'DANADO' ? 'DANADA' : 'DISPONIBLE',
          clase: 'DEVOLUCION_CLIENTE',
          docTipo: 'DevolucionCliente',
          docId: devolucion.id,
          usuarioId: req.usuario!.id,
          detalle: `Devolución ${consecutivo} sobre factura ${venta.factura?.consecutivo ?? venta.id}: ${dato.motivo}`,
        });
        await tx.ventaDetalle.update({
          where: { id: d.ventaDetalleId },
          data: { devuelto: Number(lineaVenta.devuelto) + d.cantidad },
        });
      }

      await registrarAuditoria(tx, {
        tablaAfectada: 'devoluciones_cliente',
        registroId: devolucion.id,
        accion: 'INSERT',
        entidad: 'ventas',
        usuarioId: req.usuario!.id,
        direccionIp: req.ipCliente,
        estadoNuevo: { consecutivo, ventaId: dato.ventaId, detalle: dato.detalles, aprobador: aprobador.nombreUsuario },
      });
      return devolucion;
    });
    res.status(201).json({ id: resultado.id, consecutivo: resultado.consecutivo });
  } catch (e) {
    next(e);
  }
});
