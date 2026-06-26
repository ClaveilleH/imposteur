/**
 * Erreurs métier. Elles portent un `code` stable (consommable par le frontend)
 * et un `statusCode` HTTP. La couche HTTP les transforme en réponses JSON
 * homogènes via le gestionnaire d'erreurs (errorHandler).
 */
export abstract class DomainError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

/** Donnée demandée introuvable (404). */
export class NotFoundError extends DomainError {
  readonly code = 'NOT_FOUND';
  readonly statusCode = 404;
}

/** Règle métier violée / entrée invalide au sens métier (422). */
export class ValidationError extends DomainError {
  readonly code = 'VALIDATION_ERROR';
  readonly statusCode = 422;
}

/** Aucune paire ne correspond aux critères de la partie (409). */
export class NoWordPairAvailableError extends DomainError {
  readonly code = 'NO_WORD_PAIR_AVAILABLE';
  readonly statusCode = 409;

  constructor() {
    super('Aucune paire de mots active ne correspond aux thèmes et à la difficulté choisis.');
  }
}

/** Authentification admin échouée (401). */
export class UnauthorizedError extends DomainError {
  readonly code = 'UNAUTHORIZED';
  readonly statusCode = 401;
}
