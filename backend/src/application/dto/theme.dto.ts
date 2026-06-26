import type { Theme } from '../../domain/entities/Theme';

/** Représentation d'un thème renvoyée par l'API. */
export interface ThemeDTO {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function toThemeDTO(theme: Theme): ThemeDTO {
  return {
    id: theme.id,
    name: theme.name,
    isActive: theme.isActive,
    createdAt: theme.createdAt.toISOString(),
    updatedAt: theme.updatedAt.toISOString(),
  };
}
