import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { autenticar } from '../middleware/auth';

export const dashboardRouter = Router();
dashboardRouter.use(autenticar);

/** GET /api/dashboard — indicadores y alertas para la pantalla principal. */
dashboardRouter.get('/', async (_req, res, next) => {
  try {
    const [referenciasActivas, saldos, reservasActivas, reservasPorVencerCount, diasAlerta, ventasHoy] =
      await Promise.all([
        prisma.referenciaVendible.count({ where: { estado: 'ACTIVO' } }),
        prisma.inventarioSaldo.aggregate({
          _sum: { cantidadDisponible: true, cantidadReservada: true, cantidadDanada: true },
        }),
        prisma.reserva.count({ where: { estado: 'ACTIVA' } }),
        prisma.reserva.count({
          where: { estado: 'ACTIVA', fechaLimite: { lte: new Date(Date.now() + 3 * 24 * 3600 * 1000) } },
        }),
        prisma.parametro.findUnique({ where: { clave: 'dias_alerta_vencimiento' } }),
        prisma.venta.count({ where: { fecha: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
      ]);
    const dias = Number(diasAlerta?.valor ?? 30);
    const limiteVencimiento = new Date(Date.now() + dias * 24 * 3600 * 1000);

    const [stockBajo, proximosVencimientos, reservasPorVencer, ultimasVentas] = await Promise.all([
      // Productos activos con disponibilidad crítica (≤ 5 unidades o agotados)
      prisma.inventarioSaldo.findMany({
        where: { cantidadDisponible: { lte: 5 }, referencia: { estado: 'ACTIVO' } },
        include: {
          referencia: {
            include: {
              producto: { select: { nombre: true } },
              marca: { select: { nombre: true } },
              presentacion: { select: { nombre: true } },
            },
          },
        },
        orderBy: { cantidadDisponible: 'asc' },
        take: 8,
      }),
      // Ingresos de productos perecederos próximos a vencer
      prisma.ingresoDetalle.findMany({
        where: { fechaVencimiento: { not: null, lte: limiteVencimiento } },
        include: {
          referencia: {
            include: {
              producto: { select: { nombre: true } },
              marca: { select: { nombre: true } },
            },
          },
        },
        orderBy: { fechaVencimiento: 'asc' },
        take: 8,
      }),
      prisma.reserva.findMany({
        where: { estado: 'ACTIVA' },
        include: {
          cliente: { select: { razonSocial: true, nombre: true, apellido: true } },
          detalles: true,
        },
        orderBy: { fechaLimite: 'asc' },
        take: 6,
      }),
      prisma.venta.findMany({
        include: {
          factura: { select: { consecutivo: true } },
          cliente: { select: { razonSocial: true, nombre: true, apellido: true } },
        },
        orderBy: { id: 'desc' },
        take: 6,
      }),
    ]);

    const nombreTercero = (t: { razonSocial: string | null; nombre: string | null; apellido: string | null }) =>
      t.razonSocial ?? [t.nombre, t.apellido].filter(Boolean).join(' ') ?? null;

    res.json({
      referenciasActivas,
      ventasHoy,
      saldos: {
        disponible: Number(saldos._sum.cantidadDisponible ?? 0),
        reservada: Number(saldos._sum.cantidadReservada ?? 0),
        danada: Number(saldos._sum.cantidadDanada ?? 0),
      },
      reservas: { activas: reservasActivas, porVencer: reservasPorVencerCount },
      alertas: { diasAntelacion: dias },
      stockBajo: stockBajo.map((s) => ({
        referenciaId: s.referenciaId,
        codigoBarras: s.referencia.codigoBarras,
        descripcion:
          s.referencia.nombre ??
          `${s.referencia.producto.nombre} - ${s.referencia.marca.nombre} - ${s.referencia.presentacion.nombre}`,
        disponible: Number(s.cantidadDisponible),
        reservada: Number(s.cantidadReservada),
      })),
      proximosVencimientos: proximosVencimientos.map((v) => ({
        id: v.id,
        producto: `${v.referencia.producto.nombre} - ${v.referencia.marca.nombre}`,
        fechaVencimiento: v.fechaVencimiento,
        cantidadIngresada: Number(v.cantidad),
      })),
      reservasPorVencer: reservasPorVencer.map((r) => ({
        id: r.id,
        consecutivo: r.consecutivo,
        cliente: nombreTercero(r.cliente),
        fechaLimite: r.fechaLimite,
        unidades: r.detalles.reduce((s, d) => s + Number(d.cantidad), 0),
      })),
      ultimasVentas: ultimasVentas.map((v) => ({
        id: v.id,
        factura: v.factura?.consecutivo ?? '—',
        cliente: v.cliente ? nombreTercero(v.cliente) : 'Consumidor final',
        total: Number(v.total),
        fecha: v.fecha,
      })),
    });
  } catch (e) {
    next(e);
  }
});
