#!/usr/bin/env bash
#
# Deploy the static site to Hostinger over SSH via rsync.
#
#   ./scripts/deploy.sh --dry-run   # preview changes, write nothing
#   ./scripts/deploy.sh             # actually deploy
#
# See docs/DEPLOY.md for setup. Requires the `hostinger` entry in ~/.ssh/config.
#
set -euo pipefail

# --- Config -------------------------------------------------------------------
# SRC = the local, flat, deploy-ready site directory (contains index.html,
# images/, resume.pdf, etc. with root-relative `images/...` paths).
#
# NOTE: this is intentionally a placeholder. The repo is not yet flattened to
# match the server's flat layout — see docs/DEPLOY.md. Point SRC at your flat
# build (e.g. "dist" or the repo root once flattened) before deploying.
SRC="dist"

SSH_HOST="hostinger"                     # from ~/.ssh/config
REMOTE_DIR="public_html/"                # ~/public_html -> domains/nathanshturm.com/public_html
# ------------------------------------------------------------------------------

cd "$(dirname "$0")/.."

DRY_RUN=""
if [[ "${1:-}" == "--dry-run" || "${1:-}" == "-n" ]]; then
  DRY_RUN="--dry-run"
  echo "== DRY RUN — no files will be changed =="
fi

if [[ ! -d "$SRC" ]]; then
  echo "ERROR: source dir '$SRC' not found." >&2
  echo "Edit SRC at the top of this script to point at your flat, deploy-ready site." >&2
  echo "See docs/DEPLOY.md." >&2
  exit 1
fi

echo "Deploying '$SRC/' -> ${SSH_HOST}:${REMOTE_DIR}"

# -a archive, -v verbose, -z compress, --delete mirror (removes stale remote files)
# Excludes keep server-only / VCS files from being touched or deleted.
rsync -avz $DRY_RUN --delete \
  --exclude ".git/" \
  --exclude ".well-known/" \
  --exclude ".htaccess" \
  "$SRC/" "${SSH_HOST}:${REMOTE_DIR}"

echo "Done."
