import axios from 'axios';

/** Cliente HTTP central: agrega el token y redirige a login si la sesión expira. */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && !window.location.hash.includes('login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

/** Extrae el mensaje de error legible de una respuesta del API. */
export function mensajeError(e: unknown, defecto = 'Ocurrió un error'): string {
  const err = e as { response?: { data?: { mensaje?: string; detalle?: unknown } } };
  return err.response?.data?.mensaje ?? defecto;
}
