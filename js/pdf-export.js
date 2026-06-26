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

    const v = themeVars || {};
    const bg = v['--bg'] || '#0a0b0e';
    const border = v['--border'] || '#2a3040';
    const accent = v['--accent'] || '#4f9cf9';
    const text2 = v['--text2'] || '#8a97b0';
    const text3 = v['--text3'] || '#4a5570';

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

    let axes = '';
    if (minY <= 0 && maxY >= 0) {
        const cy = toY(0).toFixed(1);
        axes += `<line x1="${margin}" y1="${cy}" x2="${margin + plotW}" y2="${cy}" stroke="${text2}" stroke-width="2"/>`;
    }
    if (minX <= 0 && maxX >= 0) {
        const cx = toX(0).toFixed(1);
        axes += `<line x1="${cx}" y1="${margin}" x2="${cx}" y2="${margin + plotH}" stroke="${text2}" stroke-width="2"/>`;
    }

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

function getCanvasImage(module) {
    const canvas = document.getElementById('chart-canvas-' + module);
    if (!canvas) return null;
    void canvas.offsetHeight;
    if (canvas.width > 0 && canvas.height > 0) {
        try {
            return canvas.toDataURL('image/png');
        } catch (e) {
            return null;
        }
    }
    if (window._lastChartRender && window._lastChartRender[module]) {
        try {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            const w = (rect.width || canvas.clientWidth || 300) * dpr;
            const h = (rect.height || canvas.clientHeight || 150) * dpr;
            if (w > 0 && h > 0) {
                canvas.width = w;
                canvas.height = h;
                window._lastChartRender[module](canvas);
                return canvas.toDataURL('image/png');
            }
        } catch (e) {}
    }
    return null;
}

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
