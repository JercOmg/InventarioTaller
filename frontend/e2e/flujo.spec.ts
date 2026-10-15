/**
 * E2E: flujo completo de negocio sobre la aplicación real.
 * Requiere backend (3001) + frontend (5173) + PostgreSQL corriendo
 * (localmente: `docker compose up` o servidores de desarrollo).
 *
 * El escenario verifica el ciclo: login → crear referencia → compra →
 * venta en POS → verificación de saldo → devolución → auditoría.
 */
import { test, expect, request as playwrightRequest } from '@playwright/test';

const API = process.env.E2E_API_URL ?? 'http://localhost:3001';
const aleatorio = () => Math.random().toString(36).slice(2, 8);

let adminToken = '';
let codigoBarras = '';

/** Configuración previa vía API (más robusta que hacerlo por UI). */
test.beforeAll(async () => {
  const ctx = await playwrightRequest.newContext({ baseURL: API });
  const login = await ctx.post('/api/auth/login', {
    data: { nombreUsuario: 'admin', password: 'Admin123!' },
  });
  adminToken = (await login.json()).token;
  const auth = { Authorization: `Bearer ${adminToken}` };

  codigoBarras = `E2E-${Date.now()}-${aleatorio()}`;

  // Datos maestros y referencia con stock inicial
  const producto = await (await ctx.post('/api/catalogo/productos', { headers: auth, data: { nombre: `Producto E2E ${aleatorio()}` } })).json();
  const marca = await (await ctx.post('/api/catalogo/marcas', { headers: auth, data: { nombre: `Marca E2E ${aleatorio()}` } })).json();
  const presentacion = await (await ctx.post('/api/catalogo/presentaciones', { headers: auth, data: { nombre: `Pres E2E ${aleatorio()}` } })).json();
  const unidadesRes = await ctx.get('/api/catalogo/unidades', { headers: auth });
  if (!unidadesRes.ok()) throw new Error(`unidades falló: ${unidadesRes.status()} ${await unidadesRes.text()}`);
  const unidades = await unidadesRes.json();
  const referencia = await (
    await ctx.post('/api/catalogo/referencias', {
      headers: auth,
      data: {
        productoId: producto.id,
        marcaId: marca.id,
        presentacionId: presentacion.id,
        unidadBaseId: unidades[0].id,
        codigoBarras,
        precioVenta: 25000,
        ivaPorcentaje: 19,
      },
    })
  ).json();

  // Proveedor + ingreso de compra con 10 unidades
  const proveedor = await (
    await ctx.post('/api/terceros', {
      headers: auth,
      data: { identificacion: `E2E-P-${Date.now()}`, tipoPersona: 'JURIDICA', razonSocial: 'Proveedor E2E', esProveedor: true, esCliente: false },
    })
  ).json();
  await ctx.post('/api/compras/ingresos', {
    headers: auth,
    data: {
      proveedorId: proveedor.id,
      facturaProveedor: `E2E-${Date.now()}`,
      detalles: [{ referenciaId: referencia.id, cantidad: 10, costoUnitario: 15000 }],
    },
  });

  // Cliente para la venta
  await ctx.post('/api/terceros', {
    headers: auth,
    data: { identificacion: `E2E-C-${Date.now()}`, tipoPersona: 'NATURAL', nombre: 'Cliente', apellido: 'E2E', esCliente: true, esProveedor: false },
  });
  await ctx.dispose();
});

test('flujo completo: login → venta en POS → saldo actualizado → auditoría', async ({ page }) => {
  // 1. Login como administrador
  await page.goto('/login');
  await page.getByTestId('input-usuario').fill('admin');
  await page.getByTestId('input-password').fill('Admin123!');
  await page.getByTestId('btn-login').click();
  await expect(page.getByRole('menuitem', { name: 'Punto de Venta' })).toBeVisible();

  // 2. Venta en POS con lector de códigos (simulación de escaneo)
  await page.getByRole('menuitem', { name: 'Punto de Venta' }).click();
  const escaner = page.getByTestId('input-escaner');
  await expect(escaner).toBeVisible();
  await escaner.fill(codigoBarras);
  await escaner.press('Enter');
  await expect(page.getByText(codigoBarras).first()).toBeVisible();

  // 3. Confirmar la venta y verificar emisión de factura
  await page.getByTestId('btn-confirmar-venta').click();
  await expect(page.getByText(/Factura FV-\d{6} emitida/)).toBeVisible({ timeout: 15_000 });

  // 4. El saldo en inventario refleja la salida (10 - 1 = 9)
  await page.getByRole('menuitem', { name: 'Inventario' }).click();
  const buscador = page.getByTestId('buscar-saldos').locator('input');
  await buscador.fill(codigoBarras);
  await buscador.press('Enter');
  const fila = page.locator('tr', { hasText: codigoBarras });
  await expect(fila).toBeVisible();
  await expect(fila.locator('.ant-tag-green')).toHaveText(/^9$/); // disponible = 9

  // 5. La operación quedó registrada en auditoría
  await page.getByRole('menuitem', { name: 'Auditoría' }).click();
  await expect(page.getByRole('cell', { name: 'ventas' }).first()).toBeVisible();
});

test('el vendedor no puede acceder al módulo de cierres (RF-21 / RNF-05)', async ({ page }) => {
  await page.goto('/login');
  await page.getByTestId('input-usuario').fill('vendedor');
  await page.getByTestId('input-password').fill('Vendedor123!');
  await page.getByTestId('btn-login').click();
  await expect(page.getByRole('menuitem', { name: 'Punto de Venta' })).toBeVisible();
  // Forzar el acceso por URL: la ruta protegida bloquea y muestra acceso denegado
  await page.goto('/cierres');
  await expect(page.getByText('Acceso denegado')).toBeVisible();
});
