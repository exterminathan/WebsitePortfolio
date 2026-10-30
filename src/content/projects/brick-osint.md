---
order: 1
title: BrickOSINT
tag: blue
mediaClass: media-a
media:
  img: brickosint_hero.jpg
  alt: BrickOSINT catalogue of LEGO sets
tagline: A full-stack platform of OSINT-style browser games played on a searchable catalogue of LEGO sets, parts, and minifigs.
tags: [Python, Flask, Firestore, Full-Stack, Web Games]
body:
  - Built a full-stack platform hosting a suite of OSINT-style guessing games themed around LEGO sets.
  - Games play on a searchable catalogue of sets, parts, and minifigs assembled by a scraper pipeline.
  - Guest or account play, online rooms, daily challenges, and per-game leaderboards.
links:
  - https://github.com/exterminathan/BrickOSINT | GitHub →
detailLinks:
  - href: https://brick-osint.games
    icon: brick-mark
    label: brick-osint.games →
    ariaLabel: Visit brick-osint.games
detailLinksTop: true
---

## Overview

BrickOSINT started out as a platform for creating LEGO-inspired mini-games, but quickly evolved into a fully searchable catalogue of LEGO sets, parts, and minifigs. Though the games are still a work in progress, the catalogue is fully functional, and systematically and frequently updated.

## The Catalogue

Sets, books, and gear each get their own browse view over the same scraped
database — north of 20,000 sets and counting. Free-text search combines with
filters for theme (over a hundred of them), sub-theme, release year range,
piece count, and minifig count, and results sort by relevance, name, set
number, year, piece count, minifig count, MSRP, or price per piece.

Every result is a card — image, set number, name, year, piece count — that
links through to a detail page, and detail pages interlink: sets to their
parts and minifigs and back. That link graph is what the games play on.

::: placeholders media-c media-a

## Games & Accounts

Every game runs without signing in — guest play works everywhere — and an
account adds persistent results and a spot on the per-game leaderboards.
Games ship with up to three modes: local, online (2-player rooms over a
shared room code), and a daily challenge scored separately from the regular
rankings.

<ul class="game-list">
  <li>
    <h4>Brick or No Brick</h4>
    <p class="game-modes">Local · Online · Daily</p>
    <p>A Deal-or-No-Deal round played against ten cases hiding secret set prices — pick your case, open the rest round by round, and decide: deal, or no brick?</p>
  </li>
  <li>
    <h4>Brick Race</h4>
    <p class="game-modes">Local · Online · Daily</p>
    <p>A Wikipedia-race puzzle — hop from one catalogue page to a target using only real part, minifig, and set links.</p>
  </li>
  <li>
    <h4>Brick Tic-Tac-Toe</h4>
    <p class="game-modes">Local · Online · Daily</p>
    <p>Classic tic-tac-toe with bricks, played online over a shared room code, plus a solo daily challenge.</p>
  </li>
</ul>

More games are in progress — each new one plays on the same catalogue and
plugs into the same modes, accounts, and leaderboards.

::: gallery 1col
![BrickOSINT games hub listing the mini-games](brickosint_games.jpg)
**The games hub.** Every game declares its supported modes and whether it
carries a leaderboard.
:::

## Under the Hood

A modular Python/Flask app on Google Cloud Run, backed by Firestore, with a
scheduled scraper pipeline that catalogues, downloads, and indexes new entries
in the background. Accounts are protected by two-factor auth, and budget alerts
plus a cost-optimization pass keep a hobby project on a hobby budget.

TODO: replace with backend screenshots — admin dashboard and the job runner,
with set and user identifiers blurred.

::: placeholders media-d media-e

## Roadmap

Where the platform is headed. The shipped column is confirmed; everything past
it is a placeholder until the real plan is written down.

<ol class="roadmap">
  <li class="is-done">
    <span class="roadmap-stage">Shipped</span>
    <h4>Catalogue &amp; first games</h4>
    <p>Scraped catalogue of sets, parts, and minifigs. Three games live across local, online, and daily modes, with accounts and leaderboards.</p>
  </li>
  <li class="is-now">
    <span class="roadmap-stage">In progress</span>
    <h4>TODO: current focus</h4>
    <p>TODO: what is actively being built right now — the next game, a catalogue expansion, or a rework of an existing mode.</p>
  </li>
  <li>
    <span class="roadmap-stage">Planned</span>
    <h4>TODO: next up</h4>
    <p>TODO: the milestone after that, and roughly when.</p>
  </li>
</ol>
