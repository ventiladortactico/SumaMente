if (typeof CivilVisual === 'undefined') {
    window.CivilVisual = {
        initCanvas(canvas) {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            canvas.width  = (rect.width  || 320) * dpr;
            canvas.height = (rect.height || 160) * dpr;
            const ctx = canvas.getContext('2d');
            ctx.scale(dpr, dpr);
            return ctx;
        },
        _loop: {},
        _startLoop(canvas, fn) {
            if (this._loop[canvas.id]) cancelAnimationFrame(this._loop[canvas.id]);
            const tick = () => { fn(); this._loop[canvas.id] = requestAnimationFrame(tick); };
            tick();
        },
        _stopLoop(canvas) {
            if (this._loop[canvas.id]) { cancelAnimationFrame(this._loop[canvas.id]); delete this._loop[canvas.id]; }
        },
        // Helpers reutilizables
        _label(ctx, txt, x, y, color = '#8a97b0', size = 9) {
            ctx.fillStyle = color;
            ctx.font = `${size}px 'JetBrains Mono', monospace`;
            ctx.fillText(txt, x, y);
        },
        _arrow(ctx, x1, y1, x2, y2, color = '#4f9cf9', aw = 6) {
            const angle = Math.atan2(y2 - y1, x2 - x1);
            ctx.strokeStyle = color; ctx.fillStyle = color;
            ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x2, y2);
            ctx.lineTo(x2 - aw * Math.cos(angle - .4), y2 - aw * Math.sin(angle - .4));
            ctx.lineTo(x2 - aw * Math.cos(angle + .4), y2 - aw * Math.sin(angle + .4));
            ctx.closePath(); ctx.fill();
        },
        _dim(ctx, x1, y, x2, label, color = '#4a5570') {
            // Cota horizontal
            ctx.strokeStyle = color; ctx.lineWidth = 1;
            ctx.setLineDash([3,3]);
            ctx.beginPath(); ctx.moveTo(x1, y - 4); ctx.lineTo(x1, y + 4);
            ctx.moveTo(x2, y - 4); ctx.lineTo(x2, y + 4);
            ctx.moveTo(x1, y);   ctx.lineTo(x2, y);
            ctx.stroke(); ctx.setLineDash([]);
            ctx.fillStyle = '#8a97b0'; ctx.font = "8px 'JetBrains Mono',monospace";
            ctx.textAlign = 'center'; ctx.fillText(label, (x1+x2)/2, y - 6);
        }
    };
}

