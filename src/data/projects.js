// Projects data. Same shape/behavior as games.js:
//   - drives each row on projects.html + the home-page preview (first two)
//   - set `detail: true` + add `detailBody` to turn on a project-<slug>.html page
//
// Projects use gradient placeholder media (mediaClass) instead of an image.
// To use a real image instead, add `media: { img, alt, badge }` like games.js
// and it will render in place of the gradient.

module.exports = [
  {
    slug: 'project-one',
    title: 'Placeholder Project One',
    tag: 'teal',
    mediaClass: 'media-c',
    body: [
      'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse.',
    ],
    tags: ['React', 'Node.js', 'Product Design'],
    links: [],
    detail: false,
  },
  {
    slug: 'project-two',
    title: 'Placeholder Project Two',
    tag: 'orange',
    mediaClass: 'media-d',
    body: [
      'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem.',
    ],
    tags: ['Python', 'Data Viz'],
    links: [],
    detail: false,
  },
  {
    slug: 'project-three',
    title: 'Placeholder Project Three',
    tag: 'red',
    mediaClass: 'media-a',
    body: [
      'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium totam rem aperiam eaque ipsa.',
    ],
    tags: ['Swift', 'iOS'],
    links: [],
    detail: false,
  },
];
