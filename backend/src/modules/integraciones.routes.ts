import { Router } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { ApiError } from '../lib/errors';
import { autenticar, requierePermiso } from '../middleware/auth';
import type { NextFunction, Request, Response } from 'express';
import { registrarAuditoria } from '../services/auditoria';

export const integracionesRouter = Router();

/**
 * Integraciones con sistemas externos — RF-25 (stub estructural).
 * La base de datos única de este sistema es la fuente de verdad; expone
 * endpoints de solo lectura autenticados por API Key. Los sistemas concretos,
 * protocolos y datos a intercambiar siguen siendo decisión pendiente (13.10).
 */

function hashKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

/** Autenticación por X-API-Key para los endpoints externos. */
export async function autenticarApiKey(req: Request, _res: Response, next: NextFunction) {
  try {
    const key = req.headers['x-api-key'];
    if (typeof key !== 'string' || key.length === 0) throw ApiError.noAutorizado('X-API-Key requerida');
    const registro = await prisma.apiKey.findUnique({ where: { keyHash: hashKey(key) } });
    if (!registro?.activa) throw ApiError.noAutorizado('API Key inválida o inactiva');
    next();
  } catch (e) {
    next(e);
  }
}

// ---------------- Gestión de API Keys (administración) ----------------
integracionesRouter.get('/', autenticar, requierePermiso('integraciones.ver'), async (_req, res, next) => {
  try {
    const claves = await prisma.apiKey.findMany({ select: { id: true, nombre: true, activa: true, createdAt: true } });
    res.json({
      descripcion: 'Fuente única de datos para clientes, productos y facturas. Endpoints: GET /api/ext/productos, GET /api/ext/facturas (autenticación X-API-Key).',
      decisionesPendientes: 'Los sistemas externos concretos, protocolos y datos intercambiados requieren definición del cliente (decisión 13.10).',
      apiKeys: claves,
    });
  } catch (e) {
    next(e);
  }
});

integracionesRouter.post('/api-keys', autenticar, requierePermiso('usuarios.crear'), async (req, res, next) => {
  try {
    const { nombre } = z.object({ nombre: z.string().min(3).max(100) }).parse(req.body);
    const key = `fk_${crypto.randomBytes(24).toString('hex')}`;
    const registro = await prisma.apiKey.create({ data: { nombre, keyHash: hashKey(key) } });
    await registrarAuditoria(prisma, {
      tablaAfectada: 'api_keys',
      registroId: registro.id,
      accion: 'INSERT',
      entidad: 'integraciones',
      usuarioId: req.usuario!.id,
      direccionIp: req.ipCliente,
      estadoNuevo: { nombre },
    });
    res.status(201).json({ id: registro.id, nombre, key, advertencia: 'Guarde esta clave: no podrá volver a consultarse' });
  } catch (e) {
    next(e);
  }
});

// ---------------- Endpoints externos (solo lectura) ----------------
export const externosRouter = Router();
externosRouter.use(autenticarApiKey);

/** GET /api/ext/productos — catálogo para sistemas externos. */
externosRouter.get('/productos', async (_req, res, next) => {
  try {
    const referencias = await prisma.referenciaVendible.findMany({
      where: { estado: 'ACTIVO' },
      include: {
        producto: { select: { nombre: true } },
        marca: { select: { nombre: true } },
        presentacion: { select: { nombre: true } },
        unidadBase: { select: { codigo: true } },
        saldos: true,
      },
      take: 1000,
    });
    res.json(
      referencias.map((r) => ({
        codigoBarras: r.codigoBarras,
        producto: r.producto.nombre,
        marca: r.marca.nombre,
        presentacion: r.presentacion.nombre,
        unidad: r.unidadBase.codigo,
        precioVenta: Number(r.precioVenta),
        disponible: Number(r.saldos?.cantidadDisponible ?? 0),
      })),
    );
  } catch (e) {
    next(e);
  }
});

/** GET /api/ext/facturas — facturas para sistemas contables. */
externosRouter.get('/facturas', async (_req, res, next) => {
  try {
    const facturas = await prisma.factura.findMany({
      where: { estado: 'EMITIDA' },
      include: {
        venta: {
          include: {
            cliente: { select: { identificacion: true, razonSocial: true, nombre: true, apellido: true } },
            detalles: { include: { referencia: { select: { codigoBarras: true } } } },
          },
        },
      },
      orderBy: { id: 'desc' },
      take: 500,
    });
    res.json(
      facturas.map((f) => ({
        consecutivo: f.consecutivo,
        fecha: f.fechaEmision,
        cliente: f.venta.cliente?.identificacion ?? null,
        subtotal: Number(f.venta.subtotal),
        descuento: Number(f.venta.descuento),
        impuestos: Number(f.venta.impuestos),
        total: Number(f.venta.total),
        lineas: f.venta.detalles.map((d) => ({
          codigoBarras: d.referencia.codigoBarras,
          cantidad: Number(d.cantidad),
          precio: Number(d.precioUnitario),
        })),
      })),
    );
  } catch (e) {
    next(e);
  }
});
