const MecanicaVisual = {
    // Almacena identificadores activos para evitar parpadeos o colisiones de requestAnimationFrame
    loops: {},

    initCanvas: function(canvas) {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        return ctx;
    },

    // Orquestador dinámico del tiempo para mover los elementos fluidamente
    startLoop: function(canvasId, drawFrame) {
        if (this.loops[canvasId]) cancelAnimationFrame(this.loops[canvasId]);
        
        const loop = () => {
            drawFrame();
            this.loops[canvasId] = requestAnimationFrame(loop);
        };
        this.loops[canvasId] = requestAnimationFrame(loop);
    },

    // 1. Palanca Dinámica (Torque)
    torque: function(canvas, fuerza, distancia) {
        if (!canvas.id) canvas.id = 'canvas_torque';
        
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);

            const centerY = h / 2;
            const pivotX = 60;
            const maxLargo = w - 140;
            const escala = maxLargo / Math.max(distancia || 1, 1);
            const endX = pivotX + (distancia || 0.3) * escala;

            // Barra de torsión metálica
            ctx.strokeStyle = '#4f9cf9';
            ctx.lineWidth = 6;
            ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(pivotX, centerY); ctx.lineTo(endX, centerY); ctx.stroke();

            // Punto de apoyo/Pivote rotacional
            ctx.fillStyle = '#f9c74f';
            ctx.beginPath(); ctx.arc(pivotX, centerY, 8, 0, Math.PI * 2); ctx.fill();

            // Vector de fuerza oscilante (Representación de carga dinámica)
            if (fuerza > 0) {
                const fLength = Math.min(60, (fuerza / 100) * 40 + 20);
                ctx.strokeStyle = '#f94f4f';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(endX, centerY);
                ctx.lineTo(endX, centerY + fLength);
                ctx.stroke();

                // Punta de la flecha del vector
                ctx.fillStyle = '#f94f4f';
                ctx.beginPath();
                ctx.moveTo(endX - 5, centerY + fLength - 5);
                ctx.lineTo(endX + 5, centerY + fLength - 5);
                ctx.lineTo(endX, centerY + fLength);
                ctx.closePath(); ctx.fill();
            }

            ctx.fillStyle = '#e8edf5';
            ctx.font = '10px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(`Brazo: ${(distancia || 0).toFixed(2)} m`, (pivotX + endX)/2, centerY - 10);
        });
    },

    // 2. Motor Rotativo (Potencia y RPM)
    potencia: function(canvas, torque, rpm) {
        if (!canvas.id) canvas.id = 'canvas_potencia';

        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);

            const cx = w / 2, cy = h / 2;
            const radioRueda = Math.min(w, h) / 2.8;

            // Cálculo del ángulo en base al tiempo real y velocidad (RPM)
            const speedFactor = (rpm || 0) * 0.0002;
            const angulo = (Date.now() * speedFactor) % (Math.PI * 2);

            // Núcleo del rotor
            ctx.fillStyle = '#1e232f';
            ctx.beginPath(); ctx.arc(cx, cy, radioRueda, 0, Math.PI * 2); ctx.fill();

            // Llanta externa
            ctx.strokeStyle = '#4f9cf9';
            ctx.lineWidth = 4;
            ctx.beginPath(); ctx.arc(cx, cy, radioRueda, 0, Math.PI * 2); ctx.stroke();

            // Aspas / Radios cinéticos rotativos
            ctx.strokeStyle = 'rgba(249, 199, 79, 0.8)';
            ctx.lineWidth = 2.5;
            for (let i = 0; i < 4; i++) {
                let a = angulo + (i * Math.PI / 2);
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.lineTo(cx + Math.cos(a) * radioRueda, cy + Math.sin(a) * radioRueda);
                ctx.stroke();
            }

            ctx.fillStyle = '#e8edf5';
            ctx.font = '9px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(`${rpm ? Math.round(rpm) : 0} RPM | ${torque ? torque.toFixed(1) : 0} N·m`, cx, cy - radioRueda - 8);
        });
    },

    // 3. Sistema Unión Correa (Transmisión por Poleas) - NUEVO
    transmision: function(canvas, d1, n1, d2, n2) {
        if (!canvas.id) canvas.id = 'canvas_transmision';

        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);

            let cy = h / 2;
            let pad = 40;
            let x1 = pad + 30;
            let x2 = w - pad - 30;

            // Normalización geométrica de los radios de dibujo
            let maxD = Math.max(d1, d2);
            let r1 = (d1 / maxD) * 35 + 10;
            let r2 = (d2 / maxD) * 35 + 10;

            // Velocidades de rotación basadas en tiempo
            let a1 = (Date.now() * (n1 * 0.0001)) % (Math.PI * 2);
            let a2 = (Date.now() * (n2 * 0.0001)) % (Math.PI * 2);

            // Dibujar la correa de distribución externa
            ctx.strokeStyle = '#374151';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(x1, cy - r1); ctx.lineTo(x2, cy - r2);
            ctx.lineTo(x2, cy + r2); ctx.lineTo(x1, cy + r1);
            ctx.closePath(); ctx.stroke();

            // Render Polea Conductora (Entrada - Azul)
            ctx.fillStyle = '#1e232f';
            ctx.beginPath(); ctx.arc(x1, cy, r1, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#4f9cf9'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x1, cy, r1, 0, Math.PI*2); ctx.stroke();
            // Guía de giro
            ctx.strokeStyle = '#e8edf5'; ctx.lineWidth = 1.5; ctx.beginPath();
            ctx.moveTo(x1, cy); ctx.lineTo(x1 + Math.cos(a1)*r1, cy + Math.sin(a1)*r1); ctx.stroke();

            // Render Polea Conducida (Salida - Violeta)
            ctx.fillStyle = '#1e232f';
            ctx.beginPath(); ctx.arc(x2, cy, r2, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#a78bfa'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x2, cy, r2, 0, Math.PI*2); ctx.stroke();
            // Guía de giro
            ctx.strokeStyle = '#e8edf5'; ctx.lineWidth = 1.5; ctx.beginPath();
            ctx.moveTo(x2, cy); ctx.lineTo(x2 + Math.cos(a2)*r2, cy + Math.sin(a2)*r2); ctx.stroke();

            ctx.fillStyle = '#8a99ad';
            ctx.font = '8px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(`Entrada: ${Math.round(n1)} RPM`, x1, cy + r1 + 15);
            ctx.fillText(`Salida: ${Math.round(n2)} RPM`, x2, cy + r2 + 15);
        });
    },

    // 4. Multiplicador de Fuerza Mecánica (Prensa Hidráulica de Pascal) - NUEVO
    pascal: function(canvas, f1, a1, f2, a2) {
        if (!canvas.id) canvas.id = 'canvas_pascal';

        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);

            let baseH = h - 30;
            // Modulación visual basada en el tiempo para ver el movimiento cíclico de presión
            let oscilacion = Math.sin(Date.now() * 0.003) * 6;

            let w1 = 20; // Ancho visual pistón chico
            let w2 = 65; // Ancho visual pistón grande

            let x1 = 40;
            let x2 = w - 40 - w2;

            // Dibujar cámara de fluido hidráulico (Líquido azul)
            ctx.fillStyle = 'rgba(79, 156, 249, 0.25)';
            ctx.beginPath();
            ctx.moveTo(x1, baseH - 40);
            ctx.lineTo(x1, baseH);
            ctx.lineTo(x2 + w2, baseH);
            ctx.lineTo(x2 + w2, baseH - 40);
            ctx.lineTo(x2, baseH - 40);
            ctx.lineTo(x2, baseH - 15);
            ctx.lineTo(x1 + w1, baseH - 15);
            ctx.lineTo(x1 + w1, baseH - 40);
            ctx.closePath(); ctx.fill();

            // Dibujar estructura externa contenedora
            ctx.strokeStyle = '#4a5570';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Pistón 1 (Embolo de Entrada)
            let y1 = baseH - 35 + oscilacion;
            ctx.fillStyle = '#f94f4f';
            ctx.fillRect(x1 + 2, y1, w1 - 4, 10);

            // Pistón 2 (Embolo de Salida Amplificado)
            let y2 = baseH - 25 - (oscilacion * (a1 / a2));
            ctx.fillStyle = '#4ff97b';
            ctx.fillRect(x2 + 2, y2, w2 - 4, 10);

            // Textos descriptivos
            ctx.fillStyle = '#e8edf5';
            ctx.font = '8px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(`F1: ${f1}N`, x1 + w1/2, y1 - 6);
            ctx.fillText(`F2: ${Math.round(f2)}N`, x2 + w2/2, y2 - 6);
        });
    },

    // 5. Consumo y Eficiencia Energética de Combustible
    consumo: function(canvas, l100) {
        if (!canvas.id) canvas.id = 'canvas_consumo';
        
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);

            const pad = 20;
            const barW = w - 2 * pad;
            const barH = 14;
            const cy = h / 2 - barH / 2;

            // Riel de progreso de fondo
            ctx.fillStyle = '#1e232f';
            ctx.fillRect(pad, cy, barW, barH);

            // Determinar color de eficiencia automotriz
            let pct = Math.min(1, l100 / 18);
            let color = pct < 0.4 ? '#4ff97b' : pct < 0.72 ? '#f9c74f' : '#f94f4f';

            ctx.fillStyle = color;
            ctx.fillRect(pad, cy, barW * pct, barH);

            ctx.fillStyle = '#e8edf5';
            ctx.font = '9px JetBrains Mono';
            ctx.textAlign = 'left';
            ctx.fillText(`Eficiencia de consumo: ${l100.toFixed(1)} L/100km`, pad, cy - 8);
        });
    },

    palanca: function(canvas, f1, d1, f2, d2) {
        if (!canvas.id) canvas.id = 'canvas_palanca';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);

            const cx = w / 2, cy = h / 2;
            const total = d1 + d2;
            const scale = Math.min(w - 80, 200) / (total || 1);
            const s1 = d1 * scale, s2 = d2 * scale;

            ctx.fillStyle = '#f9c74f';
            ctx.beginPath(); ctx.arc(cx - s1 + s2, cy + 8, 6, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.moveTo(cx - s1 + s2 - 6, cy + 8); ctx.lineTo(cx - s1 + s2 + 6, cy + 8); ctx.lineTo(cx - s1 + s2, cy + 16); ctx.closePath(); ctx.fill();

            ctx.strokeStyle = '#4f9cf9';
            ctx.lineWidth = 5;
            ctx.beginPath(); ctx.moveTo(cx - s1, cy); ctx.lineTo(cx + s2, cy); ctx.stroke();

            const osc = Math.sin(Date.now() * 0.004) * 3;
            ctx.strokeStyle = '#f94f4f';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(cx - s1, cy); ctx.lineTo(cx - s1, cy + 30 + osc); ctx.stroke();
            ctx.fillStyle = '#f94f4f';
            ctx.font = '10px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(`F1=${f1}N`, cx - s1, cy + 50);

            ctx.strokeStyle = '#4ff97b';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(cx + s2, cy); ctx.lineTo(cx + s2, cy + 20 - osc); ctx.stroke();
            ctx.fillStyle = '#4ff97b';
            ctx.fillText(`F2=${f2.toFixed(1)}N`, cx + s2, cy + 40);

            ctx.fillStyle = '#e8edf5';
            ctx.font = '9px JetBrains Mono';
            ctx.fillText(`d1=${d1.toFixed(2)}m`, cx - s1/2, cy - 10);
            ctx.fillText(`d2=${d2.toFixed(2)}m`, cx + s2/2, cy - 10);
        });
    },

    polea: function(canvas, peso, tipo) {
        if (!canvas.id) canvas.id = 'canvas_polea';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);

            const cx = w / 2;
            const radio = 25;
            const osc = Math.sin(Date.now() * 0.003) * 2;
            const topY = 30;
            const weightY = h - 40 + osc;

            ctx.strokeStyle = '#374151';
            ctx.lineWidth = 2;
            ctx.beginPath();
            if (tipo === 'movil') {
                const polY = h / 2;
                ctx.moveTo(cx, weightY);
                ctx.lineTo(cx, polY + radio);
                ctx.lineTo(cx - radio * 2, topY);
                ctx.moveTo(cx + radio * 2, topY);
                ctx.lineTo(cx, polY + radio);
                ctx.stroke();
                ctx.strokeStyle = '#4f9cf9';
                ctx.lineWidth = 3;
                ctx.beginPath(); ctx.arc(cx, polY, radio, 0, Math.PI * 2); ctx.stroke();
            } else {
                ctx.moveTo(cx, topY + radio);
                ctx.lineTo(cx, weightY);
                ctx.moveTo(cx, topY + radio);
                ctx.lineTo(cx + 30, topY);
                ctx.stroke();
                ctx.strokeStyle = '#4f9cf9';
                ctx.lineWidth = 3;
                ctx.beginPath(); ctx.arc(cx, topY + radio, radio, 0, Math.PI * 2); ctx.stroke();
            }

            ctx.fillStyle = '#f94f4f';
            ctx.fillRect(cx - 12, weightY, 24, 20);

            ctx.fillStyle = '#e8edf5';
            ctx.font = '9px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(`R = ${peso}N`, cx, h - 8);
            ctx.fillText(tipo === 'movil' ? 'Móvil' : 'Fija', cx, topY + 12);
        });
    },

    plano_inclinado: function(canvas, m, ang, F) {
        if (!canvas.id) canvas.id = 'canvas_plano';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);

            const pad = 30;
            const rad = ang * Math.PI / 180;
            const baseW = w - 2 * pad;
            const slopeH = Math.tan(rad) * baseW;

            ctx.strokeStyle = '#4f9cf9';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(pad, h - pad);
            ctx.lineTo(pad + baseW, h - pad);
            ctx.lineTo(pad + baseW, h - pad - Math.min(slopeH, h * 0.6));
            ctx.stroke();

            const t = Date.now() * 0.001;
            const blockX = pad + baseW * 0.3 + Math.sin(t) * baseW * 0.15;
            const blockY = h - pad - (blockX - pad) * Math.tan(rad);
            const blockSize = 18;
            ctx.fillStyle = 'rgba(249,79,79,0.6)';
            ctx.fillRect(blockX - blockSize/2, blockY - blockSize, blockSize, blockSize);
            ctx.strokeStyle = '#f94f4f';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(blockX - blockSize/2, blockY - blockSize, blockSize, blockSize);

            ctx.fillStyle = '#e8edf5';
            ctx.font = '9px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(`m = ${m} kg`, blockX, blockY - blockSize - 5);
            ctx.fillText(`θ = ${ang}°`, pad + baseW/2, h - pad + 15);
            ctx.fillStyle = '#f9c74f';
            ctx.fillText(`F = ${F.toFixed(1)} N`, pad + baseW/2, 20);
        });
    },

    torno: function(canvas, L, r, R, F) {
        if (!canvas.id) canvas.id = 'canvas_torno';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);

            const cx = w / 2, cy = h / 2;
            const maxR = Math.min(w, h) / 2.5;
            const escala = maxR / (Math.max(L, r) || 1);
            const sL = L * escala, sr = r * escala;
            const ang = Date.now() * 0.002;

            ctx.strokeStyle = '#4f9cf9';
            ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(cx, cy, sr, 0, Math.PI * 2); ctx.stroke();

            ctx.strokeStyle = '#f9c74f';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(ang) * sL, cy + Math.sin(ang) * sL);
            ctx.stroke();

            ctx.fillStyle = '#f9c74f';
            ctx.beginPath();
            ctx.arc(cx + Math.cos(ang) * sL, cy + Math.sin(ang) * sL, 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#e8edf5';
            ctx.font = '9px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(`L = ${L.toFixed(2)}m`, cx + sL/2 * Math.cos(ang) + 10, cy + sL/2 * Math.sin(ang) - 10);
            ctx.fillText(`R = ${R}N`, cx + sr + 20, cy - 5);
            ctx.fillText(`F = ${F.toFixed(1)}N`, cx - sr - 20, cy + 5);
        });
    },

    velocidad_angular: function(canvas, omega, radio, v) {
        if (!canvas.id) canvas.id = 'canvas_vel_ang';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);

            const cx = w / 2, cy = h / 2;
            const maxR = Math.min(w, h) / 2 - 30;
            const escala = maxR / (radio || 1);
            const sr = radio * escala;
            const ang = Date.now() * 0.005 * (omega / 10);

            ctx.strokeStyle = 'rgba(79,156,249,0.2)';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.beginPath(); ctx.arc(cx, cy, sr, 0, Math.PI * 2); ctx.stroke();
            ctx.setLineDash([]);

            ctx.strokeStyle = '#4f9cf9';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(ang) * sr, cy + Math.sin(ang) * sr);
            ctx.stroke();

            ctx.fillStyle = '#f9c74f';
            ctx.beginPath();
            ctx.arc(cx + Math.cos(ang) * sr, cy + Math.sin(ang) * sr, 4, 0, Math.PI * 2);
            ctx.fill();

            const tx = -Math.sin(ang), ty = Math.cos(ang);
            const vLen = 30;
            ctx.strokeStyle = '#f94f4f';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(ang) * sr, cy + Math.sin(ang) * sr);
            ctx.lineTo(cx + Math.cos(ang) * sr + tx * vLen, cy + Math.sin(ang) * sr + ty * vLen);
            ctx.stroke();

            ctx.fillStyle = '#e8edf5';
            ctx.font = '10px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(`ω = ${omega} rad/s`, cx, cy + sr + 22);
            ctx.fillText(`r = ${radio.toFixed(2)} m`, cx + sr/2 + 10, cy - 8);
            ctx.fillStyle = '#f94f4f';
            ctx.fillText(`v = ${v.toFixed(2)} m/s`, cx + Math.cos(ang) * sr + tx * vLen/2, cy + Math.sin(ang) * sr + ty * vLen/2 - 8);
        });
    },

    rendimiento: function(canvas, eta) {
        if (!canvas.id) canvas.id = 'canvas_rendimiento';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);

            const pad = 30;
            const barW = w - 2 * pad;
            const barH = 20;
            const cy = h / 2 - barH / 2;
            const pct = Math.min(1, Math.max(0, eta / 100));

            ctx.fillStyle = '#1e232f';
            ctx.fillRect(pad, cy, barW, barH);

            const color = eta >= 85 ? '#4ff97b' : eta >= 60 ? '#f9c74f' : '#f94f4f';
            ctx.fillStyle = color;
            ctx.fillRect(pad, cy, barW * pct, barH);

            ctx.fillStyle = '#e8edf5';
            ctx.font = '9px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(`${eta.toFixed(1)}%`, w / 2, cy - 10);
            ctx.fillText('Rendimiento (η)', w / 2, cy + barH + 18);
        });
    },

    hooke: function(canvas, k, x, F) {
        if (!canvas.id) canvas.id = 'canvas_hooke';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);

            const cx = w / 2, cy = h / 2;
            const scale = Math.min(w - 80, 200);
            const sx = x * scale;
            const osc = Math.sin(Date.now() * 0.003) * sx;

            ctx.strokeStyle = '#4f9cf9';
            ctx.lineWidth = 2;
            const leftX = cx - 40, rightX = cx + 40 + osc;
            ctx.beginPath();
            ctx.moveTo(leftX, cy);
            const coils = 6;
            for (let i = 0; i <= coils; i++) {
                const t = i / coils;
                const px = leftX + (rightX - leftX) * t;
                const py = cy + (i % 2 === 0 ? -10 : 10);
                ctx.lineTo(px, py);
            }
            ctx.stroke();

            ctx.strokeStyle = '#374151';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(leftX - 10, cy - 20);
            ctx.lineTo(leftX - 10, cy + 20);
            ctx.stroke();

            ctx.fillStyle = 'rgba(249,199,79,0.6)';
            ctx.strokeStyle = '#f9c74f';
            ctx.lineWidth = 1.5;
            ctx.fillRect(rightX - 10, cy - 10, 20, 20);
            ctx.strokeRect(rightX - 10, cy - 10, 20, 20);

            ctx.fillStyle = '#e8edf5';
            ctx.font = '9px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(`k = ${k} N/m`, cx, 20);
            ctx.fillText(`x = ${(x*100).toFixed(1)} cm`, cx, h - 10);
            ctx.fillStyle = '#f94f4f';
            ctx.fillText(`F = ${F.toFixed(2)} N`, cx, cy - 25);
        });
    },

    presion_solidos: function(canvas, F, A, P) {
        if (!canvas.id) canvas.id = 'canvas_presion';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);

            const cx = w / 2, cy = h / 2;
            const blockW = Math.min(w * 0.5, 160);
            const blockH = 40;
            const osc = Math.abs(Math.sin(Date.now() * 0.002)) * 5;

            ctx.fillStyle = 'rgba(79,156,249,0.15)';
            ctx.strokeStyle = '#4f9cf9';
            ctx.lineWidth = 2;
            ctx.fillRect(cx - blockW/2, cy - blockH/2, blockW, blockH);
            ctx.strokeRect(cx - blockW/2, cy - blockH/2, blockW, blockH);

            const arrowCount = 5;
            for (let i = 0; i < arrowCount; i++) {
                const ax = cx - blockW/2 + (i + 0.5) * blockW / arrowCount;
                ctx.strokeStyle = '#f94f4f';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(ax, cy - blockH/2 - 5 - osc);
                ctx.lineTo(ax, cy - blockH/2 - 20 - osc);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(ax, cy - blockH/2 - 20 - osc);
                ctx.lineTo(ax - 3, cy - blockH/2 - 15 - osc);
                ctx.moveTo(ax, cy - blockH/2 - 20 - osc);
                ctx.lineTo(ax + 3, cy - blockH/2 - 15 - osc);
                ctx.stroke();
            }

            ctx.fillStyle = '#e8edf5';
            ctx.font = '10px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(`F = ${F} N`, cx, cy - blockH/2 - 28);
            ctx.fillText(`A = ${A} m²`, cx, cy + blockH/2 + 18);
            ctx.fillStyle = '#4ff97b';
            ctx.fillText(`P = ${P.toFixed(1)} Pa`, cx, cy - blockH/2 - 48);
        });
    },

    esfuerzo_deformacion: function(canvas, sigma, epsilon) {
        if (!canvas.id) canvas.id = 'canvas_esfuerzo';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);

            const pad = 30;
            const graphW = w - 2 * pad;
            const graphH = h - 2 * pad;

            ctx.strokeStyle = '#374151';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(pad, pad); ctx.lineTo(pad, h - pad);
            ctx.lineTo(w - pad, h - pad);
            ctx.stroke();

            ctx.strokeStyle = '#4f9cf9';
            ctx.lineWidth = 2;
            ctx.beginPath();
            const maxEpsilon = 0.02;
            const points = 50;
            for (let i = 0; i <= points; i++) {
                const t = i / points;
                const e = t * maxEpsilon;
                const s = e < 0.005 ? e * 200000 : e < 0.01 ? 1000 + (e - 0.005) * 100000 : 1500 + (e - 0.01) * 50000;
                const x = pad + (e / maxEpsilon) * graphW;
                const y = h - pad - (s / 2000) * graphH;
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.stroke();

            const eNorm = Math.min(1, epsilon / maxEpsilon);
            const sNorm = epsilon < 0.005 ? epsilon * 200000 / 2000 : epsilon < 0.01 ? (1000 + (epsilon - 0.005) * 100000) / 2000 : (1500 + (epsilon - 0.01) * 50000) / 2000;
            const px = pad + eNorm * graphW;
            const py = h - pad - Math.min(1, sNorm) * graphH;
            ctx.fillStyle = '#f94f4f';
            ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();

            ctx.fillStyle = '#e8edf5';
            ctx.font = '9px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(`σ = ${sigma.toFixed(1)} Pa`, w/2, pad - 5);
            ctx.fillText(`ε = ${(epsilon*100).toFixed(3)}%`, w/2, h - 5);
        });
    },

    engranajes: function(canvas, n1, n2, relacion) {
        if (!canvas.id) canvas.id = 'canvas_engranajes';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);

            const cy = h / 2;
            const r1 = Math.min(w * 0.15, 50);
            const r2 = r1 * (n2 / n1);
            const gap = 8;
            const x1 = w / 2 - r1 - gap;
            const x2 = w / 2 + r2 + gap;

            const speed1 = Date.now() * 0.003;
            const speed2 = -speed1 * (n1 / n2);

            ctx.strokeStyle = '#4f9cf9';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(x1, cy, r1, 0, Math.PI * 2); ctx.stroke();
            for (let i = 0; i < n1; i++) {
                const a = speed1 + (i / n1) * Math.PI * 2;
                ctx.strokeStyle = '#4f9cf9';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x1 + Math.cos(a) * (r1 - 4), cy + Math.sin(a) * (r1 - 4));
                ctx.lineTo(x1 + Math.cos(a) * (r1 + 4), cy + Math.sin(a) * (r1 + 4));
                ctx.stroke();
            }

            ctx.strokeStyle = '#a78bfa';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(x2, cy, r2, 0, Math.PI * 2); ctx.stroke();
            for (let i = 0; i < n2; i++) {
                const a = speed2 + (i / n2) * Math.PI * 2;
                ctx.strokeStyle = '#a78bfa';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x2 + Math.cos(a) * (r2 - 4), cy + Math.sin(a) * (r2 - 4));
                ctx.lineTo(x2 + Math.cos(a) * (r2 + 4), cy + Math.sin(a) * (r2 + 4));
                ctx.stroke();
            }

            ctx.fillStyle = '#e8edf5';
            ctx.font = '9px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(`N1 = ${n1}`, x1, cy + r1 + 15);
            ctx.fillText(`N2 = ${n2}`, x2, cy + r2 + 15);
            ctx.fillStyle = '#f9c74f';
            ctx.fillText(`R = ${relacion.toFixed(2)}:1`, w / 2, 20);
        });
    },

    energiaPotencial: function(canvas, m, h, ep) {
        if (!canvas.id) canvas.id = 'canvas_ep';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const hC = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, hC);

            const pad = 30;
            const groundY = hC - pad;
            const maxH = hC - 2 * pad;
            const scale = maxH / Math.max(h || 1, 1);
            const blockY = groundY - h * scale;
            const blockSize = 24;
            const osc = Math.sin(Date.now() * 0.002) * 2;

            ctx.fillStyle = '#374151';
            ctx.fillRect(pad, groundY, w - 2 * pad, 2);

            ctx.fillStyle = 'rgba(79,156,249,0.15)';
            ctx.fillRect(pad + 15, blockY + osc, blockSize, groundY - blockY);

            ctx.fillStyle = '#4f9cf9';
            ctx.fillRect(pad + 15, blockY + osc, blockSize, blockSize);

            ctx.fillStyle = '#f9c74f';
            ctx.beginPath();
            ctx.arc(pad + 15 + blockSize / 2, blockY + osc - 8, 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#e8edf5';
            ctx.font = '10px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(`Ep = ${ep.toFixed(1)} J`, w / 2, blockY + osc - 20);
            ctx.fillStyle = '#8a99ad';
            ctx.font = '8px JetBrains Mono';
            ctx.fillText(`m = ${m} kg  |  h = ${h} m`, w / 2, groundY + 14);
            ctx.fillText('Energía Potencial Gravitatoria', w / 2, pad - 8);
        });
    },

    cantidadMovimiento: function(canvas, m, v, p) {
        if (!canvas.id) canvas.id = 'canvas_cm';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);

            const cx = 60, cy = h / 2;
            const t = Date.now() * 0.002;
            const maxX = w - 80;
            const posX = cx + (Math.sin(t) * 0.5 + 0.5) * (maxX - cx);

            ctx.fillStyle = '#4f9cf9';
            ctx.fillRect(posX - 12, cy - 14, 24, 28);

            ctx.strokeStyle = '#f94f4f';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(posX + 14, cy);
            ctx.lineTo(posX + 50, cy);
            ctx.stroke();

            ctx.fillStyle = '#f94f4f';
            ctx.beginPath();
            ctx.moveTo(posX + 50, cy - 5);
            ctx.lineTo(posX + 56, cy);
            ctx.lineTo(posX + 50, cy + 5);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#e8edf5';
            ctx.font = '9px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(`p = ${p.toFixed(1)} kg·m/s`, w / 2, 18);
            ctx.fillStyle = '#8a99ad';
            ctx.font = '8px JetBrains Mono';
            ctx.fillText(`m = ${m} kg  |  v = ${v} m/s`, w / 2, h - 8);
            ctx.fillText('Cantidad de Movimiento', w / 2, 34);
        });
    },

    fuerzaCentrifuga: function(canvas, m, v, r, F) {
        if (!canvas.id) canvas.id = 'canvas_fc';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);

            const cx = w / 2, cy = h / 2;
            const maxR = Math.min(w, h) / 2.5;
            const scale = maxR / (r || 1);
            const sr = r * scale;
            const ang = Date.now() * 0.003 * (v / Math.max(r, 0.1));

            ctx.strokeStyle = 'rgba(79,156,249,0.2)';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.arc(cx, cy, sr, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);

            const px = cx + Math.cos(ang) * sr;
            const py = cy + Math.sin(ang) * sr;

            ctx.fillStyle = '#f9c74f';
            ctx.beginPath();
            ctx.arc(px, py, 6, 0, Math.PI * 2);
            ctx.fill();

            const outX = Math.cos(ang) * 40;
            const outY = Math.sin(ang) * 40;
            ctx.strokeStyle = '#f94f4f';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(px + outX, py + outY);
            ctx.stroke();

            ctx.fillStyle = '#f94f4f';
            ctx.beginPath();
            ctx.moveTo(px + outX, py + outY);
            ctx.lineTo(px + outX - 5, py + outY - 5);
            ctx.lineTo(px + outX + 5, py + outY - 5);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#e8edf5';
            ctx.font = '9px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(`Fc = ${F.toFixed(1)} N`, cx, cy - sr - 12);
            ctx.fillStyle = '#8a99ad';
            ctx.font = '8px JetBrains Mono';
            ctx.fillText(`m = ${m} kg  |  v = ${v} m/s  |  r = ${r} m`, cx, h - 8);
        });
    },

    velocidadTangencial: function(canvas, omega, r, v) {
        if (!canvas.id) canvas.id = 'canvas_vt';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);

            const cx = w / 2, cy = h / 2;
            const maxR = Math.min(w, h) / 2 - 30;
            const scale = maxR / (r || 1);
            const sr = r * scale;
            const ang = Date.now() * 0.004 * (omega / 10);

            ctx.strokeStyle = 'rgba(79,156,249,0.2)';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.arc(cx, cy, sr, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.strokeStyle = '#4f9cf9';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(ang) * sr, cy + Math.sin(ang) * sr);
            ctx.stroke();

            ctx.fillStyle = '#f9c74f';
            ctx.beginPath();
            ctx.arc(cx + Math.cos(ang) * sr, cy + Math.sin(ang) * sr, 4, 0, Math.PI * 2);
            ctx.fill();

            const tx = -Math.sin(ang);
            const ty = Math.cos(ang);
            const vLen = 35;
            ctx.strokeStyle = '#f94f4f';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(ang) * sr, cy + Math.sin(ang) * sr);
            ctx.lineTo(cx + Math.cos(ang) * sr + tx * vLen, cy + Math.sin(ang) * sr + ty * vLen);
            ctx.stroke();

            ctx.fillStyle = '#e8edf5';
            ctx.font = '10px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(`v = ${v.toFixed(2)} m/s`, cx + Math.cos(ang) * sr + tx * vLen / 2, cy + Math.sin(ang) * sr + ty * vLen / 2 - 8);
            ctx.fillStyle = '#8a99ad';
            ctx.font = '8px JetBrains Mono';
            ctx.fillText(`ω = ${omega} rad/s  |  r = ${r.toFixed(2)} m`, cx, h - 8);
        });
    },

    aceleracionAngular: function(canvas, w0, w1, t, alpha) {
        if (!canvas.id) canvas.id = 'canvas_aa';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);

            const cx = w / 2, cy = h / 2;
            const r = Math.min(w, h) / 2.5;
            const speed = Date.now() * 0.001;
            const ang = speed * (w0 + alpha * speed);

            ctx.strokeStyle = 'rgba(79,156,249,0.2)';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.strokeStyle = '#4f9cf9';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r);
            ctx.stroke();

            ctx.fillStyle = '#f9c74f';
            ctx.beginPath();
            ctx.arc(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r, 5, 0, Math.PI * 2);
            ctx.fill();

            const angAcc = ang + Math.PI / 4;
            const accLen = 30;
            ctx.strokeStyle = '#a78bfa';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(angAcc) * accLen, cy + Math.sin(angAcc) * accLen);
            ctx.stroke();

            ctx.fillStyle = '#e8edf5';
            ctx.font = '10px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(`α = ${alpha.toFixed(3)} rad/s²`, cx, 18);
            ctx.fillStyle = '#8a99ad';
            ctx.font = '8px JetBrains Mono';
            ctx.fillText(`ω₀ = ${w0} → ω₁ = ${w1} rad/s  |  Δt = ${t} s`, cx, 34);
            ctx.fillText('Aceleración Angular', cx, h - 8);
        });
    }
};