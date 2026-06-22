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
        onChange(target, f) {
            Object.keys(f).forEach(key => {
                f[key].disabled = (key === target);
                if (key === target) f[key].value = '';
            });
        },
        calc(f, target) {
            let main, label, steps = [], extras = [];
            let F_val, d_val, T_val;
            
            if (target === 't_res' || !target) {
                F_val = parseFloat(f.f_val.value);
                d_val = parseFloat(f.d_val.value);
                if (isNaN(F_val) || isNaN(d_val)) return null;
                if (F_val < 0 || d_val < 0) return { error: true, msg: "Fuerza y distancia deben ser positivas", label: "Error" };
                T_val = F_val * d_val;
                main = `${T_val.toFixed(2)} N·m`;
                label = 'Torque resultante';
                steps = [`T = ${F_val} N × ${d_val} m = ${T_val.toFixed(2)} N·m`];
            } else if (target === 'f_val') {
                T_val = parseFloat(f.t_res.value);
                d_val = parseFloat(f.d_val.value);
                if (isNaN(T_val) || isNaN(d_val)) return null;
                if (d_val === 0) return { error: true, msg: "La distancia no puede ser 0", label: "División por cero" };
                F_val = T_val / d_val;
                main = `${F_val.toFixed(2)} N`;
                label = 'Fuerza requerida';
                steps = [`F = ${T_val} N·m / ${d_val} m = ${F_val.toFixed(2)} N`];
            } else if (target === 'd_val') {
                T_val = parseFloat(f.t_res.value);
                F_val = parseFloat(f.f_val.value);
                if (isNaN(T_val) || isNaN(F_val)) return null;
                if (F_val === 0) return { error: true, msg: "La fuerza no puede ser 0", label: "División por cero" };
                d_val = T_val / F_val;
                main = `${d_val.toFixed(3)} m`;
                label = 'Distancia del brazo';
                steps = [`d = ${T_val} N·m / ${F_val} N = ${d_val.toFixed(3)} m`];
            }
            
            return { 
                main, label, extras, steps,
                chart(canvas) {
                    MecanicaVisual.torque(canvas, F_val, d_val);
                }
            };
        }
    },
    potencia: {
        title: 'Potencia, Torque y RPM',
        formula: 'P (HP) = (T × RPM) / 7162  |  P (W) = T × ω',
        vars: [{ id: 'p_res', label: 'Potencia (P)' }, { id: 't_val', label: 'Torque (T)' }, { id: 'rpm_val', label: 'Velocidad (RPM)' }],
        fields: [
            { id: 'p_res', label: 'Potencia (HP)', val: '' },
            { id: 't_val', label: 'Torque (N·m)', val: '150' },
            { id: 'rpm_val', label: 'Velocidad (RPM)', val: '3000' },
        ],
        onChange(target, f) {
            Object.keys(f).forEach(key => {
                f[key].disabled = (key === target);
                if (key === target) f[key].value = '';
            });
        },
        calc(f, target) {
            let main, label, steps = [], extras = [];
            let P, T_val, RPM_val, w;
            
            if (target === 'p_res' || !target) {
                T_val = parseFloat(f.t_val.value);
                RPM_val = parseFloat(f.rpm_val.value);
                if (isNaN(T_val) || isNaN(RPM_val)) return null;
                P = (T_val * RPM_val) / 7162;
                let watts = T_val * (RPM_val * 2 * Math.PI / 60);
                main = `${P.toFixed(2)} HP`;
                label = 'Potencia mecánica generada';
                extras = [{ cls: 'info', txt: `Equivale a ${(watts/1000).toFixed(1)} kW` }];
                steps = [`P (HP) = (${T_val} × ${RPM_val}) / 7162 = ${P.toFixed(2)} HP`];
            } else if (target === 't_val') {
                P = parseFloat(f.p_res.value);
                RPM_val = parseFloat(f.rpm_val.value);
                if (isNaN(P) || isNaN(RPM_val)) return null;
                if (RPM_val === 0) return { error: true, msg: "Las RPM no pueden ser 0", label: "División por cero" };
                T_val = (P * 7162) / RPM_val;
                main = `${T_val.toFixed(1)} N·m`;
                label = 'Torque efectivo';
                steps = [`T = (${P} HP × 7162) / ${RPM_val} RPM`];
            } else if (target === 'rpm_val') {
                P = parseFloat(f.p_res.value);
                T_val = parseFloat(f.t_val.value);
                if (isNaN(P) || isNaN(T_val)) return null;
                if (T_val === 0) return { error: true, msg: "El torque debe ser mayor a 0", label: "División por cero" };
                w = (P * 746) / T_val;
                RPM_val = (w * 60) / (2 * Math.PI);
                main = `${Math.round(RPM_val)} RPM`;
                label = 'Velocidad de giro requerida';
                steps = [`ω = (${P} HP × 746) / ${T_val} Nm`, `RPM = ω × 60 / 2π`];
            }
            
            return { 
                main, label, extras, steps,
                chart(canvas) {
                    MecanicaVisual.potencia(canvas, T_val, RPM_val);
                }
            };
        }
    },
    transmision: {
        title: 'Relación de Transmisión (Poleas/Engranajes)',
        formula: 'D1 × N1 = D2 × N2  |  R = D1 / D2',
        fields: [
            { id: 'd1', label: 'Diámetro/Dientes Conductora (Z1/D1)', val: '120' },
            { id: 'n1', label: 'Velocidad Entrada (N1 - RPM)', val: '1500' },
            { id: 'd2', label: 'Diámetro/Dientes Conducida (Z2/D2)', val: '60' }
        ],
        calc(f) {
            let d1 = parseFloat(f.d1.value), n1 = parseFloat(f.n1.value), d2 = parseFloat(f.d2.value);
            if (isNaN(d1) || isNaN(n1) || isNaN(d2) || d2 === 0) return null;

            let n2 = (d1 * n1) / d2;
            let r = d1 / d2;
            let tipo = r > 1 ? 'Multiplicador de velocidad' : r < 1 ? 'Reductor de velocidad' : 'Transmisión directa';

            return {
                main: `${Math.round(n2)} RPM`,
                label: 'Velocidad de Salida (N2)',
                extras: [
                    { cls: 'info', txt: `Relación de transmisión: R = ${r.toFixed(2)}:1` },
                    { cls: r > 1 ? 'ok' : 'warn', txt: `Efecto del sistema: ${tipo}` }
                ],
                steps: [`N2 = (${d1} × ${n1}) / ${d2}`],
                chart(canvas) {
                    MecanicaVisual.transmision(canvas, d1, n1, d2, n2);
                }
            };
        }
    },
    pascal: {
        title: 'Prensa Hidráulica (Ley de Pascal)',
        formula: 'F1 / A1 = F2 / A2  ➔  F2 = F1 × (A2 / A1)',
        fields: [
            { id: 'f1', label: 'Fuerza en Pistón 1 (F1 - Newtons)', val: '100' },
            { id: 'a1', label: 'Área Embolo Chico (A1 - cm²)', val: '10' },
            { id: 'a2', label: 'Área Embolo Grande (A2 - cm²)', val: '150' }
        ],
        calc(f) {
            let f1 = parseFloat(f.f1.value), a1 = parseFloat(f.a1.value), a2 = parseFloat(f.a2.value);
            if (isNaN(f1) || isNaN(a1) || isNaN(a2) || a1 === 0) return null;

            let f2 = f1 * (a2 / a1);
            let multiplicacion = a2 / a1;

            return {
                main: `${f2.toFixed(1)} N`,
                label: 'Fuerza Multiplicada de Salida (F2)',
                extras: [
                    { cls: 'ok', txt: `¡Fuerza multiplicada por x${multiplicacion.toFixed(1)} veces!` },
                    { cls: 'info', txt: `Presión interna del fluido: ${(f1 / a1).toFixed(2)} N/cm²` }
                ],
                steps: [`F2 = ${f1} N × (${a2} cm² / ${a1} cm²)`],
                chart(canvas) {
                    MecanicaVisual.pascal(canvas, f1, a1, f2, a2);
                }
            };
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
            let costoK = (L * P) / K;
            
            return {
                main: `${l100.toFixed(2)} L/100km`,
                label: 'Consumo promedio',
                extras: [
                    { cls: 'info', txt: `Costo por kilómetro: $${costoK.toFixed(2)}` },
                    { cls: 'ok', txt: `Gasto estimado cada 100 km: $${(l100 * P).toFixed(0)}` }
                ],
                steps: [`Rendimiento = (${L} L / ${K} km) × 100 = ${l100.toFixed(2)}`],
                chart(canvas) {
                    MecanicaVisual.consumo(canvas, l100);
                }
            };
        }
    }
};

