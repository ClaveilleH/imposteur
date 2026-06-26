-- Schéma initial du jeu de l'imposteur.
--
-- Modélisation : « thème » et « catégorie » sont une seule notion (table themes).
-- Une paire de mots appartient à un ou plusieurs thèmes (relation many-to-many
-- via word_pair_themes). Aucune suppression physique : on utilise is_active.

-- Fonction utilitaire pour tenir à jour updated_at.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Thèmes (= catégories) ---------------------------------------------------
CREATE TABLE themes (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX themes_name_unique ON themes (lower(name));

CREATE TRIGGER themes_set_updated_at
  BEFORE UPDATE ON themes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Paires de mots ----------------------------------------------------------
CREATE TABLE word_pairs (
  id         SERIAL PRIMARY KEY,
  word_a     TEXT NOT NULL,
  word_b     TEXT NOT NULL,
  difficulty SMALLINT NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX word_pairs_difficulty_idx ON word_pairs (difficulty);
CREATE INDEX word_pairs_active_idx ON word_pairs (is_active);

CREATE TRIGGER word_pairs_set_updated_at
  BEFORE UPDATE ON word_pairs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Liaison paire <-> thèmes (many-to-many) --------------------------------
CREATE TABLE word_pair_themes (
  word_pair_id INTEGER NOT NULL REFERENCES word_pairs (id) ON DELETE CASCADE,
  theme_id     INTEGER NOT NULL REFERENCES themes (id) ON DELETE CASCADE,
  PRIMARY KEY (word_pair_id, theme_id)
);

CREATE INDEX word_pair_themes_theme_idx ON word_pair_themes (theme_id);

-- Point d'extension (hors V1) --------------------------------------------
-- L'historique des parties et le multijoueur ajouteront ici des tables
-- `games` et `game_players`. Le schéma actuel n'en a pas besoin (V1 sans
-- persistance des parties).
