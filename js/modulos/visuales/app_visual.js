// ── Plotting state ──
let plotMinX = -10, plotMaxX = 10;
let plotMinY = -10, plotMaxY = 10;
let plotDragging = false;
let plotLastX = 0, plotLastY = 0;
let currentPlotExpr = '';
let currentPlotType = ''; // 'function' | 'equation' | 'system'

function genPlotFunc(expr, preserveView) {
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
    
    // Ajustar rango Y basado en todos los puntos (con recorte de outliers)
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
