// ── Plotting state ──
let plotMinX = -10, plotMaxX = 10;
let plotMinY = -10, plotMaxY = 10;
let plotDragging = false;
let plotLastX = 0, plotLastY = 0;
let currentPlotExpr = '';
let currentPlotType = ''; // 'function' | 'equation' | 'system'

function setDebugInfo(msg) {
    var el = document.getElementById('graph-debug');
    if (!el) {
        el = document.createElement('div');
        el.id = 'graph-debug';
        el.style.cssText = 'font-size:10px;color:#ff6b6b;background:var(--surface);border:1px solid #ff6b6b;border-radius:6px;padding:6px 10px;margin-top:6px;white-space:pre-wrap;word-break:break-all;font-family:monospace';
        var canvas = document.getElementById('chart-canvas-general');
        if (canvas && canvas.parentElement) canvas.parentElement.appendChild(el);
    }
    el.textContent = msg;
    el.style.display = 'block';
}

function genPlotFunc(expr, preserveView) {
    const canvas = document.getElementById('chart-canvas-general');
    if (!canvas) {
        return;
    }
    const ctx = canvas.getContext('2d');
    var pw = (canvas.parentElement && canvas.parentElement.clientWidth) || window.innerWidth || 320;
    const w = Math.max(pw - 28, 200);
    const h = 250;
    const dpr = window.devicePixelRatio || 1;
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
        } catch(e) { points.push({ x, y: null }); if (i === 0) setDebugInfo('Error en x=' + x + ': ' + (e.message || e)); }
    }
    
    // Ajustar rango Y basado en los puntos (con recorte de outliers)
    const allY = points.filter(p => p.y !== null).map(p => p.y);
    if (preserveView) {
        minY = plotMinY;
        maxY = plotMaxY;
    } else if (allY.length > 0) {
        const sorted = [...allY].sort((a, b) => a - b);
        const t0 = Math.floor(sorted.length * 0.02);
        const t1 = Math.ceil(sorted.length * 0.98);
        minY = sorted[t0];
        maxY = sorted[t1 - 1];
        const range = maxY - minY || 1;
        minY -= range * 0.12;
        maxY += range * 0.12;
        plotMinY = minY;
        plotMaxY = maxY;
    }
    
    canvas.style.display = 'block';
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
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
    ctx.beginPath();
    let started = false;
    for (const p of points) {
        if (p.y === null) { started = false; continue; }
        const cx = toCanvasX(p.x), cy = toCanvasY(p.y);
        if (!started) { ctx.moveTo(cx, cy); started = true; }
        else ctx.lineTo(cx, cy);
    }
    ctx.stroke();
    
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
        redrawCurrentPlot(true);
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
        redrawCurrentPlot(true);
    };
    
    canvas.onmouseup = () => {
        plotDragging = false;
        canvas.style.cursor = 'default';
    };
    
    canvas.onmouseleave = () => {
        plotDragging = false;
        canvas.style.cursor = 'default';
    };
    
    // Touch support for mobile (merged single-finger pan + two-finger pinch)
    let lastPinchDist = 0;
    let touchPanning = false;
    canvas.ontouchstart = (e) => {
        if (e.touches.length === 1) {
            touchPanning = true;
            plotDragging = true;
            plotLastX = e.touches[0].clientX;
            plotLastY = e.touches[0].clientY;
        } else if (e.touches.length === 2) {
            touchPanning = false;
            lastPinchDist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
        }
    };
    
    canvas.ontouchmove = (e) => {
        if (e.touches.length === 1 && touchPanning) {
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
            
            redrawCurrentPlot(true);
        } else if (e.touches.length === 2) {
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
                
                redrawCurrentPlot(true);
            }
            
            lastPinchDist = dist;
        }
    };
    
    canvas.ontouchend = () => {
        plotDragging = false;
        touchPanning = false;
        lastPinchDist = 0;
    };
}

