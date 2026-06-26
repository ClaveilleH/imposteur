// Types partagés côté frontend. Ils reflètent les DTO renvoyés par l'API.
// (Décision : duplication assumée plutôt qu'un package monorepo, pour garder
//  la mise en route simple.)

export type Role = 'civilian' | 'impostor' | 'spy';

export interface Theme {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WordPair {
  id: number;
  wordA: string;
  wordB: string;
  difficulty: number;
  themeIds: number[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AssignedPlayer {
  order: number;
  name: string;
  role: Role;
  word: string | null;
}

export interface GameAssignment {
  players: AssignedPlayer[];
  firstPlayerOrder: number;
  wordPairId: number;
  civilianWord: string;
  impostorWord: string;
}

export interface CreateGameRequest {
  playerNames: string[];
  themeIds: number[];
  numberOfImpostors: number;
  numberOfSpies: number;
  difficulty: number;
}

/** Forme d'erreur homogène renvoyée par l'API. */
export interface ApiErrorBody {
  error: { code: string; message: string; details?: unknown };
}
