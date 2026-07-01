window.ProgramacionVisual = window.ProgramacionVisual || {
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

    bases: function(canvas, val, from, to, result) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        const pad = 20;
        let phase = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);
            phase += 0.03;

            const grad = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, w * 0.4);
            grad.addColorStop(0, 'rgba(167, 139, 250, 0.04)');
            grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            ctx.fillStyle = '#1a1f2e';
            ctx.beginPath();
            ctx.roundRect(pad, h / 2 - 28, w / 3, 56, 8);
            ctx.fill();
            ctx.strokeStyle = '#4f9cf9';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(pad, h / 2 - 28, w / 3, 56);

            ctx.fillStyle = '#1a1f2e';
            ctx.beginPath();
            ctx.roundRect(w - pad - w / 3, h / 2 - 28, w / 3, 56, 8);
            ctx.fill();
            ctx.strokeStyle = '#4ff97b';
            ctx.strokeRect(w - pad - w / 3, h / 2 - 28, w / 3, 56);

            ctx.fillStyle = '#4f9cf9';
            ctx.font = 'bold 13px JetBrains Mono';
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.fillText(val, pad + w / 6, h / 2 - 6);
            ctx.fillStyle = '#4a5570';
            ctx.font = '8px JetBrains Mono';
            ctx.fillText(`Base ${from}`, pad + w / 6, h / 2 + 14);

            ctx.fillStyle = '#4ff97b';
            ctx.font = 'bold 13px JetBrains Mono';
            ctx.fillText(result, w - pad - w / 6, h / 2 - 6);
            ctx.fillStyle = '#4a5570';
            ctx.font = '8px JetBrains Mono';
            ctx.fillText(`Base ${to}`, w - pad - w / 6, h / 2 + 14);

            ctx.strokeStyle = '#a78bfa';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(pad + w / 3 + 8, h / 2);
            ctx.lineTo(w - pad - w / 3 - 8, h / 2);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = '#a78bfa';
            ctx.font = '8px JetBrains Mono';
            ctx.fillText('→', w / 2, h / 2 - 10);
        });
    },

    bitwise: function(canvas, a, b, op, result) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        const pad = 20;
        const binA = (a >>> 0).toString(2).padStart(8, '0');
        const binB = (b >>> 0).toString(2).padStart(8, '0');
        const binRes = (result >>> 0).toString(2).padStart(8, '0');
        let phase = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);
            phase += 0.04;

            const grad = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, w * 0.4);
            grad.addColorStop(0, 'rgba(79, 249, 123, 0.04)');
            grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            const bits = (str, y, color) => {
                const bw2 = (w - 2 * pad) / 8;
                for (let i = 0; i < 8; i++) {
                    const x = pad + i * bw2;
                    ctx.fillStyle = str[i] === '1' ? color : '#1a1f2e';
                    ctx.beginPath();
                    ctx.roundRect(x, y, bw2 - 3, 18, 3);
                    ctx.fill();
                    ctx.fillStyle = str[i] === '1' ? '#111' : '#4a5570';
                    ctx.font = 'bold 10px JetBrains Mono';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(str[i], x + (bw2 - 3) / 2, y + 9);
                }
            };

            bits(binA, 12, '#4f9cf9');
            ctx.fillStyle = '#4a5570';
            ctx.font = '8px JetBrains Mono';
            ctx.textAlign = 'left';
            ctx.fillText(`A (${a})`, pad, 8);

            bits(binB, 42, '#f9c74f');
            ctx.fillStyle = '#4a5570';
            ctx.fillText(`B (${b})`, pad, 38);

            ctx.strokeStyle = '#2a3345';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(pad, 68);
            ctx.lineTo(w - pad, 68);
            ctx.stroke();

            ctx.fillStyle = '#fff';
            ctx.font = '9px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(`Operación: ${op}`, w / 2, 82);

            const glow = 0.5 + 0.5 * Math.sin(phase);
            ctx.shadowColor = '#4ff97b';
            ctx.shadowBlur = 8 * glow;
            bits(binRes, 92, '#4ff97b');
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#4ff97b';
            ctx.font = '8px JetBrains Mono';
            ctx.fillText(`Resultado (${result})`, pad, 88);
        });
    },

    bigO: function(canvas, n) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        const pad = 30;
        let phase = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);
            phase += 0.02;

            const grad = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, w * 0.4);
            grad.addColorStop(0, 'rgba(249, 79, 79, 0.04)');
            grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            ctx.strokeStyle = '#1a1f2e';
            ctx.lineWidth = 1;
            for (let i = 0; i < 4; i++) {
                const y = pad + (i * (h - 2 * pad) / 3);
                ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(w - pad, y); ctx.stroke();
            }

            const nVal = Math.min(n || 10, 100);
            const maxX = w - pad, maxY = h - pad;

            ctx.lineWidth = 2;
            ctx.strokeStyle = '#4ff97b';
            ctx.setLineDash([3, 3]);
            ctx.beginPath(); ctx.moveTo(pad, maxY - 10); ctx.lineTo(maxX, maxY - 10); ctx.stroke();

            ctx.strokeStyle = '#f9c74f';
            ctx.beginPath(); ctx.moveTo(pad, maxY); ctx.lineTo(maxX, pad + 20); ctx.stroke();

            ctx.strokeStyle = '#f94f4f';
            ctx.beginPath();
            ctx.moveTo(pad, maxY);
            const pct = nVal / 100;
            const cx = pad + pct * (maxX - pad);
            const cy = maxY - pct * pct * (maxY - pad - 20);
            ctx.quadraticCurveTo(pad + (maxX - pad) * 0.5, maxY, maxX - 30, pad);
            ctx.stroke();

            ctx.setLineDash([]);

            ctx.shadowColor = '#fff';
            ctx.shadowBlur = 8;
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(cx, cy, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 10px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(`N = ${nVal}`, cx, cy - 14);

            ctx.fillStyle = '#4a5570';
            ctx.font = '8px JetBrains Mono';
            ctx.textAlign = 'left';
            ctx.fillText('O(1)', pad + 5, maxY - 14);
            ctx.fillStyle = '#f9c74f';
            ctx.fillText('O(N)', pad + 5, maxY - 28);
            ctx.fillStyle = '#f94f4f';
            ctx.fillText('O(N²)', pad + 5, maxY - 42);
        });
    },

    cpu: function(canvas, cyc, clk, time) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        const cx = w / 2, cy = h / 2;
        let phase = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);
            phase += 0.04;

            const grad = ctx.createRadialGradient(cx, cy, 5, cx, cy, 60);
            grad.addColorStop(0, 'rgba(167, 139, 250, 0.04)');
            grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            ctx.strokeStyle = 'rgba(167, 139, 250, 0.15)';
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.arc(cx, cy - 10, 35, 0, Math.PI * 2);
            ctx.stroke();

            const arcEnd = -Math.PI / 2 + (Math.PI * 2) * Math.min(phase * 0.5, 1);
            ctx.strokeStyle = '#a78bfa';
            ctx.lineWidth = 6;
            ctx.shadowColor = '#a78bfa';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(cx, cy - 10, 35, -Math.PI / 2, arcEnd);
            ctx.stroke();
            ctx.shadowBlur = 0;

            const rotate = phase * 2;
            ctx.strokeStyle = '#a78bfa';
            ctx.lineWidth = 2;
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2 + rotate;
                ctx.beginPath();
                ctx.moveTo(cx + Math.cos(angle) * 30, cy - 10 + Math.sin(angle) * 30);
                ctx.lineTo(cx + Math.cos(angle) * 38, cy - 10 + Math.sin(angle) * 38);
                ctx.stroke();
            }

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 16px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(time, cx, cy + 38);

            ctx.fillStyle = '#8a99ad';
            ctx.font = '9px JetBrains Mono';
            ctx.fillText(`${cyc.toLocaleString()} ciclos @ ${clk} MHz`, cx, cy - 8);
        });
    },

    subnet: function(canvas, cidr, mask, hosts) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        const pad = 15;
        const boxW = (w - 2 * pad - 15) / 4;
        let phase = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);
            phase += 0.03;

            const grad = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, w * 0.4);
            grad.addColorStop(0, 'rgba(79, 156, 249, 0.04)');
            grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            const octets = mask.split('.');
            for (let i = 0; i < 4; i++) {
                const curBits = Math.max(0, Math.min(8, cidr - i * 8));
                const x = pad + i * (boxW + 5);
                const y = h / 2 - 18;

                ctx.fillStyle = '#1a1f2e';
                ctx.beginPath();
                ctx.roundRect(x, y, boxW, 32, 6);
                ctx.fill();

                const borderColor = curBits === 8 ? '#4f9cf9' : curBits > 0 ? '#f9c74f' : '#3f495e';
                ctx.strokeStyle = borderColor;
                ctx.lineWidth = curBits > 0 ? 2 : 1;
                ctx.strokeRect(x, y, boxW, 32);

                ctx.fillStyle = curBits === 8 ? '#4f9cf9' : curBits > 0 ? '#f9c74f' : '#4a5570';
                ctx.font = 'bold 12px JetBrains Mono';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(octets[i], x + boxW / 2, y + 16);

                ctx.fillStyle = '#3f495e';
                ctx.font = '7px JetBrains Mono';
                ctx.textBaseline = 'top';
                ctx.fillText(`/${curBits}`, x + boxW / 2, y - 12);
            }

            ctx.fillStyle = '#4ff97b';
            ctx.font = 'bold 10px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(`/${cidr} • ${hosts.toLocaleString()} IPs útiles`, w / 2, h - 8);
        });
    },

    cocomo: function(canvas, esfuerzo, tiempo, personal) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        let phase = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);
            phase += 0.03;

            const midX = w / 3;
            const bw = w - midX - 20;
            const p1 = Math.min(esfuerzo * 4, bw);
            const p2 = Math.min(tiempo * 5, bw);
            const anim = Math.min(1, phase);

            ctx.fillStyle = '#1a1f2e';
            ctx.beginPath();
            ctx.roundRect(midX, 15, bw, 14, 4);
            ctx.fill();
            ctx.fillStyle = '#4f9cf9';
            ctx.beginPath();
            ctx.roundRect(midX, 15, p1 * anim, 14, [4, 0, 0, 4]);
            ctx.fill();

            ctx.fillStyle = '#1a1f2e';
            ctx.beginPath();
            ctx.roundRect(midX, 38, bw, 14, 4);
            ctx.fill();
            ctx.fillStyle = '#f9c74f';
            ctx.beginPath();
            ctx.roundRect(midX, 38, p2 * anim, 14, [4, 0, 0, 4]);
            ctx.fill();

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 10px JetBrains Mono';
            ctx.textAlign = 'left';
            ctx.fillText(`Esfuerzo: ${esfuerzo.toFixed(1)} M-P`, 15, 26);
            ctx.fillText(`Duración: ${tiempo.toFixed(1)} meses`, 15, 49);

            ctx.fillStyle = '#4ff97b';
            ctx.font = 'bold 10px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(`Equipo: ${Math.ceil(personal)} personas`, w / 2, h - 8);
        });
    },

    transfer: function(canvas, size, speed, time) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        const pad = 20;
        let phase = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);
            phase += 0.04;

            const grad = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, w * 0.4);
            grad.addColorStop(0, 'rgba(79, 249, 123, 0.04)');
            grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            ctx.fillStyle = '#1a1f2e';
            ctx.beginPath();
            ctx.roundRect(pad, h / 2 - 5, w - 2 * pad, 10, 5);
            ctx.fill();

            const wave = 0.6 + 0.4 * Math.sin(phase);
            const fillW = (w - 2 * pad) * 0.65 * wave;

            const g2 = ctx.createLinearGradient(pad, 0, pad + fillW, 0);
            g2.addColorStop(0, '#4ff97b');
            g2.addColorStop(1, '#2563eb');
            ctx.fillStyle = g2;
            ctx.shadowColor = '#4ff97b';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.roundRect(pad, h / 2 - 5, fillW, 10, [5, 0, 0, 5]);
            ctx.fill();
            ctx.shadowBlur = 0;

            for (let i = 0; i < 5; i++) {
                const px = pad + 15 + ((phase * 80 + i * 40) % (w - 2 * pad - 20));
                ctx.fillStyle = 'rgba(255,255,255,0.4)';
                ctx.beginPath();
                ctx.arc(px, h / 2, 2, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(time, w / 2, h / 2 - 18);

            ctx.fillStyle = '#8a99ad';
            ctx.font = '8px JetBrains Mono';
            ctx.fillText(`${size} GB @ ${speed} Mbps (TCP/IP)`, w / 2, h / 2 + 22);
        });
    },

    ascii: function(canvas, txt, codes) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        const pad = 10;
        let phase = 0;
        const cellW = Math.min(60, (w - 2 * pad) / Math.max(1, txt.length));
        const cellH = 50;
        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);
            phase += 0.04;
            const startX = (w - cellW * txt.length) / 2;
            const cy = h / 2;
            for (let i = 0; i < txt.length; i++) {
                const x = startX + i * cellW;
                const glow = 0.5 + 0.5 * Math.sin(phase + i * 0.8);
                ctx.fillStyle = '#1a1f2e';
                ctx.beginPath();
                ctx.roundRect(x, cy - cellH / 2, cellW - 2, cellH, 6);
                ctx.fill();
                ctx.strokeStyle = i === Math.floor(phase * txt.length) % txt.length ? '#4f9cf9' : '#2a3345';
                ctx.lineWidth = i === Math.floor(phase * txt.length) % txt.length ? 2 : 1;
                ctx.strokeRect(x, cy - cellH / 2, cellW - 2, cellH);
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 16px JetBrains Mono';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(txt[i], x + (cellW - 2) / 2, cy - 6);
                ctx.fillStyle = '#4f9cf9';
                ctx.font = 'bold 10px JetBrains Mono';
                ctx.fillText(codes[i].toString(), x + (cellW - 2) / 2, cy + 14);
                ctx.fillStyle = '#4a5570';
                ctx.font = '8px JetBrains Mono';
                ctx.fillText(`0x${codes[i].toString(16)}`, x + (cellW - 2) / 2, cy + 20);
            }
        });
    },

    factorial: function(canvas, n, result) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        const cx = w / 2, cy = h / 2;
        let phase = 0;
        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);
            phase += 0.03;
            const grad = ctx.createRadialGradient(cx, cy, 5, cx, cy, w * 0.4);
            grad.addColorStop(0, 'rgba(79, 156, 249, 0.04)');
            grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
            const r = Math.min(w, h) * 0.2;
            ctx.strokeStyle = '#2a3345';
            ctx.lineWidth = 1.5;
            for (let i = 0; i < n; i++) {
                const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
                const px = cx + r * Math.cos(angle + phase * 0.5);
                const py = cy + r * Math.sin(angle + phase * 0.5);
                ctx.fillStyle = `hsl(${220 + i * 20}, 80%, 60%)`;
                ctx.beginPath();
                ctx.arc(px, py, 12, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#111';
                ctx.font = 'bold 9px JetBrains Mono';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText((n - i).toString(), px, py);
            }
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 16px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(`${n}!`, cx, cy + r + 24);
            ctx.fillStyle = '#4a5570';
            ctx.font = '9px JetBrains Mono';
            ctx.fillText(result.toLocaleString(), cx, cy + r + 38);
        });
    },

    fibonacci: function(canvas, n, result) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        const pad = 20;
        let phase = 0;
        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);
            phase += 0.02;
            const seq = [0, 1];
            for (let i = 2; i <= Math.min(n, 30); i++) seq.push(seq[i - 1] + seq[i - 2]);
            const maxV = Math.max(...seq, 1);
            const bw = (w - 2 * pad) / seq.length;
            seq.forEach((v, i) => {
                const bh = Math.max(4, (v / maxV) * (h - 40));
                const x = pad + i * bw;
                const y = h - 10 - bh;
                const hue = (i * 25 + 220) % 360;
                ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${0.5 + 0.5 * Math.min(1, phase)})`;
                ctx.fillRect(x, y, bw - 2, bh);
                if (i <= n) {
                    ctx.fillStyle = '#fff';
                    ctx.font = '7px JetBrains Mono';
                    ctx.textAlign = 'center';
                    ctx.fillText(v.toString(), x + bw / 2, y - 4);
                }
            });
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 11px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(`F(${n}) = ${result.toLocaleString()}`, w / 2, 12);
        });
    },

    mcd_mcm: function(canvas, a, b, mcd, mcm) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        const cx = w / 2, cy = h / 2;
        let phase = 0;
        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);
            phase += 0.03;
            const grad = ctx.createRadialGradient(cx, cy, 5, cx, cy, w * 0.4);
            grad.addColorStop(0, 'rgba(79, 249, 123, 0.04)');
            grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#1a1f2e';
            ctx.beginPath();
            ctx.roundRect(15, cy - 30, w / 2 - 20, 28, 6);
            ctx.fill();
            ctx.strokeStyle = '#4f9cf9';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(15, cy - 30, w / 2 - 20, 28);
            ctx.fillStyle = '#1a1f2e';
            ctx.beginPath();
            ctx.roundRect(w / 2 + 5, cy - 30, w / 2 - 20, 28, 6);
            ctx.fill();
            ctx.strokeStyle = '#f9c74f';
            ctx.strokeRect(w / 2 + 5, cy - 30, w / 2 - 20, 28);
            ctx.fillStyle = '#4f9cf9';
            ctx.font = 'bold 13px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`MCD: ${mcd}`, w / 4 + 7, cy - 16);
            ctx.fillStyle = '#f9c74f';
            ctx.fillText(`MCM: ${mcm}`, (3 * w) / 4 + 2, cy - 16);
            ctx.fillStyle = '#4a5570';
            ctx.font = '8px JetBrains Mono';
            ctx.fillText(`${a} y ${b}`, w / 4 + 7, cy + 2);
            ctx.fillText(`${a} y ${b}`, (3 * w) / 4 + 2, cy + 2);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 11px JetBrains Mono';
            ctx.fillText(`MCD(${a},${b}) × MCM(${a},${b}) = ${a * b}`, cx, cy + 24);
        });
    },

    primos: function(canvas, n, esPrimo, primosHasta) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        const pad = 15;
        let phase = 0;
        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);
            phase += 0.02;
            const grad = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, w * 0.4);
            grad.addColorStop(0, 'rgba(249, 199, 79, 0.04)');
            grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
            const cols = 10;
            const rows = Math.ceil(n / cols);
            const size = Math.min((w - 2 * pad) / cols, 22);
            const startX = (w - cols * size) / 2;
            const startY = (h - rows * size) / 2;
            for (let i = 1; i <= n; i++) {
                const col = (i - 1) % cols;
                const row = Math.floor((i - 1) / cols);
                const x = startX + col * size;
                const y = startY + row * size;
                const isPrime = primosHasta.includes(i);
                ctx.fillStyle = isPrime ? '#4ff97b' : '#1a1f2e';
                ctx.beginPath();
                ctx.roundRect(x + 1, y + 1, size - 2, size - 2, 3);
                ctx.fill();
                if (isPrime) {
                    ctx.fillStyle = '#111';
                    ctx.shadowColor = '#4ff97b';
                    ctx.shadowBlur = 5;
                } else {
                    ctx.fillStyle = '#4a5570';
                }
                ctx.font = `${Math.min(9, size - 4)}px JetBrains Mono`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(i.toString(), x + size / 2, y + size / 2);
                ctx.shadowBlur = 0;
            }
            const anim = 0.5 + 0.5 * Math.sin(phase);
            ctx.fillStyle = esPrimo ? '#4ff97b' : '#f94f4f';
            ctx.font = 'bold 12px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(`${n} ${esPrimo ? 'es PRIMO' : 'NO es primo'}`, w / 2, h - 5);
            ctx.shadowBlur = 0;
        });
    },

    hash_djb2: function(canvas, txt, hash, hex) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        const pad = 20;
        let phase = 0;
        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);
            phase += 0.03;
            const grad = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, w * 0.4);
            grad.addColorStop(0, 'rgba(167, 139, 250, 0.04)');
            grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
            const bits = hash.toString(2).padStart(32, '0');
            ctx.fillStyle = '#1a1f2e';
            ctx.beginPath();
            ctx.roundRect(pad, h / 2 - 10, w - 2 * pad, 20, 4);
            ctx.fill();
            for (let i = 0; i < 32; i++) {
                const x = pad + (i / 32) * (w - 2 * pad);
                const bw = (w - 2 * pad) / 32;
                if (bits[i] === '1') {
                    ctx.fillStyle = '#a78bfa';
                    ctx.shadowColor = '#a78bfa';
                    ctx.shadowBlur = 4;
                    ctx.fillRect(x, h / 2 - 10, bw, 20);
                    ctx.shadowBlur = 0;
                }
            }
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(`0x${hex}`, w / 2, h / 2 - 20);
            ctx.fillStyle = '#4a5570';
            ctx.font = '8px JetBrains Mono';
            ctx.fillText(`"${txt}" → ${hash}`, w / 2, h / 2 + 24);
        });
    },

    cesar: function(canvas, txt, k, result) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        const cx = w / 2, cy = h / 2;
        let phase = 0;
        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);
            phase += 0.03;
            const grad = ctx.createRadialGradient(cx, cy, 5, cx, cy, w * 0.4);
            grad.addColorStop(0, 'rgba(249, 199, 79, 0.04)');
            grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
            const r = Math.min(w, h) * 0.3;
            const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            for (let i = 0; i < 26; i++) {
                const angle = (i / 26) * Math.PI * 2 - Math.PI / 2;
                const shifted = (i + k) % 26;
                const px = cx + r * Math.cos(angle);
                const py = cy + r * Math.sin(angle);
                ctx.fillStyle = '#1a1f2e';
                ctx.beginPath();
                ctx.arc(px, py, 10, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = shifted === Math.floor(phase * 26) % 26 ? '#f9c74f' : '#4a5570';
                ctx.font = 'bold 9px JetBrains Mono';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(letters[shifted], px, py);
            }
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 11px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(`"${txt}" → "${result}"`, cx, h - 10);
            ctx.fillStyle = '#4a5570';
            ctx.font = '8px JetBrains Mono';
            ctx.fillText(`k = ${k}`, cx, 14);
        });
    },

    distancia_hamming: function(canvas, s1, s2, dist, diffs) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        const pad = 15;
        let phase = 0;
        const cellW = Math.min(40, (w - 2 * pad) / Math.max(1, s1.length));
        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);
            phase += 0.04;
            const startX = (w - cellW * s1.length) / 2;
            const cy1 = h / 2 - 16, cy2 = h / 2 + 16;
            for (let i = 0; i < s1.length; i++) {
                const x = startX + i * cellW;
                const different = diffs.includes(i);
                const glow = 0.6 + 0.4 * Math.sin(phase * 2 + i);
                ctx.fillStyle = different ? '#1a1f2e' : '#1a1f2e';
                ctx.beginPath();
                ctx.roundRect(x, cy1 - 12, cellW - 2, 24, 4);
                ctx.fill();
                ctx.strokeStyle = different ? '#f94f4f' : '#2a3345';
                ctx.lineWidth = different ? 2 : 1;
                ctx.strokeRect(x, cy1 - 12, cellW - 2, 24);
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 13px JetBrains Mono';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(s1[i], x + (cellW - 2) / 2, cy1);
                if (different) {
                    ctx.fillStyle = '#f94f4f';
                    ctx.shadowColor = '#f94f4f';
                    ctx.shadowBlur = 6 * glow;
                } else {
                    ctx.fillStyle = '#4ff97b';
                }
                ctx.beginPath();
                ctx.roundRect(x, cy2 - 12, cellW - 2, 24, 4);
                ctx.fill();
                ctx.fillStyle = '#111';
                ctx.shadowBlur = 0;
                ctx.fillText(s2[i], x + (cellW - 2) / 2, cy2);
            }
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 13px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(`Distancia: ${dist}`, w / 2, h - 8);
        });
    }
};

ProgramacionVisual.base64 = function(canvas, input, output, dir) {
    this._stopLoop(canvas);
    const ctx = this.initCanvas(canvas);
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);
    const pad = 20;
    let phase = 0;

    this._startLoop(canvas, () => {
        ctx.clearRect(0, 0, w, h);
        phase += 0.03;

        const grad = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, w * 0.4);
        grad.addColorStop(0, 'rgba(167, 139, 250, 0.04)');
        grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        const boxW = w - 2 * pad;
        ctx.fillStyle = '#1a1f2e';
        ctx.beginPath();
        ctx.roundRect(pad, h / 2 - 32, boxW, 24, 6);
        ctx.fill();
        ctx.strokeStyle = '#4f9cf9';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(pad, h / 2 - 32, boxW, 24);

        ctx.fillStyle = '#1a1f2e';
        ctx.beginPath();
        ctx.roundRect(pad, h / 2 + 8, boxW, 24, 6);
        ctx.fill();
        ctx.strokeStyle = '#4ff97b';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(pad, h / 2 + 8, boxW, 24);

        ctx.fillStyle = '#4f9cf9';
        ctx.font = 'bold 11px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(input.length > 30 ? input.substring(0, 27) + '…' : input, w / 2, h / 2 - 20);

        ctx.fillStyle = '#4ff97b';
        ctx.fillText(output.length > 30 ? output.substring(0, 27) + '…' : output, w / 2, h / 2 + 20);

        ctx.strokeStyle = '#a78bfa';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(pad + 10, h / 2 - 8);
        ctx.lineTo(pad + 10 + 15 * Math.sin(phase), h / 2 + 8);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#4a5570';
        ctx.font = '8px JetBrains Mono';
        ctx.fillText(dir === 'encode' ? '→ Base64' : '→ Texto', w / 2, h - 6);
    });
};

ProgramacionVisual.sha256 = function(canvas, txt, hash) {
    this._stopLoop(canvas);
    const ctx = this.initCanvas(canvas);
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);
    const pad = 20;
    let phase = 0;

    this._startLoop(canvas, () => {
        ctx.clearRect(0, 0, w, h);
        phase += 0.03;

        const grad = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, w * 0.4);
        grad.addColorStop(0, 'rgba(167, 139, 250, 0.04)');
        grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#1a1f2e';
        ctx.beginPath();
        ctx.roundRect(pad, h / 2 - 12, w - 2 * pad, 24, 6);
        ctx.fill();

        for (let i = 0; i < 64; i++) {
            const x = pad + (i / 64) * (w - 2 * pad);
            const bw = (w - 2 * pad) / 64;
            const nibble = parseInt(hash[i] || '0', 16);
            const intensity = 0.15 + (nibble / 15) * 0.85;
            const hue = (i * 5 + 220) % 360;
            ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${intensity})`;
            const hh = 6 + nibble * 1.2;
            ctx.shadowColor = `hsla(${hue}, 80%, 60%, 0.3)`;
            ctx.shadowBlur = 3;
            ctx.fillRect(x, h / 2 - hh / 2, bw, hh);
            ctx.shadowBlur = 0;
        }

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(`"${txt.length > 20 ? txt.substring(0, 17) + '…' : txt}"`, w / 2, h / 2 - 26);
        ctx.fillStyle = '#a78bfa';
        ctx.font = 'bold 9px JetBrains Mono';
        let displayHash = hash.substring(0, 32) + '…' + hash.substring(48);
        ctx.fillText(displayHash, w / 2, h / 2 + 22);
    });
};

