FORMS.fin = {
    prestamo: {
        title: 'Préstamo Sistema Francés',
        formula: 'C = P × i(1+i)ⁿ / ((1+i)ⁿ−1)',
        fields: [
            { id: 'capital', label: 'Capital ($)', val: '1000000' },
            { id: 'tna', label: 'TNA (%)', val: '90' },
            { id: 'plazo', label: 'Plazo (meses)', val: '24' },
        ],
        calc(f) {
            let P = parseFloat(f.capital.value), TNA = parseFloat(f.tna.value) / 100, N = parseFloat(f.plazo.value);
            if (isNaN(P) || isNaN(TNA) || isNaN(N)) return null;
            let i = TNA / 12;
            let C = P * i * Math.pow(1 + i, N) / (Math.pow(1 + i, N) - 1);
            let isAr = document.getElementById('modo-ar').checked;
            let extras = [{ cls: 'info', txt: `Total a pagar: $${(C * N).toLocaleString('es-AR', { maximumFractionDigits: 0 })}` }];
            if (isAr) extras.push({ cls: 'warn', txt: 'CFT estimado (IVA + Seg): ~' + (TNA * 1.25 * 100).toFixed(1) + '%' });
            return { main: `$${C.toLocaleString('es-AR', { maximumFractionDigits: 2 })}`, label: 'Cuota Mensual', extras, steps: [`i mensual = ${TNA}/12`, `Amortización constante de interés`] };
        }
    },
    uva: {
        title: 'Préstamo UVA',
        formula: 'Cuota = Amortización + Int. sobre Saldo',
        fields: [
            { id: 'capital', label: 'Capital ($)', val: '2000000' },
            { id: 'plazo', label: 'Plazo (meses)', val: '360' },
            { id: 'uva', label: 'Valor UVA ($)', val: '1200' },
            { id: 'tasa', label: 'Tasa fija (%)', val: '5' },
        ],
        calc(f) {
            let P = parseFloat(f.capital.value), N = parseFloat(f.plazo.value), UVA = parseFloat(f.uva.value), T = parseFloat(f.tasa.value) / 100;
            let i = T / 12;
            let capUva = P / UVA;
            let cuotaUva = capUva * i * Math.pow(1 + i, N) / (Math.pow(1 + i, N) - 1);
            return { main: `${cuotaUva.toFixed(2)} UVAs`, label: `≈ $${(cuotaUva * UVA).toLocaleString('es-AR', { maximumFractionDigits: 0 })}`, extras: [{ cls: 'danger', txt: 'Ajustable por inflación (IPC)' }], steps: [`Cap. inicial: ${capUva.toFixed(2)} UVAs`] };
        }
    },
    intcomp: {
        title: 'Interés Compuesto',
        formula: 'M = C × (1 + i)ⁿ',
        fields: [
            { id: 'capital', label: 'Capital inicial ($)', val: '100000' },
            { id: 'tasa', label: 'Tasa anual (%)', val: '80' },
            { id: 'años', label: 'Años', val: '3' },
        ],
        calc(f) {
            let C = parseFloat(f.capital.value), T = parseFloat(f.tasa.value) / 100, A = parseFloat(f.años.value);
            let M = C * Math.pow(1 + T, A);
            return { main: `$${M.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`, label: 'Monto Final', extras: [{ cls: 'ok', txt: `Ganancia: $${(M - C).toLocaleString()}` }], steps: [`Factor de crecimiento: ${(M / C).toFixed(2)}x`] };
        }
    },
    margen: {
        title: 'Margen de Utilidad',
        formula: 'M = (PV - PC) / PV',
        fields: [
            { id: 'pc', label: 'Precio Costo ($)', val: '1000' },
            { id: 'pv', label: 'Precio Venta ($)', val: '1500' },
        ],
        calc(f) {
            let PC = parseFloat(f.pc.value), PV = parseFloat(f.pv.value);
            let margen = (PV - PC) / PV * 100;
            let markup = (PV - PC) / PC * 100;
            return { main: `${margen.toFixed(2)}%`, label: 'Margen sobre venta', extras: [{ cls: 'info', txt: `Markup (sobre costo): ${markup.toFixed(2)}%` }], steps: [`Ganancia por unidad: $${PV - PC}`] };
        }
    },
    vpn_tir: {
        title: 'VPN y TIR',
        formula: 'VPN = Σ FCt/(1+r)^t',
        fields: [
            { id: 'i0', label: 'Inversión inicial (-)', val: '-1000' },
            { id: 'f1', label: 'Flujo Año 1', val: '600' },
            { id: 'f2', label: 'Flujo Año 2', val: '600' },
            { id: 'tasa', label: 'Tasa descuento (%)', val: '10' },
        ],
        calc(f) {
            let r = parseFloat(f.tasa.value) / 100;
            let flows = [parseFloat(f.i0.value), parseFloat(f.f1.value), parseFloat(f.f2.value)];
            let vpn = FIN_UTILS.calcVPN(r, flows);
            let tir = FIN_UTILS.calcTIR(flows);
            return { main: `VPN: $${vpn.toFixed(2)}`, label: `TIR: ${(tir * 100).toFixed(2)}%`, extras: [{ cls: vpn > 0 ? 'ok' : 'danger', txt: vpn > 0 ? 'Proyecto Rentable' : 'No rentable' }], steps: [`TIR hallada por Newton-Raphson`] };
        }
    },
    aleman_amer: {
        title: 'Otros Sistemas de Amortización',
        formula: 'Alemán: Cap. Constante | Amer: Int. solo',
        fields: [
            { id: 'cap', label: 'Capital ($)', val: '100000' },
            { id: 'plazo', label: 'Plazo (meses)', val: '12' },
            { id: 'tasa', label: 'TNA (%)', val: '80' },
            { id: 'sistema', label: 'Sistema', val: 'aleman', type: 'select', opts: [{ v: 'aleman', l: 'Alemán (Cuota decreciente)' }, { v: 'americano', l: 'Americano (Capital al final)' }] },
        ],
        calc(f) {
            let P = parseFloat(f.cap.value), N = parseFloat(f.plazo.value), i = (parseFloat(f.tasa.value) / 100) / 12;
            if (f.sistema.value === 'aleman') {
                let c1 = (P / N) + (P * i);
                return { main: `$${c1.toFixed(2)}`, label: 'Cuota 1 (Alemán)', extras: [{ cls: 'info', txt: 'Las cuotas bajan cada mes' }], steps: [`Amortización mensual: $${(P / N).toFixed(2)}`] };
            }
            return { main: `$${(P * i).toFixed(2)}`, label: 'Cuota interés (Americano)', extras: [{ cls: 'warn', txt: `Al final pagás: $${P.toLocaleString()}` }], steps: [`Solo pagás intereses hasta el mes ${N}`] };
        }
    },
    tasas: {
        title: 'Conversor de Tasas',
        formula: 'TEA = (1 + TNA/m)ᵐ - 1',
        fields: [
            { id: 'tna_in', label: 'TNA (%)', val: '80' },
            { id: 'm', label: 'Capitalizaciones/año', val: '12' },
        ],
        calc(f) {
            let tna = parseFloat(f.tna_in.value) / 100, m = parseFloat(f.m.value);
            let tea = Math.pow(1 + tna / m, m) - 1;
            return { main: `${(tea * 100).toFixed(2)}%`, label: 'TEA (Tasa Efectiva Anual)', extras: [{ cls: 'info', txt: `TEM (Mensual): ${( (Math.pow(1+tea, 1/12)-1)*100 ).toFixed(2)}%` }], steps: [`Efectivización sobre ${m} periodos`] };
        }
    }
};