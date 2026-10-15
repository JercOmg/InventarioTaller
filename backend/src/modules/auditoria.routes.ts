import { Router } from 'express';
import { autenticar, requierePermiso } from '../middleware/auth';
import { consultarAuditoria } from '../services/auditoria';

export const auditoriaRouter = Router();
auditoriaRouter.use(autenticar);

/**
 * GET /api/auditoria?desde=&hasta=&usuarioId=&tabla=&accion= — RF-22.
 * Consulta de solo lectura para Administrador/Gerencia. Ningún endpoint
 * permite modificar o eliminar registros de auditoría (RNF-01).
 */
auditoriaRouter.get('/', requierePermiso('auditoria.ver'), async (req, res, next) => {
  try {
    const resultado = await consultarAuditoria({
      desde: req.query.desde ? new Date(String(req.query.desde)) : undefined,
      hasta: req.query.hasta ? new Date(String(req.query.hasta)) : undefined,
      usuarioId: req.query.usuarioId ? Number(req.query.usuarioId) : undefined,
      tablaAfectada: req.query.tabla as string | undefined,
      accion: req.query.accion as string | undefined,
      pagina: Number(req.query.pagina ?? 1),
      tamano: Number(req.query.tamano ?? 50),
    });
    res.json(resultado);
  } catch (e) {
    next(e);
  }
});
