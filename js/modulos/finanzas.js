FORMS.fin = {
    prestamo: {
        title: 'Préstamo Sistema Francés',
        formula: 'C = P × i(1+i)n / ((1+i)n-1)',
        fields: [
            { id: 'capital', label: 'Capital ($)', val: '1000000' },
            { id: 'tna', label: 'TNA (%)', val: '90' },
            { id: 'plazo', label: 'Plazo (meses)', val: '24' },
        ],
        calc(f) {
            let P = parseFloat(f.capital.value), TNA = parseFloat(f.tna.value) / 100, N = parseFloat(f.plazo.value);
            if (isNaN(P) || isNaN(TNA) || isNaN(N)) return null;
            let i = TNA / 12;
            if (i <= 0 || N <= 0) return { error: true, msg: "La tasa y el plazo deben ser mayores a 0", label: "Error de entrada" };
            let C = P * i * Math.pow(1 + i, N) / (Math.pow(1 + i, N) - 1);
            
            // Check dinámico del botón de Modo Argentina
            let isAr = document.getElementById('modo-ar')?.checked || false;
            let locale = isAr ? 'es-AR' : 'en-US';
            let notaAr = isAr ? 'Nota: Simulación bajo contexto inflacionario local.' : 'Nota: i y n deben usar la misma unidad.';

            return {
                main: `$${C.toLocaleString(locale, { maximumFractionDigits: 2 })}`,
                label: isAr ? 'Cuota Mensual Estimada (S/Impuestos)' : 'Cuota Mensual Pura',
                extras: [
                    { cls: 'info', txt: `Total a pagar: $${(C * N).toLocaleString(locale, { maximumFractionDigits: 0 })}` },
                    { cls: 'warn', txt: `Intereses totales: $${((C * N) - P).toLocaleString(locale, { maximumFractionDigits: 0 })}` },
                    { cls: 'muted', txt: notaAr }
                ],
                steps: [`i = ${TNA.toFixed(2)} / 12 = ${i.toFixed(4)}`, `Cuota = ${P} * ${i.toFixed(4)} * (1+i)n / ((1+i)n-1)`],
                chart(canvas) {
                    FinanzasVisual.prestamo(canvas, C, P, N, TNA);
                }
            };
        }
    },
    tasas: {
        title: 'Conversor TNA → TEA',
        formula: 'TEA = (1 + TNA/m)ⁿ − 1',
        fields: [
            { id: 'tna_in', label: 'TNA (%)', val: '90' },
            { id: 'tea_in', label: 'TEA (%)', val: '' },
            { id: 'm', label: 'Capitalizaciones al año', val: '12' }
        ],
        // Mantenemos tu lógica interactiva de deshabilitar inputs según cuál use el usuario
        onChange(target, f) {
            if (target === 'tea_in') {
                f.tna_in.disabled = true; f.tna_in.value = '';
                f.tea_in.disabled = false;
            } else {
                f.tea_in.disabled = true; f.tea_in.value = '';
                f.tna_in.disabled = false;
            }
        },
        calc(f) {
            let m = parseFloat(f.m.value);
            if (isNaN(m) || m === 0) return null;

            let tna, tea;
            // Detectamos cuál input está activo para calcular el inverso de forma interactiva
            if (!f.tna_in.disabled && f.tna_in.value !== '') {
                tna = parseFloat(f.tna_in.value) / 100;
                tea = Math.pow(1 + tna / m, m) - 1;
            } else if (!f.tea_in.disabled && f.tea_in.value !== '') {
                tea = parseFloat(f.tea_in.value) / 100;
                tna = m * (Math.pow(1 + tea, 1 / m) - 1);
            } else return null;

            let tem = Math.pow(1 + tea, 1 / 12) - 1;
            let isAr = document.getElementById('modo-ar')?.checked || false;

            return {
                main: !f.tna_in.disabled ? `${(tea * 100).toFixed(2)}% TEA` : `${(tna * 100).toFixed(2)}% TNA`,
                label: 'Equivalencia de Tasas',
                extras: [
                    { cls: 'ok', txt: `TEM (Efectiva Mensual): ${(tem * 100).toFixed(2)}%` },
                    isAr ? { cls: 'danger', txt: `Alerta: Revisá el CFT (Costo Financiero Total) con impuestos.` } : null
                ].filter(Boolean),
                steps: [`TEA = (1 + TNA/m)ⁿ − 1`],
                chart(canvas) {
                    FinanzasVisual.tasas(canvas, tna, tea);
                }
            };
        }
    },
    equilibrio: {
        title: 'Punto de Equilibrio (Contabilidad)',
        formula: 'Q = Costos Fijos / (Precio Venta - Costo Variable)',
        fields: [
            { id: 'fijos', label: 'Costos Fijos Totales ($)', val: '150000' },
            { id: 'precio', label: 'Precio de Venta Unitario ($)', val: '500' },
            { id: 'variable', label: 'Costo Variable Unitario ($)', val: '200' }
        ],
        calc(f) {
            let cf = parseFloat(f.fijos.value);
            let pv = parseFloat(f.precio.value);
            let cv = parseFloat(f.variable.value);
            let isAr = document.getElementById('modo-ar')?.checked || false;
            let locale = isAr ? 'es-AR' : 'en-US';

            if (isNaN(cf) || isNaN(pv) || isNaN(cv)) return null;
            if (pv <= cv) return { error: true, msg: "El precio de venta debe superar los costos variables", label: "Margen Negativo" };

            let q = cf / (pv - cv);
            let ingresosEquilibrio = q * pv;

            return {
                main: `${Math.ceil(q).toLocaleString(locale)} unidades`,
                label: 'Umbral de Rentabilidad (Q)',
                extras: [
                    { cls: 'ok', txt: `Facturación mínima: $${ingresosEquilibrio.toLocaleString(locale, {maximumFractionDigits:0})}` },
                    isAr ? { cls: 'warn', txt: `Aviso: No incluye Ingresos Brutos ni tasas municipales urbanas.` } : null
                ].filter(Boolean),
                steps: [`Q = ${cf} / (${pv} - ${cv})`],
                chart(canvas) {
                    FinanzasVisual.equilibrio(canvas, cf, pv, cv, q);
                }
            };
        }
    },
    van: {
        title: 'Valor Actual Neto / VAN (Economía)',
        formula: 'VAN = -Inversión + S [ Flujo_t / (1 + k)ᵗ ]',
        fields: [
            { id: 'inv', label: 'Inversión Inicial ($)', val: '500000' },
            { id: 'flujos', label: 'Flujos (separados por espacio)', type: 'text', val: '150000 200000 250000 300000' },
            { id: 'tasa', label: 'Tasa Descuento / COK (%)', val: '15' }
        ],
        calc(f) {
            let inv = parseFloat(f.inv.value);
            let k = parseFloat(f.tasa.value) / 100;
            let rawflujos = f.flujos.value.trim().split(/[\s,]+/);
            let flujos = rawflujos.map(Number).filter(n => !isNaN(n));
            let isAr = document.getElementById('modo-ar')?.checked || false;
            let locale = isAr ? 'es-AR' : 'en-US';

            if (isNaN(inv) || isNaN(k) || flujos.length === 0) return null;

            let van = -inv;
            let steps = [`Año 0: -${inv}`];

            for (let t = 0; t < flujos.length; t++) {
                let f_v = flujos[t] / Math.pow(1 + k, t + 1);
                van += f_v;
                steps.push(`Año ${t+1}: +${flujos[t]} / (1+${k})^${t+1} = +${f_v.toFixed(0)}`);
            }

            return {
                main: `$${van.toLocaleString(locale, { maximumFractionDigits: 2 })}`,
                label: 'Valor Actual Neto (VAN)',
                extras: [
                    van >= 0 
                        ? { cls: 'ok', txt: isAr ? 'PROYECTO FACTIBLE (Supera la tasa de corte inflacionaria).' : 'PROYECTO VIABLE.' }
                        : { cls: 'danger', txt: 'PROYECTO RECHAZADO: Destruye valor de capital.' }
                ],
                steps: steps,
                chart(canvas) {
                    FinanzasVisual.van(canvas, inv, flujos, van);
                }
            };
        }
    },
    iva: {
        title: 'Cálculo de IVA',
        formula: 'Bruto = Neto × (1 + tasa) | IVA = Neto × tasa',
        fields: [
            { id: 'monto', label: 'Monto ($)', val: '10000' },
            { id: 'tipo_op', label: 'Operación', type: 'select', opts: [
                {v:'neto', l:'Neto → Bruto'}, {v:'bruto', l:'Bruto → Neto'}
            ]},
            { id: 'tasa_iva', label: 'Tasa de IVA', type: 'select', opts: [
                {v:'0.21', l:'21% General'}, {v:'0.105', l:'10.5% Reducida'}, {v:'0.27', l:'27% Bienes suntuarios'}
            ]}
        ],
        calc(f) {
            let monto = parseFloat(f.monto.value);
            let tipo = f.tipo_op.value;
            let tasa = parseFloat(f.tasa_iva.value);
            let isAr = document.getElementById('modo-ar')?.checked || false;
            if (isNaN(monto) || monto <= 0) return { error: true, msg: "Ingresá un monto mayor a cero", label: "Inválido" };
            let neto, iva, bruto;
            if (tipo === 'neto') {
                neto = monto; iva = neto * tasa; bruto = neto + iva;
            } else {
                bruto = monto; neto = bruto / (1 + tasa); iva = bruto - neto;
            }
            return {
                main: `$${(tipo === 'neto' ? bruto : neto).toLocaleString(isAr ? 'es-AR' : 'en-US', {maximumFractionDigits:2})}`,
                label: tipo === 'neto' ? 'Precio Bruto (con IVA)' : 'Precio Neto (sin IVA)',
                extras: [
                    { cls: 'info', txt: `IVA (${(tasa*100).toFixed(1)}%): $${iva.toLocaleString(isAr ? 'es-AR' : 'en-US', {maximumFractionDigits:2})}` },
                    { cls: 'ok', txt: tipo === 'neto' ? `Base imponible: $${neto.toLocaleString(isAr ? 'es-AR' : 'en-US', {maximumFractionDigits:2})}` : `Total factura: $${bruto.toLocaleString(isAr ? 'es-AR' : 'en-US', {maximumFractionDigits:2})}` }
                ],
                steps: ['Tasa IVA: ' + (tasa*100).toFixed(1) + '%', tipo === 'neto' ? 'IVA = Neto × Tasa' : 'Neto = Bruto / (1 + Tasa)'],
                chart(canvas) {
                    FinanzasVisual.iva(canvas, neto, iva, bruto, tasa);
                }
            };
        }
    },
    depreciacion: {
        title: 'Depreciación de Activos',
        formula: 'Lineal: DA = (Valor - Residual) / Vida Útil',
        fields: [
            { id: 'valor_activo', label: 'Valor del Activo ($)', val: '100000' },
            { id: 'valor_residual', label: 'Valor Residual ($)', val: '10000' },
            { id: 'vida_util', label: 'Vida Útil (años)', val: '5' },
            { id: 'metodo', label: 'Método', type: 'select', opts: [
                {v:'lineal', l:'Línea Recta'}, {v:'suma_digitos', l:'Suma Dígitos Años'}, {v:'doble_saldo', l:'Doble Saldo Decreciente'}
            ]}
        ],
        calc(f) {
            let va = parseFloat(f.valor_activo.value);
            let vr = parseFloat(f.valor_residual.value);
            let vu = parseInt(f.vida_util.value);
            let metodo = f.metodo.value;
            let isAr = document.getElementById('modo-ar')?.checked || false;
            if (isNaN(va) || isNaN(vr) || isNaN(vu) || vu <= 0) return null;
            if (va <= vr) return { error: true, msg: "El valor del activo debe ser mayor al residual", label: "Inválido" };
            let depreciable = va - vr;
            let tabla = [];
            if (metodo === 'lineal') {
                let anual = depreciable / vu;
                for (let i = 1; i <= vu; i++) tabla.push({ anio: i, depreciacion: anual, acumulado: anual * i, saldo: va - anual * i });
            } else if (metodo === 'suma_digitos') {
                let suma = vu * (vu + 1) / 2;
                for (let i = 1; i <= vu; i++) {
                    let factor = (vu - i + 1) / suma;
                    let dep = depreciable * factor;
                    let acum = tabla.length > 0 ? tabla[tabla.length-1].acumulado + dep : dep;
                    tabla.push({ anio: i, depreciacion: dep, acumulado: acum, saldo: va - acum });
                }
            } else {
                let tasa_doble = 2 / vu;
                let saldo = va;
                for (let i = 1; i <= vu; i++) {
                    let dep = Math.max(saldo * tasa_doble, 0);
                    if (i === vu) dep = saldo - vr;
                    if (dep < 0) dep = 0;
                    saldo -= dep;
                    let acum = tabla.length > 0 ? tabla[tabla.length-1].acumulado + dep : dep;
                    tabla.push({ anio: i, depreciacion: dep, acumulado: acum, saldo: Math.max(saldo, vr) });
                }
            }
            let extras = tabla.slice(0, 5).map(function(t) {
                return { cls: 'info', txt: `Año ${t.anio}: Dep. $${t.depreciacion.toLocaleString(isAr ? 'es-AR' : 'en-US', {maximumFractionDigits:0})} | Saldo: $${t.saldo.toLocaleString(isAr ? 'es-AR' : 'en-US', {maximumFractionDigits:0})}` };
            });
            if (tabla.length > 5) extras.push({ cls: 'info', txt: `... y ${tabla.length - 5} años más` });
            return {
                main: `$${tabla[0].depreciacion.toLocaleString(isAr ? 'es-AR' : 'en-US', {maximumFractionDigits:2})}/año`,
                label: `Depreciación (${metodo === 'lineal' ? 'Lineal' : metodo === 'suma_digitos' ? 'Suma Dígitos' : 'Doble Saldo'})`,
                extras: extras,
                steps: ['Método: ' + metodo, 'Base depreciable: $' + depreciable.toLocaleString(isAr ? 'es-AR' : 'en-US')],
                chart(canvas) {
                    FinanzasVisual.depreciacion(canvas, tabla, metodo);
                }
            };
        }
    },
    tabla_amort: {
        title: 'Tabla de Amortización Francesa',
        formula: 'Cuota = P × i(1+i)^n / ((1+i)^n-1)',
        fields: [
            { id: 'capital', label: 'Capital ($)', val: '1000000' },
            { id: 'tna', label: 'TNA (%)', val: '90' },
            { id: 'plazo', label: 'Plazo (meses)', val: '12' }
        ],
        calc(f) {
            let P = parseFloat(f.capital.value);
            let TNA = parseFloat(f.tna.value) / 100;
            let N = parseInt(f.plazo.value);
            let isAr = document.getElementById('modo-ar')?.checked || false;
            let locale = isAr ? 'es-AR' : 'en-US';
            if (isNaN(P) || isNaN(TNA) || isNaN(N) || N <= 0) return null;
            let i = TNA / 12;
            if (i <= 0) return { error: true, msg: "La tasa debe ser mayor a 0", label: "Error" };
            let cuota = P * i * Math.pow(1 + i, N) / (Math.pow(1 + i, N) - 1);
            let saldo = P;
            let tabla = [];
            let totalInteres = 0;
            for (let m = 1; m <= N; m++) {
                let interes = saldo * i;
                let amort = cuota - interes;
                saldo -= amort;
                totalInteres += interes;
                tabla.push({ mes: m, cuota: cuota, interes: interes, amort: amort, saldo: Math.max(saldo, 0) });
            }
            let extras = tabla.slice(0, 6).map(function(t) {
                return { cls: 'info', txt: `Mes ${t.mes}: $${t.cuota.toLocaleString(locale, {maximumFractionDigits:0})} (Int: $${t.interes.toLocaleString(locale, {maximumFractionDigits:0})} / Amort: $${t.amort.toLocaleString(locale, {maximumFractionDigits:0})})` };
            });
            if (tabla.length > 6) extras.push({ cls: 'info', txt: `... y ${tabla.length - 6} meses más` });
            return {
                main: `$${cuota.toLocaleString(locale, {maximumFractionDigits:2})}/mes`,
                label: 'Cuota fija mensual',
                extras: [
                    { cls: 'ok', txt: `Total intereses: $${totalInteres.toLocaleString(locale, {maximumFractionDigits:0})}` },
                    { cls: 'info', txt: `Total a pagar: $${(cuota * N).toLocaleString(locale, {maximumFractionDigits:0})}` }
                ].concat(extras),
                steps: ['Cuota = ' + P.toLocaleString(locale) + ' ? ' + (i*100).toFixed(2) + '% ? (1+' + (i*100).toFixed(2) + '%)^' + N + ' / ((1+' + (i*100).toFixed(2) + '%)^' + N + '-1)'],
                chart(canvas) {
                    FinanzasVisual.tablaAmort(canvas, tabla, P);
                }
            };
        }
    },
    roi: {
        title: 'ROI y Rentabilidad',
        formula: 'ROI = (Ganancia - Inversión) / Inversión × 100',
        fields: [
            { id: 'inv_roi', label: 'Inversión Inicial ($)', val: '500000' },
            { id: 'flujo_anual', label: 'Flujo de Caja Anual ($)', val: '150000' },
            { id: 'anios_roi', label: 'Horizonte (años)', val: '5' },
            { id: 'tasa_desc', label: 'Tasa Descuento (%)', val: '12' }
        ],
        calc(f) {
            let inv = parseFloat(f.inv_roi.value);
            let flujo = parseFloat(f.flujo_anual.value);
            let anios = parseInt(f.anios_roi.value);
            let tasa = parseFloat(f.tasa_desc.value) / 100;
            let isAr = document.getElementById('modo-ar')?.checked || false;
            let locale = isAr ? 'es-AR' : 'en-US';
            if (isNaN(inv) || isNaN(flujo) || isNaN(anios) || isNaN(tasa) || inv <= 0) return null;
            let retornoTotal = flujo * anios;
            let gananciaNeta = retornoTotal - inv;
            let roi = (gananciaNeta / inv) * 100;
            let payback = inv / flujo;
            let van = -inv;
            for (let t = 1; t <= anios; t++) van += flujo / Math.pow(1 + tasa, t);
            let roiAnual = (Math.pow(1 + roi / 100, 1 / anios) - 1) * 100;
            return {
                main: `${roi.toFixed(1)}%`,
                label: 'ROI Total del Proyecto',
                extras: [
                    { cls: roi >= 0 ? 'ok' : 'danger', txt: roi >= 0 ? (isAr ? 'Rentabilidad positiva sobre CER.' : 'Rentabilidad positiva ✔') : (isAr ? 'Pérdida proyectada contra inflación.' : 'Pérdida proyectada ?') },
                    { cls: 'info', txt: `Retorno total: $${retornoTotal.toLocaleString(locale, {maximumFractionDigits:0})}` },
                    { cls: 'info', txt: `Payback (recupero): ${payback.toFixed(1)} años` },
                    { cls: 'info', txt: `VAN (al ${(tasa*100).toFixed(0)}%): $${van.toLocaleString(locale, {maximumFractionDigits:0})}` },
                    { cls: 'info', txt: `ROI anual equivalente: ${roiAnual.toFixed(1)}%` }
                ],
                steps: ['Ganancia neta = ' + retornoTotal.toLocaleString(locale) + ' - ' + inv.toLocaleString(locale), 'ROI = (' + gananciaNeta.toLocaleString(locale) + ' / ' + inv.toLocaleString(locale) + ') × 100'],
                chart(canvas) {
                    FinanzasVisual.roi(canvas, inv, flujo, anios, roi);
                }
            };
        }
    },
    inflacion: {
        title: 'Ajuste por Inflación',
        formula: 'Valor Actual = Valor Histórico × (1 + p)^n',
        fields: [
            { id: 'valor_hist', label: 'Valor Histórico ($)', val: '100000' },
            { id: 'inflacion_mensual', label: 'Inflación Mensual (%)', val: '3' },
            { id: 'meses', label: 'Período (meses)', val: '12' }
        ],
        calc(f) {
            let vh = parseFloat(f.valor_hist.value);
            let pi = parseFloat(f.inflacion_mensual.value) / 100;
            let n = parseInt(f.meses.value);
            let isAr = document.getElementById('modo-ar')?.checked || false;
            let locale = isAr ? 'es-AR' : 'en-US';
            if (isNaN(vh) || isNaN(pi) || isNaN(n) || vh <= 0) return null;
            let va = vh * Math.pow(1 + pi, n);
            let poder_adq = 1 / Math.pow(1 + pi, n);
            return {
                main: `$${va.toLocaleString(locale, {maximumFractionDigits:2})}`,
                label: `Valor ajustado por inflación (${n} meses)`,
                extras: [
                    { cls: 'warn', txt: `Pérdida de poder adquisitivo: ${((1 - poder_adq) * 100).toFixed(1)}%` },
                    { cls: 'info', txt: `Inflación acumulada: ${((Math.pow(1 + pi, n) - 1) * 100).toFixed(1)}%` }
                ],
                steps: ['VA = ' + vh.toLocaleString(locale) + ' ? (1 + ' + (pi*100).toFixed(1) + '%)^' + n],
                chart(canvas) {
                    FinanzasVisual.inflacion(canvas, vh, pi, n, va);
                }
            };
        }
    }
};

