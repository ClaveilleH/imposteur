/**
 * Une paire de deux mots proches (ex. (Chat, Chien)).
 *
 * - `difficulty` : entier de 1 à 5.
 * - `themeIds`   : un ou plusieurs thèmes (relation many-to-many).
 * - `isActive`   : soft delete. Seules les paires actives sont jouables.
 */
export interface WordPair {
  readonly id: number;
  readonly wordA: string;
  readonly wordB: string;
  readonly difficulty: number;
  readonly themeIds: readonly number[];
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export const MIN_DIFFICULTY = 1;
export const MAX_DIFFICULTY = 5;
