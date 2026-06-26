import type { GameAssignment } from '../../domain/entities/Game';
import type { Role } from '../../domain/entities/Role';

/** Entrée : requête de création de partie. */
export interface CreateGameRequestDTO {
  playerNames: string[];
  themeIds: number[];
  numberOfImpostors: number;
  numberOfSpies: number;
  difficulty: number;
}

export interface AssignedPlayerDTO {
  order: number;
  name: string;
  role: Role;
  word: string | null;
}

/** Sortie : attribution complète de la partie. */
export interface GameAssignmentDTO {
  players: AssignedPlayerDTO[];
  firstPlayerOrder: number;
  wordPairId: number;
  civilianWord: string;
  impostorWord: string;
}

export function toGameAssignmentDTO(assignment: GameAssignment): GameAssignmentDTO {
  return {
    players: assignment.players.map((p) => ({
      order: p.order,
      name: p.name,
      role: p.role,
      word: p.word,
    })),
    firstPlayerOrder: assignment.firstPlayerOrder,
    wordPairId: assignment.wordPairId,
    civilianWord: assignment.civilianWord,
    impostorWord: assignment.impostorWord,
  };
}
