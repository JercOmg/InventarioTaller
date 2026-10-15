import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { ApiError } from '../lib/errors';
import { redondear } from '../lib/numeros';

type Tx = Prisma.TransactionClient;

/** Pools de inventario — RF-03. */
export type Pool = 'DISPONIBLE' | 'RESERVADA' | 'DANADA';
/** null = entra/sale del sistema (compra, venta, baja...). */
export type PoolOrExterno = Pool | null;

export interface MovimientoStockInput {
  referenciaId: number;
  cantidad: number;
  /** Pool de origen (null para entradas externas). */
  desde: PoolOrExterno;
  /** Pool de destino (null para salidas externas). */
  hacia: PoolOrExterno;
  clase: string;
  docTipo?: string;
  docId?: number;
  usuarioId: number;
  detalle?: string;
}

const COL: Record<Pool, string> = {
  DISPONIBLE: 'cantidad_disponible',
  RESERVADA: 'cantidad_reservada',
  DANADA: 'cantidad_danada',
};

const Q = (n: number) => redondear(n, 4);

/** Mensajes de rechazo específicos por clase de movimiento (más comprensibles que el genérico). */
const MENSAJES_INSUFICIENCIA: Record<string, (solicitadas: number, disponibles: number) => string> = {
  VENTA: (s, d) =>
    `Existencias insuficientes para la venta: solicitó ${s} unidades y solo hay ${d} disponibles`,
  RESERVA: (s, d) =>
    `No hay saldo suficiente para apartar ${s} unidades: solo hay ${d} disponibles (sin contar reservadas ni dañadas)`,
  DANIFICACION: (s, d) =>
    `No se pueden marcar ${s} unidades como dañadas: solo hay ${d} disponibles en bodega`,
  BAJA_VENCIMIENTO: (s, d) =>
    `No se puede registrar la baja de ${s} unidades: solo hay ${d} disponibles`,
  DEVOLUCION_PROVEEDOR: (s, d) =>
    `No se puede devolver ${s} unidades al proveedor: solo hay ${d} unidades clasificadas como dañadas. Primero use el botón "Dañado" en la tabla de saldos para clasificar el stock averiado`,
  COMPRA_ANULADA: (s, d) =>
    `No es posible anular el ingreso: el saldo disponible actual (${d}) es menor que lo recibido (${s}), lo que indica que parte de esta mercancía ya fue vendida`,
  AJUSTE: (s, d) =>
    `El ajuste no se puede aplicar: pedía una salida de ${s} unidades pero solo hay ${d} disponibles`,
  CONSUMO_RESERVA: (s, d) =>
    `La reserva no puede facturarse: sus ${s} unidades ya no están en el pool reservado (solo quedan ${d}); probablemente la reserva fue liberada`,
};

interface SaldoRow {
  cantidad_disponible: Prisma.Decimal;
  cantidad_reservada: Prisma.Decimal;
  cantidad_danada: Prisma.Decimal;
}

/**
 * Motor de inventario — RF-03, RF-09, RNF-03.
 *
 * Garantiza saldos nunca negativos bajo concurrencia con un triple mecanismo:
 *  1. `INSERT ... ON CONFLICT DO NOTHING` asegura que la fila de saldo exista.
 *  2. `SELECT ... FOR UPDATE` bloquea la fila: la transacción concurrente
 *     espera hasta que la primera se confirme, y en READ COMMITTED lee el
 *     saldo ya actualizado (primera transacción confirmada gana — RF-09).
 *  3. El `UPDATE` repite la condición en el WHERE (`saldo >= cantidad`), de
 *     modo que aun ante cualquier carrera el motor rechaza el descuento.
 *
 * Además valida las restricciones CHECK de la base de datos como última barrera.
 */
