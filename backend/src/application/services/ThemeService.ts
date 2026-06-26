import type {
  ThemeRepository,
  CreateThemeData,
  UpdateThemeData,
} from '../../domain/repositories/ThemeRepository';
import type { Theme } from '../../domain/entities/Theme';
import { NotFoundError } from '../../domain/errors/DomainError';

/**
 * Orchestration des cas d'usage liés aux thèmes.
 * Le soft delete = `update(id, { isActive })`. Rien n'est jamais supprimé.
 */
export class ThemeService {
  constructor(private readonly themes: ThemeRepository) {}

  /** Thèmes actifs uniquement — utilisé côté création de partie. */
  listActive(): Promise<Theme[]> {
    return this.themes.findAll({ activeOnly: true });
  }

  /** Tous les thèmes — utilisé dans l'admin. */
  listAll(): Promise<Theme[]> {
    return this.themes.findAll();
  }

  create(data: CreateThemeData): Promise<Theme> {
    return this.themes.create(data);
  }

  async update(id: number, data: UpdateThemeData): Promise<Theme> {
    const updated = await this.themes.update(id, data);
    if (!updated) {
      throw new NotFoundError(`Thème introuvable : ${id}`);
    }
    return updated;
  }

  /** Active/désactive (soft delete). */
  setActive(id: number, isActive: boolean): Promise<Theme> {
    return this.update(id, { isActive });
  }
}
