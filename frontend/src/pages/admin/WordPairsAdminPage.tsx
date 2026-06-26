import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { useAdminStore } from '../../store/adminStore';
import { ApiError } from '../../api/client';
import {
  listThemes,
  listWordPairs,
  createWordPair,
  updateWordPair,
  setWordPairActive,
} from '../../api/admin.api';
import type { Theme, WordPair } from '../../types';

export function WordPairsAdminPage() {
  const password = useAdminStore((s) => s.password)!;
  const [themes, setThemes] = useState<Theme[]>([]);
  const [pairs, setPairs] = useState<WordPair[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Formulaire de création
  const [wordA, setWordA] = useState('');
  const [wordB, setWordB] = useState('');
  const [difficulty, setDifficulty] = useState(1);
  const [selectedThemes, setSelectedThemes] = useState<number[]>([]);

  async function reload() {
    try {
      const [t, p] = await Promise.all([listThemes(password), listWordPairs(password)]);
      setThemes(t);
      setPairs(p);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erreur de chargement.');
    }
  }

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleTheme(id: number) {
    setSelectedThemes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  }

  async function handleCreate() {
    if (!wordA.trim() || !wordB.trim() || selectedThemes.length === 0) {
      setError('Renseigne les deux mots et au moins un thème.');
      return;
    }
    try {
      await createWordPair(password, {
        wordA: wordA.trim(),
        wordB: wordB.trim(),
        difficulty,
        themeIds: selectedThemes,
      });
      setWordA('');
      setWordB('');
      setDifficulty(1);
      setSelectedThemes([]);
      setError(null);
      await reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erreur.');
    }
  }

  async function handleDifficulty(pair: WordPair, value: number) {
    await updateWordPair(password, pair.id, { difficulty: value });
    await reload();
  }

  async function handleToggle(pair: WordPair) {
    await setWordPairActive(password, pair.id, !pair.isActive);
    await reload();
  }

  const themeName = (id: number) => themes.find((t) => t.id === id)?.name ?? `#${id}`;

  return (
    <Layout>
      <Link to="/admin" className="muted">
        ← Tableau de bord
      </Link>
      <h1>Paires de mots</h1>
      {error && <div className="error">{error}</div>}

      {/* Création */}
      <div className="card">
        <h2>Nouvelle paire</h2>
        <div className="row" style={{ marginTop: 8 }}>
          <input placeholder="Mot A" value={wordA} onChange={(e) => setWordA(e.target.value)} />
          <input placeholder="Mot B" value={wordB} onChange={(e) => setWordB(e.target.value)} />
        </div>
        <div className="field" style={{ marginTop: 10 }}>
          <label>Difficulté : {difficulty}</label>
          <input
            type="range"
            min={1}
            max={5}
            value={difficulty}
            onChange={(e) => setDifficulty(Number(e.target.value))}
          />
        </div>
        <label>Thèmes</label>
        <div className="chips">
          {themes.map((t) => (
            <span
              key={t.id}
              className={`chip ${selectedThemes.includes(t.id) ? 'selected' : ''}`}
              onClick={() => toggleTheme(t.id)}
            >
              {t.name}
            </span>
          ))}
        </div>
        <button className="btn btn-primary btn-block" style={{ marginTop: 12 }} onClick={handleCreate}>
          Ajouter la paire
        </button>
      </div>

      {/* Liste */}
      {pairs.map((p) => (
        <div key={p.id} className={`list-item ${p.isActive ? '' : 'inactive'}`}>
          <div>
            <div>
              <strong>{p.wordA}</strong> / <strong>{p.wordB}</strong>
            </div>
            <div className="muted" style={{ fontSize: '0.8rem' }}>
              {p.themeIds.map(themeName).join(', ')}
            </div>
          </div>
          <div className="row" style={{ flex: 0, gap: 8, alignItems: 'center' }}>
            <select
              value={p.difficulty}
              onChange={(e) => handleDifficulty(p, Number(e.target.value))}
              style={{ width: 64 }}
            >
              {[1, 2, 3, 4, 5].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <button className="btn" onClick={() => handleToggle(p)}>
              {p.isActive ? 'Désactiver' : 'Activer'}
            </button>
          </div>
        </div>
      ))}
    </Layout>
  );
}
