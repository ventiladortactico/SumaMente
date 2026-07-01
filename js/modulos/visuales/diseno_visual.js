const DisenoVisual = {
    initCanvas: function(canvas) {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        return ctx;
    },

    _loop: {},
    _startLoop: function(canvas, fn) {
        if (this._loop[canvas.id]) cancelAnimationFrame(this._loop[canvas.id]);
        const animate = () => { fn(); this._loop[canvas.id] = requestAnimationFrame(animate); };
        animate();
    },
    _stopLoop: function(canvas) {
        if (this._loop[canvas.id]) { cancelAnimationFrame(this._loop[canvas.id]); delete this._loop[canvas.id]; }
    },

    conv: function(canvas, val, from, to, res) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        let phase = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);
            phase += 0.03;

            const grad = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, w * 0.5);
            grad.addColorStop(0, 'rgba(79, 156, 249, 0.05)');
            grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            ctx.strokeStyle = '#2a3345';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(20, h / 2 + 12);
            ctx.lineTo(w - 20, h / 2 + 12);
            ctx.stroke();

            for (let i = 20; i < w - 20; i += 12) {
                const isMajor = i % 48 === 20;
                ctx.strokeStyle = isMajor ? '#4a5570' : '#2a3345';
                ctx.lineWidth = isMajor ? 2 : 1;
                ctx.beginPath();
                ctx.moveTo(i, h / 2 + 12);
                ctx.lineTo(i, h / 2 + (isMajor ? 0 : 6));
                ctx.stroke();
            }

            const pct = Math.min(val / 100, 1) || 0.3;
            const pos = 20 + pct * (w - 40);
            ctx.fillStyle = '#4f9cf9';
            ctx.shadowColor = '#4f9cf9';
            ctx.shadowBlur = 10 + 5 * Math.sin(phase);
            ctx.beginPath();
            ctx.arc(pos, h / 2 + 6, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(`${val} ${from} → ${res.toFixed(1)} ${to}`, w / 2, h / 2 - 18);

            ctx.fillStyle = '#4a5570';
            ctx.font = '8px JetBrains Mono';
            ctx.fillText(`${from}`, 20, h / 2 + 28);
            ctx.textAlign = 'right';
            ctx.fillText(`${to}`, w - 20, h / 2 + 28);
        });
    },

    resolucion: function(canvas, wMM, hMM, bMM, wPx, hPx) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        const pad = 20;
        const maxDim = Math.max(wMM + bMM * 2, hMM + bMM * 2);
        const scale = Math.min((w - 2 * pad) / maxDim, (h - 2 * pad) / maxDim);
        const bW = (wMM + bMM * 2) * scale;
        const bH = (hMM + bMM * 2) * scale;
        const nW = wMM * scale;
        const nH = hMM * scale;
        const sx = (w - bW) / 2;
        const sy = (h - bH) / 2;

        ctx.clearRect(0, 0, w, h);

        const grad = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, w * 0.5);
        grad.addColorStop(0, 'rgba(249, 79, 79, 0.04)');
        grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        ctx.strokeStyle = '#f94f4f';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 4]);
        ctx.strokeRect(sx, sy, bW, bH);
        ctx.setLineDash([]);

        const iw = sx + bMM * scale;
        const ih = sy + bMM * scale;
        ctx.fillStyle = 'rgba(79, 156, 249, 0.12)';
        ctx.fillRect(iw, ih, nW, nH);
        ctx.strokeStyle = '#4f9cf9';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(iw, ih, nW, nH);

        ctx.strokeStyle = '#2a3345';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sx - 5, sy + bH / 2);
        ctx.lineTo(sx, sy + bH / 2);
        ctx.moveTo(sx + bW, sy + bH / 2);
        ctx.lineTo(sx + bW + 5, sy + bH / 2);
        ctx.moveTo(sx + bW / 2, sy - 5);
        ctx.lineTo(sx + bW / 2, sy);
        ctx.moveTo(sx + bW / 2, sy + bH);
        ctx.lineTo(sx + bW / 2, sy + bH + 5);
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(`Lienzo final: ${wPx} × ${hPx} px`, w / 2, h - 6);

        ctx.fillStyle = '#4a5570';
        ctx.font = '7px JetBrains Mono';
        ctx.fillText(`${wMM}×${hMM}mm + ${bMM}mm bleed`, w / 2, h - 18);
    },

    typeScale: function(canvas, base, h1, h2, h3, sm) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        let phase = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);
            phase += 0.02;

            ctx.fillStyle = '#fff';
            ctx.font = `bold ${Math.min(h1 * 0.6, 26)}px "Segoe UI", system-ui`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText('Encabezado H1', 15, 32);

            const h1w = ctx.measureText('Encabezado H1').width;
            ctx.fillStyle = '#4a5570';
            ctx.font = '8px JetBrains Mono';
            ctx.fillText(`${Math.round(h1)}px`, 20 + h1w + 5, 32);

            ctx.fillStyle = '#e8edf5';
            ctx.font = `bold ${Math.min(h2 * 0.6, 20)}px "Segoe UI", system-ui`;
            ctx.fillText('Encabezado H2', 15, 62);
            const h2w = ctx.measureText('Encabezado H2').width;
            ctx.fillStyle = '#4a5570';
            ctx.font = '8px JetBrains Mono';
            ctx.fillText(`${Math.round(h2)}px`, 20 + h2w + 5, 62);

            ctx.fillStyle = '#8a99ad';
            ctx.font = `${Math.min(base * 0.8, 14)}px "Segoe UI", system-ui`;
            ctx.fillText(`Texto Cuerpo (${base}px)`, 15, 90);

            ctx.fillStyle = '#627284';
            ctx.font = `${Math.min(sm * 0.8, 11)}px "Segoe UI", system-ui`;
            ctx.fillText(`Texto pequeño (${sm.toFixed(1)}px)`, 15, 112);

            ctx.strokeStyle = `rgba(79, 156, 249, ${0.1 + 0.05 * Math.sin(phase)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(15, 22 + Math.sin(phase) * 2);
            ctx.lineTo(w - 15, 22 + Math.sin(phase) * 2);
            ctx.stroke();
        });
    },

    aspectRatio: function(canvas, wo, ho, targetRatio, letterbox, pillarbox) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        let phase = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);
            phase += 0.03;

            const grad = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, w * 0.5);
            grad.addColorStop(0, 'rgba(249, 79, 79, 0.04)');
            grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            const iw = w - 40, ih = h - 40;
            ctx.fillStyle = '#1b1f2b';
            ctx.fillRect(20, 20, iw, ih);
            ctx.strokeStyle = '#374151';
            ctx.strokeRect(20, 20, iw, ih);

            ctx.fillStyle = `rgba(249, 79, 79, ${0.25 + 0.1 * Math.sin(phase)})`;
            if (letterbox > 0) {
                const off = (letterbox / ho) * ih;
                ctx.fillRect(20, 20, iw, off);
                ctx.fillRect(20, 20 + ih - off, iw, off);
            } else if (pillarbox > 0) {
                const off = (pillarbox / wo) * iw;
                ctx.fillRect(20, 20, off, ih);
                ctx.fillRect(20 + iw - off, 20, off, ih);
            }

            ctx.fillStyle = '#fff';
            ctx.font = '10px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(`Original: ${wo}×${ho}`, w / 2, h - 6);
        });
    },

    color: function(canvas, textHex, bgHex, ratio) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        let phase = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);
            phase += 0.03;

            ctx.fillStyle = bgHex;
            ctx.fillRect(0, 0, w, h);

            ctx.shadowColor = textHex;
            ctx.shadowBlur = 20;
            ctx.fillStyle = textHex;
            ctx.font = 'bold 20px "Segoe UI", system-ui';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Texto de Prueba', w / 2, h / 2 - 12);
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px JetBrains Mono';
            ctx.fillText(`Contraste: ${ratio.toFixed(1)}:1`, w / 2, h / 2 + 25);

            ctx.fillStyle = ratio >= 4.5 ? '#4ff97b' : '#f94f4f';
            ctx.font = '10px JetBrains Mono';
            ctx.fillText(ratio >= 4.5 ? '✓ WCAG AA Pass' : '✗ WCAG AA Fail', w / 2, h / 2 + 44);

            const r = 4 + 2 * Math.sin(phase);
            if (ratio >= 4.5) {
                ctx.fillStyle = 'rgba(79, 249, 123, 0.15)';
                ctx.beginPath();
                ctx.arc(w / 2, h / 2 - 12, 50 + r, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    },

    aureo: function(canvas, base, mayor, phi) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        let phase = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);

            const grad = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, w * 0.5);
            grad.addColorStop(0, 'rgba(79, 156, 249, 0.05)');
            grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            phase += 0.02;

            const total = base + mayor;
            const scale = Math.min((w - 40) / total, (h - 60) / mayor * 0.8);
            const bw = base * scale;
            const mw = mayor * scale;
            const cy = h / 2;

            ctx.fillStyle = '#4f9cf9';
            ctx.shadowColor = '#4f9cf9';
            ctx.shadowBlur = 6;
            ctx.fillRect(20, cy - bw / 2, bw, bw);
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#4ff97b';
            ctx.shadowColor = '#4ff97b';
            ctx.shadowBlur = 6;
            ctx.fillRect(20 + bw, cy - mw / 2, mw, mw);
            ctx.shadowBlur = 0;

            ctx.strokeStyle = 'rgba(255,255,255,0.15)';
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            ctx.strokeRect(20 + bw, cy - mw / 2, mw, mw);
            ctx.setLineDash([]);

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px JetBrains Mono';
            ctx.textAlign = 'left';
            const pulse = 0.8 + 0.2 * Math.sin(phase);
            ctx.globalAlpha = pulse;
            ctx.fillText('φ = ' + phi.toFixed(4), 20, cy - bw / 2 - 10);
            ctx.globalAlpha = 1;
            ctx.fillStyle = '#4a5570';
            ctx.font = '9px JetBrains Mono';
            ctx.fillText(base.toFixed(0) + ' × φ = ' + mayor.toFixed(1), 20, cy + Math.max(bw, mw) / 2 + 20);
        });
    },

    escala_grafica: function(canvas, real, escala, dibujo) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        let phase = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);

            const grad = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, w * 0.5);
            grad.addColorStop(0, 'rgba(79, 156, 249, 0.04)');
            grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            phase += 0.03;
            const barY = h / 2 - 10;
            const maxW = w - 40;
            const barW = Math.min(dibujo, maxW);

            ctx.fillStyle = '#1a1f2e';
            ctx.beginPath();
            ctx.roundRect(20, barY, maxW, 20, 4);
            ctx.fill();

            ctx.fillStyle = '#4f9cf9';
            ctx.shadowColor = '#4f9cf9';
            ctx.shadowBlur = 4;
            ctx.beginPath();
            ctx.roundRect(20, barY, barW, 20, [4, 0, 0, 4]);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 9px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(dibujo.toFixed(1) + ' mm', 20 + barW / 2, barY + 14);

            ctx.fillStyle = '#4a5570';
            ctx.font = '8px JetBrains Mono';
            ctx.textAlign = 'left';
            ctx.fillText('0', 20, barY + 35);
            ctx.textAlign = 'right';
            ctx.fillText(dibujo.toFixed(1) + ' mm', 20 + barW, barY + 35);

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 10px JetBrains Mono';
            ctx.textAlign = 'left';
            ctx.fillText('1:' + escala + ' | Real: ' + (real / 10).toFixed(1) + ' cm', 20, 25);
        });
    },

    regla_tercios: function(canvas, aw, ah, x1, x2, y1, y2) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        let phase = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);

            const grad = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, w * 0.5);
            grad.addColorStop(0, 'rgba(79, 156, 249, 0.04)');
            grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            phase += 0.03;

            const ratio = aw / ah;
            const frameW = w - 40;
            const frameH = Math.min(frameW / ratio, h - 40);
            const fw = frameW;
            const fh = frameH;
            const fx = (w - fw) / 2;
            const fy = (h - fh) / 2;

            ctx.fillStyle = '#1a1f2e';
            ctx.fillRect(fx, fy, fw, fh);
            ctx.strokeStyle = '#374151';
            ctx.lineWidth = 1;
            ctx.strokeRect(fx, fy, fw, fh);

            ctx.strokeStyle = 'rgba(249, 199, 79, 0.4)';
            ctx.lineWidth = 1;
            const tx1 = fx + fw / 3;
            const tx2 = fx + 2 * fw / 3;
            const ty1 = fy + fh / 3;
            const ty2 = fy + 2 * fh / 3;

            ctx.beginPath();
            ctx.moveTo(tx1, fy); ctx.lineTo(tx1, fy + fh);
            ctx.moveTo(tx2, fy); ctx.lineTo(tx2, fy + fh);
            ctx.moveTo(fx, ty1); ctx.lineTo(fx + fw, ty1);
            ctx.moveTo(fx, ty2); ctx.lineTo(fx + fw, ty2);
            ctx.stroke();

            const points = [[tx1, ty1], [tx2, ty1], [tx1, ty2], [tx2, ty2]];
            points.forEach((p, i) => {
                ctx.shadowColor = '#f9c74f';
                ctx.shadowBlur = 8 + 4 * Math.sin(phase + i * 1.5);
                ctx.fillStyle = '#f9c74f';
                ctx.beginPath();
                ctx.arc(p[0], p[1], 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            });

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 9px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText('Regla de Tercios | ' + Math.round(aw) + '×' + Math.round(ah), w / 2, h - 8);
        });
    },

    tipometria: function(canvas, val, from, to, res, base) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        let phase = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);

            const grad = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, w * 0.5);
            grad.addColorStop(0, 'rgba(79, 156, 249, 0.04)');
            grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            phase += 0.03;

            const sizes = [base * 0.75, base, base * 1.25, base * 1.5];
            const labels = ['sm (0.75rem)', 'base (1rem)', 'h3 (1.25rem)', 'h2 (1.5rem)'];
            const startY = 30;
            const stepY = Math.min((h - 40) / sizes.length, 50);

            sizes.forEach((sz, i) => {
                const y = startY + i * stepY;
                ctx.fillStyle = '#fff';
                ctx.font = Math.round(sz) + 'px "Segoe UI", system-ui';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';
                ctx.fillText('Texto ' + labels[i], 20, y);

                ctx.fillStyle = '#4a5570';
                ctx.font = '8px JetBrains Mono';
                ctx.textAlign = 'right';
                ctx.fillText(Math.round(sz) + 'px (' + (sz / base).toFixed(2) + 'rem)', w - 20, y);
            });

            ctx.fillStyle = '#4f9cf9';
            ctx.font = 'bold 9px JetBrains Mono';
            ctx.textAlign = 'center';
            const pulse = 0.7 + 0.3 * Math.sin(phase);
            ctx.globalAlpha = pulse;
            ctx.fillText(val + ' ' + from.replace('_t', '') + ' = ' + res.toFixed(2) + ' ' + to.replace('_t', ''), w / 2, h - 10);
            ctx.globalAlpha = 1;
        });
    },

    gama_cromatica: function(canvas, hue, armonia, colores) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        let phase = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);

            const grad = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, w * 0.5);
            grad.addColorStop(0, 'rgba(79, 156, 249, 0.04)');
            grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            phase += 0.02;
            const cx = w / 2;
            const cy = h / 2;
            const radius = Math.min(w, h) * 0.3;

            for (let deg = 0; deg < 360; deg++) {
                const rad = deg * Math.PI / 180;
                const x = cx + Math.cos(rad) * radius;
                const y = cy + Math.sin(rad) * radius;
                ctx.strokeStyle = 'hsl(' + deg + ', 80%, 60%)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.lineTo(x, y);
                ctx.stroke();
            }

            colores.forEach((c, i) => {
                const rad = c.h * Math.PI / 180;
                const x = cx + Math.cos(rad) * radius;
                const y = cy + Math.sin(rad) * radius;
                const angle = phase + i * 2;

                ctx.shadowColor = 'hsl(' + c.h + ', 80%, 60%)';
                ctx.shadowBlur = 12 + 6 * Math.sin(angle);
                ctx.fillStyle = 'hsl(' + c.h + ', 80%, 60%)';
                ctx.beginPath();
                ctx.arc(x, y, 8 + 3 * Math.sin(angle), 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;

                ctx.fillStyle = '#fff';
                ctx.font = '8px JetBrains Mono';
                ctx.textAlign = 'center';
                ctx.fillText(Math.round(c.h) + '° ' + c.l, x, y + 18);
            });

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 10px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(armonia.charAt(0).toUpperCase() + armonia.slice(1) + ' | Base: ' + Math.round(hue) + '°', w / 2, h - 10);
        });
    },

    kerning_tracking: function(canvas, kern, chars, tracking) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        let phase = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);

            const grad = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, w * 0.5);
            grad.addColorStop(0, 'rgba(79, 156, 249, 0.04)');
            grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            phase += 0.03;
            const letters = 'AVAVAVAVAV'.split('').slice(0, Math.min(chars, 10));
            const baseSize = 24;
            const kernPx = kern * 16;
            const totalW = letters.length * baseSize * 0.7 + (letters.length - 1) * kernPx;
            const startX = (w - totalW) / 2;
            const cy = h / 2 - 10;

            letters.forEach((ch, i) => {
                const x = startX + i * (baseSize * 0.7 + kernPx) + Math.sin(phase + i) * 2;
                ctx.fillStyle = '#fff';
                ctx.font = 'bold ' + baseSize + 'px "Segoe UI", system-ui';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';
                ctx.fillText(ch, x, cy);

                if (i > 0) {
                    ctx.strokeStyle = 'rgba(79, 156, 249, 0.3)';
                    ctx.lineWidth = 1;
                    const px = x - kernPx / 2;
                    ctx.beginPath();
                    ctx.moveTo(px, cy - 15);
                    ctx.lineTo(px, cy + 15);
                    ctx.stroke();
                }
            });

            ctx.fillStyle = '#4f9cf9';
            ctx.font = '9px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText('Kerning: ' + (kern * 1000).toFixed(0) + '‰ em | Tracking total: ' + (tracking * 1000).toFixed(0) + '‰ em', w / 2, h - 15);

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 10px JetBrains Mono';
            ctx.fillText('"' + letters.join('') + '"', w / 2, 22);
        });
    },

    peso_visual: function(canvas, area, dens, cont, peso) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        let phase = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);

            const grad = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, w * 0.5);
            grad.addColorStop(0, 'rgba(79, 156, 249, 0.04)');
            grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            phase += 0.03;

            const size = 30 + peso * 80;
            const cx = w / 2;
            const cy = h / 2 - 10;

            ctx.shadowColor = '#f97b4f';
            ctx.shadowBlur = 8 + 4 * Math.sin(phase);
            ctx.fillStyle = '#f97b4f';
            ctx.beginPath();
            ctx.arc(cx, cy, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 11px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText((peso * 100).toFixed(1) + '%', cx, cy);

            const metrics = [
                { label: 'Área', val: area + '%', x: cx - 80 },
                { label: 'Densidad', val: dens + '/10', x: cx },
                { label: 'Contraste', val: cont + '/10', x: cx + 80 }
            ];
            metrics.forEach(m => {
                ctx.fillStyle = '#4a5570';
                ctx.font = '8px JetBrains Mono';
                ctx.textBaseline = 'top';
                ctx.fillText(m.label, m.x - 15, cy + size + 12);
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 9px JetBrains Mono';
                ctx.fillText(m.val, m.x - 15, cy + size + 24);
            });

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 10px JetBrains Mono';
            ctx.textBaseline = 'bottom';
            ctx.fillText('Peso Visual', w / 2, 20);
        });
    },

    reticula: function(canvas, ancho, cols, gutter, margin, colW) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        let phase = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);

            const grad = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, w * 0.5);
            grad.addColorStop(0, 'rgba(79, 156, 249, 0.04)');
            grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            phase += 0.02;

            const scale = (h - 60) / ancho;
            const gridW = ancho * scale;
            const gridX = (w - gridW) / 2;
            const gridY = 40;
            const colWscaled = colW * scale;
            const gutterScaled = gutter * scale;
            const marginScaled = margin * scale;

            ctx.fillStyle = '#1a1f2e';
            ctx.fillRect(gridX, gridY, gridW, 40);

            for (let i = 0; i < cols; i++) {
                const x = gridX + marginScaled + i * (colWscaled + gutterScaled);
                const alpha = 0.4 + 0.2 * Math.sin(phase + i * 0.8);
                ctx.fillStyle = 'rgba(79, 156, 249, ' + alpha + ')';
                ctx.fillRect(x, gridY, colWscaled, 40);

                ctx.fillStyle = '#fff';
                ctx.font = '8px JetBrains Mono';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText((i + 1) + '', x + colWscaled / 2, gridY + 20);
            }

            ctx.fillStyle = '#4a5570';
            ctx.font = '7px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(gutter + 'px gutter', gridX + marginScaled + cols * (colWscaled + gutterScaled) - gutterScaled / 2, gridY + 50);
            ctx.fillText(margin + 'px margin', gridX + marginScaled / 2, gridY + 50);

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 10px JetBrains Mono';
            ctx.textAlign = 'left';
            ctx.fillText(cols + ' columnas × ' + colW.toFixed(1) + 'px', 15, 18);
        });
    },

    legibilidad: function(canvas, sz, lw, cpl) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        let phase = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);

            const grad = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, w * 0.5);
            grad.addColorStop(0, 'rgba(79, 156, 249, 0.04)');
            grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            phase += 0.03;

            const lineW = Math.min(lw, w - 40);
            const x0 = (w - lineW) / 2;
            const lineH = sz * 1.5;
            const lines = 4;
            const startY = (h - lines * lineH) / 2;

            const sampleText = 'Este es un texto de muestra para evaluar la legibilidad tipográfica en pantalla. ';
            for (let l = 0; l < lines; l++) {
                ctx.fillStyle = '#fff';
                ctx.font = sz + 'px "Segoe UI", system-ui';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'top';
                ctx.fillText(sampleText.repeat(3).substring(0, cpl * 2), x0, startY + l * lineH);
            }

            ctx.strokeStyle = 'rgba(79, 156, 249, 0.2)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x0 + cpl * sz * 0.5, startY - 5);
            ctx.lineTo(x0 + cpl * sz * 0.5, startY + lines * lineH + 5);
            ctx.stroke();

            ctx.fillStyle = '#4f9cf9';
            ctx.font = 'bold 11px JetBrains Mono';
            ctx.textAlign = 'center';
            const pulse = 0.7 + 0.3 * Math.sin(phase);
            ctx.globalAlpha = pulse;
            ctx.fillText(cpl + ' cpp | ' + sz + 'px | ' + lw + 'px', w / 2, h - 12);
            ctx.globalAlpha = 1;
        });
    },

    sangria_margenes: function(canvas, pw, ph, ms, mi, mint, mext, anchoUtil, altoUtil) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        let phase = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);

            const grad = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, w * 0.5);
            grad.addColorStop(0, 'rgba(79, 156, 249, 0.04)');
            grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            phase += 0.03;

            const ratio = pw / ph;
            let pageW = h * 0.6;
            let pageH = pageW / ratio;
            if (pageH > h * 0.7) { pageH = h * 0.7; pageW = pageH * ratio; }
            const px2 = (w - pageW) / 2;
            const py = (h - pageH) / 2;

            ctx.fillStyle = '#f5f5f0';
            ctx.fillRect(px2, py, pageW, pageH);

            const sc = pageW / pw;
            const ux = px2 + mint * sc;
            const uy = py + ms * sc;
            const uw = anchoUtil * sc;
            const uh = altoUtil * sc;

            ctx.fillStyle = '#fff';
            ctx.fillRect(ux, uy, uw, uh);

            ctx.strokeStyle = 'rgba(249, 79, 79, 0.3)';
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            ctx.strokeRect(ux, uy, uw, uh);
            ctx.setLineDash([]);

            ctx.fillStyle = '#f94f4f';
            ctx.font = '7px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText('Sup: ' + ms + 'mm', px2 + pageW / 2, py + ms * sc / 2);
            ctx.fillText('Inf: ' + mi + 'mm', px2 + pageW / 2, py + pageH - mi * sc / 2);
            ctx.fillText('Int: ' + mint + 'mm', px2 + mint * sc / 2, py + pageH / 2);
            ctx.fillText('Ext: ' + mext + 'mm', px2 + pageW - mext * sc / 2, py + pageH / 2);

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 10px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(anchoUtil.toFixed(0) + '×' + altoUtil.toFixed(0) + ' mm (mancha de texto)', w / 2, h - 8);
        });
    }
};

DisenoVisual.rgb_hex = function(canvas, r, g, b, hex) {
    this._stopLoop(canvas);
    const ctx = this.initCanvas(canvas);
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);
    let phase = 0;

    this._startLoop(canvas, () => {
        ctx.clearRect(0, 0, w, h);
        phase += 0.03;

        const grad = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, w * 0.5);
        grad.addColorStop(0, 'rgba(79, 156, 249, 0.05)');
        grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = hex;
        ctx.shadowColor = hex;
        ctx.shadowBlur = 20 + 5 * Math.sin(phase);
        ctx.beginPath();
        ctx.roundRect(w / 2 - 50, h / 2 - 50, 100, 100, 12);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 13px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(hex, w / 2, h / 2 + 70);
        ctx.fillStyle = '#4a5570';
        ctx.font = '9px JetBrains Mono';
        ctx.fillText(`RGB(${r}, ${g}, ${b})`, w / 2, h / 2 + 86);

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.font = 'bold 14px JetBrains Mono';
        ctx.fillText('■', w / 2, h / 2 - 10);
    });
};

DisenoVisual.rgb_cmyk = function(canvas, r, g, b, c, m, y, k) {
    this._stopLoop(canvas);
    const ctx = this.initCanvas(canvas);
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);
    let phase = 0;

    this._startLoop(canvas, () => {
        ctx.clearRect(0, 0, w, h);
        phase += 0.03;

        const grad = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, w * 0.5);
        grad.addColorStop(0, 'rgba(249, 199, 79, 0.05)');
        grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        const colors = [
            { label: 'C', pct: c, color: '#00d4ff' },
            { label: 'M', pct: m, color: '#ff00a0' },
            { label: 'Y', pct: y, color: '#ffd700' },
            { label: 'K', pct: k, color: '#222' }
        ];
        const barW = (w - 40) / 4;
        colors.forEach((clr, i) => {
            const x = 20 + i * barW;
            const bh = Math.max(4, (clr.pct / 100) * (h - 60));
            ctx.fillStyle = '#1a1f2e';
            ctx.beginPath();
            ctx.roundRect(x, h - 20 - bh, barW - 6, bh, 4);
            ctx.fill();
            ctx.fillStyle = clr.color;
            ctx.shadowColor = clr.color;
            ctx.shadowBlur = 4;
            ctx.beginPath();
            ctx.roundRect(x, h - 20 - bh, barW - 6, bh, [4, 4, 0, 0]);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 9px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(clr.label, x + (barW - 6) / 2, h - 4);
            ctx.fillStyle = '#4a5570';
            ctx.font = '8px JetBrains Mono';
            ctx.fillText(clr.pct.toFixed(1) + '%', x + (barW - 6) / 2, h - 20 - bh - 4);
        });

        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.shadowColor = `rgb(${r},${g},${b})`;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(w / 2, 25, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    });
};

DisenoVisual.dpi_ppi = function(canvas, wPx, hPx, diag, ppi) {
    this._stopLoop(canvas);
    const ctx = this.initCanvas(canvas);
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);
    let phase = 0;

    this._startLoop(canvas, () => {
        ctx.clearRect(0, 0, w, h);
        phase += 0.03;

        const grad = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, w * 0.5);
        grad.addColorStop(0, 'rgba(79, 249, 123, 0.05)');
        grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        const aspect = wPx / hPx;
        const sc = Math.min((w - 40) / wPx, (h - 80) / hPx, 1);
        const sw = wPx * sc * 0.6;
        const sh = hPx * sc * 0.6;
        const sx = (w - sw) / 2;
        const sy = (h - sh) / 2;

        ctx.strokeStyle = '#4f9cf9';
        ctx.lineWidth = 2;
        ctx.strokeRect(sx, sy, sw, sh);

        const dots = Math.min(20, Math.round(ppi / 15));
        for (let i = 0; i < dots && i < 15; i++) {
            const px = sx + 5 + ((i * 7 + Math.floor(phase * 2)) % Math.max(1, sw - 10));
            const py = sy + 5 + ((i * 13) % Math.max(1, sh - 10));
            ctx.fillStyle = 'rgba(79, 249, 123, 0.6)';
            ctx.beginPath();
            ctx.arc(px, py, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 13px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(`${ppi.toFixed(1)} PPI`, w / 2, h - 8);
        ctx.fillStyle = '#4a5570';
        ctx.font = '8px JetBrains Mono';
        ctx.fillText(`${wPx}×${hPx} @ ${diag}"`, w / 2, 16);
    });
};

