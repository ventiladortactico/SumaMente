let currentMode = 'general';
let showSteps = false;
let history = [];
let genExpr = '';
let genResult = '0';
let genLastResult = null;
let genMemory = 0;

// Plotting state
let plotMinX = -10, plotMaxX = 10;
let plotMinY = -10, plotMaxY = 10;
let plotDragging = false;
let plotLastX = 0, plotLastY = 0;
let currentPlotExpr = '';
let currentPlotType = ''; // 'function' or 'equation'
let activeFormula = { 
    electro: 'ohm', med: 'goteo', fin: 'prestamo', quim: 'molar', civil: 'hormigon', mec: 'torque', geom: 'circulo', 
    unit: 'longitud', fis: 'velocidad', diseno: 'conv', nutri: 'macros', acust: 'spl', prog: 'bases', estad: 'basica', redes: 'subredes'
};

let angleMode = 'deg'; // 'deg' | 'rad'

// ── Gestor de publicidad AdMob (Banner discreto) ──
const AdManager = {
    isInitialized: false,
    bannerId: 'ca-app-pub-3940256099942544/6300978111', // Test banner ID

    async init() {
        if (this.isInitialized) return;

        try {
            const { AdMob } = await import('@capacitor-community/admob');
            await AdMob.initialize();
            this.isInitialized = true;
            console.log('AdMob inicializado');
        } catch (error) {
            console.log('AdMob no disponible (web o error):', error.message);
        }
    },

    async showBanner() {
        if (!this.isInitialized || LicenseManager.isPro || LicenseManager.isCollaborator) {
            return;
        }

        try {
            const { AdMob } = await import('@capacitor-community/admob');
            await AdMob.showBanner({
                adId: this.bannerId,
                position: 'bottom',
                margin: 0,
                isTesting: true // Usar true en desarrollo, false en producción
            });
            console.log('Banner AdMob mostrado');
        } catch (error) {
            console.log('Error al mostrar banner:', error.message);
        }
    },

    async hideBanner() {
        try {
            const { AdMob } = await import('@capacitor-community/admob');
            await AdMob.hideBanner();
            console.log('Banner AdMob oculto');
        } catch (error) {
            console.log('Error al ocultar banner:', error.message);
        }
    }
};

// ── Gestor de licencias (PREPARACIÓN — sin UI, sin billing) ──
const LicenseManager = {
    _data: null,

    load() {
        try { this._data = JSON.parse(localStorage.getItem('SumaMente_license')); } catch(e) {}
        if (!this._data || typeof this._data.tier !== 'string') {
            this._data = { tier: 'free', source: '', activatedAt: '', code: '', version: 1 };
            this.save();
        }
        return this;
    },

    save() {
        localStorage.setItem('SumaMente_license', JSON.stringify(this._data));
    },

    get tier() { return this._data.tier; },
    get isPro() { return this._data.tier === 'pro' || this._data.tier === 'collaborator'; },
    get isCollaborator() { return this._data.tier === 'collaborator'; },

    activate(tier, source, code) {
        this._data.tier = tier;
        this._data.source = source;
        this._data.activatedAt = new Date().toISOString();
        if (code) this._data.code = code;
        this.save();
    },

    redeemCode(code) {
        // Validación de códigos de regalo para colaboradores
        const validCodes = [
            'SUMAMENTE-HELPER-2026',
            'SUMAMENTE-COLAB-001',
            'SUMAMENTE-BETA-001',
            'SUMAMENTE-TEST-2026'
        ];

        if (validCodes.includes(code)) {
            this.activate('collaborator', 'gift', code);
            return true;
        }
        return false;
    },

    reset() {
        this._data = { tier: 'free', source: '', activatedAt: '', code: '', version: 1 };
        this.save();
    },

    export() {
        return JSON.parse(JSON.stringify(this._data));
    }
};

// ── Gestor de temas visuales ──
const ThemeManager = {
    themes: {
        dark: {
            name: 'Dark',
            icon: '🌙',
            vars: {
                '--bg': '#0a0b0e', '--surface': '#111318', '--surface2': '#181c24',
                '--surface3': '#1e232f', '--border': '#2a3040', '--border2': '#3a4558',
                '--accent': '#4f9cf9', '--accent2': '#38e8c8', '--accent3': '#f97b4f',
                '--accent4': '#a78bfa', '--text': '#e8edf5', '--text2': '#8a97b0', '--text3': '#4a5570'
            }
        },
        ocean: {
            name: 'Océano',
            icon: '🌊',
            vars: {
                '--bg': '#0a0e1a', '--surface': '#0f1a2e', '--surface2': '#142240',
                '--surface3': '#1a2d52', '--border': '#1e3a6e', '--border2': '#2a5090',
                '--accent': '#5bc0eb', '--accent2': '#48e5c2', '--accent3': '#f9a84f',
                '--accent4': '#9b72cf', '--text': '#e0f0ff', '--text2': '#7ab0d4', '--text3': '#3a6080'
            }
        },
        forest: {
            name: 'Bosque',
            icon: '🌿',
            vars: {
                '--bg': '#0a1008', '--surface': '#111a10', '--surface2': '#1a2a18',
                '--surface3': '#243a20', '--border': '#2a4a28', '--border2': '#3a6a38',
                '--accent': '#6bc46e', '--accent2': '#4ade80', '--accent3': '#f9c74f',
                '--accent4': '#a78bfa', '--text': '#e0f0d8', '--text2': '#7aa878', '--text3': '#3a6838'
            }
        },
        midnight: {
            name: 'Midnight',
            icon: '🌃',
            vars: {
                '--bg': '#0d0d1a', '--surface': '#151528', '--surface2': '#1e1e3a',
                '--surface3': '#2a2a4a', '--border': '#3a3a5a', '--border2': '#4a4a7a',
                '--accent': '#818cf8', '--accent2': '#c084fc', '--accent3': '#f472b6',
                '--accent4': '#34d399', '--text': '#e8e0f5', '--text2': '#9890b0', '--text3': '#58507a'
            }
        }
    },
    _current: null,

    load() {
        try { this._current = localStorage.getItem('SumaMente_theme') || 'dark'; } catch(e) { this._current = 'dark'; }
        this.apply(this._current);
        return this;
    },

    get current() { return this._current; },

    apply(key) {
        const theme = this.themes[key];
        if (!theme) return;
        this._current = key;
        localStorage.setItem('SumaMente_theme', key);
        const root = document.documentElement;
        Object.entries(theme.vars).forEach(([prop, val]) => root.style.setProperty(prop, val));
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.content = theme.vars['--bg'];
    },

    applyThemeFromLicense() {
        if (LicenseManager.isPro) {
            const saved = localStorage.getItem('SumaMente_theme');
            if (saved && this.themes[saved]) { this.apply(saved); return; }
        }
        this.apply('dark');
    }
};

// ── Gestor de métricas de uso (Analytics) ──
const AnalyticsManager = {
    _data: null,

    load() {
        try {
            this._data = JSON.parse(localStorage.getItem('SumaMente_analytics'));
        } catch(e) {}
        if (!this._data) {
            this._data = {
                modules: {},
                formulas: {},
                searches: {},
                firstOpen: new Date().toISOString(),
                lastOpen: new Date().toISOString(),
                sessionCount: 0
            };
            this.save();
        }
        return this;
    },

    save() {
        localStorage.setItem('SumaMente_analytics', JSON.stringify(this._data));
    },

    trackModule(module) {
        if (!this._data.modules[module]) {
            this._data.modules[module] = 0;
        }
        this._data.modules[module]++;
        this.save();
    },

    trackFormula(module, formula) {
        const key = `${module}:${formula}`;
        if (!this._data.formulas[key]) {
            this._data.formulas[key] = 0;
        }
        this._data.formulas[key]++;
        this.save();
    },

    trackSearch(query) {
        if (!query || query.length < 2) return;
        const normalized = query.toLowerCase().trim();
        if (!this._data.searches[normalized]) {
            this._data.searches[normalized] = 0;
        }
        this._data.searches[normalized]++;
        this.save();
    },

    recordSession() {
        this._data.lastOpen = new Date().toISOString();
        this._data.sessionCount++;
        this.save();
    },

    getTopModules(limit = 5) {
        return Object.entries(this._data.modules)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit);
    },

    getTopFormulas(limit = 5) {
        return Object.entries(this._data.formulas)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit);
    },

    getTopSearches(limit = 5) {
        return Object.entries(this._data.searches)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit);
    },

    export() {
        return JSON.parse(JSON.stringify(this._data));
    }
};

// ── Gestor de compras Google Play Billing ──
const BillingManager = {
    isInitialized: false,
    productId: 'sumamente_pro_lifetime', // ID del producto en Google Play Console

    async init() {
        if (this.isInitialized) return;

        try {
            const { CdvPurchase } = await import('capacitor-plugin-cdv-purchase');
            await CdvPurchase.initialize([
                {
                    id: this.productId,
                    type: CdvPurchase.ProductType.NON_CONSUMABLE
                }
            ]);
            this.isInitialized = true;
            console.log('Billing inicializado');
        } catch (error) {
            console.log('Billing no disponible (web o error):', error.message);
        }
    },

    async purchasePro() {
        if (!this.isInitialized) {
            console.log('Billing no inicializado');
            return false;
        }

        try {
            const { CdvPurchase } = await import('capacitor-plugin-cdv-purchase');
            const offer = await CdvPurchase.getOffers([this.productId]);

            if (offer.length === 0) {
                console.log('No se encontraron ofertas para el producto');
                return false;
            }

            const result = await CdvPurchase.purchase(offer[0]);

            if (result) {
                // Compra exitosa, activar PRO
                LicenseManager.activate('pro', 'playstore');
                AdManager.hideBanner();
                console.log('Compra PRO exitosa');
                return true;
            }

            return false;
        } catch (error) {
            console.log('Error en compra PRO:', error.message);
            return false;
        }
    },

    async restorePurchases() {
        if (!this.isInitialized) {
            console.log('Billing no inicializado');
            return false;
        }

        try {
            const { CdvPurchase } = await import('capacitor-plugin-cdv-purchase');
            await CdvPurchase.restorePurchases();

            // Verificar si el usuario tiene PRO
            const purchases = await CdvPurchase.getLatestPurchases();
            const hasPro = purchases.some(p => p.productId === this.productId);

            if (hasPro) {
                LicenseManager.activate('pro', 'playstore');
                AdManager.hideBanner();
                console.log('PRO restaurado');
                return true;
            }

            return false;
        } catch (error) {
            console.log('Error al restaurar compras:', error.message);
            return false;
        }
    }
};

function exportGenPDF() {
    const expr = document.getElementById('gen-expr').textContent;
    const result = document.getElementById('gen-result').textContent;
    if (!expr && result === '0') return;
    exportResultPDF('General', expr || 'resultado', result, expr ? `Resultado: ${expr}` : 'Resultado');
}

