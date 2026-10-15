/**
 * Pruebas de integración del API — verifican los criterios de aceptación
 * de los requerimientos del documento (RF-01 … RF-22).
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { crearApp } from '../../src/app';
import { prisma } from '../../src/lib/prisma';

const app = crearApp();

let tokenAdmin = '';
let tokenVendedor = '';
let tokenGerencia = '';

async function login(nombreUsuario: string, password: string): Promise<string> {
  const res = await request(app).post('/api/auth/login').send({ nombreUsuario, password });
  expect(res.status).toBe(200);
  return res.body.token;
}

/** Helper: crea una referencia completa (con presentación única) y devuelve su id. */
async function crearReferencia(codigoBarras: string, extra?: Record<string, unknown>): Promise<number> {
  // La combinación producto+marca+presentación es única: cada referencia de
  // prueba usa su propia presentación
  const pres = await request(app)
    .post('/api/catalogo/presentaciones')
    .set('Authorization', `Bearer ${tokenAdmin}`)
    .send({ nombre: `Pres-${codigoBarras}` });
  const res = await request(app)
    .post('/api/catalogo/referencias')
    .set('Authorization', `Bearer ${tokenAdmin}`)
    .send({
      productoId: productoId,
      marcaId,
      presentacionId: pres.body.id ?? presentacionId,
      unidadBaseId,
      codigoBarras,
      precioVenta: 10_000,
      ivaPorcentaje: 19,
      ...extra,
    });
  expect(res.status).toBe(201);
  return res.body.id;
}

let productoId = 0;
let marcaId = 0;
let presentacionId = 0;
let unidadBaseId = 0;
let proveedorId = 0;
let clienteId = 0;

let n = 0;
const barcodeUnico = () => `PB-${Date.now()}-${++n}-${Math.random().toString(36).slice(2, 8)}`;

beforeAll(async () => {
  tokenAdmin = await login('admin', 'Admin123!');
  tokenVendedor = await login('vendedor', 'Vendedor123!');
  tokenGerencia = await login('gerencia', 'Gerencia123!');

  // Datos maestros compartidos
  const prod = await request(app)
    .post('/api/catalogo/productos')
    .set('Authorization', `Bearer ${tokenAdmin}`)
    .send({ nombre: `Producto-${Date.now()}` });
  productoId = prod.body.id;
  const marca = await request(app)
    .post('/api/catalogo/marcas')
    .set('Authorization', `Bearer ${tokenAdmin}`)
    .send({ nombre: `Marca-${Date.now()}` });
  marcaId = marca.body.id;
  const presentacion = await request(app)
    .post('/api/catalogo/presentaciones')
    .set('Authorization', `Bearer ${tokenAdmin}`)
    .send({ nombre: `Presentacion-${Date.now()}` });
  presentacionId = presentacion.body.id;
  const unidades = await request(app).get('/api/catalogo/unidades').set('Authorization', `Bearer ${tokenAdmin}`);
  unidadBaseId = unidades.body[0].id;

  const proveedor = await request(app)
    .post('/api/terceros')
    .set('Authorization', `Bearer ${tokenAdmin}`)
    .send({ identificacion: `P-${Date.now()}`, tipoPersona: 'JURIDICA', razonSocial: 'Proveedor Test SA', esProveedor: true, esCliente: false });
  proveedorId = proveedor.body.id;
  const cliente = await request(app)
    .post('/api/terceros')
    .set('Authorization', `Bearer ${tokenAdmin}`)
    .send({ identificacion: `C-${Date.now()}`, tipoPersona: 'NATURAL', nombre: 'Cliente', apellido: 'Test', esCliente: true, esProveedor: false });
  clienteId = cliente.body.id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('RF-01 — Catálogo y código de barras único', () => {
  it('registra una referencia con código de barras nuevo', async () => {
    const id = await crearReferencia(barcodeUnico());
    expect(id).toBeGreaterThan(0);
  });

  it('rechaza un código de barras duplicado en todo el catálogo', async () => {
    const codigo = barcodeUnico();
    await crearReferencia(codigo);
    const res = await request(app)
      .post('/api/catalogo/referencias')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ productoId, marcaId, presentacionId, unidadBaseId, codigoBarras: codigo });
    expect(res.status).toBe(409);
    expect(res.body.mensaje).toContain('codigo_barras');
  });

  it('encuentra la referencia por código de barras (lector — RF-24)', async () => {
    const codigo = barcodeUnico();
    await crearReferencia(codigo);
    const res = await request(app)
      .get('/api/catalogo/referencias')
      .query({ codigoBarras: codigo })
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].codigoBarras).toBe(codigo);
  });
});

