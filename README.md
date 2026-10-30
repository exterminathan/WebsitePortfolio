# WebsitePortfolio

Nathan Shturm's personal portfolio, nathanshturm.com. A static site with no runtime framework: pages are authored in `src/` (HTML pages plus Markdown content for games and projects) and assembled into plain HTML in `dist/` by a zero-dependency Node script.

## Build

```bash
node build.js    # or: npm run build
```

Output goes to `dist/` (gitignored). `resume.pdf` and `images/photos/` are gitignored, so add them locally before building if you want them in the output.

## Preview

Build, then open `dist/index.html` in a browser, or serve `dist/` with any static file server.

## Deploy

Hosted on Firebase Hosting. See [docs/DEPLOY.md](docs/DEPLOY.md). Launch of the redesign is not approved yet.

## More

- [.claude/CLAUDE.md](.claude/CLAUDE.md) — how the build, content and styling work
- [docs/roadmap.md](docs/roadmap.md) — redesign goals