// =============================================================================
// FINANZAS ESCOLARES (6) — Guard pattern
// =============================================================================
if (!FORMS.fin) FORMS.fin = {};
Object.assign(FORMS.fin, {

    // -------------------------------------------------------------------------
    // F10. INTERÉS SIMPLE
    // -------------------------------------------------------------------------
    interes_simple: {
        title: 'Interés Simple',
        formula: 'I = C × r × t',
        vars: [
            { id: 'i', label: 'Interés (I)' },
            { id: 'c', label: 'Capital (C)' },
            { id: 'r', label: 'Tasa (r)' },
            { id: 't', label: 'Tiempo (t)' }
        ],
        fields: [
            { id: 'capital', label: 'Capital ($)', val: '100000' },
            { id: 'rate', label: 'Tasa (% anual)', val: '10' },
            { id: 'time', label: 'Tiempo (años)', val: '3' }
        ],
        onChange(target, f) {
            Object.keys(f).forEach(k => { f[k].disabled = (k === target); if (k === target) f[k].value = ''; });
        },
        calc(f, target) {
            let C = parseFloat(f.capital.value);
            let r = parseFloat(f.rate.value) / 100;
            let t = parseFloat(f.time.value);
            let isAr = document.getElementById('modo-ar')?.checked || false;
            let locale = isAr ? 'es-AR' : 'en-US';
            if (target === 'i' || !target) {
                if (isNaN(C) || isNaN(r) || isNaN(t)) return null;
                let I = C * r * t;
                return {
                    main: `$${I.toLocaleString(locale, {maximumFractionDigits:2})}`,
                    label: 'Interés Simple',
                    extras: [
                        { cls: 'info', txt: `Capital: $${C.toLocaleString(locale, {maximumFractionDigits:0})}` },
                        { cls: 'ok', txt: `Monto final: $${(C + I).toLocaleString(locale, {maximumFractionDigits:2})}` }
                    ],
                    steps: [`I = ${C} × ${(r*100).toFixed(1)}% × ${t} = $${I.toFixed(2)}`],
                    chart(canvas) { FinanzasVisual.interesSimple(canvas, C, I, t); }
                };
            } else if (target === 'c') {
                let I = parseFloat(f.capital.value); // reuse field as I
                if (isNaN(I) || isNaN(r) || isNaN(t) || r === 0) return null;
                C = I / (r * t);
                return {
                    main: `$${C.toLocaleString(locale, {maximumFractionDigits:2})}`,
                    label: 'Capital Requerido',
                    steps: [`C = $${I} / (${(r*100).toFixed(1)}% × ${t})`],
                    chart(canvas) { FinanzasVisual.interesSimple(canvas, C, I, t); }
                };
            } else if (target === 'r') {
                let I = parseFloat(f.capital.value);
                if (isNaN(I) || isNaN(C) || isNaN(t) || C === 0 || t === 0) return null;
                r = I / (C * t) * 100;
                return {
                    main: `${r.toFixed(2)}%`,
                    label: 'Tasa de Interés',
                    steps: [`r = $${I} / ($${C} × ${t})`],
                    chart(canvas) { FinanzasVisual.interesSimple(canvas, C, I, t); }
                };
            }
            return null;
        }
    },

    // -------------------------------------------------------------------------
    // F11. INTERÉS COMPUESTO
    // -------------------------------------------------------------------------
    interes_compuesto: {
        title: 'Interés Compuesto',
        formula: 'M = C × (1 + r)^t',
        fields: [
            { id: 'capital', label: 'Capital ($)', val: '100000' },
            { id: 'rate', label: 'Tasa (% anual)', val: '10' },
            { id: 'time', label: 'Tiempo (años)', val: '5' }
        ],
        calc(f) {
            let C = parseFloat(f.capital.value);
            let r = parseFloat(f.rate.value) / 100;
            let t = parseFloat(f.time.value);
            let isAr = document.getElementById('modo-ar')?.checked || false;
            let locale = isAr ? 'es-AR' : 'en-US';
            if (isNaN(C) || isNaN(r) || isNaN(t)) return null;
            let M = C * Math.pow(1 + r, t);
            let interes = M - C;
            return {
                main: `$${M.toLocaleString(locale, {maximumFractionDigits:2})}`,
                label: 'Monto Compuesto',
                extras: [
                    { cls: 'info', txt: `Capital inicial: $${C.toLocaleString(locale, {maximumFractionDigits:0})}` },
                    { cls: 'ok', txt: `Interés ganado: $${interes.toLocaleString(locale, {maximumFractionDigits:2})}` }
                ],
                steps: [`M = ${C} × (1 + ${(r*100).toFixed(1)}%)^${t}`],
                chart(canvas) { FinanzasVisual.interesCompuesto(canvas, C, M, t); }
            };
        }
    },

    // -------------------------------------------------------------------------
    // F12. DESCUENTO SIMPLE
    // -------------------------------------------------------------------------
    descuento: {
        title: 'Descuento Simple',
        formula: 'D = N × d × t',
        fields: [
            { id: 'nominal', label: 'Valor Nominal ($)', val: '100000' },
            { id: 'discount', label: 'Tasa Descuento (%)', val: '8' },
            { id: 'time', label: 'Tiempo (años)', val: '2' }
        ],
        calc(f) {
            let N = parseFloat(f.nominal.value);
            let d = parseFloat(f.discount.value) / 100;
            let t = parseFloat(f.time.value);
            let isAr = document.getElementById('modo-ar')?.checked || false;
            let locale = isAr ? 'es-AR' : 'en-US';
            if (isNaN(N) || isNaN(d) || isNaN(t)) return null;
            let D = N * d * t;
            let valorEfectivo = N - D;
            return {
                main: `$${D.toLocaleString(locale, {maximumFractionDigits:2})}`,
                label: 'Descuento Total',
                extras: [
                    { cls: 'info', txt: `Valor efectivo: $${valorEfectivo.toLocaleString(locale, {maximumFractionDigits:2})}` },
                    { cls: 'ok', txt: `Tasa: ${(d*100).toFixed(1)}% anual` }
                ],
                steps: [`D = ${N} × ${(d*100).toFixed(1)}% × ${t}`],
                chart(canvas) { FinanzasVisual.descuento(canvas, N, D, valorEfectivo); }
            };
        }
    },

    // -------------------------------------------------------------------------
    // F13. SUELDO NETO
    // -------------------------------------------------------------------------
    sueldo_neto: {
        title: 'Sueldo Neto',
        formula: 'Neto = Bruto × (1 - descuento%)',
        fields: [
            { id: 'bruto', label: 'Sueldo Bruto ($)', val: '500000' },
            { id: 'descuento_pct', label: 'Descuentos (%)', val: '17' }
        ],
        calc(f) {
            let bruto = parseFloat(f.bruto.value);
            let pct = parseFloat(f.descuento_pct.value) / 100;
            let isAr = document.getElementById('modo-ar')?.checked || false;
            let locale = isAr ? 'es-AR' : 'en-US';
            if (isNaN(bruto) || isNaN(pct)) return null;
            let descuento = bruto * pct;
            let neto = bruto - descuento;
            return {
                main: `$${neto.toLocaleString(locale, {maximumFractionDigits:2})}`,
                label: 'Sueldo Neto',
                extras: [
                    { cls: 'info', txt: `Descuentos: $${descuento.toLocaleString(locale, {maximumFractionDigits:2})} (${(pct*100).toFixed(1)}%)` },
                    { cls: 'warn', txt: `Relación neto/bruto: ${(neto/bruto*100).toFixed(1)}%` }
                ],
                steps: [`Neto = ${bruto} × (1 - ${(pct*100).toFixed(1)}%)`],
                chart(canvas) { FinanzasVisual.sueldoNeto(canvas, bruto, neto, descuento); }
            };
        }
    },

    // -------------------------------------------------------------------------
    // F14. MARGEN BRUTO
    // -------------------------------------------------------------------------
    margen_bruto: {
        title: 'Margen Bruto',
        formula: 'Margen = (Ventas - Costo) / Ventas × 100',
        fields: [
            { id: 'ventas', label: 'Ventas Netas ($)', val: '1000000' },
            { id: 'costo', label: 'Costo de Ventas ($)', val: '600000' }
        ],
        calc(f) {
            let ventas = parseFloat(f.ventas.value);
            let costo = parseFloat(f.costo.value);
            let isAr = document.getElementById('modo-ar')?.checked || false;
            let locale = isAr ? 'es-AR' : 'en-US';
            if (isNaN(ventas) || isNaN(costo)) return null;
            if (ventas <= 0) return { error: true, msg: "Las ventas deben ser > 0", label: "Error" };
            let ganancia = ventas - costo;
            let margen = (ganancia / ventas) * 100;
            return {
                main: `${margen.toFixed(2)}%`,
                label: 'Margen Bruto',
                extras: [
                    { cls: ganancia >= 0 ? 'ok' : 'danger', txt: `Ganancia bruta: $${ganancia.toLocaleString(locale, {maximumFractionDigits:0})}` },
                    { cls: 'info', txt: `Costo representa ${(costo/ventas*100).toFixed(1)}% de ventas` }
                ],
                steps: [`Margen = (${ventas} - ${costo}) / ${ventas} × 100`],
                chart(canvas) { FinanzasVisual.margenBruto(canvas, ventas, costo, margen); }
            };
        }
    },

    // -------------------------------------------------------------------------
    // F15. TIR APROXIMADA (flujos simples)
    // -------------------------------------------------------------------------
    tir: {
        title: 'TIR Aproximada',
        formula: 'TIR ≈ (Flujo Anual / Inversión) × 100',
        fields: [
            { id: 'inversion', label: 'Inversión Inicial ($)', val: '500000' },
            { id: 'flujo_anual', label: 'Flujo Anual ($)', val: '150000' },
            { id: 'anios', label: 'Años', val: '5' }
        ],
        calc(f) {
            let inv = parseFloat(f.inversion.value);
            let flujo = parseFloat(f.flujo_anual.value);
            let anios = parseInt(f.anios.value);
            let isAr = document.getElementById('modo-ar')?.checked || false;
            let locale = isAr ? 'es-AR' : 'en-US';
            if (isNaN(inv) || isNaN(flujo) || isNaN(anios) || inv <= 0) return null;
            let retornoTotal = flujo * anios;
            let tirAprox = ((flujo * anios - inv) / inv) * 100;
            let payback = inv / flujo;
            let vanSimp = -inv;
            for (let t = 1; t <= anios; t++) vanSimp += flujo / Math.pow(1 + 0.12, t);
            return {
                main: `${tirAprox.toFixed(2)}%`,
                label: 'TIR Aproximada',
                extras: [
                    { cls: tirAprox > 0 ? 'ok' : 'danger', txt: tirAprox > 0 ? 'Rentabilidad positiva' : 'Proyecto no rentable' },
                    { cls: 'info', txt: `Payback: ${payback.toFixed(1)} años` },
                    { cls: 'info', txt: `VAN (12%): $${vanSimp.toLocaleString(locale, {maximumFractionDigits:0})}` }
                ],
                steps: [`TIR ≈ (${retornoTotal} - ${inv}) / ${inv} × 100`],
                chart(canvas) { FinanzasVisual.tir(canvas, inv, flujo, anios, tirAprox); }
            };
        }
    }
});

