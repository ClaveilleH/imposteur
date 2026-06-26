import { Pool } from 'pg';
import { env } from '../../config/env';

/**
 * Pool de connexions PostgreSQL partagé par toute l'application.
 * `pg` met en file et réutilise les connexions automatiquement.
 */
export const pool = new Pool({ connectionString: env.databaseUrl });

export async function closePool(): Promise<void> {
  await pool.end();
}
