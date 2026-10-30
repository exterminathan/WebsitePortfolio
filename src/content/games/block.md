---
order: 4
title: Block
tag: red
mediaClass: media-a
tagline: Online Blokus to play with family across the globe — live rooms, bots, and no accounts.
tags: [TypeScript, React, Socket.IO, Cloud Run]
links:
  - https://block.innate.games | Play live →
body:
  - Built an online Blokus with live room codes, easy-to-hard bots, and a server-authoritative engine shared between client and server.
---

<a class="domain-banner" href="https://block.innate.games" target="_blank" rel="noopener">
  <span class="domain-banner-name">block.innate.games</span>
  <span class="domain-banner-text">Play Block live in your browser.</span>
  <span class="domain-banner-arrow" aria-hidden="true">&#8599;</span>
</a>

## Overview

Online [Blokus](https://en.wikipedia.org/wiki/Blokus) you can play with
family across the globe.

- 2-player and 4-player games.
- Bots fill any seat at easy, medium, or hard difficulty.
- Live rooms: pick a name, share a 4-letter room code, play in real time.
- No accounts and no server-side storage; a refresh reconnects you to the same game.

## Architecture

One Cloud Run container runs an Express + Socket.IO server that holds the
authoritative game state. A pure-TypeScript engine (pieces, rules, move
generation, bots) is shared by the server and the React client, so bots reuse
the same legal-move generator and can never make an illegal move.

<!-- TODO: screenshots, play link -->
