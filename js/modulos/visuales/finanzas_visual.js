const FinanzasVisual = {
    // Almacén global interno para manejar transiciones fluidas e impedir superposiciones
    animations: {},

    initCanvas: function(canvas) {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        return ctx;
    },

    // Generador de bucle de animación reutilizable por componente (Evita gráficos rígidos)
    animate: function(canvasId, renderFrame) {
        if (this.animations[canvasId]) {
            cancelAnimationFrame(this.animations[canvasId]);
        }
        let start = null;
        const duration = 650; // Duración de la transición en milisegundos

        const loop = (timestamp) => {
            if (!start) start = timestamp;
            let progress = (timestamp - start) / duration;
            if (progress > 1) progress = 1;

            // Función de easing out (Desaceleración estática suave al final)
            let ease = 1 - Math.pow(1 - progress, 3);

            renderFrame(ease);

            if (progress < 1) {
                this.animations[canvasId] = requestAnimationFrame(loop);
            }
        };
        this.animations[canvasId] = requestAnimationFrame(loop);
    },

    // 1. Préstamo Francés - Estático
    prestamo: function(canvas, cuota, capital, plazo, tna) {
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, h);
        const pad = 25;
        const total = cuota * plazo;
        const interes = total - capital;
        const totalW = w - 2 * pad;
        const barH = 28;
        const capW = (capital / total) * totalW;
        const intW = (interes / total) * totalW;
        const cy = h / 2 - 10;
        ctx.fillStyle = '#4f9cf9';
        ctx.fillRect(pad, cy, capW, barH);
        ctx.fillStyle = '#f94f4f';
        ctx.fillRect(pad + capW, cy, intW, barH);
        ctx.strokeStyle = '#4a5570';
        ctx.lineWidth = 1;
        ctx.strokeRect(pad, cy, totalW, barH);
        ctx.fillStyle = '#e8edf5';
        ctx.font = '9px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText('Capital $' + capital.toLocaleString('es-AR', {maximumFractionDigits:0}), pad + capW / 2, cy + 19);
        ctx.fillText('Int. $' + interes.toLocaleString('es-AR', {maximumFractionDigits:0}), pad + capW + intW / 2, cy + 19);
        ctx.fillStyle = '#8a99ad';
        ctx.font = '8px JetBrains Mono';
        ctx.textAlign = 'left';
        ctx.fillText('Cuota: $' + cuota.toLocaleString('es-AR', {maximumFractionDigits:2}) + '/mes', pad, cy + barH + 16);
        ctx.textAlign = 'right';
        ctx.fillText(plazo + ' meses', pad + totalW, cy + barH + 16);
        ctx.fillStyle = '#4ff97b';
        ctx.font = '8px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText('■ Capital  ■ Interés', w / 2, 15);
    },

    // 2. Conversor de Tasas - Estático
    tasas: function(canvas, tna, tea) {
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, h);
        const cx = w / 2;
        const barW = 50;
        const maxH = h - 60;
        const tnaH = Math.min(((tna || 0) / Math.max(tna || 0, tea || 0.01)) * maxH, maxH);
        const teaH = Math.min(((tea || 0) / Math.max(tna || 0, tea || 0.01)) * maxH, maxH);
        ctx.fillStyle = '#22293a';
        ctx.fillRect(cx - 60, h - 30 - maxH, barW, maxH);
        ctx.fillRect(cx + 10, h - 30 - maxH, barW, maxH);
        ctx.fillStyle = '#4f9cf9';
        ctx.fillRect(cx - 60, h - 30 - tnaH, barW, tnaH);
        ctx.fillStyle = '#a78bfa';
        ctx.fillRect(cx + 10, h - 30 - teaH, barW, teaH);
        ctx.strokeStyle = '#4a5570';
        ctx.lineWidth = 1;
        ctx.strokeRect(cx - 60, h - 30 - maxH, barW, maxH);
        ctx.strokeRect(cx + 10, h - 30 - maxH, barW, maxH);
        ctx.fillStyle = '#e8edf5';
        ctx.font = '9px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText('TNA', cx - 35, h - 30 - maxH - 6);
        ctx.fillText('TEA', cx + 35, h - 30 - maxH - 6);
        ctx.fillStyle = '#4ff97b';
        ctx.font = 'bold 10px JetBrains Mono';
        ctx.fillText(((tna || 0) * 100).toFixed(1) + '%', cx - 35, h - 30 - tnaH + 14);
        ctx.fillText(((tea || 0) * 100).toFixed(1) + '%', cx + 35, h - 30 - teaH + 14);
        ctx.fillStyle = '#8a99ad';
        ctx.font = '8px JetBrains Mono';
        ctx.fillText('TNA → TEA', cx, h - 6);
    },

    // 3. Punto de Equilibrio - Estático
    equilibrio: function(canvas, cf, pv, cv, q) {
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, h);
        const pad = 25;
        const gw = w - 2 * pad, gh = h - 2 * pad;
        const margen = pv - cv;
        const ingresoEq = q * pv;
        const maxY = ingresoEq * 1.2;
        ctx.strokeStyle = '#3f495e';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pad, pad);
        ctx.lineTo(pad, pad + gh);
        ctx.lineTo(pad + gw, pad + gh);
        ctx.stroke();
        const cfY = pad + gh - (cf / maxY) * gh;
        ctx.strokeStyle = '#627284';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(pad, cfY);
        ctx.lineTo(pad + gw, cfY);
        ctx.stroke();
        ctx.fillStyle = '#8a99ad';
        ctx.font = '7px JetBrains Mono';
        ctx.fillText('CF', pad + 2, cfY - 3);
        const ctX2 = pad + gw;
        const ctY2 = pad + gh - ((cf + margen * q) / maxY) * gh;
        ctx.strokeStyle = '#f94f4f';
        ctx.beginPath();
        ctx.moveTo(pad, cfY);
        ctx.lineTo(ctX2, ctY2);
        ctx.stroke();
        const inY2 = pad + gh - (pv * q / maxY) * gh;
        ctx.strokeStyle = '#4ff97b';
        ctx.beginPath();
        ctx.moveTo(pad, pad + gh);
        ctx.lineTo(pad + gw, inY2);
        ctx.stroke();
        const eqX = pad + (q / (q * 1.5)) * gw * 0.6;
        const eqY = pad + gh - (ingresoEq / maxY) * gh;
        ctx.fillStyle = '#e8edf5';
        ctx.beginPath();
        ctx.arc(pad + gw * 0.55, pad + gh * 0.35, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = '8px JetBrains Mono';
        ctx.fillText('Q: ' + Math.ceil(q) + ' uds', pad + gw * 0.55, pad + gh * 0.35 - 8);
        ctx.fillStyle = '#f94f4f';
        ctx.font = '7px JetBrains Mono';
        ctx.fillText('■ CT', pad, 14);
        ctx.fillStyle = '#4ff97b';
        ctx.fillText('■ Ingresos', pad + 40, 14);
        ctx.fillStyle = '#627284';
        ctx.fillText('■ CF', pad + 100, 14);
    },

    // 4. VAN / VPN - Estático
    van: function(canvas, inv, flujos, van) {
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, h);
        const pad = 20;
        const total = flujos.length + 1;
        const stepX = (w - 2 * pad) / total;
        const barW = Math.min(stepX - 6, 20);
        const maxFlujo = Math.max(inv, ...flujos) * 1.3;
        const midY = h / 2 + 10;
        ctx.strokeStyle = '#3f495e';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pad, midY);
        ctx.lineTo(w - pad, midY);
        ctx.stroke();
        ctx.fillStyle = '#f94f4f';
        const invH = (inv / maxFlujo) * (h / 2.8);
        ctx.fillRect(pad + 5, midY, barW, invH);
        ctx.fillStyle = '#4f9cf9';
        flujos.forEach(function(f, i) {
            var x = pad + (i + 2) * stepX - barW / 2;
            var fH = (f / maxFlujo) * (h / 2.8);
            ctx.fillRect(x, midY - fH, barW, fH);
            ctx.fillStyle = '#8a99ad';
            ctx.font = '6px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText('A' + (i + 1), x + barW / 2, midY + 10);
            ctx.fillStyle = '#4f9cf9';
        });
        ctx.fillStyle = '#8a99ad';
        ctx.font = '7px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText('Inv.', pad + 5 + barW / 2, midY + invH + 12);
        ctx.font = 'bold 9px JetBrains Mono';
        ctx.fillStyle = van >= 0 ? '#4ff97b' : '#f94f4f';
        ctx.fillText(van >= 0 ? '✔ VIABLE' : '✘ RECHAZADO', w / 2, 15);
        ctx.fillStyle = '#e8edf5';
        ctx.font = '8px JetBrains Mono';
        ctx.fillText('VAN: $' + van.toLocaleString('es-AR', {maximumFractionDigits:0}), w / 2, h - 6);
    },
    iva: function(canvas, neto, iva, bruto, tasa) {
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, h);
        const cx = w / 2;
        const total = neto + iva;
        const netoH = (neto / total) * (h - 60);
        const ivaH = (iva / total) * (h - 60);
        ctx.fillStyle = '#1e232f';
        ctx.fillRect(cx - 50, h - 30 - netoH - ivaH, 100, netoH + ivaH);
        ctx.fillStyle = '#4f9cf9';
        ctx.fillRect(cx - 50, h - 30 - netoH - ivaH, 100, netoH);
        ctx.fillStyle = '#f9c74f';
        ctx.fillRect(cx - 50, h - 30 - ivaH, 100, ivaH);
        ctx.strokeStyle = '#4a5570';
        ctx.lineWidth = 1;
        ctx.strokeRect(cx - 50, h - 30 - netoH - ivaH, 100, netoH + ivaH);
        ctx.fillStyle = '#e8edf5';
        ctx.font = '9px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText('Neto $' + neto.toLocaleString('es-AR', {maximumFractionDigits:0}), cx, h - 30 - ivaH - netoH/2 + 3);
        ctx.fillStyle = '#e8edf5';
        ctx.fillText('IVA $' + iva.toLocaleString('es-AR', {maximumFractionDigits:0}), cx, h - 30 - ivaH/2 + 3);
        ctx.fillStyle = '#8a99ad';
        ctx.font = '8px JetBrains Mono';
        ctx.fillText('Tasa: ' + (tasa*100).toFixed(1) + '%', cx, h - 5);
    },

    depreciacion: function(canvas, tabla, metodo) {
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, h);
        const pad = 25;
        const count = tabla.length;
        const barW = Math.min((w - 2*pad) / count - 4, 30);
        const maxDep = Math.max(...tabla.map(function(t) { return t.depreciacion; }), 1);
        const maxH = h - 2*pad - 20;
        for (let i = 0; i < count; i++) {
            let x = pad + i * ((w - 2*pad) / count);
            let depH = (tabla[i].depreciacion / maxDep) * maxH;
            ctx.fillStyle = '#22293a';
            ctx.fillRect(x, h - pad - depH, barW, depH);
            ctx.strokeStyle = '#4f9cf9';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x, h - pad - depH, barW, depH);
            ctx.fillStyle = '#8a99ad';
            ctx.font = '7px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText('A' + tabla[i].anio, x + barW/2, h - pad + 10);
        }
        ctx.fillStyle = '#4ff97b';
        ctx.font = '8px JetBrains Mono';
        ctx.textAlign = 'left';
        ctx.fillText('Depreciación (' + metodo + ')', pad, 15);
    },

    tablaAmort: function(canvas, tabla, P) {
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, h);
        const pad = 25;
        const count = Math.min(tabla.length, 24);
        const maxVal = Math.max(...tabla.map(function(t) { return t.cuota; }), 1);
        const barW = Math.min((w - 2*pad) / count - 3, 18);
        const maxH = h - 2*pad - 15;
        for (let i = 0; i < count; i++) {
            let x = pad + i * ((w - 2*pad) / count);
            let intH = (tabla[i].interes / maxVal) * maxH;
            let amortH = (tabla[i].amort / maxVal) * maxH;
            ctx.fillStyle = '#f94f4f';
            ctx.fillRect(x, h - pad - intH - amortH, barW, intH);
            ctx.fillStyle = '#4f9cf9';
            ctx.fillRect(x, h - pad - amortH, barW, amortH);
        }
        ctx.fillStyle = '#8a99ad';
        ctx.font = '7px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText('Capital: $' + P.toLocaleString('es-AR', {maximumFractionDigits:0}), w/2, h - 4);
        ctx.fillStyle = '#f94f4f';
        ctx.fillText('■ Int', pad, 15);
        ctx.fillStyle = '#4f9cf9';
        ctx.fillText('■ Amort', pad + 50, 15);
    },

    roi: function(canvas, inv, flujo, anios, roi) {
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, h);
        const cx = w / 2, cy = h / 2;
        const maxR = 40;
        const radius = Math.min(Math.abs(roi), maxR);
        ctx.strokeStyle = '#3f495e';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy - 5, maxR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = roi >= 0 ? '#4ff97b' : '#f94f4f';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(cx, cy - 5, radius, -Math.PI/2, -Math.PI/2 + (Math.PI * 2 * Math.min(Math.abs(roi)/100, 1)));
        ctx.stroke();
        ctx.fillStyle = '#e8edf5';
        ctx.font = 'bold 14px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(roi.toFixed(1) + '%', cx, cy + 22);
        ctx.fillStyle = '#8a99ad';
        ctx.font = '8px JetBrains Mono';
        ctx.fillText('Inversión: $' + inv.toLocaleString('es-AR', {maximumFractionDigits:0}), cx, h - 10);
        ctx.fillText('Flujo: $' + flujo.toLocaleString('es-AR', {maximumFractionDigits:0}) + '/año × ' + anios + ' años', cx, 18);
    },

    inflacion: function(canvas, vh, pi, n, va) {
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, h);
        const pad = 25;
        const pts = 12;
        const step = (w - 2*pad) / (pts - 1);
        ctx.beginPath();
        ctx.strokeStyle = '#4f9cf9';
        ctx.lineWidth = 2;
        for (let i = 0; i < pts; i++) {
            let t = i / (pts - 1);
            let val = vh * Math.pow(1 + pi, t * n);
            let maxVal = vh * Math.pow(1 + pi, n);
            let y = h - pad - ((val - vh) / (maxVal - vh || 1)) * (h - 2*pad);
            let x = pad + i * step;
            if (i === 0) ctx.moveTo(x, h - pad);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.fillStyle = '#e8edf5';
        ctx.font = '9px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText('$' + vh.toLocaleString('es-AR', {maximumFractionDigits:0}), pad, h - pad + 12);
        ctx.fillText('$' + va.toLocaleString('es-AR', {maximumFractionDigits:0}) + ' (inflado)', w - pad, 15);
        ctx.fillStyle = '#f9c74f';
        ctx.font = '8px JetBrains Mono';
        ctx.fillText('Inflación: ' + (pi*100).toFixed(1) + '% mensual × ' + n + ' meses', w/2, h - 6);
    },
    // =========================================================================
    // FINANZAS ESCOLARES (6) — Animados
    // =========================================================================

    // -------------------------------------------------------------------------
    // F10. INTERÉS SIMPLE — Barra de crecimiento lineal
    // -------------------------------------------------------------------------
    interesSimple: function(canvas, capital, interes, tiempo) {
        if (!canvas.id) canvas.id = 'canvas_int_simple';
        this.animate(canvas.id, (ease) => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);
            const pad = 20;
            const total = capital + interes;
            const barW = w - 2 * pad;
            const capW = (capital / total) * barW * ease;
            const intW = (interes / total) * barW * ease;
            const cy = h / 2 - 10;
            ctx.fillStyle = '#4f9cf9';
            ctx.fillRect(pad, cy, capW, 26);
            ctx.fillStyle = '#f94f4f';
            ctx.fillRect(pad + capW, cy, intW, 26);
            ctx.strokeStyle = '#4a5570';
            ctx.strokeRect(pad, cy, barW * ease, 26);
            ctx.fillStyle = '#e8edf5';
            ctx.font = '9px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText('Capital $' + capital.toLocaleString('es-AR', {maximumFractionDigits:0}), pad + capW / 2, cy + 18);
            ctx.fillText('Int. $' + interes.toLocaleString('es-AR', {maximumFractionDigits:0}), pad + capW + intW / 2, cy + 18);
            ctx.fillStyle = '#8a99ad';
            ctx.font = '8px JetBrains Mono';
            ctx.textAlign = 'left';
            ctx.fillText('Interés Simple — ' + tiempo + ' años', pad, 16);
        });
    },

    // -------------------------------------------------------------------------
    // F11. INTERÉS COMPUESTO — Curva exponencial
    // -------------------------------------------------------------------------
    interesCompuesto: function(canvas, capital, monto, tiempo) {
        if (!canvas.id) canvas.id = 'canvas_int_comp';
        this.animate(canvas.id, (ease) => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);
            const pad = 25;
            const cw = w - 2 * pad, ch = h - 40;
            const maxVal = Math.max(monto, capital * 1.2);
            const pts = 20;
            ctx.beginPath();
            ctx.strokeStyle = '#4ff97b';
            ctx.lineWidth = 2.5;
            for (let i = 0; i < pts; i++) {
                const t = (i / (pts - 1)) * tiempo * ease;
                const val = capital * Math.pow(monto / capital, t / Math.max(tiempo, 1));
                const x = pad + (i / (pts - 1)) * cw * ease;
                const y = h - 15 - (val / maxVal) * ch;
                if (i === 0) ctx.moveTo(x, h - 15);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.fillStyle = '#e8edf5';
            ctx.font = '9px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText('$' + capital.toLocaleString('es-AR', {maximumFractionDigits:0}), pad, h - 2);
            ctx.fillText('$' + monto.toLocaleString('es-AR', {maximumFractionDigits:0}) + ' (final)', w - pad, 16);
            ctx.fillStyle = '#8a99ad';
            ctx.font = '8px JetBrains Mono';
            ctx.fillText('Interés Compuesto — ' + tiempo + ' años', w / 2, h - 2);
        });
    },

    // -------------------------------------------------------------------------
    // F12. DESCUENTO — Barra nominal vs efectivo
    // -------------------------------------------------------------------------
    descuento: function(canvas, nominal, descuento, valorEfectivo) {
        if (!canvas.id) canvas.id = 'canvas_descuento';
        this.animate(canvas.id, (ease) => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);
            const pad = 20;
            const barW = w - 2 * pad;
            const effW = (valorEfectivo / nominal) * barW * ease;
            const descW = (descuento / nominal) * barW * ease;
            const cy = h / 2 - 10;
            ctx.fillStyle = '#4f9cf9';
            ctx.fillRect(pad, cy, effW, 26);
            ctx.fillStyle = '#f94f4f';
            ctx.fillRect(pad + effW, cy, descW, 26);
            ctx.strokeStyle = '#4a5570';
            ctx.strokeRect(pad, cy, (effW + descW), 26);
            ctx.fillStyle = '#e8edf5';
            ctx.font = '9px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText('Efectivo $' + valorEfectivo.toLocaleString('es-AR', {maximumFractionDigits:0}), pad + effW / 2, cy + 18);
            ctx.fillText('Desc. $' + descuento.toLocaleString('es-AR', {maximumFractionDigits:0}), pad + effW + descW / 2, cy + 18);
            ctx.fillStyle = '#8a99ad';
            ctx.font = '8px JetBrains Mono';
            ctx.textAlign = 'left';
            ctx.fillText('Descuento — Nominal: $' + nominal.toLocaleString('es-AR', {maximumFractionDigits:0}), pad, 16);
        });
    },

    // -------------------------------------------------------------------------
    // F13. SUELDO NETO — Barra bruto vs descuentos
    // -------------------------------------------------------------------------
    sueldoNeto: function(canvas, bruto, neto, descuento) {
        if (!canvas.id) canvas.id = 'canvas_sueldo';
        this.animate(canvas.id, (ease) => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);
            const pad = 20;
            const barW = w - 2 * pad;
            const netoW = (neto / bruto) * barW * ease;
            const descW = (descuento / bruto) * barW * ease;
            const cy = h / 2 - 10;
            ctx.fillStyle = '#4ff97b';
            ctx.fillRect(pad, cy, netoW, 26);
            ctx.fillStyle = '#f94f4f';
            ctx.fillRect(pad + netoW, cy, descW, 26);
            ctx.strokeStyle = '#4a5570';
            ctx.strokeRect(pad, cy, barW * ease, 26);
            ctx.fillStyle = '#e8edf5';
            ctx.font = '9px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText('Neto $' + neto.toLocaleString('es-AR', {maximumFractionDigits:0}), pad + netoW / 2, cy + 18);
            ctx.fillText('Desc. $' + descuento.toLocaleString('es-AR', {maximumFractionDigits:0}), pad + netoW + descW / 2, cy + 18);
            ctx.fillStyle = '#8a99ad';
            ctx.font = '8px JetBrains Mono';
            ctx.textAlign = 'left';
            ctx.fillText('Sueldo Bruto: $' + bruto.toLocaleString('es-AR', {maximumFractionDigits:0}), pad, 16);
        });
    },

    // -------------------------------------------------------------------------
    // F14. MARGEN BRUTO — Gráfico de anillo con porcentaje
    // -------------------------------------------------------------------------
    margenBruto: function(canvas, ventas, costo, margen) {
        if (!canvas.id) canvas.id = 'canvas_margen';
        this.animate(canvas.id, (ease) => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);
            const cx = w / 2, cy = h / 2 - 5;
            const radio = Math.min(w, h) * 0.3;
            const ang = (margen / 100) * Math.PI * 2 * ease;
            ctx.strokeStyle = '#3f495e';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(cx, cy, radio, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeStyle = margen >= 0 ? '#4ff97b' : '#f94f4f';
            ctx.lineWidth = 5;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.arc(cx, cy, radio, -Math.PI / 2, -Math.PI / 2 + Math.min(ang, Math.PI * 2));
            ctx.stroke();
            ctx.fillStyle = '#e8edf5';
            ctx.font = 'bold 14px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(margen.toFixed(1) + '%', cx, cy + 5);
            ctx.fillStyle = '#8a99ad';
            ctx.font = '8px JetBrains Mono';
            ctx.fillText('Ventas: $' + ventas.toLocaleString('es-AR', {maximumFractionDigits:0}), cx, cy + radio + 22);
            ctx.fillText('Costo: $' + costo.toLocaleString('es-AR', {maximumFractionDigits:0}), cx, cy + radio + 36);
        });
    },

    // -------------------------------------------------------------------------
    // F15. TIR — Barra de rentabilidad vs inversión
    // -------------------------------------------------------------------------
    tir: function(canvas, inversion, flujo, anios, tirVal) {
        if (!canvas.id) canvas.id = 'canvas_tir';
        this.animate(canvas.id, (ease) => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);
            const retorno = flujo * anios;
            const ganancia = retorno - inversion;
            const maxVal = Math.max(retorno, inversion) * 1.2;
            const pad = 20;
            const barW = 40;
            const maxH = h - 50;
            const invH = (inversion / maxVal) * maxH * ease;
            const retH = (retorno / maxVal) * maxH * ease;
            const cx = w / 3;
            ctx.fillStyle = '#f94f4f';
            ctx.fillRect(cx - barW / 2, h - 20 - invH, barW, invH);
            ctx.fillStyle = '#4ff97b';
            ctx.fillRect(cx * 2 - barW / 2, h - 20 - retH, barW, retH);
            ctx.strokeStyle = '#4a5570';
            ctx.lineWidth = 1;
            ctx.strokeRect(cx - barW / 2, h - 20 - invH, barW, invH);
            ctx.strokeRect(cx * 2 - barW / 2, h - 20 - retH, barW, retH);
            ctx.fillStyle = '#e8edf5';
            ctx.font = '9px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText('Inversión', cx, h - 4);
            ctx.fillText('Retorno', cx * 2, h - 4);
            ctx.fillStyle = '#8a99ad';
            ctx.font = '8px JetBrains Mono';
            ctx.fillText('$' + inversion.toLocaleString('es-AR', {maximumFractionDigits:0}), cx, h - 20 - invH - 6);
            ctx.fillText('$' + retorno.toLocaleString('es-AR', {maximumFractionDigits:0}), cx * 2, h - 20 - retH - 6);
            ctx.fillStyle = tirVal >= 0 ? '#4ff97b' : '#f94f4f';
            ctx.font = 'bold 10px JetBrains Mono';
            ctx.fillText('TIR: ' + tirVal.toFixed(1) + '%', w / 2, 16);
            ctx.fillStyle = '#8a99ad';
            ctx.font = '8px JetBrains Mono';
            ctx.fillText(anios + ' años  |  Flujo: $' + flujo.toLocaleString('es-AR', {maximumFractionDigits:0}) + '/año', w / 2, 32);
        });
    },

    // -------------------------------------------------------------------------
    // VALOR FUTURO — Curva exponencial
    // -------------------------------------------------------------------------
    valorFuturo: function(canvas, vp, vf, n) {
        if (!canvas.id) canvas.id = 'canvas_vf';
        this.animate(canvas.id, (ease) => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);
            const pad = 25, cw = w - 2 * pad, ch = h - 40;
            const maxVal = Math.max(vf, vp * 1.2);
            const pts = 20;
            ctx.beginPath();
            ctx.strokeStyle = '#4ff97b';
            ctx.lineWidth = 2.5;
            for (let i = 0; i < pts; i++) {
                const t = (i / (pts - 1)) * n * ease;
                const val = vp * Math.pow(vf / vp, t / Math.max(n, 1));
                const x = pad + (i / (pts - 1)) * cw * ease;
                const y = h - 15 - (val / maxVal) * ch;
                if (i === 0) ctx.moveTo(x, h - 15);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.fillStyle = '#e8edf5';
            ctx.font = '9px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText('$' + vp.toLocaleString('es-AR', {maximumFractionDigits:0}), pad, h - 2);
            ctx.fillText('$' + vf.toLocaleString('es-AR', {maximumFractionDigits:0}) + ' (VF)', w - pad, 16);
            ctx.fillStyle = '#8a99ad';
            ctx.font = '8px JetBrains Mono';
            ctx.fillText('Valor Futuro — ' + n + ' períodos', w / 2, h - 2);
        });
    },

    // -------------------------------------------------------------------------
    // VPN SIMPLIFICADO — Barra de flujos
    // -------------------------------------------------------------------------
    vpnSimple: function(canvas, inv, flujos, van) {
        if (!canvas.id) canvas.id = 'canvas_vpn_s';
        this.animate(canvas.id, (ease) => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);
            const pad = 20;
            const tot = flujos.length + 1;
            const stepX = (w - 2 * pad) / tot;
            const barW = Math.min(stepX - 6, 20);
            const maxF = Math.max(inv, ...flujos) * 1.3;
            const midY = h / 2 + 10;
            ctx.strokeStyle = '#3f495e';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(pad, midY);
            ctx.lineTo(w - pad, midY);
            ctx.stroke();
            ctx.fillStyle = '#f94f4f';
            const invH = (inv / maxF) * (h / 2.8) * ease;
            ctx.fillRect(pad + 5, midY, barW, invH);
            ctx.fillStyle = '#4f9cf9';
            flujos.forEach(function(f, i) {
                var x = pad + (i + 2) * stepX - barW / 2;
                var fH = (f / maxF) * (h / 2.8) * ease;
                ctx.fillRect(x, midY - fH, barW, fH);
                ctx.fillStyle = '#8a99ad';
                ctx.font = '6px JetBrains Mono';
                ctx.textAlign = 'center';
                ctx.fillText('A' + (i + 1), x + barW / 2, midY + 10);
                ctx.fillStyle = '#4f9cf9';
            });
            ctx.fillStyle = '#8a99ad';
            ctx.font = '7px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText('Inv.', pad + 5 + barW / 2, midY + invH + 12);
            ctx.font = 'bold 9px JetBrains Mono';
            ctx.fillStyle = van >= 0 ? '#4ff97b' : '#f94f4f';
            ctx.fillText(van >= 0 ? '✔ VIABLE' : '✘ RECHAZADO', w / 2, 15);
            ctx.fillStyle = '#e8edf5';
            ctx.font = '8px JetBrains Mono';
            ctx.fillText('VAN: $' + van.toLocaleString('es-AR', {maximumFractionDigits:0}), w / 2, h - 6);
        });
    },

    // -------------------------------------------------------------------------
    // PAYBACK — Barra de recupero
    // -------------------------------------------------------------------------
    payback: function(canvas, inv, flujo, payback) {
        if (!canvas.id) canvas.id = 'canvas_payback';
        this.animate(canvas.id, (ease) => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);
            const pad = 20;
            const barW = w - 2 * pad;
            const cy = h / 2 - 10;
            const maxAños = 10;
            const pct = Math.min(payback / maxAños, 1) * ease;
            ctx.fillStyle = '#1e232f';
            ctx.fillRect(pad, cy, barW, 26);
            ctx.fillStyle = '#4f9cf9';
            ctx.fillRect(pad, cy, barW * pct, 26);
            ctx.strokeStyle = '#4a5570';
            ctx.strokeRect(pad, cy, barW, 26);
            for (let i = 1; i <= maxAños; i++) {
                const x = pad + (i / maxAños) * barW;
                ctx.strokeStyle = '#3f495e';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x, cy - 3);
                ctx.lineTo(x, cy + 29);
                ctx.stroke();
                ctx.fillStyle = '#8a99ad';
                ctx.font = '6px JetBrains Mono';
                ctx.textAlign = 'center';
                ctx.fillText(i + 'a', x, cy + 40);
            }
            ctx.fillStyle = '#e8edf5';
            ctx.font = 'bold 10px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(payback.toFixed(1) + ' años', pad + barW * pct / 2, cy + 19);
            ctx.fillStyle = '#8a99ad';
            ctx.font = '8px JetBrains Mono';
            ctx.textAlign = 'left';
            ctx.fillText('Payback Period', pad, 16);
        });
    },

    // -------------------------------------------------------------------------
    // CUOTA ALEMÁN — Barra decreciente
    // -------------------------------------------------------------------------
    cuotaAleman: function(canvas, tabla, P) {
        if (!canvas.id) canvas.id = 'canvas_cuota_al';
        this.animate(canvas.id, (ease) => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);
            const pad = 25;
            const count = Math.min(tabla.length, 12);
            const maxVal = Math.max(...tabla.map(t => t.cuota), 1);
            const barW = Math.min((w - 2 * pad) / count - 3, 25);
            const maxH = h - 2 * pad - 15;
            for (let i = 0; i < count; i++) {
                const x = pad + i * ((w - 2 * pad) / count);
                const cuotaH = (tabla[i].cuota / maxVal) * maxH * ease;
                const intH = (tabla[i].interes / maxVal) * maxH * ease;
                ctx.fillStyle = '#f94f4f';
                ctx.fillRect(x, h - pad - cuotaH, barW, intH);
                ctx.fillStyle = '#4f9cf9';
                ctx.fillRect(x, h - pad - cuotaH + intH, barW, cuotaH - intH);
                ctx.strokeStyle = '#4a5570';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, h - pad - cuotaH, barW, cuotaH);
                ctx.fillStyle = '#8a99ad';
                ctx.font = '6px JetBrains Mono';
                ctx.textAlign = 'center';
                ctx.fillText('M' + tabla[i].mes, x + barW / 2, h - pad + 10);
            }
            ctx.fillStyle = '#f94f4f';
            ctx.font = '8px JetBrains Mono';
            ctx.textAlign = 'left';
            ctx.fillText('■ Interés', pad, 15);
            ctx.fillStyle = '#4f9cf9';
            ctx.fillText('■ Amort.', pad + 80, 15);
            ctx.fillStyle = '#8a99ad';
            ctx.font = '8px JetBrains Mono';
            ctx.fillText('Sistema Alemán', w / 2, 15);
        });
    },

    // -------------------------------------------------------------------------
    // CUOTA AMERICANO — Barra de intereses
    // -------------------------------------------------------------------------
    cuotaAmericano: function(canvas, P, interes, N) {
        if (!canvas.id) canvas.id = 'canvas_cuota_am';
        this.animate(canvas.id, (ease) => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);
            const pad = 25;
            const count = Math.min(N, 12);
            const maxH = h - 2 * pad - 20;
            const barW = Math.min((w - 2 * pad) / count - 3, 30);
            const intH = Math.min((interes / Math.max(P, 1)) * maxH, maxH * 0.4) * ease;
            const lastH = Math.min((P / Math.max(P, 1)) * maxH, maxH * 0.8) * ease;
            for (let i = 0; i < count; i++) {
                const x = pad + i * ((w - 2 * pad) / count);
                const isLast = i === count - 1;
                ctx.fillStyle = '#f94f4f';
                ctx.fillRect(x, h - pad - intH - (isLast ? lastH : 0), barW, intH);
                if (isLast) {
                    ctx.fillStyle = '#4f9cf9';
                    ctx.fillRect(x, h - pad - lastH, barW, lastH);
                }
                ctx.strokeStyle = '#4a5570';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, h - pad - intH - (isLast ? lastH : 0), barW, intH + (isLast ? lastH : 0));
                ctx.fillStyle = '#8a99ad';
                ctx.font = '6px JetBrains Mono';
                ctx.textAlign = 'center';
                ctx.fillText('M' + (i + 1), x + barW / 2, h - pad + 10);
            }
            ctx.fillStyle = '#f94f4f';
            ctx.font = '8px JetBrains Mono';
            ctx.textAlign = 'left';
            ctx.fillText('■ Interés', pad, 15);
            ctx.fillStyle = '#4f9cf9';
            ctx.fillText('■ Capital', pad + 80, 15);
            ctx.fillStyle = '#8a99ad';
            ctx.font = '8px JetBrains Mono';
            ctx.fillText('Sistema Americano — Capital al final', w / 2, 30);
        });
    }
};

