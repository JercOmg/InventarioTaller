import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { ApiError } from '../lib/errors';
import { autenticar, requierePermiso } from '../middleware/auth';
import { moverStock, consultarSaldos } from '../services/inventario';
import { siguienteConsecutivo } from '../services/consecutivos';
import { verificarPeriodoAbierto } from '../services/cierres';
import { registrarAuditoria } from '../services/auditoria';

export const inventarioRouter = Router();
inventarioRouter.use(autenticar);

/** GET /api/inventario/saldos?busqueda=&referenciaId= — consulta de saldos (RF-03). */
inventarioRouter.get('/saldos', requierePermiso('inventario.ver'), async (req, res, next) => {
  try {
    res.json(
      await consultarSaldos({
        busqueda: req.query.busqueda as string | undefined,
        referenciaId: req.query.referenciaId ? Number(req.query.referenciaId) : undefined,
        pagina: Number(req.query.pagina ?? 1),
        tamano: Number(req.query.tamano ?? 50),
      }),
    );
  } catch (e) {
    next(e);
  }
});

/** GET /api/inventario/movimientos?referenciaId= — kardex. */
inventarioRouter.get('/movimientos', requierePermiso('inventario.ver'), async (req, res, next) => {
  try {
    const referenciaId = req.query.referenciaId ? Number(req.query.referenciaId) : undefined;
    const movimientos = await prisma.movimientoInventario.findMany({
      where: referenciaId ? { referenciaId } : {},
      include: {
        referencia: {
          include: { producto: { select: { nombre: true } }, marca: { select: { nombre: true } }, presentacion: { select: { nombre: true } } },
        },
        usuario: { select: { nombreCompleto: true } },
      },
      orderBy: { id: 'desc' },
      take: 300,
    });
    res.json(
      movimientos.map((m) => ({
        id: Number(m.id),
        tipo: m.tipo,
        clase: m.clase,
        descripcion: m.referencia.nombre ?? `${m.referencia.producto.nombre} - ${m.referencia.marca.nombre} - ${m.referencia.presentacion.nombre}`,
        cantidad: Number(m.cantidad),
        disponibleAntes: Number(m.disponibleAntes),
        disponibleDespues: Number(m.disponibleDespues),
        reservadaDespues: Number(m.reservadaDespues),
        danadaDespues: Number(m.danadaDespues),
        docTipo: m.docTipo,
        docId: m.docId,
        usuario: m.usuario.nombreCompleto,
        fecha: m.fecha,
        detalle: m.detalle,
      })),
    );
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/inventario/danados — clasifica existencias como dañadas — RF-04.
 * Traslado lógico DISPONIBLE → DANADA, solo Responsable de inventario.
 */
inventarioRouter.post('/danados', requierePermiso('inventario.danados'), async (req, res, next) => {
  try {
    const dato = z
      .object({
        referenciaId: z.coerce.number().int().positive(),
        cantidad: z.coerce.number().positive(),
        motivo: z.string().min(5),
      })
      .parse(req.body);
    const fecha = new Date();
    const saldos = await prisma.$transaction(async (tx) => {
      await verificarPeriodoAbierto(tx, fecha);
      const ref = await tx.referenciaVendible.findUnique({ where: { id: dato.referenciaId }, include: { producto: true } });
      if (!ref) throw ApiError.noEncontrado('Referencia no encontrada');
      const resultado = await moverStock(tx, {
        referenciaId: dato.referenciaId,
        cantidad: dato.cantidad,
        desde: 'DISPONIBLE',
        hacia: 'DANADA',
        clase: 'DANIFICACION',
        docTipo: 'Danificacion',
        usuarioId: req.usuario!.id,
        detalle: `Clasificación de avería: ${dato.motivo}`,
      });
      await registrarAuditoria(tx, {
        tablaAfectada: 'inventario_saldos',
        registroId: dato.referenciaId,
        accion: 'UPDATE',
        entidad: 'inventario',
        usuarioId: req.usuario!.id,
        direccionIp: req.ipCliente,
        estadoAnterior: { disponible: resultado.saldos.DISPONIBLE + dato.cantidad, danada: resultado.saldos.DANADA - dato.cantidad },
        estadoNuevo: { disponible: resultado.saldos.DISPONIBLE, danada: resultado.saldos.DANADA },
      });
      return resultado.saldos;
    });
    res.json({ mensaje: 'Clasificación registrada', saldos });
  } catch (e) {
    next(e);
  }
});

// ---------------- Ajustes y conteos físicos (RF-19) ----------------
const ajusteSchema = z.object({
  concepto: z.enum(['CONTEO_FISICO', 'MERMA', 'ERROR_DIGITACION', 'ROBO', 'MUESTRA_COMERCIAL', 'OTRO']),
  justificacion: z.string().min(5),
  detalles: z
    .array(
      z.object({
        referenciaId: z.coerce.number().int().positive(),
        cantidadContada: z.coerce.number().min(0).optional(),
        cantidadAjuste: z.coerce.number().optional(), // delta con signo; alternativo a cantidadContada
      })
        .refine((d) => d.cantidadContada !== undefined || d.cantidadAjuste !== undefined, {
          message: 'Indique cantidadContada (conteo físico) o cantidadAjuste (delta)',
        }),
    )
    .min(1),
});

/** GET /api/inventario/ajustes */
inventarioRouter.get('/ajustes', requierePermiso('inventario.ajustar'), async (_req, res, next) => {
  try {
    const ajustes = await prisma.ajuste.findMany({
      include: {
        usuarioSolicitaRel: { select: { nombreCompleto: true } },
        usuarioApruebaRel: { select: { nombreCompleto: true } },
        detalles: { include: { referencia: { include: { producto: true } } } },
      },
      orderBy: { id: 'desc' },
      take: 100,
    });
    res.json(
      ajustes.map((a) => ({
        id: a.id,
        consecutivo: a.consecutivo,
        tipo: a.tipo,
        concepto: a.concepto,
        justificacion: a.justificacion,
        estado: a.estado,
        solicita: a.usuarioSolicitaRel.nombreCompleto,
        aprueba: a.usuarioApruebaRel?.nombreCompleto ?? null,
        fecha: a.fecha,
        fechaAprobacion: a.fechaAprobacion,
        detalles: a.detalles.map((d) => ({
          descripcion: d.referencia.nombre ?? d.referencia.producto.nombre,
          cantidadSistema: Number(d.cantidadSistema),
          cantidadContada: d.cantidadContada === null ? null : Number(d.cantidadContada),
          cantidadAjuste: Number(d.cantidadAjuste),
        })),
      })),
    );
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/inventario/ajustes — crea una propuesta de ajuste/conteo (RF-19).
 * Queda PENDIENTE hasta que un Administrador/Gerencia la apruebe.
 */
inventarioRouter.post('/ajustes', requierePermiso('inventario.ajustar'), async (req, res, next) => {
  try {
    const dato = ajusteSchema.parse(req.body);
    const fecha = new Date();
    const ajuste = await prisma.$transaction(async (tx) => {
      await verificarPeriodoAbierto(tx, fecha);
      const consecutivo = await siguienteConsecutivo(tx, 'AJ');
      const saldos = await tx.inventarioSaldo.findMany({
        where: { referenciaId: { in: dato.detalles.map((d) => d.referenciaId) } },
      });
      const mapaSaldos = new Map(saldos.map((s) => [s.referenciaId, s]));
      const detallesCalculados = dato.detalles.map((d) => {
        const disponible = Number(mapaSaldos.get(d.referenciaId)?.cantidadDisponible ?? 0);
        let delta: number;
        if (d.cantidadContada !== undefined) {
          delta = d.cantidadContada - disponible; // conteo físico fuerza el saldo
        } else {
          delta = d.cantidadAjuste!;
        }
        return {
          referenciaId: d.referenciaId,
          cantidadSistema: disponible,
          cantidadContada: d.cantidadContada ?? null,
          cantidadAjuste: delta,
        };
      });
      const tipo = detallesCalculados.every((d) => d.cantidadAjuste >= 0) ? 'ENTRADA' : 'SALIDA';
      const creado = await tx.ajuste.create({
        data: {
          consecutivo,
          tipo,
          concepto: dato.concepto,
          justificacion: dato.justificacion,
          estado: 'PENDIENTE',
          usuarioSolicita: req.usuario!.id,
          fecha,
          detalles: { create: detallesCalculados },
        },
      });
      await registrarAuditoria(tx, {
        tablaAfectada: 'ajustes',
        registroId: creado.id,
        accion: 'INSERT',
        entidad: 'inventario',
        usuarioId: req.usuario!.id,
        direccionIp: req.ipCliente,
        estadoNuevo: { consecutivo, concepto: dato.concepto, detalles: detallesCalculados },
      });
      return creado;
    });
    res.status(201).json({ id: ajuste.id, consecutivo: ajuste.consecutivo, estado: ajuste.estado });
  } catch (e) {
    next(e);
  }
});

/** POST /api/inventario/ajustes/:id/aprobar — aplica el ajuste (Administrador/Gerencia). */
inventarioRouter.post('/ajustes/:id/aprobar', requierePermiso('inventario.ajustar.aprobar'), async (req, res, next) => {
  try {
    const { decision } = z.object({ decision: z.enum(['APROBADO', 'RECHAZADO']) }).parse(req.body);
    const id = Number(req.params.id);
    const fecha = new Date();
    const resultado = await prisma.$transaction(async (tx) => {
      const ajuste = await tx.ajuste.findUnique({ where: { id }, include: { detalles: true } });
      if (!ajuste) throw ApiError.noEncontrado('Ajuste no encontrado');
      if (ajuste.estado !== 'PENDIENTE') throw ApiError.conflicto(`El ajuste ya fue ${ajuste.estado.toLowerCase()}`);
      await verificarPeriodoAbierto(tx, fecha);

      if (decision === 'RECHAZADO') {
        await tx.ajuste.update({ where: { id }, data: { estado: 'RECHAZADO', usuarioAprueba: req.usuario!.id, fechaAprobacion: fecha } });
        await registrarAuditoria(tx, {
          tablaAfectada: 'ajustes',
          registroId: id,
          accion: 'RECHAZO',
          entidad: 'inventario',
          usuarioId: req.usuario!.id,
          direccionIp: req.ipCliente,
          estadoAnterior: { estado: 'PENDIENTE' },
          estadoNuevo: { estado: 'RECHAZADO' },
        });
        return { estado: 'RECHAZADO' as const };
      }

      for (const det of ajuste.detalles) {
        const delta = Number(det.cantidadAjuste);
        if (delta === 0) continue;
        await moverStock(tx, {
          referenciaId: det.referenciaId,
          cantidad: Math.abs(delta),
          desde: delta < 0 ? 'DISPONIBLE' : null,
          hacia: delta > 0 ? 'DISPONIBLE' : null,
          clase: 'AJUSTE',
          docTipo: 'Ajuste',
          docId: ajuste.id,
          usuarioId: req.usuario!.id,
          detalle: `Ajuste ${ajuste.consecutivo} (${ajuste.concepto}): ${ajuste.justificacion}`,
        });
      }
      await tx.ajuste.update({
        where: { id },
        data: { estado: 'APROBADO', usuarioAprueba: req.usuario!.id, fechaAprobacion: fecha },
      });
      await registrarAuditoria(tx, {
        tablaAfectada: 'ajustes',
        registroId: id,
        accion: 'APROBACION',
        entidad: 'inventario',
        usuarioId: req.usuario!.id,
        direccionIp: req.ipCliente,
        estadoAnterior: { estado: 'PENDIENTE' },
        estadoNuevo: { estado: 'APROBADO', detalles: ajuste.detalles.map((d) => ({ referenciaId: d.referenciaId, delta: Number(d.cantidadAjuste) })) },
      });
      return { estado: 'APROBADO' as const };
    });
    res.json({ id, estado: resultado.estado });
  } catch (e) {
    next(e);
  }
});

// ---------------- Baja por vencimiento (RF-12) ----------------
/**
 * POST /api/inventario/bajas-vencimiento — retira del disponible mercancía caducada.
 * Nota documentada (decisión pendiente 13.3): la baja opera a nivel de
 * referencia mientras el cliente define la granularidad unidad/lote.
 */
inventarioRouter.post('/bajas-vencimiento', requierePermiso('inventario.vencimientos.baja'), async (req, res, next) => {
  try {
    const dato = z
      .object({
        referenciaId: z.coerce.number().int().positive(),
        cantidad: z.coerce.number().positive(),
        motivo: z.string().min(5),
      })
      .parse(req.body);
    const fecha = new Date();
    const baja = await prisma.$transaction(async (tx) => {
      const ref = await tx.referenciaVendible.findUnique({ where: { id: dato.referenciaId }, include: { producto: true } });
      if (!ref) throw ApiError.noEncontrado('Referencia no encontrada');
      if (!ref.producto.controlVencimiento) {
        throw ApiError.badRequest('El producto no está parametrizado con control de vencimiento');
      }
      await verificarPeriodoAbierto(tx, fecha);
      const consecutivo = await siguienteConsecutivo(tx, 'BV');
      const documento = await tx.bajaVencimiento.create({
        data: {
          consecutivo,
          referenciaId: dato.referenciaId,
          cantidad: dato.cantidad,
          motivo: dato.motivo,
          usuarioId: req.usuario!.id,
          fecha,
        },
      });
      await moverStock(tx, {
        referenciaId: dato.referenciaId,
        cantidad: dato.cantidad,
        desde: 'DISPONIBLE',
        hacia: null,
        clase: 'BAJA_VENCIMIENTO',
        docTipo: 'BajaVencimiento',
        docId: documento.id,
        usuarioId: req.usuario!.id,
        detalle: `Baja por vencimiento ${consecutivo}: ${dato.motivo}`,
      });
      await registrarAuditoria(tx, {
        tablaAfectada: 'bajas_vencimiento',
        registroId: documento.id,
        accion: 'INSERT',
        entidad: 'inventario',
        usuarioId: req.usuario!.id,
        direccionIp: req.ipCliente,
        estadoNuevo: { consecutivo, cantidad: dato.cantidad, motivo: dato.motivo },
      });
      return documento;
    });
    res.status(201).json({ id: baja.id, consecutivo: baja.consecutivo });
  } catch (e) {
    next(e);
  }
});

// ---------------- Devoluciones a proveedor (RF-11) ----------------
/**
 * POST /api/inventario/devoluciones-proveedor — descarga definitiva de mercancía
 * dañada para su cambio con el proveedor. Sale del pool DANADA.
 */
inventarioRouter.post('/devoluciones-proveedor', requierePermiso('inventario.danados'), async (req, res, next) => {
  try {
    const dato = z
      .object({
        proveedorId: z.coerce.number().int().positive(),
        motivo: z.string().min(5),
        documentoIngresoId: z.coerce.number().int().positive().optional().nullable(),
        detalles: z
          .array(z.object({ referenciaId: z.coerce.number().int().positive(), cantidad: z.coerce.number().positive() }))
          .min(1),
      })
      .parse(req.body);
    const proveedor = await prisma.tercero.findUnique({ where: { id: dato.proveedorId } });
    if (!proveedor?.esProveedor) throw ApiError.badRequest('El tercero indicado no está marcado como proveedor');
    const fecha = new Date();
    const devolucion = await prisma.$transaction(async (tx) => {
      await verificarPeriodoAbierto(tx, fecha);
      const consecutivo = await siguienteConsecutivo(tx, 'DP');
      const documento = await tx.devolucionProveedor.create({
        data: {
          consecutivo,
          proveedorId: dato.proveedorId,
          usuarioId: req.usuario!.id,
          motivo: dato.motivo,
          documentoIngresoId: dato.documentoIngresoId ?? null,
          fecha,
          detalles: { create: dato.detalles },
        },
      });
      for (const linea of dato.detalles) {
        await moverStock(tx, {
          referenciaId: linea.referenciaId,
          cantidad: linea.cantidad,
          desde: 'DANADA',
          hacia: null,
          clase: 'DEVOLUCION_PROVEEDOR',
          docTipo: 'DevolucionProveedor',
          docId: documento.id,
          usuarioId: req.usuario!.id,
          detalle: `Solicitud de cambio al proveedor ${consecutivo}: ${dato.motivo}`,
        });
      }
      await registrarAuditoria(tx, {
        tablaAfectada: 'devoluciones_proveedor',
        registroId: documento.id,
        accion: 'INSERT',
        entidad: 'inventario',
        usuarioId: req.usuario!.id,
        direccionIp: req.ipCliente,
        estadoNuevo: { consecutivo, proveedorId: dato.proveedorId, detalles: dato.detalles },
      });
      return documento;
    });
    res.status(201).json({ id: devolucion.id, consecutivo: devolucion.consecutivo });
  } catch (e) {
    next(e);
  }
});
