/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Matriz de permisos por rol — RF-21 (los pendientes quedan como permiso de GERENCIA/ADMIN)
const PERMISOS: { codigo: string; modulo: string; descripcion: string }[] = [
  { codigo: 'catalogo.ver', modulo: 'catalogo', descripcion: 'Consultar catálogo de productos y referencias' },
  { codigo: 'catalogo.crear', modulo: 'catalogo', descripcion: 'Crear productos, marcas, presentaciones y referencias' },
  { codigo: 'catalogo.editar', modulo: 'catalogo', descripcion: 'Editar productos, marcas, presentaciones y referencias' },
  { codigo: 'catalogo.eliminar', modulo: 'catalogo', descripcion: 'Inactivar referencias del catálogo' },
  { codigo: 'terceros.ver', modulo: 'terceros', descripcion: 'Consultar clientes y proveedores' },
  { codigo: 'terceros.crear', modulo: 'terceros', descripcion: 'Crear terceros' },
  { codigo: 'terceros.editar', modulo: 'terceros', descripcion: 'Editar terceros' },
  { codigo: 'compras.ver', modulo: 'compras', descripcion: 'Consultar órdenes y documentos de ingreso' },
  { codigo: 'compras.crear', modulo: 'compras', descripcion: 'Registrar órdenes de compra e ingresos' },
  { codigo: 'compras.anular', modulo: 'compras', descripcion: 'Anular documentos de ingreso' },
  { codigo: 'inventario.ver', modulo: 'inventario', descripcion: 'Consultar saldos y movimientos de inventario' },
  { codigo: 'inventario.danados', modulo: 'inventario', descripcion: 'Clasificar existencias como dañadas' },
  { codigo: 'inventario.ajustar', modulo: 'inventario', descripcion: 'Solicitar ajustes y conteos físicos' },
  { codigo: 'inventario.ajustar.aprobar', modulo: 'inventario', descripcion: 'Aprobar ajustes y conteos físicos' },
  { codigo: 'inventario.vencimientos.baja', modulo: 'inventario', descripcion: 'Autorizar bajas por vencimiento' },
  { codigo: 'ventas.facturar', modulo: 'ventas', descripcion: 'Registrar ventas y emitir facturas' },
  { codigo: 'ventas.ver', modulo: 'ventas', descripcion: 'Consultar ventas y facturas' },
  { codigo: 'ventas.devoluciones', modulo: 'ventas', descripcion: 'Procesar devoluciones de clientes' },
  { codigo: 'ventas.devoluciones.aprobar', modulo: 'ventas', descripcion: 'Aprobar devoluciones de clientes' },
  { codigo: 'reservas.ver', modulo: 'reservas', descripcion: 'Consultar reservas' },
  { codigo: 'reservas.crear', modulo: 'reservas', descripcion: 'Crear reservas' },
  { codigo: 'reservas.liberar', modulo: 'reservas', descripcion: 'Liberar reservas manualmente' },
  { codigo: 'precios.ver', modulo: 'precios', descripcion: 'Consultar precios e historial' },
  { codigo: 'precios.editar', modulo: 'precios', descripcion: 'Modificar precios de venta (Responsable de inventario)' },
  { codigo: 'costos.ver', modulo: 'costos', descripcion: 'Consultar costos promedio (Gerencia)' },
  { codigo: 'cierres.ver', modulo: 'cierres', descripcion: 'Consultar cierres mensuales' },
  { codigo: 'cierres.ejecutar', modulo: 'cierres', descripcion: 'Cerrar y reabrir periodos (Gerencia)' },
  { codigo: 'garantias.ver', modulo: 'garantias', descripcion: 'Consultar garantías posventa' },
  { codigo: 'usuarios.ver', modulo: 'usuarios', descripcion: 'Consultar usuarios y roles' },
  { codigo: 'usuarios.crear', modulo: 'usuarios', descripcion: 'Crear usuarios y asignar roles' },
  { codigo: 'usuarios.editar', modulo: 'usuarios', descripcion: 'Editar usuarios y roles' },
  { codigo: 'auditoria.ver', modulo: 'auditoria', descripcion: 'Consultar el registro de auditoría' },
  { codigo: 'migracion.ejecutar', modulo: 'migracion', descripcion: 'Ejecutar migraciones desde Excel' },
  { codigo: 'integraciones.ver', modulo: 'integraciones', descripcion: 'Consultar estado de integraciones' },
];

