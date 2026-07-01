function setMode(mode) {
    AnalyticsManager.trackModule(mode);

    if (currentMode === 'acust' && mode !== 'acust' && AcusticaAudio.isPlaying) {
        AcusticaAudio.stopContinuousTone();
    }

    document.querySelectorAll('.mode-section').forEach(s => s.classList.remove('active'));
    document.getElementById('mode-' + mode).classList.add('active');
    currentMode = mode;
    const modeNames = { 
        general: 'General', electro: 'Electrónica', med: 'Medicina', fin: 'Finanzas', quim: 'Química', 
        civil: 'Arquitectura y Construcción', mec: 'Mecánica', geom: 'Geometría', unit: 'Unidades', fis: 'Física', 
        diseno: 'Diseño y Multimedia', nutri: 'Nutrición', acust: 'Acústica', prog: 'Programación', estad: 'Estadística',
        redes: 'Redes y Conectividad', alg: 'Álgebra'
    };
    const modeColors = { 
        general: '#4f9cf9', electro: '#38e8c8', med: '#f97b4f', fin: '#a78bfa', quim: '#f9c74f', 
        civil: '#4ff97b', mec: '#f94f4f', geom: '#f94fa7', unit: '#4fdbf9', fis: '#f9f54f', 
        diseno: '#f9a74f', nutri: '#f97ba7', acust: '#4fbfa7', prog: '#7b4ff9', estad: '#f9f94f',
        redes: '#f94f9f', alg: '#e8b838'
    };
    document.getElementById('current-name').textContent = modeNames[mode];
    document.getElementById('current-dot').style.background = modeColors[mode];
    document.getElementById('status-mode').textContent = 'Modo: ' + modeNames[mode];
    renderUnifiedDB(mode);
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
    if (f.type === 'color') {
        let v = f.val || '#000000';
        return `<div style="display:flex;align-items:center;gap:6px"><input type="color" id="picker-${f.id}" value="${v}" oninput="document.getElementById('field-${f.id}').value=this.value.toUpperCase()" style="width:36px;height:36px;border:none;border-radius:50%;cursor:pointer;padding:0;background:none;flex-shrink:0"><input type="text" id="field-${f.id}" value="${v}" maxlength="7" oninput="var p=document.getElementById('picker-${f.id}');if(/^#[0-9a-f]{6}$/i.test(this.value))p.value=this.value" style="flex:1;font-family:var(--mono);text-transform:uppercase" placeholder="${f.label}"></div>`;
    }
    if (f.type === 'text' || (f.val && String(f.val).startsWith('#'))) {
        if (f.maxlength) {
            let ml = f.maxlength;
            return `<div style="display:flex;flex-direction:column"><input type="text" id="field-${f.id}" value="${f.val || ''}" maxlength="${ml}" oninput="var w=document.getElementById('warn-${f.id}');if(this.value.length>=${ml}){w.style.color='var(--danger)';w.textContent='⚠ Límite de ${ml} caracteres'}else{w.style.color='var(--accent)';w.textContent='Máx. ${ml} caracteres'}" placeholder="${f.label}"><span id="warn-${f.id}" style="font-size:10px;color:var(--accent);margin-top:2px">Máx. ${ml} caracteres</span></div>`;
        }
        return `<input type="text" id="field-${f.id}" value="${f.val || ''}" oninput="this.value = this.value.slice(0,500)" placeholder="${f.label}">`;
    }

    return `<input type="number" 
        id="field-${f.id}" 
        value="${f.val || ''}" 
        step="any" 
        onkeydown="if(event.key.length===1&&!event.ctrlKey&&!event.metaKey&&'0123456789.-'.indexOf(event.key)===-1)event.preventDefault()"
        oninput="this.value = this.value.slice(0,12).replace(/[^0-9.\-]/g,'')"
        placeholder="${f.label}">`;
}

function getFields(module, key) {
    let def = FORMS[module][key];
    let container = document.getElementById('form-' + module);
    let fields = {};
    def.fields.forEach(f => { fields[f.id] = container.querySelector('#field-' + f.id); });
    return fields;
}

function saveInputs(module, key, fields) {
    const data = {};
    Object.keys(fields).forEach(id => { data[id] = fields[id].value; });
    localStorage.setItem(`last_input_${module}_${key}`, JSON.stringify(data));
}