FORMS.fin.valor_futuro = {
    title: 'Valor Futuro (VF)',
    formula: 'VF = VP × (1 + i)ⁿ',
    fields: [
        { id: 'vp', label: 'Valor Presente ($)', val: '100000' },
        { id: 'tasa_vf', label: 'Tasa Interés (%)', val: '10' },
        { id: 'periodos', label: 'Períodos', val: '5' }
    ],
    calc(f) {
        let vp = parseFloat(f.vp.value);
        let i = parseFloat(f.tasa_vf.value) / 100;
        let n = parseFloat(f.periodos.value);
        let isAr = document.getElementById('modo-ar')?.checked || false;
        let locale = isAr ? 'es-AR' : 'en-US';
        if (isNaN(vp) || isNaN(i) || isNaN(n)) return null;
        let vf = vp * Math.pow(1 + i, n);
        let interes = vf - vp;
        return {
            main: `$${vf.toLocaleString(locale, {maximumFractionDigits:2})}`,
            label: 'Valor Futuro',
            extras: [
                { cls: 'info', txt: `Capital inicial: $${vp.toLocaleString(locale, {maximumFractionDigits:0})}` },
                { cls: 'ok', txt: `Interés total: $${interes.toLocaleString(locale, {maximumFractionDigits:2})}` }
            ],
            steps: [`VF = ${vp} × (1 + ${i*100}%)^${n}`],
            chart(canvas) { FinanzasVisual.valorFuturo(canvas, vp, vf, n); }
        };
    }
};

