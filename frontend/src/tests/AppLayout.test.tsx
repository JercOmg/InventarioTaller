import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App as AntApp } from 'antd';
import { AuthProvider } from '../auth/AuthContext';
import { AppLayout } from '../layout/AppLayout';

function renderConRol(permisos: string[], roles: string[]) {
  localStorage.setItem(
    'usuario',
    JSON.stringify({
      id: 1,
      nombreUsuario: 'prueba',
      nombreCompleto: 'Usuario de Prueba',
      roles,
      permisos,
    }),
  );
  render(
    <AntApp>
      <MemoryRouter initialEntries={['/']}>
        <AuthProvider>
          <AppLayout />
        </AuthProvider>
      </MemoryRouter>
    </AntApp>,
  );
}

describe('AppLayout — menú dinámico según rol (RF-21)', () => {
  it('el vendedor ve Punto de Venta pero no Cierres ni Auditoría', () => {
    renderConRol(['ventas.facturar', 'catalogo.ver', 'ventas.ver', 'reservas.ver', 'precios.ver', 'garantias.ver', 'terceros.ver', 'inventario.ver'], ['VENTAS']);
    expect(screen.getByText('Punto de Venta')).toBeInTheDocument();
    expect(screen.queryByText('Cierres Mensuales')).not.toBeInTheDocument();
    expect(screen.queryByText('Auditoría')).not.toBeInTheDocument();
  });

  it('la gerencia ve Cierres y Auditoría pero no Punto de Venta', () => {
    renderConRol(['cierres.ver', 'cierres.ejecutar', 'auditoria.ver', 'costos.ver', 'catalogo.ver', 'inventario.ver', 'ventas.ver', 'reservas.ver', 'precios.ver', 'garantias.ver', 'terceros.ver', 'usuarios.ver', 'integraciones.ver'], ['GERENCIA']);
    expect(screen.getByText('Cierres Mensuales')).toBeInTheDocument();
    expect(screen.getByText('Auditoría')).toBeInTheDocument();
    expect(screen.queryByText('Punto de Venta')).not.toBeInTheDocument();
  });
});
