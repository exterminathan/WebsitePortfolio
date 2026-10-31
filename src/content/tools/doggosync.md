---
order: 5
title: DoggoSync
tag: teal
mediaClass: media-c
tagline: A Satisfactory helper tool that manages your Lizard Doggos by editing your save from an interactive world map.
tags: [TypeScript, Node.js, Save Editing, Satisfactory]
body:
  - Built a Satisfactory save-editing tool that teleports Lizard Doggos and collects their items from an interactive world map.
---

## Overview

A local tool for [Satisfactory](https://www.satisfactorygame.com/) that
manages tamed Lizard Doggos by editing a save file offline, driven from an
interactive world map in the browser.

- **Teleport** — draw an area on the map and move selected doggos (or players) into it, spread out on solid ground.
- **Collect** — sweep the items your doggos are holding into a chosen storage container, merging stacks up to the game's limits.

## Safety

The tool never touches the original save. Every write emits a new file, item
counts are conserved exactly, and teleport placements never land underground
or high enough for fall damage.

Not affiliated with Coffee Stain Studios.

<!-- TODO: screenshots -->