function setFormula(module, key, event) {
    AnalyticsManager.trackFormula(module, key);

    if (event && event.target) {
        document.querySelectorAll('#mode-' + module + ' .chip').forEach(c => c.classList.remove('active'));
        event.target.classList.add('active');
    }
    activeFormula[module] = key;
    renderForm(module, key);
    document.getElementById('result-' + module).classList.remove('show');
    document.getElementById('steps-' + module).classList.remove('show');
}

const _visualScripts = {
    electro: 'electro_visual', med: 'medicina_visual', fin: 'finanzas_visual',
    quim: 'quimica_visual', civil: 'civil_visual', mec: 'mecanica_visual',
    geom: 'geometria_visual', unit: 'unidades_visual', fis: 'fisica_visual',
    diseno: 'diseno_visual', nutri: 'nutricion_visual', acust: 'acustica_visual',
    prog: 'programacion_visual', redes: 'redes_visual', alg: 'algebra_visual'
};
const _loadedVisuals = new Set();

function _loadVisual(module, callback) {
    if (_loadedVisuals.has(module)) { callback(); return; }
    const file = _visualScripts[module];
    if (!file) { callback(); return; }
    const s = document.createElement('script');
    s.src = `js/modulos/visuales/${file}.js`;
    s.onload = () => { _loadedVisuals.add(module); callback(); };
    s.onerror = () => { callback(); };
    document.body.appendChild(s);
}

function renderChart(module, res) {
    const canvas = document.getElementById(`chart-canvas-${module}`);
    if (!canvas) return;

    if (canvas._animId) {
        cancelAnimationFrame(canvas._animId);
        canvas._animId = null;
    }

    if (!res || typeof res.chart !== 'function') {
        canvas.style.display = 'none';
        return;
    }

    canvas.style.display = 'block';
    void canvas.offsetWidth;

    window._lastChartRender = window._lastChartRender || {};
    window._lastChartRender[module] = res.chart;

    if (_loadedVisuals.has(module)) {
        try { res.chart(canvas); } catch (e) { console.error('Error en gráfico:', module, e); }
    } else {
        _loadVisual(module, () => {
            try { res.chart(canvas); } catch (e) { console.error('Error en gráfico:', module, e); }
        });
    }
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
    html += `<canvas id="chart-canvas-${module}" style="display:none;width:100%;height:180px;border-radius:8px;margin-top:12px;background:linear-gradient(135deg, rgba(46,49,73,0.3) 0%, rgba(30,32,40,0.8) 100%);"></canvas>`;
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

    def.fields.forEach(f => {
        const input = el.querySelector(`#field-${f.id}`);
        if (input) input.addEventListener('input', () => updateChartPreview(module, key));
    });
    if (def.vars) {
        const incognitaSel = document.getElementById(`incognita-${module}`);
        if (incognitaSel) incognitaSel.addEventListener('change', () => updateChartPreview(module, key));
    }
    updateChartPreview(module, key);
}

function updateChartPreview(module, key) {
    const def = FORMS[module][key];
    const fields = getFields(module, key);
    const targetVar = def.vars ? document.getElementById(`incognita-${module}`).value : null;

    try {
        const res = def.calc(fields, targetVar);
        renderChart(module, res);
    } catch (e) {
        renderChart(module, null);
    }
}

function updateColorPreview(module, key) {
    const def = FORMS[module][key];
    const fields = getFields(module, key);

    try {
        const res = def.calc(fields);
        if (res && res.chart) {
            const canvas = document.getElementById(`chart-canvas-${module}`);
            if (canvas) {
                res.chart(canvas);
            }
        }
    } catch (e) {
    }
}

function toggleAudioContinuous() {
    const btn = document.getElementById('audio-toggle-btn');
    if (AcusticaAudio.isPlaying) {
        AcusticaAudio.stopContinuousTone();
        if (btn) btn.textContent = '🔊 Activar Tono Continuo';
    } else {
        AcusticaAudio.startContinuousTone(440, 0.2);
        if (btn) btn.textContent = '🔇 Apagar Tono Continuo';
    }
}