FORMS.fin.vpn_simple = {
    title: 'Valor Presente Neto Simplificado',
    formula: 'VAN = -I + Σ Flujo / (1+k)ᵗ',
    fields: [
        { id: 'inv_vpn', label: 'Inversión Inicial ($)', val: '300000' },
        { id: 'flujo1', label: 'Flujo Año 1 ($)', val: '100000' },
        { id: 'flujo2', label: 'Flujo Año 2 ($)', val: '120000' },
        { id: 'flujo3', label: 'Flujo Año 3 ($)', val: '140000' },
        { id: 'tasa_vpn', label: 'Tasa Descuento (%)', val: '12' }
    ],
    calc(f) {
        let inv = parseFloat(f.inv_vpn.value);
        let f1 = parseFloat(f.flujo1.value), f2 = parseFloat(f.flujo2.value), f3 = parseFloat(f.flujo3.value);
        let k = parseFloat(f.tasa_vpn.value) / 100;
        let isAr = document.getElementById('modo-ar')?.checked || false;
        let locale = isAr ? 'es-AR' : 'en-US';
        if (isNaN(inv) || isNaN(f1) || isNaN(f2) || isNaN(f3) || isNaN(k)) return null;
        let van = -inv + f1 / Math.pow(1 + k, 1) + f2 / Math.pow(1 + k, 2) + f3 / Math.pow(1 + k, 3);
        return {
            main: `$${van.toLocaleString(locale, {maximumFractionDigits:2})}`,
            label: 'VAN / VPN Simplificado (3 años)',
            extras: [
                van >= 0
                    ? { cls: 'ok', txt: isAr ? 'Proyecto factible (VAN ≥ 0)' : 'Proyecto viable (VAN ≥ 0)' }
                    : { cls: 'danger', txt: 'Proyecto no viable (VAN < 0)' }
            ],
            steps: ['VAN = -' + inv + ' + ' + f1 + '/(1+' + (k*100).toFixed(1) + '%) + ' + f2 + '/(1+' + (k*100).toFixed(1) + '%)² + ' + f3 + '/(1+' + (k*100).toFixed(1) + '%)³'],
            chart(canvas) { FinanzasVisual.vpnSimple(canvas, inv, [f1, f2, f3], van); }
        };
    }
};