function redrawCurrentPlot(preserveView) {
    if (currentPlotType === 'equation') {
        genPlotEquation(currentPlotExpr, preserveView);
    } else if (currentPlotType === 'system') {
        const eqs = currentPlotExpr.split(',').map(s => s.trim());
        if (eqs.length === 2) genPlotSystem2x2(eqs[0], eqs[1], preserveView);
    } else if (currentPlotType === 'inequality') {
        const ineqMatch = currentPlotExpr.match(/(>=|<=|>|<)/);
        if (ineqMatch) genPlotInequality(currentPlotExpr, ineqMatch[1], preserveView);
    } else if (currentPlotType === 'parametric') {
        const parts = currentPlotExpr.split(',').map(s => s.trim());
        if (parts.length === 2) {
            const xE = parts[0].replace(/^x\s*=\s*/, '').trim();
            const yE = parts[1].replace(/^y\s*=\s*/, '').trim();
            if (xE && yE) genPlotParametric(xE, yE, preserveView);
        }
    } else {
        genPlotFunc(currentPlotExpr, preserveView);
    }
}

function genPlotSystem2x2(eq1, eq2, preserveView) {
    const p1 = parseLinearEq(eq1);
    const p2 = parseLinearEq(eq2);
    if (!p1 || !p2) return;
    
    const canvas = document.getElementById('chart-canvas-general');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    var pw = (canvas.parentElement && canvas.parentElement.clientWidth) || window.innerWidth || 320;
    const w = Math.max(pw - 28, 200);
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
    
    // Handle vertical lines (b=0): x = c/a, swap x<->y roles
    const genVerticalPoints = (p) => {
        const pts = [];
        const vx = p.c / p.a;
        if (!isFinite(vx)) return pts;
        const yRange = plotMaxY - plotMinY || 1;
        for (let i = 0; i <= steps; i++) {
            const y = plotMinY + yRange * i / steps;
            pts.push({ x: vx, y });
        }
        return pts;
    };
    if (p1.b === 0 && p1.a !== 0) {
        points1.length = 0;
        points1.push(...genVerticalPoints(p1));
    }
    if (p2.b === 0 && p2.a !== 0) {
        points2.length = 0;
        points2.push(...genVerticalPoints(p2));
    }
    
    if (!preserveView) {
        const allY = [...points1, ...points2].filter(p => isFinite(p.y)).map(p => p.y);
        if (allY.length > 0) {
            let minY = Math.min(...allY), maxY = Math.max(...allY);
            const range = maxY - minY || 1;
            minY -= range * 0.1; maxY += range * 0.1;
            plotMinY = minY; plotMaxY = maxY;
        }
    }
    
    var dpr = window.devicePixelRatio || 1;
    canvas.style.display = 'block';
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
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

function genPlotEquation(equation, preserveView) {
    // Separar la ecuación en izquierda y derecha
    const parts = equation.split('=');
    if (parts.length !== 2) {
        return;
    }
    
    const leftExpr = parts[0].trim();
    const rightExpr = parts[1].trim();
    
    // Wrap negative-only expressions so safeMathEval's tokenizer doesn't choke on unary minus
    const wrap = (s) => /^-\d+(\.\d+)?$/.test(s) ? '(' + s + ')' : s;
    const leftWrapped = wrap(leftExpr);
    const rightWrapped = wrap(rightExpr);
    
    const canvas = document.getElementById('chart-canvas-general');
    if (!canvas) {
        return;
    }
    
    const ctx = canvas.getContext('2d');
    var pw = (canvas.parentElement && canvas.parentElement.clientWidth) || window.innerWidth || 320;
    const w = Math.max(pw - 28, 200);
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
            const y1 = safeMathEval(leftWrapped, { x });
            const y2 = safeMathEval(rightWrapped, { x });
            if (isFinite(y1)) leftPoints.push({ x, y: y1 });
            else leftPoints.push({ x, y: null });
            if (isFinite(y2)) rightPoints.push({ x, y: y2 });
            else rightPoints.push({ x, y: null });
        } catch(e) {
            leftPoints.push({ x, y: null });
            rightPoints.push({ x, y: null });
            if (i === 0) setDebugInfo('Error eq x=' + x + ': ' + (e.message || e));
        }
    }
    
    // Ajustar rango Y basado en todos los puntos (con recorte de outliers)
    if (!preserveView) {
        const allY = [...leftPoints, ...rightPoints].filter(p => p.y !== null).map(p => p.y);
        if (allY.length > 0) {
            if (allY.length > 10) {
                const sorted = [...allY].sort((a, b) => a - b);
                const trimStart = Math.floor(sorted.length * 0.05);
                const trimEnd = Math.ceil(sorted.length * 0.95);
                minY = sorted[trimStart];
                maxY = sorted[trimEnd - 1];
            } else {
                minY = Math.min(...allY);
                maxY = Math.max(...allY);
            }
            const range = maxY - minY || 1;
            minY -= range * 0.1;
            maxY += range * 0.1;
        }
    }
    
    var dpr = window.devicePixelRatio || 1;
    canvas.style.display = 'block';
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
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
    ctx.beginPath();
    started = false;
    for (const p of rightPoints) {
        if (p.y === null) { started = false; continue; }
        const cx = toCanvasX(p.x), cy = toCanvasY(p.y);
        if (!started) { ctx.moveTo(cx, cy); started = true; }
        else ctx.lineTo(cx, cy);
    }
    ctx.stroke();
    
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
                const denom = (p2.y - p1.y) - (q2.y - q1.y);
                if (Math.abs(denom) < 1e-12) continue;
                const t = (q1.y - p1.y) / denom;
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
        
        // Círculo
        ctx.fillStyle = '#4ff97b';
        ctx.beginPath();
        ctx.arc(cx, cy, 8, 0, Math.PI * 2);
        ctx.fill();
        
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

