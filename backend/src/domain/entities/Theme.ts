/**
 * Un thème regroupe des paires de mots (ex. « Animaux », « Voiture »).
 *
 * Décision de modélisation : thème et catégorie sont la même notion. Il n'y a donc
 * qu'un seul niveau de regroupement, relié aux paires par une relation many-to-many.
 */
export interface Theme {
  readonly id: number;
  readonly name: string;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
