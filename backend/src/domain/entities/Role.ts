/**
 * Les trois rôles possibles d'un joueur.
 *
 * - civilian : reçoit le mot principal.
 * - impostor : reçoit l'AUTRE mot de la paire. Côté écran il est traité comme un
 *   civil (il voit juste « un mot ») : il ne doit pas savoir qu'il est l'imposteur.
 * - spy      : ne reçoit aucun mot.
 */
export const ROLES = ['civilian', 'impostor', 'spy'] as const;

export type Role = (typeof ROLES)[number];
