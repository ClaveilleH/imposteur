import { apiRequest } from './client';
import type { Theme, WordPair } from '../types';

/** Toutes les requêtes admin transmettent le mot de passe en en-tête. */

export function adminLogin(password: string): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>('/admin/login', { method: 'POST', body: { password } });
}

// --- Thèmes ---------------------------------------------------------------

export async function listThemes(password: string): Promise<Theme[]> {
  const data = await apiRequest<{ themes: Theme[] }>('/admin/themes', { adminPassword: password });
  return data.themes;
}

export async function createTheme(password: string, name: string): Promise<Theme> {
  const data = await apiRequest<{ theme: Theme }>('/admin/themes', {
    method: 'POST',
    body: { name },
    adminPassword: password,
  });
  return data.theme;
}

export async function updateTheme(
  password: string,
  id: number,
  patch: { name?: string; isActive?: boolean },
): Promise<Theme> {
  const data = await apiRequest<{ theme: Theme }>(`/admin/themes/${id}`, {
    method: 'PATCH',
    body: patch,
    adminPassword: password,
  });
  return data.theme;
}

export async function setThemeActive(password: string, id: number, isActive: boolean): Promise<Theme> {
  const data = await apiRequest<{ theme: Theme }>(`/admin/themes/${id}/active`, {
    method: 'PATCH',
    body: { isActive },
    adminPassword: password,
  });
  return data.theme;
}

// --- Paires de mots -------------------------------------------------------

export async function listWordPairs(password: string): Promise<WordPair[]> {
  const data = await apiRequest<{ wordPairs: WordPair[] }>('/admin/word-pairs', {
    adminPassword: password,
  });
  return data.wordPairs;
}

export interface ImportItem {
  wordA: string;
  wordB: string;
  difficulty: number;
  themeNames: string[];
}

export interface ImportResult {
  created: number;
  createdThemeNames: string[];
  wordPairs: WordPair[];
}

export async function bulkImportWordPairs(
  password: string,
  items: ImportItem[],
): Promise<ImportResult> {
  return apiRequest<ImportResult>('/admin/word-pairs/bulk', {
    method: 'POST',
    body: { items },
    adminPassword: password,
  });
}

export async function createWordPair(
  password: string,
  payload: { wordA: string; wordB: string; difficulty: number; themeIds: number[] },
): Promise<WordPair> {
  const data = await apiRequest<{ wordPair: WordPair }>('/admin/word-pairs', {
    method: 'POST',
    body: payload,
    adminPassword: password,
  });
  return data.wordPair;
}

export async function updateWordPair(
  password: string,
  id: number,
  patch: {
    wordA?: string;
    wordB?: string;
    difficulty?: number;
    themeIds?: number[];
    isActive?: boolean;
  },
): Promise<WordPair> {
  const data = await apiRequest<{ wordPair: WordPair }>(`/admin/word-pairs/${id}`, {
    method: 'PATCH',
    body: patch,
    adminPassword: password,
  });
  return data.wordPair;
}

export async function setWordPairActive(
  password: string,
  id: number,
  isActive: boolean,
): Promise<WordPair> {
  const data = await apiRequest<{ wordPair: WordPair }>(`/admin/word-pairs/${id}/active`, {
    method: 'PATCH',
    body: { isActive },
    adminPassword: password,
  });
  return data.wordPair;
}
