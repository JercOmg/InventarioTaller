import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { ApiError } from '../lib/errors';
import { autenticar, requierePermiso } from '../middleware/auth';

export const garantiasRouter = Router();
garantiasRouter.use(autenticar);

/**
 * GET /api/garantias?factura=FV-000001 — consulta de vigencia posventa — RF-13.
 * La garantía nace con la venta (supuesto documentado; pendiente de confirmación).
 */
garantiasRouter.get('/', requierePermiso('garantias.ver'), async (req, res, next) => {
  try {
    const factura = (req.query.factura as string | undefined)?.trim();
    const garantias = await prisma.garantia.findMany({
      where: factura
        ? { ventaDetalle: { venta: { factura: { consecutivo: factura } } } }
        : {},
      include: {
        referencia: { include: { producto: true, marca: true, presentacion: true } },
        ventaDetalle: {
          include: {
            venta: { include: { factura: true, cliente: { select: { razonSocial: true, nombre: true, apellido: true } } } },
          },
        },
      },
      orderBy: { id: 'desc' },
      take: 200,
    });
    if (factura && garantias.length === 0) throw ApiError.noEncontrado(`No se encontraron garantías para la factura ${factura}`);
    res.json(
      garantias.map((g) => {
        const vencida = g.fechaFin < new Date();
        return {
          id: g.id,
          factura: g.ventaDetalle.venta.factura?.consecutivo ?? null,
          cliente: g.ventaDetalle.venta.cliente
            ? g.ventaDetalle.venta.cliente.razonSocial ??
              [g.ventaDetalle.venta.cliente.nombre, g.ventaDetalle.venta.cliente.apellido].filter(Boolean).join(' ')
            : 'Consumidor final',
          producto: `${g.referencia.producto.nombre} - ${g.referencia.marca.nombre} - ${g.referencia.presentacion.nombre}`,
          mesesCobertura: g.mesesCobertura,
          fechaInicio: g.fechaInicio,
          fechaFin: g.fechaFin,
          estado: vencida ? 'EXPIRADA' : 'VIGENTE',
        };
      }),
    );
  } catch (e) {
    next(e);
  }
});
