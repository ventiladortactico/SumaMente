const NutricionVisual = {
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

    macros: function(canvas, p, c, g) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        const cx = w / 2, cy = h / 2;
        const radius = Math.max(Math.min(w, h) / 2 - 25, 10);
        const data = [
            { value: Math.max(0, p || 0), color: '#4f9cf9', label: 'Proteínas' },
            { value: Math.max(0, c || 0), color: '#f9c74f', label: 'Carboh.' },
            { value: Math.max(0, g || 0), color: '#f94f4f', label: 'Grasas' }
        ];
        const total = data.reduce((s, item) => s + item.value, 0);
        if (total <= 0) return;

        let phase = 0;
        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);
            phase += 0.02;

            const grad = ctx.createRadialGradient(cx, cy, 5, cx, cy, radius + 20);
            grad.addColorStop(0, 'rgba(79, 156, 249, 0.04)');
            grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            ctx.shadowColor = 'rgba(0,0,0,0.3)';
            ctx.shadowBlur = 10;
            let startAngle = -Math.PI / 2;
            data.forEach(item => {
                const sliceAngle = (item.value / total) * 2 * Math.PI;
                ctx.beginPath();
                ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
                ctx.lineTo(cx, cy);
                ctx.fillStyle = item.color;
                ctx.fill();
                ctx.strokeStyle = '#111318';
                ctx.lineWidth = 2;
                ctx.stroke();
                const mid = startAngle + sliceAngle / 2;
                const lx = cx + radius * 0.65 * Math.cos(mid);
                const ly = cy + radius * 0.65 * Math.sin(mid);
                if (sliceAngle > 0.3) {
                    ctx.fillStyle = '#111318';
                    ctx.font = 'bold 9px JetBrains Mono';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(item.label, lx, ly);
                }
                startAngle += sliceAngle;
            });
            ctx.shadowBlur = 0;

            ctx.shadowColor = '#4f9cf9';
            ctx.shadowBlur = 8;
            ctx.fillStyle = '#111318';
            ctx.beginPath();
            ctx.arc(cx, cy, radius * 0.35, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${Math.round(p + c + g)}`, cx, cy - 4);
            ctx.fillStyle = '#4a5570';
            ctx.font = '7px JetBrains Mono';
            ctx.fillText('kcal', cx, cy + 8);

            ctx.fillStyle = '#4a5570';
            ctx.font = '8px JetBrains Mono';
            ctx.textBaseline = 'alphabetic';
            ctx.fillText(`P:${Math.round(p)}  C:${Math.round(c)}  G:${Math.round(g)}`, w / 2, h - 6);
        });
    },

    mifflin: function(canvas, tmb, get) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        const pad = 25, bw = w - 2 * pad, maxK = 4000;
        let phase = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);
            phase += 0.03;

            const grad = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, w * 0.4);
            grad.addColorStop(0, 'rgba(167, 139, 250, 0.04)');
            grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            const p1 = Math.min(tmb / maxK, 1);
            const p2 = Math.min(get / maxK, 1);
            const cy1 = h / 2 - 20, cy2 = h / 2 + 16;
            const anim1 = Math.min(1, phase * 2);
            const anim2 = Math.min(1, (phase - 0.5) * 2);

            ctx.fillStyle = '#1a1f2e';
            ctx.beginPath();
            ctx.roundRect(pad, cy1, bw, 14, 4);
            ctx.fill();
            const g1 = ctx.createLinearGradient(pad, 0, pad + bw, 0);
            g1.addColorStop(0, '#a78bfa');
            g1.addColorStop(1, '#7c3aed');
            ctx.fillStyle = g1;
            ctx.beginPath();
            ctx.roundRect(pad, cy1, bw * p1 * anim1, 14, [4, 0, 0, 4]);
            ctx.fill();

            ctx.fillStyle = '#1a1f2e';
            ctx.beginPath();
            ctx.roundRect(pad, cy2, bw, 14, 4);
            ctx.fill();
            const g2 = ctx.createLinearGradient(pad, 0, pad + bw, 0);
            g2.addColorStop(0, '#4f9cf9');
            g2.addColorStop(1, '#2563eb');
            ctx.fillStyle = g2;
            ctx.beginPath();
            ctx.roundRect(pad, cy2, bw * p2 * anim2, 14, [4, 0, 0, 4]);
            ctx.fill();

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 10px JetBrains Mono';
            ctx.textAlign = 'left';
            ctx.fillText(`TMB: ${Math.round(tmb)} kcal`, pad, cy1 - 4);
            ctx.fillStyle = '#8a99ad';
            ctx.fillText(`GET: ${Math.round(get)} kcal`, pad, cy2 + 22);
        });
    },

    balance: function(canvas, get, target) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        const pad = 25, bw = w - 2 * pad, bh = 16;
        const maxK = Math.max(get, target) * 1.3;
        let phase = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);
            phase += 0.03;

            const grad = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, w * 0.4);
            grad.addColorStop(0, 'rgba(249, 123, 79, 0.04)');
            grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            const cy = h / 2 - bh / 2;
            const pctA = Math.min(phase, 1);

            ctx.fillStyle = '#1a1f2e';
            ctx.beginPath();
            ctx.roundRect(pad, cy, bw, bh, 6);
            ctx.fill();

            const barW = Math.min(target / maxK, 1) * bw * pctA;
            const color = target < get ? '#f97b4f' : '#4f9cf9';
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.roundRect(pad, cy, barW, bh, [6, 0, 0, 6]);
            ctx.fill();

            const eqX = pad + (get / maxK) * bw;
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(eqX, cy - 4);
            ctx.lineTo(eqX, cy + bh + 4);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 10px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(`Obj: ${Math.round(target)} kcal`, pad + barW / 2, cy - 6);
            ctx.fillStyle = '#8a99ad';
            ctx.fillText(`Mant: ${Math.round(get)} kcal`, eqX, cy + bh + 16);
        });
    },

    imc: function(canvas, imc) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        const pad = 20, barW = w - 2 * pad, barH = 14;
        const rangos = [
            { min: 15, max: 18.5, color: '#4f9cf9', label: 'Bajo' },
            { min: 18.5, max: 25, color: '#4ff97b', label: 'Normal' },
            { min: 25, max: 30, color: '#f9c74f', label: 'Sobre' },
            { min: 30, max: 40, color: '#f94f4f', label: 'Obeso' },
        ];
        let phase = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);
            phase += 0.03;

            const cy = h / 2 - barH / 2;

            rangos.forEach(r => {
                const x1 = pad + ((r.min - 15) / 25) * barW;
                const x2 = pad + ((r.max - 15) / 25) * barW;
                ctx.fillStyle = r.color + '44';
                ctx.beginPath();
                ctx.roundRect(x1, cy, x2 - x1, barH, 4);
                ctx.fill();
                ctx.fillStyle = '#8a99ad';
                ctx.font = '7px JetBrains Mono';
                ctx.textAlign = 'left';
                ctx.fillText(r.label, x1 + 3, cy - 3);
            });

            const mx = pad + ((Math.min(imc, 40) - 15) / 25) * barW;
            ctx.shadowColor = '#fff';
            ctx.shadowBlur = 10 + 5 * Math.sin(phase);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(mx, cy - 6);
            ctx.lineTo(mx, cy + barH + 6);
            ctx.stroke();
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 13px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(`IMC: ${imc.toFixed(1)}`, w / 2, cy + barH + 22);
        });
    },

    carga_g: function(canvas, cg) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        const pad = 20, bw = w - 2 * pad, bh = 16;
        let phase = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);
            phase += 0.035;

            const cy = h / 2 - bh / 2;
            const color = cg < 10 ? '#4ff97b' : cg < 20 ? '#f9c74f' : '#f94f4f';
            const pct = Math.min(phase, Math.min(1, cg / 30));
            const animW = Math.min(1, cg / 30) * bw;

            ctx.fillStyle = '#1a1f2e';
            ctx.beginPath();
            ctx.roundRect(pad, cy, bw, bh, 6);
            ctx.fill();

            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.roundRect(pad, cy, bw * pct, bh, [6, 0, 0, 6]);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#fff';
            ctx.font = '11px JetBrains Mono';
            ctx.textAlign = 'left';
            ctx.fillText(`Carga: ${cg.toFixed(1)}`, pad, cy - 7);

            const label = cg < 10 ? 'Bajo' : cg < 20 ? 'Medio' : 'Alto';
            ctx.fillStyle = color;
            ctx.font = '8px JetBrains Mono';
            ctx.textAlign = 'right';
            ctx.fillText(label, pad + bw, cy - 7);
        });
    },

    calorias_alimento: function(canvas, p, c, g, kcal) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        const pad = 20, bw = w - 2 * pad, bh = 12;
        let phase = 0;
        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);
            phase += 0.03;
            const total = Math.max(1, p + c + g);
            const items = [
                { val: p, color: '#4f9cf9', label: 'Proteínas' },
                { val: c, color: '#f9c74f', label: 'Carbos' },
                { val: g, color: '#f94f4f', label: 'Grasas' }
            ];
            items.forEach((item, i) => {
                const y = pad + i * (bh + 6);
                const pct = item.val / total;
                ctx.fillStyle = '#1a1f2e';
                ctx.beginPath();
                ctx.roundRect(pad, y, bw, bh, 3);
                ctx.fill();
                const anim = Math.min(1, phase * (1 + i * 0.3));
                ctx.fillStyle = item.color;
                ctx.shadowColor = item.color;
                ctx.shadowBlur = 4;
                ctx.beginPath();
                ctx.roundRect(pad, y, bw * pct * anim, bh, [3, 0, 0, 3]);
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#fff';
                ctx.font = '8px JetBrains Mono';
                ctx.textAlign = 'left';
                ctx.fillText(`${item.label}: ${item.val.toFixed(1)}g`, pad, y - 3);
                ctx.fillStyle = '#4a5570';
                ctx.textAlign = 'right';
                ctx.fillText(`${(item.val*4).toFixed(0)} kcal`, pad + bw, y - 3);
            });
            ctx.fillStyle = '#4a5570';
            ctx.font = '9px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(`Total: ${kcal.toFixed(1)} kcal (P:${(p*4/kcal*100).toFixed(0)}% C:${(c*4/kcal*100).toFixed(0)}% G:${(g*9/kcal*100).toFixed(0)}%)`, w / 2, h - 5);
        });
    },

    agua_diaria: function(canvas, peso, agua) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        const cx = w / 2, cy = h / 2;
        const glassW = 50, glassH = 90;
        let phase = 0;
        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);
            phase += 0.02;
            const grad = ctx.createRadialGradient(cx, cy, 5, cx, cy, w * 0.4);
            grad.addColorStop(0, 'rgba(79, 156, 249, 0.04)');
            grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
            const fill = Math.min(0.95, Math.max(0.1, agua / 4000));
            ctx.strokeStyle = '#2a3345';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(cx - glassW / 2, cy - glassH / 2);
            ctx.lineTo(cx - glassW / 2, cy + glassH / 2);
            ctx.lineTo(cx + glassW / 2, cy + glassH / 2);
            ctx.lineTo(cx + glassW / 2, cy - glassH / 2);
            ctx.stroke();
            const waterH = glassH * fill;
            const wave = Math.sin(phase * 3) * 2;
            ctx.fillStyle = 'rgba(56, 189, 248, 0.5)';
            ctx.beginPath();
            ctx.moveTo(cx - glassW / 2 + 1, cy + glassH / 2);
            for (let x = cx - glassW / 2 + 1; x <= cx + glassW / 2 - 1; x++) {
                ctx.lineTo(x, cy + glassH / 2 - waterH + Math.sin(x * 0.15 + phase * 4) * 2 + wave);
            }
            ctx.lineTo(cx + glassW / 2 - 1, cy + glassH / 2);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#4f9cf9';
            ctx.font = 'bold 11px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(`${Math.round(agua)} mL`, cx, cy + glassH / 2 + 18);
            ctx.fillStyle = '#4a5570';
            ctx.font = '8px JetBrains Mono';
            ctx.fillText(`${(agua/1000).toFixed(1)}L para ${peso} kg`, cx, cy + glassH / 2 + 32);
        });
    },

    grasa_corporal: function(canvas, grasa) {
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
            const r = Math.min(w, h) * 0.25;
            const pct = Math.min(1, grasa / 50);
            ctx.strokeStyle = '#2a3345';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.stroke();
            const anim = Math.min(1, phase * 2);
            ctx.fillStyle = pct > 0.5 ? 'rgba(249, 79, 79, 0.3)' : 'rgba(249, 199, 79, 0.3)';
            ctx.beginPath();
            ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2) * pct * anim);
            ctx.lineTo(cx, cy);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 20px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${grasa.toFixed(1)}%`, cx, cy);
            ctx.fillStyle = '#4a5570';
            ctx.font = '8px JetBrains Mono';
            ctx.fillText('Grasa Corporal', cx, cy + r + 16);
        });
    },

    cintura_cadera: function(canvas, icc) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        const pad = 25, bw = w - 2 * pad, bh = 16;
        let phase = 0;
        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);
            phase += 0.03;
            const cy = h / 2 - bh / 2;
            const pct = Math.min(1, icc / 1.2);
            ctx.fillStyle = '#1a1f2e';
            ctx.beginPath();
            ctx.roundRect(pad, cy, bw, bh, 6);
            ctx.fill();
            const color = icc > 0.90 ? '#f94f4f' : icc > 0.85 ? '#f9c74f' : '#4ff97b';
            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.roundRect(pad, cy, bw * Math.min(1, phase) * pct, bh, [6, 0, 0, 6]);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(`ICC: ${icc.toFixed(2)}`, w / 2, cy - 10);
            ctx.fillStyle = '#4a5570';
            ctx.font = '8px JetBrains Mono';
            ctx.fillText('Cintura / Cadera', w / 2, cy + bh + 14);
        });
    },

    cintura_altura: function(canvas, ict) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        const pad = 25, bw = w - 2 * pad, bh = 16;
        let phase = 0;
        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);
            phase += 0.03;
            const cy = h / 2 - bh / 2;
            const pct = Math.min(1, ict / 0.8);
            ctx.fillStyle = '#1a1f2e';
            ctx.beginPath();
            ctx.roundRect(pad, cy, bw, bh, 6);
            ctx.fill();
            const color = ict > 0.6 ? '#f94f4f' : ict > 0.5 ? '#f9c74f' : '#4ff97b';
            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.roundRect(pad, cy, bw * Math.min(1, phase) * pct, bh, [6, 0, 0, 6]);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(`ICT: ${ict.toFixed(2)}`, w / 2, cy - 10);
            ctx.fillStyle = '#4a5570';
            ctx.font = '8px JetBrains Mono';
            ctx.fillText('Cintura / Altura', w / 2, cy + bh + 14);
        });
    },

    proteina_peso: function(canvas, peso, factor, prot) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        const pad = 25, bw = w - 2 * pad, bh = 14;
        let phase = 0;
        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);
            phase += 0.03;
            const maxProt = Math.max(prot, 200);
            const pct = Math.min(1, prot / maxProt);
            ctx.fillStyle = '#1a1f2e';
            ctx.beginPath();
            ctx.roundRect(pad, h / 2 - bh / 2, bw, bh, 6);
            ctx.fill();
            const g = ctx.createLinearGradient(pad, 0, pad + bw, 0);
            g.addColorStop(0, '#4f9cf9');
            g.addColorStop(1, '#4ff97b');
            ctx.fillStyle = g;
            ctx.shadowColor = '#4ff97b';
            ctx.shadowBlur = 5;
            ctx.beginPath();
            ctx.roundRect(pad, h / 2 - bh / 2, bw * Math.min(1, phase) * pct, bh, [6, 0, 0, 6]);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 13px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(`${prot.toFixed(1)} g/día`, w / 2, h / 2 - bh / 2 - 8);
            ctx.fillStyle = '#4a5570';
            ctx.font = '8px JetBrains Mono';
            ctx.fillText(`${peso} kg × ${factor} g/kg`, w / 2, h / 2 + bh / 2 + 14);
        });
    },

    peso_ideal_nutri: function(canvas, peso, sexo) {
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
            ctx.strokeStyle = '#2a3345';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cx - 50, cy + 5);
            ctx.lineTo(cx + 50, cy + 5);
            ctx.stroke();
            ctx.strokeStyle = '#2a3345';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(cx, cy + 5);
            ctx.lineTo(cx, cy + 15);
            ctx.stroke();
            ctx.strokeStyle = '#2a3345';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(cx - 55, cy + 5);
            ctx.lineTo(cx - 55, cy + 12);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(cx + 55, cy + 5);
            ctx.lineTo(cx + 55, cy + 12);
            ctx.stroke();
            const osc = Math.sin(phase * 2) * 3;
            ctx.fillStyle = '#4f9cf9';
            ctx.font = 'bold 14px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(`${peso.toFixed(1)} kg`, cx, cy - 18 + osc);
            ctx.fillStyle = '#4a5570';
            ctx.font = '8px JetBrains Mono';
            ctx.fillText(`Peso Ideal (${sexo === 'M' ? 'M' : 'F'})`, cx, cy + 24);
        });
    },

    deficit_calorico: function(canvas, get, ing, balance) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        const pad = 20;
        let phase = 0;
        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);
            phase += 0.03;
            const maxV = Math.max(get, ing) * 1.2;
            const bw = w - 2 * pad, bh = 14;
            const cy1 = h / 3, cy2 = h / 3 + 30;
            const anim = Math.min(1, phase);
            ctx.fillStyle = '#1a1f2e';
            ctx.beginPath();
            ctx.roundRect(pad, cy1, bw, bh, 4);
            ctx.fill();
            ctx.fillStyle = '#4f9cf9';
            ctx.beginPath();
            ctx.roundRect(pad, cy1, bw * Math.min(1, get / maxV) * anim, bh, [4, 0, 0, 4]);
            ctx.fill();
            ctx.fillStyle = '#1a1f2e';
            ctx.beginPath();
            ctx.roundRect(pad, cy2, bw, bh, 4);
            ctx.fill();
            ctx.fillStyle = '#f9c74f';
            ctx.beginPath();
            ctx.roundRect(pad, cy2, bw * Math.min(1, ing / maxV) * anim, bh, [4, 0, 0, 4]);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = '9px JetBrains Mono';
            ctx.textAlign = 'left';
            ctx.fillText(`GET: ${Math.round(get)} kcal`, pad, cy1 - 4);
            ctx.fillText(`Ingesta: ${Math.round(ing)} kcal`, pad, cy2 - 4);
            const deficitColor = balance > 0 ? '#4ff97b' : balance < 0 ? '#f94f4f' : '#f9c74f';
            ctx.fillStyle = deficitColor;
            ctx.font = 'bold 11px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(`Balance: ${balance > 0 ? '+' : ''}${Math.round(balance)} kcal`, w / 2, h - 6);
        });
    },

    frecuencia_cardiaca: function(canvas, fcm, edad) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        const pad = 20, bw = w - 2 * pad, bh = 18;
        let phase = 0;
        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);
            phase += 0.04;
            const zonas = [
                { name: 'Rec.', min: 0.5, max: 0.6, color: '#4f9cf9' },
                { name: 'Grasa', min: 0.6, max: 0.7, color: '#4ff97b' },
                { name: 'Cardio', min: 0.7, max: 0.8, color: '#f9c74f' },
                { name: 'Anaerobic', min: 0.8, max: 0.9, color: '#f97b4f' },
                { name: 'Máx', min: 0.9, max: 1.0, color: '#f94f4f' }
            ];
            zonas.forEach((z, i) => {
                const x1 = pad + bw * z.min;
                const x2 = pad + bw * z.max;
                const y = pad + i * (bh + 3);
                ctx.fillStyle = z.color + '33';
                ctx.beginPath();
                ctx.roundRect(x1, y, x2 - x1, bh, 3);
                ctx.fill();
                ctx.fillStyle = z.color;
                ctx.font = '7px JetBrains Mono';
                ctx.textAlign = 'center';
                ctx.fillText(z.name, (x1 + x2) / 2, y + bh / 2 + 2.5);
                const lo = Math.round(fcm * z.min);
                const hi = Math.round(fcm * z.max);
                ctx.fillStyle = '#4a5570';
                ctx.font = '6px JetBrains Mono';
                ctx.textAlign = 'left';
                if (i === 0) ctx.fillText(`${lo}-${hi}`, pad + 2, y - 2);
                if (i === zonas.length - 1) ctx.fillText(`${lo}-${hi}`, pad + bw - 16, y - 2);
            });
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(`FCM: ${fcm} lpm`, w / 2, h - 6);
        });
    },

    met_actividad: function(canvas, met, peso, horas, gasto) {
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
            grad.addColorStop(0, 'rgba(249, 123, 79, 0.04)');
            grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
            const r = Math.min(w, h) * 0.2;
            const fire = 0.5 + 0.5 * Math.sin(phase * 2);
            ctx.fillStyle = '#f97b4f';
            ctx.shadowColor = '#f97b4f';
            ctx.shadowBlur = 15 * fire;
            ctx.beginPath();
            ctx.moveTo(cx, cy - r);
            ctx.quadraticCurveTo(cx + r * fire, cy - r * 0.3, cx, cy + r * 0.8);
            ctx.quadraticCurveTo(cx - r * fire, cy - r * 0.3, cx, cy - r);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(`${gasto.toFixed(1)} kcal`, cx, cy + r + 18);
            ctx.fillStyle = '#4a5570';
            ctx.font = '8px JetBrains Mono';
            ctx.fillText(`MET ${met} × ${peso} kg × ${horas} h`, cx, cy + r + 32);
        });
    }
};

