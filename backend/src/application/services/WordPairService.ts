import type {
  WordPairRepository,
  CreateWordPairData,
  UpdateWordPairData,
} from '../../domain/repositories/WordPairRepository';
import type { WordPair } from '../../domain/entities/WordPair';
import { NotFoundError } from '../../domain/errors/DomainError';

export class WordPairService {
  constructor(private readonly wordPairs: WordPairRepository) {}

  listAll(): Promise<WordPair[]> {
    return this.wordPairs.findAll();
  }

  create(data: CreateWordPairData): Promise<WordPair> {
    return this.wordPairs.create(data);
  }

  async update(id: number, data: UpdateWordPairData): Promise<WordPair> {
    const updated = await this.wordPairs.update(id, data);
    if (!updated) {
      throw new NotFoundError(`Paire de mots introuvable : ${id}`);
    }
    return updated;
  }

  setDifficulty(id: number, difficulty: number): Promise<WordPair> {
    return this.update(id, { difficulty });
  }

  /** Active/désactive (soft delete). */
  setActive(id: number, isActive: boolean): Promise<WordPair> {
    return this.update(id, { isActive });
  }
}
