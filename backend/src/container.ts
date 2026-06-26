import type { Pool } from 'pg';
import { env } from './config/env';
import { pool as defaultPool } from './infrastructure/db/pool';
import { PgThemeRepository } from './infrastructure/repositories/PgThemeRepository';
import { PgWordPairRepository } from './infrastructure/repositories/PgWordPairRepository';
import { ThemeService } from './application/services/ThemeService';
import { WordPairService } from './application/services/WordPairService';
import { WordPairImportService } from './application/services/WordPairImportService';
import { GameService } from './application/services/GameService';
import { AdminService } from './application/services/AdminService';

/**
 * Composition root : c'est le SEUL endroit qui connaît les implémentations
 * concrètes. On y assemble repositories + services. Le reste du code ne
 * dépend que des interfaces (ports).
 *
 * Pour les tests, on peut appeler buildContainer avec un faux Pool ou
 * remplacer les services.
 */
export interface Container {
  themeService: ThemeService;
  wordPairService: WordPairService;
  wordPairImportService: WordPairImportService;
  gameService: GameService;
  adminService: AdminService;
}

export function buildContainer(pool: Pool = defaultPool): Container {
  const themeRepository = new PgThemeRepository(pool);
  const wordPairRepository = new PgWordPairRepository(pool);

  return {
    themeService: new ThemeService(themeRepository),
    wordPairService: new WordPairService(wordPairRepository),
    wordPairImportService: new WordPairImportService(themeRepository, wordPairRepository),
    gameService: new GameService(wordPairRepository),
    adminService: new AdminService(env.adminPassword),
  };
}
