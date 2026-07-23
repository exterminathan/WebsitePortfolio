// Games data. Each entry drives:
//   - its card on games.html
//   - its preview tile on the home page (first two entries)
//   - its own detail sub-page (game-<slug>.html) WHEN `detail: true`
//
// TO GIVE A GAME ITS OWN PAGE: set `detail: true` and fill in `detailBody`
// with whatever HTML you want (text, <img>, gifs, galleries...). Leave
// `detail: false` to keep the sub-page turned off — the card just won't link
// anywhere and no page is generated. See duck-around below for a full example.

module.exports = [
  {
    slug: 'quartermaster',
    title: 'Quartermaster',
    tag: 'teal', // tag color theme: red | violet | teal | orange | blue
    featured: true, // spans two columns on the games grid
    media: {
      img: 'images/projects/quartermaster/qm_primary.png',
      alt: 'Quartermaster',
      badge: 'Senior Capstone',
    },
    body: [
      'Led Unity &#8596; Steam lobby &amp; matchmaking integration for multiplayer sessions.',
      'Authored end-to-end 3D asset pipeline in Blender &amp; Substance Painter.',
      'Optimized runtime performance by 60%+ via memory profiling &amp; draw-call batching.',
      'Deployed and configured Steam Achievements &amp; Leaderboards.',
      'Built custom Unity Editor tools to accelerate level-design workflows.',
    ],
    tags: ['Unity', 'Steam Integration', '3D Pipeline', 'Team Lead'],
    links: [
      {
        href: 'https://store.steampowered.com/app/3673980/Quartermaster/',
        label: 'Steam Page &#8594;',
        external: true,
      },
    ],
    detail: true, // sub-page ON
    tagline:
      'A cooperative multiplayer game and senior capstone — placeholder page for now.',
    // Placeholder body — flesh out with real screenshots / writeup later.
    detailBody: `
      <div class="detail-block">
        <h2>Overview</h2>
        <p>
          Quartermaster is my senior capstone: a cooperative multiplayer game
          built in Unity. This page is a placeholder &mdash; a full writeup of
          the Steam integration, 3D pipeline, and performance work is coming
          soon.
        </p>
      </div>
    `,
  },

  {
    slug: 'duck-around',
    title: 'Duck Around',
    tag: 'orange',
    featured: false,
    media: {
      img: 'images/projects/duckaround/da_primary.png',
      alt: 'Duck Around',
      badge: 'WIP',
    },
    body: [
      "You're a duck robot. In a factory. I wonder what kinda goofy stuff you can get up to...",
      'Custom Two-Bone IK Player Movement.',
      'All models, textures, audio created by me.',
    ],
    tags: ['Unity', 'Gameplay Programming', 'Custom IK', 'Solo Project'],
    links: [],
    detail: true, // sub-page ON
    tagline:
      "A physics-driven sandbox where you're a duck robot loose in a factory — a solo project I build every part of.",
    // Freeform HTML for the sub-page body. Add/replace blocks freely.
    // `.detail-block` = a text section. `.detail-gallery` = an image/gif grid.
    detailBody: `
      <div class="detail-block">
        <h2>Overview</h2>
        <p>
          Duck Around is a solo game project: a goofy physics sandbox where you
          control a duck-shaped robot wandering a factory. Every model, texture,
          and sound is made by me. Replace this copy with the real story of the
          project.
        </p>
      </div>

      <div class="detail-block">
        <h2>Custom Two-Bone IK Movement</h2>
        <p>
          The player uses a custom two-bone inverse-kinematics system so the
          legs plant and react to uneven factory geometry. Drop a gif of it in
          action below.
        </p>
      </div>

      <!-- swap these placeholder blocks for real screenshots / gifs:
           <div class="placeholder-media"><img src="images/projects/duckaround/da_ik.gif" alt="IK demo" /></div> -->
      <div class="detail-gallery">
        <div class="placeholder-media media-d"></div>
        <div class="placeholder-media media-a"></div>
        <div class="placeholder-media media-e"></div>
        <div class="placeholder-media media-c"></div>
      </div>

      <div class="detail-block">
        <h2>Made From Scratch</h2>
        <p>
          All assets &mdash; models, textures, and audio &mdash; are authored by
          me. This section is a good place to break down the art and audio
          pipeline with supporting images.
        </p>
      </div>
    `,
  },

  {
    slug: 'bleak',
    title: 'Bleak',
    tag: 'violet',
    featured: false,
    media: {
      img: 'images/projects/bleak/bleak_placeholder.svg',
      alt: 'Bleak — coming soon',
      badge: 'Coming Soon',
    },
    // Placeholder entry — no repo/writeup yet. Card is intentionally NOT linked
    // (detail: false ⇒ no bleak sub-page, no overlay/link). Flesh this out and
    // set detail: true once the project has real content.
    body: [
      'A moody, atmospheric game in early development.',
      'Writeup, media, and links coming soon.',
    ],
    tags: ['In Development'],
    links: [],
    detail: false, // sub-page OFF — card disabled
  },
];
