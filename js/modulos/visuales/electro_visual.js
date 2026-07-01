window.ElectroVisual = window.ElectroVisual || {
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
        if (this.loops[canvasId]) cancelAnimationFrame(this.loops[canvasId]);
        const run = () => {
            frameCallback();
            this.loops[canvasId] = requestAnimationFrame(run);
        };
        this.loops[canvasId] = requestAnimationFrame(run);
    },

    // =========================================================================
    // ELECTRICIDAD (6)
    // =========================================================================

    // -------------------------------------------------------------------------
    // E1. LEY DE OHM — Bulbo que se enciende/apaga/quema según parámetros
    // -------------------------------------------------------------------------
    ohm: function(canvas, V, I, R, P) {
        if (!canvas.id) canvas.id = 'canvas_ohm';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);

            const cx = w / 2, cy = h / 2;
            const t = Date.now() * 0.003;
            const sobrecarga = P > 0.5;
            const quemado = P > 2 || (R > 0 && R < 1);
            const peligro = P > 1;

            // Fondo con gradiente
            const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.6);
            grad.addColorStop(0, quemado ? 'rgba(80,20,20,0.4)' : sobrecarga ? 'rgba(60,40,10,0.3)' : 'rgba(20,40,60,0.3)');
            grad.addColorStop(1, 'rgba(10,15,30,0.6)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            // Batería (izquierda)
            ctx.strokeStyle = '#e8edf5'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(50, cy - 25); ctx.lineTo(50, cy + 25); ctx.stroke();
            ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(42, cy - 25); ctx.lineTo(58, cy - 25); ctx.stroke();
            ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(45, cy + 25); ctx.lineTo(55, cy + 25); ctx.stroke();
            ctx.fillStyle = '#e8edf5'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
            ctx.fillText(`${V.toFixed(1)}V`, 50, cy - 35);

            // Cable superior
            ctx.strokeStyle = '#4a5570'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(50, cy - 25); ctx.lineTo(cx - 35, cy - 25); ctx.stroke();

            // Bulbo
            const bulboR = 30;
            const bx = cx + 30, by = cy;

            if (quemado) {
                // Bomba fundida — filamento roto
                ctx.strokeStyle = '#555'; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.arc(bx, by, bulboR, 0, Math.PI * 2); ctx.stroke();
                ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(bx, by, bulboR, 0, Math.PI * 2); ctx.fill();
                ctx.strokeStyle = '#666'; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.moveTo(bx - 10, by - 8); ctx.lineTo(bx + 10, by + 8); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(bx + 10, by - 8); ctx.lineTo(bx - 10, by + 8); ctx.stroke();
                // Humo
                for (let i = 0; i < 3; i++) {
                    const alpha = 0.15 + 0.1 * Math.sin(t * 2 + i * 2);
                    ctx.fillStyle = `rgba(150,150,150,${alpha})`;
                    ctx.beginPath(); ctx.arc(bx + 20 + i * 8, by - 25 - i * 10 + Math.sin(t + i) * 3, 8 + i * 3, 0, Math.PI * 2); ctx.fill();
                }
                ctx.fillStyle = '#ff4444'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
                ctx.fillText('¡QUEMADO!', bx, by + bulboR + 18);
            } else if (sobrecarga) {
                // Bulbo encendido con sobrecarga — parpadeo
                const brillo = 0.7 + 0.3 * Math.sin(t * 12);
                const r = 200 + 55 * Math.sin(t * 15);
                const g = 80 + 40 * Math.sin(t * 13);
                ctx.shadowColor = `rgba(${r},${g},20,${brillo * 0.6})`;
                ctx.shadowBlur = 35 * brillo;
                ctx.fillStyle = `rgb(${r},${g},20)`;
                ctx.beginPath(); ctx.arc(bx, by, bulboR, 0, Math.PI * 2); ctx.fill();
                // Filamento visible
                ctx.strokeStyle = `rgba(255,200,50,${brillo})`; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(bx - 12, by); ctx.quadraticCurveTo(bx, by - 18, bx + 12, by); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(bx - 12, by); ctx.quadraticCurveTo(bx, by + 18, bx + 12, by); ctx.stroke();
                ctx.shadowBlur = 0;
                // Aviso
                ctx.fillStyle = '#ff8800'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
                ctx.fillText('⚠ SOBRECARGA', bx, by + bulboR + 18);
                ctx.fillText(`P=${P.toFixed(1)}W`, bx, by + bulboR + 33);
            } else if (I > 0) {
                // Bulbo encendido normal
                const brillo = 0.8 + 0.2 * Math.sin(t * 6);
                const intensidad = Math.min(1, I * 5);
                const r = 180 + 75 * intensidad;
                const g = 60 + 40 * intensidad;
                ctx.shadowColor = `rgba(${r},${g},20,${brillo * 0.4})`;
                ctx.shadowBlur = 25 * brillo;
                ctx.fillStyle = `rgb(${r},${g},20)`;
                ctx.beginPath(); ctx.arc(bx, by, bulboR, 0, Math.PI * 2); ctx.fill();
                ctx.strokeStyle = 'rgba(255,200,50,0.6)'; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(bx - 12, by); ctx.quadraticCurveTo(bx, by - 18, bx + 12, by); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(bx - 12, by); ctx.quadraticCurveTo(bx, by + 18, bx + 12, by); ctx.stroke();
                ctx.shadowBlur = 0;
            } else {
                // Bulbo apagado
                ctx.strokeStyle = '#4a5570'; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.arc(bx, by, bulboR, 0, Math.PI * 2); ctx.stroke();
                ctx.fillStyle = '#1a1a2e'; ctx.beginPath(); ctx.arc(bx, by, bulboR - 2, 0, Math.PI * 2); ctx.fill();
                ctx.strokeStyle = '#555'; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(bx - 10, by); ctx.lineTo(bx + 10, by); ctx.stroke();
            }

            // Cable inferior (batería → bulbo)
            ctx.strokeStyle = '#4a5570'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(50, cy + 25); ctx.lineTo(bx, cy + 25); ctx.stroke();
            // Rama a tierra
            ctx.strokeStyle = '#4a5570'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(bx, cy + 25); ctx.lineTo(bx, cy + bulboR + 5); ctx.stroke();

            // Partículas de corriente (solo si hay corriente)
            if (I > 0 && !quemado) {
                ctx.fillStyle = '#4ade80';
                const vel = Math.max(10, I * 200);
                const totalDist = (cx - 35 - 50) + (bx - (cx - 35));
                for (let i = 0; i < 5; i++) {
                    let d = ((t * vel + i * totalDist / 5) % totalDist);
                    let px, py;
                    if (d < cx - 35 - 50) {
                        px = 50 + d; py = cy - 25;
                    } else {
                        px = cx - 35 + (d - (cx - 35 - 50)); py = cy + 25;
                    }
                    ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 4 + i);
                    ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI * 2); ctx.fill();
                    ctx.globalAlpha = 1;
                }
            }

            // Etiquetas técnicas
            ctx.fillStyle = '#94a3b8'; ctx.font = '9px monospace'; ctx.textAlign = 'left';
            ctx.fillText(`R: ${R.toFixed(1)}Ω`, 10, 15);
            ctx.fillText(`I: ${(I * 1000).toFixed(1)}mA`, 10, 28);
            ctx.fillText(`P: ${P.toFixed(3)}W`, 10, 41);
        });
    },

    // -------------------------------------------------------------------------
    // E2. POTENCIA ELÉCTRICA — Medidor analógico + barra con zonas
    // -------------------------------------------------------------------------
    potencia: function(canvas, P, V, I, R) {
        if (!canvas.id) canvas.id = 'canvas_potencia';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);

            const t = Date.now() * 0.003;
            const sobrecarga = P > 100;
            const peligro = P > 50;
            const maxP = Math.max(P || 1, 200);

            const barX = 30, barW = 28, barY = 30, barH = h - 80;
            const ratio = Math.min(1, Math.max(0, P / maxP));
            const fillH = ratio * barH;

            // Marco del medidor
            ctx.strokeStyle = '#4a5570'; ctx.lineWidth = 1.5;
            ctx.strokeRect(barX - 5, barY - 5, barW + 10, barH + 10);

            // Barra con gradiente según zona
            const grad = ctx.createLinearGradient(0, barY + barH, 0, barY);
            grad.addColorStop(0, '#4ade80');
            grad.addColorStop(0.5, '#facc15');
            grad.addColorStop(0.75, '#f97316');
            grad.addColorStop(1, '#ef4444');
            ctx.fillStyle = grad;
            ctx.fillRect(barX, barY + barH - fillH, barW, fillH);

            // Brillo/parpadeo en sobrecarga
            if (sobrecarga) {
                const flash = 0.3 + 0.7 * (Math.sin(t * 20) > 0.5 ? 1 : 0);
                ctx.fillStyle = `rgba(255,60,60,${flash * 0.3})`;
                ctx.fillRect(barX - 5, barY - 5, barW + 10, barH + 10);
                // Chispas
                for (let i = 0; i < 3; i++) {
                    const sx = barX + barW / 2 + (Math.sin(t * 7 + i * 4) * 20);
                    const sy = barY + barH - fillH - 5 + (Math.cos(t * 5 + i * 3) * 10);
                    ctx.fillStyle = `rgba(255,200,50,${0.3 + 0.7 * Math.sin(t * 10 + i)})`;
                    ctx.beginPath(); ctx.arc(sx, sy, 2 + Math.sin(t * 8 + i) * 1.5, 0, Math.PI * 2); ctx.fill();
                }
                ctx.fillStyle = '#ff4444'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
                ctx.fillText('¡SOBRECARGA!', barX + barW / 2, barY - 10);
            } else if (peligro) {
                const blink = Math.sin(t * 10) > 0 ? 1 : 0.2;
                ctx.fillStyle = `rgba(255,150,0,${blink * 0.2})`;
                ctx.fillRect(barX - 5, barY - 5, barW + 10, barH + 10);
                ctx.fillStyle = `rgba(255,150,0,${blink})`;
                ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
                ctx.fillText('⚠ PELIGRO', barX + barW / 2, barY - 10);
            }

            // Etiqueta P
            ctx.fillStyle = '#e8edf5'; ctx.font = 'bold 13px monospace'; ctx.textAlign = 'center';
            ctx.fillText(`${P.toFixed(1)} W`, barX + barW / 2, h - 10);

            // Circuito pequeño a la derecha
            const circX = w * 0.55, circY = h / 2;
            // Batería
            ctx.strokeStyle = '#e8edf5'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(circX, circY - 18); ctx.lineTo(circX, circY + 18); ctx.stroke();
            ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(circX - 6, circY - 18); ctx.lineTo(circX + 6, circY - 18); ctx.stroke();
            ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(circX - 8, circY + 18); ctx.lineTo(circX + 8, circY + 18); ctx.stroke();

            // Cable a resistencia
            ctx.strokeStyle = '#4a5570'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(circX, circY - 18); ctx.lineTo(circX + 60, circY - 18); ctx.stroke(); 
            ctx.beginPath(); ctx.moveTo(circX, circY + 18); ctx.lineTo(circX + 60, circY + 18); ctx.stroke();

            // Resistencia
            const rx = circX + 60;
            ctx.strokeStyle = sobrecarga ? '#ff4444' : '#4f9cf9'; ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(rx, circY - 18); ctx.lineTo(rx + 8, circY - 18);
            ctx.lineTo(rx + 18, circY - 8); ctx.lineTo(rx + 28, circY + 8);
            ctx.lineTo(rx + 38, circY - 8); ctx.lineTo(rx + 48, circY + 8);
            ctx.lineTo(rx + 58, circY - 8); ctx.lineTo(rx + 68, circY);
            ctx.lineTo(rx + 68, circY + 18);
            ctx.stroke();

            // Calor en la resistencia si sobrecarga
            if (sobrecarga) {
                ctx.shadowColor = '#ff4400'; ctx.shadowBlur = 20 + 10 * Math.sin(t * 8);
                ctx.fillStyle = `rgba(255,60,0,${0.15 + 0.1 * Math.sin(t * 6)})`;
                ctx.fillRect(rx - 5, circY - 25, 80, 50);
                ctx.shadowBlur = 0;
            } else if (peligro) {
                ctx.shadowColor = '#ff8800'; ctx.shadowBlur = 10 + 5 * Math.sin(t * 5);
                ctx.fillStyle = `rgba(255,136,0,${0.1 + 0.05 * Math.sin(t * 4)})`;
                ctx.fillRect(rx - 5, circY - 25, 80, 50);
                ctx.shadowBlur = 0;
            }

            // Etiquetas
            ctx.fillStyle = '#94a3b8'; ctx.font = '9px monospace'; ctx.textAlign = 'left';
            ctx.fillText(`V: ${V.toFixed(1)}V`, circX + 10, circY - 35);
            ctx.fillText(`I: ${(I * 1000).toFixed(0)}mA`, circX + 10, circY + 35);
            ctx.fillText(`R: ${R.toFixed(0)}Ω`, rx + 15, circY + 35);
        });
    },

    // -------------------------------------------------------------------------
    // E3. SERIE — Cadena de resistencias con flujo de corriente
    // -------------------------------------------------------------------------
    serie: function(canvas, resistencias, rt, Vt) {
        if (!canvas.id) canvas.id = 'canvas_serie';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);

            const t = Date.now() * 0.003;
            const n = resistencias.length;
            const startX = 40, endX = w - 40;
            const spacing = (endX - startX) / (n + 1);
            const cy = h / 2 - 10;

            // Cable horizontal
            ctx.strokeStyle = '#4a5570'; ctx.lineWidth = 2.5;
            ctx.beginPath(); ctx.moveTo(15, cy); ctx.lineTo(w - 15, cy); ctx.stroke();

            // Resistencias
            for (let i = 0; i < n; i++) {
                const x = startX + spacing * (i + 1);
                const r = resistencias[i];
                const vDrop = Vt ? (r / rt) * Vt : 0;
                const potencia = Vt ? (vDrop * vDrop / r) : 0;
                const sobrecarga = potencia > 0.25;

                // Cuerpo de la resistencia
                ctx.strokeStyle = sobrecarga ? '#ff6644' : '#4f9cf9';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(x - 8, cy); ctx.lineTo(x + 8, cy);
                ctx.lineTo(x + 18, cy - 10); ctx.lineTo(x + 28, cy + 10);
                ctx.lineTo(x + 38, cy - 10); ctx.lineTo(x + 48, cy + 10);
                ctx.lineTo(x + 58, cy - 10); ctx.lineTo(x + 68, cy);
                ctx.lineTo(x + 84, cy);
                ctx.stroke();

                // Calor si sobrecarga
                if (sobrecarga) {
                    ctx.shadowColor = '#ff4400'; ctx.shadowBlur = 12 + 6 * Math.sin(t * 5 + i);
                    ctx.fillStyle = `rgba(255,60,0,${0.1 + 0.08 * Math.sin(t * 4 + i * 2)})`;
                    ctx.fillRect(x + 5, cy - 18, 70, 36);
                    ctx.shadowBlur = 0;
                }

                // Etiqueta del valor
                ctx.fillStyle = '#e8edf5'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
                ctx.fillText(`${r.toFixed(0)}Ω`, x + 46, cy - 16);
                if (Vt) {
                    ctx.fillStyle = '#94a3b8'; ctx.font = '7px monospace';
                    ctx.fillText(`${vDrop.toFixed(2)}V`, x + 46, cy + 18);
                }
            }

            // Batería (izquierda)
            ctx.strokeStyle = '#e8edf5'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(15, cy - 15); ctx.lineTo(15, cy + 15); ctx.stroke();
            ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(10, cy - 15); ctx.lineTo(20, cy - 15); ctx.stroke();
            ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(8, cy + 15); ctx.lineTo(22, cy + 15); ctx.stroke();
            ctx.fillStyle = '#e8edf5'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
            ctx.fillText(Vt ? `${Vt.toFixed(1)}V` : '', 15, cy - 28);

            // Resultado total
            ctx.fillStyle = '#4fffa0'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
            ctx.fillText(`Rt = ${rt.toFixed(1)}Ω`, w / 2, h - 12);

            // Partículas de corriente
            ctx.fillStyle = '#4ade80';
            const cableLen = w - 30;
            for (let i = 0; i < 8; i++) {
                let d = ((t * 60 + i * cableLen / 8) % cableLen);
                ctx.globalAlpha = 0.4 + 0.6 * Math.sin(t * 3 + i * 0.8);
                ctx.beginPath(); ctx.arc(15 + d, cy, 2.5, 0, Math.PI * 2); ctx.fill();
                ctx.globalAlpha = 1;
            }
        });
    },

    // -------------------------------------------------------------------------
    // E4. PARALELO — Ramas paralelas con división de corriente
    // -------------------------------------------------------------------------
    paralelo: function(canvas, resistencias, rt, It) {
        if (!canvas.id) canvas.id = 'canvas_paralelo';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);

            const t = Date.now() * 0.003;
            const n = Math.min(resistencias.length, 6);
            const topY = h / 2 - 40, botY = h / 2 + 40;
            const startX = 50, endX = w - 50;
            const spacing = (endX - startX) / (n + 1);

            const tieneCorto = resistencias.some(r => r === 0);

            // Nodos
            ctx.strokeStyle = '#4a5570'; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(20, topY); ctx.lineTo(w - 20, topY); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(20, botY); ctx.lineTo(w - 20, botY); ctx.stroke();

            // Batería izquierda
            ctx.strokeStyle = '#e8edf5'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(20, topY - 15); ctx.lineTo(20, topY + 15); ctx.stroke();
            ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(15, topY - 15); ctx.lineTo(25, topY - 15); ctx.stroke();
            ctx.fillStyle = '#e8edf5'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
            ctx.fillText(It ? `${It.toFixed(2)}A` : '', 20, topY - 30);

            // Ramas
            for (let i = 0; i < n; i++) {
                const x = startX + spacing * (i + 1);
                const r = resistencias[i];
                const iBranch = It && rt ? (rt / r) * It : 0;
                const esCorto = r === 0;
                const sobrecarga = iBranch > It * 0.8 && n > 1;

                // Cable vertical
                ctx.strokeStyle = esCorto ? '#ff4444' : '#4a5570';
                ctx.lineWidth = esCorto ? 3 : 2;
                ctx.beginPath(); ctx.moveTo(x, topY); ctx.lineTo(x, botY); ctx.stroke();

                // Resistencia (zigzag) o corto
                if (esCorto) {
                    // Relámpago de cortocircuito
                    const flash = Math.sin(t * 15 + i * 3) > 0.5 ? 1 : 0.3;
                    ctx.shadowColor = '#ffff00'; ctx.shadowBlur = 20 * flash;
                    ctx.fillStyle = `rgba(255,255,100,${flash * 0.3})`;
                    ctx.fillRect(x - 12, topY + 5, 24, botY - topY - 10);
                    ctx.shadowBlur = 0;
                    ctx.fillStyle = `rgba(255,200,50,${flash})`;
                    ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
                    ctx.fillText('¡CORTO!', x, (topY + botY) / 2);
                } else {
                    ctx.strokeStyle = sobrecarga ? '#ff6644' : '#4f9cf9';
                    ctx.lineWidth = 2;
                    const midY = (topY + botY) / 2;
                    ctx.beginPath();
                    ctx.moveTo(x, topY + 8); ctx.lineTo(x + 6, topY + 12);
                    ctx.lineTo(x - 6, topY + 22); ctx.lineTo(x + 6, topY + 32);
                    ctx.lineTo(x - 6, topY + 42); ctx.lineTo(x + 6, topY + 52);
                    ctx.lineTo(x, topY + 58); ctx.lineTo(x, botY - 8);
                    ctx.stroke();

                    // Calor si sobrecarga
                    if (sobrecarga) {
                        ctx.shadowColor = '#ff4400'; ctx.shadowBlur = 10 + 5 * Math.sin(t * 4 + i);
                        ctx.shadowBlur = 0;
                    }

                    // Etiqueta
                    ctx.fillStyle = '#e8edf5'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
                    ctx.fillText(`${r.toFixed(0)}Ω`, x, botY + 16);
                    if (It) {
                        ctx.fillStyle = '#94a3b8'; ctx.font = '7px monospace';
                        ctx.fillText(`${(iBranch * 1000).toFixed(1)}mA`, x, botY + 28);
                    }

                    // Corriente particles por rama
                    if (It) {
                        const vel = Math.max(10, Math.abs(iBranch) * 500);
                        ctx.fillStyle = '#4ade80';
                        ctx.globalAlpha = 0.3 + 0.7 * Math.min(1, Math.abs(iBranch) * 2);
                        for (let j = 0; j < 2; j++) {
                            let d = ((t * vel + j * (botY - topY) / 2) % (botY - topY));
                            ctx.beginPath(); ctx.arc(x, topY + d, 2, 0, Math.PI * 2); ctx.fill();
                        }
                        ctx.globalAlpha = 1;
                    }
                }
            }

            // Rt
            ctx.fillStyle = '#4fffa0'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
            ctx.fillText(`Rt = ${rt.toFixed(2)}Ω`, w / 2, h - 10);
        });
    },

    // -------------------------------------------------------------------------
    // E5. DIVISOR DE TENSIÓN — Potenciómetro interactivo con LED de salida
    // -------------------------------------------------------------------------
    divisor: function(canvas, Vin, Vout, R1, R2) {
        if (!canvas.id) canvas.id = 'canvas_divisor';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);

            const t = Date.now() * 0.003;
            const cx = w * 0.35, cy = h / 2;
            const relacion = R2 / (R1 + R2);

            // Fondo
            ctx.fillStyle = 'rgba(15,20,35,0.5)'; ctx.fillRect(0, 0, w, h);

            // Batería arriba
            ctx.strokeStyle = '#e8edf5'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(cx, 20); ctx.lineTo(cx, 50); ctx.stroke();
            ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cx - 6, 20); ctx.lineTo(cx + 6, 20); ctx.stroke();
            ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - 8, 30); ctx.lineTo(cx + 8, 30); ctx.stroke();
            ctx.fillStyle = '#e8edf5'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
            ctx.fillText(`${Vin.toFixed(1)}V`, cx, 15);

            // R1 (arriba)
            ctx.strokeStyle = '#4f9cf9'; ctx.lineWidth = 2.5;
            const r1y = 55;
            ctx.beginPath();
            ctx.moveTo(cx, r1y); ctx.lineTo(cx + 6, r1y + 6);
            ctx.lineTo(cx - 6, r1y + 16); ctx.lineTo(cx + 6, r1y + 26);
            ctx.lineTo(cx - 6, r1y + 36); ctx.lineTo(cx + 6, r1y + 46);
            ctx.lineTo(cx, r1y + 52);
            ctx.stroke();
            ctx.fillStyle = '#94a3b8'; ctx.font = '8px monospace'; ctx.textAlign = 'left';
            ctx.fillText(`R1: ${R1.toFixed(0)}Ω`, cx + 12, r1y + 25);

            // Nodo de salida (Vout)
            const voutY = r1y + 56;
            ctx.fillStyle = '#1e293b'; ctx.strokeStyle = '#4fffa0'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(cx, voutY, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

            // Brillo en Vout según nivel
            const brillo = 0.2 + 0.8 * relacion;
            ctx.shadowColor = '#4fffa0'; ctx.shadowBlur = 15 * brillo;
            ctx.fillStyle = `rgba(79,255,160,${brillo * 0.2})`;
            ctx.beginPath(); ctx.arc(cx, voutY, 16, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;

            // LED de salida (derecha)
            const ledX = w * 0.7, ledY = h / 2;
            ctx.strokeStyle = '#4a5570'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(cx + 6, voutY); ctx.lineTo(ledX - 12, ledY); ctx.stroke();
            // Triángulo LED
            const ledBrillo = relacion > 0.1 ? 0.4 + 0.6 * relacion : 0;
            ctx.fillStyle = relacion > 0.1 ? `rgb(${200 * ledBrillo + 55},${60 * ledBrillo},0)` : '#333';
            ctx.beginPath();
            ctx.moveTo(ledX - 10, ledY - 10); ctx.lineTo(ledX + 10, ledY); ctx.lineTo(ledX - 10, ledY + 10);
            ctx.closePath(); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(ledX + 10, ledY - 10); ctx.lineTo(ledX + 10, ledY + 10); ctx.stroke();

            if (relacion > 0.1) {
                ctx.shadowColor = `rgba(255,${Math.floor(150 * ledBrillo)},0,${ledBrillo * 0.4})`;
                ctx.shadowBlur = 20 * ledBrillo;
                ctx.fillStyle = `rgba(255,${Math.floor(150 * ledBrillo)},0,${ledBrillo * 0.1})`;
                ctx.beginPath(); ctx.arc(ledX, ledY, 18, 0, Math.PI * 2); ctx.fill();
                ctx.shadowBlur = 0;
            }

            // R2 (abajo)
            ctx.strokeStyle = '#f9c74f'; ctx.lineWidth = 2.5;
            const r2y = voutY + 10;
            ctx.beginPath();
            ctx.moveTo(cx, r2y); ctx.lineTo(cx + 6, r2y + 6);
            ctx.lineTo(cx - 6, r2y + 16); ctx.lineTo(cx + 6, r2y + 26);
            ctx.lineTo(cx - 6, r2y + 36); ctx.lineTo(cx + 6, r2y + 46);
            ctx.lineTo(cx, r2y + 52);
            ctx.stroke();
            ctx.fillStyle = '#94a3b8'; ctx.font = '8px monospace'; ctx.textAlign = 'left';
            ctx.fillText(`R2: ${R2.toFixed(0)}Ω`, cx + 12, r2y + 25);
            // Tierra
            ctx.strokeStyle = '#4a5570'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(cx, r2y + 52); ctx.lineTo(cx, r2y + 65); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(cx - 8, r2y + 65); ctx.lineTo(cx + 8, r2y + 65); ctx.stroke();

            // Vout label
            ctx.fillStyle = '#4fffa0'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
            ctx.fillText(`Vout = ${Vout.toFixed(2)}V`, w * 0.7, 25);
            ctx.fillStyle = '#64748b'; ctx.font = '8px monospace';
            ctx.fillText(`${(relacion * 100).toFixed(1)}% de Vin`, w * 0.7, 38);
        });
    },

    // -------------------------------------------------------------------------
    // E6. KIRCHHOFF — Dos mallas con flujo de corriente animado (existente mejorado)
    // -------------------------------------------------------------------------
    kirchhoff: function(canvas, V1, R1, Rs, R2, I1, I2) {
        if (!canvas.id) canvas.id = 'canvas_kirchhoff';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);

            const padX = 35, padY = 25;
            const mWidth = (w - 2 * padX) / 2;
            const mHeight = h - 2 * padY;
            const t = Date.now() * 0.002;

            // Mallas
            ctx.strokeStyle = '#334155'; ctx.lineWidth = 2;
            ctx.strokeRect(padX, padY, mWidth, mHeight);
            ctx.strokeRect(padX + mWidth, padY, mWidth, mHeight);

            // Nodos centrales
            ctx.fillStyle = '#64748b';
            ctx.beginPath(); ctx.arc(padX + mWidth, padY, 4, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(padX + mWidth, padY + mHeight, 4, 0, Math.PI * 2); ctx.fill();

            // R1
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(padX + mWidth / 2 - 12, padY - 5, 24, 10);
            ctx.strokeRect(padX + mWidth / 2 - 12, padY - 5, 24, 10);
            ctx.fillStyle = '#94a3b8'; ctx.font = '7px monospace'; ctx.textAlign = 'center';
            ctx.fillText(`R1:${R1}Ω`, padX + mWidth / 2, padY - 10);

            // R2
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(padX + mWidth + mWidth / 2 - 12, padY - 5, 24, 10);
            ctx.strokeRect(padX + mWidth + mWidth / 2 - 12, padY - 5, 24, 10);
            ctx.fillText(`R2:${R2}Ω`, padX + mWidth + mWidth / 2, padY - 10);

            // Rs (compartida)
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(padX + mWidth - 5, padY + mHeight / 2 - 12, 10, 24);
            ctx.strokeRect(padX + mWidth - 5, padY + mHeight / 2 - 12, 10, 24);
            ctx.fillStyle = '#94a3b8'; ctx.font = '7px monospace';
            ctx.fillText(`Rs:${Rs}Ω`, padX + mWidth + 12, padY + mHeight / 2 + 3);

            // Batería V1
            ctx.strokeStyle = '#e8edf5'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(padX + 8, padY); ctx.lineTo(padX + 8, padY + 20); ctx.stroke();
            ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(padX + 4, padY); ctx.lineTo(padX + 12, padY); ctx.stroke();
            ctx.fillStyle = '#e8edf5'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
            ctx.fillText(`${V1}V`, padX + 8, padY + 32);

            // Corriente Malla 1 (puntos amarillos)
            if (Math.abs(I1) > 0.001) {
                ctx.fillStyle = '#fbbf24';
                let p1 = (t * Math.abs(I1) * 180) % (2 * (mWidth + mHeight));
                let ex = padX, ey = padY;
                if (p1 < mWidth) { ex = padX + p1; ey = padY; }
                else if (p1 < mWidth + mHeight) { ex = padX + mWidth; ey = padY + (p1 - mWidth); }
                else if (p1 < 2 * mWidth + mHeight) { ex = padX + mWidth - (p1 - mWidth - mHeight); ey = padY + mHeight; }
                else { ex = padX; ey = padY + mHeight - (p1 - 2 * mWidth - mHeight); }
                ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 6;
                ctx.beginPath(); ctx.arc(ex, ey, 3, 0, Math.PI * 2); ctx.fill();
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#fbbf24'; ctx.font = '8px monospace';
                ctx.fillText(`I₁=${I1.toFixed(3)}A`, padX + 5, padY + mHeight + 14);
            }

            // Corriente Malla 2 (puntos violetas)
            if (Math.abs(I2) > 0.001) {
                ctx.fillStyle = '#a78bfa';
                let p2 = (t * Math.abs(I2) * 180) % (2 * (mWidth + mHeight));
                let ex = padX + mWidth, ey = padY;
                if (p2 < mWidth) { ex = padX + mWidth + p2; ey = padY; }
                else if (p2 < mWidth + mHeight) { ex = padX + 2 * mWidth; ey = padY + (p2 - mWidth); }
                else if (p2 < 2 * mWidth + mHeight) { ex = padX + 2 * mWidth - (p2 - mWidth - mHeight); ey = padY + mHeight; }
                else { ex = padX + mWidth; ey = padY + mHeight - (p2 - 2 * mWidth - mHeight); }
                ctx.shadowColor = '#a78bfa'; ctx.shadowBlur = 6;
                ctx.beginPath(); ctx.arc(ex, ey, 3, 0, Math.PI * 2); ctx.fill();
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#a78bfa'; ctx.font = '8px monospace';
                ctx.fillText(`I₂=${I2.toFixed(3)}A`, padX + mWidth + 5, padY + mHeight + 14);
            }
        });
    },

    // =========================================================================
    // ELECTRÓNICA (6)
    // =========================================================================

    // -------------------------------------------------------------------------
    // EL1. LED + RESISTENCIA — LED se enciende, parpadea o se quema
    // -------------------------------------------------------------------------
    led: function(canvas, Vs, Vl, Il, Rs) {
        if (!canvas.id) canvas.id = 'canvas_led';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);

            const padX = 40, padY = 30;
            const cw = w - 2 * padX, ch = h - 2 * padY;
            const t = Date.now() * 0.003;

            const I_ma = Il * 1000;
            const ledQuemado = I_ma > 30;
            const ledBrillo = ledQuemado ? 0 : Math.min(1, I_ma / 20);

            // Cables
            ctx.strokeStyle = '#334155'; ctx.lineWidth = 2;
            ctx.strokeRect(padX, padY, cw, ch);

            // Fuente
            const sourceY = padY + ch / 2;
            ctx.fillStyle = '#1e293b';
            ctx.beginPath(); ctx.arc(padX, sourceY, 14, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#4a5570'; ctx.stroke();
            ctx.fillStyle = '#4f9cf9'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
            ctx.fillText('+', padX, sourceY - 4); ctx.fillText('-', padX, sourceY + 9);

            // Resistencia
            const rx = padX + cw / 2;
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(rx - 18, padY - 6, 36, 12);
            ctx.strokeRect(rx - 18, padY - 6, 36, 12);
            ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(rx - 12, padY - 3); ctx.lineTo(rx - 12, padY + 3);
            ctx.moveTo(rx - 3, padY - 3); ctx.lineTo(rx - 3, padY + 3);
            ctx.moveTo(rx + 6, padY - 3); ctx.lineTo(rx + 6, padY + 3);
            ctx.moveTo(rx + 15, padY - 3); ctx.lineTo(rx + 15, padY + 3);
            ctx.stroke();
            ctx.fillStyle = '#94a3b8'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
            ctx.fillText(`${Rs.toFixed(0)}Ω`, rx, padY - 12);

            // LED
            const ledX = padX + cw, ledY = padY + ch / 2;
            ctx.strokeStyle = '#334155'; ctx.lineWidth = 2;

            if (ledQuemado) {
                // LED quemado
                ctx.fillStyle = '#333';
                ctx.beginPath();
                ctx.moveTo(ledX - 10, ledY - 10);
                ctx.lineTo(ledX + 10, ledY);
                ctx.lineTo(ledX - 10, ledY + 10);
                ctx.closePath(); ctx.fill(); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(ledX + 10, ledY - 10); ctx.lineTo(ledX + 10, ledY + 10); ctx.stroke();
                // X de quemado
                ctx.strokeStyle = '#ff4444'; ctx.lineWidth = 2.5;
                ctx.beginPath(); ctx.moveTo(ledX - 6, ledY - 6); ctx.lineTo(ledX + 6, ledY + 6); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(ledX + 6, ledY - 6); ctx.lineTo(ledX - 6, ledY + 6); ctx.stroke();
                // Humo
                for (let i = 0; i < 4; i++) {
                    const alpha = 0.15 + 0.1 * Math.sin(t * 2 + i * 2.5);
                    ctx.fillStyle = `rgba(120,120,120,${alpha})`;
                    ctx.beginPath();
                    ctx.arc(ledX + 15 + i * 6, ledY - 15 - i * 8 + Math.sin(t + i) * 3, 6 + i * 2, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.fillStyle = '#ff4444'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
                ctx.fillText('LED QUEMADO', ledX, ledY + ch / 2 + 18);
                ctx.fillText(`I=${I_ma.toFixed(0)}mA > 30mA`, ledX, ledY + ch / 2 + 33);
            } else {
                // LED normal o encendido
                const blink = Il > 0 && ledBrillo > 0.8 ? (0.7 + 0.3 * Math.sin(t * 8)) : 1;
                const r_color = Math.floor(200 * ledBrillo * blink + 55);
                const g_color = Math.floor(60 * ledBrillo * blink);
                const color = `rgb(${r_color},${g_color},0)`;

                ctx.fillStyle = Il > 0 ? color : '#475569';
                ctx.beginPath();
                ctx.moveTo(ledX - 10, ledY - 10);
                ctx.lineTo(ledX + 10, ledY);
                ctx.lineTo(ledX - 10, ledY + 10);
                ctx.closePath(); ctx.fill(); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(ledX + 10, ledY - 10); ctx.lineTo(ledX + 10, ledY + 10); ctx.stroke();

                if (Il > 0) {
                    ctx.shadowColor = `rgba(255,${Math.floor(150 * ledBrillo)},0,${0.4 * ledBrillo})`;
                    ctx.shadowBlur = 25 * ledBrillo;
                    ctx.fillStyle = `rgba(255,${Math.floor(150 * ledBrillo)},0,${0.12 * ledBrillo})`;
                    ctx.beginPath(); ctx.arc(ledX, ledY, 22, 0, Math.PI * 2); ctx.fill();
                    ctx.shadowBlur = 0;

                    // Flechas de luz
                    if (ledBrillo > 0.3) {
                        ctx.strokeStyle = `rgba(255,200,50,${0.4 * ledBrillo})`; ctx.lineWidth = 1.5;
                        ctx.beginPath();
                        ctx.moveTo(ledX + 14, ledY - 8); ctx.lineTo(ledX + 24, ledY - 14);
                        ctx.moveTo(ledX + 14, ledY - 2); ctx.lineTo(ledX + 24, ledY - 8);
                        ctx.stroke();
                    }
                }

                // Partículas de corriente
                if (Il > 0) {
                    ctx.fillStyle = '#4ade80';
                    const vel = Math.max(10, Il * 150);
                    const perimetro = 2 * (cw + ch);
                    for (let i = 0; i < 5; i++) {
                        let p = ((t * 100 * vel + i * perimetro / 5) % perimetro);
                        let ex, ey;
                        if (p < cw) { ex = padX + p; ey = padY; }
                        else if (p < cw + ch) { ex = padX + cw; ey = padY + (p - cw); }
                        else if (p < 2 * cw + ch) { ex = padX + cw - (p - cw - ch); ey = padY + ch; }
                        else { ex = padX; ey = padY + ch - (p - 2 * cw - ch); }
                        ctx.beginPath(); ctx.arc(ex, ey, 2.5, 0, Math.PI * 2); ctx.fill();
                    }
                }
            }

            // Etiquetas
            ctx.fillStyle = '#64748b'; ctx.font = '8px monospace'; ctx.textAlign = 'left';
            ctx.fillText(`Vs: ${Vs}V`, padX - 10, padY - 10);
            ctx.fillText(`I: ${I_ma.toFixed(0)}mA`, ledX - 40, ledY + ch / 2 + 15);
        });
    },

    // -------------------------------------------------------------------------
    // EL2. 555 ASTABLE — Osciloscopio + LED de salida parpadeante
    // -------------------------------------------------------------------------
    astable555: function(canvas, freq, duty, R1, R2, C) {
        if (!canvas.id) canvas.id = 'canvas_555';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);

            const centerY = h * 0.55;
            const amp = h * 0.2;
            const t = Date.now() * 0.001;
            const timeOffset = (Date.now() * 0.08) % w;

            // Reticula
            ctx.strokeStyle = 'rgba(51,65,85,0.2)'; ctx.lineWidth = 1;
            for (let x = 15; x < w; x += 20) { ctx.beginPath(); ctx.moveTo(x, 10); ctx.lineTo(x, h - 30); ctx.stroke(); }
            for (let y = 15; y < h - 30; y += 15) { ctx.beginPath(); ctx.moveTo(15, y); ctx.lineTo(w - 15, y); ctx.stroke(); }

            // LED de salida (esquina superior derecha)
            const salidaAlta = (timeOffset % (500 / (freq || 1))) < (500 / (freq || 1)) * (duty / 100);
            const ledOn = salidaAlta;
            const ledX = w - 25, ledY = 20;
            ctx.fillStyle = ledOn ? '#ef4444' : '#333';
            ctx.shadowColor = ledOn ? 'rgba(239,68,68,0.6)' : 'transparent';
            ctx.shadowBlur = ledOn ? 15 : 0;
            ctx.beginPath(); ctx.arc(ledX, ledY, 6, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#4a5570'; ctx.lineWidth = 1; ctx.stroke();
            ctx.fillStyle = '#94a3b8'; ctx.font = '7px monospace'; ctx.textAlign = 'center';
            ctx.fillText('OUT', ledX, ledY + 18);

            // Onda cuadrada
            ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2.5;
            ctx.beginPath();
            const periodoPixels = Math.max(30, Math.min(150, 500 / (freq || 1)));
            const pulsoAltoPixels = periodoPixels * (duty / 100);
            let primerPunto = true;
            for (let x = 15; x < w - 15; x++) {
                let cicloLocal = (x + timeOffset) % periodoPixels;
                let estadoAlto = cicloLocal < pulsoAltoPixels;
                let targetY = estadoAlto ? (centerY - amp) : (centerY + amp);
                if (primerPunto) { ctx.moveTo(x, targetY); primerPunto = false; }
                else { ctx.lineTo(x, targetY); }
            }
            ctx.stroke();

            // Etiquetas
            ctx.fillStyle = '#94a3b8'; ctx.font = '8px monospace'; ctx.textAlign = 'left';
            const freqStr = freq > 1000 ? `${(freq/1000).toFixed(2)}kHz` : `${freq.toFixed(1)}Hz`;
            ctx.fillText(`FREC: ${freqStr}`, 15, h - 12);
            ctx.fillText(`DUTY: ${duty.toFixed(1)}%`, 15, h - 2);
            ctx.fillStyle = '#64748b'; ctx.font = '7px monospace';
            ctx.fillText(`R1:${R1}Ω R2:${R2}Ω C:${(C*1e6).toFixed(0)}µF`, w / 2, h - 2);
        });
    },

    // -------------------------------------------------------------------------
    // EL3. FILTRO RC — Carga/descarga de capacitor + curva de respuesta
    // -------------------------------------------------------------------------
    rc: function(canvas, fc, R, C) {
        if (!canvas.id) canvas.id = 'canvas_rc';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);

            const t = Date.now() * 0.002;
            const tau = R * C;
            const vc = 1 - Math.exp(-t / (tau || 1)); // Carga del capacitor

            // Circuito RC a la izquierda
            const circX = 25, circW = Math.min(w * 0.35, 130);
            const cy = h / 2 - 10;

            // Cable entrada
            ctx.strokeStyle = '#4a5570'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(circX, cy - 25); ctx.lineTo(circX + circW * 0.3, cy - 25); ctx.stroke();

            // Resistencia
            ctx.strokeStyle = '#4f9cf9'; ctx.lineWidth = 2.5;
            const rx = circX + circW * 0.3;
            ctx.beginPath();
            ctx.moveTo(rx, cy - 25); ctx.lineTo(rx + 6, cy - 18);
            ctx.lineTo(rx - 6, cy - 8); ctx.lineTo(rx + 6, cy + 2);
            ctx.lineTo(rx - 6, cy + 12); ctx.lineTo(rx + 6, cy + 22);
            ctx.lineTo(rx, cy + 30);
            ctx.stroke();
            ctx.fillStyle = '#94a3b8'; ctx.font = '7px monospace'; ctx.textAlign = 'center';
            ctx.fillText(`R:${R.toFixed(0)}Ω`, rx, cy + 42);

            // Capacitor
            const capX = rx + 15;
            ctx.strokeStyle = '#f9c74f'; ctx.lineWidth = 2.5;
            ctx.beginPath(); ctx.moveTo(capX, cy - 20); ctx.lineTo(capX, cy + 25); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(capX + 10, cy - 20); ctx.lineTo(capX + 10, cy + 25); ctx.stroke();
            // Carga visual del capacitor (relleno entre placas)
            const cargaColor = `rgba(249,199,79,${vc * 0.4})`;
            ctx.fillStyle = cargaColor;
            ctx.fillRect(capX + 1, cy - 18 + (1 - vc) * 38, 9, vc * 38);
            ctx.fillStyle = '#94a3b8'; ctx.font = '7px monospace'; ctx.textAlign = 'center';
            ctx.fillText(`C:${(C * 1e6).toFixed(0)}µF`, capX + 5, cy + 42);

            // Cable salida + tierra
            ctx.strokeStyle = '#4a5570'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(capX + 10, cy + 25); ctx.lineTo(capX + 10, cy + 40); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(capX + 2, cy + 40); ctx.lineTo(capX + 18, cy + 40); ctx.stroke();

            // Gráfico de respuesta (derecha)
            const plotX = circW + 35, plotY = 25, plotW = w - plotX - 15, plotH = h - 60;
            if (plotW > 20) {
                ctx.strokeStyle = '#4a5570'; ctx.lineWidth = 1;
                ctx.strokeRect(plotX, plotY, plotW, plotH);

                // Curva de Bode
                ctx.beginPath(); ctx.strokeStyle = '#4fffa0'; ctx.lineWidth = 2.5;
                for (let i = 0; i <= 100; i++) {
                    const fNorm = Math.pow(100, i / 100) * 0.01;
                    const gain = 1 / Math.sqrt(1 + Math.pow(fNorm, 2));
                    const x = plotX + (i / 100) * plotW;
                    const y = plotY + (1 - gain) * plotH;
                    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                }
                ctx.stroke();

                // Línea de corte fc
                if (fc) {
                    const cutoffX = plotX + 0.5 * plotW;
                    ctx.beginPath(); ctx.strokeStyle = '#ff6666'; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5;
                    ctx.moveTo(cutoffX, plotY); ctx.lineTo(cutoffX, plotY + plotH);
                    ctx.stroke(); ctx.setLineDash([]);
                    ctx.fillStyle = '#ff6666'; ctx.font = '7px monospace'; ctx.textAlign = 'center';
                    ctx.fillText(`fc=${fc.toFixed(0)}Hz`, cutoffX, plotY - 5);
                }

                // Ejes
                ctx.fillStyle = '#64748b'; ctx.font = '7px monospace'; ctx.textAlign = 'center';
                ctx.fillText('f →', plotX + plotW / 2, plotY + plotH + 12);
                ctx.fillText('Ganancia', plotX + plotW / 2, plotY - 10);
            }

            // Carga/descarga animada
            const barX = 10, barY = h - 35, barW = 8, barH = 25;
            ctx.fillStyle = '#f9c74f';
            ctx.fillRect(barX, barY + barH - vc * barH, barW, vc * barH);
            ctx.strokeStyle = '#4a5570'; ctx.lineWidth = 1;
            ctx.strokeRect(barX, barY, barW, barH);
            ctx.fillStyle = '#94a3b8'; ctx.font = '6px monospace'; ctx.textAlign = 'center';
            ctx.fillText('Vc', barX + barW / 2, barY + barH + 10);
        });
    },

    // -------------------------------------------------------------------------
    // EL4. GANANCIA EN dB — Onda pequeña → grande (o viceversa) + clipping
    // -------------------------------------------------------------------------
    db: function(canvas, tipo, entrada, salida, db) {
        if (!canvas.id) canvas.id = 'canvas_db';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);

            const t = Date.now() * 0.003;
            const amplifica = db >= 0;
            const clip = db > 20;

            const lx = 30, rx = w - 30;
            const cw = rx - lx;
            const inW = cw * 0.2, outW = cw * 0.2;
            const cx = (lx + rx) / 2;
            const cy = h / 2;

            // Bloque central (amplificador/atenuador)
            const bx = cx - 30, by = cy - 25, bw = 60, bh = 50;
            const grad = ctx.createLinearGradient(bx, by, bx, by + bh);
            grad.addColorStop(0, '#1e293b'); grad.addColorStop(1, '#0f172a');
            ctx.fillStyle = grad; ctx.fillRect(bx, by, bw, bh);
            ctx.strokeStyle = amplifica ? '#4fffa0' : '#f97316'; ctx.lineWidth = 2;
            ctx.strokeRect(bx, by, bw, bh);
            ctx.fillStyle = amplifica ? '#4fffa0' : '#f97316';
            ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
            ctx.fillText(amplifica ? 'AMP' : 'ATT', cx, cy + 3);

            // Flecha
            ctx.strokeStyle = '#f9c74f'; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(bx - 10, cy); ctx.lineTo(bx + 5, cy); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(bx + bw + 5, cy); ctx.lineTo(bx + bw + 10, cy); ctx.stroke();
            // Punta flecha
            ctx.fillStyle = '#f9c74f';
            ctx.beginPath(); ctx.moveTo(bx - 15, cy - 6); ctx.lineTo(bx - 10, cy); ctx.lineTo(bx - 15, cy + 6); ctx.closePath(); ctx.fill();
            ctx.beginPath(); ctx.moveTo(bx + bw + 15, cy - 6); ctx.lineTo(bx + bw + 10, cy); ctx.lineTo(bx + bw + 15, cy + 6); ctx.closePath(); ctx.fill();

            // Onda de entrada (pequeña)
            const inAmp = 15;
            ctx.strokeStyle = '#4f9cf9'; ctx.lineWidth = 2;
            ctx.beginPath();
            for (let x = lx; x < lx + inW; x++) {
                const phase = (x - lx) / inW * Math.PI * 4 + t * 3;
                const y = cy + Math.sin(phase) * inAmp;
                if (x === lx) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.fillStyle = '#94a3b8'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
            ctx.fillText(`In: ${entrada}`, lx + inW / 2, cy + 28);

            // Onda de salida (amplificada/atenuada)
            const outAmp = clip ? 40 : amplifica ? Math.min(40, inAmp * Math.pow(10, db / 20)) : Math.max(4, inAmp * Math.pow(10, db / 20));
            ctx.strokeStyle = clip ? '#ff4444' : '#4fffa0'; ctx.lineWidth = 2;
            ctx.beginPath();
            for (let x = rx - outW; x < rx; x++) {
                let phase = (x - (rx - outW)) / outW * Math.PI * 4 + t * 3;
                let y = cy + Math.sin(phase) * outAmp;
                if (clip) {
                    y = Math.max(cy - 35, Math.min(cy + 35, y));
                }
                if (x === rx - outW) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.stroke();

            // Clipping indicator
            if (clip) {
                ctx.fillStyle = '#ff4444';
                ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center';
                ctx.fillText('¡CLIPPING!', cx, cy + bh / 2 + 18);
            }

            ctx.fillStyle = '#e8edf5'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
            ctx.fillText(`Out: ${salida}`, rx - outW / 2, cy + 28);
            ctx.fillStyle = db >= 0 ? '#4fffa0' : '#f97316';
            ctx.font = 'bold 14px monospace';
            ctx.fillText(`${db.toFixed(2)} dB`, cx, 22);
        });
    },

    // -------------------------------------------------------------------------
    // EL5. RECTIFICADOR — Puente de diodos + LED de salida
    // -------------------------------------------------------------------------
    rectificador: function(canvas, Vrms, Vdc, Vripple, C, Rload) {
        if (!canvas.id) canvas.id = 'canvas_rect';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);

            const t = Date.now() * 0.002;
            const cx = w / 2, cy = h / 2;

            // AC input (izquierda) — onda senoidal
            const acX = 20, acW = 50;
            ctx.strokeStyle = '#4f9cf9'; ctx.lineWidth = 2;
            ctx.beginPath();
            for (let x = acX; x < acX + acW; x++) {
                const phase = (x - acX) / acW * Math.PI * 4 + t * 5;
                ctx.lineTo(x, cy + Math.sin(phase) * 20);
            }
            ctx.stroke();
            ctx.fillStyle = '#94a3b8'; ctx.font = '7px monospace'; ctx.textAlign = 'center';
            ctx.fillText(`AC ${Vrms.toFixed(1)}V`, acX + acW / 2, cy - 26);

            // Puente de diodos (4 diodos en rombo)
            const bx = cx - 30, by = cy - 30, bw = 60, bh = 60;
            const parPolaridad = Math.sin(t * 5) > 0;

            // Diodos: superior-izquierdo, superior-derecho, inferior-izquierdo, inferior-derecho
            ctx.strokeStyle = '#4a5570'; ctx.lineWidth = 2;
            ctx.strokeRect(bx, by, bw, bh);

            // 4 diodos en las esquinas
            const diodos = [
                { x: bx, y: by, rot: 0 },    // sup-izq -> der
                { x: bx + bw, y: by, rot: 1 }, // sup-der -> abajo
                { x: bx + bw, y: by + bh, rot: 2 }, // inf-der -> izq
                { x: bx, y: by + bh, rot: 3 } // inf-izq -> arriba
            ];

            for (let i = 0; i < 4; i++) {
                const d = diodos[i];
                const activo = (i < 2) === parPolaridad;
                ctx.save();
                ctx.translate(d.x, d.y);
                ctx.rotate(d.rot * Math.PI / 2);

                ctx.fillStyle = activo ? '#ef4444' : '#475569';
                ctx.beginPath();
                ctx.moveTo(-8, -6); ctx.lineTo(8, 0); ctx.lineTo(-8, 6);
                ctx.closePath(); ctx.fill();
                ctx.strokeStyle = '#4a5570'; ctx.lineWidth = 1; ctx.stroke();
                ctx.beginPath(); ctx.moveTo(8, -6); ctx.lineTo(8, 6); ctx.stroke();

                if (activo) {
                    ctx.shadowColor = 'rgba(239,68,68,0.5)'; ctx.shadowBlur = 10;
                    ctx.fillStyle = 'rgba(239,68,68,0.15)';
                    ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill();
                    ctx.shadowBlur = 0;
                }
                ctx.restore();
            }

            // + / - labels
            ctx.fillStyle = '#ef4444'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
            ctx.fillText('+', bx + bw / 2, by - 5);
            ctx.fillStyle = '#4a5570'; ctx.font = '8px monospace';
            ctx.fillText('-', bx + bw / 2, by + bh + 14);

            // DC output (derecha) — onda rectificada
            const dcX = cx + 50, dcW = Math.min(60, w - dcX - 15);
            ctx.strokeStyle = '#f9c74f'; ctx.lineWidth = 2;
            ctx.beginPath();
            for (let x = dcX; x < dcX + dcW; x++) {
                const phase = (x - dcX) / dcW * Math.PI * 4 + t * 5;
                // Rectificación de onda completa: |sin|
                const val = Math.abs(Math.sin(phase));
                ctx.lineTo(x, cy + 25 - val * 40);
            }
            ctx.stroke();
            ctx.fillStyle = '#f9c74f'; ctx.font = '7px monospace'; ctx.textAlign = 'center';
            ctx.fillText(`DC ${Vdc.toFixed(1)}V`, dcX + dcW / 2, cy - 26);
            ctx.fillStyle = '#94a3b8'; ctx.font = '7px monospace';
            ctx.fillText(`ripple: ${(Vripple * 1000).toFixed(1)}mV`, dcX + dcW / 2, cy - 16);

            // LED de salida DC (esquina inferior derecha)
            const ledX = w - 25, ledY = h - 25;
            const ledBrillo = Vdc > 0 ? Math.min(1, Vdc / 12) : 0;
            ctx.fillStyle = ledBrillo > 0.1 ? `rgb(${Math.floor(200 * ledBrillo + 55)},30,0)` : '#333';
            ctx.beginPath();
            ctx.moveTo(ledX - 8, ledY - 8); ctx.lineTo(ledX + 8, ledY); ctx.lineTo(ledX - 8, ledY + 8);
            ctx.closePath(); ctx.fill();
            ctx.strokeStyle = '#4a5570'; ctx.lineWidth = 1; ctx.stroke();
            ctx.beginPath(); ctx.moveTo(ledX + 8, ledY - 6); ctx.lineTo(ledX + 8, ledY + 6); ctx.stroke();
            if (ledBrillo > 0.2) {
                ctx.shadowColor = 'rgba(255,100,0,0.4)'; ctx.shadowBlur = 15 * ledBrillo;
                ctx.fillStyle = `rgba(255,100,0,${0.1 * ledBrillo})`;
                ctx.beginPath(); ctx.arc(ledX, ledY, 16, 0, Math.PI * 2); ctx.fill();
                ctx.shadowBlur = 0;
            }
            ctx.fillStyle = '#94a3b8'; ctx.font = '6px monospace'; ctx.textAlign = 'center';
            ctx.fillText('DC OUT', ledX, ledY + 20);

            // Capacitor (si se usa)
            if (C > 0) {
                const capX = cx + 20, capY = h - 45;
                ctx.strokeStyle = '#f9c74f'; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(capX, capY - 8); ctx.lineTo(capX, capY + 8); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(capX + 8, capY - 8); ctx.lineTo(capX + 8, capY + 8); ctx.stroke();
                ctx.fillStyle = '#94a3b8'; ctx.font = '6px monospace'; ctx.textAlign = 'center';
                ctx.fillText(`${(C * 1e6).toFixed(0)}µF`, capX + 4, capY + 20);
            }
        });
    },

    // -------------------------------------------------------------------------
    // EL6. OP-AMP — Amplificador operacional inversor con señales
    // -------------------------------------------------------------------------
    opamp: function(canvas, tipo, Vin, Vout, R1, Rf, ganancia) {
        if (!canvas.id) canvas.id = 'canvas_opamp';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);

            const t = Date.now() * 0.003;
            const cx = w / 2, cy = h / 2;

            // Símbolo del Op-Amp (triángulo)
            const opX = cx - 20, opY = cy - 35, opW = 40, opH = 70;
            ctx.fillStyle = '#1e293b';
            ctx.beginPath();
            ctx.moveTo(opX + opW, cy);
            ctx.lineTo(opX, opY);
            ctx.lineTo(opX, opY + opH);
            ctx.closePath(); ctx.fill();
            ctx.strokeStyle = '#4fffa0'; ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(opX + opW, cy);
            ctx.lineTo(opX, opY);
            ctx.lineTo(opX, opY + opH);
            ctx.closePath(); ctx.stroke();
            ctx.fillStyle = '#4fffa0'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
            ctx.fillText('A', cx, cy + 4);

            // Entrada (-) pin superior
            ctx.strokeStyle = '#4a5570'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(opX - 20, cy - 20); ctx.lineTo(opX, cy - 20); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(opX - 25, cy - 20); ctx.lineTo(opX - 25, cy - 20); ctx.stroke();
            ctx.fillStyle = '#e8edf5'; ctx.font = '8px monospace'; ctx.textAlign = 'right';
            ctx.fillText('−', opX - 3, cy - 16);

            // Entrada (+) pin inferior (tierra virtual)
            ctx.beginPath(); ctx.moveTo(opX - 20, cy + 20); ctx.lineTo(opX, cy + 20); ctx.stroke();
            ctx.fillStyle = '#e8edf5'; ctx.font = '8px monospace'; ctx.textAlign = 'right';
            ctx.fillText('+', opX - 3, cy + 24);

            // R1 (entrada)
            ctx.strokeStyle = '#4f9cf9'; ctx.lineWidth = 2;
            const r1x = opX - 30;
            ctx.beginPath();
            ctx.moveTo(r1x - 20, cy - 20); ctx.lineTo(r1x - 10, cy - 20);
            ctx.lineTo(r1x - 5, cy - 26); ctx.lineTo(r1x + 5, cy - 14);
            ctx.lineTo(r1x + 15, cy - 26); ctx.lineTo(r1x + 25, cy - 14);
            ctx.lineTo(r1x + 30, cy - 20);
            ctx.stroke();
            ctx.fillStyle = '#94a3b8'; ctx.font = '7px monospace'; ctx.textAlign = 'center';
            ctx.fillText(`R1:${R1.toFixed(0)}Ω`, r1x + 5, cy - 32);

            // Rf (retroalimentación)
            ctx.strokeStyle = '#f97316'; ctx.lineWidth = 2;
            const rfx = opX + opW + 10;
            ctx.beginPath();
            ctx.moveTo(rfx - 5, cy - 5); ctx.lineTo(rfx + 5, cy - 5);
            ctx.lineTo(rfx + 15, cy + 5); ctx.lineTo(rfx + 25, cy - 5);
            ctx.lineTo(rfx + 35, cy + 5); ctx.lineTo(rfx + 40, cy);
            ctx.stroke();
            ctx.fillStyle = '#94a3b8'; ctx.font = '7px monospace'; ctx.textAlign = 'center';
            ctx.fillText(`Rf:${Rf.toFixed(0)}Ω`, rfx + 20, cy - 12);

            // Conexión feedback
            ctx.strokeStyle = '#4a5570'; ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(opX + opW, cy);
            ctx.lineTo(rfx + 45, cy);
            ctx.lineTo(rfx + 45, cy + 40);
            ctx.lineTo(r1x - 25, cy + 40);
            ctx.lineTo(r1x - 25, cy - 20);
            ctx.stroke();

            // Señal de entrada (onda pequeña, izquierda)
            const inX = 15, inW = 45;
            ctx.strokeStyle = '#4f9cf9'; ctx.lineWidth = 2;
            ctx.beginPath();
            for (let x = inX; x < inX + inW; x++) {
                const phase = (x - inX) / inW * Math.PI * 4 + t * 3;
                ctx.lineTo(x, cy - 20 + Math.sin(phase) * 10);
            }
            ctx.stroke();
            ctx.fillStyle = '#94a3b8'; ctx.font = '7px monospace'; ctx.textAlign = 'center';
            ctx.fillText(`Vin: ${Vin.toFixed(2)}V`, inX + inW / 2, cy - 36);

            // Señal de salida (onda amplificada, derecha)
            const outX = w - 70, outW = 50;
            const ampSalida = Math.abs(Vout) > 10 ? 10 : Math.abs(Vout);
            const clip = Math.abs(Vout) > 12;
            ctx.strokeStyle = clip ? '#ff4444' : '#4fffa0'; ctx.lineWidth = 2;
            ctx.beginPath();
            for (let x = outX; x < outX + outW; x++) {
                let phase = (x - outX) / outW * Math.PI * 4 + t * 3;
                let y = cy + Math.sin(phase) * (3 + ampSalida * 2);
                if (clip) y = Math.max(cy - 35, Math.min(cy + 35, y));
                ctx.lineTo(x, y);
            }
            ctx.stroke();

            ctx.fillStyle = '#e8edf5'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
            ctx.fillText(`Vout: ${Vout.toFixed(2)}V`, outX + outW / 2, cy + 30);
            ctx.fillStyle = '#94a3b8'; ctx.font = '8px monospace';
            ctx.fillText(`G = ${ganancia.toFixed(1)}`, outX + outW / 2, cy + 40);

            if (clip) {
                ctx.fillStyle = '#ff4444'; ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center';
                ctx.fillText('¡SATURADO!', cx + 30, cy + 55);
            }

            // Tierra
            ctx.strokeStyle = '#4a5570'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(cx - 20, cy + 40); ctx.lineTo(cx - 20, cy + 50);
            ctx.stroke();
            ctx.beginPath(); ctx.moveTo(cx - 28, cy + 50); ctx.lineTo(cx - 12, cy + 50); ctx.stroke();
        });
    },

    // =========================================================================
    // ELECTRÓNICA ESCOLAR (3)
    // =========================================================================

    // -------------------------------------------------------------------------
    // EL7. CAPACITORES — Placas paralelas con carga animada
    // -------------------------------------------------------------------------
    capacitores: function(canvas, C1, C2, ceqSerie, ceqParalelo) {
        if (!canvas.id) canvas.id = 'canvas_capacitores';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);

            const t = Date.now() * 0.003;
            const sx = w / 4, px = 3 * w / 4;
            const cy = h / 2;

            // --- SERIE (left) ---
            ctx.strokeStyle = '#4f9cf9'; ctx.lineWidth = 2.5;
            ctx.beginPath(); ctx.moveTo(sx - 15, cy - 25); ctx.lineTo(sx + 15, cy - 25); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(sx - 15, cy + 15); ctx.lineTo(sx + 15, cy + 15); ctx.stroke();
            const carga = 0.3 + 0.3 * Math.sin(t * 2);
            ctx.fillStyle = `rgba(79,252,249,${carga * 0.3})`;
            ctx.fillRect(sx - 12, cy - 23, 24, 36);
            ctx.fillStyle = '#94a3b8'; ctx.font = '7px monospace'; ctx.textAlign = 'center';
            ctx.fillText('Serie', sx, cy + 35);
            ctx.fillStyle = '#4fffa0'; ctx.font = '8px monospace';
            ctx.fillText(`${ceqSerie.toFixed(1)}µF`, sx, cy + 48);
            ctx.fillStyle = '#64748b'; ctx.font = '7px monospace';
            ctx.fillText(`C1=${C1}µF`, sx, cy - 32);
            ctx.fillText(`C2=${C2}µF`, sx, cy + 22);

            // --- PARALELO (right) ---
            for (let i = 0; i < 2; i++) {
                const ox = px + (i - 0.5) * 36;
                ctx.strokeStyle = '#4f9cf9'; ctx.lineWidth = 2.5;
                ctx.beginPath(); ctx.moveTo(ox - 8, cy - 25); ctx.lineTo(ox + 8, cy - 25); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(ox - 8, cy + 15); ctx.lineTo(ox + 8, cy + 15); ctx.stroke();
                ctx.fillStyle = `rgba(79,252,249,${carga * 0.2})`;
                ctx.fillRect(ox - 6, cy - 23, 12, 36);
                if (i === 0) { ctx.fillStyle = '#64748b'; ctx.font = '7px monospace'; ctx.textAlign = 'center'; ctx.fillText(`C1=${C1}µF`, ox, cy + 48); }
            }
            ctx.fillStyle = '#94a3b8'; ctx.font = '7px monospace'; ctx.textAlign = 'center';
            ctx.fillText('Paralelo', px, cy + 35);
            ctx.fillStyle = '#4fffa0'; ctx.font = '8px monospace';
            ctx.fillText(`${ceqParalelo.toFixed(1)}µF`, px, cy + 48);

            ctx.fillStyle = '#e8edf5'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
            ctx.fillText('Capacitores — Serie / Paralelo', w / 2, 14);
        });
    },

    // -------------------------------------------------------------------------
    // EL8. FRECUENCIA Y PERÍODO — Onda senoidal con marcadores
    // -------------------------------------------------------------------------
    frecuenciaPeriodo: function(canvas, freq, period) {
        if (!canvas.id) canvas.id = 'canvas_frecuencia';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);

            const t = Date.now() * 0.002;
            const pad = 25;
            const cy = h / 2;
            const amp = Math.min(h / 3, 40);
            const cw = w - 2 * pad;
            const freqRad = Math.max(freq * 0.5, 0.5);

            ctx.strokeStyle = 'rgba(51,65,85,0.2)'; ctx.lineWidth = 1;
            for (let x = pad; x < w - pad; x += 25) { ctx.beginPath(); ctx.moveTo(x, 10); ctx.lineTo(x, h - 10); ctx.stroke(); }
            for (let y = 10; y < h - 10; y += 20) { ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(w - pad, y); ctx.stroke(); }

            ctx.strokeStyle = '#4a5570'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(pad, cy); ctx.lineTo(w - pad, cy); ctx.stroke();

            ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2.5;
            ctx.beginPath();
            for (let x = 0; x < cw; x++) {
                const phase = (x / cw) * Math.PI * 2 * freqRad + t * freqRad;
                const y = cy + Math.sin(phase) * amp;
                if (x === 0) ctx.moveTo(pad + x, y); else ctx.lineTo(pad + x, y);
            }
            ctx.stroke();

            const periodoPx = cw / Math.max(freqRad, 0.1);
            const px = pad + ((t * freqRad * cw / Math.max(freqRad, 0.5)) % periodoPx);
            ctx.strokeStyle = '#ff6666'; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(px, cy - amp - 5); ctx.lineTo(px, cy + amp + 5); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(px + periodoPx, cy - amp - 5); ctx.lineTo(px + periodoPx, cy + amp + 5); ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = '#ff6666'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
            ctx.fillText('← T →', px + periodoPx / 2, cy + amp + 18);

            ctx.fillStyle = '#e8edf5'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'left';
            ctx.fillText(`f = ${freq.toFixed(2)} Hz`, pad, 16);
            ctx.fillStyle = '#4fffa0';
            ctx.fillText(`T = ${period.toFixed(4)} s`, pad, 32);
        });
    },

    // -------------------------------------------------------------------------
    // EL9. TRANSFORMADOR IDEAL — Bobinas con flujo magnético
    // -------------------------------------------------------------------------
    transformador: function(canvas, Vp, Vs, Np, Ns) {
        if (!canvas.id) canvas.id = 'canvas_transformador';
        this.startLoop(canvas.id, () => {
            const ctx = this.initCanvas(canvas);
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);

            const t = Date.now() * 0.003;
            const cx = w / 2, cy = h / 2;
            const relacion = Np > 0 && Ns > 0 ? Np / Ns : 1;

            ctx.fillStyle = '#1e293b'; ctx.strokeStyle = '#4a5570'; ctx.lineWidth = 1.5;
            ctx.fillRect(cx - 8, cy - 55, 16, 110);
            ctx.strokeRect(cx - 8, cy - 55, 16, 110);

            const pX = cx - 35;
            ctx.strokeStyle = '#4f9cf9'; ctx.lineWidth = 2.5;
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const yy = cy - 40 + i * 16;
                ctx.moveTo(pX, yy); ctx.lineTo(pX - 10, yy + 6);
                ctx.lineTo(pX + 10, yy + 10); ctx.lineTo(pX - 10, yy + 14);
                ctx.lineTo(pX + 10, yy + 18); ctx.lineTo(pX, yy + 20);
            }
            ctx.stroke();

            const sX = cx + 25;
            ctx.strokeStyle = '#f9c74f'; ctx.lineWidth = 2.5;
            ctx.beginPath();
            for (let i = 0; i < 4; i++) {
                const yy = cy - 30 + i * 20;
                ctx.moveTo(sX, yy); ctx.lineTo(sX - 8, yy + 6);
                ctx.lineTo(sX + 8, yy + 10); ctx.lineTo(sX - 8, yy + 14);
                ctx.lineTo(sX + 8, yy + 18); ctx.lineTo(sX, yy + 22);
            }
            ctx.stroke();

            ctx.strokeStyle = `rgba(79,255,160,${0.15 + 0.1 * Math.sin(t * 2)})`;
            ctx.lineWidth = 1.5;
            for (let i = 0; i < 3; i++) {
                const yy = cy - 30 + i * 30;
                ctx.beginPath();
                ctx.moveTo(cx - 8, yy); ctx.quadraticCurveTo(cx, yy + Math.sin(t * 3 + i) * 10, cx + 8, yy);
                ctx.stroke();
            }

            ctx.fillStyle = '#4f9cf9'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
            ctx.fillText(`Vp: ${Vp.toFixed(1)}V`, pX, cy + 50);
            ctx.fillStyle = '#f9c74f';
            ctx.fillText(`Vs: ${Vs.toFixed(1)}V`, sX, cy + 50);
            ctx.fillStyle = '#64748b'; ctx.font = '8px monospace';
            ctx.fillText(`Np:${Np} esp`, pX, cy + 64);
            ctx.fillText(`Ns:${Ns} esp`, sX, cy + 64);
            ctx.fillStyle = '#e8edf5'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
            ctx.fillText(`Relación: ${relacion.toFixed(2)}:1`, cx, cy + 80);
            ctx.fillStyle = relacion > 1 ? '#94a3b8' : '#f9c74f';
            ctx.font = '9px monospace';
            ctx.fillText(relacion > 1 ? 'REDUCTOR' : 'ELEVADOR', cx, 16);
        });
    }
};