Object.assign(CivilVisual, {

    // ─── CAÍDA DE TENSIÓN — Diagrama de línea con gradiente de pérdida ────────
    caidaTension(canvas, L, I, rho, dV, pct) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const W = canvas.width / (window.devicePixelRatio || 1);
        const H = canvas.height / (window.devicePixelRatio || 1);
        let t = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, W, H);
            t += 0.025;

            const pad = 18, cy = H / 2;
            const x0 = pad + 28, x1 = W - pad - 32;

            // ─ Fondo sutil
            const bg = ctx.createLinearGradient(x0, 0, x1, 0);
            bg.addColorStop(0, 'rgba(79,156,249,0.06)');
            bg.addColorStop(1, pct > 3 ? 'rgba(249,79,79,0.10)' : 'rgba(79,249,123,0.06)');
            ctx.fillStyle = bg; ctx.fillRect(x0, cy - 22, x1 - x0, 44); 

            // ─ Fuente de tensión (izquierda)
            ctx.strokeStyle = '#4f9cf9'; ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(x0, cy, 16, 0, Math.PI * 2); ctx.stroke();
            // símbolo AC
            ctx.strokeStyle = '#38e8c8'; ctx.lineWidth = 1;
            ctx.beginPath();
            for (let i = 0; i <= 40; i++) {
                const px = x0 - 10 + i * 0.5;
                const py = cy + Math.sin(i * 0.32 * Math.PI) * 7;
                i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
            }
            ctx.stroke();
            ctx.textAlign = 'center';
            this._label(ctx, 'Vfuente', x0, cy + 26, '#4f9cf9', 8);

            // ─ Cable — gradiente de color según pérdida
            const wireGrad = ctx.createLinearGradient(x0 + 16, 0, x1 - 18, 0);
            wireGrad.addColorStop(0, '#4f9cf9');
            wireGrad.addColorStop(1, pct > 5 ? '#f94f4f' : pct > 3 ? '#f9c74f' : '#4ff97b');
            ctx.strokeStyle = wireGrad; ctx.lineWidth = 5;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(x0 + 16, cy - 8); ctx.lineTo(x1 - 18, cy - 8);
            ctx.stroke();
            // cable de retorno
            ctx.strokeStyle = '#2a3040'; ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(x0 + 16, cy + 8); ctx.lineTo(x1 - 18, cy + 8);
            ctx.stroke();

            // ─ Pulso de corriente animado
            const px = x0 + 16 + ((t * 60) % (x1 - x0 - 34));
            ctx.fillStyle = '#f9c74f';
            ctx.shadowColor = '#f9c74f'; ctx.shadowBlur = 8;
            ctx.beginPath(); ctx.arc(px, cy - 8, 3.5, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;

            // ─ Carga (derecha)
            ctx.strokeStyle = '#a78bfa'; ctx.lineWidth = 2;
            ctx.strokeRect(x1 - 18, cy - 16, 36, 32);
            // símbolo resistencia
            ctx.strokeStyle = '#a78bfa'; ctx.lineWidth = 1.5;
            ctx.beginPath();
            for (let i = 0; i <= 6; i++) {
                const ry = cy - 8 + i * (16 / 6);
                ctx.lineTo(x1, ry);
            }
            ctx.stroke();
            this._label(ctx, 'Carga', x1, cy + 26, '#a78bfa', 8);

            // ─ Indicador de caída (flecha hacia abajo)
            const midX = (x0 + x1) / 2;
            const dropColor = pct > 3 ? '#f94f4f' : '#4ff97b';
            this._arrow(ctx, midX, cy - 30, midX, cy - 14, dropColor, 5);
            ctx.textAlign = 'center';
            this._label(ctx, `ΔV = ${dV.toFixed(2)} V`, midX, cy - 33, dropColor, 9);

            // ─ Cotas
            this._dim(ctx, x0 + 16, cy + 22, x1 - 18, `L = ${L} m`, '#4a5570');

            // ─ Badge porcentaje
            const badge = pct > 5 ? '#f94f4f' : pct > 3 ? '#f9c74f' : '#4ff97b';
            ctx.fillStyle = badge + '22';
            ctx.strokeStyle = badge; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.roundRect(W - pad - 52, 6, 52, 18, 4); ctx.fill(); ctx.stroke();
            ctx.textAlign = 'center';
            this._label(ctx, `${pct.toFixed(2)}%`, W - pad - 26, 18, badge, 9);
            this._label(ctx, `I = ${I} A`, x0, H - 6, '#8a97b0', 8);
        });
    },

    // ─── PENDIENTE — Sección transversal con triangulo de talud real ─────────
    pendiente(canvas, d, h, p) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const W = canvas.width / (window.devicePixelRatio || 1);
        const H = canvas.height / (window.devicePixelRatio || 1);
        let t = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, W, H);
            t += 0.02;

            const pad = 30, bY = H - 28;
            const sx = pad, ex = W - pad;
            const topY = bY - (H - 60);

            // ─ Suelo / relleno
            ctx.fillStyle = '#1a2230';
            ctx.fillRect(0, bY, W, H - bY);

            // ─ Plano inclinado
            ctx.fillStyle = 'rgba(38,56,80,0.9)';
            ctx.beginPath();
            ctx.moveTo(sx, bY);
            ctx.lineTo(ex, topY);
            ctx.lineTo(ex, bY);
            ctx.closePath(); ctx.fill();

            // ─ Línea de pendiente
            ctx.strokeStyle = '#38e8c8'; ctx.lineWidth = 2.5;
            ctx.shadowColor = '#38e8c8'; ctx.shadowBlur = 6;
            ctx.beginPath(); ctx.moveTo(sx, bY); ctx.lineTo(ex, topY); ctx.stroke();
            ctx.shadowBlur = 0;

            // ─ Línea horizontal
            ctx.strokeStyle = '#4a5570'; ctx.lineWidth = 1;
            ctx.setLineDash([5, 4]);
            ctx.beginPath(); ctx.moveTo(sx, bY); ctx.lineTo(ex, bY); ctx.stroke();
            ctx.setLineDash([]);

            // ─ Línea vertical (desnivel)
            ctx.strokeStyle = '#4a5570'; ctx.lineWidth = 1;
            ctx.setLineDash([5, 4]);
            ctx.beginPath(); ctx.moveTo(ex, bY); ctx.lineTo(ex, topY); ctx.stroke();
            ctx.setLineDash([]);

            // ─ Ángulo
            const ang = Math.atan2(bY - topY, ex - sx);
            ctx.strokeStyle = '#f9c74f'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(sx, bY, 28, -ang, 0); ctx.stroke();
            ctx.textAlign = 'left';
            this._label(ctx, `${p.toFixed(1)}%`, sx + 32, bY - 6, '#f9c74f', 9);

            // ─ Cotas
            this._arrow(ctx, (sx + ex) / 2, bY + 14, ex, bY + 14, '#4f9cf9', 5);
            this._arrow(ctx, (sx + ex) / 2, bY + 14, sx, bY + 14, '#4f9cf9', 5);
            ctx.textAlign = 'center';
            this._label(ctx, `d = ${d.toFixed(2)} m`, (sx + ex) / 2, bY + 24, '#4f9cf9', 8);

            this._arrow(ctx, ex + 14, (bY + topY) / 2, ex + 14, topY, '#f97b4f', 5);
            this._arrow(ctx, ex + 14, (bY + topY) / 2, ex + 14, bY,   '#f97b4f', 5);
            ctx.textAlign = 'left';
            this._label(ctx, `h=${h.toFixed(2)}m`, ex + 18, (bY + topY) / 2 + 4, '#f97b4f', 8);

            // ─ Pulso en la pendiente
            const frac = (Math.sin(t) * .5 + .5);
            const bx = sx + (ex - sx) * frac;
            const by = bY + (topY - bY) * frac;
            ctx.fillStyle = '#38e8c8';
            ctx.shadowColor = '#38e8c8'; ctx.shadowBlur = 8;
            ctx.beginPath(); ctx.arc(bx, by, 4, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;
        });
    },

    // ─── ASENTAMIENTO — Corte de suelo con zapata y flecha de hundimiento ────
    asentamiento(canvas, mm) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const W = canvas.width / (window.devicePixelRatio || 1);
        const H = canvas.height / (window.devicePixelRatio || 1);
        let t = 0;
        const dangerZone = mm > 25;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, W, H);
            t += 0.025;

            const zapW = 80, zapH = 14, zapX = W / 2 - zapW / 2;
            const soilTop = 40;

            // ─ Estratos de suelo con texturas
            const layers = [
                { y: soilTop, h: 35, color: '#3d2b1a', label: 'Relleno' },
                { y: soilTop + 35, h: 40, color: '#4a3220', label: 'Arcilla' },
                { y: soilTop + 75, h: H - soilTop - 75, color: '#5c4230', label: 'Suelo firme' },
            ];
            layers.forEach(l => {
                ctx.fillStyle = l.color;
                ctx.fillRect(20, l.y, W - 40, l.h);
                // textura punteada
                ctx.fillStyle = 'rgba(255,255,255,0.03)';
                for (let px = 25; px < W - 40; px += 8) {
                    for (let py = l.y + 3; py < l.y + l.h - 3; py += 7) {
                        ctx.beginPath(); ctx.arc(px, py, 1, 0, Math.PI * 2); ctx.fill();
                    }
                }
                ctx.textAlign = 'left';
                this._label(ctx, l.label, 24, l.y + 12, '#8a97b055', 8);
            });
            // bordes de estratos
            ctx.strokeStyle = '#2a3040'; ctx.lineWidth = 1;
            layers.forEach((l, i) => { if (i > 0) { ctx.beginPath(); ctx.moveTo(20, l.y); ctx.lineTo(W - 20, l.y); ctx.stroke(); }});

            // ─ Hundimiento animado
            const maxOffset = Math.min(mm * 1.5, 28);
            const offset = maxOffset * (0.5 + 0.5 * Math.sin(t * 0.7));

            // ─ Zapata
            ctx.fillStyle = '#8899bb';
            ctx.fillRect(zapX, soilTop + offset - zapH, zapW, zapH);
            ctx.strokeStyle = '#aab4cc'; ctx.lineWidth = 1.5;
            ctx.strokeRect(zapX, soilTop + offset - zapH, zapW, zapH);
            // armadura (líneas)
            ctx.strokeStyle = '#6677aa'; ctx.lineWidth = 1;
            for (let rx = zapX + 8; rx < zapX + zapW - 8; rx += 16) {
                ctx.beginPath(); ctx.moveTo(rx, soilTop + offset - zapH + 3); ctx.lineTo(rx, soilTop + offset - 3); ctx.stroke();
            }
            this._label(ctx, 'Zapata', W / 2, soilTop + offset - zapH - 4, '#aab4cc', 8);
            ctx.textAlign = 'center';

            // ─ Flecha de asentamiento
            const arrowColor = dangerZone ? '#f94f4f' : '#f9c74f';
            this._arrow(ctx, W / 2, 8, W / 2, soilTop + offset - zapH - 8, arrowColor, 6);
            ctx.textAlign = 'center';
            this._label(ctx, `S = ${mm.toFixed(1)} mm`, W / 2, 7, arrowColor, 9);

            // ─ Línea de referencia original
            ctx.strokeStyle = '#4a5570'; ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.beginPath(); ctx.moveTo(zapX - 10, soilTop); ctx.lineTo(zapX + zapW + 10, soilTop); ctx.stroke();
            ctx.setLineDash([]);
            this._label(ctx, 'Nivel original', zapX - 14, soilTop - 3, '#4a5570', 7);

            // ─ Bulbo de presión
            const bulbGrad = ctx.createRadialGradient(W / 2, soilTop + offset + 10, 5, W / 2, soilTop + offset + 10, 45);
            bulbGrad.addColorStop(0, arrowColor + '30');
            bulbGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = bulbGrad;
            ctx.beginPath(); ctx.ellipse(W / 2, soilTop + offset + 20, 38, 28, 0, 0, Math.PI * 2); ctx.fill();

            if (dangerZone) {
                ctx.textAlign = 'center';
                this._label(ctx, '⚠ Excede 25mm', W / 2, H - 6, '#f94f4f', 8);
            }
        });
    },

    // ─── FLECTOR — Diagrama de viga con diagrama BMD y deformada ─────────────
    flector(canvas, L, M) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const W = canvas.width / (window.devicePixelRatio || 1);
        const H = canvas.height / (window.devicePixelRatio || 1);
        let t = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, W, H);
            t += 0.02;

            const pad = 28, viY = 52, viH = 10;
            const x0 = pad + 8, x1 = W - pad - 8;
            const viWidth = x1 - x0;
            const bmdH = 42; // altura máx del diagrama BMD

            // ─ Carga distribuida (flechas hacia abajo)
            ctx.strokeStyle = '#4f9cf9'; ctx.lineWidth = 1.2;
            const nArrows = 10;
            for (let i = 0; i <= nArrows; i++) {
                const ax = x0 + (viWidth / nArrows) * i;
                const pulse = 1 + 0.12 * Math.sin(t + i * 0.6);
                this._arrow(ctx, ax, viY - 22 * pulse, ax, viY - 2, '#4f9cf9', 4);
            }
            // línea de carga en la parte superior
            ctx.strokeStyle = '#4f9cf9'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(x0, viY - 22); ctx.lineTo(x1, viY - 22); ctx.stroke();
            ctx.textAlign = 'right';
            this._label(ctx, 'q (kN/m)', x1, viY - 25, '#4f9cf9', 8);

            // ─ Viga (sección rectangular)
            ctx.fillStyle = '#3a4558';
            ctx.fillRect(x0, viY, viWidth, viH);
            ctx.strokeStyle = '#5a6880'; ctx.lineWidth = 1;
            ctx.strokeRect(x0, viY, viWidth, viH);

            // ─ Apoyos triangulares
            const drawSupport = (x) => {
                ctx.fillStyle = '#4a5570';
                ctx.beginPath();
                ctx.moveTo(x, viY + viH);
                ctx.lineTo(x - 10, viY + viH + 16);
                ctx.lineTo(x + 10, viY + viH + 16);
                ctx.closePath(); ctx.fill();
                // roletes
                ctx.strokeStyle = '#8a97b0'; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(x - 12, viY + viH + 18); ctx.lineTo(x + 12, viY + viH + 18); ctx.stroke();
            };
            drawSupport(x0); drawSupport(x1);

            // ─ Reacciones
            this._arrow(ctx, x0, viY + viH + 30, x0, viY + viH + 4, '#4ff97b', 5);
            this._arrow(ctx, x1, viY + viH + 30, x1, viY + viH + 4, '#4ff97b', 5);

            // ─ Deformada elástica (bajo la viga)
            const defY0 = viY + viH + 38;
            ctx.strokeStyle = '#a78bfa'; ctx.lineWidth = 2;
            ctx.shadowColor = '#a78bfa'; ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.moveTo(x0, defY0);
            for (let x = x0; x <= x1; x++) {
                const pct = (x - x0) / viWidth;
                const def = Math.sin(pct * Math.PI) * bmdH * 0.45;
                ctx.lineTo(x, defY0 + def);
            }
            ctx.stroke(); ctx.shadowBlur = 0;
            ctx.textAlign = 'left';
            this._label(ctx, 'Deformada', x0, defY0 + bmdH * 0.45 + 10, '#a78bfa55', 7);

            // ─ Diagrama BMD (debajo de la deformada)
            const bmdY0 = defY0 + bmdH * 0.45 + 18;
            ctx.fillStyle = 'rgba(79,156,249,0.12)';
            ctx.strokeStyle = '#4f9cf9'; ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(x0, bmdY0);
            for (let x = x0; x <= x1; x++) {
                const pct = (x - x0) / viWidth;
                const bmd = Math.sin(pct * Math.PI) * bmdH * 0.6;
                ctx.lineTo(x, bmdY0 + bmd);
            }
            ctx.lineTo(x1, bmdY0); ctx.closePath();
            ctx.fill(); ctx.stroke();

            // ─ Valor Mmax en el centro
            ctx.textAlign = 'center';
            this._label(ctx, `M = ${M.toFixed(1)} kN·m`, W / 2, bmdY0 + bmdH * 0.6 + 10, '#f9c74f', 9);
            this._label(ctx, 'DMF', x0, bmdY0 - 2, '#4f9cf960', 7);

            // ─ Longitud
            this._dim(ctx, x0, viY - 36, x1, `L = ${L} m`, '#4a5570');
        });
    },

    // ─── LADRILLOS — Patrón de aparejo real con junta ─────────────────────────
    ladrillos(canvas, total) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const W = canvas.width / (window.devicePixelRatio || 1);
        const H = canvas.height / (window.devicePixelRatio || 1);
        let t = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, W, H);
            t += 0.015;

            const bW = 36, bH = 16, jt = 3;
            const rows = Math.floor((H - 40) / (bH + jt));
            const cols = Math.ceil(W / (bW + jt)) + 1;

            for (let r = 0; r < rows; r++) {
                const offset = (r % 2) * (bW / 2 + jt / 2);
                const ry = 8 + r * (bH + jt);
                for (let c = -1; c < cols; c++) {
                    const rx = -offset + c * (bW + jt);
                    if (rx + bW < 0 || rx > W) continue;

                    // Color ladrillo con variación sutil
                    const shade = 0.85 + 0.15 * Math.sin(r * 7 + c * 3);
                    ctx.fillStyle = `rgb(${Math.round(160*shade)}, ${Math.round(80*shade)}, ${Math.round(40*shade)})`;
                    ctx.fillRect(rx, ry, bW, bH);

                    // Highlight superior
                    ctx.fillStyle = 'rgba(255,255,255,0.08)';
                    ctx.fillRect(rx, ry, bW, 3);

                    // Borde (junta de mortero)
                    ctx.strokeStyle = '#d4a98055';
                    ctx.lineWidth = 0.5;
                    ctx.strokeRect(rx, ry, bW, bH);
                }
            }

            // ─ Overlay oscuro para legibilidad del texto
            const ov = ctx.createLinearGradient(0, H - 36, 0, H);
            ov.addColorStop(0, 'rgba(10,11,14,0)');
            ov.addColorStop(1, 'rgba(10,11,14,0.85)');
            ctx.fillStyle = ov; ctx.fillRect(0, H - 36, W, 36);

            // ─ Texto resultado
            ctx.textAlign = 'center';
            this._label(ctx, `Total: ${total} unidades`, W / 2, H - 16, '#e8edf5', 10);
            this._label(ctx, `≈ ${Math.round(total / 40)} m² de muro`, W / 2, H - 5, '#8a97b0', 8);

            // ─ Cota de referencia (un ladrillo)
            ctx.strokeStyle = '#38e8c8'; ctx.lineWidth = 1;
            ctx.setLineDash([3,3]);
            ctx.strokeRect(8, 8, bW, bH);
            ctx.setLineDash([]);
            this._label(ctx, `${bW}×${bH}mm`, 8, bH + 20, '#38e8c855', 7);
        });
    },

    // ─── TERZAGHI — Perfil de suelo estratificado con nivel freático ─────────
    terzaghi(canvas, z, zw) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const W = canvas.width / (window.devicePixelRatio || 1);
        const H = canvas.height / (window.devicePixelRatio || 1);
        let t = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, W, H);
            t += 0.025;

            const pad = 16, topY = 16, botY = H - 20;
            const soilH = botY - topY;
            const scale = soilH / z;
            const nfY = topY + zw * scale;
            const profX = pad + 8;

            // ─ Columna de suelo
            const dryGrad = ctx.createLinearGradient(profX + 8, topY, profX + 8, nfY);
            dryGrad.addColorStop(0, '#4a3220');
            dryGrad.addColorStop(1, '#3d2b1a');
            ctx.fillStyle = dryGrad;
            ctx.fillRect(profX + 8, topY, W - profX - 24, Math.max(0, nfY - topY));

            // Suelo saturado
            const satGrad = ctx.createLinearGradient(profX + 8, nfY, profX + 8, botY);
            satGrad.addColorStop(0, '#2d4a6b');
            satGrad.addColorStop(1, '#1e3550');
            ctx.fillStyle = satGrad;
            ctx.fillRect(profX + 8, nfY, W - profX - 24, Math.max(0, botY - nfY));

            // ─ Textura suelo seco
            ctx.fillStyle = 'rgba(255,200,150,0.04)';
            for (let py = topY + 5; py < nfY; py += 9) {
                for (let px = profX + 14; px < W - 20; px += 10) {
                    ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI * 2); ctx.fill();
                }
            }

            // ─ Línea de nivel freático animada
            const wave = 2 * Math.sin(t);
            ctx.strokeStyle = '#38e8c8'; ctx.lineWidth = 2;
            ctx.shadowColor = '#38e8c8'; ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.moveTo(profX + 8, nfY + wave);
            for (let wx = profX + 8; wx < W - 16; wx += 3) {
                ctx.lineTo(wx, nfY + Math.sin((wx - profX) * 0.18 + t) * 2);
            }
            ctx.stroke(); ctx.shadowBlur = 0;

            // ─ Símbolo nivel freático
            ctx.fillStyle = '#38e8c8';
            ctx.font = "11px 'JetBrains Mono',monospace";
            ctx.textAlign = 'right';
            ctx.fillText('N.F.', W - 16, nfY - 5);

            // ─ Regla de profundidades (izquierda)
            ctx.strokeStyle = '#4a5570'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(profX, topY); ctx.lineTo(profX, botY); ctx.stroke();
            // marcas
            for (let d = 0; d <= z; d++) {
                const ty = topY + d * scale;
                ctx.beginPath(); ctx.moveTo(profX, ty); ctx.lineTo(profX + 6, ty); ctx.stroke();
                if (d % Math.max(1, Math.floor(z / 4)) === 0) {
                    ctx.textAlign = 'right';
                    this._label(ctx, `${d}m`, profX - 2, ty + 4, '#4a5570', 8);
                }
            }

            // ─ Flechas de esfuerzos
            const midY = (topY + botY) / 2;
            // sigma total (hacia abajo)
            this._arrow(ctx, W - 32, topY + 6, W - 32, botY - 6, '#f97b4f', 5);
            ctx.textAlign = 'center';
            this._label(ctx, 'σ', W - 32, topY + 4, '#f97b4f', 9);
            // presión de poros (hacia arriba) — solo si hay NF
            if (zw < z) {
                this._arrow(ctx, W - 20, botY - 6, W - 20, nfY + 6, '#4f9cf9', 5);
                this._label(ctx, 'u', W - 20, botY, '#4f9cf9', 9);
            }

            // ─ Punto de análisis
            const anaY = botY;
            ctx.fillStyle = '#f9c74f';
            ctx.shadowColor = '#f9c74f'; ctx.shadowBlur = 5;
            ctx.beginPath(); ctx.arc(profX + (W - profX - 24) / 2 + 8, anaY - 4, 4, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;
            ctx.textAlign = 'center';
            this._label(ctx, `z = ${z} m`, profX + (W - profX - 24) / 2 + 8, botY + 12, '#f9c74f', 8);
        });
    },

    // ─── ANCLAJE — Barra embebida con longitud de desarrollo visual ──────────
    anclaje(canvas, cm) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const W = canvas.width / (window.devicePixelRatio || 1);
        const H = canvas.height / (window.devicePixelRatio || 1);
        let t = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, W, H);
            t += 0.02;

            const cy = H / 2, ldPx = Math.min(cm * 2.2, W - 80);
            const embedX = 30, endX = embedX + ldPx;

            // ─ Bloque de hormigón
            ctx.fillStyle = '#2a3040';
            ctx.fillRect(embedX - 12, cy - 32, ldPx + 24, 64);
            ctx.strokeStyle = '#3a4558'; ctx.lineWidth = 1;
            ctx.strokeRect(embedX - 12, cy - 32, ldPx + 24, 64);
            this._label(ctx, 'Hormigón  f\'c', embedX, cy + 26, '#4a5570', 8);

            // ─ Textura hormigón
            ctx.fillStyle = 'rgba(255,255,255,0.015)';
            for (let px = embedX - 8; px < endX + 12; px += 12) {
                for (let py = cy - 28; py < cy + 28; py += 12) {
                    ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI * 2); ctx.fill();
                }
            }

            // ─ Barra de acero
            const barGrad = ctx.createLinearGradient(0, cy - 4, 0, cy + 4);
            barGrad.addColorStop(0, '#94a3b8');
            barGrad.addColorStop(.5, '#e2e8f0');
            barGrad.addColorStop(1, '#64748b');
            ctx.fillStyle = barGrad;
            ctx.fillRect(endX + 12, cy - 4, W - endX - 12, 8);
            ctx.fillRect(embedX, cy - 4, ldPx, 8);

            // Estrías de la barra (corrugada)
            ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1;
            for (let bx = embedX + 6; bx < endX; bx += 10) {
                ctx.beginPath();
                ctx.moveTo(bx, cy - 6); ctx.lineTo(bx + 4, cy + 6);
                ctx.stroke();
            }

            // ─ Fuerza de tracción (flecha a la derecha)
            const pulse = 1 + 0.15 * Math.sin(t * 2);
            ctx.strokeStyle = '#f94f4f'; ctx.lineWidth = 2 * pulse;
            ctx.shadowColor = '#f94f4f'; ctx.shadowBlur = 8 * pulse;
            this._arrow(ctx, W - 26, cy, W - 6, cy, '#f94f4f', 7);
            ctx.shadowBlur = 0;
            this._label(ctx, 'T (tracción)', W - 24, cy - 8, '#f94f4f', 8);

            // ─ Gradiente de adherencia (de rojo a verde)
            const adGrad = ctx.createLinearGradient(embedX, cy - 2, endX, cy - 2);
            adGrad.addColorStop(0, 'rgba(249,79,79,0.35)');
            adGrad.addColorStop(1, 'rgba(79,249,123,0.15)');
            ctx.fillStyle = adGrad;
            ctx.fillRect(embedX, cy - 4, ldPx, 8);

            // ─ Cota longitud de anclaje
            this._dim(ctx, embedX, cy - 36, endX, `ld = ${cm.toFixed(1)} cm`, '#38e8c8');

            // ─ Indicador punto de inicio
            ctx.strokeStyle = '#f9c74f'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(endX + 12, cy - 20); ctx.lineTo(endX + 12, cy + 20); ctx.stroke();
            ctx.textAlign = 'center';
            this._label(ctx, 'inicio anclaje', endX + 12, cy + 30, '#f9c74f', 8);
        });
    },

    // ─── ESCORRENTÍA — Cuenca hidrográfica con caudal de salida ─────────────
    escorrentia(canvas, Q) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const W = canvas.width / (window.devicePixelRatio || 1);
        const H = canvas.height / (window.devicePixelRatio || 1);
        let t = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, W, H);
            t += 0.03;

            // ─ Cuenca (perfil montaña)
            const hillPts = [
                [0, H*0.55], [W*0.08, H*0.35], [W*0.22, H*0.18],
                [W*0.4, H*0.45], [W*0.5, H*0.55], [W*0.62, H*0.40],
                [W*0.78, H*0.22], [W*0.9, H*0.38], [W, H*0.5], [W, H], [0, H]
            ];
            ctx.fillStyle = '#2d4020';
            ctx.beginPath();
            ctx.moveTo(hillPts[0][0], hillPts[0][1]);
            hillPts.forEach(([x, y]) => ctx.lineTo(x, y));
            ctx.closePath(); ctx.fill();
            // borde cresta
            ctx.strokeStyle = '#3d5530'; ctx.lineWidth = 1.5;
            ctx.beginPath(); hillPts.slice(0, -2).forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)); ctx.stroke();

            // ─ Lluvia animada
            ctx.strokeStyle = '#4f9cf9'; ctx.lineWidth = 1;
            for (let rx = 15; rx < W - 10; rx += 18) {
                const phase = (t * 80 + rx * 3) % (H * 0.5);
                const ry = phase;
                ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx - 2, ry + 8); ctx.stroke();
            }

            // ─ Flujo hacia el punto de salida (abajo centro)
            const outX = W * 0.5, outY = H * 0.56;
            // arroyos convergentes
            const streams = [
                [[W*0.15, H*0.42], [W*0.28, H*0.50], [outX, outY]],
                [[W*0.35, H*0.52], [outX, outY]],
                [[W*0.7, H*0.45],  [W*0.58, H*0.52], [outX, outY]],
                [[W*0.88, H*0.44], [W*0.72, H*0.50], [outX, outY]],
            ];
            const flowPos = (t * 0.6) % 1;
            streams.forEach(pts => {
                ctx.strokeStyle = 'rgba(79,156,249,0.5)'; ctx.lineWidth = 1.5;
                ctx.beginPath(); pts.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)); ctx.stroke();
                // partícula
                if (pts.length >= 2) {
                    const idx = Math.floor(flowPos * (pts.length - 1));
                    const frac = (flowPos * (pts.length - 1)) % 1;
                    const p0 = pts[Math.min(idx, pts.length - 1)];
                    const p1 = pts[Math.min(idx + 1, pts.length - 1)];
                    const px = p0[0] + (p1[0] - p0[0]) * frac;
                    const py = p0[1] + (p1[1] - p0[1]) * frac;
                    ctx.fillStyle = '#38e8c8'; ctx.shadowColor = '#38e8c8'; ctx.shadowBlur = 4;
                    ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI * 2); ctx.fill();
                    ctx.shadowBlur = 0;
                }
            });

            // ─ Sección de salida
            ctx.fillStyle = '#1e3a5f';
            ctx.fillRect(outX - 14, outY - 4, 28, H - outY + 4);
            const lvl = Math.min(Q * 18, 22) * (0.9 + 0.1 * Math.sin(t * 3));
            ctx.fillStyle = '#3b82f6';
            ctx.shadowColor = '#3b82f6'; ctx.shadowBlur = 6;
            ctx.fillRect(outX - 14, outY - 4 + (22 - lvl), 28, lvl);
            ctx.shadowBlur = 0;

            // ─ Labels
            ctx.textAlign = 'center';
            this._label(ctx, `Q = ${Q.toFixed(3)} m³/s`, outX, outY - 10, '#38e8c8', 9);
            this._label(ctx, `= ${(Q * 1000).toFixed(0)} L/s`, outX, H - 4, '#4f9cf9', 8);
        });
    },

    // ─── RANKINE — Muro de contención con diagrama de presiones ─────────────
    rankine(canvas, H_muro, Pa) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const W = canvas.width / (window.devicePixelRatio || 1);
        const H = canvas.height / (window.devicePixelRatio || 1);
        let t = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, W, H);
            t += 0.02;

            const pad = 16, muroX = pad + 50, muroW = 24;
            const topY = 14, botY = H - 20, muroH = botY - topY;
            const maxPressW = W - muroX - muroW - pad - 20;

            // ─ Relleno de tierra (lado activo)
            const soilGrad = ctx.createLinearGradient(pad, topY, muroX, botY);
            soilGrad.addColorStop(0, '#4a3220');
            soilGrad.addColorStop(1, '#3d2b1a');
            ctx.fillStyle = soilGrad;
            ctx.fillRect(pad, topY, muroX - pad, muroH);
            // textura
            ctx.fillStyle = 'rgba(255,200,150,0.04)';
            for (let py = topY + 4; py < botY; py += 8) {
                for (let px = pad + 4; px < muroX; px += 10) {
                    ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI * 2); ctx.fill();
                }
            }

            // ─ Muro de contención
            const wallGrad = ctx.createLinearGradient(muroX, 0, muroX + muroW, 0);
            wallGrad.addColorStop(0, '#5a6880');
            wallGrad.addColorStop(.5, '#8899bb');
            wallGrad.addColorStop(1, '#4a5570');
            ctx.fillStyle = wallGrad;
            ctx.fillRect(muroX, topY, muroW, muroH);
            // zapata del muro
            ctx.fillStyle = '#4a5570';
            ctx.fillRect(muroX - 10, botY, muroW + 20, 8);

            // ─ Diagrama de presiones (triángulo — Rankine)
            const pulse = 0.9 + 0.1 * Math.sin(t);
            const pressGrad = ctx.createLinearGradient(0, topY, 0, botY);
            pressGrad.addColorStop(0, 'rgba(217,119,6,0.05)');
            pressGrad.addColorStop(1, `rgba(217,119,6,${0.35 * pulse})`);
            ctx.fillStyle = pressGrad;
            ctx.beginPath();
            ctx.moveTo(muroX + muroW, topY);
            ctx.lineTo(muroX + muroW + maxPressW * pulse, botY);
            ctx.lineTo(muroX + muroW, botY);
            ctx.closePath(); ctx.fill();

            // Borde del diagrama
            ctx.strokeStyle = `rgba(249,124,79,${0.7 * pulse})`; ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(muroX + muroW, topY);
            ctx.lineTo(muroX + muroW + maxPressW * pulse, botY);
            ctx.stroke();

            // ─ Flechas de presión (horizontales)
            const nArr = 5;
            for (let i = 1; i <= nArr; i++) {
                const ay = topY + (muroH / (nArr + 1)) * i;
                const al = maxPressW * (i / (nArr + 1)) * pulse;
                const ac = `rgba(249,124,79,${0.4 + 0.3 * (i / nArr)})`;
                this._arrow(ctx, muroX + muroW + al, ay, muroX + muroW + 2, ay, ac, 4);
            }

            // ─ Resultante (1/3 de la altura desde abajo)
            const resY = botY - muroH / 3;
            ctx.strokeStyle = '#f97b4f'; ctx.lineWidth = 2;
            ctx.shadowColor = '#f97b4f'; ctx.shadowBlur = 6;
            this._arrow(ctx, muroX + muroW + maxPressW * 0.7, resY, muroX + muroW + 2, resY, '#f97b4f', 6);
            ctx.shadowBlur = 0;
            ctx.textAlign = 'left';
            this._label(ctx, `Pa = ${Pa.toFixed(1)} kN/m`, muroX + muroW + maxPressW * 0.72, resY - 5, '#f97b4f', 9);

            // ─ Cotas
            this._arrow(ctx, pad + 8, topY + 4, pad + 8, botY - 4, '#4a5570', 4);
            this._arrow(ctx, pad + 8, botY - 4, pad + 8, topY + 4, '#4a5570', 4);
            ctx.textAlign = 'center';
            this._label(ctx, `H=${H_muro}m`, pad + 4, (topY + botY) / 2, '#8a97b0', 8);
        });
    },

    // ─── EULER — Pilar con modo de pandeo y carga crítica ─────────────────────
    euler(canvas, kN) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const W = canvas.width / (window.devicePixelRatio || 1);
        const H = canvas.height / (window.devicePixelRatio || 1);
        let t = 0;
        const isCritical = kN < 500;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, W, H);
            t += 0.025;

            const cx = W / 2, topY = 18, botY = H - 18, pilH = botY - topY;
            const pilW = 14;

            // ─ Placa superior
            ctx.fillStyle = '#4a5570';
            ctx.fillRect(cx - 30, topY - 6, 60, 8);
            // Placa inferior
            ctx.fillRect(cx - 30, botY - 2, 60, 8);

            // ─ Carga aplicada (flechas desde arriba)
            const loadColor = isCritical ? '#f94f4f' : '#4f9cf9';
            const nLoad = 4;
            for (let i = 0; i < nLoad; i++) {
                const lx = cx - 24 + i * 16;
                const pulse = 1 + 0.1 * Math.sin(t * 2 + i);
                this._arrow(ctx, lx, topY - 24 * pulse, lx, topY - 8, loadColor, 5);
            }
            ctx.textAlign = 'center';
            this._label(ctx, `P = ${kN.toFixed(0)} kN`, cx, topY - 28, loadColor, 9);

            // ─ Pilar con deformación de pandeo
            const amp = isCritical
                ? 18 * (0.5 + 0.5 * Math.sin(t))    // pandeo animado severo
                : 5 * Math.sin(t * 0.5);              // vibración suave

            ctx.strokeStyle = '#8899bb'; ctx.lineWidth = pilW;
            ctx.lineCap = 'round';
            ctx.shadowColor = isCritical ? '#f94f4f' : '#4f9cf9';
            ctx.shadowBlur = isCritical ? 14 * Math.abs(Math.sin(t)) : 4;
            ctx.beginPath();
            ctx.moveTo(cx, topY);
            for (let y = topY; y <= botY; y++) {
                const pct = (y - topY) / pilH;
                const dx = amp * Math.sin(pct * Math.PI);
                ctx.lineTo(cx + dx, y);
            }
            ctx.stroke(); ctx.shadowBlur = 0;

            // ─ Línea de pilar recto de referencia
            ctx.strokeStyle = '#3a4558'; ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.beginPath(); ctx.moveTo(cx, topY); ctx.lineTo(cx, botY); ctx.stroke();
            ctx.setLineDash([]);

            // ─ Cota longitud
            this._arrow(ctx, cx - 36, topY, cx - 36, botY, '#4a5570', 3);
            this._arrow(ctx, cx - 36, botY, cx - 36, topY, '#4a5570', 3);
            ctx.textAlign = 'right';
            this._label(ctx, 'L', cx - 40, (topY + botY) / 2 + 4, '#4a5570', 9);

            // ─ Badge estado
            const badge = isCritical ? '#f94f4f' : '#4ff97b';
            const msg   = isCritical ? '⚠ PANDEO INMINENTE' : '✓ Estable';
            ctx.fillStyle = badge + '22'; ctx.strokeStyle = badge; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.roundRect(cx - 60, H - 16, 120, 14, 3); ctx.fill(); ctx.stroke();
            ctx.textAlign = 'center';
            this._label(ctx, msg, cx, H - 5, badge, 8);
        });
    },

    // ─── ESPONJAMIENTO — Comparación volumétrica banco vs suelto ─────────────
    esponjamiento(canvas, vb, vs) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const W = canvas.width / (window.devicePixelRatio || 1);
        const H = canvas.height / (window.devicePixelRatio || 1);
        let t = 0;
        const ratio = vs / vb;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, W, H);
            t += 0.02;

            const pad = 16, groundY = H - 24;
            const bW = 60, midX = W / 2;

            // ─ Suelo de referencia
            ctx.fillStyle = '#1a2230';
            ctx.fillRect(0, groundY, W, H - groundY);
            ctx.strokeStyle = '#2a3040'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(W, groundY); ctx.stroke();

            // ─── BLOQUE BANCO (izquierda, compacto) ──────────────────────────
            const bkH = Math.min(H * 0.5, 80);
            const bkX = midX - bW - 22, bkY = groundY - bkH;

            ctx.fillStyle = '#5c3a1e';
            ctx.fillRect(bkX, bkY, bW, bkH);
            // líneas de estratificación
            ctx.strokeStyle = '#7a4d2a'; ctx.lineWidth = 0.8;
            for (let ly = bkY + 10; ly < groundY; ly += 12) {
                ctx.beginPath(); ctx.moveTo(bkX, ly); ctx.lineTo(bkX + bW, ly); ctx.stroke();
            }
            ctx.strokeStyle = '#7a4d2a'; ctx.lineWidth = 1.5;
            ctx.strokeRect(bkX, bkY, bW, bkH);
            ctx.textAlign = 'center';
            this._label(ctx, 'BANCO', bkX + bW / 2, bkY - 8, '#8a97b0', 8);
            this._label(ctx, `${vb.toFixed(1)} m³`, bkX + bW / 2, bkY - 18, '#e8edf5', 9);

            // ─── BLOQUE SUELTO (derecha, expandido) ──────────────────────────
            const slH = Math.min(bkH * ratio * (0.97 + 0.03 * Math.sin(t)), H * 0.75);
            const slW = bW * Math.sqrt(ratio);
            const slX = midX + 22, slY = groundY - slH;

            // Gradiente marrón claro (suelto)
            const slGrad = ctx.createLinearGradient(slX, slY, slX + slW, groundY);
            slGrad.addColorStop(0, '#8b5e3c');
            slGrad.addColorStop(1, '#6b4226');
            ctx.fillStyle = slGrad;
            ctx.fillRect(slX, slY, slW, slH);
            // gránulos (textura suelo suelto)
            ctx.fillStyle = 'rgba(255,200,150,0.07)';
            for (let py = slY + 4; py < groundY; py += 7) {
                for (let px = slX + 4; px < slX + slW; px += 8) {
                    ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI * 2); ctx.fill();
                }
            }
            ctx.strokeStyle = '#9a6a46'; ctx.lineWidth = 1.5;
            ctx.strokeRect(slX, slY, slW, slH);
            ctx.textAlign = 'center';
            this._label(ctx, 'SUELTO', slX + slW / 2, slY - 8, '#8a97b0', 8);
            this._label(ctx, `${vs.toFixed(1)} m³`, slX + slW / 2, slY - 18, '#f9c74f', 9);

            // ─ Flecha de expansión
            this._arrow(ctx, bkX + bW + 4, bkY + bkH / 2, slX - 4, slY + slH / 2, '#38e8c8', 5);
            ctx.textAlign = 'center';
            this._label(ctx, `+${((ratio - 1) * 100).toFixed(0)}%`, midX, bkY + bkH / 2 - 10, '#38e8c8', 9);

            // ─ Escala en el suelo
            this._label(ctx, `Esponjamiento: ${((ratio-1)*100).toFixed(1)}%`, W/2, H - 6, '#8a97b055', 8);
        });
    },

    // ─── MORTERO — Proporciones en diagrama de barras ─────────────────────────
    mortero(canvas, bolsas, arena) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const W = canvas.width / (window.devicePixelRatio || 1);
        const H = canvas.height / (window.devicePixelRatio || 1);
        let t = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, W, H);
            t += 0.015;

            const pad = 20, botY = H - 30, barW = 44;
            const maxH = botY - 30;

            // Datos de barras
            const items = [
                { label: 'Cemento', val: bolsas, unit: 'bolsas', color: '#8899bb', max: bolsas * 1.2 },
                { label: 'Arena',   val: arena,  unit: 'm³',     color: '#f9c74f', max: arena * 1.2 },
                { label: 'Agua',    val: bolsas * 0.22, unit: 'm³', color: '#4f9cf9', max: bolsas * 0.22 * 1.2 },
            ];

            const spacing = (W - pad * 2) / items.length;

            items.forEach((item, i) => {
                const cx = pad + spacing * i + spacing / 2;
                const fill = Math.min(item.val / item.max, 1);
                const bH = maxH * fill * (1 + 0.04 * Math.sin(t + i));
                const bY = botY - bH;
                const bX = cx - barW / 2;

                // Sombra de la barra
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.fillRect(bX + 3, bY + 3, barW, bH);

                // Barra principal
                const barGrad = ctx.createLinearGradient(bX, bY, bX + barW, bY);
                barGrad.addColorStop(0, item.color + 'cc');
                barGrad.addColorStop(.5, item.color);
                barGrad.addColorStop(1, item.color + 'aa');
                ctx.fillStyle = barGrad;
                ctx.fillRect(bX, bY, barW, bH);

                // Highlight
                ctx.fillStyle = 'rgba(255,255,255,0.12)';
                ctx.fillRect(bX, bY, 6, bH);

                // Valor encima
                ctx.textAlign = 'center';
                this._label(ctx, `${item.val.toFixed(1)}`, cx, bY - 10, item.color, 9);
                this._label(ctx, item.unit, cx, bY - 1, item.color + '99', 7);

                // Label abajo
                this._label(ctx, item.label, cx, botY + 12, '#8a97b0', 8);
            });

            // Línea de base
            ctx.strokeStyle = '#2a3040'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(pad, botY); ctx.lineTo(W - pad, botY); ctx.stroke();

            // Título
            ctx.textAlign = 'center';
            this._label(ctx, 'Dosificación por m³ de mortero', W / 2, 10, '#4a5570', 8);
        });
    },

    // ─── EVAPORACIÓN — Sección de losa con gradiente de riesgo ───────────────
    evaporacion(canvas, E) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const W = canvas.width / (window.devicePixelRatio || 1);
        const H = canvas.height / (window.devicePixelRatio || 1);
        let t = 0;
        const isCritical = E > 1.0;
        const isHigh = E > 0.5;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, W, H);
            t += 0.03;

            const pad = 14, losaY = H * 0.45, losaH = 22;
            const losaX = pad, losaW = W - pad * 2;

            // ─ Cielo / ambiente
            const skyGrad = ctx.createLinearGradient(0, 0, 0, losaY);
            skyGrad.addColorStop(0, isCritical ? 'rgba(249,79,79,0.08)' : 'rgba(79,156,249,0.06)');
            skyGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = skyGrad; ctx.fillRect(0, 0, W, losaY);

            // ─ Losa de hormigón
            ctx.fillStyle = '#3a4558';
            ctx.fillRect(losaX, losaY, losaW, losaH);
            // textura de áridos
            ctx.fillStyle = 'rgba(255,255,255,0.04)';
            for (let px = losaX + 5; px < losaX + losaW; px += 9) {
                for (let py = losaY + 4; py < losaY + losaH - 4; py += 7) {
                    ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI * 2); ctx.fill();
                }
            }
            // armadura
            ctx.strokeStyle = '#5a6880'; ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(losaX + 6, losaY + losaH / 2);
            ctx.lineTo(losaX + losaW - 6, losaY + losaH / 2);
            ctx.stroke();
            for (let rx = losaX + 16; rx < losaX + losaW; rx += 24) {
                ctx.beginPath(); ctx.moveTo(rx, losaY + 4); ctx.lineTo(rx, losaY + losaH - 4); ctx.stroke();
            }
            ctx.strokeStyle = '#8899bb'; ctx.lineWidth = 1;
            ctx.strokeRect(losaX, losaY, losaW, losaH);

            // ─ Vapor de agua subiendo
            const nStreams = 8;
            for (let i = 0; i < nStreams; i++) {
                const sx = losaX + (losaW / (nStreams - 1)) * i;
                const speed = 0.5 + 0.5 * ((i * 3 + 7) % 5 / 5);
                const phase = (t * speed + i * 0.7) % 1;
                const vy = losaY - phase * (losaY - 4);
                const alpha = (1 - phase) * (isCritical ? 0.7 : 0.3);
                const evColor = isCritical ? '#f94f4f' : isHigh ? '#f9c74f' : '#4f9cf9';
                const sz = 3 + phase * 6;
                ctx.fillStyle = `rgba(${isCritical?'249,79,79':isHigh?'249,199,79':'79,156,249'},${alpha})`;
                ctx.shadowColor = evColor; ctx.shadowBlur = isCritical ? 8 : 3;
                ctx.beginPath(); ctx.arc(sx, vy, sz, 0, Math.PI * 2); ctx.fill();
                ctx.shadowBlur = 0;
            }

            // ─ Fisuras si es crítico
            if (isCritical) {
                ctx.strokeStyle = 'rgba(249,79,79,0.6)'; ctx.lineWidth = 1;
                const crackY = losaY + 4;
                for (let cx2 = losaX + 20; cx2 < losaX + losaW; cx2 += 55) {
                    ctx.beginPath();
                    ctx.moveTo(cx2, crackY);
                    ctx.lineTo(cx2 + 5, crackY + 5);
                    ctx.lineTo(cx2 + 2, crackY + 10);
                    ctx.lineTo(cx2 + 8, crackY + 15);
                    ctx.stroke();
                }
            }

            // ─ Parámetros ambientales (íconos)
            const evColor2 = isCritical ? '#f94f4f' : isHigh ? '#f9c74f' : '#4ff97b';
            ctx.textAlign = 'left';
            this._label(ctx, `☀ Evap.`, losaX, losaY - 6, '#8a97b055', 8);

            // ─ Badge resultado
            ctx.fillStyle = evColor2 + '22'; ctx.strokeStyle = evColor2; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.roundRect(W / 2 - 64, 4, 128, 18, 4); ctx.fill(); ctx.stroke();
            ctx.textAlign = 'center';
            this._label(ctx, `${E.toFixed(3)} kg/m²/h`, W / 2, 16, evColor2, 9);

            // ─ Suelo bajo la losa
            ctx.fillStyle = '#1a2230';
            ctx.fillRect(losaX, losaY + losaH, losaW, H - losaY - losaH);

            // Mensaje de riesgo
            if (isCritical) {
                const blink = Math.sin(t * 4) > 0;
                if (blink) {
                    ctx.textAlign = 'center';
                    this._label(ctx, '⚠ Riesgo de fisuración plástica', W / 2, H - 6, '#f94f4f', 8);
                }
            } else {
                ctx.textAlign = 'center';
                this._label(ctx, isHigh ? 'Monitoreo recomendado' : 'Curado normal', W / 2, H - 6, evColor2 + 'aa', 8);
            }
        });
    },

    factor_seguridad: function(canvas, fs) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const W = canvas.width / (window.devicePixelRatio || 1);
        const H = canvas.height / (window.devicePixelRatio || 1);
        let t = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, W, H);
            t += 0.03;

            const cy = H / 2;
            const maxFs = 4;
            const pct = Math.min(fs / maxFs, 1);
            const pad = 30;
            const barW = W - 2 * pad;
            const barH = 36;
            const color = fs < 1 ? '#f94f4f' : fs < 1.5 ? '#f9c74f' : fs < 2 ? '#4f9cf9' : '#4ff97b';

            const bg = ctx.createRadialGradient(W/2, H/2, 5, W/2, H/2, W*0.4);
            bg.addColorStop(0, `${color}11`);
            bg.addColorStop(1, 'rgba(10,11,14,0)');
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, W, H);

            ctx.fillStyle = '#1a1f2e';
            ctx.beginPath();
            ctx.roundRect(pad, cy - barH/2, barW, barH, 8);
            ctx.fill();

            const anim = Math.min(t * 2, 1);
            const fillW = barW * pct * anim;

            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.roundRect(pad, cy - barH/2, fillW, barH, [8, 0, 0, 8]);
            ctx.fill();
            ctx.shadowBlur = 0;

            const x1 = pad + barW * (1 / maxFs);
            ctx.strokeStyle = '#f94f4f';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(x1, cy - barH/2 - 6);
            ctx.lineTo(x1, cy + barH/2 + 6);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = '#f94f4f';
            ctx.font = '7px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText('FS=1 (falla)', x1, cy + barH/2 + 14);

            const x2 = pad + barW * (2 / maxFs);
            ctx.strokeStyle = '#4ff97b';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(x2, cy - barH/2 - 6);
            ctx.lineTo(x2, cy + barH/2 + 6);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`FS = ${fs.toFixed(2)}`, W/2, cy);

            ctx.fillStyle = '#8a99ad';
            ctx.font = '7px JetBrains Mono';
            ctx.textBaseline = 'top';
            ctx.textAlign = 'left';
            ctx.fillText('0', pad, cy + barH/2 + 4);
            ctx.textAlign = 'right';
            ctx.fillText(maxFs.toString(), pad + barW, cy + barH/2 + 4);
        });
    }
});

