# Sistema de Inventario para Ferretería

Implementación completa (back-end, front-end, pruebas automatizadas y despliegue) del sistema de gestión de inventario documentado en [`Ferretería (1).md`](./Ferretería%20(1).md) — requerimientos RF-01 a RF-25 y RNF-01 a RNF-06.

## Stack

| Capa | Tecnología |
|---|---|
| Back-end | Node.js 20, Express, TypeScript, Prisma ORM |
| Base de datos | PostgreSQL 16 |
| Front-end | React 18, Vite, TypeScript, Ant Design |
| Pruebas | Vitest + Supertest (unit/integración), Testing Library (componentes), Playwright (E2E) |
| Despliegue | Docker Compose + GitHub Actions |

## Inicio rápido (Docker — producción)

Requisito: Docker Desktop.

```bash
docker compose up -d --build
```

Al terminar:

- **Aplicación web**: http://localhost:8080
- **API**: http://localhost:3001/api (salud: `/api/health`)

El backend aplica automáticamente las migraciones y siembra los datos iniciales (roles, permisos, unidades de medida, consecutivos) al arrancar.

### Usuarios iniciales (sembrados)

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `Admin123!` | Administrador (acceso total) |
| `gerencia` | `Gerencia123!` | Gerencia: cierres, auditoría, costos, aprobaciones |
| `bodega` | `Bodega123!` | Responsable de inventario: catálogo, precios, compras, dañados |
| `vendedor` | `Vendedor123!` | Ventas: facturación, reservas, devoluciones |
| `compras` | `Compras123!` | Compras |

> ⚠️ Cambie estas contraseñas antes de usar el sistema en producción.

## Desarrollo local (sin Docker)

1. **PostgreSQL** en el puerto 5433 (o ajuste `DATABASE_URL`):

   ```bash
   docker run -d --name ferreteria-db -e POSTGRES_USER=ferreteria \
     -e POSTGRES_PASSWORD=ferreteria123 -e POSTGRES_DB=ferreteria \
     -p 5433:5432 postgres:16-alpine
   ```

2. **Back-end**:

   ```bash
   cd backend
   cp .env.example .env        # ajuste credenciales si difieren
   npm install
   npx prisma migrate dev      # crea el esquema
   npx tsx prisma/seed.ts      # datos iniciales
   npm run dev                 # http://localhost:3001
   ```

3. **Front-end**:

   ```bash
   cd frontend
   npm install
   npm run dev                 # http://localhost:5173 (proxía /api al 3001)
   ```

## Pruebas automatizadas

### Back-end (unitarias + integración)

Requiere el contenedor de PostgreSQL anterior corriendo. Crea una base `ferreteria_test` dedicada:

```bash
cd backend
npm test          # 41 pruebas: criterios de aceptación de los RF
```

Cobertura destacada: código de barras único (RF-01), fracciones mínimas (RF-02), rechazo de saldos negativos (RF-03), clasificación de dañados (RF-04), reservas y conversión a venta (RF-05/10), ingresos con factura soporte y anulación lógica bloqueada (RF-06/07), cálculo de factura $100+19%=119 (RF-08/17), **concurrencia: dos ventas simultáneas sobre la última unidad gana exactamente una** (RF-09), promedio ponderado 10×10.000+10×20.000=15.000 (RF-15), devoluciones con aprobador distinto (RF-18), conteos físicos (RF-19), bloqueo de periodo cerrado (RF-20), RBAC (RF-21) y auditoría con IP (RF-22).

### Front-end (componentes)

```bash
cd frontend
npx vitest run    # menú dinámico por rol y lógica de sesión
```

### E2E (Playwright — flujo completo sobre la app real)

Con el stack levantado (`docker compose up` o servidores de desarrollo):

```bash
cd frontend
npx playwright install msedge chromium   # solo la primera vez
npx playwright test
# En CI (ubuntu): PLAYWRIGHT_CHANNEL=chromium npx playwright test
```

Escenario: login → escanear producto en POS → facturar → verificar saldo en inventario → verificar registro en auditoría; además el intento del vendedor de forzar acceso a /cierres.

