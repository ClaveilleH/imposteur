# Déploiement sur VPS derrière Traefik

Prérequis : Docker + un **Traefik déjà en place** avec un réseau Docker externe
et un entrypoint HTTP (`web`) ou HTTPS (`websecure`).

## 1. Récupérer le nom du réseau Traefik

```bash
docker network ls
```

Repère le réseau de ta stack Traefik (souvent `traefik`, `proxy` ou `web`).

## 2. Configurer

```bash
cp .env.prod.example .env
nano .env
```

À renseigner :
- `DOMAIN` — ex. `impostor.tondomaine.fr` (le DNS de ce domaine doit pointer vers le VPS)
- `TRAEFIK_NETWORK` — le réseau trouvé à l'étape 1
- `TRAEFIK_ENTRYPOINT` — `web` (HTTP) ou `websecure` (HTTPS)
- `ADMIN_PASSWORD`, `POSTGRES_PASSWORD` — change-les

## 3. Démarrer

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Au premier démarrage, le backend **applique les migrations automatiquement**
(création des tables + données d'exemple), puis lance l'API.

Vérifier :
```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f backend
curl https://$DOMAIN/api/themes   # ou http:// selon ton entrypoint
```

Le site est sur `https://$DOMAIN`, l'API sur `https://$DOMAIN/api`.

## Comment ça marche

- **Un seul domaine.** Deux routeurs Traefik sur le même `Host` :
  - `impostor-api` : `Host(DOMAIN) && PathPrefix(/api)`, **priorité 100** → backend (port 3000)
  - `impostor-web` : `Host(DOMAIN)`, priorité 1 → frontend nginx (port 80)
  La priorité fait que `/api/*` part au backend, tout le reste au front.
- Le frontend appelle l'API en **relatif** (`/api/...`) : même origine, donc **pas de CORS**.
- `db` est sur un réseau **privé** (`internal`), jamais exposé à Traefik ni à Internet.
- Le volume `pgdata` **persiste** la base entre les redémarrages.

## Activer le HTTPS (Let's Encrypt via Traefik)

Si ton Traefik gère Let's Encrypt avec un certresolver :

1. Mets `TRAEFIK_ENTRYPOINT=websecure` et `CERT_RESOLVER=<nom-de-ton-resolver>` dans `.env`.
2. Décommente les 2 lignes `tls.*` de chaque service dans `docker-compose.prod.yml`.
3. `docker compose -f docker-compose.prod.yml up -d`.

## Mises à jour

```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

## Dépannage

- **404 Traefik** : `DOMAIN` ou DNS incorrect, ou le conteneur n'est pas sur le bon
  réseau (`TRAEFIK_NETWORK`).
- **Backend qui redémarre** : regarde `logs backend`. Souvent la base pas encore
  prête au tout premier boot — le `depends_on healthcheck` gère ça, sinon relance.
- **`network <nom> declared as external, but could not be found`** : le nom dans
  `TRAEFIK_NETWORK` ne correspond pas à `docker network ls`.
