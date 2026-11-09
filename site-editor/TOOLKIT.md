# Site editor toolkit

A local copy of a site where you double-click any text to edit it. The edit saves to the site's source files. Python 3 only; no installs.

## What you get

- **Editing starts off** on every page load. Click **Editing: off** to turn it on.
- Double-click text, type, press Enter to save. Esc cancels. Inside a Markdown or page block, the double-click opens the formatted editor below.
- **Formatted editor** (Ctrl+B bold, Ctrl+I italic, Ctrl+K link): bold, italic, inline code, link. On Markdown pages it also sets the block type: P, H2, H3, bullet list, numbered list, quote. Enter saves; Enter adds an item inside a list, Ctrl+Enter saves it.
- **Block controls** appear when you hover a block: Edit, move up/down (sections and whole elements), **+ section**, **+ image**, delete.
- **+ section** adds `## New section` plus a paragraph in Markdown, or a `<section>` on a page in `src/pages/`.
- **Images**: use **+ image**, drop a file on a block, or paste one while hovering a block. The editor asks for alt text. It saves the file into `images/projects/<assets or slug>/` (content items) or `images/` (pages), slugifies the name, and never overwrites. It writes `![alt](name)` (a full-width figure).
- Every edit goes in `site-editor/edits/<site>.json`. Your edits win over later changes by Claude or anyone else.
- **Undo** reverses the last edit, including structure edits and added images. Old files sit in `site-editor/.backups/` (not committed).
- **Page title** edits the tab title.

## Add it to a project (5 steps)

1. Copy `editor.py`, `editor.js` and `.gitignore` into `<project>/site-editor/`.
2. Create `<project>/site-editor/site-editor.json`:

```json
{
  "sites": {
    "main": {
      "serve": "dist",
      "sources": ["src"],
      "build": "node build.js",
      "env": { "SE_PREVIEW": "1" },
      "port": 5205
    }
  }
}
```

   - `serve`: the folder the browser shows (the built site, or the source if there is no build). This project serves `site-editor/.preview`: `build.js` writes it when `SE_PREVIEW=1` (set by `env`) and adds `data-se-*` source ranges that never reach `dist/`. Structure edits need this; plain text edits do not.
   - `sources`: the folders that hold the text you want to change. Use the same folder as `serve` for plain HTML.
   - `build`: optional. Runs after each saved source edit. The page reloads when it finishes.
   - `port`: any free port. Paths are relative to the project root (the parent of `site-editor/`).

3. Run `python -I site-editor/editor.py main`. Your browser opens the site.
4. Add this rule to the project's `CLAUDE.md`:

```
Owner edits win. Before changing site text, read site-editor/edits/*.json.
After any change to site sources, run: python -I site-editor/editor.py <site> --reapply
It puts the owner's edits back. A CONFLICT line means the old text is gone: tell the owner.
```

5. Commit `site-editor/` (but not `.backups/`).

## Keep it current

- Claude changes the source, then runs `--reapply`. Applied edits stay; changed text is reported.
- Never delete `edits/*.json`. They are the owner's record.
- Run `python -I site-editor/editor.py --list` to see configured sites.
- A quick one-off with no config: `python -I site-editor/editor.py --serve <folder> --edits <log.json>`.

## Limits

- Structure edits (format, section, move, delete, image) only work where the build emits `data-se-*` ranges: Markdown content (`src/content/`) and `src/pages/*.html`. Other text still edits by double-click.
- **`--reapply` does not replay structure edits.** It prints a `NOT REPLAYED` line for each one. Check those pages by hand.
- On `src/pages/*.html` only text, bold, italic, code and links are formatted; block types and lists are Markdown-only. Elements with other inline markup (icons, spans, classes) keep the plain double-click edit.
- A formatted edit rewrites the block as one line. Stale ranges are refused: reload the page after the source changes.
- The frozen `efficient-asset-ripper.md` is refused. The editor writes only under `src/` and `images/`.
- Text in two files with the same words: the editor picks the one for the current page. If it cannot tell, it saves an override.
- The server listens on 127.0.0.1 only. Do not expose it.
