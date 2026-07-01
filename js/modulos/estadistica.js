const EstadisticaVisual = {
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

    normal: function(canvas, x, m, s) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        const p = 25;
        const pdf = (v, mu, sigma) => (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((v - mu) / sigma, 2));
        const start = m - 4 * s, end = m + 4 * s;
        const maxY = pdf(m, m, s);
        const scX = (v) => p + (v - start) / (end - start) * (w - 2 * p);
        const scY = (v) => (h - p) - (v / maxY) * (h - 2 * p);
        let phase = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);
            phase += 0.02;

            const grad = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, w * 0.4);
            grad.addColorStop(0, 'rgba(79, 156, 249, 0.04)');
            grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            const animFill = Math.min(phase * 2, 1);
            ctx.fillStyle = `rgba(79, 156, 249, ${0.15 * animFill})`;
            ctx.beginPath();
            ctx.moveTo(scX(start), h - p);
            for (let i = start; i <= x; i += (end - start) / 100) {
                ctx.lineTo(scX(i), scY(pdf(i, m, s)));
            }
            ctx.lineTo(scX(x), h - p);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = '#2a3345';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p, h - p);
            ctx.lineTo(w - p, h - p);
            ctx.stroke();

            ctx.strokeStyle = '#4f9cf9';
            ctx.lineWidth = 2.5;
            ctx.shadowColor = '#4f9cf9';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            for (let i = start; i <= end; i += (end - start) / 100) {
                const px = scX(i), py = scY(pdf(i, m, s));
                i === start ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
            }
            ctx.stroke();
            ctx.shadowBlur = 0;

            const curX = scX(x);
            if (curX >= p && curX <= w - p) {
                ctx.beginPath();
                ctx.setLineDash([4, 4]);
                ctx.strokeStyle = '#f94f4f';
                ctx.moveTo(curX, h - p);
                ctx.lineTo(curX, scY(pdf(x, m, s)));
                ctx.stroke();
                ctx.setLineDash([]);

                ctx.fillStyle = '#f94f4f';
                ctx.shadowColor = '#f94f4f';
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(curX, scY(pdf(x, m, s)), 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;

                ctx.fillStyle = '#f94f4f';
                ctx.font = 'bold 10px JetBrains Mono';
                ctx.textAlign = 'center';
                ctx.fillText(`x: ${x}`, curX, scY(pdf(x, m, s)) - 14);
            }
        });
    },

    basica: function(canvas, nums, media, mediana, sd) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        const padding = 25;
        const min = nums[0];
        const max = nums[nums.length - 1];
        const q1 = nums[Math.floor(nums.length * 0.25)];
        const q3 = nums[Math.floor(nums.length * 0.75)];
        const plotWidth = w - 2 * padding;
        const scX = (v) => padding + ((v - min) / (max - min)) * plotWidth;
        let phase = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);
            phase += 0.03;

            const grad = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, w * 0.4);
            grad.addColorStop(0, 'rgba(79, 249, 123, 0.04)');
            grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            const anim = Math.min(phase, 1);

            ctx.strokeStyle = '#2a3345';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(scX(min), h / 2);
            ctx.lineTo(scX(max), h / 2);
            ctx.stroke();

            ctx.fillStyle = `rgba(79, 156, 249, ${0.25 * anim})`;
            ctx.fillRect(scX(q1), h / 2 - 15, (scX(q3) - scX(q1)) * anim, 30);
            ctx.strokeStyle = '#4f9cf9';
            ctx.lineWidth = 2;
            ctx.strokeRect(scX(q1), h / 2 - 15, (scX(q3) - scX(q1)) * anim, 30);

            ctx.strokeStyle = '#f97b4f';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#f97b4f';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.moveTo(scX(mediana), h / 2 - 20);
            ctx.lineTo(scX(mediana), h / 2 + 20);
            ctx.stroke();
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#4ff97b';
            ctx.shadowColor = '#4ff97b';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(scX(media), h / 2, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#fff';
            ctx.font = '9px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(`x̄: ${media.toFixed(1)}`, scX(media), h / 2 - 28);
            ctx.fillStyle = '#f97b4f';
            ctx.fillText(`Me: ${mediana}`, scX(mediana), h / 2 + 35);
            ctx.fillStyle = '#8a99ad';
            ctx.fillText(`Min: ${min}`, scX(min), h / 2 + 18);
            ctx.fillText(`Max: ${max}`, scX(max), h / 2 + 18);
        });
    },

    percentiles: function(canvas, nums, idx, pVal, k) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        const n = nums.length;
        const padding = 30;
        const paso = (w - 2 * padding) / (n - 1);
        let phase = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);
            phase += 0.03;

            const anim = Math.min(phase * 1.5, 1);

            nums.forEach((val, i) => {
                const x = padding + i * paso;
                const hB = (val / Math.max(...nums)) * (h - 60);
                const isBefore = i <= idx;

                ctx.fillStyle = isBefore ? '#4f9cf9' : '#1a1f2e';
                ctx.shadowColor = isBefore ? '#4f9cf9' : 'transparent';
                ctx.shadowBlur = isBefore ? 4 : 0;
                ctx.beginPath();
                ctx.roundRect(x - 6, h - padding - hB * anim, 12, hB * anim, 3);
                ctx.fill();
                ctx.shadowBlur = 0;

                ctx.fillStyle = '#8a99ad';
                ctx.font = '7px JetBrains Mono';
                ctx.textAlign = 'center';
                ctx.fillText(val, x, h - padding + 12);
            });

            const mX = padding + idx * paso;
            ctx.strokeStyle = '#f94f4f';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(mX, 10);
            ctx.lineTo(mX, h - padding);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = '#f94f4f';
            ctx.font = 'bold 10px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(`P${k}`, mX, 8);
        });
    },

    regresion: function(canvas, x, y, m, b) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        const padding = 25;
        const minX = Math.min(...x);
        const maxX = Math.max(...x);
        const minY = Math.min(...y);
        const maxY = Math.max(...y);
        const scX = (v) => padding + ((v - minX) / (maxX - minX || 1)) * (w - 2 * padding);
        const scY = (v) => (h - padding) - ((v - minY) / (maxY - minY || 1)) * (h - 2 * padding);
        let phase = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);
            phase += 0.02;

            const grad = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, w * 0.4);
            grad.addColorStop(0, 'rgba(79, 249, 123, 0.04)');
            grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            const lineY1 = m * minX + b;
            const lineY2 = m * maxX + b;
            ctx.strokeStyle = '#4ff97b';
            ctx.lineWidth = 2.5;
            ctx.shadowColor = '#4ff97b';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.moveTo(scX(minX), scY(lineY1));
            ctx.lineTo(scX(maxX), scY(lineY2));
            ctx.stroke();
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#4f9cf9';
            x.forEach((xi, i) => {
                const delay = (i / x.length) * Math.PI * 2;
                const scale = Math.min(1, (phase * 3) - delay / 3);
                if (scale > 0) {
                    ctx.beginPath();
                    ctx.arc(scX(xi), scY(y[i]), 4 * scale, 0, Math.PI * 2);
                    ctx.fill();
                }
            });

            ctx.fillStyle = '#fff';
            ctx.font = '9px JetBrains Mono';
            ctx.textAlign = 'left';
            ctx.fillText(`y = ${m.toFixed(2)}x + ${b.toFixed(2)}`, padding + 5, padding + 15);
            ctx.fillStyle = '#8a99ad';
            ctx.fillText(`R² = ${(m * m * (x.length * x.reduce((s, v) => s + v * v, 0) - Math.pow(x.reduce((s, v) => s + v, 0), 2)) / (x.length * x.reduce((s, v) => s + v * v, 0) - Math.pow(x.reduce((s, v) => s + v, 0), 2))).toFixed(4)}`, padding + 5, padding + 30);
        });
    },

    confianza: function(canvas, li, ls, xBar) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        const center = w / 2;
        const rawW = w - 80;
        let phase = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);
            phase += 0.03;

            const grad = ctx.createRadialGradient(center, h / 2, 5, center, h / 2, w * 0.4);
            grad.addColorStop(0, 'rgba(249, 199, 79, 0.04)');
            grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            const anim = Math.min(phase * 2, 1);

            ctx.strokeStyle = '#2a3345';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(20, h / 2);
            ctx.lineTo(w - 20, h / 2);
            ctx.stroke();

            const lx = center - rawW / 3;
            const rx = center + rawW / 3;

            ctx.strokeStyle = '#f9c74f';
            ctx.lineWidth = 6;
            ctx.shadowColor = '#f9c74f';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.moveTo(lx, h / 2);
            ctx.lineTo(lx + (rx - lx) * anim, h / 2);
            ctx.stroke();
            ctx.shadowBlur = 0;

            ctx.lineWidth = 2;
            ctx.strokeStyle = '#f9c74f';
            ctx.beginPath();
            ctx.moveTo(lx, h / 2 - 10);
            ctx.lineTo(lx, h / 2 + 10);
            ctx.moveTo(rx, h / 2 - 10);
            ctx.lineTo(rx, h / 2 + 10);
            ctx.stroke();

            ctx.fillStyle = '#f94f4f';
            ctx.shadowColor = '#f94f4f';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(center, h / 2, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#fff';
            ctx.font = '10px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(`L.I: ${li.toFixed(2)}`, lx, h / 2 + 28);
            ctx.fillText(`L.S: ${ls.toFixed(2)}`, rx, h / 2 + 28);
            ctx.fillStyle = '#f94f4f';
            ctx.font = 'bold 11px JetBrains Mono';
            ctx.fillText(`x̄: ${xBar.toFixed(2)}`, center, h / 2 - 20);
        });
    },

    combinatoria: function(canvas, comb, perm) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        const maxVal = Math.max(comb, perm, 1);
        let phase = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);
            phase += 0.03;

            const anim = Math.min(phase, 1);
            const hComb = (comb / maxVal) * (h - 40) * anim;
            const hPerm = (perm / maxVal) * (h - 40) * anim;

            ctx.fillStyle = '#a78bfa';
            ctx.shadowColor = '#a78bfa';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.roundRect(w / 4 - 20, h - 20 - hComb, 40, hComb, [4, 4, 0, 0]);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#4f9cf9';
            ctx.shadowColor = '#4f9cf9';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.roundRect((3 * w) / 4 - 20, h - 20 - hPerm, 40, hPerm, [4, 4, 0, 0]);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 10px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`nCr`, w / 4, h - 20 - hComb - 12);
            ctx.fillText(`nPr`, (3 * w) / 4, h - 20 - hPerm - 12);
            ctx.fillStyle = '#8a99ad';
            ctx.font = '9px JetBrains Mono';
            ctx.fillText(`${comb}`, w / 4, h - 5);
            ctx.fillText(`${perm}`, (3 * w) / 4, h - 5);
        });
    },

    media_geo: function(canvas, arith, geo, harm) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        const maxV = Math.max(arith, geo, harm, 1) * 1.3;
        let phase = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);
            phase += 0.03;
            const anim = Math.min(phase, 1);

            ctx.fillStyle = '#1a1f2e';
            ctx.fillRect(0, 0, w, h);

            const items = [
                { v: arith, label: 'Aritm', color: '#4f9cf9' },
                { v: geo,   label: 'Geom',  color: '#4ff97b' },
                { v: harm,  label: 'Armón', color: '#f9c74f' }
            ];
            const barW = (w - 40) / items.length - 10;

            items.forEach((item, i) => {
                const cx = 20 + i * ((w - 40) / items.length) + ((w - 40) / items.length) / 2;
                const bH = (item.v / maxV) * (h - 60) * anim;
                const bY = h - 30 - bH;

                ctx.fillStyle = item.color;
                ctx.shadowColor = item.color;
                ctx.shadowBlur = 6;
                ctx.beginPath();
                ctx.roundRect(cx - barW/2, bY, barW, bH, [4, 4, 0, 0]);
                ctx.fill();
                ctx.shadowBlur = 0;

                ctx.fillStyle = '#fff';
                ctx.font = '9px JetBrains Mono';
                ctx.textAlign = 'center';
                ctx.fillText(item.v.toFixed(2), cx, bY - 8);
                ctx.fillStyle = '#8a99ad';
                ctx.fillText(item.label, cx, h - 12);
            });
        });
    },

    probabilidad: function(canvas, p, fav, pos) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        let phase = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);
            phase += 0.02;

            const cx = w / 2, cy = h / 2;
            const r = Math.min(w, h) / 2 - 20;
            const anim = Math.min(phase * 2, 1);
            const pAngle = p * Math.PI * 2 * anim;

            ctx.fillStyle = '#1a1f2e';
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#4f9cf9';
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + pAngle);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#4ff97b44';
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, r, -Math.PI / 2 + pAngle, Math.PI * 3 / 2);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${(p * 100).toFixed(1)}%`, cx, cy - 8);
            ctx.fillStyle = '#8a99ad';
            ctx.font = '9px JetBrains Mono';
            ctx.fillText(`${fav}/${pos}`, cx, cy + 10);
        });
    },

    binomial: function(canvas, n, p, k, prob) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        const padding = 20;
        let phase = 0;

        const fact = num => num <= 1 ? 1 : num * fact(num - 1);
        const comb = x => fact(n) / (fact(x) * fact(n - x));
        const binomProb = x => comb(x) * Math.pow(p, x) * Math.pow(1 - p, n - x);

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);
            phase += 0.03;
            const anim = Math.min(phase, 1);

            ctx.fillStyle = '#0a0b0e';
            ctx.fillRect(0, 0, w, h);

            let maxProb = 0;
            for (let i = 0; i <= n; i++) maxProb = Math.max(maxProb, binomProb(i));

            const barW = (w - 2 * padding) / (n + 1);
            for (let i = 0; i <= n; i++) {
                const bH = (binomProb(i) / maxProb) * (h - 50) * anim;
                const bx = padding + i * barW;
                const by = h - 25 - bH;

                ctx.fillStyle = i === k ? '#f94f4f' : '#4f9cf9';
                ctx.shadowColor = i === k ? '#f94f4f' : '#4f9cf9';
                ctx.shadowBlur = i === k ? 8 : 2;
                ctx.fillRect(bx + 2, by, barW - 4, bH);
                ctx.shadowBlur = 0;

                if (i === k) {
                    ctx.fillStyle = '#f94f4f';
                    ctx.font = 'bold 8px JetBrains Mono';
                    ctx.textAlign = 'center';
                    ctx.fillText(`P=${prob.toFixed(3)}`, bx + barW / 2, by - 6);
                }
            }

            ctx.fillStyle = '#8a99ad';
            ctx.font = '7px JetBrains Mono';
            ctx.textAlign = 'center';
            for (let i = 0; i <= n; i++) {
                ctx.fillText(i, padding + i * barW + barW / 2, h - 10);
            }
        });
    },

    poisson: function(canvas, lam, k, prob) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        const padding = 20;
        let phase = 0;

        const fact = num => num <= 1 ? 1 : num * fact(num - 1);
        const poisProb = x => Math.pow(lam, x) * Math.exp(-lam) / fact(x);
        const maxK = Math.max(k + 3, Math.ceil(lam * 3));

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);
            phase += 0.03;
            const anim = Math.min(phase, 1);

            ctx.fillStyle = '#0a0b0e';
            ctx.fillRect(0, 0, w, h);

            let maxProb = 0;
            for (let i = 0; i <= maxK; i++) maxProb = Math.max(maxProb, poisProb(i));

            const barW = (w - 2 * padding) / (maxK + 1);
            for (let i = 0; i <= maxK; i++) {
                const bH = (poisProb(i) / maxProb) * (h - 50) * anim;
                const bx = padding + i * barW;
                const by = h - 25 - bH;

                ctx.fillStyle = i === k ? '#f94f4f' : '#a78bfa';
                ctx.shadowColor = i === k ? '#f94f4f' : '#a78bfa';
                ctx.shadowBlur = i === k ? 8 : 2;
                ctx.fillRect(bx + 2, by, barW - 4, bH);
                ctx.shadowBlur = 0;

                if (i === k) {
                    ctx.fillStyle = '#f94f4f';
                    ctx.font = 'bold 8px JetBrains Mono';
                    ctx.textAlign = 'center';
                    ctx.fillText(`P=${prob.toFixed(4)}`, bx + barW / 2, by - 6);
                }
            }

            ctx.fillStyle = '#8a99ad';
            ctx.font = '7px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(`λ=${lam}`, w / 2, h - 4);
        });
    },

    chi_cuadrado: function(canvas, obs, esp, chi2) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        const padding = 30;
        let phase = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);
            phase += 0.03;
            const anim = Math.min(phase, 1);

            ctx.fillStyle = '#0a0b0e';
            ctx.fillRect(0, 0, w, h);

            const maxV = Math.max(...obs, ...esp) * 1.2;
            const barW = (w - 2 * padding) / (obs.length * 2 + 1);

            obs.forEach((o, i) => {
                const bx1 = padding + i * (barW * 2 + 3);
                const bH1 = (o / maxV) * (h - 50) * anim;
                const by1 = h - 25 - bH1;

                ctx.fillStyle = '#4f9cf9';
                ctx.shadowColor = '#4f9cf9';
                ctx.shadowBlur = 4;
                ctx.fillRect(bx1, by1, barW, bH1);
                ctx.shadowBlur = 0;

                const bx2 = bx1 + barW + 3;
                const bH2 = (esp[i] / maxV) * (h - 50) * anim;
                const by2 = h - 25 - bH2;

                ctx.fillStyle = '#f9c74f';
                ctx.shadowColor = '#f9c74f';
                ctx.shadowBlur = 4;
                ctx.fillRect(bx2, by2, barW, bH2);
                ctx.shadowBlur = 0;

                ctx.fillStyle = '#8a99ad';
                ctx.font = '6px JetBrains Mono';
                ctx.textAlign = 'center';
                ctx.fillText(i, bx1 + barW / 2, h - 10);
            });

            ctx.fillStyle = '#4f9cf9';
            ctx.font = '7px JetBrains Mono';
            ctx.textAlign = 'left';
            ctx.fillText('Obs', padding, 12);
            ctx.fillStyle = '#f9c74f';
            ctx.fillText('Esp', padding + 30, 12);
            ctx.fillStyle = '#f9c74f';
            ctx.textAlign = 'right';
            ctx.font = '9px JetBrains Mono';
            ctx.fillText(`χ² = ${chi2.toFixed(3)}`, w - padding, 12);
        });
    },

    prob_condicional: function(canvas, pAGivenB, pInt, pB) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        let phase = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);
            phase += 0.02;

            const cx = w / 2, cy = h / 2;
            const r1 = Math.min(w, h) * 0.3;
            const r2 = Math.min(w, h) * 0.25;
            const offset = r1 * 0.3;
            const anim = Math.min(phase * 2, 1);

            ctx.fillStyle = '#0a0b0e';
            ctx.fillRect(0, 0, w, h);

            const bg = ctx.createRadialGradient(cx, cy, 5, cx, cy, r1 + 20);
            bg.addColorStop(0, 'rgba(79, 156, 249, 0.04)');
            bg.addColorStop(1, 'rgba(10, 11, 14, 0)');
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, w, h);

            ctx.fillStyle = `rgba(79, 156, 249, ${0.15 * anim})`;
            ctx.beginPath();
            ctx.arc(cx - offset, cy, r1 * anim, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#4f9cf9';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = `rgba(249, 199, 79, ${0.15 * anim})`;
            ctx.beginPath();
            ctx.arc(cx + offset, cy, r2 * anim, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#f9c74f';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = '#fff';
            ctx.font = '10px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('A', cx - offset, cy - r1 - 10);
            ctx.fillText('B', cx + offset, cy - r2 - 10);
            ctx.fillStyle = '#f94f4f';
            ctx.font = 'bold 9px JetBrains Mono';
            ctx.fillText(`P(A|B)=${pAGivenB.toFixed(3)}`, cx, cy + r1 + 16);
        });
    },

    teorema_bayes: function(canvas, pAGivenB, pBdA, pA, pB) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        let phase = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);
            phase += 0.02;

            const cx = w / 2, cy = h / 2;
            const r1 = Math.min(w, h) * 0.3;
            const r2 = Math.min(w, h) * 0.28;
            const offset = r1 * 0.25;
            const anim = Math.min(phase * 2, 1);

            ctx.fillStyle = '#0a0b0e';
            ctx.fillRect(0, 0, w, h);

            const bg = ctx.createRadialGradient(cx, cy, 5, cx, cy, r1 + 20);
            bg.addColorStop(0, 'rgba(167, 139, 250, 0.04)');
            bg.addColorStop(1, 'rgba(10, 11, 14, 0)');
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, w, h);

            ctx.fillStyle = `rgba(79, 249, 123, ${0.15 * anim})`;
            ctx.beginPath();
            ctx.arc(cx - offset, cy, r1 * anim, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#4ff97b';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = `rgba(167, 139, 250, ${0.15 * anim})`;
            ctx.beginPath();
            ctx.arc(cx + offset, cy, r2 * anim, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#a78bfa';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = '#fff';
            ctx.font = '10px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('A', cx - offset, cy - r1 - 10);
            ctx.fillText('B', cx + offset, cy - r2 - 10);
            ctx.fillStyle = '#f9c74f';
            ctx.font = 'bold 8px JetBrains Mono';
            ctx.fillText(`P(A|B)=${pAGivenB.toFixed(3)}`, cx, cy + Math.max(r1, r2) + 14);
        });
    },

    cuartiles: function(canvas, nums, q1, q2, q3) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        const min = nums[0], max = nums[nums.length - 1];
        const range = max - min || 1;
        const padding = 30;
        const scX = (v) => padding + ((v - min) / range) * (w - 2 * padding);
        let phase = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);
            phase += 0.03;
            const anim = Math.min(phase, 1);

            ctx.fillStyle = '#0a0b0e';
            ctx.fillRect(0, 0, w, h);

            const boxY = h / 2 - 20;
            const boxH = 40;

            ctx.fillStyle = `rgba(79, 156, 249, ${0.2 * anim})`;
            const bx1 = scX(q1), bx2 = scX(q3);
            ctx.fillRect(bx1, boxY, (bx2 - bx1) * anim, boxH);
            ctx.strokeStyle = '#4f9cf9';
            ctx.lineWidth = 2;
            ctx.strokeRect(bx1, boxY, (bx2 - bx1) * anim, boxH);

            ctx.strokeStyle = '#f94f4f';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#f94f4f';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.moveTo(scX(q2), boxY - 6);
            ctx.lineTo(scX(q2), boxY + boxH + 6);
            ctx.stroke();
            ctx.shadowBlur = 0;

            ctx.strokeStyle = '#8a99ad';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(scX(min), boxY + boxH / 2);
            ctx.lineTo(scX(q1), boxY + boxH / 2);
            ctx.moveTo(scX(q3), boxY + boxH / 2);
            ctx.lineTo(scX(max), boxY + boxH / 2);
            ctx.stroke();

            ctx.fillStyle = '#8a99ad';
            ctx.font = '7px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(min, scX(min), boxY + boxH + 14);
            ctx.fillText(max, scX(max), boxY + boxH + 14);
            ctx.fillText(`Q1=${q1}`, scX(q1), boxY + boxH + 14);
            ctx.fillText(`Q3=${q3}`, scX(q3), boxY + boxH + 14);
            ctx.fillStyle = '#f94f4f';
            ctx.font = 'bold 8px JetBrains Mono';
            ctx.fillText(`Q2=${q2}`, scX(q2), boxY - 12);
        });
    },

    desviacion_media: function(canvas, nums, media, dm) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        const min = Math.min(...nums), max = Math.max(...nums);
        const range = max - min || 1;
        const padding = 30;
        const scX = (v) => padding + ((v - min) / range) * (w - 2 * padding);
        let phase = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);
            phase += 0.03;
            const anim = Math.min(phase, 1);

            ctx.fillStyle = '#0a0b0e';
            ctx.fillRect(0, 0, w, h);

            const baseY = h / 2;
            ctx.strokeStyle = '#4ff97b';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#4ff97b';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.moveTo(scX(media), 10);
            ctx.lineTo(scX(media), h - 10);
            ctx.stroke();
            ctx.shadowBlur = 0;

            nums.forEach((v, i) => {
                const x = scX(v);
                const dev = (v - media) / (range || 1) * (h / 2 - 30) * anim;
                const color = v >= media ? '#4f9cf9' : '#f9c74f';

                ctx.fillStyle = color;
                ctx.shadowColor = color;
                ctx.shadowBlur = 3;
                const barH = Math.abs(dev);
                const barY = v >= media ? baseY : baseY - barH;
                ctx.fillRect(x - 4, barY, 8, Math.max(barH, 1));
                ctx.shadowBlur = 0;

                ctx.fillStyle = '#8a99ad';
                ctx.font = '7px JetBrains Mono';
                ctx.textAlign = 'center';
                ctx.fillText(v, x, baseY + 14);
            });

            ctx.fillStyle = '#4ff97b';
            ctx.font = 'bold 9px JetBrains Mono';
            ctx.textAlign = 'left';
            ctx.fillText(`x̄=${media.toFixed(2)}`, padding, 12);
            ctx.fillStyle = '#fff';
            ctx.fillText(`DM=${dm.toFixed(3)}`, padding, 24);
        });
    }
};

// ── Estadística: definiciones de fórmulas (FORMS) ──
// Nota: estas definiciones se agregaron aquí para mantener consistencia
// con los demás módulos (FORMS en archivo de módulo, visual en archivo separado).

FORMS.estad = {
    basica: {
        title: 'Estadística Descriptiva',
        formula: 'Análisis de tendencia central y dispersión',
        fields: [{ id: 'data', label: 'Datos (separados por espacio)', type: 'text', val: '10 15 15 20 25' }],
        calc(f) {
            let raw = f.data.value.trim().split(/[\s,]+/);
            let nums = raw.map(Number).filter(n => !isNaN(n)).sort((a,b) => a-b);
            if (nums.length < 2) return { error: true, msg: "Ingresá al menos 2 números", label: "Insuficiente" };

            let n = nums.length;
            let suma = nums.reduce((a, b) => a + b, 0);
            let media = suma / n;
            
            let med = n % 2 === 0 ? (nums[n/2-1] + nums[n/2]) / 2 : nums[Math.floor(n/2)];

            let varz = nums.reduce((a, b) => a + Math.pow(b - media, 2), 0) / (n - 1);
            let sd = Math.sqrt(varz);

            return {
                main: `Media: ${media.toFixed(2)}`,
                label: `N = ${n} muestras`,
                extras: [
                    { cls: 'info', txt: `Mediana: ${med} | Rango: ${nums[n-1] - nums[0]}` },
                    { cls: 'info', txt: `Desv. Estándar (s): ${sd.toFixed(3)}` },
                    { cls: 'ok', txt: `Suma total: ${suma}` }
                ],
                steps: [`Media = Σx / n = ${suma} / ${n}`, `s = √(Σ(x-μ)² / (n-1))`],
                chart(canvas) {
                    EstadisticaVisual.basica(canvas, nums, media, med, sd);
                }
            };
        }
    },
    percentiles: {
        title: 'Percentiles y Cuartiles',
        formula: 'Posición de datos P_k = k * (n + 1) / 100',
        fields: [
            { id: 'data', label: 'Datos (separados por espacio)', type: 'text', val: '3 5 7 8 9 11 13 15' },
            { id: 'k', label: 'Percentil deseado (k: 1-99)', type: 'text', val: '75' }
        ],
        calc(f) {
            let raw = f.data.value.trim().split(/[\s,]+/);
            let nums = raw.map(Number).filter(n => !isNaN(n)).sort((a,b) => a-b);
            let k = parseFloat(f.k.value);

            if (nums.length < 2) return { error: true, msg: "Faltan datos", label: "Error" };
            if (isNaN(k) || k < 1 || k > 99) return { error: true, msg: "k debe estar entre 1 y 99", label: "Rango Inválido" };

            let n = nums.length;
            let idx = (k / 100) * (n - 1);
            let low = Math.floor(idx);
            let high = Math.ceil(idx);
            let pVal = nums[low] + (idx - low) * (nums[high] - nums[low]);

            return {
                main: `P(${k}) = ${pVal.toFixed(2)}`,
                label: `Percentil ${k}`,
                extras: [
                    { cls: 'info', txt: `Valor mínimo: ${nums[0]} | Máximo: ${nums[n-1]}` },
                    { cls: 'ok', txt: `Índice calculado pos: ${idx.toFixed(2)}` }
                ],
                steps: [`Posición aproximada = (${k}/100) * (${n}-1)`],
                chart(canvas) {
                    EstadisticaVisual.percentiles(canvas, nums, idx, pVal, k);
                }
            };
        }
    },
    regresion: {
        title: 'Regresión Lineal Simple',
        formula: 'y = mx + b',
        fields: [
            { id: 'x_vals', label: 'Valores X (ej: 1 2 3)', type: 'text', val: '1 2 3 4 5' },
            { id: 'y_vals', label: 'Valores Y (ej: 2 4 5)', type: 'text', val: '3 5 7 9 11' }
        ],
        calc(f) {
            let x = f.x_vals.value.trim().split(/[\s,]+/).map(Number);
            let y = f.y_vals.value.trim().split(/[\s,]+/).map(Number);
            if (x.length !== y.length || x.length < 2) return { error: true, msg: "X e Y deben tener la misma cantidad de datos (min 2)", label: "Desajuste" };

            let n = x.length;
            let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
            for (let i = 0; i < n; i++) {
                sumX += x[i]; sumY += y[i];
                sumXY += x[i] * y[i]; sumXX += x[i] * x[i];
            }
            let m = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
            let b = (sumY - m * sumX) / n;

            return {
                main: `y = ${m.toFixed(2)}x + ${b.toFixed(2)}`,
                label: 'Ecuación de la recta',
                extras: [{ cls: 'info', txt: `Pendiente (m): ${m.toFixed(4)}` }, { cls: 'info', txt: `Intersección (b): ${b.toFixed(4)}` }],
                steps: [`m = (nΣxy - ΣxΣy) / (nΣx² - (Σx)²)`, `b = (Σy - mΣx) / n`],
                chart(canvas) {
                    EstadisticaVisual.regresion(canvas, x, y, m, b);
                }
            };
        }
    },
    normal: {
        title: 'Distribución Normal (Z-Score)',
        formula: 'Z = (x − μ) / σ',
        fields: [
            { id: 'x', label: 'Valor (x)', val: '115' },
            { id: 'm', label: 'Media (μ)', val: '100' },
            { id: 's', label: 'Desv. Estándar (σ)', val: '15' }
        ],
        calc(f) {
            let x = parseFloat(f.x.value), m = parseFloat(f.m.value), s = parseFloat(f.s.value);
            if (isNaN(x) || isNaN(m) || isNaN(s)) return null;
            if (s <= 0) return { error: true, msg: "σ debe ser mayor a 0", label: "Error" };
            let z = (x - m) / s;
            return { 
                main: `Z = ${z.toFixed(4)}`,
                label: 'Puntaje Z',
                extras: [{ cls: 'info', txt: `A ${z.toFixed(2)} desviaciones de la media` }],
                steps: [`Z = (${x} - ${m}) / ${s}`],
                chart(canvas) {
                    EstadisticaVisual.normal(canvas, x, m, s);
                }
            };
        }
    },
    confianza: {
        title: 'Intervalo de Confianza (Media)',
        formula: 'IC = x̄ ± Z * (s / √n)',
        fields: [
            { id: 'media', label: 'Media muestral (x̄)', val: '50' },
            { id: 'sd', label: 'Desv. Estándar (s)', val: '10' },
            { id: 'n', label: 'Tamaño muestra (n)', val: '30' },
            { id: 'conf', label: 'Confianza (90, 95 o 99%)', val: '95' }
        ],
        calc(f) {
            let xBar = parseFloat(f.media.value), s = parseFloat(f.sd.value), n = parseFloat(f.n.value), c = parseFloat(f.conf.value);
            if (s <= 0 || n <= 1) return { error: true, msg: "Parámetros inválidos (n > 1, s > 0)", label: "Error" };
            
            let z = 1.96; 
            if (c === 90) z = 1.645;
            else if (c === 99) z = 2.576;

            let margen = z * (s / Math.sqrt(n));
            let li = xBar - margen;
            let ls = xBar + margen;

            return {
                main: `[${li.toFixed(2)} ; ${ls.toFixed(2)}]`,
                label: `Intervalo de Confianza al ${c}%`,
                extras: [{ cls: 'warn', txt: `Margen de Error (E): ±${margen.toFixed(3)}` }],
                steps: [`Error estándar = ${s} / √${n}`, `Margen = ${z} * Error est.`],
                chart(canvas) {
                    EstadisticaVisual.confianza(canvas, li, ls, xBar);
                }
            };
        }
    },
    combinatoria: {
        title: 'Combinatoria y Permutaciones',
        formula: 'nCr = n! / (r!(n-r)!)  |  nPr = n! / (n-r)!',
        fields: [
            { id: 'n', label: 'Elementos Totales (n)', val: '5' },
            { id: 'r', label: 'Elementos Elegidos (r)', val: '3' }
        ],
        calc(f) {
            let n = parseInt(f.n.value), r = parseInt(f.r.value);
            if (isNaN(n) || isNaN(r) || n < 0 || r < 0 || r > n) {
                return { error: true, msg: "Requisitos: n >= r >= 0", label: "Matemática Errónea" };
            }

            const fact = num => num <= 1 ? 1 : num * fact(num - 1);
            
            let comb = fact(n) / (fact(r) * fact(n - r));
            let perm = fact(n) / fact(n - r);

            return {
                main: `nCr: ${comb} | nPr: ${perm}`,
                label: 'Combinaciones y Permutaciones',
                extras: [
                    { cls: 'ok', txt: `Formas de agrupar sin importar orden (nCr): ${comb}` },
                    { cls: 'info', txt: `Formas donde sí importa el orden (nPr): ${perm}` }
                ],
                steps: [`nCr = ${n}! / (${r}! * (${n}-${r})!)`],
                chart(canvas) {
                    EstadisticaVisual.combinatoria(canvas, comb, perm);
                }
            };
        }
    }
};

if (!FORMS.estad) FORMS.estad = {};
Object.assign(FORMS.estad, {

    media_geo: {
        title: 'Media Geométrica y Armónica',
        formula: 'G = (∏x)^(1/n)  |  H = n / ∑(1/x)',
        fields: [{ id: 'data', label: 'Datos (separados por espacio)', type: 'text', val: '2 4 8 16' }],
        calc(f) {
            let raw = f.data.value.trim().split(/[\s,]+/);
            let nums = raw.map(Number).filter(n => !isNaN(n) && n > 0);
            if (nums.length < 2) return { error: true, msg: "Ingresá al menos 2 números positivos", label: "Insuficiente" };
            let n = nums.length;
            let prod = nums.reduce((a, b) => a * b, 1);
            let geo = Math.pow(prod, 1 / n);
            let sumInv = nums.reduce((a, b) => a + 1 / b, 0);
            let harm = n / sumInv;
            let arith = nums.reduce((a, b) => a + b, 0) / n;
            return {
                main: `G: ${geo.toFixed(4)} | H: ${harm.toFixed(4)}`,
                label: `n = ${n}`,
                extras: [
                    { cls: 'info', txt: `Media aritmética: ${arith.toFixed(4)}` },
                    { cls: 'ok', txt: `G ≥ H (${geo.toFixed(4)} ≥ ${harm.toFixed(4)})` }
                ],
                steps: [`G = (${nums.join(' × ')})^(1/${n})`, `H = ${n} / (${nums.map(v => '1/' + v).join(' + ')})`],
                chart(canvas) { EstadisticaVisual.media_geo(canvas, arith, geo, harm); }
            };
        }
    },

    probabilidad: {
        title: 'Probabilidad Simple',
        formula: 'P = Casos favorables / Casos posibles',
        fields: [
            { id: 'favorables', label: 'Casos favorables', val: '1' },
            { id: 'posibles', label: 'Casos posibles', val: '6' }
        ],
        calc(f) {
            let fav = parseInt(f.favorables.value);
            let pos = parseInt(f.posibles.value);
            if (isNaN(fav) || isNaN(pos) || pos <= 0 || fav < 0) return { error: true, msg: "Valores inválidos", label: "Error" };
            if (fav > pos) return { error: true, msg: "Favorables no puede superar a posibles", label: "Error" };
            let p = fav / pos;
            let pct = p * 100;
            return {
                main: `P = ${p.toFixed(4)}`,
                label: 'Probabilidad',
                extras: [
                    { cls: 'info', txt: `${pct.toFixed(2)}% de probabilidad` },
                    { cls: 'ok', txt: `Razón: ${fav}:${pos}` }
                ],
                steps: [`P = ${fav} / ${pos}`, `P = ${p.toFixed(6)}`],
                chart(canvas) { EstadisticaVisual.probabilidad(canvas, p, fav, pos); }
            };
        }
    },

    binomial: {
        title: 'Distribución Binomial',
        formula: 'P(X=k) = C(n,k) × p^k × (1-p)^(n-k)',
        fields: [
            { id: 'n', label: 'Número de ensayos (n)', val: '10' },
            { id: 'k', label: 'Éxitos deseados (k)', val: '3' },
            { id: 'p', label: 'Probabilidad de éxito (p)', val: '0.5' }
        ],
        calc(f) {
            let n = parseInt(f.n.value), k = parseInt(f.k.value), p = parseFloat(f.p.value);
            if (isNaN(n) || isNaN(k) || isNaN(p) || n < 0 || k < 0 || k > n || p < 0 || p > 1)
                return { error: true, msg: "Requisitos: n ≥ k ≥ 0, 0 ≤ p ≤ 1", label: "Error" };
            const fact = num => num <= 1 ? 1 : num * fact(num - 1);
            let comb = fact(n) / (fact(k) * fact(n - k));
            let prob = comb * Math.pow(p, k) * Math.pow(1 - p, n - k);
            return {
                main: `P(X=${k}) = ${prob.toFixed(6)}`,
                label: `Binomial(n=${n}, p=${p})`,
                extras: [
                    { cls: 'info', txt: `Media: μ = ${(n * p).toFixed(4)}` },
                    { cls: 'info', txt: `Desv. est: σ = ${(Math.sqrt(n * p * (1 - p))).toFixed(4)}` }
                ],
                steps: [`C(${n},${k}) = ${comb}`, `P = ${comb} × ${p}^${k} × ${(1-p).toFixed(4)}^${n-k}`],
                chart(canvas) { EstadisticaVisual.binomial(canvas, n, p, k, prob); }
            };
        }
    },

    poisson: {
        title: 'Distribución de Poisson',
        formula: 'P(X=k) = (λ^k × e^(-λ)) / k!',
        fields: [
            { id: 'lambda', label: 'Tasa media (λ)', val: '3' },
            { id: 'k', label: 'Valor de k', val: '2' }
        ],
        calc(f) {
            let lam = parseFloat(f.lambda.value), k = parseInt(f.k.value);
            if (isNaN(lam) || isNaN(k) || lam <= 0 || k < 0) return { error: true, msg: "λ > 0, k ≥ 0", label: "Error" };
            const fact = num => num <= 1 ? 1 : num * fact(num - 1);
            let prob = Math.pow(lam, k) * Math.exp(-lam) / fact(k);
            return {
                main: `P(X=${k}) = ${prob.toFixed(6)}`,
                label: `Poisson(λ=${lam})`,
                extras: [
                    { cls: 'info', txt: `Media = Varianza = ${lam.toFixed(4)}` },
                    { cls: 'ok', txt: `Desv. est: ${Math.sqrt(lam).toFixed(4)}` }
                ],
                steps: [`P = (${lam}^${k} × e^(-${lam})) / ${k}!`],
                chart(canvas) { EstadisticaVisual.poisson(canvas, lam, k, prob); }
            };
        }
    },

    chi_cuadrado: {
        title: 'Chi-Cuadrado (χ²)',
        formula: 'χ² = Σ((O-E)²/E)',
        fields: [
            { id: 'observados', label: 'Frecuencias observadas (espacio)', type: 'text', val: '10 12 8 15' },
            { id: 'esperados', label: 'Frecuencias esperadas (espacio)', type: 'text', val: '10 10 10 10' }
        ],
        calc(f) {
            let obs = f.observados.value.trim().split(/[\s,]+/).map(Number).filter(n => !isNaN(n));
            let esp = f.esperados.value.trim().split(/[\s,]+/).map(Number).filter(n => !isNaN(n));
            if (obs.length !== esp.length || obs.length < 2) return { error: true, msg: "Misma cantidad de observados y esperados (min 2)", label: "Desajuste" };
            let chi2 = 0;
            for (let i = 0; i < obs.length; i++) {
                if (esp[i] <= 0) return { error: true, msg: "Esperados deben ser > 0", label: "Error" };
                chi2 += Math.pow(obs[i] - esp[i], 2) / esp[i];
            }
            return {
                main: `χ² = ${chi2.toFixed(4)}`,
                label: `Con ${obs.length - 1} grados de libertad`,
                extras: [
                    { cls: 'info', txt: `Suma observados: ${obs.reduce((a,b) => a+b, 0)}` },
                    { cls: 'info', txt: `Suma esperados: ${esp.reduce((a,b) => a+b, 0)}` }
                ],
                steps: obs.map((o, i) => `(${o} - ${esp[i]})² / ${esp[i]} = ${(Math.pow(o - esp[i], 2) / esp[i]).toFixed(4)}`),
                chart(canvas) { EstadisticaVisual.chi_cuadrado(canvas, obs, esp, chi2); }
            };
        }
    },

    prob_condicional: {
        title: 'Probabilidad Condicional',
        formula: 'P(A|B) = P(A∩B) / P(B)',
        fields: [
            { id: 'p_interseccion', label: 'P(A∩B)', val: '0.3' },
            { id: 'p_b', label: 'P(B)', val: '0.5' }
        ],
        calc(f) {
            let pInt = parseFloat(f.p_interseccion.value);
            let pB = parseFloat(f.p_b.value);
            if (isNaN(pInt) || isNaN(pB) || pB <= 0 || pInt < 0 || pInt > 1 || pB > 1)
                return { error: true, msg: "Rango 0-1, P(B) > 0", label: "Error" };
            let pAGivenB = pInt / pB;
            return {
                main: `P(A|B) = ${pAGivenB.toFixed(4)}`,
                label: 'Probabilidad condicional',
                extras: [
                    { cls: 'info', txt: `P(A∩B) = ${pInt.toFixed(4)}` },
                    { cls: 'info', txt: `P(B) = ${pB.toFixed(4)}` }
                ],
                steps: [`P(A|B) = ${pInt} / ${pB}`],
                chart(canvas) { EstadisticaVisual.prob_condicional(canvas, pAGivenB, pInt, pB); }
            };
        }
    },

    teorema_bayes: {
        title: 'Teorema de Bayes',
        formula: 'P(A|B) = P(B|A) × P(A) / P(B)',
        fields: [
            { id: 'p_b_dado_a', label: 'P(B|A)', val: '0.8' },
            { id: 'p_a', label: 'P(A)', val: '0.3' },
            { id: 'p_b', label: 'P(B)', val: '0.5' }
        ],
        calc(f) {
            let pBdA = parseFloat(f.p_b_dado_a.value);
            let pA = parseFloat(f.p_a.value);
            let pB = parseFloat(f.p_b.value);
            if (isNaN(pBdA) || isNaN(pA) || isNaN(pB) || pB <= 0 || pBdA < 0 || pA < 0 || pBdA > 1 || pA > 1 || pB > 1)
                return { error: true, msg: "Rango 0-1, P(B) > 0", label: "Error" };
            let pAGivenB = (pBdA * pA) / pB;
            return {
                main: `P(A|B) = ${pAGivenB.toFixed(4)}`,
                label: 'Probabilidad posterior',
                extras: [
                    { cls: 'info', txt: `P(B|A) × P(A) = ${(pBdA * pA).toFixed(4)}` },
                    { cls: 'ok', txt: `Razón de verosimilitud: ${(pBdA / pB).toFixed(4)}` }
                ],
                steps: [`P(A|B) = (${pBdA} × ${pA}) / ${pB}`],
                chart(canvas) { EstadisticaVisual.teorema_bayes(canvas, pAGivenB, pBdA, pA, pB); }
            };
        }
    },

    cuartiles: {
        title: 'Cuartiles e IQR',
        formula: 'Q1, Q2 (mediana), Q3, IQR = Q3 - Q1',
        fields: [{ id: 'data', label: 'Datos (separados por espacio)', type: 'text', val: '3 7 8 9 12 15 18 20 25' }],
        calc(f) {
            let raw = f.data.value.trim().split(/[\s,]+/);
            let nums = raw.map(Number).filter(n => !isNaN(n)).sort((a,b) => a-b);
            if (nums.length < 4) return { error: true, msg: "Ingresá al menos 4 números", label: "Insuficiente" };
            let n = nums.length;
            let q2 = n % 2 === 0 ? (nums[n/2-1] + nums[n/2]) / 2 : nums[Math.floor(n/2)];
            let lowerHalf = nums.slice(0, Math.floor(n/2));
            let upperHalf = nums.slice(Math.ceil(n/2));
            let q1 = lowerHalf.length % 2 === 0 ? (lowerHalf[lowerHalf.length/2-1] + lowerHalf[lowerHalf.length/2]) / 2 : lowerHalf[Math.floor(lowerHalf.length/2)];
            let q3 = upperHalf.length % 2 === 0 ? (upperHalf[upperHalf.length/2-1] + upperHalf[upperHalf.length/2]) / 2 : upperHalf[Math.floor(upperHalf.length/2)];
            let iqr = q3 - q1;
            return {
                main: `Q1: ${q1} | Q2: ${q2} | Q3: ${q3}`,
                label: `n = ${n}`,
                extras: [
                    { cls: 'ok', txt: `IQR = ${iqr.toFixed(2)}` },
                    { cls: 'info', txt: `Rango: [${nums[0]}, ${nums[n-1]}]` }
                ],
                steps: [`Datos ordenados: ${nums.join(', ')}`, `Q2 (mediana) = ${q2}`],
                chart(canvas) { EstadisticaVisual.cuartiles(canvas, nums, q1, q2, q3); }
            };
        }
    },

    desviacion_media: {
        title: 'Desviación Media Absoluta',
        formula: 'DM = Σ|x - x̄| / n',
        fields: [{ id: 'data', label: 'Datos (separados por espacio)', type: 'text', val: '10 12 15 18 20' }],
        calc(f) {
            let raw = f.data.value.trim().split(/[\s,]+/);
            let nums = raw.map(Number).filter(n => !isNaN(n));
            if (nums.length < 2) return { error: true, msg: "Ingresá al menos 2 números", label: "Insuficiente" };
            let n = nums.length;
            let media = nums.reduce((a,b) => a+b, 0) / n;
            let desvMed = nums.reduce((a,b) => a + Math.abs(b - media), 0) / n;
            let varz = nums.reduce((a,b) => a + Math.pow(b - media, 2), 0) / (n - 1);
            return {
                main: `DM = ${desvMed.toFixed(4)}`,
                label: 'Desviación media absoluta',
                extras: [
                    { cls: 'info', txt: `Media: ${media.toFixed(4)}` },
                    { cls: 'info', txt: `Varianza: ${varz.toFixed(4)} | Desv. Est: ${Math.sqrt(varz).toFixed(4)}` }
                ],
                steps: [`x̄ = ${media.toFixed(4)}`, `DM = Σ|x - x̄| / ${n}`],
                chart(canvas) { EstadisticaVisual.desviacion_media(canvas, nums, media, desvMed); }
            };
        }
    }

});
