import type { WordPairRepository } from '../../domain/repositories/WordPairRepository';
import type { GameAssignment } from '../../domain/entities/Game';
import {
  buildGameAssignment,
  pickRandomWordPair,
  validateComposition,
  type Rng,
} from '../../domain/services/gameSetup';
import { NoWordPairAvailableError } from '../../domain/errors/DomainError';
import type { CreateGameRequestDTO } from '../dto/game.dto';

/**
 * Cas d'usage « créer une partie ».
 *
 * V1 : on tire la paire + les rôles et on renvoie le résultat. Aucune persistance.
 * Pour ajouter l'historique plus tard : injecter un `GameRepository` et
 * sauvegarder l'`assignment` ici, sans toucher au domaine.
 */
export class GameService {
  constructor(
    private readonly wordPairs: WordPairRepository,
    /** Injectable pour les tests déterministes. */
    private readonly rng: Rng = Math.random,
  ) {}

  async createGame(request: CreateGameRequestDTO): Promise<GameAssignment> {
    // Validation métier amont (avant tout accès BDD).
    validateComposition({
      playerCount: request.playerNames.length,
      numberOfImpostors: request.numberOfImpostors,
      numberOfSpies: request.numberOfSpies,
    });

    const candidates = await this.wordPairs.findCandidates({
      themeIds: request.themeIds,
      difficulty: request.difficulty,
    });

    const wordPair = pickRandomWordPair(candidates, this.rng);
    if (!wordPair) {
      throw new NoWordPairAvailableError();
    }

    return buildGameAssignment({
      playerNames: request.playerNames,
      numberOfImpostors: request.numberOfImpostors,
      numberOfSpies: request.numberOfSpies,
      wordPair,
      rng: this.rng,
    });
  }
}
