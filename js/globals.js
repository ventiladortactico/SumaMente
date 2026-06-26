let currentMode = 'general';
let showSteps = false;
let history = [];
let genExpr = '';
let genResult = '0';
let genLastResult = null;
let genMemory = 0;

let activeFormula = { 
    electro: 'ohm', med: 'goteo', fin: 'prestamo', quim: 'molar', civil: 'hormigon', mec: 'torque', geom: 'circulo', 
    unit: 'longitud', fis: 'velocidad', diseno: 'conv', nutri: 'macros', acust: 'spl', prog: 'bases', estad: 'basica', redes: 'subredes',
    alg: 'cuadratica'
};

let angleMode = 'deg';

const MODE_NAMES = {
    general: 'General', electro: 'Electrónica', med: 'Medicina', fin: 'Finanzas', quim: 'Química',
    civil: 'Arquitectura y Construcción', mec: 'Mecánica', geom: 'Geometría', unit: 'Unidades', fis: 'Física',
    diseno: 'Diseño y Multimedia', nutri: 'Nutrición', acust: 'Acústica', prog: 'Programación', estad: 'Estadística',
    redes: 'Redes y Conectividad', alg: 'Álgebra'
};
const MODE_COLORS = {
    general: '#4f9cf9', electro: '#38e8c8', med: '#f97b4f', fin: '#a78bfa', quim: '#f9c74f',
    civil: '#4ff97b', mec: '#f94f4f', geom: '#f94fa7', unit: '#4fdbf9', fis: '#f9f54f',
    diseno: '#f9a74f', nutri: '#f97ba7', acust: '#4fbfa7', prog: '#7b4ff9', estad: '#f9f94f',
    redes: '#f94f9f', alg: '#e8b838'
};

let formulaIndex = [];
function buildFormulaIndex() {
    formulaIndex = [];
    for (const mod in FORMS) {
        const m = FORMS[mod];
        if (!m || typeof m !== 'object') continue;
        const modName = MODE_NAMES[mod] || mod;
        const modColor = MODE_COLORS[mod] || '#4f9cf9';
        for (const key in m) {
            const f = m[key];
            if (f && f.title) {
                formulaIndex.push({ mod, key, title: f.title, formula: f.formula || '', modName, modColor });
            }
        }
    }
}
