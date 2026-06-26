#!/usr/bin/env bash
#
# Auto-déploiement du VPS. Appelé par cron toutes les minutes.
# Détecte un nouveau commit sur origin/main et redéploie (reset + rebuild).
# Idempotent : ne fait rien tant qu'il n'y a pas de changement.
#
# Installé sur le VPS via une entrée crontab (voir DEPLOY.md) :
#   * * * * * /usr/bin/flock -n /tmp/imposteur-deploy.lock \
#       /home/hugo/Perso/imposteur/deploy.sh >> /home/hugo/Perso/imposteur/deploy.log 2>&1

set -euo pipefail
# cron a un PATH minimal : on le complète pour trouver git/docker.
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

# Se placer dans le dossier du dépôt (celui qui contient ce script).
cd "$(dirname "$(readlink -f "$0")")"

git fetch --quiet origin main
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" = "$REMOTE" ]; then
  exit 0  # rien de nouveau
fi

echo "===== $(date '+%F %T') déploiement ${LOCAL:0:7} -> ${REMOTE:0:7} ====="
# reset --hard : on aligne exactement sur origin/main (les fichiers non suivis
# comme .env sont conservés).
git reset --hard origin/main
docker compose -f docker-compose.prod.yml up -d --build
echo "===== $(date '+%F %T') déploiement terminé ====="
