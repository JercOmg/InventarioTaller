import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { ApiError } from '../lib/errors';
import { autenticar, requierePermiso } from '../middleware/auth';
import { registrarAuditoria } from '../services/auditoria';
import { redondear } from '../lib/numeros';

export const preciosRouter = Router();
preciosRouter.use(autenticar);

/**
 * GET /api/precios/:referenciaId/historial — trazabilidad de precios — RF-16.
 * El costo promedio solo es visible para quien tiene permiso costos.ver (RF-21).
 */
preciosRouter.get('/:referenciaId/historial', requierePermiso('precios.ver'), async (req, res, next) => {
  try {
    const referenciaId = Number(req.params.referenciaId);
    const referencia = await prisma.referenciaVendible.findUnique({
      where: { id: referenciaId },
      include: { producto: true, marca: true, presentacion: true },
    });
    if (!referencia) throw ApiError.noEncontrado('Referencia no encontrada');
    const [precios, costos] = await Promise.all([
      prisma.historialPrecio.findMany({
        where: { referenciaId },
        include: { usuario: { select: { nombreCompleto: true } } },
        orderBy: { fecha: 'desc' },
        take: 100,
      }),
      req.usuario!.permisos.includes('costos.ver')
        ? prisma.historialCosto.findMany({ where: { referenciaId }, orderBy: { fecha: 'desc' }, take: 100 })
        : Promise.resolve([]),
    ]);
    res.json({
      referencia: {
        id: referencia.id,
        descripcion: referencia.nombre ?? `${referencia.producto.nombre} - ${referencia.marca.nombre} - ${referencia.presentacion.nombre}`,
        precioVigente: Number(referencia.precioVenta),
        ...(req.usuario!.permisos.includes('costos.ver') ? { costoPromedio: Number(referencia.costoPromedio) } : {}),
      },
      precios: precios.map((h) => ({
        id: h.id,
        precioAnterior: Number(h.precioAnterior),
        precioNuevo: Number(h.precioNuevo),
        porcentajeIncremento: h.porcentajeIncremento === null ? null : Number(h.porcentajeIncremento),
        usuario: h.usuario.nombreCompleto,
        fecha: h.fecha,
      })),
      costos: costos.map((c) => ({
        id: c.id,
        costoAnterior: Number(c.costoAnterior),
        costoNuevo: Number(c.costoNuevo),
        origen: c.origen,
        fecha: c.fecha,
      })),
    });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/precios — modifica el precio de venta — RF-16.
 * Acepta precio directo o porcentaje de incremento sobre el costo actual.
 * Solo Responsable de inventario (permiso precios.editar); deja registro
 * inmutable en el historial.
 */
preciosRouter.post('/', requierePermiso('precios.editar'), async (req, res, next) => {
  try {
    const dato = z
      .object({
        referenciaId: z.coerce.number().int().positive(),
        precioNuevo: z.coerce.number().min(0).optional(),
        porcentajeIncremento: z.coerce.number().optional(),
      })
      .refine((d) => d.precioNuevo !== undefined || d.porcentajeIncremento !== undefined, {
        message: 'Indique precioNuevo o porcentajeIncremento',
      })
      .parse(req.body);

    const referencia = await prisma.referenciaVendible.findUnique({ where: { id: dato.referenciaId } });
    if (!referencia) throw ApiError.noEncontrado('Referencia no encontrada');
    const precioAnterior = Number(referencia.precioVenta);
    let precioNuevo: number;
    if (dato.precioNuevo !== undefined) {
      precioNuevo = dato.precioNuevo;
    } else {
      precioNuevo = redondear(Number(referencia.costoPromedio) * (1 + dato.porcentajeIncremento! / 100), 2);
    }
    if (precioNuevo < 0) throw ApiError.badRequest('El precio no puede ser negativo');
    const pct = precioAnterior > 0 ? redondear(((precioNuevo - precioAnterior) / precioAnterior) * 100, 4) : null;

    const resultado = await prisma.$transaction(async (tx) => {
      await tx.referenciaVendible.update({ where: { id: dato.referenciaId }, data: { precioVenta: precioNuevo } });
      const historial = await tx.historialPrecio.create({
        data: {
          referenciaId: dato.referenciaId,
          precioAnterior,
          precioNuevo,
          porcentajeIncremento: dato.porcentajeIncremento ?? pct,
          usuarioId: req.usuario!.id,
        },
      });
      await registrarAuditoria(tx, {
        tablaAfectada: 'referencias_vendibles',
        registroId: dato.referenciaId,
        accion: 'UPDATE',
        entidad: 'precios',
        usuarioId: req.usuario!.id,
        direccionIp: req.ipCliente,
        estadoAnterior: { precioVenta: precioAnterior },
        estadoNuevo: { precioVenta: precioNuevo, porcentajeIncremento: dato.porcentajeIncremento ?? pct },
      });
      return historial;
    });
    res.status(201).json({
      id: resultado.id,
      precioAnterior,
      precioNuevo,
      porcentaje: pct,
      mensaje: 'Precio actualizado e historial registrado',
    });
  } catch (e) {
    next(e);
  }
});