// Asignación rol → permisos. ADMIN tiene todo; los demás según el alcance.
const PERMISOS_ADMIN = PERMISOS.map((p) => p.codigo);
const MATRIZ: Record<string, string[]> = {
  ADMIN: PERMISOS_ADMIN,
  GERENCIA: [
    'catalogo.ver', 'terceros.ver', 'compras.ver', 'inventario.ver', 'inventario.danados',
    'inventario.ajustar', 'inventario.ajustar.aprobar', 'inventario.vencimientos.baja',
    'ventas.ver', 'ventas.devoluciones.aprobar', 'reservas.ver', 'reservas.liberar',
    'precios.ver', 'costos.ver', 'cierres.ver', 'cierres.ejecutar', 'garantias.ver',
    'usuarios.ver', 'auditoria.ver', 'integraciones.ver',
  ],
  RESPONSABLE_INVENTARIO: [
    'catalogo.ver', 'catalogo.crear', 'catalogo.editar', 'catalogo.eliminar',
    'terceros.ver', 'terceros.crear', 'terceros.editar',
    'compras.ver', 'compras.crear',
    'inventario.ver', 'inventario.danados', 'inventario.ajustar', 'inventario.vencimientos.baja',
    'ventas.ver', 'ventas.devoluciones', 'reservas.ver', 'precios.ver', 'precios.editar',
    'garantias.ver', 'migracion.ejecutar',
  ],
  VENTAS: [
    'catalogo.ver', 'terceros.ver', 'terceros.crear', 'terceros.editar',
    'inventario.ver', 'ventas.facturar', 'ventas.ver', 'ventas.devoluciones',
    'reservas.ver', 'reservas.crear', 'precios.ver', 'garantias.ver',
  ],
  COMPRAS: [
    'catalogo.ver', 'terceros.ver', 'terceros.crear', 'terceros.editar',
    'compras.ver', 'compras.crear', 'inventario.ver',
  ],
};

