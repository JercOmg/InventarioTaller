import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';

type Tx = Prisma.TransactionClient;

export interface AuditoriaInput {
  tablaAfectada: string;
  registroId: number;
  accion: string; // INSERT | UPDATE | DELETE | ANULACION | LOGIN | RECHAZO | APROBACION
  entidad?: string;
  usuarioId: number;
  direccionIp?: string | null;
  estadoAnterior?: unknown;
  estadoNuevo?: unknown;
}

/**
 * Registro de auditoría inmutable — RF-22 / RNF-01.
 * Debe llamarse dentro de la transacción de la operación para que la traza
 * y el cambio se confirmen (o reviertan) juntos. Solo hay INSERT: ningún
 * endpoint permite modificar o borrar estos registros.
 */
export async function registrarAuditoria(tx: Tx, dato: AuditoriaInput) {
  return tx.auditoriaLog.create({
    data: {
      tablaAfectada: dato.tablaAfectada,
      registroId: dato.registroId,
      accion: dato.accion,
      entidad: dato.entidad,
      usuarioId: dato.usuarioId,
      direccionIp: dato.direccionIp ?? null,
      estadoAnterior: (dato.estadoAnterior ?? undefined) as Prisma.InputJsonValue | undefined,
      estadoNuevo: (dato.estadoNuevo ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });
}

/** Consulta con filtros (solo lectura, permiso auditoria.ver). */
export async function consultarAuditoria(filtros: {
  desde?: Date;
  hasta?: Date;
  usuarioId?: number;
  tablaAfectada?: string;
  accion?: string;
  pagina?: number;
  tamano?: number;
}) {
  const { desde, hasta, usuarioId, tablaAfectada, accion } = filtros;
  const pagina = filtros.pagina ?? 1;
  const tamano = Math.min(filtros.tamano ?? 50, 200);
  const where: Prisma.AuditoriaLogWhereInput = {
    ...(desde || hasta
      ? { fechaEvento: { ...(desde ? { gte: desde } : {}), ...(hasta ? { lte: hasta } : {}) } }
      : {}),
    ...(usuarioId ? { usuarioId } : {}),
    ...(tablaAfectada ? { tablaAfectada } : {}),
    ...(accion ? { accion } : {}),
  };
  const [total, items] = await Promise.all([
    prisma.auditoriaLog.count({ where }),
    prisma.auditoriaLog.findMany({
      where,
      include: { usuario: { select: { nombreUsuario: true, nombreCompleto: true } } },
      orderBy: { fechaEvento: 'desc' },
      skip: (pagina - 1) * tamano,
      take: tamano,
    }),
  ]);
  return { total, pagina, tamano, items };
}
