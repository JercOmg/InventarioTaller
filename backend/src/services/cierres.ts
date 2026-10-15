import type { Prisma } from '@prisma/client';
import { ApiError } from '../lib/errors';

type Tx = Prisma.TransactionClient;

/**
 * Verifica que la fecha de una transacción no caiga en un periodo contable
 * cerrado — RF-20. Un periodo en estado REABIERTO admite operaciones.
 */
export async function verificarPeriodoAbierto(tx: Tx, fecha: Date) {
  const periodo = `${fecha.getUTCFullYear()}-${String(fecha.getUTCMonth() + 1).padStart(2, '0')}`;
  const cierre = await tx.cierreMensual.findUnique({ where: { periodo } });
  if (cierre && cierre.estado === 'CERRADO') {
    throw ApiError.conflicto(
      `No es posible alterar esta transacción porque pertenece al periodo contable cerrado ${periodo}`,
    );
  }
}
