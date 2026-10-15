import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { redondear } from '../lib/numeros';

type Tx = Prisma.TransactionClient;

/**
 * Promedio ponderado móvil — RF-15.
 * nuevoCosto = (saldoAntes × costoAnterior + cantidadEntra × costoUnitario) / (saldoAntes + cantidadEntra)
 *
 * Supuesto documentado (decisión pendiente 13.6): se usa el promedio ponderado
 * móvil sobre el costo de adquisición; fletes/impuestos quedan pendientes de
 * definición por el cliente.
 */
export function calcularPromedioPonderado(
  saldoAntes: number,
  costoAnterior: number,
  cantidadEntra: number,
  costoUnitario: number,
): number {
  const cantidadTotal = saldoAntes + cantidadEntra;
  if (cantidadTotal <= 0) return costoAnterior;
  return redondear((saldoAntes * costoAnterior + cantidadEntra * costoUnitario) / cantidadTotal, 4);
}

/**
 * Recalcula el costo promedio ponderado móvil al ingresar mercancía — RF-15.
 * La cantidad base es el stock total físico (disponible + reservada + dañada).
 */
export async function recalcularCostoPromedio(
  tx: Tx,
  dato: { referenciaId: number; cantidadEntra: number; costoUnitario: number; docId?: number; origen?: string },
) {
  const referencia = await tx.referenciaVendible.findUnique({ where: { id: dato.referenciaId } });
  if (!referencia) return null;

  const saldos = await tx.inventarioSaldo.findUnique({ where: { referenciaId: dato.referenciaId } });
  const saldoAntes = saldos
    ? Number(saldos.cantidadDisponible) + Number(saldos.cantidadReservada) + Number(saldos.cantidadDanada) - dato.cantidadEntra
    : 0;
  const costoAnterior = Number(referencia.costoPromedio);

  const nuevoCosto = calcularPromedioPonderado(saldoAntes, costoAnterior, dato.cantidadEntra, dato.costoUnitario);

  await tx.referenciaVendible.update({
    where: { id: dato.referenciaId },
    data: { costoPromedio: nuevoCosto },
  });
  await tx.historialCosto.create({
    data: {
      referenciaId: dato.referenciaId,
      costoAnterior,
      costoNuevo: nuevoCosto,
      origen: dato.origen ?? 'COMPRA',
      docId: dato.docId,
    },
  });
  return { costoAnterior, costoNuevo: nuevoCosto };
}

/** Consulta de historial de costos (permiso costos.ver — solo gerencia). */
export async function consultarCostos(referenciaId: number) {
  const items = await prisma.historialCosto.findMany({
    where: { referenciaId },
    orderBy: { fecha: 'desc' },
    take: 100,
  });
  return items.map((h) => ({
    id: h.id,
    costoAnterior: Number(h.costoAnterior),
    costoNuevo: Number(h.costoNuevo),
    origen: h.origen,
    docId: h.docId,
    fecha: h.fecha,
  }));
}
