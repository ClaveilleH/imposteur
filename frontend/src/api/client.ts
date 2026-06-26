import type { ApiErrorBody } from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

/** Erreur applicative portant le code stable renvoyé par l'API. */
export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Mot de passe admin à transmettre (en-tête x-admin-password). */
  adminPassword?: string;
}

/**
 * Petit wrapper fetch typé et centralisé :
 *  - sérialise le JSON,
 *  - ajoute l'en-tête admin si fourni,
 *  - transforme les réponses d'erreur en `ApiError`.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (options.adminPassword) {
    headers['x-admin-password'] = options.adminPassword;
  }

  const response = await fetch(`${BASE_URL}/api${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (!response.ok) {
    let code = 'HTTP_ERROR';
    let message = `Erreur ${response.status}`;
    try {
      const data = (await response.json()) as ApiErrorBody;
      code = data.error?.code ?? code;
      message = data.error?.message ?? message;
    } catch {
      /* corps non JSON : on garde les valeurs par défaut */
    }
    throw new ApiError(code, message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}
