# Site editor toolkit

A local copy of a site where you double-click any text to edit it. The edit saves to the site's source files. Python 3 only; no installs.

## What you get

- Double-click text, type, press Enter to save. Esc cancels.
- The editor finds the text in the source and rewrites it. If code builds the text (for example JavaScript data), it saves a small override file instead.
- Every edit goes in `site-editor/edits/<site>.json`. Your edits win over later changes by Claude or anyone else.
- **Undo** reverses the last edit. Old files sit in `site-editor/.backups/` (not committed).
- **Editing: on/off** lets you click around the site. **Page title** edits the tab title.

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
      "port": 5205
    }
  }
}
```

   - `serve`: the folder the browser shows (the built site, or the source if there is no build).
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

- Text only. It does not edit images, links or styles.
- Text in two files with the same words: the editor picks the one for the current page. If it cannot tell, it saves an override.
- The server listens on 127.0.0.1 only. Do not expose it.
