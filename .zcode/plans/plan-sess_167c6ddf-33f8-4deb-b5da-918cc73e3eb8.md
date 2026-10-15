# Plan: Sistema de Inventario para Ferretería — Backend + Frontend + Pruebas + Deployment

## Resumen

Construcción completa del sistema descrito en `Ferretería (1).md` (RF-01 a RF-25, RNF-01 a RNF-06), con alcance "núcleo completo confirmado": todos los módulos con reglas confirmadas quedan funcionales; facturación DIAN real e integraciones externas quedan como estructura preparada (stubs) según las decisiones pendientes del documento.

**Stack decidido:** Node.js 20 + Express + TypeScript + Prisma + PostgreSQL (backend) · React 18 + Vite + TypeScript + Ant Design (frontend) · Vitest/Supertest + Playwright (pruebas) · Docker Compose + GitHub Actions (deployment).

## Estructura del proyecto

```
castro/
├── backend/                 # API REST
│   ├── src/
│   │   ├── config/          # env, constants
│   │   ├── middleware/      # auth JWT, RBAC, errores, auditoría
│   │   ├── modules/         # 1 carpeta por módulo (routes/controller/service)
│   │   ├── utils/           # consecutivos, redondeo, prisma client
│   │   └── app.ts / server.ts
│   ├── prisma/schema.prisma + seed.ts
│   └── tests/               # unit + integración (Supertest)
├── frontend/                # SPA React
│   ├── src/pages/           # 1 carpeta por módulo
│   ├── src/components/      # layout, tabla genérica, notificaciones
│   ├── src/api/             # cliente axios + hooks
│   └── tests/               # Vitest + RTL, e2e/ (Playwright)
├── docker-compose.yml       # postgres + backend + frontend (nginx)
├── .github/workflows/ci.yml # lint → tests → build → e2e
└── README.md                # instrucciones de ejecución
```

## Fase 1 — Base de datos (Prisma + PostgreSQL)

Extiende el diseño SQL del documento (sección 9) con las entidades transaccionales que el doc dejó pendientes por alcance:

- **Seguridad/RBAC (RF-21):** `roles`, `permisos`, `rol_permiso`, `usuarios` (password hash bcrypt, multi-rol N:M), sesiones.
- **Maestros (RF-01/02/14):** `productos` (control_vencimiento, meses_garantia), `marcas`, `presentaciones`, `unidades_medida`, `conversiones_unidad`, `referencias_vendibles` (UNIQUE código de barras, unidad base, fracción mínima, precisión decimales), `terceros` (identificación UNIQUE, flags es_cliente/es_proveedor, tipo persona natural/jurídica).
- **Inventario (RF-03):** `inventario_saldos` con `cantidad_disponible`, `cantidad_reservada`, `cantidad_dañada`, todos `CHECK >= 0`.
- **Compras (RF-06/07):** `ordenes_compra` + `orden_detalle`, `documentos_ingreso` (consecutivo UNIQUE, estado BORRADOR/CERRADO/ANULADO, anulación lógica) + `ingreso_detalles` (soporta recepciones parciales acumuladas).
- **Ventas/Facturación (RF-08/17):** `ventas`, `venta_detalles`, `facturas` (consecutivo interno, tipo ELECTRÓNICA/INTERNA — DIAN como stub, impuestos, descuentos, notas de ajuste).
- **Operaciones (RF-04/05/10/11/12/13/18/19):** `reservas` + `reserva_detalles` (fecha límite, estados), `movimientos_inventario` tipificados (ENTRADA/SALIDA × COMPRA/VENTA/AJUSTE/DEVOLUCIÓN/DAÑO/VENCIMIENTO), `devoluciones_cliente`, `devoluciones_proveedor`, `bajas_vencimiento`, `garantias` (nace con la venta), `ajustes` (conteos físicos con justificación y aprobación).
- **Costos/Precios (RF-15/16):** costo promedio ponderado móvil en `referencias_vendibles` + `historial_costos`; `historial_precios` (precio anterior/nuevo, usuario, fecha, % incremento).
- **Cierres (RF-20):** `cierres_mensuales` (periodo, estado, usuario cierre/reapertura, motivo reapertura).
- **Auditoría (RF-22):** `auditoria_log` (tabla, registro, acción, usuario_id, IP, fecha, estado_anterior/nuevo JSONB) — solo INSERT, sin endpoints de modificación/eliminación.
- **Migración (RF-23):** `migraciones` (archivo, estado, errores por fila).
- Seed: roles/permisos (ADMIN, GERENCIA, RESPONSABLE_INVENTARIO, VENTAS, COMPRAS), usuario admin, unidades de medida base, parámetros de país (IVA 19%, redondeo COP).

## Fase 2 — Backend: núcleo transversal

- Express + helmet + CORS + rate-limit + validación con Zod.
- Autenticación JWT (login); middleware RBAC por permiso (matriz de permisos del RF-21); middleware de captura de IP.
- Servicio de auditoría transversal: toda acción crítica escribe en `auditoria_log` (usuario, IP, antes/después).
- Servicio de consecutivos atómico (DI-xxx, FV-xxx, RES-xxx, AJ-xxx) sin huecos.
- Manejo de errores estructurado + paginación estándar.

## Fase 3 — Backend: módulos de negocio (API REST /api)

