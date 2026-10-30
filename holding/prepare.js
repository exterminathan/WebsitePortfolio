const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const out = path.join(__dirname, 'nathanshturm');
fs.copyFileSync(path.join(root, 'resume.pdf'), path.join(out, 'resume.pdf'));
fs.copyFileSync(path.join(root, 'images', 'icons', 'webicon.svg'), path.join(out, 'favicon.svg'));
