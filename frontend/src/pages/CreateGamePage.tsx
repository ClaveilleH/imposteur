import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { fetchActiveThemes, createGame } from '../api/games.api';
import { ApiError } from '../api/client';
import { useGameStore } from '../store/gameStore';
import type { Theme } from '../types';

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 20;

export function CreateGamePage() {
  const navigate = useNavigate();
  const setGame = useGameStore((s) => s.setGame);
  const saveSettings = useGameStore((s) => s.saveSettings);
  const lastSettings = useGameStore((s) => s.lastSettings);

  // Valeurs initiales : on réutilise les derniers paramètres saisis si présents.
  const [themes, setThemes] = useState<Theme[]>([]);
  const [selectedThemes, setSelectedThemes] = useState<number[]>(lastSettings?.themeIds ?? []);
  const [names, setNames] = useState<string[]>(lastSettings?.playerNames ?? ['', '', '']);
  const [numberOfImpostors, setNumberOfImpostors] = useState(lastSettings?.numberOfImpostors ?? 1);
  const [numberOfSpies, setNumberOfSpies] = useState(lastSettings?.numberOfSpies ?? 0);
  const [difficulty, setDifficulty] = useState(lastSettings?.difficulty ?? 1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchActiveThemes()
      .then(setThemes)
      .catch(() => setError('Impossible de charger les thèmes.'));
  }, []);

  const playerCount = names.length;
  const civilians = playerCount - numberOfImpostors - numberOfSpies;

  const compositionOk = useMemo(
    () =>
      playerCount >= MIN_PLAYERS &&
      numberOfImpostors >= 1 &&
      numberOfSpies >= 0 &&
      civilians >= 1 &&
      selectedThemes.length >= 1 &&
      names.every((n) => n.trim().length > 0),
    [playerCount, numberOfImpostors, numberOfSpies, civilians, selectedThemes, names],
  );

  function setPlayerCount(count: number) {
    const clamped = Math.max(MIN_PLAYERS, Math.min(MAX_PLAYERS, count));
    setNames((prev) => {
      const next = prev.slice(0, clamped);
      while (next.length < clamped) next.push('');
      return next;
    });
  }

  function setName(index: number, value: string) {
    setNames((prev) => prev.map((n, i) => (i === index ? value : n)));
  }

  function toggleTheme(id: number) {
    setSelectedThemes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  }

  // Imposteurs : entre 1 et (joueurs − espions − 1), pour garder au moins 1 civil.
  function changeImpostors(delta: number) {
    const max = playerCount - numberOfSpies - 1;
    setNumberOfImpostors((prev) => Math.max(1, Math.min(max, prev + delta)));
  }

  // Espions : entre 0 et (joueurs − imposteurs − 1).
  function changeSpies(delta: number) {
    const max = playerCount - numberOfImpostors - 1;
    setNumberOfSpies((prev) => Math.max(0, Math.min(max, prev + delta)));
  }

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    try {
      const settings = {
        playerNames: names.map((n) => n.trim()),
        themeIds: selectedThemes,
        numberOfImpostors,
        numberOfSpies,
        difficulty,
      };
      // Mémorise les paramètres pour la prochaine partie avant l'appel réseau.
      saveSettings(settings);
      const assignment = await createGame(settings);
      setGame(assignment);
      navigate('/reveal');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erreur inattendue.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <h1>Nouvelle partie</h1>
      {error && <div className="error">{error}</div>}

      <div className="field">
        <label>Nombre de joueurs</label>
        <div className="row">
          <button className="btn" onClick={() => setPlayerCount(playerCount - 1)}>
            −
          </button>
          <div className="btn" style={{ pointerEvents: 'none' }}>
            {playerCount}
          </div>
          <button className="btn" onClick={() => setPlayerCount(playerCount + 1)}>
            +
          </button>
        </div>
      </div>

      <div className="field">
        <label>Noms des joueurs</label>
        {names.map((name, i) => (
          <input
            key={i}
            value={name}
            placeholder={`Joueur ${i + 1}`}
            onChange={(e) => setName(i, e.target.value)}
            style={{ marginBottom: 8 }}
          />
        ))}
      </div>

      <div className="field">
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
          {themes.length === 0 && <span className="muted">Aucun thème actif.</span>}
        </div>
      </div>

      <div className="row">
        <div className="field">
          <label>Imposteurs</label>
          <div className="row">
            <button className="btn" onClick={() => changeImpostors(-1)}>
              −
            </button>
            <div className="btn" style={{ pointerEvents: 'none' }}>
              {numberOfImpostors}
            </div>
            <button className="btn" onClick={() => changeImpostors(1)}>
              +
            </button>
          </div>
        </div>
        <div className="field">
          <label>Espions</label>
          <div className="row">
            <button className="btn" onClick={() => changeSpies(-1)}>
              −
            </button>
            <div className="btn" style={{ pointerEvents: 'none' }}>
              {numberOfSpies}
            </div>
            <button className="btn" onClick={() => changeSpies(1)}>
              +
            </button>
          </div>
        </div>
      </div>

      <div className="field">
        <label>Difficulté : {difficulty}</label>
        <input
          type="range"
          min={1}
          max={5}
          value={difficulty}
          onChange={(e) => setDifficulty(Number(e.target.value))}
        />
      </div>

      <p className="muted">
        Composition : {civilians} civil(s), {numberOfImpostors} imposteur(s),{' '}
        {numberOfSpies} espion(s).
      </p>

      <button
        className="btn btn-primary btn-block"
        disabled={!compositionOk || loading}
        onClick={handleSubmit}
      >
        {loading ? 'Création…' : 'Lancer la partie'}
      </button>
    </Layout>
  );
}
