// =============================================================================
// ELECTRICIDAD + ELECTRÓNICA — 12 fórmulas (6 cada una)
// =============================================================================
FORMS.electro = {

    // =========================================================================
    // ELECTRICIDAD (6)
    // =========================================================================

    // -------------------------------------------------------------------------
    // E1. LEY DE OHM
    // -------------------------------------------------------------------------
    ohm: {
        title: 'Ley de Ohm',
        formula: 'V = I × R',
        vars: [
            { id: 'v', label: 'Tensión (V)' },
            { id: 'i', label: 'Corriente (I)' },
            { id: 'r', label: 'Resistencia (R)' }
        ],
        fields: [
            { id: 'v', label: 'V (V)', val: '' },
            { id: 'i', label: 'I (mA)', val: '20' },
            { id: 'r', label: 'R (Ω)', val: '100' }
        ],
        onChange: function(target, f) {
            Object.keys(f).forEach(k => { f[k].disabled = (k === target); if (k === target) f[k].value = ''; });
        },
        calc: function(f, t) {
            let V, I, R, main, label, steps = [];
            if (t === 'v' || !t) {
                I = parseFloat(f.i.value) / 1000; R = parseFloat(f.r.value);
                if (isNaN(I) || isNaN(R)) return null;
                V = I * R;
                main = `${V.toFixed(3)} V`; label = 'Tensión';
                steps = [`V = ${I.toFixed(6)}A × ${R}Ω = ${V.toFixed(3)}V`];
            } else if (t === 'i') {
                V = parseFloat(f.v.value); R = parseFloat(f.r.value);
                if (isNaN(V) || isNaN(R) || R === 0) return null;
                if (R === 0) return { error: true, msg: "Resistencia 0 Ω = cortocircuito", label: "Cortocircuito" };
                I = V / R;
                main = `${(I * 1000).toFixed(2)} mA`; label = 'Corriente';
                steps = [`I = ${V}V / ${R}Ω = ${(I * 1000).toFixed(2)} mA`];
            } else if (t === 'r') {
                V = parseFloat(f.v.value); I = parseFloat(f.i.value) / 1000;
                if (isNaN(V) || isNaN(I) || I === 0) return null;
                R = V / I;
                main = `${R.toFixed(2)} Ω`; label = 'Resistencia';
                steps = [`R = ${V}V / ${I.toFixed(6)}A = ${R.toFixed(2)}Ω`];
            }
            const P = V && I ? V * I : 0;
            return {
                main, label, steps,
                extras: [{ cls: 'info', txt: `Potencia: ${P.toFixed(3)} W` }],
                chart(canvas) {
                    ElectroVisual.ohm(canvas, V, I, R, P);
                }
            };
        }
    },

    // -------------------------------------------------------------------------
    // E2. POTENCIA ELÉCTRICA
    // -------------------------------------------------------------------------
    potencia: {
        title: 'Potencia Eléctrica',
        formula: 'P = V × I = V²/R = I² × R',
        vars: [
            { id: 'p', label: 'Potencia (P)' },
            { id: 'v', label: 'Tensión (V)' },
            { id: 'i', label: 'Corriente (I)' },
            { id: 'r', label: 'Resistencia (R)' }
        ],
        fields: [
            { id: 'p', label: 'P (W)', val: '' },
            { id: 'v', label: 'V (V)', val: '12' },
            { id: 'i', label: 'I (A)', val: '' },
            { id: 'r', label: 'R (Ω)', val: '' }
        ],
        onChange: function(target, f) {
            Object.keys(f).forEach(k => { f[k].disabled = (k === target); if (k === target) f[k].value = ''; });
        },
        calc: function(f, t) {
            let P, V, I, R, main, label, steps = [];
            if (t === 'p' || !t) {
                V = parseFloat(f.v.value); I = parseFloat(f.i.value); R = parseFloat(f.r.value);
                if (!isNaN(V) && !isNaN(I)) { P = V * I; steps = [`P = ${V}V × ${I}A = ${P.toFixed(3)}W`]; }
                else if (!isNaN(V) && !isNaN(R)) { if (R === 0) return { error: true, msg: "Resistencia nula: potencia infinita", label: "Cortocircuito" }; P = V * V / R; steps = [`P = ${V}² / ${R}Ω = ${P.toFixed(3)}W`]; }
                else if (!isNaN(I) && !isNaN(R)) { P = I * I * R; steps = [`P = ${I}² × ${R}Ω = ${P.toFixed(3)}W`]; }
                else return null;
                main = `${P.toFixed(3)} W`; label = 'Potencia';
            } else if (t === 'v') {
                P = parseFloat(f.p.value); I = parseFloat(f.i.value);
                if (isNaN(P) || isNaN(I) || I === 0) return null;
                V = P / I; main = `${V.toFixed(3)} V`; label = 'Tensión';
                steps = [`V = ${P}W / ${I}A = ${V.toFixed(3)}V`];
            } else if (t === 'i') {
                P = parseFloat(f.p.value); V = parseFloat(f.v.value);
                if (isNaN(P) || isNaN(V) || V === 0) return null;
                I = P / V; main = `${I.toFixed(3)} A`; label = 'Corriente';
                steps = [`I = ${P}W / ${V}V = ${I.toFixed(3)}A`];
            } else if (t === 'r') {
                V = parseFloat(f.v.value); I = parseFloat(f.i.value);
                if (isNaN(V) || isNaN(I) || I === 0) return null;
                R = V / I; main = `${R.toFixed(2)} Ω`; label = 'Resistencia';
                steps = [`R = ${V}V / ${I}A = ${R.toFixed(2)}Ω`];
            }
            if (!P) P = V && I ? V * I : 0;
            return {
                main, label, steps, extras: [],
                chart(canvas) {
                    ElectroVisual.potencia(canvas, P, V, I, R);
                }
            };
        }
    },

    // -------------------------------------------------------------------------
    // E3. RESISTENCIAS EN SERIE
    // -------------------------------------------------------------------------
    serie: {
        title: 'Resistencias en Serie',
        formula: 'Rt = R1 + R2 + R3 + ...',
        fields: [
            { id: 'r1', label: 'R1 (Ω)', val: '100' },
            { id: 'r2', label: 'R2 (Ω)', val: '220' },
            { id: 'r3', label: 'R3 (Ω)', val: '330' },
            { id: 'r4', label: 'R4 (Ω)', val: '' },
            { id: 'r5', label: 'R5 (Ω)', val: '' },
            { id: 'vt', label: 'V total (V)', val: '12' }
        ],
        calc: function(f) {
            let vals = [f.r1, f.r2, f.r3, f.r4, f.r5].map(x => parseFloat(x.value)).filter(v => !isNaN(v));
            let Vt = parseFloat(f.vt.value);
            if (vals.length < 2) return null;
            if (vals.length < 2) return { error: true, msg: "Se necesitan al menos 2 resistencias", label: "Mínimo 2" };
            let rt = vals.reduce((a, b) => a + b, 0);
            return {
                main: `${rt.toFixed(2)} Ω`,
                label: 'Resistencia Total',
                extras: [
                    { cls: 'info', txt: `${vals.length} resistencias en serie` },
                    { cls: 'ok', txt: `Corriente: ${Vt ? (Vt / rt).toFixed(3) + ' A' : '—'}` }
                ],
                steps: [`Rt = ${vals.join(' + ')} = ${rt.toFixed(2)} Ω`],
                chart(canvas) {
                    ElectroVisual.serie(canvas, vals, rt, Vt);
                }
            };
        }
    },

    // -------------------------------------------------------------------------
    // E4. RESISTENCIAS EN PARALELO
    // -------------------------------------------------------------------------
    paralelo: {
        title: 'Resistencias en Paralelo',
        formula: '1/Rt = 1/R1 + 1/R2 + ...',
        fields: [
            { id: 'r1', label: 'R1 (Ω)', val: '100' },
            { id: 'r2', label: 'R2 (Ω)', val: '220' },
            { id: 'r3', label: 'R3 (Ω)', val: '330' },
            { id: 'r4', label: 'R4 (Ω)', val: '' },
            { id: 'r5', label: 'R5 (Ω)', val: '' },
            { id: 'vt', label: 'V total (V)', val: '12' }
        ],
        calc: function(f) {
            let vals = [f.r1, f.r2, f.r3, f.r4, f.r5].map(x => parseFloat(x.value)).filter(v => !isNaN(v));
            let Vt = parseFloat(f.vt.value);
            if (vals.length < 2) return null;
            if (vals.some(r => r === 0)) return { error: true, msg: "Una resistencia de 0Ω provoca cortocircuito", label: "Cortocircuito" };
            let invSum = vals.reduce((a, r) => a + 1 / r, 0);
            let rt = 1 / invSum;
            let It = Vt ? Vt / rt : 0;
            return {
                main: `${rt.toFixed(4)} Ω`,
                label: 'Resistencia Total',
                extras: [
                    { cls: 'info', txt: `${vals.length} resistencias en paralelo` },
                    { cls: 'ok', txt: `Corriente total: ${It ? It.toFixed(3) + ' A' : '—'}` }
                ],
                steps: [`1/Rt = ${vals.map(r => '1/' + r).join(' + ')}`, `Rt = ${rt.toFixed(4)} Ω`],
                chart(canvas) {
                    ElectroVisual.paralelo(canvas, vals, rt, It);
                }
            };
        }
    },

    // -------------------------------------------------------------------------
    // E5. DIVISOR DE TENSIÓN
    // -------------------------------------------------------------------------
    divisor: {
        title: 'Divisor de Tensión',
        formula: 'Vout = Vin × R2 / (R1 + R2)',
        vars: [
            { id: 'vout', label: 'Vout (Voltaje Salida)' },
            { id: 'r1', label: 'Despejar R1' }
        ],
        fields: [
            { id: 'vin', label: 'Vin (V)', val: '12' },
            { id: 'vout_in', label: 'Vout deseado (V)', val: '' },
            { id: 'r1', label: 'R1 (Ω)', val: '10000' },
            { id: 'r2', label: 'R2 (Ω)', val: '10000' }
        ],
        onChange: function(target, f) {
            if (target === 'vout') { f.vout_in.disabled = true; f.vout_in.value = ''; f.r1.disabled = false; f.r2.disabled = false; }
            else if (target === 'r1') { f.r1.disabled = true; f.r1.value = ''; f.vout_in.disabled = false; f.r2.disabled = false; }
        },
        calc: function(f, target) {
            let Vin = parseFloat(f.vin.value);
            if (isNaN(Vin)) return null;
            if (target === 'r1') {
                let Vout = parseFloat(f.vout_in.value), R2 = parseFloat(f.r2.value);
                if (isNaN(Vout) || isNaN(R2) || Vout === 0 || Vout >= Vin) return null;
                let R1 = R2 * (Vin - Vout) / Vout;
                return {
                    main: `${R1.toFixed(1)} Ω`,
                    label: 'R1 requerida',
                    extras: [],
                    steps: [`R1 = ${R2} × (${Vin} - ${Vout}) / ${Vout} = ${R1.toFixed(1)}Ω`],
                    chart(canvas) { ElectroVisual.divisor(canvas, Vin, Vout, R1, R2); }
                };
            } else {
                let R1 = parseFloat(f.r1.value), R2 = parseFloat(f.r2.value);
                if (isNaN(R1) || isNaN(R2) || (R1 + R2) === 0) return { error: true, msg: "R1 + R2 no puede ser 0", label: "Error" };
                let Vout = Vin * R2 / (R1 + R2);
                return {
                    main: `${Vout.toFixed(4)} V`,
                    label: 'Voltaje de Salida',
                    extras: [{ cls: 'info', txt: `Atenuación: ${(Vout / Vin * 100).toFixed(1)}%` }],
                    steps: [`Vout = ${Vin} × ${R2} / (${R1} + ${R2}) = ${Vout.toFixed(4)}V`],
                    chart(canvas) { ElectroVisual.divisor(canvas, Vin, Vout, R1, R2); }
                };
            }
        }
    },

    // -------------------------------------------------------------------------
    // E6. MALLAS — LEY DE KIRCHHOFF
    // -------------------------------------------------------------------------
    kirchhoff: {
        title: 'Ley de Kirchhoff — Mallas',
        formula: 'ΣV = 0 | 2 Mallas',
        fields: [
            { id: 'v1', label: 'V fuente (V)', val: '10' },
            { id: 'r1', label: 'R1 (Malla 1) (Ω)', val: '2' },
            { id: 'rs', label: 'R Compartida (Rs) (Ω)', val: '3' },
            { id: 'r2', label: 'R2 (Malla 2) (Ω)', val: '5' }
        ],
        calc: function(f) {
            let V1 = parseFloat(f.v1.value), R1 = parseFloat(f.r1.value), R2 = parseFloat(f.r2.value), Rs = parseFloat(f.rs.value);
            if (isNaN(V1) || isNaN(R1) || isNaN(R2) || isNaN(Rs)) return null;
            if (R1 + Rs === 0 || R2 + Rs === 0) return { error: true, msg: "División por cero", label: "Impedancia nula" };
            let D = (R1 + Rs) * (R2 + Rs) - (Rs * Rs);
            if (Math.abs(D) < 1e-6) return { error: true, msg: "Circuito indeterminado (Determinante = 0)", label: "Error estructural" };
            let I1 = V1 * (R2 + Rs) / D;
            let I2 = V1 * Rs / D;
            return {
                main: `I₁ = ${I1.toFixed(3)} A  |  I₂ = ${I2.toFixed(3)} A`,
                label: 'Corrientes de Malla',
                extras: [
                    { cls: 'info', txt: `I compartida: ${(I1 - I2).toFixed(3)} A` },
                    { cls: 'ok', txt: `Potencia: ${(V1 * I1).toFixed(3)} W` }
                ],
                steps: [
                    `Δ = (${R1}+${Rs})(${R2}+${Rs}) − ${Rs}² = ${D.toFixed(2)}`,
                    `I₁ = ${V1}·(${R2}+${Rs}) / ${D.toFixed(2)} = ${I1.toFixed(3)} A`,
                    `I₂ = ${V1}·${Rs} / ${D.toFixed(2)} = ${I2.toFixed(3)} A`
                ],
                chart(canvas) { ElectroVisual.kirchhoff(canvas, V1, R1, Rs, R2, I1, I2); }
            };
        }
    },

    // =========================================================================
    // ELECTRÓNICA (6)
    // =========================================================================

    // -------------------------------------------------------------------------
    // EL1. LED + RESISTENCIA LIMITADORA
    // -------------------------------------------------------------------------
    led: {
        title: 'Resistencia para LED',
        formula: 'Rs = (Vfuente − Vled) / Iled',
        fields: [
            { id: 'vfuente', label: 'V fuente (V)', val: '12' },
            { id: 'vled', label: 'V led (V)', val: '2' },
            { id: 'iled', label: 'I led (mA)', val: '20' }
        ],
        calc: function(f) {
            let Vs = parseFloat(f.vfuente.value);
            let Vl = parseFloat(f.vled.value);
            let Il = parseFloat(f.iled.value) / 1000;
            if (isNaN(Vs) || isNaN(Vl) || isNaN(Il) || Il === 0) return null;
            if (Vs <= Vl) return { error: true, msg: "Vfuente debe ser > Vled", label: "Voltaje insuficiente" };
            let Rs = (Vs - Vl) / Il;
            let P = (Vs - Vl) * Il;
            let I_ma = Il * 1000;
            let quemado = I_ma > 30;
            let e24 = [10,11,12,13,15,16,18,20,22,24,27,30,33,36,39,43,47,51,56,62,68,75,82,91];
            let mag = Math.pow(10, Math.floor(Math.log10(Rs)));
            let norm = Rs / mag; if (norm < 1) { norm *= 10; mag /= 10; }
            let closest = e24.reduce((p,c) => Math.abs(c-norm)<Math.abs(p-norm) ? c : p);
            let rCom = closest * mag;
            let extras = [
                { cls: quemado ? 'err' : 'info', txt: quemado ? '⚠ I > 30mA — ¡El LED se quemará!' : `I = ${I_ma.toFixed(0)} mA (máx recomendado: 30 mA)` },
                { cls: 'ok', txt: `Valor comercial E24: ${rCom.toLocaleString()} Ω` },
                { cls: 'info', txt: `Potencia: ${P.toFixed(3)} W (usar ${P > 0.25 ? '1/2W' : '1/4W'})` }
            ];
            return {
                main: `${Rs.toFixed(1)} Ω`,
                label: 'Resistencia Limitadora',
                extras, steps: [`Rs = (${Vs} − ${Vl}) / ${Il} = ${Rs.toFixed(1)} Ω`],
                chart(canvas) { ElectroVisual.led(canvas, Vs, Vl, Il, Rs); }
            };
        }
    },

    // -------------------------------------------------------------------------
    // EL2. 555 TIMER ASTABLE
    // -------------------------------------------------------------------------
    astable555: {
        title: '555 Temporizador Astable',
        formula: 'f = 1.44 / ((R1 + 2·R2) · C)',
        fields: [
            { id: 'r1', label: 'R1 (Ω)', val: '1000' },
            { id: 'r2', label: 'R2 (Ω)', val: '10000' },
            { id: 'c', label: 'Capacitor (µF)', val: '10' }
        ],
        calc: function(f) {
            let R1 = parseFloat(f.r1.value), R2 = parseFloat(f.r2.value), C_uf = parseFloat(f.c.value), C = C_uf / 1e6;
            if (isNaN(R1) || isNaN(R2) || isNaN(C_uf) || C === 0) return null;
            if (R1 <= 0 || R2 <= 0 || C_uf <= 0) return { error: true, msg: "Todos los componentes deben ser > 0", label: "Error" };
            let freq = 1.44 / ((R1 + 2 * R2) * C);
            let tHigh = 0.693 * (R1 + R2) * C;
            let tLow = 0.693 * R2 * C;
            let period = tHigh + tLow;
            let duty = (tHigh / period) * 100;
            let freqStr = freq > 1000 ? `${(freq / 1000).toFixed(3)} kHz` : `${freq.toFixed(1)} Hz`;
            let gFreq = isNaN(freq) ? 1 : freq;
            let gDuty = isNaN(duty) ? 50 : duty;
            return {
                main: freqStr,
                label: 'Frecuencia de Oscilación',
                extras: [
                    { cls: 'info', txt: `Duty: ${duty.toFixed(1)}% | T↑: ${(tHigh * 1000).toFixed(1)}ms T↓: ${(tLow * 1000).toFixed(1)}ms` },
                    { cls: 'ok', txt: `Periodo: ${(period * 1000).toFixed(1)} ms` }
                ],
                steps: [`f = 1.44 / ((R1 + 2R2) × C) = 1.44 / ((${R1}+2×${R2}) × ${C_uf}µF)`],
                chart(canvas) { ElectroVisual.astable555(canvas, gFreq, gDuty, R1, R2, C); }
            };
        }
    },

    // -------------------------------------------------------------------------
    // EL3. FILTRO RC PASIVO
    // -------------------------------------------------------------------------
    rc: {
        title: 'Filtro RC Pasivo',
        formula: 'fc = 1 / (2π × R × C)',
        vars: [
            { id: 'fc', label: 'Frecuencia de corte (fc)' },
            { id: 'r', label: 'Resistencia (R)' },
            { id: 'c', label: 'Capacitor (C)' }
        ],
        fields: [
            { id: 'fc_in', label: 'fc deseada (Hz)', val: '' },
            { id: 'r', label: 'R (Ω)', val: '10000' },
            { id: 'c', label: 'C (µF)', val: '10' }
        ],
        onChange: function(target, f) {
            if (target === 'fc') { f.fc_in.disabled = true; f.fc_in.value = ''; f.r.disabled = false; f.c.disabled = false; }
            else if (target === 'r') { f.r.disabled = true; f.r.value = ''; f.fc_in.disabled = false; f.c.disabled = false; }
            else if (target === 'c') { f.c.disabled = true; f.c.value = ''; f.fc_in.disabled = false; f.r.disabled = false; }
        },
        calc: function(f, target) {
            let fc, R, C, main, label, steps = [], extras = [];
            if (target === 'fc' || !target) {
                R = parseFloat(f.r.value); C = parseFloat(f.c.value) * 1e-6;
                if (isNaN(R) || isNaN(C) || R === 0 || C === 0) return null;
                fc = 1 / (2 * Math.PI * R * C);
                main = `${fc.toFixed(1)} Hz`; label = 'Frecuencia de corte';
                steps = [`fc = 1/(2π × ${R}Ω × ${f.c.value}µF)`];
            } else if (target === 'r') {
                fc = parseFloat(f.fc_in.value); C = parseFloat(f.c.value) * 1e-6;
                if (isNaN(fc) || isNaN(C) || fc === 0 || C === 0) return null;
                R = 1 / (2 * Math.PI * fc * C);
                main = `${R.toFixed(1)} Ω`; label = 'Resistencia requerida';
                steps = [`R = 1/(2π × ${fc}Hz × ${f.c.value}µF)`];
            } else if (target === 'c') {
                fc = parseFloat(f.fc_in.value); R = parseFloat(f.r.value);
                if (isNaN(fc) || isNaN(R) || fc === 0 || R === 0) return null;
                C = 1 / (2 * Math.PI * fc * R);
                main = `${(C * 1e6).toFixed(3)} µF`; label = 'Capacitancia requerida';
                steps = [`C = 1/(2π × ${fc}Hz × ${R}Ω)`];
            }
            return {
                main, label, extras, steps,
                chart(canvas) { ElectroVisual.rc(canvas, fc, R, C); }
            };
        }
    },

    // -------------------------------------------------------------------------
    // EL4. GANANCIA EN dB
    // -------------------------------------------------------------------------
    db: {
        title: 'Ganancia en dB',
        formula: 'dB = 20·log(Vout/Vin)  |  dB = 10·log(Pout/Pin)',
        fields: [
            { id: 'tipo', label: 'Tipo', val: 'voltaje', type: 'select', opts: [{ v: 'voltaje', l: 'Voltaje' }, { v: 'potencia', l: 'Potencia' }] },
            { id: 'in', label: 'Entrada', val: '1' },
            { id: 'out', label: 'Salida', val: '10' }
        ],
        calc: function(f) {
            let T = f.tipo.value, IN = parseFloat(f.in.value), OUT = parseFloat(f.out.value);
            if (isNaN(IN) || isNaN(OUT) || IN === 0) return null;
            let db = T === 'voltaje' ? 20 * Math.log10(OUT / IN) : 10 * Math.log10(OUT / IN);
            return {
                main: `${db.toFixed(2)} dB`,
                label: 'Ganancia',
                extras: [{ cls: db >= 0 ? 'ok' : 'warn', txt: db >= 0 ? 'Amplificación' : 'Atenuación' }],
                steps: [`${T === 'voltaje' ? '20' : '10'} × log₁₀(${OUT}/${IN}) = ${db.toFixed(2)} dB`],
                chart(canvas) { ElectroVisual.db(canvas, T, IN, OUT, db); }
            };
        }
    },

    // -------------------------------------------------------------------------
    // EL5. RECTIFICADOR DE ONDA COMPLETA
    // -------------------------------------------------------------------------
    rectificador: {
        title: 'Rectificador de Onda Completa',
        formula: 'Vdc = 2·Vpk/π  |  Vripple = Vdc/(2·f·R·C)',
        fields: [
            { id: 'vrms', label: 'V RMS entrada (V)', val: '12' },
            { id: 'frec', label: 'Frecuencia línea (Hz)', val: '50' },
            { id: 'rload', label: 'R carga (Ω)', val: '100' },
            { id: 'cap', label: 'C filtro (µF)', val: '470' }
        ],
        calc: function(f) {
            let Vrms = parseFloat(f.vrms.value);
            let fline = parseFloat(f.frec.value);
            let Rload = parseFloat(f.rload.value);
            let C = parseFloat(f.cap.value) * 1e-6;
            if (isNaN(Vrms) || isNaN(fline) || isNaN(Rload) || isNaN(C)) return null;
            if (Rload === 0) return { error: true, msg: "R de carga no puede ser 0 (cortocircuito)", label: "Cortocircuito" };
            let Vpk = Vrms * Math.SQRT2;
            let Vdc_sin = 2 * Vpk / Math.PI;
            let freqRipple = 2 * fline;
            let Vripple = C > 0 ? Vdc_sin / (2 * freqRipple * Rload * C) : Vdc_sin * 0.5;
            let Vdc = C > 0 ? Vpk - Vripple / 2 : Vdc_sin;
            if (Vripple > Vdc) Vripple = Vdc * 0.5;
            return {
                main: `${Vdc.toFixed(2)} V`,
                label: 'Voltaje DC Salida',
                extras: [
                    { cls: 'info', txt: `V pico: ${Vpk.toFixed(2)} V | Vdc (sin filtro): ${Vdc_sin.toFixed(2)} V` },
                    { cls: C > 0 ? 'ok' : 'warn', txt: `Ripple: ${(Vripple * 1000).toFixed(1)} mV ${C > 0 ? '(con filtro)' : '(sin filtro)'}` },
                    { cls: 'info', txt: `Frecuencia ripple: ${freqRipple} Hz` }
                ],
                steps: [
                    `Vpk = ${Vrms} × √2 = ${Vpk.toFixed(2)} V`,
                    `Vdc (sin cap) = 2 × ${Vpk.toFixed(2)} / π = ${Vdc_sin.toFixed(2)} V`,
                    C > 0 ? `Vripple = ${Vdc_sin.toFixed(2)} / (2 × ${freqRipple} × ${Rload} × ${(C * 1e6).toFixed(0)}µF)` : '(sin capacitor de filtro)'
                ],
                chart(canvas) { ElectroVisual.rectificador(canvas, Vrms, Vdc, Vripple, C, Rload); }
            };
        }
    },

    // -------------------------------------------------------------------------
    // EL6. AMPLIFICADOR OPERACIONAL
    // -------------------------------------------------------------------------
    opamp: {
        title: 'Amplificador Operacional',
        formula: 'Vout = −Vin × (Rf / R1)  [Inversor]',
        vars: [
            { id: 'vout', label: 'Vout (Voltaje Salida)' },
            { id: 'rf', label: 'Rf (Retroalimentación)' }
        ],
        fields: [
            { id: 'vin', label: 'Vin (V)', val: '1' },
            { id: 'vout_in', label: 'Vout deseado (V)', val: '' },
            { id: 'r1', label: 'R1 (Ω)', val: '1000' },
            { id: 'rf', label: 'Rf (Ω)', val: '10000' }
        ],
        onChange: function(target, f) {
            if (target === 'vout') { f.vout_in.disabled = true; f.vout_in.value = ''; f.r1.disabled = false; f.rf.disabled = false; }
            else if (target === 'rf') { f.rf.disabled = true; f.rf.value = ''; f.vout_in.disabled = false; f.r1.disabled = false; }
        },
        calc: function(f, target) {
            let Vin = parseFloat(f.vin.value);
            if (isNaN(Vin)) return null;
            if (target === 'vout' || !target) {
                let R1 = parseFloat(f.r1.value), Rf = parseFloat(f.rf.value);
                if (isNaN(R1) || isNaN(Rf) || R1 === 0) return null;
                let ganancia = -Rf / R1;
                let Vout = Vin * ganancia;
                return {
                    main: `${Vout.toFixed(4)} V`,
                    label: 'Voltaje de Salida (Inversor)',
                    extras: [
                        { cls: 'info', txt: `Ganancia: ${ganancia.toFixed(2)} (${Math.abs(ganancia).toFixed(1)}x inversor)` },
                        { cls: Math.abs(Vout) > 12 ? 'err' : 'ok', txt: Math.abs(Vout) > 12 ? '⚠ Señal saturada (Vsat ≈ ±12V)' : 'Señal en rango lineal' }
                    ],
                    steps: [`Vout = −Vin × (Rf/R1) = −${Vin} × (${Rf}/${R1})`],
                    chart(canvas) { ElectroVisual.opamp(canvas, 'inversor', Vin, Vout, R1, Rf, ganancia); }
                };
            } else if (target === 'rf') {
                let Vout = parseFloat(f.vout_in.value), R1 = parseFloat(f.r1.value);
                if (isNaN(Vout) || isNaN(R1) || R1 === 0 || Vout === 0) return null;
                if (Vin === 0) return { error: true, msg: "Vin no puede ser 0 para despejar Rf", label: "Error" };
                let ganancia = Vout / Vin;
                let Rf = Math.abs(ganancia) * R1;
                return {
                    main: `${Rf.toFixed(1)} Ω`,
                    label: 'Rf requerida',
                    extras: [{ cls: 'info', txt: `Ganancia: ${ganancia.toFixed(2)}` }],
                    steps: [`Rf = |Vout/Vin| × R1 = |${Vout}/${Vin}| × ${R1}`],
                    chart(canvas) { ElectroVisual.opamp(canvas, 'inversor', Vin, Vout, R1, Rf, Vout / Vin); }
                };
            }
        }
    }
};
// =============================================================================
// ELECTRÓNICA ESCOLAR (3) — Añadidos con guard pattern
// =============================================================================
if (!FORMS.electro) FORMS.electro = {};
Object.assign(FORMS.electro, {

    // -------------------------------------------------------------------------
    // EL7. CAPACITORES EN SERIE Y PARALELO
    // -------------------------------------------------------------------------
    capacitores: {
        title: 'Capacitores en Serie y Paralelo',
        formula: 'Serie: 1/Ceq = 1/C1 + 1/C2 | Paralelo: Ceq = C1 + C2',
        fields: [
            { id: 'c1', label: 'C1 (µF)', val: '10' },
            { id: 'c2', label: 'C2 (µF)', val: '22' }
        ],
        calc(f) {
            let C1 = parseFloat(f.c1.value), C2 = parseFloat(f.c2.value);
            if (isNaN(C1) || isNaN(C2)) return null;
            if (C1 <= 0 || C2 <= 0) return { error: true, msg: "Los capacitores deben ser > 0", label: "Error" };
            let ceqSerie = 1 / ((1 / C1) + (1 / C2));
            let ceqParalelo = C1 + C2;
            return {
                main: `Serie: ${ceqSerie.toFixed(2)} µF | Paralelo: ${ceqParalelo.toFixed(2)} µF`,
                label: 'Capacitancia Equivalente',
                extras: [
                    { cls: 'info', txt: `Ceq serie: ${ceqSerie.toFixed(2)} µF (siempre menor al menor)` },
                    { cls: 'ok', txt: `Ceq paralelo: ${ceqParalelo.toFixed(2)} µF (suma directa)` }
                ],
                steps: [
                    `1/Ceq(serie) = 1/${C1} + 1/${C2} = ${(1/C1 + 1/C2).toFixed(6)}`,
                    `Ceq(serie) = ${ceqSerie.toFixed(2)} µF`,
                    `Ceq(paralelo) = ${C1} + ${C2} = ${ceqParalelo.toFixed(2)} µF`
                ],
                chart(canvas) {
                    ElectroVisual.capacitores(canvas, C1, C2, ceqSerie, ceqParalelo);
                }
            };
        }
    },

    // -------------------------------------------------------------------------
    // EL8. FRECUENCIA Y PERÍODO
    // -------------------------------------------------------------------------
    frecuencia_periodo: {
        title: 'Frecuencia y Período',
        formula: 'f = 1 / T  |  T = 1 / f',
        vars: [
            { id: 'f', label: 'Frecuencia (f)' },
            { id: 't', label: 'Período (T)' }
        ],
        fields: [
            { id: 'freq', label: 'Frecuencia (Hz)', val: '50' },
            { id: 'period', label: 'Período (s)', val: '' }
        ],
        onChange(target, f) {
            if (target === 'f') { f.freq.disabled = true; f.freq.value = ''; f.period.disabled = false; }
            else if (target === 't') { f.period.disabled = true; f.period.value = ''; f.freq.disabled = false; }
        },
        calc(f, target) {
            if (target === 'f' || !target) {
                let period = parseFloat(f.period.value);
                if (isNaN(period) || period <= 0) return null;
                let freq = 1 / period;
                return {
                    main: `${freq.toFixed(4)} Hz`,
                    label: 'Frecuencia',
                    extras: [{ cls: 'info', txt: `Período: ${period.toFixed(6)} s` }],
                    steps: [`f = 1 / ${period} = ${freq.toFixed(4)} Hz`],
                    chart(canvas) { ElectroVisual.frecuenciaPeriodo(canvas, freq, period); }
                };
            } else {
                let freq = parseFloat(f.freq.value);
                if (isNaN(freq) || freq <= 0) return null;
                let period = 1 / freq;
                return {
                    main: `${period.toFixed(6)} s`,
                    label: 'Período',
                    extras: [{ cls: 'info', txt: `Frecuencia: ${freq.toFixed(4)} Hz` }],
                    steps: [`T = 1 / ${freq} = ${period.toFixed(6)} s`],
                    chart(canvas) { ElectroVisual.frecuenciaPeriodo(canvas, freq, period); }
                };
            }
        }
    },

    // -------------------------------------------------------------------------
    // EL9. TRANSFORMADOR IDEAL
    // -------------------------------------------------------------------------
    transformador: {
        title: 'Transformador Ideal',
        formula: 'Vp / Vs = Np / Ns',
        vars: [
            { id: 'vp', label: 'Tensión Primario (Vp)' },
            { id: 'vs', label: 'Tensión Secundario (Vs)' },
            { id: 'np', label: 'Espiras Primario (Np)' },
            { id: 'ns', label: 'Espiras Secundario (Ns)' }
        ],
        fields: [
            { id: 'vp', label: 'V primario (V)', val: '220' },
            { id: 'vs', label: 'V secundario (V)', val: '' },
            { id: 'np', label: 'N primario (espiras)', val: '1000' },
            { id: 'ns', label: 'N secundario (espiras)', val: '100' }
        ],
        onChange(target, f) {
            Object.keys(f).forEach(k => { f[k].disabled = (k === target); if (k === target) f[k].value = ''; });
        },
        calc(f, target) {
            let Vp = parseFloat(f.vp.value), Vs = parseFloat(f.vs.value);
            let Np = parseFloat(f.np.value), Ns = parseFloat(f.ns.value);
            if (target === 'vs') {
                if (isNaN(Vp) || isNaN(Np) || isNaN(Ns) || Np === 0) return null;
                Vs = Vp * Ns / Np;
                let relacion = Vp / Vs;
                return {
                    main: `${Vs.toFixed(2)} V`,
                    label: 'Tensión Secundario',
                    extras: [
                        { cls: 'info', txt: `Relación: ${relacion.toFixed(2)}:1` },
                        { cls: relacion > 1 ? 'warn' : 'ok', txt: relacion > 1 ? 'Transformador reductor' : 'Transformador elevador' }
                    ],
                    steps: [`Vs = ${Vp} × ${Ns} / ${Np} = ${Vs.toFixed(2)} V`],
                    chart(canvas) { ElectroVisual.transformador(canvas, Vp, Vs, Np, Ns); }
                };
            } else if (target === 'vp') {
                if (isNaN(Vs) || isNaN(Np) || isNaN(Ns) || Ns === 0) return null;
                Vp = Vs * Np / Ns;
                return {
                    main: `${Vp.toFixed(2)} V`,
                    label: 'Tensión Primario',
                    extras: [{ cls: 'info', txt: `Relación: ${(Vp / Vs).toFixed(2)}:1` }],
                    steps: [`Vp = ${Vs} × ${Np} / ${Ns} = ${Vp.toFixed(2)} V`],
                    chart(canvas) { ElectroVisual.transformador(canvas, Vp, Vs, Np, Ns); }
                };
            } else if (target === 'ns') {
                if (isNaN(Vp) || isNaN(Vs) || isNaN(Np) || Vp === 0) return null;
                Ns = Np * Vs / Vp;
                return {
                    main: `${Ns.toFixed(0)} espiras`,
                    label: 'Espiras Secundario',
                    steps: [`Ns = ${Np} × ${Vs} / ${Vp} = ${Ns.toFixed(0)}`],
                    chart(canvas) { ElectroVisual.transformador(canvas, Vp, Vs, Np, Ns); }
                };
            } else if (target === 'np') {
                if (isNaN(Vp) || isNaN(Vs) || isNaN(Ns) || Vs === 0) return null;
                Np = Ns * Vp / Vs;
                return {
                    main: `${Np.toFixed(0)} espiras`,
                    label: 'Espiras Primario',
                    steps: [`Np = ${Ns} × ${Vp} / ${Vs} = ${Np.toFixed(0)}`],
                    chart(canvas) { ElectroVisual.transformador(canvas, Vp, Vs, Np, Ns); }
                };
            }
            if (!target) {
                if (isNaN(Vp) || isNaN(Np) || isNaN(Ns) || Np === 0) return null;
                Vs = Vp * Ns / Np;
                return {
                    main: `${Vs.toFixed(2)} V`,
                    label: 'Tensión Secundario',
                    extras: [{ cls: 'info', txt: `Relación: ${(Vp / Vs).toFixed(2)}:1` }],
                    steps: [`Vs = ${Vp} × ${Ns} / ${Np} = ${Vs.toFixed(2)} V`],
                    chart(canvas) { ElectroVisual.transformador(canvas, Vp, Vs, Np, Ns); }
                };
            }
            return null;
        }
    }
});

