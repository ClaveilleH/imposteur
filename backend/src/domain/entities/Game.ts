import type { Role } from './Role';

/**
 * Un joueur tel qu'il résulte du tirage : son rôle et le mot qu'il voit.
 * `word` vaut `null` pour les espions (spy).
 */
export interface AssignedPlayer {
  /** Position dans l'ordre de passage de l'appareil (0..N-1). */
  readonly order: number;
  readonly name: string;
  readonly role: Role;
  readonly word: string | null;
}

/**
 * Résultat complet d'une partie tirée par le serveur.
 *
 * V1 : ce résultat est renvoyé au client et n'est PAS persisté.
 * Point d'extension (historique / multijoueur) : introduire une entité `Game`
 * avec un identifiant et un `GameRepository`, puis sauvegarder cet objet.
 */
export interface GameAssignment {
  readonly players: readonly AssignedPlayer[];
  /** `order` du joueur qui commence le débat. */
  readonly firstPlayerOrder: number;
  /** Paire utilisée (utile pour debug / futur historique). */
  readonly wordPairId: number;
  /** Mot donné aux civils. */
  readonly civilianWord: string;
  /** Mot donné aux imposteurs. */
  readonly impostorWord: string;
}