FORMS.fin.payback = {
    title: 'Payback Period (Recupero)',
    formula: 'Payback = Inversión / Flujo Anual',
    fields: [
        { id: 'inv_pay', label: 'Inversión Inicial ($)', val: '500000' },
        { id: 'flujo_pay', label: 'Flujo de Caja Anual ($)', val: '125000' }
    ],
    calc(f) {
        let inv = parseFloat(f.inv_pay.value);
        let flujo = parseFloat(f.flujo_pay.value);
        let isAr = document.getElementById('modo-ar')?.checked || false;
        let locale = isAr ? 'es-AR' : 'en-US';
        if (isNaN(inv) || isNaN(flujo) || flujo <= 0) return null;
        let payback = inv / flujo;
        return {
            main: payback.toFixed(1) + ' años',
            label: 'Período de Recupero (Payback)',
            extras: [
                { cls: payback <= 3 ? 'ok' : payback <= 5 ? 'warn' : 'danger', txt: payback <= 3 ? 'Recupero rápido (≤3 años)' : payback <= 5 ? 'Recupero moderado (3-5 años)' : 'Recupero lento (>5 años)' },
                { cls: 'info', txt: `Inversión: $${inv.toLocaleString(locale, {maximumFractionDigits:0})}` },
                { cls: 'info', txt: `Flujo anual: $${flujo.toLocaleString(locale, {maximumFractionDigits:0})}` }
            ],
            steps: ['Payback = ' + inv + ' / ' + flujo],
            chart(canvas) { FinanzasVisual.payback(canvas, inv, flujo, payback); }
        };
    }
};

