const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, '..');
const dest = path.resolve(src, 'www');

const copyDir = (from, to) => {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const s = path.join(from, entry.name);
    const d = path.join(to, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'www' || entry.name === 'scripts' || entry.name === '.git' || entry.name === 'android' || entry.name === '.idea') continue;
      copyDir(s, d);
    } else {
      if (entry.name === 'package.json' || entry.name === 'package-lock.json' || entry.name.endsWith('.md') || entry.name === '.gitignore' || entry.name === 'sumamente-keystore.jks') continue;
      fs.copyFileSync(s, d);
    }
  }
};

fs.mkdirSync(dest, { recursive: true });
copyDir(src, dest);

// --- Bundle JS ---
const html = fs.readFileSync(path.join(src, 'index.html'), 'utf-8');
const regex = /<script\s+defer\s+src="js\/[^"]+"><\/script>/g;
const scriptTags = html.match(regex) || [];
const files = scriptTags.map(tag => tag.match(/src="(js\/[^"]+)"/)[1]);

if (files.length === 0) { console.log('No scripts to bundle'); return; }

// Separar core de módulos
const coreKeys = ['data.js','globals.js','managers.js','utils.js','evaluator.js','solvers.js','audio-engine.js','pro.js','pdf-export.js','core.js','search.js','tour.js','general-calc.js','app.js'];
const coreFiles = files.filter(f => coreKeys.some(k => f.endsWith(k)));
const modFiles = files.filter(f => !coreKeys.some(k => f.endsWith(k)));

const cat = (list) => {
  let out = '';
  for (const f of list) {
    const p = path.join(src, f);
    if (fs.existsSync(p)) out += fs.readFileSync(p, 'utf-8') + '\n';
  }
  return out;
};

const bundleDir = path.join(dest, 'js');
fs.mkdirSync(bundleDir, { recursive: true });

const coreCode = cat(coreFiles);
fs.writeFileSync(path.join(bundleDir, 'bundle-core.js'), coreCode, 'utf-8');
console.log(`✓ bundle-core.js (${(coreCode.length / 1024).toFixed(0)} KB, ${coreFiles.length} archivos)`);

const modCode = cat(modFiles);
fs.writeFileSync(path.join(bundleDir, 'bundle-mod.js'), modCode, 'utf-8');
console.log(`✓ bundle-mod.js (${(modCode.length / 1024).toFixed(0)} KB, ${modFiles.length} archivos)`);

// Generar index.html prod
const noScripts = html.replace(/<script\s+defer\s+src="js\/[^"]+"><\/script>\s*/g, '');
const bundleTags = `<script defer src="js/bundle-core.js"></script>
<script defer src="js/bundle-mod.js"></script>
`;
const insertAt = noScripts.indexOf('<!-- Módulos extraídos');
const finalHtml = insertAt >= 0
  ? noScripts.slice(0, insertAt) + bundleTags + noScripts.slice(insertAt)
  : bundleTags + noScripts;
fs.writeFileSync(path.join(dest, 'index.html'), finalHtml, 'utf-8');
console.log('✓ www/index.html con bundles');
console.log('✓ www/ actualizada');
