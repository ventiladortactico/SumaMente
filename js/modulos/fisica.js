FORMS.fis = {
    velocidad: {
        title: 'Cinemática: Velocidad final',
        formula: 'vf = v0 + a · t',
        vars: [
            { id: 'vf', label: 'Velocidad Final (vf)' },
            { id: 'v0', label: 'Velocidad Inicial (v0)' },
            { id: 'a', label: 'Aceleración (a)' },
            { id: 't', label: 'Tiempo (t)' },
        ],
        fields: [
            { id: 'vf', label: 'V final (m/s)', val: '' },
            { id: 'v0', label: 'V inicial (m/s)', val: '0' },
            { id: 'a', label: 'Aceleración (m/s²)', val: '9.81' },
            { id: 't', label: 'Tiempo (s)', val: '10' },
        ],
        calc(f, target) {
            let vf = parseFloat(f.vf.value), v0 = parseFloat(f.v0.value), a = parseFloat(f.a.value), t = parseFloat(f.t.value);
            let main, label, steps = [];
            if (target === 'vf') {
                main = `${(v0 + a * t).toFixed(2)} m/s`; label = 'Velocidad Final';
                steps = [`vf = ${v0} + (${a} * ${t})`];
            } else if (target === 'v0') {
                main = `${(vf - a * t).toFixed(2)} m/s`; label = 'Velocidad Inicial';
                steps = [`v0 = ${vf} - (${a} * ${t})`];
            } else if (target === 'a') {
                main = `${((vf - v0) / t).toFixed(2)} m/s²`; label = 'Aceleración';
                steps = [`a = (${vf} - ${v0}) / ${t}`];
            } else if (target === 't') {
                main = `${((vf - v0) / a).toFixed(2)} s`; label = 'Tiempo';
                steps = [`t = (${vf} - ${v0}) / ${a}`];
            }
            return { main, label, extras: [], steps };
        }
    },
    fuerza: {
        title: 'Segunda Ley de Newton',
        formula: 'F = m · a',
        vars: [{ id: 'f_res', label: 'Fuerza (F)' }, { id: 'm', label: 'Masa (m)' }, { id: 'a', label: 'Aceleración (a)' }],
        fields: [{ id: 'f_res', label: 'Fuerza (N)', val: '' }, { id: 'm', label: 'Masa (kg)', val: '10' }, { id: 'a', label: 'Aceleración (m/s²)', val: '9.81' }],
        calc(f, target) {
            let F = parseFloat(f.f_res.value), m = parseFloat(f.m.value), a = parseFloat(f.a.value);
            if (target === 'f_res') return { main: `${(m * a).toFixed(2)} N`, label: 'Fuerza', extras: [], steps: [`F = ${m} * ${a}`] };
            if (target === 'm') return { main: `${(F / a).toFixed(2)} kg`, label: 'Masa', extras: [], steps: [`m = ${F} / ${a}`] };
            return { main: `${(F / m).toFixed(2)} m/s²`, label: 'Aceleración', extras: [], steps: [`a = ${F} / ${m}`] };
        }
    },
    energia: {
        title: 'Energía Cinética y Potencial',
        formula: 'Ec = ½·m·v² | Ep = m·g·h',
        vars: [{ id: 'ec', label: 'Ec (J)' }, { id: 'ep', label: 'Ep (J)' }, { id: 'm', label: 'Masa (kg)' }, { id: 'v', label: 'Velocidad (m/s)' }, { id: 'h', label: 'Altura (m)' }],
        fields: [{ id: 'ec', label: 'Ec (J)', val: '' }, { id: 'ep', label: 'Ep (J)', val: '' }, { id: 'm', label: 'Masa (kg)', val: '1' }, { id: 'v', label: 'Velocidad (m/s)', val: '10' }, { id: 'h', label: 'Altura (m)', val: '5' }],
        calc(f, target) {
            let ec_v = parseFloat(f.ec.value), ep_v = parseFloat(f.ep.value), m = parseFloat(f.m.value), v = parseFloat(f.v.value), h = parseFloat(f.h.value);
            if (target === 'ec') return { main: `${(0.5 * m * v * v).toFixed(1)} J`, label: 'Energía Cinética', extras: [], steps: [`Ec = 0.5 * ${m} * ${v}²`] };
            if (target === 'ep') return { main: `${(m * 9.81 * h).toFixed(1)} J`, label: 'Energía Potencial', extras: [], steps: [`Ep = ${m} * 9.81 * ${h}`] };
            return null;
        }
    }
};