FORMS.fin.cuota_aleman = {
    title: 'Cuota Sistema Alemán',
    formula: 'Amort = C/n | Cuota_t = Amort + Saldo_t × i',
    fields: [
        { id: 'capital_al', label: 'Capital ($)', val: '1000000' },
        { id: 'tna_al', label: 'TNA (%)', val: '90' },
        { id: 'plazo_al', label: 'Plazo (meses)', val: '6' }
    ],
    calc(f) {
        let P = parseFloat(f.capital_al.value);
        let TNA = parseFloat(f.tna_al.value) / 100;
        let N = parseInt(f.plazo_al.value);
        let isAr = document.getElementById('modo-ar')?.checked || false;
        let locale = isAr ? 'es-AR' : 'en-US';
        if (isNaN(P) || isNaN(TNA) || isNaN(N) || N <= 0) return null;
        let i = TNA / 12;
        let amort = P / N;
        let saldo = P;
        let tabla = [];
        for (let m = 1; m <= N; m++) {
            let interes = saldo * i;
            let cuota = amort + interes;
            saldo -= amort;
            tabla.push({ mes: m, cuota, amort, interes, saldo: Math.max(saldo, 0) });
        }
        let extras = tabla.slice(0, 4).map(t => {
            return { cls: 'info', txt: `Mes ${t.mes}: Cuota $${t.cuota.toLocaleString(locale, {maximumFractionDigits:0})} (Int: $${t.interes.toLocaleString(locale, {maximumFractionDigits:0})})` };
        });
        if (tabla.length > 4) extras.push({ cls: 'info', txt: `... y ${tabla.length - 4} meses más` });
        return {
            main: `$${tabla[0].cuota.toLocaleString(locale, {maximumFractionDigits:2})} → $${tabla[N-1].cuota.toLocaleString(locale, {maximumFractionDigits:2})}`,
            label: 'Cuotas (1° → última) - Alemán',
            extras: extras,
            steps: ['Amortización constante = ' + P + ' / ' + N + ' = ' + amort.toLocaleString(locale, {maximumFractionDigits:2})],
            chart(canvas) { FinanzasVisual.cuotaAleman(canvas, tabla, P); }
        };
    }
};

