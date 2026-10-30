# Deploy — Firebase Hosting

The site is hosted on Firebase Hosting. Hostinger is legacy (see the last section).

**Launch is not approved.** Do not deploy the real site, push, or run any `firebase` command until Nate says so. Today only the holding page is live on nathanshturm.com.

## Project and sites

One Firebase/GCP project (`project-a89ff80d-7ecd-456f-aee`, "inNATE Toolset") holds three Hosting sites. `.firebaserc` maps a target name to each site, and `firebase.json` says what each target serves.

| Target | Site | Domain | Serves |
|---|---|---|---|
| `portfolio` | `nathanshturm` | nathanshturm.com | `dist/` (real site), or `holding/nathanshturm/` (holding page) |
| `innate-games` | `innate-games` | innate.games | `innate/public/` |
| `innate-tools` | `innate-tools` | innate.tools | `innate/public/` |

Config files:

- `firebase.json` — all three targets. `portfolio` serves `dist/`. HTML is `no-cache`; CSS/JS are `immutable` for a year (the build adds a `?v=` hash to their URLs); images, video and fonts cache for a week. The innate targets rewrite everything to `/index.html`.
- `firebase.holding.json` — one target, `portfolio`, serving `holding/nathanshturm/`. Its predeploy step, `holding/prepare.js`, copies `resume.pdf` and `images/icons/webicon.svg` (as `favicon.svg`) into that folder.

## Deploy commands

Run from the repo root.

```bash
# Holding page (what is live until launch)
firebase deploy --config firebase.holding.json --only hosting:portfolio

# Real site: NOT APPROVED YET. Build first, then deploy dist/
node build.js
firebase deploy --only hosting:portfolio

# innate.games and innate.tools holding pages
firebase deploy --only hosting:innate-games,hosting:innate-tools
```

The holding deploy and the real deploy go to the same site, so whichever ran last is what visitors see. Deploying the real site replaces the holding page.

Before building the real site, `resume.pdf` (gitignored) must be at the repo root and `images/photos/` (gitignored) must be present locally. See CLAUDE.md, "Deployment".

### Credentials gotcha (Windows)

The Firebase CLI runs on gcloud's credentials file. If the Windows `GOOGLE_APPLICATION_CREDENTIALS` variable points at a missing key file, set it for the session first:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="$APPDATA/gcloud/application_default_credentials.json"
```

## DNS (Namecheap)

nathanshturm.com is registered at Namecheap and its DNS is edited there by hand (Advanced DNS). Each Firebase custom domain needs, per domain:

- `A @` to Firebase's address (`199.36.158.100`)
- `TXT @` with `hosting-site=<site>`
- `CNAME www` to `<site>.web.app`

Leave any `google-site-verification` TXT records alone.

## Gotcha: CDN cached "Site Not Found"

After a custom domain turned active, Firebase's CDN kept serving a cached "Site Not Found" 404 for `/`. A redeploy purged it. To tell a cache problem from a real one, request the page with a random query string (`?v=random`).

Also, a home router can cache "not found" DNS answers for about an hour. Check new records against 8.8.8.8, or on a phone off Wi-Fi.

## Legacy Hostinger

The site used to be served from Hostinger shared hosting over SSH. These scripts are legacy and **must not be run until Nate approves**:

- `scripts/deploy.sh` — rsyncs `dist/` to `~/public_html` on the `hostinger` SSH host, with `--delete`.
- `scripts/pull-images.sh` — rsyncs the server's `images/` back down (additive), to recover gitignored `images/photos/` on a fresh clone.

They need a `hostinger` entry in `~/.ssh/config` (host `185.212.70.87`, port `65002`, key `~/.ssh/hostinger`). The Hostinger plan is expected to lapse after launch.