ProgramacionVisual.md5 = function(canvas, txt, hash) {
    this._stopLoop(canvas);
    const ctx = this.initCanvas(canvas);
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);
    const pad = 20;
    let phase = 0;

    this._startLoop(canvas, () => {
        ctx.clearRect(0, 0, w, h);
        phase += 0.04;

        const grad = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, w * 0.4);
        grad.addColorStop(0, 'rgba(249, 199, 79, 0.04)');
        grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#1a1f2e';
        ctx.beginPath();
        ctx.roundRect(pad, h / 2 - 14, w - 2 * pad, 28, 6);
        ctx.fill();

        const blocks = hash.match(/.{1,4}/g) || [];
        blocks.forEach((block, i) => {
            const x = pad + (i / blocks.length) * (w - 2 * pad);
            const bw = (w - 2 * pad) / blocks.length;
            ctx.fillStyle = i % 2 === 0 ? '#f9c74f' : '#f97b4f';
            ctx.globalAlpha = 0.3 + 0.3 * Math.sin(phase + i);
            ctx.fillRect(x + 1, h / 2 - 10, bw - 2, 20);
            ctx.globalAlpha = 1;
            ctx.fillStyle = '#fff';
            ctx.font = '10px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(block, x + bw / 2, h / 2);
        });

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(`"${txt.length > 15 ? txt.substring(0, 12) + '…' : txt}"`, w / 2, h / 2 - 26);
        ctx.fillStyle = '#4a5570';
        ctx.font = '8px JetBrains Mono';
        ctx.fillText(`MD5: ${hash}`, w / 2, h / 2 + 24);
    });
};

