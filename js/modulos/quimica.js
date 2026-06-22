FORMS.quim = {

    // =========================================================================
    // 1. MOLARIDAD — Preparar solución
    // =========================================================================
    molar: {
        title: 'Preparar solución por molaridad',
        formula: 'm = M × V(L) × PM',
        vars: [
            { id: 'm_res', label: 'Masa (m)' },
            { id: 'mol', label: 'Molaridad (M)' },
            { id: 'vol', label: 'Volumen (V)' }
        ],
        fields: [
            { id: 'm_res', label: 'Masa (g)', val: '' },
            { id: 'mol', label: 'Molaridad (mol/L)', val: '0.9' },
            { id: 'vol', label: 'Volumen final (mL)', val: '250' },
            { id: 'pm', label: 'Peso molecular (g/mol)', val: '58.44' },
            { id: 'comp', label: 'Compuesto', val: 'NaCl', type: 'select', opts: [
                { v: '58.44', l: 'NaCl' }, { v: '40.00', l: 'NaOH' },
                { v: '36.46', l: 'HCl' }, { v: '98.08', l: 'H₂SO₄' },
                { v: '18.02', l: 'H₂O' }, { v: 'custom', l: 'Otro' }
            ]}
        ],
        onChange(target, f) {
            Object.keys(f).forEach(key => {
                if (key !== 'pm' && key !== 'comp') {
                    f[key].disabled = (key === target);
                    if (key === target) f[key].value = '';
                }
            });
        },
        calc(f, target) {
            let pm = parseFloat(f.pm.value);
            let compName = f.comp.options ? f.comp.options[f.comp.selectedIndex].text : 'Soluto';
            let main, label, steps = [], extras = [];
            let M_val, V_val, m_val;

            if (target === 'm_res' || !target) {
                M_val = parseFloat(f.mol.value); V_val = parseFloat(f.vol.value) / 1000;
                if (isNaN(M_val) || isNaN(V_val) || isNaN(pm)) return null;
                if (V_val <= 0 || M_val < 0 || pm <= 0) return { error: true, msg: "V, M y PM deben ser positivos", label: "Error" };
                m_val = M_val * V_val * pm;
                main = `${m_val.toFixed(4)} g`; label = `Masa de ${compName} requerida`;
                steps = [`m = M × V(L) × PM`, `m = ${M_val} × ${V_val}L × ${pm} = ${m_val.toFixed(4)} g`];
                extras = [{ cls: 'info', txt: `Moles: ${(M_val * V_val).toFixed(4)} mol` }, { cls: 'ok', txt: `Disolver en ${f.vol.value} mL` }];
            } else if (target === 'mol') {
                m_val = parseFloat(f.m_res.value); V_val = parseFloat(f.vol.value) / 1000;
                if (isNaN(m_val) || isNaN(V_val) || isNaN(pm) || V_val === 0 || pm === 0) return null;
                M_val = m_val / (V_val * pm);
                main = `${M_val.toFixed(4)} M`; label = 'Molaridad resultante';
                steps = [`M = m / (V(L) × PM)`, `M = ${m_val} / (${V_val}L × ${pm}) = ${M_val.toFixed(4)} M`];
            } else if (target === 'vol') {
                m_val = parseFloat(f.m_res.value); M_val = parseFloat(f.mol.value);
                if (isNaN(m_val) || isNaN(M_val) || isNaN(pm) || M_val === 0 || pm === 0) return null;
                V_val = (m_val / (M_val * pm)) * 1000;
                main = `${V_val.toFixed(1)} mL`; label = 'Volumen de solución';
                steps = [`V(L) = m / (M × PM)`, `V = ${m_val} / (${M_val} × ${pm}) = ${V_val.toFixed(1)} mL`];
            }

            let gMasa = parseFloat(f.m_res.value) || 0;
            let gVol = parseFloat(f.vol.value) || 0;
            let gMol = parseFloat(f.mol.value) || 0;
            return {
                main, label, steps, extras,
                chart(canvas) { QuimicaVisual.molaridad(canvas, gMasa, gVol, gMol, pm, compName); }
            };
        }
    },

    // =========================================================================
    // 2. pH / pOH — Escala de acidez con indicador
    // =========================================================================
    ph: {
        title: 'Cálculo de pH y pOH',
        formula: 'pH + pOH = 14  |  pH = −log₁₀[H⁺]',
        fields: [
            { id: 'ph', label: 'pH', val: '4.5' },
            { id: 'poh', label: 'pOH', val: '' },
            { id: 'h', label: '[H⁺] (mol/L)', val: '' },
            { id: 'tipo', label: 'Tipo', val: 'libre', type: 'select', opts: [
                { v: 'libre', l: 'Valor directo' },
                { v: 'fuerte', l: 'Ácido fuerte (H⁺ = C)' },
                { v: 'debil', l: 'Ácido débil (Ka)' }
            ]},
            { id: 'conc', label: 'Conc. ácido (M) (solo fuerte/débil)', val: '0.01' },
            { id: 'ka', label: 'Ka (solo ácido débil)', val: '1.8e-5' }
        ],
        onChange(target, f) {
            Object.keys(f).forEach(key => {
                if (!['tipo', 'conc', 'ka'].includes(key)) {
                    f[key].disabled = (key === target);
                    if (key === target) f[key].value = '';
                }
            });
            // Mostrar/ocultar campos según tipo
            const esLibre = f.tipo.value === 'libre';
            const esDebil = f.tipo.value === 'debil';
            f.conc.disabled = esLibre;
            f.ka.disabled = !esDebil;
            if (esLibre) { f.conc.value = ''; f.ka.value = ''; }
            if (!esDebil) f.ka.value = '';
        },
        calc(f, target) {
            let main, label, steps = [], extras = [];
            let tipo = f.tipo.value;
            let valPH = 7;

            const calcularDesdeTipo = () => {
                if (tipo === 'fuerte') {
                    let C = parseFloat(f.conc.value);
                    if (isNaN(C) || C <= 0) return null;
                    let H = C;
                    valPH = -Math.log10(H);
                    extras.push({ cls: 'info', txt: `[H⁺] = ${H.toExponential(3)} M` });
                    return { ph: valPH, h: H };
                } else if (tipo === 'debil') {
                    let C = parseFloat(f.conc.value), Ka = parseFloat(f.ka.value);
                    if (isNaN(C) || isNaN(Ka) || C <= 0 || Ka <= 0) return null;
                    let H = (-Ka + Math.sqrt(Ka * Ka + 4 * Ka * C)) / 2;
                    valPH = -Math.log10(H);
                    extras.push({ cls: 'info', txt: `[H⁺] = ${H.toExponential(3)} M (aprox. ácido débil)` });
                    return { ph: valPH, h: H };
                }
                return null;
            };

            if (target === 'ph' || !target) {
                if (f.poh.value !== '') {
                    let poh = parseFloat(f.poh.value);
                    if (isNaN(poh)) return null;
                    valPH = 14 - poh;
                    main = `pH = ${valPH.toFixed(2)}`;
                    steps = [`pH = 14 − pOH`, `pH = 14 − ${poh}`];
                } else if (f.h.value !== '') {
                    let h = parseFloat(f.h.value);
                    if (isNaN(h) || h <= 0) return null;
                    valPH = -Math.log10(h);
                    main = `pH = ${valPH.toFixed(2)}`;
                    steps = [`pH = −log₁₀[H⁺]`, `pH = −log₁₀(${h.toExponential(3)})`];
                } else if (tipo !== 'libre') {
                    let res = calcularDesdeTipo();
                    if (!res) return null;
                    valPH = res.ph;
                    main = `pH = ${valPH.toFixed(2)}`;
                    steps = [`pH = −log₁₀[H⁺]`];
                } else return null;
                label = 'pH de la solución';
            } else if (target === 'poh') {
                let ph = parseFloat(f.ph.value);
                if (isNaN(ph)) return null;
                valPH = ph;
                let poh = 14 - ph;
                main = `pOH = ${poh.toFixed(2)}`;
                steps = [`pOH = 14 − pH`, `pOH = 14 − ${ph}`];
            } else if (target === 'h') {
                let ph = parseFloat(f.ph.value);
                if (isNaN(ph)) return null;
                valPH = ph;
                let h = Math.pow(10, -ph);
                main = `${h.toExponential(4)} mol/L`;
                label = '[H⁺]';
                steps = [`[H⁺] = 10^(−pH)`, `[H⁺] = 10^(−${ph})`];
            }

            let estado = valPH < 7 ? 'Ácido' : valPH > 7 ? 'Alcalino' : 'Neutro';
            extras.push({ cls: valPH < 3 || valPH > 11 ? 'warn' : 'ok', txt: `${estado} (pH ${valPH.toFixed(2)})` });

            return {
                main, label, steps, extras,
                chart(canvas) { QuimicaVisual.ph(canvas, Math.max(0, Math.min(14, valPH))); }
            };
        }
    },

    // =========================================================================
    // 3. DILUCIÓN — C₁·V₁ = C₂·V₂
    // =========================================================================
    dilucion: {
        title: 'Dilución de Soluciones',
        formula: 'C₁ · V₁ = C₂ · V₂',
        vars: [
            { id: 'c1', label: 'Concentración Inicial (C₁)' },
            { id: 'v1', label: 'Volumen Inicial (V₁)' },
            { id: 'c2', label: 'Concentración Final (C₂)' },
            { id: 'v2', label: 'Volumen Final (V₂)' }
        ],
        fields: [
            { id: 'c1', label: 'C₁ inicial (M o %)', val: '12' },
            { id: 'v1', label: 'V₁ alícuota (mL)', val: '' },
            { id: 'c2', label: 'C₂ deseada (M o %)', val: '2' },
            { id: 'v2', label: 'V₂ final total (mL)', val: '500' }
        ],
        onChange(target, f) {
            Object.keys(f).forEach(key => {
                f[key].disabled = (key === target);
                if (key === target) f[key].value = '';
            });
        },
        calc(f, target) {
            let c1 = parseFloat(f.c1.value), v1 = parseFloat(f.v1.value);
            let c2 = parseFloat(f.c2.value), v2 = parseFloat(f.v2.value);
            let main, label, steps = [], extras = [];

            if (target === 'v1' || !target) {
                if (isNaN(c1) || isNaN(c2) || isNaN(v2) || c1 === 0) return null;
                v1 = (c2 * v2) / c1;
                main = `${v1.toFixed(2)} mL`; label = 'Volumen de alícuota (V₁)';
                steps = [`V₁ = (C₂ · V₂) / C₁`, `V₁ = (${c2} · ${v2}) / ${c1} = ${v1.toFixed(2)} mL`];
                extras.push({ cls: 'ok', txt: `Tomar ${v1.toFixed(2)} mL de stock y aforar a ${v2} mL` });
            } else if (target === 'c1') {
                if (isNaN(v1) || isNaN(c2) || isNaN(v2) || v1 === 0) return null;
                c1 = (c2 * v2) / v1;
                main = `${c1.toFixed(4)} M/%`; label = 'Concentración inicial requerida (C₁)';
                steps = [`C₁ = (C₂ · V₂) / V₁`, `C₁ = (${c2} · ${v2}) / ${v1} = ${c1.toFixed(4)}`];
            } else if (target === 'c2') {
                if (isNaN(c1) || isNaN(v1) || isNaN(v2) || v2 === 0) return null;
                c2 = (c1 * v1) / v2;
                main = `${c2.toFixed(4)} M/%`; label = 'Concentración final obtenida (C₂)';
                steps = [`C₂ = (C₁ · V₁) / V₂`, `C₂ = (${c1} · ${v1}) / ${v2} = ${c2.toFixed(4)}`];
                extras.push({ cls: 'info', txt: `Factor de dilución: 1:${(v2 / v1).toFixed(1)}` });
            } else if (target === 'v2') {
                if (isNaN(c1) || isNaN(v1) || isNaN(c2) || c2 === 0) return null;
                v2 = (c1 * v1) / c2;
                main = `${v2.toFixed(1)} mL`; label = 'Volumen final de solución (V₂)';
                steps = [`V₂ = (C₁ · V₁) / C₂`, `V₂ = (${c1} · ${v1}) / ${c2} = ${v2.toFixed(1)} mL`];
            }

            return {
                main, label, steps, extras,
                chart(canvas) { QuimicaVisual.dilucion(canvas, c1, v1, c2, v2); }
            };
        }
    },

    // =========================================================================
    // 4. NORMALIDAD — N = M × equivalentes
    // =========================================================================
    normalidad: {
        title: 'Normalidad de una Solución',
        formula: 'N = M × Equivalentes',
        vars: [
            { id: 'n_val', label: 'Normalidad (N)' },
            { id: 'm_val', label: 'Molaridad (M)' }
        ],
        fields: [
            { id: 'n_val', label: 'Normalidad (N)', val: '' },
            { id: 'm_val', label: 'Molaridad (M)', val: '0.5' },
            { id: 'eq', label: 'N° Equivalentes (H⁺ o OH⁻)', val: '2' }
        ],
        onChange(target, f) {
            f.n_val.disabled = (target === 'n_val');
            f.m_val.disabled = (target === 'm_val');
            if (target === 'n_val') f.n_val.value = '';
            if (target === 'm_val') f.m_val.value = '';
        },
        calc(f, target) {
            let eq = parseFloat(f.eq.value);
            if (eq <= 0) return { error: true, msg: "Equivalentes deben ser > 0", label: "Error" };
            let N, M;
            if (target === 'n_val') {
                M = parseFloat(f.m_val.value);
                N = M * eq;
                return {
                    main: `${N.toFixed(4)} N`, label: 'Normalidad', extras: [], steps: [`N = ${M} M × ${eq} eq`],
                    chart(canvas) { QuimicaVisual.normalidad(canvas, N, M, eq); }
                };
            }
            N = parseFloat(f.n_val.value);
            M = N / eq;
            return {
                main: `${M.toFixed(4)} M`, label: 'Molaridad Equivalente', extras: [], steps: [`M = ${N} N / ${eq} eq`],
                chart(canvas) { QuimicaVisual.normalidad(canvas, N, M, eq); }
            };
        }
    },

    // =========================================================================
    // 5. ESTEQUIOMETRÍA — Masa ↔ Moles
    // =========================================================================
    estequiometria: {
        title: 'Conversor Masa ↔ Moles',
        formula: 'n = m / PM',
        vars: [
            { id: 'n_mol', label: 'Moles (mol)' },
            { id: 'm_gr', label: 'Masa (g)' }
        ],
        fields: [
            { id: 'm_gr', label: 'Masa (g)', val: '' },
            { id: 'n_mol', label: 'Moles (mol)', val: '' },
            { id: 'pm_est', label: 'Peso Molecular (g/mol)', val: '58.44' }
        ],
        onChange(target, f) {
            f.n_mol.disabled = (target === 'n_mol');
            f.m_gr.disabled = (target === 'm_gr');
            if (target === 'n_mol') f.n_mol.value = '';
            if (target === 'm_gr') f.m_gr.value = '';
        },
        calc(f, target) {
            let PM = parseFloat(f.pm_est.value);
            if (PM <= 0) return { error: true, msg: "PM inválido", label: "Error" };
            let moles, masa;
            if (target === 'n_mol' || !target) {
                masa = parseFloat(f.m_gr.value);
                if (isNaN(masa)) return null;
                moles = masa / PM;
                let moleculas = moles * 6.022e23;
                return {
                    main: `${moles.toFixed(5)} mol`, label: 'Cantidad de sustancia',
                    extras: [
                        { cls: 'info', txt: `Partículas: ${moleculas.toExponential(4)}` },
                        { cls: 'ok', txt: `Átomos/moléculas: ${(moleculas / 1e23).toFixed(2)}×10²³` }
                    ],
                    steps: [`n = ${masa} g / ${PM} g/mol = ${moles.toFixed(5)} mol`],
                    chart(canvas) { QuimicaVisual.moles(canvas, moles, masa, PM); }
                };
            }
            moles = parseFloat(f.n_mol.value);
            if (isNaN(moles)) return null;
            masa = moles * PM;
            return {
                main: `${masa.toFixed(4)} g`, label: 'Masa calculada',
                extras: [], steps: [`m = ${moles} mol × ${PM} g/mol = ${masa.toFixed(4)} g`],
                chart(canvas) { QuimicaVisual.moles(canvas, moles, masa, PM); }
            };
        }
    },

    // =========================================================================
    // 6. GAS IDEAL — PV = nRT
    // =========================================================================
    gas: {
        title: 'Gas Ideal',
        formula: 'PV = nRT',
        fields: [
            { id: 'p', label: 'Presión', val: '' },
            { id: 'v', label: 'Volumen (L)', val: '' },
            { id: 'n', label: 'Moles (mol)', val: '1' },
            { id: 't', label: 'Temperatura (°C)', val: '25' },
            { id: 'u_p', label: 'Unidad', val: 'atm', type: 'select', opts: [
                { v: 'atm', l: 'Atmósferas (atm)' },
                { v: 'kpa', l: 'Kilopascales (kPa)' }
            ]}
        ],
        calc(f) {
            const R = f.u_p.value === 'atm' ? 0.08206 : 8.314;
            let P = parseFloat(f.p.value), V = parseFloat(f.v.value);
            let n = parseFloat(f.n.value), T = parseFloat(f.t.value) + 273.15;
            if (T <= 0) return { error: true, msg: "Temperatura bajo cero absoluto", label: "Error" };
            let result, label, steps = [];
            if (!isNaN(P) && !isNaN(V)) {
                n = P * V / (R * T);
                result = n.toFixed(5); label = 'Moles (n)';
                steps = [`n = PV/RT = ${P}×${V}/(${R}×${T.toFixed(1)})`];
            } else if (isNaN(P)) {
                P = n * R * T / V;
                result = P.toFixed(4); label = 'Presión';
                steps = [`P = nRT/V = ${n}×${R}×${T.toFixed(1)}/${V}`];
            } else {
                V = n * R * T / P;
                result = V.toFixed(4); label = 'Volumen (L)';
                steps = [`V = nRT/P = ${n}×${R}×${T.toFixed(1)}/${P}`];
            }
            return {
                main: `${result} ${isNaN(parseFloat(f.p.value)) && !isNaN(n) ? f.u_p.value : ''}`,
                label, extras: [], steps,
                chart(canvas) { QuimicaVisual.gasIdeal(canvas, P, V, n, T); }
            };
        }
    },

    // =========================================================================
    // 7. CONCENTRACIÓN PORCENTUAL — % p/p, % p/v, % v/v
    // =========================================================================
    porcentaje: {
        title: 'Concentración Porcentual',
        formula: '% = (masa soluto / volumen) × 100',
        vars: [
            { id: 'pct', label: '% Concentración' },
            { id: 'soluto', label: 'Masa soluto (g)' }
        ],
        fields: [
            { id: 'pct', label: '%', val: '' },
            { id: 'soluto', label: 'Masa soluto (g)', val: '' },
            { id: 'volumen', label: 'Volumen solución (mL)', val: '250' },
            { id: 'tipo_pct', label: 'Tipo', val: 'p_v', type: 'select', opts: [
                { v: 'p_v', l: '% peso/vol (g/mL)' },
                { v: 'p_p', l: '% peso/peso' },
                { v: 'v_v', l: '% vol/vol' }
            ]}
        ],
        onChange(target, f) {
            Object.keys(f).forEach(key => {
                if (!['tipo_pct', 'volumen'].includes(key)) {
                    f[key].disabled = (key === target);
                    if (key === target) f[key].value = '';
                }
            });
        },
        calc(f, target) {
            let tipo = f.tipo_pct.value;
            let vol = parseFloat(f.volumen.value);
            let main, label, steps = [], extras = [];

            if (target === 'soluto' || !target) {
                let pct = parseFloat(f.pct.value);
                if (isNaN(pct) || isNaN(vol) || vol === 0) return null;
                let soluto = (pct / 100) * vol;
                main = `${soluto.toFixed(4)} g`; label = 'Masa de soluto';
                steps = [`masa = (${pct}% / 100) × ${vol} mL`];
            } else {
                let soluto = parseFloat(f.soluto.value);
                if (isNaN(soluto) || isNaN(vol) || vol === 0) return null;
                let pct = (soluto / vol) * 100;
                main = `${pct.toFixed(3)} %`; label = 'Concentración';
                steps = [`% = (${soluto}g / ${vol}mL) × 100`];
                let tipoLabel = { p_v: 'p/v', p_p: 'p/p', v_v: 'v/v' }[tipo] || '';
                extras.push({ cls: 'info', txt: `% ${tipoLabel}` });
            }

            return {
                main, label, steps, extras,
                chart(canvas) {
                    let pct = parseFloat(f.pct.value) || (parseFloat(f.soluto.value) / vol * 100) || 0;
                    let sol = parseFloat(f.soluto.value) || (pct / 100 * vol) || 0;
                    QuimicaVisual.porcentaje(canvas, tipo, pct, sol, vol);
                }
            };
        }
    },

    // =========================================================================
    // 8. CALORIMETRÍA — Q = mcΔT
    // =========================================================================
    calor: {
        title: 'Calorimetría',
        formula: 'Q = m · c · ΔT',
        vars: [
            { id: 'q', label: 'Calor (Q)' },
            { id: 'm', label: 'Masa (m)' },
            { id: 'dt', label: 'ΔT' }
        ],
        fields: [
            { id: 'q', label: 'Q (J)', val: '' },
            { id: 'm', label: 'Masa (g)', val: '100' },
            { id: 'c', label: 'Calor específico (J/g°C)', val: '4.184' },
            { id: 'dt', label: 'ΔT (°C)', val: '' }
        ],
        onChange(target, f) {
            Object.keys(f).forEach(key => {
                if (key !== 'c') {
                    f[key].disabled = (key === target);
                    if (key === target) f[key].value = '';
                }
            });
        },
        calc(f, target) {
            let m = parseFloat(f.m.value), c = parseFloat(f.c.value);
            let Q = parseFloat(f.q.value), dT = parseFloat(f.dt.value);
            let main, label, steps = [];

            if (target === 'q' || !target) {
                if (isNaN(m) || isNaN(c) || isNaN(dT)) return null;
                Q = m * c * dT;
                main = `${Q.toFixed(2)} J`; label = dT > 0 ? 'Calor absorbido' : 'Calor liberado';
                steps = [`Q = ${m}g × ${c} J/g°C × (${dT}°C)`, `Q = ${Q.toFixed(2)} J`];
            } else if (target === 'm') {
                if (isNaN(Q) || isNaN(c) || isNaN(dT) || c === 0 || dT === 0) return null;
                m = Q / (c * dT);
                main = `${m.toFixed(4)} g`; label = 'Masa';
                steps = [`m = Q / (c · ΔT) = ${Q} / (${c} × ${dT})`];
            } else if (target === 'dt') {
                if (isNaN(Q) || isNaN(m) || isNaN(c) || m === 0 || c === 0) return null;
                dT = Q / (m * c);
                main = `${dT.toFixed(3)} °C`; label = 'Cambio de temperatura';
                steps = [`ΔT = Q / (m · c) = ${Q} / (${m} × ${c})`];
            }

            let ext = dT > 0 ? 'Endotérmico (absorbe calor)' : dT < 0 ? 'Exotérmico (libera calor)' : 'Sin cambio';
            return {
                main, label, steps,
                extras: [{ cls: dT !== 0 ? 'info' : 'ok', txt: ext }],
                chart(canvas) { QuimicaVisual.calor(canvas, Q, m, c, dT); }
            };
        }
    },

    // =========================================================================
    // 9. GASES COMBINADA — P₁V₁/T₁ = P₂V₂/T₂
    // =========================================================================
    gases_combinada: {
        title: 'Ley Combinada de Gases',
        formula: 'P₁·V₁ / T₁ = P₂·V₂ / T₂',
        fields: [
            { id: 'p1', label: 'P₁ (atm)', val: '1' },
            { id: 'v1', label: 'V₁ (L)', val: '2' },
            { id: 't1', label: 'T₁ (°C)', val: '25' },
            { id: 'p2', label: 'P₂ (atm)', val: '' },
            { id: 'v2', label: 'V₂ (L)', val: '' },
            { id: 't2', label: 'T₂ (°C)', val: '' }
        ],
        calc(f) {
            let P1 = parseFloat(f.p1.value), V1 = parseFloat(f.v1.value), T1 = parseFloat(f.t1.value) + 273.15;
            let P2 = parseFloat(f.p2.value), V2 = parseFloat(f.v2.value), T2 = parseFloat(f.t2.value);

            // Encontrar cuál es la incógnita
            let desconocidas = [isNaN(P2), isNaN(V2), isNaN(T2)];
            let count = desconocidas.filter(Boolean).length;
            if (count !== 1) return { error: true, msg: `Hay ${count} incógnitas. Debe haber exactamente 1.`, label: count > 1 ? 'Faltan datos' : 'Sin incógnita' };
            if (isNaN(P1) || isNaN(V1) || isNaN(T1) || T1 <= 0) return null;

            let main, label, steps = [], extras = [];

            if (isNaN(P2)) {
                T2 = parseFloat(f.t2.value) + 273.15;
                V2 = parseFloat(f.v2.value);
                if (isNaN(V2) || isNaN(T2) || T2 <= 0 || V2 === 0) return null;
                P2 = (P1 * V1 * T2) / (V2 * T1);
                main = `${P2.toFixed(4)} atm`; label = 'P₂';
                steps = [`P₂ = (P₁·V₁·T₂) / (V₂·T₁)`, `P₂ = (${P1}×${V1}×${T2.toFixed(1)}) / (${V2}×${T1.toFixed(1)})`];
            } else if (isNaN(V2)) {
                T2 = parseFloat(f.t2.value) + 273.15;
                if (isNaN(T2) || T2 <= 0 || P2 === 0) return null;
                V2 = (P1 * V1 * T2) / (P2 * T1);
                main = `${V2.toFixed(4)} L`; label = 'V₂';
                steps = [`V₂ = (P₁·V₁·T₂) / (P₂·T₁)`, `V₂ = (${P1}×${V1}×${T2.toFixed(1)}) / (${P2}×${T1.toFixed(1)})`];
            } else {
                V2 = parseFloat(f.v2.value);
                if (isNaN(V2) || P2 === 0 || V2 === 0) return null;
                T2 = (P2 * V2 * T1) / (P1 * V1);
                main = `${(T2 - 273.15).toFixed(2)} °C`; label = 'T₂';
                steps = [`T₂ = (P₂·V₂·T₁) / (P₁·V₁)`, `T₂ = (${P2}×${V2}×${T1.toFixed(1)}) / (${P1}×${V1})`];
                extras.push({ cls: 'info', txt: `T₂ absoluta: ${T2.toFixed(1)} K` });
            }

            return {
                main, label, steps, extras,
                chart(canvas) { QuimicaVisual.gasesCombinada(canvas, P1, V1, T1, P2, V2, T2); }
            };
        }
    },

    // =========================================================================
    // 10. EQUILIBRIO QUÍMICO — Kc = [B]/[A]
    // =========================================================================
    equilibrio: {
        title: 'Equilibrio Químico',
        formula: 'Kc = [B] / [A]  (A ⇌ B)',
        vars: [
            { id: 'kc', label: 'Kc' },
            { id: 'a_conc', label: '[A]' },
            { id: 'b_conc', label: '[B]' }
        ],
        fields: [
            { id: 'kc', label: 'Kc', val: '' },
            { id: 'a_conc', label: '[A] inicial (M)', val: '0.1' },
            { id: 'b_conc', label: '[B] inicial (M)', val: '' },
            { id: 'a_coef', label: 'Coef. A', val: '1' },
            { id: 'b_coef', label: 'Coef. B', val: '1' }
        ],
        onChange(target, f) {
            Object.keys(f).forEach(key => {
                if (!['a_coef', 'b_coef'].includes(key)) {
                    f[key].disabled = (key === target);
                    if (key === target) f[key].value = '';
                }
            });
        },
        calc(f, target) {
            let A0 = parseFloat(f.a_conc.value);
            let B0 = parseFloat(f.b_conc.value);
            let a = parseFloat(f.a_coef.value) || 1;
            let b = parseFloat(f.b_coef.value) || 1;
            let main, label, steps = [], extras = [];

            if (target === 'kc' || !target) {
                if (isNaN(A0) || isNaN(B0) || A0 === 0) return null;
                let Kc = Math.pow(B0, b) / Math.pow(A0, a);
                main = `${Kc.toFixed(6)}`; label = 'Kc';
                steps = [`Kc = [B]^${b} / [A]^${a}`, `Kc = (${B0}^${b}) / (${A0}^${a})`];
                if (Kc > 1) extras.push({ cls: 'ok', txt: 'Kc > 1: favorece productos (→)' });
                else if (Kc < 1) extras.push({ cls: 'warn', txt: 'Kc < 1: favorece reactivos (←)' });
                else extras.push({ cls: 'info', txt: 'Kc = 1: equilibrio perfecto' });
            } else if (target === 'a_conc') {
                if (isNaN(B0) || isNaN(parseFloat(f.kc.value))) return null;
                let Kc = parseFloat(f.kc.value);
                A0 = Math.pow(Math.pow(B0, b) / Kc, 1 / a);
                main = `${A0.toFixed(6)} M`; label = '[A] en equilibrio';
                steps = [`[A] = ([B]^${b} / Kc)^(1/${a})`];
            } else if (target === 'b_conc') {
                if (isNaN(A0) || isNaN(parseFloat(f.kc.value)) || A0 === 0) return null;
                let Kc = parseFloat(f.kc.value);
                B0 = Math.pow(Kc * Math.pow(A0, a), 1 / b);
                main = `${B0.toFixed(6)} M`; label = '[B] en equilibrio';
                steps = [`[B] = (Kc · [A]^${a})^(1/${b})`];
            }

            let Kc_val = parseFloat(f.kc.value) || (target === 'kc' ? parseFloat(main) : 0);
            let direc = Kc_val > 1 ? 1 : Kc_val < 1 ? -1 : 0;

            return {
                main, label, steps, extras,
                chart(canvas) { QuimicaVisual.equilibrio(canvas, Kc_val, A0, B0, direc); }
            };
        }
    }
};

