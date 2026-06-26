import { env } from './config/env';
import { buildContainer } from './container';
import { buildApp } from './interfaces/http/app';
import { closePool } from './infrastructure/db/pool';

/**
 * Point d'entrée : assemble le conteneur, démarre le serveur HTTP,
 * et gère l'arrêt propre (fermeture du pool PostgreSQL).
 */
async function main(): Promise<void> {
  const container = buildContainer();
  const app = await buildApp(container);

  await app.listen({ port: env.port, host: '0.0.0.0' });

  const shutdown = async (signal: string): Promise<void> => {
    app.log.info(`Signal ${signal} reçu, arrêt en cours...`);
    await app.close();
    await closePool();
    process.exit(0);
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

main().catch((err) => {
  console.error('Échec du démarrage :', err);
  process.exit(1);
});
