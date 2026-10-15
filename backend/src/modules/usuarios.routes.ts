import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { ApiError } from '../lib/errors';
import { autenticar, requierePermiso } from '../middleware/auth';
import { registrarAuditoria } from '../services/auditoria';

export const usuariosRouter = Router();
usuariosRouter.use(autenticar);

const crearSchema = z.object({
  nombreCompleto: z.string().min(1).max(100),
  nombreUsuario: z.string().min(3).max(50).regex(/^[a-zA-Z0-9._-]+$/),
  password: z.string().min(8),
  email: z.string().email().optional().or(z.literal('')),
  roles: z.array(z.string()).min(1),
  activo: z.boolean().optional(),
});

const editarSchema = crearSchema.partial({ password: true });

/** Serializa un usuario con sus roles. */
function serializar(u: {
  id: number;
  nombreCompleto: string;
  nombreUsuario: string;
  email: string | null;
  activo: boolean;
  roles: { rol: { codigo: string; nombre: string } }[];
  createdAt: Date;
}) {
  return {
    id: u.id,
    nombreCompleto: u.nombreCompleto,
    nombreUsuario: u.nombreUsuario,
    email: u.email,
    activo: u.activo,
    roles: u.roles.map((ur) => ur.rol.codigo),
    rolesNombres: u.roles.map((ur) => ur.rol.nombre),
    fechaCreacion: u.createdAt,
  };
}

/** GET /api/usuarios — lista (permiso usuarios.ver). */
usuariosRouter.get('/', requierePermiso('usuarios.ver'), async (_req, res, next) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      include: { roles: { include: { rol: true } } },
      orderBy: { id: 'asc' },
    });
    res.json(usuarios.map(serializar));
  } catch (e) {
    next(e);
  }
});

/** GET /api/usuarios/roles — catálogo de roles disponibles. */
usuariosRouter.get('/roles', async (_req, res, next) => {
  try {
    const roles = await prisma.rol.findMany({
      include: { permisos: { include: { permiso: true } } },
      orderBy: { id: 'asc' },
    });
    res.json(
      roles.map((r) => ({
        codigo: r.codigo,
        nombre: r.nombre,
        descripcion: r.descripcion,
        permisos: r.permisos.map((rp) => rp.permiso.codigo),
      })),
    );
  } catch (e) {
    next(e);
  }
});

/** POST /api/usuarios — crear usuario con roles (permiso usuarios.crear). */
usuariosRouter.post('/', requierePermiso('usuarios.crear'), async (req, res, next) => {
  try {
    const dato = crearSchema.parse(req.body);
    const roles = await prisma.rol.findMany({ where: { codigo: { in: dato.roles } } });
    if (roles.length !== dato.roles.length) {
      throw ApiError.badRequest('Uno o más roles no existen');
    }
    const usuario = await prisma.usuario.create({
      data: {
        nombreCompleto: dato.nombreCompleto,
        nombreUsuario: dato.nombreUsuario,
        email: dato.email || null,
        passwordHash: await bcrypt.hash(dato.password, 10),
        activo: dato.activo ?? true,
        roles: { create: dato.roles.map((codigo) => ({ rolId: roles.find((r) => r.codigo === codigo)!.id })) },
      },
      include: { roles: { include: { rol: true } } },
    });
    await registrarAuditoria(prisma, {
      tablaAfectada: 'usuarios',
      registroId: usuario.id,
      accion: 'INSERT',
      entidad: 'usuarios',
      usuarioId: req.usuario!.id,
      direccionIp: req.ipCliente,
      estadoNuevo: { ...serializar(usuario), password: undefined },
    });
    res.status(201).json(serializar(usuario));
  } catch (e) {
    next(e);
  }
});

/** PUT /api/usuarios/:id — editar usuario, roles y contraseña (permiso usuarios.editar). */
usuariosRouter.put('/:id', requierePermiso('usuarios.editar'), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const anterior = await prisma.usuario.findUnique({
      where: { id },
      include: { roles: true },
    });
    if (!anterior) throw ApiError.noEncontrado('Usuario no encontrado');
    const dato = editarSchema.parse(req.body);

    let rolesNuevos: number[] | undefined;
    if (dato.roles) {
      const roles = await prisma.rol.findMany({ where: { codigo: { in: dato.roles } } });
      if (roles.length !== dato.roles.length) throw ApiError.badRequest('Uno o más roles no existen');
      rolesNuevos = roles.map((r) => r.id);
    }
    const usuario = await prisma.usuario.update({
      where: { id },
      data: {
        nombreCompleto: dato.nombreCompleto,
        email: dato.email || null,
        activo: dato.activo,
        ...(dato.password ? { passwordHash: await bcrypt.hash(dato.password, 10) } : {}),
        ...(rolesNuevos
          ? { roles: { deleteMany: {}, create: rolesNuevos.map((rolId) => ({ rolId })) } }
          : {}),
      },
      include: { roles: { include: { rol: true } } },
    });
    await registrarAuditoria(prisma, {
      tablaAfectada: 'usuarios',
      registroId: id,
      accion: 'UPDATE',
      entidad: 'usuarios',
      usuarioId: req.usuario!.id,
      direccionIp: req.ipCliente,
      estadoAnterior: { roles: anterior.roles.map((r) => r.rolId), activo: anterior.activo },
      estadoNuevo: { roles: dato.roles, activo: dato.activo, cambioPassword: Boolean(dato.password) },
    });
    res.json(serializar(usuario));
  } catch (e) {
    next(e);
  }
});
