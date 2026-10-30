#!/usr/bin/env bash
#
# Pull the site's images back down from Hostinger over SSH via rsync.
#
#   ./scripts/pull-images.sh --dry-run   # preview changes, write nothing
#   ./scripts/pull-images.sh             # actually pull
#
# Recovers gitignored images/photos/ on a fresh clone — run it before deploying
# from a new machine, or deploy.sh's --delete wipes them off the server.
#
set -euo pipefail

SSH_HOST="hostinger"                     # from ~/.ssh/config
REMOTE_DIR="public_html/images/"         # server-side images root
DEST="images"                            # local repo images root

cd "$(dirname "$0")/.."

DRY_RUN=""
if [[ "${1:-}" == "--dry-run" || "${1:-}" == "-n" ]]; then
  DRY_RUN="--dry-run"
  echo "== DRY RUN — no files will be changed =="
fi

echo "Pulling '${SSH_HOST}:${REMOTE_DIR}' -> ${DEST}/"

# -a archive, -v verbose, -z compress. Intentionally NO --delete: the pull is
# additive, so local files that aren't on the server are left alone.
rsync -avz $DRY_RUN "${SSH_HOST}:${REMOTE_DIR}" "${DEST}/"

echo "Done."
