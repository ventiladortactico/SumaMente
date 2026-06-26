const AlgebraVisual = {
    initCanvas(canvas) {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        const w = rect.width || canvas.clientWidth || 300;
        const h = rect.height || canvas.clientHeight || 150;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        const ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        return { ctx, w, h };
    },

    _grid(ctx, w, h, pad) {
        const plotW = w - 2 * pad, plotH = h - 2 * pad;
        ctx.strokeStyle = 'rgba(79, 156, 249, 0.08)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 6; i++) {
            let x = pad + i * plotW / 6;
            ctx.beginPath(); ctx.moveTo(x, pad); ctx.lineTo(x, pad + plotH); ctx.stroke();
            let y = pad + i * plotH / 6;
            ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(pad + plotW, y); ctx.stroke();
        }
    },

    _axes(ctx, w, h, pad, sx, sy) {
        const plotW = w - 2 * pad, plotH = h - 2 * pad;
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        let x0 = sx(0), y0 = sy(0);
        if (x0 >= pad && x0 <= pad + plotW) {
            ctx.beginPath(); ctx.moveTo(x0, pad); ctx.lineTo(x0, pad + plotH); ctx.stroke();
        }
        if (y0 >= pad && y0 <= pad + plotH) {
            ctx.beginPath(); ctx.moveTo(pad, y0); ctx.lineTo(pad + plotW, y0); ctx.stroke();
        }
    },

    parabola(canvas, a, b, c) {
        const { ctx, w, h } = this.initCanvas(canvas);
        const pad = 25, plotW = w - 2 * pad, plotH = h - 2 * pad;
        const vertexX = -b / (2 * a);
        const vertexY = a * vertexX * vertexX + b * vertexX + c;
        const range = Math.max(Math.abs(vertexX) + 3, 3);
        const xMin = vertexX - range, xMax = vertexX + range;
        let yMin = Infinity, yMax = -Infinity;
        const pts = [];
        for (let i = 0; i <= 200; i++) {
            let x = xMin + (xMax - xMin) * i / 200;
            let y = a * x * x + b * x + c;
            pts.push({ x, y });
            if (y < yMin) yMin = y;
            if (y > yMax) yMax = y;
        }
        let yPad = (yMax - yMin) * 0.15 || 1;
        yMin -= yPad; yMax += yPad;
        const sx = (x) => pad + (x - xMin) / (xMax - xMin) * plotW;
        const sy = (y) => pad + plotH - (y - yMin) / (yMax - yMin) * plotH;
        ctx.clearRect(0, 0, w, h);
        this._grid(ctx, w, h, pad);
        this._axes(ctx, w, h, pad, sx, sy);
        ctx.beginPath();
        ctx.moveTo(sx(pts[0].x), sy(0));
        for (let p of pts) ctx.lineTo(sx(p.x), sy(p.y));
        ctx.lineTo(sx(pts[pts.length - 1].x), sy(0));
        ctx.closePath();
        ctx.fillStyle = 'rgba(232, 184, 56, 0.12)';
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(sx(pts[0].x), sy(pts[0].y));
        for (let p of pts) ctx.lineTo(sx(p.x), sy(p.y));
        ctx.strokeStyle = '#e8b838';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(sx(vertexX), sy(vertexY), 4, 0, Math.PI * 2);
        ctx.fillStyle = '#e8b838';
        ctx.fill();
    },

    linea(canvas, m, b, xPoint) {
        const { ctx, w, h } = this.initCanvas(canvas);
        const pad = 25, plotW = w - 2 * pad, plotH = h - 2 * pad;
        let xMin, xMax;
        if (xPoint !== undefined) { xMin = xPoint - 4; xMax = xPoint + 4; }
        else { xMin = -5; xMax = 5; }
        if (xMin >= xMax) { xMin = -5; xMax = 5; }
        let yMin = m * xMin + b, yMax = m * xMax + b;
        if (yMin > yMax) [yMin, yMax] = [yMax, yMin];
        let yPad = (yMax - yMin) * 0.2 || 1;
        yMin -= yPad; yMax += yPad;
        const sx = (x) => pad + (x - xMin) / (xMax - xMin) * plotW;
        const sy = (y) => pad + plotH - (y - yMin) / (yMax - yMin) * plotH;
        ctx.clearRect(0, 0, w, h);
        this._grid(ctx, w, h, pad);
        this._axes(ctx, w, h, pad, sx, sy);
        ctx.beginPath();
        ctx.moveTo(sx(xMin), sy(m * xMin + b));
        ctx.lineTo(sx(xMax), sy(m * xMax + b));
        ctx.strokeStyle = '#e8b838';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        if (xPoint !== undefined) {
            let yPt = m * xPoint + b;
            ctx.beginPath();
            ctx.arc(sx(xPoint), sy(yPt), 4, 0, Math.PI * 2);
            ctx.fillStyle = '#e8b838';
            ctx.fill();
        }
    },

    sistema2x2(canvas, a1, b1, c1, a2, b2, c2, xSol, ySol) {
        const { ctx, w, h } = this.initCanvas(canvas);
        const pad = 25, plotW = w - 2 * pad, plotH = h - 2 * pad;
        const xMin = -10, xMax = 10;
        const y1 = (x) => b1 !== 0 ? (c1 - a1 * x) / b1 : 0;
        const y2 = (x) => b2 !== 0 ? (c2 - a2 * x) / b2 : 0;
        let allY = [];
        for (let i = 0; i <= 100; i++) {
            let x = xMin + (xMax - xMin) * i / 100;
            let ya = b1 !== 0 ? y1(x) : 0;
            let yb = b2 !== 0 ? y2(x) : 0;
            allY.push(ya, yb);
        }
        if (ySol !== undefined) allY.push(ySol);
        let yMin = Math.min(...allY), yMax = Math.max(...allY);
        if (yMin === yMax) { yMin -= 1; yMax += 1; }
        let yPad = (yMax - yMin) * 0.15 || 1;
        yMin -= yPad; yMax += yPad;
        const sx = (x) => pad + (x - xMin) / (xMax - xMin) * plotW;
        const sy = (y) => pad + plotH - (y - yMin) / (yMax - yMin) * plotH;
        ctx.clearRect(0, 0, w, h);
        this._grid(ctx, w, h, pad);
        this._axes(ctx, w, h, pad, sx, sy);
        const drawLine = (fn, color) => {
            ctx.beginPath();
            ctx.moveTo(sx(xMin), sy(fn(xMin)));
            for (let i = 1; i <= 100; i++) {
                let x = xMin + (xMax - xMin) * i / 100;
                ctx.lineTo(sx(x), sy(fn(x)));
            }
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.stroke();
        };
        if (b1 !== 0) drawLine(y1, '#e8b838');
        else { ctx.fillStyle = '#e8b838'; ctx.fillRect(sx(c1 / a1) - 1, pad, 2, plotH); }
        if (b2 !== 0) drawLine(y2, '#38e8c8');
        else { ctx.fillStyle = '#38e8c8'; ctx.fillRect(sx(c2 / a2) - 1, pad, 2, plotH); }
        if (xSol !== undefined && ySol !== undefined) {
            ctx.beginPath();
            ctx.arc(sx(xSol), sy(ySol), 5, 0, Math.PI * 2);
            ctx.fillStyle = '#f9f54f';
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    },

    numberLine(canvas, d) {
        const { ctx, w, h } = this.initCanvas(canvas);
        const pad = 25, plotW = w - 2 * pad;
        const mid = h / 2;
        ctx.clearRect(0, 0, w, h);
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pad, mid);
        ctx.lineTo(pad + plotW, mid);
        ctx.stroke();
        let range = Math.max(Math.abs(d) + 1, 5);
        let xMin = -range, xMax = range;
        const sx = (x) => pad + (x - xMin) / (xMax - xMin) * plotW;
        let tickStep = Math.pow(10, Math.floor(Math.log10(range)));
        if (range / tickStep > 5) tickStep *= 2;
        for (let x = Math.ceil(xMin / tickStep) * tickStep; x <= xMax; x += tickStep) {
            let px = sx(x);
            ctx.strokeStyle = 'rgba(255,255,255,0.15)';
            ctx.beginPath();
            ctx.moveTo(px, mid - 4);
            ctx.lineTo(px, mid + 4);
            ctx.stroke();
            if (Math.abs(x) > 0.01) {
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.font = '9px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(x.toString(), px, mid + 16);
            }
        }
        let x0 = sx(0);
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath();
        ctx.moveTo(x0, mid - 6);
        ctx.lineTo(x0, mid + 6);
        ctx.stroke();
        ctx.fillStyle = '#0a0b0e';
        ctx.fillText('0', x0, mid + 16);
        if (!isNaN(d)) {
            let pd = sx(d);
            ctx.beginPath();
            ctx.arc(pd, mid, 6, 0, Math.PI * 2);
            ctx.fillStyle = d >= 0 ? '#4ff97b' : '#f94f4f';
            ctx.fill();
            ctx.fillStyle = '#e8edf5';
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('\u0394 = ' + d.toFixed(2), pd, mid - 16);
        }
    },

    progresionPuntos(canvas, a1, d, n) {
        const { ctx, w, h } = this.initCanvas(canvas);
        const pad = 25, plotW = w - 2 * pad, plotH = h - 2 * pad;
        const pts = [];
        for (let i = 1; i <= n; i++) pts.push({ x: i, y: a1 + (i - 1) * d });
        let yMin = Math.min(...pts.map(p => p.y)), yMax = Math.max(...pts.map(p => p.y));
        let yPad = (yMax - yMin) * 0.2 || 1;
        yMin -= yPad; yMax += yPad;
        const sx = (x) => pad + (x - 1) / (Math.max(n - 1, 1)) * plotW;
        const sy = (y) => pad + plotH - (y - yMin) / (yMax - yMin) * plotH;
        ctx.clearRect(0, 0, w, h);
        this._grid(ctx, w, h, pad);
        ctx.beginPath();
        ctx.moveTo(sx(pts[0].x), sy(0));
        for (let p of pts) ctx.lineTo(sx(p.x), sy(p.y));
        ctx.lineTo(sx(pts[pts.length - 1].x), sy(0));
        ctx.closePath();
        ctx.fillStyle = 'rgba(232, 184, 56, 0.1)';
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(sx(pts[0].x), sy(pts[0].y));
        for (let p of pts) ctx.lineTo(sx(p.x), sy(p.y));
        ctx.strokeStyle = 'rgba(232, 184, 56, 0.4)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
        for (let p of pts) {
            ctx.beginPath();
            ctx.arc(sx(p.x), sy(p.y), 4, 0, Math.PI * 2);
            ctx.fillStyle = '#e8b838';
            ctx.fill();
        }
    },

    progresionGeoCurva(canvas, a1, r, n) {
        const { ctx, w, h } = this.initCanvas(canvas);
        const pad = 25, plotW = w - 2 * pad, plotH = h - 2 * pad;
        const pts = [];
        for (let i = 1; i <= n; i++) pts.push({ x: i, y: a1 * Math.pow(r, i - 1) });
        let yMin = Math.min(...pts.map(p => p.y)), yMax = Math.max(...pts.map(p => p.y));
        if (yMin === yMax) { yMin -= 1; yMax += 1; }
        let yPad = (yMax - yMin) * 0.15 || 1;
        yMin -= yPad; yMax += yPad;
        const sx = (x) => pad + (x - 1) / (Math.max(n - 1, 1)) * plotW;
        const sy = (y) => pad + plotH - (y - yMin) / (yMax - yMin) * plotH;
        ctx.clearRect(0, 0, w, h);
        this._grid(ctx, w, h, pad);
        ctx.beginPath();
        ctx.moveTo(sx(pts[0].x), sy(0));
        for (let p of pts) ctx.lineTo(sx(p.x), sy(p.y));
        ctx.lineTo(sx(pts[pts.length - 1].x), sy(0));
        ctx.closePath();
        ctx.fillStyle = 'rgba(56, 232, 200, 0.1)';
        ctx.fill();
        for (let p of pts) {
            ctx.beginPath();
            ctx.arc(sx(p.x), sy(p.y), 4, 0, Math.PI * 2);
            ctx.fillStyle = '#38e8c8';
            ctx.fill();
        }
    },

    barrasFactorial(canvas, n) {
        const { ctx, w, h } = this.initCanvas(canvas);
        const pad = 25, plotW = w - 2 * pad, plotH = h - 2 * pad;
        const vals = [];
        let r = 1;
        for (let i = 0; i <= n; i++) { if (i > 0) r *= i; vals.push(r); }
        let yMax = Math.max(...vals) * 1.15;
        if (yMax === 0) yMax = 1;
        const barW = plotW / (n + 1) * 0.6;
        const gap = plotW / (n + 1) * 0.4;
        const sx = (i) => pad + i * (plotW / (n + 1));
        const sy = (v) => pad + plotH - (v / yMax) * plotH;
        ctx.clearRect(0, 0, w, h);
        for (let i = 0; i <= n; i++) {
            let x = sx(i) + gap / 2;
            let bh = sy(vals[i]) - pad + plotH - sy(vals[i]);
            ctx.fillStyle = i === n ? '#e8b838' : 'rgba(232, 184, 56, 0.35)';
            ctx.fillRect(x, sy(vals[i]), barW, bh);
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.font = '8px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(i + '!', x + barW / 2, h - 4);
        }
    },

    logCurva(canvas, b, xVal) {
        const { ctx, w, h } = this.initCanvas(canvas);
        const pad = 25, plotW = w - 2 * pad, plotH = h - 2 * pad;
        const xMin = 0.01, xMax = Math.max(xVal + 1, 10);
        let pts = [];
        for (let i = 0; i <= 200; i++) {
            let x = xMin + (xMax - xMin) * i / 200;
            let y = Math.log(x) / Math.log(b);
            if (isFinite(y)) pts.push({ x, y });
        }
        let yMin = Math.min(...pts.map(p => p.y)), yMax = Math.max(...pts.map(p => p.y));
        if (yMin === yMax) { yMin -= 1; yMax += 1; }
        let yPad = (yMax - yMin) * 0.15 || 0.5;
        yMin -= yPad; yMax += yPad;
        const sx = (x) => pad + (x - xMin) / (xMax - xMin) * plotW;
        const sy = (y) => pad + plotH - (y - yMin) / (yMax - yMin) * plotH;
        ctx.clearRect(0, 0, w, h);
        this._grid(ctx, w, h, pad);
        this._axes(ctx, w, h, pad, sx, sy);
        ctx.beginPath();
        ctx.moveTo(sx(pts[0].x), sy(pts[0].y));
        for (let p of pts) ctx.lineTo(sx(p.x), sy(p.y));
        ctx.strokeStyle = '#e8b838';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        let yPt = Math.log(xVal) / Math.log(b);
        ctx.beginPath();
        ctx.arc(sx(xVal), sy(yPt), 4, 0, Math.PI * 2);
        ctx.fillStyle = '#f94f4f';
        ctx.fill();
    },

    segmento(canvas, x1, y1, x2, y2) {
        const { ctx, w, h } = this.initCanvas(canvas);
        const pad = 25, plotW = w - 2 * pad, plotH = h - 2 * pad;
        let xMin = Math.min(x1, x2), xMax = Math.max(x1, x2);
        let yMin = Math.min(y1, y2), yMax = Math.max(y1, y2);
        let dx = (xMax - xMin) * 0.3 || 1, dy = (yMax - yMin) * 0.3 || 1;
        xMin -= dx; xMax += dx; yMin -= dy; yMax += dy;
        const sx = (x) => pad + (x - xMin) / (xMax - xMin) * plotW;
        const sy = (y) => pad + plotH - (y - yMin) / (yMax - yMin) * plotH;
        ctx.clearRect(0, 0, w, h);
        this._grid(ctx, w, h, pad);
        this._axes(ctx, w, h, pad, sx, sy);
        ctx.beginPath();
        ctx.moveTo(sx(x1), sy(y1));
        ctx.lineTo(sx(x2), sy(y2));
        ctx.strokeStyle = '#e8b838';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        for (let pt of [[x1, y1], [x2, y2]]) {
            ctx.beginPath();
            ctx.arc(sx(pt[0]), sy(pt[1]), 4, 0, Math.PI * 2);
            ctx.fillStyle = '#e8b838';
            ctx.fill();
        }
    },

    puntoMedio(canvas, x1, y1, x2, y2, xm, ym) {
        const { ctx, w, h } = this.initCanvas(canvas);
        const pad = 25, plotW = w - 2 * pad, plotH = h - 2 * pad;
        let xs = [x1, x2, xm], ys = [y1, y2, ym];
        let xMin = Math.min(...xs), xMax = Math.max(...xs);
        let yMin = Math.min(...ys), yMax = Math.max(...ys);
        let dx = (xMax - xMin) * 0.3 || 1, dy = (yMax - yMin) * 0.3 || 1;
        xMin -= dx; xMax += dx; yMin -= dy; yMax += dy;
        const sx = (x) => pad + (x - xMin) / (xMax - xMin) * plotW;
        const sy = (y) => pad + plotH - (y - yMin) / (yMax - yMin) * plotH;
        ctx.clearRect(0, 0, w, h);
        this._grid(ctx, w, h, pad);
        this._axes(ctx, w, h, pad, sx, sy);
        ctx.beginPath();
        ctx.moveTo(sx(x1), sy(y1));
        ctx.lineTo(sx(x2), sy(y2));
        ctx.strokeStyle = 'rgba(232, 184, 56, 0.3)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
        for (let pt of [[x1, y1, '#e8b838'], [x2, y2, '#e8b838'], [xm, ym, '#f94f4f']]) {
            ctx.beginPath();
            ctx.arc(sx(pt[0]), sy(pt[1]), 4, 0, Math.PI * 2);
            ctx.fillStyle = pt[2];
            ctx.fill();
        }
    },

    valorAbsoluto(canvas, xPoint) {
        const { ctx, w, h } = this.initCanvas(canvas);
        const pad = 25, plotW = w - 2 * pad, plotH = h - 2 * pad;
        const xMin = -Math.max(Math.abs(xPoint) + 2, 4);
        const xMax = Math.max(Math.abs(xPoint) + 2, 4);
        const yMax = Math.max(Math.abs(xPoint) + 1, 4);
        const yMin = -0.5;
        const sx = (x) => pad + (x - xMin) / (xMax - xMin) * plotW;
        const sy = (y) => pad + plotH - (y - yMin) / (yMax - yMin) * plotH;
        ctx.clearRect(0, 0, w, h);
        this._grid(ctx, w, h, pad);
        this._axes(ctx, w, h, pad, sx, sy);
        ctx.beginPath();
        ctx.moveTo(sx(xMin), sy(Math.abs(xMin)));
        for (let i = 1; i <= 200; i++) {
            let x = xMin + (xMax - xMin) * i / 200;
            ctx.lineTo(sx(x), sy(Math.abs(x)));
        }
        ctx.strokeStyle = '#e8b838';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(sx(xPoint), sy(Math.abs(xPoint)), 4, 0, Math.PI * 2);
        ctx.fillStyle = '#f94f4f';
        ctx.fill();
    },

    binomioCuadrado(canvas, a, b) {
        const { ctx, w, h } = this.initCanvas(canvas);
        const pad = 15;
        ctx.clearRect(0, 0, w, h);
        let total = a + b;
        let scale = Math.min((w - 2 * pad) / total, (h - 2 * pad) / total, 20);
        let ox = pad + ((w - 2 * pad) - total * scale) / 2;
        let oy = pad + ((h - 2 * pad) - total * scale) / 2;
        let aS = a * scale, bS = b * scale;
        ctx.fillStyle = 'rgba(232, 184, 56, 0.25)';
        ctx.fillRect(ox, oy, aS, aS);
        ctx.fillStyle = 'rgba(232, 184, 56, 0.45)';
        ctx.fillRect(ox + aS, oy, bS, aS);
        ctx.fillRect(ox, oy + aS, aS, bS);
        ctx.fillStyle = 'rgba(56, 232, 200, 0.35)';
        ctx.fillRect(ox + aS, oy + aS, bS, bS);
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(ox, oy, aS, aS);
        ctx.strokeRect(ox + aS, oy, bS, aS);
        ctx.strokeRect(ox, oy + aS, aS, bS);
        ctx.strokeRect(ox + aS, oy + aS, bS, bS);
        ctx.strokeStyle = '#e8b838';
        ctx.lineWidth = 2;
        ctx.strokeRect(ox, oy, total * scale, total * scale);
        ctx.fillStyle = '#e8edf5';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('a\u00b2', ox + aS / 2, oy + aS / 2 + 3);
        ctx.fillText('ab', ox + aS + bS / 2, oy + aS / 2 + 3);
        ctx.fillText('ab', ox + aS / 2, oy + aS + bS / 2 + 3);
        ctx.fillText('b\u00b2', ox + aS + bS / 2, oy + aS + bS / 2 + 3);
        ctx.fillStyle = '#8a97b0';
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(a.toString(), ox + aS / 2, h - 2);
        ctx.fillText(b.toString(), ox + aS + bS / 2, h - 2);
        ctx.fillText(a.toString(), 2, oy + aS / 2 + 3);
        ctx.fillText(b.toString(), 2, oy + aS + bS / 2 + 3);
    },

    sumatoriaBarras(canvas, a1, an, n) {
        const { ctx, w, h } = this.initCanvas(canvas);
        const pad = 25, plotW = w - 2 * pad, plotH = h - 2 * pad;
        const d = n > 1 ? (an - a1) / (n - 1) : 0;
        const pts = [];
        for (let i = 0; i < n; i++) pts.push(a1 + i * d);
        let yMax = Math.max(...pts) * 1.15;
        if (yMax === 0) yMax = 1;
        let yMin = Math.min(0, Math.min(...pts) * 1.1);
        const barW = plotW / n * 0.6;
        const gap = plotW / n * 0.4;
        const sx = (i) => pad + i * (plotW / n);
        const sy = (v) => pad + plotH - (v - yMin) / (yMax - yMin) * plotH;
        ctx.clearRect(0, 0, w, h);
        for (let i = 0; i < n; i++) {
            let x = sx(i) + gap / 2;
            let barH = Math.abs(sy(pts[i]) - sy(0));
            let yy = pts[i] >= 0 ? sy(pts[i]) : sy(0);
            ctx.fillStyle = i === 0 || i === n - 1 ? '#e8b838' : 'rgba(232, 184, 56, 0.3)';
            ctx.fillRect(x, yy, barW, barH);
        }
    }
};
