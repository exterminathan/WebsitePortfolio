---
order: 2
title: Efficient Asset Ripper
tag: violet
news: I got my first fork of EAR on GitHub!
mediaClass: media-b
media:
  img: img/MainLayout.png
  alt: The Efficient Asset Ripper window
hero: img/ear_hero.jpg
tagline: A desktop app that unpacks Unreal Engine 4/5 games and allows you to export a variety of game assets.
tags: [Python, Unreal Engine, .NET 8, Blender, Tools]
body:
  - A desktop asset-extraction suite for Unreal Engine 4/5 titles - mount encrypted archives, browse game directories, and export meshes, textures, animations, and audio.
  - In-place previews for all asset classes.
  - Features an advanced material resolver that follows inheritance chains and classifies textures. Wires into an optional Blender-ready exporter.
  - Per-game profiles to manage paths, engine versions, and AES keys.

links:
  - https://github.com/exterminathan/EfficientAssetRipper | GitHub →
---

<div class="detail-links">
  <a href="https://github.com/exterminathan/EfficientAssetRipper" target="_blank">GitHub →</a>
</div>

## Overview

Efficient Asset Ripper is an asset-extraction suite for Unreal Engine 4 and 5
games. Built on a .NET 8 core, with the GUI implemented in Python, it mounts
encrypted game archives, previews every asset class in place, and exports
meshes, textures, animations, and audio through a single pipeline:
**Unpack → Scan → Resolve → Process**.

An optional headless Blender stage takes exported meshes the rest of the way with pre-wired materials and a complete `.blend` file.

::: gallery 1col
![The three panels of the main window: asset tree, mesh preview, and texture previewer](img/MainLayout.png)
**Main Window Layout.** A dockable panel layout - the Unpacker on the left, various Asset Previews on the right.
:::

## Mounting Encrypted Archives

An integrated CUE4Parse CLI mounts `.pak` and `.utoc` archives with AES
decryption, configured by engine version and an optional `.usmap` mappings
file. Once mounted, the complete package tree is browsable and filterable by
name or asset type, and `.uasset` entries expand to reveal all asset types they contain.

::: gallery
![Mounting a game folder and expanding the resulting asset tree](vid/UnpackerMountGIF.gif)
**Mount and browse.** Selecting a game folder and mounting its archives
populates the package tree.

![The unpacker panel with asset type filters and export format toggles](img/PanelUnpacker.png)
**Filtering and selection.** Asset-type filtering, name search, and export format selection options.
:::

## Preview Before You Export

Every major asset class can be previewed in place, meaning you don't have to export entire folders just to find the asset you need.
Meshes render in 3D, with flat, UV-grid, and wireframe shading options.
Textures decode directly from `.uasset`.
Audio and video assets can also be previewed.
Blueprints, animation graphs, and all other non-visual asset types can be previewed in the Text Viewer.

::: gallery
![Orbiting a skeletal mesh and switching between flat, UV grid, and wireframe shading](vid/PreviewMeshTypesGIF.gif)
**Mesh preview.** A 3D viewport showing off the 3 shading modes: flat, UV grid, and wireframe.

![Selecting a texture asset and previewing the decoded image](vid/PreviewTextureGIF.gif)
**Texture preview.** Textures decode straight to the previewer, in the preferred format.

![Inspecting the parsed JSON properties of an animation blueprint](vid/PreviewPropertiesGIF.gif)
**Property inspector.** Non-visual assets present their parsed properties as
searchable JSON.

![Playing an extracted sound wave asset in the inline media player](vid/PreviewAudioGIF.gif)
**Audio preview.** Video/Audio playback with a scrub bar and playback history.
:::

## Export & Material Resolution

The export feature operates on either a single asset or an entire folder, and is able to write meshes, textures, audio, animations, and all other asset types to disk.
A material resolver reads the exported metadata, follows material-inheritance chains, tracks down all required textures, and then classifies each using a deterministic PBR slot identifier.

::: gallery 1col
![Exporting a folder of assets and sending the resulting PSK files to the processing queue](vid/UnpackerExportGIF.gif)
**Folder-level export.** Selecting a directory exports every asset beneath
it, and the PSK picker collects the resulting meshes for the processing queue.
:::

## Into Blender, Automatically

As a convenience for downstream work, queued meshes can be handed directly to a
headless Blender subprocess that imports the PSK/PSKX, creates a complete
shader node graph from the resolved material slots, and saves a finished
`.blend`.
The batch queue tracks per-asset progress, logs every run to disk, and supports mid-run
cancellation; each completed asset opens to a detail view recording texture wiring and file paths.

::: gallery 1col
![Queueing a mesh, processing it through Blender, and opening the resulting asset detail view](vid/BrowseExportProcessPSKGIF.gif)
**Queue → Blender → `.blend`.** A picked PSK is queued, processed, and opened in the result view.
:::

## Profiles & Setup

To support multiple games at the same time, Efficient Asset Ripper comes with a profile manager.
Each profile has its own file paths, engine version, AES keys and mount maps.

A separate settings dialog contains machine-level configuration for required components, as well as a
UI theme designer so you can customize the look of Efficient Asset Ripper to your liking.

::: gallery
![The profile manager with the AES keys table highlighted](img/AESKeySection.png)
**Per-game profiles.** Paths, engine version, mappings file, and any number
of labelled AES keys, saved per title and switched from the sidebar.

![The settings dialog covering export formats, appearance, and tooling paths](img/SettingsDialog.png)
**Tooling setup.** Export formats, theme and UI scale, and external tool
paths.
:::

## Legal

Efficient Asset Ripper is released under the MIT License.

Efficient Asset Ripper is an independent project — it is not sponsored by, endorsed by, or affiliated with Epic Games, Inc. or its affiliates.

"Unreal" and "Unreal Engine" are trademarks or registered trademarks of Epic Games, Inc. in the United States and elsewhere.

A full list of attributions is available in the Acknowledgments section of the [GitHub repository](https://github.com/exterminathan/EfficientAssetRipper).