// =============================================================================
// CÓMPUTO Y REGULACIÓN (5)
// =============================================================================

// ─── C1. EXCAVACIÓN — Perfil transversal de excavación con talud ──────────
CivilVisual.excavacion = function(canvas, L, A, P, V) {
    this._stopLoop(canvas);
    const ctx = this.initCanvas(canvas);
    const W = canvas.width / (window.devicePixelRatio || 1);
    const H = canvas.height / (window.devicePixelRatio || 1);
    let t = 0;

    this._startLoop(canvas, () => {
        ctx.clearRect(0, 0, W, H);
        t += 0.02;

        const pad = 20, bY = H - 30;
        const cx = W / 2, digW = Math.min(W * 0.6, 140), digH = Math.min(H * 0.45, 80);
        const topY = bY - digH, leftX = cx - digW / 2, rightX = cx + digW / 2;

        // Cielo
        ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, W, bY);

        // Suelo
        const sueloGrad = ctx.createLinearGradient(0, topY, 0, bY);
        sueloGrad.addColorStop(0, '#3d2b1a'); sueloGrad.addColorStop(1, '#2a1f10');
        ctx.fillStyle = sueloGrad;
        ctx.beginPath();
        ctx.moveTo(0, bY); ctx.lineTo(0, topY);
        ctx.lineTo(leftX, topY);
        ctx.lineTo(leftX, bY);
        ctx.lineTo(0, bY);
        ctx.closePath(); ctx.fill();

        ctx.beginPath();
        ctx.moveTo(rightX, bY); ctx.lineTo(rightX, topY);
        ctx.lineTo(W, topY);
        ctx.lineTo(W, bY);
        ctx.closePath(); ctx.fill();

        // Excavación
        ctx.fillStyle = 'rgba(30,35,50,0.9)';
        ctx.fillRect(leftX, topY, digW, digH);
        ctx.strokeStyle = '#4f9cf9'; ctx.lineWidth = 2;
        ctx.strokeRect(leftX, topY, digW, digH);

        // Líneas de talud (diagonales)
        ctx.strokeStyle = '#f9c74f'; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]);
        const taludAncho = digW * 0.3;
        ctx.beginPath(); ctx.moveTo(leftX, topY); ctx.lineTo(leftX - taludAncho, bY); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(rightX, topY); ctx.lineTo(rightX + taludAncho, bY); ctx.stroke();
        ctx.setLineDash([]);

        // Cota profundidad
        this._arrow(ctx, cx + digW / 2 + 16, bY, cx + digW / 2 + 16, topY, '#f97b4f', 4);
        ctx.textAlign = 'left';
        this._label(ctx, `P=${P}m`, cx + digW / 2 + 20, (bY + topY) / 2, '#f97b4f', 8);

        // Cota ancho
        this._dim(ctx, leftX, bY + 10, rightX, `A=${A}m`, '#4a5570');

        // Cota largo
        this._dim(ctx, 8, topY + 16, leftX - 8, `L=${L}m`, '#4a5570');

        // Pulso de volumen
        const pulse = 0.5 + 0.5 * Math.sin(t);
        ctx.fillStyle = '#4fffa0'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
        ctx.fillText(`V = ${V.toFixed(1)} m³`, cx, topY - 10);

        // Partículas de movimiento de tierra
        ctx.fillStyle = '#f9c74f';
        for (let i = 0; i < 5; i++) {
            const px = leftX + Math.random() * digW;
            const py = topY + Math.random() * digH;
            ctx.globalAlpha = 0.3 + 0.3 * Math.sin(t + i * 2);
            ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI * 2); ctx.fill();
            ctx.globalAlpha = 1;
        }
    });
};

