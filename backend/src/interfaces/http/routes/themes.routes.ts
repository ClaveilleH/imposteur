import type { FastifyInstance } from 'fastify';
import type { Container } from '../../../container';
import { toThemeDTO } from '../../../application/dto/theme.dto';

/**
 * Routes publiques liées aux thèmes (lecture seule, thèmes actifs uniquement).
 * Utilisées par l'écran de création de partie.
 */
export function themeRoutes(container: Container) {
  return async function (app: FastifyInstance): Promise<void> {
    app.get('/themes', async () => {
      const themes = await container.themeService.listActive();
      return { themes: themes.map(toThemeDTO) };
    });
  };
}
