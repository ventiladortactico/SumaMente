window.AcusticaVisual = window.AcusticaVisual || {
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
        const animate = () => {
            fn();
            this._loop[canvas.id] = requestAnimationFrame(animate);
        };
        animate();
    },

    _stopLoop: function(canvas) {
        if (this._loop[canvas.id]) {
            cancelAnimationFrame(this._loop[canvas.id]);
            delete this._loop[canvas.id];
        }
    },

    spl: function(canvas, db) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        const p = 20, barW = w - 2 * p, barH = 18;
        const minDB = 0, maxDB = 120;
        let phase = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);

            const grad = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2);
            grad.addColorStop(0, 'rgba(79, 251, 123, 0.05)');
            grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            ctx.fillStyle = '#1a1f2e';
            ctx.beginPath();
            ctx.roundRect(p, h / 2 - barH / 2, barW, barH, 6);
            ctx.fill();

            const zones = [
                { max: 30, color: '#4ff97b' },
                { max: 70, color: '#f9c74f' },
                { max: 90, color: '#f97b4f' },
                { max: 120, color: '#f94f4f' }
            ];
            zones.forEach(z => {
                const zw = (z.max / maxDB) * barW;
                ctx.fillStyle = z.color;
                ctx.beginPath();
                ctx.roundRect(p, h / 2 - barH / 2, zw, barH, [6, 0, 0, 6]);
                ctx.fill();
            });

            const clamped = Math.min(Math.max(db, minDB), maxDB);
            const pos = p + (clamped / maxDB) * barW;

            phase += 0.05;
            const pulse = 0.7 + 0.3 * Math.sin(phase);

            ctx.shadowColor = clamped > 90 ? '#f94f4f' : clamped > 70 ? '#f97b4f' : '#4ff97b';
            ctx.shadowBlur = 12 * pulse;
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(pos, h / 2 - barH / 2 - 8);
            ctx.lineTo(pos, h / 2 + barH / 2 + 8);
            ctx.stroke();
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 13px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(`${db.toFixed(1)} dB SPL`, pos, h / 2 - barH / 2 - 14);

            const labels = ['0 dB', '30', '70', '90', '120 dB'];
            [0, 0.25, 0.583, 0.75, 1].forEach((pct, i) => {
                ctx.fillStyle = '#4a5570';
                ctx.font = '8px JetBrains Mono';
                ctx.textAlign = 'center';
                ctx.fillText(labels[i], p + barW * pct, h / 2 + barH / 2 + 14);
            });

            ctx.fillStyle = 'rgba(255,255,255,0.06)';
            for (let i = 0; i < 3; i++) {
                const y = h / 2 + Math.sin(phase + i * 2) * 4;
                ctx.fillRect(p, y, barW, 1);
            }
        });
    },

    onda: function(canvas, frequency, lambda) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        const amp = h / 3.8;
        let phase = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);

            const grad = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, w * 0.6);
            grad.addColorStop(0, 'rgba(79, 251, 123, 0.06)');
            grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            ctx.strokeStyle = '#1e2330';
            ctx.lineWidth = 1;
            for (let i = 0; i < w; i += 30) {
                ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke();
            }
            for (let i = 0; i < h; i += 30) {
                ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke();
            }

            ctx.strokeStyle = '#2a3345';
            ctx.setLineDash([4, 6]);
            ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2);
            ctx.stroke();
            ctx.setLineDash([]);

            const freqFactor = Math.min(Math.max(frequency / 300, 0.2), 15);
            phase += 0.03;

            ctx.shadowColor = '#4ff97b';
            ctx.shadowBlur = 8;
            ctx.strokeStyle = '#4ff97b';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            for (let x = 0; x < w; x++) {
                const y = h / 2 + Math.sin(x * 0.04 * freqFactor + phase) * amp;
                x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 11px JetBrains Mono';
            ctx.textAlign = 'left';
            ctx.fillText(`f = ${frequency.toFixed(0)} Hz`, 15, 22);
            ctx.fillStyle = '#4ff97b';
            ctx.fillText(`λ = ${lambda.toFixed(3)} m`, 15, 40);

            const freq = frequency || 440;
            const periodW = (w / (freqFactor * 0.04)) / (2 * Math.PI);
            ctx.fillStyle = 'rgba(79, 251, 123, 0.1)';
            for (let i = 0; i < 3; i++) {
                const startX = (w / 2) + i * periodW + (phase / (0.04 * freqFactor));
                ctx.fillRect(startX, h / 2 - amp - 5, 1, amp * 2 + 10);
            }
        });
    },

    velocidad: function(canvas, v, temp) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        let phase = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);

            const grad = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, w * 0.5);
            grad.addColorStop(0, `rgba(${temp > 0 ? '249,123,79' : '79,188,26'}, 0.06)`);
            grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            ctx.fillStyle = '#1a1f2e';
            ctx.beginPath();
            ctx.roundRect(20, h / 2 - 5, w - 40, 10, 5);
            ctx.fill();

            const pct = Math.min(Math.max((temp + 50) / 150, 0), 1);
            const posX = 20 + pct * (w - 40);

            phase += 0.04;
            const glow = 0.6 + 0.4 * Math.sin(phase);

            ctx.shadowColor = temp > 0 ? '#f97b4f' : '#4fbc1a';
            ctx.shadowBlur = 15 * glow;
            const color = temp > 0 ? '#f97b4f' : '#4fbc1a';
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(posX, h / 2, 10 + 2 * Math.sin(phase * 1.5), 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            const grad2 = ctx.createLinearGradient(20, 0, w - 20, 0);
            grad2.addColorStop(0, '#4f9cf9');
            grad2.addColorStop(0.5, '#4ff97b');
            grad2.addColorStop(1, '#f94f4f');
            ctx.fillStyle = grad2;
            ctx.beginPath();
            ctx.roundRect(20, h / 2 - 5, posX - 20, 10, [5, 0, 0, 5]);
            ctx.fill();

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(`${temp}°C → ${v.toFixed(1)} m/s`, posX, h / 2 - 22);

            ctx.fillStyle = '#4a5570';
            ctx.font = '8px JetBrains Mono';
            ctx.fillText('-50°C', 20, h / 2 + 20);
            ctx.textAlign = 'right';
            ctx.fillText('100°C', w - 20, h / 2 + 20);
        });
    },

    reverberacion: function(canvas, rt, categoria) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        let phase = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);

            const grad = ctx.createRadialGradient(w / 2, h * 0.3, 5, w / 2, h * 0.3, w * 0.7);
            grad.addColorStop(0, 'rgba(249, 199, 79, 0.05)');
            grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            ctx.fillStyle = '#1a1f2e';
            ctx.beginPath();
            ctx.roundRect(10, 10, w - 20, h - 20, 8);
            ctx.fill();

            const decayFactor = Math.min(Math.max(5 / rt, 0.5), 10);
            phase += 0.02;

            ctx.shadowColor = '#f9c74f';
            ctx.shadowBlur = 6;
            ctx.strokeStyle = '#f9c74f';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            const points = [];
            for (let x = 20; x < w - 20; x++) {
                const e = (x - 20) / (w - 40);
                const y = (h - 40) * Math.exp(-e * decayFactor) + 20;
                const sy = h - y;
                points.push({ x, sy });
                x === 20 ? ctx.moveTo(x, sy) : ctx.lineTo(x, sy);
            }
            ctx.stroke();
            ctx.shadowBlur = 0;

            ctx.fillStyle = 'rgba(249, 199, 79, 0.08)';
            ctx.beginPath();
            ctx.moveTo(20, h - 20);
            points.forEach(p => ctx.lineTo(p.x, p.sy));
            ctx.lineTo(w - 20, h - 20);
            ctx.closePath();
            ctx.fill();

            for (let i = 0; i < 8; i++) {
                const x = 20 + (i / 8) * (w - 40);
                const e = i / 8;
                const y = h - ((h - 40) * Math.exp(-e * decayFactor) + 20);
                ctx.fillStyle = `rgba(249, 199, 79, ${0.3 * (1 - e)})`;
                ctx.beginPath();
                ctx.arc(x, y, 2 + 1 * Math.sin(phase + i), 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px JetBrains Mono';
            ctx.textAlign = 'right';
            ctx.fillText(`RT60: ${rt.toFixed(2)}s`, w - 25, 30);
            ctx.fillStyle = '#f9c74f';
            ctx.font = '9px JetBrains Mono';
            ctx.fillText(categoria, w - 25, 46);
        });
    },

    distancia: function(canvas, d1, d2, ddB) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        let phase = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);

            const grad = ctx.createRadialGradient(30, h / 2, 5, 30, h / 2, w * 0.6);
            grad.addColorStop(0, 'rgba(249, 79, 79, 0.06)');
            grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            ctx.fillStyle = '#f94f4f';
            ctx.shadowColor = '#f94f4f';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(30, h / 2, 10 + 3 * Math.sin(phase), 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            phase += 0.03;
            ctx.strokeStyle = `rgba(45, 53, 72, ${0.3 + 0.2 * Math.sin(phase)})`;
            ctx.lineWidth = 1.5;
            for (let r = 50; r < w; r += 35) {
                ctx.beginPath();
                ctx.arc(30, h / 2, r, -Math.PI / 3, Math.PI / 3);
                ctx.stroke();
            }

            const maxDist = Math.max(d1, d2, 1);
            const p1X = 50 + (d1 / maxDist) * (w - 100);
            const p2X = 50 + (d2 / maxDist) * (w - 100);

            ctx.shadowColor = '#4ff97b';
            ctx.shadowBlur = 8;
            ctx.fillStyle = '#4ff97b';
            ctx.beginPath();
            ctx.arc(p1X, h / 2, 6, 0, Math.PI * 2);
            ctx.fill();

            ctx.shadowColor = '#f97b4f';
            ctx.shadowBlur = 8;
            ctx.fillStyle = '#f97b4f';
            ctx.beginPath();
            ctx.arc(p2X, h / 2, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(p1X, h / 2);
            ctx.lineTo(p2X, h / 2);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 13px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(`-${ddB.toFixed(1)} dB`, (p1X + p2X) / 2, h / 2 - 18);

            ctx.fillStyle = '#4a5570';
            ctx.font = '9px JetBrains Mono';
            ctx.fillText(`${d1}m`, p1X, h / 2 + 18);
            ctx.fillText(`${d2}m`, p2X, h / 2 + 18);
        });
    },

    doppler: function(canvas, fp, fo, vs, vo, v) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        let phase = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);

            const grad = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, w * 0.5);
            grad.addColorStop(0, 'rgba(249, 123, 79, 0.05)');
            grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            const srcX = 30 + 20 * Math.sin(phase * 0.5);
            ctx.shadowColor = '#f97b4f';
            ctx.shadowBlur = 15;
            ctx.fillStyle = '#f97b4f';
            ctx.beginPath();
            ctx.arc(srcX, h / 2, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#fff';
            ctx.font = '9px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText('Fuente', srcX, h / 2 + 24);

            phase += 0.04;
            const ratio = fp / fo;
            for (let r = 1; r <= 6; r++) {
                const radius = r * 25 + Math.sin(phase - r * 0.5) * 3;
                const isFront = r % 2 === 0;
                ctx.strokeStyle = ctx.strokeStyle = vs > 0 && isFront ? '#4f9cf9' : '#4ff97b';
                ctx.globalAlpha = 0.3 + 0.1 * Math.sin(phase + r);
                ctx.lineWidth = isFront && vs > 0 ? 2.5 : 1.5;
                ctx.beginPath();
                ctx.arc(srcX, h / 2, radius * (vs > 0 && isFront ? 1.2 : 1), 0, Math.PI * 2);
                ctx.stroke();
                ctx.globalAlpha = 1;
            }

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px JetBrains Mono';
            ctx.textAlign = 'left';
            ctx.fillText("f' = " + fp.toFixed(1) + ' Hz', 15, 22);
            ctx.fillStyle = '#f97b4f';
            ctx.font = '9px JetBrains Mono';
            ctx.fillText('f = ' + fo + ' Hz | vs = ' + vs + ' m/s', 15, 40);
        });
    },

    resonancia: function(canvas, fn, n, v, L, tipo) {
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

            const pad = 30;
            const tw = w - 2 * pad;
            const th = h - 2 * pad;
            const cx = w / 2;
            const cy = h / 2;

            ctx.fillStyle = '#1a1f2e';
            ctx.beginPath();
            ctx.roundRect(pad, pad, tw, th, 4);
            ctx.fill();

            ctx.strokeStyle = '#4f9cf9';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(pad, pad);
            ctx.lineTo(pad, pad + th);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(pad + tw, pad);
            ctx.lineTo(pad + tw, pad + th);
            ctx.stroke();

            if (tipo === 'cerrado') {
                ctx.strokeStyle = '#4ff97b';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(pad, pad + th);
                ctx.lineTo(pad + tw, pad + th);
                ctx.stroke();
            }

            phase += 0.03;
            const amp = th * 0.35;
            const offsetY = cy;

            ctx.shadowColor = '#4f9cf9';
            ctx.shadowBlur = 6;
            ctx.strokeStyle = 'rgba(79, 156, 249, 0.6)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (let x = pad; x <= pad + tw; x++) {
                const p = (x - pad) / tw;
                const envelope = Math.sin(p * Math.PI * n);
                const y = offsetY + amp * envelope * Math.sin(phase - p * 2);
                x === pad ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.shadowBlur = 0;

            const nodes = [];
            for (let i = 0; i <= n; i++) {
                const nx = pad + (i / n) * tw;
                nodes.push(nx);
            }

            nodes.forEach(nx => {
                ctx.fillStyle = 'rgba(79, 249, 123, 0.3)';
                ctx.beginPath();
                ctx.arc(nx, cy, 4, 0, Math.PI * 2);
                ctx.fill();
            });

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 10px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(fn.toFixed(1) + ' Hz | n=' + n, cx, 18);
            ctx.fillStyle = '#4a5570';
            ctx.font = '8px JetBrains Mono';
            ctx.fillText('L = ' + L + 'm | ' + (tipo === 'abierto' ? 'Abierto' : 'Cerrado'), cx, h - 6);
        });
    },

    armonicos: function(canvas, f1, nmax, armonicos) {
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
            const barW = Math.min((w - 40) / nmax - 4, 30);
            const gap = Math.min((w - 40) / nmax, 34);
            const maxF = armonicos[nmax - 1].f;
            const baseY = h - 30;

            armonicos.forEach((a, i) => {
                const x = 25 + i * gap;
                const barH = (a.f / maxF) * (h - 60);
                const hue = 120 + (a.n / nmax) * 180;

                ctx.shadowColor = 'hsla(' + hue + ', 80%, 60%, 0.3)';
                ctx.shadowBlur = 4 + 2 * Math.sin(phase + i);
                ctx.fillStyle = 'hsl(' + hue + ', 80%, 60%)';
                ctx.beginPath();
                ctx.roundRect(x, baseY - barH, barW, barH, [3, 3, 0, 0]);
                ctx.fill();
                ctx.shadowBlur = 0;

                ctx.fillStyle = '#fff';
                ctx.font = '7px JetBrains Mono';
                ctx.textAlign = 'center';
                ctx.fillText(a.n, x + barW / 2, baseY + 12);
                ctx.fillStyle = '#4a5570';
                ctx.font = '6px JetBrains Mono';
                ctx.fillText(a.f.toFixed(0) + 'Hz', x + barW / 2, baseY + 22);
            });

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 10px JetBrains Mono';
            ctx.textAlign = 'left';
            ctx.fillText('Armónicos | f₁ = ' + f1 + ' Hz', 15, 16);
        });
    },

    absorcion: function(canvas, a, s, absorcion) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        let phase = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);

            const grad = ctx.createRadialGradient(w / 2, h * 0.6, 5, w / 2, h * 0.6, w * 0.4);
            grad.addColorStop(0, 'rgba(79, 156, 249, 0.05)');
            grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            phase += 0.04;

            const surfY = h * 0.65;
            ctx.fillStyle = '#2a3345';
            ctx.beginPath();
            ctx.roundRect(20, surfY, w - 40, 20, 3);
            ctx.fill();

            const reflectPct = 1 - a;
            const arrows = 5;
            for (let i = 0; i < arrows; i++) {
                const x = 30 + (i / (arrows - 1)) * (w - 60);
                const incY = surfY - 20 - i * 8 - 5 * Math.sin(phase + i * 1.5);
                const reflectX = w - x;

                ctx.strokeStyle = 'rgba(79, 249, 123, ' + (0.5 * a) + ')';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(x, surfY);
                ctx.lineTo(x + (x - w / 2) * 0.2, incY);
                ctx.stroke();

                ctx.fillStyle = 'rgba(79, 249, 123, ' + (0.3 * reflectPct) + ')';
                ctx.beginPath();
                ctx.arc(reflectX, surfY - 10 - 10 * Math.sin(phase + i), 3, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 11px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText('α = ' + a.toFixed(2) + ' | A = ' + absorcion.toFixed(2) + ' Sabines', w / 2, 22);
            ctx.fillStyle = '#4a5570';
            ctx.font = '8px JetBrains Mono';
            ctx.fillText('Superficie: ' + s + ' m²', w / 2, 40);
        });
    },

    batidos: function(canvas, f1, f2, fb) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        let phase = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);

            const grad = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, w * 0.5);
            grad.addColorStop(0, 'rgba(249, 199, 79, 0.05)');
            grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            phase += 0.04;
            const amp = h / 5;
            const c1 = '#4f9cf9';
            const c2 = '#f97b4f';
            const beats = fb > 0 ? fb / 10 : 0.1;

            ctx.strokeStyle = c1;
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let x = 0; x < w; x++) {
                const t = x / w;
                const y = h / 2 - amp + Math.sin(t * 40 + phase) * amp * 0.4;
                x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.stroke();

            ctx.strokeStyle = c2;
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let x = 0; x < w; x++) {
                const t = x / w;
                const y = h / 2 + amp + Math.sin(t * 40 + phase * 1.1 + 0.3) * amp * 0.4;
                x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.stroke();

            ctx.shadowColor = '#f9c74f';
            ctx.shadowBlur = 6;
            ctx.strokeStyle = '#f9c74f';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            for (let x = 0; x < w; x++) {
                const t = x / w;
                const env = Math.sin(t * w * 0.02 * beats) * amp * 0.5;
                const y = h / 2 + Math.sin(t * 42 + phase) * env * 0.6;
                x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 11px JetBrains Mono';
            ctx.textAlign = 'left';
            ctx.fillText('f₁=' + f1 + 'Hz  f₂=' + f2 + 'Hz', 15, 20);
            ctx.fillStyle = '#f9c74f';
            ctx.font = 'bold 9px JetBrains Mono';
            ctx.fillText('Batido: ' + fb.toFixed(1) + ' Hz', 15, 38);
        });
    },

    periodo_sonido: function(canvas, freq, T) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        let phase = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);

            const grad = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, w * 0.5);
            grad.addColorStop(0, 'rgba(79, 249, 123, 0.05)');
            grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            phase += 0.04;
            const amp = h / 3;
            const cy = h / 2;
            const periods = 4;
            const freqFactor = freq / 200;

            ctx.strokeStyle = '#1e2330';
            ctx.lineWidth = 1;
            for (let x = 0; x < w; x += 20) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
            }

            ctx.shadowColor = '#4ff97b';
            ctx.shadowBlur = 6;
            ctx.strokeStyle = '#4ff97b';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            for (let x = 0; x < w; x++) {
                const t = x / w * periods;
                const y = cy + Math.sin(t * 2 * Math.PI * freqFactor + phase) * amp;
                x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.shadowBlur = 0;

            const periodPx = (w / periods) / freqFactor;
            const startX = (w / 2) - (phase / (2 * Math.PI)) * periodPx;
            ctx.fillStyle = 'rgba(79, 249, 123, 0.12)';
            ctx.fillRect(startX, cy - amp - 5, periodPx, amp * 2 + 10);
            ctx.strokeStyle = 'rgba(79, 249, 123, 0.4)';
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            ctx.strokeRect(startX, cy - amp - 5, periodPx, amp * 2 + 10);
            ctx.setLineDash([]);

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 11px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText('T = ' + (T * 1000).toFixed(3) + ' ms', w / 2, 22);
            ctx.fillStyle = '#4a5570';
            ctx.font = '9px JetBrains Mono';
            ctx.fillText('f = ' + freq + ' Hz', w / 2, 40);
        });
    },

    potencia_sonora: function(canvas, w, lw) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w2 = canvas.width / (window.devicePixelRatio || 1);
        const h2 = canvas.height / (window.devicePixelRatio || 1);
        let phase = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w2, h2);

            const grad = ctx.createRadialGradient(w2 / 2, h2 / 2, 5, w2 / 2, h2 / 2, w2 * 0.5);
            grad.addColorStop(0, 'rgba(249, 79, 79, 0.05)');
            grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w2, h2);

            phase += 0.03;
            const cx = w2 / 2;
            const cy = h2 / 2;

            for (let r = 3; r >= 0; r--) {
                const radius = 20 + r * 25 + 8 * Math.sin(phase + r * 1.2);
                const alpha = 0.1 + 0.05 * Math.sin(phase + r);
                ctx.strokeStyle = 'rgba(249, 79, 79, ' + alpha + ')';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(cx, cy, radius, 0, Math.PI * 2);
                ctx.stroke();
            }

            const pct = Math.min(lw / 120, 1);
            const barW = w2 - 60;
            ctx.fillStyle = '#1a1f2e';
            ctx.beginPath();
            ctx.roundRect(30, cy + 30, barW, 12, 6);
            ctx.fill();

            const grad2 = ctx.createLinearGradient(30, 0, 30 + barW, 0);
            grad2.addColorStop(0, '#4ff97b');
            grad2.addColorStop(0.5, '#f9c74f');
            grad2.addColorStop(1, '#f94f4f');
            ctx.fillStyle = grad2;
            ctx.beginPath();
            ctx.roundRect(30, cy + 30, barW * pct, 12, [6, 0, 0, 6]);
            ctx.fill();

            ctx.shadowColor = '#f94f4f';
            ctx.shadowBlur = 20 + 10 * Math.sin(phase);
            ctx.fillStyle = '#f97b4f';
            ctx.beginPath();
            ctx.arc(cx, cy, 10 + 3 * Math.sin(phase * 1.5), 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 13px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(lw.toFixed(1) + ' dB', cx, cy - 25);
            ctx.fillStyle = '#4a5570';
            ctx.font = '8px JetBrains Mono';
            ctx.fillText('W = ' + w + ' W', cx, cy - 10);
            ctx.fillText('0 dB', 30, cy + 55);
            ctx.textAlign = 'right';
            ctx.fillText('120 dB', w2 - 30, cy + 55);
        });
    },

    sonoridad: function(canvas, db, freq, fonos) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w2 = canvas.width / (window.devicePixelRatio || 1);
        const h2 = canvas.height / (window.devicePixelRatio || 1);
        let phase = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w2, h2);

            const grad = ctx.createRadialGradient(w2 / 2, h2 / 2, 5, w2 / 2, h2 / 2, w2 * 0.5);
            grad.addColorStop(0, 'rgba(79, 156, 249, 0.05)');
            grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w2, h2);

            phase += 0.03;

            const pad = 35;
            const gw = w2 - 2 * pad;
            const gh = h2 - 2 * pad;

            ctx.strokeStyle = '#2a3345';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(pad, pad);
            ctx.lineTo(pad, pad + gh);
            ctx.lineTo(pad + gw, pad + gh);
            ctx.stroke();

            const curves = [
                { spl: 20, off: -8 },
                { spl: 40, off: -5 },
                { spl: 60, off: -2 },
                { spl: 80, off: 0 }
            ];
            curves.forEach(c => {
                const y = pad + gh - (c.spl / 120) * gh;
                ctx.strokeStyle = 'rgba(79, 156, 249, 0.15)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                for (let x = pad; x <= pad + gw; x++) {
                    const f = 20 * Math.pow(10, ((x - pad) / gw) * 2.3);
                    const corr = -5 * Math.log2(f / 1000);
                    const spl = c.spl + corr;
                    const py = pad + gh - (spl / 120) * gh;
                    x === pad ? ctx.moveTo(x, py) : ctx.lineTo(x, py);
                }
                ctx.stroke();

                ctx.fillStyle = 'rgba(79, 156, 249, 0.2)';
                ctx.font = '6px JetBrains Mono';
                ctx.textAlign = 'left';
                ctx.fillText(c.spl + ' fon', pad + gw - 35, y - 3);
            });

            const fx = pad + (Math.log10(freq / 20) / 2.3) * gw;
            const fy = pad + gh - (fonos / 120) * gh;

            ctx.shadowColor = '#4ff97b';
            ctx.shadowBlur = 15;
            ctx.fillStyle = '#4ff97b';
            ctx.beginPath();
            ctx.arc(fx, fy, 6 + 2 * Math.sin(phase), 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 10px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(fonos.toFixed(0) + ' fonos | ' + db + ' dB @ ' + freq + ' Hz', w2 / 2, 18);

            ctx.fillStyle = '#4a5570';
            ctx.font = '7px JetBrains Mono';
            ctx.textAlign = 'left';
            ctx.fillText('20 Hz', pad, pad + gh + 14);
            ctx.textAlign = 'right';
            ctx.fillText('20 kHz', pad + gw, pad + gh + 14);
        });
    },

    aislacion: function(canvas, R, m, freq) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w2 = canvas.width / (window.devicePixelRatio || 1);
        const h2 = canvas.height / (window.devicePixelRatio || 1);
        let phase = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w2, h2);

            const grad = ctx.createRadialGradient(w2 / 2, h2 / 2, 5, w2 / 2, h2 / 2, w2 * 0.5);
            grad.addColorStop(0, 'rgba(79, 156, 249, 0.05)');
            grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w2, h2);

            phase += 0.03;
            const wallX = w2 / 2;

            const grad2 = ctx.createLinearGradient(wallX - 8, 0, wallX + 8, 0);
            grad2.addColorStop(0, '#374151');
            grad2.addColorStop(0.3, '#4a5570');
            grad2.addColorStop(0.7, '#4a5570');
            grad2.addColorStop(1, '#374151');
            ctx.fillStyle = grad2;
            ctx.fillRect(wallX - 8, 0, 16, h2);

            ctx.strokeStyle = '#4f9cf9';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            for (let x = 15; x < wallX - 10; x++) {
                const t = (x - 15) / (wallX - 25);
                const y = h2 / 2 + Math.sin(t * 20 + phase) * (h2 / 5) * Math.exp(-t * 2);
                x === 15 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.stroke();

            ctx.fillStyle = 'rgba(79, 156, 249, 0.15)';
            ctx.font = '8px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText('Incidente', (wallX - 15) / 2 + 15, 18);

            ctx.strokeStyle = 'rgba(249, 79, 79, ' + (0.2 + 0.1 * Math.sin(phase)) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let x = wallX + 15; x < w2 - 15; x++) {
                const t = (x - wallX - 15) / (w2 - wallX - 30);
                const y = h2 / 2 + Math.sin(t * 6 + phase * 1.5) * (h2 / 10) * Math.exp(-t * 3);
                x === wallX + 15 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.stroke();

            ctx.fillStyle = 'rgba(249, 79, 79, 0.15)';
            ctx.font = '8px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText('Transmitido', wallX + (w2 - wallX - 15) / 2, 18);

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText('R = ' + R.toFixed(1) + ' dB', w2 / 2, 30);
            ctx.fillStyle = '#4a5570';
            ctx.font = '8px JetBrains Mono';
            ctx.fillText('m = ' + m + ' kg/m² | f = ' + freq + ' Hz', w2 / 2, h2 - 10);
        });
    },

    ruido_fondo: function(canvas, lp, idx, curve, confort) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w2 = canvas.width / (window.devicePixelRatio || 1);
        const h2 = canvas.height / (window.devicePixelRatio || 1);
        let phase = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w2, h2);

            const grad = ctx.createRadialGradient(w2 / 2, h2 / 2, 5, w2 / 2, h2 / 2, w2 * 0.5);
            grad.addColorStop(0, 'rgba(249, 199, 79, 0.04)');
            grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w2, h2);

            phase += 0.03;
            const pad = 30;
            const gw = w2 - 2 * pad;
            const gh = h2 - 2 * pad;

            ctx.strokeStyle = '#2a3345';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(pad, pad);
            ctx.lineTo(pad, pad + gh);
            ctx.lineTo(pad + gw, pad + gh);
            ctx.stroke();

            [10, 20, 30, 40, 50, 60, 70].forEach(nr => {
                const y = pad + gh - (nr / 70) * gh;
                ctx.strokeStyle = 'rgba(79, 156, 249, 0.08)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                for (let x = pad; x <= pad + gw; x++) {
                    const bend = (x - pad) / gw;
                    const offset = bend * 5;
                    ctx.lineTo(x, y - offset);
                }
                ctx.stroke();

                ctx.fillStyle = 'rgba(79, 156, 249, 0.15)';
                ctx.font = '6px JetBrains Mono';
                ctx.textAlign = 'right';
                ctx.fillText('NR' + nr, pad - 4, y + 2);
            });

            const pct = Math.min(lp / 70, 1);
            const mx = pad + pct * gw;
            const my = pad + gh - (pct * 0.8) * gh;

            ctx.shadowColor = '#f9c74f';
            ctx.shadowBlur = 12;
            ctx.fillStyle = '#f9c74f';
            ctx.beginPath();
            ctx.arc(mx, my, 6 + 2 * Math.sin(phase), 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.strokeStyle = 'rgba(249, 199, 79, 0.3)';
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(mx, my);
            ctx.lineTo(mx, pad + gh);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 11px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(curve.toUpperCase() + Math.round(idx) + ' — ' + confort, w2 / 2, 18);
            ctx.fillStyle = '#4a5570';
            ctx.font = '7px JetBrains Mono';
            ctx.fillText('Lp = ' + lp + ' dB', w2 / 2, h2 - 8);
        });
    }
};