// ─── C2. PINTURA — Lata con nivel de pintura animado ─────────────────────
CivilVisual.pintura = function(canvas, area, manos, litros) {
    this._stopLoop(canvas);
    const ctx = this.initCanvas(canvas);
    const W = canvas.width / (window.devicePixelRatio || 1);
    const H = canvas.height / (window.devicePixelRatio || 1);
    let t = 0;

    this._startLoop(canvas, () => {
        ctx.clearRect(0, 0, W, H);
        t += 0.02;

        const cx = W / 2, lataW = 50, lataH = Math.min(H * 0.55, 90);
        const lataX = cx - lataW / 2, lataY = H - 35 - lataH;
        const fillPct = Math.min(1, litros / 20);

        // Lata
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(lataX, lataY, lataW, lataH, [4, 4, 0, 0]);
        ctx.fill();
        ctx.strokeStyle = '#4a5570'; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(lataX, lataY, lataW, lataH, [4, 4, 0, 0]);
        ctx.stroke();

        // Borde de lata
        ctx.fillStyle = '#3a4558';
        ctx.fillRect(lataX - 3, lataY - 4, lataW + 6, 6);
        ctx.strokeStyle = '#5a6880'; ctx.lineWidth = 1;
        ctx.strokeRect(lataX - 3, lataY - 4, lataW + 6, 6);

        // Pintura dentro
        const pinturaH = lataH * fillPct;
        const colorInt = Math.min(1, fillPct * 1.5);
        ctx.fillStyle = `rgb(${Math.floor(30 + 200 * colorInt)}, ${Math.floor(80 + 100 * colorInt)}, ${Math.floor(180 - 150 * colorInt)})`;
        ctx.fillRect(lataX + 2, lataY + lataH - pinturaH + 2, lataW - 4, pinturaH - 2);

        // Ondas en la pintura
        ctx.fillStyle = `rgb(${Math.floor(60 + 220 * colorInt)}, ${Math.floor(110 + 100 * colorInt)}, ${Math.floor(200 - 150 * colorInt)})`;
        ctx.beginPath();
        ctx.moveTo(lataX + 2, lataY + lataH - pinturaH);
        for (let x = lataX + 2; x <= lataX + lataW - 4; x++) {
            ctx.lineTo(x, lataY + lataH - pinturaH + Math.sin(x * 0.3 + t * 4) * 2);
        }
        ctx.lineTo(lataX + lataW - 4, lataY + lataH - pinturaH);
        ctx.closePath(); ctx.fill();

        // Pared simulada con rodillo
        const rodX = W * 0.65, rodY = 12, rodW = 24, rodH = H - 50;
        ctx.fillStyle = '#2a3040';
        ctx.fillRect(rodX, rodY, rodW, rodH);
        const rodPct = (0.5 + 0.5 * Math.sin(t * 1.5)) * fillPct;
        ctx.fillStyle = '#7b9cf9';
        ctx.fillRect(rodX + 2, rodY + rodH - rodPct * rodH, rodW - 4, rodPct * rodH);

        // Labels
        this._label(ctx, `${litros.toFixed(2)} L`, cx, lataY + lataH + 16, '#e8edf5', 10);
        this._label(ctx, `${area} m² × ${manos} manos`, cx, lataY - 10, '#8a97b0', 8);
        this._label(ctx, 'PINTURA', rodX + rodW / 2, rodY + rodH + 14, '#4a5570', 7);
    });
};

