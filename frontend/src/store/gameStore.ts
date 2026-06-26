import { create } from 'zustand';
import type { GameAssignment } from '../types';

/**
 * État du déroulé d'une partie locale (pass-and-play).
 *
 * Tout est en mémoire : la partie n'est pas persistée (V1). On y stocke
 * l'attribution renvoyée par le serveur et l'avancement (révélation des
 * cartes, joueurs éliminés).
 */
interface GameState {
  game: GameAssignment | null;
  /** Index (order) du joueur en cours de révélation. */
  revealIndex: number;
  /** Orders des joueurs éliminés lors du vote. */
  eliminated: number[];

  setGame: (game: GameAssignment) => void;
  /** Passe au joueur suivant pour la révélation des cartes. */
  nextReveal: () => void;
  /** Élimine un joueur (vote). */
  eliminate: (order: number) => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  game: null,
  revealIndex: 0,
  eliminated: [],

  setGame: (game) => set({ game, revealIndex: 0, eliminated: [] }),
  nextReveal: () => set((s) => ({ revealIndex: s.revealIndex + 1 })),
  eliminate: (order) =>
    set((s) =>
      s.eliminated.includes(order) ? s : { eliminated: [...s.eliminated, order] },
    ),
  reset: () => set({ game: null, revealIndex: 0, eliminated: [] }),
}));