NutricionVisual.imc_infantil = function(canvas, imc, pct, cat) {
    this._stopLoop(canvas);
    const ctx = this.initCanvas(canvas);
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);
    let phase = 0;

    this._startLoop(canvas, () => {
        ctx.clearRect(0, 0, w, h);
        phase += 0.03;

        const grad = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, w * 0.4);
        grad.addColorStop(0, 'rgba(79, 249, 123, 0.04)');
        grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        const pad = 20;
        const bw = w - 2 * pad;
        const cy = h / 2 - 5;
        const pctNorm = Math.min(1, pct / 100);
        const color = pct < 5 ? '#4f9cf9' : pct < 85 ? '#4ff97b' : pct < 95 ? '#f9c74f' : '#f94f4f';

        ctx.fillStyle = '#1a1f2e';
        ctx.beginPath();
        ctx.roundRect(pad, cy, bw, 16, 6);
        ctx.fill();

        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.roundRect(pad, cy, bw * Math.min(1, phase) * pctNorm, 16, [6, 0, 0, 6]);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 13px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(`IMC: ${imc.toFixed(1)} | P${Math.round(pct)}`, w / 2, cy - 10);
        ctx.fillStyle = color;
        ctx.font = 'bold 10px JetBrains Mono';
        ctx.fillText(cat, w / 2, cy + 24);
    });
};

