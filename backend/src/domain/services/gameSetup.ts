import type { AssignedPlayer, GameAssignment } from '../entities/Game';
import type { WordPair } from '../entities/WordPair';
import type { Role } from '../entities/Role';
import { ValidationError } from '../errors/DomainError';

/**
 * Source d'aléa injectable : par défaut Math.random, mais on peut fournir une
 * fonction déterministe dans les tests pour vérifier la distribution des rôles.
 */
export type Rng = () => number;

const defaultRng: Rng = Math.random;

export interface BuildAssignmentParams {
  readonly playerNames: readonly string[];
  readonly numberOfImpostors: number;
  readonly numberOfSpies: number;
  readonly wordPair: WordPair;
  readonly rng?: Rng;
}

/** Mélange (Fisher–Yates) une copie du tableau. */
function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const result = items.slice();
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    // swap
    const a = result[i] as T;
    result[i] = result[j] as T;
    result[j] = a;
  }
  return result;
}

function randomInt(maxExclusive: number, rng: Rng): number {
  return Math.floor(rng() * maxExclusive);
}

/**
 * Valide les contraintes de composition de la partie. Levée AVANT tout tirage.
 */
export function validateComposition(params: {
  playerCount: number;
  numberOfImpostors: number;
  numberOfSpies: number;
}): void {
  const { playerCount, numberOfImpostors, numberOfSpies } = params;

  if (playerCount < 3) {
    throw new ValidationError('Il faut au moins 3 joueurs.');
  }
  if (numberOfImpostors < 1) {
    throw new ValidationError('Il faut au moins 1 imposteur.');
  }
  if (numberOfSpies < 0) {
    throw new ValidationError('Le nombre d’espions ne peut pas être négatif.');
  }

  const civilians = playerCount - numberOfImpostors - numberOfSpies;
  if (civilians < 1) {
    throw new ValidationError(
      'La composition est invalide : il faut au moins 1 civil (joueurs − imposteurs − espions ≥ 1).',
    );
  }
}

/**
 * Construit l'attribution complète d'une partie.
 *
 * Règles :
 * - On choisit aléatoirement lequel des deux mots de la paire est le mot des civils ;
 *   l'autre devient le mot des imposteurs. Ainsi un imposteur voit « un mot » comme
 *   tout le monde et ne sait pas qu'il est l'imposteur.
 * - Les rôles sont tirés au sort uniformément.
 * - Le premier joueur (qui lance le débat) est tiré au sort parmi tous les joueurs.
 */
export function buildGameAssignment(params: BuildAssignmentParams): GameAssignment {
  const { playerNames, numberOfImpostors, numberOfSpies, wordPair } = params;
  const rng = params.rng ?? defaultRng;

  validateComposition({
    playerCount: playerNames.length,
    numberOfImpostors,
    numberOfSpies,
  });

  // 1. Quel mot pour les civils ?
  const civilianFirst = rng() < 0.5;
  const civilianWord = civilianFirst ? wordPair.wordA : wordPair.wordB;
  const impostorWord = civilianFirst ? wordPair.wordB : wordPair.wordA;

  // 2. Attribution des rôles par mélange des positions.
  const positions = shuffle(
    playerNames.map((_, index) => index),
    rng,
  );
  const impostorPositions = new Set(positions.slice(0, numberOfImpostors));
  const spyPositions = new Set(
    positions.slice(numberOfImpostors, numberOfImpostors + numberOfSpies),
  );

  const players: AssignedPlayer[] = playerNames.map((name, order) => {
    let role: Role;
    let word: string | null;
    if (impostorPositions.has(order)) {
      role = 'impostor';
      word = impostorWord;
    } else if (spyPositions.has(order)) {
      role = 'spy';
      word = null;
    } else {
      role = 'civilian';
      word = civilianWord;
    }
    return { order, name, role, word };
  });

  // 3. Premier joueur.
  const firstPlayerOrder = randomInt(players.length, rng);

  return {
    players,
    firstPlayerOrder,
    wordPairId: wordPair.id,
    civilianWord,
    impostorWord,
  };
}

/** Tire une paire au hasard parmi les candidates. */
export function pickRandomWordPair(candidates: readonly WordPair[], rng: Rng = defaultRng): WordPair | null {
  if (candidates.length === 0) {
    return null;
  }
  return candidates[randomInt(candidates.length, rng)] ?? null;
}
