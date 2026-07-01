const GeometriaVisual = {
    initCanvas: function(canvas) {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        return ctx;
    },

    circulo: function(canvas, radio, area) {
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        
        ctx.clearRect(0, 0, w, h);
        
        const centerX = w / 2;
        const centerY = h / 2;
        const maxRadio = Math.min(w, h) / 2 - 30;
        const escala = maxRadio / (radio || 1);
        const r = radio * escala;
        
        const bgGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadio);
        bgGrad.addColorStop(0, 'rgba(79, 156, 249, 0.15)');
        bgGrad.addColorStop(1, 'rgba(79, 249, 123, 0.10)');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);
        
        ctx.beginPath();
        ctx.strokeStyle = '#4f9cf9';
        ctx.lineWidth = 3;
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.strokeStyle = '#f9c74f';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + r, centerY);
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.fillStyle = '#e8edf5';
        ctx.font = '11px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(`r = ${radio.toFixed(2)}`, centerX + r / 2, centerY - 10);
        ctx.fillStyle = '#4ff97b';
        ctx.fillText(`A = ${area.toFixed(2)}`, centerX, centerY + r + 25);
    },

    pitagoras: function(canvas, a, b, c) {
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        
        ctx.clearRect(0, 0, w, h);
        ctx.lineWidth = 2;
        
        const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, Math.min(w, h) * 0.5);
        bgGrad.addColorStop(0, 'rgba(79, 156, 249, 0.10)');
        bgGrad.addColorStop(1, 'rgba(10, 11, 14, 0)');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);
        
        const escala = Math.min((w - 80) / (b || 1), (h - 80) / (a || 1));
        const sb = b * escala, sa = a * escala;
        const ox = (w - sb) / 2, oy = (h + sa) / 2;
        
        ctx.strokeStyle = '#4f9cf9';
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(ox + sb, oy);
        ctx.lineTo(ox + sb, oy - sa);
        ctx.closePath();
        ctx.stroke();
        
        ctx.strokeStyle = '#f9c74f';
        ctx.beginPath();
        const tam = 15;
        ctx.moveTo(ox + sb - tam, oy);
        ctx.lineTo(ox + sb - tam, oy - tam);
        ctx.lineTo(ox + sb, oy - tam);
        ctx.stroke();
        
        ctx.fillStyle = '#e8edf5';
        ctx.font = '12px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(`a = ${a.toFixed(2)}`, ox + sb + 25, oy - sa / 2);
        ctx.fillText(`b = ${b.toFixed(2)}`, ox + sb / 2, oy + 20);
        ctx.fillStyle = '#4ff97b';
        ctx.fillText(`c = ${c.toFixed(2)}`, ox + sb / 2, oy - sa - 15);
    },

    triangulo: function(canvas, b, h, area) {
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h_canvas = canvas.height / (window.devicePixelRatio || 1);

        const padding = 20;
        const scale = Math.min((w - 2 * padding) / b, (h_canvas - 2 * padding) / h);
        const scaledB = b * scale;
        const scaledH = h * scale;

        ctx.beginPath();
        ctx.strokeStyle = '#4f9cf9';
        ctx.lineWidth = 2;
        ctx.moveTo((w - scaledB) / 2, h_canvas - padding);
        ctx.lineTo((w + scaledB) / 2, h_canvas - padding);
        ctx.lineTo(w / 2, h_canvas - padding - scaledH);
        ctx.closePath();
        ctx.stroke();

        ctx.fillStyle = '#e8edf5';
        ctx.font = '10px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(`b: ${b.toFixed(1)}`, w / 2, h_canvas - 5);
        ctx.textAlign = 'left';
        ctx.fillText(`h: ${h.toFixed(1)}`, w / 2 + 5, h_canvas - padding - scaledH / 2);
    },

    cono: function(canvas, r, h, g) {
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const ch = canvas.height / (window.devicePixelRatio || 1);

        ctx.clearRect(0, 0, w, ch);

        const cx = w / 2;
        const cy = ch / 2 + 10;
        const escala = Math.min(w, ch) / (Math.max(r, h) * 2.8);
        const sr = r * escala;
        const sh = h * escala;

        // Gradient background
        const bg = ctx.createRadialGradient(cx, cy - sh/2, 0, cx, cy - sh/2, Math.max(sr, sh) + 20);
        bg.addColorStop(0, 'rgba(79,156,249,0.10)');
        bg.addColorStop(1, 'rgba(249,199,79,0.05)');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, ch);

        // Base ellipse
        ctx.beginPath();
        ctx.strokeStyle = '#4f9cf9';
        ctx.lineWidth = 2;
        ctx.ellipse(cx, cy, sr, sr * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Cone sides
        ctx.beginPath();
        ctx.moveTo(cx - sr, cy);
        ctx.lineTo(cx, cy - sh);
        ctx.lineTo(cx + sr, cy);
        ctx.stroke();

        // Slant height dashed
        ctx.beginPath();
        ctx.strokeStyle = '#f9c74f';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.moveTo(cx, cy - sh);
        ctx.lineTo(cx + sr, cy);
        ctx.stroke();
        ctx.setLineDash([]);

        // Labels
        ctx.fillStyle = '#e8edf5';
        ctx.font = '11px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(`r = ${r.toFixed(2)}`, cx + sr / 2, cy + 15);
        ctx.fillText(`h = ${h.toFixed(2)}`, cx + 8, cy - sh / 2);
        ctx.fillStyle = '#f9c74f';
        ctx.fillText(`g = ${g.toFixed(2)}`, cx + sr / 2 + 5, cy - sh / 2 - 5);
    },

    cubo: function(canvas, lado) {
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);

        ctx.clearRect(0, 0, w, h);

        const cx = w / 2;
        const cy = h / 2;
        const maxDim = Math.min(w, h) / 2.5;
        const s = Math.min(lado, maxDim);
        const dx = s * 0.3;
        const dy = s * 0.25;

        // Background
        const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, s + 30);
        bg.addColorStop(0, 'rgba(79,156,249,0.10)');
        bg.addColorStop(1, 'rgba(79,249,123,0.05)');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);

        // Front face
        ctx.fillStyle = 'rgba(79,156,249,0.15)';
        ctx.strokeStyle = '#4f9cf9';
        ctx.lineWidth = 2;
        ctx.fillRect(cx - s/2, cy - s/2, s, s);
        ctx.strokeRect(cx - s/2, cy - s/2, s, s);

        // Top face (parallelogram)
        ctx.beginPath();
        ctx.fillStyle = 'rgba(79,249,123,0.15)';
        ctx.moveTo(cx - s/2 + dx, cy - s/2 - dy);
        ctx.lineTo(cx - s/2, cy - s/2);
        ctx.lineTo(cx + s/2, cy - s/2);
        ctx.lineTo(cx + s/2 + dx, cy - s/2 - dy);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Right face (parallelogram)
        ctx.beginPath();
        ctx.fillStyle = 'rgba(249,199,79,0.15)';
        ctx.moveTo(cx + s/2, cy - s/2);
        ctx.lineTo(cx + s/2 + dx, cy - s/2 - dy);
        ctx.lineTo(cx + s/2 + dx, cy + s/2 - dy);
        ctx.lineTo(cx + s/2, cy + s/2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Labels
        ctx.fillStyle = '#e8edf5';
        ctx.font = '11px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(`a = ${lado.toFixed(2)}`, cx, cy + s/2 + 18);
    },

    elipse: function(canvas, a, b, area) {
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);

        ctx.clearRect(0, 0, w, h);

        const cx = w / 2;
        const cy = h / 2;
        const maxAxis = Math.min(w, h) / 2 - 30;
        const escala = maxAxis / (Math.max(a, b) || 1);
        const sa = a * escala;
        const sb = b * escala;

        // Background
        const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(sa, sb) + 20);
        bg.addColorStop(0, 'rgba(249,199,79,0.12)');
        bg.addColorStop(1, 'rgba(79,156,249,0.08)');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);

        // Ellipse
        ctx.beginPath();
        ctx.strokeStyle = '#4f9cf9';
        ctx.lineWidth = 3;
        ctx.ellipse(cx, cy, sa, sb, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Semi-axes
        ctx.beginPath();
        ctx.strokeStyle = '#f9c74f';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 5]);
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + sa, cy);
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx, cy - sb);
        ctx.stroke();
        ctx.setLineDash([]);

        // Labels
        ctx.fillStyle = '#e8edf5';
        ctx.font = '11px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(`a = ${a.toFixed(2)}`, cx + sa / 2, cy + 16);
        ctx.fillText(`b = ${b.toFixed(2)}`, cx + 12, cy - sb / 2);
        ctx.fillStyle = '#4ff97b';
        ctx.fillText(`A = ${area.toFixed(2)}`, cx, cy + sb + 20);
    },

    trapecio: function(canvas, B, b, h, area) {
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const ch = canvas.height / (window.devicePixelRatio || 1);

        ctx.clearRect(0, 0, w, ch);

        const padding = 20;
        const escala = Math.min((w - 2 * padding) / B, (ch - 2 * padding) / h);
        const sB = B * escala;
        const sb = b * escala;
        const sh = h * escala;

        const cx = w / 2;

        // Background
        const bg = ctx.createLinearGradient(0, 0, w, ch);
        bg.addColorStop(0, 'rgba(79,156,249,0.08)');
        bg.addColorStop(1, 'rgba(249,199,79,0.08)');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, ch);

        // Trapezoid
        ctx.beginPath();
        ctx.strokeStyle = '#4f9cf9';
        ctx.lineWidth = 2;
        ctx.fillStyle = 'rgba(79,156,249,0.10)';
        ctx.moveTo(cx - sB / 2, ch - padding);
        ctx.lineTo(cx + sB / 2, ch - padding);
        ctx.lineTo(cx + sb / 2, ch - padding - sh);
        ctx.lineTo(cx - sb / 2, ch - padding - sh);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Height indicator
        ctx.beginPath();
        ctx.strokeStyle = '#f9c74f';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.moveTo(cx + sB / 2 + 10, ch - padding);
        ctx.lineTo(cx + sB / 2 + 10, ch - padding - sh);
        ctx.stroke();
        ctx.setLineDash([]);

        // Labels
        ctx.fillStyle = '#e8edf5';
        ctx.font = '11px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(`B = ${B.toFixed(1)}`, cx, ch - 5);
        ctx.fillText(`b = ${b.toFixed(1)}`, cx, ch - padding - sh - 5);
        ctx.fillStyle = '#f9c74f';
        ctx.textAlign = 'left';
        ctx.fillText(`h = ${h.toFixed(1)}`, cx + sB / 2 + 15, ch - padding - sh / 2);
    },

    rectangulo: function(canvas, b, h, area, per) {
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const ch = canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, ch);

        const padding = 30;
        const escala = Math.min((w - 2 * padding) / b, (ch - 2 * padding) / h);
        const sb = b * escala, sh = h * escala;
        const cx = w / 2, cy = ch / 2;

        const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(sb, sh) + 20);
        bg.addColorStop(0, 'rgba(79,156,249,0.10)');
        bg.addColorStop(1, 'rgba(249,199,79,0.05)');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, ch);

        ctx.fillStyle = 'rgba(79,156,249,0.15)';
        ctx.strokeStyle = '#4f9cf9';
        ctx.lineWidth = 2;
        ctx.fillRect(cx - sb/2, cy - sh/2, sb, sh);
        ctx.strokeRect(cx - sb/2, cy - sh/2, sb, sh);

        ctx.fillStyle = '#e8edf5';
        ctx.font = '11px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(`b = ${b.toFixed(2)}`, cx, cy + sh/2 + 18);
        ctx.textAlign = 'left';
        ctx.fillText(`h = ${h.toFixed(2)}`, cx + sb/2 + 8, cy);
    },

    rombo: function(canvas, D, d, area) {
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const ch = canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, ch);

        const cx = w / 2, cy = ch / 2;
        const maxDim = Math.min(w, ch) / 2 - 30;
        const escala = maxDim / (Math.max(D, d) || 1);
        const sD = D * escala, sd = d * escala;

        const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(sD, sd) + 20);
        bg.addColorStop(0, 'rgba(249,199,79,0.12)');
        bg.addColorStop(1, 'rgba(79,156,249,0.08)');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, ch);

        ctx.beginPath();
        ctx.strokeStyle = '#4f9cf9';
        ctx.lineWidth = 2;
        ctx.fillStyle = 'rgba(79,156,249,0.12)';
        ctx.moveTo(cx, cy - sD/2);
        ctx.lineTo(cx + sd/2, cy);
        ctx.lineTo(cx, cy + sD/2);
        ctx.lineTo(cx - sd/2, cy);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.strokeStyle = '#f9c74f';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 5]);
        ctx.moveTo(cx - sd/2, cy);
        ctx.lineTo(cx + sd/2, cy);
        ctx.moveTo(cx, cy - sD/2);
        ctx.lineTo(cx, cy + sD/2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#e8edf5';
        ctx.font = '11px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(`D = ${D.toFixed(2)}`, cx, cy - sD/2 - 10);
        ctx.fillText(`d = ${d.toFixed(2)}`, cx + sd/2 + 15, cy + 5);
        ctx.fillStyle = '#4ff97b';
        ctx.fillText(`A = ${area.toFixed(2)}`, cx, cy + sD/2 + 22);
    },

    poligono_regular: function(canvas, n, L, area) {
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const ch = canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, ch);

        const cx = w / 2, cy = ch / 2;
        const radio = Math.min(w, ch) / 2 - 30;

        const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, radio + 20);
        bg.addColorStop(0, 'rgba(79,156,249,0.10)');
        bg.addColorStop(1, 'rgba(249,199,79,0.05)');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, ch);

        ctx.beginPath();
        ctx.strokeStyle = '#4f9cf9';
        ctx.lineWidth = 2;
        for (let i = 0; i <= n; i++) {
            const a = (i / n) * Math.PI * 2 - Math.PI / 2;
            const x = cx + Math.cos(a) * radio;
            const y = cy + Math.sin(a) * radio;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.fillStyle = '#e8edf5';
        ctx.font = '11px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(`n = ${n} | L = ${L.toFixed(2)}`, cx, cy + radio + 22);
        ctx.fillStyle = '#4ff97b';
        ctx.fillText(`A = ${area.toFixed(2)}`, cx, cy - radio - 12);
    },

    prisma_rectangular: function(canvas, L, W, H, vol) {
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const ch = canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, ch);

        const cx = w / 2, cy = ch / 2;
        const maxDim = Math.min(w, ch) / 2.8;
        const escala = maxDim / (Math.max(L, W, H) || 1);
        const sL = L * escala, sW = W * escala, sH = H * escala;
        const dx = sW * 0.3, dy = sH * 0.25;

        const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(sL, sW, sH) + 30);
        bg.addColorStop(0, 'rgba(79,156,249,0.10)');
        bg.addColorStop(1, 'rgba(79,249,123,0.05)');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, ch);

        ctx.fillStyle = 'rgba(79,156,249,0.15)';
        ctx.strokeStyle = '#4f9cf9';
        ctx.lineWidth = 2;
        ctx.fillRect(cx - sL/2, cy - sH/2, sL, sH);
        ctx.strokeRect(cx - sL/2, cy - sH/2, sL, sH);

        ctx.beginPath();
        ctx.fillStyle = 'rgba(79,249,123,0.15)';
        ctx.moveTo(cx - sL/2 + dx, cy - sH/2 - dy);
        ctx.lineTo(cx - sL/2, cy - sH/2);
        ctx.lineTo(cx + sL/2, cy - sH/2);
        ctx.lineTo(cx + sL/2 + dx, cy - sH/2 - dy);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.fillStyle = 'rgba(249,199,79,0.15)';
        ctx.moveTo(cx + sL/2, cy - sH/2);
        ctx.lineTo(cx + sL/2 + dx, cy - sH/2 - dy);
        ctx.lineTo(cx + sL/2 + dx, cy + sH/2 - dy);
        ctx.lineTo(cx + sL/2, cy + sH/2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#e8edf5';
        ctx.font = '10px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(`L=${L.toFixed(1)} W=${W.toFixed(1)} H=${H.toFixed(1)}`, cx, cy + sH/2 + 18);
        ctx.fillStyle = '#4ff97b';
        ctx.fillText(`V = ${vol.toFixed(2)}`, cx, cy - sH/2 - dy - 12);
    },

    piramide: function(canvas, Ab, h, vol) {
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const ch = canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, ch);

        const cx = w / 2;
        const baseW = Math.min(w, ch) / 2.5;
        const escala = Math.min(baseW / Math.sqrt(Ab) * 2, (ch / 2 - 30) / h);
        const sb = Math.sqrt(Ab) * escala;
        const sh = h * escala;
        const cy = ch / 2 + 15;

        const bg = ctx.createRadialGradient(cx, cy - sh/2, 0, cx, cy - sh/2, Math.max(sb, sh) + 20);
        bg.addColorStop(0, 'rgba(249,199,79,0.10)');
        bg.addColorStop(1, 'rgba(79,156,249,0.05)');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, ch);

        ctx.fillStyle = 'rgba(79,156,249,0.12)';
        ctx.strokeStyle = '#4f9cf9';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.rect(cx - sb/2, cy, sb, sb * 0.3);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(cx - sb/2, cy);
        ctx.lineTo(cx, cy - sh);
        ctx.lineTo(cx + sb/2, cy);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + sb/2, cy + sb * 0.3);
        ctx.lineTo(cx, cy - sh);
        ctx.lineTo(cx - sb/2, cy + sb * 0.3);
        ctx.stroke();

        ctx.fillStyle = '#e8edf5';
        ctx.font = '11px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(`Ab = ${Ab.toFixed(2)}`, cx, cy + sb * 0.3 + 20);
        ctx.fillText(`h = ${h.toFixed(2)}`, cx + 10, cy - sh / 2);
        ctx.fillStyle = '#4ff97b';
        ctx.fillText(`V = ${vol.toFixed(2)}`, cx, cy - sh - 12);
    },

    sector_circular: function(canvas, r, theta, area) {
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const ch = canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, ch);

        const cx = w / 2, cy = ch / 2;
        const maxR = Math.min(w, ch) / 2 - 30;
        const escala = maxR / (r || 1);
        const sr = r * escala;

        const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
        bg.addColorStop(0, 'rgba(79,156,249,0.10)');
        bg.addColorStop(1, 'rgba(249,199,79,0.05)');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, ch);

        const rad = theta * Math.PI / 180;

        ctx.beginPath();
        ctx.fillStyle = 'rgba(79,156,249,0.15)';
        ctx.strokeStyle = '#4f9cf9';
        ctx.lineWidth = 2;
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, sr, -rad/2, rad/2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.strokeStyle = '#f9c74f';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + sr, cy);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#e8edf5';
        ctx.font = '11px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(`r = ${r.toFixed(2)}`, cx + sr/2, cy + 18);
        ctx.fillText(`θ = ${theta}°`, cx + sr/2 * Math.cos(rad/4) + 5, cy - sr/2 * Math.sin(rad/4) - 5);
        ctx.fillStyle = '#4ff97b';
        ctx.fillText(`A = ${area.toFixed(2)}`, cx, cy + sr + 22);
    },

    hexagono: function(canvas, L, area) {
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, h);

        const cx = w / 2, cy = h / 2;
        const radio = Math.min(w, h) / 2 - 30;
        const n = 6;

        const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, radio + 20);
        bg.addColorStop(0, 'rgba(79,156,249,0.10)');
        bg.addColorStop(1, 'rgba(249,199,79,0.05)');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);

        ctx.beginPath();
        ctx.fillStyle = 'rgba(79,156,249,0.12)';
        ctx.strokeStyle = '#4f9cf9';
        ctx.lineWidth = 2;
        for (let i = 0; i <= n; i++) {
            const a = (i / n) * Math.PI * 2 - Math.PI / 2;
            const x = cx + Math.cos(a) * radio;
            const y = cy + Math.sin(a) * radio;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        const apothem = radio * Math.cos(Math.PI / n);
        ctx.beginPath();
        ctx.strokeStyle = '#f9c74f';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 5]);
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx, cy - apothem);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#e8edf5';
        ctx.font = '11px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(`L = ${L.toFixed(2)}`, cx + radio * 0.5, cy + 18);
        ctx.fillStyle = '#4ff97b';
        ctx.fillText(`A = ${area.toFixed(2)}`, cx, cy - radio - 12);
    },

    octogono: function(canvas, L, area) {
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, h);

        const cx = w / 2, cy = h / 2;
        const radio = Math.min(w, h) / 2 - 30;
        const n = 8;

        const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, radio + 20);
        bg.addColorStop(0, 'rgba(249,199,79,0.10)');
        bg.addColorStop(1, 'rgba(79,156,249,0.05)');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);

        ctx.beginPath();
        ctx.fillStyle = 'rgba(249,199,79,0.12)';
        ctx.strokeStyle = '#4f9cf9';
        ctx.lineWidth = 2;
        for (let i = 0; i <= n; i++) {
            const a = (i / n) * Math.PI * 2 - Math.PI / 2;
            const x = cx + Math.cos(a) * radio;
            const y = cy + Math.sin(a) * radio;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#e8edf5';
        ctx.font = '11px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(`L = ${L.toFixed(2)}`, cx, cy + radio + 22);
        ctx.fillStyle = '#4ff97b';
        ctx.fillText(`A = ${area.toFixed(2)}`, cx, cy - radio - 12);
    },

    corona_circular: function(canvas, R, r, area) {
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, h);

        const cx = w / 2, cy = h / 2;
        const maxR = Math.min(w, h) / 2 - 30;
        const escala = maxR / (R || 1);
        const sR = R * escala;
        const sr = r * escala;

        const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, sR + 20);
        bg.addColorStop(0, 'rgba(79,156,249,0.10)');
        bg.addColorStop(1, 'rgba(79,249,123,0.05)');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);

        ctx.beginPath();
        ctx.fillStyle = 'rgba(79,156,249,0.08)';
        ctx.strokeStyle = '#4f9cf9';
        ctx.lineWidth = 2;
        ctx.arc(cx, cy, sR, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.fillStyle = '#0d1117';
        ctx.arc(cx, cy, sr, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#f9c74f';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.strokeStyle = '#f9c74f';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 5]);
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + sR, cy);
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + sr, cy);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#e8edf5';
        ctx.font = '11px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(`R = ${R.toFixed(2)}`, cx + sR / 2, cy + 18);
        ctx.fillText(`r = ${r.toFixed(2)}`, cx + sr / 2, cy - 8);
        ctx.fillStyle = '#4ff97b';
        ctx.fillText(`A = ${area.toFixed(2)}`, cx, cy + sR + 22);
    },

    segmento_circular: function(canvas, R, theta, area) {
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, h);

        const cx = w / 2, cy = h / 2;
        const maxR = Math.min(w, h) / 2 - 30;
        const escala = maxR / (R || 1);
        const sR = R * escala;
        const rad = theta * Math.PI / 180;

        const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, sR + 20);
        bg.addColorStop(0, 'rgba(79,156,249,0.10)');
        bg.addColorStop(1, 'rgba(249,199,79,0.05)');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);

        ctx.beginPath();
        ctx.strokeStyle = '#4a5570';
        ctx.lineWidth = 1.5;
        ctx.arc(cx, cy, sR, 0, Math.PI * 2);
        ctx.stroke();

        const startA = -rad / 2, endA = rad / 2;
        const x1 = cx + sR * Math.cos(startA);
        const y1 = cy + sR * Math.sin(startA);
        const x2 = cx + sR * Math.cos(endA);
        const y2 = cy + sR * Math.sin(endA);

        ctx.beginPath();
        ctx.fillStyle = 'rgba(79,156,249,0.15)';
        ctx.strokeStyle = '#4f9cf9';
        ctx.lineWidth = 2;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.arc(cx, cy, sR, endA, startA + Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#e8edf5';
        ctx.font = '11px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(`R = ${R.toFixed(2)}`, cx + sR * 0.55 * Math.cos(rad/4), cy + sR * 0.55 * Math.sin(rad/4) + 5);
        ctx.fillText(`θ = ${theta}°`, cx, cy - sR - 12);
        ctx.fillStyle = '#4ff97b';
        ctx.fillText(`A = ${area.toFixed(2)}`, cx, cy + sR + 22);
    },

    tronco_cono: function(canvas, R, r, h, g) {
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / (window.devicePixelRatio || 1);
        const ch = canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, ch);

        const cx = w / 2, cy = ch / 2 + 10;
        const escala = Math.min(w, ch) / (Math.max(R, h) * 3);
        const sR = R * escala, sr = r * escala, sh = h * escala;

        const bg = ctx.createRadialGradient(cx, cy - sh / 2, 0, cx, cy - sh / 2, Math.max(sR, sh) + 20);
        bg.addColorStop(0, 'rgba(79,156,249,0.10)');
        bg.addColorStop(1, 'rgba(249,199,79,0.05)');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, ch);

        ctx.beginPath();
        ctx.fillStyle = 'rgba(79,156,249,0.12)';
        ctx.strokeStyle = '#4f9cf9';
        ctx.lineWidth = 2;
        ctx.moveTo(cx - sR, cy);
        ctx.lineTo(cx - sr, cy - sh);
        ctx.lineTo(cx + sr, cy - sh);
        ctx.lineTo(cx + sR, cy);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(cx, cy, sR, sR * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(cx, cy - sh, sr, sr * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.strokeStyle = '#f9c74f';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + sR, cy);
        ctx.moveTo(cx, cy - sh);
        ctx.lineTo(cx + sr, cy - sh);
        ctx.moveTo(cx, cy - sh);
        ctx.lineTo(cx + sR, cy);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#e8edf5';
        ctx.font = '11px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(`R = ${R.toFixed(2)}`, cx + sR / 2, cy + 15);
        ctx.fillText(`r = ${r.toFixed(2)}`, cx + sr / 2, cy - sh + 12);
        ctx.fillText(`h = ${h.toFixed(2)}`, cx + 10, cy - sh / 2);
        ctx.fillStyle = '#f9c74f';
        ctx.fillText(`g = ${g.toFixed(2)}`, cx + sR * 0.6, cy - sh * 0.6);
    }
};
