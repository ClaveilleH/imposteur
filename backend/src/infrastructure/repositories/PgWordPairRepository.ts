import type { Pool, PoolClient } from 'pg';
import type { WordPair } from '../../domain/entities/WordPair';
import type {
  WordPairRepository,
  CreateWordPairData,
  UpdateWordPairData,
  WordPairQuery,
} from '../../domain/repositories/WordPairRepository';

interface WordPairRow {
  id: number;
  word_a: string;
  word_b: string;
  difficulty: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  theme_ids: number[] | null;
}

function mapRow(row: WordPairRow): WordPair {
  return {
    id: row.id,
    wordA: row.word_a,
    wordB: row.word_b,
    difficulty: row.difficulty,
    themeIds: row.theme_ids ?? [],
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Sélection commune : agrège les théme_ids de chaque paire. */
const SELECT_WITH_THEMES = `
  SELECT wp.*,
         COALESCE(array_agg(wpt.theme_id) FILTER (WHERE wpt.theme_id IS NOT NULL), '{}') AS theme_ids
  FROM word_pairs wp
  LEFT JOIN word_pair_themes wpt ON wpt.word_pair_id = wp.id
`;

export class PgWordPairRepository implements WordPairRepository {
  constructor(private readonly pool: Pool) {}

  async findAll(opts?: { activeOnly?: boolean }): Promise<WordPair[]> {
    const where = opts?.activeOnly ? 'WHERE wp.is_active = TRUE' : '';
    const { rows } = await this.pool.query<WordPairRow>(
      `${SELECT_WITH_THEMES} ${where} GROUP BY wp.id ORDER BY wp.id ASC`,
    );
    return rows.map(mapRow);
  }

  async findById(id: number): Promise<WordPair | null> {
    const { rows } = await this.pool.query<WordPairRow>(
      `${SELECT_WITH_THEMES} WHERE wp.id = $1 GROUP BY wp.id`,
      [id],
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async findCandidates(query: WordPairQuery): Promise<WordPair[]> {
    // Paires actives, difficulté exacte, et liées à AU MOINS un thème demandé.
    const { rows } = await this.pool.query<WordPairRow>(
      `${SELECT_WITH_THEMES}
       WHERE wp.is_active = TRUE
         AND wp.difficulty = $1
         AND EXISTS (
           SELECT 1 FROM word_pair_themes f
           WHERE f.word_pair_id = wp.id AND f.theme_id = ANY($2::int[])
         )
       GROUP BY wp.id`,
      [query.difficulty, query.themeIds],
    );
    return rows.map(mapRow);
  }

  async create(data: CreateWordPairData): Promise<WordPair> {
    return this.withTransaction(async (client) => {
      const { rows } = await client.query<{ id: number }>(
        `INSERT INTO word_pairs (word_a, word_b, difficulty)
         VALUES ($1, $2, $3) RETURNING id`,
        [data.wordA, data.wordB, data.difficulty],
      );
      const id = rows[0]!.id;
      await this.replaceThemes(client, id, data.themeIds);
      return (await this.findByIdWithClient(client, id))!;
    });
  }

  async update(id: number, data: UpdateWordPairData): Promise<WordPair | null> {
    return this.withTransaction(async (client) => {
      const sets: string[] = [];
      const values: unknown[] = [];
      let i = 1;

      if (data.wordA !== undefined) {
        sets.push(`word_a = $${i++}`);
        values.push(data.wordA);
      }
      if (data.wordB !== undefined) {
        sets.push(`word_b = $${i++}`);
        values.push(data.wordB);
      }
      if (data.difficulty !== undefined) {
        sets.push(`difficulty = $${i++}`);
        values.push(data.difficulty);
      }
      if (data.isActive !== undefined) {
        sets.push(`is_active = $${i++}`);
        values.push(data.isActive);
      }

      if (sets.length > 0) {
        values.push(id);
        const res = await client.query(
          `UPDATE word_pairs SET ${sets.join(', ')} WHERE id = $${i}`,
          values,
        );
        if (res.rowCount === 0) {
          return null;
        }
      } else {
        const exists = await client.query('SELECT 1 FROM word_pairs WHERE id = $1', [id]);
        if (exists.rowCount === 0) {
          return null;
        }
      }

      if (data.themeIds !== undefined) {
        await this.replaceThemes(client, id, data.themeIds);
      }

      return this.findByIdWithClient(client, id);
    });
  }

  // --- Helpers internes ---------------------------------------------------

  private async replaceThemes(
    client: PoolClient,
    wordPairId: number,
    themeIds: readonly number[],
  ): Promise<void> {
    await client.query('DELETE FROM word_pair_themes WHERE word_pair_id = $1', [wordPairId]);
    for (const themeId of themeIds) {
      await client.query(
        `INSERT INTO word_pair_themes (word_pair_id, theme_id)
         VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [wordPairId, themeId],
      );
    }
  }

  private async findByIdWithClient(client: PoolClient, id: number): Promise<WordPair | null> {
    const { rows } = await client.query<WordPairRow>(
      `${SELECT_WITH_THEMES} WHERE wp.id = $1 GROUP BY wp.id`,
      [id],
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }

  private async withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}
