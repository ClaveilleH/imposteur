# Frontend — Impostor

SPA React + TypeScript (Vite). Mobile-first.

## Scripts

```bash
npm run dev        # serveur de dev (http://localhost:5173, proxy /api -> :3000)
npm run build      # typecheck + build de prod
npm run preview    # prévisualise le build
npm run typecheck
```

## Organisation (`src/`)

| Dossier | Rôle |
| --- | --- |
| `api/` | Client HTTP typé (`client.ts`) + appels par domaine (games, admin) |
| `store/` | État global Zustand : `gameStore` (déroulé de partie), `adminStore` (session admin) |
| `pages/` | Une page par écran ; `pages/admin/` pour le back-office |
| `components/` | Composants partagés (`Layout`, `RequireAdmin`) |
| `types/` | Types miroir des DTO de l'API |
| `styles/` | CSS global, thème mobile-first |

## Parcours de jeu

`/` → `/create` → `/reveal` (pass-and-play) → `/first-player` → `/vote`.

L'attribution de la partie (rôles + mots) est renvoyée une fois par l'API à la
création, puis conservée dans `gameStore`. La distribution des cartes, la
révélation et le vote se déroulent ensuite entièrement côté client (V1 locale).

Point clé : la carte d'un imposteur est affichée comme celle d'un civil — il
voit « un mot » sans savoir s'il a le mot principal ou secondaire. Seul l'espion
voit « Tu n'as aucun mot ».

## Administration

`/admin/login` (mot de passe) → `/admin` → gestion des thèmes / paires.
Le mot de passe est conservé en `localStorage` et envoyé via l'en-tête
`x-admin-password`. `RequireAdmin` protège les routes.

## Gestion des erreurs

`apiRequest` transforme toute réponse non-2xx en `ApiError { code, message }`.
Les pages affichent `message` dans un bandeau `.error`.