## Estructura del proyecto

```
castro/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # 30+ tablas: RBAC, catálogo, inventario,
│   │   │                          # transacciones, auditoría, cierres...
│   │   ├── migrations/            # DDL + restricciones CHECK (saldos ≥ 0)
│   │   └── seed.ts                # roles, permisos, usuarios, unidades
│   ├── src/
│   │   ├── services/
│   │   │   ├── inventario.ts      # motor: SELECT FOR UPDATE + UPDATE condicional
│   │   │   ├── costos.ts          # promedio ponderado móvil (RF-15)
│   │   │   ├── consecutivos.ts    # DI-000001, FV-000001... atómicos sin huecos
│   │   │   ├── cierres.ts         # bloqueo de periodo contable (RF-20)
│   │   │   └── auditoria.ts       # bitácora inmutable JSONB (RF-22)
│   │   ├── modules/               # auth, usuarios, catálogo, terceros, compras,
│   │   │                          # ventas, reservas, inventario, precios,
│   │   │                          # cierres, garantías, auditoría, migración Excel,
│   │   │                          # integraciones (API keys), dashboard
│   │   └── middleware/            # JWT + RBAC por permiso, manejo de errores
│   └── tests/                     # unit + integración (Supertest)
├── frontend/
│   ├── src/pages/                 # 16 pantallas (POS, catálogo, inventario...)
│   ├── src/auth/                  # sesión JWT + matriz de permisos
│   ├── src/tests/                 # componentes (Vitest + RTL)
│   └── e2e/                       # Playwright
├── docker-compose.yml             # postgres + backend + frontend (nginx)
└── .github/workflows/ci.yml       # backend-tests, frontend-tests, e2e-docker
```

## Decisiones de diseño clave

- **Integridad del inventario (RF-03/09/RNF-03)** — triple barrera: `INSERT ... ON CONFLICT` asegura la fila de saldo; `SELECT ... FOR UPDATE` serializa las operaciones concurrentes sobre la misma referencia (la primera transacción confirmada gana); el `UPDATE` repite la condición `saldo >= cantidad` en el `WHERE`. Además, restricciones `CHECK (cantidad >= 0)` a nivel de base de datos como última defensa.
- **Anulación lógica, nunca borrado físico (RF-07)** — los documentos transaccionales cambian a estado `ANULADO` conservando consecutivo, usuario, fecha y motivo; la auditoría es solo INSERT (RNF-01).
- **Terceros unificados (RF-14)** — una tabla `terceros` con banderas `es_cliente`/`es_proveedor`; la identificación es única y si ya existe se sugiere editar el perfil en lugar de duplicarlo.
- **Costos (RF-15)** — promedio ponderado móvil automático al confirmar cada ingreso, con historial consultable solo por gerencia.
- **Supuestos documentados** (decisiones pendientes del cliente en el documento de requerimientos): costo sin fletes/impuestos (13.6); facturación con consecutivo interno y campos DIAN preparados pero sin transmisión (13.2); vencimiento y garantías a nivel de referencia, sin lote/serie (13.3/13.13); sin operación offline transaccional (13.1).

## CI/CD

El pipeline (`.github/workflows/ci.yml`) ejecuta en cada push:

1. **backend-tests**: typecheck + 41 pruebas contra PostgreSQL real (servicio efímero).
2. **frontend-tests**: typecheck + pruebas de componentes.
3. **e2e**: construye el stack con `docker compose`, espera la salud del API y corre Playwright contra la aplicación desplegada.

## Parámetros configurables

`parametros` (tabla) y variables de entorno:

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Cadena de conexión PostgreSQL |
| `JWT_SECRET` | Secreto de firma de tokens (obligatorio cambiarlo en producción) |
| `JWT_EXPIRES_IN` | Vigencia de la sesión (por defecto `8h`) |
| `DB_PASSWORD` / `JWT_SECRET` (compose) | Secretos del despliegue Docker |

Parámetros de negocio sembrados: país `CO`, moneda `COP`, IVA por defecto `19%`, días de alerta de vencimiento `30`.
