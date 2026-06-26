import type { Pool } from 'pg';
import type { Theme } from '../../domain/entities/Theme';
import type {
  ThemeRepository,
  CreateThemeData,
  UpdateThemeData,
} from '../../domain/repositories/ThemeRepository';

interface ThemeRow {
  id: number;
  name: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

function mapRow(row: ThemeRow): Theme {
  return {
    id: row.id,
    name: row.name,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class PgThemeRepository implements ThemeRepository {
  constructor(private readonly pool: Pool) {}

  async findAll(opts?: { activeOnly?: boolean }): Promise<Theme[]> {
    const where = opts?.activeOnly ? 'WHERE is_active = TRUE' : '';
    const { rows } = await this.pool.query<ThemeRow>(
      `SELECT * FROM themes ${where} ORDER BY name ASC`,
    );
    return rows.map(mapRow);
  }

  async findById(id: number): Promise<Theme | null> {
    const { rows } = await this.pool.query<ThemeRow>('SELECT * FROM themes WHERE id = $1', [id]);
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async findByName(name: string): Promise<Theme | null> {
    const { rows } = await this.pool.query<ThemeRow>(
      'SELECT * FROM themes WHERE lower(name) = lower($1) LIMIT 1',
      [name],
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async create(data: CreateThemeData): Promise<Theme> {
    const { rows } = await this.pool.query<ThemeRow>(
      'INSERT INTO themes (name) VALUES ($1) RETURNING *',
      [data.name],
    );
    return mapRow(rows[0]!);
  }

  async update(id: number, data: UpdateThemeData): Promise<Theme | null> {
    // Construction dynamique du SET pour ne toucher qu'aux champs fournis.
    const sets: string[] = [];
    const values: unknown[] = [];
    let i = 1;

    if (data.name !== undefined) {
      sets.push(`name = $${i++}`);
      values.push(data.name);
    }
    if (data.isActive !== undefined) {
      sets.push(`is_active = $${i++}`);
      values.push(data.isActive);
    }
    if (sets.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const { rows } = await this.pool.query<ThemeRow>(
      `UPDATE themes SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`,
      values,
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }
}
