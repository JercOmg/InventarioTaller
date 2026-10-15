/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { api } from '../api/client';

export interface UsuarioSesion {
  id: number;
  nombreUsuario: string;
  nombreCompleto: string;
  roles: string[];
  permisos: string[];
}

interface AuthContexto {
  usuario: UsuarioSesion | null;
  tienePermiso: (...codigos: string[]) => boolean;
  iniciarSesion: (nombreUsuario: string, password: string) => Promise<void>;
  cerrarSesion: () => void;
}

const AuthCtx = createContext<AuthContexto | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(() => {
    const guardado = localStorage.getItem('usuario');
    return guardado ? (JSON.parse(guardado) as UsuarioSesion) : null;
  });

  const iniciarSesion = useCallback(async (nombreUsuario: string, password: string) => {
    const { data } = await api.post('/auth/login', { nombreUsuario, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));
    setUsuario(data.usuario);
  }, []);

  const cerrarSesion = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  }, []);

  const tienePermiso = useCallback(
    (...codigos: string[]) =>
      Boolean(usuario && codigos.some((c) => usuario.permisos.includes(c))),
    [usuario],
  );

  const valor = useMemo(
    () => ({ usuario, tienePermiso, iniciarSesion, cerrarSesion }),
    [usuario, tienePermiso, iniciarSesion, cerrarSesion],
  );
  return <AuthCtx.Provider value={valor}>{children}</AuthCtx.Provider>;
}

export function useAuth(): AuthContexto {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
