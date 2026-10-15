import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../lib/errors';

/** 404 para rutas inexistentes. */
export function noEncontrado(_req: Request, res: Response) {
  res.status(404).json({ mensaje: 'Ruta no encontrada' });
}

/** Manejador central de errores con respuesta estructurada. */
export function manejarErrores(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      mensaje: err.message,
      ...(err.detalle !== undefined ? { detalle: err.detalle } : {}),
    });
  }
  if (err instanceof ZodError) {
    return res.status(400).json({
      mensaje: 'Datos inválidos',
      detalle: err.issues.map((i) => ({ campo: i.path.join('.'), mensaje: i.message })),
    });
  }
  // Violación de restricciones únicas de la base de datos (ej. código de barras duplicado)
  if (typeof err === 'object' && err !== null && 'code' in err && (err as { code?: string }).code === 'P2002') {
    const meta = (err as { meta?: { target?: string[] } }).meta;
    const campos = meta?.target ?? [];
    if (campos.includes('producto_id') && campos.includes('marca_id')) {
      return res.status(409).json({
        mensaje:
          'Ya existe una referencia para esa combinación de producto, marca y presentación. Cree una marca o presentación nueva, o seleccione otras existentes',
        detalle: { campos },
      });
    }
    return res.status(409).json({
      mensaje: `Ya existe un registro con el mismo valor en: ${campos.join(', ') || 'campo único'}`,
      detalle: { campos },
    });
  }
  console.error('[error-no-manejado]', err);
  return res.status(500).json({ mensaje: 'Error interno del servidor' });
}