FORMS.fin.cuota_americano = {
    title: 'Cuota Sistema Americano',
    formula: 'Interés = C × i cada período, Capital al final',
    fields: [
        { id: 'capital_am', label: 'Capital ($)', val: '1000000' },
        { id: 'tna_am', label: 'TNA (%)', val: '90' },
        { id: 'plazo_am', label: 'Plazo (meses)', val: '6' }
    ],
    calc(f) {
        let P = parseFloat(f.capital_am.value);
        let TNA = parseFloat(f.tna_am.value) / 100;
        let N = parseInt(f.plazo_am.value);
        let isAr = document.getElementById('modo-ar')?.checked || false;
        let locale = isAr ? 'es-AR' : 'en-US';
        if (isNaN(P) || isNaN(TNA) || isNaN(N) || N <= 0) return null;
        let i = TNA / 12;
        let interes = P * i;
        let totalPagar = P + interes * N;
        return {
            main: `$${interes.toLocaleString(locale, {maximumFractionDigits:2})}/mes`,
            label: 'Cuota (solo intereses) - Americano',
            extras: [
                { cls: 'info', txt: `Capital a pagar al final: $${P.toLocaleString(locale, {maximumFractionDigits:0})}` },
                { cls: 'warn', txt: `Total a pagar: $${totalPagar.toLocaleString(locale, {maximumFractionDigits:0})}` }
            ],
            steps: ['Interés período = ' + P + ' × ' + (i*100).toFixed(2) + '% = $' + interes.toLocaleString(locale, {maximumFractionDigits:2})],
            chart(canvas) { FinanzasVisual.cuotaAmericano(canvas, P, interes, N); }
        };
    }
};

