FORMS.diseno = {

    // ─── 1. CONVERSOR DE UNIDADES (original expandido) ───────────────────────
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
                {v:'600',l:'600 — Fotografía / alta calidad'}
            ]},
            { id: 'bleed', label: 'Sumar sangría (3 mm por lado)', type: 'checkbox', val: false }
        ],
        calc(f) {
            const CM_INCH = 2.54, MM_INCH = 25.4;
            let v     = parseFloat(f.val.value);
            let from  = f.from.value;
            let to    = f.to.value;
            let dpi   = parseFloat(f.dpi.value);
            let bleed = f.bleed.checked;
            if (isNaN(v)) return null;

            let workV = v;
            if (bleed) {
                if (from === 'cm') workV += 0.6;
                else if (from === 'mm') workV += 6;
                else if (from === 'in') workV += (6 / MM_INCH);
            }

            // Normalizar a pulgadas
            let inches =
                from === 'px' ? workV / dpi :
                from === 'cm' ? workV / CM_INCH :
                from === 'mm' ? workV / MM_INCH :
                workV;

            let res =
                to === 'px' ? Math.round(inches * dpi) :
                to === 'cm' ? (inches * CM_INCH).toFixed(2) :
                to === 'mm' ? (inches * MM_INCH).toFixed(1) :
                inches.toFixed(4);

            let extras = [];
            if (dpi < 150 && from !== 'px' && workV > 50)
                extras.push({ cls: 'warn',   txt: 'Para tamaños grandes se recomienda 150 DPI como mínimo' });
            if (to === 'px' && res > 10000)
                extras.push({ cls: 'danger', txt: 'Archivo muy pesado (>10 000 px en un eje)' });

            extras.push({ cls: 'info', txt: `Equivalencias: ${Math.round(inches * dpi)} px | ${(inches * CM_INCH).toFixed(2)} cm | ${(inches * MM_INCH).toFixed(1)} mm | ${inches.toFixed(4)}"` });
            extras.push({ cls: 'ok',   txt: 'Tip: logos en Vector (SVG/AI). CMYK para papel, RGB para pantalla.' });

            return {
                main:  `${res} ${to}`,
                label: bleed ? 'Resultado con sangría (3 mm/lado)' : 'Resultado final',
                extras,
                steps: [
                    `Origen: ${v} ${from}`,
                    bleed ? `+ Bleed (6 mm total): ${workV.toFixed(2)} ${from}` : '',
                    `Convertido a pulgadas: ${inches.toFixed(4)}"`,
                    `DPI seleccionado: ${dpi}`
                ].filter(Boolean)
            };
        }
    },

    // ─── 2. TAMAÑOS DE PAPEL ESTÁNDAR ────────────────────────────────────────
    papel: {
        title: 'Tamaños de papel estándar',
        formula: 'px = mm / 25.4 × DPI',
        fields: [
            { id: 'formato', label: 'Formato', type: 'select', opts: [
                {v:'a0',   l:'A0  — 841 × 1189 mm'},
                {v:'a1',   l:'A1  — 594 × 841 mm'},
                {v:'a2',   l:'A2  — 420 × 594 mm'},
                {v:'a3',   l:'A3  — 297 × 420 mm'},
                {v:'a4',   l:'A4  — 210 × 297 mm'},
                {v:'a5',   l:'A5  — 148 × 210 mm'},
                {v:'a6',   l:'A6  — 105 × 148 mm'},
                {v:'carta',l:'Carta  — 215.9 × 279.4 mm'},
                {v:'legal',l:'Legal  — 215.9 × 355.6 mm'},
                {v:'tabloide',l:'Tabloide — 279.4 × 431.8 mm'},
                {v:'10x15',l:'Foto 10×15 cm'},
                {v:'13x18',l:'Foto 13×18 cm'},
                {v:'20x30',l:'Foto 20×30 cm'},
                {v:'tarjeta',l:'Tarjeta personal — 90 × 50 mm'},
                {v:'instagram',l:'Instagram — 1080 × 1080 px'},
                {v:'story',l:'Story/Reel — 1080 × 1920 px'},
                {v:'banner_fb',l:'Banner Facebook — 820 × 312 px'},
                {v:'a4_land',l:'A4 horizontal — 297 × 210 mm'}
            ]},
            { id: 'dpi', label: 'Resolución', type: 'select', opts: [
                {v:'300',l:'300 — Imprenta'},{v:'150',l:'150 — Lonas'},
                {v:'96',l:'96 — Web'},{v:'600',l:'600 — Fotografía'}
            ]},
            { id: 'bleed', label: 'Incluir sangría (3 mm por lado)', type: 'checkbox', val: false }
        ],
        calc(f) {
            const papeles = {
                a0:        [841,  1189], a1:       [594,  841],  a2:      [420, 594],
                a3:        [297,  420],  a4:       [210,  297],  a5:      [148, 210],
                a6:        [105,  148],  carta:    [215.9,279.4],legal:   [215.9,355.6],
                tabloide:  [279.4,431.8],a4_land:  [297,  210],
                '10x15':   [100,  150],  '13x18':  [130,  180],  '20x30':[200, 300],
                tarjeta:   [90,   50],
                instagram: null, story: null, banner_fb: null
            };
            const NATIVO = { instagram:[1080,1080], story:[1080,1920], banner_fb:[820,312] };

            let fmt  = f.formato.value;
            let dpi  = parseFloat(f.dpi.value);
            let bleed = f.bleed.checked;

            if (NATIVO[fmt]) {
                let [w, h] = NATIVO[fmt];
                return {
                    main:  `${w} × ${h} px`,
                    label: 'Dimensiones nativas (diseño digital)',
                    extras:[
                        { cls:'info', txt:`Ratio: ${(w/h).toFixed(3)} — Modo: RGB` },
                        { cls:'ok',   txt:'No aplica DPI. Usá 96 dpi para exportar.' }
                    ],
                    steps: [`Formato digital fijo: ${w}×${h}px`]
                };
            }

            let [wMM, hMM] = papeles[fmt];
            let bMM = bleed ? 6 : 0;
            let wPx = Math.round((wMM + bMM) / 25.4 * dpi);
            let hPx = Math.round((hMM + bMM) / 25.4 * dpi);
            let wCM = ((wMM + bMM) / 10).toFixed(1);
            let hCM = ((hMM + bMM) / 10).toFixed(1);

            // Peso estimado en MB (RGB 8-bit sin comprimir)
            let mb = (wPx * hPx * 3 / 1048576).toFixed(1);
            let mbCMYK = (wPx * hPx * 4 / 1048576).toFixed(1);

            return {
                main:  `${wPx} × ${hPx} px`,
                label: `${wCM} × ${hCM} cm a ${dpi} DPI${bleed ? ' + sangría' : ''}`,
                extras: [
                    { cls:'info',   txt:`Peso aprox. RGB: ${mb} MB | CMYK: ${mbCMYK} MB (sin comprimir)` },
                    { cls:'info',   txt:`En pulgadas: ${(wMM/25.4).toFixed(2)}" × ${(hMM/25.4).toFixed(2)}"` },
                    parseFloat(mb) > 100
                        ? { cls:'warn', txt:'Archivo muy pesado. Considerá guardar en TIFF comprimido o PDF/X.' }
                        : { cls:'ok',   txt:'Tamaño manejable para la mayoría de flujos de impresión.' }
                ],
                steps: [
                    `Dimensión: ${wMM} × ${hMM} mm${bleed ? ` + 6mm bleed = ${wMM+6}×${hMM+6}mm` : ''}`,
                    `Conversión: mm / 25.4 × DPI`,
                    `Resultado: ${wPx} × ${hPx} px`
                ]
            };
        }
    },

    // ─── 3. PESO DE ARCHIVO ESTIMADO ─────────────────────────────────────────
    peso: {
        title: 'Peso estimado de archivo',
        formula: 'MB = ancho × alto × canales × bits/8 / 1 048 576',
        fields: [
            { id: 'ancho',   label: 'Ancho (px)',  val: '2480' },
            { id: 'alto',    label: 'Alto (px)',   val: '3508' },
            { id: 'modo',    label: 'Modo de color', type: 'select', opts: [
                {v:'3',l:'RGB (3 canales)'},{v:'4',l:'CMYK (4 canales)'},
                {v:'1',l:'Escala de grises'},{v:'4a',l:'RGBA (con alfa)'}
            ]},
            { id: 'bits',    label: 'Profundidad', type: 'select', opts: [
                {v:'8',l:'8 bits (estándar)'},{v:'16',l:'16 bits (retoque profesional)'},{v:'32',l:'32 bits (HDR)'}
            ]},
        ],
        calc(f) {
            let w    = parseFloat(f.ancho.value);
            let h    = parseFloat(f.alto.value);
            let modo = f.modo.value;
            let bits = parseFloat(f.bits.value);
            if (isNaN(w) || isNaN(h)) return null;

            let canales = modo === '4a' ? 4 : parseFloat(modo);
            let rawMB   = w * h * canales * bits / 8 / 1048576;
            let tifMB   = rawMB * 0.6;
            let jpgMB   = rawMB * 0.05;
            let pngMB   = rawMB * 0.35;
            let mpx     = (w * h / 1e6).toFixed(1);

            return {
                main:  `${rawMB.toFixed(1)} MB`,
                label: 'Peso sin comprimir (PSD/TIFF raw)',
                extras: [
                    { cls:'info', txt:`${mpx} Megapíxeles | ${w.toLocaleString()} × ${h.toLocaleString()} px` },
                    { cls:'info', txt:`TIFF LZW ≈ ${tifMB.toFixed(1)} MB | PNG ≈ ${pngMB.toFixed(1)} MB | JPG ≈ ${jpgMB.toFixed(1)} MB` },
                    rawMB > 500
                        ? { cls:'danger', txt:'Archivo extremadamente pesado. Considerá recortar en mosaicos.' }
                        : rawMB > 100
                        ? { cls:'warn',   txt:'Archivo pesado. Asegurate de tener suficiente RAM (recomendado: ×5 del peso).' }
                        : { cls:'ok',     txt:'Tamaño manejable.' }
                ],
                steps: [
                    `Píxeles totales: ${w} × ${h} = ${(w*h).toLocaleString()} px`,
                    `Canales: ${canales} | Bits: ${bits}`,
                    `Raw = ${(w*h).toLocaleString()} × ${canales} × ${bits}/8 / 1048576 = ${rawMB.toFixed(2)} MB`
                ]
            };
        }
    },

    // ─── 4. CONVERSIÓN CMYK ↔ RGB ↔ HEX ─────────────────────────────────────
    color: {
        title: 'Conversión CMYK ↔ RGB ↔ HEX',
        formula: 'R = 255 × (1−C) × (1−K)',
        fields: [
            { id: 'modo',  label: 'Ingresar como', type: 'select', opts: [
                {v:'hex',  l:'HEX (#rrggbb)'},
                {v:'rgb',  l:'RGB (0-255 c/u)'},
                {v:'cmyk', l:'CMYK (0-100% c/u)'}
            ]},
            { id: 'hex',   label: 'HEX',  val: '#1a73e8' },
            { id: 'r',     label: 'R',    val: '' },
            { id: 'g',     label: 'G',    val: '' },
            { id: 'b',     label: 'B',    val: '' },
            { id: 'c',     label: 'C %',  val: '' },
            { id: 'mc',    label: 'M %',  val: '' },
            { id: 'y',     label: 'Y %',  val: '' },
            { id: 'k',     label: 'K %',  val: '' },
        ],
        calc(f) {
            let modo = f.modo.value;
            let R, G, B;

            if (modo === 'hex') {
                let hex = f.hex.value.replace('#','');
                if (hex.length !== 6) return null;
                R = parseInt(hex.slice(0,2),16);
                G = parseInt(hex.slice(2,4),16);
                B = parseInt(hex.slice(4,6),16);
            } else if (modo === 'rgb') {
                R = parseFloat(f.r.value); G = parseFloat(f.g.value); B = parseFloat(f.b.value);
                if (isNaN(R)||isNaN(G)||isNaN(B)) return null;
            } else {
                let C = parseFloat(f.c.value)/100, M = parseFloat(f.mc.value)/100,
                    Y = parseFloat(f.y.value)/100,  K = parseFloat(f.k.value)/100;
                if ([C,M,Y,K].some(isNaN)) return null;
                R = Math.round(255*(1-C)*(1-K));
                G = Math.round(255*(1-M)*(1-K));
                B = Math.round(255*(1-Y)*(1-K));
            }

            // RGB → CMYK
            let r1=R/255, g1=G/255, b1=B/255;
            let K2 = 1 - Math.max(r1,g1,b1);
            let denom = (1-K2) || 0.0001;
            let C2 = (1-r1-K2)/denom, M2 = (1-g1-K2)/denom, Y2 = (1-b1-K2)/denom;

            // RGB → HEX
            let hex2 = '#' + [R,G,B].map(v=>v.toString(16).padStart(2,'0')).join('');

            // Luminosidad percibida
            let lum = (0.299*R + 0.587*G + 0.114*B);
            let onBg = lum > 128 ? '#000' : '#fff';

            return {
                main:  hex2.toUpperCase(),
                label: 'Color unificado',
                extras: [
                    { cls:'info', txt:`RGB: ${R}, ${G}, ${B}` },
                    { cls:'info', txt:`CMYK: C:${(C2*100).toFixed(0)}% M:${(M2*100).toFixed(0)}% Y:${(Y2*100).toFixed(0)}% K:${(K2*100).toFixed(0)}%` },
                    { cls:'ok',   txt:`Texto legible sobre este fondo: ${onBg === '#000' ? 'negro' : 'blanco'}` },
                    { cls:'warn', txt:'CMYK es orientativo. Los perfiles ICC pueden variar en imprenta.' }
                ],
                steps: [
                    `RGB: (${R}, ${G}, ${B})`,
                    `HEX: ${hex2.toUpperCase()}`,
                    `K = 1 − max(${r1.toFixed(3)}, ${g1.toFixed(3)}, ${b1.toFixed(3)}) = ${(K2*100).toFixed(1)}%`
                ]
            };
        }
    },

    // ─── 5. TIPOGRAFÍA — pt ↔ px ↔ em + interlineado ─────────────────────────
    tipo: {
        title: 'Tipografía — pt, px, em, rem',
        formula: '1 pt = 1.333 px (96 dpi)  |  em = px / base',
        fields: [
            { id: 'val',    label: 'Tamaño',    val: '12' },
            { id: 'desde',  label: 'Desde',     type: 'select', opts: [
                {v:'pt',l:'Puntos (pt)'},{v:'px',l:'Píxeles (px)'},
                {v:'em',l:'em'},{v:'rem',l:'rem'},{v:'mm',l:'Milímetros (mm)'}
            ]},
            { id: 'base',   label: 'Base rem/body (px)', val: '16' },
        ],
        calc(f) {
            let v    = parseFloat(f.val.value);
            let from = f.desde.value;
            let base = parseFloat(f.base.value) || 16;
            if (isNaN(v)) return null;

            // Normalizar a px (a 96 dpi)
            let px =
                from === 'pt'  ? v * (96/72) :
                from === 'px'  ? v :
                from === 'em'  ? v * base :
                from === 'rem' ? v * base :
                from === 'mm'  ? v / 25.4 * 96 :
                v;

            let pt  = px * (72/96);
            let em  = px / base;
            let mm  = px / 96 * 25.4;

            // Interlineado recomendado (1.4–1.6×)
            let leading14 = (px * 1.4).toFixed(1);
            let leading16 = (px * 1.6).toFixed(1);

            // Clasificación de uso
            let uso =
                px < 10 ? 'Muy pequeño — evitar para cuerpo de texto' :
                px < 13 ? 'Tamaño legible para pantalla, pequeño para impresión' :
                px < 18 ? 'Ideal para cuerpo de texto impreso y web' :
                px < 28 ? 'Subtítulo / texto destacado' :
                'Título / display';

            return {
                main:  `${px.toFixed(2)} px`,
                label: 'Tamaño en píxeles (96 dpi)',
                extras: [
                    { cls:'info', txt:`pt: ${pt.toFixed(2)}  |  em: ${em.toFixed(3)}  |  rem: ${em.toFixed(3)}  |  mm: ${mm.toFixed(2)}` },
                    { cls:'info', txt:`Interlineado recomendado: ${leading14}–${leading16} px (140–160%)` },
                    { cls:'ok',   txt:`Uso sugerido: ${uso}` }
                ],
                steps: [
                    `Entrada: ${v} ${from}`,
                    `Normalizado a px: ${px.toFixed(3)}`,
                    `Base body/rem: ${base}px`
                ]
            };
        }
    },

    // ─── 6. ESCALA PROPORCIONAL DE IMAGEN ────────────────────────────────────
    escala: {
        title: 'Escala proporcional de imagen',
        formula: 'Nuevo alto = alto original × (nuevo ancho / ancho original)',
        fields: [
            { id: 'wo', label: 'Ancho original (px)',  val: '1920' },
            { id: 'ho', label: 'Alto original (px)',   val: '1080' },
            { id: 'wn', label: 'Ancho nuevo (px) — 0 para calcular',  val: '800' },
            { id: 'hn', label: 'Alto nuevo (px) — 0 para calcular',   val: '' },
        ],
        calc(f) {
            let wo = parseFloat(f.wo.value), ho = parseFloat(f.ho.value);
            let wn = parseFloat(f.wn.value), hn = parseFloat(f.hn.value);
            if (isNaN(wo) || isNaN(ho)) return null;

            let ratio = wo / ho;
            let nW, nH;

            if (!isNaN(wn) && f.wn.value !== '') {
                nW = wn; nH = Math.round(wn / ratio);
            } else if (!isNaN(hn) && f.hn.value !== '') {
                nH = hn; nW = Math.round(hn * ratio);
            } else return null;

            let escala = (nW / wo * 100).toFixed(1);
            let mpxOrig = (wo * ho / 1e6).toFixed(2);
            let mpxNew  = (nW * nH / 1e6).toFixed(2);

            return {
                main:  `${nW} × ${nH} px`,
                label: `Escala: ${escala}% del original`,
                extras: [
                    { cls:'info', txt:`Ratio original: ${ratio.toFixed(4)} (${wo}×${ho} = ${mpxOrig} Mpx)` },
                    { cls:'info', txt:`Resultado: ${nW}×${nH} = ${mpxNew} Mpx` },
                    parseFloat(escala) > 100
                        ? { cls:'warn', txt:'Upscale: habrá pérdida de nitidez. Usá herramientas AI (Topaz, Lightroom) si es crítico.' }
                        : { cls:'ok',   txt:'Reducción sin pérdida de calidad visual.' }
                ],
                steps: [
                    `Ratio: ${wo}/${ho} = ${ratio.toFixed(4)}`,
                    `Nuevo: ${nW} × ${nH} px`,
                    `Escala: ${escala}%`
                ]
            };
        }
    }

};