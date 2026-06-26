import type { WordPair } from '../../domain/entities/WordPair';

/** Représentation d'une paire de mots renvoyée par l'API (back-office). */
export interface WordPairDTO {
  id: number;
  wordA: string;
  wordB: string;
  difficulty: number;
  themeIds: number[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function toWordPairDTO(pair: WordPair): WordPairDTO {
  return {
    id: pair.id,
    wordA: pair.wordA,
    wordB: pair.wordB,
    difficulty: pair.difficulty,
    themeIds: [...pair.themeIds],
    isActive: pair.isActive,
    createdAt: pair.createdAt.toISOString(),
    updatedAt: pair.updatedAt.toISOString(),
  };
}