// =============================================================================
// POTENCIA Y ENERGÍA (5)
// =============================================================================

// -----------------------------------------------------------------------------
// PE1. POTENCIA TRIFÁSICA — Tres ondas con vector suma
// -----------------------------------------------------------------------------
ElectroVisual.potencia_trifasica = function(canvas, V, I, cosfi, P) {
    if (!canvas.id) canvas.id = 'canvas_potencia_trifasica';
    this.startLoop(canvas.id, () => {
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, h);

        const t = Date.now() * 0.003;
        const cx = w / 2, cy = h / 2;
        const amp = Math.min(25, h * 0.18);

        // Reticula
        ctx.strokeStyle = 'rgba(51,65,85,0.15)'; ctx.lineWidth = 1;
        for (let x = 15; x < w; x += 20) { ctx.beginPath(); ctx.moveTo(x, 10); ctx.lineTo(x, h - 10); ctx.stroke(); }
        for (let y = 15; y < h; y += 15) { ctx.beginPath(); ctx.moveTo(15, y); ctx.lineTo(w - 15, y); ctx.stroke(); }

        // Tres fases (R, S, T) — 120° desfasadas
        const colores = ['#ef4444', '#f9c74f', '#38bdf8'];
        const labels = ['R', 'S', 'T'];
        const fases = 3;
        const cw = w - 60;
        const ox = 30;

        for (let fase = 0; fase < fases; fase++) {
            ctx.strokeStyle = colores[fase]; ctx.lineWidth = 2;
            ctx.beginPath();
            for (let x = 0; x < cw; x++) {
                const phase = (x / cw) * Math.PI * 4 + t * 3 + (fase * 2 * Math.PI / 3);
                ctx.lineTo(ox + x, cy + Math.sin(phase) * amp);
            }
            ctx.stroke();
            ctx.fillStyle = colores[fase]; ctx.font = '9px monospace'; ctx.textAlign = 'center';
            ctx.fillText(labels[fase], ox + cw / 2 + (fase - 1) * 30, cy + amp + 16);
        }

        // Vector suma (potencia)
        ctx.fillStyle = '#4fffa0'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
        ctx.fillText(`P = √3 · V · I · cos φ`, cx, 16);
        ctx.fillStyle = '#e8edf5'; ctx.font = 'bold 13px monospace';
        ctx.fillText(`${P.toFixed(1)} W`, cx, 34);
        ctx.fillStyle = '#94a3b8'; ctx.font = '8px monospace';
        ctx.fillText(`V=${V}V | I=${I}A | cosφ=${cosfi}`, cx, h - 8);
    });
};

