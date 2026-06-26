# Backend — API Impostor

Fastify + PostgreSQL en Clean Architecture, TypeScript strict.

## Couches (`src/`)

| Couche | Dossier | Rôle | Dépend de |
| --- | --- | --- | --- |
| Domain | `domain/` | Entités, ports (interfaces repo), erreurs, **logique pure** (`services/gameSetup.ts`) | rien |
| Application | `application/` | Services (cas d'usage), DTO + mappers | domain |
| Infrastructure | `infrastructure/` | Implémentations PostgreSQL des ports, migrations | domain |
| Interfaces | `interfaces/http/` | Fastify : routes, validation zod, mapping erreurs | application, domain |

`container.ts` est la *composition root* : seul endroit qui connaît les classes concrètes.

## Scripts

```bash
npm run dev        # serveur en watch (tsx)
npm run migrate    # applique les migrations SQL
npm run build      # compile vers dist/
npm start          # lance dist/index.js
npm run typecheck  # tsc --noEmit
```

## API

Public :
- `GET  /health`
- `GET  /api/themes` — thèmes actifs (création de partie)
- `POST /api/games` — crée une partie, renvoie l'attribution complète

Admin (en-tête `x-admin-password`) :
- `POST  /api/admin/login`
- `GET/POST/PATCH /api/admin/themes[...]`
- `GET/POST/PATCH /api/admin/word-pairs[...]`

## Soft delete

Aucune suppression physique. Activer/désactiver = `PATCH .../:id/active { isActive }`.
Seules les données `is_active = true` sont utilisées à la création d'une partie
(thèmes actifs + paires actives).

## Tirage d'une partie

`POST /api/games` :
1. valide la composition (≥ 3 joueurs, ≥ 1 imposteur, ≥ 1 civil) ;
2. récupère les paires **actives** des thèmes choisis à la difficulté exacte ;
3. en tire une au hasard (sinon `409 NO_WORD_PAIR_AVAILABLE`) ;
4. tire les rôles + le mot des civils/imposteurs + le premier joueur
   (`domain/services/gameSetup.ts`, pur et testable, RNG injectable).

## Extension future (prévue, hors V1)

- **Historique / multijoueur** : ajouter une migration `games`/`game_players`,
  un `GameRepository` (port), et persister l'`assignment` dans `GameService`.
  Le domaine ne change pas.
- **Temps réel** : ajouter un transport WebSocket dans `interfaces/`,
  réutilisant les mêmes services applicatifs.
