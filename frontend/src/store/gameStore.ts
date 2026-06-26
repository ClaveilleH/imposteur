import { create } from 'zustand';
import type { GameAssignment } from '../types';

/** Paramètres de création réutilisés d'une partie à l'autre. */
export interface GameSettings {
  playerNames: string[];
  themeIds: number[];
  numberOfImpostors: number;
  numberOfSpies: number;
  difficulty: number;
}

const SETTINGS_KEY = 'impostor.lastSettings';

function loadSettings(): GameSettings | null {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? (JSON.parse(raw) as GameSettings) : null;
  } catch {
    return null;
  }
}

/**
 * État du déroulé d'une partie locale (pass-and-play).
 *
 * `lastSettings` survit à `reset()` (et est persisté en localStorage) pour
 * pré-remplir l'écran de création quand on relance une partie.
 */
interface GameState {
  game: GameAssignment | null;
  /** Index (order) du joueur en cours de révélation. */
  revealIndex: number;
  /** Orders des joueurs éliminés lors du vote. */
  eliminated: number[];
  /** Derniers paramètres de création saisis. */
  lastSettings: GameSettings | null;

  setGame: (game: GameAssignment) => void;
  /** Passe au joueur suivant pour la révélation des cartes. */
  nextReveal: () => void;
  /** Élimine un joueur (vote). */
  eliminate: (order: number) => void;
  /** Mémorise les paramètres de création (persistés). */
  saveSettings: (settings: GameSettings) => void;
  /** Réinitialise la partie en cours, SANS effacer lastSettings. */
  reset: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  game: null,
  revealIndex: 0,
  eliminated: [],
  lastSettings: loadSettings(),

  setGame: (game) => set({ game, revealIndex: 0, eliminated: [] }),
  nextReveal: () => set((s) => ({ revealIndex: s.revealIndex + 1 })),
  eliminate: (order) =>
    set((s) =>
      s.eliminated.includes(order) ? s : { eliminated: [...s.eliminated, order] },
    ),
  saveSettings: (settings) => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      /* localStorage indisponible : on garde au moins l'état mémoire */
    }
    set({ lastSettings: settings });
  },
  reset: () => set({ game: null, revealIndex: 0, eliminated: [] }),
}));
