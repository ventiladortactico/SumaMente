let currentMode = 'general';
let showSteps = false;
let history = [];
let genExpr = '';
let genResult = '0';
let activeFormula = { electro: 'led', med: 'goteo', fin: 'prestamo', quim: 'molar', civil: 'hormigon', mec: 'torque', geom: 'circulo', unit: 'longitud', fis: 'velocidad', diseno: 'conv' };

function setMode(mode) {
    document.querySelectorAll('.mode-section').forEach(s => s.classList.remove('active'));
    document.getElementById('mode-' + mode).classList.add('active');
    currentMode = mode;
    const modeNames = { general: 'General', electro: 'Electrónica', med: 'Medicina', fin: 'Finanzas', quim: 'Química', civil: 'Construcción', mec: 'Mecánica', geom: 'Geometría', unit: 'Unidades', fis: 'Física', diseno: 'Diseño Gráfico' };
    const modeColors = { general: '#4f9cf9', electro: '#38e8c8', med: '#f97b4f', fin: '#a78bfa', quim: '#f9c74f', civil: '#4ff97b', mec: '#f94f4f', geom: '#f94fa7', unit: '#4fdbf9', fis: '#f9f54f', diseno: '#f9a74f' };
    document.getElementById('current-name').textContent = modeNames[mode];
    document.getElementById('current-dot').style.background = modeColors[mode];
    document.getElementById('status-mode').textContent = 'Modo: ' + modeNames[mode];
    renderDB(mode);
    if (mode !== 'general') {
        let f = activeFormula[mode];
        if (f) {
            renderForm(mode, f);
            document.getElementById('result-' + mode).classList.remove('show');
            document.getElementById('steps-' + mode).classList.remove('show');
        }
    }
}

function toggleModal(show) { document.getElementById('modal-modules').classList.toggle('show', show); }
function selectModule(mode) { toggleModal(false); setMode(mode); }

function renderInput(f) {
    if (f.type === 'select') return `<select id="field-${f.id}">${f.opts.map(o => `<option value="${o.v}">${o.l}</option>`).join('')}</select>`;
    if (f.type === 'checkbox') return `<div style="display:flex;align-items:center;gap:10px;margin-top:5px"><input type="checkbox" id="field-${f.id}" ${f.val ? 'checked' : ''} style="width:20px;height:20px"><span style="font-size:12px;color:var(--text2)">${f.label}</span></div>`;
    return `<input type="number" id="field-${f.id}" value="${f.val || ''}" step="any" placeholder="${f.label}">`;
}

function getFields(module, key) {
    let def = FORMS[module][key];
    let fields = {};
    def.fields.forEach(f => { fields[f.id] = document.getElementById('field-' + f.id); });
    return fields;
}

function saveInputs(module, key, fields) {
    const data = {};
    Object.keys(fields).forEach(id => { data[id] = fields[id].value; });
    localStorage.setItem(`last_input_${module}_${key}`, JSON.stringify(data));
}

function setFormula(module, key, event) {
    if (event && event.target) {
        document.querySelectorAll('#mode-' + module + ' .chip').forEach(c => c.classList.remove('active'));
        event.target.classList.add('active');
    }
    activeFormula[module] = key;
    renderForm(module, key);
    document.getElementById('result-' + module).classList.remove('show');
    document.getElementById('steps-' + module).classList.remove('show');
}

function renderForm(module, key) {
    let def = FORMS[module][key];
    let el = document.getElementById('form-' + module);
    if (!def) {
        el.innerHTML = `<div class="display" style="padding:20px;text-align:center"><div style="color:var(--text3);font-size:13px">Esta fórmula aún no está implementada.</div><div style="color:var(--accent);font-size:11px;margin-top:8px">Próximamente disponible</div></div>`;
        document.getElementById('result-' + module).classList.remove('show');
        document.getElementById('steps-' + module).classList.remove('show');
        return;
    }
    let html = `<div class="display"><div class="display-mode">${def.title}</div><div class="display-formula" style="margin-top:18px">${def.formula}</div></div>`;
    if (def.vars) {
        html += `<div class="field-full" style="margin-bottom:15px"><div class="field"><label style="color:var(--accent);font-weight:700">¿Qué deseas calcular?</label><select id="incognita-${module}" onchange="updateFieldsVisibility('${module}','${key}')">${def.vars.map(v => `<option value="${v.id}">${v.label}</option>`).join('')}</select></div></div>`;
    }
    html += `<div id="fields-container-${module}">`;
    for (let i = 0; i < def.fields.length; i += 2) {
        let f1 = def.fields[i], f2 = def.fields[i + 1];
        html += f2 ? `<div class="field-row" id="row-${f1.id}-${f2.id}"><div class="field" id="wrapper-${f1.id}"><label>${f1.label}</label>${renderInput(f1)}</div><div class="field" id="wrapper-${f2.id}"><label>${f2.label}</label>${renderInput(f2)}</div></div>` : `<div class="field-full" id="wrapper-${f1.id}"><div class="field"><label>${f1.label}</label>${renderInput(f1)}</div></div>`;
    }
    html += `</div><button class="btn-calc" onclick="calculate('${module}','${key}')">Calcular →</button>`;
    el.innerHTML = html;
    if (def.vars) updateFieldsVisibility(module, key);
}

function updateFieldsVisibility(module, key) {
    const targetVar = document.getElementById(`incognita-${module}`).value;
    FORMS[module][key].fields.forEach(f => {
        const wrapper = document.getElementById(`wrapper-${f.id}`);
        const input = document.getElementById(`field-${f.id}`);
        if (f.id === targetVar) { wrapper.style.display = 'none'; if (input) input.value = ''; }
        else wrapper.style.display = 'block';
    });
}

