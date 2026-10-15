import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { ApiError } from '../lib/errors';
import { autenticar, requierePermiso } from '../middleware/auth';
import { registrarAuditoria } from '../services/auditoria';

export const cierresRouter = Router();
cierresRouter.use(autenticar);

/** GET /api/cierres — lista de periodos y su estado (RF-20). */
cierresRouter.get('/', requierePermiso('cierres.ver'), async (_req, res, next) => {
  try {
    const cierres = await prisma.cierreMensual.findMany({
      include: {
        usuarioCerro: { select: { nombreCompleto: true } },
        usuarioReabrio: { select: { nombreCompleto: true } },
      },
      orderBy: { periodo: 'desc' },
    });
    res.json(
      cierres.map((c) => ({
        id: c.id,
        periodo: c.periodo,
        estado: c.estado,
        cerro: c.usuarioCerro.nombreCompleto,
        fechaCierre: c.fechaCierre,
        reabrio: c.usuarioReabrio?.nombreCompleto ?? null,
        fechaReapertura: c.fechaReapertura,
        motivoReapertura: c.motivoReapertura,
      })),
    );
  } catch (e) {
    next(e);
  }
});

/** POST /api/cierres — cierra un periodo (solo Gerencia — RF-20). */
cierresRouter.post('/', requierePermiso('cierres.ejecutar'), async (req, res, next) => {
  try {
    const dato = z
      .object({ periodo: z.string().regex(/^\d{4}-\d{2}$/, 'Formato de periodo: AAAA-MM') })
      .parse(req.body);
    const [anio, mes] = dato.periodo.split('-').map(Number);
    if (mes < 1 || mes > 12) throw ApiError.badRequest('El mes debe estar entre 01 y 12');
    const finPeriodo = new Date(Date.UTC(anio, mes, 0, 23, 59, 59));
    if (finPeriodo >= new Date()) {
      throw ApiError.badRequest('No se puede cerrar un periodo que aún no ha finalizado');
    }
    const existente = await prisma.cierreMensual.findUnique({ where: { periodo: dato.periodo } });
    if (existente) throw ApiError.conflicto(`El periodo ${dato.periodo} ya tiene un registro de cierre`);

    const cierre = await prisma.cierreMensual.create({
      data: { periodo: dato.periodo, estado: 'CERRADO', usuarioCerroId: req.usuario!.id },
    });
    await registrarAuditoria(prisma, {
      tablaAfectada: 'cierres_mensuales',
      registroId: cierre.id,
      accion: 'INSERT',
      entidad: 'cierres',
      usuarioId: req.usuario!.id,
      direccionIp: req.ipCliente,
      estadoNuevo: { periodo: dato.periodo, estado: 'CERRADO' },
    });
    res.status(201).json({ id: cierre.id, periodo: cierre.periodo, estado: cierre.estado });
  } catch (e) {
    next(e);
  }
});

/** POST /api/cierres/:id/reabrir — reapertura con motivo auditado (RF-20). */
cierresRouter.post('/:id/reabrir', requierePermiso('cierres.ejecutar'), async (req, res, next) => {
  try {
    const { motivo } = z.object({ motivo: z.string().min(5) }).parse(req.body);
    const id = Number(req.params.id);
    const cierre = await prisma.cierreMensual.findUnique({ where: { id } });
    if (!cierre) throw ApiError.noEncontrado('Registro de cierre no encontrado');
    if (cierre.estado !== 'CERRADO') throw ApiError.conflicto('El periodo ya está reabierto');

    await prisma.cierreMensual.update({
      where: { id },
      data: {
        estado: 'REABIERTO',
        usuarioReabrioId: req.usuario!.id,
        fechaReapertura: new Date(),
        motivoReapertura: motivo,
      },
    });
    await registrarAuditoria(prisma, {
      tablaAfectada: 'cierres_mensuales',
      registroId: id,
      accion: 'UPDATE',
      entidad: 'cierres',
      usuarioId: req.usuario!.id,
      direccionIp: req.ipCliente,
      estadoAnterior: { estado: 'CERRADO' },
      estadoNuevo: { estado: 'REABIERTO', motivo },
    });
    res.json({ id, estado: 'REABIERTO' });
  } catch (e) {
    next(e);
  }
});
