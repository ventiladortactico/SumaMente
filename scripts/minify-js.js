const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const jsDir = path.join(__dirname, '..', 'js');

function minifyFile(filePath) {
    const relativePath = path.relative(__dirname, filePath);
    
    esbuild.build({
        entryPoints: [filePath],
        minify: true,
        minifyIdentifiers: true,
        minifySyntax: true,
        minifyWhitespace: true,
        drop: ['console', 'debugger'],
        write: true,
        allowOverwrite: true,
        outfile: filePath,
    }).then(() => {
        console.log(`✓ Minified: ${relativePath}`);
    }).catch((error) => {
        console.error(`✗ Error minifying ${relativePath}:`, error);
    });
}

function walkDir(dir, callback) {
    const files = fs.readdirSync(dir);
    
    files.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            walkDir(filePath, callback);
        } else if (file.endsWith('.js')) {
            callback(filePath);
        }
    });
}

console.log('Minifying JavaScript files...');
walkDir(jsDir, minifyFile);
console.log('Done!');
