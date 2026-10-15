import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { ApiError } from '../lib/errors';
import { autenticar, requierePermiso } from '../middleware/auth';
import { moverStock } from '../services/inventario';
import { siguienteConsecutivo } from '../services/consecutivos';
import { verificarPeriodoAbierto } from '../services/cierres';
import { recalcularCostoPromedio } from '../services/costos';
import { registrarAuditoria } from '../services/auditoria';
import { cumpleFraccionMinima } from '../lib/numeros';

export const comprasRouter = Router();
comprasRouter.use(autenticar);

const detalleCompraSchema = z.object({
  referenciaId: z.coerce.number().int().positive(),
  cantidad: z.coerce.number().positive(),
  costoUnitario: z.coerce.number().min(0),
  fechaVencimiento: z.string().optional().nullable(),
});

const ingresoSchema = z
  .object({
    proveedorId: z.coerce.number().int().positive(),
    facturaProveedor: z.string().min(1).max(100),
    ordenCompraId: z.coerce.number().int().positive().optional().nullable(),
    detalles: z.array(detalleCompraSchema).min(1),
  })
  .refine((d) => new Set(d.detalles.map((x) => x.referenciaId)).size === d.detalles.length, {
    message: 'No se permiten líneas duplicadas de la misma referencia',
  });

/** Serializa un documento de ingreso con detalles. */
function serializarIngreso(d: {
  id: number;
  consecutivo: string;
  proveedor: { identificacion: string; razonSocial: string | null; nombre: string | null; apellido: string | null };
  facturaProveedor: string;
  estado: string;
  motivoAnulacion: string | null;
  ordenCompraId: number | null;
  fecha: Date;
  usuarioCrea: { nombreCompleto: string };
  detalles: {
    id: number;
    referencia: { codigoBarras: string; nombre: string | null; producto: { nombre: string }; marca: { nombre: string }; presentacion: { nombre: string }; unidadBase: { codigo: string } };
    cantidad: unknown;
    costoUnitario: unknown;
    fechaVencimiento: Date | null;
  }[];
}) {
  return {
    id: d.id,
    consecutivo: d.consecutivo,
    proveedor: {
      nombre:
        d.proveedor.razonSocial ??
        [d.proveedor.nombre, d.proveedor.apellido].filter(Boolean).join(' '),
    },
    facturaProveedor: d.facturaProveedor,
    estado: d.estado,
    motivoAnulacion: d.motivoAnulacion,
    ordenCompraId: d.ordenCompraId,
    fecha: d.fecha,
    usuario: d.usuarioCrea.nombreCompleto,
    detalles: d.detalles.map((x) => ({
      id: x.id,
      descripcion: x.referencia.nombre ?? `${x.referencia.producto.nombre} - ${x.referencia.marca.nombre} - ${x.referencia.presentacion.nombre}`,
      codigoBarras: x.referencia.codigoBarras,
      unidad: x.referencia.unidadBase.codigo,
      cantidad: Number(x.cantidad),
      costoUnitario: Number(x.costoUnitario),
      fechaVencimiento: x.fechaVencimiento,
    })),
    total: d.detalles.reduce((s, x) => s + Number(x.cantidad) * Number(x.costoUnitario), 0),
  };
}

// ---------------- Órdenes de compra ----------------
const ordenSchema = z.object({
  proveedorId: z.coerce.number().int().positive(),
  observaciones: z.string().optional().or(z.literal('')),
  detalles: z.array(detalleCompraSchema.omit({ fechaVencimiento: true })).min(1),
});

/** GET /api/compras/ordenes */
comprasRouter.get('/ordenes', requierePermiso('compras.ver'), async (_req, res, next) => {
  try {
    const ordenes = await prisma.ordenCompra.findMany({
      include: {
        proveedor: { select: { identificacion: true, razonSocial: true, nombre: true, apellido: true } },
        detalles: true,
      },
      orderBy: { id: 'desc' },
      take: 200,
    });
    res.json(
      ordenes.map((o) => ({
        id: o.id,
        consecutivo: o.consecutivo,
        proveedor: o.proveedor.razonSocial ?? [o.proveedor.nombre, o.proveedor.apellido].filter(Boolean).join(' '),
        estado: o.estado,
        observaciones: o.observaciones,
        fecha: o.fecha,
        detalles: o.detalles.map((d) => ({
          referenciaId: d.referenciaId,
          cantidad: Number(d.cantidad),
          costoUnitario: Number(d.costoUnitario),
        })),
      })),
    );
  } catch (e) {
    next(e);
  }
});

