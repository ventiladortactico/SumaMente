if (typeof FORMS === 'undefined') window.FORMS = {};
if (!FORMS.civil) FORMS.civil = {};

// Formulas originales + nuevas extendidas
Object.assign(FORMS.civil, {
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
            if (isNaN(L) || isNaN(A) || isNaN(E) || isNaN(D)) return null;
            if (L <= 0 || A <= 0 || E <= 0) return { error: true, msg: "Las dimensiones deben ser mayores a cero", label: "Error de entrada" };
            let V = L * A * E;
            let cemento = D * V * 1.1;
            let extras = [{ cls: 'info', txt: `Volumen total: ${V.toFixed(2)} m³` }];
            if (V > 0 && V < 0.05) extras.push({ cls: 'warn', txt: '¿Espesor correcto? El volumen es muy bajo.' });
            return { main: `${Math.ceil(cemento / 50)} bolsas`, label: 'Cemento (bolsas 50kg)', extras, steps: [`V = ${L} * ${A} * ${E}`] };
        }
    },
    caida: {
        title: 'Caída de Tensión Interactiva',
        formula: 'ΔV = 2·ρ·L·I / S',
        vars: [
            { id: 'dv', label: 'Caída de Tensión (ΔV)' },
            { id: 's', label: 'Sección del Cable (S)' },
            { id: 'l', label: 'Longitud Máxima (L)' }
        ],
        fields: [
            { id: 'dv', label: 'ΔV deseada/máx (V)', val: '' },
            { id: 'l', label: 'Longitud cable (m)', val: '50' },
            { id: 'i', label: 'Corriente (A)', val: '10' },
            { id: 's', label: 'Sección (mm²)', val: '2.5' },
            { id: 'vin', label: 'Voltaje de entrada (V)', val: '220' },
        ],
        onChange(target, f) {
            Object.keys(f).forEach(key => {
                if (['dv', 's', 'l'].includes(key)) {
                    f[key].disabled = (key === target);
                    if (key === target) f[key].value = '';
                }
            });
        },
        calc(f, target) {
            const rho = 0.0178;
            let main, label, steps = [], extras = [];
            let dV_val, L_val, I_val, S_val, Vin_val, pct_val;
            if (target === 'dv' || !target) {
                Vin_val = parseFloat(f.vin.value);
                L_val = parseFloat(f.l.value);
                I_val = parseFloat(f.i.value);
                S_val = parseFloat(f.s.value);
                if (isNaN(Vin_val) || isNaN(L_val) || isNaN(I_val) || isNaN(S_val)) return null;
                if (S_val === 0) return { error: true, msg: "La sección del cable no puede ser 0", label: "Error" };
                dV_val = (2 * rho * L_val * I_val) / S_val;
                if (dV_val >= Vin_val) return { error: true, msg: "La caída de tensión es mayor o igual al voltaje de entrada", label: "Circuito Inválido" };
                pct_val = (dV_val / Vin_val) * 100;
                main = `${dV_val.toFixed(2)} V`; label = 'Caída de Tensión';
                extras = [{ cls: pct_val < 3 ? 'ok' : 'warn', txt: pct_val < 3 ? 'Dentro de norma (<3%)' : 'Excede el 3% recomendado' }];
                steps = [`ΔV = (2 * 0.0178 * ${L_val} * ${I_val}) / ${S_val}`];
            } else if (target === 's') {
                dV_val = parseFloat(f.dv.value);
                L_val = parseFloat(f.l.value);
                I_val = parseFloat(f.i.value);
                if (isNaN(dV_val) || isNaN(L_val) || isNaN(I_val)) return null;
                if (dV_val <= 0) return { error: true, msg: "La caída de tensión debe ser mayor a cero", label: "Error" };
                S_val = (2 * rho * L_val * I_val) / dV_val;
                Vin_val = parseFloat(f.vin.value) || 220;
                pct_val = (dV_val / Vin_val) * 100;
                main = `${S_val.toFixed(2)} mm²`; label = 'Sección Mínima Requerida';
                steps = [`S = (2 * 0.0178 * ${L_val} * ${I_val}) / ${dV_val}`];
            } else if (target === 'l') {
                dV_val = parseFloat(f.dv.value);
                I_val = parseFloat(f.i.value);
                S_val = parseFloat(f.s.value);
                if (isNaN(dV_val) || isNaN(I_val) || isNaN(S_val)) return null;
                if (I_val <= 0) return { error: true, msg: "La corriente debe ser mayor a cero", label: "Error" };
                L_val = (dV_val * S_val) / (2 * rho * I_val);
                Vin_val = parseFloat(f.vin.value) || 220;
                pct_val = (dV_val / Vin_val) * 100;
                main = `${L_val.toFixed(1)} metros`; label = 'Longitud Máxima Permitida';
                steps = [`L = (${dV_val} * ${S_val}) / (2 * 0.0178 * ${I_val})`];
            }
            return { main, label, extras, steps, chart(c) { CivilVisual.caidaTension(c, L_val, I_val, rho, dV_val, pct_val); } };
        }
    },
    pendiente: {
        title: 'Pendientes y Desniveles',
        formula: 'Pendiente % = (Desnivel / Distancia) × 100',
        vars: [
            { id: 'p_pct', label: 'Pendiente (%)' },
            { id: 'h_des', label: 'Desnivel / Altura (h)' },
            { id: 'd_dist', label: 'Distancia Horizontal (d)' }
        ],
        fields: [
            { id: 'p_pct', label: 'Pendiente (%)', val: '2' },
            { id: 'h_des', label: 'Desnivel (m)', val: '' },
            { id: 'd_dist', label: 'Distancia Horizontal (m)', val: '20' }
        ],
        onChange(target, f) {
            Object.keys(f).forEach(key => {
                f[key].disabled = (key === target);
                if (key === target) f[key].value = '';
            });
        },
        calc(f, target) {
            let main, label, steps = [];
            let p_val, d_val, h_val;
            if (target === 'h_des') {
                p_val = parseFloat(f.p_pct.value);
                d_val = parseFloat(f.d_dist.value);
                if (isNaN(p_val) || isNaN(d_val)) return null;
                h_val = (p_val / 100) * d_val;
                main = `${h_val.toFixed(2)} m`; label = 'Desnivel / Caída requerida';
                steps = [`h = (${p_val} / 100) * ${d_val}`];
            } else if (target === 'p_pct') {
                h_val = parseFloat(f.h_des.value);
                d_val = parseFloat(f.d_dist.value);
                if (isNaN(h_val) || isNaN(d_val)) return null;
                if (d_val <= 0) return { error: true, msg: "La distancia horizontal debe ser mayor a cero", label: "División por cero" };
                p_val = (h_val / d_val) * 100;
                main = `${p_val.toFixed(2)}%`; label = 'Pendiente calculada';
                steps = [`% = (${h_val} / ${d_val}) * 100`];
            } else if (target === 'd_dist') {
                p_val = parseFloat(f.p_pct.value);
                h_val = parseFloat(f.h_des.value);
                if (isNaN(p_val) || isNaN(h_val)) return null;
                if (p_val === 0) return { error: true, msg: "La pendiente no puede ser 0 para calcular distancia", label: "División por cero" };
                d_val = h_val / (p_val / 100);
                main = `${d_val.toFixed(2)} m`; label = 'Distancia horizontal total';
                steps = [`d = ${h_val} / (${p_val} / 100)`];
            }
            return { main, label, extras: [], steps, chart(c) { CivilVisual.pendiente(c, d_val, h_val, p_val); } };
        }
    },

    // --- 11 Nuevas fórmulas técnicas de construcción ---

    asentamiento: {
        title: 'Asentamiento Elástico (Suelos)',
        formula: 'S = (q × B × (1 - ν²)) / Es',
        fields: [
            { id: 'q', label: 'Carga neta aplicada (kPa)', val: '150' },
            { id: 'b', label: 'Ancho de la zapata B (m)', val: '2' },
            { id: 'poisson', label: 'Relación de Poisson (ν)', val: '0.3' },
            { id: 'es', label: 'Módulo de Elasticidad Es (kPa)', val: '25000' }
        ],
        calc(f) {
            let q = parseFloat(f.q.value), b = parseFloat(f.b.value);
            let nu = parseFloat(f.poisson.value), Es = parseFloat(f.es.value);
            if (isNaN(q) || isNaN(b) || isNaN(nu) || isNaN(Es) || Es <= 0) return null;
            if (nu < 0 || nu > 0.5) return { error: true, msg: "Relación de Poisson debe estar entre 0 y 0.5", label: "Error Físico" };
            let S = (q * b * (1 - Math.pow(nu, 2))) / Es;
            let mm = S * 1000;
            return {
                main: `${mm.toFixed(2)} mm`,
                label: 'Asentamiento Estimado',
                extras: [{ cls: mm > 25 ? 'danger' : 'ok', txt: mm > 25 ? 'Alerta: Supera el límite típico (25mm)' : 'Dentro de rangos admisibles estructurales' }],
                steps: [`S = (${q} × ${b} × (1 - ${nu}²)) / ${Es}`, `S = ${S.toFixed(5)} m`],
                chart(c) { CivilVisual.asentamiento(c, mm); }
            };
        }
    },

    flector: {
        title: 'Momento Flector Máximo',
        formula: 'M_max = (w × L²) / 8',
        fields: [
            { id: 'w', label: 'Carga Distribuida (kN/m)', val: '15' },
            { id: 'l', label: 'Longitud de la viga L (m)', val: '6' }
        ],
        calc(f) {
            let w = parseFloat(f.w.value), L = parseFloat(f.l.value);
            if (isNaN(w) || isNaN(L) || L <= 0) return null;
            let M = (w * Math.pow(L, 2)) / 8;
            return {
                main: `${M.toFixed(2)} kN·m`,
                label: 'Momento Máximo en el Centro',
                steps: [`M = (${w} × ${L}²) / 8`],
                chart(c) { CivilVisual.flector(c, L, M); }
            };
        }
    },

    ladrillos: {
        title: 'Cantidad de Ladrillos p/ Muro',
        formula: 'C = 1 / ((L + J) × (H + J))',
        fields: [
            { id: 'muro_a', label: 'Área del Muro (m²)', val: '12' },
            { id: 'l_lad', label: 'Largo del Ladrillo (cm)', val: '24' },
            { id: 'h_lad', label: 'Alto del Ladrillo (cm)', val: '12' },
            { id: 'junta', label: 'Espesor Junta de Mortero (cm)', val: '1.5' }
        ],
        calc(f) {
            let area = parseFloat(f.muro_a.value), l = parseFloat(f.l_lad.value) / 100;
            let h = parseFloat(f.h_lad.value) / 100, j = parseFloat(f.junta.value) / 100;
            if (isNaN(area) || isNaN(l) || isNaN(h) || isNaN(j) || area <= 0 || l <= 0 || h <= 0) return null;
            let cantPorM2 = 1 / ((l + j) * (h + j));
            let total = Math.ceil(cantPorM2 * area * 1.05);
            return {
                main: `${total} Unidades`,
                label: 'Total Ladrillos (inc. 5% desperdicio)',
                extras: [{ cls: 'info', txt: `Aproximadamente ${Math.round(cantPorM2)} ladrillos por m²` }],
                steps: [`Cant/m² = 1 / ((${l} + ${j}) × (${h} + ${j}))`],
                chart(c) { CivilVisual.ladrillos(c, total); }
            };
        }
    },

    terzaghi: {
        title: 'Esfuerzo Efectivo del Suelo',
        formula: 'σ\' = σ - u',
        fields: [
            { id: 'z', label: 'Profundidad del Estrato (m)', val: '5' },
            { id: 'gamma', label: 'Peso Específico Suelo (kN/m³)', val: '18' },
            { id: 'zw', label: 'Nivel Freático desde superficie (m)', val: '2' }
        ],
        calc(f) {
            let z = parseFloat(f.z.value), gamma = parseFloat(f.gamma.value), zw = parseFloat(f.zw.value);
            if (isNaN(z) || isNaN(gamma) || isNaN(zw) || z < 0) return null;
            let sigma_total = gamma * z;
            let u = 0;
            if (z > zw) u = (z - zw) * 9.81;
            let sigma_efectivo = sigma_total - u;
            return {
                main: `${sigma_efectivo.toFixed(1)} kPa`,
                label: 'Esfuerzo Efectivo (σ\')',
                extras: [{ cls: 'info', txt: `Presión de agua (u): ${u.toFixed(1)} kPa | Esfuerzo Total: ${sigma_total} kPa` }],
                steps: [`σ = ${gamma} × ${z}`, `u = (${z} - ${zw}) × 9.81`, `σ' = σ - u`],
                chart(c) { CivilVisual.terzaghi(c, z, zw); }
            };
        }
    },

    anclaje: {
        title: 'Longitud de Anclaje (Tracción)',
        formula: 'ld = (db × fy) / (2.1 × √f\'c)',
        fields: [
            { id: 'db', label: 'Diámetro de Barra (mm)', val: '12' },
            { id: 'fy', label: 'Fluencia Acero fy (MPa)', val: '420' },
            { id: 'fc', label: 'Resistencia Hormigón f\'c (MPa)', val: '25' }
        ],
        calc(f) {
            let db = parseFloat(f.db.value), fy = parseFloat(f.fy.value), fc = parseFloat(f.fc.value);
            if (isNaN(db) || isNaN(fy) || isNaN(fc) || fc <= 0) return null;
            let ld = (db * fy) / (2.1 * Math.sqrt(fc));
            let cm = ld / 10;
            return {
                main: `${cm.toFixed(1)} cm`,
                label: 'Longitud de desarrollo requerida',
                steps: [`ld = (${db} × ${fy}) / (2.1 × √${fc})`],
                chart(c) { CivilVisual.anclaje(c, cm); }
            };
        }
    },

    escorrentia: {
        title: 'Drenaje Pluvial (Método Racional)',
        formula: 'Q = (C × I × A) / 360',
        fields: [
            { id: 'c', label: 'Coef. Escorrentía C (ej: Asfalto=0.9)', val: '0.85' },
            { id: 'int', label: 'Intensidad de Lluvia I (mm/h)', val: '50' },
            { id: 'area', label: 'Área de la Cuenca A (Hectáreas)', val: '2.5' }
        ],
        calc(f) {
            let C = parseFloat(f.c.value), I = parseFloat(f.int.value), A = parseFloat(f.area.value);
            if (isNaN(C) || isNaN(I) || isNaN(A) || C < 0 || C > 1) return null;
            let Q = (C * I * A) / 360;
            return {
                main: `${Q.toFixed(3)} m³/s`,
                label: 'Caudal de diseño pluvial',
                extras: [{ cls: 'info', txt: `Equivale a: ${(Q * 1000).toFixed(0)} Litros por segundo` }],
                steps: [`Q = (${C} × ${I} × ${A}) / 360`],
                chart(c) { CivilVisual.escorrentia(c, Q); }
            };
        }
    },

    rankine: {
        title: 'Empuje Activo de Tierras (Rankine)',
        formula: 'Ka = tan²(45 - φ/2)',
        fields: [
            { id: 'h', label: 'Altura del Muro H (m)', val: '4' },
            { id: 'gamma', label: 'Peso del Suelo γ (kN/m³)', val: '17' },
            { id: 'phi', label: 'Ángulo Fricción Interna φ (°)', val: '30' }
        ],
        calc(f) {
            let H = parseFloat(f.h.value), gamma = parseFloat(f.gamma.value), phi = parseFloat(f.phi.value);
            if (isNaN(H) || isNaN(gamma) || isNaN(phi) || H <= 0) return null;
            let phiRad = phi * Math.PI / 180;
            let Ka = Math.pow(Math.tan((Math.PI / 4) - (phiRad / 2)), 2);
            let Pa = 0.5 * gamma * Math.pow(H, 2) * Ka;
            return {
                main: `${Pa.toFixed(2)} kN/m`,
                label: 'Empuje Total Activo',
                extras: [{ cls: 'info', txt: `Coeficiente Ka: ${Ka.toFixed(3)}` }],
                steps: [`Ka = tan²(45° - ${phi}°/2)`, `Pa = 0.5 × γ × H² × Ka`],
                chart(c) { CivilVisual.rankine(c, H, Pa); }
            };
        }
    },

    euler: {
        title: 'Carga Crítica de Pandeo (Euler)',
        formula: 'P_crit = (π² × E × I) / (K × L)²',
        fields: [
            { id: 'mod_e', label: 'Módulo elástico E (GPa)', val: '200' },
            { id: 'ine', label: 'Momento de Inercia I (cm⁴)', val: '4500' },
            { id: 'l', label: 'Longitud del Pilar L (m)', val: '4' },
            { id: 'k', label: 'Factor de fijación K (ej: bi-apoyado=1)', val: '1' }
        ],
        calc(f) {
            let E = parseFloat(f.mod_e.value) * 1e9, I = parseFloat(f.ine.value) * 1e-8;
            let L = parseFloat(f.l.value), K = parseFloat(f.k.value);
            if (isNaN(E) || isNaN(I) || isNaN(L) || isNaN(K) || L <= 0 || K <= 0) return null;
            let P_crit = (Math.PI * Math.PI * E * I) / Math.pow(K * L, 2);
            let kN = P_crit / 1000;
            return {
                main: `${kN.toFixed(1)} kN`,
                label: 'Carga Máxima sin Pandeo',
                steps: [`P_crit = (π² × E_Pa × I_m4) / (K × L)²`],
                chart(c) { CivilVisual.euler(c, kN); }
            };
        }
    },

    esponjamiento: {
        title: 'Esponjamiento de Suelos',
        formula: 'V_suelto = V_banco × (1 + E%)',
        fields: [
            { id: 'v_banco', label: 'Volumen en Banco/Excavación (m³)', val: '50' },
            { id: 'esp_pct', label: 'Porcentaje Esponjamiento (%)', val: '25' }
        ],
        calc(f) {
            let vb = parseFloat(f.v_banco.value), esp = parseFloat(f.esp_pct.value);
            if (isNaN(vb) || isNaN(esp) || vb < 0) return null;
            let vs = vb * (1 + (esp / 100));
            return {
                main: `${vs.toFixed(2)} m³`,
                label: 'Volumen de Transporte Requerido',
                extras: [{ cls: 'warn', txt: `Aumento neto de suelo suelto: ${(vs - vb).toFixed(2)} m³` }],
                steps: [`V_suelto = ${vb} × (1 + ${esp}/100)`],
                chart(c) { CivilVisual.esponjamiento(c, vb, vs); }
            };
        }
    },

    mortero: {
        title: 'Materiales para Mortero (m³)',
        formula: 'Proporción Volumétrica escogida',
        fields: [
            { id: 'vol_m', label: 'Volumen total requerido (m³)', val: '2' },
            { id: 'prop', label: 'Proporción Cemento:Arena', type: 'select', opts: [
                { v: '1-3', l: '1:3 — Revoques impermeables' },
                { v: '1-4', l: '1:4 — Muros portantes' },
                { v: '1-5', l: '1:5 — Revoques gruesos y mampostería interior' }
            ]}
        ],
        calc(f) {
            let V = parseFloat(f.vol_m.value), prop = f.prop.value;
            if (isNaN(V) || V <= 0) return null;
            let factorBolsas = prop === '1-3' ? 9.5 : prop === '1-4' ? 7.5 : 6.2;
            let factorArena = prop === '1-3' ? 1.05 : prop === '1-4' ? 1.10 : 1.15;
            let bolsas = Math.ceil(V * factorBolsas);
            let arena = V * factorArena;
            return {
                main: `${bolsas} Bolsas Cemento`,
                label: 'Dosificación (Bolsas de 50kg)',
                extras: [{ cls: 'ok', txt: `Arena fina/gruesa necesaria: ${arena.toFixed(2)} m³` }],
                steps: [`Bolsas ≈ V × ${factorBolsas}`, `Arena ≈ V × ${factorArena}`],
                chart(c) { CivilVisual.mortero(c, bolsas, arena); }
            };
        }
    },

    evaporacion: {
        title: 'Tasa de Evaporación de Agua',
        formula: 'Criterio ACI 305R (Simplificado)',
        fields: [
            { id: 't_amb', label: 'Temperatura Aire (°C)', val: '32' },
            { id: 'hr', label: 'Humedad Relativa (%)', val: '40' },
            { id: 'v_viento', label: 'Velocidad del Viento (km/h)', val: '20' }
        ],
        calc(f) {
            let Ta = parseFloat(f.t_amb.value), HR = parseFloat(f.hr.value), Vv = parseFloat(f.v_viento.value);
            if (isNaN(Ta) || isNaN(HR) || isNaN(Vv) || HR < 0 || HR > 100 || Vv < 0) return null;
            let satPress = 0.61078 * Math.exp((17.27 * Ta) / (Ta + 237.3));
            let vaporPress = satPress * (HR / 100);
            let E = 0.0015 * (satPress - vaporPress) * (1 + 0.12 * Vv);
            return {
                main: `${E.toFixed(3)} kg/m²/h`,
                label: 'Tasa de Pérdida de Humedad',
                extras: [E > 1.0
                    ? { cls: 'danger', txt: 'Riesgo Crítico: Excede 1.0 kg/m²/h. Fisuración por contracción plástica inminente. ¡Usar curado inmediato o retardantes!' }
                    : { cls: 'ok', txt: 'Pérdida moderada. Mantener monitoreo estándar del curado.' }
                ],
                steps: [`Presión sat. Vapor = ${satPress.toFixed(2)} kPa`, `E = 0.0015 × ΔP × (1 + 0.12 × Vviento)`],
                chart(c) { CivilVisual.evaporacion(c, E); }
            };
        }
    },

    // ─── FACTOR DE SEGURIDAD ─────────────────────────────────────────────
    factor_seguridad: {
        title: 'Factor de Seguridad (FS)',
        formula: 'FS = Resistencia / Esfuerzo aplicado',
        fields: [
            { id: 'resistencia', label: 'Resistencia del material', val: '250' },
            { id: 'esfuerzo', label: 'Esfuerzo aplicado', val: '100' }
        ],
        calc(f) {
            let R = parseFloat(f.resistencia.value);
            let E = parseFloat(f.esfuerzo.value);
            if (isNaN(R) || isNaN(E)) return null;
            if (E <= 0) return { error: true, msg: "El esfuerzo debe ser mayor a 0", label: "Error" };
            let FS = R / E;
            let cls = FS < 1 ? 'danger' : FS < 1.5 ? 'warn' : FS < 2 ? 'ok' : 'info';
            let msg = FS < 1 ? 'FALLA: FS < 1 — Estructuralmente inseguro' : FS < 1.5 ? 'Bajo: FS entre 1 y 1.5 — Riesgo moderado' : FS < 2 ? 'Aceptable: FS entre 1.5 y 2' : 'Seguro: FS ≥ 2 — Diseño conservador';
            return {
                main: `FS = ${FS.toFixed(3)}`,
                label: 'Factor de Seguridad',
                extras: [{ cls, txt: msg }],
                steps: [`FS = ${R} / ${E} = ${FS.toFixed(4)}`],
                chart(c) { CivilVisual.factor_seguridad(c, FS); }
            };
        }
    }
});

