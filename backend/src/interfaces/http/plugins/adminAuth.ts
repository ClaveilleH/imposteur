import type { FastifyRequest } from 'fastify';
import type { AdminService } from '../../../application/services/AdminService';
import { UnauthorizedError } from '../../../domain/errors/DomainError';

/**
 * Garde d'authentification admin. Le mot de passe est transmis dans l'en-tête
 * `x-admin-password`. À brancher en `preHandler` sur les routes protégées.
 *
 * Volontairement simple : pas de session, pas de JWT (cf. cahier des charges).
 */
export function makeAdminGuard(adminService: AdminService) {
  return async function adminGuard(request: FastifyRequest): Promise<void> {
    const header = request.headers['x-admin-password'];
    const password = Array.isArray(header) ? header[0] : header;
    if (!adminService.isValid(password)) {
      throw new UnauthorizedError('Accès administrateur requis.');
    }
  };
}