/** POST /api/compras/ordenes — orden comercial (aún sin entrada física). */
comprasRouter.post('/ordenes', requierePermiso('compras.crear'), async (req, res, next) => {
  try {
    const dato = ordenSchema.parse(req.body);
    const proveedor = await prisma.tercero.findUnique({ where: { id: dato.proveedorId } });
    if (!proveedor?.esProveedor) throw ApiError.badRequest('El tercero no está marcado como proveedor');
    const orden = await prisma.$transaction(async (tx) => {
      const consecutivo = await siguienteConsecutivo(tx, 'OC');
      return tx.ordenCompra.create({
        data: {
          consecutivo,
          proveedorId: dato.proveedorId,
          observaciones: dato.observaciones || null,
          usuarioId: req.usuario!.id,
          detalles: { create: dato.detalles },
        },
        include: { detalles: true },
      });
    });
    await registrarAuditoria(prisma, {
      tablaAfectada: 'ordenes_compra',
      registroId: orden.id,
      accion: 'INSERT',
      entidad: 'compras',
      usuarioId: req.usuario!.id,
      direccionIp: req.ipCliente,
      estadoNuevo: { consecutivo: orden.consecutivo, proveedorId: orden.proveedorId },
    });
    res.status(201).json({ id: orden.id, consecutivo: orden.consecutivo });
  } catch (e) {
    next(e);
  }
});

// ---------------- Documentos de ingreso ----------------
/** GET /api/compras/ingresos?estado= */
comprasRouter.get('/ingresos', requierePermiso('compras.ver'), async (req, res, next) => {
  try {
    const estado = req.query.estado as string | undefined;
    const ingresos = await prisma.documentoIngreso.findMany({
      where: estado ? { estado } : {},
      include: {
        proveedor: { select: { identificacion: true, razonSocial: true, nombre: true, apellido: true } },
        usuarioCrea: { select: { nombreCompleto: true } },
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
      },
      orderBy: { id: 'desc' },
      take: 200,
    });
    res.json(ingresos.map(serializarIngreso));
  } catch (e) {
    next(e);
  }
});

/** GET /api/compras/ingresos/:id */
comprasRouter.get('/ingresos/:id', requierePermiso('compras.ver'), async (req, res, next) => {
  try {
    const ingreso = await prisma.documentoIngreso.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        proveedor: { select: { identificacion: true, razonSocial: true, nombre: true, apellido: true } },
        usuarioCrea: { select: { nombreCompleto: true } },
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
      },
    });
    if (!ingreso) throw ApiError.noEncontrado('Documento de ingreso no encontrado');
    res.json(serializarIngreso(ingreso));
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/compras/ingresos — registra la entrada física — RF-06, RF-07.
 * Puede asociarse a una orden de compra (recepción parcial) o ser directa.
 * Genera documento con consecutivo DI, inyecta existencias y recalcula el
 * costo promedio (RF-15).
 */
