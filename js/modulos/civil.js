FORMS.civil = {
    hormigon: {
        title: 'Cálculo de Hormigón',
        formula: 'Volumen = Largo × Ancho × Espesor',
        fields: [
            { id: 'largo', label: 'Largo (m)', val: '4' },
            { id: 'ancho', label: 'Ancho (m)', val: '5' },
            { id: 'esp', label: 'Espesor (cm)', val: '10' },
            { id: 'dosis', label: 'Dosificación (kg/m³)', val: '350' },
        ],
        calc(f) {
            let L = parseFloat(f.largo.value), A = parseFloat(f.ancho.value), E = parseFloat(f.esp.value) / 100, D = parseFloat(f.dosis.value);
            if (isNaN(L) || isNaN(A) || isNaN(E)) return null;
            let V = L * A * E;
            let cemento = D * V * 1.1; // Estimación con 10% de desperdicio
            return { main: `${Math.ceil(cemento / 50)} bolsas`, label: 'Cemento (bolsas 50kg)', extras: [{ cls: 'info', txt: `Volumen total: ${V.toFixed(2)} m³` }], steps: [`V = ${L} * ${A} * ${E}`] };
        }
    },
    ladrillos: {
        title: 'Ladrillos por superficie',
        formula: 'N = m² × ladrillos/m²',
        fields: [
            { id: 'largo', label: 'Largo muro (m)', val: '5' },
            { id: 'alto', label: 'Alto muro (m)', val: '2.5' },
            { id: 'tipo', label: 'Ladrillo', val: '50', type: 'select', opts: [{ v: '50', l: '8cm (50/m²)' }, { v: '40', l: '12cm (40/m²)' }, { v: '33', l: '18cm (33/m²)' }] },
        ],
        calc(f) {
            let L = parseFloat(f.largo.value), A = parseFloat(f.alto.value), D = parseFloat(f.tipo.value);
            if (isNaN(L) || isNaN(A)) return null;
            let N = Math.ceil(L * A * D * 1.05); // 5% de rotura
            return { main: `${N} ladrillos`, label: 'Unidades necesarias', extras: [{ cls: 'info', txt: `Superficie: ${(L * A).toFixed(1)} m²` }], steps: [`N = ${L * A} * ${D} * 1.05`] };
        }
    },
    caida: {
        title: 'Caída de Tensión',
        formula: 'ΔV = 2·ρ·L·I / S',
        fields: [
            { id: 'l', label: 'Longitud (m)', val: '50' },
            { id: 'i', label: 'Corriente (A)', val: '10' },
            { id: 's', label: 'Sección (mm²)', val: '2.5' },
            { id: 'vin', label: 'Vin (V)', val: '220' },
        ],
        calc(f) {
            let L = parseFloat(f.l.value), I = parseFloat(f.i.value), S = parseFloat(f.s.value), Vin = parseFloat(f.vin.value);
            const rho = 0.0178; // Resistividad del cobre
            let dV = (2 * rho * L * I) / S;
            let pct = (dV / Vin) * 100;
            return { main: `${dV.toFixed(2)} V`, label: `Caída de tensión (${pct.toFixed(1)}%)`, extras: [{ cls: pct < 3 ? 'ok' : 'warn', txt: pct < 3 ? 'Dentro del límite reglamentario' : 'Excede el 3% recomendado' }], steps: [`ΔV = (2 * 0.0178 * ${L} * ${I}) / ${S}`] };
        }
    }
};