# --- Étape build : génère les fichiers statiques -----------------------
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
# BASE_URL vide => le front appelle /api en relatif (même domaine, via Traefik).
ENV VITE_API_BASE_URL=""
RUN npm run build

# --- Étape runtime : nginx sert les fichiers statiques -----------------
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
