#!/usr/bin/env bash
#
# Pull the site's images back down from Hostinger over SSH via rsync.
#
#   ./scripts/pull-images.sh --dry-run   # preview changes, write nothing
#   ./scripts/pull-images.sh             # actually pull
#
# Recovery tool for gitignored assets (images/photos/): a fresh clone has no
# photos, so run this before building/deploying from a new machine — otherwise
# deploy.sh's --delete would wipe them off the server. See docs/DEPLOY.md.
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