NutricionVisual.tdee = function(canvas, tmb, tdee, act) {
    this._stopLoop(canvas);
    const ctx = this.initCanvas(canvas);
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);
    let phase = 0;

    this._startLoop(canvas, () => {
        ctx.clearRect(0, 0, w, h);
        phase += 0.03;

        const grad = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, w * 0.4);
        grad.addColorStop(0, 'rgba(79, 156, 249, 0.04)');
        grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        const maxK = Math.max(tmb, tdee) * 1.2;
        const pad = 25, bw = w - 2 * pad, bh = 14;
        const cy1 = h / 2 - 18, cy2 = h / 2 + 10;

        ctx.fillStyle = '#1a1f2e';
        ctx.beginPath();
        ctx.roundRect(pad, cy1, bw, bh, 4);
        ctx.fill();
        ctx.fillStyle = '#4f9cf9';
        ctx.beginPath();
        ctx.roundRect(pad, cy1, bw * Math.min(1, tmb / maxK) * Math.min(1, phase), bh, [4, 0, 0, 4]);
        ctx.fill();

        ctx.fillStyle = '#1a1f2e';
        ctx.beginPath();
        ctx.roundRect(pad, cy2, bw, bh, 4);
        ctx.fill();
        ctx.fillStyle = '#f97b4f';
        ctx.shadowColor = '#f97b4f';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.roundRect(pad, cy2, bw * Math.min(1, tdee / maxK) * Math.min(1, phase), bh, [4, 0, 0, 4]);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#fff';
        ctx.font = '9px JetBrains Mono';
        ctx.textAlign = 'left';
        ctx.fillText(`TMB: ${Math.round(tmb)} kcal`, pad, cy1 - 4);
        ctx.fillStyle = '#f97b4f';
        ctx.fillText(`TDEE: ${Math.round(tdee)} kcal (×${act})`, pad, cy2 + bh + 10);
    });
};