// =============================================================================
// CÓMPUTO Y REGULACIÓN (5)
// =============================================================================
Object.assign(FORMS.civil, {

    // -------------------------------------------------------------------------
    // C1. VOLUMEN DE EXCAVACIÓN
    // -------------------------------------------------------------------------
    excavacion: {
        title: 'Volumen de Excavación',
        formula: 'V = L × A × P (con talud)',
        fields: [
            { id: 'largo', label: 'Largo (m)', val: '10' },
            { id: 'ancho', label: 'Ancho (m)', val: '5' },
            { id: 'prof', label: 'Profundidad (m)', val: '3' },
            { id: 'talud', label: 'Talud (relación H:V, ej:1.5)', val: '1.5' }
        ],
        calc(f) {
            let L = parseFloat(f.largo.value), A = parseFloat(f.ancho.value);
            let P = parseFloat(f.prof.value), talud = parseFloat(f.talud.value);
            if (isNaN(L) || isNaN(A) || isNaN(P) || isNaN(talud) || L <= 0 || A <= 0 || P <= 0) return null;
            let Vrect = L * A * P;
            let exceso = (L + A) * 2 * (talud * P * P / 2);
            let Vtotal = Vrect + exceso;
            return {
                main: `${Vtotal.toFixed(2)} m³`,
                label: 'Volumen Total de Excavación',
                extras: [
                    { cls: 'info', txt: `Volumen recto: ${Vrect.toFixed(2)} m³` },
                    { cls: 'warn', txt: `Exceso por talud: ${exceso.toFixed(2)} m³ (${((exceso/Vtotal)*100).toFixed(1)}%)` }
                ],
                steps: [`V = ${L} × ${A} × ${P} + exceso por talud 1:${talud}`],
                chart(c) { CivilVisual.excavacion(c, L, A, P, Vtotal); }
            };
        }
    },

    // -------------------------------------------------------------------------
    // C2. CÓMPUTO DE PINTURA
    // -------------------------------------------------------------------------
    pintura: {
        title: 'Cómputo de Pintura',
        formula: 'Litros = (Área × Manos) / Rendimiento',
        fields: [
            { id: 'area', label: 'Área a pintar (m²)', val: '100' },
            { id: 'manos', label: 'N° de manos', val: '2' },
            { id: 'rend', label: 'Rendimiento (m²/L por mano)', val: '10' }
        ],
        calc(f) {
            let area = parseFloat(f.area.value), manos = parseFloat(f.manos.value), rend = parseFloat(f.rend.value);
            if (isNaN(area) || isNaN(manos) || isNaN(rend) || area <= 0 || manos < 1 || rend <= 0) return null;
            let litros = (area * manos) / rend;
            let latas1L = Math.ceil(litros);
            let latas4L = Math.ceil(litros / 4);
            return {
                main: `${litros.toFixed(2)} L`,
                label: 'Pintura requerida',
                extras: [
                    { cls: 'info', txt: `Compra sugerida: ${latas4L} × 4L (${latas4L * 4}L) o ${latas1L} × 1L` },
                    { cls: 'ok', txt: `Área total a pintar: ${(area * manos).toFixed(0)} m² (${manos} manos)` }
                ],
                steps: [`Litros = (${area} × ${manos}) / ${rend} = ${litros.toFixed(2)} L`],
                chart(c) { CivilVisual.pintura(c, area, manos, litros); }
            };
        }
    },

    // -------------------------------------------------------------------------
    // C3. DOSIFICACIÓN DE HORMIGÓN
    // -------------------------------------------------------------------------
    hormigon: {
        title: 'Dosificación de Hormigón',
        formula: 'Proporciones cemento, arena, piedra, agua',
        fields: [
            { id: 'vol', label: 'Volumen de hormigón (m³)', val: '1' },
            { id: 'prop', label: 'Dosificación', type: 'select', opts: [
                { v: 'H13', l: 'H-13 (1:3:4:0.6) — Cimientos' },
                { v: 'H17', l: 'H-17 (1:2:3:0.5) — Columnas/Vigas' },
                { v: 'H21', l: 'H-21 (1:2:2:0.45) — Losas/Armado' },
                { v: 'H30', l: 'H-30 (1:1.5:2:0.4) — Estructural alta' }
            ]}
        ],
        calc(f) {
            let V = parseFloat(f.vol.value), prop = f.prop.value;
            if (isNaN(V) || V <= 0) return null;
            let ratios = { H13: { cem: 1, arena: 3, piedra: 4, agua: 0.6, sum: 8.6, label: 'H-13' },
                          H17: { cem: 1, arena: 2, piedra: 3, agua: 0.5, sum: 6.5, label: 'H-17' },
                          H21: { cem: 1, arena: 2, piedra: 2, agua: 0.45, sum: 5.45, label: 'H-21' },
                          H30: { cem: 1, arena: 1.5, piedra: 2, agua: 0.4, sum: 4.9, label: 'H-30' } };
            let r = ratios[prop];
            let bolsas = Math.ceil((V / r.sum) * 350 / 50);
            let arena = (V / r.sum) * r.arena * 1.6;
            let piedra = (V / r.sum) * r.piedra * 1.6;
            let agua = (V / r.sum) * r.agua * 1000;
            return {
                main: `${bolsas} bolsas`,
                label: `Cemento (50kg) para ${r.label}`,
                extras: [
                    { cls: 'info', txt: `Arena: ${arena.toFixed(2)} m³` },
                    { cls: 'info', txt: `Piedra: ${piedra.toFixed(2)} m³` },
                    { cls: 'ok', txt: `Agua: ${agua.toFixed(0)} L` }
                ],
                steps: [`Dosificación ${r.label}: 1:${r.arena}:${r.piedra}:${r.agua}`],
                chart(c) { CivilVisual.hormigon(c, bolsas, arena, piedra, agua, r.label); }
            };
        }
    },

    // -------------------------------------------------------------------------
    // C4. CARGA MUERTA DE LOSA
    // -------------------------------------------------------------------------
    carga_muerta: {
        title: 'Carga Muerta de Losa',
        formula: 'CM = Σ (γᵢ × eᵢ)',
        fields: [
            { id: 'mat', label: 'Material', type: 'select', opts: [
                { v: 'ha', l: 'Hormigón armado (γ=25 kN/m³)' },
                { v: 'bloq', l: 'Bloque cerámico (γ=18 kN/m³)' },
                { v: 'acero', l: 'Acero (γ=78.5 kN/m³)' }
            ]},
            { id: 'espesor', label: 'Espesor (cm)', val: '15' },
            { id: 'carga_adicional', label: 'Carga adicional (kN/m²)', val: '1.5' }
        ],
        calc(f) {
            let mat = f.mat.value, espesor = parseFloat(f.espesor.value) / 100;
            let adic = parseFloat(f.carga_adicional.value);
            if (isNaN(espesor) || isNaN(adic) || espesor <= 0) return null;
            let gammas = { ha: 25, bloq: 18, acero: 78.5 };
            let gamma = gammas[mat];
            let CM = gamma * espesor + adic;
            let labels = { ha: 'Hormigón Armado', bloq: 'Bloque Cerámico', acero: 'Acero' };
            return {
                main: `${CM.toFixed(2)} kN/m²`,
                label: `Carga Muerta (${labels[mat]})`,
                extras: [
                    { cls: 'info', txt: `Peso propio: ${(gamma * espesor).toFixed(2)} kN/m²` },
                    { cls: 'ok', txt: `Carga adicional: ${adic.toFixed(2)} kN/m²` }
                ],
                steps: [`CM = ${gamma} × ${(espesor * 100).toFixed(0)}cm + ${adic}`],
                chart(c) { CivilVisual.carga_muerta(c, CM, mat, espesor); }
            };
        }
    },

    // -------------------------------------------------------------------------
    // C5. FOS / FOT — Índice de Ocupación del Suelo
    // -------------------------------------------------------------------------
    fos_fot: {
        title: 'FOS / FOT — Índices Urbanísticos',
        formula: 'FOS = SB/S  |  FOT = ST/S',
        fields: [
            { id: 's_terreno', label: 'Superficie del Terreno (m²)', val: '300' },
            { id: 'sb', label: 'Superficie cubierta PB (m²)', val: '120' },
            { id: 'st', label: 'Superficie total cubierta (m²)', val: '360' }
        ],
        calc(f) {
            let S = parseFloat(f.s_terreno.value), SB = parseFloat(f.sb.value), ST = parseFloat(f.st.value);
            if (isNaN(S) || isNaN(SB) || isNaN(ST) || S <= 0) return null;
            let FOS = SB / S;
            let FOT = ST / S;
            return {
                main: `FOS = ${FOS.toFixed(2)}  |  FOT = ${FOT.toFixed(2)}`,
                label: 'Índices de Ocupación',
                extras: [
                    { cls: FOS > 0.6 ? 'warn' : 'ok', txt: `FOS ${FOS.toFixed(2)} — ${FOS > 0.6 ? 'Alta ocupación (>0.6)' : 'Superficie ocupada: ${SB.toFixed(0)} m²'}` },
                    { cls: FOT > 2 ? 'warn' : 'ok', txt: `FOT ${FOT.toFixed(2)} — ${FOT > 2 ? 'Alta densidad (>2)' : 'Superficie total: ${ST.toFixed(0)} m²'}` }
                ],
                steps: [`FOS = ${SB} / ${S} = ${FOS.toFixed(3)}`, `FOT = ${ST} / ${S} = ${FOT.toFixed(3)}`],
                chart(c) { CivilVisual.fos_fot(c, S, SB, ST, FOS, FOT); }
            };
        }
    }
});