ProgramacionVisual.uuid = function(canvas, uuid) {
    this._stopLoop(canvas);
    const ctx = this.initCanvas(canvas);
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);
    let phase = 0;

    this._startLoop(canvas, () => {
        ctx.clearRect(0, 0, w, h);
        phase += 0.04;

        const grad = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, w * 0.4);
        grad.addColorStop(0, 'rgba(79, 249, 123, 0.04)');
        grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        const parts = uuid.split('-');
        const totalW = parts.reduce((s, p) => s + p.length, 0) + parts.length - 1;
        const charW = Math.min(10, (w - 30) / totalW);
        let x = (w - totalW * charW) / 2;
        const cy = h / 2;
        const chars = uuid.replace(/-/g, '');

        for (let i = 0; i < chars.length; i++) {
            const glow = 0.4 + 0.6 * Math.sin(phase + i * 0.3);
            ctx.fillStyle = `hsla(${220 + i * 8}, 80%, 60%, ${0.5 + 0.5 * glow})`;
            ctx.font = `bold ${charW + 4}px JetBrains Mono`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(chars[i], x + i * charW + charW / 2, cy + 2 * Math.sin(phase + i * 0.5));
        }

        const dashPositions = [8, 12, 16, 20];
        dashPositions.forEach(pos => {
            const dx = x + pos * charW - charW / 2;
            ctx.fillStyle = '#4a5570';
            ctx.font = 'bold 14px JetBrains Mono';
            ctx.fillText('-', dx, cy);
        });

        ctx.fillStyle = '#4a5570';
        ctx.font = '8px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText('UUID v4', w / 2, h - 8);
    });
};

