import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { AuthProvider, useAuth } from '../auth/AuthContext';

// Mock del cliente API: evita llamadas HTTP reales
const loginMock = vi.fn();
vi.mock('../api/client', () => ({
  api: { post: (...args: unknown[]) => loginMock(...(args as [])) },
  mensajeError: (e: { response?: { data?: { mensaje?: string } } }, d: string) =>
    e.response?.data?.mensaje ?? d,
}));

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe('AuthProvider — sesión y permisos (RF-21)', () => {
  beforeEach(() => {
    loginMock.mockReset();
    localStorage.clear();
  });

  it('inicia sesión y guarda usuario, token y permisos', async () => {
    const usuario = {
      id: 1,
      nombreUsuario: 'admin',
      nombreCompleto: 'Administrador',
      roles: ['ADMIN'],
      permisos: ['catalogo.ver', 'ventas.facturar'],
    };
    loginMock.mockResolvedValue({ data: { token: 'jwt-falso', usuario } });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {
      await result.current.iniciarSesion('admin', 'Admin123!');
    });

    await waitFor(() => expect(result.current.usuario?.nombreUsuario).toBe('admin'));
    expect(localStorage.getItem('token')).toBe('jwt-falso');
    expect(result.current.tienePermiso('catalogo.ver')).toBe(true);
    expect(result.current.tienePermiso('auditoria.ver')).toBe(false);
  });

  it('tienePermiso exige el permiso exacto para roles limitados (criterio RF-21)', () => {
    localStorage.setItem(
      'usuario',
      JSON.stringify({
        id: 2,
        nombreUsuario: 'vendedor',
        nombreCompleto: 'Valeria',
        roles: ['VENTAS'],
        permisos: ['ventas.facturar', 'catalogo.ver'],
      }),
    );
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.tienePermiso('ventas.facturar')).toBe(true);
    // el vendedor no puede ver costos, cierres ni auditoría
    expect(result.current.tienePermiso('costos.ver')).toBe(false);
    expect(result.current.tienePermiso('cierres.ejecutar')).toBe(false);
    expect(result.current.tienePermiso('auditoria.ver')).toBe(false);
  });

  it('cerrarSesion limpia la sesión', async () => {
    localStorage.setItem(
      'usuario',
      JSON.stringify({ id: 1, nombreUsuario: 'a', nombreCompleto: 'A', roles: ['ADMIN'], permisos: [] }),
    );
    localStorage.setItem('token', 'x');
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => result.current.cerrarSesion());
    expect(result.current.usuario).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });
});
