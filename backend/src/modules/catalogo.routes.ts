import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { ApiError } from '../lib/errors';
import { autenticar, requierePermiso } from '../middleware/auth';
import { registrarAuditoria } from '../services/auditoria';

export const catalogoRouter = Router();
catalogoRouter.use(autenticar);

const decimalPositivo = z.coerce.number().positive();
const referenciaSchema = z.object({
  productoId: z.coerce.number().int().positive(),
  marcaId: z.coerce.number().int().positive(),
  presentacionId: z.coerce.number().int().positive(),
  codigoBarras: z.string().min(1).max(100),
  nombre: z.string().max(200).optional().or(z.literal('')),
  unidadBaseId: z.coerce.number().int().positive(),
  fraccionMinima: decimalPositivo.default(1),
  decimales: z.coerce.number().int().min(0).max(6).default(2),
  ivaPorcentaje: z.coerce.number().min(0).max(100).default(19),
  precioVenta: z.coerce.number().min(0).default(0),
  estado: z.enum(['ACTIVO', 'INACTIVO']).optional(),
});

/** Serializa una referencia; el costo solo lo ve quien tiene permiso costos.ver (RF-21). */
function serializarReferencia(r: {
  id: number;
  productoId: number;
  marcaId: number;
  presentacionId: number;
  codigoBarras: string;
  nombre: string | null;
  unidadBaseId: number;
  fraccionMinima: unknown;
  decimales: number;
  ivaPorcentaje: unknown;
  costoPromedio: unknown;
  precioVenta: unknown;
  estado: string;
  producto: { nombre: string; controlVencimiento: boolean; mesesGarantia: number };
  marca: { nombre: string };
  presentacion: { nombre: string };
  unidadBase: { codigo: string; nombre: string };
}, verCosto: boolean) {
  return {
    id: r.id,
    productoId: r.productoId,
    marcaId: r.marcaId,
    presentacionId: r.presentacionId,
    codigoBarras: r.codigoBarras,
    nombre: r.nombre,
    descripcion: r.nombre ?? `${r.producto.nombre} - ${r.marca.nombre} - ${r.presentacion.nombre}`,
    producto: r.producto,
    marca: r.marca,
    presentacion: r.presentacion,
    unidadBase: r.unidadBase,
    unidadBaseId: r.unidadBaseId,
    fraccionMinima: Number(r.fraccionMinima),
    decimales: r.decimales,
    ivaPorcentaje: Number(r.ivaPorcentaje),
    precioVenta: Number(r.precioVenta),
    ...(verCosto ? { costoPromedio: Number(r.costoPromedio) } : {}),
    estado: r.estado,
  };
}

// ---------------- Productos ----------------
const productoSchema = z.object({
  nombre: z.string().min(1).max(150),
  descripcion: z.string().optional().or(z.literal('')),
  controlVencimiento: z.coerce.boolean().default(false),
  mesesGarantia: z.coerce.number().int().min(0).default(0),
});

catalogoRouter.get('/productos', requierePermiso('catalogo.ver'), async (_req, res, next) => {
  try {
    const productos = await prisma.producto.findMany({
      include: { referencias: { select: { id: true } }, conversiones: true },
      orderBy: { nombre: 'asc' },
    });
    res.json(
      productos.map((p) => ({
        id: p.id,
        nombre: p.nombre,
        descripcion: p.descripcion,
        controlVencimiento: p.controlVencimiento,
        mesesGarantia: p.mesesGarantia,
        activo: p.activo,
        totalReferencias: p.referencias.length,
        conversiones: p.conversiones.map((c) => ({
          id: c.id,
          unidadOrigenId: c.unidadOrigenId,
          unidadDestinoId: c.unidadDestinoId,
          factor: Number(c.factor),
        })),
      })),
    );
  } catch (e) {
    next(e);
  }
});

catalogoRouter.post('/productos', requierePermiso('catalogo.crear'), async (req, res, next) => {
  try {
    const dato = productoSchema.parse(req.body);
    const producto = await prisma.producto.create({ data: { ...dato, descripcion: dato.descripcion || null } });
    await registrarAuditoria(prisma, {
      tablaAfectada: 'productos',
      registroId: producto.id,
      accion: 'INSERT',
      entidad: 'catalogo',
      usuarioId: req.usuario!.id,
      direccionIp: req.ipCliente,
      estadoNuevo: producto,
    });
    res.status(201).json(producto);
  } catch (e) {
    next(e);
  }
});