DisenoVisual.tamano_imagen = function(canvas, w, h, bpp, rawMB, compMB) {
    this._stopLoop(canvas);
    const ctx = this.initCanvas(canvas);
    const cw = canvas.width / (window.devicePixelRatio || 1);
    const ch = canvas.height / (window.devicePixelRatio || 1);
    let phase = 0;

    this._startLoop(canvas, () => {
        ctx.clearRect(0, 0, cw, ch);
        phase += 0.03;

        const grad = ctx.createRadialGradient(cw / 2, ch / 2, 5, cw / 2, ch / 2, cw * 0.5);
        grad.addColorStop(0, 'rgba(79, 156, 249, 0.05)');
        grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, cw, ch);

        const maxMB = Math.max(rawMB, compMB, 1);
        const barW = cw - 40;
        const bh = 18;
        const cy1 = ch / 2 - 20;
        const cy2 = ch / 2 + 12;

        ctx.fillStyle = '#1a1f2e';
        ctx.beginPath();
        ctx.roundRect(20, cy1, barW, bh, 4);
        ctx.fill();
        ctx.fillStyle = '#f94f4f';
        const anim1 = Math.min(1, (rawMB / maxMB) * phase);
        ctx.beginPath();
        ctx.roundRect(20, cy1, barW * Math.min(1, rawMB / maxMB) * Math.min(1, phase), bh, [4, 0, 0, 4]);
        ctx.fill();

        ctx.fillStyle = '#1a1f2e';
        ctx.beginPath();
        ctx.roundRect(20, cy2, barW, bh, 4);
        ctx.fill();
        ctx.fillStyle = '#4ff97b';
        ctx.shadowColor = '#4ff97b';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.roundRect(20, cy2, barW * Math.min(1, compMB / maxMB) * Math.min(1, phase), bh, [4, 0, 0, 4]);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 9px JetBrains Mono';
        ctx.textAlign = 'left';
        ctx.fillText(`Raw: ${rawMB.toFixed(2)} MB`, 20, cy1 - 4);
        ctx.fillStyle = '#4ff97b';
        ctx.fillText(`Comprimido: ${compMB.toFixed(2)} MB`, 20, cy2 + bh + 14);
    });
};

