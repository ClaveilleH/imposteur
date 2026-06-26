# Impostor — jeu de l'imposteur (type Undercover)

Application web du jeu de l'imposteur. V1 = partie locale "pass-and-play" sur un seul
appareil, avec une architecture pensée pour ajouter plus tard le multijoueur en ligne
et l'historique des parties.

## Stack

- **Frontend** : React + TypeScript + Vite + React Router + Zustand
- **Backend** : Node.js + Fastify + TypeScript (Clean Architecture)
- **Base de données** : PostgreSQL (via `pg`)

## Démarrage rapide

```bash
# 1. Lancer PostgreSQL
docker compose up -d

# 2. Backend
cd backend
cp .env.example .env
npm install
npm run migrate      # crée le schéma + données de seed
npm run dev          # http://localhost:3000

# 3. Frontend (autre terminal)
cd frontend
cp .env.example .env
npm install
npm run dev          # http://localhost:5173
```

Mot de passe admin par défaut : voir `ADMIN_PASSWORD` dans `backend/.env`.

## Déploiement (VPS + Traefik)

En production : **https://undercover.claveille.fr**

Voir **[DEPLOY.md](./DEPLOY.md)** : Dockerfiles + `docker-compose.prod.yml`
branché sur un Traefik existant (un seul domaine, front à la racine et API
sous `/api`).

**Push-to-deploy** : un `git push` sur `main` redéploie automatiquement le VPS
(cron + `deploy.sh`, en moins d'une minute). Détails dans DEPLOY.md.

## Organisation du dépôt

```
impostor/
├── backend/    API Fastify + accès PostgreSQL (Clean Architecture)
├── frontend/   SPA React
└── docker-compose.yml
```

## Choix d'architecture

Voir `backend/README.md` et `frontend/README.md` pour le détail des couches.

Le backend suit une **Clean Architecture** en 4 couches concentriques :

```
domain          → entités métier + ports (interfaces repository) + règles pures
application     → use-cases / services (orchestration), DTO
infrastructure  → implémentations PostgreSQL des ports, migrations
interfaces      → HTTP (Fastify) : routes, validation, mapping erreurs
```

La règle de dépendance : les couches internes ne connaissent jamais les couches
externes. Le `domain` ne dépend de rien ; `infrastructure` et `interfaces`
dépendent du `domain`. Le câblage (injection de dépendances) se fait dans
`container.ts`.

### Pourquoi cette séparation ?

- La logique de jeu (tirage des rôles, distribution des mots) est **pure** et
  testable sans base de données ni serveur HTTP (`domain/services/gameSetup.ts`).
- Passer du mode local au mode réseau ne touchera que la couche `interfaces`
  (ajout de WebSocket) et un nouveau service applicatif, sans réécrire le domaine.
- Remplacer PostgreSQL revient à fournir une autre implémentation des ports.