if (!FORMS.mec) FORMS.mec = {};
Object.assign(FORMS.mec, {
    palanca: {
        title: 'Palanca',
        formula: 'F1 · d1 = F2 · d2',
        fields: [
            { id: 'f1', label: 'Fuerza 1 (F1 - N)', val: '50' },
            { id: 'd1', label: 'Brazo 1 (d1 - m)', val: '0.5' },
            { id: 'd2', label: 'Brazo 2 (d2 - m)', val: '1' }
        ],
        calc(f) {
            let f1 = parseFloat(f.f1.value), d1 = parseFloat(f.d1.value), d2 = parseFloat(f.d2.value);
            if (isNaN(f1) || isNaN(d1) || isNaN(d2)) return null;
            if (d2 === 0) return { error: true, msg: "d2 no puede ser 0", label: "División por cero" };
            let f2 = (f1 * d1) / d2;
            return {
                main: `${f2.toFixed(3)} N`, label: 'Fuerza resultante (F2)',
                extras: [], steps: [`F2 = (${f1} × ${d1}) / ${d2}`],
                chart(canvas) {
                    MecanicaVisual.palanca(canvas, f1, d1, f2, d2);
                }
            };
        }
    },
    polea: {
        title: 'Polea',
        formula: 'Polea fija: F = R | Polea móvil: F = R/2',
        fields: [
            { id: 'peso', label: 'Peso (R - N)', val: '100' },
            { id: 'tipo', label: 'Tipo', type: 'select', opts: [{ v: 'fija', l: 'Fija' }, { v: 'movil', l: 'Móvil' }] }
        ],
        calc(f) {
            let peso = parseFloat(f.peso.value);
            if (isNaN(peso)) return null;
            let tipo = f.tipo.value;
            let F = tipo === 'movil' ? peso / 2 : peso;
            return {
                main: `${F.toFixed(2)} N`, label: 'Fuerza necesaria (F)',
                extras: [{ cls: 'info', txt: `Tipo: ${tipo === 'movil' ? 'Móvil' : 'Fija'} — Ventaja mecánica: ${tipo === 'movil' ? '2' : '1'}` }],
                steps: [`F = ${tipo === 'movil' ? `${peso} / 2` : peso}`],
                chart(canvas) {
                    MecanicaVisual.polea(canvas, peso, tipo);
                }
            };
        }
    },
    plano_inclinado: {
        title: 'Plano Inclinado',
        formula: 'F = m · g · sin(θ)',
        fields: [
            { id: 'masa', label: 'Masa (kg)', val: '10' },
            { id: 'angulo', label: 'Ángulo (θ °)', val: '30' }
        ],
        calc(f) {
            let m = parseFloat(f.masa.value), ang = parseFloat(f.angulo.value);
            if (isNaN(m) || isNaN(ang)) return null;
            let g = 9.81;
            let F = m * g * Math.sin(ang * Math.PI / 180);
            let normal = m * g * Math.cos(ang * Math.PI / 180);
            return {
                main: `${F.toFixed(3)} N`, label: 'Fuerza paralela al plano',
                extras: [{ cls: 'info', txt: `Normal: ${normal.toFixed(3)} N` }],
                steps: [`F = ${m} × 9.81 × sin(${ang}°)`],
                chart(canvas) {
                    MecanicaVisual.plano_inclinado(canvas, m, ang, F);
                }
            };
        }
    },
    torno: {
        title: 'Torno',
        formula: 'F = (R · r) / L',
        fields: [
            { id: 'radio_manivela', label: 'Radio manivela (L)', val: '0.3' },
            { id: 'radio_cilindro', label: 'Radio cilindro (r)', val: '0.1' },
            { id: 'peso', label: 'Peso a levantar (R - N)', val: '500' }
        ],
        calc(f) {
            let L = parseFloat(f.radio_manivela.value), r = parseFloat(f.radio_cilindro.value), R = parseFloat(f.peso.value);
            if (isNaN(L) || isNaN(r) || isNaN(R)) return null;
            if (L === 0) return { error: true, msg: "Radio manivela no puede ser 0", label: "División por cero" };
            let F = (R * r) / L;
            return {
                main: `${F.toFixed(2)} N`, label: 'Fuerza aplicada (F)',
                extras: [{ cls: 'info', txt: `Ventaja mecánica: ${(L / r).toFixed(2)}:1` }],
                steps: [`F = (${R} × ${r}) / ${L}`],
                chart(canvas) {
                    MecanicaVisual.torno(canvas, L, r, R, F);
                }
            };
        }
    },
    velocidad_angular: {
        title: 'Velocidad Angular',
        formula: 'v = ω · r',
        fields: [
            { id: 'omega', label: 'Velocidad angular (ω - rad/s)', val: '10' },
            { id: 'radio', label: 'Radio (r - m)', val: '0.5' }
        ],
        calc(f) {
            let omega = parseFloat(f.omega.value), radio = parseFloat(f.radio.value);
            if (isNaN(omega) || isNaN(radio)) return null;
            let v = omega * radio;
            let rpm = (omega * 60) / (2 * Math.PI);
            return {
                main: `${v.toFixed(3)} m/s`, label: 'Velocidad lineal (v)',
                extras: [{ cls: 'info', txt: `${omega} rad/s equivale a ${rpm.toFixed(1)} RPM` }],
                steps: [`v = ${omega} × ${radio}`],
                chart(canvas) {
                    MecanicaVisual.velocidad_angular(canvas, omega, radio, v);
                }
            };
        }
    },
    rendimiento: {
        title: 'Rendimiento (Eficiencia)',
        formula: 'η = (Psalida / Pentrada) · 100',
        fields: [
            { id: 'psalida', label: 'Potencia de salida (Ps - W)', val: '800' },
            { id: 'pentrada', label: 'Potencia de entrada (Pe - W)', val: '1000' }
        ],
        calc(f) {
            let ps = parseFloat(f.psalida.value), pe = parseFloat(f.pentrada.value);
            if (isNaN(ps) || isNaN(pe)) return null;
            if (pe === 0) return { error: true, msg: "Potencia de entrada no puede ser 0", label: "División por cero" };
            let eta = (ps / pe) * 100;
            return {
                main: `${eta.toFixed(2)}%`, label: 'Rendimiento (η)',
                extras: [{ cls: eta > 100 ? 'warn' : eta < 50 ? 'warn' : 'ok', txt: eta > 100 ? 'Rendimiento > 100% (¿error?)' : eta < 50 ? 'Baja eficiencia' : 'Rendimiento aceptable' }],
                steps: [`η = (${ps} / ${pe}) × 100`],
                chart(canvas) {
                    MecanicaVisual.rendimiento(canvas, eta);
                }
            };
        }
    },
    hooke: {
        title: 'Ley de Hooke',
        formula: 'F = -k · x',
        fields: [
            { id: 'constante', label: 'Constante (k - N/m)', val: '200' },
            { id: 'deformacion', label: 'Deformación (x - m)', val: '0.05' }
        ],
        calc(f) {
            let k = parseFloat(f.constante.value), x = parseFloat(f.deformacion.value);
            if (isNaN(k) || isNaN(x)) return null;
            let F = k * x;
            return {
                main: `${F.toFixed(3)} N`, label: 'Fuerza elástica (F)',
                extras: [{ cls: 'info', txt: `Sentido opuesto a la deformación (F = -${F.toFixed(3)} N)` }],
                steps: [`F = ${k} × ${x}`],
                chart(canvas) {
                    MecanicaVisual.hooke(canvas, k, x, F);
                }
            };
        }
    },
    presion_solidos: {
        title: 'Presión en Sólidos',
        formula: 'P = F / A',
        fields: [
            { id: 'fuerza', label: 'Fuerza (F - N)', val: '500' },
            { id: 'area', label: 'Área (A - m²)', val: '0.05' }
        ],
        calc(f) {
            let F = parseFloat(f.fuerza.value), A = parseFloat(f.area.value);
            if (isNaN(F) || isNaN(A)) return null;
            if (A === 0) return { error: true, msg: "Área no puede ser 0", label: "División por cero" };
            let P = F / A;
            return {
                main: `${P.toFixed(2)} Pa`, label: 'Presión ejercida',
                extras: [{ cls: 'info', txt: `Equivale a ${(P / 100000).toFixed(4)} MPa` }],
                steps: [`P = ${F} / ${A}`],
                chart(canvas) {
                    MecanicaVisual.presion_solidos(canvas, F, A, P);
                }
            };
        }
    },
    esfuerzo_deformacion: {
        title: 'Esfuerzo y Deformación',
        formula: 'σ = F/A | ε = ΔL/L₀',
        fields: [
            { id: 'fuerza', label: 'Fuerza (F - N)', val: '1000' },
            { id: 'area', label: 'Área sección (A - m²)', val: '0.01' },
            { id: 'delta_l', label: 'Alargamiento (ΔL - m)', val: '0.002' },
            { id: 'l0', label: 'Longitud inicial (L₀ - m)', val: '1' }
        ],
        calc(f) {
            let F = parseFloat(f.fuerza.value), A = parseFloat(f.area.value);
            let dL = parseFloat(f.delta_l.value), L0 = parseFloat(f.l0.value);
            if (isNaN(F) || isNaN(A) || isNaN(dL) || isNaN(L0)) return null;
            if (A === 0 || L0 === 0) return { error: true, msg: "Área y L₀ deben ser > 0", label: "División por cero" };
            let sigma = F / A;
            let epsilon = dL / L0;
            return {
                main: `σ = ${sigma.toFixed(2)} Pa`, label: 'Esfuerzo aplicado',
                extras: [{ cls: 'info', txt: `Deformación (ε) = ${epsilon.toFixed(6)} (${(epsilon*100).toFixed(4)}%)` }],
                steps: [`σ = ${F} / ${A}`, `ε = ${dL} / ${L0}`],
                chart(canvas) {
                    MecanicaVisual.esfuerzo_deformacion(canvas, sigma, epsilon);
                }
            };
        }
    },
    engranajes: {
        title: 'Engranajes',
        formula: 'Relación = N1 / N2',
        fields: [
            { id: 'n1', label: 'Dientes rueda 1 (N1)', val: '40' },
            { id: 'n2', label: 'Dientes rueda 2 (N2)', val: '20' }
        ],
        calc(f) {
            let n1 = parseFloat(f.n1.value), n2 = parseFloat(f.n2.value);
            if (isNaN(n1) || isNaN(n2)) return null;
            if (n2 === 0) return { error: true, msg: "N2 no puede ser 0", label: "División por cero" };
            let relacion = n1 / n2;
            let tipo = relacion > 1 ? 'Multiplicador' : relacion < 1 ? 'Reductor' : 'Directa';
            return {
                main: `${relacion.toFixed(3)}:1`, label: 'Relación de transmisión',
                extras: [{ cls: 'info', txt: `Tipo: ${tipo} — N1 gira a ${relacion.toFixed(2)}× la velocidad de N2` }],
                steps: [`R = ${n1} / ${n2}`],
                chart(canvas) {
                    MecanicaVisual.engranajes(canvas, n1, n2, relacion);
                }
            };
        }
    }
});