function updateFieldsVisibility(module, key) {
    const targetVar = document.getElementById(`incognita-${module}`).value;
    const def = FORMS[module][key];
    const fields = getFields(module, key);

    def.fields.forEach(f => {
        const input = document.getElementById(`field-${f.id}`);
        if (input) input.disabled = false;
    });

    if (def.onChange) def.onChange(targetVar, fields);
}

function calculate(module, key) {
    let def = FORMS[module][key];
    let fields = getFields(module, key);
    
    let targetVar = def.vars ? document.getElementById(`incognita-${module}`).value : null;
    let missingFields = def.fields.filter(f => {
        const isTargetField = def.vars && def.vars.some(v => v.id === f.id) && f.id === targetVar;
        const isDisabled = fields[f.id].disabled;
        return !isTargetField && !isDisabled && (fields[f.id].value === '' || fields[f.id].value === null);
    });
    
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
        if (!res) throw new Error("Verificá los datos ingresados");
        
        if (res.error) {
            let rel = document.getElementById('result-' + module);
            let explanationHtml = res.explanation ? `<div class="result-extra info" style="margin-top:10px">${res.explanation}</div>` : '';
            rel.innerHTML = `<div class="result-label" style="color:var(--danger)">${res.label || 'Error'}</div><div class="result-main" style="font-size:16px">${res.msg}</div>${explanationHtml}`;
            rel.classList.add('show');
            return;
        }
    } catch (e) { 
        let rel = document.getElementById('result-' + module);
        rel.innerHTML = `<div class="result-label" style="color:var(--danger)">Error: ${e.message || 'verificá los valores'}</div>`; 
        rel.classList.add('show'); 
        return; 
    }

    let formattedMain = res.main;
    let numVal = parseFloat(res.main);
    if (!isNaN(numVal)) {
        formattedMain = formatNumber(numVal);
    }
    
    let formattedExtras = (res.extras || []).map(e => {
        let txt = e.txt;
        let numMatch = txt.match(/\d+\.?\d*/g);
        if (numMatch) {
            numMatch.forEach(n => {
                let parsed = parseFloat(n);
                if (!isNaN(parsed)) {
                    txt = txt.replace(n, formatNumber(parsed));
                }
            });
        }
        return { ...e, txt };
    });

    let rel = document.getElementById('result-' + module);
    let extrasHtml = formattedExtras.map(e => `<div class="result-extra ${e.cls}">${e.txt}</div>`).join('');

    if (module === 'acust') {
        const buttonText = AcusticaAudio.isPlaying ? '🔇 Apagar Tono Continuo' : '🔊 Activar Tono Continuo';
        extrasHtml += `<button id="audio-toggle-btn" class="btn-secondary" onclick="toggleAudioContinuous()" style="margin-top:10px;width:100%">${buttonText}</button>`;
    }

    rel.innerHTML = `<div class="result-label"><span>${res.label}</span></div><div class="result-main">${formattedMain}</div><div class="result-extras">${extrasHtml}</div>`;
    rel.classList.add('show');

        document.getElementById('steps-' + module).innerHTML = (res.steps || []).map(s => `<div class="step">${s}</div>`).join('');
        if (showSteps) document.getElementById('steps-' + module).classList.add('show');
        renderChart(module, res);
        const chartDataUrl = getCanvasImage(module) || '';
        const histInputs = {};
        def.fields.forEach(f => { if (fields[f.id]) histInputs[f.id] = fields[f.id].value; });
        const histTarget = def.vars ? (document.getElementById(`incognita-${module}`).value || '') : '';
        addHistory(module, key, formattedMain, res.label, '', res.steps || [], chartDataUrl, histInputs, histTarget);
}

function addHistory(module, key, val, label, expr, steps, chartDataUrl, inputs, targetVar) {
    const maxHistory = LicenseManager.isPro ? 500 : 10;
    history.unshift({ module, key, val, label, expr: expr || '', steps: steps || [], chartDataUrl: chartDataUrl || '', inputs: inputs || {}, targetVar: targetVar || '', time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) });
    if (history.length > maxHistory) history.pop();
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
    const maxHistory = LicenseManager.isPro ? 500 : 10;
    const counter = LicenseManager.isPro ? `${history.length}` : `${history.length}/${maxHistory}`;
    el.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;font-size:10px;color:var(--text3)"><span>${counter} cálculos</span>${LicenseManager.isPro ? '<span style="color:var(--accent2)">PRO</span>' : ''}</div>` + history.map((h, idx) => `<div class="history-item" onclick="showHistoryDetail(${idx})"><div class="history-label">${h.module} · ${h.key} · ${h.time}</div><div class="history-val">${h.val}</div></div>`).join('');
}

