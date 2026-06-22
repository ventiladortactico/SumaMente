FORMS.diseno = {
    conv: {
        title: 'Convertidor de Unidades',
        formula: 'px = pulgadas × DPI  |  Ref 300 DPI: 1 cm = 118 px',
        fields: [
            { id: 'val',   label: 'Valor numérico',          val: '21' },
            { id: 'from',  label: 'Unidad Origen',  type: 'select', opts: [
                {v:'cm',l:'Centímetros (cm)'},{v:'mm',l:'Milímetros (mm)'},
                {v:'in',l:'Pulgadas (in)'},{v:'px',l:'Pixeles (px)'}
            ]},
            { id: 'to',    label: 'Unidad Destino', type: 'select', opts: [
                {v:'px',l:'Pixeles (px)'},{v:'cm',l:'Centímetros (cm)'},
                {v:'mm',l:'Milímetros (mm)'},{v:'in',l:'Pulgadas (in)'}
            ]},
            { id: 'dpi',   label: 'Resolución DPI', type: 'select', opts: [
                {v:'300',l:'300 — Imprenta'},{v:'150',l:'150 — Lonas/Banners'},
                {v:'96', l:'96  — Web/Pantalla'},{v:'72',l:'72  — Pantalla legacy'},
                {v:'600',l:'600 — Alta calidad'}
            ]}
        ],
        calc(f) {
            let val = parseFloat(f.val.value), from = f.from.value, to = f.to.value, dpi = parseFloat(f.dpi.value);
            if (isNaN(val) || val <= 0) return { error: true, msg: "Ingresá un valor mayor a cero", label: "Inválido" };
            
            let valInches = from === 'in' ? val : from === 'cm' ? val / 2.54 : from === 'mm' ? val / 25.4 : val / dpi;
            let res = to === 'in' ? valInches : to === 'cm' ? valInches * 2.54 : to === 'mm' ? valInches * 25.4 : valInches * dpi;

            return {
                main: `${res.toFixed(2)} ${to}`,
                label: 'Conversión de magnitud',
                extras: [{ cls: 'info', txt: `Cálculo basado en base física de ${dpi} puntos por pulgada` }],
                steps: [`Convertido a pulgadas: ${valInches.toFixed(4)} in`, `Multiplicado al destino: ${res.toFixed(2)}`],
                chart(canvas) {
                    DisenoVisual.conv(canvas, val, from, to, res);
                }
            };
        }
    },
    resolucion: {
        title: 'Resolución para Impresión',
        formula: 'px = (mm / 25.4) × DPI',
        fields: [
            { id: 'w',   label: 'Ancho (mm)',    val: '210' },
            { id: 'h',   label: 'Alto (mm)',     val: '297' },
            { id: 'bleed', label: 'Demasía/Bleed (mm)', val: '3' },
            { id: 'dpi', label: 'DPI de salida', type: 'select', opts: [{v:'300',l:'300 DPI'},{v:'150',l:'150 DPI'},{v:'600',l:'600 DPI'}] }
        ],
        calc(f) {
            let wMM = parseFloat(f.w.value), hMM = parseFloat(f.h.value), bMM = parseFloat(f.bleed.value), dpi = parseFloat(f.dpi.value);
            if (isNaN(wMM) || isNaN(hMM)) return null;

            let totalW = wMM + (bMM * 2);
            let totalH = hMM + (bMM * 2);
            let wPx = Math.round((totalW / 25.4) * dpi);
            let hPx = Math.round((totalH / 25.4) * dpi);

            return {
                main: `${wPx} × ${hPx} px`,
                label: 'Resolución final del lienzo digital',
                extras: [
                    { cls: 'ok', txt: `Tamaño neto: ${(wMM/10).toFixed(1)}×${(hMM/10).toFixed(1)} cm` },
                    { cls: 'warn', txt: `Con refile de corte incluyes +${bMM*2}mm totales` }
                ],
                steps: [`Ancho total: ${totalW}mm → ${(totalW/25.4).toFixed(2)} in`, `Alto total: ${totalH}mm → ${(totalH/25.4).toFixed(2)} in`],
                chart(canvas) {
                    DisenoVisual.resolucion(canvas, wMM, hMM, bMM, wPx, hPx);
                }
            };
        }
    },
    typeScale: {
        title: 'Escala Tipográfica Armónica',
        formula: 'Size_n = Base × (Ratio)^n',
        fields: [
            { id: 'base', label: 'Fuente Base (px)', val: '16' },
            { id: 'ratio', label: 'Proporción', type: 'select', opts: [
                {v:'1.200', l:'1.200 — Tercera menor'},
                {v:'1.250', l:'1.250 — Tercera mayor'},
                {v:'1.333', l:'1.333 — Cuarta justa'},
                {v:'1.618', l:'1.618 — Proporción áurea'}
            ]}
        ],
        calc(f) {
            let base = parseFloat(f.base.value);
            let r = parseFloat(f.ratio.value);
            if (isNaN(base) || base <= 0) return null;

            let h1 = base * Math.pow(r, 3);
            let h2 = base * Math.pow(r, 2);
            let h3 = base * Math.pow(r, 1);
            let sm = base * Math.pow(r, -1);

            return {
                main: `H1: ${h1.toFixed(1)}px`,
                label: `Jerarquías calculadas (Base ${base}px)`,
                extras: [
                    { cls: 'info', txt: `H2: ${h2.toFixed(1)}px | H3: ${h3.toFixed(1)}px` },
                    { cls: 'ok', txt: `Small: ${sm.toFixed(1)}px` }
                ],
                steps: [`H1 = ${base} * (${r})^3`],
                chart(canvas) {
                    DisenoVisual.typeScale(canvas, base, h1, h2, h3, sm);
                }
            };
        }
    },
    aspectRatio: {
        title: 'Relación de Aspecto y Reencuadre',
        formula: 'Proporciones de pantalla H : V',
        fields: [
            { id: 'w_orig', label: 'Ancho origen (px)', val: '1920' },
            { id: 'h_orig', label: 'Alto origen (px)', val: '1080' },
            { id: 'target', label: 'Formato Objetivo', type: 'select', opts: [
                {v:'21:9', l:'Cinemascope (21:9)'},
                {v:'1:1',  l:'Instagram Post (1:1)'},
                {v:'9:16', l:'TikTok/Reels (9:16)'}
            ]}
        ],
        calc(f) {
            let wo = parseInt(f.w_orig.value), ho = parseInt(f.h_orig.value);
            let targetStr = f.target.value;
            if (isNaN(wo) || isNaN(ho) || ho === 0) return null;

            let parts = targetStr.split(':').map(Number);
            let targetRatio = parts[0] / parts[1];
            let origRatio = wo / ho;

            let letterbox = 0, pillarbox = 0;
            if (origRatio > targetRatio) {
                // Sobran lados (Pillarbox)
                pillarbox = Math.abs(wo - (ho * targetRatio)) / 2;
            } else {
                // Sobran arriba/abajo (Letterbox)
                letterbox = Math.abs(ho - (wo / targetRatio)) / 2;
            }

            return {
                main: `Target Ratio: ${targetStr}`,
                label: 'Ajuste de cuadro multimedial',
                extras: [
                    { cls: letterbox > 0 ? 'warn' : 'ok', txt: `Letterbox (Corte sup/inf): ${Math.round(letterbox)} px` },
                    { cls: pillarbox > 0 ? 'warn' : 'ok', txt: `Pillarbox (Corte lat): ${Math.round(pillarbox)} px` }
                ],
                steps: [`Ratio original: ${origRatio.toFixed(2)}`, `Ratio objetivo: ${targetRatio.toFixed(2)}`],
                chart(canvas) {
                    DisenoVisual.aspectRatio(canvas, wo, ho, targetRatio, letterbox, pillarbox);
                }
            };
        }
    },
    color: {
        title: 'Conversor y Contraste de Color',
        formula: 'Contraste WCAG = (L1 + 0.05) / (L2 + 0.05)',
        fields: [
            { id: 'hex', label: 'Color Texto', type: 'color', val: '#4F9CF9' },
            { id: 'bg',  label: 'Color Fondo', type: 'color', val: '#121620' }
        ],
        calc(f) {
            let hex = f.hex.value.trim().replace('#','');
            let bgHex = f.bg.value.trim().replace('#','');
            
            if(hex.length !== 6 || bgHex.length !== 6) return { error: true, msg: "Usá formato HEX de 6 dígitos", label: "Error" };

            const getLuminance = (h) => {
                let r = parseInt(h.substr(0,2),16)/255;
                let g = parseInt(h.substr(2,2),16)/255;
                let b = parseInt(h.substr(4,2),16)/255;
                let a = [r,g,b].map(v => v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4));
                return a[0]*0.2126 + a[1]*0.7152 + a[2]*0.0722;
            };

            let l1 = getLuminance(hex);
            let l2 = getLuminance(bgHex);
            let ratio = l1 > l2 ? (l1 + 0.05) / (l2 + 0.05) : (l2 + 0.05) / (l1 + 0.05);

            let passesAA = ratio >= 4.5 ? 'PASA (AA)' : 'FALLA (AA)';

            return {
                main: `Ratio: ${ratio.toFixed(1)}:1`,
                label: `Accesibilidad UI: ${passesAA}`,
                extras: [{ cls: ratio >= 4.5 ? 'ok' : 'danger', txt: `Mínimo requerido para texto normal: 4.5:1` }],
                steps: [`Luminancia texto: ${l1.toFixed(3)}`, `Luminancia fondo: ${l2.toFixed(3)}`],
                chart(canvas) {
                    DisenoVisual.color(canvas, `#${hex}`, `#${bgHex}`, ratio);
                }
            };
        }
    }
};

