import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { ApiError } from '../lib/errors';
import { autenticar, requierePermiso } from '../middleware/auth';
import { registrarAuditoria } from '../services/auditoria';

export const tercerosRouter = Router();
tercerosRouter.use(autenticar);

/**
 * Terceros unificados: clientes y proveedores en una sola base — RF-14.
 * La validación de campos según tipo de persona usa el supuesto documentado:
 * NATURAL exige nombre y apellido; JURIDICA exige razón social
 * (pendiente de confirmación oficial del cliente — decisión 13.5).
 */
const terceroSchema = z
  .object({
    identificacion: z.string().min(1).max(50),
    tipoPersona: z.enum(['NATURAL', 'JURIDICA']).default('NATURAL'),
    nombre: z.string().max(100).optional().or(z.literal('')),
    apellido: z.string().max(100).optional().or(z.literal('')),
    razonSocial: z.string().max(150).optional().or(z.literal('')),
    direccion: z.string().max(200).optional().or(z.literal('')),
    ciudad: z.string().max(100).optional().or(z.literal('')),
    telefono: z.string().max(30).optional().or(z.literal('')),
    email: z.string().max(100).optional().or(z.literal('')),
    esCliente: z.coerce.boolean().default(false),
    esProveedor: z.coerce.boolean().default(false),
  })
  .refine((d) => d.esCliente || d.esProveedor, {
    message: 'El tercero debe tener al menos un rol: Cliente o Proveedor',
  })
  .superRefine((d, ctx) => {
    if (d.tipoPersona === 'NATURAL') {
      if (!d.nombre?.trim() || !d.apellido?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Persona natural: nombre y apellido son obligatorios',
        });
      }
    } else if (!d.razonSocial?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Persona jurídica: la razón social es obligatoria',
      });
    }
  });

function serializar(t: {
  id: number;
  identificacion: string;
  tipoPersona: string;
  nombre: string | null;
  apellido: string | null;
  razonSocial: string | null;
  direccion: string | null;
  ciudad: string | null;
  telefono: string | null;
  email: string | null;
  esCliente: boolean;
  esProveedor: boolean;
  activo: boolean;
}) {
  return {
    ...t,
    nombreCompleto:
      t.tipoPersona === 'JURIDICA'
        ? t.razonSocial
        : [t.nombre, t.apellido].filter(Boolean).join(' '),
  };
}

/** GET /api/terceros?busqueda=&rol=cliente|proveedor */
tercerosRouter.get('/', requierePermiso('terceros.ver'), async (req, res, next) => {
  try {
    const busqueda = (req.query.busqueda as string | undefined)?.trim();
    const rol = req.query.rol as string | undefined;
    const where = {
      ...(busqueda
        ? {
            OR: [
              { identificacion: { contains: busqueda } },
              { nombre: { contains: busqueda, mode: 'insensitive' as const } },
              { apellido: { contains: busqueda, mode: 'insensitive' as const } },
              { razonSocial: { contains: busqueda, mode: 'insensitive' as const } },
            ],
          }
        : {}),
      ...(rol === 'cliente' ? { esCliente: true } : rol === 'proveedor' ? { esProveedor: true } : {}),
    };
    const terceros = await prisma.tercero.findMany({ where, orderBy: { id: 'asc' }, take: 300 });
    res.json(terceros.map(serializar));
  } catch (e) {
    next(e);
  }
});

/** POST /api/terceros — crea o agrega roles a uno existente (RF-14). */
tercerosRouter.post('/', requierePermiso('terceros.crear'), async (req, res, next) => {
  try {
    const dato = terceroSchema.parse(req.body);
    // Duplicidad cruzada: si la identificación ya existe, se sugiere editar el perfil
    const existente = await prisma.tercero.findUnique({ where: { identificacion: dato.identificacion } });
    if (existente) {
      throw ApiError.conflicto(
        `Esta identificación ya pertenece a un tercero registrado (rol: ${[
          existente.esCliente ? 'Cliente' : null,
          existente.esProveedor ? 'Proveedor' : null,
        ]
          .filter(Boolean)
          .join(' y ')}). Por favor, edite el perfil existente y asígnele el rol que falta`,
        { terceroId: existente.id },
      );
    }
    const tercero = await prisma.tercero.create({
      data: {
        identificacion: dato.identificacion,
        tipoPersona: dato.tipoPersona,
        nombre: dato.nombre || null,
        apellido: dato.apellido || null,
        razonSocial: dato.razonSocial || null,
        direccion: dato.direccion || null,
        ciudad: dato.ciudad || null,
        telefono: dato.telefono || null,
        email: dato.email || null,
        esCliente: dato.esCliente,
        esProveedor: dato.esProveedor,
      },
    });
    await registrarAuditoria(prisma, {
      tablaAfectada: 'terceros',
      registroId: tercero.id,
      accion: 'INSERT',
      entidad: 'terceros',
      usuarioId: req.usuario!.id,
      direccionIp: req.ipCliente,
      estadoNuevo: tercero,
    });
    res.status(201).json(serializar(tercero));
  } catch (e) {
    next(e);
  }
});

/** PUT /api/terceros/:id — editar datos y/o activar el rol faltante. */
tercerosRouter.put('/:id', requierePermiso('terceros.editar'), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const anterior = await prisma.tercero.findUnique({ where: { id } });
    if (!anterior) throw ApiError.noEncontrado('Tercero no encontrado');
    const dato = terceroSchema.parse(req.body);
    const duplicado = await prisma.tercero.findFirst({
      where: { identificacion: dato.identificacion, id: { not: id } },
    });
    if (duplicado) throw ApiError.conflicto('Otro tercero ya usa esta identificación');
    const tercero = await prisma.tercero.update({
      where: { id },
      data: {
        tipoPersona: dato.tipoPersona,
        nombre: dato.nombre || null,
        apellido: dato.apellido || null,
        razonSocial: dato.razonSocial || null,
        direccion: dato.direccion || null,
        ciudad: dato.ciudad || null,
        telefono: dato.telefono || null,
        email: dato.email || null,
        esCliente: dato.esCliente,
        esProveedor: dato.esProveedor,
      },
    });
    await registrarAuditoria(prisma, {
      tablaAfectada: 'terceros',
      registroId: id,
      accion: 'UPDATE',
      entidad: 'terceros',
      usuarioId: req.usuario!.id,
      direccionIp: req.ipCliente,
      estadoAnterior: { esCliente: anterior.esCliente, esProveedor: anterior.esProveedor, telefono: anterior.telefono },
      estadoNuevo: { esCliente: tercero.esCliente, esProveedor: tercero.esProveedor, telefono: tercero.telefono },
    });
    res.json(serializar(tercero));
  } catch (e) {
    next(e);
  }
});