function showHistoryDetail(idx) {
    const h = history[idx];
    if (!h) return;
    if (!LicenseManager.isPro) {
        showProUpgradeModal('Ver detalle del cálculo', 'Accedé al desglose completo de cada cálculo paso a paso.');
        return;
    }

    let chartSvg = '';
        const canPlot = h.key === 'func' || h.key === 'quadratic' || h.key === 'system' || h.key === 'linear2var' || (h.key === 'eq' && h.expr && /x/.test(h.expr));
    if (canPlot) {
        let plotExpr = h.expr || (h.label ? h.label.replace('f(x) = ', '') : '');
        if (h.key === 'eq' && plotExpr.includes('=')) plotExpr = plotExpr.split('=')[0].trim();
        plotExpr = plotExpr.replace(/²/g, '^2').replace(/π/g, 'pi');
        if (plotExpr && /x/.test(plotExpr)) {
            const svg = renderFunctionToSVG(plotExpr, 480, 240);
            if (svg) chartSvg = `<div style="margin:14px 0;text-align:center">${svg}</div>`;
        }
    } else if (h.key !== 'expr' && h.chartDataUrl) {
        chartSvg = `<div style="margin:14px 0;text-align:center"><img src="${h.chartDataUrl}" style="max-width:100%;border-radius:8px;border:1px solid #2a3040"></div>`;
    }

    let stepsHtml = '';
    if (h.steps && h.steps.length) {
        stepsHtml = `<div style="font-size:11px;color:#4a5570;margin:14px 0 6px;text-transform:uppercase;letter-spacing:1px">Pasos de resolución</div>`;
        h.steps.forEach(s => stepsHtml += `<div style="background:#111318;border:1px solid #2a3040;border-radius:6px;padding:8px 12px;margin-bottom:4px;font-size:12px;color:#e8edf5">${s}</div>`);
    }

    const overlay = document.createElement('div');
    overlay.className = 'history-detail-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;animation:fadeIn 0.2s';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

    const content = document.createElement('div');
    content.style.cssText = 'background:#181c24;border:1px solid #2a3040;border-radius:12px;padding:24px;max-width:600px;width:90%;max-height:85vh;overflow-y:auto;position:relative';
    content.innerHTML = `
        <div style="font-size:11px;color:#4a5570;margin-bottom:2px">${h.module} · ${h.key} · ${h.time}</div>
        ${h.label ? `<div style="font-size:13px;color:#8a97b0;margin-bottom:8px">${h.label}</div>` : ''}
        <div style="font-size:22px;font-weight:700;color:#e8edf5;margin-bottom:12px">${escHtml(h.val)}</div>
        ${chartSvg}
        ${stepsHtml}
    `;

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'margin-top:16px;display:flex;gap:8px';

    const useBtn = document.createElement('button');
    useBtn.textContent = 'Usar resultado';
    useBtn.style.cssText = 'flex:1;padding:10px;background:#4f9cf9;color:#0a0b0e;border:none;border-radius:8px;font-weight:700;font-size:13px;cursor:pointer';
    useBtn.onclick = () => {
        overlay.remove();
        if (h.module === 'general') {
            setMode('general');
            const el = document.getElementById('gen-result');
            if (el) el.textContent = h.val;
            const exprEl = document.getElementById('gen-expr');
            if (exprEl) exprEl.textContent = h.expr || '';
            genResult = h.val;
            genExpr = h.expr || '';
        } else if (h.module && h.key && FORMS[h.module]?.[h.key]) {
            setMode(h.module);
            setFormula(h.module, h.key);
            const chips = document.querySelectorAll(`#mode-${h.module} .chip`);
            chips.forEach(c => c.classList.remove('active'));
            chips.forEach(c => {
                const onclick = c.getAttribute('onclick') || '';
                if (onclick.includes(`'${h.key}'`)) c.classList.add('active');
            });
            if (h.inputs) {
                Object.entries(h.inputs).forEach(([id, val]) => {
                    const el = document.getElementById(`field-${id}`);
                    if (el) el.value = val;
                });
            }
            if (h.targetVar) {
                const sel = document.getElementById(`incognita-${h.module}`);
                if (sel) sel.value = h.targetVar;
                updateFieldsVisibility(h.module, h.key);
            }
            calculate(h.module, h.key);
        }
    };

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Cerrar';
    closeBtn.style.cssText = 'padding:10px 16px;background:#1e232f;color:#8a97b0;border:1px solid #2a3040;border-radius:8px;font-size:12px;cursor:pointer';
    closeBtn.onclick = () => overlay.remove();

    const closeX = document.createElement('button');
    closeX.textContent = '✕';
    closeX.style.cssText = 'position:absolute;top:12px;right:12px;background:none;border:none;color:#4a5570;font-size:18px;cursor:pointer';
    closeX.onclick = () => overlay.remove();

    btnRow.appendChild(useBtn);
    btnRow.appendChild(closeBtn);
    content.appendChild(btnRow);
    content.appendChild(closeX);
    overlay.appendChild(content);
    document.body.appendChild(overlay);
}

