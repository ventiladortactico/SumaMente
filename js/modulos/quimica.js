FORMS.quim = {
    molar: {
        title: 'Preparar solución por molaridad',
        formula: 'm = M × V(L) × PM',
        vars: [
            { id: 'm_res', label: 'Masa (m)' },
            { id: 'mol', label: 'Molaridad (M)' },
            { id: 'vol', label: 'Volumen (V)' },
        ],
        fields: [
            { id: 'm_res', label: 'Masa (g)', val: '' },
            { id: 'mol', label: 'Molaridad M (mol/L)', val: '0.9' },
            { id: 'vol', label: 'Volumen final (mL)', val: '250' },
            { id: 'pm', label: 'Peso molecular (g/mol)', val: '58.44' },
            { id: 'comp', label: 'Compuesto', val: 'NaCl', type: 'select', opts: [{ v: '58.44', l: 'NaCl' }, { v: '40.00', l: 'NaOH' }, { v: '36.46', l: 'HCl' }, { v: '98.08', l: 'H₂SO₄' }, { v: '18.02', l: 'H₂O' }, { v: 'custom', l: 'Otro' }] },
        ],
        calc(f, target) {
            let m = parseFloat(f.m_res.value), M = parseFloat(f.mol.value), V = parseFloat(f.vol.value) / 1000, PM = parseFloat(f.pm.value);
            if (f.comp.value !== 'custom') PM = parseFloat(f.comp.value);
            let main, label, steps = [], extras = [];
            if (target === 'm_res') {
                if (isNaN(M) || isNaN(V) || isNaN(PM)) return null;
                let res = M * V * PM;
                main = `${res.toFixed(2)} g`; label = 'Masa a pesar';
                steps = [`m = ${M} mol/L × ${V * 1000}mL/1000 × ${PM} g/mol = <strong>${res.toFixed(2)} g</strong>`];
                extras = [{ cls: 'info', txt: `Moles: ${(M * V).toFixed(4)} mol` }, { cls: 'ok', txt: `Pesar ${res.toFixed(2)}g y enrasar a ${f.vol.value}mL` }];
            } else if (target === 'mol') {
                if (isNaN(m) || isNaN(V) || isNaN(PM) || V === 0 || PM === 0) return null;
                let res = m / (V * PM);
                main = `${res.toFixed(4)} M`; label = 'Molaridad';
                steps = [`M = ${m}g / (${V}L × ${PM}g/mol) = <strong>${res.toFixed(4)} M</strong>`];
            } else if (target === 'vol') {
                if (isNaN(m) || isNaN(M) || isNaN(PM) || M === 0 || PM === 0) return null;
                let res = (m / (M * PM)) * 1000;
                main = `${res.toFixed(1)} mL`; label = 'Volumen';
                steps = [`V = (${m}g / (${M}M × ${PM}g/mol)) × 1000 = <strong>${res.toFixed(1)} mL</strong>`];
            }
            return { main, label, extras, steps };
        }
    },
    dilucion: {
        title: 'Dilución C₁V₁ = C₂V₂',
        formula: 'V1 = C2 × V2 / C1',
        fields: [
            { id: 'c1', label: 'Concentración stock C1 (M)', val: '12' },
            { id: 'c2', label: 'Concentración final C2 (M)', val: '0.1' },
            { id: 'v2', label: 'Volumen final V2 (mL)', val: '500' },
        ],
        calc(f) {
            let C1 = parseFloat(f.c1.value), C2 = parseFloat(f.c2.value), V2 = parseFloat(f.v2.value);
            if (isNaN(C1) || isNaN(C2) || isNaN(V2) || C1 === 0) return null;
            let V1 = C2 * V2 / C1;
            let extras = [{ cls: 'ok', txt: `Tomar ${V1.toFixed(2)} mL de stock y completar a ${V2} mL` }, { cls: 'info', txt: `Factor: 1:${(C1 / C2).toFixed(0)}` }];
            let steps = [`V1 = ${C2}×${V2}/${C1} = <strong>${V1.toFixed(2)} mL</strong>`];
            return { main: `${V1.toFixed(2)} mL`, label: 'Volumen de stock a tomar', extras, steps };
        }
    },
    ph: {
        title: 'pH de solución ácida',
        formula: 'pH = -log₁₀([H⁺])',
        fields: [
            { id: 'conc', label: 'Concentración ácido (M)', val: '0.01' },
            { id: 'tipo', label: 'Tipo', val: 'fuerte', type: 'select', opts: [{ v: 'fuerte', l: 'Ácido fuerte' }, { v: 'debil', l: 'Ácido débil' }] },
            { id: 'ka', label: 'Ka (solo ácido débil)', val: '1.8e-5' },
        ],
        calc(f) {
            let C = parseFloat(f.conc.value), T = f.tipo.value, Ka = parseFloat(f.ka.value);
            let H, ph;
            if (T === 'fuerte') { H = C; ph = -Math.log10(H); }
            else { H = (-Ka + Math.sqrt(Ka * Ka + 4 * Ka * C)) / 2; ph = -Math.log10(H); }
            let extras = [{ cls: 'info', txt: `[H⁺] = ${H.toExponential(3)} M` }, { cls: (ph < 7 ? 'warn' : 'ok'), txt: ph < 7 ? 'Solución ácida' : 'Solución básica/neutra' }];
            return { main: ph.toFixed(3), label: 'pH de la solución', extras, steps: [`pH = -log₁₀([H⁺])`] };
        }
    },
    gas: {
        title: 'Gas ideal — PV = nRT',
        formula: 'PV = nRT',
        fields: [
            { id: 'p', label: 'P (atm)', val: '' },
            { id: 'v', label: 'V (L)', val: '' },
            { id: 'n', label: 'n (mol)', val: '1' },
            { id: 't', label: 'T (°C)', val: '25' },
        ],
        calc(f) {
            const R = 0.08206;
            let P = parseFloat(f.p.value), V = parseFloat(f.v.value), n = parseFloat(f.n.value), T = parseFloat(f.t.value) + 273.15;
            if (!isNaN(P) && !isNaN(V)) return { main: `${(P * V / (R * T)).toFixed(4)} mol`, label: 'Moles', extras: [], steps: ['n = PV/RT'] };
            if (isNaN(P)) return { main: `${(n * R * T / V).toFixed(4)} atm`, label: 'Presión', extras: [], steps: ['P = nRT/V'] };
            return { main: `${(n * R * T / P).toFixed(4)} L`, label: 'Volumen', extras: [], steps: ['V = nRT/P'] };
        }
    }
};