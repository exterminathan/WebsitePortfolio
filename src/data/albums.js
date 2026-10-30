// Photo albums. The photos themselves live on disk as
// images/photos/<slug>/<prefix><NNN>-{FULL,THUMB}.jpg pairs, where <prefix> is
// the day slug (or `prefix` for a flat album) — those must match
// scripts/ingest-photos.ps1. `days` makes it a trip page of sub-albums;
// without it, one grid. `covers`/`cover` are base names (no -FULL/-THUMB).
module.exports = [
  {
    slug: 'europe-2026',
    title: 'Europe 2026',
    blurb:
      'Europe 2026: Switzerland, Prague, and more.',
    // waiting on edited exports (RAW only), so this album is skipped at build
    days: [
      { slug: 'switzerland', title: 'Switzerland', date: 'TBD' },
      { slug: 'prague', title: 'Prague', date: 'TBD' },
      { slug: 'other', title: 'Other', date: 'TBD' },
    ],
  },
  {
    slug: 'japan-2025',
    title: 'Japan 2025',
    blurb:
      'Japan 2025: Mt. Fuji, Hakone, the Kiso Valley, Tokyo, Kyoto, and Osaka.',
    covers: ['mt-fuji001', 'hakone014', 'kyoto-3001'],
    days: [
      { slug: 'mt-fuji', title: 'Mt. Fuji', date: 'Sep 17' },
      { slug: 'hakone', title: 'Hakone', date: 'Sep 18', cover: 'hakone014' },
      { slug: 'narai-juku', title: 'Narai-Juku', date: 'Sep 19' },
      { slug: 'kiso-valley', title: 'Kiso Valley', date: 'Sep 20' },
      { slug: 'shibuya-1', title: 'Shibuya Pt. 1', date: 'Sep 22' },
      { slug: 'shibuya-2', title: 'Shibuya Pt. 2', date: 'Sep 23' },
      { slug: 'taito-city', title: 'Taito City', date: 'Sep 24' },
      { slug: 'shinjuku', title: 'Shinjuku', date: 'Sep 25' },
      { slug: 'transfer-to-kyoto', title: 'Transfer to Kyoto', date: 'Sep 26' },
      { slug: 'kyoto-1', title: 'Kyoto Pt. 1', date: 'Sep 27' },
      { slug: 'kyoto-2', title: 'Kyoto Pt. 2', date: 'Sep 28' },
      { slug: 'gion', title: 'Gion', date: 'Sep 29' },
      { slug: 'kyoto-3', title: 'Kyoto Pt. 3', date: 'Sep 30' },
      { slug: 'osaka', title: 'Osaka', date: 'Oct 1' },
      { slug: 'ginkaku-ji', title: 'Ginkaku-ji', date: 'Oct 2' },
      { slug: 'tokyo-1', title: 'Tokyo Pt. 1', date: 'Oct 4' },
      { slug: 'tokyo-2', title: 'Tokyo Pt. 2', date: 'Oct 5' },
    ],
  },
  {
    slug: 'kenya-2022',
    prefix: 'kenya',
    title: 'Kenya 2022',
    blurb:
      'Kenya 2022: Safari.',
    covers: ['kenya005', 'kenya011', 'kenya026'],
  },
];