// ─── C3. DOSIFICACIÓN HORMIGÓN — Barras de proporciones ──────────────────
CivilVisual.hormigon = function(canvas, bolsas, arena, piedra, agua, label) {
    this._stopLoop(canvas);
    const ctx = this.initCanvas(canvas);
    const W = canvas.width / (window.devicePixelRatio || 1);
    const H = canvas.height / (window.devicePixelRatio || 1);
    let t = 0;

    this._startLoop(canvas, () => {
        ctx.clearRect(0, 0, W, H);
        t += 0.015;

        const pad = 20, botY = H - 20, barW = 38;
        const maxH = botY - 40;
        const items = [
            { label: 'Cemento', val: bolsas, unit: 'bolsas', color: '#8899bb' },
            { label: 'Arena', val: arena * 1000, unit: 'L', color: '#f9c74f' },
            { label: 'Piedra', val: piedra * 1000, unit: 'L', color: '#4f9cf9' },
            { label: 'Agua', val: agua, unit: 'L', color: '#38bdf8' }
        ];
        const maxVal = Math.max(...items.map(i => i.val)) * 1.2;
        const spacing = (W - 2 * pad) / items.length;

        items.forEach((item, i) => {
            const cx = pad + spacing * i + spacing / 2;
            const fill = Math.min(item.val / maxVal, 1);
            const bH = maxH * fill * (0.95 + 0.05 * Math.sin(t + i));
            const bY = botY - bH;
            const bX = cx - barW / 2;

            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fillRect(bX + 2, bY + 2, barW, bH);

            const grad = ctx.createLinearGradient(bX, bY, bX + barW, bY);
            grad.addColorStop(0, item.color + 'cc');
            grad.addColorStop(0.5, item.color);
            grad.addColorStop(1, item.color + 'aa');
            ctx.fillStyle = grad;
            ctx.fillRect(bX, bY, barW, bH);

            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            ctx.fillRect(bX, bY, 4, bH);

            ctx.textAlign = 'center';
            this._label(ctx, item.val.toFixed(1), cx, bY - 8, item.color, 8);
            this._label(ctx, item.unit, cx, bY, item.color + '99', 6);
            this._label(ctx, item.label, cx, botY + 10, '#8a97b0', 7);
        });

        ctx.strokeStyle = '#2a3040'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(pad, botY); ctx.lineTo(W - pad, botY); ctx.stroke();

        this._label(ctx, `Dosificación ${label}`, W / 2, 10, '#4a5570', 8);
    });
};

