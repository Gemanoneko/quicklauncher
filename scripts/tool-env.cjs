'use strict';
// Keep locally launched development tools and their children on the project drive.
const fs = require('node:fs');
const path = require('node:path');

module.exports = { assertOutput() {} }; // Portable tools and hosted CI use their own workspace.

if (process.platform === 'win32') {
  const inside = (parent, child) => {
    const rel = path.relative(parent, child);
    return rel !== '..' && !rel.startsWith('..' + path.sep) && !path.isAbsolute(rel);
  };
  const checkout = fs.realpathSync.native(path.resolve(__dirname, '..'));
  const root = ['I:/AI Projects', 'C:/Antigravity Projects']
    .filter(dir => fs.existsSync(dir))
    .map(dir => fs.realpathSync.native(dir))
    .find(dir => inside(dir, checkout));

  if (root) {
    function checked(dir) {
      if (!path.isAbsolute(dir) || !inside(root, dir)) return false;
      let parent = dir;
      while (!fs.existsSync(parent)) parent = path.dirname(parent);
      return inside(root, fs.realpathSync.native(parent));
    }
    function assertOutput(dir) {
      if (!checked(dir)) throw Error('Tool output escapes the projects root: ' + dir);
    }
    module.exports = { assertOutput };
    function select(name, fallback) {
      const dir = checked(process.env[name] || '') ? process.env[name] : fallback;
      assertOutput(dir);
      return dir;
    }
    const tmp = select('TEMP', path.join(root, 'Temp'));
    fs.mkdirSync(tmp, { recursive: true });
    process.env.TMP = process.env.TEMP = process.env.TMPDIR = tmp;
    for (const [key, leaf] of [['npm_config_cache','npm-cache'], ['ELECTRON_CACHE','electron'],
      ['ELECTRON_BUILDER_CACHE','electron-builder'], ['PLAYWRIGHT_BROWSERS_PATH','ms-playwright']]) {
      process.env[key] = select(key, path.join(root, 'Caches', leaf));
    }
  } else if (!process.env.GITHUB_ACTIONS) {
    throw Error('Run studio tooling from an approved projects root.');
  }
}
