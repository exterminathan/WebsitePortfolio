# Roadmap

Goals for the 2026 redesign. Page-level content todos (screenshots, copy, links per page) live in the separate content tracker; this roadmap holds the bigger steps.

## C · Content

### C1 · Fill the content gaps
Every existing page is complete: no TODO markers left in `src/`.
Gate: `grep -r TODO src/` finds nothing, and the content tracker shows every page done.
- [ ] Screenshot pass for every project and game
- [ ] Win4kss full write-up
- [ ] BrickOSINT backend shots and next-up text

### C2 · Add the new project entries
The projects that aren't on the site yet get their own entries.
Gate: each agreed project has a `.md` entry with media and builds cleanly.
- [ ] List which projects to add
- [ ] Write and add the new entries

## S · Structure

### S1 · Place Block, Tile and Island
Decide where Block, Tile and Island go (games, projects or innate.games).
Gate: placement decided and reflected in `src/content/`.
- [ ] Owner's grand plan for placement
- [ ] Move or add the entries to match

## L · Launch

### L1 · Ship the redesign
The redesign goes live on nathanshturm.com.
Gate: owner-approved deploy is live and `main` holds the redesign.
- [ ] Decide hosting: Hostinger or Firebase
- [ ] Merge redesign-2026 into main
- [ ] Deploy and check live site