DisenoVisual.bitrate_video = function(canvas, w, h, fps, bpp, bitrateMbps) {
    this._stopLoop(canvas);
    const ctx = this.initCanvas(canvas);
    const cw = canvas.width / (window.devicePixelRatio || 1);
    const ch = canvas.height / (window.devicePixelRatio || 1);
    let phase = 0;

    this._startLoop(canvas, () => {
        ctx.clearRect(0, 0, cw, ch);
        phase += 0.04;

        const grad = ctx.createRadialGradient(cw / 2, ch / 2, 5, cw / 2, ch / 2, cw * 0.5);
        grad.addColorStop(0, 'rgba(249, 79, 79, 0.05)');
        grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, cw, ch);

        const barW = cw - 40;
        const barH = 20;
        const cy = ch / 2 - barH / 2;
        const maxB = 200;

        ctx.fillStyle = '#1a1f2e';
        ctx.beginPath();
        ctx.roundRect(20, cy, barW, barH, 6);
        ctx.fill();

        const fillPct = Math.min(1, bitrateMbps / maxB);
        const g = ctx.createLinearGradient(20, 0, 20 + barW, 0);
        g.addColorStop(0, '#4f9cf9');
        g.addColorStop(1, '#f94f4f');
        ctx.fillStyle = g;
        ctx.shadowColor = '#f94f4f';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.roundRect(20, cy, barW * Math.min(1, phase) * fillPct, barH, [6, 0, 0, 6]);
        ctx.fill();
        ctx.shadowBlur = 0;

        const fpsBlink = 0.5 + 0.5 * Math.sin(phase * 4);
        for (let i = 0; i < Math.min(fps, 12); i++) {
            const fx = 20 + (i / fps) * barW;
            const fh = 6 + 6 * Math.sin(phase * 3 + i);
            ctx.fillStyle = `rgba(255,255,255,${0.2 + 0.3 * fpsBlink})`;
            ctx.fillRect(fx, cy - 12, 3, fh);
        }

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 13px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(`${bitrateMbps.toFixed(1)} Mbps`, cw / 2, cy - 16);
        ctx.fillStyle = '#4a5570';
        ctx.font = '8px JetBrains Mono';
        ctx.fillText(`${w}×${h} @ ${fps} fps`, cw / 2, cy + barH + 16);
    });
};