function genPlotInequality(equation, op, preserveView) {
    // Desigualdad: graficar LHS y RHS como curvas, sombrear región
    const parts = equation.split(op === '<=' ? '<=' : op === '>=' ? '>=' : op);
    if (parts.length !== 2) return;
    const leftExpr = parts[0].trim();
    const rightExpr = parts[1].trim();
    const canvas = document.getElementById('chart-canvas-general');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    var pw = (canvas.parentElement && canvas.parentElement.clientWidth) || window.innerWidth || 320;
    const w = Math.max(pw - 28, 200);
    const h = 250;
    const margin = 40;
    const plotW = w - margin * 2;
    const plotH = h - margin * 2;
    let minX = plotMinX, maxX = plotMaxX;
    let minY = plotMinY, maxY = plotMaxY;
    const steps = 400;
    const leftPoints = [];
    const rightPoints = [];
    for (let i = 0; i <= steps; i++) {
        const x = parseFloat((minX + (maxX - minX) * i / steps).toPrecision(10));
        try {
            const y1 = safeMathEval(leftExpr, { x });
            const y2 = safeMathEval(rightExpr, { x });
            leftPoints.push({ x, y: isFinite(y1) ? y1 : null });
            rightPoints.push({ x, y: isFinite(y2) ? y2 : null });
        } catch(e) {
            leftPoints.push({ x, y: null });
            rightPoints.push({ x, y: null });
        }
    }
    // Auto Y range
    if (!preserveView) {
        const allY = [...leftPoints, ...rightPoints].filter(p => p.y !== null).map(p => p.y);
        if (allY.length > 0) {
            if (allY.length > 10) {
                const sorted = [...allY].sort((a, b) => a - b);
                minY = sorted[Math.floor(sorted.length * 0.02)];
                maxY = sorted[Math.ceil(sorted.length * 0.98) - 1];
            } else {
                minY = Math.min(...allY);
                maxY = Math.max(...allY);
            }
            const range = maxY - minY || 1;
            minY -= range * 0.12;
            maxY += range * 0.12;
        }
    }
    var dpr = window.devicePixelRatio || 1;
    canvas.style.display = 'block';
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);
    const toCanvasX = (x) => margin + (x - minX) / (maxX - minX) * plotW;
    const toCanvasY = (y) => margin + (maxY - y) / (maxY - minY) * plotH;
    
    // Background
    ctx.fillStyle = 'rgba(30, 32, 40, 0.8)';
    ctx.fillRect(0, 0, w, h);
    
    // Grid
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
    
    // Axes
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
    
    // Shade inequality region
    const diffPoints = [];
    for (let i = 0; i <= steps; i++) {
        const pt = leftPoints[i];
        if (pt.y !== null && rightPoints[i].y !== null) {
            const diff = pt.y - rightPoints[i].y;
            const satisfies = op === '>' ? diff > 0 : op === '<' ? diff < 0 : op === '>=' ? diff >= 0 : diff <= 0;
            diffPoints.push({ x: pt.x, diff, satisfies, y1: pt.y, y2: rightPoints[i].y });
        } else {
            diffPoints.push({ x: leftPoints[i] ? leftPoints[i].x : pt.x, diff: null, satisfies: false, y1: null, y2: null });
        }
    }
    
    // Find satisfies segments and shade them
    let shading = false;
    let segStart = 0;
    ctx.fillStyle = 'rgba(79, 156, 249, 0.15)';
    ctx.strokeStyle = 'rgba(79, 156, 249, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i < diffPoints.length; i++) {
        if (diffPoints[i].satisfies && !shading) {
            shading = true;
            segStart = i;
        } else if (!diffPoints[i].satisfies && shading) {
            shading = false;
            // Shade segment segStart to i
            ctx.beginPath();
            ctx.moveTo(toCanvasX(diffPoints[segStart].x), toCanvasY(diffPoints[segStart].y1));
            for (let j = segStart; j <= i; j++) {
                ctx.lineTo(toCanvasX(diffPoints[j].x), toCanvasY(diffPoints[j].y1));
            }
            for (let j = i; j >= segStart; j--) {
                ctx.lineTo(toCanvasX(diffPoints[j].x), toCanvasY(diffPoints[j].y2));
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
    }
    if (shading) {
        ctx.beginPath();
        ctx.moveTo(toCanvasX(diffPoints[segStart].x), toCanvasY(diffPoints[segStart].y1));
        for (let j = segStart; j < diffPoints.length; j++) {
            ctx.lineTo(toCanvasX(diffPoints[j].x), toCanvasY(diffPoints[j].y1));
        }
        for (let j = diffPoints.length - 1; j >= segStart; j--) {
            ctx.lineTo(toCanvasX(diffPoints[j].x), toCanvasY(diffPoints[j].y2));
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
    
    // Draw LHS curve (solid)
    ctx.strokeStyle = '#4f9cf9';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    let started = false;
    for (let i = 0; i < leftPoints.length; i++) {
        const p = leftPoints[i];
        if (p.y === null) { started = false; continue; }
        const cx = toCanvasX(p.x), cy = toCanvasY(p.y);
        if (!started) { ctx.moveTo(cx, cy); started = true; }
        else ctx.lineTo(cx, cy);
    }
    ctx.stroke();
    
    // Draw RHS curve (dashed)
    ctx.strokeStyle = '#f97b4f';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    started = false;
    for (let i = 0; i < rightPoints.length; i++) {
        const p = rightPoints[i];
        if (p.y === null) { started = false; continue; }
        const cx = toCanvasX(p.x), cy = toCanvasY(p.y);
        if (!started) { ctx.moveTo(cx, cy); started = true; }
        else ctx.lineTo(cx, cy);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Legend
    ctx.font = '11px monospace';
    ctx.fillStyle = '#4f9cf9';
    ctx.textAlign = 'left';
    ctx.fillText(leftExpr, margin + 5, margin + 16);
    ctx.fillStyle = '#f97b4f';
    ctx.fillText(rightExpr, margin + 5, margin + 32);
    ctx.fillStyle = 'rgba(79, 156, 249, 0.3)';
    ctx.fillText('Región: ' + op, margin + 5, margin + 48);
    
    currentPlotType = 'inequality';
    currentPlotExpr = equation;
    document.getElementById('graph-controls').style.display = 'flex';
    setupCanvasInteractivity(canvas, equation);
}

function genPlotParametric(xExpr, yExpr, preserveView) {
    // Curva paramétrica: x = f(t), y = g(t) para t ∈ [-10, 10]
    const canvas = document.getElementById('chart-canvas-general');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    var pw = (canvas.parentElement && canvas.parentElement.clientWidth) || window.innerWidth || 320;
    const w = Math.max(pw - 28, 200);
    const h = 250;
    const margin = 40;
    const plotW = w - margin * 2;
    const plotH = h - margin * 2;
    let minX = plotMinX, maxX = plotMaxX;
    let minY = plotMinY, maxY = plotMaxY;
    const steps = 400;
    const tMin = -10, tMax = 10;
    const points = [];
    const evalT = (expr, t) => {
        try { return safeMathEval(expr, { t }); } catch(e) { return NaN; }
    };
    for (let i = 0; i <= steps; i++) {
        const t = tMin + (tMax - tMin) * i / steps;
        const x = evalT(xExpr, t);
        const y = evalT(yExpr, t);
        if (isFinite(x) && isFinite(y)) points.push({ x, y, t });
    }
    // Auto range
    if (!preserveView && points.length > 0) {
        const xs = points.map(p => p.x), ys = points.map(p => p.y);
        if (points.length > 10) {
            const sx = [...xs].sort((a, b) => a - b), sy = [...ys].sort((a, b) => a - b);
            minX = sx[Math.floor(sx.length * 0.02)];
            maxX = sx[Math.ceil(sx.length * 0.98) - 1];
            minY = sy[Math.floor(sy.length * 0.02)];
            maxY = sy[Math.ceil(sy.length * 0.98) - 1];
        } else {
            minX = Math.min(...xs); maxX = Math.max(...xs);
            minY = Math.min(...ys); maxY = Math.max(...ys);
        }
        const rx = maxX - minX || 1, ry = maxY - minY || 1;
        minX -= rx * 0.1; maxX += rx * 0.1;
        minY -= ry * 0.1; maxY += ry * 0.1;
    }
    var dpr = window.devicePixelRatio || 1;
    canvas.style.display = 'block';
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);
    const toCanvasX = (x) => margin + (x - minX) / (maxX - minX) * plotW;
    const toCanvasY = (y) => margin + (maxY - y) / (maxY - minY) * plotH;
    
    // Background
    ctx.fillStyle = 'rgba(30, 32, 40, 0.8)';
    ctx.fillRect(0, 0, w, h);
    
    // Grid
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
    
    // Axes
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
    
    // Draw parametric curve with gradient color
    ctx.lineWidth = 2.5;
    for (let i = 1; i < points.length; i++) {
        const p1 = points[i - 1], p2 = points[i];
        const t = p1.t;
        // Color gradient from blue (start) to orange (end)
        const frac = (t - tMin) / (tMax - tMin);
        const r = Math.round(79 + (249 - 79) * frac);
        const g = Math.round(156 + (123 - 156) * frac);
        const b = Math.round(249 + (79 - 249) * frac);
        ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.beginPath();
        ctx.moveTo(toCanvasX(p1.x), toCanvasY(p1.y));
        ctx.lineTo(toCanvasX(p2.x), toCanvasY(p2.y));
        ctx.stroke();
    }
    
    // Draw arrow at endpoint
    if (points.length > 1) {
        const last = points[points.length - 1];
        const prev = points[points.length - 2];
        const lx = toCanvasX(last.x), ly = toCanvasY(last.y);
        const angle = Math.atan2(ly - toCanvasY(prev.y), lx - toCanvasX(prev.x));
        ctx.fillStyle = '#f97b4f';
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(lx - 10 * Math.cos(angle - 0.4), ly - 10 * Math.sin(angle - 0.4));
        ctx.lineTo(lx - 10 * Math.cos(angle + 0.4), ly - 10 * Math.sin(angle + 0.4));
        ctx.closePath();
        ctx.fill();
    }
    
    // Legend
    ctx.font = '11px monospace';
    const first = points.length > 0 ? points[Math.floor(points.length * 0.25)] : null;
    ctx.fillStyle = '#4f9cf9';
    ctx.textAlign = 'left';
    ctx.fillText('x(t) = ' + xExpr, margin + 5, margin + 16);
    ctx.fillText('y(t) = ' + yExpr, margin + 5, margin + 32);
    if (first) {
        ctx.fillStyle = '#aaa';
        ctx.fillText('t₀ = ' + formatNumber(first.t, 2) + ' → (' + formatNumber(first.x, 2) + ', ' + formatNumber(first.y, 2) + ')', margin + 5, margin + 48);
    }
    
    currentPlotType = 'parametric';
    currentPlotExpr = xExpr + ', ' + yExpr;
    document.getElementById('graph-controls').style.display = 'flex';
    setupCanvasInteractivity(canvas, xExpr + ', ' + yExpr);
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
        if (currentPlotType === 'inequality') {
            const ineqMatch = expr.match(/(>=|<=|>|<)/);
            if (ineqMatch) genPlotInequality(expr, ineqMatch[1]);
        } else if (currentPlotType === 'parametric') {
            const parts = expr.split(',').map(s => s.trim());
            if (parts.length === 2) {
                const xE = parts[0].replace(/^x\s*=\s*/, '').trim();
                const yE = parts[1].replace(/^y\s*=\s*/, '').trim();
                if (xE && yE) genPlotParametric(xE, yE);
            }
        } else if (expr.includes(',') && expr.includes('=')) {
            const eqs = expr.split(',').map(s => s.trim());
            if (eqs.length === 2) genPlotSystem2x2(eqs[0], eqs[1]);
        } else if (expr.includes('=')) {
            genPlotEquation(expr);
        } else if (expr.includes('x')) {
            genPlotFunc(expr);
        }
    }
}
