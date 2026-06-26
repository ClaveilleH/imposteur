import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pool, closePool } from './pool';

/**
 * Runner de migrations minimaliste : exécute, dans l'ordre alphabétique, les
 * fichiers `migrations/*.sql` non encore appliqués, chacun dans une transaction.
 * Les migrations appliquées sont tracées dans `schema_migrations`.
 *
 * Suffisant et transparent pour ce projet ; on pourra passer à node-pg-migrate
 * si les besoins se complexifient.
 */
const MIGRATIONS_DIR = join(__dirname, 'migrations');

async function ensureMigrationsTable(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename   TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

async function appliedMigrations(): Promise<Set<string>> {
  const { rows } = await pool.query<{ filename: string }>('SELECT filename FROM schema_migrations');
  return new Set(rows.map((r) => r.filename));
}

async function run(): Promise<void> {
  await ensureMigrationsTable();
  const done = await appliedMigrations();

  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    if (done.has(file)) {
      console.log(`↳ déjà appliquée : ${file}`);
      continue;
    }
    const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf8');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log(`✓ appliquée : ${file}`);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`✗ échec : ${file}`);
      throw err;
    } finally {
      client.release();
    }
  }
}

run()
  .then(() => console.log('Migrations terminées.'))
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(closePool);
