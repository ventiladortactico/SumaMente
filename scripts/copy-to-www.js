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
console.log('✓ www/ actualizada');
