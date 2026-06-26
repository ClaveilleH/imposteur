import type { Theme } from '../entities/Theme';

/**
 * Port (interface) d'accès aux thèmes. Le domaine définit le contrat ;
 * l'infrastructure (PostgreSQL) en fournit l'implémentation.
 */
export interface CreateThemeData {
  readonly name: string;
}

export interface UpdateThemeData {
  readonly name?: string;
  readonly isActive?: boolean;
}

export interface ThemeRepository {
  findAll(opts?: { activeOnly?: boolean }): Promise<Theme[]>;
  findById(id: number): Promise<Theme | null>;
  create(data: CreateThemeData): Promise<Theme>;
  update(id: number, data: UpdateThemeData): Promise<Theme | null>;
}
