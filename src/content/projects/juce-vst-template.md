---
order: 5
title: JUCE VST Template
tag: orange
mediaClass: media-d
media:
  img: juce-vst-template_primary.svg
  alt: JUCE VST Template
tagline: A production-ready JUCE 8 starting point for VST3 audio plugins — four plugin shapes from one CMake switch.
tags: [C++, JUCE 8, CMake, Audio / VST3, Catch2]
body:
  - Authored a JUCE 8 / Pamplejuce template for VST3 & standalone audio plugins on Windows.
  - Switched between four plugin shapes (FX, synth, MIDI FX, audio-to-MIDI) via one CMake variable.
  - Enforced real-time-safe processor scaffolding with Catch2 unit tests & benchmarks.
  - Automated a one-command Inno Setup installer & multi-shape build pipeline.
links:
  - https://github.com/exterminathan/JUCE-VST-Template | GitHub →
---

## Overview

A JUCE 8 / Pamplejuce starting point for building VST3 and standalone audio
plugins on Windows. It provides real-time-safe scaffolding, Catch2 tests, an
Inno Setup installer pipeline, and a single CMake variable that switches
between four plugin shapes: audio FX, instrument, MIDI FX, and
audio-to-MIDI.

## One Template, Four Shapes

All product identity lives in a single `ProductConfig.cmake` file. Setting
`PLUGIN_SHAPE` to `FX`, `Synth`, `MIDIFX`, or `MIDIGen` expands into the
correct `juce_add_plugin` flags — covering everything from reverbs and
synths to arpeggiators and audio-to-MIDI pitch detectors.

## Build & Packaging

A CMake + Ninja + MSVC build drives Catch2 unit tests and a separate
benchmarks target through `ctest`, auto-installing the built VST3 for the
local DAW. A one-command PowerShell pipeline produces a signed-ready Inno
Setup installer and can build and validate all four plugin shapes in a
single run, with a PDF manual generated from Markdown.

## What You Get Out Of The Box

DRAFT — the "why would I use this" section. A template is a hard sell
without proof, so show the default plugin actually loaded in a DAW, and
consider a short list of what you'd otherwise spend a weekend wiring up
yourself.

<!-- TODO: real figures (class="shot-gallery") — the plugin loaded in a
     DAW, ctest output, the Inno Setup installer -->

::: placeholders media-d media-e
