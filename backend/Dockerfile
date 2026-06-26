# --- Étape build : compile le TypeScript -------------------------------
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build
# tsc ne copie pas les .sql : on les place à côté du JS compilé pour le runner.
RUN cp -r src/infrastructure/db/migrations dist/infrastructure/db/migrations

# --- Étape runtime : image légère, dépendances de prod uniquement ------
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist

EXPOSE 3000

# Applique les migrations (idempotent) puis démarre l'API.
CMD ["sh", "-c", "node dist/infrastructure/db/migrate.js && node dist/index.js"]