if (!FORMS.quim) FORMS.quim = {};
Object.assign(FORMS.quim, {
    boyle: {
        title: 'Ley de Boyle-Mariotte',
        formula: 'P₁ · V₁ = P₂ · V₂',
        fields: [
            { id: 'p1', label: 'Presión inicial P₁ (atm)', val: '2' },
            { id: 'v1', label: 'Volumen inicial V₁ (L)', val: '3' },
            { id: 'p2', label: 'Presión final P₂ (atm)', val: '' },
            { id: 'v2', label: 'Volumen final V₂ (L)', val: '1' }
        ],
        calc(f) {
            let P1 = parseFloat(f.p1.value), V1 = parseFloat(f.v1.value);
            let P2 = parseFloat(f.p2.value), V2 = parseFloat(f.v2.value);
            let missP2 = isNaN(P2), missV2 = isNaN(V2);
            if (missP2 && missV2) return { error: true, msg: "Deje solo una incógnita (P₂ o V₂)", label: "Error" };
            if (isNaN(P1) || isNaN(V1) || P1 <= 0 || V1 <= 0) return null;
            let main, label;
            if (missP2) {
                if (isNaN(V2) || V2 === 0) return null;
                P2 = (P1 * V1) / V2;
                main = `${P2.toFixed(4)} atm`; label = 'Presión final P₂';
            } else {
                if (P2 === 0) return null;
                V2 = (P1 * V1) / P2;
                main = `${V2.toFixed(4)} L`; label = 'Volumen final V₂';
            }
            return {
                main, label,
                extras: [{ cls: 'info', txt: `P₁·V₁ = ${(P1 * V1).toFixed(4)}` }],
                steps: [`P₁·V₁ = ${P1}×${V1} = ${(P1 * V1).toFixed(4)}`, `Producto constante = ${(P2 * V2).toFixed(4)}`],
                chart(canvas) { QuimicaVisual.boyle(canvas, P1, V1, P2, V2); }
            };
        }
    },
    charles: {
        title: 'Ley de Charles',
        formula: 'V₁ / T₁ = V₂ / T₂',
        fields: [
            { id: 'v1', label: 'Volumen inicial V₁ (L)', val: '2' },
            { id: 't1', label: 'Temperatura inicial T₁ (°C)', val: '25' },
            { id: 't2', label: 'Temperatura final T₂ (°C)', val: '50' },
            { id: 'v2', label: 'Volumen final V₂ (L)', val: '' }
        ],
        calc(f) {
            let V1 = parseFloat(f.v1.value), T1 = parseFloat(f.t1.value) + 273.15;
            let T2 = parseFloat(f.t2.value) + 273.15;
            let V2 = parseFloat(f.v2.value);
            let missV2 = isNaN(V2);
            if (isNaN(V1) || isNaN(T1) || isNaN(T2) || V1 <= 0 || T1 <= 0 || T2 <= 0) return null;
            if (missV2) {
                V2 = (V1 * T2) / T1;
                return {
                    main: `${V2.toFixed(4)} L`, label: 'Volumen final V₂',
                    extras: [{ cls: 'info', txt: `Temperaturas: T₁=${T1.toFixed(1)}K, T₂=${T2.toFixed(1)}K` }],
                    steps: [`V₂ = V₁·T₂/T₁`, `V₂ = ${V1}×${T2.toFixed(1)}/${T1.toFixed(1)}`],
                    chart(canvas) { QuimicaVisual.charles(canvas, V1, T1, V2, T2); }
                };
            } else {
                let T2calc = (V2 * T1) / V1;
                return {
                    main: `${(T2calc - 273.15).toFixed(2)} °C`, label: 'Temperatura final T₂',
                    extras: [{ cls: 'info', txt: `T₂ absoluta: ${T2calc.toFixed(1)} K` }],
                    steps: [`T₂ = V₂·T₁/V₁`, `T₂ = ${V2}×${T1.toFixed(1)}/${V1}`],
                    chart(canvas) { QuimicaVisual.charles(canvas, V1, T1, V2, T2calc); }
                };
            }
        }
    },
    dalton: {
        title: 'Ley de Dalton (Presiones Parciales)',
        formula: 'P_total = Σ P_i  |  P_i = X_i · P_total',
        fields: [
            { id: 'fraccion_molar', label: 'Fracción molar (X)', val: '0.21' },
            { id: 'presion_total', label: 'Presión total (atm)', val: '1' }
        ],
        calc(f) {
            let X = parseFloat(f.fraccion_molar.value), PT = parseFloat(f.presion_total.value);
            if (isNaN(X) || isNaN(PT) || X < 0 || X > 1 || PT <= 0) return null;
            let Pi = X * PT;
            return {
                main: `${Pi.toFixed(4)} atm`,
                label: 'Presión parcial del gas',
                extras: [
                    { cls: 'info', txt: `Fracción molar: ${X}` },
                    { cls: 'ok', txt: `Presión total: ${PT.toFixed(2)} atm` }
                ],
                steps: [`P_i = X_i · P_total`, `P_i = ${X} × ${PT} = ${Pi.toFixed(4)} atm`],
                chart(canvas) { QuimicaVisual.dalton(canvas, X, PT, Pi); }
            };
        }
    },
    velocidad_reaccion: {
        title: 'Velocidad de Reacción',
        formula: 'v = k · [A]ⁿ',
        fields: [
            { id: 'k', label: 'Constante de velocidad (k)', val: '0.05' },
            { id: 'concentracion', label: '[A] (mol/L)', val: '0.5' },
            { id: 'orden', label: 'Orden de reacción (n)', type: 'select', opts: [{v:'0',l:'Orden 0'},{v:'1',l:'Orden 1'},{v:'2',l:'Orden 2'}] }
        ],
        calc(f) {
            let k = parseFloat(f.k.value), conc = parseFloat(f.concentracion.value), n = parseInt(f.orden.value);
            if (isNaN(k) || isNaN(conc) || k <= 0 || conc < 0) return null;
            let v = k * Math.pow(conc, n);
            let label = `v = ${k} × [${conc}]^${n}`;
            return {
                main: `${v.toExponential(4)} mol·L⁻¹·s⁻¹`,
                label: 'Velocidad de reacción',
                extras: [{ cls: 'info', txt: label }],
                steps: [`v = ${k} × ${conc}^${n}`, `v = ${v.toExponential(4)}`],
                chart(canvas) { QuimicaVisual.velocidad_reaccion(canvas, k, conc, n, v); }
            };
        }
    },
    numero_avogadro: {
        title: 'Número de Avogadro',
        formula: 'N = n · Nₐ  (Nₐ = 6.022×10²³)',
        fields: [
            { id: 'moles', label: 'Moles (n)', val: '1' }
        ],
        calc(f) {
            let n = parseFloat(f.moles.value);
            if (isNaN(n) || n < 0) return null;
            let Na = 6.022e23;
            let moleculas = n * Na;
            return {
                main: `${moleculas.toExponential(4)}`,
                label: 'Número de partículas/moléculas',
                extras: [
                    { cls: 'info', txt: `${n.toFixed(4)} mol × 6.022×10²³` },
                    { cls: 'ok', txt: `≈ ${(moleculas / 1e23).toFixed(2)}×10²³ moléculas` }
                ],
                steps: [`N = ${n} × 6.022×10²³`, `N = ${moleculas.toExponential(4)}`],
                chart(canvas) { QuimicaVisual.numero_avogadro(canvas, n, moleculas); }
            };
        }
    },
    // ---------------------------------------------------------------------
    // Q11. MASA MOLAR
    // ---------------------------------------------------------------------
    masa_molar: {
        title: 'Masa Molar',
        formula: 'M = m / n',
        fields: [
            { id: 'masa', label: 'Masa (g)', val: '36' },
            { id: 'moles', label: 'Moles (mol)', val: '0.5' }
        ],
        calc(f) {
            let m = parseFloat(f.masa.value), n = parseFloat(f.moles.value);
            if (isNaN(m) || isNaN(n) || n <= 0) return null;
            let M = m / n;
            return {
                main: `${M.toFixed(2)} g/mol`,
                label: 'Masa molar (M)',
                extras: [
                    { cls: 'info', txt: `M = ${m} / ${n} = ${M.toFixed(2)} g/mol` },
                    { cls: 'ok', txt: `1 mol pesa ${M.toFixed(2)} g` }
                ],
                steps: [`M = ${m} / ${n}`, `M = ${M.toFixed(2)} g/mol`],
                chart(c) { QuimicaVisual.masa_molar(c, m, n, M); }
            };
        }
    },
    // ---------------------------------------------------------------------
    // Q12. RENDIMIENTO DE REACCIÓN
    // ---------------------------------------------------------------------
    rendimiento: {
        title: 'Rendimiento de Reacción',
        formula: '%R = (Rreal / Rteórico) × 100',
        fields: [
            { id: 'real', label: 'Rendimiento real (g)', val: '15' },
            { id: 'teorico', label: 'Rendimiento teórico (g)', val: '20' }
        ],
        calc(f) {
            let real = parseFloat(f.real.value), teor = parseFloat(f.teorico.value);
            if (isNaN(real) || isNaN(teor) || teor <= 0) return null;
            let pct = (real / teor) * 100;
            return {
                main: `${pct.toFixed(2)}%`,
                label: 'Rendimiento',
                extras: [
                    { cls: pct < 50 ? 'warn' : pct < 80 ? 'info' : 'ok', txt: pct < 50 ? 'Bajo rendimiento (<50%)' : pct < 80 ? 'Rendimiento moderado' : 'Buen rendimiento (≥80%)' },
                    { cls: 'info', txt: `Se perdieron ${(teor - real).toFixed(2)} g` }
                ],
                steps: [`%R = ${real} / ${teor} × 100`, `%R = ${pct.toFixed(2)}%`],
                chart(c) { QuimicaVisual.rendimiento(c, real, teor, pct); }
            };
        }
    },
    // ---------------------------------------------------------------------
    // Q13. HENDERSON–HASSELBALCH (pH tampón)
    // ---------------------------------------------------------------------
    henderson: {
        title: 'Henderson–Hasselbalch',
        formula: 'pH = pKa + log([A⁻]/[HA])',
        fields: [
            { id: 'pka', label: 'pKa', val: '4.76' },
            { id: 'base', label: '[A⁻] (M)', val: '0.1' },
            { id: 'acido', label: '[HA] (M)', val: '0.1' }
        ],
        calc(f) {
            let pka = parseFloat(f.pka.value), base = parseFloat(f.base.value), acido = parseFloat(f.acido.value);
            if (isNaN(pka) || isNaN(base) || isNaN(acido) || base < 0 || acido <= 0) return null;
            let pH = pka + Math.log10(base / acido);
            return {
                main: `pH = ${pH.toFixed(2)}`,
                label: 'pH del tampón',
                extras: [
                    { cls: pH < 0 || pH > 14 ? 'warn' : 'info', txt: `Relación [A⁻]/[HA] = ${(base / acido).toFixed(4)}` },
                    { cls: 'ok', txt: `pKa = ${pka}  |  log([A⁻]/[HA]) = ${(Math.log10(base / acido)).toFixed(4)}` }
                ],
                steps: [`pH = ${pka} + log(${base}/${acido})`, `pH = ${pH.toFixed(2)}`],
                chart(c) { QuimicaVisual.henderson(c, pka, base, acido, pH); }
            };
        }
    },
    // ---------------------------------------------------------------------
    // Q14. LEY DE GRAHAM (EFUSIÓN)
    // ---------------------------------------------------------------------
    graham: {
        title: 'Ley de Graham (Efusión)',
        formula: 'v₁/v₂ = √(M₂/M₁)',
        fields: [
            { id: 'm1', label: 'Masa molar gas 1 (g/mol)', val: '32' },
            { id: 'm2', label: 'Masa molar gas 2 (g/mol)', val: '2' }
        ],
        calc(f) {
            let M1 = parseFloat(f.m1.value), M2 = parseFloat(f.m2.value);
            if (isNaN(M1) || isNaN(M2) || M1 <= 0 || M2 <= 0) return null;
            let ratio = Math.sqrt(M2 / M1);
            return {
                main: `v₁/v₂ = ${ratio.toFixed(4)}`,
                label: 'Relación de velocidades de efusión',
                extras: [
                    { cls: 'info', txt: `Gas 1 (M=${M1}) : Gas 2 (M=${M2})` },
                    { cls: ratio > 1 ? 'warn' : 'ok', txt: ratio > 1 ? 'Gas 1 es más rápido' : 'Gas 2 es más rápido' }
                ],
                steps: [`v₁/v₂ = √(${M2}/${M1})`, `v₁/v₂ = ${ratio.toFixed(4)}`],
                chart(c) { QuimicaVisual.graham(c, M1, M2, ratio); }
            };
        }
    },
    // ---------------------------------------------------------------------
    // Q15. ECUACIÓN DE ARRHENIUS
    // ---------------------------------------------------------------------
    arrhenius: {
        title: 'Ecuación de Arrhenius',
        formula: 'k = A·exp(−Ea/(R·T))',
        fields: [
            { id: 'ea', label: 'Ea (kJ/mol)', val: '50' },
            { id: 't', label: 'Temperatura (K)', val: '298' },
            { id: 'a', label: 'Factor A (s⁻¹)', val: '1e12' }
        ],
        calc(f) {
            let Ea = parseFloat(f.ea.value) * 1000, T = parseFloat(f.t.value), A = parseFloat(f.a.value);
            if (isNaN(Ea) || isNaN(T) || isNaN(A) || T <= 0 || A <= 0) return null;
            let R = 8.314;
            let k = A * Math.exp(-Ea / (R * T));
            return {
                main: `k = ${k.toExponential(4)} s⁻¹`,
                label: 'Constante de velocidad (Arrhenius)',
                extras: [
                    { cls: 'info', txt: `Ea = ${(Ea / 1000).toFixed(2)} kJ/mol, T = ${T} K` },
                    { cls: 'ok', txt: `Factor A = ${A.toExponential(3)} s⁻¹` }
                ],
                steps: [`k = ${A.toExponential(3)}·exp(−${(Ea/1000).toFixed(2)}×10³/(${R}×${T}))`, `k = ${k.toExponential(4)} s⁻¹`],
                chart(c) { QuimicaVisual.arrhenius(c, Ea, T, A, k); }
            };
        }
    }
});
