# Roadmap

Goals for the 2026 redesign. Page-level content todos (screenshots, copy, links per page) live in the separate content tracker; this roadmap holds the bigger steps.

## C · Content

### C1 · Fill the content gaps
Every existing page is complete: no TODO markers left in `src/`.
Gate: `grep -r TODO src/` finds nothing, and the content tracker shows every page done.
- [ ] Screenshot pass for every project and game (Nate and agents together; none ready yet, expected soon)
- [ ] Win4kss full write-up
- [ ] BrickOSINT backend shots and next-up text

### C2 · Add the new project entries
Five new project entries, pitches drafted by an agent for Nate to fix later.
Gate: each of the five has a `.md` entry with media and builds cleanly.
- [x] List which projects to add: WindowsVoiceControl, VSTBuddy/DAWdler, VoxMidi, ColorPalettes, LightweightTaskbarGroups (skipped: RemoteDesktopViewer, VSTDecomper, LegoBuildSuggestions)
- [ ] Write and add the five entries, checking each draft pitch against its repo

## S · Structure

### S1 · Place Block, Tile and Island
Block, Tile and Island become three separate entries in the Games listing.
Gate: BlockGameOnline entry is gone and Block, Tile and Island are Games entries, each with a banner to its live site.
- [x] Decide placement: all three under Games
- [ ] Remove the BlockGameOnline entry
- [ ] Add Block, Tile and Island games entries (Island moves from Projects, where it is catan.md)
- [ ] Add a banner on each linking to block., tile. and islands.innate.games

## L · Launch

### L1 · Ship the redesign
The redesign replaces the temporary holding page on nathanshturm.com, hosted on Firebase. Launch is not approved yet: no deploy of the real site, no push.
Gate: owner-approved deploy of `dist/` is live on Firebase and `main` holds the redesign.
- [x] Decide hosting: Firebase Hosting, not Hostinger
- [x] Move the domain to Namecheap and DNS to Firebase (holding page live)
- [x] Set up Firebase Hosting config
- [x] Update docs for Firebase and the redesign
- [ ] Merge redesign-2026 into main
- [ ] Deploy the portfolio over the holding page and check it live
- [ ] Let the Hostinger plan lapse