catalogoRouter.put('/productos/:id', requierePermiso('catalogo.editar'), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const dato = productoSchema.partial().parse(req.body);
    const anterior = await prisma.producto.findUnique({ where: { id } });
    if (!anterior) throw ApiError.noEncontrado('Producto no encontrado');
    const producto = await prisma.producto.update({ where: { id }, data: dato });
    await registrarAuditoria(prisma, {
      tablaAfectada: 'productos',
      registroId: id,
      accion: 'UPDATE',
      entidad: 'catalogo',
      usuarioId: req.usuario!.id,
      direccionIp: req.ipCliente,
      estadoAnterior: anterior,
      estadoNuevo: producto,
    });
    res.json(producto);
  } catch (e) {
    next(e);
  }
});

// ---------------- Marcas / Presentaciones / Unidades ----------------
const auxiliarSchema = z.object({ nombre: z.string().min(1).max(100) });

catalogoRouter.get('/marcas', requierePermiso('catalogo.ver'), async (_req, res, next) => {
  try {
    res.json(await prisma.marca.findMany({ orderBy: { nombre: 'asc' } }));
  } catch (e) {
    next(e);
  }
});
catalogoRouter.post('/marcas', requierePermiso('catalogo.crear'), async (req, res, next) => {
  try {
    const { nombre } = auxiliarSchema.parse(req.body);
    res.status(201).json(await prisma.marca.create({ data: { nombre } }));
  } catch (e) {
    next(e);
  }
});
catalogoRouter.get('/presentaciones', requierePermiso('catalogo.ver'), async (_req, res, next) => {
  try {
    res.json(await prisma.presentacion.findMany({ orderBy: { nombre: 'asc' } }));
  } catch (e) {
    next(e);
  }
});
catalogoRouter.post('/presentaciones', requierePermiso('catalogo.crear'), async (req, res, next) => {
  try {
    const { nombre } = auxiliarSchema.parse(req.body);
    res.status(201).json(await prisma.presentacion.create({ data: { nombre } }));
  } catch (e) {
    next(e);
  }
});
catalogoRouter.get('/unidades', requierePermiso('catalogo.ver'), async (_req, res, next) => {
  try {
    res.json(await prisma.unidadMedida.findMany({ orderBy: { codigo: 'asc' } }));
  } catch (e) {
    next(e);
  }
});

// ---------------- Conversiones (RF-02) ----------------
const conversionSchema = z.object({
  productoId: z.coerce.number().int().positive(),
  unidadOrigenId: z.coerce.number().int().positive(),
  unidadDestinoId: z.coerce.number().int().positive(),
  factor: decimalPositivo,
});

catalogoRouter.post('/conversiones', requierePermiso('catalogo.editar'), async (req, res, next) => {
  try {
    const dato = conversionSchema.parse(req.body);
    if (dato.unidadOrigenId === dato.unidadDestinoId) {
      throw ApiError.badRequest('La unidad de origen y destino no pueden ser la misma');
    }
    const conversion = await prisma.conversionUnidad.create({ data: dato });
    await registrarAuditoria(prisma, {
      tablaAfectada: 'conversiones_unidad',
      registroId: conversion.id,
      accion: 'INSERT',
      entidad: 'catalogo',
      usuarioId: req.usuario!.id,
      direccionIp: req.ipCliente,
      estadoNuevo: dato,
    });
    res.status(201).json({ ...conversion, factor: Number(conversion.factor) });
  } catch (e) {
    next(e);
  }
});

