const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'src');

function getJsFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getJsFiles(filePath));
    } else if (filePath.endsWith('.js')) {
      results.push(filePath);
    }
  });
  return results;
}

const files = getJsFiles(root).filter((f) => !f.endsWith(path.join('src', 'server.js')) && !f.endsWith(path.join('src', 'server.js')));

console.log('Files to require:', files.length);

files.forEach((f) => {
  // Skip server.js explicitly
  if (f.endsWith(path.sep + 'server.js')) return;
  try {
    console.log('Requiring', f);
    require(f);
    console.log('OK', f);
  } catch (err) {
    console.error('ERROR requiring', f, err && err.stack ? err.stack : err);
  }
});

console.log('Require check finished');

// Los servicios abren el pool compartido; lo cerramos para que termine el script
const { pool } = require('../src/config/db');
pool.end().catch((error) => {
  console.error('ERROR closing database pool', error.message);
  process.exitCode = 1;
});