// =============================================================================
// POTENCIA Y ENERGÍA (5)
// =============================================================================
Object.assign(FORMS.electro, {

    // -------------------------------------------------------------------------
    // PE1. POTENCIA TRIFÁSICA
    // -------------------------------------------------------------------------
    potencia_trifasica: {
        title: 'Potencia Trifásica',
        formula: 'P = √3 × V × I × cos φ',
        fields: [
            { id: 'v', label: 'V línea (V)', val: '380' },
            { id: 'i', label: 'I línea (A)', val: '10' },
            { id: 'cosfi', label: 'cos φ', val: '0.85' }
        ],
        calc(f) {
            let V = parseFloat(f.v.value), I = parseFloat(f.i.value), cosfi = parseFloat(f.cosfi.value);
            if (isNaN(V) || isNaN(I) || isNaN(cosfi)) return null;
            let P = Math.sqrt(3) * V * I * cosfi;
            return {
                main: `${P.toFixed(2)} W`,
                label: 'Potencia Activa Trifásica',
                extras: [
                    { cls: 'info', txt: `Aparente: ${(Math.sqrt(3) * V * I).toFixed(2)} VA` },
                    { cls: cosfi < 0.9 ? 'warn' : 'ok', txt: cosfi < 0.9 ? 'Factor de potencia bajo (<0.9)' : 'Factor de potencia aceptable' }
                ],
                steps: [`P = √3 × ${V} × ${I} × ${cosfi} = ${P.toFixed(2)} W`],
                chart(canvas) { ElectroVisual.potencia_trifasica(canvas, V, I, cosfi, P); }
            };
        }
    },

    // -------------------------------------------------------------------------
    // PE2. REACTANCIA CAPACITIVA
    // -------------------------------------------------------------------------
    reactancia_capacitiva: {
        title: 'Reactancia Capacitiva',
        formula: 'Xc = 1 / (2π × f × C)',
        fields: [
            { id: 'f', label: 'Frecuencia (Hz)', val: '50' },
            { id: 'c', label: 'Capacitancia (µF)', val: '100' }
        ],
        calc(fields) {
            let freq = parseFloat(fields.f.value), C = parseFloat(fields.c.value) * 1e-6;
            if (isNaN(freq) || isNaN(C) || freq === 0 || C === 0) return null;
            let Xc = 1 / (2 * Math.PI * freq * C);
            let freqStr = freq >= 1000 ? `${(freq/1000).toFixed(1)} kHz` : `${freq.toFixed(1)} Hz`;
            return {
                main: `${Xc.toFixed(2)} Ω`,
                label: 'Reactancia Capacitiva',
                extras: [
                    { cls: 'info', txt: `f = ${freqStr} | C = ${parseFloat(fields.c.value).toFixed(0)} µF` },
                    { cls: Xc < 1 ? 'warn' : 'ok', txt: Xc < 1 ? 'Reactancia muy baja — casi cortocircuito' : '' }
                ],
                steps: [`Xc = 1 / (2π × ${freqStr} × ${parseFloat(fields.c.value)}µF) = ${Xc.toFixed(2)} Ω`],
                chart(canvas) { ElectroVisual.reactancia_capacitiva(canvas, freq, C, Xc); }
            };
        }
    },

    // -------------------------------------------------------------------------
    // PE3. REACTANCIA INDUCTIVA
    // -------------------------------------------------------------------------
    reactancia_inductiva: {
        title: 'Reactancia Inductiva',
        formula: 'Xl = 2π × f × L',
        fields: [
            { id: 'f', label: 'Frecuencia (Hz)', val: '50' },
            { id: 'l', label: 'Inductancia (mH)', val: '100' }
        ],
        calc(f) {
            let freq = parseFloat(f.f.value), L = parseFloat(f.l.value) / 1000;
            if (isNaN(freq) || isNaN(L) || freq === 0) return null;
            let Xl = 2 * Math.PI * freq * L;
            let freqStr = freq >= 1000 ? `${(freq/1000).toFixed(1)} kHz` : `${freq.toFixed(1)} Hz`;
            return {
                main: `${Xl.toFixed(2)} Ω`,
                label: 'Reactancia Inductiva',
                extras: [
                    { cls: 'info', txt: `f = ${freqStr} | L = ${parseFloat(f.l.value).toFixed(0)} mH` },
                    { cls: 'ok', txt: `Impedancia compleja: Z = j${Xl.toFixed(2)} Ω` }
                ],
                steps: [`Xl = 2π × ${freqStr} × ${parseFloat(f.l.value)}mH = ${Xl.toFixed(2)} Ω`],
                chart(canvas) { ElectroVisual.reactancia_inductiva(canvas, freq, L, Xl); }
            };
        }
    },

    // -------------------------------------------------------------------------
    // PE4. FRECUENCIA DE CORTE RC/RL
    // -------------------------------------------------------------------------
    frecuencia_corte: {
        title: 'Frecuencia de Corte RC / RL',
        formula: 'fc = 1/(2πRC)  |  fc = R/(2πL)',
        fields: [
            { id: 'tipo', label: 'Tipo', val: 'rc', type: 'select', opts: [{ v: 'rc', l: 'Filtro RC' }, { v: 'rl', l: 'Filtro RL' }] },
            { id: 'r', label: 'R (Ω)', val: '10000' },
            { id: 'c', label: 'C (µF) — solo RC', val: '10' },
            { id: 'l', label: 'L (mH) — solo RL', val: '100' }
        ],
        onChange(target, f) {
            let esRL = f.tipo.value === 'rl';
            f.c.disabled = esRL;
            f.l.disabled = !esRL;
            if (esRL) f.c.value = ''; else f.l.value = '';
        },
        calc(f) {
            let tipo = f.tipo.value, R = parseFloat(f.r.value);
            if (isNaN(R) || R === 0) return null;
            let fc, main, label, steps = [], extras = [];
            if (tipo === 'rc') {
                let C = parseFloat(f.c.value) * 1e-6;
                if (isNaN(C) || C === 0) return null;
                fc = 1 / (2 * Math.PI * R * C);
                main = `${fc.toFixed(1)} Hz`; label = 'Frecuencia de Corte (RC)';
                steps = [`fc = 1/(2π × ${R} × ${f.c.value}µF)`];
                extras.push({ cls: 'info', txt: `Constante de tiempo τ = ${(R * C * 1000).toFixed(2)} ms` });
            } else {
                let L = parseFloat(f.l.value) / 1000;
                if (isNaN(L) || L === 0) return null;
                fc = R / (2 * Math.PI * L);
                main = `${fc.toFixed(1)} Hz`; label = 'Frecuencia de Corte (RL)';
                steps = [`fc = ${R} / (2π × ${f.l.value}mH)`];
                extras.push({ cls: 'info', txt: `Constante de tiempo τ = ${(L / R * 1000).toFixed(2)} ms` });
            }
            return { main, label, extras, steps, chart(c) { ElectroVisual.frecuencia_corte(c, fc, tipo, R); } };
        }
    },

    // -------------------------------------------------------------------------
    // PE5. ENERGÍA CONSUMIDA (kWh)
    // -------------------------------------------------------------------------
    energia_kwh: {
        title: 'Energía Consumida',
        formula: 'kWh = P × t / 1000',
        fields: [
            { id: 'p', label: 'Potencia (W)', val: '1000' },
            { id: 't', label: 'Tiempo (h)', val: '24' },
            { id: 'tarifa', label: 'Tarifa ($/kWh)', val: '0.15' }
        ],
        calc(f) {
            let P = parseFloat(f.p.value), t = parseFloat(f.t.value), tarifa = parseFloat(f.tarifa.value);
            if (isNaN(P) || isNaN(t) || isNaN(tarifa)) return null;
            if (P < 0 || t < 0) return { error: true, msg: "Los valores no pueden ser negativos", label: "Error" };
            let kWh = P * t / 1000;
            let costo = kWh * tarifa;
            return {
                main: `${kWh.toFixed(3)} kWh`,
                label: 'Energía Consumida',
                extras: [
                    { cls: 'info', txt: `Potencia: ${P >= 1000 ? (P/1000).toFixed(2) + ' kW' : P.toFixed(0) + ' W'} | Tiempo: ${t}h` },
                    { cls: 'ok', txt: `Costo estimado: $${costo.toFixed(2)}` }
                ],
                steps: [`kWh = ${P} W × ${t} h / 1000 = ${kWh.toFixed(3)} kWh`],
                chart(canvas) { ElectroVisual.energia_kwh(canvas, P, t, kWh, costo); }
            };
        }
    }
});
