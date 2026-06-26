import type { FastifyInstance } from 'fastify';
import { ZodError } from 'zod';
import { DomainError } from '../../../domain/errors/DomainError';

/**
 * Format de réponse d'erreur homogène :
 *   { error: { code, message, details? } }
 *
 * Hiérarchie de traitement :
 *  - ZodError      → 400 VALIDATION_ERROR (avec le détail des champs)
 *  - DomainError   → statusCode/code portés par l'erreur métier
 *  - autres        → 500 INTERNAL_ERROR (message masqué)
 */
export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Requête invalide.',
          details: error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
        },
      });
      return;
    }

    if (error instanceof DomainError) {
      reply.status(error.statusCode).send({
        error: { code: error.code, message: error.message },
      });
      return;
    }

    app.log.error(error);
    reply.status(500).send({
      error: { code: 'INTERNAL_ERROR', message: 'Une erreur interne est survenue.' },
    });
  });

  app.setNotFoundHandler((_request, reply) => {
    reply.status(404).send({
      error: { code: 'NOT_FOUND', message: 'Ressource introuvable.' },
    });
  });
}
