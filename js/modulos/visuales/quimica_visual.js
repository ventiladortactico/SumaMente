window.QuimicaVisual = window.QuimicaVisual || {
    loops: {},

    initCanvas: function(canvas) {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        const cssW = rect.width || canvas.clientWidth || 300;
        const cssH = rect.height || canvas.clientHeight || 150;
        canvas.width = cssW * dpr;
        canvas.height = cssH * dpr;
        const ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        return ctx;
    },

    startLoop: function(canvasId, frameCallback) {
        if (this.loops[canvasId]) cancelAnimationFrame(this.loops[canvasId]);
        const run = () => {
            frameCallback();
            this.loops[canvasId] = requestAnimationFrame(run);
        };
        this.loops[canvasId] = requestAnimationFrame(run);
    },

    // 1. MOLARIDAD — Vaso con disolución, ondas y partículas de soluto
    molaridad: function(canvas, masa, volumen, molaridad, PM, compuesto) {
        if (!canvas.id) canvas.id = 'canvas_quim_molar';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);
            const time = Date.now() * 0.001;
            const cx = w / 2, cy = h / 2 + 10;
            const vw = 70, vh = 80;
            const fillPct = Math.min(0.9, Math.max(0.15, volumen / 1000));
            const fillH = vh * fillPct;

            ctx.fillStyle = `rgba(56, 189, 248, ${Math.min(0.8, 0.2 + molaridad * 0.15)})`;
            ctx.beginPath();
            ctx.moveTo(cx - vw / 2, cy + vh / 2);
            for (let x = cx - vw / 2; x <= cx + vw / 2; x++) {
                ctx.lineTo(x, cy + vh / 2 - fillH + Math.sin(x * 0.1 + time * 4) * 2);
            }
            ctx.lineTo(cx + vw / 2, cy + vh / 2);
            ctx.closePath(); ctx.fill();

            if (molaridad > 0) {
                ctx.fillStyle = '#60a5fa';
                const n = Math.min(60, Math.round(molaridad * 15));
                for (let i = 0; i < n; i++) {
                    let px = cx - vw / 2 + 5 + (Math.abs(Math.sin(i * 99))) * (vw - 10);
                    let py = cy + vh / 2 - fillH + 10 + (Math.abs(Math.cos(i * 45))) * (fillH - 15) + Math.sin(time * 2 + i) * 4;
                    if (py > cy + vh / 2 - fillH && py < cy + vh / 2) {
                        ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI * 2); ctx.fill();
                    }
                }
            }

            ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(cx - vw / 2 - 4, cy - vh / 2);
            ctx.lineTo(cx - vw / 2, cy - vh / 2);
            ctx.lineTo(cx - vw / 2, cy + vh / 2);
            ctx.lineTo(cx + vw / 2, cy + vh / 2);
            ctx.lineTo(cx + vw / 2, cy - vh / 2);
            ctx.stroke();

            ctx.strokeStyle = 'rgba(148,163,184,0.4)'; ctx.lineWidth = 1;
            for (let hv = 0.2; hv < 0.9; hv += 0.2) {
                let ly = cy + vh / 2 - vh * hv;
                ctx.beginPath(); ctx.moveTo(cx + vw / 2 - 10, ly); ctx.lineTo(cx + vw / 2, ly); ctx.stroke();
            }

            ctx.fillStyle = '#64748b'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
            ctx.fillText(`${compuesto}: ${molaridad.toFixed(2)} M`, cx, cy - vh / 2 - 12);
            ctx.fillText(`${volumen.toFixed(0)} mL`, cx + vw / 2 + 28, cy + vh / 2 - fillH + 4);
        });
    },

    // 2. pH — Escala cromática con indicador deslizante
    ph: function(canvas, ph) {
        if (!canvas.id) canvas.id = 'canvas_quim_ph';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);
            const pad = 25, bW = w - 2 * pad, bH = 14, cy = h / 2 - 5;

            let color = '#7c3aed';
            if (ph < 3) color = '#ef4444';
            else if (ph < 7) color = '#f59e0b';
            else if (ph === 7) color = '#10b981';
            else if (ph < 11) color = '#3b82f6';

            const grad = ctx.createLinearGradient(pad, 0, pad + bW, 0);
            grad.addColorStop(0, '#ef4444');
            grad.addColorStop(0.5, '#10b981');
            grad.addColorStop(1, '#6d28d9');
            ctx.fillStyle = grad;
            ctx.fillRect(pad, cy, bW, bH);

            ctx.fillStyle = '#64748b'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
            for (let i = 0; i <= 14; i += 2) {
                let mx = pad + (i / 14) * bW;
                ctx.fillText(i.toString(), mx, cy + bH + 12);
                ctx.strokeStyle = 'rgba(148,163,184,0.3)';
                ctx.beginPath(); ctx.moveTo(mx, cy); ctx.lineTo(mx, cy + bH); ctx.stroke();
            }

            let tx = pad + (ph / 14) * bW;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(tx, cy - 2);
            ctx.lineTo(tx - 6, cy - 9);
            ctx.lineTo(tx + 6, cy - 9);
            ctx.closePath(); ctx.fill();

            ctx.fillStyle = color; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
            let estado = ph < 7 ? 'ÁCIDO' : ph > 7 ? 'ALCALINO' : 'NEUTRO';
            ctx.fillText(`pH ${ph.toFixed(2)} [${estado}]`, w / 2, cy - 14);
        });
    },

    // 3. DILUCIÓN — Dos matraces con transferencia de volumen
    dilucion: function(canvas, c1, v1, c2, v2) {
        if (!canvas.id) canvas.id = 'canvas_quim_dilucion';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);
            const time = Date.now() * 0.001;
            const yf = h - 25;

            const m1x = w * 0.28;
            ctx.fillStyle = `rgba(185, 28, 28, ${Math.min(0.8, 0.3 + c1 * 0.1)})`;
            ctx.beginPath();
            ctx.moveTo(m1x - 20, yf); ctx.lineTo(m1x + 20, yf);
            ctx.lineTo(m1x + 8, yf - 30); ctx.lineTo(m1x - 8, yf - 30);
            ctx.closePath(); ctx.fill();

            ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(m1x - 22, yf + 1); ctx.lineTo(m1x + 22, yf + 1);
            ctx.lineTo(m1x + 7, yf - 32); ctx.lineTo(m1x + 7, yf - 45);
            ctx.lineTo(m1x - 7, yf - 45); ctx.lineTo(m1x - 7, yf - 32);
            ctx.closePath(); ctx.stroke();

            const m2x = w * 0.72;
            ctx.fillStyle = `rgba(185, 28, 28, ${Math.min(0.5, 0.1 + c2 * 0.08)})`;
            let h2 = 35;
            ctx.beginPath();
            ctx.moveTo(m2x - 28, yf); ctx.lineTo(m2x + 28, yf);
            ctx.lineTo(m2x + 10, yf - h2);
            ctx.lineTo(m2x - 10, yf - h2 + Math.sin(time * 5) * 1.5);
            ctx.closePath(); ctx.fill();

            ctx.beginPath();
            ctx.moveTo(m2x - 30, yf + 1); ctx.lineTo(m2x + 30, yf + 1);
            ctx.lineTo(m2x + 9, yf - 42); ctx.lineTo(m2x + 9, yf - 60);
            ctx.lineTo(m2x - 9, yf - 60); ctx.lineTo(m2x - 9, yf - 42);
            ctx.closePath(); ctx.stroke();

            if (v1 > 0 && v2 > v1) {
                ctx.strokeStyle = 'rgba(185,28,28,0.6)'; ctx.lineWidth = 1.5; ctx.setLineDash([3, 3]);
                ctx.beginPath();
                ctx.moveTo(m1x + 5, yf - 40);
                ctx.bezierCurveTo(w / 2, yf - 75, w / 2, yf - 75, m2x - 2, yf - 55);
                ctx.stroke(); ctx.setLineDash([]);
            }

            ctx.fillStyle = '#475569'; ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center';
            ctx.fillText('CONCENTRADA', m1x, yf + 12);
            ctx.fillText(`${c1.toFixed(2)}M / ${v1.toFixed(0)}mL`, m1x, yf + 22);
            ctx.fillText('DILUIDA', m2x, yf + 12);
            ctx.fillText(`${c2.toFixed(2)}M / ${v2.toFixed(0)}mL`, m2x, yf + 22);
        });
    },

    // 4. MOLES — Esferas moleculares animadas (Estequiometría / Masa ↔ Moles)
    moles: function(canvas, moles, masa, PM) {
        if (!canvas.id) canvas.id = 'canvas_quim_moles';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);
            const time = Date.now() * 0.001;

            const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.5);
            grad.addColorStop(0, 'rgba(250,200,100,0.15)');
            grad.addColorStop(1, 'rgba(100,150,255,0.05)');
            ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);

            const n = Math.min(24, Math.max(4, Math.round(moles * 10)));
            for (let i = 0; i < n; i++) {
                const col = 6, row = Math.ceil(n / col);
                const sepX = (w - 40) / col, sepY = (h - 60) / row;
                const ix = i % col, iy = Math.floor(i / col);
                const px = 20 + ix * sepX + sepX / 2 + Math.sin(time + i * 1.7) * 4;
                const py = 30 + iy * sepY + sepY / 2 + Math.cos(time * 0.8 + i * 2.3) * 3;
                const r = 5 + Math.sin(time * 0.5 + i) * 1;

                ctx.fillStyle = i % 3 === 0 ? '#4f9cf9' : i % 3 === 1 ? '#f9c74f' : '#4fffa0';
                ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
                ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 0.5; ctx.stroke();
            }

            ctx.fillStyle = '#e8edf5'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
            ctx.fillText(`${moles.toFixed(4)} mol = ${masa.toFixed(2)} g`, w / 2, 15);
            ctx.fillStyle = '#94a3b8'; ctx.font = '9px monospace';
            ctx.fillText(`PM: ${PM.toFixed(2)} g/mol`, w / 2, h - 8);
        });
    },

    // 5. NORMALIDAD — Vaso con iones cargados (N = M × eq)
    normalidad: function(canvas, norm, molaridad, eq) {
        if (!canvas.id) canvas.id = 'canvas_quim_normalidad';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);
            const time = Date.now() * 0.001;

            const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.5);
            grad.addColorStop(0, 'rgba(80,255,170,0.12)');
            grad.addColorStop(1, 'rgba(100,150,255,0.05)');
            ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);

            const bx = w / 2 - 40, by = 30, bw = 80, bh = h - 70;
            ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2.5;
            ctx.strokeRect(bx, by, bw, bh);

            ctx.fillStyle = `rgba(56,189,248,${Math.min(0.4, 0.08 + norm * 0.03)})`;
            ctx.fillRect(bx + 1, by + 1, bw - 2, bh - 2);

            const n = Math.min(16, Math.max(6, Math.round(norm * 4)));
            for (let i = 0; i < n; i++) {
                const px = bx + 8 + (Math.abs(Math.sin(i * 53)) * (bw - 16));
                const py = by + 8 + (Math.abs(Math.cos(i * 37)) * (bh - 16)) + Math.sin(time * 1.5 + i * 2) * 5;
                ctx.fillStyle = '#4fffa0';
                ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#0f172a'; ctx.font = '7px monospace'; ctx.textAlign = 'center';
                ctx.fillText(i % 2 === 0 ? '+' : '−', px, py + 2.5);
            }

            ctx.fillStyle = '#e8edf5'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
            ctx.fillText(`N = ${norm.toFixed(3)} N`, w / 2, 15);
            ctx.fillStyle = '#94a3b8'; ctx.font = '9px monospace';
            ctx.fillText(`M = ${molaridad.toFixed(3)} M  |  eq = ${eq}`, w / 2, h - 8);
        });
    },

    // 6. GAS IDEAL — Recipiente con partículas en movimiento (PV = nRT)
    gasIdeal: function(canvas, P, V, n, T) {
        if (!canvas.id) canvas.id = 'canvas_quim_gas';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);
            const time = Date.now() * 0.001;

            const grad = ctx.createLinearGradient(0, 0, 0, h);
            grad.addColorStop(0, 'rgba(100,150,255,0.1)');
            grad.addColorStop(1, 'rgba(255,150,100,0.06)');
            ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);

            const px = w * 0.22, py = h * 0.18, pw = w * 0.56, ph = h * 0.58;
            ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2.5;
            ctx.strokeRect(px, py, pw, ph);

            const vel = Math.sqrt(T / 298) * (P / 1) * 1.5;
            const nParticles = Math.min(40, Math.max(8, Math.round(n * 12 + P * 3)));
            const particlePositions = [];
            for (let i = 0; i < nParticles; i++) {
                const seed = i * 7.3;
                const bx = px + 8 + (Math.abs(Math.sin(seed)) * (pw - 16));
                const by = py + 8 + (Math.abs(Math.cos(seed * 1.3)) * (ph - 16));
                const dx = Math.sin(seed * 2.1 + time * vel * 0.5) * 6;
                const dy = Math.cos(seed * 1.7 + time * vel * 0.5) * 6;
                const cx = Math.max(px + 8, Math.min(px + pw - 8, bx + dx));
                const cy = Math.max(py + 8, Math.min(py + ph - 8, by + dy));
                const size = 3 + Math.min(1, P * 0.2);
                ctx.fillStyle = i % 2 === 0 ? '#60a5fa' : '#f9c74f';
                ctx.beginPath(); ctx.arc(cx, cy, size, 0, Math.PI * 2); ctx.fill();
            }

            ctx.fillStyle = '#e8edf5'; ctx.font = '9px monospace'; ctx.textAlign = 'left';
            ctx.fillText(`P: ${P.toFixed(2)} ${P > 10 ? 'kPa' : 'atm'}`, 10, 16);
            ctx.fillText(`V: ${V.toFixed(2)} L`, 10, 30);
            ctx.fillText(`n: ${n.toFixed(4)} mol`, 10, 44);
            ctx.fillText(`T: ${(T - 273.15).toFixed(1)} °C`, 10, 58);
        });
    },

    // 7. CONCENTRACIÓN % — Probetas con color variable según %
    porcentaje: function(canvas, tipo, valor, masaSoluto, volSolucion) {
        if (!canvas.id) canvas.id = 'canvas_quim_pct';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);
            const time = Date.now() * 0.002;

            const cx = w / 2, by = 35, bw = 50, bh = h - 70;
            const fill = Math.min(0.9, Math.max(0.05, valor / 50));

            ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2.5;
            ctx.strokeRect(cx - bw / 2, by, bw, bh);

            const intensidad = Math.min(1, valor / 30);
            ctx.fillStyle = `rgb(${Math.floor(50 + 180 * intensidad)}, ${Math.floor(120 + (1 - intensidad) * 80)}, ${Math.floor(200 - 150 * intensidad)})`;
            ctx.beginPath();
            ctx.moveTo(cx - bw / 2 + 1, by + bh - 1);
            for (let x = cx - bw / 2 + 1; x <= cx + bw / 2 - 1; x++) {
                ctx.lineTo(x, by + bh - fill * bh + Math.sin(x * 0.15 + time * 3) * 1.5);
            }
            ctx.lineTo(cx + bw / 2 - 1, by + bh - 1);
            ctx.closePath(); ctx.fill();

            ctx.fillStyle = '#64748b'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
            ctx.fillText(`${tipo}`, cx, by - 6);
            ctx.fillStyle = '#e8edf5'; ctx.font = 'bold 11px monospace';
            ctx.fillText(`${valor.toFixed(2)}%`, cx, by + bh + 16);
            ctx.fillStyle = '#94a3b8'; ctx.font = '8px monospace';
            ctx.fillText(`${masaSoluto.toFixed(2)}g / ${volSolucion.toFixed(0)}mL`, cx, by + bh + 30);
        });
    },

    // 8. CALORIMETRÍA — Vaso con termómetro, partículas se agitan con T
    calor: function(canvas, Q, m, c, deltaT) {
        if (!canvas.id) canvas.id = 'canvas_quim_calor';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);
            const time = Date.now() * 0.002;
            const exotermico = deltaT > 0;

            const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.6);
            grad.addColorStop(0, exotermico ? 'rgba(255,80,20,0.2)' : 'rgba(20,80,255,0.15)');
            grad.addColorStop(1, 'rgba(10,15,30,0.3)');
            ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);

            // Vaso
            const bx = w / 2 - 35, by = 30, bw = 70, bh = h - 70;
            ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2.5;
            ctx.strokeRect(bx, by, bw, bh);

            // Líquido con color según temperatura
            const tempColor = exotermico
                ? `rgba(255,${Math.floor(80 - deltaT * 5)},0,${Math.min(0.6, 0.15 + Math.abs(deltaT) * 0.02)})`
                : `rgba(0,${Math.floor(100 + deltaT * 5)},255,${Math.min(0.6, 0.15 + Math.abs(deltaT) * 0.02)})`;
            const liqH = bh * 0.7;
            ctx.fillStyle = tempColor;
            ctx.beginPath();
            ctx.moveTo(bx + 1, by + bh - 1);
            for (let x = bx + 1; x <= bx + bw - 1; x++) {
                ctx.lineTo(x, by + bh - liqH + Math.sin(x * 0.12 + time * (4 + Math.abs(deltaT))) * 2);
            }
            ctx.lineTo(bx + bw - 1, by + bh - 1);
            ctx.closePath(); ctx.fill();

            // Partículas agitándose más con temperatura
            const n = Math.min(20, Math.max(4, Math.round(4 + Math.abs(deltaT) * 2)));
            const agitacion = Math.abs(deltaT) * 0.8 + 1;
            for (let i = 0; i < n; i++) {
                const px = bx + 6 + (Math.abs(Math.sin(i * 73))) * (bw - 12);
                const py = by + bh - liqH + 5 + (Math.abs(Math.cos(i * 51))) * (liqH - 10);
                const dx = Math.sin(time * agitacion + i * 1.3) * (3 + Math.abs(deltaT) * 0.3);
                const dy = Math.cos(time * agitacion * 0.8 + i * 2.1) * (3 + Math.abs(deltaT) * 0.3);
                ctx.fillStyle = exotermico ? '#f97316' : '#38bdf8';
                ctx.beginPath(); ctx.arc(px + dx, py + dy, 3, 0, Math.PI * 2); ctx.fill();
            }

            // Termómetro
            const tx = w - 45, ty = 25, tw = 18, th = h - 50;
            ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.5;
            ctx.strokeRect(tx, ty, tw, th);
            const tempFill = Math.min(1, Math.max(0, (Math.abs(deltaT) / 20)));
            ctx.fillStyle = exotermico ? '#ef4444' : '#3b82f6';
            ctx.fillRect(tx + 1, ty + th - tempFill * (th - 2), tw - 2, tempFill * (th - 2));
            ctx.fillStyle = '#e8edf5'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
            ctx.fillText(`${deltaT.toFixed(1)}°C`, tx + tw / 2, ty - 5);
            ctx.fillStyle = '#94a3b8'; ctx.font = '8px monospace';
            ctx.fillText(`Q = ${Q.toFixed(2)} J`, w / 2, h - 6);
            ctx.fillText(`m = ${m.toFixed(1)}g  c = ${c.toFixed(2)} J/g°C`, w / 2, 12);
        });
    },

    // 9. GASES COMBINADA — Pistón con émbolo que se mueve según P/V/T
    gasesCombinada: function(canvas, P1, V1, T1, P2, V2, T2) {
        if (!canvas.id) canvas.id = 'canvas_quim_gases';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);
            const time = Date.now() * 0.002;

            const grad = ctx.createLinearGradient(0, 0, 0, h);
            grad.addColorStop(0, 'rgba(100,200,255,0.1)');
            grad.addColorStop(1, 'rgba(255,200,100,0.06)');
            ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);

            const cx = w / 2, cw = Math.min(w * 0.4, 120), ch = Math.min(h * 0.5, 90);
            const cy = h / 2;

            // Cilindro (paredes laterales)
            ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(cx - cw / 2, cy - ch / 2);
            ctx.lineTo(cx - cw / 2, cy + ch / 2);
            ctx.lineTo(cx + cw / 2, cy + ch / 2);
            ctx.lineTo(cx + cw / 2, cy - ch / 2);
            ctx.stroke();

            // Émbolo (se mueve según V2/V1)
            const relacion = V2 / V1 || 1;
            const pistonY = cy - ch / 2 + ch / Math.max(1, relacion);
            ctx.fillStyle = '#475569';
            ctx.fillRect(cx - cw / 2 - 3, pistonY - 4, cw + 6, 8);
            ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1.5;
            ctx.strokeRect(cx - cw / 2 - 3, pistonY - 4, cw + 6, 8);

            // Gas particles dentro del pistón
            const espacio = Math.max(10, ch / Math.max(1, relacion) - 8);
            const nP = Math.min(25, Math.max(6, Math.round(P1 * 5)));
            for (let i = 0; i < nP; i++) {
                const px = cx - cw / 2 + 8 + (Math.abs(Math.sin(i * 37))) * (cw - 16);
                const py = cy + ch / 2 - 8 - (Math.abs(Math.cos(i * 53))) * espacio;
                const dx = Math.sin(time * 2 + i * 1.7) * 3;
                const dy = Math.cos(time * 1.8 + i * 2.3) * 3;
                ctx.fillStyle = i % 2 === 0 ? '#60a5fa' : '#f9c74f';
                ctx.beginPath(); ctx.arc(px + dx, Math.min(pistonY - 4, Math.max(cy - ch / 2 + 4, py + dy)), 3, 0, Math.PI * 2); ctx.fill();
            }

            ctx.fillStyle = '#e8edf5'; ctx.font = '9px monospace'; ctx.textAlign = 'left';
            ctx.fillText('Estado 1:', 10, 16);
            ctx.fillText(`P₁=${P1.toFixed(2)}  V₁=${V1.toFixed(2)}L  T₁=${T1.toFixed(1)}K`, 10, 30);
            ctx.fillText('Estado 2:', 10, 48);
            ctx.fillText(`P₂=${P2.toFixed(2)}  V₂=${V2.toFixed(2)}L  T₂=${T2.toFixed(1)}K`, 10, 62);
            ctx.fillStyle = '#4fffa0'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
            ctx.fillText('P₁V₁/T₁ = P₂V₂/T₂', w / 2, h - 8);
        });
    },

    // 10. EQUILIBRIO — Reacción reversible A ↔ B con concentraciones
    equilibrio: function(canvas, Kc, A_conc, B_conc, direccion) {
        if (!canvas.id) canvas.id = 'canvas_quim_equilibrio';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);
            const time = Date.now() * 0.002;

            const cx = w / 2, cy = h / 2;

            // Reactivo A (izquierda)
            const ax = w * 0.22;
            ctx.fillStyle = `rgba(56,189,248,${Math.min(0.6, 0.08 + A_conc * 0.3)})`;
            ctx.beginPath(); ctx.arc(ax, cy, 22 + Math.sin(time * 2) * 2, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = '#e8edf5'; ctx.font = 'bold 14px monospace'; ctx.textAlign = 'center';
            ctx.fillText('A', ax, cy + 5);
            ctx.fillStyle = '#94a3b8'; ctx.font = '8px monospace';
            ctx.fillText(`${A_conc.toFixed(3)}M`, ax, cy + 35);

            // Flecha reversible en el medio
            const t = time * 2;
            const favorDir = direccion || (Kc > 1 ? 1 : -1);
            ctx.strokeStyle = '#f9c74f'; ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(ax + 30, cy - 5);
            ctx.lineTo(cx - 10, cy - 5);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(cx + 10, cy + 5);
            ctx.lineTo(w * 0.78 - 30, cy + 5);
            ctx.stroke();
            // Punta derecha (→)
            ctx.fillStyle = favorDir > 0 ? '#4fffa0' : '#64748b';
            ctx.beginPath(); ctx.moveTo(cx - 5, cy - 5); ctx.lineTo(cx + 5, cy - 5); ctx.lineTo(cx, cy - 12); ctx.closePath(); ctx.fill();
            ctx.beginPath(); ctx.moveTo(cx - 5, cy + 5); ctx.lineTo(cx + 5, cy + 5); ctx.lineTo(cx, cy + 12); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#94a3b8'; ctx.font = '7px monospace'; ctx.textAlign = 'center';
            ctx.fillText('⇌', cx, cy + 4);

            // Producto B (derecha)
            const bx = w * 0.78;
            ctx.fillStyle = `rgba(249,199,79,${Math.min(0.6, 0.08 + B_conc * 0.3)})`;
            ctx.beginPath(); ctx.arc(bx, cy, 22 + Math.sin(time * 2 + 1) * 2, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#f9c74f'; ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = '#e8edf5'; ctx.font = 'bold 14px monospace'; ctx.textAlign = 'center';
            ctx.fillText('B', bx, cy + 5);
            ctx.fillStyle = '#94a3b8'; ctx.font = '8px monospace';
            ctx.fillText(`${B_conc.toFixed(3)}M`, bx, cy + 35);

            // Valor de Kc
            ctx.fillStyle = '#4fffa0'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
            ctx.fillText(`Kc = ${Kc.toFixed(4)}`, w / 2, h - 12);

            // Indicador de dirección favorecida
            const dirText = favorDir > 0 ? '→ favorece productos' : favorDir < 0 ? '← favorece reactivos' : 'en equilibrio';
            ctx.fillStyle = favorDir > 0 ? '#4fffa0' : '#f97316'; ctx.font = '9px monospace';
            ctx.fillText(dirText, w / 2, 15);
        });
    },

    // 11. BOYLE — Pistón con presión y volumen (P₁V₁ = P₂V₂)
    boyle: function(canvas, P1, V1, P2, V2) {
        if (!canvas.id) canvas.id = 'canvas_quim_boyle';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);
            const time = Date.now() * 0.001;
            const cx = w / 2, cw = 80, ch = 70;
            const cy = h / 2;
            const relacion = V2 / V1 || 1;
            const pistonY = cy + ch / 2 - ch / Math.max(0.3, Math.min(3, relacion));
            ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(cx - cw / 2, cy - ch / 2);
            ctx.lineTo(cx - cw / 2, cy + ch / 2);
            ctx.lineTo(cx + cw / 2, cy + ch / 2);
            ctx.lineTo(cx + cw / 2, cy - ch / 2);
            ctx.stroke();
            ctx.fillStyle = '#475569';
            ctx.fillRect(cx - cw / 2 - 3, pistonY - 4, cw + 6, 8);
            const espacio = Math.max(10, ch / Math.max(1, relacion) - 8);
            const nP = Math.round(P1 * 8);
            for (let i = 0; i < nP; i++) {
                const px = cx - cw / 2 + 8 + Math.abs(Math.sin(i * 37)) * (cw - 16);
                const py = pistonY - 6 - Math.abs(Math.cos(i * 53)) * espacio;
                const dx = Math.sin(time * 2 + i * 1.7) * 3;
                const dy = Math.cos(time * 1.8 + i * 2.3) * 3;
                ctx.fillStyle = i % 2 === 0 ? '#60a5fa' : '#f9c74f';
                ctx.beginPath(); ctx.arc(px + dx, cy + ch / 2 - 8 - (Math.abs(Math.cos(i * 53)) * espacio) + dy, 3, 0, Math.PI * 2); ctx.fill();
            }
            ctx.fillStyle = '#e8edf5'; ctx.font = '9px monospace'; ctx.textAlign = 'left';
            ctx.fillText(`P₁=${P1.toFixed(2)}  V₁=${V1.toFixed(2)}L`, 10, 16);
            ctx.fillText(`P₂=${P2.toFixed(2)}  V₂=${V2.toFixed(2)}L`, 10, 30);
            ctx.fillStyle = '#4fffa0'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
            ctx.fillText('P₁V₁ = P₂V₂', w / 2, h - 8);
        });
    },

    // 12. CHARLES — Termómetro + volumen variable (V₁/T₁ = V₂/T₂)
    charles: function(canvas, V1, T1, V2, T2) {
        if (!canvas.id) canvas.id = 'canvas_quim_charles';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);
            const time = Date.now() * 0.002;
            const cx = w / 2, cw = 60, ch = 60;
            const cy = h / 2;
            const relacion = V2 / V1 || 1;
            const pistonY = cy + ch / 2 - ch / Math.max(0.3, relacion);
            ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(cx - cw / 2, cy - ch / 2);
            ctx.lineTo(cx - cw / 2, cy + ch / 2);
            ctx.lineTo(cx + cw / 2, cy + ch / 2);
            ctx.lineTo(cx + cw / 2, cy - ch / 2);
            ctx.stroke();
            const tempColor = `rgba(239,68,68,${Math.min(0.5, 0.15 + (T2 - 273.15) * 0.005)})`;
            ctx.fillStyle = tempColor;
            const fillH = ch / Math.max(1, relacion);
            ctx.beginPath();
            ctx.moveTo(cx - cw / 2 + 1, cy + ch / 2);
            for (let x = cx - cw / 2 + 1; x <= cx + cw / 2 - 1; x++) {
                ctx.lineTo(x, cy + ch / 2 - fillH + Math.sin(x * 0.1 + time * 4) * 2);
            }
            ctx.lineTo(cx + cw / 2 - 1, cy + ch / 2);
            ctx.closePath(); ctx.fill();
            // Termómetro
            const tx = w - 40, ty = 20, tw = 14, th = h - 40;
            ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.5;
            ctx.strokeRect(tx, ty, tw, th);
            const tempFill = Math.min(1, Math.max(0, ((T2 - 273.15) / 100)));
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(tx + 1, ty + th - tempFill * (th - 2), tw - 2, tempFill * (th - 2));
            ctx.fillStyle = '#e8edf5'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
            ctx.fillText(`${(T2 - 273.15).toFixed(0)}°C`, tx + tw / 2, ty - 5);
            ctx.fillStyle = '#e8edf5'; ctx.font = '9px monospace'; ctx.textAlign = 'left';
            ctx.fillText(`V₁=${V1.toFixed(2)}L  T₁=${(T1 - 273.15).toFixed(1)}°C`, 10, 16);
            ctx.fillText(`V₂=${V2.toFixed(2)}L  T₂=${(T2 - 273.15).toFixed(1)}°C`, 10, 30);
            ctx.fillStyle = '#4fffa0'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
            ctx.fillText('V₁/T₁ = V₂/T₂', w / 2, h - 8);
        });
    },

    // 13. DALTON — Barras de presión total vs parcial
    dalton: function(canvas, X, PT, Pi) {
        if (!canvas.id) canvas.id = 'canvas_quim_dalton';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);
            const time = Date.now() * 0.001;
            const pad = 25, bw = w - 2 * pad, bh = 14;
            const cy1 = h / 2 - 16, cy2 = h / 2 + 16;
            const maxP = Math.max(PT, Pi) * 1.2;
            ctx.fillStyle = '#1a1f2e';
            ctx.beginPath(); ctx.roundRect(pad, cy1, bw, bh, 4); ctx.fill();
            ctx.fillStyle = '#4f9cf9';
            const pct1 = Math.min(1, PT / maxP);
            ctx.beginPath(); ctx.roundRect(pad, cy1, bw * pct1, bh, [4, 0, 0, 4]); ctx.fill();
            ctx.fillStyle = '#1a1f2e';
            ctx.beginPath(); ctx.roundRect(pad, cy2, bw, bh, 4); ctx.fill();
            ctx.fillStyle = '#f9c74f';
            const pct2 = Math.min(1, Pi / maxP);
            ctx.beginPath(); ctx.roundRect(pad, cy2, bw * pct2, bh, [4, 0, 0, 4]); ctx.fill();
            ctx.fillStyle = '#e8edf5'; ctx.font = '9px monospace'; ctx.textAlign = 'left';
            ctx.fillText(`P_total: ${PT.toFixed(2)} atm`, pad, cy1 - 4);
            ctx.fillText(`P_parcial: ${Pi.toFixed(4)} atm`, pad, cy2 - 4);
            ctx.fillStyle = '#94a3b8'; ctx.font = '8px monospace';
            ctx.fillText(`X = ${X}`, pad, cy2 + bh + 14);
            ctx.fillStyle = '#4fffa0'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
            ctx.fillText('P_i = X_i · P_total', w / 2, h - 6);
        });
    },

    // 14. VELOCIDAD DE REACCIÓN — Gráfica v vs [A] según orden
    velocidad_reaccion: function(canvas, k, conc, n, v) {
        if (!canvas.id) canvas.id = 'canvas_quim_vel';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);
            const time = Date.now() * 0.001;
            const pad = 30;
            const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.5);
            grad.addColorStop(0, 'rgba(100,200,255,0.1)');
            grad.addColorStop(1, 'rgba(10,15,30,0.3)');
            ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
            const gW = w - 2 * pad, gH = h - 2 * pad;
            ctx.strokeStyle = '#2a3345'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(pad, pad); ctx.lineTo(pad, pad + gH); ctx.lineTo(pad + gW, pad + gH); ctx.stroke();
            ctx.strokeStyle = 'rgba(79,249,123,0.4)'; ctx.lineWidth = 2;
            ctx.beginPath();
            for (let x = 0; x <= gW; x++) {
                const c = (x / gW) * 2;
                let rate = 0;
                if (n === 0) rate = k;
                else if (n === 1) rate = k * c;
                else rate = k * c * c;
                const y = pad + gH - (rate / (k * Math.pow(2, n) || 1)) * gH;
                x === 0 ? ctx.moveTo(pad + x, y) : ctx.lineTo(pad + x, y);
            }
            ctx.stroke();
            const cx = pad + (conc / 2) * gW;
            const rateV = k * Math.pow(conc, n);
            const cy = pad + gH - (rateV / (k * Math.pow(2, n) || 1)) * gH;
            ctx.shadowColor = '#4fffa0'; ctx.shadowBlur = 8;
            ctx.fillStyle = '#4fffa0';
            ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#e8edf5'; ctx.font = '9px monospace'; ctx.textAlign = 'left';
            ctx.fillText(`k=${k}  n=${n}  [A]=${conc}M`, 10, 14);
            ctx.fillText(`v=${v.toExponential(4)}`, 10, 28);
            ctx.fillStyle = '#94a3b8'; ctx.font = '7px monospace'; ctx.textAlign = 'center';
            ctx.fillText('[A]', w - 10, pad + gH + 12);
        });
    },

    // 15. AVOGADRO — Partículas animadas (N = n · Nₐ)
    numero_avogadro: function(canvas, moles, moleculas) {
        if (!canvas.id) canvas.id = 'canvas_quim_avogadro';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);
            const time = Date.now() * 0.001;
            const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.6);
            grad.addColorStop(0, 'rgba(250,200,100,0.12)');
            grad.addColorStop(1, 'rgba(100,150,255,0.05)');
            ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
            const n = Math.min(30, Math.max(4, Math.round(moles * 8)));
            for (let i = 0; i < n; i++) {
                const col = 6, row = Math.ceil(n / col);
                const sepX = (w - 30) / col, sepY = (h - 40) / row;
                const ix = i % col, iy = Math.floor(i / col);
                const px = 15 + ix * sepX + sepX / 2 + Math.sin(time + i * 1.7) * 5;
                const py = 20 + iy * sepY + sepY / 2 + Math.cos(time * 0.8 + i * 2.3) * 4;
                const r = 5 + Math.sin(time * 0.5 + i) * 1.5;
                const colores = ['#4f9cf9', '#f9c74f', '#4fffa0', '#f94f4f', '#a78bfa'];
                ctx.fillStyle = colores[i % colores.length];
                ctx.shadowColor = ctx.fillStyle;
                ctx.shadowBlur = 4;
                ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
                ctx.shadowBlur = 0;
            }
            ctx.fillStyle = '#e8edf5'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
            ctx.fillText(`${moles.toFixed(4)} mol → ${moleculas.toExponential(4)} moléculas`, w / 2, h - 8);
            ctx.fillStyle = '#94a3b8'; ctx.font = '8px monospace';
            ctx.fillText('Nₐ = 6.022×10²³', w / 2, 12);
        });
    },

    // ─── Q11. MASA MOLAR — Balanza con moléculas ─────────────────────────
    masa_molar: function(canvas, m, n, M) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const W = canvas.width / (window.devicePixelRatio || 1);
        const H = canvas.height / (window.devicePixelRatio || 1);
        let t = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, W, H);
            t += 0.02;

            const cx = W / 2, by = H - 30;
            const platW = 60, platH = 6;

            // Balanza (brazo)
            ctx.strokeStyle = '#4a5570'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(cx - 70, by - 80); ctx.lineTo(cx + 70, by - 80); ctx.stroke();

            // Soporte central
            ctx.beginPath(); ctx.moveTo(cx, by - 80); ctx.lineTo(cx, by - 30); ctx.stroke();
            ctx.fillStyle = '#4a5570'; ctx.fillRect(cx - 2, by - 30, 4, 10);

            // Plato izquierdo (masa)
            const swing = 6 * Math.sin(t * 2);
            ctx.fillStyle = '#1e293b';
            ctx.beginPath(); ctx.rect(cx - 70 - platW / 2 + 1, by - 80 + platW / 2, platW, platH); ctx.fill();
            ctx.fillStyle = '#4f9cf9'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
            ctx.fillText(`${m}g`, cx - 70, by - 80 + platW / 2 - 6);

            // Plato derecho (moles)
            ctx.fillStyle = '#1e293b';
            ctx.beginPath(); ctx.rect(cx + 70 - platW / 2 - 1, by - 80 + platW / 2, platW, platH); ctx.fill();
            ctx.fillStyle = '#f9c74f'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
            ctx.fillText(`${n}mol`, cx + 70, by - 80 + platW / 2 - 6);

            // Resultado
            ctx.fillStyle = '#4fffa0'; ctx.font = 'bold 13px monospace'; ctx.textAlign = 'center';
            ctx.fillText(`M = ${M.toFixed(2)} g/mol`, cx, by - 6);

            // Partículas animadas
            const colores = ['#4f9cf9', '#f9c74f', '#a78bfa', '#4fffa0'];
            for (let i = 0; i < 8; i++) {
                const px = 10 + (W - 20) * ((i + 0.5 * Math.sin(t + i * 2)) / 8);
                const py = 10 + Math.sin(t * 1.5 + i) * 4;
                ctx.fillStyle = colores[i % 4];
                ctx.globalAlpha = 0.3 + 0.3 * Math.sin(t + i);
                ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2); ctx.fill();
                ctx.globalAlpha = 1;
            }
        });
    },

    // ─── Q12. RENDIMIENTO — Barra de porcentaje con animación ────────────
    rendimiento: function(canvas, real, teor, pct) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const W = canvas.width / (window.devicePixelRatio || 1);
        const H = canvas.height / (window.devicePixelRatio || 1);
        let t = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, W, H);
            t += 0.03;

            const pad = 30, cy = H / 2, barW = W - 2 * pad, barH = 30;
            const color = pct < 50 ? '#f94f4f' : pct < 80 ? '#f9c74f' : '#4fffa0';

            // Fondo de barra
            ctx.fillStyle = '#1a1f2e';
            ctx.beginPath(); ctx.roundRect(pad, cy - barH / 2, barW, barH, 8); ctx.fill();

            const anim = Math.min(t * 2, 1);
            const fillW = barW * (pct / 100) * anim;

            ctx.fillStyle = color;
            ctx.shadowColor = color; ctx.shadowBlur = 6;
            ctx.beginPath(); ctx.roundRect(pad, cy - barH / 2, fillW, barH, [8, 0, 0, 8]); ctx.fill();
            ctx.shadowBlur = 0;

            // Línea divisoria 50%
            ctx.strokeStyle = '#f94f4f44'; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
            ctx.beginPath(); ctx.moveTo(pad + barW * 0.5, cy - barH / 2 - 4); ctx.lineTo(pad + barW * 0.5, cy + barH / 2 + 4); ctx.stroke();
            ctx.setLineDash([]);

            // Etiqueta
            ctx.fillStyle = '#fff'; ctx.font = 'bold 14px monospace'; ctx.textAlign = 'center';
            ctx.fillText(`${pct.toFixed(1)}%`, W / 2, cy + 4);

            // Matraz ilustrativo
            const mx = W * 0.2, my = H * 0.85;
            ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(mx - 16, my); ctx.lineTo(mx - 16, my - 30);
            ctx.quadraticCurveTo(mx - 16, my - 40, mx, my - 40);
            ctx.quadraticCurveTo(mx + 16, my - 40, mx + 16, my - 30);
            ctx.lineTo(mx + 16, my); ctx.closePath(); ctx.stroke();

            ctx.fillStyle = color + '44';
            ctx.fillRect(mx - 14, my - 20 * (pct / 100), 28, 20);
            this._label(ctx, `Rendimiento`, mx, my + 14, '#8a97b0', 7);
        });
    },

    // ─── Q13. HENDERSON–HASSELBALCH — Gráfico de titulación ─────────────
    henderson: function(canvas, pka, base, acido, pH) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const W = canvas.width / (window.devicePixelRatio || 1);
        const H = canvas.height / (window.devicePixelRatio || 1);
        let t = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, W, H);
            t += 0.02;

            const pad = 25, gW = W - 2 * pad, gH = H - 2 * pad;

            // Ejes
            ctx.strokeStyle = '#2a3040'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(pad, pad); ctx.lineTo(pad, pad + gH); ctx.lineTo(pad + gW, pad + gH); ctx.stroke();

            // Curva sigmoidea de titulación
            ctx.strokeStyle = '#4f9cf9'; ctx.lineWidth = 2;
            ctx.beginPath();
            for (let i = 0; i <= 100; i++) {
                const x = pad + (i / 100) * gW;
                const logR = -3 + (i / 100) * 6;
                const y = pad + gH - (pka + logR) / 14 * gH;
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.stroke();

            // Punto actual
            const logRel = Math.log10(base / acido);
            const px = pad + (logRel + 3) / 6 * gW;
            const py = pad + gH - pH / 14 * gH;
            if (px >= pad && px <= pad + gW) {
                ctx.shadowColor = '#f9c74f'; ctx.shadowBlur = 8;
                ctx.fillStyle = '#f9c74f';
                ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();
                ctx.shadowBlur = 0;
            }

            // Línea pH = pKa
            const pkaY = pad + gH - pka / 14 * gH;
            ctx.strokeStyle = '#f9c74f44'; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
            ctx.beginPath(); ctx.moveTo(pad, pkaY); ctx.lineTo(pad + gW, pkaY); ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = '#f9c74f'; ctx.font = '7px monospace'; ctx.textAlign = 'left';
            ctx.fillText(`pKa=${pka}`, pad + gW - 30, pkaY - 2);

            ctx.fillStyle = '#e8edf5'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
            ctx.fillText(`pH = ${pH.toFixed(2)}`, W / 2, 12);
        });
    },

    // ─── Q14. LEY DE GRAHAM — Dos moléculas con velocidades ──────────────
    graham: function(canvas, M1, M2, ratio) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const W = canvas.width / (window.devicePixelRatio || 1);
        const H = canvas.height / (window.devicePixelRatio || 1);
        let t = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, W, H);
            t += 0.02;

            const cx = W / 2, cy = H / 2;

            // Partícula gas 1 (izquierda)
            const x1 = cx / 2 + Math.sin(t * 4) * 40;
            const y1 = cy + Math.cos(t * 3) * 20;
            ctx.shadowColor = '#4f9cf9'; ctx.shadowBlur = 10;
            ctx.fillStyle = '#4f9cf9';
            ctx.beginPath(); ctx.arc(x1, y1, M1 < M2 ? 12 : 6, 0, Math.PI * 2); ctx.fill();

            // Partícula gas 2 (derecha)
            const x2 = cx + cx / 2 + Math.sin(t * 6 + 2) * 40;
            const y2 = cy + Math.cos(t * 5 + 1) * 20;
            ctx.shadowColor = '#f9c74f'; ctx.shadowBlur = 10;
            ctx.fillStyle = '#f9c74f';
            ctx.beginPath(); ctx.arc(x2, y2, M2 < M1 ? 12 : 6, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;

            // Etiquetas
            ctx.fillStyle = '#4f9cf9'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
            ctx.fillText(`Gas 1 (M=${M1})`, cx / 2, cy - 40);
            ctx.fillStyle = '#f9c74f'; ctx.font = 'bold 9px monospace';
            ctx.fillText(`Gas 2 (M=${M2})`, cx + cx / 2, cy - 40);

            // Línea de efusión (porosa)
            ctx.strokeStyle = '#2a3040'; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke();
            ctx.strokeStyle = '#1a1f2e'; ctx.lineWidth = 1;
            ctx.setLineDash([2, 4]);
            ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = '#8a97b0'; ctx.font = '7px monospace';
            ctx.fillText('pared porosa', cx, 8);

            // Resultado
            ctx.fillStyle = '#4fffa0'; ctx.font = 'bold 12px monospace';
            ctx.fillText(`v₁/v₂ = ${ratio.toFixed(4)}`, cx, H - 12);
        });
    },

    // ─── Q15. ARRHENIUS — Gráfico de energía de activación ──────────────
    arrhenius: function(canvas, Ea, T, A, k) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const W = canvas.width / (window.devicePixelRatio || 1);
        const H = canvas.height / (window.devicePixelRatio || 1);
        let t = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, W, H);
            t += 0.02;

            const pad = 30, gW = W - 2 * pad, gH = H - 2 * pad;

            // Perfil energético (curva de reacción)
            ctx.strokeStyle = '#4f9cf9'; ctx.lineWidth = 2;
            ctx.beginPath();
            const cp = [
                { x: 0, y: 0.1 },
                { x: 0.2, y: 0.05 },
                { x: 0.45, y: 0.85 },
                { x: 0.55, y: 0.85 },
                { x: 0.8, y: 0.05 },
                { x: 1, y: 0.1 }
            ];
            cp.forEach((p, i) => {
                const x = pad + p.x * gW;
                const y = pad + (1 - p.y) * gH;
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            });
            ctx.stroke();

            // Flecha de Ea
            const eaX1 = pad + 0.25 * gW, eaX2 = pad + 0.45 * gW;
            const eaY = pad + (1 - 0.6) * gH;
            ctx.strokeStyle = '#f9c74f'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(eaX1, eaY); ctx.lineTo(eaX2, eaY); ctx.stroke();
            ctx.fillStyle = '#f9c74f'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
            ctx.fillText(`Ea = ${(Ea / 1000).toFixed(2)} kJ/mol`, (eaX1 + eaX2) / 2, eaY - 6);

            // Punto de la cima (complejo activado)
            ctx.shadowColor = '#f94f4f'; ctx.shadowBlur = 8;
            ctx.fillStyle = '#f94f4f';
            ctx.beginPath(); ctx.arc(pad + 0.5 * gW, pad + (1 - 0.85) * gH, 4, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;

            // Etiqueta resultado
            ctx.fillStyle = '#4fffa0'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
            ctx.fillText(`k = ${k.toExponential(4)} s⁻¹  (T=${T} K)`, W / 2, H - 6);

            ctx.fillStyle = '#8a97b0'; ctx.font = '7px monospace';
            ctx.fillText('Reactivos →', pad + 5, pad + (1 - 0.1) * gH + 12);
            ctx.fillText('← Productos', pad + gW - 30, pad + (1 - 0.1) * gH + 12);
        });
    }
};