NutricionVisual.ffmi = function(canvas, ffmi, cat) {
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

        const r = Math.min(w, h) * 0.25;
        const maxFFMI = 25;
        const pct = Math.min(1, ffmi / maxFFMI);

        ctx.strokeStyle = '#2a3345';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();

        const color = ffmi < 16.5 ? '#f9c74f' : ffmi < 20 ? '#4f9cf9' : ffmi < 22 ? '#4ff97b' : '#f94f4f';
        ctx.fillStyle = color + '44';
        ctx.beginPath();
        ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2) * pct * Math.min(1, phase));
        ctx.lineTo(cx, cy);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ffmi.toFixed(1), cx, cy - 4);
        ctx.fillStyle = color;
        ctx.font = '8px JetBrains Mono';
        ctx.fillText(cat, cx, cy + 16);
        ctx.fillStyle = '#4a5570';
        ctx.font = '7px JetBrains Mono';
        ctx.fillText('FFMI', cx, cy + r + 14);
    });
};

NutricionVisual.bai = function(canvas, bai, cat) {
    this._stopLoop(canvas);
    const ctx = this.initCanvas(canvas);
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);
    let phase = 0;

    this._startLoop(canvas, () => {
        ctx.clearRect(0, 0, w, h);
        phase += 0.03;

        const grad = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, w * 0.4);
        grad.addColorStop(0, 'rgba(249, 199, 79, 0.04)');
        grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        const pad = 25, bw = w - 2 * pad, bh = 16;
        const cy = h / 2 - bh / 2;
        const pct = Math.min(1, bai / 40);
        const color = bai < 18 ? '#4f9cf9' : bai < 25 ? '#4ff97b' : bai < 30 ? '#f9c74f' : '#f94f4f';

        ctx.fillStyle = '#1a1f2e';
        ctx.beginPath();
        ctx.roundRect(pad, cy, bw, bh, 6);
        ctx.fill();

        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.roundRect(pad, cy, bw * Math.min(1, phase) * pct, bh, [6, 0, 0, 6]);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(`BAI: ${bai.toFixed(1)}%`, w / 2, cy - 10);
        ctx.fillStyle = color;
        ctx.font = '9px JetBrains Mono';
        ctx.fillText(cat, w / 2, cy + bh + 14);
    });
};

