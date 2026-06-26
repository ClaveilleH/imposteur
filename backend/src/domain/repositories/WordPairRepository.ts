import type { WordPair } from '../entities/WordPair';

export interface CreateWordPairData {
  readonly wordA: string;
  readonly wordB: string;
  readonly difficulty: number;
  readonly themeIds: readonly number[];
}

export interface UpdateWordPairData {
  readonly wordA?: string;
  readonly wordB?: string;
  readonly difficulty?: number;
  readonly themeIds?: readonly number[];
  readonly isActive?: boolean;
}

/** Critères de tirage d'une paire pour une partie. */
export interface WordPairQuery {
  readonly themeIds: readonly number[];
  readonly difficulty: number;
}

export interface WordPairRepository {
  findAll(opts?: { activeOnly?: boolean }): Promise<WordPair[]>;
  findById(id: number): Promise<WordPair | null>;
  create(data: CreateWordPairData): Promise<WordPair>;
  update(id: number, data: UpdateWordPairData): Promise<WordPair | null>;

  /**
   * Renvoie toutes les paires ACTIVES correspondant aux critères
   * (au moins un thème en commun + difficulté exacte). Le tirage aléatoire
   * est fait dans le domaine pour rester testable.
   */
  findCandidates(query: WordPairQuery): Promise<WordPair[]>;
}
