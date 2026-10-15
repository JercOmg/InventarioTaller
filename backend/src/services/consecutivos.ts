import type { Prisma } from '@prisma/client';
import { ApiError } from '../lib/errors';

type Tx = Prisma.TransactionClient;

/**
 * Genera el siguiente consecutivo de un tipo de forma atómica y sin huecos
 * (RF-06, RF-07, RF-17). El UPDATE con incremento y la lectura se hacen en la
 * misma transacción; si la transacción se revierte, el consecutivo se restaura.
 */
export async function siguienteConsecutivo(tx: Tx, tipo: string): Promise<string> {
  const rows = await tx.$queryRaw<{ prefijo: string; valor_actual: number }[]>`
    UPDATE consecutivos SET valor_actual = valor_actual + 1
    WHERE tipo = ${tipo}
    RETURNING prefijo, valor_actual`;
  if (rows.length === 0) {
    throw ApiError.conflicto(`El tipo de consecutivo "${tipo}" no está configurado`);
  }
  const { prefijo, valor_actual } = rows[0];
  return `${prefijo}-${String(valor_actual).padStart(6, '0')}`;
}