// ---------------- Referencias vendibles (RF-01) ----------------
catalogoRouter.get('/referencias', requierePermiso('catalogo.ver'), async (req, res, next) => {
  try {
    const busqueda = (req.query.busqueda as string | undefined)?.trim();
    const codigoBarras = (req.query.codigoBarras as string | undefined)?.trim();
    const verCosto = req.usuario!.permisos.includes('costos.ver');
    const where = codigoBarras
      ? { codigoBarras }
      : busqueda
        ? {
            estado: 'ACTIVO' as const,
            OR: [
              { codigoBarras: { contains: busqueda } },
              { nombre: { contains: busqueda, mode: 'insensitive' as const } },
              { producto: { nombre: { contains: busqueda, mode: 'insensitive' as const } } },
              { marca: { nombre: { contains: busqueda, mode: 'insensitive' as const } } },
            ],
          }
        : {};
    const referencias = await prisma.referenciaVendible.findMany({
      where,
      include: {
        producto: { select: { nombre: true, controlVencimiento: true, mesesGarantia: true } },
        marca: { select: { nombre: true } },
        presentacion: { select: { nombre: true } },
        unidadBase: { select: { codigo: true, nombre: true } },
        saldos: true,
      },
      orderBy: { id: 'asc' },
      take: codigoBarras || busqueda ? 50 : 500,
    });
    res.json(
      referencias.map((r) => ({
        ...serializarReferencia(r, verCosto),
        saldos: r.saldos
          ? {
              disponible: Number(r.saldos.cantidadDisponible),
              reservada: Number(r.saldos.cantidadReservada),
              danada: Number(r.saldos.cantidadDanada),
            }
          : { disponible: 0, reservada: 0, danada: 0 },
      })),
    );
  } catch (e) {
    next(e);
  }
});

catalogoRouter.post('/referencias', requierePermiso('catalogo.crear'), async (req, res, next) => {
  try {
    const dato = referenciaSchema.parse(req.body);
    const [producto, marca, presentacion, unidad] = await Promise.all([
      prisma.producto.findUnique({ where: { id: dato.productoId } }),
      prisma.marca.findUnique({ where: { id: dato.marcaId } }),
      prisma.presentacion.findUnique({ where: { id: dato.presentacionId } }),
      prisma.unidadMedida.findUnique({ where: { id: dato.unidadBaseId } }),
    ]);
    if (!producto || !marca || !presentacion || !unidad) {
      throw ApiError.badRequest('Producto, marca, presentación o unidad base inexistente');
    }
    // La unicidad del código de barras la respalda además la restricción UNIQUE de la BD
    const referencia = await prisma.$transaction(async (tx) => {
      const ref = await tx.referenciaVendible.create({
        data: {
          ...dato,
          nombre: dato.nombre || null,
        },
      });
      await tx.inventarioSaldo.create({ data: { referenciaId: ref.id } });
      await registrarAuditoria(tx, {
        tablaAfectada: 'referencias_vendibles',
        registroId: ref.id,
        accion: 'INSERT',
        entidad: 'catalogo',
        usuarioId: req.usuario!.id,
        direccionIp: req.ipCliente,
        estadoNuevo: ref,
      });
      return ref;
    });
    res.status(201).json({ ...referencia, costoPromedio: undefined, precioVenta: Number(referencia.precioVenta), fraccionMinima: Number(referencia.fraccionMinima) });
  } catch (e) {
    next(e);
  }
});

catalogoRouter.put('/referencias/:id', requierePermiso('catalogo.editar'), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const anterior = await prisma.referenciaVendible.findUnique({ where: { id } });
    if (!anterior) throw ApiError.noEncontrado('Referencia no encontrada');
    // El costo y el precio solo se modifican por sus módulos dedicados (RF-15/16)
    const dato = referenciaSchema.omit({ precioVenta: true }).partial().parse(req.body);
    delete (dato as Record<string, unknown>).precioVenta;
    const referencia = await prisma.referenciaVendible.update({ where: { id }, data: dato });
    await registrarAuditoria(prisma, {
      tablaAfectada: 'referencias_vendibles',
      registroId: id,
      accion: 'UPDATE',
      entidad: 'catalogo',
      usuarioId: req.usuario!.id,
      direccionIp: req.ipCliente,
      estadoAnterior: anterior,
      estadoNuevo: referencia,
    });
    res.json({ ...referencia, fraccionMinima: Number(referencia.fraccionMinima) });
  } catch (e) {
    next(e);
  }
});
