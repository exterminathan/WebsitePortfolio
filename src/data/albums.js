/*
 * Photo albums — drives photos.html, the home-page Photos preview, and every
 * generated album page (photos-<slug>.html, photos-<slug>-<day>.html).
 *
 * The actual photos are NOT listed here: each album is one flat folder,
 * images/photos/<slug>/, holding <prefix><NNN>-FULL.jpg + <prefix><NNN>-THUMB.jpg
 * pairs (populated by scripts/ingest-photos.ps1 — e.g. hakone004-FULL.jpg).
 * <prefix> is the day slug for albums with `days`, or the album's `prefix`
 * for flat albums, so those slugs must match the ingest script's.
 * Albums/days with no photos on disk are skipped at build time, so a
 * photo-less clone still builds; run scripts/pull-images.sh (or the ingest
 * script) first to get the real site.
 *
 * An album WITHOUT `days` renders as a single photo grid + lightbox.
 * An album WITH `days` renders a trip page of day sub-album cards, each day
 * getting its own grid + lightbox page.
 *
 * `covers` (optional): the 3 images shown on the album's row card
 * (photos.html + home page). Each entry is a photo base name without the
 * -FULL/-THUMB suffix (e.g. 'kenya005', 'kyoto-3001'). Omit `covers` for the
 * default (first photo of the first three days / first three photos).
 * A day entry can likewise set `cover` to override the thumbnail its card
 * shows on the trip page (default: the day's first photo).
 */
module.exports = [
  {
    slug: 'japan-2025',
    title: 'Japan 2025',
    blurb:
      'Two and a half weeks across Japan, Sept &ndash; Oct 2025: Mt. Fuji, Hakone, the Kiso Valley, Tokyo, Kyoto, and Osaka. Organized by day &mdash; pick one below.',
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
    prefix: 'kenya', // photo filename prefix (kenya001-FULL.jpg)
    title: 'Kenya 2022',
    blurb:
      'Safari across Kenya, 2022 &mdash; wildlife and landscapes from the savanna.',
    covers: ['kenya005', 'kenya011', 'kenya026'],
  },

  // Europe 2026 (Zurich, Prague, Czech bike tour) — waiting on edited exports;
  // the source folders only have RAWs so far. Add here + in ingest-photos.ps1.
];