Object.assign(FORMS.diseno, {
    rgb_hex: {
        title: 'RGB ↔ HEX (Conversor de Color)',
        formula: '#RRGGBB = R×65536 + G×256 + B',
        fields: [
            { id: 'rh', label: 'Rojo (0-255)', val: '79' },
            { id: 'gh', label: 'Verde (0-255)', val: '156' },
            { id: 'bh', label: 'Azul (0-255)', val: '249' },
            { id: 'hex_in', label: 'Color HEX', val: '#4F9CF9' },
            { id: 'dir_hex', label: 'Dirección', type: 'select', opts: [
                {v:'to_hex', l:'RGB → HEX'},
                {v:'to_rgb', l:'HEX → RGB'}
            ]}
        ],
        calc(f) {
            let dir = f.dir_hex.value;
            if (dir === 'to_hex') {
                let ri = parseInt(f.rh.value), gi = parseInt(f.gh.value), bi = parseInt(f.bh.value);
                if (isNaN(ri) || isNaN(gi) || isNaN(bi)) return { error: true, msg: "Ingresá valores RGB enteros", label: "Error" };
                if (ri < 0 || ri > 255 || gi < 0 || gi > 255 || bi < 0 || bi > 255) return { error: true, msg: "RGB debe estar entre 0 y 255", label: "Fuera de rango" };
                let hex = '#' + [ri, gi, bi].map(v => v.toString(16).padStart(2, '0').toUpperCase()).join('');
                return {
                    main: hex,
                    label: 'Color en HEX',
                    extras: [{ cls: 'info', txt: `RGB(${ri}, ${gi}, ${bi}) → ${hex}` }],
                    steps: [`R=${ri} → 0x${ri.toString(16).padStart(2,'0')}`, `G=${gi} → 0x${gi.toString(16).padStart(2,'0')}`, `B=${bi} → 0x${bi.toString(16).padStart(2,'0')}`],
                    chart(canvas) { DisenoVisual.rgb_hex(canvas, ri, gi, bi, hex); }
                };
            } else {
                let h = f.hex_in.value.trim().replace('#', '');
                if (h.length !== 6) return { error: true, msg: "HEX debe tener 6 dígitos (ej: #4F9CF9)", label: "Error" };
                let ri = parseInt(h.substr(0, 2), 16), gi = parseInt(h.substr(2, 2), 16), bi = parseInt(h.substr(4, 2), 16);
                if (isNaN(ri) || isNaN(gi) || isNaN(bi)) return { error: true, msg: "HEX inválido", label: "Error" };
                return {
                    main: `RGB(${ri}, ${gi}, ${bi})`,
                    label: 'Color en RGB',
                    extras: [{ cls: 'info', txt: `${'#' + h} → RGB(${ri}, ${gi}, ${bi})` }],
                    steps: [`0x${h.substr(0,2)} = ${ri}`, `0x${h.substr(2,2)} = ${gi}`, `0x${h.substr(4,2)} = ${bi}`],
                    chart(canvas) { DisenoVisual.rgb_hex(canvas, ri, gi, bi, '#' + h); }
                };
            }
        }
    },
    rgb_cmyk: {
        title: 'RGB ↔ CMYK (Conversor de Color)',
        formula: 'K = 1−max(R,G,B) | C,M,Y = (1−componente−K) / (1−K)',
        fields: [
            { id: 'cr', label: 'Rojo (0-255)', val: '79' },
            { id: 'cg', label: 'Verde (0-255)', val: '156' },
            { id: 'cb', label: 'Azul (0-255)', val: '249' },
            { id: 'cmyk_c', label: 'Cian (%)', val: '68' },
            { id: 'cmyk_m', label: 'Magenta (%)', val: '37' },
            { id: 'cmyk_y', label: 'Amarillo (%)', val: '0' },
            { id: 'cmyk_k', label: 'Negro (%)', val: '2' },
            { id: 'dir_cmyk', label: 'Dirección', type: 'select', opts: [
                {v:'to_cmyk', l:'RGB → CMYK'},
                {v:'to_rgb', l:'CMYK → RGB'}
            ]}
        ],
        calc(f) {
            let dir = f.dir_cmyk.value;
            if (dir === 'to_cmyk') {
                let r = parseInt(f.cr.value) / 255, g = parseInt(f.cg.value) / 255, b = parseInt(f.cb.value) / 255;
                if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
                let k = 1 - Math.max(r, g, b);
                let c = k === 1 ? 0 : ((1 - r - k) / (1 - k)) * 100;
                let m = k === 1 ? 0 : ((1 - g - k) / (1 - k)) * 100;
                let y = k === 1 ? 0 : ((1 - b - k) / (1 - k)) * 100;
                let kp = k * 100;
                return {
                    main: `C:${c.toFixed(1)}% M:${m.toFixed(1)}% Y:${y.toFixed(1)}% K:${kp.toFixed(1)}%`,
                    label: 'Color en CMYK',
                    extras: [{ cls: 'ok', txt: `CMYK(${c.toFixed(0)}%, ${m.toFixed(0)}%, ${y.toFixed(0)}%, ${kp.toFixed(0)}%)` }],
                    steps: [`K = 1 − max(${r.toFixed(3)},${g.toFixed(3)},${b.toFixed(3)}) = ${(kp/100).toFixed(3)}`, `C = (1−${r.toFixed(3)}−${(kp/100).toFixed(3)})/(1−${(kp/100).toFixed(3)}) = ${c.toFixed(1)}%`],
                    chart(canvas) { DisenoVisual.rgb_cmyk(canvas, parseInt(f.cr.value), parseInt(f.cg.value), parseInt(f.cb.value), c, m, y, kp); }
                };
            } else {
                let c = parseFloat(f.cmyk_c.value) / 100, m = parseFloat(f.cmyk_m.value) / 100, y = parseFloat(f.cmyk_y.value) / 100, k = parseFloat(f.cmyk_k.value) / 100;
                if (isNaN(c) || isNaN(m) || isNaN(y) || isNaN(k)) return null;
                let ri = Math.round(255 * (1 - c) * (1 - k));
                let gi = Math.round(255 * (1 - m) * (1 - k));
                let bi = Math.round(255 * (1 - y) * (1 - k));
                return {
                    main: `RGB(${ri}, ${gi}, ${bi})`,
                    label: 'Color en RGB',
                    extras: [{ cls: 'info', txt: `CMYK(${f.cmyk_c.value}%,${f.cmyk_m.value}%,${f.cmyk_y.value}%,${f.cmyk_k.value}%) → RGB(${ri},${gi},${bi})` }],
                    steps: [`R = 255 × (1−${c.toFixed(2)}) × (1−${k.toFixed(2)}) = ${ri}`, `G = 255 × (1−${m.toFixed(2)}) × (1−${k.toFixed(2)}) = ${gi}`, `B = 255 × (1−${y.toFixed(2)}) × (1−${k.toFixed(2)}) = ${bi}`],
                    chart(canvas) { DisenoVisual.rgb_cmyk(canvas, ri, gi, bi, c * 100, m * 100, y * 100, k * 100); }
                };
            }
        }
    },
    dpi_ppi: {
        title: 'DPI ↔ PPI (Resolución de Pantalla/Impresión)',
        formula: 'PPI = √(w² + h²) / diagonal | DPI = píxeles / pulgada',
        fields: [
            { id: 'dw', label: 'Ancho en píxeles', val: '1920' },
            { id: 'dh', label: 'Alto en píxeles', val: '1080' },
            { id: 'd_diag', label: 'Diagonal (pulgadas)', val: '24' },
            { id: 'd_dpi', label: 'DPI de impresión', val: '300' }
        ],
        calc(f) {
            let w = parseFloat(f.dw.value), h = parseFloat(f.dh.value), diag = parseFloat(f.d_diag.value), dpi = parseFloat(f.d_dpi.value);
            if (isNaN(w) || isNaN(h) || isNaN(diag) || isNaN(dpi) || w <= 0 || h <= 0 || diag <= 0) return { error: true, msg: "Todos los valores deben ser > 0", label: "Error" };
            let ppi = Math.sqrt(w * w + h * h) / diag;
            let megapixeles = (w / (dpi || 300)) * (h / (dpi || 300));
            return {
                main: `${ppi.toFixed(1)} PPI`,
                label: 'Densidad de píxeles de pantalla',
                extras: [
                    { cls: 'info', txt: `DPI de impresión: ${dpi} → ${(w * h / (dpi * dpi)).toFixed(1)} pulg²` },
                    { cls: 'ok', txt: `Megapíxeles: ${(w * h / 1000000).toFixed(2)} MP` }
                ],
                steps: [`PPI = √(${w}² + ${h}²) / ${diag} = ${ppi.toFixed(1)}`, `Área impresa: ${(w/dpi).toFixed(2)}×${(h/dpi).toFixed(2)} in`],
                chart(canvas) { DisenoVisual.dpi_ppi(canvas, w, h, diag, ppi); }
            };
        }
    },
    tamano_imagen: {
        title: 'Tamaño de Archivo de Imagen',
        formula: 'Peso = (Ancho × Alto × Bits por pixel) / 8 / 1024 / 1024 (MB)',
        fields: [
            { id: 'iw', label: 'Ancho (px)', val: '1920' },
            { id: 'ih', label: 'Alto (px)', val: '1080' },
            { id: 'bpp', label: 'Bits por pixel', type: 'select', opts: [
                {v:'1', l:'1 bit (B/N)'},
                {v:'8', l:'8 bits (256 colores)'},
                {v:'24', l:'24 bits (RGB verdadero)'},
                {v:'32', l:'32 bits (RGBA)'}
            ]},
            { id: 'comp', label: 'Compresión (ratio)', type: 'select', opts: [
                {v:'1', l:'Sin compresión'},
                {v:'0.1', l:'JPEG 90% (0.1)'},
                {v:'0.05', l:'JPEG 75% (0.05)'},
                {v:'0.02', l:'JPEG 50% (0.02)'}
            ]}
        ],
        calc(f) {
            let w = parseFloat(f.iw.value), h = parseFloat(f.ih.value), bpp = parseFloat(f.bpp.value), ratio = parseFloat(f.comp.value);
            if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) return { error: true, msg: "Dimensiones deben ser > 0", label: "Error" };
            let rawBytes = w * h * bpp / 8;
            let compBytes = rawBytes * ratio;
            let rawMB = rawBytes / (1024 * 1024);
            let compMB = compBytes / (1024 * 1024);
            return {
                main: `${compMB.toFixed(2)} MB`,
                label: 'Tamaño comprimido estimado',
                extras: [
                    { cls: 'info', txt: `Sin compresión: ${rawMB.toFixed(2)} MB` },
                    { cls: (ratio < 0.1 ? 'ok' : 'warn'), txt: `Relación: ${w}×${h} × ${bpp} bpp = ${rawMB.toFixed(2)} MB raw` }
                ],
                steps: [`Raw: ${w}×${h}×${bpp}/8 = ${(rawBytes/1024).toFixed(1)} KB`, `Comprimido: ${rawMB.toFixed(2)} MB × ${ratio} = ${compMB.toFixed(2)} MB`],
                chart(canvas) { DisenoVisual.tamano_imagen(canvas, w, h, bpp, rawMB, compMB); }
            };
        }
    },
    bitrate_video: {
        title: 'Bitrate de Video',
        formula: 'Bitrate = Ancho × Alto × FPS × bits_por_pixel × compresión',
        fields: [
            { id: 'vw', label: 'Resolución ancho (px)', val: '1920' },
            { id: 'vh', label: 'Resolución alto (px)', val: '1080' },
            { id: 'fps', label: 'FPS (cuadros/segundo)', val: '30' },
            { id: 'v_bpp', label: 'Bits por pixel', type: 'select', opts: [
                {v:'0.25', l:'Baja (0.25 bpp)'},
                {v:'0.5', l:'Media (0.5 bpp)'},
                {v:'0.8', l:'Alta (0.8 bpp)'},
                {v:'1.2', l:'ProRes/Sin pérdida (1.2 bpp)'}
            ]},
            { id: 'duracion', label: 'Duración (minutos)', val: '10' }
        ],
        calc(f) {
            let w = parseFloat(f.vw.value), h = parseFloat(f.vh.value), fps = parseFloat(f.fps.value), bpp = parseFloat(f.v_bpp.value), min = parseFloat(f.duracion.value);
            if (isNaN(w) || isNaN(h) || isNaN(fps) || isNaN(min) || w <= 0 || h <= 0 || fps <= 0 || min <= 0) return { error: true, msg: "Todos los valores deben ser > 0", label: "Error" };
            let bitrate = w * h * fps * bpp;
            let bitrateMbps = bitrate / 1000000;
            let sizeBytes = bitrate * min * 60 / 8;
            let sizeGB = sizeBytes / (1024 * 1024 * 1024);
            let sizeMB = sizeBytes / (1024 * 1024);
            return {
                main: `${bitrateMbps.toFixed(1)} Mbps`,
                label: 'Bitrate estimado de video',
                extras: [
                    { cls: 'info', txt: `Tamaño total: ${sizeMB < 1024 ? sizeMB.toFixed(1) + ' MB' : sizeGB.toFixed(2) + ' GB'}` },
                    { cls: 'ok', txt: `Resolución: ${w}×${h} @ ${fps} fps` }
                ],
                steps: [`Bitrate = ${w}×${h}×${fps}×${bpp} = ${bitrate.toFixed(0)} bps = ${bitrateMbps.toFixed(1)} Mbps`, `Archivo = ${bitrateMbps.toFixed(1)} Mbps × ${min} min = ${sizeMB < 1024 ? sizeMB.toFixed(1) + ' MB' : sizeGB.toFixed(2) + ' GB'}`],
                chart(canvas) { DisenoVisual.bitrate_video(canvas, w, h, fps, bpp, bitrateMbps); }
            };
        }
    }
});

