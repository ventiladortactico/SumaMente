window.FisicaVisual = window.FisicaVisual || {
    loops: {},

    initCanvas: function(canvas) {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        const cssW = rect.width || canvas.clientWidth || 300;
        const cssH = rect.height || canvas.clientHeight || 150;
        canvas.width = cssW * dpr;
        canvas.height = cssH * dpr;
        const ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        return ctx;
    },

    startLoop: function(canvasId, frameCallback) {
        if (this.loops[canvasId]) {
            cancelAnimationFrame(this.loops[canvasId]);
        }
        const run = () => {
            frameCallback();
            this.loops[canvasId] = requestAnimationFrame(run);
        };
        this.loops[canvasId] = requestAnimationFrame(run);
    },

    stopLoop: function(canvasId) {
        if (this.loops[canvasId]) {
            cancelAnimationFrame(this.loops[canvasId]);
            delete this.loops[canvasId];
        }
    },

    // ============================================================
    // Velocidad (MRUV) — gráfico v-t animado
    // ============================================================
    velocidad: function(canvas, v0, a, t) {
        if (!canvas.id) canvas.id = 'canvas_fis_vel';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);

            const pad = 35;
            const cw = w - 2 * pad;
            const ch = h - pad - 25;
            const vf = v0 + a * t;
            const maxV = Math.max(Math.abs(v0), Math.abs(vf), 1);

            // fondo
            ctx.fillStyle = 'rgba(79,156,249,0.06)';
            ctx.fillRect(0, 0, w, h);

            // ejes
            ctx.strokeStyle = '#4a5570';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(pad, pad);
            ctx.lineTo(pad, h - 25);
            ctx.lineTo(w - pad, h - 25);
            ctx.stroke();

            // etiquetas ejes
            ctx.fillStyle = '#8a99ad';
            ctx.font = '9px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText('t (s)', w / 2, h - 5);
            ctx.textAlign = 'left';
            ctx.fillText('v (m/s)', 5, pad + 10);

            // línea v-t
            const x0 = pad;
            const y0 = h - 25;
            const x1 = pad + cw;
            const y1 = y0 - (vf / maxV) * ch;

            ctx.strokeStyle = '#4f9cf9';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x0, y0 - (v0 / maxV) * ch);
            ctx.lineTo(x1, y1);
            ctx.stroke();

            // punto animado
            let elapsed = (Date.now() * 0.001) % (Math.max(t, 1) * 2);
            let tSim = elapsed > t ? t - (elapsed - t) : elapsed;
            let vSim = v0 + a * tSim;
            let px = pad + (tSim / Math.max(t, 1)) * cw;
            let py = y0 - (vSim / maxV) * ch;

            ctx.fillStyle = '#f94f4f';
            ctx.beginPath();
            ctx.arc(px, py, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#e8edf5';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // línea auxiliar vertical desde punto
            ctx.strokeStyle = '#f94f4f44';
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(px, y0);
            ctx.stroke();
            ctx.setLineDash([]);

            // valores
            ctx.fillStyle = '#e8edf5';
            ctx.font = 'bold 9px JetBrains Mono';
            ctx.textAlign = 'left';
            ctx.fillText('v₀ = ' + v0.toFixed(1) + ' m/s', pad, pad + 12);
            ctx.fillText('a = ' + a.toFixed(2) + ' m/s²', pad, pad + 26);
            ctx.fillStyle = '#4ff97b';
            ctx.fillText('vf = ' + vf.toFixed(1) + ' m/s', pad + cw - 80, pad + 12);
            ctx.fillStyle = '#f94f4f';
            ctx.textAlign = 'center';
            ctx.fillText('t = ' + tSim.toFixed(1) + ' s', px, y0 + 16);
        });
    },

    // ============================================================
    // Posición MRUV — gráfico x-t animado
    // ============================================================
    posicion: function(canvas, x0, v0, a, t) {
        if (!canvas.id) canvas.id = 'canvas_fis_pos';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);

            const pad = 35;
            const cw = w - 2 * pad;
            const ch = h - pad - 25;
            const xf = x0 + v0 * t + 0.5 * a * t * t;
            const maxX = Math.max(Math.abs(xf - x0), 1);

            ctx.fillStyle = 'rgba(79,249,123,0.06)';
            ctx.fillRect(0, 0, w, h);

            ctx.strokeStyle = '#4a5570';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(pad, pad);
            ctx.lineTo(pad, h - 25);
            ctx.lineTo(w - pad, h - 25);
            ctx.stroke();

            ctx.fillStyle = '#8a99ad';
            ctx.font = '9px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText('t (s)', w / 2, h - 5);
            ctx.textAlign = 'left';
            ctx.fillText('x (m)', 5, pad + 10);

            // parábola
            ctx.strokeStyle = '#38e8c8';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            for (let i = 0; i <= 60; i++) {
                const ti = (i / 60) * t;
                const xi = x0 + v0 * ti + 0.5 * a * ti * ti;
                const px = pad + (ti / Math.max(t, 1)) * cw;
                const py = (h - 25) - ((xi - x0) / maxX) * ch;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.stroke();

            // punto animado
            let elapsed = (Date.now() * 0.001) % (Math.max(t, 1) * 2);
            let tSim = elapsed > t ? t - (elapsed - t) : elapsed;
            let xSim = x0 + v0 * tSim + 0.5 * a * tSim * tSim;
            let px = pad + (tSim / Math.max(t, 1)) * cw;
            let py = (h - 25) - ((xSim - x0) / maxX) * ch;

            ctx.fillStyle = '#4ff97b';
            ctx.beginPath();
            ctx.arc(px, py, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#e8edf5';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.fillStyle = '#e8edf5';
            ctx.font = 'bold 9px JetBrains Mono';
            ctx.textAlign = 'left';
            ctx.fillText('x₀ = ' + x0.toFixed(1) + ' m', pad, pad + 12);
            ctx.fillText('v₀ = ' + v0.toFixed(1) + ' m/s', pad, pad + 26);
            ctx.fillText('a = ' + a.toFixed(2) + ' m/s²', pad, pad + 40);
            ctx.fillStyle = '#4ff97b';
            ctx.textAlign = 'right';
            ctx.fillText('xf = ' + xf.toFixed(1) + ' m', w - pad, pad + 12);
        });
    },

    // ============================================================
    // Fuerza (bloque con aceleración) — animación pulso
    // ============================================================
    fuerza: function(canvas, F, m, a) {
        if (!canvas.id) canvas.id = 'canvas_fis_fuerza';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);

            const grad = ctx.createLinearGradient(0, 0, w, h);
            grad.addColorStop(0, 'rgba(249,123,79,0.12)');
            grad.addColorStop(1, 'rgba(79,156,249,0.08)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            const cx = w / 2, cy = h / 2;
            const bs = 60;

            ctx.strokeStyle = '#4a5570';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(30, cy + bs / 2 + 20);
            ctx.lineTo(w - 30, cy + bs / 2 + 20);
            ctx.stroke();

            ctx.fillStyle = '#4f9cf9';
            ctx.fillRect(cx - bs / 2, cy - bs / 2, bs, bs);
            ctx.strokeStyle = '#e8edf5';
            ctx.lineWidth = 2;
            ctx.strokeRect(cx - bs / 2, cy - bs / 2, bs, bs);

            if (Math.abs(F) > 0.01) {
                let pulse = 1 + 0.08 * Math.sin(Date.now() * 0.005);
                let arrowLen = Math.min(Math.abs(F) * 2, 80) * pulse;
                let dir = F >= 0 ? 1 : -1;
                let start = cx + bs / 2;
                let end = start + arrowLen * dir;

                ctx.strokeStyle = '#f94f4f';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(start, cy);
                ctx.lineTo(end, cy);
                ctx.stroke();

                ctx.beginPath();
                ctx.fillStyle = '#f94f4f';
                let hs = 10;
                if (dir > 0) {
                    ctx.moveTo(end, cy);
                    ctx.lineTo(end - hs, cy - hs / 2);
                    ctx.lineTo(end - hs, cy + hs / 2);
                } else {
                    ctx.moveTo(end, cy);
                    ctx.lineTo(end + hs, cy - hs / 2);
                    ctx.lineTo(end + hs, cy + hs / 2);
                }
                ctx.closePath();
                ctx.fill();
            }

            ctx.fillStyle = '#e8edf5';
            ctx.font = 'bold 10px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText('F = ' + (F != null ? F.toFixed(1) : '?') + ' N', cx, cy - bs / 2 - 15);
            ctx.fillText('m = ' + (m != null ? m.toFixed(1) : '?') + ' kg', cx, cy + bs / 2 + 35);
            ctx.fillStyle = '#4ff97b';
            ctx.fillText('a = ' + (a != null ? a.toFixed(2) : '?') + ' m/s²', cx, cy + bs / 2 + 55);
        });
    },

    // ============================================================
    // Rozamiento — simulación física en tiempo real
    // ============================================================
    rozamiento: function(canvas, Fr, mu, N) {
        if (!canvas.id) canvas.id = 'canvas_fis_roz';
        if (!canvas._roz) {
            canvas._roz = { x: 0, v: 0, simT: 0 };
        }
        const st = canvas._roz;
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);

            const cy = h / 2, bs = 45, g = 9.81;
            const mass = N > 0 ? N / g : 1;
            const dt = 0.025;
            st.simT += dt;

            // Fuerza aplicada simulada (oscilante)
            const F_app = N * 0.35 * Math.sin(st.simT * 0.7) + N * 0.12;

            // Lógica de rozamiento
            const FrMax = mu * N;
            let F_fric = 0, moving = true;
            if (Math.abs(st.v) > 0.005) {
                F_fric = -Math.sign(st.v) * FrMax;
            } else {
                if (Math.abs(F_app) > FrMax) {
                    F_fric = -Math.sign(F_app) * FrMax;
                    st.v = 0.01 * Math.sign(F_app);
                } else {
                    F_fric = -F_app;
                    moving = false;
                }
            }

            const F_net = F_app + F_fric;
            const a = F_net / mass;
            st.v += a * dt;
            st.x += st.v * dt * 4;
            if (Math.abs(st.x) > 75) {
                st.x = Math.sign(st.x) * 75;
                st.v *= -0.3;
            }
            if (!moving && Math.abs(st.v) < 0.001) st.v = 0;

            const blockX = w / 2 + st.x;

            // Fondo
            ctx.fillStyle = 'rgba(249,123,79,0.06)';
            ctx.fillRect(0, 0, w, h);

            // Suelo con textura de rugosidad
            ctx.strokeStyle = '#4a5570';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(25, cy + bs/2 + 12);
            ctx.lineTo(w - 25, cy + bs/2 + 12);
            ctx.stroke();
            ctx.strokeStyle = mu > 0.3 ? '#f97b4f66' : '#4a557066';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let x = 25; x < w - 25; x += 6) {
                const d = Math.sin(x * 0.8 + st.simT) * mu * 4;
                ctx.moveTo(x, cy + bs/2 + 12);
                ctx.lineTo(x + 3, cy + bs/2 + 12 - d);
            }
            ctx.stroke();

            // Bloque animado
            ctx.fillStyle = '#4f9cf9';
            ctx.fillRect(blockX - bs/2, cy - bs/2, bs, bs);
            ctx.strokeStyle = '#e8edf5';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(blockX - bs/2, cy - bs/2, bs, bs);

            // Normal (↑)
            const pN = 1 + 0.04 * Math.sin(st.simT * 0.6);
            ctx.strokeStyle = '#4ff97b';
            ctx.lineWidth = 2.5 * pN;
            ctx.beginPath();
            ctx.moveTo(blockX, cy - bs/2);
            ctx.lineTo(blockX, cy - bs/2 - 38);
            ctx.stroke();
            ctx.fillStyle = '#4ff97b';
            ctx.beginPath();
            ctx.moveTo(blockX, cy - bs/2 - 44);
            ctx.lineTo(blockX - 5, cy - bs/2 - 34);
            ctx.lineTo(blockX + 5, cy - bs/2 - 34);
            ctx.closePath();
            ctx.fill();

            // Rozamiento (opuesto al movimiento)
            if (Math.abs(F_fric) > 0.1) {
                const dir = F_fric < 0 ? -1 : 1;
                ctx.strokeStyle = '#f97b4f';
                ctx.lineWidth = 3;
                const fStart = blockX + dir * bs/2;
                const fEnd = fStart + dir * Math.min(Math.abs(F_fric) * 0.4, 50);
                ctx.beginPath();
                ctx.moveTo(blockX - (bs/2) * Math.sign(F_fric), cy);
                ctx.lineTo(blockX - (bs/2) * Math.sign(F_fric) - 40 * Math.sign(F_fric), cy);
                ctx.stroke();
                ctx.fillStyle = '#f97b4f';
                ctx.beginPath();
                const ax = blockX - (bs/2 + 45) * Math.sign(F_fric);
                ctx.moveTo(ax, cy);
                ctx.lineTo(ax + 6 * Math.sign(F_fric), cy - 4);
                ctx.lineTo(ax + 6 * Math.sign(F_fric), cy + 4);
                ctx.closePath();
                ctx.fill();
            }

            // Fuerza aplicada (empuje)
            const pushDir = F_app >= 0 ? 1 : -1;
            ctx.strokeStyle = '#f94f4f';
            ctx.lineWidth = 2.5;
            const pStart = blockX + pushDir * bs/2;
            const pLen = Math.min(Math.abs(F_app) * 0.35, 50);
            const pEnd = pStart + pLen * pushDir;
            ctx.beginPath();
            ctx.moveTo(pStart, cy);
            ctx.lineTo(pEnd, cy);
            ctx.stroke();
            ctx.fillStyle = '#f94f4f';
            ctx.beginPath();
            const pxEnd = pEnd + 7 * pushDir;
            ctx.moveTo(pxEnd, cy);
            ctx.lineTo(pxEnd - 5 * pushDir, cy - 4);
            ctx.lineTo(pxEnd - 5 * pushDir, cy + 4);
            ctx.closePath();
            ctx.fill();

            // Indicador de movimiento
            if (Math.abs(st.v) > 0.01) {
                ctx.fillStyle = '#4ff97b88';
                ctx.font = '9px JetBrains Mono';
                ctx.textAlign = 'center';
                ctx.fillText('▶ en movimiento', blockX, cy + bs/2 + 35);
            } else if (Math.abs(F_app) > FrMax * 0.9 && Math.abs(F_app) <= FrMax) {
                ctx.fillStyle = '#f9c74f88';
                ctx.font = '9px JetBrains Mono';
                ctx.textAlign = 'center';
                ctx.fillText('● a punto de moverse', blockX, cy + bs/2 + 35);
            } else {
                ctx.fillStyle = '#8a99ad88';
                ctx.font = '9px JetBrains Mono';
                ctx.textAlign = 'center';
                ctx.fillText('■ en reposo', blockX, cy + bs/2 + 35);
            }

            // Información
            ctx.fillStyle = '#e8edf5';
            ctx.font = 'bold 9px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText('N = ' + N.toFixed(1) + ' N', blockX + 40, cy - bs/2 - 16);
            ctx.fillStyle = '#f97b4f';
            ctx.fillText('Fr = ' + (Fr || mu*N).toFixed(1) + ' N', blockX - bs/2 - 28, cy - 12);
            ctx.fillStyle = '#f94f4f';
            ctx.fillText('F_app = ' + F_app.toFixed(1) + ' N', blockX + bs/2 + 22, cy - 12);
            ctx.fillStyle = '#f9c74f';
            ctx.font = '9px JetBrains Mono';
            ctx.fillText('μ = ' + mu.toFixed(2), blockX, cy + bs/2 + 50);
            ctx.fillStyle = '#4ff97b';
            ctx.fillText('v = ' + st.v.toFixed(2) + ' m/s' + (Math.abs(F_net) > 0.01 ? '  |  a = ' + a.toFixed(1) + ' m/s²' : ''), blockX, h - 12);
        });
    },

    // ============================================================
    // Energía — animación dinámica con conversión KE/PE
    // ============================================================
    energia: function(canvas, Ec, Ep) {
        if (!canvas.id) canvas.id = 'canvas_fis_energia';
        if (!canvas._en) {
            canvas._en = { phase: 0 };
        }
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);

            const pad = 25;
            const cx = w / 2;
            const barAreaH = h - 70;
            const maxE = Math.max(Ec || 0.1, Ep || 0.1, 1);
            canvas._en.phase += 0.02;

            // Fondo
            ctx.fillStyle = 'rgba(79,249,123,0.06)';
            ctx.fillRect(0, 0, w, h);

            // Gráfico barras Ec (izquierda) / Ep (derecha)
            const barW = Math.min(40, w/6);
            const barMaxH = barAreaH - 50;

            // Barra Ec (cinética) — verde, animada
            const ecFrac = (Ec || 0) / maxE;
            const ecH = ecFrac * barMaxH;
            const ecX = cx - barW - 8;
            const ecBot = h - 35;
            const gEc = ctx.createLinearGradient(ecX, ecBot, ecX, ecBot - ecH);
            gEc.addColorStop(0, '#4ff97b');
            gEc.addColorStop(1, '#38e8c8');
            ctx.fillStyle = gEc;
            ctx.fillRect(ecX, ecBot - ecH, barW, ecH);
            ctx.strokeStyle = '#4ff97b44';
            ctx.lineWidth = 1;
            ctx.strokeRect(ecX, ecBot - ecH, barW, ecH);

            // Barra Ep (potencial) — azul, animada
            const epFrac = (Ep || 0) / maxE;
            const epH = epFrac * barMaxH;
            const epX = cx + 8;
            const gEp = ctx.createLinearGradient(epX, ecBot, epX, ecBot - epH);
            gEp.addColorStop(0, '#4f9cf9');
            gEp.addColorStop(1, '#a78bfa');
            ctx.fillStyle = gEp;
            ctx.fillRect(epX, ecBot - epH, barW, epH);
            ctx.strokeStyle = '#4f9cf944';
            ctx.lineWidth = 1;
            ctx.strokeRect(epX, ecBot - epH, barW, epH);

            // Etiquetas barras
            ctx.fillStyle = '#e8edf5';
            ctx.font = 'bold 9px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText('Ec', cx - barW/2 - 8, ecBot + 15);
            ctx.fillText('Ep', cx + barW/2 + 8, ecBot + 15);
            ctx.font = '8px JetBrains Mono';
            ctx.fillStyle = '#4ff97b';
            ctx.fillText((Ec || 0).toFixed(1) + ' J', cx - barW/2 - 8, ecBot - ecH - 5);
            ctx.fillStyle = '#4f9cf9';
            ctx.fillText((Ep || 0).toFixed(1) + ' J', cx + barW/2 + 8, ecBot - epH - 5);

            // Esfera animada que representa la energía total
            const ballR = 12;
            const ballYoff = (epFrac - ecFrac) * 25;
            const ballY = h/2 - 25 + ballYoff;

            // Sombra
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.beginPath();
            ctx.ellipse(cx, ballY + ballR + 5, ballR * 0.6, 3, 0, 0, Math.PI * 2);
            ctx.fill();

            // Cuerpo de la esfera
            const gradBall = ctx.createRadialGradient(cx - 3, ballY - 3, 1, cx, ballY, ballR);
            gradBall.addColorStop(0, '#ffffff');
            gradBall.addColorStop(0.3, Ep > Ec ? '#4f9cf9' : '#4ff97b');
            gradBall.addColorStop(1, Ep > Ec ? '#2a5a8a' : '#2a8a4a');
            ctx.fillStyle = gradBall;
            ctx.beginPath();
            ctx.arc(cx, ballY, ballR, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#e8edf5';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Etiqueta de energía total
            const totalE = (Ec || 0) + (Ep || 0);
            ctx.fillStyle = '#f9c74f';
            ctx.font = 'bold 9px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText('E_total = ' + totalE.toFixed(1) + ' J', cx, pad + 12);

            // Indicador de qué energía predomina
            ctx.font = '8px JetBrains Mono';
            if (Ec > Ep) {
                ctx.fillStyle = '#4ff97b88';
                ctx.fillText('Predomina Ec (movimiento)', cx, pad + 28);
            } else if (Ep > Ec) {
                ctx.fillStyle = '#4f9cf988';
                ctx.fillText('Predomina Ep (altura)', cx, pad + 28);
            } else {
                ctx.fillStyle = '#f9c74f88';
                ctx.fillText('Equilibrio Ec = Ep', cx, pad + 28);
            }

            // Línea de suelo de referencia
            ctx.strokeStyle = '#4a557044';
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(pad, ecBot);
            ctx.lineTo(w - pad, ecBot);
            ctx.stroke();
            ctx.setLineDash([]);
        });
    },

    // ============================================================
    // Movimiento Parabólico — proyectil animado con tiempo real
    // ============================================================
    movimientoParabolico: function(canvas, v0, angulo, g) {
        if (!canvas.id) canvas.id = 'canvas_fis_parab';
        const theta = angulo * Math.PI / 180;
        const v0x = v0 * Math.cos(theta);
        const v0y = v0 * Math.sin(theta);
        const tTotal = (2 * v0y) / g;
        const xMax = v0x * tTotal;
        const yMax = (v0y * v0y) / (2 * g);

        if (tTotal <= 0.001 || xMax <= 0.001 || yMax <= 0.001) {
            this.stopLoop(canvas.id);
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = '#8a99ad';
            ctx.font = '11px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText('Trayectoria no válida con estos parámetros', w / 2, h / 2);
            return;
        }

        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);

            const pad = 30;
            const cw = w - 2 * pad;
            const ch = h - pad - 25;

            ctx.fillStyle = 'rgba(79,156,249,0.06)';
            ctx.fillRect(0, 0, w, h);

            ctx.strokeStyle = '#4a5570';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(pad, h - 25);
            ctx.lineTo(w - pad, h - 25);
            ctx.stroke();

            // trayectoria completa punteada
            ctx.setLineDash([3, 4]);
            ctx.strokeStyle = '#8a99ad';
            ctx.lineWidth = 1;
            ctx.beginPath();
            let first = true;
            for (let i = 0; i <= 60; i++) {
                const ti = (i / 60) * tTotal;
                const x = v0x * ti;
                const y = v0y * ti - 0.5 * g * ti * ti;
                const px = pad + (x / xMax) * cw;
                const py = (h - 25) - (y / yMax) * ch;
                if (first) { ctx.moveTo(px, py); first = false; }
                else ctx.lineTo(px, py);
            }
            ctx.stroke();
            ctx.setLineDash([]);

            // animación síncrona con tTotal
            let elapsed = (Date.now() * 0.001) % (tTotal * 2);
            let tSim = elapsed > tTotal ? tTotal - (elapsed - tTotal) : elapsed;
            let xSim = v0x * tSim;
            let ySim = v0y * tSim - 0.5 * g * tSim * tSim;
            let px = pad + (xSim / xMax) * cw;
            let py = (h - 25) - (ySim / yMax) * ch;

            // trayectoria hasta tSim
            ctx.strokeStyle = '#f9c74f';
            ctx.lineWidth = 3;
            ctx.beginPath();
            let first2 = true;
            for (let i = 0; i <= 60; i++) {
                const ti = (i / 60) * tSim;
                const x = v0x * ti;
                const y = v0y * ti - 0.5 * g * ti * ti;
                const ppx = pad + (x / xMax) * cw;
                const ppy = (h - 25) - (y / yMax) * ch;
                if (first2) { ctx.moveTo(ppx, ppy); first2 = false; }
                else ctx.lineTo(ppx, ppy);
            }
            ctx.stroke();

            // proyectil
            ctx.fillStyle = '#f94f4f';
            ctx.beginPath();
            ctx.arc(px, py, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#e8edf5';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.fillStyle = '#e8edf5';
            ctx.font = '9px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText('v₀ = ' + v0.toFixed(1) + ' m/s  |  θ = ' + angulo + '°', w / 2, 16);
            ctx.fillStyle = '#4ff97b';
            ctx.fillText('x_max = ' + xMax.toFixed(1) + ' m  |  t = ' + tSim.toFixed(1) + '/' + tTotal.toFixed(1) + ' s', w / 2, 32);
        });
    },

    // ============================================================
    // Trabajo — bloque empujado + acumulador animado
    // ============================================================
    trabajo: function(canvas, fuerza, distancia, trabajo) {
        if (!canvas.id) canvas.id = 'canvas_fis_trabajo';
        if (distancia == null || isNaN(distancia) || Math.abs(distancia) < 0.001) {
            this.stopLoop(canvas.id);
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = '#8a99ad';
            ctx.font = '11px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText('Distancia = 0: no hay desplazamiento visual', w / 2, h / 2);
            return;
        }
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);

            const pad = 20;
            const ch = h - 60;
            const bs = 45;
            const cy = h / 2;

            ctx.fillStyle = 'rgba(79,156,249,0.06)';
            ctx.fillRect(0, 0, w, h);

            // regla/suelo
            ctx.strokeStyle = '#4a5570';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(pad, cy + bs / 2 + 15);
            ctx.lineTo(w - pad, cy + bs / 2 + 15);
            ctx.stroke();

            // marcas de distancia
            ctx.fillStyle = '#4a5570';
            ctx.font = '7px JetBrains Mono';
            ctx.textAlign = 'center';
            let maxDist = Math.max(Math.abs(distancia), 1);
            let startX = pad + 20;
            let endX = w - pad - 20;
            let travel = Math.min(Math.abs(distancia) * 15, endX - startX);
            for (let m = 0; m <= Math.min(Math.abs(distancia), 10); m++) {
                let mx = startX + (m / Math.max(Math.abs(distancia), 1)) * travel;
                ctx.beginPath();
                ctx.moveTo(mx, cy + bs / 2 + 15);
                ctx.lineTo(mx, cy + bs / 2 + 22);
                ctx.stroke();
                ctx.fillText(m + 'm', mx, cy + bs / 2 + 30);
            }

            // bloque animado
            let elapsed = (Date.now() * 0.001) % 4;
            let tSim = elapsed > 2 ? 2 - (elapsed - 2) : elapsed;
            let pct = Math.min(1, tSim / 2);
            let bx = startX + pct * travel;

            let dir = distancia >= 0 ? 1 : -1;
            let actualBx = dir > 0 ? bx : startX + travel - (bx - startX);

            ctx.fillStyle = '#4f9cf9';
            ctx.fillRect(actualBx - bs / 2, cy - bs / 2, bs, bs);
            ctx.strokeStyle = '#e8edf5';
            ctx.lineWidth = 2;
            ctx.strokeRect(actualBx - bs / 2, cy - bs / 2, bs, bs);

            // flecha de fuerza
            if (Math.abs(fuerza) > 0.01) {
                let pulse = 1 + 0.08 * Math.sin(Date.now() * 0.005);
                let fLen = Math.min(Math.abs(fuerza) * 1.5, 50) * pulse;
                let fDir = fuerza >= 0 ? 1 : -1;
                let fs = actualBx + bs / 2;
                let fe = fs + fLen * fDir;

                ctx.strokeStyle = '#f94f4f';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(fs, cy);
                ctx.lineTo(fe, cy);
                ctx.stroke();
                ctx.beginPath();
                ctx.fillStyle = '#f94f4f';
                let hs = 8;
                if (fDir > 0) {
                    ctx.moveTo(fe, cy);
                    ctx.lineTo(fe - hs, cy - hs / 2);
                    ctx.lineTo(fe - hs, cy + hs / 2);
                } else {
                    ctx.moveTo(fe, cy);
                    ctx.lineTo(fe + hs, cy - hs / 2);
                    ctx.lineTo(fe + hs, cy + hs / 2);
                }
                ctx.closePath();
                ctx.fill();
            }

            // W acumulado
            let Wsim = fuerza * pct * Math.abs(distancia);
            ctx.fillStyle = '#e8edf5';
            ctx.font = 'bold 10px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText('F = ' + (fuerza != null ? fuerza.toFixed(1) : '0') + ' N', w / 2, pad + 12);
            ctx.fillText('d = ' + (distancia != null ? Math.abs(distancia).toFixed(1) : '0') + ' m', w / 2, pad + 28);
            ctx.fillStyle = '#4ff97b';
            ctx.fillText('W = ' + Wsim.toFixed(1) + ' J  (total: ' + (trabajo || 0).toFixed(1) + ' J)', w / 2, h - 10);
        });
    },

    // ============================================================
    // Leyes de Newton — animaciones interactivas para las 3 leyes
    // ============================================================
    newton: function(canvas, masa, fuerza, tipo, velocidad) {
        if (!canvas.id) canvas.id = 'canvas_fis_newton';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);

            const cx = w / 2, cy = h / 2, bs = 45;
            const t = Date.now() * 0.001;

            ctx.fillStyle = 'rgba(79,156,249,0.08)';
            ctx.fillRect(0, 0, w, h);

            if (tipo === '1') {
                // Ley 1: Inercia — bloque deslizándose a velocidad constante
                const maxDist = (w / 2 - 50);
                const v = velocidad || 5;
                const xPos = ((t * v * 20) % (maxDist * 2));
                const blockX = cx - maxDist + (xPos > maxDist ? maxDist * 2 - xPos : xPos);

                ctx.strokeStyle = '#4a5570';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(30, cy + bs/2 + 15);
                ctx.lineTo(w - 30, cy + bs/2 + 15);
                ctx.stroke();

                // Superficie sin roce (lisa)
                ctx.fillStyle = '#4a557033';
                ctx.fillRect(30, cy + bs/2 + 15, w - 60, 3);

                // Bloque
                ctx.fillStyle = '#a78bfa';
                ctx.fillRect(blockX - bs/2, cy - bs/2, bs, bs);
                ctx.strokeStyle = '#e8edf5';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(blockX - bs/2, cy - bs/2, bs, bs);

                // Vector velocidad (→)
                ctx.strokeStyle = '#4ff97b';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(blockX + bs/2, cy);
                ctx.lineTo(blockX + bs/2 + 40, cy);
                ctx.stroke();
                ctx.fillStyle = '#4ff97b';
                ctx.beginPath();
                ctx.moveTo(blockX + bs/2 + 46, cy);
                ctx.lineTo(blockX + bs/2 + 38, cy - 4);
                ctx.lineTo(blockX + bs/2 + 38, cy + 4);
                ctx.closePath();
                ctx.fill();

                ctx.fillStyle = '#e8edf5';
                ctx.font = 'bold 9px JetBrains Mono';
                ctx.textAlign = 'center';
                ctx.fillText('ΣF = 0  →  v = ' + v.toFixed(1) + ' m/s (constante)', cx, cy - bs/2 - 15);
                ctx.fillStyle = '#a78bfa';
                ctx.font = '8px JetBrains Mono';
                ctx.fillText('m = ' + masa.toFixed(1) + ' kg', cx, cy + bs/2 + 35);
                ctx.fillStyle = '#8a99ad';
                ctx.fillText('Sin rozamiento — Ley de Inercia', cx, h - 12);

            } else if (tipo === '3') {
                // Ley 3: Acción-Reacción — dos bloques empujándose
                const pulse = 1 + 0.06 * Math.sin(t * 0.8);
                const gap = 10 + 5 * Math.sin(t * 0.6);

                ctx.strokeStyle = '#4a5570';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(30, cy + bs/2 + 15);
                ctx.lineTo(w - 30, cy + bs/2 + 15);
                ctx.stroke();

                // Bloque A (izquierda)
                const ax = cx - gap/2 - bs;
                ctx.fillStyle = '#f94f4f';
                ctx.fillRect(ax, cy - bs/2, bs, bs);
                ctx.strokeStyle = '#e8edf5';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(ax, cy - bs/2, bs, bs);
                ctx.fillStyle = '#e8edf5';
                ctx.font = 'bold 8px JetBrains Mono';
                ctx.textAlign = 'center';
                ctx.fillText('A', ax + bs/2, cy + 3);

                // Bloque B (derecha)
                const bx = cx + gap/2;
                ctx.fillStyle = '#4f9cf9';
                ctx.fillRect(bx, cy - bs/2, bs, bs);
                ctx.strokeStyle = '#e8edf5';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(bx, cy - bs/2, bs, bs);
                ctx.fillStyle = '#e8edf5';
                ctx.font = 'bold 8px JetBrains Mono';
                ctx.textAlign = 'center';
                ctx.fillText('B', bx + bs/2, cy + 3);

                // Fuerza de A sobre B (→)
                const fVal = Math.abs(fuerza || 100);
                const fLen = Math.min(fVal * 0.3, 40) * pulse;
                ctx.strokeStyle = '#f94f4f';
                ctx.lineWidth = 3 * pulse;
                ctx.beginPath();
                ctx.moveTo(ax + bs/2, cy - 12);
                ctx.lineTo(ax + bs/2 + gap + fLen, cy - 12);
                ctx.stroke();
                ctx.fillStyle = '#f94f4f';
                ctx.beginPath();
                ctx.moveTo(ax + bs/2 + gap + fLen + 5, cy - 12);
                ctx.lineTo(ax + bs/2 + gap + fLen - 3, cy - 16);
                ctx.lineTo(ax + bs/2 + gap + fLen - 3, cy - 8);
                ctx.closePath();
                ctx.fill();

                // Fuerza de B sobre A (←)
                ctx.strokeStyle = '#4f9cf9';
                ctx.lineWidth = 3 * pulse;
                ctx.beginPath();
                ctx.moveTo(bx, cy + 12);
                ctx.lineTo(bx - gap - fLen, cy + 12);
                ctx.stroke();
                ctx.fillStyle = '#4f9cf9';
                ctx.beginPath();
                ctx.moveTo(bx - gap - fLen - 5, cy + 12);
                ctx.lineTo(bx - gap - fLen + 3, cy + 8);
                ctx.lineTo(bx - gap - fLen + 3, cy + 16);
                ctx.closePath();
                ctx.fill();

                ctx.fillStyle = '#e8edf5';
                ctx.font = 'bold 9px JetBrains Mono';
                ctx.textAlign = 'center';
                ctx.fillText('F_A→B = ' + fVal.toFixed(1) + ' N  |  F_B→A = ' + fVal.toFixed(1) + ' N', cx, cy - bs/2 - 15);
                ctx.fillStyle = '#8a99ad';
                ctx.font = '8px JetBrains Mono';
                ctx.fillText('Sobre cuerpos distintos — no se cancelan', cx, cy + bs/2 + 35);
                ctx.fillStyle = '#f94f4f88';
                ctx.fillText('A empuja a B', cx - bs - gap/2, cy + bs/2 + 35);
                ctx.fillStyle = '#4f9cf988';
                ctx.fillText('B empuja a A', cx + bs + gap/2, cy + bs/2 + 35);

            } else {
                // Ley 2: F = m·a — bloque con fuerza según la variable calculada
                const esFuerza = tipo === '2_f';
                const esMasa = tipo === '2_m';
                const esAcel = tipo === '2_a';
                const pulse = 1 + 0.08 * Math.sin(t * 0.5);

                ctx.strokeStyle = '#4a5570';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(30, cy + bs/2 + 15);
                ctx.lineTo(w - 30, cy + bs/2 + 15);
                ctx.stroke();

                // Bloque
                const colorBloque = esFuerza ? '#f94f4f' : (esMasa ? '#4ff97b' : '#4f9cf9');
                ctx.fillStyle = colorBloque;
                ctx.fillRect(cx - bs/2, cy - bs/2, bs, bs);
                ctx.strokeStyle = '#e8edf5';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(cx - bs/2, cy - bs/2, bs, bs);

                // Destacar la incógnita con un glow si hay resultado
                const resaltado = esFuerza ? fuerza : (esMasa ? masa : (fuerza && masa ? fuerza/masa : 0));
                if (resaltado) {
                    ctx.shadowColor = colorBloque;
                    ctx.shadowBlur = 12 + 4 * Math.sin(t * 0.8);
                }

                // Fuerza (→) animada con latido
                if (fuerza != null) {
                    ctx.strokeStyle = '#f94f4f';
                    ctx.lineWidth = 3 * pulse;
                    ctx.beginPath();
                    ctx.moveTo(cx + bs/2, cy);
                    ctx.lineTo(cx + bs/2 + Math.min(Math.abs(fuerza) * 0.4, 55) * pulse, cy);
                    ctx.stroke();
                    ctx.fillStyle = '#f94f4f';
                    const fEnd = cx + bs/2 + Math.min(Math.abs(fuerza) * 0.4, 55) * pulse + 6;
                    ctx.beginPath();
                    ctx.moveTo(fEnd, cy);
                    ctx.lineTo(fEnd - 5, cy - 4);
                    ctx.lineTo(fEnd - 5, cy + 4);
                    ctx.closePath();
                    ctx.fill();
                }

                ctx.shadowBlur = 0;

                // Valores — el resultado calculado se muestra en tamaño mayor
                ctx.fillStyle = '#e8edf5';
                ctx.font = (esFuerza ? 'bold 13px' : 'bold 9px') + ' JetBrains Mono';
                ctx.textAlign = 'center';
                ctx.fillText('F = ' + (fuerza || 0).toFixed(1) + ' N', cx, cy - bs/2 - 15);
                ctx.fillStyle = '#4ff97b';
                ctx.font = (esMasa ? 'bold 13px' : 'bold 9px') + ' JetBrains Mono';
                ctx.fillText('m = ' + (masa || 0).toFixed(1) + ' kg', cx, cy + bs/2 + 35);
                const acc = fuerza && masa ? fuerza / masa : 0;
                ctx.fillStyle = '#f9c74f';
                ctx.font = (esAcel ? 'bold 13px' : 'bold 9px') + ' JetBrains Mono';
                ctx.fillText('a = ' + acc.toFixed(1) + ' m/s²', cx, cy + bs/2 + 50);
                ctx.fillStyle = '#8a99ad';
                ctx.font = '8px JetBrains Mono';
                ctx.fillText('F = m · a  (2ª Ley)', cx, h - 12);
            }
        });
    },

    // ============================================================
    // Gravedad — caída, vertical y parabólico con tiempos reales
    // ============================================================
    gravedad: function(canvas, tipo, v0, angulo, g, tiempoCalculado) {
        if (!canvas.id) canvas.id = 'canvas_fis_grav';
        g = g || 9.81;

        const esCaida = tipo === 'caida_h' || tipo === 'caida_t' || tipo === 'caida';
        const esVertical = tipo === 'vertical_h' || tipo === 'vertical_v0' || tipo === 'vertical_t' || tipo === 'vertical';
        const esParabolico = tipo === 'parabolico' || tipo === 'parabolico_x' || tipo === 'parabolico_v0' || tipo === 'parabolico_a';

        const tCalculado = (function() {
            if (esCaida) return Math.max(tiempoCalculado || g, 0.1);
            if (esVertical) return (2 * (v0 || 0)) / g;
            if (esParabolico) {
                const rad = (angulo || 45) * Math.PI / 180;
                return (2 * (v0 || 0) * Math.sin(rad)) / g;
            }
            return 1;
        })();

        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);

            const pad = 20;
            const groundY = h - 30;

            ctx.fillStyle = 'rgba(79,156,249,0.08)';
            ctx.fillRect(0, 0, w, h);

            ctx.strokeStyle = '#4a5570';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(pad, groundY);
            ctx.lineTo(w - pad, groundY);
            ctx.stroke();

            if (esCaida) {
                let maxT = tCalculado;
                let tNormalized = ((Date.now() * 0.001) % (maxT * 2));
                let tEff = tNormalized > maxT ? maxT - (tNormalized - maxT) : tNormalized;
                let fallDist = 0.5 * g * tEff * tEff;
                let maxFall = 0.5 * g * maxT * maxT;
                let pct = Math.min(1, fallDist / (maxFall || 1));
                let topY = pad + 20;
                let range = groundY - 15 - topY;
                let objY = topY + pct * range;

                // Línea de altura punteada
                ctx.strokeStyle = '#f9c74f44';
                ctx.lineWidth = 1.5;
                ctx.setLineDash([3, 5]);
                ctx.beginPath();
                ctx.moveTo(w / 2 - 20, topY);
                ctx.lineTo(w / 2 + 20, topY);
                ctx.stroke();
                ctx.setLineDash([]);

                // Marcas de altura
                ctx.fillStyle = '#f9c74f44';
                ctx.font = '7px JetBrains Mono';
                ctx.textAlign = 'left';
                ctx.fillText('h = ' + maxFall.toFixed(1) + ' m', w / 2 + 12, topY + 4);

                // Ball
                const gradBall = ctx.createRadialGradient(w/2 - 2, objY - 2, 1, w/2, objY, 8);
                gradBall.addColorStop(0, '#ffffff');
                gradBall.addColorStop(0.3, '#f9c74f');
                gradBall.addColorStop(1, '#e8941a');
                ctx.fillStyle = gradBall;
                ctx.beginPath();
                ctx.arc(w / 2, objY, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#e8edf5';
                ctx.lineWidth = 1.5;
                ctx.stroke();

                // Sombra en el suelo
                ctx.fillStyle = 'rgba(0,0,0,0.2)';
                ctx.beginPath();
                ctx.ellipse(w/2, groundY - 2, 10, 3, 0, 0, Math.PI * 2);
                ctx.fill();

                // Línea desde el objeto hasta el suelo (trayectoria)
                ctx.strokeStyle = '#f9c74f22';
                ctx.lineWidth = 1;
                ctx.setLineDash([2, 4]);
                ctx.beginPath();
                ctx.moveTo(w/2, objY);
                ctx.lineTo(w/2, groundY - 5);
                ctx.stroke();
                ctx.setLineDash([]);

                ctx.fillStyle = '#e8edf5';
                ctx.font = 'bold 10px JetBrains Mono';
                ctx.textAlign = 'center';
                ctx.fillText('CAÍDA LIBRE', w / 2, 16);
                ctx.fillStyle = '#4ff97b';
                ctx.font = '9px JetBrains Mono';
                ctx.fillText('g = ' + g.toFixed(2) + ' m/s²', w / 2, 34);

                // Velocidad instantánea
                const v_inst = g * tEff;
                ctx.fillStyle = '#f94f4f';
                ctx.fillText('v = ' + v_inst.toFixed(2) + ' m/s', w / 2, objY - 14);
                ctx.fillStyle = '#f9c74f';
                ctx.fillText('t = ' + tEff.toFixed(2) + ' / ' + maxT.toFixed(2) + ' s  |  h = ' + fallDist.toFixed(1) + ' m', w / 2, h - 8);

            } else if (esVertical) {
                if (v0 == null || isNaN(v0)) v0 = 20;
                let maxT = tCalculado > 0.01 && isFinite(tCalculado) ? tCalculado : 4;
                let tNormalized = ((Date.now() * 0.001) % (maxT * 2));
                let tEff = tNormalized > maxT ? maxT - (tNormalized - maxT) : tNormalized;
                let yPos = v0 * tEff - 0.5 * g * tEff * tEff;
                let yMax = (v0 * v0) / (2 * g);
                let chartH = groundY - pad - 20;
                let pct = yPos / (yMax || 1);
                let objY = groundY - 10 - pct * chartH;
                if (objY > groundY - 10) objY = groundY - 10;
                if (objY < pad + 10) objY = pad + 10;

                const gradBall = ctx.createRadialGradient(w/2 - 2, objY - 2, 1, w/2, objY, 8);
                gradBall.addColorStop(0, '#ffffff');
                gradBall.addColorStop(0.3, '#f9c74f');
                gradBall.addColorStop(1, '#e8941a');
                ctx.fillStyle = gradBall;
                ctx.beginPath();
                ctx.arc(w / 2, objY, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#e8edf5';
                ctx.lineWidth = 1.5;
                ctx.stroke();

                ctx.fillStyle = '#e8edf5';
                ctx.font = 'bold 10px JetBrains Mono';
                ctx.textAlign = 'center';
                ctx.fillText('LANZAMIENTO VERTICAL', w / 2, 16);
                ctx.fillStyle = '#4ff97b';
                ctx.font = '9px JetBrains Mono';
                ctx.fillText('g = ' + g.toFixed(2) + ' m/s²  |  v₀ = ' + v0.toFixed(1) + ' m/s', w / 2, 34);
                ctx.fillStyle = '#f9c74f';
                ctx.fillText('t = ' + tEff.toFixed(2) + ' s  |  y = ' + yPos.toFixed(1) + ' m', w / 2, h - 8);

            } else if (esParabolico) {
                if (v0 == null || isNaN(v0)) v0 = 20;
                if (angulo == null || isNaN(angulo)) angulo = 45;
                let maxT = tCalculado > 0.01 && isFinite(tCalculado) ? tCalculado : 4;
                const rad = angulo * Math.PI / 180;
                const v0x = v0 * Math.cos(rad);
                const v0y = v0 * Math.sin(rad);
                const xMax = v0x * maxT;

                let tNormalized = ((Date.now() * 0.001) % (maxT * 2));
                let tEff = tNormalized > maxT ? maxT - (tNormalized - maxT) : tNormalized;
                let xPos = v0x * tEff;
                let yPos = v0y * tEff - 0.5 * g * tEff * tEff;
                let yMaxAlt = (v0y * v0y) / (2 * g);
                let cw = w - 2 * pad - 20;
                let chartH = groundY - pad - 20;
                let px = pad + 10 + (xPos / (xMax || 1)) * cw;
                let py = groundY - 10 - (yPos / (yMaxAlt || 1)) * chartH;
                if (py > groundY - 10) py = groundY - 10;

                // Trayectoria punteada completa
                ctx.setLineDash([3, 4]);
                ctx.strokeStyle = '#8a99ad';
                ctx.lineWidth = 1;
                ctx.beginPath();
                let first = true;
                for (let i = 0; i <= 60; i++) {
                    const ti = (i / 60) * maxT;
                    const xi = v0x * ti;
                    const yi = v0y * ti - 0.5 * g * ti * ti;
                    const ppx = pad + 10 + (xi / (xMax || 1)) * cw;
                    const ppy = groundY - 10 - (yi / (yMaxAlt || 1)) * chartH;
                    if (first) { ctx.moveTo(ppx, ppy); first = false; }
                    else ctx.lineTo(ppx, ppy);
                }
                ctx.stroke();
                ctx.setLineDash([]);

                const gradBall = ctx.createRadialGradient(px - 2, py - 2, 1, px, py, 7);
                gradBall.addColorStop(0, '#ffffff');
                gradBall.addColorStop(0.3, '#f9c74f');
                gradBall.addColorStop(1, '#e8941a');
                ctx.fillStyle = gradBall;
                ctx.beginPath();
                ctx.arc(px, py, 7, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#e8edf5';
                ctx.lineWidth = 1.5;
                ctx.stroke();

                ctx.fillStyle = '#e8edf5';
                ctx.font = 'bold 10px JetBrains Mono';
                ctx.textAlign = 'center';
                ctx.fillText('MOVIMIENTO PARABÓLICO', w / 2, 16);
                ctx.fillStyle = '#4ff97b';
                ctx.font = '9px JetBrains Mono';
                ctx.fillText('g = ' + g.toFixed(2) + ' m/s²  |  θ = ' + angulo + '°', w / 2, 34);
                ctx.fillStyle = '#f9c74f';
                ctx.fillText('t = ' + tEff.toFixed(2) + ' s  |  v₀ = ' + v0.toFixed(1) + ' m/s', w / 2, h - 8);
            }
        });
    },

    // ============================================================
    // Resorte (MAS) — oscilación animada
    // ============================================================
    resorte: function(canvas, k, masa, amplitud, amortiguado) {
        if (!canvas.id) canvas.id = 'canvas_fis_resorte';
        const omega = Math.sqrt(k / masa);
        if (canvas._resT == null) canvas._resT = 0;

        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);

            ctx.fillStyle = 'rgba(249,199,79,0.08)';
            ctx.fillRect(0, 0, w, h);

            const cx = w / 2, cy = h / 2;
            let x = amplitud * Math.cos(omega * canvas._resT);
            if (amortiguado) {
                x = x * Math.exp(-0.15 * canvas._resT);
            }

            ctx.fillStyle = '#4a5570';
            ctx.fillRect(30, cy - 40, 10, 80);

            ctx.strokeStyle = '#f9c74f';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(40, cy);
            const coils = 10;
            const springLen = cx - 40 + x;
            const coilW = springLen / coils;
            for (let i = 0; i <= coils; i++) {
                const ppx = 40 + i * coilW;
                const ppy = cy + (i % 2 === 0 ? 0 : (i % 4 === 1 ? -15 : 15));
                if (i === 0) ctx.moveTo(ppx, ppy);
                else ctx.lineTo(ppx, ppy);
            }
            ctx.stroke();

            ctx.fillStyle = '#4f9cf9';
            ctx.fillRect(cx + x - 20, cy - 20, 40, 40);
            ctx.strokeStyle = '#e8edf5';
            ctx.lineWidth = 2;
            ctx.strokeRect(cx + x - 20, cy - 20, 40, 40);

            ctx.fillStyle = '#e8edf5';
            ctx.font = '10px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText('k = ' + k.toFixed(1) + ' N/m', cx, 16);
            ctx.fillText('m = ' + masa.toFixed(1) + ' kg', cx, 32);
            ctx.fillText('A = ' + amplitud.toFixed(2) + ' m', cx, 48);

            canvas._resT += 0.025;
        });
    },

    // ============================================================
    // Ondas — transversal y longitudinal animadas
    // ============================================================
    ondas: function(canvas, tipo, longitudOnda, amplitud, frecuencia) {
        if (!canvas.id) canvas.id = 'canvas_fis_ondas';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);

            ctx.fillStyle = 'rgba(79,156,249,0.08)';
            ctx.fillRect(0, 0, w, h);

            const cy = h / 2;
            const pad = 20;
            const cw = w - 2 * pad;
            const time = Date.now() * 0.003 * (frecuencia || 1);
            const lambda = Math.max(longitudOnda * 20, 30);
            const amp = Math.max(Math.min(amplitud, h / 2.5), 2);

            if (tipo === 'transversal') {
                ctx.strokeStyle = '#4a5570';
                ctx.lineWidth = 1;
                ctx.setLineDash([3, 4]);
                ctx.beginPath();
                ctx.moveTo(pad, cy);
                ctx.lineTo(w - pad, cy);
                ctx.stroke();
                ctx.setLineDash([]);

                ctx.strokeStyle = '#a78bfa';
                ctx.lineWidth = 3;
                ctx.beginPath();
                for (let x = 0; x < cw; x++) {
                    const phase = (x / lambda) * Math.PI * 2 - time;
                    const y = cy + Math.sin(phase) * amp;
                    if (x === 0) ctx.moveTo(pad + x, y);
                    else ctx.lineTo(pad + x, y);
                }
                ctx.stroke();

                ctx.fillStyle = '#e8edf5';
                ctx.font = '9px JetBrains Mono';
                ctx.textAlign = 'center';
                ctx.fillText('λ = ' + longitudOnda.toFixed(2) + ' m', w / 2, 16);
                ctx.fillText('f = ' + frecuencia.toFixed(1) + ' Hz', w / 2, 32);
                ctx.textAlign = 'left';
                ctx.fillStyle = '#8a99ad';
                ctx.fillText('TRANSVERSAL', pad, h - 10);
            } else {
                ctx.textAlign = 'left';
                ctx.fillStyle = '#8a99ad';
                ctx.font = '9px JetBrains Mono';
                ctx.fillText('LONGITUDINAL', pad, h - 10);

                ctx.strokeStyle = '#4a5570';
                ctx.lineWidth = 1;
                ctx.setLineDash([3, 4]);
                ctx.beginPath();
                ctx.moveTo(pad, cy);
                ctx.lineTo(w - pad, cy);
                ctx.stroke();
                ctx.setLineDash([]);

                ctx.textAlign = 'center';
                ctx.fillStyle = '#e8edf5';
                ctx.font = '9px JetBrains Mono';
                ctx.fillText('λ = ' + longitudOnda.toFixed(2) + ' m', w / 2, 16);
                ctx.fillText('f = ' + frecuencia.toFixed(1) + ' Hz', w / 2, 32);

                for (let x = 0; x < cw; x += 10) {
                    const phase = (x / lambda) * Math.PI * 2 - time;
                    const despl = Math.sin(phase) * amp * 0.6;
                    const dotX = pad + x + despl;
                    const dotR = Math.max(1, 3 + Math.sin(phase) * 2);
                    if (dotX >= pad && dotX <= w - pad) {
                        ctx.fillStyle = Math.sin(phase) > 0 ? '#a78bfa' : '#a78bfa66';
                        ctx.beginPath();
                        ctx.arc(dotX, cy, dotR, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }
        });
    },

    // ============================================================
    // Caída Libre — objeto cayendo con estela
    // ============================================================
    caidaLibre: function(canvas, h, t, v, g) {
        if (!canvas.id) canvas.id = 'canvas_fis_caida';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const hh = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, hh);

            const pad = 20;
            const groundY = hh - 25;
            const topY = pad + 15;
            const maxDist = hh - topY - 35;

            const tNorm = ((Date.now() * 0.001) % (Math.max(t, 0.5) * 2));
            const tSim = tNorm > t ? t - (tNorm - t) : tNorm;
            const pct = Math.min(1, (0.5 * g * tSim * tSim) / Math.max(h, 1));
            const objY = topY + pct * maxDist;

            ctx.fillStyle = 'rgba(79,156,249,0.06)';
            ctx.fillRect(0, 0, w, hh);
            ctx.strokeStyle = '#4a5570';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(pad, groundY);
            ctx.lineTo(w - pad, groundY);
            ctx.stroke();

            if (h > 0) {
                ctx.strokeStyle = '#f9c74f44';
                ctx.lineWidth = 1.5;
                ctx.setLineDash([3, 5]);
                ctx.beginPath();
                ctx.moveTo(w / 2 - 15, topY);
                ctx.lineTo(w / 2 + 15, topY);
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.fillStyle = '#f9c74f44';
                ctx.font = '7px JetBrains Mono';
                ctx.textAlign = 'left';
                ctx.fillText('h = ' + h.toFixed(1) + ' m', w / 2 + 10, topY + 4);
            }

            const grad = ctx.createRadialGradient(w / 2 - 2, objY - 2, 1, w / 2, objY, 8);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.3, '#f9c74f');
            grad.addColorStop(1, '#e8941a');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(w / 2, objY, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#e8edf5';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.beginPath();
            ctx.ellipse(w / 2, groundY - 2, 10, 3, 0, 0, Math.PI * 2);
            ctx.fill();

            const v_inst = g * tSim;
            ctx.fillStyle = '#e8edf5';
            ctx.font = 'bold 10px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText('CAÍDA LIBRE', w / 2, 14);
            ctx.fillStyle = '#4ff97b';
            ctx.font = '9px JetBrains Mono';
            ctx.fillText('g = ' + g.toFixed(2) + ' m/s²', w / 2, 30);
            ctx.fillStyle = '#f94f4f';
            ctx.fillText('v = ' + v_inst.toFixed(2) + ' m/s', w / 2, objY - 14);
            ctx.fillStyle = '#f9c74f';
            ctx.fillText('t = ' + tSim.toFixed(2) + ' s  |  h = ' + (0.5 * g * tSim * tSim).toFixed(1) + ' m', w / 2, hh - 6);
        });
    },

    // ============================================================
    // Densidad — cubo sumergido con partículas
    // ============================================================
    densidad: function(canvas, masa, volumen, rho) {
        if (!canvas.id) canvas.id = 'canvas_fis_densidad';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);

            const t = Date.now() * 0.003;
            const cx = w / 2, cy = h / 2;
            const size = Math.min(w * 0.25, 60);

            ctx.fillStyle = 'rgba(79,156,249,0.06)';
            ctx.fillRect(0, 0, w, h);

            ctx.fillStyle = '#4f9cf944';
            ctx.fillRect(cx - size, cy - size, size * 2, size * 2);
            ctx.strokeStyle = '#4f9cf9';
            ctx.lineWidth = 2;
            ctx.strokeRect(cx - size, cy - size, size * 2, size * 2);

            ctx.fillStyle = '#94a3b8';
            ctx.font = '9px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText('m = ' + masa.toFixed(1) + ' kg', cx, cy + size + 22);
            ctx.fillText('V = ' + volumen.toFixed(2) + ' m³', cx, cy + size + 38);
            ctx.fillStyle = '#4ff97b';
            ctx.font = 'bold 11px JetBrains Mono';
            ctx.fillText('ρ = ' + rho.toFixed(1) + ' kg/m³', cx, cy - size - 12);

            // Partículas dentro del cubo
            for (let i = 0; i < 6; i++) {
                const angle = t * (1 + i * 0.5) + i * 1.2;
                const rad = size * 0.5 + Math.sin(t * 2 + i * 1.5) * size * 0.3;
                const px = cx + Math.cos(angle) * rad;
                const py = cy + Math.sin(angle * 0.7) * rad;
                ctx.fillStyle = `rgba(79,255,160,${0.3 + 0.3 * Math.sin(t + i)})`;
                ctx.beginPath();
                ctx.arc(px, py, 2 + Math.sin(t * 3 + i) * 1, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    },

    // ============================================================
    // Presión Hidrostática — columna de agua con gradiente
    // ============================================================
    presionHidrostatica: function(canvas, densidad, altura, presion, g) {
        if (!canvas.id) canvas.id = 'canvas_fis_presion';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);

            const pad = 30;
            const colW = Math.min(w * 0.25, 45);
            const maxH = h - 50;
            const colH = Math.min((altura / Math.max(altura, 1)) * maxH, maxH);
            const colX = w / 2 - colW / 2;
            const colBot = h - 30;

            ctx.fillStyle = 'rgba(79,156,249,0.06)';
            ctx.fillRect(0, 0, w, h);

            // Columna de agua con gradiente
            const grad = ctx.createLinearGradient(0, colBot - colH, 0, colBot);
            grad.addColorStop(0, 'rgba(79,156,249,0.1)');
            grad.addColorStop(1, 'rgba(79,156,249,0.5)');
            ctx.fillStyle = grad;
            ctx.fillRect(colX, colBot - colH, colW, colH);
            ctx.strokeStyle = '#4f9cf9';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(colX, colBot - colH, colW, colH);

            // Línea de altura
            ctx.strokeStyle = '#4a5570';
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 4]);
            ctx.beginPath();
            ctx.moveTo(colX - 15, colBot - colH);
            ctx.lineTo(colX - 8, colBot - colH);
            ctx.stroke();
            ctx.setLineDash([]);

            // Etiqueta altura
            ctx.fillStyle = '#f9c74f';
            ctx.font = '8px JetBrains Mono';
            ctx.textAlign = 'right';
            ctx.fillText('h = ' + altura.toFixed(1) + ' m', colX - 8, colBot - colH + 4);

            // Flecha de altura
            ctx.strokeStyle = '#f9c74f44';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(colX - 12, colBot - colH);
            ctx.lineTo(colX - 12, colBot);
            ctx.stroke();

            // Ondas en superficie
            const t = Date.now() * 0.003;
            ctx.strokeStyle = 'rgba(79,156,249,0.3)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            for (let x = colX - 5; x < colX + colW + 5; x += 3) {
                const yy = colBot - colH + Math.sin(x * 0.3 + t * 3) * 2;
                if (x === colX - 5) ctx.moveTo(x, yy);
                else ctx.lineTo(x, yy);
            }
            ctx.stroke();

            // Bubble animada
            const bubbleY = colBot - ((Date.now() * 0.001 * 20) % (colH + 10));
            if (bubbleY < colBot && bubbleY > colBot - colH) {
                ctx.fillStyle = 'rgba(200,230,255,0.4)';
                ctx.beginPath();
                ctx.arc(colX + colW / 2, bubbleY, 4, 0, Math.PI * 2);
                ctx.fill();
            }

            // Resultados
            ctx.fillStyle = '#e8edf5';
            ctx.font = 'bold 10px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText('PRESIÓN HIDROSTÁTICA', w / 2, 14);
            ctx.fillStyle = '#8a99ad';
            ctx.font = '8px JetBrains Mono';
            ctx.fillText('ρ = ' + densidad.toFixed(0) + ' kg/m³', w / 2, 30);
            ctx.fillStyle = '#4ff97b';
            ctx.font = 'bold 11px JetBrains Mono';
            ctx.fillText('P = ' + presion.toFixed(0) + ' Pa', w / 2, colBot + 18);
            ctx.fillStyle = '#4f9cf9';
            ctx.font = '8px JetBrains Mono';
            ctx.fillText(altura.toFixed(1) + ' m columna', w / 2, colBot + 32);
        });
    },

    // ============================================================
    // Impulso — fuerza pulsante animada
    // ============================================================
    impulso: function(canvas, F, dt, J) {
        if (!canvas.id) canvas.id = 'canvas_fis_impulso';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);

            const t = Date.now() * 0.003;
            const pad = 25;

            ctx.fillStyle = 'rgba(249,123,79,0.06)';
            ctx.fillRect(0, 0, w, h);

            ctx.strokeStyle = '#4a5570';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(pad, h / 2 + 30);
            ctx.lineTo(w - pad, h / 2 + 30);
            ctx.stroke();

            const pulse = 1 + 0.15 * Math.sin(t * 3);
            const barW = Math.min(w - 2 * pad, 200);
            const barH = 40 + 8 * Math.sin(t * 4);
            const bx = (w - barW) / 2;
            const by = h / 2 - barH / 2 - 10;

            const grad = ctx.createLinearGradient(bx, by, bx + barW, by);
            grad.addColorStop(0, '#f94f4f');
            grad.addColorStop(1, '#f97b4f');
            ctx.fillStyle = grad;
            ctx.shadowColor = '#f94f4f';
            ctx.shadowBlur = 8 * pulse;
            ctx.beginPath();
            ctx.roundRect(bx, by, barW * Math.min(1, pulse * 0.85), barH, 8);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 13px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText((J || F * dt).toFixed(1) + ' N·s', w / 2, by + barH / 2);

            ctx.fillStyle = '#e8edf5';
            ctx.font = 'bold 10px JetBrains Mono';
            ctx.textBaseline = 'top';
            ctx.fillText('F = ' + F.toFixed(1) + ' N', pad, pad);
            ctx.fillText('Δt = ' + dt.toFixed(2) + ' s', pad, pad + 16);
            ctx.fillStyle = '#4ff97b';
            ctx.fillText('J = F·Δt = ' + (J || F * dt).toFixed(1) + ' N·s', w / 2, h - 22);

            const pulseWave = 6 * Math.sin(t * 6) * (0.5 + 0.5 * Math.sin(t * 0.5));
            ctx.fillStyle = '#f94f4f44';
            ctx.beginPath();
            for (let x = 0; x < w; x += 2) {
                const yy = h / 2 + 30 + pulseWave * (x < w / 2 ? x / (w / 2) : (w - x) / (w / 2));
                x === 0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
            }
            ctx.strokeStyle = '#f94f4f22';
            ctx.lineWidth = 1;
            ctx.stroke();
        });
    },

    // ============================================================
    // Conservación del Momento — choque de dos bolas
    // ============================================================
    conservacion_momento: function(canvas, m1, m2, v1, v2, v1f, v2f) {
        if (!canvas.id) canvas.id = 'canvas_fis_momento';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);

            const t = Date.now() * 0.001;
            const r1 = Math.min(15 + m1 * 3, 30);
            const r2 = Math.min(15 + m2 * 3, 30);
            const totalV = Math.abs(v1) + Math.abs(v2) || 1;
            const speed = 40;
            const period = (w - 2 * r1 - 2 * r2) / (totalV * speed) * 2;
            const cycleT = t % period;
            const halfPeriod = period / 2;

            let x1, x2;
            if (cycleT < halfPeriod) {
                const pct = cycleT / halfPeriod;
                x1 = r1 + (w / 2 - r1 - r2) * pct;
                x2 = w - r2 - (w / 2 - r1 - r2) * pct;
            } else {
                const pct = (cycleT - halfPeriod) / halfPeriod;
                x1 = (w / 2 - r1 - r2) + (w / 2 - r1) * pct;
                x2 = (w / 2 + r2) - (w / 2 - r2) * pct;
            }

            ctx.fillStyle = 'rgba(79,156,249,0.06)';
            ctx.fillRect(0, 0, w, h);

            ctx.strokeStyle = '#4a5570';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(15, h / 2 + 30);
            ctx.lineTo(w - 15, h / 2 + 30);
            ctx.stroke();

            const grad1 = ctx.createRadialGradient(x1 - 3, h / 2 - 3, 1, x1, h / 2, r1);
            grad1.addColorStop(0, '#ffffff');
            grad1.addColorStop(0.3, '#f94f4f');
            grad1.addColorStop(1, '#a02020');
            ctx.fillStyle = grad1;
            ctx.beginPath();
            ctx.arc(x1, h / 2, r1, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#e8edf5';
            ctx.lineWidth = 1;
            ctx.stroke();

            const grad2 = ctx.createRadialGradient(x2 - 3, h / 2 - 3, 1, x2, h / 2, r2);
            grad2.addColorStop(0, '#ffffff');
            grad2.addColorStop(0.3, '#4f9cf9');
            grad2.addColorStop(1, '#2040a0');
            ctx.fillStyle = grad2;
            ctx.beginPath();
            ctx.arc(x2, h / 2, r2, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#e8edf5';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.fillStyle = '#e8edf5';
            ctx.font = 'bold 9px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText('m₁=' + m1.toFixed(1) + 'kg', x1, h / 2 - r1 - 12);
            ctx.fillText('m₂=' + m2.toFixed(1) + 'kg', x2, h / 2 - r2 - 12);

            const pTotal = m1 * v1 + m2 * v2;
            const pFinal = m1 * (v1f || 0) + m2 * (v2f || 0);
            ctx.fillStyle = '#f9c74f';
            ctx.font = '9px JetBrains Mono';
            ctx.fillText('p_inicial = ' + pTotal.toFixed(2) + ' kg·m/s', w / 2, h / 2 + 50);
            if (v1f != null && v2f != null) {
                ctx.fillStyle = '#4ff97b';
                ctx.fillText('p_final = ' + pFinal.toFixed(2) + ' kg·m/s', w / 2, h / 2 + 65);
            }
        });
    },

    // ============================================================
    // Ley de Coulomb — dos cargas con fuerza
    // ============================================================
    ley_coulomb: function(canvas, q1, q2, r, F) {
        if (!canvas.id) canvas.id = 'canvas_fis_coulomb';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);

            const t = Date.now() * 0.003;
            const cx = w / 2, cy = h / 2;
            const sep = Math.min(Math.max(Math.abs(r) * 50, 40), w / 2 - 40);
            const repulsivo = q1 * q2 >= 0;
            const dir = repulsivo ? 1 : -1;

            ctx.fillStyle = 'rgba(79,156,249,0.06)';
            ctx.fillRect(0, 0, w, h);

            const grad1 = ctx.createRadialGradient(cx - sep - 8, cy - 5, 1, cx - sep, cy, 20);
            grad1.addColorStop(0, '#ffffff');
            grad1.addColorStop(0.3, q1 >= 0 ? '#f94f4f' : '#4f9cf9');
            grad1.addColorStop(1, q1 >= 0 ? '#a02020' : '#2040a0');
            ctx.fillStyle = grad1;
            ctx.beginPath();
            ctx.arc(cx - sep, cy, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 10px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(q1 >= 0 ? '+' : '−', cx - sep, cy);

            const grad2 = ctx.createRadialGradient(cx + sep - 8, cy - 5, 1, cx + sep, cy, 20);
            grad2.addColorStop(0, '#ffffff');
            grad2.addColorStop(0.3, q2 >= 0 ? '#f94f4f' : '#4f9cf9');
            grad2.addColorStop(1, q2 >= 0 ? '#a02020' : '#2040a0');
            ctx.fillStyle = grad2;
            ctx.beginPath();
            ctx.arc(cx + sep, cy, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.fillText(q2 >= 0 ? '+' : '−', cx + sep, cy);

            const pulse = 1 + 0.08 * Math.sin(t * 2);
            const arrowLen = Math.min(Math.abs(F) * 5, 50) * pulse;
            ctx.strokeStyle = repulsivo ? '#f94f4f' : '#4ff97b';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(cx - sep + 20 * dir, cy);
            ctx.lineTo(cx - sep + 20 * dir + arrowLen * dir, cy);
            ctx.stroke();
            ctx.beginPath();
            const tipX = cx - sep + 20 * dir + arrowLen * dir;
            ctx.fillStyle = repulsivo ? '#f94f4f' : '#4ff97b';
            ctx.moveTo(tipX, cy);
            ctx.lineTo(tipX - 8 * dir, cy - 5);
            ctx.lineTo(tipX - 8 * dir, cy + 5);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = repulsivo ? '#4ff97b' : '#f94f4f';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(cx + sep - 20 * dir, cy);
            ctx.lineTo(cx + sep - 20 * dir - arrowLen * dir, cy);
            ctx.stroke();
            ctx.beginPath();
            const tipX2 = cx + sep - 20 * dir - arrowLen * dir;
            ctx.fillStyle = repulsivo ? '#4ff97b' : '#f94f4f';
            ctx.moveTo(tipX2, cy);
            ctx.lineTo(tipX2 + 8 * dir, cy - 5);
            ctx.lineTo(tipX2 + 8 * dir, cy + 5);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#e8edf5';
            ctx.font = '10px JetBrains Mono';
            ctx.textBaseline = 'top';
            ctx.textAlign = 'left';
            ctx.fillText('q₁ = ' + q1.toExponential(2) + ' C', 15, 15);
            ctx.fillText('q₂ = ' + q2.toExponential(2) + ' C', 15, 32);
            ctx.fillText('r = ' + r.toFixed(4) + ' m', 15, 49);
            ctx.fillStyle = '#4ff97b';
            ctx.textAlign = 'center';
            ctx.fillText('F = ' + Math.abs(F).toExponential(4) + ' N (' + (repulsivo ? 'repulsiva' : 'atractiva') + ')', w / 2, h - 15);
        });
    },

    // ============================================================
    // Campo Eléctrico — líneas de campo
    // ============================================================
    campo_electrico: function(canvas, F, q, E) {
        if (!canvas.id) canvas.id = 'canvas_fis_campo';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);

            const t = Date.now() * 0.002;
            const cx = w / 2, cy = h / 2;
            const cargaPositiva = q >= 0;

            ctx.fillStyle = 'rgba(79,156,249,0.06)';
            ctx.fillRect(0, 0, w, h);

            const grad = ctx.createRadialGradient(cx - 6, cy - 4, 1, cx, cy, 22);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.3, cargaPositiva ? '#f94f4f' : '#4f9cf9');
            grad.addColorStop(1, cargaPositiva ? '#a02020' : '#2040a0');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(cx, cy, 22, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(cargaPositiva ? '+' : '−', cx, cy);

            const numLines = 12;
            for (let i = 0; i < numLines; i++) {
                const angle = (i / numLines) * Math.PI * 2 + t * 0.3;
                ctx.strokeStyle = cargaPositiva ? 'rgba(249,79,79,0.3)' : 'rgba(79,156,249,0.3)';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                const dir = cargaPositiva ? 1 : -1;
                for (let r2 = 24; r2 < 120; r2 += 2) {
                    const wave = 5 * Math.sin(r2 * 0.05 + t * 2 + i);
                    const a = angle + wave * 0.03;
                    const x = cx + Math.cos(a) * r2 * dir;
                    const y = cy + Math.sin(a) * r2 * dir;
                    r2 === 24 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
                }
                ctx.stroke();
            }

            ctx.fillStyle = '#e8edf5';
            ctx.font = '10px JetBrains Mono';
            ctx.textBaseline = 'top';
            ctx.textAlign = 'left';
            ctx.fillText('q = ' + q.toExponential(3) + ' C', 15, 15);
            ctx.fillText('F = ' + F.toExponential(3) + ' N', 15, 32);
            ctx.fillStyle = '#4ff97b';
            ctx.font = 'bold 12px JetBrains Mono';
            ctx.textBaseline = 'bottom';
            ctx.textAlign = 'center';
            ctx.fillText('E = F/q = ' + E.toExponential(4) + ' N/C', w / 2, h - 10);
        });
    },

    // ============================================================
    // Potencial Eléctrico — pozo de potencial
    // ============================================================
    potencial_electrico: function(canvas, q, r, V) {
        if (!canvas.id) canvas.id = 'canvas_fis_potencial';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);

            const t = Date.now() * 0.002;
            const cx = w / 2;
            const cargaPositiva = q >= 0;

            ctx.fillStyle = 'rgba(79,156,249,0.06)';
            ctx.fillRect(0, 0, w, h);

            const grad = ctx.createRadialGradient(cx - 5, 20 + 12, 1, cx, 20 + 12, 16);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.3, cargaPositiva ? '#f94f4f' : '#4f9cf9');
            grad.addColorStop(1, cargaPositiva ? '#a02020' : '#2040a0');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(cx, 20 + 12, 16, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 10px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(cargaPositiva ? '+' : '−', cx, 20 + 12);

            ctx.strokeStyle = '#4a5570';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(25, h - 25);
            ctx.lineTo(w - 25, h - 25);
            ctx.stroke();

            const amp = h / 3;
            const signo = cargaPositiva ? -1 : 1;
            ctx.strokeStyle = cargaPositiva ? '#f94f4f' : '#4f9cf9';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            for (let x = 25; x <= w - 25; x += 1) {
                const dx = (x - cx) / (w / 2 - 25);
                const pot = signo * amp / Math.max(Math.abs(dx), 0.05);
                const y = h - 25 + pot * 0.4 + 5 * Math.sin(t * 0.5 + dx * 2) * 0.05 * amp;
                x === 25 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.stroke();

            ctx.fillStyle = '#e8edf5';
            ctx.font = '10px JetBrains Mono';
            ctx.textBaseline = 'top';
            ctx.textAlign = 'left';
            ctx.fillText('q = ' + q.toExponential(3) + ' C', 15, 8);
            ctx.fillStyle = '#f9c74f';
            ctx.fillText('r = ' + r.toFixed(4) + ' m', 15, 28);
            ctx.fillStyle = '#4ff97b';
            ctx.font = 'bold 12px JetBrains Mono';
            ctx.textBaseline = 'bottom';
            ctx.textAlign = 'center';
            ctx.fillText('V = k·q/r = ' + V.toExponential(4) + ' V', w / 2, h - 8);
        });
    }
};