async function main() {
  console.log('Sembrando datos iniciales...');

  // 1. Permisos
  for (const p of PERMISOS) {
    await prisma.permiso.upsert({
      where: { codigo: p.codigo },
      update: { descripcion: p.descripcion, modulo: p.modulo },
      create: p,
    });
  }
  const permisos = await prisma.permiso.findMany();
  const permisoPorCodigo = new Map(permisos.map((p) => [p.codigo, p.id]));

  // 2. Roles y matriz rol-permiso
  const rolesData = [
    { codigo: 'ADMIN', nombre: 'Administrador', descripcion: 'Control total del sistema y seguridad' },
    { codigo: 'GERENCIA', nombre: 'Gerencia / Responsable de cierre', descripcion: 'Cierres de periodo, auditoría, costos' },
    { codigo: 'RESPONSABLE_INVENTARIO', nombre: 'Responsable de inventario', descripcion: 'Bodega, precios y compras' },
    { codigo: 'VENTAS', nombre: 'Usuario de ventas', descripcion: 'Facturación en mostrador y reservas' },
    { codigo: 'COMPRAS', nombre: 'Usuario de compras', descripcion: 'Registro de compras' },
  ];
  for (const r of rolesData) {
    const rol = await prisma.rol.upsert({ where: { codigo: r.codigo }, update: r, create: r });
    const codigos = MATRIZ[r.codigo] ?? [];
    for (const codigo of codigos) {
      const permisoId = permisoPorCodigo.get(codigo);
      if (!permisoId) continue;
      await prisma.rolPermiso.upsert({
        where: { rolId_permisoId: { rolId: rol.id, permisoId } },
        update: {},
        create: { rolId: rol.id, permisoId },
      });
    }
  }

  // 3. Usuario administrador inicial
  const adminRol = await prisma.rol.findUniqueOrThrow({ where: { codigo: 'ADMIN' } });
  const hash = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.usuario.upsert({
    where: { nombreUsuario: 'admin' },
    update: {},
    create: {
      nombreCompleto: 'Administrador del Sistema',
      nombreUsuario: 'admin',
      passwordHash: hash,
      email: 'admin@ferreteria.local',
    },
  });
  await prisma.usuarioRol.upsert({
    where: { usuarioId_rolId: { usuarioId: admin.id, rolId: adminRol.id } },
    update: {},
    create: { usuarioId: admin.id, rolId: adminRol.id },
  });

  // Usuarios demo por rol (para pruebas y demostración)
  const demos: { rol: string; usuario: string; nombre: string }[] = [
    { rol: 'GERENCIA', usuario: 'gerencia', nombre: 'Gloria Gerencia' },
    { rol: 'RESPONSABLE_INVENTARIO', usuario: 'bodega', nombre: 'Bruno Bodega' },
    { rol: 'VENTAS', usuario: 'vendedor', nombre: 'Valeria Vendedora' },
    { rol: 'COMPRAS', usuario: 'compras', nombre: 'Carlos Compras' },
  ];
  for (const d of demos) {
    const rol = await prisma.rol.findUniqueOrThrow({ where: { codigo: d.rol } });
    const u = await prisma.usuario.upsert({
      where: { nombreUsuario: d.usuario },
      update: {},
      create: {
        nombreCompleto: d.nombre,
        nombreUsuario: d.usuario,
        passwordHash: await bcrypt.hash(`${d.usuario.charAt(0).toUpperCase()}${d.usuario.slice(1)}123!`, 10),
      },
    });
    await prisma.usuarioRol.upsert({
      where: { usuarioId_rolId: { usuarioId: u.id, rolId: rol.id } },
      update: {},
      create: { usuarioId: u.id, rolId: rol.id },
    });
  }

  // 4. Unidades de medida base
  const unidades = [
    { codigo: 'UND', nombre: 'Unidad' },
    { codigo: 'KG', nombre: 'Kilogramo' },
    { codigo: 'G', nombre: 'Gramo' },
    { codigo: 'M', nombre: 'Metro' },
    { codigo: 'CM', nombre: 'Centímetro' },
    { codigo: 'L', nombre: 'Litro' },
    { codigo: 'GL', nombre: 'Galón' },
    { codigo: 'ROLLO', nombre: 'Rollo' },
    { codigo: 'CAJA', nombre: 'Caja' },
    { codigo: 'BOLSA', nombre: 'Bolsa' },
  ];
  for (const u of unidades) {
    await prisma.unidadMedida.upsert({ where: { codigo: u.codigo }, update: {}, create: u });
  }

  // 5. Parámetros del sistema (Colombia por defecto — RF-02/RNF-02)
  const parametros = [
    { clave: 'pais', valor: 'CO', descripcion: 'País de operación' },
    { clave: 'moneda', valor: 'COP', descripcion: 'Moneda' },
    { clave: 'iva_default', valor: '19', descripcion: 'Porcentaje de IVA por defecto' },
    { clave: 'redondeo_decimales', valor: '2', descripcion: 'Decimales para redondeo monetario' },
    { clave: 'dias_alerta_vencimiento', valor: '30', descripcion: 'Días de antelación para alertar vencimientos' },
  ];
  for (const p of parametros) {
    await prisma.parametro.upsert({ where: { clave: p.clave }, update: {}, create: p });
  }

  // 6. Consecutivos
  const consecutivos = [
    { tipo: 'OC', prefijo: 'OC' },
    { tipo: 'DI', prefijo: 'DI' },
    { tipo: 'FV', prefijo: 'FV' },
    { tipo: 'RES', prefijo: 'RES' },
    { tipo: 'AJ', prefijo: 'AJ' },
    { tipo: 'DC', prefijo: 'DC' },
    { tipo: 'DP', prefijo: 'DP' },
    { tipo: 'BV', prefijo: 'BV' },
  ];
  for (const c of consecutivos) {
    await prisma.consecutivo.upsert({ where: { tipo: c.tipo }, update: {}, create: { ...c, valorActual: 0 } });
  }

  console.log('Seed completado. Usuario admin/admin (contraseña: Admin123!)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
