FORMS.electro = {
    led: {
        title: 'Resistencia para LED',
        formula: 'Rs = (Vfuente − Vled) / Iled',
        fields: [
            { id: 'vfuente', label: 'V fuente (V)', val: '12' },
            { id: 'vled', label: 'V led (V)', val: '2' },
            { id: 'iled', label: 'I led (mA)', val: '20' },
        ],
        calc(f) {
            let Vs = parseFloat(f.vfuente.value), Vl = parseFloat(f.vled.value), Il = parseFloat(f.iled.value) / 1000;
            if (isNaN(Vs) || isNaN(Vl) || isNaN(Il) || Il === 0) return null;
            let Rs = (Vs - Vl) / Il;
            let P = (Vs - Vl) * Il;
            let e24 = [10, 11, 12, 13, 15, 16, 18, 20, 22, 24, 27, 30, 33, 36, 39, 43, 47, 51, 56, 62, 68, 75, 82, 91];
            let com = null; let mul = 1;
            while (mul < 1e6) { let v = e24.find(x => x * mul >= Rs); if (v) { com = v * mul; break; } mul *= 10; }
            return {
                main: `${com} Ω`, label: 'Resistencia comercial (E24)',
                extras: [{ cls: 'info', txt: `Exacta: ${Rs.toFixed(1)} Ω` }, { cls: 'ok', txt: `Potencia: ${(P * 1000).toFixed(0)} mW` }],
                steps: [`ΔV = ${Vs}-${Vl} = ${Vs - Vl}V`, `Rs = ${Vs - Vl} / ${Il} = ${Rs.toFixed(1)} Ω`]
            };
        }
    },
    ohm: {
        title: 'Ley de Ohm', formula: 'V = I × R',
        vars: [{ id: 'v', label: 'Tensión (V)' }, { id: 'i', label: 'Corriente (I)' }, { id: 'r', label: 'Resistencia (R)' }],
        fields: [{ id: 'v', label: 'V (V)', val: '' }, { id: 'i', label: 'I (mA)', val: '20' }, { id: 'r', label: 'R (Ω)', val: '100' }],
        calc(f, t) {
            let V = parseFloat(f.v.value), I = parseFloat(f.i.value) / 1000, R = parseFloat(f.r.value);
            if (t === 'v') return { main: `${(I * R).toFixed(3)} V`, label: 'Tensión', extras: [], steps: [`V = ${I}A * ${R}Ω`] };
            if (t === 'i') return { main: `${(V / R * 1000).toFixed(2)} mA`, label: 'Corriente', extras: [], steps: [`I = ${V}V / ${R}Ω`] };
            if (t === 'r') return { main: `${(V / I).toFixed(2)} Ω`, label: 'Resistencia', extras: [], steps: [`R = ${V}V / ${I}A`] };
        }
    },
    serie_par: {
        title: 'Resistencias Serie/Paralelo',
        formula: 'Serie: Rtotal = R1 + R2, Paralelo: 1/Rtotal = 1/R1 + 1/R2',
        fields: [
            { id: 'r1', label: 'R1 (Ω)', val: '100' },
            { id: 'r2', label: 'R2 (Ω)', val: '220' },
            { id: 'tipo', label: 'Conexión', val: 'serie', type: 'select', opts: [{ v: 'serie', l: 'Serie' }, { v: 'paralelo', l: 'Paralelo' }] },
        ],
        calc(f) {
            let R1 = parseFloat(f.r1.value), R2 = parseFloat(f.r2.value), T = f.tipo.value;
            if (isNaN(R1) || isNaN(R2)) return null;
            let rt;
            if (T === 'serie') {
                rt = R1 + R2;
            } else {
                rt = (R1 * R2) / (R1 + R2);
            }
            return { main: `${rt.toFixed(2)} Ω`, label: 'R total', extras: [{ cls: 'info', txt: `${T.toUpperCase()}` }], steps: [`${T === 'serie' ? 'Rt = ' + R1 + ' + ' + R2 : 'Rt = (' + R1 + ' × ' + R2 + ') / (' + R1 + ' + ' + R2 + ')'}`] };
        }
    },
    p_elec: {
        title: 'Potencia Eléctrica',
        formula: 'P = V × I = V²/R = I² × R',
        vars: [{ id: 'p', label: 'Potencia (P)' }, { id: 'v', label: 'Tensión (V)' }, { id: 'i', label: 'Corriente (I)' }, { id: 'r', label: 'Resistencia (R)' }],
        fields: [{ id: 'p', label: 'P (W)', val: '' }, { id: 'v', label: 'V (V)', val: '12' }, { id: 'i', label: 'I (A)', val: '' }, { id: 'r', label: 'R (Ω)', val: '' }],
        calc(f, t) {
            let P = parseFloat(f.p.value), V = parseFloat(f.v.value), I = parseFloat(f.i.value), R = parseFloat(f.r.value);
            if (t === 'p' && V && I) return { main: `${(V * I).toFixed(2)} W`, label: 'Potencia', extras: [], steps: [`P = ${V}V × ${I}A`] };
            if (t === 'p' && V && R) return { main: `${(V * V / R).toFixed(2)} W`, label: 'Potencia', extras: [], steps: [`P = ${V}² / ${R}`] };
            if (t === 'p' && I && R) return { main: `${(I * I * R).toFixed(2)} W`, label: 'Potencia', extras: [], steps: [`P = ${I}² × ${R}`] };
            if (t === 'v' && P && I) return { main: `${(P / I).toFixed(2)} V`, label: 'Tensión', extras: [], steps: [`V = ${P}W / ${I}A`] };
            if (t === 'i' && P && V) return { main: `${(P / V).toFixed(3)} A`, label: 'Corriente', extras: [], steps: [`I = ${P}W / ${V}V`] };
            if (t === 'r' && V && I) return { main: `${(V / I).toFixed(2)} Ω`, label: 'Resistencia', extras: [], steps: [`R = ${V}V / ${I}A`] };
            return null;
        }
    },
    rc: {
        title: 'Filtro RC (Frecuencia de corte)',
        formula: 'fc = 1 / (2π × R × C)',
        fields: [
            { id: 'r', label: 'R (Ω)', val: '10000' },
            { id: 'c', label: 'C (µF)', val: '10' },
        ],
        calc(f) {
            let R = parseFloat(f.r.value), C = parseFloat(f.c.value) * 1e-6;
            if (isNaN(R) || isNaN(C) || C === 0) return null;
            let fc = 1 / (2 * Math.PI * R * C);
            return { main: `${fc.toFixed(1)} Hz`, label: 'Frecuencia corte', extras: [{ cls: 'info', txt: `${fc < 1000 ? fc.toFixed(1) + ' Hz' : (fc / 1000).toFixed(2) + ' kHz'}` }], steps: [`fc = 1 / (2π × ${R} × ${C * 1e6}µF)`] };
        }
    },
    div: {
        title: 'Divisor de Tensión',
        formula: 'Vout = Vin × R2 / (R1 + R2)',
        fields: [
            { id: 'vin', label: 'Vin (V)', val: '12' },
            { id: 'r1', label: 'R1 (Ω)', val: '10000' },
            { id: 'r2', label: 'R2 (Ω)', val: '10000' },
        ],
        calc(f) {
            let Vin = parseFloat(f.vin.value), R1 = parseFloat(f.r1.value), R2 = parseFloat(f.r2.value);
            if (isNaN(Vin) || isNaN(R1) || isNaN(R2) || (R1 + R2) === 0) return null;
            let Vout = Vin * R2 / (R1 + R2);
            return { main: `${Vout.toFixed(2)} V`, label: 'Vout', extras: [{ cls: 'info', txt: `Atenuación: ${(Vout / Vin * 100).toFixed(1)}%` }], steps: [`Vout = ${Vin} × ${R2} / (${R1} + ${R2})`] };
        }
    },
    par: {
        title: 'Resistencias en Paralelo (N)',
        formula: '1/Rtotal = Σ(1/Ri)',
        fields: [
            { id: 'r1', label: 'R1 (Ω)', val: '100' },
            { id: 'r2', label: 'R2 (Ω)', val: '220' },
            { id: 'r3', label: 'R3 (Ω)', val: '330' },
            { id: 'r4', label: 'R4 (Ω)', val: '' },
        ],
        calc(f) {
            let R1 = parseFloat(f.r1.value), R2 = parseFloat(f.r2.value), R3 = parseFloat(f.r3.value), R4 = parseFloat(f.r4.value);
            let res = [R1, R2, R3, R4].filter(r => !isNaN(r) && r > 0);
            if (res.length < 2) return null;
            let invSum = res.reduce((acc, r) => acc + 1 / r, 0);
            let rt = 1 / invSum;
            return { main: `${rt.toFixed(2)} Ω`, label: 'R total', extras: [{ cls: 'info', txt: `${res.length} resistencias` }], steps: [`1/Rt = ${res.map(r => '1/' + r).join(' + ')}`] };
        }
    },
    db: {
        title: 'Ganancia en dB',
        formula: 'dB = 20 × log10(Vout/Vin) o 10 × log10(Pout/Pin)',
        fields: [
            { id: 'tipo', label: 'Tipo', val: 'voltaje', type: 'select', opts: [{ v: 'voltaje', l: 'Voltaje' }, { v: 'potencia', l: 'Potencia' }] },
            { id: 'in', label: 'Entrada', val: '1' },
            { id: 'out', label: 'Salida', val: '10' },
        ],
        calc(f) {
            let T = f.tipo.value, IN = parseFloat(f.in.value), OUT = parseFloat(f.out.value);
            if (isNaN(IN) || isNaN(OUT) || IN === 0) return null;
            let db;
            if (T === 'voltaje') {
                db = 20 * Math.log10(OUT / IN);
            } else {
                db = 10 * Math.log10(OUT / IN);
            }
            return { main: `${db.toFixed(2)} dB`, label: 'Ganancia', extras: [{ cls: db >= 0 ? 'ok' : 'warn', txt: db >= 0 ? 'Amplificación' : 'Atenuación' }], steps: [`${T === 'voltaje' ? '20' : '10'} × log10(${OUT}/${IN})`] };
        }
    },
    '555': {
        title: '555 Astable (Frecuencia)',
        formula: 'f = 1.44 / ((R1 + 2R2) × C)',
        fields: [
            { id: 'r1', label: 'R1 (Ω)', val: '1000' },
            { id: 'r2', label: 'R2 (Ω)', val: '10000' },
            { id: 'c', label: 'C (µF)', val: '10' },
        ],
        calc(f) {
            let R1 = parseFloat(f.r1.value), R2 = parseFloat(f.r2.value), C = parseFloat(f.c.value) * 1e-6;
            if (isNaN(R1) || isNaN(R2) || isNaN(C) || C === 0) return null;
            let freq = 1.44 / ((R1 + 2 * R2) * C);
            let duty = (R1 + R2) / (R1 + 2 * R2) * 100;
            return { main: `${freq.toFixed(1)} Hz`, label: 'Frecuencia', extras: [{ cls: 'info', txt: `Duty cycle: ${duty.toFixed(1)}%` }], steps: [`f = 1.44 / ((${R1} + 2×${R2}) × ${C * 1e6}µF)`] };
        }
    },
    kirchhoff: {
        title: 'Mallas - Ley de Kirchhoff',
        formula: 'ΣV = 0 | 2 Mallas, 1 Fuente',
        fields: [
            { id: 'v1', label: 'V fuente (V)', val: '10' },
            { id: 'r1', label: 'R1 (Malla 1) (Ω)', val: '2' },
            { id: 'rs', label: 'R Compartida (Ω)', val: '3' },
            { id: 'r2', label: 'R2 (Malla 2) (Ω)', val: '5' },
        ],
        calc(f) {
            let V1 = parseFloat(f.v1.value), R1 = parseFloat(f.r1.value), Rs = parseFloat(f.rs.value), R2 = parseFloat(f.r2.value);
            if (isNaN(V1) || isNaN(R1) || isNaN(Rs) || isNaN(R2)) return null;
            // Resolución por determinantes para el sistema:
            // V1 = I1(R1+Rs) - I2(Rs)
            // 0 = -I1(Rs) + I2(R2+Rs)
            let D = (R1 + Rs) * (R2 + Rs) - (Rs * Rs);
            if (D === 0) return null;
            let I1 = (V1 * (R2 + Rs)) / D;
            let I2 = (V1 * Rs) / D;
            return {
                main: `I1: ${I1.toFixed(3)} A`,
                label: `I2: ${I2.toFixed(3)} A`,
                extras: [{ cls: 'info', txt: `I compartida: ${(I1 - I2).toFixed(3)} A` }, { cls: 'ok', txt: `V en R comp: ${((I1 - I2) * Rs).toFixed(2)} V` }],
                steps: [`Det = (${R1}+${Rs})×(${R2}+${Rs}) - ${Rs}²`, `I1 = (V1 × (R2+Rs)) / Det`, `I2 = (V1 × Rs) / Det`]
            };
        }
    }
};