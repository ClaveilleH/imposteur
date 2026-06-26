import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { useAdminStore } from '../../store/adminStore';
import { ApiError } from '../../api/client';
import { listThemes, createTheme, updateTheme, setThemeActive } from '../../api/admin.api';
import type { Theme } from '../../types';

export function ThemesAdminPage() {
  const password = useAdminStore((s) => s.password)!;
  const [themes, setThemes] = useState<Theme[]>([]);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  async function reload() {
    try {
      setThemes(await listThemes(password));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erreur de chargement.');
    }
  }

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate() {
    if (!newName.trim()) return;
    try {
      await createTheme(password, newName.trim());
      setNewName('');
      await reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erreur.');
    }
  }

  async function handleRename(theme: Theme) {
    const name = window.prompt('Nouveau nom du thème', theme.name);
    if (!name || name.trim() === theme.name) return;
    await updateTheme(password, theme.id, { name: name.trim() });
    await reload();
  }

  async function handleToggle(theme: Theme) {
    await setThemeActive(password, theme.id, !theme.isActive);
    await reload();
  }

  return (
    <Layout>
      <Link to="/admin" className="muted">
        ← Tableau de bord
      </Link>
      <h1>Thèmes</h1>
      {error && <div className="error">{error}</div>}

      <div className="row">
        <input
          placeholder="Nouveau thème"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
        />
        <button className="btn btn-primary" style={{ flex: 0 }} onClick={handleCreate}>
          Ajouter
        </button>
      </div>

      <input
        placeholder="Rechercher un thème…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginTop: 4 }}
      />

      {themes
        .filter((t) => t.name.toLowerCase().includes(search.trim().toLowerCase()))
        .map((t) => (
        <div key={t.id} className={`list-item ${t.isActive ? '' : 'inactive'}`}>
          <span>{t.name}</span>
          <div className="row" style={{ flex: 0, gap: 8 }}>
            <button className="btn" onClick={() => handleRename(t)}>
              Renommer
            </button>
            <button className="btn" onClick={() => handleToggle(t)}>
              {t.isActive ? 'Désactiver' : 'Activer'}
            </button>
          </div>
        </div>
      ))}
    </Layout>
  );
}
