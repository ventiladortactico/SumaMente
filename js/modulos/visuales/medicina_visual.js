window.MedicinaVisual = window.MedicinaVisual || {
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

    initCanvas: function(canvas) {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        return ctx;
    },

    goteo: function(canvas, gotasMin, mlh) {
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, h);
        const cx = w / 2;
        ctx.strokeStyle = '#4a5570';
        ctx.lineWidth = 2;
        ctx.strokeRect(cx - 20, 20, 40, h - 40);
        ctx.fillStyle = 'rgba(79, 156, 249, 0.25)';
        ctx.fillRect(cx - 19, h - 55, 38, 35);
        ctx.strokeStyle = '#4f9cf9';
        ctx.beginPath();
        ctx.moveTo(cx - 19, h - 55);
        ctx.lineTo(cx + 19, h - 55);
        ctx.stroke();
        ctx.fillStyle = '#4f9cf9';
        ctx.beginPath();
        ctx.arc(cx, 45, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#e8edf5';
        ctx.font = '9px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(Math.round(gotasMin) + ' g/min', cx, 14);
        ctx.fillStyle = '#8a99ad';
        ctx.font = '8px JetBrains Mono';
        ctx.fillText(mlh.toFixed(1) + ' mL/h', cx, h - 8);
    },

    dosis: function(canvas, dosis, peso) {
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, h);
        const pad = 30, barW = w - 2 * pad, barH = 20;
        const cy = h / 2 - barH / 2;
        const maxD = 2000;
        const pct = Math.min(dosis / maxD, 1);
        ctx.fillStyle = '#1e232f';
        ctx.fillRect(pad, cy, barW, barH);
        ctx.fillStyle = '#f97b4f';
        ctx.fillRect(pad, cy, barW * pct, barH);
        ctx.strokeStyle = '#4a5570';
        ctx.lineWidth = 1;
        ctx.strokeRect(pad, cy, barW, barH);
        ctx.fillStyle = '#e8edf5';
        ctx.font = '9px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(dosis.toFixed(0) + ' mg total (' + peso + ' kg)', w / 2, cy - 8);
        ctx.fillStyle = '#8a99ad';
        ctx.font = '8px JetBrains Mono';
        ctx.fillText('Dosis calculada por peso', w / 2, cy + barH + 14);
    },

    imc: function(canvas, imc) {
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, h);
        const pad = 20, barW = w - 2 * pad, barH = 14;
        const cy = h / 2 - barH / 2;
        const rangos = [
            { min: 0, max: 18.5, color: '#f9c74f', label: 'Bajo' },
            { min: 18.5, max: 25, color: '#4ff97b', label: 'Normal' },
            { min: 25, max: 30, color: '#f9c74f', label: 'Sobre' },
            { min: 30, max: 35, color: '#f97b4f', label: 'G1' },
            { min: 35, max: 40, color: '#f94f4f', label: 'G2' },
            { min: 40, max: 50, color: '#991b1b', label: 'G3' },
        ];
        rangos.forEach(function(r) {
            var x1 = pad + (r.min / 50) * barW;
            var x2 = pad + (r.max / 50) * barW;
            ctx.fillStyle = r.color + '44';
            ctx.fillRect(x1, cy, x2 - x1, barH);
            ctx.fillStyle = '#8a99ad';
            ctx.font = '6px JetBrains Mono';
            ctx.fillText(r.label, x1 + 2, cy - 3);
        });
        var markerX = pad + (Math.min(imc, 50) / 50) * barW;
        ctx.strokeStyle = '#e8edf5';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(markerX, cy - 5);
        ctx.lineTo(markerX, cy + barH + 5);
        ctx.stroke();
        ctx.fillStyle = '#e8edf5';
        ctx.font = 'bold 10px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText('IMC: ' + imc.toFixed(1), w / 2, cy + barH + 18);
        ctx.fillStyle = '#8a99ad';
        ctx.font = '7px JetBrains Mono';
        ctx.fillText('18.5       25       30       35       40', w / 2, cy + barH + 30);
    },

    tmb: function(canvas, tmb, peso, altura, edad, masculino) {
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, h);
        const pad = 25, barW = w - 2 * pad, barH = 22;
        const cy = h / 2 - barH / 2;
        const maxTMB = 3000;
        const pct = Math.min(tmb / maxTMB, 1);
        ctx.fillStyle = '#1e232f';
        ctx.fillRect(pad, cy, barW, barH);
        ctx.fillStyle = '#4f9cf9';
        ctx.fillRect(pad, cy, barW * pct, barH);
        ctx.strokeStyle = '#4a5570';
        ctx.lineWidth = 1;
        ctx.strokeRect(pad, cy, barW, barH);
        ctx.fillStyle = '#e8edf5';
        ctx.font = '9px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(tmb.toFixed(0) + ' kcal/d\u00eda', w / 2, cy + 16);
        ctx.fillStyle = '#8a99ad';
        ctx.font = '8px JetBrains Mono';
        ctx.fillText('P:' + peso + 'kg  A:' + altura + 'cm  E:' + edad + 'a  ' + (masculino ? 'Masc' : 'Fem'), w / 2, cy + barH + 14);
    },

    crcl: function(canvas, clcr) {
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, h);
        const pad = 20, barW = w - 2 * pad, barH = 16;
        const cy = h / 2 - barH / 2;
        const maxCr = 120;
        const etapas = [
            { min: 0, max: 15, color: '#f94f4f', label: 'G5' },
            { min: 15, max: 30, color: '#f97b4f', label: 'G4' },
            { min: 30, max: 60, color: '#f9c74f', label: 'G3' },
            { min: 60, max: 90, color: '#4f9cf9', label: 'G2' },
            { min: 90, max: 120, color: '#4ff97b', label: 'G1' },
        ];
        etapas.forEach(function(e) {
            var x1 = pad + (e.min / maxCr) * barW;
            var x2 = pad + (e.max / maxCr) * barW;
            ctx.fillStyle = e.color + '44';
            ctx.fillRect(x1, cy, x2 - x1, barH);
            ctx.fillStyle = '#8a99ad';
            ctx.font = '6px JetBrains Mono';
            ctx.fillText(e.label, x1 + 3, cy - 3);
        });
        var mx = pad + (Math.min(clcr, maxCr) / maxCr) * barW;
        ctx.strokeStyle = '#e8edf5';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(mx, cy - 5);
        ctx.lineTo(mx, cy + barH + 5);
        ctx.stroke();
        ctx.fillStyle = '#e8edf5';
        ctx.font = 'bold 10px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(clcr.toFixed(1) + ' mL/min', w / 2, cy + barH + 18);
    },

    pesoIdeal: function(canvas, pi, masculino) {
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, h);
        const pad = 25, barW = w - 2 * pad, barH = 18;
        const cy = h / 2 - barH / 2;
        const maxPI = 120;
        const pct = Math.min(pi / maxPI, 1);
        ctx.fillStyle = '#1e232f';
        ctx.fillRect(pad, cy, barW, barH);
        ctx.fillStyle = masculino ? '#4f9cf9' : '#a78bfa';
        ctx.fillRect(pad, cy, barW * pct, barH);
        ctx.strokeStyle = '#4a5570';
        ctx.lineWidth = 1;
        ctx.strokeRect(pad, cy, barW, barH);
        ctx.fillStyle = '#e8edf5';
        ctx.font = '9px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(pi.toFixed(1) + ' kg', w / 2, cy + 14);
        ctx.fillStyle = '#8a99ad';
        ctx.font = '8px JetBrains Mono';
        ctx.fillText('Peso Ideal (Devine)', w / 2, cy + barH + 14);
    },

    asc: function(canvas, asc, peso, altura) {
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, h);
        const cx = w / 2, cy = h / 2;
        const maxR = 35;
        const r = Math.min(asc * 12, maxR);
        ctx.strokeStyle = '#3f495e';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy - 8, maxR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = '#4f9cf9';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(cx, cy - 8, r, -Math.PI / 2, -Math.PI / 2 + (asc / 2) * Math.PI);
        ctx.stroke();
        ctx.fillStyle = '#e8edf5';
        ctx.font = 'bold 12px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(asc.toFixed(2) + ' m\u00b2', cx, cy + 22);
        ctx.fillStyle = '#8a99ad';
        ctx.font = '8px JetBrains Mono';
        ctx.fillText(peso + 'kg  ' + altura + 'cm', cx, h - 8);
    },

    ascvd: function(canvas, riesgo) {
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, h);
        const pad = 30, barW = w - 2 * pad, barH = 16;
        const cy = h / 2 - barH / 2;
        ctx.fillStyle = '#4ff97b44';
        ctx.fillRect(pad, cy, barW * 0.05, barH);
        ctx.fillStyle = '#f9c74f44';
        ctx.fillRect(pad + barW * 0.05, cy, barW * 0.025, barH);
        ctx.fillStyle = '#f97b4f44';
        ctx.fillRect(pad + barW * 0.075, cy, barW * 0.125, barH);
        ctx.fillStyle = '#f94f4f44';
        ctx.fillRect(pad + barW * 0.2, cy, barW * 0.8, barH);
        ctx.fillStyle = '#8a99ad';
        ctx.font = '6px JetBrains Mono';
        ctx.fillText('<5%', pad + 2, cy - 3);
        ctx.fillText('7.5%', pad + barW * 0.075, cy - 3);
        ctx.fillText('20%', pad + barW * 0.2, cy - 3);
        var mx = pad + (Math.min(riesgo, 50) / 50) * barW;
        ctx.strokeStyle = '#e8edf5';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(mx, cy - 5);
        ctx.lineTo(mx, cy + barH + 5);
        ctx.stroke();
        ctx.fillStyle = '#e8edf5';
        ctx.font = 'bold 10px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(riesgo.toFixed(1) + '% riesgo ASCVD', w / 2, cy + barH + 18);
    },

    sofa: function(canvas, resp, coag, hep, cv, renal, neuro, total) {
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, h);
        const pad = 15;
        const comps = [
            { label: 'Resp', val: resp, color: '#4f9cf9' },
            { label: 'Coag', val: coag, color: '#f94f4f' },
            { label: 'Hep', val: hep, color: '#f9c74f' },
            { label: 'C-V', val: cv, color: '#f97b4f' },
            { label: 'Renal', val: renal, color: '#a78bfa' },
            { label: 'Neuro', val: neuro, color: '#4ff97b' },
        ];
        const n = comps.length;
        const barW = Math.min((w - 2 * pad) / n - 4, 35);
        const maxBarH = h - 50;
        comps.forEach(function(c, i) {
            var x = pad + i * ((w - 2 * pad) / n) + ((w - 2 * pad) / n - barW) / 2;
            var bh = (c.val / 4) * maxBarH;
            ctx.fillStyle = '#22293a';
            ctx.fillRect(x, h - 30 - maxBarH, barW, maxBarH);
            ctx.fillStyle = c.color;
            ctx.fillRect(x, h - 30 - bh, barW, bh);
            ctx.strokeStyle = '#4a5570';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, h - 30 - maxBarH, barW, maxBarH);
            ctx.fillStyle = '#8a99ad';
            ctx.font = '7px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(c.label, x + barW / 2, h - 10);
            ctx.fillStyle = '#e8edf5';
            ctx.fillText(c.val, x + barW / 2, h - 30 - bh - 4);
        });
        ctx.fillStyle = '#e8edf5';
        ctx.font = 'bold 9px JetBrains Mono';
        ctx.textAlign = 'left';
        ctx.fillText('SOFA: ' + total + ' pts', pad, 14);
    },

    curb65: function(canvas, score) {
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, h);
        const cx = w / 2, cy = h / 2;
        const r = 32;
        [1, 2, 3, 4, 5].forEach(function(i) {
            ctx.strokeStyle = i <= score ? '#f94f4f' : '#3f495e';
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.arc(cx, cy - 5, r, -Math.PI / 2 + ((i - 1) / 5) * Math.PI * 2, -Math.PI / 2 + (i / 5) * Math.PI * 2);
            ctx.stroke();
        });
        ctx.fillStyle = '#e8edf5';
        ctx.font = 'bold 16px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(score + '/5', cx, cy + 14);
    },

    geneva: function(canvas, score) {
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, h);
        const pad = 30, barW = w - 2 * pad, barH = 16;
        const cy = h / 2 - barH / 2;
        ctx.fillStyle = '#4ff97b44';
        ctx.fillRect(pad, cy, barW * 0.6, barH);
        ctx.fillStyle = '#f94f4f44';
        ctx.fillRect(pad + barW * 0.6, cy, barW * 0.4, barH);
        ctx.fillStyle = '#8a99ad';
        ctx.font = '7px JetBrains Mono';
        ctx.fillText('Baja', pad + 5, cy - 3);
        ctx.fillText('Alta', pad + barW * 0.6 + 5, cy - 3);
        var mx = pad + (Math.min(score, 5) / 5) * barW;
        ctx.strokeStyle = '#e8edf5';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(mx, cy - 5);
        ctx.lineTo(mx, cy + barH + 5);
        ctx.stroke();
        ctx.fillStyle = '#e8edf5';
        ctx.font = 'bold 10px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(score + '/5 puntos', w / 2, cy + barH + 18);
    },

    gina: function(canvas, total) {
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, h);
        const cx = w / 2;
        const barW = w - 40, barH = 16;
        const cy = h / 2 - barH / 2;
        var colores = ['#4ff97b', '#f9c74f', '#f97b4f', '#f94f4f'];
        ctx.fillStyle = '#22293a';
        ctx.fillRect(20, cy, barW, barH);
        for (var i = 0; i < total && i < 4; i++) {
            ctx.fillStyle = colores[i];
            ctx.fillRect(20 + i * (barW / 4), cy, barW / 4, barH);
        }
        ctx.strokeStyle = '#4a5570';
        ctx.lineWidth = 1;
        ctx.strokeRect(20, cy, barW, barH);
        var labels = ['Controlado', 'Parcial', 'Mal controlado'];
        var label = total === 0 ? labels[0] : total <= 2 ? labels[1] : labels[2];
        ctx.fillStyle = '#e8edf5';
        ctx.font = '9px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(label + ' (' + total + '/4)', cx, cy + barH + 16);
    },

    anc: function(canvas, anc) {
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, h);
        const pad = 20, barW = w - 2 * pad, barH = 14;
        const cy = h / 2 - barH / 2;
        var categorias = [
            { min: 0, max: 0.5, color: '#f94f4f', label: 'Severo' },
            { min: 0.5, max: 1.0, color: '#f97b4f', label: 'Mod.' },
            { min: 1.0, max: 1.5, color: '#f9c74f', label: 'Leve' },
            { min: 1.5, max: 4.0, color: '#4ff97b', label: 'Normal' },
        ];
        var maxV = 4;
        categorias.forEach(function(c) {
            var x1 = pad + (c.min / maxV) * barW;
            var x2 = pad + (c.max / maxV) * barW;
            ctx.fillStyle = c.color + '44';
            ctx.fillRect(x1, cy, x2 - x1, barH);
        });
        var val = anc / 1000;
        var mx = pad + (Math.min(val, maxV) / maxV) * barW;
        ctx.strokeStyle = '#e8edf5';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(mx, cy - 5);
        ctx.lineTo(mx, cy + barH + 5);
        ctx.stroke();
        ctx.fillStyle = '#e8edf5';
        ctx.font = '9px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText('ANC: ' + anc.toLocaleString('es-AR', {maximumFractionDigits:0}) + ' /\u00b5L', w / 2, cy + barH + 16);
    },

    shock: function(canvas, is, fc) {
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, h);
        const cx = w / 2, cy = h / 2;
        var color = is < 0.7 ? '#4ff97b' : is < 1.0 ? '#f9c74f' : '#f94f4f';
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 12);
        ctx.bezierCurveTo(cx - 18, cy - 28, cx - 32, cy - 8, cx, cy + 16);
        ctx.bezierCurveTo(cx + 32, cy - 8, cx + 18, cy - 28, cx, cy - 12);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#e8edf5';
        ctx.font = 'bold 12px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText('IS: ' + is.toFixed(2), cx, cy + 30);
        ctx.fillStyle = '#8a99ad';
        ctx.font = '8px JetBrains Mono';
        ctx.fillText(fc + ' lpm', cx, h - 8);
    },

    ganzoni: function(canvas, deficit) {
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, h);
        var barW = 40, barH = h - 55;
        var bx = w / 2 - barW / 2, by = 30;
        ctx.fillStyle = '#1e232f';
        ctx.fillRect(bx, by, barW, barH);
        var pct = Math.min(deficit / 2200, 1);
        var fillH = pct * barH;
        ctx.fillStyle = '#991b1b';
        ctx.fillRect(bx, by + barH - fillH, barW, fillH);
        ctx.fillStyle = '#f94f4f';
        ctx.fillRect(bx, by + barH - fillH, barW, Math.min(fillH, 4));
        ctx.strokeStyle = '#4a5570';
        ctx.lineWidth = 2;
        ctx.strokeRect(bx, by, barW, barH);
        ctx.fillStyle = '#e8edf5';
        ctx.font = '9px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(deficit.toFixed(0) + ' mg Fe', w / 2, by + barH + 16);
        ctx.fillStyle = '#8a99ad';
        ctx.font = '8px JetBrains Mono';
        ctx.fillText('D\u00e9ficit de Hierro', w / 2, by - 8);
    },

    gcs: function(canvas, total, eyes, verbal, motor) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        let t = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = '#0d1117';
            ctx.fillRect(0, 0, w, h);

            const cx = w / 2, cy = h / 2 - 5;
            const r = Math.min(w, h) / 2.8;
            const maxSeg = 15;
            t += 0.02;

            for (let i = 0; i < maxSeg; i++) {
                const startA = -Math.PI / 2 + (i / maxSeg) * Math.PI * 2;
                const endA = -Math.PI / 2 + ((i + 1) / maxSeg) * Math.PI * 2;
                ctx.strokeStyle = i < total ? '#4f9cf9' : '#1e232f';
                ctx.lineWidth = 5;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.arc(cx, cy, r, startA, endA);
                ctx.stroke();
            }

            const pulse = 0.85 + 0.15 * Math.sin(t);
            ctx.fillStyle = '#4f9cf9';
            ctx.globalAlpha = pulse * 0.15;
            ctx.beginPath();
            ctx.arc(cx, cy, r + 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;

            ctx.fillStyle = '#e8edf5';
            ctx.font = 'bold 16px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(total + '/15', cx, cy + 6);
            ctx.fillStyle = '#8a99ad';
            ctx.font = '8px JetBrains Mono';
            ctx.fillText('O:' + eyes + ' V:' + verbal + ' M:' + motor, cx, h - 10);
        });
    },

    apgar: function(canvas, total, fr, fc, tono, reflejo, color) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        let t = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = '#0d1117';
            ctx.fillRect(0, 0, w, h);

            const pad = 10;
            const comps = [
                { label: 'FR', val: fr, color: '#4f9cf9' },
                { label: 'FC', val: fc, color: '#f94f4f' },
                { label: 'Tono', val: tono, color: '#f9c74f' },
                { label: 'Refl.', val: reflejo, color: '#a78bfa' },
                { label: 'Color', val: color, color: '#4ff97b' },
            ];
            const n = comps.length;
            const barW = Math.min((w - 2 * pad) / n - 3, 35);
            const maxH = h - 55;
            t += 0.03;

            comps.forEach(function(c, i) {
                const x = pad + i * ((w - 2 * pad) / n) + ((w - 2 * pad) / n - barW) / 2;
                const bh = (c.val / 2) * maxH;
                ctx.fillStyle = '#1e232f';
                ctx.fillRect(x, h - 30 - maxH, barW, maxH);
                ctx.fillStyle = c.color;
                ctx.fillRect(x, h - 30 - bh, barW, bh);
                ctx.strokeStyle = '#2a3040';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, h - 30 - maxH, barW, maxH);
                ctx.fillStyle = '#8a99ad';
                ctx.font = '7px JetBrains Mono';
                ctx.textAlign = 'center';
                ctx.fillText(c.label, x + barW / 2, h - 10);
                ctx.fillStyle = '#e8edf5';
                ctx.fillText(c.val, x + barW / 2, h - 30 - bh - 4);
            });

            ctx.fillStyle = '#e8edf5';
            ctx.font = 'bold 10px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(total + '/10 APGAR', w / 2, 16);
        });
    },

    pfRatio: function(canvas, pf) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        let t = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = '#0d1117';
            ctx.fillRect(0, 0, w, h);

            const pad = 20, barW = w - 2 * pad, barH = 16;
            const cy = h / 2 - barH / 2;
            const maxPF = 500;
            t += 0.02;

            const zonas = [
                { min: 0, max: 100, color: '#f94f4f', label: 'Crít' },
                { min: 100, max: 200, color: '#f97b4f', label: 'Sever' },
                { min: 200, max: 300, color: '#f9c74f', label: 'Mod' },
                { min: 300, max: 400, color: '#4f9cf9', label: 'Leve' },
                { min: 400, max: 500, color: '#4ff97b', label: 'Norm' },
            ];

            zonas.forEach(function(z) {
                const x1 = pad + (z.min / maxPF) * barW;
                const x2 = pad + (z.max / maxPF) * barW;
                ctx.fillStyle = z.color + '44';
                ctx.fillRect(x1, cy, x2 - x1, barH);
                ctx.fillStyle = '#8a99ad';
                ctx.font = '6px JetBrains Mono';
                ctx.textAlign = 'center';
                ctx.fillText(z.label, x1 + (x2 - x1) / 2, cy - 3);
            });

            const clamped = Math.min(Math.max(pf, 0), maxPF);
            const mx = pad + (clamped / maxPF) * barW;
            const pulse = 0.7 + 0.3 * Math.sin(t * 2);

            ctx.shadowColor = pf < 200 ? '#f94f4f' : pf < 300 ? '#f9c74f' : '#4ff97b';
            ctx.shadowBlur = 10 * pulse;
            ctx.strokeStyle = '#e8edf5';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(mx, cy - 6);
            ctx.lineTo(mx, cy + barH + 6);
            ctx.stroke();
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#e8edf5';
            ctx.font = 'bold 11px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText('PF: ' + pf.toFixed(1), w / 2, cy + barH + 20);
        });
    },

    correccionSodio: function(canvas, na, naCorr, glu) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        let t = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = '#0d1117';
            ctx.fillRect(0, 0, w, h);

            const pad = 25;
            const barW = 45;
            const maxH = h - 60;
            const maxNa = 160;
            t += 0.025;

            const naH = (Math.min(na, maxNa) / maxNa) * maxH;
            const naCorrH = (Math.min(naCorr, maxNa) / maxNa) * maxH;

            const x1 = w / 2 - barW - 10;
            const x2 = w / 2 + 10;
            const base = h - 25;

            ctx.fillStyle = '#1e232f';
            ctx.fillRect(x1, base - maxH, barW, maxH);
            ctx.fillRect(x2, base - maxH, barW, maxH);

            ctx.fillStyle = '#4f9cf9';
            ctx.fillRect(x1, base - naH, barW, naH);
            ctx.fillStyle = '#f9c74f';
            ctx.fillRect(x2, base - naCorrH, barW, naCorrH);

            ctx.strokeStyle = '#2a3040';
            ctx.lineWidth = 1;
            ctx.strokeRect(x1, base - maxH, barW, maxH);
            ctx.strokeRect(x2, base - maxH, barW, maxH);

            const pulse = 0.85 + 0.15 * Math.sin(t);
            ctx.fillStyle = '#4f9cf9';
            ctx.globalAlpha = pulse * 0.2;
            ctx.fillRect(x1, base - naH, barW, naH);
            ctx.globalAlpha = 1;

            ctx.fillStyle = '#e8edf5';
            ctx.font = '9px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText('Na medido', x1 + barW / 2, base + 12);
            ctx.fillText('Na corregido', x2 + barW / 2, base + 12);
            ctx.fillStyle = '#4f9cf9';
            ctx.fillText(na.toFixed(1), x1 + barW / 2, base - naH - 6);
            ctx.fillStyle = '#f9c74f';
            ctx.fillText(naCorr.toFixed(1), x2 + barW / 2, base - naCorrH - 6);

            ctx.fillStyle = '#8a99ad';
            ctx.font = '8px JetBrains Mono';
            ctx.fillText('Glu: ' + glu + ' mg/dL', w / 2, 16);
        });
    },

    anionGap: function(canvas, ag, na, cl, hco3) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        let t = 0;

        this._startLoop(canvas, () => {
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = '#0d1117';
            ctx.fillRect(0, 0, w, h);

            const pad = 20, barW = w - 2 * pad, barH = 18;
            const cy = h / 2 - barH / 2;
            const maxAG = 30;
            t += 0.02;

            ctx.fillStyle = '#4ff97b44';
            ctx.fillRect(pad, cy, barW * (8 / maxAG), barH);
            ctx.fillStyle = '#f9c74f44';
            ctx.fillRect(pad + barW * (8 / maxAG), cy, barW * (4 / maxAG), barH);
            ctx.fillStyle = '#f94f4f44';
            ctx.fillRect(pad + barW * (12 / maxAG), cy, barW * (18 / maxAG), barH);

            ctx.fillStyle = '#8a99ad';
            ctx.font = '6px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText('Normal <8', pad + barW * (4 / maxAG), cy - 3);
            ctx.fillText('Límite 8-11', pad + barW * (10 / maxAG), cy - 3);
            ctx.fillText('Elevado ≥12', pad + barW * (21 / maxAG), cy - 3);

            const clamped = Math.min(Math.max(ag, 0), maxAG);
            const mx = pad + (clamped / maxAG) * barW;
            const pulse = 0.7 + 0.3 * Math.sin(t * 2);

            ctx.shadowColor = ag >= 12 ? '#f94f4f' : ag >= 8 ? '#f9c74f' : '#4ff97b';
            ctx.shadowBlur = 10 * pulse;
            ctx.strokeStyle = '#e8edf5';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(mx, cy - 6);
            ctx.lineTo(mx, cy + barH + 6);
            ctx.stroke();
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#e8edf5';
            ctx.font = 'bold 11px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText('AG: ' + ag.toFixed(1) + ' mEq/L', w / 2, cy + barH + 20);
        });
    }
};
