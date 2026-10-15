-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(30) NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permisos" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(60) NOT NULL,
    "modulo" VARCHAR(40) NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "permisos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rol_permiso" (
    "rolId" INTEGER NOT NULL,
    "permisoId" INTEGER NOT NULL,

    CONSTRAINT "rol_permiso_pkey" PRIMARY KEY ("rolId","permisoId")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nombre_completo" VARCHAR(100) NOT NULL,
    "nombre_usuario" VARCHAR(50) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "email" VARCHAR(100),
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario_rol" (
    "usuarioId" INTEGER NOT NULL,
    "rolId" INTEGER NOT NULL,

    CONSTRAINT "usuario_rol_pkey" PRIMARY KEY ("usuarioId","rolId")
);

-- CreateTable
CREATE TABLE "terceros" (
    "id" SERIAL NOT NULL,
    "identificacion" VARCHAR(50) NOT NULL,
    "tipo_persona" VARCHAR(15) NOT NULL DEFAULT 'NATURAL',
    "nombre" VARCHAR(100),
    "apellido" VARCHAR(100),
    "razon_social" VARCHAR(150),
    "direccion" VARCHAR(200),
    "ciudad" VARCHAR(100),
    "telefono" VARCHAR(30),
    "email" VARCHAR(100),
    "es_cliente" BOOLEAN NOT NULL DEFAULT false,
    "es_proveedor" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "terceros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marcas" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,

    CONSTRAINT "marcas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "presentaciones" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,

    CONSTRAINT "presentaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "descripcion" TEXT,
    "control_vencimiento" BOOLEAN NOT NULL DEFAULT false,
    "meses_garantia" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unidades_medida" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(10) NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,

    CONSTRAINT "unidades_medida_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversiones_unidad" (
    "id" SERIAL NOT NULL,
    "producto_id" INTEGER NOT NULL,
    "unidad_origen_id" INTEGER NOT NULL,
    "unidad_destino_id" INTEGER NOT NULL,
    "factor" DECIMAL(18,6) NOT NULL,

    CONSTRAINT "conversiones_unidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referencias_vendibles" (
    "id" SERIAL NOT NULL,
    "producto_id" INTEGER NOT NULL,
    "marca_id" INTEGER NOT NULL,
    "presentacion_id" INTEGER NOT NULL,
    "codigo_barras" VARCHAR(100) NOT NULL,
    "nombre" VARCHAR(200),
    "unidad_base_id" INTEGER NOT NULL,
    "fraccion_minima" DECIMAL(10,4) NOT NULL DEFAULT 1,
    "decimales" INTEGER NOT NULL DEFAULT 2,
    "iva_porcentaje" DECIMAL(5,2) NOT NULL DEFAULT 19,
    "costo_promedio" DECIMAL(15,4) NOT NULL DEFAULT 0,
    "precio_venta" DECIMAL(15,4) NOT NULL DEFAULT 0,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referencias_vendibles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventario_saldos" (
    "referencia_id" INTEGER NOT NULL,
    "cantidad_disponible" DECIMAL(15,4) NOT NULL DEFAULT 0,
    "cantidad_reservada" DECIMAL(15,4) NOT NULL DEFAULT 0,
    "cantidad_danada" DECIMAL(15,4) NOT NULL DEFAULT 0,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventario_saldos_pkey" PRIMARY KEY ("referencia_id")
);

-- CreateTable
CREATE TABLE "movimientos_inventario" (
    "id" BIGSERIAL NOT NULL,
    "tipo" VARCHAR(10) NOT NULL,
    "clase" VARCHAR(30) NOT NULL,
    "referencia_id" INTEGER NOT NULL,
    "cantidad" DECIMAL(15,4) NOT NULL,
    "disponible_antes" DECIMAL(15,4) NOT NULL,
    "reservada_antes" DECIMAL(15,4) NOT NULL DEFAULT 0,
    "danada_antes" DECIMAL(15,4) NOT NULL DEFAULT 0,
    "disponible_despues" DECIMAL(15,4) NOT NULL,
    "reservada_despues" DECIMAL(15,4) NOT NULL DEFAULT 0,
    "danada_despues" DECIMAL(15,4) NOT NULL DEFAULT 0,
    "doc_tipo" VARCHAR(40),
    "doc_id" INTEGER,
    "usuario_id" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "detalle" TEXT,

    CONSTRAINT "movimientos_inventario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ordenes_compra" (
    "id" SERIAL NOT NULL,
    "consecutivo" VARCHAR(50) NOT NULL,
    "proveedor_id" INTEGER NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'ABIERTA',
    "observaciones" TEXT,
    "usuario_id" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ordenes_compra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orden_detalle" (
    "id" SERIAL NOT NULL,
    "orden_id" INTEGER NOT NULL,
    "referencia_id" INTEGER NOT NULL,
    "cantidad" DECIMAL(15,4) NOT NULL,
    "costo_unitario" DECIMAL(15,4) NOT NULL,

    CONSTRAINT "orden_detalle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos_ingreso" (
    "id" SERIAL NOT NULL,
    "consecutivo" VARCHAR(50) NOT NULL,
    "orden_compra_id" INTEGER,
    "proveedor_id" INTEGER NOT NULL,
    "factura_proveedor" VARCHAR(100) NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'CERRADO',
    "motivo_anulacion" TEXT,
    "usuario_anula_id" INTEGER,
    "fecha_anulacion" TIMESTAMP(3),
    "usuario_crea_id" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documentos_ingreso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingreso_detalles" (
    "id" SERIAL NOT NULL,
    "documento_id" INTEGER NOT NULL,
    "referencia_id" INTEGER NOT NULL,
    "cantidad" DECIMAL(15,4) NOT NULL,
    "costo_unitario" DECIMAL(15,4) NOT NULL,
    "fecha_vencimiento" TIMESTAMP(3),

    CONSTRAINT "ingreso_detalles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ventas" (
    "id" SERIAL NOT NULL,
    "cliente_id" INTEGER,
    "usuario_id" INTEGER NOT NULL,
    "reserva_id" INTEGER,
    "subtotal" DECIMAL(15,4) NOT NULL DEFAULT 0,
    "descuento" DECIMAL(15,4) NOT NULL DEFAULT 0,
    "impuestos" DECIMAL(15,4) NOT NULL DEFAULT 0,
    "total" DECIMAL(15,4) NOT NULL DEFAULT 0,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ventas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venta_detalles" (
    "id" SERIAL NOT NULL,
    "venta_id" INTEGER NOT NULL,
    "referencia_id" INTEGER NOT NULL,
    "cantidad" DECIMAL(15,4) NOT NULL,
    "precio_unitario" DECIMAL(15,4) NOT NULL,
    "descuento" DECIMAL(15,4) NOT NULL DEFAULT 0,
    "iva_porcentaje" DECIMAL(5,2) NOT NULL DEFAULT 19,
    "subtotal" DECIMAL(15,4) NOT NULL,
    "devuelto" DECIMAL(15,4) NOT NULL DEFAULT 0,

    CONSTRAINT "venta_detalles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facturas" (
    "id" SERIAL NOT NULL,
    "venta_id" INTEGER NOT NULL,
    "consecutivo" VARCHAR(50) NOT NULL,
    "tipo" VARCHAR(20) NOT NULL DEFAULT 'INTERNA',
    "estado" VARCHAR(20) NOT NULL DEFAULT 'EMITIDA',
    "cufe" VARCHAR(100),
    "xml_dian" TEXT,
    "fecha_emision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "facturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservas" (
    "id" SERIAL NOT NULL,
    "consecutivo" VARCHAR(50) NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "pedido_ref" VARCHAR(60) NOT NULL,
    "fecha_limite" TIMESTAMP(3) NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'ACTIVA',
    "motivo_liberacion" TEXT,
    "usuario_id" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_liberacion" TIMESTAMP(3),

    CONSTRAINT "reservas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reserva_detalles" (
    "id" SERIAL NOT NULL,
    "reserva_id" INTEGER NOT NULL,
    "referencia_id" INTEGER NOT NULL,
    "cantidad" DECIMAL(15,4) NOT NULL,

    CONSTRAINT "reserva_detalles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devoluciones_cliente" (
    "id" SERIAL NOT NULL,
    "consecutivo" VARCHAR(50) NOT NULL,
    "venta_id" INTEGER NOT NULL,
    "usuario_recibe" INTEGER NOT NULL,
    "usuario_aprueba" INTEGER NOT NULL,
    "motivo" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "devoluciones_cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devolucion_cliente_detalle" (
    "id" SERIAL NOT NULL,
    "devolucion_id" INTEGER NOT NULL,
    "referencia_id" INTEGER NOT NULL,
    "venta_detalle_id" INTEGER NOT NULL,
    "cantidad" DECIMAL(15,4) NOT NULL,
    "estado_reingreso" VARCHAR(15) NOT NULL,

    CONSTRAINT "devolucion_cliente_detalle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devoluciones_proveedor" (
    "id" SERIAL NOT NULL,
    "consecutivo" VARCHAR(50) NOT NULL,
    "proveedor_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "motivo" TEXT NOT NULL,
    "documento_ingreso_id" INTEGER,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "devoluciones_proveedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devolucion_proveedor_detalle" (
    "id" SERIAL NOT NULL,
    "devolucion_id" INTEGER NOT NULL,
    "referencia_id" INTEGER NOT NULL,
    "cantidad" DECIMAL(15,4) NOT NULL,

    CONSTRAINT "devolucion_proveedor_detalle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ajustes" (
    "id" SERIAL NOT NULL,
    "consecutivo" VARCHAR(50) NOT NULL,
    "tipo" VARCHAR(10) NOT NULL,
    "concepto" VARCHAR(40) NOT NULL,
    "justificacion" TEXT NOT NULL,
    "estado" VARCHAR(15) NOT NULL DEFAULT 'PENDIENTE',
    "usuario_solicita" INTEGER NOT NULL,
    "usuario_aprueba" INTEGER,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_aprobacion" TIMESTAMP(3),

    CONSTRAINT "ajustes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ajuste_detalles" (
    "id" SERIAL NOT NULL,
    "ajuste_id" INTEGER NOT NULL,
    "referencia_id" INTEGER NOT NULL,
    "cantidad_sistema" DECIMAL(15,4) NOT NULL,
    "cantidad_contada" DECIMAL(15,4),
    "cantidad_ajuste" DECIMAL(15,4) NOT NULL,

    CONSTRAINT "ajuste_detalles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bajas_vencimiento" (
    "id" SERIAL NOT NULL,
    "consecutivo" VARCHAR(50) NOT NULL,
    "referencia_id" INTEGER NOT NULL,
    "cantidad" DECIMAL(15,4) NOT NULL,
    "motivo" TEXT NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bajas_vencimiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "garantias" (
    "id" SERIAL NOT NULL,
    "venta_detalle_id" INTEGER NOT NULL,
    "referencia_id" INTEGER NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "meses_cobertura" INTEGER NOT NULL,
    "fecha_fin" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "garantias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_costos" (
    "id" SERIAL NOT NULL,
    "referencia_id" INTEGER NOT NULL,
    "costo_anterior" DECIMAL(15,4) NOT NULL,
    "costo_nuevo" DECIMAL(15,4) NOT NULL,
    "origen" VARCHAR(30) NOT NULL,
    "doc_id" INTEGER,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_costos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_precios" (
    "id" SERIAL NOT NULL,
    "referencia_id" INTEGER NOT NULL,
    "precio_anterior" DECIMAL(15,4) NOT NULL,
    "precio_nuevo" DECIMAL(15,4) NOT NULL,
    "porcentaje_incremento" DECIMAL(8,4),
    "usuario_id" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_precios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cierres_mensuales" (
    "id" SERIAL NOT NULL,
    "periodo" VARCHAR(7) NOT NULL,
    "estado" VARCHAR(15) NOT NULL DEFAULT 'CERRADO',
    "usuario_cerro_id" INTEGER NOT NULL,
    "fecha_cierre" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario_reabrio_id" INTEGER,
    "fecha_reapertura" TIMESTAMP(3),
    "motivo_reapertura" TEXT,

    CONSTRAINT "cierres_mensuales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditoria_log" (
    "id" BIGSERIAL NOT NULL,
    "tabla_afectada" VARCHAR(60) NOT NULL,
    "registro_id" INTEGER NOT NULL,
    "accion" VARCHAR(20) NOT NULL,
    "entidad" VARCHAR(40),
    "usuario_id" INTEGER NOT NULL,
    "direccion_ip" VARCHAR(45),
    "estado_anterior" JSONB,
    "estado_nuevo" JSONB,
    "fecha_evento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditoria_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consecutivos" (
    "tipo" VARCHAR(30) NOT NULL,
    "prefijo" VARCHAR(10) NOT NULL,
    "valor_actual" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "consecutivos_pkey" PRIMARY KEY ("tipo")
);

-- CreateTable
CREATE TABLE "migraciones" (
    "id" SERIAL NOT NULL,
    "archivo" VARCHAR(255) NOT NULL,
    "tipo" VARCHAR(30) NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'PROCESADA',
    "total_filas" INTEGER NOT NULL DEFAULT 0,
    "filas_ok" INTEGER NOT NULL DEFAULT 0,
    "errores" JSONB,
    "usuario_id" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "migraciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parametros" (
    "clave" VARCHAR(60) NOT NULL,
    "valor" VARCHAR(255) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "parametros_pkey" PRIMARY KEY ("clave")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "key_hash" VARCHAR(255) NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_codigo_key" ON "roles"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_key" ON "roles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "permisos_codigo_key" ON "permisos"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_nombre_usuario_key" ON "usuarios"("nombre_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "terceros_identificacion_key" ON "terceros"("identificacion");

-- CreateIndex
CREATE UNIQUE INDEX "marcas_nombre_key" ON "marcas"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "presentaciones_nombre_key" ON "presentaciones"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "unidades_medida_codigo_key" ON "unidades_medida"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "conversiones_unidad_producto_id_unidad_origen_id_unidad_des_key" ON "conversiones_unidad"("producto_id", "unidad_origen_id", "unidad_destino_id");

-- CreateIndex
CREATE UNIQUE INDEX "referencias_vendibles_codigo_barras_key" ON "referencias_vendibles"("codigo_barras");

-- CreateIndex
CREATE UNIQUE INDEX "referencias_vendibles_producto_id_marca_id_presentacion_id_key" ON "referencias_vendibles"("producto_id", "marca_id", "presentacion_id");

-- CreateIndex
CREATE INDEX "movimientos_inventario_referencia_id_fecha_idx" ON "movimientos_inventario"("referencia_id", "fecha");

-- CreateIndex
CREATE INDEX "movimientos_inventario_clase_fecha_idx" ON "movimientos_inventario"("clase", "fecha");

-- CreateIndex
CREATE UNIQUE INDEX "ordenes_compra_consecutivo_key" ON "ordenes_compra"("consecutivo");

-- CreateIndex
CREATE UNIQUE INDEX "documentos_ingreso_consecutivo_key" ON "documentos_ingreso"("consecutivo");

-- CreateIndex
CREATE UNIQUE INDEX "ventas_reserva_id_key" ON "ventas"("reserva_id");

-- CreateIndex
CREATE UNIQUE INDEX "facturas_venta_id_key" ON "facturas"("venta_id");

-- CreateIndex
CREATE UNIQUE INDEX "facturas_consecutivo_key" ON "facturas"("consecutivo");

-- CreateIndex
CREATE UNIQUE INDEX "reservas_consecutivo_key" ON "reservas"("consecutivo");

-- CreateIndex
CREATE UNIQUE INDEX "devoluciones_cliente_consecutivo_key" ON "devoluciones_cliente"("consecutivo");

-- CreateIndex
CREATE UNIQUE INDEX "devoluciones_proveedor_consecutivo_key" ON "devoluciones_proveedor"("consecutivo");

-- CreateIndex
CREATE UNIQUE INDEX "ajustes_consecutivo_key" ON "ajustes"("consecutivo");

-- CreateIndex
CREATE UNIQUE INDEX "bajas_vencimiento_consecutivo_key" ON "bajas_vencimiento"("consecutivo");

-- CreateIndex
CREATE INDEX "historial_costos_referencia_id_fecha_idx" ON "historial_costos"("referencia_id", "fecha");

-- CreateIndex
CREATE INDEX "historial_precios_referencia_id_fecha_idx" ON "historial_precios"("referencia_id", "fecha");

-- CreateIndex
CREATE UNIQUE INDEX "cierres_mensuales_periodo_key" ON "cierres_mensuales"("periodo");

-- CreateIndex
CREATE INDEX "auditoria_log_tabla_afectada_registro_id_idx" ON "auditoria_log"("tabla_afectada", "registro_id");

-- CreateIndex
CREATE INDEX "auditoria_log_fecha_evento_idx" ON "auditoria_log"("fecha_evento");

-- CreateIndex
CREATE INDEX "auditoria_log_usuario_id_idx" ON "auditoria_log"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_key_hash_key" ON "api_keys"("key_hash");

-- AddForeignKey
ALTER TABLE "rol_permiso" ADD CONSTRAINT "rol_permiso_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rol_permiso" ADD CONSTRAINT "rol_permiso_permisoId_fkey" FOREIGN KEY ("permisoId") REFERENCES "permisos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_rol" ADD CONSTRAINT "usuario_rol_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_rol" ADD CONSTRAINT "usuario_rol_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversiones_unidad" ADD CONSTRAINT "conversiones_unidad_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversiones_unidad" ADD CONSTRAINT "conversiones_unidad_unidad_origen_id_fkey" FOREIGN KEY ("unidad_origen_id") REFERENCES "unidades_medida"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversiones_unidad" ADD CONSTRAINT "conversiones_unidad_unidad_destino_id_fkey" FOREIGN KEY ("unidad_destino_id") REFERENCES "unidades_medida"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referencias_vendibles" ADD CONSTRAINT "referencias_vendibles_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referencias_vendibles" ADD CONSTRAINT "referencias_vendibles_marca_id_fkey" FOREIGN KEY ("marca_id") REFERENCES "marcas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referencias_vendibles" ADD CONSTRAINT "referencias_vendibles_presentacion_id_fkey" FOREIGN KEY ("presentacion_id") REFERENCES "presentaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referencias_vendibles" ADD CONSTRAINT "referencias_vendibles_unidad_base_id_fkey" FOREIGN KEY ("unidad_base_id") REFERENCES "unidades_medida"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventario_saldos" ADD CONSTRAINT "inventario_saldos_referencia_id_fkey" FOREIGN KEY ("referencia_id") REFERENCES "referencias_vendibles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_referencia_id_fkey" FOREIGN KEY ("referencia_id") REFERENCES "referencias_vendibles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_compra" ADD CONSTRAINT "ordenes_compra_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "terceros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_compra" ADD CONSTRAINT "ordenes_compra_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_detalle" ADD CONSTRAINT "orden_detalle_orden_id_fkey" FOREIGN KEY ("orden_id") REFERENCES "ordenes_compra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_detalle" ADD CONSTRAINT "orden_detalle_referencia_id_fkey" FOREIGN KEY ("referencia_id") REFERENCES "referencias_vendibles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos_ingreso" ADD CONSTRAINT "documentos_ingreso_orden_compra_id_fkey" FOREIGN KEY ("orden_compra_id") REFERENCES "ordenes_compra"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos_ingreso" ADD CONSTRAINT "documentos_ingreso_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "terceros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos_ingreso" ADD CONSTRAINT "documentos_ingreso_usuario_crea_id_fkey" FOREIGN KEY ("usuario_crea_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingreso_detalles" ADD CONSTRAINT "ingreso_detalles_documento_id_fkey" FOREIGN KEY ("documento_id") REFERENCES "documentos_ingreso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingreso_detalles" ADD CONSTRAINT "ingreso_detalles_referencia_id_fkey" FOREIGN KEY ("referencia_id") REFERENCES "referencias_vendibles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "terceros"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_reserva_id_fkey" FOREIGN KEY ("reserva_id") REFERENCES "reservas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venta_detalles" ADD CONSTRAINT "venta_detalles_venta_id_fkey" FOREIGN KEY ("venta_id") REFERENCES "ventas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venta_detalles" ADD CONSTRAINT "venta_detalles_referencia_id_fkey" FOREIGN KEY ("referencia_id") REFERENCES "referencias_vendibles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_venta_id_fkey" FOREIGN KEY ("venta_id") REFERENCES "ventas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "terceros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserva_detalles" ADD CONSTRAINT "reserva_detalles_reserva_id_fkey" FOREIGN KEY ("reserva_id") REFERENCES "reservas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserva_detalles" ADD CONSTRAINT "reserva_detalles_referencia_id_fkey" FOREIGN KEY ("referencia_id") REFERENCES "referencias_vendibles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devoluciones_cliente" ADD CONSTRAINT "devoluciones_cliente_venta_id_fkey" FOREIGN KEY ("venta_id") REFERENCES "ventas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devoluciones_cliente" ADD CONSTRAINT "devoluciones_cliente_usuario_recibe_fkey" FOREIGN KEY ("usuario_recibe") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devoluciones_cliente" ADD CONSTRAINT "devoluciones_cliente_usuario_aprueba_fkey" FOREIGN KEY ("usuario_aprueba") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devolucion_cliente_detalle" ADD CONSTRAINT "devolucion_cliente_detalle_devolucion_id_fkey" FOREIGN KEY ("devolucion_id") REFERENCES "devoluciones_cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devolucion_cliente_detalle" ADD CONSTRAINT "devolucion_cliente_detalle_referencia_id_fkey" FOREIGN KEY ("referencia_id") REFERENCES "referencias_vendibles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devolucion_cliente_detalle" ADD CONSTRAINT "devolucion_cliente_detalle_venta_detalle_id_fkey" FOREIGN KEY ("venta_detalle_id") REFERENCES "venta_detalles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devoluciones_proveedor" ADD CONSTRAINT "devoluciones_proveedor_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "terceros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devoluciones_proveedor" ADD CONSTRAINT "devoluciones_proveedor_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devolucion_proveedor_detalle" ADD CONSTRAINT "devolucion_proveedor_detalle_devolucion_id_fkey" FOREIGN KEY ("devolucion_id") REFERENCES "devoluciones_proveedor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devolucion_proveedor_detalle" ADD CONSTRAINT "devolucion_proveedor_detalle_referencia_id_fkey" FOREIGN KEY ("referencia_id") REFERENCES "referencias_vendibles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ajustes" ADD CONSTRAINT "ajustes_usuario_solicita_fkey" FOREIGN KEY ("usuario_solicita") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ajustes" ADD CONSTRAINT "ajustes_usuario_aprueba_fkey" FOREIGN KEY ("usuario_aprueba") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ajuste_detalles" ADD CONSTRAINT "ajuste_detalles_ajuste_id_fkey" FOREIGN KEY ("ajuste_id") REFERENCES "ajustes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ajuste_detalles" ADD CONSTRAINT "ajuste_detalles_referencia_id_fkey" FOREIGN KEY ("referencia_id") REFERENCES "referencias_vendibles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bajas_vencimiento" ADD CONSTRAINT "bajas_vencimiento_referencia_id_fkey" FOREIGN KEY ("referencia_id") REFERENCES "referencias_vendibles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bajas_vencimiento" ADD CONSTRAINT "bajas_vencimiento_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "garantias" ADD CONSTRAINT "garantias_venta_detalle_id_fkey" FOREIGN KEY ("venta_detalle_id") REFERENCES "venta_detalles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "garantias" ADD CONSTRAINT "garantias_referencia_id_fkey" FOREIGN KEY ("referencia_id") REFERENCES "referencias_vendibles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_costos" ADD CONSTRAINT "historial_costos_referencia_id_fkey" FOREIGN KEY ("referencia_id") REFERENCES "referencias_vendibles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_precios" ADD CONSTRAINT "historial_precios_referencia_id_fkey" FOREIGN KEY ("referencia_id") REFERENCES "referencias_vendibles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_precios" ADD CONSTRAINT "historial_precios_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cierres_mensuales" ADD CONSTRAINT "cierres_mensuales_usuario_cerro_id_fkey" FOREIGN KEY ("usuario_cerro_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cierres_mensuales" ADD CONSTRAINT "cierres_mensuales_usuario_reabrio_id_fkey" FOREIGN KEY ("usuario_reabrio_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria_log" ADD CONSTRAINT "auditoria_log_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "migraciones" ADD CONSTRAINT "migraciones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
