import { UnauthorizedError } from '../../domain/errors/DomainError';

/**
 * Authentification admin minimaliste : un simple mot de passe partagé.
 * La sécurité n'est volontairement pas un enjeu ici (cf. cahier des charges).
 */
export class AdminService {
  constructor(private readonly adminPassword: string) {}

  /** Vérifie le mot de passe ; lève UnauthorizedError sinon. */
  verifyPassword(password: string): void {
    if (password !== this.adminPassword) {
      throw new UnauthorizedError('Mot de passe administrateur incorrect.');
    }
  }

  isValid(password: string | undefined): boolean {
    return password !== undefined && password === this.adminPassword;
  }
}
