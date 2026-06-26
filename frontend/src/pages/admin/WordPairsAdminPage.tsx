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
  bulkImportWordPairs,
  type ImportItem,
} from '../../api/admin.api';
import type { Theme, WordPair } from '../../types';

export function WordPairsAdminPage() {
  const password = useAdminStore((s) => s.password)!;
  const [themes, setThemes] = useState<Theme[]>([]);
  const [pairs, setPairs] = useState<WordPair[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Formulaire de création
  const [wordA, setWordA] = useState('');
  const [wordB, setWordB] = useState('');
  const [difficulty, setDifficulty] = useState(1);
  const [selectedThemes, setSelectedThemes] = useState<number[]>([]);

  // Import en masse
  const [importText, setImportText] = useState('');
  const [importMsg, setImportMsg] = useState<{ ok: boolean; text: string } | null>(null);

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

  // Parse le texte collé : une paire par ligne « motA, motB, [difficulté,] thèmes ».
  // Difficulté optionnelle (défaut 3). Thèmes multiples séparés par « ; ».
  function parseImportLines(text: string): { items: ImportItem[]; errors: string[] } {
    const items: ImportItem[] = [];
    const errors: string[] = [];

    text.split('\n').forEach((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      const parts = trimmed.split(',').map((p) => p.trim());
      if (parts.length < 3) {
        errors.push(`Ligne ${i + 1} : format « motA, motB, [difficulté,] thèmes »`);
        return;
      }
      const wordA = parts[0] ?? '';
      const wordB = parts[1] ?? '';

      let difficulty = 3;
      let themesRaw: string;
      if (parts.length === 3) {
        themesRaw = parts[2] ?? '';
      } else {
        const d = Number(parts[2]);
        difficulty = Number.isInteger(d) && d >= 1 && d <= 5 ? d : 3;
        themesRaw = parts.slice(3).join(',');
      }
      const themeNames = themesRaw
        .split(';')
        .map((t) => t.trim())
        .filter(Boolean);

      if (!wordA || !wordB) {
        errors.push(`Ligne ${i + 1} : les deux mots sont requis`);
        return;
      }
      if (themeNames.length === 0) {
        errors.push(`Ligne ${i + 1} : au moins un thème est requis`);
        return;
      }
      items.push({ wordA, wordB, difficulty, themeNames });
    });

    return { items, errors };
  }

  async function handleImport() {
    setImportMsg(null);
    const { items, errors } = parseImportLines(importText);
    if (items.length === 0) {
      setImportMsg({ ok: false, text: errors.join(' · ') || 'Rien à importer.' });
      return;
    }
    try {
      const res = await bulkImportWordPairs(password, items);
      let text = `${res.created} paire(s) importée(s).`;
      if (res.createdThemeNames.length) {
        text += ` Thèmes créés : ${res.createdThemeNames.join(', ')}.`;
      }
      if (errors.length) text += ` ${errors.length} ligne(s) ignorée(s).`;
      setImportMsg({ ok: true, text });
      setImportText('');
      await reload();
    } catch (err) {
      setImportMsg({ ok: false, text: err instanceof ApiError ? err.message : 'Erreur.' });
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

  // Filtrage par mot (A ou B) ou par nom de thème, insensible à la casse.
  const q = search.trim().toLowerCase();
  const filtered = q
    ? pairs.filter(
        (p) =>
          p.wordA.toLowerCase().includes(q) ||
          p.wordB.toLowerCase().includes(q) ||
          p.themeIds.some((id) => themeName(id).toLowerCase().includes(q)),
      )
    : pairs;

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

      {/* Import en masse */}
      <div className="card">
        <h2>Import en masse</h2>
        <p className="muted" style={{ fontSize: '0.8rem', marginTop: 4 }}>
          Une paire par ligne : <code>motA, motB, difficulté, thèmes</code>. Difficulté
          optionnelle (défaut 3), plusieurs thèmes séparés par <code>;</code>. Les thèmes
          inexistants sont créés automatiquement.
        </p>
        <textarea
          rows={5}
          placeholder={'Chat, Chien, 2, Animaux\nCafé, Thé, 1, Nourriture; Boissons\nLion, Tigre, Animaux'}
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
        />
        {importMsg && (
          <p className={importMsg.ok ? 'muted' : 'error'} style={{ marginTop: 8 }}>
            {importMsg.text}
          </p>
        )}
        <button
          className="btn btn-primary btn-block"
          style={{ marginTop: 8 }}
          onClick={handleImport}
        >
          Importer la liste
        </button>
      </div>

      {/* Recherche */}
      <input
        placeholder="Rechercher (mot ou thème)…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <p className="muted" style={{ fontSize: '0.8rem', margin: 0 }}>
        {filtered.length} paire(s){q ? ` sur ${pairs.length}` : ''}
      </p>

      {/* Liste */}
      {filtered.map((p) => (
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