// -----------------------------------------------------------------------------
// PE2. REACTANCIA CAPACITIVA — Capacitor con ondas
// -----------------------------------------------------------------------------
ElectroVisual.reactancia_capacitiva = function(canvas, f, C, Xc) {
    if (!canvas.id) canvas.id = 'canvas_reactancia_capacitiva';
    this.startLoop(canvas.id, () => {
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, h);

        const t = Date.now() * 0.003;
        const cx = w / 2, cy = h / 2;

        // Placas del capacitor
        ctx.strokeStyle = '#f9c74f'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(cx - 15, cy - 35); ctx.lineTo(cx - 15, cy + 35); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + 15, cy - 35); ctx.lineTo(cx + 15, cy + 35); ctx.stroke();

        // Carga animada entre placas
        const carga = 0.3 + 0.3 * Math.sin(t * 3);
        ctx.fillStyle = `rgba(249,199,79,${carga * 0.25})`;
        ctx.fillRect(cx - 13, cy - 30, 26, 60);

        // Onda de corriente alterna
        const ampA = 20, ampB = 12;
        ctx.strokeStyle = '#4f9cf9'; ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = cx + 40; x < Math.min(w - 15, cx + 100); x++) {
            const phase = (x - cx) * 0.15 + t * 4;
            ctx.lineTo(x, cy - ampA * Math.sin(phase));
        }
        ctx.stroke();

        ctx.strokeStyle = '#4fffa0'; ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = cx + 40; x < Math.min(w - 15, cx + 100); x++) {
            const phase = (x - cx) * 0.15 + t * 4 + Math.PI / 2;
            ctx.lineTo(x, cy - ampB * Math.sin(phase));
        }
        ctx.stroke();

        // Labels
        ctx.fillStyle = '#f9c74f'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
        ctx.fillText(`Xc = ${Xc.toFixed(1)} Ω`, cx, h - 10);
        ctx.fillStyle = '#94a3b8'; ctx.font = '8px monospace';
        ctx.fillText(`${f.toFixed(1)} Hz`, cx, cy + 48);
        ctx.fillStyle = '#e8edf5'; ctx.font = 'bold 9px monospace';
        ctx.fillText(`C = ${(C * 1e6).toFixed(0)} µF`, cx, cy - 48);
    });
};

