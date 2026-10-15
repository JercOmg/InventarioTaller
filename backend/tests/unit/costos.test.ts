import { describe, it, expect } from 'vitest';
import { calcularPromedioPonderado } from '../../src/services/costos';
import { redondear, cumpleFraccionMinima } from '../../src/lib/numeros';

describe('Cálculo de costo promedio ponderado móvil (RF-15)', () => {
  it('criterio de aceptación: 10 palas a $10.000 + 10 a $20.000 → $15.000', () => {
    expect(calcularPromedioPonderado(10, 10_000, 10, 20_000)).toBe(15_000);
  });

  it('primera compra: sin saldo previo toma el costo de adquisición', () => {
    expect(calcularPromedioPonderado(0, 0, 50, 4_300)).toBe(4_300);
  });

  it('mezcla con cantidades desiguales', () => {
    // (3 × 100 + 2 × 200) / 5 = 140
    expect(calcularPromedioPonderado(3, 100, 2, 200)).toBe(140);
  });

  it('sin existencias mantiene el costo anterior', () => {
    expect(calcularPromedioPonderado(0, 9_500, 0, 12_000)).toBe(9_500);
  });

  it('redondea a 4 decimales', () => {
    expect(calcularPromedioPonderado(1, 10, 1, 11)).toBe(10.5);
    // (1×10 + 2×11)/3 = 10.6667
    expect(calcularPromedioPonderado(1, 10, 2, 11)).toBe(10.6667);
  });
});

describe('Redondeo comercial (RNF-02)', () => {
  it('redondea half-up a 2 decimales', () => {
    expect(redondear(1.005, 2)).toBe(1.01);
    expect(redondear(1.004, 2)).toBe(1);
    expect(redondear(9500, 2)).toBe(9500);
  });
});

describe('Fracciones mínimas parametrizables (RF-02)', () => {
  it('acepta múltiplos de la fracción', () => {
    expect(cumpleFraccionMinima(1.5, 0.5)).toBe(true);
    expect(cumpleFraccionMinima(2, 0.5)).toBe(true);
    expect(cumpleFraccionMinima(5, 1)).toBe(true);
  });

  it('rechaza cantidades bajo el mínimo o no múltiplo', () => {
    // criterio de aceptación RF-02: fracción mínima 1 → facturar 1.5 se bloquea
    expect(cumpleFraccionMinima(1.5, 1)).toBe(false);
    expect(cumpleFraccionMinima(0.25, 0.5)).toBe(false);
  });
});
