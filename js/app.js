let currentMode = 'general';
let showSteps = false;
let history = [];
let genExpr = '';
let genResult = '0';
let genLastResult = null;
let genMemory = 0;

let activeFormula = { 
    electro: 'ohm', med: 'goteo', fin: 'prestamo', quim: 'molar', civil: 'hormigon', mec: 'torque', geom: 'circulo', 
    unit: 'longitud', fis: 'velocidad', diseno: 'conv', nutri: 'macros', acust: 'spl', prog: 'bases', estad: 'basica', redes: 'subredes'
};

let angleMode = 'deg'; // 'deg' | 'rad'

// ── Gestor de publicidad AdMob (Banner discreto) ──
const AdManager = {
    isInitialized: false,
    bannerId: 'ca-app-pub-8506144157862831/8793443400',

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
        if (!this.isInitialized || LicenseManager.isPro || LicenseManager.isCollaborator) return;
        try {
            const { AdMob } = await import('@capacitor-community/admob');
            await AdMob.showBanner({ adId: this.bannerId, position: 'bottom', margin: 0, isTesting: false });
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

// ── Gestor de licencias ──
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

    save() { localStorage.setItem('SumaMente_license', JSON.stringify(this._data)); },

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
        const validCodes = [
            'SUMAMENTE-HELPER-2026',
            'SUMAMENTE-COLAB-001',
            'SUMAMENTE-BETA-001'
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

    export() { return JSON.parse(JSON.stringify(this._data)); }
};

// ── Gestor de temas visuales ──
const ThemeManager = {
    themes: {
        dark: {
            name: 'Dark', icon: '🌙',
            vars: {
                '--bg': '#0a0b0e', '--surface': '#111318', '--surface2': '#181c24',
                '--surface3': '#1e232f', '--border': '#2a3040', '--border2': '#3a4558',
                '--accent': '#4f9cf9', '--accent2': '#38e8c8', '--accent3': '#f97b4f',
                '--accent4': '#a78bfa', '--text': '#e8edf5', '--text2': '#8a97b0', '--text3': '#4a5570'
            }
        },
        ocean: {
            name: 'Océano', icon: '🌊',
            vars: {
                '--bg': '#0a0e1a', '--surface': '#0f1a2e', '--surface2': '#142240',
                '--surface3': '#1a2d52', '--border': '#1e3a6e', '--border2': '#2a5090',
                '--accent': '#5bc0eb', '--accent2': '#48e5c2', '--accent3': '#f9a84f',
                '--accent4': '#9b72cf', '--text': '#e0f0ff', '--text2': '#7ab0d4', '--text3': '#3a6080'
            }
        },
        forest: {
            name: 'Bosque', icon: '🌿',
            vars: {
                '--bg': '#0a1008', '--surface': '#111a10', '--surface2': '#1a2a18',
                '--surface3': '#243a20', '--border': '#2a4a28', '--border2': '#3a6a38',
                '--accent': '#6bc46e', '--accent2': '#4ade80', '--accent3': '#f9c74f',
                '--accent4': '#a78bfa', '--text': '#e0f0d8', '--text2': '#7aa878', '--text3': '#3a6838'
            }
        },
        midnight: {
            name: 'Midnight', icon: '🌃',
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

// ── Gestor de métricas ──
const AnalyticsManager = {
    _data: null,

    load() {
        try { this._data = JSON.parse(localStorage.getItem('SumaMente_analytics')); } catch(e) {}
        if (!this._data) {
            this._data = {
                modules: {}, formulas: {}, searches: {},
                firstOpen: new Date().toISOString(),
                lastOpen: new Date().toISOString(),
                sessionCount: 0
            };
            this.save();
        }
        return this;
    },

    save() { localStorage.setItem('SumaMente_analytics', JSON.stringify(this._data)); },
    trackModule(module) { this._data.modules[module] = (this._data.modules[module] || 0) + 1; this.save(); },
    trackFormula(module, formula) { const k = `${module}:${formula}`; this._data.formulas[k] = (this._data.formulas[k] || 0) + 1; this.save(); },
    trackSearch(query) {
        if (!query || query.length < 2) return;
        const n = query.toLowerCase().trim();
        this._data.searches[n] = (this._data.searches[n] || 0) + 1;
        this.save();
    },
    recordSession() { this._data.lastOpen = new Date().toISOString(); this._data.sessionCount++; this.save(); },
    getTopModules(limit = 5) { return Object.entries(this._data.modules).sort((a, b) => b[1] - a[1]).slice(0, limit); },
    getTopFormulas(limit = 5) { return Object.entries(this._data.formulas).sort((a, b) => b[1] - a[1]).slice(0, limit); },
    getTopSearches(limit = 5) { return Object.entries(this._data.searches).sort((a, b) => b[1] - a[1]).slice(0, limit); },
    export() { return JSON.parse(JSON.stringify(this._data)); }
};

// ── Gestor de compras Google Play Billing ──
const BillingManager = {
    isInitialized: false,
    productId: 'sumamente_pro_lifetime',

    async init() {
        if (this.isInitialized) return;
        try {
            const { CdvPurchase } = await import('capacitor-plugin-cdv-purchase');
            await CdvPurchase.initialize([{ id: this.productId, type: CdvPurchase.ProductType.NON_CONSUMABLE }]);
            this.isInitialized = true;
            console.log('Billing inicializado');
        } catch (error) {
            console.log('Billing no disponible (web o error):', error.message);
        }
    },

    async purchasePro() {
        if (!this.isInitialized) { console.log('Billing no inicializado'); return false; }
        try {
            const { CdvPurchase } = await import('capacitor-plugin-cdv-purchase');
            const offer = await CdvPurchase.getOffers([this.productId]);
            if (offer.length === 0) { console.log('No se encontraron ofertas'); return false; }
            const result = await CdvPurchase.purchase(offer[0]);
            if (result) { LicenseManager.activate('pro', 'playstore'); AdManager.hideBanner(); return true; }
            return false;
        } catch (error) {
            console.log('Error en compra PRO:', error.message);
            return false;
        }
    },

    async restorePurchases() {
        if (!this.isInitialized) { console.log('Billing no inicializado'); return false; }
        try {
            const { CdvPurchase } = await import('capacitor-plugin-cdv-purchase');
            await CdvPurchase.restorePurchases();
            const purchases = await CdvPurchase.getLatestPurchases();
            const hasPro = purchases.some(p => p.productId === this.productId);
            if (hasPro) { LicenseManager.activate('pro', 'playstore'); AdManager.hideBanner(); return true; }
            return false;
        } catch (error) {
            console.log('Error al restaurar compras:', error.message);
            return false;
        }
    }
};

function getCanvasImage(module) {
    const canvas = document.getElementById('chart-canvas-' + module);
    if (canvas && canvas.width > 0) {
        return canvas.toDataURL('image/png');
    }
    return null;
}

function exportGenPDF() {
    if (!LicenseManager.isPro) { showProUpgradeModal('Exportar PDF', 'Exportá tus cálculos y gráficos en formato PDF con un solo clic.'); return; }
    showPDFChoice((mode) => {
        if (mode === 'last') {
            let moduleName = 'General';
            let resultLabel = '';
            let resultKey = '';
            let isModule = false;
            let steps = [];
            let expr = '';
            let result = '0';
            let chartImg = null;

            if (history.length > 0) {
                const last = history[0];
                expr = last.expr || '';
                result = last.val;
                steps = last.steps || [];
                moduleName = last.module || 'General';
                resultLabel = last.label || '';
                resultKey = last.key || '';
                isModule = !last.expr && last.module !== 'general';

                if (isModule) {
                    chartImg = last.chartDataUrl || getCanvasImage(moduleName);
                } else {
                    // Solo incluir gráfico si el tipo de cálculo puede tenerlo
                    const canPlot = last.key === 'func' || last.key === 'quadratic' || last.key === 'system' || last.key === 'linear2var' || (last.key === 'eq' && expr && /x/.test(expr));
                    if (canPlot) {
                        if (!chartImg && expr && /[x]/.test(expr)) {
                            const _v = (ThemeManager.themes[ThemeManager.current || 'dark'] || ThemeManager.themes.dark).vars;
                            let clean = expr;
                            if (clean.includes('=')) clean = clean.split('=')[0].trim();
                            clean = clean.replace(/²/g, '^2').replace(/π/g, 'pi');
                            const svg = renderFunctionToSVG(clean, 500, 250, _v);
                            if (svg) chartImg = 'data:image/svg+xml,' + encodeURIComponent(svg);
                        }
                    }
                }
            }
            if (!expr && result === '0') return;

            const displayLabel = isModule ? resultLabel : (expr ? `Resultado: ${expr}` : 'Resultado');
            const displayKey = isModule ? resultKey : (expr || 'resultado');
            exportResultPDF(moduleName, displayKey, result, displayLabel, steps, chartImg);
        } else {
            exportHistoryPDF();
        }
    });
}

function showPDFChoice(callback) {
    const overlay = document.createElement('div');
    overlay.id = 'pdf-choice-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:center;justify-content:center;animation:fadeIn 0.2s';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    overlay.innerHTML = `
        <div style="background:var(--surface2,#181c24);border:1px solid var(--border,#2a3040);border-radius:12px;padding:24px;max-width:340px;width:90%;text-align:center">
            <div style="font-size:32px;margin-bottom:8px">📄</div>
            <div style="font-family:var(--sans,'Syne',sans-serif);font-size:18px;font-weight:700;color:var(--text,#e8edf5);margin-bottom:4px">Exportar PDF</div>
            <div style="font-size:12px;color:var(--text3,#4a5570);margin-bottom:20px">¿Qué querés exportar?</div>
            <button id="pdf-choice-last" style="display:block;width:100%;padding:12px;margin-bottom:8px;background:var(--accent,#4f9cf9);color:#0a0b0e;border:none;border-radius:8px;font-weight:700;font-size:14px;cursor:pointer">Último cálculo</button>
            <button id="pdf-choice-history" style="display:block;width:100%;padding:12px;margin-bottom:12px;background:var(--surface3,#1e232f);color:var(--text,#e8edf5);border:1px solid var(--border,#2a3040);border-radius:8px;font-weight:600;font-size:13px;cursor:pointer">Historial completo (${history.length} cálculos)</button>
            <button id="pdf-choice-cancel" style="background:none;border:none;color:var(--text3,#4a5570);font-size:12px;cursor:pointer;padding:4px">Cancelar</button>
        </div>`;
    document.body.appendChild(overlay);
    document.getElementById('pdf-choice-last').onclick = () => { overlay.remove(); callback('last'); };
    document.getElementById('pdf-choice-history').onclick = () => { overlay.remove(); callback('history'); };
    document.getElementById('pdf-choice-cancel').onclick = () => { overlay.remove(); };
    document.addEventListener('keydown', function handler(e) { if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', handler); } });
}



// ── renderFunctionToSVG: gráfico como SVG inline ──
// ── renderFunctionToSVG: genera gráfico como SVG inline (sin canvas, sin dataURL) ──
function renderFunctionToSVG(exprStr, w, h, themeVars) {
    if (!exprStr || !/[x]/.test(exprStr)) return '';
    exprStr = exprStr.replace(/²/g, '^2').replace(/π/g, 'pi');
    w = w || 500; h = h || 250;
    const margin = 40;
    const plotW = w - margin * 2;
    const plotH = h - margin * 2;
    const minX = -6, maxX = 6;

    const pts = [];
    const steps = 400;
    for (let i = 0; i <= steps; i++) {
        const x = minX + (maxX - minX) * i / steps;
        try {
            const y = safeMathEval(exprStr, { x });
            if (isFinite(y)) pts.push({ x, y });
        } catch(e) {}
    }

    const allY = pts.filter(p => p.y !== null).map(p => p.y);
    let minY, maxY;
    if (allY.length > 10) {
        const sorted = [...allY].sort((a, b) => a - b);
        const t0 = Math.floor(sorted.length * 0.02);
        const t1 = Math.ceil(sorted.length * 0.98);
        minY = sorted[t0]; maxY = sorted[t1 - 1];
    } else if (allY.length > 0) {
        minY = Math.min(...allY); maxY = Math.max(...allY);
    } else { return ''; }
    const yRange = maxY - minY || 1;
    minY -= yRange * 0.12; maxY += yRange * 0.12;

    const toX = (x) => margin + (x - minX) / (maxX - minX) * plotW;
    const toY = (y) => margin + (maxY - y) / (maxY - minY) * plotH;

    // Theme colors (for PDF export)
    const v = themeVars || {};
    const bg = v['--bg'] || '#0a0b0e';
    const border = v['--border'] || '#2a3040';
    const accent = v['--accent'] || '#4f9cf9';
    const text2 = v['--text2'] || '#8a97b0';
    const text3 = v['--text3'] || '#4a5570';

    // Grid lines
    const xStep = Math.pow(10, Math.floor(Math.log10((maxX - minX) / 5)));
    const yStep = Math.pow(10, Math.floor(Math.log10((maxY - minY) / 5)));
    let gridLines = '';
    for (let x = Math.ceil(minX / xStep) * xStep; x <= maxX; x += xStep / 2) {
        const cx = toX(x).toFixed(1);
        gridLines += `<line x1="${cx}" y1="${margin}" x2="${cx}" y2="${margin + plotH}" stroke="${text3}" stroke-opacity="0.3" stroke-width="0.5"/>`;
    }
    for (let y = Math.ceil(minY / yStep) * yStep; y <= maxY; y += yStep / 2) {
        const cy = toY(y).toFixed(1);
        gridLines += `<line x1="${margin}" y1="${cy}" x2="${margin + plotW}" y2="${cy}" stroke="${text3}" stroke-opacity="0.3" stroke-width="0.5"/>`;
    }
    for (let x = Math.ceil(minX / xStep) * xStep; x <= maxX; x += xStep) {
        const cx = toX(x).toFixed(1);
        gridLines += `<line x1="${cx}" y1="${margin}" x2="${cx}" y2="${margin + plotH}" stroke="${text3}" stroke-opacity="0.6" stroke-width="1"/>`;
    }
    for (let y = Math.ceil(minY / yStep) * yStep; y <= maxY; y += yStep) {
        const cy = toY(y).toFixed(1);
        gridLines += `<line x1="${margin}" y1="${cy}" x2="${margin + plotW}" y2="${cy}" stroke="${text3}" stroke-opacity="0.6" stroke-width="1"/>`;
    }

    // Axes
    let axes = '';
    if (minY <= 0 && maxY >= 0) {
        const cy = toY(0).toFixed(1);
        axes += `<line x1="${margin}" y1="${cy}" x2="${margin + plotW}" y2="${cy}" stroke="${text2}" stroke-width="2"/>`;
    }
    if (minX <= 0 && maxX >= 0) {
        const cx = toX(0).toFixed(1);
        axes += `<line x1="${cx}" y1="${margin}" x2="${cx}" y2="${margin + plotH}" stroke="${text2}" stroke-width="2"/>`;
    }

    // Labels
    let labels = '';
    for (let x = Math.ceil(minX / xStep) * xStep; x <= maxX; x += xStep) {
        if (Math.abs(x) < 0.001) continue;
        const cx = toX(x).toFixed(1);
        const ly = (minY <= 0 && maxY >= 0) ? toY(0) : margin + plotH;
        labels += `<text x="${cx}" y="${ly + 12}" fill="${text2}" font-size="9" font-family="monospace" text-anchor="middle">${parseFloat(x.toPrecision(3))}</text>`;
    }
    for (let y = Math.ceil(minY / yStep) * yStep; y <= maxY; y += yStep) {
        if (Math.abs(y) < 0.001) continue;
        const cy = toY(y).toFixed(1);
        const lx = (minX <= 0 && maxX >= 0) ? toX(0) : margin;
        labels += `<text x="${lx - 5}" y="${cy + 3}" fill="${text2}" font-size="9" font-family="monospace" text-anchor="end">${parseFloat(y.toPrecision(3))}</text>`;
    }

    // Function curve
    let pathD = '';
    let started = false;
    for (const p of pts) {
        if (p.y === null) { started = false; continue; }
        const cx = toX(p.x).toFixed(2);
        const cy = toY(p.y).toFixed(2);
        if (!started) { pathD += `M${cx},${cy}`; started = true; } else pathD += `L${cx},${cy}`;
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" style="background:${bg};border-radius:6px;border:1px solid ${border}">
        ${gridLines}
        ${axes}
        <path d="${pathD}" fill="none" stroke="${accent}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        ${labels}
    </svg>`;
}

// ── FIX: descarga directa como .html (no print dialog) ──
function _downloadHTMLasPDF(htmlContent, filename) {
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
}

// ── exportHistoryPDF: descarga HTML con gráficos SVG inline ──
function exportHistoryPDF() {
    if (!LicenseManager.isPro) { showProUpgradeModal('Exportar historial en PDF', 'Exportá todo tu historial de cálculos en un PDF completo.'); return; }
    if (history.length === 0) { alert('No hay cálculos en el historial'); return; }

    const _v = (ThemeManager.themes[ThemeManager.current || 'dark'] || ThemeManager.themes.dark).vars;
    const _css = `*{-webkit-print-color-adjust:exact;print-color-adjust:exact;box-sizing:border-box;margin:0;padding:0}
body{background:${_v['--bg']};color:${_v['--text']};font-family:'JetBrains Mono',monospace;padding:30px;max-width:800px;margin:0 auto}
h1{font-family:'Syne',sans-serif;font-size:22px;color:${_v['--accent']};margin-bottom:5px}
.sub{font-size:11px;color:${_v['--text3']};margin-bottom:25px}
.entry{border-bottom:1px solid ${_v['--border']};padding-bottom:18px;margin-bottom:22px}
.entry:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0}
.label{font-size:12px;color:${_v['--text2']};text-transform:uppercase;letter-spacing:1px;margin-bottom:4px}
.value{font-size:28px;font-weight:700;color:${_v['--text']};margin-bottom:20px;word-break:break-all}
.step{background:${_v['--surface']};border:1px solid ${_v['--border']};border-radius:6px;padding:8px 12px;margin-bottom:4px;font-size:12px;color:${_v['--text']}}
.steps-title{font-size:12px;color:${_v['--text3']};margin-bottom:8px;margin-top:20px;text-transform:uppercase;letter-spacing:1px}
.footer{margin-top:30px;padding-top:15px;border-top:1px solid ${_v['--border']};font-size:10px;color:${_v['--text3']};text-align:center}
.badge{display:inline-block;background:${_v['--accent2']};color:${_v['--bg']};font-size:9px;padding:2px 8px;border-radius:4px;font-weight:700;margin-left:8px}`;

    let html = '';
    history.forEach((h, idx) => {
    const canPlot = h.key === 'func' || h.key === 'quadratic' || h.key === 'system' || h.key === 'linear2var' || (h.key === 'eq' && h.expr && /x/.test(h.expr));
        let chartImg = null;
        if (canPlot) {
            let plotExpr = h.expr || (h.label ? h.label.replace('f(x) = ', '') : '');
            if (h.key === 'eq' && plotExpr.includes('=')) {
                plotExpr = plotExpr.split('=')[0].trim();
            }
            plotExpr = plotExpr.replace(/²/g, '^2').replace(/π/g, 'pi');
            if (plotExpr && /x/.test(plotExpr)) {
                chartImg = renderFunctionToSVG(plotExpr, 500, 250, _v);
            }
    } else if (h.key !== 'expr' && h.chartDataUrl) {
            chartImg = h.chartDataUrl;
        }
        const chartHtml = chartImg
            ? (chartImg.startsWith('data:')
                ? `<div style="margin:20px 0;text-align:center"><img src="${chartImg}" style="max-width:100%;border-radius:8px;border:1px solid ${_v['--border']}"></div>`
                : `<div style="margin:20px 0;text-align:center">${chartImg}</div>`)
            : '';
        let stepsHtml = '';
        if (h.steps && h.steps.length) {
            stepsHtml = `<div class="steps-title">Pasos de resolución</div>`;
            h.steps.forEach(s => stepsHtml += `<div class="step">${s}</div>`);
        }
        html += `<div class="entry">
            <div class="label">${h.module} · ${h.key} · ${h.time}</div>
            <div style="font-size:13px;color:${_v['--text2']};margin-bottom:4px">${h.label || ''}</div>
            <div class="value">${h.val}</div>
            ${chartHtml}${stepsHtml}
        </div>`;
    });

    const fullHTML = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>SumaMente - Historial</title><style>${_css}</style></head><body style="background:${_v['--bg']};color:${_v['--text']};padding:30px;font-family:'JetBrains Mono',monospace">
    <h1 style="font-family:'Syne',sans-serif;font-size:22px;color:${_v['--accent']};margin-bottom:5px">SumaMente${LicenseManager.isPro ? ' <span class="badge">PRO</span>' : ''}</h1>
    <div class="sub">Historial completo · ${history.length} cálculos · ${new Date().toLocaleString('es-AR')}</div>
    ${html}
    <div class="footer">Generado por SumaMente Cientifica</div></body></html>`;

    const w = window.open('', '_blank');
    if (!w) { alert('Permite ventanas emergentes para exportar PDF'); return; }
    w.document.write(fullHTML);
    w.document.close();
    setTimeout(() => { w.focus(); w.print(); }, 500);
}

// ── exportResultPDF: descarga directa ──
function exportResultPDF(module, key, val, label, steps, chartImg) {
    if (typeof steps === 'string' && steps.startsWith('%')) {
        try { steps = JSON.parse(decodeURIComponent(steps)); } catch(e) { steps = []; }
    }
    if (!Array.isArray(steps)) steps = [];

    const date = new Date().toLocaleString('es-AR');
    const _v = (ThemeManager.themes[ThemeManager.current || 'dark'] || ThemeManager.themes.dark).vars;
    const _css = `*{-webkit-print-color-adjust:exact;print-color-adjust:exact;box-sizing:border-box;margin:0;padding:0}
body{background:${_v['--bg']};color:${_v['--text']};font-family:'JetBrains Mono',monospace;padding:30px;max-width:800px;margin:0 auto}
h1{font-family:'Syne',sans-serif;font-size:22px;color:${_v['--accent']};margin-bottom:5px}
.sub{font-size:11px;color:${_v['--text3']};margin-bottom:25px}
.label{font-size:12px;color:${_v['--text2']};text-transform:uppercase;letter-spacing:1px;margin-bottom:4px}
.value{font-size:28px;font-weight:700;color:${_v['--text']};margin-bottom:20px;word-break:break-all}
.step{background:${_v['--surface']};border:1px solid ${_v['--border']};border-radius:6px;padding:8px 12px;margin-bottom:4px;font-size:12px;color:${_v['--text']}}
.steps-title{font-size:12px;color:${_v['--text3']};margin-bottom:8px;margin-top:20px;text-transform:uppercase;letter-spacing:1px}
.footer{margin-top:30px;padding-top:15px;border-top:1px solid ${_v['--border']};font-size:10px;color:${_v['--text3']};text-align:center}
.badge{display:inline-block;background:${_v['--accent2']};color:${_v['--bg']};font-size:9px;padding:2px 8px;border-radius:4px;font-weight:700;margin-left:8px}`;
    const chartHtml = chartImg
        ? `<div style="margin:20px 0;text-align:center"><img src="${chartImg}" style="max-width:100%;border-radius:8px;border:1px solid ${_v['--border']}"></div>`
        : '';
    let stepsHtml = '';
    if (steps.length) {
        stepsHtml = `<div class="steps-title">Pasos de resolución</div>`;
        steps.forEach(s => stepsHtml += `<div class="step">${s}</div>`);
    }

    const fullHTML = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>SumaMente - ${label}</title><style>${_css}</style></head><body style="background:${_v['--bg']};color:${_v['--text']};padding:30px;font-family:'JetBrains Mono',monospace">
    <h1 style="font-family:'Syne',sans-serif;font-size:22px;color:${_v['--accent']};margin-bottom:5px">SumaMente${LicenseManager.isPro ? ' <span class="badge">PRO</span>' : ''}</h1>
    <div class="sub">${module} · ${key} · ${date}</div>
    <div class="label">${label}</div>
    <div class="value">${val}</div>
    ${chartHtml}${stepsHtml}
    <div class="footer">Generado por SumaMente Cientifica</div></body></html>`;

    const w = window.open('', '_blank');
    if (!w) { alert('Permite ventanas emergentes para exportar PDF'); return; }
    w.document.write(fullHTML);
    w.document.close();
    setTimeout(() => { w.focus(); w.print(); }, 500);
}

// Formato inteligente: muestra enteros sin decimales, decimales con precisión necesaria
function formatNumber(num, decimals = 4) {
    if (num === null || num === undefined || isNaN(num)) return num;
    const n = Number(num);
    if (Number.isInteger(n)) return n.toString();
    return parseFloat(n.toFixed(decimals)).toString();
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

// ── Modal: detalle del historial (PRO) ──
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
            // Activar chip correcto
            const chips = document.querySelectorAll(`#mode-${h.module} .chip`);
            chips.forEach(c => c.classList.remove('active'));
            chips.forEach(c => {
                const onclick = c.getAttribute('onclick') || '';
                if (onclick.includes(`'${h.key}'`)) c.classList.add('active');
            });
            // Poblar campos
            if (h.inputs) {
                Object.entries(h.inputs).forEach(([id, val]) => {
                    const el = document.getElementById(`field-${id}`);
                    if (el) el.value = val;
                });
            }
            // Setear incógnita objetivo
            if (h.targetVar) {
                const sel = document.getElementById(`incognita-${h.module}`);
                if (sel) sel.value = h.targetVar;
                updateFieldsVisibility(h.module, h.key);
            }
            // Auto-calcular
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

function escHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
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

function normalizeInput(str) {
    const subscripts = { '₀':'0','₁':'1','₂':'2','₃':'3','₄':'4','₅':'5','₆':'6','₇':'7','₈':'8','₉':'9' };
    const superscripts = { '²':'^2','³':'^3','¹':'^1' };
    let result = str.replace(/[₀₁₂₃₄₅₆₇₈₉]/g, c => subscripts[c] || c);
    result = result.replace(/[²³¹]/g, c => superscripts[c] || c);
    // Also handle general Unicode superscript digits (U+2070-U+2079)
    result = result.replace(/[\u2070-\u2079]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x2050));
    return result;
}

function friendlyError(msg) {
    if (!msg) return 'Ocurrió un error inesperado.';
    if (/caracter.*inv|lido/.test(msg)) return 'No entendí ese formato. Intentá escribirlo de otra forma (ej. "log base 2" en lugar de "log₂").';
    if (/división por cero|division by zero|infinito/.test(msg)) return 'La operación da una división por cero. Revisá los valores.';
    if (/identificador.*inv|lido/.test(msg)) return 'No reconozco ese símbolo. Usá solo letras, números y operadores básicos.';
    if (/par.*ntesis.*desbal/.test(msg)) return 'Falta cerrar un paréntesis. Revisá la expresión.';
    if (/faltan.*arg|faltan.*oper/.test(msg)) return 'Faltan números o argumentos en la expresión.';
    if (/factorial/.test(msg)) return 'El factorial necesita un número entero entre 0 y 170.';
    return msg;
}

function generateAlgebraicSteps(equation) {
    try {
        equation = normalizeInput(equation);
        const parts = equation.split('=');
        if (parts.length !== 2) return;
        
        const left = parts[0].trim();
        const right = parts[1].trim();
        const steps = [];
        
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
            
            if (newLeftCoef === 0) {
                if (finalRight === 0) {
                    steps.push(`<strong>Conclusión:</strong> ${finalRight} = ${finalRight} → la ecuación es una identidad.`);
                    steps.push(`<strong>Infinitas soluciones.</strong> Cualquier valor de x cumple la igualdad.`);
                } else {
                    steps.push(`<strong>Conclusión:</strong> 0 = ${finalRight} → contradicción.`);
                    steps.push(`<strong>No existe</strong> un valor de x que cumpla esta ecuación.`);
                }
            } else {
                steps.push(`<strong>Paso 4:</strong> Despejar x dividiendo por ${newLeftCoef}`);
                const result = finalRight / newLeftCoef;
                steps.push(`x = ${finalRight} / ${newLeftCoef}`);
                steps.push(`x = ${formatNumber(result, 4)}`);
                
                steps.push(`<strong>Verificación:</strong>`);
                steps.push(`Sustituir x = ${formatNumber(result, 4)} en la ecuación original`);
            }
            
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
                steps.push(`x₁ = (${-b} + ${formatNumber(sqrtDisc, 4)}) / ${2*a} = ${formatNumber(x1, 4)}`);
                steps.push(`x₂ = (${-b} - ${formatNumber(sqrtDisc, 4)}) / ${2*a} = ${formatNumber(x2, 4)}`);
                steps.push(`<strong>Solución:</strong> x₁ = ${formatNumber(x1, 4)}, x₂ = ${formatNumber(x2, 4)}`);
            } else if (disc === 0) {
                const x = -b / (2 * a);
                steps.push(`Δ = 0 → una solución real (doble)`);
                steps.push(`x = -b / 2a = ${-b} / ${2*a} = ${formatNumber(x, 4)}`);
            } else {
                const real = formatNumber((-b / (2 * a)), 4);
                const imag = formatNumber((Math.sqrt(-disc) / (2 * a)), 4);
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
            const sideWithX = left.includes('x') ? 'izquierdo' : 'derecho';

            if (sideWithX === 'izquierdo') {
                const coef = extractCoefficient(left, 'x');
                if (coef === 0) return;
                const constVal = extractConstant(left);
                const coefStr = coef === 1 ? 'x' : coef === -1 ? '-x' : coef + 'x';

                steps.push(`<strong>Ecuación:</strong> ${formatExpr(coef, constVal, 'x')} = ${right}`);
                steps.push(`<strong>Paso 1:</strong> Identificar términos`);
                steps.push(`Término con x: ${coefStr}`);
                if (constVal !== 0) {
                    steps.push(`Constante: ${constVal > 0 ? '+ ' + constVal : '- ' + Math.abs(constVal)}`);
                }

                let stepNum = 2;
                if (constVal !== 0) {
                    const op = constVal > 0 ? 'Restar' : 'Sumar';
                    const val = Math.abs(constVal);
                    steps.push(`<strong>Paso ${stepNum}:</strong> ${op} ${val} a ambos lados`);
                    stepNum++;
                }
                const newRight = right - constVal;
                steps.push(`${coefStr} = ${newRight}`);

                if (coef !== 1 && coef !== -1) {
                    steps.push(`<strong>Paso ${stepNum}:</strong> Dividir por ${coef}`);
                    steps.push(`x = ${newRight} / ${coef}`);
                }
                steps.push(`<strong>Solución:</strong> x = ${formatNumber(newRight / coef, 4)}`);
 
             } else {
                 const coef = extractCoefficient(right, 'x');
                 if (coef === 0) return;
                 const constVal = extractConstant(right);
                 const coefStr = coef === 1 ? 'x' : coef === -1 ? '-x' : coef + 'x';
 
                 steps.push(`<strong>Ecuación:</strong> ${left} = ${formatExpr(coef, constVal, 'x')}`);
                 steps.push(`<strong>Paso 1:</strong> Identificar términos`);
                 steps.push(`Término con x: ${coefStr}`);
                 if (constVal !== 0) {
                     steps.push(`Constante: ${constVal > 0 ? '+ ' + constVal : '- ' + Math.abs(constVal)}`);
                 }
 
                 let stepNum = 2;
                 if (constVal !== 0) {
                     const op = constVal > 0 ? 'Restar' : 'Sumar';
                     const val = Math.abs(constVal);
                     steps.push(`<strong>Paso ${stepNum}:</strong> ${op} ${val} a ambos lados`);
                     stepNum++;
                 }
                 const newLeft = left - constVal;
                 steps.push(`${newLeft} = ${coefStr}`);
 
                 if (coef !== 1 && coef !== -1) {
                     steps.push(`<strong>Paso ${stepNum}:</strong> Dividir por ${coef}`);
                     steps.push(`x = ${newLeft} / ${coef}`);
                 }
                 steps.push(`<strong>Solución:</strong> x = ${formatNumber(newLeft / coef, 4)}`);
            }
            
        } else {
            steps.push(`<strong>Ecuación:</strong> ${left} = ${right}`);
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
        console.error('generateAlgebraicSteps error:', e);
    }
}

function formatExpr(coef, constVal, variable) {
    let str = '';
    if (coef === 1) str = variable;
    else if (coef === -1) str = '-' + variable;
    else str = coef + variable;
    if (constVal > 0) str += ' + ' + constVal;
    else if (constVal < 0) str += ' - ' + Math.abs(constVal);
    return str;
}

function extractCoefficient(expr, variable) {
    try {
        const cleaned = expr.replace(/\s/g, '');
        const match = cleaned.match(/(-?\d*\.?\d*)\*?x/);
        if (match) {
            const coef = match[1];
            return coef === '' || coef === '-' ? (coef === '-' ? -1 : 1) : parseFloat(coef);
        }
        if (cleaned.includes(variable)) return 1;
        return 0;
    } catch (e) {
        return 0;
    }
}

function extractConstant(expr) {
    try {
        const cleaned = expr.replace(/\s/g, '');
        const withoutX = cleaned.replace(/(-?\d*\.?\d*)\*?x/g, '').replace(/[+-]/g, ' $&');
        const matches = withoutX.match(/-?\d+\.?\d*/g);
        if (matches) {
            return matches.reduce((sum, val) => sum + parseFloat(val), 0);
        }
        return 0;
    } catch (e) {
        return 0;
    }
}

function generateNumericSteps(expr) {
    try {
        if (/[a-zA-Z]/.test(expr)) return null;
        const ops = ['^', { '/':'/', '*':'*' }, { '+':'+', '-':'-' }];
        const steps = [];
        let current = expr;
        steps.push(`<strong>Expresión original:</strong> ${current}`);
        let stepNum = 1;
        while (true) {
            current = current.replace(/\s/g, '');
            if (/^-?\d+\.?\d*$/.test(current)) break;

            let bestMatch = null;

            // 1) Resolver paréntesis primero (el más interno)
            const parenRe = /\(([^()]+)\)/;
            let parenM = current.match(parenRe);
            if (parenM) {
                let inner = parenM[1];
                let innerResult = inner;
                while (true) {
                    innerResult = innerResult.replace(/\s/g, '');
                    if (/^-?\d+\.?\d*$/.test(innerResult)) break;
                    let ibest = null;
                    for (let prec of ops) {
                        if (typeof prec === 'string') {
                            let m = innerResult.match(/(\d+\.?\d*)\s*\^\s*(\d+\.?\d*)/);
                            if (m) { ibest = { op: '^', a: parseFloat(m[1]), b: parseFloat(m[2]), idx: m.index, len: m[0].length }; break; }
                        } else {
                            for (let op of Object.keys(prec)) {
                                const escapedOp = op.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                                const re = new RegExp('(-?\\d+\\.?\\d*)\\s*' + escapedOp + '\\s*(-?\\d+\\.?\\d*)');
                                let m = innerResult.match(re);
                                if (m && (!ibest || m.index < ibest.idx)) {
                                    ibest = { op, a: parseFloat(m[1]), b: parseFloat(m[2]), idx: m.index, len: m[0].length };
                                }
                            }
                            if (ibest) break;
                        }
                    }
                    if (!ibest) break;
                    let r;
                    switch (ibest.op) {
                        case '^': r = Math.pow(ibest.a, ibest.b); break;
                        case '*': r = ibest.a * ibest.b; break;
                        case '/': r = ibest.a / ibest.b; break;
                        case '+': r = ibest.a + ibest.b; break;
                        case '-': r = ibest.a - ibest.b; break;
                    }
                    innerResult = innerResult.slice(0, ibest.idx) + formatNumber(r, 4) + innerResult.slice(ibest.idx + ibest.len);
                }
                steps.push(`<strong>Paso ${stepNum++}:</strong> Resolver (${inner}) = ${innerResult}`);
                current = current.slice(0, parenM.index) + innerResult + current.slice(parenM.index + parenM[0].length);
                steps.push(`<strong>→</strong> ${current}`);
                continue;
            }

            for (let prec of ops) {
                if (typeof prec === 'string') {
                    const re = /(\d+\.?\d*)\s*\^\s*(\d+\.?\d*)/;
                    let m = current.match(re);
                    if (m) { bestMatch = { op: '^', a: parseFloat(m[1]), b: parseFloat(m[2]), idx: m.index, len: m[0].length }; break; }
                } else {
                    for (let op of Object.keys(prec)) {
                        const escapedOp = op.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                        const re = new RegExp('(-?\\d+\\.?\\d*)\\s*' + escapedOp + '\\s*(-?\\d+\\.?\\d*)');
                        let m = current.match(re);
                        if (m && (!bestMatch || m.index < bestMatch.idx)) {
                            bestMatch = { op, a: parseFloat(m[1]), b: parseFloat(m[2]), idx: m.index, len: m[0].length };
                        }
                    }
                    if (bestMatch) break;
                }
            }
            if (!bestMatch) break;
            let result;
            switch (bestMatch.op) {
                case '^': result = Math.pow(bestMatch.a, bestMatch.b); break;
                case '*': result = bestMatch.a * bestMatch.b; break;
                case '/': result = bestMatch.a / bestMatch.b; break;
                case '+': result = bestMatch.a + bestMatch.b; break;
                case '-': result = bestMatch.a - bestMatch.b; break;
            }
            steps.push(`<strong>Paso ${stepNum++}:</strong> ${bestMatch.a} ${bestMatch.op} ${bestMatch.b} = ${formatNumber(result, 4)}`);
            current = current.slice(0, bestMatch.idx) + formatNumber(result, 4) + current.slice(bestMatch.idx + bestMatch.len);
            steps.push(`<strong>→</strong> ${current}`);
        }
        return steps;
    } catch (e) {
        return null;
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

function showGenPDFBtn() {}
function genClear() { genExpr = ''; genResult = '0'; genLastResult = null; document.getElementById('gen-expr').textContent = ''; document.getElementById('gen-result').textContent = '0'; const cv = document.getElementById('chart-canvas-general'); if (cv) cv.style.display = 'none'; document.getElementById('graph-controls').style.display = 'none'; }
function genBack() { genExpr = genExpr.slice(0, -1); document.getElementById('gen-expr').textContent = genExpr; }
function genNegate() { genKey('-'); }

// 2nd mode toggle
let is2nd = false;
function toggle2ndMode() {
    is2nd = !is2nd;
    document.getElementById('btn-2nd').classList.toggle('active', is2nd);
    document.querySelectorAll('.keypad [data-lbl]').forEach(btn => {
        if (is2nd && btn.dataset.lbl2) {
            btn.textContent = btn.dataset.lbl2;
        } else {
            btn.textContent = btn.dataset.lbl;
        }
    });
}
function pressKey(normal, alt) {
    if (is2nd && alt) {
        genKey(alt);
        is2nd = false;
        document.getElementById('btn-2nd').classList.remove('active');
        document.querySelectorAll('.keypad [data-lbl]').forEach(btn => {
            btn.textContent = btn.dataset.lbl;
        });
    } else {
        genKey(normal);
    }
}
// Ripple effect, locale decimal, backspace long-press
document.addEventListener('DOMContentLoaded', () => {
    // Ripple
    document.querySelector('.keypad')?.addEventListener('click', e => {
        const btn = e.target.closest('.key');
        if (!btn) return;
        const rect = btn.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'ripple-el';
        const d = Math.max(rect.width, rect.height) * 1.2;
        ripple.style.width = ripple.style.height = d + 'px';
        ripple.style.left = (e.clientX - rect.left - d / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - d / 2) + 'px';
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 500);
    });
    // Locale decimal
    const dec = document.getElementById('btn-decimal');
    if (dec && /^es/.test(navigator.language)) dec.textContent = ',';
    // Backspace long-press → genClear (onclick genBack se encarga del tap normal)
    const bs = document.getElementById('btn-backspace');
    if (bs) {
        let holdTimer = null;
        function startHold() { holdTimer = setTimeout(genClear, 600); }
        function endHold() { if (holdTimer) clearTimeout(holdTimer); holdTimer = null; }
        bs.addEventListener('mousedown', startHold);
        bs.addEventListener('mouseup', endHold);
        bs.addEventListener('mouseleave', endHold);
        bs.addEventListener('touchstart', startHold, {passive: true});
        bs.addEventListener('touchend', endHold);
        bs.addEventListener('touchcancel', endHold);
    }
});
// Evaluador matemático seguro (sin eval/Function)
function safeMathEval(expr, vars) {
    // Si es una expresión simple con variable x o y, evaluar directamente
    if (vars) {
        let prepared = expr;
        if (vars.x !== undefined && expr.includes('x')) {
            prepared = prepared.replace(/(\d|\))x/g, '$1*x').replace(/x(\d)/g, 'x*$1');
            prepared = prepared.replace(/x/g, '(' + vars.x + ')');
        }
        if (vars.y !== undefined && expr.includes('y')) {
            prepared = prepared.replace(/(\d|\))y/g, '$1*y').replace(/y(\d)/g, 'y*$1');
            prepared = prepared.replace(/y/g, '(' + vars.y + ')');
        }
        prepared = prepared.replace(/\^/g, '**');
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
            // Unary minus: si '-' está al inicio o después de operador/paréntesis
            if (char === '-' && (tokens.length === 0 || 
                (tokens[tokens.length-1].type === 'operator' && tokens[tokens.length-1].value !== ')') ||
                (tokens[tokens.length-1].type === 'postfix'))) {
                // Mirar si le sigue un número → token negativo
                let j = i + 1;
                while (j < len && /\s/.test(expr[j])) j++;
                if (j < len && /\d/.test(expr[j])) {
                    let num = '-';
                    i = j;
                    while (i < len && /[\d.]/.test(expr[i])) { num += expr[i]; i++; }
                    tokens.push({ type: 'number', value: parseFloat(num) });
                    continue;
                }
            }
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
    const funcs = ['sin', 'cos', 'tan', 'sqrt', 'log', 'ln', 'log2', 'cot', 'cbrt', 'abs'];
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
                case 'log2': res = Math.log2(a); break;
                case 'cot': res = 1 / Math.tan(angleMode === 'deg' ? a * Math.PI / 180 : a); break;
                case 'cbrt': res = Math.cbrt(a); break;
                case 'abs': res = Math.abs(a); break;
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
    const t = (n) => formatNumber(n, 4);
    
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







function parseQuadraticCoefs(expr) {
    let s = expr.replace(/\s+/g, '').replace(/π/g, 'pi');
    s = s.replace(/(\d)x/g, '$1*x').replace(/x\^2/g, 'x²').replace(/\*?\*?x²/g, 'x²');
    let a = 0, b = 0, c = 0;
    const termParts = s.match(/[+-]?[^+-]+/g) || [];
    for (let term of termParts) {
        let sign = 1;
        if (term.startsWith('-')) { sign = -1; term = term.slice(1); }
        else if (term.startsWith('+')) { term = term.slice(1); }
        if (/x\*?\^?\s*2|x²/.test(term)) {
            let coef = term.replace(/[\*]?x\^?\s*2|x²/, '');
            a = sign * (coef === '' || coef === '1' ? 1 : coef === '-' ? -1 : parseFloat(coef));
        } else if (/x/.test(term)) {
            let coef = term.replace(/\*?x/, '');
            b = sign * (coef === '' || coef === '1' ? 1 : coef === '-' ? -1 : parseFloat(coef));
        } else {
            let val = parseFloat(term);
            if (!isNaN(val)) c = sign * val;
        }
    }
    return { a, b, c };
}

function analyzeQuadratic(expr) {
    const { a, b, c } = parseQuadraticCoefs(expr);
    if (a === 0) return null;
    const steps = [];
    const nf = v => formatNumber(v, 4);
    const t = v => v < 0 ? `(${v})` : `${v}`;
    steps.push(`<strong>Función cuadrática: f(x) = ${expr}</strong>`);
    steps.push(`<strong>Paso 1:</strong> Identificar coeficientes`);
    steps.push(`a = ${nf(a)}, b = ${nf(b)}, c = ${nf(c)}`);
    const opensUp = a > 0;
    steps.push(`a = ${nf(a)} → <strong>${opensUp ? 'Abre hacia ARRIBA (∪)' : 'Abre hacia ABAJO (∩)'}</strong>`);
    if (opensUp) {
        steps.push(`El vértice es el <strong>punto mínimo</strong> de la parábola`);
    } else {
        steps.push(`El vértice es el <strong>punto máximo</strong> de la parábola`);
    }
    const h = -b / (2 * a);
    const k = safeMathEval(expr, { x: h });
    steps.push(`<strong>Paso 2:</strong> Calcular el vértice`);
    steps.push(`x_v = -b / (2a) = -(${nf(b)}) / (2·${nf(a)}) = ${nf(h)}`);
    steps.push(`y_v = f(x_v) = ${expr.replace(/x/g, t(h)).replace(/pi/g, 'π')}`);
    steps.push(`y_v = ${nf(k)}`);
    steps.push(`<strong>Vértice → (${nf(h)}, ${nf(k)})</strong>`);
    steps.push(`<strong>Paso 3:</strong> Intercepto con el eje Y`);
    steps.push(`f(0) = c = ${nf(c)} → <strong>(0, ${nf(c)})</strong>`);
    const disc = b * b - 4 * a * c;
    steps.push(`<strong>Paso 4:</strong> Calcular el discriminante`);
    steps.push(`Δ = b² - 4ac = ${nf(b)}² - 4·${nf(a)}·${nf(c)} = ${nf(disc)}`);
    if (disc > 0) {
        const x1 = (-b + Math.sqrt(disc)) / (2 * a);
        const x2 = (-b - Math.sqrt(disc)) / (2 * a);
        steps.push(`Δ > 0 → <strong>Dos raíces reales distintas</strong>`);
        steps.push(`x₁ = (-b + √Δ) / (2a) = (-(${nf(b)}) + √${nf(disc)}) / (2·${nf(a)}) = ${nf(x1)}`);
        steps.push(`x₂ = (-b - √Δ) / (2a) = (-(${nf(b)}) - √${nf(disc)}) / (2·${nf(a)}) = ${nf(x2)}`);
        steps.push(`<strong>Raíces → (${nf(x1)}, 0) y (${nf(x2)}, 0)</strong>`);
    } else if (disc === 0) {
        const x0 = -b / (2 * a);
        steps.push(`Δ = 0 → <strong>Una raíz real doble</strong>`);
        steps.push(`x₀ = -b / (2a) = ${nf(x0)}`);
        steps.push(`<strong>Raíz → (${nf(x0)}, 0)</strong>`);
    } else {
        steps.push(`Δ < 0 → <strong>No tiene raíces reales</strong>`);
        steps.push(`La parábola no cruza el eje X`);
    }
    steps.push(`<div style="padding:8px 10px;margin-top:6px;background:linear-gradient(135deg,rgba(79,252,124,0.12),rgba(79,156,249,0.12));border-left:3px solid var(--accent2);border-radius:0 6px 6px 0;font-size:14px;font-weight:700;color:var(--accent2)">`);
    steps.push(`Resumen → Vértice (${nf(h)}, ${nf(k)}) · ${opensUp ? 'Abre arriba' : 'Abre abajo'} · Δ = ${nf(disc)}`);
    steps.push(`</div>`);
    return { steps, h, k, a };
}



function genEval() {
    try {
        // Ocultar debug info de gráficos anteriores
        const dbg = document.getElementById('graph-debug');
        if (dbg) dbg.style.display = 'none';

        if (!genExpr) {
            return;
        }
        let expr = normalizeInput(genExpr).replace(/π/g, 'pi');

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
                addHistory('general', 'system', genResult || 'Sistema resuelto', genExpr, genExpr);
                genExpr = '';
                genLastResult = null;
                return;
            }
        }
        
        // Ecuación lineal con x e y (sin coma): 2x+y=5 → resolver y graficar y = f(x)
        if (expr.includes('=') && /x/.test(expr) && /y/.test(expr) && !expr.includes(',')) {
            const parts = expr.split('=');
            if (parts.length === 2) {
                const left = parts[0].trim(), right = parts[1].trim();
                // Si ya está despejada: y = mx + b
                if (/^y$/i.test(left) && /x/.test(right)) {
                    genPlotFunc(right);
                    const steps = document.getElementById('gen-steps') || createStepsPanel();
                    steps.innerHTML = '<details style="cursor:pointer"><summary style="color:var(--accent);font-weight:700;font-size:12px;padding:4px 0">Mostrar pasos</summary>' +
                        '<div class="step"><strong>Ecuación:</strong> ' + expr + '</div>' +
                        '<div class="step">Pendiente (m) y ordenada al origen (b) extraídas directamente.</div>' +
                        '<div class="step" style="color:var(--text3)">La gráfica muestra la recta correspondiente.</div></details>';
                    steps.classList.add('show');
                    genResult = `y = ${right}`;
                    document.getElementById('gen-result').textContent = 'y = ' + right;
                    document.getElementById('gen-expr').textContent = genExpr;
                    addHistory('general', 'linear2var', genResult, genExpr, genExpr);
                    genExpr = '';
                    genLastResult = null;
                    return;
                }
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
                    addHistory('general', 'linear2var', genResult, genExpr, genExpr);
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
                // Determinar resultado antes de generar pasos (independiente del panel)
                let resultText = 'Ecuación graficada';
                const eqParts = expr.split('=');
                if (eqParts.length === 2) {
                    const eqLeft = eqParts[0].trim();
                    const eqRight = eqParts[1].trim();
                    if (eqLeft.includes('x') && eqRight.includes('x')) {
                        const lc = extractCoefficient(eqLeft, 'x');
                        const rc = extractCoefficient(eqRight, 'x');
                        const lk = extractConstant(eqLeft);
                        const rk = extractConstant(eqRight);
                        const newCoef = lc - rc;
                        const newConst = rk - lk;
                        if (newCoef === 0 && newConst === 0) resultText = 'Infinitas soluciones';
                        else if (newCoef === 0) resultText = 'No tiene solución';
                        else resultText = 'x = ' + formatNumber(newConst / newCoef, 4);
                    } else if (eqLeft.includes('x') && !eqRight.includes('x')) {
                        const lc = extractCoefficient(eqLeft, 'x');
                        const lk = extractConstant(eqLeft);
                        if (lc !== 0) resultText = 'x = ' + formatNumber((parseFloat(eqRight) - lk) / lc, 4);
                    } else if (!eqLeft.includes('x') && eqRight.includes('x')) {
                        const rc = extractCoefficient(eqRight, 'x');
                        const rk = extractConstant(eqRight);
                        if (rc !== 0) resultText = 'x = ' + formatNumber((parseFloat(eqLeft) - rk) / rc, 4);
                    }
                }
                generateAlgebraicSteps(expr);
                const sp = document.getElementById('gen-steps') || createStepsPanel();
                if (sp) sp.classList.add('show');
                // Extraer pasos del DOM para guardar en historial/PDF
                let eqSteps = [];
                if (sp) {
                    try { eqSteps = Array.from(sp.querySelectorAll('.step')).map(d => d.innerHTML); } catch(e) {}
                }
                genResult = resultText;
                document.getElementById('gen-expr').textContent = genExpr;
                document.getElementById('gen-result').textContent = resultText;
                addHistory('general', 'eq', resultText, genExpr, genExpr, eqSteps);
                genExpr = '';
                genLastResult = null;
                return;
            }
            
            // Detectar y analizar funciones cuadráticas
            if (/x\^2|x²/.test(expr)) {
                const analysis = analyzeQuadratic(expr);
                if (analysis) {
                    const sp = document.getElementById('gen-steps') || createStepsPanel();
                    sp.innerHTML = '<details open style="cursor:pointer"><summary style="color:var(--accent);font-weight:700;font-size:12px;padding:4px 0">📐 Análisis de la parábola</summary>' +
                        analysis.steps.map(s => `<div class="step">${s}</div>`).join('') + '</details>';
                    sp.classList.add('show');
                    // Centrar gráfico en el vértice con rango Y que muestre toda la parábola
                    plotMinX = analysis.h - 6;
                    plotMaxX = analysis.h + 6;
                    // Calcular Y en los bordes del rango X para que la parábola se vea completa
                    const yEdge1 = safeMathEval(expr, { x: plotMinX });
                    const yEdge2 = safeMathEval(expr, { x: plotMaxX });
                    const yMinActual = Math.min(analysis.k, yEdge1, yEdge2);
                    const yMaxActual = Math.max(analysis.k, yEdge1, yEdge2);
                    const yRange = yMaxActual - yMinActual || 1;
                    plotMinY = yMinActual - yRange * 0.08;
                    plotMaxY = yMaxActual + yRange * 0.08;
                    genPlotFunc(expr, true);
                    genResult = `Vértice (${parseFloat(analysis.h.toFixed(3))}, ${parseFloat(analysis.k.toFixed(3))})`;
                    document.getElementById('gen-result').textContent = genResult;
                    document.getElementById('gen-expr').textContent = 'f(x) = ' + genExpr;
                    addHistory('general', 'quadratic', genResult, 'f(x) = ' + genExpr, genExpr);
                    showGenPDFBtn();
                    genExpr = '';
                    genLastResult = null;
                    return;
                }
            }
            
            genPlotFunc(expr);
            let r = safeMathEval(expr, { x: 0 });
            if (!isFinite(r)) throw new Error('Resultado infinito');
            genResult = 'f(x) graficada';
            document.getElementById('gen-result').textContent = genResult;
            document.getElementById('gen-expr').textContent = 'f(x) = ' + genExpr;
            addHistory('general', 'func', 'f(x) graficada', 'f(x) = ' + genExpr, genExpr);
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
        
        // Generar pasos para expresiones numéricas
        const numericSteps = generateNumericSteps(expr);
        if (numericSteps && numericSteps.length > 0) {
            const sp = document.getElementById('gen-steps') || createStepsPanel();
            sp.innerHTML = '<details style="cursor:pointer"><summary style="color:var(--accent);font-weight:700;font-size:12px;padding:4px 0">Mostrar pasos</summary>' +
                numericSteps.map(s => `<div class="step">${s}</div>`).join('') + '</details>';
            sp.classList.add('show');
        }
        
        addHistory('general', 'expr', genResult, genExpr, genExpr, numericSteps || []);
        showGenPDFBtn();

        // Ocultar canvas de función si estaba visible
        const canvas = document.getElementById('chart-canvas-general');
        if (canvas) canvas.style.display = 'none';

        genExpr = '';
    } catch (e) { 
        var errMsg = friendlyError((e && e.message) || String(e) || 'Error');
        document.getElementById('gen-result').textContent = 'Error'; 
        document.getElementById('gen-expr').textContent = errMsg; 
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

function showProUpgradeModal(feature, desc) {
    document.getElementById('up-feature-name').textContent = feature;
    document.getElementById('up-feature-desc').textContent = desc || 'Esta funcionalidad es exclusiva de PRO. Actualizá para acceder a todas las herramientas premium.';
    document.getElementById('pro-upgrade-overlay').classList.add('show');
}
function closeProUpgrade() {
    document.getElementById('pro-upgrade-overlay').classList.remove('show');
}
function openProFromUpgrade() {
    closeProUpgrade();
    toggleProModal(true);
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
    const chips = document.querySelectorAll(`#mode-${mod} .chip`);
    chips.forEach(c => c.classList.remove('active'));
    chips.forEach(c => {
        const onclick = c.getAttribute('onclick') || '';
        if (onclick.includes(`'${key}'`)) c.classList.add('active');
    });
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
    else {
        if (!LicenseManager.isPro && favs.length >= 3) {
            showProUpgradeModal('Más favoritos', 'Podés tener hasta 3 fórmulas favoritas. Actualizá a PRO para favoritos ilimitados.');
            return;
        }
        favs.push({ mod, key, title: title || key });
    }
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
        const upOverlay = document.getElementById('pro-upgrade-overlay');
        if (upOverlay && upOverlay.classList.contains('show')) { closeProUpgrade(); return; }
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

// ── Welcome Tour ──
const TourManager = {
    _steps: [
        {
            title: 'Bienvenido a SumaMente',
            text: 'Tu calculadora cientifica profesional. Mas de 340 formulas en 16 modulos especializados, con visualizaciones animadas.',
            center: true
        },
        {
            el: '.gen-display',
            title: 'Pantalla de Calculo',
            text: 'Ingresa tu expresion y presiona ↵ para obtener el resultado. Soporta seno, logaritmos, raices, potencias y mas.',
            place: 'bottom'
        },
        {
            el: '.keypad',
            title: 'Botonera 5×7',
            text: 'Funciones trigonometricas, logaritmos, constantes (pi, e) y operadores. Presiona 2nd para acceder a funciones secundarias.',
            place: 'top'
        },
        {
            el: '#btn-search',
            title: 'Busqueda Universal',
            text: 'Haz clic en la lupa para buscar entre las 340+ formulas al instante. Tambien muestra tus favoritos.',
            place: 'bottom',
            mobilePlace: 'bottom-screen'
        },
        {
            el: '.sidebar > .panel:first-child .panel-header',
            title: 'Base de Datos',
            text: 'Presiona aqui y se desplegara con todas las constantes de referencia del modulo activo.',
            place: 'left',
            action: () => { if (currentMode !== 'general') selectModule('general'); }
        },
        {
            el: '.sidebar > .panel:last-child .panel-header',
            title: 'Historial',
            text: 'Guarda automaticamente todos tus calculos anteriores. Puedes limpiarlo o exportarlo a PDF con la version PRO.',
            place: 'left',
            mobilePlace: 'top-screen'
        },
        {
            el: '.btn-menu',
            title: '16 Modulos Especializados',
            text: 'Electronica, Medicina, Finanzas, Quimica y mas. Cada modulo tiene 20 formulas con visualizaciones animadas.',
            place: 'bottom',
            action: () => {
                const db = document.getElementById('unified-db-panel');
                if (db && db.style.display === 'block') toggleDBPanel();
                selectModule('general');
            }
        },
        {
            title: 'Cada modulo tiene sus propias formulas',
            text: 'Al seleccionar un modulo aparecen sus formulas en forma de chips. El resultado se actualiza al instante con graficos y pasos de resolucion.',
            center: true,
            action: () => { if (typeof toggleModal === 'function') toggleModal(true); }
        },
        {
            el: '.mode-section.active .formula-chips',
            title: 'Formulas del Modulo',
            text: 'Este es el modulo de Electronica con 20 formulas. Cambia entre ellas y explora las visualizaciones animadas de cada una.',
            place: 'bottom',
            action: () => { if (typeof toggleModal === 'function') toggleModal(false); selectModule('electro'); }
        },
        {
            title: 'Listo para calcular',
            text: 'Todas las formulas y modulos son completamente gratis. Explora, calcula y guarda tus favoritos.',
            center: true
        }
    ],
    _idx: 0,
    _active: false,
    get _done() { return localStorage.getItem('SumaMente_tour') === 'done'; },
    start() {
        if (this._done || this._active) return;
        this._active = true;
        document.body.style.overflow = 'hidden';
        this._idx = 0;
        const r = document.createElement('div');
        r.id = 'tour-root';
        r.innerHTML = '<div class="tour-overlay"></div><div class="tour-highlight"></div><div class="tour-card"></div>';
        document.body.appendChild(r);
        this._overlay = r.querySelector('.tour-overlay');
        this._highlight = r.querySelector('.tour-highlight');
        this._card = r.querySelector('.tour-card');
        this._overlay.onclick = () => this.end();
        this._show();
    },
    end() {
        if (!this._active) return;
        this._active = false;
        document.body.style.overflow = '';
        if (typeof toggleModal === 'function') toggleModal(false);
        if (typeof toggleDBPanel === 'function') {
            const db = document.getElementById('unified-db-panel');
            if (db && db.style.display === 'block') toggleDBPanel();
        }
        if (currentMode !== 'general' && typeof selectModule === 'function') selectModule('general');
        localStorage.setItem('SumaMente_tour', 'done');
        const r = document.getElementById('tour-root');
        if (r) r.remove();
    },
    _show() {
        const s = this._steps[this._idx];
        if (s.action) s.action();
        const isCenter = s.center || !s.el || !document.querySelector(s.el);
        if (!isCenter) {
            const el = document.querySelector(s.el);
            if (el) {
                const r = el.getBoundingClientRect();
                this._highlight.style.display = 'block';
                const pad = 4;
                this._highlight.style.left = (r.left - pad) + 'px';
                this._highlight.style.top = (r.top - pad) + 'px';
                this._highlight.style.width = (r.width + pad * 2) + 'px';
                this._highlight.style.height = (r.height + pad * 2) + 'px';
                el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        } else {
            this._highlight.style.display = 'none';
        }
        const i = this._idx, n = this._steps.length;
        const dots = Array.from({ length: n }, (_, j) => `<span class="tour-dot${j === i ? ' active' : ''}"></span>`).join('');
        this._card.className = 'tour-card' + (isCenter ? ' tour-center' : '');
        this._card.innerHTML = `
            <div class="tour-header">
                <span class="tour-progress">${i + 1} / ${n}</span>
                <button class="tour-skip">Saltar</button>
            </div>
            <div class="tour-body">
                <h3 class="tour-title">${s.title}</h3>
                <p class="tour-text">${s.text}</p>
            </div>
            <div class="tour-dots">${dots}</div>
            <div class="tour-footer">
                ${i > 0 ? '<button class="tour-btn tour-prev">← Anterior</button>' : '<span></span>'}
                ${i < n - 1
                    ? '<button class="tour-btn tour-next">Siguiente →</button>'
                    : '<button class="tour-btn tour-done">¡Entendido!</button>'}
            </div>`;
        this._card.querySelector('.tour-skip').onclick = () => this.end();
        const nBtn = this._card.querySelector('.tour-next');
        if (nBtn) nBtn.onclick = () => { this._idx++; this._show(); };
        const pBtn = this._card.querySelector('.tour-prev');
        if (pBtn) pBtn.onclick = () => { this._idx--; this._show(); };
        const dBtn = this._card.querySelector('.tour-done');
        if (dBtn) dBtn.onclick = () => this.end();
        if (!isCenter) this._pos(window.innerWidth <= 640 ? (s.mobilePlace || s.place) : (s.place || 'bottom'));
        else { this._card.style.left = ''; this._card.style.top = ''; }
    },
    _pos(place) {
        const h = this._highlight.getBoundingClientRect();
        const c = this._card;
        c.style.left = 'auto'; c.style.top = 'auto';
        c.style.position = 'fixed';
        const cw = c.offsetWidth, ch = c.offsetHeight;
        const vw = window.innerWidth, vh = window.innerHeight;
        const gap = 16;
        let l, t;
        if (place === 'bottom-screen') { l = vw / 2 - cw / 2; t = vh - ch - 12; }
        else if (place === 'top-screen') { l = vw / 2 - cw / 2; t = 12; }
        else if (place === 'top') { l = h.left + h.width / 2 - cw / 2; t = h.top - ch - gap; }
        else if (place === 'left') { l = h.left - cw - gap; t = h.top + h.height / 2 - ch / 2; }
        else if (place === 'right') { l = h.right + gap; t = h.top + h.height / 2 - ch / 2; }
        else { l = h.left + h.width / 2 - cw / 2; t = h.bottom + gap; }
        if (place === 'top' && t + ch > h.top) { t = h.bottom + gap; }
        if (place === 'bottom' && t + ch > vh) { t = h.top - ch - gap; }
        if (place === 'left' && l + cw > h.left) { l = h.right + gap; }
        if (place === 'right' && l < 0) { l = h.left - cw - gap; }
        l = Math.max(12, Math.min(l, vw - cw - 12));
        t = Math.max(12, Math.min(t, vh - ch - 12));
        c.style.left = l + 'px';
        c.style.top = t + 'px';
    }
};
document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && TourManager._active) TourManager.end();
});
window.addEventListener('resize', () => {
    if (TourManager._active) TourManager._show();
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

    renderUnifiedDB('general');
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

    // Welcome tour on first visit
    setTimeout(() => TourManager.start(), 800);

    // Easter egg: tocar 5 veces la versión → resetea tour
    let _tapCount = 0, _tapTimer;
    const vTap = document.getElementById('version-tap');
    if (vTap) vTap.addEventListener('click', () => {
        _tapCount++;
        if (_tapTimer) clearTimeout(_tapTimer);
        if (_tapCount >= 5) {
            _tapCount = 0;
            localStorage.removeItem('SumaMente_tour');
            window.location.reload();
        } else {
            _tapTimer = setTimeout(() => { _tapCount = 0; }, 1500);
        }
    });
});