if (!FORMS.diseno) FORMS.diseno = {};
Object.assign(FORMS.diseno, {
    aureo: {
        title: 'Proporción Áurea',
        formula: 'φ = (1 + √5) / 2 ≈ 1.618',
        fields: [
            { id: 'base', label: 'Valor base (menor)', val: '100' }
        ],
        calc(f) {
            let b = parseFloat(f.base.value);
            if (isNaN(b) || b <= 0) return { error: true, msg: "Valor debe ser > 0", label: "Error" };
            let phi = (1 + Math.sqrt(5)) / 2;
            let mayor = b * phi;
            let menor = b / phi;
            return {
                main: mayor.toFixed(2),
                label: 'Valor áureo (mayor)',
                extras: [
                    { cls: 'info', txt: 'φ = ' + phi.toFixed(4) },
                    { cls: 'ok', txt: 'Menor = ' + menor.toFixed(2) + ' | Mayor = ' + mayor.toFixed(2) }
                ],
                steps: ['φ = (1 + √5) / 2 = ' + phi.toFixed(4), 'Mayor = ' + b + ' × ' + phi.toFixed(4) + ' = ' + mayor.toFixed(2)],
                chart(canvas) {
                    DisenoVisual.aureo(canvas, b, mayor, phi);
                }
            };
        }
    },
    escala_grafica: {
        title: 'Escala Gráfica',
        formula: 'Medida_dibujo = Medida_real × Escala',
        fields: [
            { id: 'real', label: 'Medida real (mm)', val: '1000' },
            { id: 'escala', label: 'Escala (1:X)', type: 'select', opts: [
                { v: '1', l: '1:1 (tamaño real)' },
                { v: '5', l: '1:5' },
                { v: '10', l: '1:10' },
                { v: '20', l: '1:20' },
                { v: '50', l: '1:50' },
                { v: '100', l: '1:100' }
            ]}
        ],
        calc(f) {
            let real = parseFloat(f.real.value), escala = parseFloat(f.escala.value);
            if (isNaN(real) || real <= 0) return { error: true, msg: "Medida real debe ser > 0", label: "Error" };
            let dibujo = real / escala;
            return {
                main: dibujo.toFixed(2) + ' mm',
                label: 'Medida en el dibujo',
                extras: [{ cls: 'info', txt: 'Escala 1:' + escala + ' | Real: ' + real + ' mm = ' + (real / 10).toFixed(1) + ' cm' }],
                steps: ['Dibujo = ' + real + ' / ' + escala + ' = ' + dibujo.toFixed(2) + ' mm'],
                chart(canvas) {
                    DisenoVisual.escala_grafica(canvas, real, escala, dibujo);
                }
            };
        }
    },
    regla_tercios: {
        title: 'Regla de Tercios (Composición)',
        formula: 'Puntos fuertes en ⅓ y ⅔ del encuadre',
        fields: [
            { id: 'aw', label: 'Ancho del encuadre (px)', val: '1920' },
            { id: 'ah', label: 'Alto del encuadre (px)', val: '1080' }
        ],
        calc(f) {
            let aw = parseFloat(f.aw.value), ah = parseFloat(f.ah.value);
            if (isNaN(aw) || isNaN(ah) || aw <= 0 || ah <= 0) return { error: true, msg: "Dimensiones deben ser > 0", label: "Error" };
            let x1 = aw / 3, x2 = 2 * aw / 3, y1 = ah / 3, y2 = 2 * ah / 3;
            return {
                main: Math.round(aw) + ' × ' + Math.round(ah),
                label: 'Puntos fuertes en intersecciones',
                extras: [
                    { cls: 'info', txt: 'Verticales: ' + Math.round(x1) + ', ' + Math.round(x2) + ' px' },
                    { cls: 'ok', txt: 'Horizontales: ' + Math.round(y1) + ', ' + Math.round(y2) + ' px' }
                ],
                steps: ['⅓ de ancho: ' + Math.round(x1) + 'px', '⅓ de alto: ' + Math.round(y1) + 'px'],
                chart(canvas) {
                    DisenoVisual.regla_tercios(canvas, aw, ah, x1, x2, y1, y2);
                }
            };
        }
    },
    tipometria: {
        title: 'Tipometría (em / rem / pt / px)',
        formula: '1em = base (16px) | 1pt = 1/72 pulgada',
        fields: [
            { id: 'val_t', label: 'Valor numérico', val: '2' },
            { id: 'from_t', label: 'Unidad origen', type: 'select', opts: [
                { v: 'em', l: 'em' },
                { v: 'rem', l: 'rem' },
                { v: 'pt', l: 'pt (puntos)' },
                { v: 'px', l: 'px (píxeles)' },
                { v: 'mm_t', l: 'mm' }
            ]},
            { id: 'to_t', label: 'Unidad destino', type: 'select', opts: [
                { v: 'px', l: 'px (píxeles)' },
                { v: 'em', l: 'em' },
                { v: 'rem', l: 'rem' },
                { v: 'pt', l: 'pt (puntos)' },
                { v: 'mm_t', l: 'mm' }
            ]},
            { id: 'base_t', label: 'Base tipográfica (px)', type: 'select', opts: [
                { v: '16', l: '16px (navegador)' },
                { v: '18', l: '18px' },
                { v: '20', l: '20px' }
            ]}
        ],
        calc(f) {
            let val = parseFloat(f.val_t.value), base = parseFloat(f.base_t.value);
            let from = f.from_t.value, to = f.to_t.value;
            if (isNaN(val) || val <= 0) return { error: true, msg: "Valor debe ser > 0", label: "Error" };
            let enPx;
            if (from === 'px') enPx = val;
            else if (from === 'em' || from === 'rem') enPx = val * base;
            else if (from === 'pt') enPx = val * 96 / 72;
            else if (from === 'mm_t') enPx = val * 96 / 25.4;
            else enPx = val;
            let res;
            if (to === 'px') res = enPx;
            else if (to === 'em' || to === 'rem') res = enPx / base;
            else if (to === 'pt') res = enPx * 72 / 96;
            else if (to === 'mm_t') res = enPx * 25.4 / 96;
            else res = enPx;
            return {
                main: res.toFixed(2) + ' ' + to.replace('_t', ''),
                label: 'Conversión tipográfica',
                extras: [{ cls: 'info', txt: val + ' ' + from.replace('_t', '') + ' → ' + res.toFixed(2) + ' ' + to.replace('_t', '') }],
                steps: ['Base: ' + base + 'px', 'En px: ' + enPx.toFixed(4) + 'px'],
                chart(canvas) {
                    DisenoVisual.tipometria(canvas, val, from, to, res, base);
                }
            };
        }
    },
    gama_cromatica: {
        title: 'Gama Cromática (Armonías)',
        formula: 'Complementario = H ± 180° | Tríada = H, H+120°, H+240°',
        fields: [
            { id: 'hue', label: 'Matiz base (0–360°)', val: '210' },
            { id: 'armonia', label: 'Tipo de armonía', type: 'select', opts: [
                { v: 'comp', l: 'Complementario' },
                { v: 'triad', l: 'Tríada' },
                { v: 'analog', l: 'Análogos (±30°)' }
            ]}
        ],
        calc(f) {
            let hue = parseFloat(f.hue.value), armonia = f.armonia.value;
            if (isNaN(hue) || hue < 0 || hue > 360) return { error: true, msg: "Matiz debe estar entre 0 y 360", label: "Error" };
            let colores = [];
            if (armonia === 'comp') {
                let h2 = (hue + 180) % 360;
                colores = [{ h: hue, l: 'Base' }, { h: h2, l: 'Complementario' }];
            } else if (armonia === 'triad') {
                colores = [
                    { h: hue, l: 'Base' },
                    { h: (hue + 120) % 360, l: '2°' },
                    { h: (hue + 240) % 360, l: '3°' }
                ];
            } else {
                colores = [
                    { h: (hue - 30 + 360) % 360, l: '−30°' },
                    { h: hue, l: 'Base' },
                    { h: (hue + 30) % 360, l: '+30°' }
                ];
            }
            let lista = colores.map(c => Math.round(c.h) + '°').join(' | ');
            return {
                main: armonia.charAt(0).toUpperCase() + armonia.slice(1),
                label: 'Armonía de color',
                extras: [{ cls: 'ok', txt: lista }],
                steps: colores.map(c => Math.round(c.h) + '° — ' + c.l),
                chart(canvas) {
                    DisenoVisual.gama_cromatica(canvas, hue, armonia, colores);
                }
            };
        }
    },
    kerning_tracking: {
        title: 'Kerning y Tracking',
        formula: 'Tracking_total = Kerning × (n - 1)',
        fields: [
            { id: 'kern', label: 'Kerning (em)', val: '0.02' },
            { id: 'chars', label: 'Cantidad de caracteres', val: '10' }
        ],
        calc(f) {
            let kern = parseFloat(f.kern.value), chars = parseInt(f.chars.value);
            if (isNaN(kern) || isNaN(chars) || chars < 2) return { error: true, msg: "Caracteres debe ser ≥ 2", label: "Error" };
            let tracking = kern * (chars - 1);
            return {
                main: tracking.toFixed(3) + ' em',
                label: 'Tracking total',
                extras: [
                    { cls: 'info', txt: 'Kerning: ' + kern.toFixed(3) + ' em entre pares' },
                    { cls: 'ok', txt: ((tracking * 1000).toFixed(0)) + ' miliems' }
                ],
                steps: ['Tracking = ' + kern.toFixed(3) + ' × (' + chars + ' − 1) = ' + tracking.toFixed(3) + ' em'],
                chart(canvas) {
                    DisenoVisual.kerning_tracking(canvas, kern, chars, tracking);
                }
            };
        }
    },
    peso_visual: {
        title: 'Peso Visual (Jerarquía)',
        formula: 'Peso ∝ Área × Densidad × Contraste',
        fields: [
            { id: 'area_p', label: 'Área del elemento (%)', val: '25' },
            { id: 'densidad', label: 'Densidad visual (1–10)', val: '6' },
            { id: 'contraste_p', label: 'Contraste (1–10)', val: '7' }
        ],
        calc(f) {
            let area = parseFloat(f.area_p.value), dens = parseFloat(f.densidad.value), cont = parseFloat(f.contraste_p.value);
            if (isNaN(area) || isNaN(dens) || isNaN(cont)) return null;
            if (area < 0 || area > 100) return { error: true, msg: "Área entre 0 y 100%", label: "Error" };
            if (dens < 1 || dens > 10 || cont < 1 || cont > 10) return { error: true, msg: "Densidad y contraste entre 1 y 10", label: "Error" };
            let peso = (area / 100) * (dens / 10) * (cont / 10);
            let nivel = peso < 0.15 ? 'Bajo' : peso < 0.35 ? 'Medio' : peso < 0.6 ? 'Alto' : 'Dominante';
            return {
                main: (peso * 100).toFixed(1) + '%',
                label: 'Peso visual relativo',
                extras: [{ cls: peso > 0.35 ? 'ok' : 'warn', txt: 'Jerarquía: ' + nivel }],
                steps: ['Peso = (' + area + '/100) × (' + dens + '/10) × (' + cont + '/10) = ' + (peso * 100).toFixed(1) + '%'],
                chart(canvas) {
                    DisenoVisual.peso_visual(canvas, area, dens, cont, peso);
                }
            };
        }
    },
    reticula: {
        title: 'Retícula (Grid de Columnas)',
        formula: 'Columna = (Ancho − m×2 − g×(c−1)) / c',
        fields: [
            { id: 'ancho_r', label: 'Ancho total (px)', val: '1200' },
            { id: 'cols_r', label: 'Columnas', val: '12' },
            { id: 'gutter_r', label: 'Medianil (px)', val: '20' },
            { id: 'margin_r', label: 'Margen lateral (px)', val: '15' }
        ],
        calc(f) {
            let ancho = parseFloat(f.ancho_r.value), cols = parseFloat(f.cols_r.value);
            let gutter = parseFloat(f.gutter_r.value), margin = parseFloat(f.margin_r.value);
            if (isNaN(ancho) || isNaN(cols) || isNaN(gutter) || isNaN(margin)) return null;
            if (cols <= 0 || ancho <= 0) return { error: true, msg: "Ancho y columnas deben ser > 0", label: "Error" };
            let contenido = ancho - 2 * margin;
            let colW = (contenido - gutter * (cols - 1)) / cols;
            return {
                main: colW.toFixed(1) + ' px',
                label: 'Ancho de columna',
                extras: [
                    { cls: 'info', txt: cols + ' columnas de ' + colW.toFixed(1) + 'px con gutter de ' + gutter + 'px' },
                    { cls: 'ok', txt: 'Contenido total: ' + contenido + 'px' }
                ],
                steps: ['Contenido = ' + ancho + ' − 2×' + margin + ' = ' + contenido + 'px', 'Columna = (' + contenido + ' − ' + gutter + '×' + (cols - 1) + ') / ' + cols + ' = ' + colW.toFixed(1) + 'px'],
                chart(canvas) {
                    DisenoVisual.reticula(canvas, ancho, cols, gutter, margin, colW);
                }
            };
        }
    },
    legibilidad: {
        title: 'Legibilidad Tipográfica',
        formula: 'Caracteres_por_linea = Ancho / (tamaño × 0.5)',
        fields: [
            { id: 'font_sz', label: 'Tamaño de fuente (px)', val: '16' },
            { id: 'line_w', label: 'Ancho de línea (px)', val: '600' }
        ],
        calc(f) {
            let sz = parseFloat(f.font_sz.value), lw = parseFloat(f.line_w.value);
            if (isNaN(sz) || isNaN(lw) || sz <= 0 || lw <= 0) return { error: true, msg: "Valores deben ser > 0", label: "Error" };
            let charW = sz * 0.5;
            let cpl = Math.round(lw / charW);
            let opt = cpl > 75 ? 'Excesivo (>75)' : cpl > 60 ? 'Largo (60–75)' : cpl > 45 ? 'Óptimo (45–60)' : 'Corto (<45)';
            return {
                main: cpl + ' cpp',
                label: 'Caracteres por línea',
                extras: [{ cls: cpl >= 45 && cpl <= 75 ? 'ok' : 'warn', txt: opt }],
                steps: ['Ancho caract. ≈ ' + sz + ' × 0.5 = ' + charW.toFixed(1) + 'px', 'CPL = ' + lw + ' / ' + charW.toFixed(1) + ' = ' + cpl],
                chart(canvas) {
                    DisenoVisual.legibilidad(canvas, sz, lw, cpl);
                }
            };
        }
    },
    sangria_margenes: {
        title: 'Sangrías y Márgenes (Diagramación)',
        formula: 'Área_útil = (W − 2m) × (H − 2m)',
        fields: [
            { id: 'pag_w', label: 'Ancho página (mm)', val: '210' },
            { id: 'pag_h', label: 'Alto página (mm)', val: '297' },
            { id: 'mar_s', label: 'Margen superior (mm)', val: '20' },
            { id: 'mar_i', label: 'Margen inferior (mm)', val: '25' },
            { id: 'mar_int', label: 'Margen interior (mm)', val: '15' },
            { id: 'mar_ext', label: 'Margen exterior (mm)', val: '20' }
        ],
        calc(f) {
            let pw = parseFloat(f.pag_w.value), ph = parseFloat(f.pag_h.value);
            let ms = parseFloat(f.mar_s.value), mi = parseFloat(f.mar_i.value);
            let mint = parseFloat(f.mar_int.value), mext = parseFloat(f.mar_ext.value);
            if (isNaN(pw) || isNaN(ph) || pw <= 0 || ph <= 0) return { error: true, msg: "Dimensiones deben ser > 0", label: "Error" };
            let anchoUtil = pw - mint - mext;
            let altoUtil = ph - ms - mi;
            let areaUtil = anchoUtil * altoUtil;
            return {
                main: anchoUtil.toFixed(1) + ' × ' + altoUtil.toFixed(1) + ' mm',
                label: 'Mancha de texto (ancho × alto)',
                extras: [
                    { cls: 'info', txt: 'Área útil: ' + areaUtil.toFixed(0) + ' mm²' },
                    { cls: 'ok', txt: ((anchoUtil * altoUtil) / (pw * ph) * 100).toFixed(1) + '% del total' }
                ],
                steps: ['Ancho útil = ' + pw + ' − ' + mint + ' − ' + mext + ' = ' + anchoUtil.toFixed(1) + 'mm', 'Alto útil = ' + ph + ' − ' + ms + ' − ' + mi + ' = ' + altoUtil.toFixed(1) + 'mm'],
                chart(canvas) {
                    DisenoVisual.sangria_margenes(canvas, pw, ph, ms, mi, mint, mext, anchoUtil, altoUtil);
                }
            };
        }
    }
});