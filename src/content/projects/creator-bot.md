---
order: 3
title: CreatorBot
tag: teal
mediaClass: media-c
media:
  img: creator-bot_primary.svg
  alt: CreatorBot
tagline: A Discord bot framework that speaks as any AI persona through webhooks, fully managed from a browser panel.
tags: [Python, Discord API, Google Gemini, Cloud Run, Web Admin]
body:
  - Built a Discord bot framework that posts as any persona via webhooks — not a bot account.
  - Integrated Google Gemini for persona-voiced AI message generation.
  - Shipped a password-protected web panel for channels, roles, giveaways & moderation.
  - Deployed to Cloud Run with optional GCS-backed persistent state.
links:
  - https://github.com/exterminathan/CreatorBot | GitHub →
---

## Overview

CreatorBot is a fork-and-configure Discord bot framework: fill in two config
files and you have a bot that speaks as any persona, with messages appearing
to come from a regular user via webhooks rather than a bot account. It is
powered by Google Gemini, deployed to Cloud Run, and fully manageable from a
password-protected browser panel.

## Persona & AI

The persona — display name, bio, writing style, facts, and vocabulary
— is defined entirely from the web panel and hot-reloads on save.
Gemini generates posts and mention replies in that voice, with
preview-before-send, raw-message passthrough, and per-user rate limiting.

## Admin & Infrastructure

A single admin panel drives a channel matrix, per-role permission grid,
timed giveaways with native Enter-button embeds, user forms, and a rolling
moderation audit log. It ships with a kill switch, structured Cloud Run
logging, CI tests, and optional GCS-backed persistent state that falls back
to local disk automatically.

## In Practice

DRAFT — show it working. The strongest asset here is a Discord
screenshot of the bot posting as a persona, side by side with the panel
where that persona was configured, so the webhook trick is obvious at a
glance.

Scrub real usernames, server names, and any invite links before publishing
screenshots.

<!-- TODO: real figures (class="shot-gallery") — messages posted in-persona,
     the persona editor, the channel matrix. Scrub usernames first. -->

::: placeholders media-c media-a
