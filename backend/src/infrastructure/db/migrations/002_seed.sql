-- Données d'exemple pour démarrer (idempotent grâce à ON CONFLICT).

INSERT INTO themes (name) VALUES
  ('Animaux'),
  ('Nourriture'),
  ('Voiture'),
  ('Sport')
ON CONFLICT DO NOTHING;

-- Helper inline : on relie chaque paire à son/ses thème(s) par nom.
WITH t AS (
  SELECT id, name FROM themes
), inserted AS (
  INSERT INTO word_pairs (word_a, word_b, difficulty) VALUES
    ('Chat', 'Chien', 1),
    ('Mouton', 'Brebis', 3),
    ('Lion', 'Tigre', 2),
    ('Café', 'Thé', 1),
    ('Coca-Cola', 'Pepsi', 2),
    ('Pizza', 'Tarte', 3),
    ('Moteur', 'Roue', 2),
    ('Volant', 'Guidon', 4),
    ('Football', 'Rugby', 2),
    ('Tennis', 'Badminton', 3)
  RETURNING id, word_a
)
INSERT INTO word_pair_themes (word_pair_id, theme_id)
SELECT i.id, t.id
FROM inserted i
JOIN t ON t.name = CASE i.word_a
  WHEN 'Chat'      THEN 'Animaux'
  WHEN 'Mouton'    THEN 'Animaux'
  WHEN 'Lion'      THEN 'Animaux'
  WHEN 'Café'      THEN 'Nourriture'
  WHEN 'Coca-Cola' THEN 'Nourriture'
  WHEN 'Pizza'     THEN 'Nourriture'
  WHEN 'Moteur'    THEN 'Voiture'
  WHEN 'Volant'    THEN 'Voiture'
  WHEN 'Football'  THEN 'Sport'
  WHEN 'Tennis'    THEN 'Sport'
END;
