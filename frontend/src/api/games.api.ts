import { apiRequest } from './client';
import type { CreateGameRequest, GameAssignment, Theme } from '../types';

export async function fetchActiveThemes(): Promise<Theme[]> {
  const data = await apiRequest<{ themes: Theme[] }>('/themes');
  return data.themes;
}

export async function createGame(request: CreateGameRequest): Promise<GameAssignment> {
  const data = await apiRequest<{ game: GameAssignment }>('/games', {
    method: 'POST',
    body: request,
  });
  return data.game;
}
