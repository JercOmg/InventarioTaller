import { Navigate, Route, Routes } from 'react-router-dom';
import { App as AntApp } from 'antd';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { AppLayout } from './layout/AppLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Catalogo } from './pages/Catalogo';
import { Terceros } from './pages/Terceros';
import { PuntoVenta } from './pages/PuntoVenta';
import { Ventas } from './pages/Ventas';
import { Reservas } from './pages/Reservas';
import { Compras } from './pages/Compras';
import { Inventario } from './pages/Inventario';
import { Precios } from './pages/Precios';
import { Cierres } from './pages/Cierres';
import { Garantias } from './pages/Garantias';
import { Usuarios } from './pages/Usuarios';
import { Auditoria } from './pages/Auditoria';
import { Migracion } from './pages/Migracion';
import { Integraciones } from './pages/Integraciones';

/** Protege una ruta: exige sesión y, opcionalmente, permisos (RNF-05). */
function Protegida({ permisos, children }: { permisos: string[]; children: React.ReactNode }) {
  const { usuario, tienePermiso } = useAuth();
  if (!usuario) return <Navigate to="/login" replace />;
  if (permisos.length > 0 && !tienePermiso(...permisos)) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2>Acceso denegado</h2>
        <p>Su perfil ({usuario.roles.join(', ')}) no tiene permisos para este módulo.</p>
      </div>
    );
  }
  return <>{children}</>;
}

function Rutas() {
  const { usuario } = useAuth();
  if (!usuario && !localStorage.getItem('token')) {
    return <Login />;
  }
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/catalogo" element={<Protegida permisos={['catalogo.ver']}><Catalogo /></Protegida>} />
        <Route path="/terceros" element={<Protegida permisos={['terceros.ver']}><Terceros /></Protegida>} />
        <Route path="/pos" element={<Protegida permisos={['ventas.facturar']}><PuntoVenta /></Protegida>} />
        <Route path="/ventas" element={<Protegida permisos={['ventas.ver']}><Ventas /></Protegida>} />
        <Route path="/reservas" element={<Protegida permisos={['reservas.ver']}><Reservas /></Protegida>} />
        <Route path="/compras" element={<Protegida permisos={['compras.ver']}><Compras /></Protegida>} />
        <Route path="/inventario" element={<Protegida permisos={['inventario.ver']}><Inventario /></Protegida>} />
        <Route path="/precios" element={<Protegida permisos={['precios.ver']}><Precios /></Protegida>} />
        <Route path="/cierres" element={<Protegida permisos={['cierres.ver']}><Cierres /></Protegida>} />
        <Route path="/garantias" element={<Protegida permisos={['garantias.ver']}><Garantias /></Protegida>} />
        <Route path="/usuarios" element={<Protegida permisos={['usuarios.ver']}><Usuarios /></Protegida>} />
        <Route path="/auditoria" element={<Protegida permisos={['auditoria.ver']}><Auditoria /></Protegida>} />
        <Route path="/migracion" element={<Protegida permisos={['migracion.ejecutar']}><Migracion /></Protegida>} />
        <Route path="/integraciones" element={<Protegida permisos={['integraciones.ver']}><Integraciones /></Protegida>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AntApp>
      <AuthProvider>
        <Rutas />
      </AuthProvider>
    </AntApp>
  );
}