FORMS.mec.energia_potencial = {
    title: 'Energía Potencial Gravitatoria',
    formula: 'Ep = m × g × h',
    fields: [
        { id: 'masa_ep', label: 'Masa (kg)', val: '10' },
        { id: 'altura_ep', label: 'Altura (m)', val: '5' }
    ],
    calc(f) {
        let m = parseFloat(f.masa_ep.value), h = parseFloat(f.altura_ep.value);
        if (isNaN(m) || isNaN(h)) return null;
        let g = 9.81;
        let ep = m * g * h;
        return {
            main: ep.toFixed(2) + ' J',
            label: 'Energía Potencial Gravitatoria',
            extras: [{ cls: 'info', txt: `Masa: ${m} kg | Altura: ${h} m | g: ${g} m/s²` }],
            steps: ['Ep = ' + m + ' × ' + g + ' × ' + h],
            chart(canvas) { MecanicaVisual.energiaPotencial(canvas, m, h, ep); }
        };
    }
};

FORMS.mec.cantidad_movimiento = {
    title: 'Cantidad de Movimiento (Momentum)',
    formula: 'p = m × v',
    fields: [
        { id: 'masa_cm', label: 'Masa (kg)', val: '5' },
        { id: 'vel_cm', label: 'Velocidad (m/s)', val: '20' }
    ],
    calc(f) {
        let m = parseFloat(f.masa_cm.value), v = parseFloat(f.vel_cm.value);
        if (isNaN(m) || isNaN(v)) return null;
        let p = m * v;
        return {
            main: p.toFixed(2) + ' kg·m/s',
            label: 'Cantidad de Movimiento (p)',
            extras: [{ cls: 'info', txt: `Masa: ${m} kg | Velocidad: ${v} m/s` }],
            steps: ['p = ' + m + ' × ' + v],
            chart(canvas) { MecanicaVisual.cantidadMovimiento(canvas, m, v, p); }
        };
    }
};

