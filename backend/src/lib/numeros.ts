/** Utilidades numéricas para cantidades y dinero (RNF-02). */

/** Redondea a `decimales` cifras usando redondeo comercial (half-up). */
export function redondear(valor: number, decimales = 2): number {
  const f = 10 ** decimales;
  return Math.round((valor + Number.EPSILON) * f) / f;
}

/** Valida que la cantidad sea múltiplo de la fracción mínima parametrizada (RF-02). */
export function cumpleFraccionMinima(cantidad: number, fraccionMinima: number): boolean {
  if (fraccionMinima <= 0) return false;
  const cociente = cantidad / fraccionMinima;
  return Math.abs(cociente - Math.round(cociente)) < 1e-6;
}