// -----------------------------------------------------------------------------
// PE3. REACTANCIA INDUCTIVA — Bobina con campo magnético
// -----------------------------------------------------------------------------
ElectroVisual.reactancia_inductiva = function(canvas, freq, L, Xl) {
    if (!canvas.id) canvas.id = 'canvas_reactancia_inductiva';
    this.startLoop(canvas.id, () => {
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, h);

        const t = Date.now() * 0.003;
        const cx = w / 2, cy = h / 2;

        // Bobina (zigzag horizontal)
        ctx.strokeStyle = '#4f9cf9'; ctx.lineWidth = 3;
        ctx.beginPath();
        const bx = cx - 40, by = cy;
        ctx.moveTo(bx, by);
        for (let i = 0; i < 8; i++) {
            const x = bx + i * 12;
            ctx.lineTo(x + 6, by - 20);
            ctx.lineTo(x + 12, by);
        }
        ctx.stroke();

        // Campo magnético (círculos concéntricos animados)
        for (let i = 0; i < 3; i++) {
            const r = 20 + i * 15 + 5 * Math.sin(t * 2 + i);
            ctx.strokeStyle = `rgba(79,156,249,${0.15 - i * 0.04})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
        }

        // Líneas de campo
        ctx.strokeStyle = `rgba(79,156,249,${0.1 + 0.08 * Math.sin(t * 3)})`;
        ctx.lineWidth = 1;
        for (let i = 0; i < 6; i++) {
            const ang = (i / 6) * Math.PI * 2 + t;
            const r1 = 15, r2 = 50;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1);
            ctx.lineTo(cx + Math.cos(ang) * r2, cy + Math.sin(ang) * r2);
            ctx.stroke();
        }

        // Labels
        ctx.fillStyle = '#4f9cf9'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
        ctx.fillText(`Xl = ${Xl.toFixed(1)} Ω`, cx, h - 10);
        ctx.fillStyle = '#94a3b8'; ctx.font = '8px monospace';
        ctx.fillText(`${freq.toFixed(1)} Hz  |  L = ${(L * 1000).toFixed(0)} mH`, cx, h - 24);
    });
};

// -----------------------------------------------------------------------------
// PE4. FRECUENCIA DE CORTE — Curva de Bode con marcador fc
// -----------------------------------------------------------------------------
ElectroVisual.frecuencia_corte = function(canvas, fc, tipo, R) {
    if (!canvas.id) canvas.id = 'canvas_frecuencia_corte';
    this.startLoop(canvas.id, () => {
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, h);

        const t = Date.now() * 0.002;
        const pad = 30, plotW = w - 2 * pad, plotH = h - 60;

        // Ejes
        ctx.strokeStyle = '#4a5570'; ctx.lineWidth = 1;
        ctx.strokeRect(pad, 20, plotW, plotH);

        // Curva de respuesta
        ctx.strokeStyle = tipo === 'rc' ? '#4f9cf9' : '#f9c74f'; ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let i = 0; i <= 100; i++) {
            const fNorm = Math.pow(200, i / 100) * 0.1;
            const gain = 1 / Math.sqrt(1 + Math.pow(fNorm, 2));
            const x = pad + (i / 100) * plotW;
            const y = pad + (1 - gain) * plotH;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Línea de corte
        if (fc) {
            const fcLog = Math.log10(fc / 10) / 2.3;
            const cutX = pad + Math.min(fcLog, 1) * plotW;
            ctx.strokeStyle = '#ff6666'; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(cutX, 20); ctx.lineTo(cutX, 20 + plotH); ctx.stroke(); ctx.setLineDash([]);
            ctx.fillStyle = '#ff6666'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
            ctx.fillText(`fc = ${fc.toFixed(0)} Hz`, cutX, 14);
        }

        // Pulso animado en la curva
        const cp = (0.5 + 0.5 * Math.sin(t * 1.5));
        const px = pad + cp * plotW;
        const gainP = 1 / Math.sqrt(1 + Math.pow(cp * 200 * 0.1, 2));
        const py = pad + (1 - gainP) * plotH;
        ctx.fillStyle = (tipo === 'rc' ? '#4f9cf9' : '#f9c74f');
        ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#e8edf5'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
        ctx.fillText(`Filtro ${tipo.toUpperCase()} — fc = ${fc.toFixed(1)} Hz`, w / 2, h - 6);
    });
};

// -----------------------------------------------------------------------------
// PE5. ENERGÍA kWh — Contador / medidor giratorio
// -----------------------------------------------------------------------------
ElectroVisual.energia_kwh = function(canvas, P, t, kWh, costo) {
    if (!canvas.id) canvas.id = 'canvas_energia_kwh';
    this.startLoop(canvas.id, () => {
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, h);

        const time = Date.now() * 0.003;
        const cx = w / 2, cy = h / 2;

        // Disco del medidor (giratorio)
        const r = Math.min(45, Math.min(w, h) * 0.3);
        const speed = Math.min(1, kWh / 10);
        const ang = time * speed * 2;

        // Fondo del disco
        ctx.fillStyle = '#1e293b';
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#4a5570'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();

        // Marcas del disco
        for (let i = 0; i < 20; i++) {
            const a = ang + (i / 20) * Math.PI * 2;
            const inner = r * 0.7, outer = r * 0.9;
            ctx.strokeStyle = i % 5 === 0 ? '#4fffa0' : '#4a5570';
            ctx.lineWidth = i % 5 === 0 ? 2 : 1;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
            ctx.lineTo(cx + Math.cos(a) * outer, cy + Math.sin(a) * outer);
            ctx.stroke();
        }

        // Centro del disco
        ctx.fillStyle = '#4a5570';
        ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill();

        // Número kWh
        ctx.fillStyle = '#4fffa0'; ctx.font = 'bold 14px monospace'; ctx.textAlign = 'center';
        ctx.fillText(`${kWh.toFixed(2)} kWh`, cx, cy + r + 24);
        ctx.fillStyle = '#94a3b8'; ctx.font = '9px monospace';
        ctx.fillText(`$${costo.toFixed(2)} @ $${(costo / (kWh || 1)).toFixed(2)}/kWh`, cx, cy + r + 40);

        // Barra de potencia
        const barX = 10, barY = 15, barW = 6, barH = Math.min(100, h - 30);
        const pct = Math.min(1, P / 2000);
        ctx.fillStyle = '#1e293b'; ctx.fillRect(barX, barY, barW, barH);
        const barGrad = ctx.createLinearGradient(0, barY + barH, 0, barY);
        barGrad.addColorStop(0, '#4ade80'); barGrad.addColorStop(0.5, '#facc15');
        barGrad.addColorStop(1, '#ef4444');
        ctx.fillStyle = barGrad;
        ctx.fillRect(barX, barY + barH - pct * barH, barW, pct * barH);
        ctx.fillStyle = '#94a3b8'; ctx.font = '7px monospace'; ctx.textAlign = 'center';
        ctx.fillText(`${(P / 1000).toFixed(1)}kW`, barX + barW / 2, barY - 4);
    });
};