NutricionVisual.calorias_receta = function(canvas, ingredientes, total, porcion) {
    this._stopLoop(canvas);
    const ctx = this.initCanvas(canvas);
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);
    let phase = 0;

    this._startLoop(canvas, () => {
        ctx.clearRect(0, 0, w, h);
        phase += 0.03;

        const grad = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, w * 0.4);
        grad.addColorStop(0, 'rgba(79, 249, 123, 0.04)');
        grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        const maxVal = Math.max(...ingredientes.map(i => i.sub), 1);
        const pad = 20, bh = 14;
        const colors = ['#4f9cf9', '#f9c74f', '#f94f4f'];

        ingredientes.forEach((ing, i) => {
            const y = pad + i * (bh + 8);
            const bw = w - 2 * pad;
            const fillW = bw * Math.min(1, ing.sub / maxVal);

            ctx.fillStyle = '#1a1f2e';
            ctx.beginPath();
            ctx.roundRect(pad, y, bw, bh, 4);
            ctx.fill();

            ctx.fillStyle = colors[i % colors.length];
            ctx.shadowColor = colors[i % colors.length];
            ctx.shadowBlur = 4;
            ctx.beginPath();
            ctx.roundRect(pad, y, fillW * Math.min(1, phase), bh, [4, 0, 0, 4]);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#fff';
            ctx.font = '8px JetBrains Mono';
            ctx.textAlign = 'left';
            ctx.fillText(`Ing${i+1}: ${ing.sub.toFixed(0)} kcal`, pad + 4, y + bh / 2 + 3);
        });

        const totalY = pad + ingredientes.length * (bh + 8) + 6;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(`Total: ${Math.round(total)} kcal | Porción: ${Math.round(porcion)} kcal`, w / 2, totalY + 12);
    });
};
