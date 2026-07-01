window.UnidadesVisual = window.UnidadesVisual || {
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

    _bar: function(canvas, val, color, unit, subLeft, subRight, maxV) {
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        const pad = 25, barW = w - 2 * pad, barH = 18;
        const cy = h / 2 - barH / 2;
        maxV = maxV || Math.max(Math.abs(val) * 2, 1);
        let phase = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);
            phase += 0.03;

            const grad = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, w * 0.4);
            grad.addColorStop(0, `${color}11`);
            grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            const anim = Math.min(phase, 1);
            const fillPct = Math.min(Math.abs(val) / maxV, 1);

            ctx.fillStyle = '#1a1f2e';
            ctx.beginPath();
            ctx.roundRect(pad, cy, barW, barH, 6);
            ctx.fill();

            const g = ctx.createLinearGradient(pad, 0, pad + barW, 0);
            g.addColorStop(0, color);
            g.addColorStop(1, color.replace(')', ', 0.7)').replace('rgb', 'rgba'));
            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = 4;
            ctx.beginPath();
            ctx.roundRect(pad, cy, barW * fillPct * anim, barH, [6, 0, 0, 6]);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 11px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${val.toFixed(4)} ${unit}`, w / 2, cy + barH / 2);

            if (subLeft) {
                ctx.fillStyle = '#8a99ad';
                ctx.font = '7px JetBrains Mono';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'top';
                ctx.fillText(subLeft, pad, cy + barH + 4);
            }
            if (subRight) {
                ctx.fillStyle = '#8a99ad';
                ctx.font = '7px JetBrains Mono';
                ctx.textAlign = 'right';
                ctx.textBaseline = 'top';
                ctx.fillText(subRight, pad + barW, cy + barH + 4);
            }
        });
    },

    longitud: function(canvas, metros) {
        this._stopLoop(canvas);
        this._bar(canvas, metros, '#4f9cf9', 'm',
            `${(metros * 100).toFixed(2)} cm`,
            `${(metros / 0.3048).toFixed(2)} ft`);
    },

    masa: function(canvas, kg) {
        this._stopLoop(canvas);
        this._bar(canvas, kg, '#a78bfa', 'kg',
            `${(kg * 1000).toFixed(1)} g`,
            `${(kg / 0.453592).toFixed(2)} lb`);
    },

    temp: function(canvas, celsius) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        const pad = 25, barW = w - 2 * pad, barH = 18;
        let phase = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);
            phase += 0.03;

            const grad = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, w * 0.4);
            grad.addColorStop(0, 'rgba(249, 79, 79, 0.04)');
            grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            const cy = h / 2 - barH / 2;
            const minC = -50, maxC = 150, range = maxC - minC;
            const pct = Math.max(0, Math.min(1, (celsius - minC) / range));
            const anim = Math.min(phase, 1);

            ctx.fillStyle = '#1a1f2e';
            ctx.beginPath();
            ctx.roundRect(pad, cy, barW, barH, 6);
            ctx.fill();

            const tg = ctx.createLinearGradient(pad, 0, pad + barW, 0);
            tg.addColorStop(0, '#4f9cf9');
            tg.addColorStop(0.35, '#4ff97b');
            tg.addColorStop(0.55, '#f9c74f');
            tg.addColorStop(0.75, '#f97b4f');
            tg.addColorStop(1, '#f94f4f');
            ctx.fillStyle = tg;
            ctx.shadowColor = celsius > 50 ? '#f94f4f' : '#4f9cf9';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.roundRect(pad, cy, barW * pct * anim, barH, [6, 0, 0, 6]);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${celsius.toFixed(1)} °C`, w / 2, cy + barH / 2);

            ctx.fillStyle = '#8a99ad';
            ctx.font = '7px JetBrains Mono';
            ctx.textBaseline = 'top';
            ctx.textAlign = 'left';
            ctx.fillText('-50°C', pad, cy + barH + 4);
            ctx.textAlign = 'right';
            ctx.fillText('150°C', pad + barW, cy + barH + 4);
        });
    },

    area_vol: function(canvas, base, esArea) {
        this._stopLoop(canvas);
        const unit = esArea ? 'm²' : 'm³';
        const color = esArea ? '#4ff97b' : '#4f9cf9';
        const sub = esArea ? `${(base * 1e4).toFixed(1)} cm²` : `${(base * 1000).toFixed(2)} L`;
        this._bar(canvas, base, color, unit, sub);
    },

    presion: function(canvas, pa) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        const pad = 25, barW = w - 2 * pad, barH = 18;
        let phase = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);
            phase += 0.03;

            const cy = h / 2 - barH / 2;
            const maxV = Math.max(Math.abs(pa) * 2, 101325);
            const pct = Math.min(Math.abs(pa) / maxV, 1);
            const anim = Math.min(phase, 1);
            const color = pa > 101325 ? '#f94f4f' : '#4f9cf9';

            ctx.fillStyle = '#1a1f2e';
            ctx.beginPath();
            ctx.roundRect(pad, cy, barW, barH, 6);
            ctx.fill();

            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.roundRect(pad, cy, barW * pct * anim, barH, [6, 0, 0, 6]);
            ctx.fill();
            ctx.shadowBlur = 0;

            const atmX = pad + (101325 / maxV) * barW;
            ctx.strokeStyle = '#f9c74f';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(atmX, cy - 4);
            ctx.lineTo(atmX, cy + barH + 4);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 11px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${pa.toFixed(1)} Pa`, w / 2, cy + barH / 2);

            ctx.fillStyle = '#f9c74f';
            ctx.font = '7px JetBrains Mono';
            ctx.textBaseline = 'bottom';
            ctx.textAlign = 'center';
            ctx.fillText('1 atm', atmX, cy - 6);
        });
    },

    velocidad: function(canvas, ms) {
        this._stopLoop(canvas);
        const color = ms > 100 ? '#f94f4f' : ms > 30 ? '#f9c74f' : '#4f9cf9';
        this._bar(canvas, ms, color, 'm/s',
            `${(ms * 3.6).toFixed(2)} km/h`);
    },

    energia: function(canvas, base, esEnergia) {
        this._stopLoop(canvas);
        const unit = esEnergia ? 'J' : 'W';
        const color = esEnergia ? '#f9c74f' : '#a78bfa';
        const sub = esEnergia ? `${(base / 4184).toFixed(3)} kcal` : `${(base / 745.7).toFixed(4)} HP`;
        this._bar(canvas, base, color, unit, sub);
    },

    angulos: function(canvas, deg) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        const cx = w / 2, cy = h / 2;
        const r = Math.min(w, h) / 2 - 24;
        let phase = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);
            phase += 0.03;

            const norm = ((deg % 360) + 360) % 360;
            const rad = norm * Math.PI / 180;
            const anim = Math.min(phase * 2, 1);
            const animAngle = -Math.PI / 2 + rad * anim;

            const grad = ctx.createRadialGradient(cx, cy, 5, cx, cy, r + 20);
            grad.addColorStop(0, 'rgba(79, 156, 249, 0.06)');
            grad.addColorStop(1, 'rgba(10, 11, 14, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = '#4f9cf9';
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, r, -Math.PI / 2, animAngle);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = '#93c5fd';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + r * Math.cos(animAngle), cy + r * Math.sin(animAngle));
            ctx.stroke();

            ctx.strokeStyle = '#93c5fd';
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx, cy - r);
            ctx.stroke();

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(`${norm.toFixed(1)}°`, cx, cy + r + 18);

            ctx.fillStyle = '#94a3b8';
            ctx.font = '9px JetBrains Mono';
            ctx.fillText(`${(norm * Math.PI / 180).toFixed(4)} rad`, cx, cy + r + 32);
        });
    },

    datos: function(canvas, bytes) {
        this._stopLoop(canvas);
        const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
        let idx = 0, disp = Math.abs(bytes);
        while (disp >= 1024 && idx < units.length - 1) { disp /= 1024; idx++; }
        this._bar(canvas, disp, '#4ff97b', units[idx], `${bytes.toFixed(0)} bytes`, '', 1024);
    },

    flujo: function(canvas, m3s) {
        this._stopLoop(canvas);
        const maxV = Math.max(Math.abs(m3s) * 2, 0.001);
        this._bar(canvas, m3s, '#4f9cf9', 'm³/s',
            `${(m3s * 60000).toFixed(2)} L/min`, '', maxV);
    },

    tiempo: function(canvas, segundos) {
        this._stopLoop(canvas);
        this._bar(canvas, segundos, '#4fdbf9', 's',
            `${(segundos/3600).toFixed(4)} h`,
            `${(segundos/60).toFixed(2)} min`, segundos * 2);
    },

    densidad: function(canvas, base) {
        this._stopLoop(canvas);
        this._bar(canvas, base, '#4ff97b', 'kg/m³',
            `${(base/1000).toFixed(6)} g/cm³`, '', base * 2);
    },

    frecuencia_hz: function(canvas, hz) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        const pad = 25;
        let phase = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);
            phase += 0.03;

            const cy = h / 2 - 9;
            const barW = w - 2 * pad;
            const maxV = Math.max(Math.abs(hz) * 2, 1);
            const pct = Math.min(Math.abs(hz) / maxV, 1);
            const anim = Math.min(phase, 1);

            ctx.fillStyle = '#1a1f2e';
            ctx.beginPath();
            ctx.roundRect(pad, cy, barW, 18, 6);
            ctx.fill();

            ctx.strokeStyle = '#f9c74f55';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            for (let x = pad; x < pad + barW; x += 2) {
                const waveY = cy + 9 + Math.sin((x + phase * 40) * 0.05) * 6;
                x === pad ? ctx.moveTo(x, waveY) : ctx.lineTo(x, waveY);
            }
            ctx.stroke();

            const g = ctx.createLinearGradient(pad, 0, pad + barW, 0);
            g.addColorStop(0, '#f9c74f');
            g.addColorStop(1, '#f97b4f');
            ctx.fillStyle = g;
            ctx.shadowColor = '#f9c74f';
            ctx.shadowBlur = 4;
            ctx.beginPath();
            ctx.roundRect(pad, cy, barW * pct * anim, 18, [6, 0, 0, 6]);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 11px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${hz.toFixed(4)} Hz`, w / 2, cy + 9);
        });
    },

    fuerza_newton: function(canvas, n) {
        this._stopLoop(canvas);
        this._bar(canvas, n, '#f97b4f', 'N',
            `${(n/9.80665).toFixed(4)} kgf`,
            `${(n/4.44822).toFixed(4)} lbf`, n * 2);
    },

    carga_electrica: function(canvas, c) {
        this._stopLoop(canvas);
        this._bar(canvas, c, '#a78bfa', 'C',
            `${(c/3.6).toFixed(4)} mAh`,
            `${(c/3600).toFixed(6)} Ah`, c * 2);
    },

    torque: function(canvas, nm) {
        this._stopLoop(canvas);
        this._bar(canvas, nm, '#f97b4f', 'N·m',
            `${(nm/1.35582).toFixed(4)} lb·ft`,
            '', nm * 2);
    },

    flops: function(canvas, flops) {
        this._stopLoop(canvas);
        const units = ['FLOPS','kFLOPS','MFLOPS','GFLOPS','TFLOPS','PFLOPS'];
        let idx = 0, disp = Math.abs(flops);
        while (disp >= 1000 && idx < units.length - 1) { disp /= 1000; idx++; }
        this._bar(canvas, disp, '#4ff97b', units[idx],
            `${flops.toFixed(0)} FLOPS`, '', 1024);
    },

    viscosidad: function(canvas, poise) {
        this._stopLoop(canvas);
        this._bar(canvas, poise, '#a78bfa', 'P',
            `${(poise*100).toFixed(4)} cP`,
            `${(poise/1).toFixed(4)} St`, poise * 2 || 1);
    },

    conductividad: function(canvas, sm) {
        this._stopLoop(canvas);
        this._bar(canvas, sm, '#4f9cf9', 'S/m',
            `${(sm*10).toFixed(4)} mS/cm`,
            `${(sm*10000).toFixed(2)} µS/cm`, sm * 2 || 1);
    },

    iluminancia: function(canvas, lux) {
        this._stopLoop(canvas);
        this._bar(canvas, lux, '#f9c74f', 'lux',
            `${(lux/10.7639).toFixed(4)} fc`,
            '', lux * 2 || 1);
    }
};
