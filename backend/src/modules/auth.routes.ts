import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { env } from '../config/env';
import { ApiError } from '../lib/errors';
import { autenticar, ipDeRequest } from '../middleware/auth';
import { registrarAuditoria } from '../services/auditoria';

export const authRouter = Router();

const loginLimiter = rateLimit({ windowMs: 60_000, limit: 15, standardHeaders: true, legacyHeaders: false });

const loginSchema = z.object({
  nombreUsuario: z.string().min(1),
  password: z.string().min(1),
});

/** POST /api/auth/login — autenticación (RF-21, RNF-05). */
authRouter.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const { nombreUsuario, password } = loginSchema.parse(req.body);
    const usuario = await prisma.usuario.findUnique({
      where: { nombreUsuario },
      include: { roles: { include: { rol: { include: { permisos: { include: { permiso: true } } } } } } },
    });
    const valido = usuario?.activo && (await bcrypt.compare(password, usuario.passwordHash));
    if (!usuario || !valido) {
      // Registro de intento fallido cuando el usuario existe
      if (usuario) {
        await registrarAuditoria(prisma, {
          tablaAfectada: 'usuarios',
          registroId: usuario.id,
          accion: 'LOGIN',
          entidad: 'auth',
          usuarioId: usuario.id,
          direccionIp: ipDeRequest(req),
          estadoNuevo: { resultado: 'fallido' },
        });
      }
      throw ApiError.noAutorizado('Usuario o contraseña incorrectos');
    }
    const roles = usuario.roles.map((ur) => ur.rol.codigo);
    const permisos = [
      ...new Set(usuario.roles.flatMap((ur) => ur.rol.permisos.map((rp) => rp.permiso.codigo))),
    ];
    const token = jwt.sign({ sub: usuario.id, nombreUsuario: usuario.nombreUsuario }, env.jwtSecret, {
      expiresIn: env.jwtExpiresIn,
    } as jwt.SignOptions);
    await registrarAuditoria(prisma, {
      tablaAfectada: 'usuarios',
      registroId: usuario.id,
      accion: 'LOGIN',
      entidad: 'auth',
      usuarioId: usuario.id,
      direccionIp: ipDeRequest(req),
      estadoNuevo: { resultado: 'exitoso' },
    });
    res.json({
      token,
      usuario: {
        id: usuario.id,
        nombreUsuario: usuario.nombreUsuario,
        nombreCompleto: usuario.nombreCompleto,
        roles,
        permisos,
      },
    });
  } catch (e) {
    next(e);
  }
});

/** GET /api/auth/me — datos de la sesión y permisos para el menú dinámico. */
authRouter.get('/me', autenticar, (req, res) => {
  res.json({ usuario: req.usuario });
});

/** GET /api/auth/parametros — parámetros públicos del sistema. */
authRouter.get('/parametros', autenticar, async (_req, res, next) => {
  try {
    const parametros = await prisma.parametro.findMany();
    res.json(Object.fromEntries(parametros.map((p) => [p.clave, p.valor])));
  } catch (e) {
    next(e);
  }
});