| Módulo | Endpoints principales | Reglas clave (RF) |
|---|---|---|
| Auth/Usuarios | login, CRUD usuarios, asignación roles | JWT, bcrypt, menú según rol (RF-21) |
| Catálogo | CRUD productos/marcas/presentaciones/referencias, búsqueda por código de barras | código único global, conversión unidad base (RF-01, 02, 24) |
| Terceros | CRUD con validación identificación única, dual rol | natural/jurídica, cliente+proveedor (RF-14) |
| Compras | órdenes, ingresos con factura soporte obligatoria, recepciones parciales, anulación lógica | consecutivo, reversión bloquea si deja saldo negativo (RF-06, 07) |
| Inventario | consulta de saldos, clasificación dañados, ajustes/conteos con aprobación, baja por vencimiento | motor central: transacción + `SELECT FOR UPDATE` + CHECK ≥0 (RF-03, 04, 09, 12, 19) |
| Reservas | crear, liberar (manual/vencimiento), convertir a venta | no descuenta disponible dos veces (RF-05, 10) |
| Ventas | carrito → confirmación, descuento atómico, impuestos, descuentos, emisión factura interna | bloqueo optimista: primera confirmada gana (RF-08, 09, 17) |
| Devoluciones | cliente (reingreso disponible/dañado, ligada a factura) y proveedor (baja de dañados) | cantidades ≤ facturadas, autorización superior (RF-11, 18) |
| Costos/Precios | recálculo promedio ponderado móvil automático; precios con % incremento + historial | costo no editable manualmente (RF-15, 16) |
| Cierres | cerrar/reabrir periodo, bloqueo retroactivo de transacciones | solo GERENCIA (RF-20) |
| Garantías | consulta de vigencia por factura | estado Vigente/Expirada (RF-13) |
| Auditoría | consulta filtrada (fecha, usuario, tabla) | solo lectura gerencial (RF-22) |
| Migración | upload Excel (.xlsx), pre-validación en memoria, reporte de filas con error, rollback total si hay duplicados | sin duplicados (RF-23) |
| Integraciones | API key + endpoints REST de solo lectura (productos/facturas) | stub DIAN/externos (RF-25) |

## Fase 4 — Frontend (React + Ant Design)

- Login, layout con menú dinámico según permisos del rol.
- **Dashboard:** tarjetas de saldos, alertas (vencimientos próximos, reservas por vencer).
- **Catálogo:** tablas CRUD referencia producto-marca-presentación, parametrización de unidades/fracciones/vencimiento/garantía; campo de búsqueda con foco permanente para lector de códigos (modo teclado HID) (RF-24).
- **Punto de venta:** carrito con escaneo continuo, totales con impuestos/descuentos, confirmación que bloquea si otro usuario vendió el stock (mensaje claro RF-09), conversión de reserva a venta.
- **Compras:** órdenes, registro de ingresos con factura soporte, recepciones parciales, anulación con motivo.
- **Inventario:** consulta de saldos (total/disponible/reservado/dañado), clasificar dañados, ajustes/conteos con aprobación, devoluciones cliente/proveedor, bajas por vencimiento.
- **Terceros, Precios (con historial), Reservas, Cierres mensuales, Usuarios/Roles, Auditoría (filtro y tabla), Migración Excel (upload + reporte de errores).**
- Manejo de sesión (token), 401 → redirect login, ocultar costo promedio a rol VENTAS (RF-21).

## Fase 5 — Pruebas automatizadas

- **Unit (Vitest):** cálculo de costo promedio, redondeo/impuestos, validaciones Zod, consecutivos.
- **Integración (Supertest + PostgreSQL de prueba en Docker):** flujo completo por módulo + casos de aceptación del documento (ej.: código de barras duplicado rechazado, venta que dejaría saldo negativo rechazada, anulación de ingreso bloqueada si ya hubo venta, devolución mayor a facturado rechazada, periodo cerrado bloquea transacciones retroactivas).
- **Concurrencia (RF-09/RNF-03):** dos ventas simultáneas sobre la última unidad → exactamente una gana, sin saldos negativos.
- **Componentes (RTL):** formularios con validación, tabla de saldos, menú por rol.
- **E2E (Playwright):** login → crear referencia → compra → verificar stock → venta en POS → verificar descuento y factura → devolución → visible en auditoría.

## Fase 6 — Deployment

- `Dockerfile` multi-stage para backend y frontend (nginx sirve el build y proxea /api).
- `docker-compose.yml`: postgres + migración Prisma + backend + frontend; volúmenes persistentes; `.env.example`.
- `ci.yml` (GitHub Actions): jobs paralelos — lint+typecheck, test backend (con servicio postgres), test frontend, build; job E2E al final levantando el compose completo.

## Supuestos documentados (decisiones pendientes del documento)

1. **Costo:** promedio ponderado móvil (el criterio de aceptación del RF-15 lo ejemplifica), solo costo de adquisición (fletes/impuestos quedan como pendiente).
2. **Facturación:** consecutivo interno para todo; la tabla soporta tipo ELECTRÓNICA pero la transmisión DIAN queda stub.
3. **Rastreo:** sin tablas de lote/serie (pendiente en el doc); vencimientos y garantías se gestionan a nivel de referencia/venta.
4. **Offline:** solo borradores locales; toda transacción confirmada requiere conexión, según regla confirmada.

## Orden de ejecución

1. Scaffolding monorepo + Prisma schema + seed → 2. núcleo backend (auth/RBAC/auditoría/consecutivos) → 3. módulos de negocio backend → 4. frontend → 5. pruebas → 6. Docker + CI + README. Verificación final: `docker compose up` y flujo E2E verde end-to-end.