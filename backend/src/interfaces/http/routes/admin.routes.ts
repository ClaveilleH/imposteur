import type { FastifyInstance } from 'fastify';
import type { Container } from '../../../container';
import { makeAdminGuard } from '../plugins/adminAuth';
import { toThemeDTO } from '../../../application/dto/theme.dto';
import { toWordPairDTO } from '../../../application/dto/wordPair.dto';
import {
  adminLoginSchema,
  createThemeSchema,
  updateThemeSchema,
  createWordPairSchema,
  updateWordPairSchema,
  bulkImportWordPairsSchema,
  setActiveSchema,
  idParamSchema,
} from '../schemas';

/**
 * Routes du panneau d'administration, montées sous /api/admin.
 * Toutes protégées par le mot de passe admin (en-tête x-admin-password),
 * SAUF /admin/login qui sert justement à le vérifier.
 */
export function adminRoutes(container: Container) {
  const guard = makeAdminGuard(container.adminService);

  return async function (app: FastifyInstance): Promise<void> {
    // --- Login ------------------------------------------------------------
    app.post('/admin/login', async (request) => {
      const { password } = adminLoginSchema.parse(request.body);
      container.adminService.verifyPassword(password); // lève 401 si invalide
      return { ok: true };
    });

    // --- Routes protégées -------------------------------------------------
    await app.register(async (admin) => {
      admin.addHook('preHandler', guard);

      // Thèmes ------------------------------------------------------------
      admin.get('/admin/themes', async () => {
        const themes = await container.themeService.listAll();
        return { themes: themes.map(toThemeDTO) };
      });

      admin.post('/admin/themes', async (request, reply) => {
        const data = createThemeSchema.parse(request.body);
        const theme = await container.themeService.create(data);
        reply.status(201);
        return { theme: toThemeDTO(theme) };
      });

      admin.patch('/admin/themes/:id', async (request) => {
        const { id } = idParamSchema.parse(request.params);
        const data = updateThemeSchema.parse(request.body);
        const theme = await container.themeService.update(id, data);
        return { theme: toThemeDTO(theme) };
      });

      admin.patch('/admin/themes/:id/active', async (request) => {
        const { id } = idParamSchema.parse(request.params);
        const { isActive } = setActiveSchema.parse(request.body);
        const theme = await container.themeService.setActive(id, isActive);
        return { theme: toThemeDTO(theme) };
      });

      // Paires de mots ----------------------------------------------------
      admin.get('/admin/word-pairs', async () => {
        const pairs = await container.wordPairService.listAll();
        return { wordPairs: pairs.map(toWordPairDTO) };
      });

      admin.post('/admin/word-pairs', async (request, reply) => {
        const data = createWordPairSchema.parse(request.body);
        const pair = await container.wordPairService.create(data);
        reply.status(201);
        return { wordPair: toWordPairDTO(pair) };
      });

      // Import en masse : thèmes par nom, créés automatiquement si absents.
      admin.post('/admin/word-pairs/bulk', async (request, reply) => {
        const { items } = bulkImportWordPairsSchema.parse(request.body);
        const result = await container.wordPairImportService.import(items);
        reply.status(201);
        return {
          created: result.created.length,
          createdThemeNames: result.createdThemeNames,
          wordPairs: result.created.map(toWordPairDTO),
        };
      });

      admin.patch('/admin/word-pairs/:id', async (request) => {
        const { id } = idParamSchema.parse(request.params);
        const data = updateWordPairSchema.parse(request.body);
        const pair = await container.wordPairService.update(id, data);
        return { wordPair: toWordPairDTO(pair) };
      });

      admin.patch('/admin/word-pairs/:id/active', async (request) => {
        const { id } = idParamSchema.parse(request.params);
        const { isActive } = setActiveSchema.parse(request.body);
        const pair = await container.wordPairService.setActive(id, isActive);
        return { wordPair: toWordPairDTO(pair) };
      });
    });
  };
}
