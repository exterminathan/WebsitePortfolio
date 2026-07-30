// Projects data. Same shape/behavior as games.js:
//   - drives each row on projects.html + the home-page preview (first two)
//   - set `detail: true` + add `detailBody` to turn on a project-<slug>.html page
//
// Projects use gradient placeholder media (mediaClass) instead of an image.
// To use a real image instead, add `media: { img, alt, badge }` like games.js
// and it will render in place of the gradient.

module.exports = [
  {
    slug: 'brick-osint',
    title: 'BrickOSINT',
    tag: 'blue',
    mediaClass: 'media-a',
    media: {
      img: 'images/projects/brick-osint/brickosint_hero.jpg',
      alt: 'BrickOSINT catalogue of LEGO sets',
    },
    body: [
      'Built a full-stack Python/Flask platform hosting a suite of OSINT-style guessing games themed around LEGO sets.',
      'Engineered a scraper &amp; catalog pipeline feeding a Firestore-backed image database.',
      'Containerized and deployed to Google Cloud Run with budget alerts &amp; cost tuning.',
      'Implemented user auth with 2FA behind a secured admin dashboard.',
    ],
    tags: ['Python', 'Flask', 'Google Cloud Run', 'Firestore', 'Full-Stack'],
    links: [
      {
        href: 'https://github.com/exterminathan/BrickOSINT',
        label: 'GitHub &#8594;',
        external: true,
      },
    ],
    // Detail page swaps GitHub for a big brick-mark link to the live site.
    detailLinks: [
      {
        href: 'https://brick-osint.games',
        external: true,
        ariaLabel: 'Visit brick-osint.games',
        label:
          '<svg class="brick-mark" viewBox="0 0 24 24" aria-hidden="true">' +
          '<path fill="currentColor" fill-rule="evenodd" ' +
          'd="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4ZM9 6.6a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8Zm0 .9a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM15 6.6a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8Zm0 .9a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM9 12.6a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8Zm0 .9a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM15 12.6a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8Zm0 .9a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z"/>' +
          '</svg><span>brick-osint.games &#8594;</span>',
      },
    ],
    detail: true,
    tagline:
      'A full-stack platform of OSINT-style browser games themed around LEGO bricks, deployed on Google Cloud.',
    detailBody: `
      <div class="detail-block">
        <h2>Overview</h2>
        <p>
          BrickOSINT is a full-stack web platform hosting a suite of
          OSINT-flavored guessing games built around LEGO sets and imagery.
          The backend is a modular Python/Flask application, deployed to Google
          Cloud Run and backed by Firestore, with a scraper pipeline that
          continuously builds and maintains the game catalog.
        </p>
      </div>

      <div class="detail-block">
        <h2>Data Pipeline</h2>
        <p>
          A dedicated scraper &amp; catalog layer collects set metadata and
          images, resolves external links, and stores everything in a
          Firestore-backed database with background jobs for cataloging,
          downloading, and indexing content on a schedule.
        </p>
      </div>

      <div class="detail-block">
        <h2>Platform &amp; Infrastructure</h2>
        <p>
          The app runs on Google Cloud Run behind a hardened admin panel, with
          user accounts protected by two-factor authentication, a billing and
          cost-optimization layer, budget alerts, and a suite of automated
          tests covering the scraper, jobs, and web routes.
        </p>
      </div>

      <div class="detail-block">
        <h2>The Games</h2>
        <p>
          The suite of OSINT-style games hosted on the platform, live at
          <a href="https://brick-osint.games" target="_blank">brick-osint.games</a>.
        </p>
      </div>
      <div class="shot-gallery">
        <figure>
          <img src="images/projects/brick-osint/brickosint_games.jpg"
               alt="BrickOSINT games hub listing the mini-games" loading="lazy" />
          <figcaption>
            <strong>The games hub.</strong> Every game runs in local, online,
            and daily-challenge modes with per-game leaderboards.
          </figcaption>
        </figure>
        <figure>
          <img src="images/projects/brick-osint/brickosint_brick-or-no-brick.jpg"
               alt="Brick or No Brick game how-to-play screen" loading="lazy" />
          <figcaption>
            <strong>Brick or No Brick.</strong> A Deal-or-No-Deal round played
            with ten briefcases hiding secret set prices.
          </figcaption>
        </figure>
        <figure>
          <img src="images/projects/brick-osint/brickosint_brick-race.jpg"
               alt="Brick Race game how-to-play screen" loading="lazy" />
          <figcaption>
            <strong>Brick Race.</strong> A Wikipedia-race puzzle &mdash; hop
            from one catalogue page to a target using only real part, minifig,
            and set links.
          </figcaption>
        </figure>
        <figure>
          <img src="images/projects/brick-osint/brickosint_tic-tac-toe.jpg"
               alt="Brick Tic-Tac-Toe lobby with online and daily modes" loading="lazy" />
          <figcaption>
            <strong>Brick Tic-Tac-Toe.</strong> Online 2-player over shared
            room codes, plus a solo daily challenge against the bot.
          </figcaption>
        </figure>
      </div>
    `,
  },

  {
    slug: 'efficient-asset-ripper',
    title: 'Efficient Asset Ripper',
    tag: 'violet',
    mediaClass: 'media-b',
    media: {
      img: 'images/projects/efficient-asset-ripper/efficient-asset-ripper_primary.svg',
      alt: 'Efficient Asset Ripper',
    },
    body: [
      'Built a PySide6 desktop tool that unpacks Unreal Engine 4/5 game archives end-to-end.',
      'Automated a headless Blender pipeline that imports meshes &amp; wires full PBR shader graphs.',
      'Integrated a CUE4Parse .NET 8 CLI for AES-decrypted .pak / .utoc extraction.',
      'Authored a material resolver classifying textures by PBR slot from exported metadata.',
    ],
    tags: ['Python', 'PySide6', 'CUE4Parse / .NET 8', 'Blender Automation', 'UE4 / UE5'],
    links: [
      {
        href: 'https://github.com/exterminathan/EfficientAssetRipper',
        label: 'GitHub &#8594;',
        external: true,
      },
    ],
    detail: true,
    tagline:
      'A desktop tool that unpacks Unreal Engine 4/5 games and batch-exports them into ready-to-use Blender scenes.',
    detailBody: `
      <div class="detail-block">
        <h2>Overview</h2>
        <p>
          Efficient Asset Ripper is an asset-extraction tool for Unreal Engine 4
          and 5 games. It pairs a modern PySide6 desktop interface with a .NET 8
          CUE4Parse core and an automated Blender export pipeline, taking a game
          folder from raw archives to ready-to-use <code>.blend</code> files in
          one pass: <strong>Unpack &#8594; Scan &#8594; Resolve &#8594; Process</strong>.
        </p>
      </div>

      <div class="detail-block">
        <h2>Extraction &amp; Material Resolution</h2>
        <p>
          A built-in CUE4Parse CLI mounts <code>.pak</code> / <code>.utoc</code>
          archives with AES decryption and exports meshes, textures, animations,
          and audio. A material resolver then reads the exported metadata,
          follows material-inheritance chains, and classifies textures by PBR
          slot (base color, normal, ORM, emissive) for correct shader wiring.
        </p>
      </div>

      <div class="detail-block">
        <h2>Automated Blender Pipeline</h2>
        <p>
          A headless Blender subprocess imports PSK/PSKX meshes, builds full
          PBR shader node graphs, and saves finished scenes &mdash; driven by a
          batch queue with progress tracking, logging, and cancellation. Rounded
          out with WWise audio extraction, a blend-file combiner, per-game
          profiles, and a themeable Qt6 UI. Verified end-to-end against Star Wars
          Jedi: Survivor, Rocket League, and Satisfactory.
        </p>
      </div>

      <div class="detail-block">
        <h2>Results</h2>
        <p>
          DRAFT &mdash; the payoff section. Show what actually comes out the
          other end: a ripped mesh sitting in Blender with its PBR shader graph
          wired up correctly. A before/after (raw import vs. resolved materials)
          would sell the material resolver better than any paragraph.
        </p>
      </div>

      <!-- DROP SCREENSHOTS HERE. Best three, in order:
             1. the PySide6 window mid-batch (progress bar, queue populated)
             2. an extracted asset in Blender with the shader nodes visible
             3. the per-game profile / AES key config screen
           Replace each tile with a real figure, then rename the wrapper class
           to "shot-gallery" so the captions render:
           <figure><img src="images/projects/efficient-asset-ripper/ear_ui.png"
             alt="Efficient Asset Ripper batch queue" loading="lazy" />
             <figcaption><strong>Label.</strong> One line of context.</figcaption>
           </figure>
           A gif of the Unpack -> Scan -> Resolve -> Process run would be even
           better than a still for #1. -->
      <div class="detail-gallery">
        <div class="placeholder-media media-b"></div>
        <div class="placeholder-media media-d"></div>
      </div>
    `,
  },

  {
    slug: 'creator-bot',
    title: 'CreatorBot',
    tag: 'teal',
    mediaClass: 'media-c',
    media: {
      img: 'images/projects/creator-bot/creator-bot_primary.svg',
      alt: 'CreatorBot',
    },
    body: [
      'Built a Discord bot framework that posts as any persona via webhooks &mdash; not a bot account.',
      'Integrated Google Gemini for persona-voiced AI message generation.',
      'Shipped a password-protected web panel for channels, roles, giveaways &amp; moderation.',
      'Deployed to Cloud Run with optional GCS-backed persistent state.',
    ],
    tags: ['Python', 'Discord API', 'Google Gemini', 'Cloud Run', 'Web Admin'],
    links: [
      {
        href: 'https://github.com/exterminathan/CreatorBot',
        label: 'GitHub &#8594;',
        external: true,
      },
    ],
    detail: true,
    tagline:
      'A Discord bot framework that speaks as any AI persona through webhooks, fully managed from a browser panel.',
    detailBody: `
      <div class="detail-block">
        <h2>Overview</h2>
        <p>
          CreatorBot is a fork-and-configure Discord bot framework: fill in two
          config files and you have a bot that speaks as any persona, with
          messages appearing to come from a regular user via webhooks rather
          than a bot account. It is powered by Google Gemini, deployed to Cloud
          Run, and fully manageable from a password-protected browser panel.
        </p>
      </div>

      <div class="detail-block">
        <h2>Persona &amp; AI</h2>
        <p>
          The persona &mdash; display name, bio, writing style, facts, and
          vocabulary &mdash; is defined entirely from the web panel and
          hot-reloads on save. Gemini generates posts and mention replies in
          that voice, with preview-before-send, raw-message passthrough, and
          per-user rate limiting.
        </p>
      </div>

      <div class="detail-block">
        <h2>Admin &amp; Infrastructure</h2>
        <p>
          A single admin panel drives a channel matrix, per-role permission
          grid, timed giveaways with native Enter-button embeds, user forms, and
          a rolling moderation audit log. It ships with a kill switch, structured
          Cloud Run logging, CI tests, and optional GCS-backed persistent state
          that falls back to local disk automatically.
        </p>
      </div>

      <div class="detail-block">
        <h2>In Practice</h2>
        <p>
          DRAFT &mdash; show it working. The strongest asset here is a Discord
          screenshot of the bot posting as a persona, side by side with the
          panel where that persona was configured, so the webhook trick is
          obvious at a glance.
        </p>
        <p>
          Scrub real usernames, server names, and any invite links before
          publishing screenshots.
        </p>
      </div>

      <!-- DROP SCREENSHOTS HERE. Best three, in order:
             1. Discord messages posted in-persona (proves the webhook approach)
             2. the persona editor in the admin panel
             3. the channel matrix or permission grid
           Replace each tile with a real figure, then rename the wrapper class
           to "shot-gallery" so the captions render:
           <figure><img src="images/projects/creator-bot/creator-bot_persona.png"
             alt="Persona editor" loading="lazy" />
             <figcaption><strong>Label.</strong> One line of context.</figcaption>
           </figure>
           A gif of a giveaway embed counting down would be a good bonus. -->
      <div class="detail-gallery">
        <div class="placeholder-media media-c"></div>
        <div class="placeholder-media media-a"></div>
      </div>
    `,
  },

  {
    slug: 'juce-vst-template',
    title: 'JUCE VST Template',
    tag: 'orange',
    mediaClass: 'media-d',
    media: {
      img: 'images/projects/juce-vst-template/juce-vst-template_primary.svg',
      alt: 'JUCE VST Template',
    },
    body: [
      'Authored a JUCE 8 / Pamplejuce template for VST3 &amp; standalone audio plugins on Windows.',
      'Switched between four plugin shapes (FX, synth, MIDI FX, audio-to-MIDI) via one CMake variable.',
      'Enforced real-time-safe processor scaffolding with Catch2 unit tests &amp; benchmarks.',
      'Automated a one-command Inno Setup installer &amp; multi-shape build pipeline.',
    ],
    tags: ['C++', 'JUCE 8', 'CMake', 'Audio / VST3', 'Catch2'],
    links: [
      {
        href: 'https://github.com/exterminathan/JUCE-VST-Template',
        label: 'GitHub &#8594;',
        external: true,
      },
    ],
    detail: true,
    tagline:
      'A production-ready JUCE 8 starting point for VST3 audio plugins — four plugin shapes from one CMake switch.',
    detailBody: `
      <div class="detail-block">
        <h2>Overview</h2>
        <p>
          A JUCE 8 / Pamplejuce starting point for building VST3 and standalone
          audio plugins on Windows. It provides real-time-safe scaffolding,
          Catch2 tests, an Inno Setup installer pipeline, and a single CMake
          variable that switches between four plugin shapes: audio FX,
          instrument, MIDI FX, and audio-to-MIDI.
        </p>
      </div>

      <div class="detail-block">
        <h2>One Template, Four Shapes</h2>
        <p>
          All product identity lives in a single <code>ProductConfig.cmake</code>
          file. Setting <code>PLUGIN_SHAPE</code> to <code>FX</code>,
          <code>Synth</code>, <code>MIDIFX</code>, or <code>MIDIGen</code>
          expands into the correct <code>juce_add_plugin</code> flags &mdash;
          covering everything from reverbs and synths to arpeggiators and
          audio-to-MIDI pitch detectors.
        </p>
      </div>

      <div class="detail-block">
        <h2>Build &amp; Packaging</h2>
        <p>
          A CMake + Ninja + MSVC build drives Catch2 unit tests and a separate
          benchmarks target through <code>ctest</code>, auto-installing the built
          VST3 for the local DAW. A one-command PowerShell pipeline produces a
          signed-ready Inno Setup installer and can build and validate all four
          plugin shapes in a single run, with a PDF manual generated from
          Markdown.
        </p>
      </div>

      <div class="detail-block">
        <h2>What You Get Out Of The Box</h2>
        <p>
          DRAFT &mdash; the "why would I use this" section. A template is a hard
          sell without proof, so show the default plugin actually loaded in a
          DAW, and consider a short list of what you'd otherwise spend a weekend
          wiring up yourself.
        </p>
      </div>

      <!-- DROP SCREENSHOTS HERE. Best three, in order:
             1. the default plugin loaded in a DAW (Reaper/Ableton) — proves it runs
             2. the terminal mid-build, or ctest output with Catch2 tests passing
             3. the Inno Setup installer window
           Replace each tile with a real figure, then rename the wrapper class
           to "shot-gallery" so the captions render:
           <figure><img src="images/projects/juce-vst-template/juce_daw.png"
             alt="Template plugin loaded in a DAW" loading="lazy" />
             <figcaption><strong>Label.</strong> One line of context.</figcaption>
           </figure>
           A code snippet of ProductConfig.cmake showing the PLUGIN_SHAPE switch
           would also work well as a block here. -->
      <div class="detail-gallery">
        <div class="placeholder-media media-d"></div>
        <div class="placeholder-media media-e"></div>
      </div>
    `,
  },

  {
    slug: 'voice-to-midi',
    title: 'Voice to MIDI',
    tag: 'red',
    mediaClass: 'media-e',
    media: {
      img: 'images/projects/voice-to-midi/voice-to-midi_primary.svg',
      alt: 'Voice to MIDI',
    },
    body: [
      'Building a Windows VST3 plugin that converts monophonic singing or humming into real-time MIDI.',
      'Designed the onset-detection &amp; pitch-tracking DSP architecture in JUCE 8.',
      'Bootstrapped a plugin that scans clean in pluginval at strictness level 10.',
    ],
    tags: ['C++', 'JUCE 8', 'Real-Time DSP', 'MIDI', 'VST3'],
    links: [
      {
        href: 'https://github.com/exterminathan/VoiceToMIDI',
        label: 'GitHub &#8594;',
        external: true,
      },
    ],
    detail: true,
    tagline:
      'A Windows VST3 that converts monophonic singing or humming into real-time MIDI.',
    detailBody: `
      <div class="detail-block">
        <h2>Overview</h2>
        <p>
          Voice to MIDI (VoxMidi) is a Windows VST3 plugin that converts
          monophonic singing or humming into real-time MIDI. It is built on
          JUCE 8 with a CMake + MSVC toolchain, bootstrapped from Pamplejuce and
          validated with pluginval.
        </p>
      </div>

      <div class="detail-block">
        <h2>Status &amp; Architecture</h2>
        <p>
          The plugin is in its bootstrap phase &mdash; it loads, scans clean in
          pluginval at strictness level 10, and passes a real-time-safe audio
          path. The next phases layer in the DSP, onset detection, MIDI emission,
          and GUI defined in the project's architecture plans.
        </p>
      </div>

      <div class="detail-block">
        <h2>The DSP Problem</h2>
        <p>
          DRAFT &mdash; this is the interesting part, write it even while the
          plugin is unfinished. What makes pitch tracking a sung note hard in
          real time: latency budget, octave errors, deciding where one note ends
          and the next begins. Name the approach you picked and why.
        </p>
      </div>

      <div class="detail-block">
        <h2>Roadmap</h2>
        <p>
          DRAFT &mdash; a short phase list (DSP &#8594; onset detection &#8594;
          MIDI emission &#8594; GUI) with where you are on it. An honest
          in-progress roadmap reads better than a vague "coming soon" &mdash; it
          shows you plan work, and it gives this page a reason to exist now.
        </p>
      </div>

      <!-- DROP MEDIA HERE once there's something to show. In rough priority:
             1. a short video/gif: humming into the plugin, MIDI notes appearing
                in the piano roll (this one asset justifies the whole page)
             2. the plugin UI in a DAW
             3. pluginval passing at strictness 10 in the terminal
           For a video, reuse the click-to-play block from Quartermaster:
           <figure class="detail-video">
             <video controls preload="none" playsinline poster="...">
               <source src="images/projects/voice-to-midi/vox_demo.mp4" type="video/mp4" />
             </video>
             <figcaption><strong>Label.</strong> One line of context.</figcaption>
           </figure> -->
      <div class="detail-gallery">
        <div class="placeholder-media media-a"></div>
        <div class="placeholder-media media-b"></div>
      </div>
    `,
  },
];