ProgramacionVisual.json_tool = function(canvas, formatted, tipo, keys) {
    this._stopLoop(canvas);
    const ctx = this.initCanvas(canvas);
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);
    const pad = 15;
    let phase = 0;

    this._startLoop(canvas, () => {
        ctx.clearRect(0, 0, w, h);
        phase += 0.03;

        const grad = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, w * 0.4);
        grad.addColorStop(0, 'rgba(79, 156, 249, 0.04)');
        grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        const lines = formatted.split('\n');
        const maxLines = Math.min(lines.length, 6);
        const lineH = 18;
        const startY = (h - maxLines * lineH) / 2;

        for (let i = 0; i < maxLines; i++) {
            const y = startY + i * lineH;
            const line = lines[i];
            const isKey = line.includes('":');
            ctx.fillStyle = isKey ? '#4f9cf9' : '#4ff97b';
            ctx.font = '10px JetBrains Mono';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(line.length > 50 ? line.substring(0, 47) + '…' : line, pad, y);
        }

        const statusY = startY + maxLines * lineH + 10;
        ctx.fillStyle = '#4ff97b';
        ctx.font = 'bold 11px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(`✓ JSON ${tipo}${keys ? ' · ' + keys + ' claves' : ''}`, w / 2, statusY);
    });
};
