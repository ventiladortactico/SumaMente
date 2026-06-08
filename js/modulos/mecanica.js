FORMS.mec = {
    torque: {
        title: 'Torque (Momento de Fuerza)',
        formula: 'T = F × d',
        vars: [{ id: 't_res', label: 'Torque (T)' }, { id: 'f_val', label: 'Fuerza (F)' }, { id: 'd_val', label: 'Distancia (d)' }],
        fields: [
            { id: 't_res', label: 'Torque (N·m)', val: '' },
            { id: 'f_val', label: 'Fuerza (N)', val: '50' },
            { id: 'd_val', label: 'Brazo palanca (m)', val: '0.3' },
        ],
        calc(f, target) {
            let T = parseFloat(f.t_res.value), F = parseFloat(f.f_val.value), d = parseFloat(f.d_val.value);
            if (target === 't_res') return { main: `${(F * d).toFixed(2)} N·m`, label: 'Torque', extras: [], steps: [`T = ${F}N × ${d}m`] };
            if (target === 'f_val') return { main: `${(T / d).toFixed(2)} N`, label: 'Fuerza', extras: [], steps: [`F = ${T}Nm / ${d}m`] };
            return { main: `${(T / F).toFixed(3)} m`, label: 'Distancia', extras: [], steps: [`d = ${T}Nm / ${F}N`] };
        }
    },
    cilindrada: {
        title: 'Cilindrada de Motores',
        formula: 'Vt = π/4 × D² × Carrera × N',
        vars: [{ id: 'vt', label: 'Cilindrada Total' }, { id: 'vu', label: 'Cilindrada Unitaria' }, { id: 'd', label: 'Diámetro (D)' }],
        fields: [
            { id: 'vt', label: 'Cilindrada Total (cc)', val: '' },
            { id: 'vu', label: 'Cilindrada Unitaria (cc)', val: '' },
            { id: 'd', label: 'Diámetro pistón (mm)', val: '80' },
            { id: 'c', label: 'Carrera pistón (mm)', val: '90' },
            { id: 'n', label: 'N° cilindros', val: '4' },
        ],
        calc(f, target) {
            let VT = parseFloat(f.vt.value), VU = parseFloat(f.vu.value), D = parseFloat(f.d.value) / 10, C = parseFloat(f.c.value) / 10, N = parseFloat(f.n.value);
            if (target === 'vt' || target === 'vu') {
                let vu_res = (Math.PI / 4) * Math.pow(D, 2) * C;
                let vt_res = vu_res * N;
                return { main: `${(target === 'vt' ? vt_res : vu_res).toFixed(0)} cc`, label: target === 'vt' ? 'Cilindrada Total' : 'Cilindrada Unitaria', extras: [], steps: [`Vt = Vu × ${N}`] };
            }
            let d_res = Math.sqrt(VU / (Math.PI / 4 * C)) * 10;
            return { main: `${d_res.toFixed(2)} mm`, label: 'Diámetro necesario', extras: [], steps: [`D = √(Vu / (π/4 × C))`] };
        }
    },
    hooke: {
        title: 'Ley de Hooke',
        formula: 'σ = E × ε',
        vars: [{ id: 'sigma', label: 'Tensión (σ)' }, { id: 'e_mod', label: 'Módulo Young (E)' }, { id: 'epsilon', label: 'Deformación (ε)' }],
        fields: [
            { id: 'sigma', label: 'Tensión σ (MPa)', val: '' },
            { id: 'e_mod', label: 'Módulo E (GPa)', val: '200' },
            { id: 'epsilon', label: 'Deformación ε (ΔL/L)', val: '0.001' },
        ],
        calc(f, target) {
            let S = parseFloat(f.sigma.value), E = parseFloat(f.e_mod.value) * 1000, Eps = parseFloat(f.epsilon.value);
            if (target === 'sigma') return { main: `${(E * Eps).toFixed(2)} MPa`, label: 'Tensión', extras: [], steps: [`σ = ${E}MPa × ${Eps}`] };
            if (target === 'e_mod') return { main: `${(S / Eps / 1000).toFixed(1)} GPa`, label: 'Módulo Young', extras: [], steps: [`E = ${S}MPa / ${Eps}`] };
            return { main: `${(S / E).toFixed(6)}`, label: 'Deformación', extras: [], steps: [`ε = ${S}MPa / ${E}MPa`] };
        }
    },
    potencia: {
        title: 'Potencia Mecánica',
        formula: 'P = Torque × ω',
        vars: [{ id: 'p_hp', label: 'Potencia (HP)' }, { id: 't_val', label: 'Torque (N·m)' }, { id: 'rpm_val', label: 'Velocidad (RPM)' }],
        fields: [
            { id: 'p_hp', label: 'Potencia (HP)', val: '' },
            { id: 't_val', label: 'Torque (N·m)', val: '200' },
            { id: 'rpm_val', label: 'Régimen (RPM)', val: '3000' },
        ],
        calc(f, target) {
            let P = parseFloat(f.p_hp.value), T = parseFloat(f.t_val.value), RPM = parseFloat(f.rpm_val.value);
            let w = RPM * 2 * Math.PI / 60;
            if (target === 'p_hp') {
                let hp = (T * w) / 746;
                return { main: `${hp.toFixed(1)} HP`, label: 'Potencia', extras: [], steps: [`P = T × ${w.toFixed(2)} rad/s`] };
            }
            let t_res = (P * 746) / w;
            return { main: `${t_res.toFixed(1)} N·m`, label: 'Torque', extras: [], steps: [`T = P / ω`] };
        }
    },
    consumo: {
        title: 'Consumo de combustible',
        formula: 'L/100km = (L / km) × 100',
        fields: [
            { id: 'litros', label: 'Litros cargados (L)', val: '40' },
            { id: 'km', label: 'Kilómetros recorridos', val: '400' },
            { id: 'precio', label: 'Precio litro ($)', val: '1200' },
        ],
        calc(f) {
            let L = parseFloat(f.litros.value), K = parseFloat(f.km.value), P = parseFloat(f.precio.value);
            if (isNaN(L) || isNaN(K) || K === 0) return null;
            let l100 = (L / K) * 100;
            let extras = [{ cls: 'info', txt: `Rendimiento: ${(K / L).toFixed(2)} km/L` }];
            if (!isNaN(P)) extras.push({ cls: 'info', txt: `Costo por km: $${(L * P / K).toFixed(2)}` });
            return { main: `${l100.toFixed(2)} L/100km`, label: 'Consumo', extras, steps: [`(${L}/${K}) × 100`] };
        }
    }
};