export async function moverStock(tx: Tx, dato: MovimientoStockInput) {
  const cantidad = Q(dato.cantidad);
  if (!Number.isFinite(cantidad) || cantidad <= 0) {
    throw ApiError.badRequest('La cantidad debe ser un número positivo mayor que cero');
  }

  // 1. Asegurar fila de saldo y 2. bloquearla para este transaction
  await tx.$queryRaw`
    INSERT INTO inventario_saldos (referencia_id, cantidad_disponible, cantidad_reservada, cantidad_danada)
    VALUES (${dato.referenciaId}, 0, 0, 0)
    ON CONFLICT (referencia_id) DO NOTHING`;
  const rows = await tx.$queryRaw<SaldoRow[]>`
    SELECT cantidad_disponible, cantidad_reservada, cantidad_danada
    FROM inventario_saldos
    WHERE referencia_id = ${dato.referenciaId}
    FOR UPDATE`;
  const saldo = rows[0];

  const actual: Record<Pool, number> = {
    DISPONIBLE: Number(saldo.cantidad_disponible),
    RESERVADA: Number(saldo.cantidad_reservada),
    DANADA: Number(saldo.cantidad_danada),
  };
  const antes = { ...actual };

  // 3. Validar y computar el nuevo estado
  if (dato.desde) {
    if (actual[dato.desde] < cantidad) {
      const mensaje =
        MENSAJES_INSUFICIENCIA[dato.clase]?.(cantidad, actual[dato.desde]) ??
        `Existencias insuficientes en el pool ${dato.desde}: solicitadas ${cantidad}, disponibles ${actual[dato.desde]}`;
      throw ApiError.conflicto(mensaje, { referenciaId: dato.referenciaId, clase: dato.clase });
    }
    actual[dato.desde] = Q(actual[dato.desde] - cantidad);
  }
  if (dato.hacia) {
    actual[dato.hacia] = Q(actual[dato.hacia] + cantidad);
  }
  // Regla de oro: ningún pool puede quedar negativo
  for (const pool of Object.keys(actual) as Pool[]) {
    if (actual[pool] < 0) {
      throw ApiError.conflicto(`El saldo ${pool} no puede quedar negativo`);
    }
  }

  // 4. Actualizar repitiendo la condición (defensa extra ante carreras)
  const sets: string[] = [];
  const params: unknown[] = [];
  for (const pool of Object.keys(actual) as Pool[]) {
    if (actual[pool] !== antes[pool]) {
      params.push(actual[pool]);
      sets.push(`${COL[pool]} = $${params.length}`);
    }
  }
  if (sets.length > 0) {
    params.push(dato.referenciaId);
    const condicion = dato.desde ? ` AND ${COL[dato.desde]} >= ${cantidad}` : '';
    const result = await tx.$executeRawUnsafe(
      `UPDATE inventario_saldos SET ${sets.join(', ')}, fecha_actualizacion = NOW()
       WHERE referencia_id = $${params.length}${condicion}`,
      ...params,
    );
    if (result === 0) {
      throw ApiError.conflicto(
        'La transacción no pudo completarse: otro usuario acaba de modificar las existencias de este producto',
      );
    }
  }

  // 5. Kardex: traza del movimiento con estados anterior y posterior (RF-22)
  const tipo: string =
    dato.desde === null && dato.hacia !== null
      ? 'ENTRADA'
      : dato.desde !== null && dato.hacia === null
        ? 'SALIDA'
        : 'INTERNO';
  const movimiento = await tx.movimientoInventario.create({
    data: {
      tipo,
      clase: dato.clase,
      referenciaId: dato.referenciaId,
      cantidad,
      disponibleAntes: antes.DISPONIBLE,
      reservadaAntes: antes.RESERVADA,
      danadaAntes: antes.DANADA,
      disponibleDespues: actual.DISPONIBLE,
      reservadaDespues: actual.RESERVADA,
      danadaDespues: actual.DANADA,
      docTipo: dato.docTipo,
      docId: dato.docId,
      usuarioId: dato.usuarioId,
      detalle: dato.detalle,
    },
  });

  return {
    movimientoId: Number(movimiento.id),
    saldos: actual,
  };
}

/** Consulta de saldos con información de catálogo. */
export async function consultarSaldos(filtros: {
  busqueda?: string;
  referenciaId?: number;
  pagina?: number;
  tamano?: number;
}) {
  const pagina = filtros.pagina ?? 1;
  const tamano = Math.min(filtros.tamano ?? 50, 200);
  const where = filtros.referenciaId
    ? { id: filtros.referenciaId }
    : filtros.busqueda
      ? {
        estado: 'ACTIVO',
        OR: [
          { codigoBarras: { contains: filtros.busqueda } },
          { nombre: { contains: filtros.busqueda, mode: 'insensitive' as const } },
          { producto: { nombre: { contains: filtros.busqueda, mode: 'insensitive' as const } } },
        ],
      }
    : {};
  const [total, items] = await Promise.all([
    prisma.inventarioSaldo.count({ where: { referencia: where } }),
    prisma.inventarioSaldo.findMany({
      where: { referencia: where },
      include: {
        referencia: {
          include: {
            producto: { select: { nombre: true, controlVencimiento: true, mesesGarantia: true } },
            marca: { select: { nombre: true } },
            presentacion: { select: { nombre: true } },
            unidadBase: { select: { codigo: true, nombre: true } },
          },
        },
      },
      orderBy: { referenciaId: 'asc' },
      skip: (pagina - 1) * tamano,
      take: tamano,
    }),
  ]);
  return {
    total,
    pagina,
    tamano,
    items: items.map((s) => ({
      referenciaId: s.referenciaId,
      codigoBarras: s.referencia.codigoBarras,
      descripcion:
        s.referencia.nombre ??
        `${s.referencia.producto.nombre} - ${s.referencia.marca.nombre} - ${s.referencia.presentacion.nombre}`,
      unidadBase: s.referencia.unidadBase.codigo,
      controlVencimiento: s.referencia.producto.controlVencimiento,
      disponible: Number(s.cantidadDisponible),
      reservada: Number(s.cantidadReservada),
      danada: Number(s.cantidadDanada),
      total: Number(s.cantidadDisponible) + Number(s.cantidadReservada) + Number(s.cantidadDanada),
    })),
  };
}
