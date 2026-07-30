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
      'A cooperative multiplayer game built in Unity — my senior capstone, shipped on Steam.',
    // DRAFT BODY — real trailer + scaffolded sections. Replace the prose in each
    // .detail-block with the real story; drop screenshots/gifs into the galleries.
    detailBody: `
      <figure class="detail-video">
        <figcaption>Release Trailer</figcaption>
        <video
          controls
          preload="none"
          playsinline
          poster="images/projects/quartermaster/qm_primary.png"
          width="1280"
          height="720"
        >
          <source src="https://video.akamai.steamstatic.com/store_trailers/257165521/movie_max_vp9.webm" type="video/webm" />
          <source src="https://video.akamai.steamstatic.com/store_trailers/257165521/movie_max.mp4" type="video/mp4" />
          <a href="https://store.steampowered.com/app/3673980/Quartermaster/" target="_blank">Watch the trailer on Steam &#8594;</a>
        </video>
      </figure>

      <div class="detail-block">
        <h2>Overview</h2>
        <p>
          DRAFT &mdash; replace this paragraph. Quartermaster is my senior
          capstone: a cooperative multiplayer game built in Unity and shipped on
          Steam. Say what the player actually does here, how many players a
          session holds, how long a run takes, and what makes it worth playing.
        </p>
        <p>
          Then add the team context: how many people, what your role as lead
          covered, and how long the project ran.
        </p>
      </div>

      <div class="detail-block">
        <h2>Steam Lobbies &amp; Matchmaking</h2>
        <p>
          DRAFT &mdash; the Unity &#8596; Steamworks integration you owned:
          lobby creation and join flow, matchmaking, and how session state stays
          in sync. Name the hard part and how you solved it. Screenshot of the
          lobby UI or a gif of two clients connecting goes below.
        </p>
      </div>

      <!-- DROP MEDIA HERE. Replace each placeholder div with a real figure:
           <figure><img src="images/projects/quartermaster/qm_lobby.png"
             alt="Lobby screen" loading="lazy" />
             <figcaption><strong>Label.</strong> One line of context.</figcaption>
           </figure>
           ...and change the wrapper class to "shot-gallery" once captions exist. -->
      <div class="detail-gallery">
        <div class="placeholder-media media-c"></div>
        <div class="placeholder-media media-a"></div>
      </div>

      <div class="detail-block">
        <h2>3D Asset Pipeline</h2>
        <p>
          DRAFT &mdash; the end-to-end Blender &#8594; Substance Painter &#8594;
          Unity pipeline you authored. Cover the naming/export conventions, the
          texturing setup, and how you kept it consistent across a whole team.
          Turntable gifs or before/after shots belong here.
        </p>
      </div>

      <div class="detail-gallery">
        <div class="placeholder-media media-b"></div>
        <div class="placeholder-media media-e"></div>
      </div>

      <div class="detail-block">
        <h2>Performance &amp; Editor Tooling</h2>
        <p>
          DRAFT &mdash; the 60%+ optimization: what you profiled, what the
          bottleneck actually was, what draw-call batching and memory work you
          did, and the before/after numbers. A screenshot of the Unity Profiler
          before and after would carry this section.
        </p>
        <p>
          Then the custom Editor tools you built for the level designers &mdash;
          what they automated and how much time they saved. A gif of a tool in
          use is the strongest possible evidence here.
        </p>
      </div>

      <div class="detail-block">
        <h2>Shipping</h2>
        <p>
          DRAFT &mdash; Steam Achievements and Leaderboards setup, the store
          page, and anything you learned about actually shipping to a storefront
          that you would not have learned otherwise.
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
    // DRAFT BODY — structure is real, prose is scaffolding. Replace each
    // paragraph and swap the placeholder tiles for gifs/screenshots.
    // `.detail-block` = a text section. `.detail-gallery` = an image/gif grid.
    detailBody: `
      <div class="detail-block">
        <h2>Overview</h2>
        <p>
          DRAFT &mdash; replace this paragraph. Duck Around is a solo project: a
          physics sandbox where you play a duck-shaped robot loose in a factory.
          Say what the player is actually doing minute to minute, what the
          factory is for, and where the comedy comes from.
        </p>
        <p>
          Then say where it stands: what's playable now, what's next, and
          whether it's headed for a release anywhere.
        </p>
      </div>

      <!-- DROP GIF HERE — a 6-10s loop of the duck moving is the single most
           convincing asset on this page. Replace the tiles below with:
           <div class="placeholder-media"><img src="images/projects/duckaround/da_ik.gif" alt="IK demo" /></div> -->
      <div class="detail-gallery">
        <div class="placeholder-media media-d"></div>
        <div class="placeholder-media media-a"></div>
      </div>

      <div class="detail-block">
        <h2>Custom Two-Bone IK Movement</h2>
        <p>
          DRAFT &mdash; the technical centerpiece. Explain the two-bone
          inverse-kinematics rig: how the legs find footing on uneven factory
          geometry, why you wrote it yourself instead of using Unity's animation
          rigging package, and what broke along the way. This is the section a
          gameplay programmer will actually read.
        </p>
        <p>
          DROP GIF HERE &mdash; the legs planting on stairs or a slope, ideally
          with the IK targets visualized.
        </p>
      </div>

      <div class="detail-block">
        <h2>Made From Scratch</h2>
        <p>
          DRAFT &mdash; every model, texture, and sound is yours. Break down the
          pipeline: modelling and texturing tools, the look you were going for,
          and how the audio was made. Show the duck in Blender next to the duck
          in-engine.
        </p>
      </div>

      <div class="detail-gallery">
        <div class="placeholder-media media-e"></div>
        <div class="placeholder-media media-c"></div>
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
