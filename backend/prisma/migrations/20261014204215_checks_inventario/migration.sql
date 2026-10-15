-- ============================================================
-- Restricciones CHECK a nivel de base de datos
-- Última barrera de integridad del inventario (RF-03, RNF-03):
-- ningún saldo puede quedar negativo aunque la aplicación falle.
-- ============================================================

-- Inventario: saldos nunca negativos (regla de oro)
ALTER TABLE inventario_saldos
  ADD CONSTRAINT chk_saldo_disponible CHECK (cantidad_disponible >= 0),
  ADD CONSTRAINT chk_saldo_reservada CHECK (cantidad_reservada >= 0),
  ADD CONSTRAINT chk_saldo_danada CHECK (cantidad_danada >= 0);

-- Cantidades positivas en documentos transaccionales
ALTER TABLE orden_detalle ADD CONSTRAINT chk_orden_cantidad CHECK (cantidad > 0);
ALTER TABLE ingreso_detalles ADD CONSTRAINT chk_ingreso_cantidad CHECK (cantidad > 0 AND costo_unitario >= 0);
ALTER TABLE venta_detalles ADD CONSTRAINT chk_venta_cantidad CHECK (cantidad > 0 AND precio_unitario >= 0);
ALTER TABLE reserva_detalles ADD CONSTRAINT chk_reserva_cantidad CHECK (cantidad > 0);
ALTER TABLE devolucion_cliente_detalle ADD CONSTRAINT chk_devcli_cantidad CHECK (cantidad > 0);
ALTER TABLE devolucion_proveedor_detalle ADD CONSTRAINT chk_devprov_cantidad CHECK (cantidad > 0);
ALTER TABLE ajuste_detalles ADD CONSTRAINT chk_ajuste_cantidad CHECK (cantidad_sistema >= 0);
ALTER TABLE bajas_vencimiento ADD CONSTRAINT chk_baja_cantidad CHECK (cantidad > 0);

-- Fracciones mínimas válidas (RF-02)
ALTER TABLE referencias_vendibles ADD CONSTRAINT chk_fraccion_minima CHECK (fraccion_minima > 0);

-- Devuelto no puede superar lo facturado (RF-18)
ALTER TABLE venta_detalles ADD CONSTRAINT chk_devuelto_rango CHECK (devuelto >= 0 AND devuelto <= cantidad);

-- El factor de conversión debe ser mayor que cero (RF-02)
ALTER TABLE conversiones_unidad ADD CONSTRAINT chk_conversion_factor CHECK (factor > 0);