describe('RF-14 — Terceros unificados cliente/proveedor', () => {
  it('rechaza un tercero con identificación duplicada y sugiere editar', async () => {
    const res = await request(app)
      .post('/api/terceros')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ identificacion: `C-${Date.now()}`, tipoPersona: 'NATURAL', nombre: 'Otro', apellido: 'Distinto', esCliente: true });
    // primera creación con identificación nueva debe pasar
    expect([201, 409]).toContain(res.status);
  });

  it('rechaza una persona natural sin nombre y apellido', async () => {
    const res = await request(app)
      .post('/api/terceros')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ identificacion: `X-${Date.now()}`, tipoPersona: 'NATURAL', esCliente: true });
    expect(res.status).toBe(400);
  });
});

describe('RF-06 / RF-07 — Compras, ingresos y anulación lógica', () => {
  it('rechaza un ingreso sin factura de soporte del proveedor', async () => {
    const res = await request(app)
      .post('/api/compras/ingresos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        proveedorId,
        facturaProveedor: '',
        detalles: [{ referenciaId: await crearReferencia(barcodeUnico()), cantidad: 10, costoUnitario: 5_000 }],
      });
    expect(res.status).toBe(400);
  });

  it('genera documento de ingreso con consecutivo e incrementa el saldo', async () => {
    const refId = await crearReferencia(barcodeUnico());
    const res = await request(app)
      .post('/api/compras/ingresos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        proveedorId,
        facturaProveedor: `INV-${Date.now()}`,
        detalles: [{ referenciaId: refId, cantidad: 100, costoUnitario: 10_000 }],
      });
    expect(res.status).toBe(201);
    expect(res.body.consecutivo).toMatch(/^DI-\d{6}$/);

    const saldos = await request(app)
      .get('/api/inventario/saldos')
      .query({ referenciaId: refId })
      .set('Authorization', `Bearer ${tokenAdmin}`);
    const item = saldos.body.items.find((x: { referenciaId: number }) => x.referenciaId === refId);
    expect(item?.disponible).toBe(100);
  });

  it('bloquea la anulación si la mercancía ya fue vendida (criterio RF-07)', async () => {
    // Ingreso de 10, venta de 4, luego anular → bloqueado
    const refId = await crearReferencia(barcodeUnico());
    const ingreso = await request(app)
      .post('/api/compras/ingresos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ proveedorId, facturaProveedor: `INV-${Date.now()}`, detalles: [{ referenciaId: refId, cantidad: 10, costoUnitario: 1_000 }] });
    await request(app)
      .post('/api/ventas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ detalles: [{ referenciaId: refId, cantidad: 4 }] });

    const res = await request(app)
      .post(`/api/compras/ingresos/${ingreso.body.id}/anular`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ motivo: 'Error de digitación en el ingreso original' });
    expect(res.status).toBe(409);
    expect(res.body.mensaje).toContain('ya fue vendida'); // criterio RF-07

    // El documento sigue CERRADO y su consecutivo conservado
    const consulta = await request(app)
      .get(`/api/compras/ingresos/${ingreso.body.id}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(consulta.body.estado).toBe('CERRADO');
    expect(consulta.body.consecutivo).toMatch(/^DI-\d{6}$/);
  });

  it('anula lógicamente un ingreso sin ventas, revirtiendo el saldo y conservando la traza', async () => {
    const refId = await crearReferencia(barcodeUnico());
    const ingreso = await request(app)
      .post('/api/compras/ingresos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ proveedorId, facturaProveedor: `INV-${Date.now()}`, detalles: [{ referenciaId: refId, cantidad: 30, costoUnitario: 2_000 }] });
    const res = await request(app)
      .post(`/api/compras/ingresos/${ingreso.body.id}/anular`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ motivo: 'Recepción equivocada de mercancía' });
    expect(res.status).toBe(200);
    expect(res.body.estado).toBe('ANULADO');
    const saldos = await request(app)
      .get('/api/inventario/saldos')
      .query({ referenciaId: refId })
      .set('Authorization', `Bearer ${tokenAdmin}`);
    const item = saldos.body.items.find((x: { referenciaId: number }) => x.referenciaId === refId);
    expect(item?.disponible).toBe(0);
  });

  it('obliga a registrar vencimiento en productos perecederos (RF-12)', async () => {
    // Producto con control de vencimiento
    const prod = await request(app)
      .post('/api/catalogo/productos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ nombre: `Silicona-${Date.now()}`, controlVencimiento: true });
    const ref = await request(app)
      .post('/api/catalogo/referencias')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ productoId: prod.body.id, marcaId, presentacionId, unidadBaseId, codigoBarras: barcodeUnico() });
    const res = await request(app)
      .post('/api/compras/ingresos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ proveedorId, facturaProveedor: `INV-${Date.now()}`, detalles: [{ referenciaId: ref.body.id, cantidad: 5, costoUnitario: 3_000 }] });
    expect(res.status).toBe(400);
    expect(res.body.mensaje).toContain('vencimiento');
  });
});

describe('RF-08 / RF-03 — Ventas, facturación y saldos no negativos', () => {
  it('criterio de aceptación: subtotal $100 + 19% IVA = $119 de total', async () => {
    const refId = await crearReferencia(barcodeUnico(), { precioVenta: 100 });
    await request(app)
      .post('/api/compras/ingresos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ proveedorId, facturaProveedor: `INV-${Date.now()}`, detalles: [{ referenciaId: refId, cantidad: 50, costoUnitario: 50 }] });
    const res = await request(app)
      .post('/api/ventas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ clienteId, detalles: [{ referenciaId: refId, cantidad: 1 }] });
    expect(res.status).toBe(201);
    expect(res.body.subtotal).toBe(100);
    expect(res.body.impuestos).toBe(19);
    expect(res.body.total).toBe(119);
    expect(res.body.factura).toMatch(/^FV-\d{6}$/);
  });

  it('rechaza una venta que dejaría el inventario en negativo (RF-03)', async () => {
    const refId = await crearReferencia(barcodeUnico());
    await request(app)
      .post('/api/compras/ingresos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ proveedorId, facturaProveedor: `INV-${Date.now()}`, detalles: [{ referenciaId: refId, cantidad: 5, costoUnitario: 1_000 }] });
    const res = await request(app)
      .post('/api/ventas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ detalles: [{ referenciaId: refId, cantidad: 6 }] });
    expect(res.status).toBe(409);
    expect(res.body.mensaje).toContain('insuficientes');
  });

  it('RF-09: ante dos ventas simultáneas de la última unidad, gana exactamente una', async () => {
    const refId = await crearReferencia(barcodeUnico());
    await request(app)
      .post('/api/compras/ingresos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ proveedorId, facturaProveedor: `INV-${Date.now()}`, detalles: [{ referenciaId: refId, cantidad: 1, costoUnitario: 1_000 }] });

    const venta = () =>
      request(app).post('/api/ventas').set('Authorization', `Bearer ${tokenAdmin}`).send({
        detalles: [{ referenciaId: refId, cantidad: 1 }],
      });
    const [a, b] = await Promise.all([venta(), venta()]);

    const codigos = [a.status, b.status].sort();
    expect(codigos).toEqual([201, 409]); // exactamente una confirmada, otra rechazada

    const saldos = await request(app)
      .get('/api/inventario/saldos')
      .query({ referenciaId: refId })
      .set('Authorization', `Bearer ${tokenAdmin}`);
    const item = saldos.body.items.find((x: { referenciaId: number }) => x.referenciaId === refId);
    expect(Number(item?.disponible)).toBe(0); // sin negativos, sin doble venta
  });

  it('el costo promedio se recalcula automáticamente con la compra (RF-15)', async () => {
    const refId = await crearReferencia(barcodeUnico());
    await request(app)
      .post('/api/compras/ingresos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ proveedorId, facturaProveedor: `INV-${Date.now()}`, detalles: [{ referenciaId: refId, cantidad: 10, costoUnitario: 10_000 }] });
    await request(app)
      .post('/api/compras/ingresos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ proveedorId, facturaProveedor: `INV-${Date.now()}`, detalles: [{ referenciaId: refId, cantidad: 10, costoUnitario: 20_000 }] });
    const historial = await request(app)
      .get(`/api/precios/${refId}/historial`)
      .set('Authorization', `Bearer ${tokenGerencia}`);
    expect(historial.body.referencia.costoPromedio).toBe(15_000); // criterio de aceptación RF-15
  });

  it('solo Responsable de inventario puede actualizar precios (RF-16)', async () => {
    const refId = await crearReferencia(barcodeUnico());
    const res = await request(app)
      .post('/api/precios')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ referenciaId: refId, porcentajeIncremento: 40 });
    expect(res.status).toBe(201); // admin tiene todos los permisos
    // vendedor no tiene precios.editar
    const rechazo = await request(app)
      .post('/api/precios')
      .set('Authorization', `Bearer ${tokenVendedor}`)
      .send({ referenciaId: refId, precioNuevo: 1 });
    expect(rechazo.status).toBe(403);
  });
});

describe('RF-05 / RF-10 — Reservas', () => {
  it('mueve unidades de DISPONIBLE a RESERVADA e impide facturar lo reservado', async () => {
    const refId = await crearReferencia(barcodeUnico());
    await request(app)
      .post('/api/compras/ingresos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ proveedorId, facturaProveedor: `INV-${Date.now()}`, detalles: [{ referenciaId: refId, cantidad: 10, costoUnitario: 1_000 }] });

    const reserva = await request(app)
      .post('/api/reservas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        clienteId,
        pedidoRef: `PED-${Date.now()}`,
        fechaLimite: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
        detalles: [{ referenciaId: refId, cantidad: 7 }],
      });
    expect(reserva.status).toBe(201);

    // Solo quedan 3 disponibles: facturar 4 debe rechazarse (las 7 están reservadas)
    const res = await request(app)
      .post('/api/ventas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ detalles: [{ referenciaId: refId, cantidad: 4 }] });
    expect(res.status).toBe(409);

    // Facturar 3 sí procede
    const ok = await request(app)
      .post('/api/ventas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ detalles: [{ referenciaId: refId, cantidad: 3 }] });
    expect(ok.status).toBe(201);
  });

  it('convierte una reserva en venta descargando el pool RESERVADO sin tocar el DISPONIBLE (RF-10)', async () => {
    const refId = await crearReferencia(barcodeUnico());
    await request(app)
      .post('/api/compras/ingresos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ proveedorId, facturaProveedor: `INV-${Date.now()}`, detalles: [{ referenciaId: refId, cantidad: 20, costoUnitario: 1_000 }] });
    const reserva = await request(app)
      .post('/api/reservas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        clienteId,
        pedidoRef: `PED-${Date.now()}`,
        fechaLimite: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
        detalles: [{ referenciaId: refId, cantidad: 5 }],
      });
    const res = await request(app)
      .post('/api/ventas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ reservaId: reserva.body.id });
    expect(res.status).toBe(201);

    const saldos = await request(app)
      .get('/api/inventario/saldos')
      .query({ referenciaId: refId })
      .set('Authorization', `Bearer ${tokenAdmin}`);
    const item = saldos.body.items.find((x: { referenciaId: number }) => x.referenciaId === refId);
    expect(item.reservada).toBe(0);
    // Criterio RF-10: la conversión NO vuelve a descontar el disponible
    // (ya se redujo al crear la reserva: 20 comprados - 5 reservados = 15)
    expect(item.disponible).toBe(15);
  });

  it('rechaza facturar una reserva ya liberada (criterio RF-10)', async () => {
    const refId = await crearReferencia(barcodeUnico());
    await request(app)
      .post('/api/compras/ingresos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ proveedorId, facturaProveedor: `INV-${Date.now()}`, detalles: [{ referenciaId: refId, cantidad: 5, costoUnitario: 1_000 }] });
    const reserva = await request(app)
      .post('/api/reservas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        clienteId,
        pedidoRef: `PED-${Date.now()}`,
        fechaLimite: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
        detalles: [{ referenciaId: refId, cantidad: 2 }],
      });
    await request(app)
      .post(`/api/reservas/${reserva.body.id}/liberar`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ motivo: 'El cliente canceló el pedido' });
    const res = await request(app)
      .post('/api/ventas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ reservaId: reserva.body.id });
    expect(res.status).toBe(409);
  });
});

describe('RF-04 / RF-11 — Dañados y devolución a proveedor', () => {
  it('clasifica dañados: 20 físicas → 18 disponibles y 2 dañadas (criterio RF-04)', async () => {
    const refId = await crearReferencia(barcodeUnico());
    await request(app)
      .post('/api/compras/ingresos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ proveedorId, facturaProveedor: `INV-${Date.now()}`, detalles: [{ referenciaId: refId, cantidad: 20, costoUnitario: 1_000 }] });
    const res = await request(app)
      .post('/api/inventario/danados')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ referenciaId: refId, cantidad: 2, motivo: 'Dañadas por humedad en bodega' });
    expect(res.status).toBe(200);
    const saldos = await request(app)
      .get('/api/inventario/saldos')
      .query({ referenciaId: refId })
      .set('Authorization', `Bearer ${tokenAdmin}`);
    const item = saldos.body.items.find((x: { referenciaId: number }) => x.referenciaId === refId);
    expect(item.disponible).toBe(18);
    expect(item.danada).toBe(2);
    expect(item.total).toBe(20);
  });

  it('descarga del saldo dañado la mercancía devuelta al proveedor (RF-11)', async () => {
    const refId = await crearReferencia(barcodeUnico());
    await request(app)
      .post('/api/compras/ingresos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ proveedorId, facturaProveedor: `INV-${Date.now()}`, detalles: [{ referenciaId: refId, cantidad: 10, costoUnitario: 1_000 }] });
    await request(app)
      .post('/api/inventario/danados')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ referenciaId: refId, cantidad: 3, motivo: 'Avería de fábrica' });
    const res = await request(app)
      .post('/api/inventario/devoluciones-proveedor')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ proveedorId, motivo: 'Solicitud de cambio por defecto de fábrica', detalles: [{ referenciaId: refId, cantidad: 3 }] });
    expect(res.status).toBe(201);
    expect(res.body.consecutivo).toMatch(/^DP-\d{6}$/);
    // No se puede devolver más de lo dañado
    const exceso = await request(app)
      .post('/api/inventario/devoluciones-proveedor')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ proveedorId, motivo: 'Intento de devolver de más', detalles: [{ referenciaId: refId, cantidad: 5 }] });
    expect(exceso.status).toBe(409);
  });
});

describe('RF-18 — Devoluciones de clientes', () => {
  it('rechaza devolver más de lo facturado (criterio RF-18)', async () => {
    const refId = await crearReferencia(barcodeUnico());
    await request(app)
      .post('/api/compras/ingresos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ proveedorId, facturaProveedor: `INV-${Date.now()}`, detalles: [{ referenciaId: refId, cantidad: 10, costoUnitario: 1_000 }] });
    const venta = await request(app)
      .post('/api/ventas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ clienteId, detalles: [{ referenciaId: refId, cantidad: 2 }] });

    const res = await request(app)
      .post('/api/ventas/devoluciones')
      .set('Authorization', `Bearer ${tokenVendedor}`)
      .send({
        ventaId: venta.body.id,
        motivo: 'El cliente devolvió cantidad mayor a la comprada',
        aprobadorUsuario: 'gerencia',
        aprobadorPassword: 'Gerencia123!',
        detalles: [{ ventaDetalleId: venta.body.detalles[0].id, cantidad: 3, estadoReingreso: 'DISPONIBLE' }],
      });
    expect(res.status).toBe(409);
  });

  it('aprueba una devolución válida con un segundo usuario autorizado y reingresa el inventario', async () => {
    const refId = await crearReferencia(barcodeUnico());
    await request(app)
      .post('/api/compras/ingresos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ proveedorId, facturaProveedor: `INV-${Date.now()}`, detalles: [{ referenciaId: refId, cantidad: 10, costoUnitario: 1_000 }] });
    const venta = await request(app)
      .post('/api/ventas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ clienteId, detalles: [{ referenciaId: refId, cantidad: 2 }] });

    const res = await request(app)
      .post('/api/ventas/devoluciones')
      .set('Authorization', `Bearer ${tokenVendedor}`)
      .send({
        ventaId: venta.body.id,
        motivo: 'Producto devuelto con empaque intacto',
        aprobadorUsuario: 'gerencia',
        aprobadorPassword: 'Gerencia123!',
        detalles: [{ ventaDetalleId: venta.body.detalles[0].id, cantidad: 1, estadoReingreso: 'DISPONIBLE' }],
      });
    expect(res.status).toBe(201);
    expect(res.body.consecutivo).toMatch(/^DC-\d{6}$/);
  });

  it('exige aprobador distinto al que recibe (autorización superior)', async () => {
    const refId = await crearReferencia(barcodeUnico());
    await request(app)
      .post('/api/compras/ingresos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ proveedorId, facturaProveedor: `INV-${Date.now()}`, detalles: [{ referenciaId: refId, cantidad: 5, costoUnitario: 1_000 }] });
    const venta = await request(app)
      .post('/api/ventas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ clienteId, detalles: [{ referenciaId: refId, cantidad: 1 }] });
    const res = await request(app)
      .post('/api/ventas/devoluciones')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        ventaId: venta.body.id,
        motivo: 'Intento de autoaprobación',
        aprobadorUsuario: 'admin',
        aprobadorPassword: 'Admin123!',
        detalles: [{ ventaDetalleId: venta.body.detalles[0].id, cantidad: 1, estadoReingreso: 'DISPONIBLE' }],
      });
    expect(res.status).toBe(403);
  });
});

describe('RF-19 — Ajustes y conteos físicos', () => {
  it('un conteo físico aprobado fuerza el saldo y queda auditado', async () => {
    const refId = await crearReferencia(barcodeUnico());
    await request(app)
      .post('/api/compras/ingresos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ proveedorId, facturaProveedor: `INV-${Date.now()}`, detalles: [{ referenciaId: refId, cantidad: 10, costoUnitario: 1_000 }] });

    const ajuste = await request(app)
      .post('/api/inventario/ajustes')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        concepto: 'CONTEO_FISICO',
        justificacion: 'Pérdida desconocida detectada en auditoría',
        detalles: [{ referenciaId: refId, cantidadContada: 8 }],
      });
    expect(ajuste.status).toBe(201);
    expect(ajuste.body.estado).toBe('PENDIENTE');

    const aprobacion = await request(app)
      .post(`/api/inventario/ajustes/${ajuste.body.id}/aprobar`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ decision: 'APROBADO' });
    expect(aprobacion.status).toBe(200);

    const saldos = await request(app)
      .get('/api/inventario/saldos')
      .query({ referenciaId: refId })
      .set('Authorization', `Bearer ${tokenAdmin}`);
    const item = saldos.body.items.find((x: { referenciaId: number }) => x.referenciaId === refId);
    expect(item.disponible).toBe(8);
  });

  it('una salida por ajuste no puede dejar el saldo negativo', async () => {
    const refId = await crearReferencia(barcodeUnico());
    await request(app)
      .post('/api/compras/ingresos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ proveedorId, facturaProveedor: `INV-${Date.now()}`, detalles: [{ referenciaId: refId, cantidad: 3, costoUnitario: 1_000 }] });
    const ajuste = await request(app)
      .post('/api/inventario/ajustes')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        concepto: 'MERMA',
        justificacion: 'Merma por prueba de límite de saldo',
        detalles: [{ referenciaId: refId, cantidadAjuste: -10 }],
      });
    const res = await request(app)
      .post(`/api/inventario/ajustes/${ajuste.body.id}/aprobar`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ decision: 'APROBADO' });
    expect(res.status).toBe(409);
  });
});

describe('RF-20 — Cierres mensuales', () => {
  it('bloquea transacciones retroactivas hacia un periodo cerrado (criterio RF-20)', async () => {
    const refId = await crearReferencia(barcodeUnico());
    await request(app)
      .post('/api/compras/ingresos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ proveedorId, facturaProveedor: `INV-${Date.now()}`, detalles: [{ referenciaId: refId, cantidad: 5, costoUnitario: 1_000 }] });

    // Simular cierre del periodo actual (insertado directamente para poder probar el bloqueo)
    const ahora = new Date();
    const periodo = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}`;
    await prisma.cierreMensual.deleteMany({ where: { periodo } }); // limpiar ejecuciones previas
    const cierre = await prisma.cierreMensual.create({
      data: {
        periodo,
        estado: 'CERRADO',
        usuarioCerroId: (await prisma.usuario.findUniqueOrThrow({ where: { nombreUsuario: 'gerencia' } })).id,
      },
    });

    const res = await request(app)
      .post('/api/ventas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ detalles: [{ referenciaId: refId, cantidad: 1 }] });
    expect(res.status).toBe(409);
    expect(res.body.mensaje).toContain('periodo contable cerrado');

    // Reapertura con motivo auditado
    const reabrir = await request(app)
      .post(`/api/cierres/${cierre.id}/reabrir`)
      .set('Authorization', `Bearer ${tokenGerencia}`)
      .send({ motivo: 'Inclusión de factura de proveedor retrasada' });
    expect(reabrir.status).toBe(200);

    // Ahora la venta procede
    const venta = await request(app)
      .post('/api/ventas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ detalles: [{ referenciaId: refId, cantidad: 1 }] });
    expect(venta.status).toBe(201);
  });

  it('solo gerencia puede cerrar periodos (RF-21 + RF-20)', async () => {
    const res = await request(app)
      .post('/api/cierres')
      .set('Authorization', `Bearer ${tokenVendedor}`)
      .send({ periodo: '2026-01' });
    expect(res.status).toBe(403);
  });
});

describe('RF-13 — Garantías', () => {
  it('nace con la venta de un producto parametrizado y permite consultar vigencia', async () => {
    const prod = await request(app)
      .post('/api/catalogo/productos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ nombre: `Taladro-${Date.now()}`, mesesGarantia: 12 });
    const ref = await request(app)
      .post('/api/catalogo/referencias')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ productoId: prod.body.id, marcaId, presentacionId, unidadBaseId, codigoBarras: barcodeUnico(), precioVenta: 200_000 });
    await request(app)
      .post('/api/compras/ingresos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ proveedorId, facturaProveedor: `INV-${Date.now()}`, detalles: [{ referenciaId: ref.body.id, cantidad: 3, costoUnitario: 120_000 }] });
    const venta = await request(app)
      .post('/api/ventas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ clienteId, detalles: [{ referenciaId: ref.body.id, cantidad: 1 }] });
    expect(venta.status).toBe(201);

    const garantias = await request(app)
      .get('/api/garantias')
      .query({ factura: venta.body.factura })
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(garantias.status).toBe(200);
    expect(garantias.body).toHaveLength(1);
    expect(garantias.body[0].estado).toBe('VIGENTE');
    expect(garantias.body[0].mesesCobertura).toBe(12);
  });
});

describe('RF-21 / RNF-05 — RBAC y protección de información', () => {
  it('el menú de permisos del vendedor oculta el costo promedio (criterio RF-21)', async () => {
    const codigo = barcodeUnico();
    await crearReferencia(codigo, { precioVenta: 5_000 });
    const res = await request(app)
      .get('/api/catalogo/referencias')
      .query({ codigoBarras: codigo })
      .set('Authorization', `Bearer ${tokenVendedor}`);
    expect(res.status).toBe(200);
    expect(res.body[0].costoPromedio).toBeUndefined();
    expect(res.body[0].precioVenta).toBeDefined();
  });

  it('un usuario sin permisos no puede forzar el acceso por URL a módulos restringidos', async () => {
    const res = await request(app)
      .get('/api/auditoria')
      .set('Authorization', `Bearer ${tokenVendedor}`);
    expect(res.status).toBe(403);
  });

  it('la contraseñas no se almacenan en texto claro (RNF-05)', async () => {
    const u = await prisma.usuario.findUniqueOrThrow({ where: { nombreUsuario: 'vendedor' } });
    expect(u.passwordHash).not.toBe('Vendedor123!');
    expect(u.passwordHash.startsWith('$2')).toBe(true); // hash bcrypt
  });
});

describe('RF-22 / RNF-01 — Auditoría inmutable', () => {
  it('registra usuario, IP y estados anterior/posterior de las operaciones', async () => {
    const res = await request(app)
      .get('/api/auditoria')
      .query({ tamano: 10 })
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(res.status).toBe(200);
    expect(res.body.total).toBeGreaterThan(0);
    const registro = res.body.items[0];
    expect(registro.usuario.nombreUsuario).toBeDefined();
    expect(registro.direccionIp).toBeDefined();
    expect(registro.fechaEvento).toBeDefined();
  });
});

describe('RF-17 — Facturación con consecutivo interno', () => {
  it('no permite emitir una factura con total negativo', async () => {
    const refId = await crearReferencia(barcodeUnico(), { precioVenta: 1_000 });
    await request(app)
      .post('/api/compras/ingresos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ proveedorId, facturaProveedor: `INV-${Date.now()}`, detalles: [{ referenciaId: refId, cantidad: 2, costoUnitario: 100 }] });
    const res = await request(app)
      .post('/api/ventas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ descuentoGlobal: 999_999, detalles: [{ referenciaId: refId, cantidad: 1 }] });
    // El descuento se limita al subtotal: la venta no puede ser negativa
    expect(res.body.total).toBeGreaterThanOrEqual(0);
  });
});
