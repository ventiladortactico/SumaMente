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
