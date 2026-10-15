import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../lib/prisma';
import { ApiError } from '../lib/errors';

export interface UsuarioSesion {
  id: number;
  nombreUsuario: string;
  nombreCompleto: string;
  roles: string[];
  permisos: string[];
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      usuario?: UsuarioSesion;
      ipCliente?: string;
    }
  }
}

export interface JwtPayload {
  sub: number;
  nombreUsuario: string;
}

/** Extrae la IP real del cliente (detrás de proxy también) — RF-22. */
export function ipDeRequest(req: Request): string {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length > 0) return fwd.split(',')[0].trim();
  return req.ip ?? req.socket.remoteAddress ?? 'desconocida';
}

/** Middleware de autenticación JWT. */
export async function autenticar(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) throw ApiError.noAutorizado();
    const payload = jwt.verify(header.slice(7), env.jwtSecret) as unknown as JwtPayload;
    const usuario = await prisma.usuario.findUnique({
      where: { id: payload.sub },
      include: { roles: { include: { rol: { include: { permisos: { include: { permiso: true } } } } } } },
    });
    if (!usuario || !usuario.activo) throw ApiError.noAutorizado('Usuario inexistente o inactivo');
    const roles = usuario.roles.map((ur) => ur.rol.codigo);
    const permisos = [
      ...new Set(usuario.roles.flatMap((ur) => ur.rol.permisos.map((rp) => rp.permiso.codigo))),
    ];
    req.usuario = {
      id: usuario.id,
      nombreUsuario: usuario.nombreUsuario,
      nombreCompleto: usuario.nombreCompleto,
      roles,
      permisos,
    };
    req.ipCliente = ipDeRequest(req);
    next();
  } catch (e) {
    if (e instanceof ApiError) return next(e);
    next(ApiError.noAutorizado('Token inválido o expirado'));
  }
}

/** Fábrica de middleware de autorización RBAC por permiso — RF-21 / RNF-05. */
export function requierePermiso(...codigos: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.usuario) return next(ApiError.noAutorizado());
    const tiene = codigos.some((c) => req.usuario!.permisos.includes(c));
    if (!tiene) {
      return next(
        ApiError.prohibido(`Se requiere alguno de los permisos: ${codigos.join(', ')}`),
      );
    }
    next();
  };
}