comprasRouter.post('/ingresos', requierePermiso('compras.crear'), async (req, res, next) => {
  try {
    const dato = ingresoSchema.parse(req.body);
    const proveedor = await prisma.tercero.findUnique({ where: { id: dato.proveedorId } });
    if (!proveedor?.esProveedor) throw ApiError.badRequest('El tercero no está marcado como proveedor');

    if (dato.ordenCompraId) {
      const orden = await prisma.ordenCompra.findUnique({ where: { id: dato.ordenCompraId } });
      if (!orden) throw ApiError.badRequest('La orden de compra indicada no existe');
      if (orden.estado === 'CANCELADA' || orden.estado === 'COMPLETADA') {
        throw ApiError.conflicto(`La orden de compra está en estado ${orden.estado} y no admite recepciones`);
      }
    }

    const resultado = await prisma.$transaction(async (tx) => {
      const fecha = new Date();
      await verificarPeriodoAbierto(tx, fecha);

      // Validaciones previas de líneas (RF-02 fracciones, RF-12 vencimiento)
      const referencias = await prisma.referenciaVendible.findMany({
        where: { id: { in: dato.detalles.map((d) => d.referenciaId) } },
        include: { producto: true, unidadBase: true },
      });
      const mapaRef = new Map(referencias.map((r) => [r.id, r]));
      for (const linea of dato.detalles) {
        const ref = mapaRef.get(linea.referenciaId);
        if (!ref) throw ApiError.badRequest(`La referencia ${linea.referenciaId} no existe`);
        if (ref.estado !== 'ACTIVO') throw ApiError.badRequest(`La referencia ${ref.codigoBarras} está inactiva`);
        if (!cumpleFraccionMinima(linea.cantidad, Number(ref.fraccionMinima))) {
          throw ApiError.badRequest(
            `La cantidad ${linea.cantidad} no respeta la fracción mínima (${Number(ref.fraccionMinima)}) del producto ${ref.codigoBarras}`,
          );
        }
        if (ref.producto.controlVencimiento && !linea.fechaVencimiento) {
          throw ApiError.badRequest(
            `El producto ${ref.producto.nombre} controla vencimiento: la fecha de vencimiento es obligatoria en el ingreso (RF-12)`,
          );
        }
      }

      const consecutivo = await siguienteConsecutivo(tx, 'DI');
      const documento = await tx.documentoIngreso.create({
        data: {
          consecutivo,
          ordenCompraId: dato.ordenCompraId ?? null,
          proveedorId: dato.proveedorId,
          facturaProveedor: dato.facturaProveedor,
          estado: 'CERRADO',
          usuarioCreaId: req.usuario!.id,
          fecha,
          detalles: {
            create: dato.detalles.map((d) => ({
              referenciaId: d.referenciaId,
              cantidad: d.cantidad,
              costoUnitario: d.costoUnitario,
              fechaVencimiento: d.fechaVencimiento ? new Date(d.fechaVencimiento) : null,
            })),
          },
        },
      });

      // Inyectar existencias y recalcular costo promedio por línea
      for (const linea of dato.detalles) {
        await moverStock(tx, {
          referenciaId: linea.referenciaId,
          cantidad: linea.cantidad,
          desde: null,
          hacia: 'DISPONIBLE',
          clase: 'COMPRA',
          docTipo: 'DocumentoIngreso',
          docId: documento.id,
          usuarioId: req.usuario!.id,
          detalle: `Ingreso ${consecutivo} — factura proveedor ${dato.facturaProveedor}`,
        });
        await recalcularCostoPromedio(tx, {
          referenciaId: linea.referenciaId,
          cantidadEntra: linea.cantidad,
          costoUnitario: linea.costoUnitario,
          docId: documento.id,
          origen: 'COMPRA',
        });
      }

      // Actualizar estado de la orden según recepción acumulada (RF-07)
      if (dato.ordenCompraId) {
        const orden = await tx.ordenCompra.findUniqueOrThrow({
          where: { id: dato.ordenCompraId },
          include: { detalles: true, ingresos: { include: { detalles: true } } },
        });
        const recibidoPorRef = new Map<number, number>();
        for (const ing of orden.ingresos) {
          if (ing.estado !== 'ANULADO') {
            for (const det of ing.detalles) {
              recibidoPorRef.set(det.referenciaId, (recibidoPorRef.get(det.referenciaId) ?? 0) + Number(det.cantidad));
            }
          }
        }
        const completa = orden.detalles.every(
          (od) => (recibidoPorRef.get(od.referenciaId) ?? 0) >= Number(od.cantidad),
        );
        await tx.ordenCompra.update({
          where: { id: orden.id },
          data: { estado: completa ? 'COMPLETADA' : 'PARCIAL' },
        });
      }

      await registrarAuditoria(tx, {
        tablaAfectada: 'documentos_ingreso',
        registroId: documento.id,
        accion: 'INSERT',
        entidad: 'compras',
        usuarioId: req.usuario!.id,
        direccionIp: req.ipCliente,
        estadoNuevo: { consecutivo, proveedorId: dato.proveedorId, facturaProveedor: dato.facturaProveedor, lineas: dato.detalles },
      });
      return documento;
    });

    res.status(201).json({ id: resultado.id, consecutivo: resultado.consecutivo });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/compras/ingresos/:id/anular — anulación lógica — RF-07.
 * Nunca borra el registro: marca ANULADO, conserva consecutivo y auditoría.
 * Bloquea la reversión si dejaría saldos negativos (mercancía ya vendida).
 */
comprasRouter.post('/ingresos/:id/anular', requierePermiso('compras.anular'), async (req, res, next) => {
  try {
    const anulacionSchema = z.object({ motivo: z.string().min(5) });
    const { motivo } = anulacionSchema.parse(req.body);
    const id = Number(req.params.id);

    const resultado = await prisma.$transaction(async (tx) => {
      const documento = await tx.documentoIngreso.findUnique({
        where: { id },
        include: { detalles: true },
      });
      if (!documento) throw ApiError.noEncontrado('Documento de ingreso no encontrado');
      if (documento.estado !== 'CERRADO') {
        throw ApiError.conflicto(`Solo se pueden anular documentos en estado CERRADO (estado actual: ${documento.estado})`);
      }
      await verificarPeriodoAbierto(tx, documento.fecha);

      // Revertir cada línea: el motor bloquea si el disponible ya no alcanza
      for (const linea of documento.detalles) {
        await moverStock(tx, {
          referenciaId: linea.referenciaId,
          cantidad: Number(linea.cantidad),
          desde: 'DISPONIBLE',
          hacia: null,
          clase: 'COMPRA_ANULADA',
          docTipo: 'DocumentoIngreso',
          docId: documento.id,
          usuarioId: req.usuario!.id,
          detalle: `Anulación del ingreso ${documento.consecutivo}: ${motivo}`,
        });
      }
      const actualizado = await tx.documentoIngreso.update({
        where: { id },
        data: {
          estado: 'ANULADO',
          motivoAnulacion: motivo,
          usuarioAnulaId: req.usuario!.id,
          fechaAnulacion: new Date(),
        },
      });
      await registrarAuditoria(tx, {
        tablaAfectada: 'documentos_ingreso',
        registroId: id,
        accion: 'ANULACION',
        entidad: 'compras',
        usuarioId: req.usuario!.id,
        direccionIp: req.ipCliente,
        estadoAnterior: { estado: 'CERRADO' },
        estadoNuevo: { estado: 'ANULADO', motivo },
      });
      return actualizado;
    });
    res.json({ id: resultado.id, estado: resultado.estado, consecutivo: resultado.consecutivo });
  } catch (e) {
    next(e);
  }
});
