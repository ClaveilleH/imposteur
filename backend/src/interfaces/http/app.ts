import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { env } from '../../config/env';
import type { Container } from '../../container';
import { registerErrorHandler } from './plugins/errorHandler';
import { themeRoutes } from './routes/themes.routes';
import { gameRoutes } from './routes/games.routes';
import { adminRoutes } from './routes/admin.routes';

/**
 * Construit l'application Fastify (sans l'écouter). Séparer build/listen
 * facilite les tests d'intégration (app.inject) et le futur mode WebSocket.
 */
export async function buildApp(container: Container): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: env.corsOrigin });

  registerErrorHandler(app);

  app.get('/health', async () => ({ status: 'ok' }));

  // Toutes les routes métier sous /api.
  await app.register(
    async (api) => {
      await api.register(themeRoutes(container));
      await api.register(gameRoutes(container));
      await api.register(adminRoutes(container));
    },
    { prefix: '/api' },
  );

  return app;
}