// ─── C4. CARGA MUERTA — Sección de losa con capas ────────────────────────
CivilVisual.carga_muerta = function(canvas, CM, mat, espesor) {
    this._stopLoop(canvas);
    const ctx = this.initCanvas(canvas);
    const W = canvas.width / (window.devicePixelRatio || 1);
    const H = canvas.height / (window.devicePixelRatio || 1);
    let t = 0;

    this._startLoop(canvas, () => {
        ctx.clearRect(0, 0, W, H);
        t += 0.025;

        const cx = W / 2, losaW = Math.min(W * 0.6, 120), losaH = 30;
        const losaY = H / 2 - losaH / 2;

        // Carga (flechas hacia abajo)
        const nArr = 6;
        for (let i = 0; i < nArr; i++) {
            const ax = cx - losaW / 2 + (losaW / (nArr - 1)) * i;
            const pulse = 0.8 + 0.2 * Math.sin(t * 2 + i * 0.5);
            this._arrow(ctx, ax, losaY - 22 * pulse, ax, losaY - 4, '#f94f4f', 5);
        }

        const matColors = { ha: '#8899bb', bloq: '#c49a6c', acero: '#94a3b8' };
        const matNames = { ha: 'Hormigón Armado', bloq: 'Bloque Cerámico', acero: 'Acero' };
        const color = matColors[mat] || '#8899bb';

        // Losa
        ctx.fillStyle = color + '44';
        ctx.fillRect(cx - losaW / 2, losaY, losaW, losaH);
        ctx.strokeStyle = color; ctx.lineWidth = 2;
        ctx.strokeRect(cx - losaW / 2, losaY, losaW, losaH);

        // Armadura (barras)
        ctx.strokeStyle = color; ctx.lineWidth = 1;
        for (let rx = cx - losaW / 2 + 8; rx < cx + losaW / 2 - 8; rx += 14) {
            ctx.beginPath(); ctx.moveTo(rx, losaY + 4); ctx.lineTo(rx, losaY + losaH - 4); ctx.stroke();
        }

        // Apoyo (triángulos)
        ctx.fillStyle = '#2a3040';
        ctx.beginPath();
        ctx.moveTo(cx - losaW / 2, losaY + losaH);
        ctx.lineTo(cx - losaW / 2 - 10, losaY + losaH + 14);
        ctx.lineTo(cx - losaW / 2 + 10, losaY + losaH + 14);
        ctx.closePath(); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + losaW / 2, losaY + losaH);
        ctx.lineTo(cx + losaW / 2 - 10, losaY + losaH + 14);
        ctx.lineTo(cx + losaW / 2 + 10, losaY + losaH + 14);
        ctx.closePath(); ctx.fill();

        this._label(ctx, `${matNames[mat]} — e = ${(espesor * 100).toFixed(0)} cm`, cx, losaY - 32, '#8a97b0', 8);
        this._label(ctx, `CM = ${CM.toFixed(2)} kN/m²`, cx, losaY + losaH + 24, '#4fffa0', 10);
        this._label(ctx, 'Carga muerta total (incluye peso propio + sobrecarga)', cx, losaY + losaH + 38, '#4a5570', 7);
    });
};

