import { crearApp } from './app';
import { env } from './config/env';
import { prisma } from './lib/prisma';
import { prisma as clienteAuditoria } from './lib/prisma';
import { liberarVencidas } from './modules/reservas.routes';

const app = crearApp();

async function iniciar() {
  await prisma.$queryRaw`SELECT 1`;
  const server = app.listen(env.port, () => {
    console.log(`API Ferretería escuchando en http://localhost:${env.port} (modo ${env.nodeEnv})`);
  });

  // Liberación automática de reservas vencidas cada 60 segundos (RF-05)
  const usuarioSistema = await clienteAuditoria.usuario.findFirst({ where: { nombreUsuario: 'admin' } });
  if (usuarioSistema) {
    setInterval(() => {
      liberarVencidas(usuarioSistema.id).catch((e) => console.error('[liberar-vencidas]', e.message));
    }, 60_000);
  }

  const cerrar = async () => {
    server.close();
    await prisma.$disconnect();
    process.exit(0);
  };
  process.on('SIGINT', cerrar);
  process.on('SIGTERM', cerrar);
}

iniciar().catch((e) => {
  console.error('No fue posible iniciar el servidor:', e);
  process.exit(1);
});