let dbPanelOpen = false;
function toggleDBPanel() {
    dbPanelOpen = !dbPanelOpen;
    const body = document.getElementById('unified-db-panel');
    const arrow = document.getElementById('db-toggle-arrow');
    if (body) body.style.display = dbPanelOpen ? 'block' : 'none';
    if (arrow) arrow.style.transform = dbPanelOpen ? 'rotate(90deg)' : 'rotate(0deg)';
}

const GENERAL_FORMULAS = [
    { cat: 'Álgebra', items: [
        { name: 'Cuadrática', formula: 'x = (-b ± √(b²-4ac)) / 2a' },
        { name: 'Pitágoras', formula: 'a² + b² = c²' },
        { name: 'Distancia 2D', formula: 'd = √((x₂-x₁)² + (y₂-y₁)²)' },
        { name: 'Punto medio', formula: 'Pm = ((x₁+x₂)/2, (y₁+y₂)/2)' }
    ]},
    { cat: 'Geometría', items: [
        { name: 'Área círculo', formula: 'A = π·r²' },
        { name: 'Circunferencia', formula: 'C = 2·π·r' },
        { name: 'Área rectángulo', formula: 'A = b·h' },
        { name: 'Área triángulo', formula: 'A = (b·h)/2' },
        { name: 'Volumen esfera', formula: 'V = (4/3)·π·r³' }
    ]}
];

function renderUnifiedDB(mode) {
    const el = document.getElementById('unified-db-content');
    if (!el) return;
    const modeItems = DB[mode] || [];
    let html = '';
    if (modeItems.length) {
        html += `<div style="margin-bottom:10px"><div style="font-size:11px;color:var(--accent);font-weight:700;margin-bottom:4px">⚡ Constantes rápidas</div><div class="db-grid">${modeItems.map(i => `<div class="db-item"><div class="dbi-name">${i.name}</div><div class="dbi-formula">${i.val}</div></div>`).join('')}</div></div>`;
    }
    html += GENERAL_FORMULAS.map(g => `
        <div style="margin-bottom:10px">
            <div style="font-size:11px;color:var(--accent);font-weight:700;margin-bottom:4px">${g.cat}</div>
            <div class="db-grid">
                ${g.items.map(i => `
                    <div class="db-item">
                        <div class="dbi-name">${i.name}</div>
                        <div class="dbi-formula">${i.formula}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
    el.innerHTML = html;
}

function clearHistory() { history = []; localStorage.removeItem('sumamente_history'); renderHistory(); }
function toggleSteps() { 
    showSteps = !showSteps; 
    document.querySelectorAll('.steps').forEach(s => { if (showSteps) s.classList.add('show'); else s.classList.remove('show'); });
    
    if (showSteps && currentPlotType === 'equation' && currentPlotExpr) {
        generateAlgebraicSteps(currentPlotExpr);
    }
}

function createStepsPanel() {
    let sp = document.getElementById('gen-steps');
    if (!sp) {
        sp = document.createElement('div');
        sp.id = 'gen-steps';
        sp.className = 'steps';
        const canvas = document.getElementById('chart-canvas-general');
        const parent = (canvas && canvas.parentElement) || document.querySelector('.panel-body');
        if (parent) parent.appendChild(sp);
    }
    return sp;
}