function exportResultPDF(module, key, val, label, steps) {
    const w = window.open('', '_blank');
    if (!w) { alert('Permite ventanas emergentes para exportar PDF'); return; }
    const isPro = LicenseManager.isPro;
    w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>SumaMente - ${label}</title><style>
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#0a0b0e;color:#e8edf5;font-family:'JetBrains Mono',monospace;padding:30px;max-width:800px;margin:0 auto}
        h1{font-family:'Syne',sans-serif;font-size:22px;color:#4f9cf9;margin-bottom:5px}
        .sub{font-size:11px;color:#4a5570;margin-bottom:25px}
        .label{font-size:12px;color:#8a97b0;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px}
        .value{font-size:28px;font-weight:700;color:#e8edf5;margin-bottom:20px;word-break:break-all}
        .step{background:#111318;border:1px solid #2a3040;border-radius:6px;padding:8px 12px;margin-bottom:4px;font-size:12px;color:#e8edf5}
        .steps-title{font-size:12px;color:#4a5570;margin-bottom:8px;margin-top:20px}
        .footer{margin-top:30px;padding-top:15px;border-top:1px solid #2a3040;font-size:10px;color:#4a5570;text-align:center}
        .badge{display:inline-block;background:#38e8c8;color:#0a0b0e;font-size:9px;padding:2px 8px;border-radius:4px;font-weight:700;margin-left:8px}
        @media print{body{padding:15px}@page{margin:1.5cm}}
    </style></head><body>
    <h1>SumaMente${isPro ? ' <span class="badge">PRO</span>' : ''}</h1>
    <div class="sub">${module} · ${key} · ${new Date().toLocaleString('es-AR')}</div>
    <div class="label">${label}</div>
    <div class="value">${val}</div>`);
    if (steps && steps.length) {
        w.document.write(`<div class="steps-title">Pasos de resolución</div>`);
        steps.forEach(s => w.document.write(`<div class="step">${s}</div>`));
    }
    w.document.write(`<div class="footer">Generado por SumaMente Cientifica</div></body></html>`);
    w.document.close();
    setTimeout(() => { w.focus(); w.print(); }, 500);
}

// Formato inteligente: muestra enteros sin decimales, decimales con precisión necesaria
function formatNumber(num, decimals = 3) {
    if (isNaN(num)) return num;
    // Verificar si es entero
    if (Number.isInteger(Number(num))) {
        return num.toString();
    }
    // Si es decimal, redondear y quitar ceros innecesarios
    return parseFloat(num).toFixed(decimals).replace(/\.?0+$/, '');
}

function setMode(mode) {
    // Rastrear uso de módulos
    AnalyticsManager.trackModule(mode);

    // Detener audio si salimos del módulo de acústica
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
        redes: 'Redes y Conectividad'
    };
    const modeColors = { 
        general: '#4f9cf9', electro: '#38e8c8', med: '#f97b4f', fin: '#a78bfa', quim: '#f9c74f', 
        civil: '#4ff97b', mec: '#f94f4f', geom: '#f94fa7', unit: '#4fdbf9', fis: '#f9f54f', 
        diseno: '#f9a74f', nutri: '#f97ba7', acust: '#4fbfa7', prog: '#7b4ff9', estad: '#f9f94f',
        redes: '#f94f9f'
    };
    document.getElementById('current-name').textContent = modeNames[mode];
    document.getElementById('current-dot').style.background = modeColors[mode];
    document.getElementById('status-mode').textContent = 'Modo: ' + modeNames[mode];
    renderDB(mode);
    renderGeneralDB();
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

    // Agregamos filtros preventivos: type number, límites de caracteres y bloqueo de caracteres extraños
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
    // Rastrear uso de fórmulas
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

    try {
        res.chart(canvas);
    } catch (e) {
        console.error('Error en gráfico:', module, e);
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
        // Silencioso para no interrumpir la edición
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

    // Primero habilitar todos los campos
    def.fields.forEach(f => {
        const input = document.getElementById(`field-${f.id}`);
        if (input) input.disabled = false;
    });

    // Luego llamar al onChange del módulo si existe
    // El módulo es responsable de deshabilitar el campo correcto
    if (def.onChange) def.onChange(targetVar, fields);
}

function calculate(module, key) {
    let def = FORMS[module][key];
    let fields = getFields(module, key);
    
    // Validación: Verificar campos vacíos que no sean la incógnita y no estén deshabilitados
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
        
        // Si el módulo retorna un objeto de error explícito (camino alternativo)
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

    // Aplicar formato inteligente al resultado principal y extras
    let formattedMain = res.main;
    // Si el resultado es un número, formatearlo
    let numVal = parseFloat(res.main);
    if (!isNaN(numVal)) {
        formattedMain = formatNumber(numVal);
    }
    
    let formattedExtras = (res.extras || []).map(e => {
        let txt = e.txt;
        // Intentar formatear números en los extras
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

    // Agregar botón de audio interactivo para módulo de acústica
    if (module === 'acust') {
        const buttonText = AcusticaAudio.isPlaying ? '🔇 Apagar Tono Continuo' : '🔊 Activar Tono Continuo';
        extrasHtml += `<button id="audio-toggle-btn" class="btn-secondary" onclick="toggleAudioContinuous()" style="margin-top:10px;width:100%">${buttonText}</button>`;
    }

    const pdfBtn = LicenseManager.isPro ? `<button class="btn-pdf" onclick="exportResultPDF('${module}','${key}','${formattedMain.replace(/'/g, "\\'")}','${res.label.replace(/'/g, "\\'")}')" title="Exportar PDF" style="background:none;border:1px solid var(--border2);color:var(--text3);border-radius:6px;padding:4px 10px;font-size:11px;cursor:pointer;margin-left:8px;transition:all 0.15s" onmouseover="this.style.color='var(--accent2)';this.style.borderColor='var(--accent2)'" onmouseout="this.style.color='var(--text3)';this.style.borderColor='var(--border2)'">📄 PDF</button>` : '';
    rel.innerHTML = `<div class="result-label" style="display:flex;align-items:center;gap:4px;flex-wrap:wrap"><span>${res.label}</span>${pdfBtn}</div><div class="result-main">${formattedMain}</div><div class="result-extras">${extrasHtml}</div>`;
    rel.classList.add('show');

        document.getElementById('steps-' + module).innerHTML = (res.steps || []).map(s => `<div class="step">${s}</div>`).join('');
        if (showSteps) document.getElementById('steps-' + module).classList.add('show');
        renderChart(module, res);
        addHistory(module, key, formattedMain, res.label);
}

function addHistory(module, key, val, label) {
    const maxHistory = LicenseManager.isPro ? 500 : 10;
    history.unshift({ module, key, val, label, time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) });
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
    el.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;font-size:10px;color:var(--text3)"><span>${counter} cálculos</span>${LicenseManager.isPro ? '<span style="color:var(--accent2)">PRO</span>' : ''}</div>` + history.map(h => `<div class="history-item" onclick="injectHistory('${h.val}')"><div class="history-label">${h.module} · ${h.key} · ${h.time}</div><div class="history-val">${h.val}</div></div>`).join('');
}

function clearHistory() { history = []; localStorage.removeItem('sumamente_history'); renderHistory(); }
function toggleSteps() { 
    showSteps = !showSteps; 
    document.querySelectorAll('.steps').forEach(s => { if (showSteps) s.classList.add('show'); else s.classList.remove('show'); });
    
    // Si hay una ecuación graficada, generar pasos algebraicos
    if (showSteps && currentPlotType === 'equation' && currentPlotExpr) {
        generateAlgebraicSteps(currentPlotExpr);
    }
}

function generateAlgebraicSteps(equation) {
    try {
        const parts = equation.split('=');
        if (parts.length !== 2) return;
        
        const left = parts[0].trim();
        const right = parts[1].trim();
        const steps = [];
        
        steps.push(`<strong>Ecuación original:</strong> ${left} = ${right}`);
        
        // Detectar tipo de ecuación y generar pasos
        if (left.includes('x') && right.includes('x')) {
            // Ecuación lineal: ax + b = cx + d
            steps.push(`<strong>Paso 1:</strong> Identificar términos con x y constantes`);
            steps.push(`Lado izquierdo: ${left}`);
            steps.push(`Lado derecho: ${right}`);
            
            // Extraer coeficientes
            const leftCoef = extractCoefficient(left, 'x');
            const rightCoef = extractCoefficient(right, 'x');
            const leftConst = extractConstant(left);
            const rightConst = extractConstant(right);
            
            steps.push(`<strong>Análisis:</strong>`);
            steps.push(`• Coeficiente de x (izquierda): ${leftCoef}`);
            steps.push(`• Coeficiente de x (derecha): ${rightCoef}`);
            steps.push(`• Constante (izquierda): ${leftConst}`);
            steps.push(`• Constante (derecha): ${rightConst}`);
            
            steps.push(`<strong>Paso 2:</strong> Agrupar términos con x en el lado izquierdo`);
            steps.push(`Restar ${rightCoef}x de ambos lados`);
            const newLeftCoef = leftCoef - rightCoef;
            steps.push(`${newLeftCoef}x ${leftConst >= 0 ? '+ ' + leftConst : leftConst} = ${rightConst}`);
            
            steps.push(`<strong>Paso 3:</strong> Agrupar constantes en el lado derecho`);
            steps.push(`Restar ${leftConst} de ambos lados`);
            const finalRight = rightConst - leftConst;
            steps.push(`${newLeftCoef}x = ${finalRight}`);
            
            steps.push(`<strong>Paso 4:</strong> Despejar x dividiendo por ${newLeftCoef}`);
            const result = finalRight / newLeftCoef;
            steps.push(`x = ${finalRight} / ${newLeftCoef}`);
            steps.push(`x = ${result.toFixed(4)}`);
            
            steps.push(`<strong>Verificación:</strong>`);
            steps.push(`Sustituir x = ${result.toFixed(4)} en la ecuación original`);
            
        } else if (left.includes('x^2') || right.includes('x^2')) {
            // Ecuación cuadrática real
            // left - right, negando signos de cada término en right
            let combined = left;
            const rightTerms = right.match(/[+-]?[^+-]+/g) || [];
            for (let t of rightTerms) {
                if (t === '') continue;
                if (t.startsWith('-')) combined += '+' + t.slice(1);
                else if (t.startsWith('+')) combined += '-' + t.slice(1);
                else combined += '-' + t;
            }
            const cleaned = combined.replace(/--/g, '+').replace(/\+-/g, '-').replace(/-\+/g, '-').replace(/\+\+/g, '+').replace(/^\+/, '');
            const { a, b, c } = extractQuadraticCoefficients(cleaned);
            
            steps.push(`<strong>Paso 1:</strong> Identificar ecuación cuadrática`);
            steps.push(`${left} = ${right}`);
            steps.push(`<strong>Paso 2:</strong> Llevar todo a un lado igualado a 0`);
            steps.push(`${cleaned} = 0`);
            steps.push(`<strong>Paso 3:</strong> Identificar coeficientes`);
            steps.push(`a = ${a}, b = ${b}, c = ${c}`);
            steps.push(`<strong>Paso 4:</strong> Calcular discriminante`);
            const disc = b * b - 4 * a * c;
            steps.push(`Δ = b² - 4ac = ${b}² - 4·${a}·${c} = ${disc}`);
            
            if (disc > 0) {
                const sqrtDisc = Math.sqrt(disc);
                const x1 = (-b + sqrtDisc) / (2 * a);
                const x2 = (-b - sqrtDisc) / (2 * a);
                steps.push(`Δ > 0 → dos soluciones reales`);
                steps.push(`<strong>Paso 5:</strong> Aplicar fórmula cuadrática`);
                steps.push(`x = (-b ± √Δ) / 2a`);
                steps.push(`x₁ = (${-b} + ${sqrtDisc.toFixed(4)}) / ${2*a} = ${x1.toFixed(4)}`);
                steps.push(`x₂ = (${-b} - ${sqrtDisc.toFixed(4)}) / ${2*a} = ${x2.toFixed(4)}`);
                steps.push(`<strong>Solución:</strong> x₁ = ${x1.toFixed(4)}, x₂ = ${x2.toFixed(4)}`);
            } else if (disc === 0) {
                const x = -b / (2 * a);
                steps.push(`Δ = 0 → una solución real (doble)`);
                steps.push(`x = -b / 2a = ${-b} / ${2*a} = ${x.toFixed(4)}`);
            } else {
                const real = (-b / (2 * a)).toFixed(4);
                const imag = (Math.sqrt(-disc) / (2 * a)).toFixed(4);
                steps.push(`Δ < 0 → dos soluciones complejas conjugadas`);
                steps.push(`x₁ = ${real} + ${imag}i`);
                steps.push(`x₂ = ${real} - ${imag}i`);
            }
            
        } else if (/(sin|cos|tan)\(/.test(left)) {
            // Ecuación trigonométrica (mejorada: paréntesis anidados, argumentos transformados, DEG/RAD)
            const trigF = left.match(/(sin|cos|tan)\(/);
            const func = trigF[1];
            const parenStart = trigF.index + trigF[0].length - 1;
            const inner = extractParenContent(left, parenStart);
            const rhs = safeMathEval(right);
            
            steps.push(`<strong>Ecuación trigonométrica:</strong> ${func}(${inner}) = ${rhs}`);
            
            if (isNaN(rhs) || Math.abs(rhs) > 1) {
                steps.push(`⚠ El valor debe estar entre -1 y 1 para ${func}.`);
            } else {
                const invMap = { sin: 'arcsin', cos: 'arccos', tan: 'arctan' };
                const invFunc = invMap[func];
                
                // Extraer transformación del argumento: ax + b
                let a = 0, b = 0;
                if (/x/.test(inner)) {
                    const innerClean = inner.replace(/\s/g, '');
                    // Buscar coeficiente de x
                    const xMatch = innerClean.match(/(-?\d*\.?\d*)\*?x/);
                    if (xMatch) {
                        a = xMatch[1] === '' || xMatch[1] === '-' ? (xMatch[1] === '-' ? -1 : 1) : parseFloat(xMatch[1]);
                    }
                    // Constante implícita (todo lo que no sea x)
                    const noX = innerClean.replace(/(-?\d*\.?\d*)\*?x/g, '');
                    const constMatch = noX.match(/[+-]?\d+\.?\d*/g);
                    if (constMatch) {
                        b = constMatch.reduce((s, v) => s + parseFloat(v), 0);
                    }
                } else {
                    a = 1;
                    b = safeMathEval(inner);
                }
                
                // Calcular ángulo principal en radianes
                const principalRad = func === 'sin' ? Math.asin(rhs) : func === 'cos' ? Math.acos(rhs) : Math.atan(rhs);
                
                if (angleMode === 'deg') {
                    const principalDeg = principalRad * 180 / Math.PI;
                    steps.push(`<strong>Paso 1:</strong> Calcular ángulo principal (modo DEG)`);
                    steps.push(`${func}(${inner}) = ${rhs}`);
                    steps.push(`${inner} = ${invFunc}(${rhs})`);
                    steps.push(`${inner} = ${principalDeg.toFixed(4)}°`);
                    
                    steps.push(`<strong>Paso 2:</strong> Soluciones generales para el argumento interno`);
                    let sols = [];
                    if (func === 'sin') {
                        sols.push(`${principalDeg.toFixed(4)}° + 360°·n`);
                        sols.push(`${(180 - principalDeg).toFixed(4)}° + 360°·n`);
                    } else if (func === 'cos') {
                        sols.push(`${principalDeg.toFixed(4)}° + 360°·n`);
                        sols.push(`${(-principalDeg).toFixed(4)}° + 360°·n`);
                    } else {
                        sols.push(`${principalDeg.toFixed(4)}° + 180°·n`);
                    }
                    sols.forEach(s => steps.push(`${inner} = ${s}`));
                    
                    if (a !== 1 || b !== 0) {
                        steps.push(`<strong>Paso 3:</strong> Despejar x (transformación lineal ${a}x + ${b})`);
                        sols.forEach((s, idx) => {
                            steps.push(`x = (${s} - (${b})) / ${a}`);
                        });
                    }
                } else {
                    steps.push(`<strong>Paso 1:</strong> Calcular ángulo principal (modo RAD)`);
                    steps.push(`${func}(${inner}) = ${rhs}`);
                    steps.push(`${inner} = ${invFunc}(${rhs})`);
                    steps.push(`${inner} = ${principalRad.toFixed(4)} rad`);
                    
                    steps.push(`<strong>Paso 2:</strong> Soluciones generales para el argumento interno`);
                    let sols = [];
                    if (func === 'sin') {
                        sols.push(`${principalRad.toFixed(4)} + 2πn`);
                        sols.push(`${(Math.PI - principalRad).toFixed(4)} + 2πn`);
                    } else if (func === 'cos') {
                        sols.push(`${principalRad.toFixed(4)} + 2πn`);
                        sols.push(`${(-principalRad).toFixed(4)} + 2πn`);
                    } else {
                        sols.push(`${principalRad.toFixed(4)} + πn`);
                    }
                    sols.forEach(s => steps.push(`${inner} = ${s}`));
                    
                    if (a !== 1 || b !== 0) {
                        steps.push(`<strong>Paso 3:</strong> Despejar x (transformación lineal ${a}x + ${b})`);
                        sols.forEach((s, idx) => {
                            steps.push(`x = (${s} - (${b})) / ${a}`);
                        });
                    }
                }
            }
            
        } else if (left.includes('x') || right.includes('x')) {
            // Ecuación simple con x en un solo lado
            steps.push(`<strong>Paso 1:</strong> Identificar dónde está x`);
            const sideWithX = left.includes('x') ? 'izquierdo' : 'derecho';
            steps.push(`x está en el lado ${sideWithX}`);
            
            if (sideWithX === 'izquierdo') {
                const coef = extractCoefficient(left, 'x');
                const constVal = extractConstant(left);
                steps.push(`<strong>Paso 2:</strong> Restar ${constVal} de ambos lados`);
                steps.push(`${coef}x = ${right - constVal}`);
                steps.push(`<strong>Paso 3:</strong> Dividir por ${coef}`);
                steps.push(`x = ${(right - constVal) / coef}`);
            } else {
                const coef = extractCoefficient(right, 'x');
                const constVal = extractConstant(right);
                steps.push(`<strong>Paso 2:</strong> Restar ${constVal} de ambos lados`);
                steps.push(`${left} = ${coef}x`);
                steps.push(`<strong>Paso 3:</strong> Dividir por ${coef}`);
                steps.push(`x = ${left / coef}`);
            }
            
        } else {
            steps.push(`<strong>Paso 1:</strong> Esta ecuación no contiene variable x`);
            steps.push(`<strong>Paso 2:</strong> Evaluar ambos lados`);
            steps.push(`<strong>Paso 3:</strong> Verificar si la igualdad es verdadera`);
        }
        
        // Mostrar pasos en el panel de la calculadora
        const stepsPanel = document.getElementById('gen-steps') || createStepsPanel();
        stepsPanel.innerHTML = '<details style="cursor:pointer"><summary style="color:var(--accent);font-weight:700;font-size:12px;padding:4px 0">Mostrar pasos</summary>' +
            steps.map(s => `<div class="step">${s}</div>`).join('') + '</details>';
        stepsPanel.classList.add('show');
    } catch (e) {
    }
}

function extractCoefficient(expr, variable) {
    try {
        const match = expr.match(/(-?\d*\.?\d*)\*?x/);
        if (match) {
            const coef = match[1];
            return coef === '' || coef === '-' ? (coef === '-' ? -1 : 1) : parseFloat(coef);
        }
        if (expr.includes(variable)) return 1;
        return 0;
    } catch (e) {
        return 0;
    }
}

function extractConstant(expr) {
    try {
        const withoutX = expr.replace(/(-?\d*\.?\d*)\*?x/g, '').replace(/[+-]/g, ' $&');
        const matches = withoutX.match(/-?\d+\.?\d*/g);
        if (matches) {
            return matches.reduce((sum, val) => sum + parseFloat(val), 0);
        }
        return 0;
    } catch (e) {
        return 0;
    }
}

function extractQuadraticCoefficients(expr) {
    let s = expr.replace(/\s/g, '');
    const terms = s.match(/[+-]?[^+-]+/g) || [];
    let a = 0, b = 0, c = 0;
    for (let term of terms) {
        let sign = 1;
        if (term.startsWith('-')) { sign = -1; term = term.slice(1); }
        else if (term.startsWith('+')) { term = term.slice(1); }
        if (/x\^2/.test(term)) {
            const coefStr = term.replace(/\*?x\^2/, '');
            a += sign * (coefStr === '' ? 1 : parseFloat(coefStr));
        } else if (/x(?!\^)/.test(term)) {
            const coefStr = term.replace(/\*?x/, '');
            b += sign * (coefStr === '' ? 1 : parseFloat(coefStr));
        } else {
            c += sign * parseFloat(term);
        }
    }
    return { a, b, c };
}

function extractParenContent(str, startIdx) {
    let depth = 0, i = startIdx;
    do {
        if (str[i] === '(') depth++;
        else if (str[i] === ')') depth--;
        i++;
    } while (depth > 0 && i < str.length);
    return str.slice(startIdx + 1, i - 1);
}

function createStepsPanel() {
    const panel = document.createElement('div');
    panel.id = 'gen-steps';
    panel.className = 'steps';
    panel.style.cssText = 'margin-top:12px;padding:12px;background:var(--surface2);border-radius:8px;font-size:11px;line-height:1.6';
    const container = document.querySelector('#mode-general .panel-body');
    if (container) {
        container.appendChild(panel);
    }
    return panel;
}

function renderDB(mode) {
    let items = DB[mode] || [];
    let el = document.getElementById('db-items');
    if (!items.length) { el.innerHTML = '<div style="font-size:11px;color:var(--text3)">Sin datos</div>'; return; }
    el.innerHTML = items.map(i => `<div class="db-item"><div class="db-name">${i.name}</div><div class="db-val">${i.val}</div></div>`).join('');
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
        { name: 'Volumen esfera', formula: 'V = (4/3)·π·r³' },
        { name: 'Volumen cilindro', formula: 'V = π·r²·h' }
    ]},
    { cat: 'Trigonometría', items: [
        { name: 'Seno', formula: 'sen(θ) = CO / H' },
        { name: 'Coseno', formula: 'cos(θ) = CA / H' },
        { name: 'Tangente', formula: 'tan(θ) = CO / CA' },
        { name: 'Ley senos', formula: 'a/sen(A) = b/sen(B) = c/sen(C)' }
    ]},
    { cat: 'Física', items: [
        { name: 'Velocidad', formula: 'v = d / t' },
        { name: '2da Ley Newton', formula: 'F = m·a' },
        { name: 'Energía cinética', formula: 'Ec = (1/2)·m·v²' },
        { name: 'Energía potencial', formula: 'Ep = m·g·h' },
        { name: 'Ley de Ohm', formula: 'V = I·R' },
        { name: 'Potencia', formula: 'P = V·I' }
    ]},
    { cat: 'Constantes', items: [
        { name: 'π (pi)', formula: '3.1415926535...' },
        { name: 'e (Euler)', formula: '2.7182818284...' },
        { name: 'Velocidad luz (c)', formula: '3×10⁸ m/s' },
        { name: 'Gravedad (g)', formula: '9.807 m/s²' },
        { name: 'Constante Planck', formula: '6.626×10⁻³⁴ J·s' }
    ]}
];

function renderGeneralDB() {
    const el = document.getElementById('gen-db-content');
    if (!el) return;
    el.innerHTML = GENERAL_FORMULAS.map(g => `
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
}

function genKey(k) { 
    if (genResult === 'Error') genResult = ''; 
    
    // Prevención de doble punto decimal en el mismo número
    if (k === '.') {
        const lastNumberMatch = genExpr.match(/(\d+\.?\d*)$/);
        if (lastNumberMatch && lastNumberMatch[0].includes('.')) {
            return;
        }
        if (!lastNumberMatch) k = '0.'; 
    }

    genExpr += k; 
    document.getElementById('gen-expr').textContent = genExpr; 
}

function genClear() { genExpr = ''; genResult = '0'; genLastResult = null; document.getElementById('gen-expr').textContent = ''; document.getElementById('gen-result').textContent = '0'; const cv = document.getElementById('chart-canvas-general'); if (cv) cv.style.display = 'none'; document.getElementById('graph-controls').style.display = 'none'; const pdfBtn = document.getElementById('gen-pdf-btn'); if (pdfBtn) pdfBtn.style.display = 'none'; }
function genBack() { genExpr = genExpr.slice(0, -1); document.getElementById('gen-expr').textContent = genExpr; }
function genNegate() { genKey('-'); }
// Evaluador matemático seguro (sin eval/Function)
function safeMathEval(expr, vars) {
    // Si es una expresión simple con variable x o y, evaluar directamente
    if (vars) {
        let prepared = expr;
        if (vars.x !== undefined && expr.includes('x')) {
            prepared = prepared.replace(/(\d|\))x/g, '$1*x').replace(/x(\d)/g, 'x*$1');
            prepared = prepared.replace(/x/g, vars.x);
        }
        if (vars.y !== undefined && expr.includes('y')) {
            prepared = prepared.replace(/(\d|\))y/g, '$1*y').replace(/y(\d)/g, 'y*$1');
            prepared = prepared.replace(/y/g, vars.y);
        }
        if (prepared !== expr && !(angleMode === 'deg' && /(sin|cos|tan)\(/.test(expr))) {
            try {
                const result = eval(prepared);
                return result;
            } catch(e) {
            }
        }
    }
    
    // Tokenizador
    const tokens = [];
    let i = 0;
    const len = expr.length;
    
    while (i < len) {
        const char = expr[i];
        
        // Espacios
        if (/\s/.test(char)) { i++; continue; }
        
        // Números (incluye notación científica)
        if (/\d/.test(char) || (char === '.' && i + 1 < len && /\d/.test(expr[i+1]))) {
            let num = '';
            while (i < len && /[\d.]/.test(expr[i])) { num += expr[i]; i++; }
            if (i < len && (expr[i] === 'e' || expr[i] === 'E')) {
                const eIdx = i;
                num += expr[i]; i++;
                if (i < len && (expr[i] === '+' || expr[i] === '-')) { num += expr[i]; i++; }
                const digitStart = i;
                while (i < len && /\d/.test(expr[i])) { num += expr[i]; i++; }
                if (i === digitStart) {
                    // No dígitos después de e — no es notación científica, retroceder
                    i = eIdx;
                }
            }
            tokens.push({ type: 'number', value: parseFloat(num) });
            continue;
        }
        
        // Operadores y paréntesis
        if ('+-*/()^'.includes(char)) {
            tokens.push({ type: 'operator', value: char });
            i++;
            continue;
        }
        
        // Postfijo factorial
        if (char === '!') {
            tokens.push({ type: 'postfix', value: '!' });
            i++;
            continue;
        }
        
        // Funciones y constantes
        if (/[a-zA-Z\u03B1-\u03C9]/.test(char)) {
            let name = '';
            while (i < len && /[a-zA-Z0-9\u03B1-\u03C9]/.test(expr[i])) { name += expr[i]; i++; }
            tokens.push({ type: 'ident', value: name });
            continue;
        }
        
        throw new Error('Caracter inválido: ' + char);
    }
    
    // Parser: Shunting-yard algorithm a RPN
    const output = [];
    const stack = [];
    const precedence = { '+': 1, '-': 1, '*': 2, '/': 2, '^': 3 };
    const rightAssoc = { '^': true };
    const funcs = ['sin', 'cos', 'tan', 'sqrt', 'log', 'ln'];
    const consts = { 'pi': Math.PI, 'e': Math.E };
    
    for (const token of tokens) {
        if (token.type === 'number') { output.push(token.value); continue; }
        if (token.type === 'ident') {
            const val = consts[token.value.toLowerCase()];
            if (val !== undefined) { output.push(val); continue; }
            if (vars && vars[token.value] !== undefined) { output.push(vars[token.value]); continue; }
            if (funcs.includes(token.value.toLowerCase())) { stack.push(token.value.toLowerCase()); continue; }
            throw new Error('Identificador inválido: ' + token.value);
        }
        if (token.type === 'postfix') {
            output.push('!');
            continue;
        }
        if (token.type === 'operator') {
            if (token.value === '(') {
                stack.push('(');
                continue;
            }
            if (token.value === ')') {
                while (stack.length > 0 && stack[stack.length - 1] !== '(') {
                    output.push(stack.pop());
                }
                if (stack.length === 0) throw new Error('Paréntesis desbalanceados');
                stack.pop(); // Sacar el '('
                if (stack.length > 0 && funcs.includes(stack[stack.length - 1])) {
                    output.push(stack.pop());
                }
                continue;
            }
            while (stack.length > 0) {
                const top = stack[stack.length - 1];
                if (top === '(' || funcs.includes(top)) break;
                const topPrec = precedence[top] || 0;
                const currPrec = precedence[token.value];
                if (rightAssoc[token.value] ? currPrec < topPrec : currPrec <= topPrec) {
                    output.push(stack.pop());
                } else break;
            }
            stack.push(token.value);
            continue;
        }
    }
    
    while (stack.length > 0) {
        if (stack[stack.length - 1] === '(') throw new Error('Paréntesis desbalanceados');
        output.push(stack.pop());
    }
    
    // Evaluador RPN
    const evalStack = [];
    for (const token of output) {
        if (typeof token === 'number') { evalStack.push(token); continue; }
        if (funcs.includes(token)) {
            if (evalStack.length < 1) throw new Error('Faltan argumentos');
            const a = evalStack.pop();
            let res;
            switch(token) {
                case 'sin': res = Math.sin(angleMode === 'deg' ? a * Math.PI / 180 : a); break;
                case 'cos': res = Math.cos(angleMode === 'deg' ? a * Math.PI / 180 : a); break;
                case 'tan': res = Math.tan(angleMode === 'deg' ? a * Math.PI / 180 : a); break;
                case 'sqrt': res = Math.sqrt(a); break;
                case 'log': res = Math.log10(a); break;
                case 'ln': res = Math.log(a); break;
            }
            evalStack.push(res);
            continue;
        }
        if (token === '!') {
            if (evalStack.length < 1) throw new Error('Faltan operandos');
            const a = evalStack.pop();
            if (a < 0 || a > 170 || !Number.isInteger(a)) throw new Error('Factorial requiere entero >= 0 y <= 170');
            let res = 1;
            for (let j = 2; j <= a; j++) res *= j;
            evalStack.push(res);
            continue;
        }
        if ('+-*/^'.includes(token)) {
            if (evalStack.length < 2) throw new Error('Faltan operandos');
            const b = evalStack.pop();
            const a = evalStack.pop();
            let res;
            switch(token) {
                case '+': res = a + b; break;
                case '-': res = a - b; break;
                case '*': res = a * b; break;
                case '/': if (b === 0) throw new Error('División por cero'); res = a / b; break;
                case '^': res = Math.pow(a, b); break;
            }
            evalStack.push(res);
        }
    }
    
    if (evalStack.length !== 1) throw new Error('Expresión inválida');
    return evalStack[0];
}

function genPlotFunc(expr) {
    const canvas = document.getElementById('chart-canvas-general');
    if (!canvas) {
        return;
    }
    const ctx = canvas.getContext('2d');
    const containerWidth = canvas.parentElement.clientWidth - 28; // padding
    const w = containerWidth;
    const h = 250;
    const margin = 40;
    const plotW = w - margin * 2;
    const plotH = h - margin * 2;
    let minX = plotMinX, maxX = plotMaxX;
    let minY = plotMinY, maxY = plotMaxY;
    
    // Calcular puntos de la función
    const points = [];
    const steps = 400;
    for (let i = 0; i <= steps; i++) {
        const x = minX + (maxX - minX) * i / steps;
        try {
            const y = safeMathEval(expr, { x });
            if (isFinite(y)) points.push({ x, y });
            else points.push({ x, y: null });
        } catch(e) { points.push({ x, y: null }); }
    }
    
    // Ajustar rango Y basado en los puntos
    let allY = points.filter(p => p.y !== null).map(p => p.y);
    if (allY.length > 0) {
        minY = Math.min(...allY);
        maxY = Math.max(...allY);
        const range = maxY - minY || 1;
        minY -= range * 0.1;
        maxY += range * 0.1;
    }
    
    canvas.style.display = 'block';
    canvas.width = w * (window.devicePixelRatio || 1);
    canvas.height = h * (window.devicePixelRatio || 1);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    ctx.clearRect(0, 0, w, h);
    
    // Funciones de conversión
    const toCanvasX = (x) => margin + (x - minX) / (maxX - minX) * plotW;
    const toCanvasY = (y) => margin + (maxY - y) / (maxY - minY) * plotH;
    
    // Dibujar fondo
    ctx.fillStyle = 'rgba(30, 32, 40, 0.8)';
    ctx.fillRect(0, 0, w, h);
    
    // Calcular paso para la grilla (1, 2, 5, 10, etc.)
    const xRange = maxX - minX;
    const yRange = maxY - minY;
    const xStep = Math.pow(10, Math.floor(Math.log10(xRange / 5)));
    const yStep = Math.pow(10, Math.floor(Math.log10(yRange / 5)));
    
    // Dibujar grilla menor
    ctx.strokeStyle = 'rgba(74, 85, 112, 0.3)';
    ctx.lineWidth = 0.5;
    for (let x = Math.ceil(minX / xStep) * xStep; x <= maxX; x += xStep / 2) {
        const cx = toCanvasX(x);
        ctx.beginPath(); ctx.moveTo(cx, margin); ctx.lineTo(cx, margin + plotH); ctx.stroke();
    }
    for (let y = Math.ceil(minY / yStep) * yStep; y <= maxY; y += yStep / 2) {
        const cy = toCanvasY(y);
        ctx.beginPath(); ctx.moveTo(margin, cy); ctx.lineTo(margin + plotW, cy); ctx.stroke();
    }
    
    // Dibujar grilla principal
    ctx.strokeStyle = 'rgba(74, 85, 112, 0.6)';
    ctx.lineWidth = 1;
    for (let x = Math.ceil(minX / xStep) * xStep; x <= maxX; x += xStep) {
        const cx = toCanvasX(x);
        ctx.beginPath(); ctx.moveTo(cx, margin); ctx.lineTo(cx, margin + plotH); ctx.stroke();
    }
    for (let y = Math.ceil(minY / yStep) * yStep; y <= maxY; y += yStep) {
        const cy = toCanvasY(y);
        ctx.beginPath(); ctx.moveTo(margin, cy); ctx.lineTo(margin + plotW, cy); ctx.stroke();
    }
    
    // Dibujar ejes principales
    ctx.strokeStyle = '#8a97b0';
    ctx.lineWidth = 2;
    // Eje X (en y=0)
    if (minY <= 0 && maxY >= 0) {
        const cy = toCanvasY(0);
        ctx.beginPath(); ctx.moveTo(margin, cy); ctx.lineTo(margin + plotW, cy); ctx.stroke();
    }
    // Eje Y (en x=0)
    if (minX <= 0 && maxX >= 0) {
        const cx = toCanvasX(0);
        ctx.beginPath(); ctx.moveTo(cx, margin); ctx.lineTo(cx, margin + plotH); ctx.stroke();
    }
    
    // Dibujar números en los ejes
    ctx.fillStyle = '#8a97b0';
    ctx.font = '10px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let x = Math.ceil(minX / xStep) * xStep; x <= maxX; x += xStep) {
        if (Math.abs(x) < 0.001) continue; // Saltar el origen
        const cx = toCanvasX(x);
        const cy = minY <= 0 && maxY >= 0 ? toCanvasY(0) : margin + plotH;
        ctx.fillText(parseFloat(x.toPrecision(3)).toString(), cx, cy + 5);
    }
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let y = Math.ceil(minY / yStep) * yStep; y <= maxY; y += yStep) {
        if (Math.abs(y) < 0.001) continue; // Saltar el origen
        const cy = toCanvasY(y);
        const cx = minX <= 0 && maxX >= 0 ? toCanvasX(0) : margin;
        ctx.fillText(parseFloat(y.toPrecision(3)).toString(), cx - 5, cy);
    }
    
    // Dibujar origen
    if (minX <= 0 && maxX >= 0 && minY <= 0 && maxY >= 0) {
        ctx.fillText('0', toCanvasX(0) - 5, toCanvasY(0) + 5);
    }
    
    // Dibujar etiquetas de ejes
    ctx.fillStyle = '#4f9cf9';
    ctx.font = 'bold 12px JetBrains Mono';
    ctx.textAlign = 'right';
    ctx.fillText('x', w - margin, toCanvasY(0) - 10);
    ctx.textAlign = 'left';
    ctx.fillText('y', toCanvasX(0) + 10, margin + 10);
    
    // Dibujar la función
    ctx.strokeStyle = '#4f9cf9';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#4f9cf9';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    let started = false;
    for (const p of points) {
        if (p.y === null) { started = false; continue; }
        const cx = toCanvasX(p.x), cy = toCanvasY(p.y);
        if (!started) { ctx.moveTo(cx, cy); started = true; }
        else ctx.lineTo(cx, cy);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // Setup event listeners for zoom and pan
    currentPlotExpr = expr;
    currentPlotType = 'function';
    setupCanvasInteractivity(canvas, expr);
    
    // Mostrar controles
    document.getElementById('graph-controls').style.display = 'flex';
}

function setupCanvasInteractivity(canvas, expr) {
    // Remove existing listeners to avoid duplicates
    canvas.onwheel = null;
    canvas.onmousedown = null;
    canvas.onmousemove = null;
    canvas.onmouseup = null;
    canvas.onmouseleave = null;
    
    // Zoom with mouse wheel
    canvas.onwheel = (e) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        const margin = 40;
        const plotW = w - margin * 2;
        const plotH = h - margin * 2;
        
        // Convert mouse position to graph coordinates
        const graphX = plotMinX + (mouseX - margin) / plotW * (plotMaxX - plotMinX);
        const graphY = plotMaxY - (mouseY - margin) / plotH * (plotMaxY - plotMinY);
        
        // Zoom factor
        const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
        
        // Calculate new ranges keeping mouse point fixed
        const newRangeX = (plotMaxX - plotMinX) * zoomFactor;
        const newRangeY = (plotMaxY - plotMinY) * zoomFactor;
        
        plotMinX = graphX - (graphX - plotMinX) * zoomFactor;
        plotMaxX = plotMinX + newRangeX;
        plotMinY = graphY - (graphY - plotMinY) * zoomFactor;
        plotMaxY = plotMinY + newRangeY;
        
        // Redibujar según el tipo de gráfico actual
        if (currentPlotType === 'equation') {
            genPlotEquation(currentPlotExpr);
        } else if (currentPlotType === 'system') {
            const eqs = currentPlotExpr.split(',').map(s => s.trim());
            if (eqs.length === 2) genPlotSystem2x2(eqs[0], eqs[1]);
        } else {
            genPlotFunc(currentPlotExpr);
        }
    };
    
    // Pan with mouse drag
    canvas.onmousedown = (e) => {
        plotDragging = true;
        plotLastX = e.clientX;
        plotLastY = e.clientY;
        canvas.style.cursor = 'grabbing';
    };
    
    canvas.onmousemove = (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        const margin = 40;
        const plotW = w - margin * 2;
        const plotH = h - margin * 2;
        
        // Update coordinates display
        if (mouseX >= margin && mouseX <= w - margin && mouseY >= margin && mouseY <= h - margin) {
            const graphX = plotMinX + (mouseX - margin) / plotW * (plotMaxX - plotMinX);
            const graphY = plotMaxY - (mouseY - margin) / plotH * (plotMaxY - plotMinY);
            document.getElementById('graph-coords').textContent = 
                `x: ${graphX.toFixed(2)}, y: ${graphY.toFixed(2)}`;
        }
        
        if (!plotDragging) return;
        
        const dx = e.clientX - plotLastX;
        const dy = e.clientY - plotLastY;
        
        // Convert pixel movement to graph coordinates
        const graphDx = -dx / plotW * (plotMaxX - plotMinX);
        const graphDy = dy / plotH * (plotMaxY - plotMinY);
        
        plotMinX += graphDx;
        plotMaxX += graphDx;
        plotMinY += graphDy;
        plotMaxY += graphDy;
        
        plotLastX = e.clientX;
        plotLastY = e.clientY;
        
        // Redibujar según el tipo de gráfico actual
        if (currentPlotType === 'equation') {
            genPlotEquation(currentPlotExpr);
        } else if (currentPlotType === 'system') {
            const eqs = currentPlotExpr.split(',').map(s => s.trim());
            if (eqs.length === 2) genPlotSystem2x2(eqs[0], eqs[1]);
        } else {
            genPlotFunc(currentPlotExpr);
        }
    };
    
    canvas.onmouseup = () => {
        plotDragging = false;
        canvas.style.cursor = 'default';
    };
    
    canvas.onmouseleave = () => {
        plotDragging = false;
        canvas.style.cursor = 'default';
    };
    
    // Touch support for mobile
    canvas.ontouchstart = (e) => {
        if (e.touches.length === 1) {
            plotDragging = true;
            plotLastX = e.touches[0].clientX;
            plotLastY = e.touches[0].clientY;
        }
    };
    
    canvas.ontouchmove = (e) => {
        if (!plotDragging || e.touches.length !== 1) return;
        e.preventDefault();
        
        const dx = e.touches[0].clientX - plotLastX;
        const dy = e.touches[0].clientY - plotLastY;
        
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        const margin = 40;
        const plotW = w - margin * 2;
        const plotH = h - margin * 2;
        
        const graphDx = -dx / plotW * (plotMaxX - plotMinX);
        const graphDy = dy / plotH * (plotMaxY - plotMinY);
        
        plotMinX += graphDx;
        plotMaxX += graphDx;
        plotMinY += graphDy;
        plotMaxY += graphDy;
        
        plotLastX = e.touches[0].clientX;
        plotLastY = e.touches[0].clientY;
        
        // Redibujar según el tipo de gráfico actual
        if (currentPlotType === 'equation') {
            genPlotEquation(currentPlotExpr);
        } else {
            genPlotFunc(currentPlotExpr);
        }
    };
    
    canvas.ontouchend = () => {
        plotDragging = false;
    };
    
    // Pinch zoom for mobile
    let lastPinchDist = 0;
    canvas.ontouchstart = (e) => {
        if (e.touches.length === 2) {
            lastPinchDist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
        }
    };
    
    canvas.ontouchmove = (e) => {
        if (e.touches.length !== 2) return;
        e.preventDefault();
        
        const dist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );
        
        if (lastPinchDist > 0) {
            const zoomFactor = lastPinchDist / dist;
            const centerX = (plotMinX + plotMaxX) / 2;
            const centerY = (plotMinY + plotMaxY) / 2;
            
            const newRangeX = (plotMaxX - plotMinX) * zoomFactor;
            const newRangeY = (plotMaxY - plotMinY) * zoomFactor;
            
            plotMinX = centerX - newRangeX / 2;
            plotMaxX = centerX + newRangeX / 2;
            plotMinY = centerY - newRangeY / 2;
            plotMaxY = centerY + newRangeY / 2;
            
        // Redibujar según el tipo de gráfico actual
        if (currentPlotType === 'equation') {
            genPlotEquation(currentPlotExpr);
        } else if (currentPlotType === 'system') {
            const eqs = currentPlotExpr.split(',').map(s => s.trim());
            if (eqs.length === 2) genPlotSystem2x2(eqs[0], eqs[1]);
        } else {
            genPlotFunc(currentPlotExpr);
        }
        }
        
        lastPinchDist = dist;
    };
}

// ── Sistema de ecuaciones 2×2 ──

function parseLinearEq(eq) {
    let s = eq.replace(/\s/g, '');
    const parts = s.split('=');
    if (parts.length !== 2) return null;
    const left = parts[0], right = parts[1];
    const terms = left.match(/[+-]?[^+-]+/g) || [];
    let a = 0, b = 0;
    for (let t of terms) {
        let sign = 1;
        if (t.startsWith('-')) { sign = -1; t = t.slice(1); }
        else if (t.startsWith('+')) { t = t.slice(1); }
        if (/y/.test(t)) {
            const coefStr = t.replace(/\*?y/, '');
            b += sign * (coefStr === '' ? 1 : parseFloat(coefStr));
        } else if (/x/.test(t)) {
            const coefStr = t.replace(/\*?x/, '');
            a += sign * (coefStr === '' ? 1 : parseFloat(coefStr));
        } else {
            const c = parseFloat(t);
            if (!isNaN(c)) {
                // Es constante del lado izquierdo, pasa al derecho
                // En ax + by = c, las constantes están implícitas
            }
        }
    }
    const c = parseFloat(right) || 0;
    // Ajustar por constantes en el lado izquierdo
    const leftConst = terms.reduce((sum, t) => {
        let st = t;
        let sign = 1;
        if (st.startsWith('-')) { sign = -1; st = st.slice(1); }
        else if (st.startsWith('+')) { st = st.slice(1); }
        if (!/x/.test(st) && !/y/.test(st)) return sum + sign * (parseFloat(st) || 0);
        return sum;
    }, 0);
    return { a, b, c: c - leftConst };
}

function solveSystem2x2(eq1, eq2) {
    const steps = [];
    steps.push(`<strong>Sistema de ecuaciones:</strong>`);
    steps.push(`┌ ① ${eq1}`);
    steps.push(`└ ② ${eq2}`);
    
    const p1 = parseLinearEq(eq1);
    const p2 = parseLinearEq(eq2);
    if (!p1 || !p2) {
        steps.push(`⚠ No se pudieron interpretar las ecuaciones. Usá formato: 2x+y=5, x-y=1`);
        return steps;
    }
    
    const f = (n) => n < 0 ? `(${n})` : `${n}`;
    const t = (n) => parseFloat(n.toFixed(4)).toString();
    
    steps.push(`<strong>Paso 1:</strong> Identificar coeficientes (Regla de Cramer)`);
    steps.push(`① ${t(p1.a)}x + ${t(p1.b)}y = ${t(p1.c)}`);
    steps.push(`② ${t(p2.a)}x + ${t(p2.b)}y = ${t(p2.c)}`);
    
    const det = p1.a * p2.b - p2.a * p1.b;
    if (Math.abs(det) < 1e-12) {
        steps.push(`⚠ El sistema no tiene solución única (determinante = 0).`);
        return steps;
    }
    
    steps.push(`<strong>Paso 2:</strong> Calcular determinante Δ`);
    steps.push(`Δ = a₁·b₂ - a₂·b₁`);
    steps.push(`Δ = ${t(p1.a)}·${f(p2.b)} - ${t(p2.a)}·${f(p1.b)}`);
    
    const detStep1 = p1.a * p2.b;
    const detStep2 = p2.a * p1.b;
    steps.push(`Δ = ${t(detStep1)} - ${f(detStep2)}`);
    steps.push(`Δ = ${t(detStep1 - detStep2)}`);
    steps.push(`<strong>Δ = ${t(det)}</strong>`);
    
    // x = (c1*b2 - c2*b1) / det
    const xNum1 = p1.c * p2.b;
    const xNum2 = p2.c * p1.b;
    const xNum = xNum1 - xNum2;
    const xVal = xNum / det;
    
    steps.push(`<strong>Paso 3:</strong> Calcular x`);
    steps.push(`x = (c₁·b₂ - c₂·b₁) / Δ`);
    steps.push(`x = (${t(p1.c)}·${f(p2.b)} - ${t(p2.c)}·${f(p1.b)}) / ${t(det)}`);
    steps.push(`x = (${t(xNum1)} - ${f(xNum2)}) / ${t(det)}`);
    steps.push(`x = ${t(xNum1 - xNum2)} / ${t(det)}`);
    steps.push(`<strong>x = ${t(xVal)}</strong>`);
    
    // y = (a1*c2 - a2*c1) / det
    const yNum1 = p1.a * p2.c;
    const yNum2 = p2.a * p1.c;
    const yNum = yNum1 - yNum2;
    const yVal = yNum / det;
    
    steps.push(`<strong>Paso 4:</strong> Calcular y`);
    steps.push(`y = (a₁·c₂ - a₂·c₁) / Δ`);
    steps.push(`y = (${t(p1.a)}·${f(p2.c)} - ${t(p2.a)}·${f(p1.c)}) / ${t(det)}`);
    steps.push(`y = (${t(yNum1)} - ${f(yNum2)}) / ${t(det)}`);
    steps.push(`y = ${t(yNum1 - yNum2)} / ${t(det)}`);
    steps.push(`<strong>y = ${t(yVal)}</strong>`);
    
    steps.push(`<strong>Paso 5:</strong> Verificar solución`);
    const check1 = p1.a * xVal + p1.b * yVal;
    const check2 = p2.a * xVal + p2.b * yVal;
    const ok1 = Math.abs(check1 - p1.c) < 1e-6;
    const ok2 = Math.abs(check2 - p2.c) < 1e-6;
    steps.push(`① ${t(p1.a)}·${f(xVal)} + ${t(p1.b)}·${f(yVal)} = ${t(check1)} ${ok1 ? '✔️' : '❌'} (esperado ${t(p1.c)})`);
    steps.push(`② ${t(p2.a)}·${f(xVal)} + ${t(p2.b)}·${f(yVal)} = ${t(check2)} ${ok2 ? '✔️' : '❌'} (esperado ${t(p2.c)})`);
    
    steps.push(`<div style="padding:8px 10px;margin-top:6px;background:linear-gradient(135deg,rgba(79,252,124,0.12),rgba(79,156,249,0.12));border-left:3px solid var(--accent2);border-radius:0 6px 6px 0;font-size:14px;font-weight:700;color:var(--accent2)">`);
    steps.push(`Solución &rarr; x = ${t(xVal)} &nbsp; y = ${t(yVal)}`);
    steps.push(`</div>`);
    
    genResult = `x=${t(xVal)}, y=${t(yVal)}`;
    return steps;
}

function genPlotSystem2x2(eq1, eq2) {
    const p1 = parseLinearEq(eq1);
    const p2 = parseLinearEq(eq2);
    if (!p1 || !p2) return;
    
    const canvas = document.getElementById('chart-canvas-general');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.parentElement.clientWidth - 28;
    const h = 250;
    const margin = 40;
    const plotW = w - margin * 2;
    const plotH = h - margin * 2;
    
    // Compute points: y = (c - a*x) / b for each equation
    const points1 = [], points2 = [];
    const steps = 400;
    for (let i = 0; i <= steps; i++) {
        const x = plotMinX + (plotMaxX - plotMinX) * i / steps;
        const y1 = p1.b !== 0 ? (p1.c - p1.a * x) / p1.b : NaN;
        const y2 = p2.b !== 0 ? (p2.c - p2.a * x) / p2.b : NaN;
        if (isFinite(y1)) points1.push({ x, y: y1 });
        if (isFinite(y2)) points2.push({ x, y: y2 });
    }
    
    const allY = [...points1, ...points2].filter(p => isFinite(p.y)).map(p => p.y);
    if (allY.length === 0) return;
    let minY = Math.min(...allY), maxY = Math.max(...allY);
    const range = maxY - minY || 1;
    minY -= range * 0.1; maxY += range * 0.1;
    plotMinY = minY; plotMaxY = maxY;
    
    canvas.style.display = 'block';
    canvas.width = w * (window.devicePixelRatio || 1);
    canvas.height = h * (window.devicePixelRatio || 1);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    ctx.clearRect(0, 0, w, h);
    
    const toX = (x) => margin + (x - plotMinX) / (plotMaxX - plotMinX) * plotW;
    const toY = (y) => margin + (plotMaxY - y) / (plotMaxY - plotMinY) * plotH;
    
    ctx.fillStyle = 'rgba(30, 32, 40, 0.8)';
    ctx.fillRect(0, 0, w, h);
    
    // Calcular paso para la grilla
    const xRange = plotMaxX - plotMinX;
    const yRange = plotMaxY - plotMinY;
    const xStep = Math.pow(10, Math.floor(Math.log10(xRange / 5)));
    const yStep = Math.pow(10, Math.floor(Math.log10(yRange / 5)));
    
    // Grilla menor
    ctx.strokeStyle = 'rgba(74, 85, 112, 0.3)';
    ctx.lineWidth = 0.5;
    for (let x = Math.ceil(plotMinX / xStep) * xStep; x <= plotMaxX; x += xStep / 2) {
        const cx = toX(x);
        ctx.beginPath(); ctx.moveTo(cx, margin); ctx.lineTo(cx, margin + plotH); ctx.stroke();
    }
    for (let y = Math.ceil(plotMinY / yStep) * yStep; y <= plotMaxY; y += yStep / 2) {
        const cy = toY(y);
        ctx.beginPath(); ctx.moveTo(margin, cy); ctx.lineTo(margin + plotW, cy); ctx.stroke();
    }
    
    // Grilla principal
    ctx.strokeStyle = 'rgba(74, 85, 112, 0.6)';
    ctx.lineWidth = 1;
    for (let x = Math.ceil(plotMinX / xStep) * xStep; x <= plotMaxX; x += xStep) {
        const cx = toX(x);
        ctx.beginPath(); ctx.moveTo(cx, margin); ctx.lineTo(cx, margin + plotH); ctx.stroke();
    }
    for (let y = Math.ceil(plotMinY / yStep) * yStep; y <= plotMaxY; y += yStep) {
        const cy = toY(y);
        ctx.beginPath(); ctx.moveTo(margin, cy); ctx.lineTo(margin + plotW, cy); ctx.stroke();
    }
    
    // Ejes principales
    ctx.strokeStyle = '#8a97b0';
    ctx.lineWidth = 2;
    if (plotMinY <= 0 && plotMaxY >= 0) {
        const cy = toY(0);
        ctx.beginPath(); ctx.moveTo(margin, cy); ctx.lineTo(margin + plotW, cy); ctx.stroke();
    }
    if (plotMinX <= 0 && plotMaxX >= 0) {
        const cx = toX(0);
        ctx.beginPath(); ctx.moveTo(cx, margin); ctx.lineTo(cx, margin + plotH); ctx.stroke();
    }
    
    // Números en los ejes
    ctx.fillStyle = '#8a97b0';
    ctx.font = '10px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let x = Math.ceil(plotMinX / xStep) * xStep; x <= plotMaxX; x += xStep) {
        if (Math.abs(x) < 0.001) continue;
        ctx.fillText(parseFloat(x.toPrecision(3)).toString(), toX(x), (plotMinY <= 0 && plotMaxY >= 0 ? toY(0) : margin + plotH) + 5);
    }
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let y = Math.ceil(plotMinY / yStep) * yStep; y <= plotMaxY; y += yStep) {
        if (Math.abs(y) < 0.001) continue;
        ctx.fillText(parseFloat(y.toPrecision(3)).toString(), (plotMinX <= 0 && plotMaxX >= 0 ? toX(0) : margin) - 5, toY(y));
    }
    if (plotMinX <= 0 && plotMaxX >= 0 && plotMinY <= 0 && plotMaxY >= 0) {
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText('0', toX(0) - 5, toY(0) + 5);
    }
    
    // Etiquetas de ejes
    ctx.fillStyle = '#4f9cf9';
    ctx.font = 'bold 12px JetBrains Mono';
    ctx.textAlign = 'right';
    ctx.fillText('x', margin + plotW, (plotMinY <= 0 && plotMaxY >= 0 ? toY(0) : margin + plotH) - 10);
    ctx.textAlign = 'left';
    ctx.fillText('y', (plotMinX <= 0 && plotMaxX >= 0 ? toX(0) : margin) + 10, margin + 10);
    
    // Plot line 1
    if (points1.length > 1) {
        ctx.strokeStyle = '#4f9cf9';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        let started = false;
        for (const p of points1) {
            if (!started) { ctx.moveTo(toX(p.x), toY(p.y)); started = true; }
            else ctx.lineTo(toX(p.x), toY(p.y));
        }
        ctx.stroke();
        ctx.fillStyle = '#4f9cf9';
        ctx.font = '11px monospace';
        ctx.fillText('①', toX(0) + 30, toY(1)+2);
    }
    
    // Plot line 2
    if (points2.length > 1) {
        ctx.strokeStyle = '#f9c74f';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        let started = false;
        for (const p of points2) {
            if (!started) { ctx.moveTo(toX(p.x), toY(p.y)); started = true; }
            else ctx.lineTo(toX(p.x), toY(p.y));
        }
        ctx.stroke();
        ctx.fillStyle = '#f9c74f';
        ctx.font = '11px monospace';
        ctx.fillText('②', toX(0) + 30, toY(-1)+18);
    }
    
    // Mark intersection
    const det = p1.a * p2.b - p2.a * p1.b;
    if (Math.abs(det) >= 1e-12) {
        const xS = (p1.c * p2.b - p2.c * p1.b) / det;
        const yS = (p1.a * p2.c - p2.a * p1.c) / det;
        const cx = toX(xS), cy = toY(yS);
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(79, 252, 124, 0.5)';
        ctx.fill();
        ctx.strokeStyle = '#4ffc7c';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#4ffc7c';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(`(${xS.toFixed(2)}, ${yS.toFixed(2)})`, cx + 10, cy - 5);
    }
    
    // Setup interactivity
    currentPlotExpr = eq1 + ', ' + eq2;
    currentPlotType = 'system';
    setupCanvasInteractivity(canvas, currentPlotExpr);
    
    // Mostrar controles
    document.getElementById('graph-controls').style.display = 'flex';
}

function genPlotEquation(equation) {
    // Separar la ecuación en izquierda y derecha
    const parts = equation.split('=');
    if (parts.length !== 2) {
        return;
    }
    
    const leftExpr = parts[0].trim();
    const rightExpr = parts[1].trim();
    
    const canvas = document.getElementById('chart-canvas-general');
    if (!canvas) {
        return;
    }
    
    const ctx = canvas.getContext('2d');
    const containerWidth = canvas.parentElement.clientWidth - 28;
    const w = containerWidth;
    const h = 250;
    const margin = 40;
    const plotW = w - margin * 2;
    const plotH = h - margin * 2;
    let minX = plotMinX, maxX = plotMaxX;
    let minY = plotMinY, maxY = plotMaxY;
    
    // Calcular puntos para ambas funciones
    const leftPoints = [];
    const rightPoints = [];
    const steps = 400;
    
    for (let i = 0; i <= steps; i++) {
        const x = parseFloat((minX + (maxX - minX) * i / steps).toPrecision(10));
        try {
            const y1 = safeMathEval(leftExpr, { x });
            const y2 = safeMathEval(rightExpr, { x });
            if (isFinite(y1)) leftPoints.push({ x, y: y1 });
            else leftPoints.push({ x, y: null });
            if (isFinite(y2)) rightPoints.push({ x, y: y2 });
            else rightPoints.push({ x, y: null });
        } catch(e) {
            leftPoints.push({ x, y: null });
            rightPoints.push({ x, y: null });
        }
    }
    
    // Ajustar rango Y basado en todos los puntos
    const allY = [...leftPoints, ...rightPoints].filter(p => p.y !== null).map(p => p.y);
    if (allY.length > 0) {
        minY = Math.min(...allY);
        maxY = Math.max(...allY);
        const range = maxY - minY || 1;
        minY -= range * 0.1;
        maxY += range * 0.1;
    }
    
    canvas.style.display = 'block';
    canvas.width = w * (window.devicePixelRatio || 1);
    canvas.height = h * (window.devicePixelRatio || 1);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    ctx.clearRect(0, 0, w, h);
    
    const toCanvasX = (x) => margin + (x - minX) / (maxX - minX) * plotW;
    const toCanvasY = (y) => margin + (maxY - y) / (maxY - minY) * plotH;
    
    // Fondo
    ctx.fillStyle = 'rgba(30, 32, 40, 0.8)';
    ctx.fillRect(0, 0, w, h);
    
    // Grilla
    const xRange = maxX - minX;
    const yRange = maxY - minY;
    const xStep = Math.pow(10, Math.floor(Math.log10(xRange / 5)));
    const yStep = Math.pow(10, Math.floor(Math.log10(yRange / 5)));
    
    ctx.strokeStyle = 'rgba(74, 85, 112, 0.3)';
    ctx.lineWidth = 0.5;
    for (let x = Math.ceil(minX / xStep) * xStep; x <= maxX; x += xStep / 2) {
        const cx = toCanvasX(x);
        ctx.beginPath(); ctx.moveTo(cx, margin); ctx.lineTo(cx, margin + plotH); ctx.stroke();
    }
    for (let y = Math.ceil(minY / yStep) * yStep; y <= maxY; y += yStep / 2) {
        const cy = toCanvasY(y);
        ctx.beginPath(); ctx.moveTo(margin, cy); ctx.lineTo(margin + plotW, cy); ctx.stroke();
    }
    
    ctx.strokeStyle = 'rgba(74, 85, 112, 0.6)';
    ctx.lineWidth = 1;
    for (let x = Math.ceil(minX / xStep) * xStep; x <= maxX; x += xStep) {
        const cx = toCanvasX(x);
        ctx.beginPath(); ctx.moveTo(cx, margin); ctx.lineTo(cx, margin + plotH); ctx.stroke();
    }
    for (let y = Math.ceil(minY / yStep) * yStep; y <= maxY; y += yStep) {
        const cy = toCanvasY(y);
        ctx.beginPath(); ctx.moveTo(margin, cy); ctx.lineTo(margin + plotW, cy); ctx.stroke();
    }
    
    // Ejes
    ctx.strokeStyle = '#8a97b0';
    ctx.lineWidth = 2;
    if (minY <= 0 && maxY >= 0) {
        const cy = toCanvasY(0);
        ctx.beginPath(); ctx.moveTo(margin, cy); ctx.lineTo(margin + plotW, cy); ctx.stroke();
    }
    if (minX <= 0 && maxX >= 0) {
        const cx = toCanvasX(0);
        ctx.beginPath(); ctx.moveTo(cx, margin); ctx.lineTo(cx, margin + plotH); ctx.stroke();
    }
    
    // Números
    ctx.fillStyle = '#8a97b0';
    ctx.font = '10px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let x = Math.ceil(minX / xStep) * xStep; x <= maxX; x += xStep) {
        if (Math.abs(x) < 0.001) continue;
        const cx = toCanvasX(x);
        const cy = minY <= 0 && maxY >= 0 ? toCanvasY(0) : margin + plotH;
        ctx.fillText(parseFloat(x.toPrecision(3)).toString(), cx, cy + 5);
    }
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let y = Math.ceil(minY / yStep) * yStep; y <= maxY; y += yStep) {
        if (Math.abs(y) < 0.001) continue;
        const cy = toCanvasY(y);
        const cx = minX <= 0 && maxX >= 0 ? toCanvasX(0) : margin;
        ctx.fillText(parseFloat(y.toPrecision(3)).toString(), cx - 5, cy);
    }
    
    // Etiquetas
    ctx.fillStyle = '#4f9cf9';
    ctx.font = 'bold 12px JetBrains Mono';
    ctx.textAlign = 'right';
    ctx.fillText('x', w - margin, toCanvasY(0) - 10);
    ctx.textAlign = 'left';
    ctx.fillText('y', toCanvasX(0) + 10, margin + 10);
    
    // Graficar función izquierda (azul)
    ctx.strokeStyle = '#4f9cf9';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#4f9cf9';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    let started = false;
    for (const p of leftPoints) {
        if (p.y === null) { started = false; continue; }
        const cx = toCanvasX(p.x), cy = toCanvasY(p.y);
        if (!started) { ctx.moveTo(cx, cy); started = true; }
        else ctx.lineTo(cx, cy);
    }
    ctx.stroke();
    
    // Graficar función derecha (naranja)
    ctx.strokeStyle = '#f97b4f';
    ctx.shadowColor = '#f97b4f';
    ctx.beginPath();
    started = false;
    for (const p of rightPoints) {
        if (p.y === null) { started = false; continue; }
        const cx = toCanvasX(p.x), cy = toCanvasY(p.y);
        if (!started) { ctx.moveTo(cx, cy); started = true; }
        else ctx.lineTo(cx, cy);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // Encontrar intersección
    let intersection = null;
    for (let i = 0; i < leftPoints.length - 1; i++) {
        const p1 = leftPoints[i];
        const p2 = leftPoints[i + 1];
        const q1 = rightPoints[i];
        const q2 = rightPoints[i + 1];
        
        if (p1.y !== null && p2.y !== null && q1.y !== null && q2.y !== null) {
            // Verificar si hay cruce
            if ((p1.y - q1.y) * (p2.y - q2.y) <= 0) {
                // Interpolación lineal para encontrar el punto exacto
                const t = (q1.y - p1.y) / ((p2.y - p1.y) - (q2.y - q1.y));
                const interX = p1.x + t * (p2.x - p1.x);
                const interY = p1.y + t * (p2.y - p1.y);
                intersection = { x: interX, y: interY };
                break;
            }
        }
    }
    
    // Dibujar punto de intersección
    if (intersection) {
        const cx = toCanvasX(intersection.x);
        const cy = toCanvasY(intersection.y);
        
        // Círculo con glow
        ctx.fillStyle = '#4ff97b';
        ctx.shadowColor = '#4ff97b';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(cx, cy, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Etiqueta de coordenadas
        ctx.fillStyle = '#4ff97b';
        ctx.font = 'bold 11px JetBrains Mono';
        ctx.textAlign = 'left';
        ctx.fillText(`(${intersection.x.toFixed(2)}, ${intersection.y.toFixed(2)})`, cx + 12, cy - 5);
        
        // Agregar al resultado
        genResult = `x = ${intersection.x.toFixed(3)} | Ecuación graficada`;
        document.getElementById('gen-result').textContent = genResult;
    } else {
        // Si no hay intersección, mostrar mensaje
        genResult = 'Ecuación graficada';
        document.getElementById('gen-result').textContent = genResult;
    }
    
    // Leyenda
    ctx.fillStyle = '#4f9cf9';
    ctx.fillRect(margin, margin - 25, 15, 15);
    ctx.fillStyle = '#8a97b0';
    ctx.font = '10px JetBrains Mono';
    ctx.textAlign = 'left';
    ctx.fillText(leftExpr, margin + 20, margin - 15);
    
    ctx.fillStyle = '#f97b4f';
    ctx.fillRect(margin + 150, margin - 25, 15, 15);
    ctx.fillStyle = '#8a97b0';
    ctx.fillText(rightExpr, margin + 170, margin - 15);
    
    // Setup interactivity
    currentPlotExpr = equation;
    currentPlotType = 'equation';
    setupCanvasInteractivity(canvas, equation);
    
    // Mostrar controles
    document.getElementById('graph-controls').style.display = 'flex';
}

function resetGraphView() {
    plotMinX = -10;
    plotMaxX = 10;
    plotMinY = -10;
    plotMaxY = 10;
    
    // Re-graficar la última expresión
    const canvas = document.getElementById('chart-canvas-general');
    if (canvas.style.display !== 'none') {
        const expr = currentPlotExpr || document.getElementById('gen-expr').textContent.replace('f(x) = ', '').replace(' =', '');
        if (expr.includes(',') && expr.includes('=')) {
            const eqs = expr.split(',').map(s => s.trim());
            if (eqs.length === 2) genPlotSystem2x2(eqs[0], eqs[1]);
        } else if (expr.includes('=')) {
            genPlotEquation(expr);
        } else if (expr.includes('x')) {
            genPlotFunc(expr);
        }
    }
}

function showGenPDFBtn() {
    const btn = document.getElementById('gen-pdf-btn');
    if (btn) btn.style.display = LicenseManager.isPro ? 'block' : 'none';
}

function genEval() {
    try {
        if (!genExpr) {
            return;
        }
        let expr = genExpr.replace(/π/g, 'pi');

        // Encadenar con último resultado si empieza con operador
        if (/^[+\-*/^]/.test(expr.trim()) && genLastResult !== null && genLastResult !== 'Error') {
            expr = parseFloat(genLastResult) + expr;
        }

        // Auto-cierre de paréntesis (incluyendo los de sqrt)
        let abiertos = (expr.match(/\(/g) || []).length;
        let cerrados = (expr.match(/\)/g) || []).length;
        if (abiertos > cerrados) expr += ")".repeat(abiertos - cerrados);

        // Limpieza de operadores duplicados
        expr = expr.replace(/([+\-*/])\1+/g, '$1');

        // Porcentajes inteligentes
        expr = expr.replace(/(\d+(?:\.\d+)?)\s*([+\-])\s*(\d+(?:\.\d+)?)\s*%/g, '$1 $2 ($1 * $3 / 100)');
        expr = expr.replace(/(\d+(?:\.\d+)?)\s*%/g, '($1 / 100)');
        
        // Sistema 2×2: detectar comas entre ecuaciones
        if (expr.includes(',') && expr.includes('=') && expr.includes('x') && expr.includes('y')) {
            const eqs = expr.split(',').map(s => s.trim());
            if (eqs.length === 2 && eqs.every(e => e.includes('='))) {
                genPlotSystem2x2(eqs[0], eqs[1]);
                const steps = solveSystem2x2(eqs[0], eqs[1]);
                const sp = document.getElementById('gen-steps') || createStepsPanel();
                sp.innerHTML = '<details style="cursor:pointer"><summary style="color:var(--accent);font-weight:700;font-size:12px;padding:4px 0">Mostrar pasos</summary>' +
                    steps.map(s => `<div class="step">${s}</div>`).join('') + '</details>';
                sp.classList.add('show');
                document.getElementById('gen-expr').textContent = genExpr;
                document.getElementById('gen-result').textContent = genResult || 'Sistema resuelto';
                addHistory('general', 'system', genResult || 'Sistema resuelto', genExpr);
                showGenPDFBtn();
                genExpr = '';
                genLastResult = null;
                return;
            }
        }
        
        // Ecuación lineal con x e y (sin coma): 2x+y=5 → resolver y graficar y = f(x)
        if (expr.includes('=') && /x/.test(expr) && /y/.test(expr) && !expr.includes(',')) {
            const parts = expr.split('=');
            if (parts.length === 2) {
                const p = parseLinearEq(expr);
                if (p && p.b !== 0) {
                    // y = (c - a*x) / b
                    const yExpr = `(${p.c} - ${p.a}*x) / ${p.b}`;
                    genPlotFunc(yExpr);
                    const steps = document.getElementById('gen-steps') || createStepsPanel();
                    steps.innerHTML = '<details style="cursor:pointer"><summary style="color:var(--accent);font-weight:700;font-size:12px;padding:4px 0">Mostrar pasos</summary>' +
                        '<div class="step"><strong>Ecuación lineal:</strong> ' + expr + '</div>' +
                        '<div class="step">Despejando y:</div>' +
                        '<div class="step"><strong>y = (' + p.c + ' - ' + p.a + 'x) / ' + p.b + '</strong></div>' +
                        '<div class="step" style="color:var(--text3)">La gráfica muestra la recta correspondiente.</div></details>';
                    steps.classList.add('show');
                    genResult = `y = (${p.c} - ${p.a}x) / ${p.b}`;
                    document.getElementById('gen-result').textContent = 'y despejada';
                    document.getElementById('gen-expr').textContent = genExpr;
                    addHistory('general', 'linear2var', genResult, genExpr);
                    showGenPDFBtn();
                    genExpr = '';
                    genLastResult = null;
                    return;
                }
            }
        }
        
        // Si contiene 'x', graficar como función
        if (/x/.test(expr)) {
            
            // Detectar si es ecuación (contiene =)
            if (expr.includes('=')) {
                genPlotEquation(expr);
                generateAlgebraicSteps(expr);
                const sp = document.getElementById('gen-steps') || createStepsPanel();
                if (sp) sp.classList.add('show');
                document.getElementById('gen-expr').textContent = genExpr;
                document.getElementById('gen-result').textContent = genResult || 'Ecuación graficada';
                addHistory('general', 'eq', genResult || 'Ecuación graficada', genExpr);
                showGenPDFBtn();
                genExpr = '';
                genLastResult = null;
                return;
            }
            
            genPlotFunc(expr);
            let r = safeMathEval(expr, { x: 0 });
            if (!isFinite(r)) throw new Error('Resultado infinito');
            genResult = 'f(x) graficada';
            document.getElementById('gen-result').textContent = genResult;
            document.getElementById('gen-expr').textContent = 'f(x) = ' + genExpr;
            addHistory('general', 'func', 'f(x) graficada', 'f(x) = ' + genExpr);
            showGenPDFBtn();
            genExpr = '';
            genLastResult = null;
            return;
        }

        let r = safeMathEval(expr);
        if (!isFinite(r)) throw new Error('Resultado infinito');
        genResult = parseFloat(r.toFixed(10)).toString();
        genLastResult = genResult;
        document.getElementById('gen-result').textContent = genResult;
        document.getElementById('gen-expr').textContent = genExpr + ' =';
        addHistory('general', 'expr', genResult, genExpr);
        showGenPDFBtn();

        // Ocultar canvas de función si estaba visible
        const canvas = document.getElementById('chart-canvas-general');
        if (canvas) canvas.style.display = 'none';

        genExpr = '';
    } catch (e) { 
        document.getElementById('gen-result').textContent = 'Error'; 
        genResult = 'Error'; 
        genExpr = ''; 
    }
}

function genMemStore() { genMemory = parseFloat(document.getElementById('gen-result').textContent) || 0; }
function genMemRecall() { genKey(genMemory.toString()); }
function genMemClear() { genMemory = 0; }
function genMemAdd() { genMemory += parseFloat(document.getElementById('gen-result').textContent) || 0; }
function genMemSub() { genMemory -= parseFloat(document.getElementById('gen-result').textContent) || 0; }
function genFactorial() {
    let n = parseInt(document.getElementById('gen-result').textContent);
    if (isNaN(n) || n < 0 || n > 170) return;
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    document.getElementById('gen-result').textContent = r.toLocaleString();
    genResult = r.toString();
}

function toggleAngleMode() {
    angleMode = angleMode === 'deg' ? 'rad' : 'deg';
    const btn = document.getElementById('angle-btn');
    if (btn) btn.textContent = angleMode.toUpperCase();
}

// ── Busqueda universal y Favoritos ──

const MODE_NAMES = {
    general: 'General', electro: 'Electrónica', med: 'Medicina', fin: 'Finanzas', quim: 'Química',
    civil: 'Arquitectura y Construcción', mec: 'Mecánica', geom: 'Geometría', unit: 'Unidades', fis: 'Física',
    diseno: 'Diseño y Multimedia', nutri: 'Nutrición', acust: 'Acústica', prog: 'Programación', estad: 'Estadística',
    redes: 'Redes y Conectividad'
};
const MODE_COLORS = {
    general: '#4f9cf9', electro: '#38e8c8', med: '#f97b4f', fin: '#a78bfa', quim: '#f9c74f',
    civil: '#4ff97b', mec: '#f94f4f', geom: '#f94fa7', unit: '#4fdbf9', fis: '#f9f54f',
    diseno: '#f9a74f', nutri: '#f97ba7', acust: '#4fbfa7', prog: '#7b4ff9', estad: '#f9f94f',
    redes: '#f94f9f'
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

function toggleSearch(show) {
    const el = document.getElementById('modal-search');
    const showVal = show === undefined ? !el.classList.contains('show') : show;
    el.classList.toggle('show', showVal);
    if (showVal) {
        document.getElementById('search-input').value = '';
        document.getElementById('search-results').innerHTML = '';
        document.getElementById('search-results').classList.remove('show');
        renderFavorites();
        setTimeout(() => document.getElementById('search-input').focus(), 100);
    }
}

function toggleProModal(show) {
    const el = document.getElementById('modal-pro');
    const showVal = show === undefined ? !el.classList.contains('show') : show;
    el.classList.toggle('show', showVal);
    if (showVal) {
        updateProModal();
    }
}

function renderThemeOptions() {
    const container = document.getElementById('theme-options');
    if (!container) return;
    const current = ThemeManager.current;
    container.innerHTML = Object.entries(ThemeManager.themes).map(([key, t]) =>
        `<button class="chip${key === current ? ' active' : ''}" onclick="selectTheme('${key}')" style="font-size:11px;padding:4px 10px">${t.icon} ${t.name}</button>`
    ).join('');
}

function selectTheme(key) {
    ThemeManager.apply(key);
    renderThemeOptions();
}

function updateProModal() {
    const statusDiv = document.getElementById('pro-status');
    const buyBtn = document.getElementById('btn-buy-pro');
    const restoreBtn = document.getElementById('btn-restore-pro');
    const codeStatus = document.getElementById('code-status');
    const codeInput = document.getElementById('collab-code');
    const themeSection = document.getElementById('theme-section');
    if (codeStatus) codeStatus.innerHTML = '';
    if (codeInput) codeInput.value = '';

    if (LicenseManager.isPro || LicenseManager.isCollaborator) {
        statusDiv.innerHTML = '<div style="text-align:center;color:var(--accent2);font-size:13px;font-weight:700">✓ Ya tienes PRO activado</div>';
        buyBtn.style.display = 'none';
        restoreBtn.style.display = 'none';
        if (themeSection) { themeSection.style.display = 'block'; renderThemeOptions(); }
    } else {
        statusDiv.innerHTML = '';
        buyBtn.style.display = 'block';
        restoreBtn.style.display = 'block';
        if (themeSection) themeSection.style.display = 'none';
    }
}

async function purchasePro() {
    const statusDiv = document.getElementById('pro-status');
    statusDiv.innerHTML = '<div style="text-align:center;color:var(--text3);font-size:12px">Procesando compra...</div>';

    const success = await BillingManager.purchasePro();

    if (success) {
        statusDiv.innerHTML = '<div style="text-align:center;color:var(--accent2);font-size:13px;font-weight:700">✓ ¡Compra exitosa! Ya eres PRO</div>';
        updateProButton();
        setTimeout(() => toggleProModal(false), 2000);
    } else {
        statusDiv.innerHTML = '<div style="text-align:center;color:var(--danger);font-size:12px">Error en la compra. Intenta nuevamente.</div>';
    }
}

async function restorePro() {
    const statusDiv = document.getElementById('pro-status');
    statusDiv.innerHTML = '<div style="text-align:center;color:var(--text3);font-size:12px">Restaurando compra...</div>';

    const success = await BillingManager.restorePurchases();

    if (success) {
        statusDiv.innerHTML = '<div style="text-align:center;color:var(--accent2);font-size:13px;font-weight:700">✓ Compra restaurada</div>';
        updateProButton();
        setTimeout(() => toggleProModal(false), 2000);
    } else {
        statusDiv.innerHTML = '<div style="text-align:center;color:var(--text3);font-size:12px">No se encontró ninguna compra previa.</div>';
    }
}

function updateProButton() {
    const btn = document.getElementById('btn-pro');
    if (LicenseManager.isPro || LicenseManager.isCollaborator) {
        btn.textContent = '⭐ PRO';
        btn.style.background = 'var(--accent2)';
        btn.style.borderColor = 'var(--accent2)';
    } else {
        btn.textContent = '⭐ PRO';
        btn.style.background = 'var(--accent)';
        btn.style.borderColor = 'var(--accent)';
    }
}

function redeemProCode() {
    const input = document.getElementById('collab-code');
    const status = document.getElementById('code-status');
    const code = input.value.trim();
    if (!code) {
        status.innerHTML = '<span style="color:var(--danger)">Ingresa un código</span>';
        return;
    }
    if (LicenseManager.redeemCode(code)) {
        status.innerHTML = '<span style="color:var(--accent2);font-weight:700">✓ Colaborador activado</span>';
        input.value = '';
        updateProButton();
        setTimeout(() => toggleProModal(false), 1500);
    } else {
        status.innerHTML = '<span style="color:var(--danger)">✗ Código inválido</span>';
    }
}

function renderFavorites() {
    const container = document.getElementById('search-favorites');
    const favs = getFavorites();
    if (favs.length === 0) {
        container.innerHTML = '<div class="fav-title">⭐ Favoritos</div><div class="fav-empty">Sin favoritos aún. Hacé clic en la estrella ⭐ de una fórmula para agregarla.</div>';
        return;
    }
    container.innerHTML = '<div class="fav-title">⭐ Favoritos</div>' + favs.map(f => {
        const col = MODE_COLORS[f.mod] || '#4f9cf9';
        const title = f.title || (FORMS[f.mod] && FORMS[f.mod][f.key] ? FORMS[f.mod][f.key].title : f.key);
        return `<div class="search-item" onclick="selectSearchResult('${f.mod}','${f.key}')">
            <span class="dot" style="background:${col}"></span>
            <span class="si-mod">${MODE_NAMES[f.mod] || f.mod}</span>
            <span class="si-name">${title}</span>
            <button class="si-star active" onclick="event.stopPropagation();toggleFav('${f.mod}','${f.key}','${(title||'').replace(/'/g,"\\'")}')">★</button>
        </div>`;
    }).join('');
}

function doSearch(q) {
    // Rastrear búsquedas
    AnalyticsManager.trackSearch(q);

    const results = document.getElementById('search-results');
    if (!q.trim()) { results.classList.remove('show'); results.innerHTML = ''; return; }
    const term = q.toLowerCase();
    const matches = formulaIndex.filter(f =>
        f.title.toLowerCase().includes(term) ||
        f.formula.toLowerCase().includes(term) ||
        f.modName.toLowerCase().includes(term) ||
        f.mod.toLowerCase().includes(term) ||
        f.key.toLowerCase().includes(term)
    ).slice(0, 30);
    if (matches.length === 0) {
        results.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text3);font-size:13px">Sin resultados</div>';
    } else {
        results.innerHTML = matches.map(f => {
            const isFav = isFavorite(f.mod, f.key);
            return `<div class="search-item" onclick="selectSearchResult('${f.mod}','${f.key}')">
                <span class="dot" style="background:${f.modColor}"></span>
                <span class="si-mod">${f.modName}</span>
                <span class="si-name">${f.title}</span>
                <button class="si-star${isFav?' active':''}" onclick="event.stopPropagation();toggleFav('${f.mod}','${f.key}','${f.title.replace(/'/g,"\\'")}')">${isFav?'★':'☆'}</button>
            </div>`;
        }).join('');
    }
    results.classList.add('show');
}

function selectSearchResult(mod, key) {
    toggleSearch(false);
    setMode(mod);
    setFormula(mod, key);
}

// ── Favoritos ──

function getFavorites() {
    try { return JSON.parse(localStorage.getItem('SumaMente_favorites')) || []; }
    catch(e) { return []; }
}
function isFavorite(mod, key) {
    return getFavorites().some(f => f.mod === mod && f.key === key);
}
function toggleFav(mod, key, title) {
    let favs = getFavorites();
    const idx = favs.findIndex(f => f.mod === mod && f.key === key);
    if (idx >= 0) favs.splice(idx, 1);
    else favs.push({ mod, key, title: title || key });
    try { localStorage.setItem('SumaMente_favorites', JSON.stringify(favs)); } catch(e) {}
    const q = document.getElementById('search-input');
    if (q) doSearch(q.value);
    renderFavorites();
    updateChipStars();
}

// Estrella en chips del HTML
function enhanceChips() {
    document.querySelectorAll('.formula-chips .chip').forEach(btn => {
        const m = btn.getAttribute('onclick');
        if (!m) return;
        const parts = m.match(/setFormula\(\s*'(\w+)'\s*,\s*'(\w+)'/);
        if (!parts) return;
        const mod = parts[1], key = parts[2];
        btn.dataset.mod = mod;
        btn.dataset.key = key;
        const star = document.createElement('span');
        star.className = 'chip-star';
        star.textContent = '☆';
        star.onclick = e => {
            e.stopPropagation();
            e.preventDefault();
            const def = FORMS[mod] && FORMS[mod][key];
            toggleFav(mod, key, def ? def.title : key);
        };
        btn.prepend(star);
        btn.style.paddingLeft = '6px';
    });
    updateChipStars();
}
function updateChipStars() {
    document.querySelectorAll('.formula-chips .chip').forEach(btn => {
        const star = btn.querySelector('.chip-star');
        if (!star) return;
        const isFav = isFavorite(btn.dataset.mod, btn.dataset.key);
        star.textContent = isFav ? '★' : '☆';
        star.classList.toggle('active', isFav);
    });
}

// Ctrl+K abre busqueda + teclado calculadora general
document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toggleSearch();
        return;
    }
    if (e.key === 'Escape') {
        const searchModal = document.getElementById('modal-search');
        if (searchModal && searchModal.classList.contains('show')) { toggleSearch(false); return; }
        const proModal = document.getElementById('modal-pro');
        if (proModal && proModal.classList.contains('show')) { toggleProModal(false); return; }
    }

    // Teclado para la calculadora general (solo si el modo general está activo)
    const generalSection = document.getElementById('mode-general');
    if (!generalSection || !generalSection.classList.contains('active')) return;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    const k = e.key;
    if (k >= '0' && k <= '9') { genKey(k); e.preventDefault(); }
    else if (k === '+' || k === '-' || k === '*' || k === '/' || k === '^') { genKey(k); e.preventDefault(); }
    else if (k === '.') { genKey('.'); e.preventDefault(); }
    else if (k === '(' || k === ')') { genKey(k); e.preventDefault(); }
    else if (k === 'Enter') { genEval(); e.preventDefault(); }
    else if (k === 'Backspace') { genBack(); e.preventDefault(); }
    else if (k === 'Delete') { genClear(); e.preventDefault(); }
    else if (k === 'e') { genKey('e'); e.preventDefault(); }
    else if (k === 'x') { genKey('x'); e.preventDefault(); }
    else if (k === 'y') { genKey('y'); e.preventDefault(); }
    else if (k === ',') { genKey(','); e.preventDefault(); }
    else if (k === '=') { genKey('='); e.preventDefault(); }
    else if (k === '!') { genFactorial(); e.preventDefault(); }
    else if (k === 'p') { genKey('π'); e.preventDefault(); }
    else if (k.length === 1) { e.preventDefault(); }
});

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    LicenseManager.load();
    AnalyticsManager.load().recordSession();
    ThemeManager.load();
    if (!LicenseManager.isPro) ThemeManager.apply('dark');
    updateProButton();

    // Inicializar Billing (solo en Capacitor/Android)
    BillingManager.init();

    // Inicializar AdMob (solo en Capacitor/Android)
    AdManager.init().then(() => {
        if (!LicenseManager.isPro && !LicenseManager.isCollaborator) {
            setTimeout(() => AdManager.showBanner(), 1000);
        }
    });

    renderDB('general');
    renderGeneralDB();
    renderHistory();

    // Pegar texto en la calculadora general
    document.querySelector('#mode-general .gen-display')?.addEventListener('paste', e => {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData('text');
        if (text) {
            genExpr += text.replace(/×/g, '*').replace(/÷/g, '/').replace(/π/g, 'pi');
            document.getElementById('gen-expr').textContent = genExpr;
        }
    });

    buildFormulaIndex();
    enhanceChips();
    document.getElementById('search-input').addEventListener('input', e => doSearch(e.target.value));
    document.getElementById('search-input').addEventListener('keydown', e => {
        const items = document.querySelectorAll('#search-results .search-item');
        if (!items.length) return;
        const active = document.querySelector('#search-results .search-item.hover');
        let idx = active ? Array.from(items).indexOf(active) : -1;
        if (e.key === 'ArrowDown') { e.preventDefault(); idx = Math.min(idx + 1, items.length - 1); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); idx = Math.max(idx - 1, 0); }
        else if (e.key === 'Enter') { e.preventDefault(); if (active) active.click(); return; }
        else return;
        items.forEach(el => el.classList.remove('hover'));
        items[idx].classList.add('hover');
        items[idx].scrollIntoView({ block: 'nearest' });
    });

    // Inicialización automática de todos los módulos activos
    Object.keys(activeFormula).forEach(mode => {
        setFormula(mode, activeFormula[mode]);
    });

    if ('serviceWorker' in navigator && (location.protocol === 'http:' || location.protocol === 'https:')) {
        navigator.serviceWorker.register('./service-worker.js', { scope: './' })
            .catch(() => {});
    }
});