// ─── C5. FOS / FOT — Diagrama de ocupación del suelo ─────────────────────
CivilVisual.fos_fot = function(canvas, S, SB, ST, FOS, FOT) {
    this._stopLoop(canvas);
    const ctx = this.initCanvas(canvas);
    const W = canvas.width / (window.devicePixelRatio || 1);
    const H = canvas.height / (window.devicePixelRatio || 1);
    let t = 0;

    this._startLoop(canvas, () => {
        ctx.clearRect(0, 0, W, H);
        t += 0.02;

        const pad = 20, terY = H * 0.3, buildH = H * 0.4;
        const terW = Math.min(W - 2 * pad, 160);
        const terX = (W - terW) / 2;

        // Terreno
        ctx.fillStyle = '#2d4020';
        ctx.fillRect(terX, terY, terW, buildH);
        ctx.strokeStyle = '#3d5530'; ctx.lineWidth = 2;
        ctx.strokeRect(terX, terY, terW, buildH);

        // Edificio (PB - FOS)
        const edifW = (SB / S) * terW;
        ctx.fillStyle = '#4a5570';
        ctx.fillRect(terX, terY + buildH - buildH * 0.3, edifW, buildH * 0.3);
        ctx.strokeStyle = '#5a6880'; ctx.lineWidth = 1.5;
        ctx.strokeRect(terX, terY + buildH - buildH * 0.3, edifW, buildH * 0.3);
        this._label(ctx, `SB=${SB}m²`, terX + edifW / 2, terY + buildH - buildH * 0.3 - 4, '#8a97b0', 7);

        // Pisos superiores (FOT)
        const numPisos = Math.max(0, Math.min(5, Math.floor((ST - SB) / (SB || 1))));
        if (numPisos > 0 && edifW > 20) {
            for (let i = 0; i < numPisos; i++) {
                const py = terY + buildH - buildH * 0.3 - (i + 1) * buildH * 0.15;
                const alpha = 0.4 + 0.3 * Math.sin(t + i * 1.5);
                ctx.fillStyle = `rgba(79,156,249,${alpha})`;
                ctx.fillRect(terX, py, edifW, buildH * 0.14);
                ctx.strokeStyle = '#4f9cf9'; ctx.lineWidth = 1;
                ctx.strokeRect(terX, py, edifW, buildH * 0.14);
            }
        }

        // Etiquetas
        ctx.textAlign = 'center';
        this._label(ctx, `Terreno: ${S.toFixed(0)} m²`, W / 2, terY - 8, '#8a97b0', 9);
        this._label(ctx, `FOS = ${FOS.toFixed(2)}`, W * 0.3, H - 14, FOS > 0.6 ? '#f9c74f' : '#4ff97b', 9);
        this._label(ctx, `FOT = ${FOT.toFixed(2)}`, W * 0.7, H - 14, FOT > 2 ? '#f9c74f' : '#4ff97b', 9);

        // Cota del terreno
        this._dim(ctx, terX, terY + buildH + 6, terX + terW, `${S.toFixed(0)} m²`, '#4a5570');
    });
};