FORMS.mec.fuerza_centrifuga = {
    title: 'Fuerza Centrífuga (Aceleración Centrípeta)',
    formula: 'F = m × v² / r',
    fields: [
        { id: 'masa_fc', label: 'Masa (kg)', val: '2' },
        { id: 'vel_fc', label: 'Velocidad (m/s)', val: '10' },
        { id: 'radio_fc', label: 'Radio (m)', val: '3' }
    ],
    calc(f) {
        let m = parseFloat(f.masa_fc.value), v = parseFloat(f.vel_fc.value), r = parseFloat(f.radio_fc.value);
        if (isNaN(m) || isNaN(v) || isNaN(r)) return null;
        if (r === 0) return { error: true, msg: "El radio no puede ser 0", label: "División por cero" };
        let F = m * v * v / r;
        return {
            main: F.toFixed(2) + ' N',
            label: 'Fuerza Centrífuga (Fc)',
            extras: [
                { cls: 'info', txt: `m: ${m} kg | v: ${v} m/s | r: ${r} m` },
                { cls: 'ok', txt: `Acel. centrípeta: ${(v*v/r).toFixed(2)} m/s²` }
            ],
            steps: ['Fc = ' + m + ' × ' + v + '² / ' + r],
            chart(canvas) { MecanicaVisual.fuerzaCentrifuga(canvas, m, v, r, F); }
        };
    }
};

