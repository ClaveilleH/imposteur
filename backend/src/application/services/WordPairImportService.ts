import type { ThemeRepository } from '../../domain/repositories/ThemeRepository';
import type { WordPairRepository } from '../../domain/repositories/WordPairRepository';
import type { WordPair } from '../../domain/entities/WordPair';
import type { Theme } from '../../domain/entities/Theme';

export interface ImportItem {
  readonly wordA: string;
  readonly wordB: string;
  readonly difficulty: number;
  /** Noms de thèmes (créés automatiquement s'ils n'existent pas). */
  readonly themeNames: readonly string[];
}

export interface ImportResult {
  created: WordPair[];
  /** Noms des thèmes créés à la volée pendant l'import. */
  createdThemeNames: string[];
}

/**
 * Import en masse de paires de mots. Les thèmes référencés par leur nom sont
 * réutilisés s'ils existent (insensible à la casse), sinon créés automatiquement.
 */
export class WordPairImportService {
  constructor(
    private readonly themes: ThemeRepository,
    private readonly wordPairs: WordPairRepository,
  ) {}

  async import(items: readonly ImportItem[]): Promise<ImportResult> {
    // Cache par nom (minuscule) pour ne résoudre/créer chaque thème qu'une fois.
    const themeCache = new Map<string, Theme>();
    const createdThemeNames: string[] = [];
    const created: WordPair[] = [];

    for (const item of items) {
      const themeIds: number[] = [];
      for (const rawName of item.themeNames) {
        const name = rawName.trim();
        if (!name) continue;
        const key = name.toLowerCase();

        let theme = themeCache.get(key);
        if (!theme) {
          theme = (await this.themes.findByName(name)) ?? undefined;
          if (!theme) {
            theme = await this.themes.create({ name });
            createdThemeNames.push(theme.name);
          }
          themeCache.set(key, theme);
        }
        themeIds.push(theme.id);
      }

      const pair = await this.wordPairs.create({
        wordA: item.wordA,
        wordB: item.wordB,
        difficulty: item.difficulty,
        themeIds,
      });
      created.push(pair);
    }

    return { created, createdThemeNames };
  }
}
