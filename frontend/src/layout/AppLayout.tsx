import { useMemo } from 'react';
import { Layout, Menu, Dropdown, Space, Typography } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  DashboardOutlined, AppstoreOutlined, TeamOutlined, ShoppingCartOutlined,
  DollarOutlined, InboxOutlined, FileDoneOutlined, LockOutlined,
  SafetyCertificateOutlined, UserOutlined, AuditOutlined, UploadOutlined,
  ApiOutlined, ReloadOutlined, CloseCircleOutlined, DownOutlined,
} from '@ant-design/icons';
import { useAuth } from '../auth/AuthContext';

const { Header, Sider, Content } = Layout;

/** Definición del menú: cada ítem exige permisos (menú dinámico — RF-21). */
const MENU: { clave: string; ruta: string; etiqueta: string; icono: React.ReactNode; permisos: string[] }[] = [
  { clave: 'dashboard', ruta: '/', etiqueta: 'Dashboard', icono: <DashboardOutlined />, permisos: [] },
  { clave: 'catalogo', ruta: '/catalogo', etiqueta: 'Catálogo', icono: <AppstoreOutlined />, permisos: ['catalogo.ver'] },
  { clave: 'terceros', ruta: '/terceros', etiqueta: 'Clientes y Proveedores', icono: <TeamOutlined />, permisos: ['terceros.ver'] },
  { clave: 'pos', ruta: '/pos', etiqueta: 'Punto de Venta', icono: <DollarOutlined />, permisos: ['ventas.facturar'] },
  { clave: 'ventas', ruta: '/ventas', etiqueta: 'Ventas y Devoluciones', icono: <FileDoneOutlined />, permisos: ['ventas.ver'] },
  { clave: 'reservas', ruta: '/reservas', etiqueta: 'Reservas', icono: <LockOutlined />, permisos: ['reservas.ver'] },
  { clave: 'compras', ruta: '/compras', etiqueta: 'Compras', icono: <ShoppingCartOutlined />, permisos: ['compras.ver'] },
  { clave: 'inventario', ruta: '/inventario', etiqueta: 'Inventario', icono: <InboxOutlined />, permisos: ['inventario.ver'] },
  { clave: 'precios', ruta: '/precios', etiqueta: 'Precios', icono: <ReloadOutlined />, permisos: ['precios.ver'] },
  { clave: 'cierres', ruta: '/cierres', etiqueta: 'Cierres Mensuales', icono: <CloseCircleOutlined />, permisos: ['cierres.ver'] },
  { clave: 'garantias', ruta: '/garantias', etiqueta: 'Garantías', icono: <SafetyCertificateOutlined />, permisos: ['garantias.ver'] },
  { clave: 'usuarios', ruta: '/usuarios', etiqueta: 'Usuarios y Roles', icono: <UserOutlined />, permisos: ['usuarios.ver'] },
  { clave: 'auditoria', ruta: '/auditoria', etiqueta: 'Auditoría', icono: <AuditOutlined />, permisos: ['auditoria.ver'] },
  { clave: 'migracion', ruta: '/migracion', etiqueta: 'Migración Excel', icono: <UploadOutlined />, permisos: ['migracion.ejecutar'] },
  { clave: 'integraciones', ruta: '/integraciones', etiqueta: 'Integraciones', icono: <ApiOutlined />, permisos: ['integraciones.ver'] },
];

export function AppLayout() {
  const { usuario, tienePermiso, cerrarSesion } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const itemsMenu = useMemo(
    () => MENU.filter((m) => m.permisos.length === 0 || tienePermiso(...m.permisos)),
    [tienePermiso],
  );

  const claveActiva =
    itemsMenu.find((m) => m.ruta !== '/' && location.pathname.startsWith(m.ruta))?.clave ?? 'dashboard';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible theme="dark">
        <div style={{ height: 48, margin: 12, color: '#fff', fontWeight: 700, fontSize: 15, textAlign: 'center' }}>
          🔧 Ferretería
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[claveActiva]}
          items={itemsMenu.map((m) => ({ key: m.clave, icon: m.icono, label: m.etiqueta }))}
          onClick={({ key }) => navigate(MENU.find((m) => m.clave === key)!.ruta)}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Dropdown
            menu={{
              items: [{ key: 'salir', icon: <CloseCircleOutlined />, label: 'Cerrar sesión' }],
              onClick: ({ key }) => {
                if (key === 'salir') {
                  cerrarSesion();
                  navigate('/login');
                }
              },
            }}
          >
            <Space style={{ cursor: 'pointer' }}>
              <Typography.Text strong>{usuario?.nombreCompleto}</Typography.Text>
              <Typography.Text type="secondary">({usuario?.roles.join(', ')})</Typography.Text>
              <DownOutlined />
            </Space>
          </Dropdown>
        </Header>
        <Content style={{ margin: 16 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