function calculate(module, key) {
    let def = FORMS[module][key];
    let fields = getFields(module, key);
    
    // Validación: Verificar campos vacíos que no sean la incógnita
    let targetVar = def.vars ? document.getElementById(`incognita-${module}`).value : null;
    let missingFields = def.fields.filter(f => f.id !== targetVar && (fields[f.id].value === '' || fields[f.id].value === null));
    
    if (missingFields.length > 0) {
        missingFields.forEach(f => fields[f.id].style.borderColor = 'var(--danger)');
        let rel = document.getElementById('result-' + module);
        rel.innerHTML = '<div class="result-label" style="color:var(--danger)">Error: Completá todos los campos</div>';
        rel.classList.add('show');
        return;
    } else {
        def.fields.forEach(f => fields[f.id].style.borderColor = 'var(--border)');
    }

    saveInputs(module, key, fields);
    let res;
    try { 
        res = def.calc(fields, targetVar); 
        if (!res) throw new Error("Cálculo inválido");
    } catch (e) { 
        let rel = document.getElementById('result-' + module);
        rel.innerHTML = `<div class="result-label" style="color:var(--danger)">Error: ${e.message || 'verificá los valores'}</div>`; 
        rel.classList.add('show'); 
        return; 
    }

    let rel = document.getElementById('result-' + module);
    rel.innerHTML = `<div class="result-label">${res.label}</div><div class="result-main">${res.main}</div><div class="result-extras">${res.extras.map(e => `<div class="result-extra ${e.cls}">${e.txt}</div>`).join('')}</div>`;
    rel.classList.add('show');
    document.getElementById('steps-' + module).innerHTML = res.steps.map(s => `<div class="step">${s}</div>`).join('');
    if (showSteps) document.getElementById('steps-' + module).classList.add('show');
    addHistory(module, key, res.main, res.label);
}

function addHistory(module, key, val, label) {
    history.unshift({ module, key, val, label, time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) });
    if (history.length > 10) history.pop();
    localStorage.setItem('sumamente_history', JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    if (history.length === 0) { 
        const saved = localStorage.getItem('sumamente_history'); 
        if (saved) history = JSON.parse(saved); 
    }
    let el = document.getElementById('history-list');
    if (!history.length) { el.innerHTML = '<div style="font-size:11px;color:var(--text3);padding:10px 0">Sin cálculos aún</div>'; return; }
    el.innerHTML = history.map(h => `<div class="history-item"><div class="history-label">${h.module} · ${h.key} · ${h.time}</div><div class="history-val">${h.val}</div></div>`).join('');
}

function clearHistory() { history = []; localStorage.removeItem('sumamente_history'); renderHistory(); }
function toggleSteps() { showSteps = !showSteps; document.querySelectorAll('.steps').forEach(s => { if (showSteps) s.classList.add('show'); else s.classList.remove('show'); }); }

function renderDB(mode) {
    let items = DB[mode] || [];
    let el = document.getElementById('db-items');
    if (!items.length) { el.innerHTML = '<div style="font-size:11px;color:var(--text3)">Sin datos</div>'; return; }
    el.innerHTML = items.map(i => `<div class="db-item"><div class="db-name">${i.name}</div><div class="db-val">${i.val}</div></div>`).join('');
}

function genKey(k) { if (genResult === 'Error') genResult = ''; genExpr += k; document.getElementById('gen-expr').textContent = genExpr; }
function genClear() { genExpr = ''; genResult = '0'; document.getElementById('gen-expr').textContent = ''; document.getElementById('gen-result').textContent = '0'; }
function genBack() { genExpr = genExpr.slice(0, -1); document.getElementById('gen-expr').textContent = genExpr; }
function genEval() {
    try {
        let expr = genExpr.replace(/sin\(/g, 'Math.sin(').replace(/cos\(/g, 'Math.cos(').replace(/tan\(/g, 'Math.tan(').replace(/√\(/g, 'Math.sqrt(').replace(/log\(/g, 'Math.log10(').replace(/ln\(/g, 'Math.log(').replace(/π/g, 'Math.PI').replace(/\^/g, '**');
        let r = Function('"use strict";return (' + expr + ')')();
        if (!isFinite(r)) throw new Error('inf');
        genResult = parseFloat(r.toFixed(10)).toString();
        document.getElementById('gen-result').textContent = genResult;
        document.getElementById('gen-expr').textContent = genExpr + ' =';
        addHistory('general', 'expr', genResult, genExpr);
        genExpr = '';
    } catch (e) { document.getElementById('gen-result').textContent = 'Error'; genResult = 'Error'; genExpr = ''; }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    renderDB('general');
    renderHistory();
    setFormula('electro', 'led');
    setFormula('med', 'goteo');
    setFormula('fin', 'prestamo');
    setFormula('quim', 'molar');
    setFormula('civil', 'hormigon');
    setFormula('mec', 'torque');
    setFormula('geom', 'circulo');
    setFormula('unit', 'longitud');
    setFormula('fis', 'velocidad');
    // Asegurarse de que las nuevas fórmulas se inicialicen
    setFormula('unit', 'longitud'); // Re-inicializar para las nuevas, la primera está bien
    setFormula('unit', 'velocidad'); // Por ejemplo, para que aparezca el primero de los nuevos
    setFormula('diseno', 'conv'); // Ya estaba, pero lo dejamos
    
    setFormula('diseno', 'conv');

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./service-worker.js', { scope: './' })
            .then(reg => {
                console.log('SW Registrado');
                reg.onupdatefound = () => {
                    const installingWorker = reg.installing;
                    installingWorker.onstatechange = () => {
                        if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('Actualización disponible.');
                        }
                    };
                };
            })
            .catch(err => console.error('SW Error:', err));
    }
});