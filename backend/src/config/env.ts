import 'dotenv/config';

/**
 * Configuration centralisée et typée.
 * On lit l'environnement une seule fois ici ; le reste du code dépend de `env`,
 * jamais de `process.env` directement.
 */
export interface Env {
  readonly port: number;
  readonly databaseUrl: string;
  readonly corsOrigin: string;
  readonly adminPassword: string;
}

function required(name: string): string {
  const value = process.env[name];
  if (value === undefined || value === '') {
    throw new Error(`Variable d'environnement manquante : ${name}`);
  }
  return value;
}

export const env: Env = {
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: required('DATABASE_URL'),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  adminPassword: process.env.ADMIN_PASSWORD ?? 'admin',
};
