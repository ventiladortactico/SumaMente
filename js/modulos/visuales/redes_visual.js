window.RedesVisual = window.RedesVisual || {
    initCanvas(canvas) {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        return ctx;
    },
    _loop: {},
    _startLoop(canvas, fn) {
        if (this._loop[canvas.id]) cancelAnimationFrame(this._loop[canvas.id]);
        const animate = () => { fn(); this._loop[canvas.id] = requestAnimationFrame(animate); };
        animate();
    },
    _stopLoop(canvas) {
        if (this._loop[canvas.id]) { cancelAnimationFrame(this._loop[canvas.id]); delete this._loop[canvas.id]; }
    },

    subred(canvas, ip, bits, net, bcast, hosts) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        let t = 0;
        this._startLoop(canvas, () => {
            t += 0.02;
            ctx.clearRect(0, 0, w, h);
            // Fondo
            const grad = ctx.createLinearGradient(0, 0, w, h);
            grad.addColorStop(0, '#0d1117'); grad.addColorStop(1, '#161b22');
            ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
            // Bloque de red
            const bw = w - 40, bh = 30, bx = 20, by = 15;
            ctx.fillStyle = 'rgba(79,191,167,0.2)';
            ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 6); ctx.fill();
            ctx.fillStyle = '#4fbfa7'; ctx.font = '11px monospace';
            ctx.fillText(`Red: ${numToIpv4(net)} / ${bits}`, bx + 10, by + 20);
            // Bloque broadcast
            const by2 = by + bh + 10;
            ctx.fillStyle = 'rgba(249,199,79,0.2)';
            ctx.beginPath(); ctx.roundRect(bx, by2, bw, bh, 6); ctx.fill();
            ctx.fillStyle = '#f9c74f'; ctx.fillText(`Broadcast: ${numToIpv4(bcast)}`, bx + 10, by2 + 20);
            // Rango hosts
            const by3 = by2 + bh + 10;
            const first = bits >= 31 ? net : net + 1;
            const last = bits >= 31 ? bcast : bcast - 1;
            const pulse = 0.5 + 0.5 * Math.sin(t * 2);
            ctx.fillStyle = `rgba(79,251,123,${0.1 + 0.15 * pulse})`;
            ctx.beginPath(); ctx.roundRect(bx, by3, bw, bh * 2, 6); ctx.fill();
            ctx.fillStyle = '#4ff97b';
            ctx.font = '10px monospace';
            ctx.fillText(`Hosts: ${numToIpv4(first)} → ${numToIpv4(last)}`, bx + 10, by3 + 18);
            ctx.fillText(`[${hosts} hosts utilizables]`, bx + 10, by3 + 38);
            // Barra de hosts animada
            const barW = Math.min(1, hosts / 256) * (bw - 40);
            const barX = bx + 20, barY = by3 + bh * 2 + 15;
            ctx.fillStyle = 'rgba(79,251,123,0.15)';
            ctx.beginPath(); ctx.roundRect(barX, barY, bw - 40, 8, 4); ctx.fill();
            ctx.fillStyle = '#4ff97b';
            const animW = Math.min(barW, (bw - 40) * Math.min(1, t * 2));
            ctx.beginPath(); ctx.roundRect(barX, barY, animW, 8, 4); ctx.fill();
        });
    },

    hosts(canvas, bits, hosts) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        let t = 0;
        const masks = [24, 25, 26, 27, 28, 29, 30];
        const vals = masks.map(m => m >= 31 ? (m === 31 ? 2 : 0) : (1 << (32 - m)) - 2);
        const maxVal = Math.max(...vals);
        this._startLoop(canvas, () => {
            t += 0.03;
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, w, h);
            const barW = (w - 40) / masks.length - 4;
            const maxH = h - 50;
            masks.forEach((m, i) => {
                const bx = 20 + i * (barW + 4);
                const bh = (vals[i] / maxVal) * maxH;
                const isSelected = m === bits;
                const color = isSelected ? '#4fbfa7' : 'rgba(79,191,167,0.4)';
                const animH = Math.min(bh, (maxH) * Math.min(1, t + i * 0.08));
                ctx.fillStyle = color;
                ctx.beginPath(); ctx.roundRect(bx, h - 30 - animH, barW, animH, [3,3,0,0]); ctx.fill();
                ctx.fillStyle = isSelected ? '#4ff97b' : '#4fbfa7';
                ctx.font = '9px monospace'; ctx.textAlign = 'center';
                ctx.fillText(`/${m}`, bx + barW / 2, h - 15);
                ctx.fillText(vals[i], bx + barW / 2, h - 35 - animH);
            });
        });
    },

    cidr(canvas, mask, bits) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        let t = 0;
        this._startLoop(canvas, () => {
            t += 0.02;
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, w, h);
            const cx = w / 2, cy = h / 2;
            // Círculo animado
            const r = 40 + 15 * Math.sin(t);
            ctx.strokeStyle = '#4fbfa7'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
            // Flechas
            ctx.fillStyle = '#4fbfa7'; ctx.font = 'bold 14px monospace'; ctx.textAlign = 'center';
            ctx.fillText(`/${bits}`, cx, cy - 5);
            ctx.fillStyle = '#f9c74f';
            ctx.fillText(mask + (mask.length > 14 ? '...' : ''), cx, cy + 18);
            // Bits
            const bin = mask ? mask.split('.').map(p => parseInt(p).toString(2).padStart(8,'0')).join('.') : '';
            ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
            ctx.fillText(bin, cx, h - 20);
        });
    },

    broadcast(canvas, ip, bits, bcast) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        let t = 0;
        this._startLoop(canvas, () => {
            t += 0.03;
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, w, h);
            const cx = w / 2, cy = h / 2;
            // Ondas de broadcast
            for (let i = 0; i < 5; i++) {
                const r = 20 + (t * 40 + i * 30) % 120;
                const alpha = 0.3 * (1 - r / 120);
                ctx.strokeStyle = `rgba(249,199,79,${alpha})`;
                ctx.lineWidth = 2;
                ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
            }
            // Centro
            ctx.fillStyle = '#f9c74f';
            ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI * 2); ctx.fill();
            ctx.shadowColor = '#f9c74f'; ctx.shadowBlur = 15;
            ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#fff'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
            ctx.fillText(`Broadcast: ${numToIpv4(bcast)}`, cx, h - 20);
        });
    },

    network(canvas, ip, mask, net) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        let t = 0;
        this._startLoop(canvas, () => {
            t += 0.02;
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, w, h);
            // Puerta AND visual
            const cx = w / 2, cy = h / 2 - 15;
            ctx.fillStyle = '#4fbfa7'; ctx.font = '11px monospace'; ctx.textAlign = 'center';
            ctx.fillText(`IP: ${ip}`, cx, cy - 30);
            ctx.fillStyle = '#f9c74f';
            ctx.fillText(`Masc: ${mask}`, cx, cy - 12);
            ctx.fillStyle = '#4ff97b';
            ctx.fillText(`━━━ AND ━━━`, cx, cy + 3);
            const glow = 0.5 + 0.5 * Math.sin(t * 2);
            ctx.fillStyle = `rgba(79,251,123,${0.4 + 0.3 * glow})`;
            ctx.font = 'bold 12px monospace';
            ctx.fillText(`Red: ${net}`, cx, cy + 25);
            // Bits decorativos
            ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.font = '8px monospace';
            const ipB = ip.split('.').map(p => parseInt(p).toString(2).padStart(8,'0')).join('.');
            ctx.fillText(ipB, cx, h - 15);
        });
    },

    vlsm(canvas, results, ip, redBits) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        let t = 0;
        this._startLoop(canvas, () => {
            t += 0.02;
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, w, h);
            const total = results.reduce((s, r) => s + r.size, 0);
            const barW = w - 40;
            let xOff = 20;
            const colors = ['#4fbfa7','#f9c74f','#f97b4f','#a78bfa','#4ff97b','#f94fa7','#38e8c8','#f9f54f'];
            results.forEach((r, i) => {
                const segW = (r.size / total) * barW;
                const animW = Math.min(segW, (r.size / total) * barW * Math.min(1, t + i * 0.15));
                const col = colors[i % colors.length];
                ctx.fillStyle = col;
                ctx.beginPath(); ctx.roundRect(xOff, h / 2 - 15, Math.max(animW, 2), 30, [i === 0 ? 6 : 0, i === results.length - 1 ? 6 : 0, i === results.length - 1 ? 6 : 0, i === 0 ? 6 : 0]); ctx.fill();
                ctx.fillStyle = '#fff'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
                if (segW > 40) ctx.fillText(`${r.name}`, xOff + segW / 2, h / 2 + 4);
                xOff += segW;
            });
            // Etiqueta red base arriba
            ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
            ctx.fillText(`Red base: ${numToIpv4(ipv4ToNum(ip))}/${redBits}`, w / 2, 20);
        });
    },

    ipv6(canvas, dir, prefix) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        let t = 0;
        this._startLoop(canvas, () => {
            t += 0.02;
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#4fbfa7'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
            ctx.fillText(dir + (dir.includes('/') ? '' : `/${prefix}`), w / 2, 25);
            // Hex grid decorativo
            ctx.font = '10px monospace'; ctx.textAlign = 'center';
            for (let row = 0; row < 4; row++) {
                for (let col = 0; col < 4; col++) {
                    const hx = 30 + col * 35 + (row % 2) * 17;
                    const hy = 50 + row * 30;
                    const hex = Math.floor(Math.random() * 16).toString(16);
                    const alpha = col * 4 + row < prefix / 8 ? 0.6 : 0.15;
                    ctx.fillStyle = `rgba(79,191,167,${alpha})`;
                    ctx.fillText(hex, hx, hy);
                }
            }
            const hostBits = 128 - prefix;
            ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
            ctx.fillText(`/${prefix} · ~2^${hostBits} hosts`, w / 2, h - 20);
        });
    },

    wildcard(canvas, mask, wildParts) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        let t = 0;
        this._startLoop(canvas, () => {
            t += 0.03;
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, w, h);
            const maskParts = mask.split('.').map(Number);
            const cx = w / 2;
            // Bits visuales por octeto
            maskParts.forEach((oct, i) => {
                const bx = 20 + i * ((w - 40) / 4);
                const binM = oct.toString(2).padStart(8, '0');
                const binW = wildParts[i].toString(2).padStart(8, '0');
                ctx.font = '8px monospace'; ctx.textAlign = 'center';
                // Máscara en verde
                ctx.fillStyle = '#4fbfa7';
                for (let b = 0; b < 8; b++) {
                    ctx.fillText(binM[b], bx + b * 9 + 9, h / 2 - 12);
                }
                // Wildcard en amarillo (invertido)
                ctx.fillStyle = '#f9c74f';
                for (let b = 0; b < 8; b++) {
                    const flip = Math.sin(t * 3 + i + b) > 0;
                    const char = flip ? (binM[b] === '1' ? '0' : '1') : ' ';
                    ctx.fillText(char, bx + b * 9 + 9, h / 2 + 5);
                }
                ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.font = '8px monospace';
                ctx.fillText(oct, bx + 36, h / 2 + 25);
            });
        });
    },

    transfer(canvas, size, sizeUnit, speed, speedUnit, seconds) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        let t = 0;
        this._startLoop(canvas, () => {
            t += 0.02;
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, w, h);
            // Barra de progreso animada
            const barW = w - 40, barH = 30, barX = 20, barY = h / 2 - 15;
            const progress = Math.min(1, t / (seconds > 0 ? Math.min(seconds, 5) : 1));
            ctx.fillStyle = 'rgba(79,191,167,0.15)';
            ctx.beginPath(); ctx.roundRect(barX, barY, barW, barH, 6); ctx.fill();
            const grad = ctx.createLinearGradient(barX, 0, barX + barW * progress, 0);
            grad.addColorStop(0, '#4fbfa7'); grad.addColorStop(1, '#4ff97b');
            ctx.fillStyle = grad;
            ctx.beginPath(); ctx.roundRect(barX, barY, barW * progress, barH, 6); ctx.fill();
            // Partículas
            ctx.fillStyle = 'rgba(79,191,167,0.5)';
            for (let i = 0; i < 5; i++) {
                const px = barX + ((t * 30 + i * 50) % barW);
                const py = barY + barH / 2 + 5 * Math.sin(t * 3 + i);
                ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI * 2); ctx.fill();
            }
            ctx.fillStyle = '#fff'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
            const timeStr = seconds > 60 ? `${(seconds/60).toFixed(1)}m` : `${seconds.toFixed(1)}s`;
            ctx.fillText(`${size} ${sizeUnit} @ ${speed} ${speedUnit} = ${timeStr}`, w / 2, barY + 20);
        });
    },

    mbps(canvas, mbpsVal, mbsVal) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        let t = 0;
        this._startLoop(canvas, () => {
            t += 0.02;
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, w, h);
            const cx = w / 2;
            // Velocímetro
            const r = Math.min(w, h) / 2 - 25;
            ctx.strokeStyle = 'rgba(79,191,167,0.2)'; ctx.lineWidth = 12;
            ctx.beginPath(); ctx.arc(cx, h / 2 + 10, r, Math.PI * 0.75, Math.PI * 2.25); ctx.stroke();
            const ang = Math.PI * 0.75 + (Math.PI * 1.5) * Math.min(1, mbpsVal / 1000);
            const pulse = 0.5 + 0.5 * Math.sin(t * 2);
            ctx.strokeStyle = `rgba(79,251,123,${0.4 + 0.3 * pulse})`; ctx.lineWidth = 12;
            ctx.beginPath(); ctx.arc(cx, h / 2 + 10, r, Math.PI * 0.75, ang); ctx.stroke();
            ctx.fillStyle = '#4ff97b'; ctx.font = 'bold 16px monospace'; ctx.textAlign = 'center';
            ctx.fillText(`${mbpsVal.toFixed(1)} Mbps`, cx, h / 2 - 5);
            ctx.fillStyle = '#f9c74f'; ctx.font = '12px monospace';
            ctx.fillText(`= ${mbsVal.toFixed(2)} MB/s`, cx, h / 2 + 20);
            // Aguja
            const ax = cx + (r - 15) * Math.cos(ang - Math.PI / 2);
            const ay = h / 2 + 10 + (r - 15) * Math.sin(ang - Math.PI / 2);
            ctx.strokeStyle = '#4ff97b'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(cx, h / 2 + 10); ctx.lineTo(ax, ay); ctx.stroke();
        });
    },

    ancho(canvas, users, consumo, concurrencia, recomendado) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        let t = 0;
        this._startLoop(canvas, () => {
            t += 0.03;
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, w, h);
            const barW = w - 60;
            const maxUsers = Math.min(users, 20);
            const barH = Math.min(12, (h - 40) / maxUsers);
            for (let i = 0; i < maxUsers; i++) {
                const active = Math.sin(t * 2 + i * 1.5) > (1 - concurrencia * 2);
                const by = 15 + i * (barH + 4);
                ctx.fillStyle = active ? `rgba(79,251,123,${0.3 + 0.3 * Math.sin(t * 3 + i)})` : 'rgba(79,191,167,0.1)';
                ctx.beginPath(); ctx.roundRect(20, by, barW * (active ? consumo / 10 : 0.05), barH, 3); ctx.fill();
            }
            ctx.fillStyle = '#4ff97b'; ctx.font = 'bold 10px monospace'; textAlign = 'center';
            ctx.fillText(`Recomendado: ${recomendado.toFixed(1)} Mbps`, w / 2, h - 10);
        });
    },

    utilizacion(canvas, trafico, capacidad, pct) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        let t = 0;
        this._startLoop(canvas, () => {
            t += 0.02;
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, w, h);
            const cx = w / 2, cy = h / 2;
            const r = Math.min(w, h) / 2 - 30;
            const angle = (pct / 100) * Math.PI * 2;
            const color = pct > 80 ? '#f94f4f' : pct > 50 ? '#f9c74f' : '#4ff97b';
            // Círculo de fondo
            ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 14;
            ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
            // Arco animado
            const animAngle = Math.min(angle, (Math.PI * 2) * Math.min(1, t * 2));
            ctx.strokeStyle = color; ctx.lineWidth = 14; ctx.lineCap = 'round';
            ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + animAngle); ctx.stroke();
            // Centro
            const pulse = 0.6 + 0.4 * Math.sin(t * 2);
            ctx.fillStyle = `rgba(255,255,255,${0.05 + 0.05 * pulse})`;
            ctx.beginPath(); ctx.arc(cx, cy, r * 0.65, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = color; ctx.font = 'bold 16px monospace'; ctx.textAlign = 'center';
            ctx.fillText(`${pct.toFixed(1)}%`, cx, cy + 2);
            ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '9px monospace';
            ctx.fillText(`${trafico} / ${capacidad} Mbps`, cx, cy + 20);
        });
    },

    rtt(canvas, dist, vel, dispositivos, latenciaTotal) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        let t = 0;
        this._startLoop(canvas, () => {
            t += 0.04;
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, w, h);
            const cy = h / 2;
            // Nodos origen y destino
            const ox = 30, dx = w - 30;
            const pulse = 0.5 + 0.5 * Math.sin(t * 2);
            ctx.fillStyle = `rgba(79,191,167,${0.4 + 0.3 * pulse})`;
            ctx.beginPath(); ctx.arc(ox, cy, 8, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(dx, cy, 8, 0, Math.PI * 2); ctx.fill();
            // Paquete viajando
            const pct = (t * 2) % 1;
            const px = ox + (dx - ox) * pct;
            const py = cy + (pct > 0.5 ? -1 : 1) * 8 * Math.sin(t * 6);
            ctx.fillStyle = '#f9c74f';
            ctx.shadowColor = '#f9c74f'; ctx.shadowBlur = 10;
            ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;
            // Línea
            ctx.strokeStyle = 'rgba(79,191,167,0.15)'; ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(ox, cy); ctx.lineTo(dx, cy); ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = '#fff'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
            ctx.fillText(`${dist} km · ${dispositivos} hops`, w / 2, cy + 25);
            ctx.fillStyle = '#4fbfa7';
            ctx.fillText(`RTT: ${latenciaTotal.toFixed(2)} ms`, w / 2, cy - 20);
        });
    },

    throughput(canvas, capacidad, overhead, efectivo) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        let t = 0;
        this._startLoop(canvas, () => {
            t += 0.02;
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, w, h);
            const barW = w - 60, barX = 30, barY = h / 2 - 20;
            // Barra nominal
            ctx.fillStyle = 'rgba(79,191,167,0.15)';
            ctx.beginPath(); ctx.roundRect(barX, barY, barW, 25, 6); ctx.fill();
            ctx.fillStyle = '#4fbfa7'; ctx.font = '9px monospace';
            ctx.fillText(`Nominal: ${capacidad} Mbps`, barX + 5, barY + 17);
            // Barra efectiva
            const effW = (efectivo / capacidad) * barW;
            const animW = Math.min(effW, barW * Math.min(1, t * 2));
            const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
            grad.addColorStop(0, '#4fbfa7'); grad.addColorStop(1, '#4ff97b');
            ctx.fillStyle = grad;
            ctx.beginPath(); ctx.roundRect(barX, barY + 30, animW, 25, 6); ctx.fill();
            ctx.fillStyle = '#fff'; ctx.font = 'bold 9px monospace';
            ctx.fillText(`Real: ${efectivo.toFixed(1)} Mbps (${(100-overhead)}%)`, barX + 5, barY + 47);
            // Overhead (pérdida)
            const lostW = barW - effW;
            ctx.fillStyle = 'rgba(249,79,79,0.2)';
            ctx.beginPath(); ctx.roundRect(barX + effW, barY + 30, lostW, 25, 6); ctx.fill();
        });
    },

    poe(canvas, disp, potencia, total, estandar) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        let t = 0;
        this._startLoop(canvas, () => {
            t += 0.02;
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, w, h);
            const maxDisp = Math.min(disp, 16);
            const cols = 4, rows = Math.ceil(maxDisp / cols);
            const cellW = (w - 40) / cols, cellH = (h - 60) / rows;
            for (let i = 0; i < maxDisp; i++) {
                const col = i % cols, row = Math.floor(i / cols);
                const cx = 20 + col * cellW + cellW / 2;
                const cy = 20 + row * cellH + cellH / 2;
                const on = Math.sin(t * 2 + i * 1.3) > 0;
                const r = Math.min(cellW, cellH) / 2 - 6;
                ctx.fillStyle = on ? `rgba(79,251,123,${0.2 + 0.2 * Math.sin(t * 3 + i)})` : 'rgba(79,191,167,0.05)';
                ctx.beginPath(); ctx.roundRect(cx - r, cy - r, r * 2, r * 2, 4); ctx.fill();
                if (on) {
                    ctx.fillStyle = '#4ff97b'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
                    ctx.fillText(`${potencia}W`, cx, cy + 3);
                }
            }
            ctx.fillStyle = '#fff'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
            ctx.fillText(`Total: ${total.toFixed(1)} W (${estandar})`, w / 2, h - 12);
        });
    },

    dns(canvas, dominio, registros) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        let t = 0;
        this._startLoop(canvas, () => {
            t += 0.02;
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, w, h);
            const cx = w / 2;
            const pulse = 0.5 + 0.5 * Math.sin(t * 2);
            const ay = 20 + (h - 60) * (0.3 + 0.3 * Math.sin(t * 1.5));
            ctx.fillStyle = `rgba(79,191,167,${0.3 + 0.3 * pulse})`;
            ctx.beginPath(); ctx.roundRect(cx - 60, ay, 120, 28, 8); ctx.fill();
            ctx.fillStyle = '#4fbfa7'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
            ctx.fillText(dominio, cx, ay + 19);
            ctx.fillStyle = 'rgba(249,199,79,0.4)';
            const arrowY = ay + 40;
            ctx.beginPath(); ctx.moveTo(cx, arrowY); ctx.lineTo(cx - 6, arrowY - 8); ctx.lineTo(cx + 6, arrowY - 8); ctx.fill();
            const records = registros.slice(0, 6);
            records.forEach((r, i) => {
                const ry = arrowY + 15 + i * 22;
                ctx.fillStyle = `rgba(255,255,255,${0.05 + 0.05 * (i % 2)})`;
                ctx.beginPath(); ctx.roundRect(20, ry, w - 40, 18, 4); ctx.fill();
                ctx.fillStyle = '#f9c74f'; ctx.font = '9px monospace'; ctx.textAlign = 'left';
                ctx.fillText(r.tipo, 25, ry + 13);
                ctx.fillStyle = '#fff'; ctx.textAlign = 'right';
                ctx.fillText(r.valor, w - 25, ry + 13);
            });
        });
    },

    fragmentacion(canvas, paquete, mtu, fragmentos) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        let t = 0;
        const count = Math.min(fragmentos, 10);
        this._startLoop(canvas, () => {
            t += 0.03;
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, w, h);
            const gap = 4, barH = 18, totalW = w - 40;
            const segW = (totalW - gap * (count - 1)) / count;
            for (let i = 0; i < count; i++) {
                const bx = 20 + i * (segW + gap);
                const by = h / 2 - barH / 2;
                const isLast = i === count - 1;
                const fall = Math.sin(t * 2 + i) * 2;
                ctx.fillStyle = isLast ? `rgba(249,199,79,${0.3 + 0.2 * Math.sin(t * 3)})` : `rgba(79,191,167,${0.4 + 0.2 * Math.sin(t * 2 + i)})`;
                ctx.beginPath(); ctx.roundRect(bx, by + fall, segW, barH, 4); ctx.fill();
                ctx.fillStyle = isLast ? '#f9c74f' : '#4fbfa7';
                ctx.font = '8px monospace'; ctx.textAlign = 'center';
                const lastBytes = paquete - (count - 1) * mtu;
                ctx.fillText(isLast ? `${lastBytes}` : `${mtu}`, bx + segW / 2, by + fall + 13);
            }
            ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
            ctx.fillText(`${paquete} bytes  →  MTU ${mtu}  →  ${fragmentos} fragmentos`, w / 2, h - 15);
        });
    },

    vlan(canvas) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        let t = 0;
        this._startLoop(canvas, () => {
            t += 0.02;
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, w, h);
            const cols = 12, rows = 6;
            const cellW = (w - 20) / cols, cellH = (h - 40) / rows;
            for (let i = 0; i < 72; i++) {
                const col = i % cols, row = Math.floor(i / cols);
                const cx = 10 + col * cellW + cellW / 2;
                const cy = 15 + row * cellH + cellH / 2;
                const active = (i + 1) % 2 === 0;
                ctx.fillStyle = active ? `rgba(79,191,167,${0.2 + 0.1 * Math.sin(t * 2 + i)})` : 'rgba(255,255,255,0.05)';
                ctx.beginPath(); ctx.roundRect(cx - cellW / 2 + 1, cy - cellH / 2 + 1, cellW - 2, cellH - 2, 3); ctx.fill();
                if (active) {
                    ctx.fillStyle = '#4fbfa7'; ctx.font = '7px monospace'; ctx.textAlign = 'center';
                    ctx.fillText(`${i + 1}`, cx, cy + 3);
                }
            }
            ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
            ctx.fillText('VLANs 1-4094 disponibles', w / 2, h - 10);
        });
    },

    dhcp(canvas, totalIps, reservas, disponibles) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        let t = 0;
        this._startLoop(canvas, () => {
            t += 0.02;
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, w, h);
            const barW = w - 60, barH = 30, barX = 30, barY = h / 2 - 15;
            ctx.fillStyle = 'rgba(79,191,167,0.2)';
            ctx.beginPath(); ctx.roundRect(barX, barY, barW, barH, 6); ctx.fill();
            const dispW = (disponibles / totalIps) * barW;
            const animW = Math.min(dispW, barW * Math.min(1, t * 2));
            const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
            grad.addColorStop(0, '#4fbfa7'); grad.addColorStop(1, '#4ff97b');
            ctx.fillStyle = grad;
            ctx.beginPath(); ctx.roundRect(barX, barY, animW, barH, 6); ctx.fill();
            const resW = (reservas / totalIps) * barW;
            ctx.fillStyle = 'rgba(249,199,79,0.4)';
            ctx.beginPath(); ctx.roundRect(barX + dispW, barY, resW, barH, [0, 6, 6, 0]); ctx.fill();
            ctx.fillStyle = '#4ff97b'; ctx.font = '9px monospace'; ctx.textAlign = 'left';
            ctx.fillText(`Disponibles: ${disponibles}`, barX + 5, barY + 20);
            if (resW > 40) {
                ctx.fillStyle = '#f9c74f'; ctx.textAlign = 'right';
                ctx.fillText(`Reservas: ${reservas}`, barX + barW - 5, barY + 20);
            }
            ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
            ctx.fillText(`Total: ${totalIps} IPs`, w / 2, h - 15);
        });
    },

    overhead_tcp(canvas, paquete, cabeceras, datosUtiles, overheadPct) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        let t = 0;
        this._startLoop(canvas, () => {
            t += 0.02;
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, w, h);
            const barW = w - 40, barX = 20, barY = h / 2 - 25;
            const datosW = (datosUtiles / paquete) * barW;
            const animW = Math.min(datosW, barW * Math.min(1, t * 2));
            const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
            grad.addColorStop(0, '#4ff97b'); grad.addColorStop(1, '#4fbfa7');
            ctx.fillStyle = grad;
            ctx.beginPath(); ctx.roundRect(barX, barY, animW, 20, [6, 0, 0, 6]); ctx.fill();
            ctx.fillStyle = '#fff'; ctx.font = '9px monospace'; ctx.textAlign = 'left';
            ctx.fillText(`Datos: ${datosUtiles} B`, barX + 5, barY + 15);
            const cabW = barW - datosW;
            ctx.fillStyle = 'rgba(249,79,79,0.3)';
            ctx.beginPath(); ctx.roundRect(barX + animW, barY, cabW, 20, [0, 6, 6, 0]); ctx.fill();
            ctx.fillStyle = '#f94f4f'; ctx.font = '9px monospace'; ctx.textAlign = 'right';
            ctx.fillText(`Cabeceras: ${cabeceras} B`, barX + barW - 5, barY + 15);
            ctx.fillStyle = '#f9c74f'; ctx.font = 'bold 14px monospace'; ctx.textAlign = 'center';
            ctx.fillText(`Overhead: ${overheadPct.toFixed(1)}%`, w / 2, barY + 55);
        });
    }
};