FORMS.mec.velocidad_tangencial = {
    title: 'Velocidad Tangencial',
    formula: 'v = ω × r',
    fields: [
        { id: 'omega_vt', label: 'Velocidad angular (ω - rad/s)', val: '15' },
        { id: 'radio_vt', label: 'Radio (r - m)', val: '0.8' }
    ],
    calc(f) {
        let omega = parseFloat(f.omega_vt.value), r = parseFloat(f.radio_vt.value);
        if (isNaN(omega) || isNaN(r)) return null;
        let v = omega * r;
        let rpm = (omega * 60) / (2 * Math.PI);
        return {
            main: v.toFixed(3) + ' m/s',
            label: 'Velocidad Tangencial (v)',
            extras: [
                { cls: 'info', txt: `ω: ${omega} rad/s (${rpm.toFixed(1)} RPM) | r: ${r} m` }
            ],
            steps: ['v = ' + omega + ' × ' + r],
            chart(canvas) { MecanicaVisual.velocidadTangencial(canvas, omega, r, v); }
        };
    }
};

FORMS.mec.aceleracion_angular = {
    title: 'Aceleración Angular',
    formula: 'α = Δω / Δt',
    fields: [
        { id: 'omega_inicial', label: 'Vel. angular inicial (ω₀ - rad/s)', val: '0' },
        { id: 'omega_final', label: 'Vel. angular final (ω₁ - rad/s)', val: '20' },
        { id: 'tiempo_aa', label: 'Tiempo (Δt - s)', val: '5' }
    ],
    calc(f) {
        let w0 = parseFloat(f.omega_inicial.value), w1 = parseFloat(f.omega_final.value), t = parseFloat(f.tiempo_aa.value);
        if (isNaN(w0) || isNaN(w1) || isNaN(t)) return null;
        if (t === 0) return { error: true, msg: "El tiempo no puede ser 0", label: "División por cero" };
        let alpha = (w1 - w0) / t;
        return {
            main: alpha.toFixed(3) + ' rad/s²',
            label: 'Aceleración Angular (α)',
            extras: [
                { cls: 'info', txt: `ω₀: ${w0} rad/s → ω₁: ${w1} rad/s en ${t} s` }
            ],
            steps: ['α = (' + w1 + ' - ' + w0 + ') / ' + t],
            chart(canvas) { MecanicaVisual.aceleracionAngular(canvas, w0, w1, t, alpha); }
        };
    }
};