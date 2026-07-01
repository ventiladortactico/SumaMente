const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const jsDir = path.join(__dirname, '..', 'js');

// Archivos a excluir de la minificación por conflictos de nombres
const excludeFiles = [
    'acustica_visual.js',
    'algebra_visual.js',
    'diseno_visual.js',
    'electro_visual.js',
    'finanzas_visual.js',
    'fisica_visual.js',
    'geometria_visual.js',
    'mecanica_visual.js',
    'medicina_visual.js',
    'nutricion_visual.js',
    'programacion_visual.js',
    'quimica_visual.js',
    'redes_visual.js',
    'unidades_visual.js',
    'estadistica_visual.js',
    'civil_visual.js',
    'app_visual.js'
];

function shouldExclude(filePath) {
    const fileName = path.basename(filePath);
    return excludeFiles.includes(fileName);
}

function minifyFile(filePath) {
    if (shouldExclude(filePath)) {
        console.log(`⊘ Skipped: ${path.relative(__dirname, filePath)}`);
        return;
    }
    
    const relativePath = path.relative(__dirname, filePath);
    
    esbuild.build({
        entryPoints: [filePath],
        minify: true,
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
