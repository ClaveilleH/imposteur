import { z } from 'zod';
import { MIN_DIFFICULTY, MAX_DIFFICULTY } from '../../../domain/entities/WordPair';

const difficulty = z.number().int().min(MIN_DIFFICULTY).max(MAX_DIFFICULTY);
const name = z.string().trim().min(1).max(100);
const word = z.string().trim().min(1).max(100);

/** Création de partie. */
export const createGameSchema = z.object({
  playerNames: z.array(name).min(3),
  themeIds: z.array(z.number().int().positive()).min(1),
  numberOfImpostors: z.number().int().min(1),
  numberOfSpies: z.number().int().min(0),
  difficulty,
});

/** Thèmes. */
export const createThemeSchema = z.object({ name });
export const updateThemeSchema = z
  .object({ name: name.optional(), isActive: z.boolean().optional() })
  .refine((d) => Object.keys(d).length > 0, { message: 'Aucun champ à mettre à jour.' });

/** Paires de mots. */
export const createWordPairSchema = z.object({
  wordA: word,
  wordB: word,
  difficulty,
  themeIds: z.array(z.number().int().positive()).min(1),
});
export const updateWordPairSchema = z
  .object({
    wordA: word.optional(),
    wordB: word.optional(),
    difficulty: difficulty.optional(),
    themeIds: z.array(z.number().int().positive()).min(1).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: 'Aucun champ à mettre à jour.' });

/** Import en masse de paires de mots (thèmes par nom, créés si absents). */
export const bulkImportWordPairsSchema = z.object({
  items: z
    .array(
      z.object({
        wordA: word,
        wordB: word,
        difficulty,
        themeNames: z.array(name).min(1),
      }),
    )
    .min(1)
    .max(500),
});

/** Bascule active/inactive partagée. */
export const setActiveSchema = z.object({ isActive: z.boolean() });

/** Login admin. */
export const adminLoginSchema = z.object({ password: z.string().min(1) });

/** Param `:id` numérique. */
export const idParamSchema = z.object({ id: z.coerce.number().int().positive() });
