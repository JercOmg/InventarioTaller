import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';

// Serialización de BigInt (IDs de auditoría y kardex) en respuestas JSON
(BigInt.prototype as unknown as { toJSON: () => number }).toJSON = function () {
  return Number(this);
};
import { noEncontrado, manejarErrores } from './middleware/error';
import { authRouter } from './modules/auth.routes';
import { usuariosRouter } from './modules/usuarios.routes';
import { catalogoRouter } from './modules/catalogo.routes';
import { tercerosRouter } from './modules/terceros.routes';
import { comprasRouter } from './modules/compras.routes';
import { ventasRouter } from './modules/ventas.routes';
import { reservasRouter } from './modules/reservas.routes';
import { inventarioRouter } from './modules/inventario.routes';
import { preciosRouter } from './modules/precios.routes';
import { cierresRouter } from './modules/cierres.routes';
import { garantiasRouter } from './modules/garantias.routes';
import { auditoriaRouter } from './modules/auditoria.routes';
import { migracionRouter } from './modules/migracion.routes';
import { integracionesRouter, externosRouter } from './modules/integraciones.routes';
import { dashboardRouter } from './modules/dashboard.routes';

export function crearApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: env.corsOrigins, credentials: true }));
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req, res) => res.json({ estado: 'ok', fecha: new Date() }));

  app.use('/api/auth', authRouter);
  app.use('/api/usuarios', usuariosRouter);
  app.use('/api/catalogo', catalogoRouter);
  app.use('/api/terceros', tercerosRouter);
  app.use('/api/compras', comprasRouter);
  app.use('/api/ventas', ventasRouter);
  app.use('/api/reservas', reservasRouter);
  app.use('/api/inventario', inventarioRouter);
  app.use('/api/precios', preciosRouter);
  app.use('/api/cierres', cierresRouter);
  app.use('/api/garantias', garantiasRouter);
  app.use('/api/auditoria', auditoriaRouter);
  app.use('/api/migracion', migracionRouter);
  app.use('/api/integraciones', integracionesRouter);
  app.use('/api/ext', externosRouter);
  app.use('/api/dashboard', dashboardRouter);

  app.use(noEncontrado);
  app.use(manejarErrores);
  return app;
}
