FORMS.fis = {
    velocidad: {
        title: 'Cinemática: Velocidad final',
        formula: 'vf = v0 + a·t',
        vars: [
            { id: 'vf', label: 'Velocidad Final (vf)' },
            { id: 'v0', label: 'Velocidad Inicial (v0)' },
            { id: 'a', label: 'Aceleración (a)' },
            { id: 't', label: 'Tiempo (t)' },
        ],
        fields: [
            { id: 'vf', label: 'V final (m/s)', val: '', type:'text' },
            { id: 'v0', label: 'V inicial (m/s)', val: '0', type:'text' },
            { id: 'a', label: 'Aceleración (m/s²)', val: '9.81', type:'text' },
            { id: 't', label: 'Tiempo (s)', val: '10', type:'text' }
        ],
        onChange(target, f) {
            Object.keys(f).forEach(key => {
                f[key].disabled = (key === target);
                if (key === target) f[key].value = '';
            });
        },
        calc(f, target) {
            let v0_val = parseFloat(f.v0.value.replace(',','.')) || 0;
            let a_val = parseFloat(f.a.value.replace(',','.')) || 9.81;
            let t_val = parseFloat(f.t.value.replace(',','.')) || 10;
            let vf = v0_val + a_val * t_val;
            let graphV0 = v0_val, graphA = a_val, graphT = t_val;
            return {
                main: `${vf.toFixed(2)} m/s`,
                label: 'Velocidad Final',
                chart(canvas) {
                    FisicaVisual.velocidad(canvas, graphV0, graphA, graphT);
                }
            };
        }
    },
    posicion_mruv: {
        title: 'Cinemática: Posición en MRUV',
        formula: 'x = x0 + v0·t + ½·a·t²',
        vars: [
            { id: 'x', label: 'Posición Final (x)' },
            { id: 'x0', label: 'Posición Inicial (x0)' },
            { id: 'v0', label: 'Velocidad Inicial (v0)' },
            { id: 'a', label: 'Aceleración (a)' },
            { id: 't', label: 'Tiempo (t)' }
        ],
        fields: [
            { id: 'x', label: 'Posición Final (m)', val: '' },
            { id: 'x0', label: 'Posición Inicial (m)', val: '0' },
            { id: 'v0', label: 'Velocidad Inicial (m/s)', val: '0' },
            { id: 'a', label: 'Aceleración (m/s²)', val: '9.81' },
            { id: 't', label: 'Tiempo (s)', val: '5' }
        ],
        onChange(target, f) {
            Object.keys(f).forEach(key => {
                f[key].disabled = (key === target);
                if (key === target) f[key].value = '';
            });
        },
        calc(f, target) {
            let main, label, steps = [];
            let x0_val, v0_val, a_val, t_val, x_val;
            let extras = [];
            
            if (target === 'x') {
                x0_val = parseFloat(f.x0.value); 
                v0_val = parseFloat(f.v0.value); 
                a_val = parseFloat(f.a.value); 
                t_val = parseFloat(f.t.value);
                
                if (isNaN(x0_val) || isNaN(v0_val) || isNaN(a_val) || isNaN(t_val)) return null;
                
                if (t_val < 0) {
                    extras.push({ cls: 'warn', txt: '⚠️ Tiempo negativo: esto representa el pasado' });
                }
                
                x_val = x0_val + (v0_val * t_val) + (0.5 * a_val * t_val * t_val);
                main = `${x_val.toFixed(2)} m`; 
                label = 'Posición Final';
                steps = [`x = ${x0_val} + (${v0_val} × ${t_val}) + (0.5 × ${a_val} × ${t_val}²)`];
            } else {
                return { main: 'N/A', label: 'Resuelve con fórmulas alternativas', extras: [{cls: 'info', txt: 'Para otras variables, usa fórmulas cinemáticas adicionales.'}], steps: ['Esta fórmula solo resuelve la posición final.'] };
            }
            return { 
                main, label, extras, steps,
                chart(canvas) {
                    FisicaVisual.posicion(canvas, x0_val, v0_val, a_val, t_val);
                }
            };
        }
    },
    cinematica_indep: {
        title: 'Cinemática: Independiente del Tiempo',
        formula: 'vf² = v0² + 2·a·Δx',
        vars: [
            { id: 'vf', label: 'Velocidad Final (vf)' },
            { id: 'v0', label: 'Velocidad Inicial (v0)' },
            { id: 'a', label: 'Aceleración (a)' },
            { id: 'dx', label: 'Distancia / Desplazamiento (Δx)' }
        ],
        fields: [
            { id: 'vf', label: 'V final (m/s)', val: '' },
            { id: 'v0', label: 'V inicial (m/s)', val: '0' },
            { id: 'a', label: 'Aceleración (m/s²)', val: '2' },
            { id: 'dx', label: 'Distancia Δx (m)', val: '100' }
        ],
        onChange(target, f) {
            Object.keys(f).forEach(key => {
                f[key].disabled = (key === target);
                if (key === target) f[key].value = '';
            });
        },
        calc(f, target) {
            let main, label, steps = [];
            let vf_val, v0_val, a_val, dx_val;
            let extras = [];
            
            if (target === 'vf') {
                v0_val = parseFloat(f.v0.value); 
                a_val = parseFloat(f.a.value); 
                dx_val = parseFloat(f.dx.value);
                
                if (isNaN(v0_val) || isNaN(a_val) || isNaN(dx_val)) return null;
                
                let rad = (v0_val * v0_val) + (2 * a_val * dx_val);
                if (rad < 0) {
                    return { error: true, msg: "Resultado imaginario", label: "Error físico", explanation: `El discriminante es negativo (${rad.toFixed(2)}). Esto significa que con esta aceleración y distancia, el cuerpo nunca alcanzará un cambio de velocidad así.` };
                }
                vf_val = Math.sqrt(rad);
                main = `${vf_val.toFixed(2)} m/s`; 
                label = 'Velocidad Final';
                steps = [`vf = √(${v0_val}² + 2 × ${a_val} × ${dx_val})`];
                extras.push({ cls: 'info', txt: 'Nota: El resultado es la magnitud; la dirección depende del sistema de coordenadas.' });
            } else if (target === 'v0') {
                vf_val = parseFloat(f.vf.value); 
                a_val = parseFloat(f.a.value); 
                dx_val = parseFloat(f.dx.value);
                
                if (isNaN(vf_val) || isNaN(a_val) || isNaN(dx_val)) return null;
                
                let diff = (vf_val * vf_val) - (2 * a_val * dx_val);
                if (diff < 0) {
                    return { error: true, msg: "Velocidad inicial imposible", label: "Error cinemático", explanation: `v0² = ${diff.toFixed(2)} es negativo. No hay velocidad inicial real que cumpla con estos valores.` };
                }
                v0_val = Math.sqrt(diff);
                main = `${v0_val.toFixed(2)} m/s`; 
                label = 'Velocidad Inicial';
                steps = [`v0 = √(${vf_val}² - 2 × ${a_val} × ${dx_val})`];
                extras.push({ cls: 'info', txt: 'Nota: El resultado es la magnitud; la dirección depende del sistema de coordenadas.' });
            } else if (target === 'a') {
                vf_val = parseFloat(f.vf.value); 
                v0_val = parseFloat(f.v0.value); 
                dx_val = parseFloat(f.dx.value);
                
                if (isNaN(vf_val) || isNaN(v0_val) || isNaN(dx_val)) return null;
                
                if (dx_val === 0) {
                    if (vf_val === v0_val) {
                        return { error: true, msg: "Aceleración indeterminada", label: "Error matemático", explanation: "Si no hay desplazamiento y las velocidades son iguales, la aceleración puede ser cualquier valor." };
                    } else {
                        return { error: true, msg: "Valores incompatibles", label: "Error físico", explanation: "No hay desplazamiento pero las velocidades son diferentes. Esto es imposible en movimiento rectilíneo." };
                    }
                }
                
                a_val = ((vf_val * vf_val) - (v0_val * v0_val)) / (2 * dx_val);
                main = `${a_val.toFixed(2)} m/s²`; 
                label = 'Aceleración';
                steps = [`a = 2 × (${vf_val}² - ${v0_val}²) / ${dx_val}`];
            } else if (target === 'dx') {
                vf_val = parseFloat(f.vf.value); 
                v0_val = parseFloat(f.v0.value); 
                a_val = parseFloat(f.a.value);
                
                if (isNaN(vf_val) || isNaN(v0_val) || isNaN(a_val)) return null;
                
                if (a_val === 0) {
                    if (vf_val !== v0_val) {
                        return { error: true, msg: "Valores incompatibles", label: "Error físico", explanation: "Si la aceleración es cero, la velocidad no cambia y Δx puede ser cualquier valor." };
                    } else {
                        return { error: true, msg: "Desplazamiento indeterminado", label: "Error matemático", explanation: "Con aceleración cero y velocidades iguales, el desplazamiento puede ser cualquier valor." };
                    }
                }
                
                dx_val = ((vf_val * vf_val) - (v0_val * v0_val)) / (2 * a_val);
                
                if (dx_val < 0) {
                    extras.push({ cls: 'info', txt: '⚠️ Desplazamiento negativo: movimiento en dirección opuesta al eje positivo' });
                }
                
                main = `${dx_val.toFixed(2)} m`; 
                label = 'Distancia recorrida';
                steps = [`Δx = (${vf_val}² - ${v0_val}²) / (2 × ${a_val})`];
            }
            return { 
                main, label, extras, steps,
                chart(canvas) {
                    FisicaVisual.posicion(canvas, 0, v0_val, a_val, dx_val ? Math.sqrt(Math.abs(dx_val)) : 10);
                }
            };
        }
    },
    fuerza: {
        title: 'Segunda Ley de Newton',
        formula: 'F = m · a',
        vars: [
            { id: 'f_res', label: 'Fuerza (F)' }, 
            { id: 'm', label: 'Masa (m)' }, 
            { id: 'a', label: 'Aceleración (a)' }
        ],
        fields: [
            { id: 'f_res', label: 'Fuerza (N)', val: '' }, 
            { id: 'm', label: 'Masa (kg)', val: '10' }, 
            { id: 'a', label: 'Aceleración (m/s²)', val: '9.81' }
        ],
        onChange(target, f) {
            Object.keys(f).forEach(key => {
                f[key].disabled = (key === target);
                if (key === target) f[key].value = '';
            });
        },
        calc(f, target) {
            let main, label, steps = [];
            let F_val, m_val, a_val;
            let extras = [];
            
            if (target === 'f_res') {
                m_val = parseFloat(f.m.value); 
                a_val = parseFloat(f.a.value);
                
                if (isNaN(m_val) || isNaN(a_val)) return null;
                
                if (m_val < 0) {
                    return { error: true, msg: "Masa negativa", label: "Error físico", explanation: "La masa no puede ser negativa en la física clásica. Es una propiedad escalar siempre positiva." };
                }
                
                if (m_val === 0) {
                    return { error: true, msg: "Masa cero", label: "Error físico", explanation: "No hay objetos con masa cero en la física clásica (excepto fotones, que no se rigen por esta fórmula)." };
                }
                
                F_val = m_val * a_val;
                main = `${F_val.toFixed(2)} N`; 
                label = 'Fuerza';
                steps = [`F = ${m_val} × ${a_val}`];
            } else if (target === 'm') {
                F_val = parseFloat(f.f_res.value); 
                a_val = parseFloat(f.a.value);
                
                if (isNaN(F_val) || isNaN(a_val)) return null;
                
                if (a_val === 0) {
                    if (F_val === 0) {
                        return { error: true, msg: "Masa indeterminada", label: "Error matemático", explanation: "Si la fuerza y la aceleración son cero, la masa puede ser cualquier valor." };
                    } else {
                        return { error: true, msg: "Valores incompatibles", label: "Error físico", explanation: "No puede haber fuerza neta sin aceleración (segunda ley de Newton)." };
                    }
                }
                
                m_val = F_val / a_val;
                
                if (m_val < 0) {
                    return { error: true, msg: "Masa negativa", label: "Error físico", explanation: "La masa resultante es negativa. Esto no tiene sentido en la física clásica. Verifica los signos de F y a." };
                }
                
                main = `${m_val.toFixed(2)} kg`; 
                label = 'Masa';
                steps = [`m = ${F_val} / ${a_val}`];
            } else {
                F_val = parseFloat(f.f_res.value); 
                m_val = parseFloat(f.m.value);
                
                if (isNaN(F_val) || isNaN(m_val)) return null;
                
                if (m_val < 0) {
                    return { error: true, msg: "Masa negativa", label: "Error físico", explanation: "La masa no puede ser negativa en la física clásica." };
                }
                
                if (m_val === 0) {
                    return { error: true, msg: "Masa cero", label: "Error físico", explanation: "No hay objetos con masa cero en la física clásica." };
                }
                
                a_val = F_val / m_val;
                main = `${a_val.toFixed(2)} m/s²`; 
                label = 'Aceleración';
                steps = [`a = ${F_val} / ${m_val}`];
            }
            return { 
                main, label, extras, steps,
                chart(canvas) {
                    FisicaVisual.fuerza(canvas, F_val, m_val, a_val);
                }
            };
        }
    },
    rozamiento: {
        title: 'Fuerza de Rozamiento (Fricción)',
        formula: 'Fr = μ · N',
        vars: [
            { id: 'fr', label: 'Fuerza de Rozamiento (Fr)' }, 
            { id: 'mu', label: 'Coeficiente de roce (μ)' }, 
            { id: 'n_fuerza', label: 'Fuerza Normal (N)' }
        ],
        fields: [
            { id: 'fr', label: 'Fuerza de Roce (N)', val: '' }, 
            { id: 'mu', label: 'Coeficiente μ (0-1)', val: '0.25' }, 
            { id: 'n_fuerza', label: 'Fuerza Normal (N)', val: '100' }
        ],
        onChange(target, f) {
            Object.keys(f).forEach(key => {
                f[key].disabled = (key === target);
                if (key === target) f[key].value = '';
            });
        },
        calc(f, target) {
            let main, label, steps = [];
            let Fr_val, mu_val, N_val;
            let extras = [];
            
            if (target === 'fr') {
                mu_val = parseFloat(f.mu.value); 
                N_val = parseFloat(f.n_fuerza.value);
                
                if (isNaN(mu_val) || isNaN(N_val)) return null;
                
                if (mu_val < 0) {
                    return { error: true, msg: "μ negativo", label: "Error físico", explanation: "El coeficiente de rozamiento no puede ser negativo. Siempre es cero o positivo." };
                }
                
                if (mu_val > 1.5) {
                    extras.push({ cls: 'warn', txt: '⚠️ μ > 1.5 es inusual para materiales comunes (excepto caucho)' });
                }
                
                if (N_val < 0) {
                    extras.push({ cls: 'info', txt: '⚠️ Fuerza normal negativa: dirección invertida' });
                }
                
                Fr_val = mu_val * N_val;
                main = `${Fr_val.toFixed(2)} N`; 
                label = 'Fuerza de Rozamiento';
                steps = [`Fr = ${mu_val} × ${N_val}`];
            } else if (target === 'mu') {
                Fr_val = parseFloat(f.fr.value); 
                N_val = parseFloat(f.n_fuerza.value);
                
                if (isNaN(Fr_val) || isNaN(N_val)) return null;
                
                if (N_val === 0) {
                    if (Fr_val === 0) {
                        return { error: true, msg: "μ indeterminado", label: "Error matemático", explanation: "Si Fr y N son cero, μ puede ser cualquier valor." };
                    } else {
                        return { error: true, msg: "Valores incompatibles", label: "Error físico", explanation: "No puede haber fuerza de rozamiento sin fuerza normal." };
                    }
                }
                
                mu_val = Fr_val / N_val;
                
                if (mu_val < 0) {
                    return { error: true, msg: "μ negativo", label: "Error físico", explanation: "El coeficiente resultante es negativo. Esto no tiene sentido físico. Verifica los signos." };
                }
                
                if (mu_val > 1.5) {
                    extras.push({ cls: 'warn', txt: '⚠️ μ > 1.5 es inusual para materiales comunes' });
                }
                
                main = `${mu_val.toFixed(3)}`; 
                label = 'Coeficiente de Roce';
                steps = [`μ = ${Fr_val} / ${N_val}`];
            } else {
                Fr_val = parseFloat(f.fr.value); 
                mu_val = parseFloat(f.mu.value);
                
                if (isNaN(Fr_val) || isNaN(mu_val)) return null;
                
                if (mu_val < 0) {
                    return { error: true, msg: "μ negativo", label: "Error físico", explanation: "El coeficiente de rozamiento no puede ser negativo." };
                }
                
                if (mu_val === 0) {
                    if (Fr_val === 0) {
                        return { error: true, msg: "N indeterminada", label: "Error matemático", explanation: "Si μ y Fr son cero, N puede ser cualquier valor." };
                    } else {
                        return { error: true, msg: "Valores incompatibles", label: "Error físico", explanation: "Si μ es cero, no hay rozamiento, Fr debe ser cero." };
                    }
                }
                
                N_val = Fr_val / mu_val;
                main = `${N_val.toFixed(2)} N`; 
                label = 'Fuerza Normal';
                steps = [`N = ${Fr_val} / ${mu_val}`];
            }
            return { 
                main, label, extras, steps,
                chart(canvas) {
                    FisicaVisual.rozamiento(canvas, Fr_val, mu_val, N_val);
                }
            };
        }
    },
    energia: {
        title: 'Energía Cinética y Potencial',
        formula: 'Ec = ½·m·v² | Ep = m·g·h',
        vars: [
            { id: 'ec', label: 'Energía Cinética (Ec)' }, 
            { id: 'ep', label: 'Energía Potencial (Ep)' }, 
            { id: 'm', label: 'Masa (m)' }, 
            { id: 'v', label: 'Velocidad (v)' }, 
            { id: 'h', label: 'Altura (h)' }
        ],
        fields: [
            { id: 'ec', label: 'Ec (J)', val: '' }, 
            { id: 'ep', label: 'Ep (J)', val: '' }, 
            { id: 'm', label: 'Masa (kg)', val: '1' }, 
            { id: 'v', label: 'Velocidad (m/s)', val: '10' }, 
            { id: 'h', label: 'Altura (m)', val: '5' }
        ],
        onChange(target, f) {
            Object.keys(f).forEach(key => {
                f[key].disabled = (key === target);
                if (key === target) f[key].value = '';
            });
        },
        calc(f, target) {
            let main, label, steps = [];
            let Ec_val, Ep_val, m_val, v_val, h_val;
            const g = 9.81;
            let extras = [];
            
            // Calculate based on what we're solving for
            if (target === 'ec') {
                // Solve for Ec
                m_val = parseFloat(f.m.value);
                v_val = parseFloat(f.v.value);
                
                if (isNaN(m_val) || isNaN(v_val)) return null;
                
                if (m_val < 0) {
                    return { error: true, msg: "Masa negativa", label: "Error físico", explanation: "La masa no puede ser negativa en la física clásica." };
                }
                
                if (m_val === 0) {
                    return { error: true, msg: "Masa cero", label: "Error físico", explanation: "No hay energía sin masa en la física clásica." };
                }
                
                if (v_val > 3e8) {
                    extras.push({ cls: 'warn', txt: '⚠️ Velocidad > luz: esta fórmula no aplica (usa relatividad)' });
                }
                
                Ec_val = 0.5 * m_val * v_val * v_val;
                main = `${Ec_val.toFixed(1)} J`; 
                label = 'Energía Cinética';
                steps = [`Ec = 0.5 × ${m_val} × ${v_val}²`];
                
                // Also calculate Ep for display if we have h
                h_val = parseFloat(f.h.value);
                if (!isNaN(h_val)) Ep_val = m_val * g * h_val;
                
            } else if (target === 'ep') {
                // Solve for Ep
                m_val = parseFloat(f.m.value);
                h_val = parseFloat(f.h.value);
                
                if (isNaN(m_val) || isNaN(h_val)) return null;
                
                if (m_val < 0) {
                    return { error: true, msg: "Masa negativa", label: "Error físico", explanation: "La masa no puede ser negativa en la física clásica." };
                }
                
                if (m_val === 0) {
                    return { error: true, msg: "Masa cero", label: "Error físico", explanation: "No hay energía sin masa en la física clásica." };
                }
                
                if (h_val < 0) {
                    extras.push({ cls: 'info', txt: '⚠️ Altura negativa: energía potencial negativa (abajo del punto de referencia)' });
                }
                
                Ep_val = m_val * g * h_val;
                main = `${Ep_val.toFixed(1)} J`; 
                label = 'Energía Potencial';
                steps = [`Ep = ${m_val} × ${g} × ${h_val}`];
                
                // Also calculate Ec for display if we have v
                v_val = parseFloat(f.v.value);
                if (!isNaN(v_val)) Ec_val = 0.5 * m_val * v_val * v_val;
                
            } else if (target === 'm') {
                // Solve for m - can use either Ec or Ep
                let m_from_ec = null;
                let m_from_ep = null;
                
                const ec_val = parseFloat(f.ec.value);
                const v_val_for_m = parseFloat(f.v.value);
                if (!isNaN(ec_val) && !isNaN(v_val_for_m) && ec_val > 0) {
                    if (v_val_for_m === 0) {
                        return { error: true, msg: "Velocidad cero", label: "Error matemático", explanation: "No se puede calcular la masa con Ec y velocidad cero." };
                    }
                    m_from_ec = (2 * ec_val) / (v_val_for_m * v_val_for_m);
                }
                
                const ep_val = parseFloat(f.ep.value);
                const h_val_for_m = parseFloat(f.h.value);
                if (!isNaN(ep_val) && !isNaN(h_val_for_m)) {
                    if (h_val_for_m === 0) {
                        if (m_from_ec !== null) {
                            m_val = m_from_ec;
                        } else {
                            return { error: true, msg: "Datos insuficientes", label: "Error matemático", explanation: "Necesita Ec y v, o Ep y h." };
                        }
                    } else {
                        m_from_ep = ep_val / (g * h_val_for_m);
                    }
                }
                
                if (m_from_ec === null && m_from_ep === null) {
                    return { error: true, msg: "Datos insuficientes", label: "Error matemático", explanation: "Ingrese Ec y v, o Ep y h para calcular la masa." };
                }
                
                m_val = m_from_ec !== null ? m_from_ec : m_from_ep;
                
                if (m_val < 0) {
                    return { error: true, msg: "Masa negativa", label: "Error físico", explanation: "La masa no puede ser negativa. Verifique los signos." };
                }
                
                main = `${m_val.toFixed(3)} kg`;
                label = 'Masa';
                steps = m_from_ec !== null 
                    ? [`m = (2 × ${ec_val}) / (${v_val_for_m}²)`]
                    : [`m = ${ep_val} / (${g} × ${h_val_for_m})`];
                
                // Calculate the other energy for display
                if (m_from_ec !== null && !isNaN(h_val_for_m)) Ep_val = m_val * g * h_val_for_m;
                if (m_from_ep !== null && !isNaN(v_val_for_m)) Ec_val = 0.5 * m_val * v_val_for_m * v_val_for_m;
                
            } else if (target === 'v') {
                // Solve for v
                const ec_val = parseFloat(f.ec.value);
                m_val = parseFloat(f.m.value);
                
                if (isNaN(ec_val) || isNaN(m_val)) return null;
                
                if (m_val <= 0) {
                    return { error: true, msg: "Masa inválida", label: "Error físico", explanation: "La masa debe ser mayor que cero." };
                }
                
                if (ec_val < 0) {
                    return { error: true, msg: "Ec negativa", label: "Error físico", explanation: "La energía cinética no puede ser negativa." };
                }
                
                const radicand = (2 * ec_val) / m_val;
                if (radicand < 0) {
                    return { error: true, msg: "Resultado imaginario", label: "Error físico", explanation: "Valores incompatibles para calcular la velocidad." };
                }
                
                v_val = Math.sqrt(radicand);
                main = `${v_val.toFixed(2)} m/s`;
                label = 'Velocidad';
                steps = [`v = √(2 × ${ec_val} / ${m_val})`];
                
                // Calculate Ep for display if we have h
                h_val = parseFloat(f.h.value);
                if (!isNaN(h_val)) Ep_val = m_val * g * h_val;
                Ec_val = ec_val;
                
            } else if (target === 'h') {
                // Solve for h
                const ep_val = parseFloat(f.ep.value);
                m_val = parseFloat(f.m.value);
                
                if (isNaN(ep_val) || isNaN(m_val)) return null;
                
                if (m_val <= 0) {
                    return { error: true, msg: "Masa inválida", label: "Error físico", explanation: "La masa debe ser mayor que cero." };
                }
                
                h_val = ep_val / (m_val * g);
                main = `${h_val.toFixed(2)} m`;
                label = 'Altura';
                steps = [`h = ${ep_val} / (${m_val} × ${g})`];
                
                if (h_val < 0) {
                    extras.push({ cls: 'info', txt: '⚠️ Altura negativa: abajo del punto de referencia' });
                }
                
                // Calculate Ec for display if we have v
                v_val = parseFloat(f.v.value);
                if (!isNaN(v_val)) Ec_val = 0.5 * m_val * v_val * v_val;
                Ep_val = ep_val;
            }
            
            return { 
                main, label, extras, steps,
                chart(canvas) {
                    FisicaVisual.energia(canvas, Ec_val || 0, Ep_val || 0);
                }
            };
        }
    },
    parabolico: {
        title: 'Movimiento Parabólico',
        formula: 'x = v0·cos(θ)·t | y = v0·sin(θ)·t - ½·g·t²',
        fields: [
            { id: 'v0', label: 'Velocidad inicial (m/s)', val: '20' },
            { id: 'theta', label: 'Ángulo θ (°)', val: '45' }
        ],
        calc(f) {
            let v0 = parseFloat(f.v0.value);
            let theta = parseFloat(f.theta.value);
            let extras = [];
            
            if (isNaN(v0) || isNaN(theta)) return null;
            
            if (v0 <= 0) {
                return { error: true, msg: 'Velocidad inicial no válida', label: 'Error físico', explanation: 'La velocidad inicial debe ser mayor que cero para un lanzamiento parabólico.' };
            }
            
            if (v0 > 3e8) {
                extras.push({ cls: 'warn', txt: '⚠️ Velocidad > luz: esta fórmula no aplica (usa relatividad)' });
            }
            
            if (theta > 90 || theta < -90) {
                extras.push({ cls: 'warn', txt: '⚠️ Ángulo fuera de rango normal (se calculará de todos modos)' });
            }
            
            const g = 9.81;
            const theta_rad = theta * Math.PI / 180;
            const t_total = (2 * v0 * Math.sin(theta_rad)) / g;
            const x_max = v0 * Math.cos(theta_rad) * t_total;
            const y_max = Math.pow(v0 * Math.sin(theta_rad), 2) / (2 * g);
            
            if (t_total < 0) {
                extras.push({ cls: 'info', txt: '⚠️ Tiempo negativo: lanzamiento hacia abajo' });
            }
            
            return { 
                main: `${x_max.toFixed(2)} m`, 
                label: 'Alcance máximo', 
                extras: [
                    { cls: 'info', txt: `Altura máxima: ${y_max.toFixed(2)} m` }, 
                    { cls: 'info', txt: `Tiempo total: ${t_total.toFixed(2)} s` },
                    ...extras
                ], 
                steps: [
                    `t_total = (2 × ${v0} × sin(${theta}°)) / ${g}`,
                    `x_max = ${v0} × cos(${theta}°) × ${t_total.toFixed(2)}`
                ],
                chart(canvas) {
                    FisicaVisual.movimientoParabolico(canvas, v0, theta, g);
                }
            };
        }
    },
    trabajo: {
        title: 'Trabajo y Energía',
        formula: 'W = F · d',
        vars: [
            { id: 'w', label: 'Trabajo (J)' },
            { id: 'f', label: 'Fuerza (N)' },
            { id: 'd', label: 'Distancia (m)' }
        ],
        fields: [
            { id: 'w', label: 'Trabajo (J)', val: '' },
            { id: 'f', label: 'Fuerza (N)', val: '50' },
            { id: 'd', label: 'Distancia (m)', val: '10' }
        ],
        onChange(target, f) {
            Object.keys(f).forEach(key => {
                f[key].disabled = key === target;
                if (key === target) f[key].value = '';
            });
        },
        calc(f, target) {
            let W, F, d, main, label, steps = [];
            let extras = [];
            
            if (target === 'w' || !target) {
                F = parseFloat(f.f.value);
                d = parseFloat(f.d.value);
                if (isNaN(F) || isNaN(d)) return null;
                
                W = F * d;
                main = `${W.toFixed(1)} J`;
                label = 'Trabajo Realizado';
                steps = [`W = ${F} N × ${d} m`];
                
                if (W < 0) {
                    extras.push({ cls: 'info', txt: '⚠️ Trabajo negativo: fuerza opuesta al desplazamiento' });
                }
            } else if (target === 'f') {
                W = parseFloat(f.w.value);
                d = parseFloat(f.d.value);
                if (isNaN(W) || isNaN(d)) return null;
                
                if (d === 0) {
                    if (W === 0) {
                        return { error: true, msg: 'Fuerza indeterminada', label: 'Error matemático', explanation: 'Si el trabajo y la distancia son cero, la fuerza puede ser cualquier valor.' };
                    } else {
                        return { error: true, msg: 'Valores incompatibles', label: 'Error físico', explanation: 'No puede haber trabajo sin desplazamiento.' };
                    }
                }
                
                F = W / d;
                main = `${F.toFixed(1)} N`;
                label = 'Fuerza Necesaria';
                steps = [`F = ${W} J / ${d} m`];
            } else if (target === 'd') {
                W = parseFloat(f.w.value);
                F = parseFloat(f.f.value);
                if (isNaN(W) || isNaN(F)) return null;
                
                if (F === 0) {
                    if (W === 0) {
                        return { error: true, msg: 'Distancia indeterminada', label: 'Error matemático', explanation: 'Si el trabajo y la fuerza son cero, la distancia puede ser cualquier valor.' };
                    } else {
                        return { error: true, msg: 'Valores incompatibles', label: 'Error físico', explanation: 'No puede haber trabajo sin fuerza.' };
                    }
                }
                
                d = W / F;
                main = `${d.toFixed(1)} m`;
                label = 'Distancia Recorrida';
                steps = [`d = ${W} J / ${F} N`];
                
                if (d < 0) {
                    extras.push({ cls: 'info', txt: '⚠️ Distancia negativa: desplazamiento opuesto a la fuerza' });
                }
            }
            return {
                main, label, extras, steps,
                chart(canvas) {
                    FisicaVisual.trabajo(canvas, F, d, W);
                }
            };
        }
    },
    newton: {
        title: 'Leyes de Newton',
        formula: '1: Inercia (ΣF=0) | 2: F=m·a | 3: Acción-Reacción',
        vars: [
            { id: '1', label: 'Ley 1: Inercia — Velocidad constante' },
            { id: '2_f', label: 'Ley 2: Calcular Fuerza (F)' },
            { id: '2_m', label: 'Ley 2: Calcular Masa (m)' },
            { id: '2_a', label: 'Ley 2: Calcular Aceleración (a)' },
            { id: '3', label: 'Ley 3: Acción-Reacción' }
        ],
        fields: [
            { id: 'm', label: 'Masa (kg)', val: '10' },
            { id: 'a', label: 'Aceleración (m/s²)', val: '2' },
            { id: 'f', label: 'Fuerza (N)', val: '' },
            { id: 'v', label: 'Velocidad (m/s)', val: '5' }
        ],
        onChange(target, f) {
            Object.keys(f).forEach(key => { f[key].disabled = false; });
            if (target === '1') {
                f.a.disabled = true; f.f.disabled = true;
                f.m.value = '10'; f.v.value = '5';
            } else if (target === '2_f') {
                f.f.disabled = true;
            } else if (target === '2_m') {
                f.m.disabled = true;
            } else if (target === '2_a') {
                f.a.disabled = true;
            } else if (target === '3') {
                f.m.disabled = true; f.a.disabled = true; f.v.disabled = true;
                f.f.value = '100';
            }
        },
        calc(f, target) {
            let main, label, steps = [], extras = [];
            let F_val = 0, m_val = 0, a_val = 0, v_val = 0;
            let targetForChart = target;
            
            if (target === '1') {
                m_val = parseFloat(f.m.value) || 10;
                v_val = parseFloat(f.v.value) || 5;
                main = `${v_val.toFixed(1)} m/s (constante)`;
                label = 'Ley 1 de Newton — Inercia';
                steps = [`ΣF = 0 → v = ${v_val.toFixed(1)} m/s constante`];
                extras = [
                    {cls:'info',txt:`El cuerpo de ${m_val.toFixed(1)} kg mantiene su velocidad de ${v_val.toFixed(1)} m/s`},
                    {cls:'info',txt:'Si ΣF = 0, no hay cambio en el movimiento (1ª Ley)'}
                ];
            } else if (target === '2_f') {
                m_val = parseFloat(f.m.value);
                a_val = parseFloat(f.a.value);
                if (isNaN(m_val) || isNaN(a_val)) return null;
                if (m_val < 0) return { error: true, msg: "Masa negativa", label: "Error físico", explanation: "La masa no puede ser negativa." };
                if (m_val === 0) return { error: true, msg: "Masa cero", label: "Error físico", explanation: "No hay objetos con masa cero." };
                F_val = m_val * a_val;
                main = `${F_val.toFixed(1)} N`;
                label = 'Fuerza Neta';
                steps = [`F = ${m_val} kg × ${a_val} m/s²`];
            } else if (target === '2_m') {
                F_val = parseFloat(f.f.value);
                a_val = parseFloat(f.a.value);
                if (isNaN(F_val) || isNaN(a_val)) return null;
                if (a_val === 0) {
                    if (F_val === 0) return { error: true, msg: "Masa indeterminada", label: "Error", explanation: "Si F y a son cero, la masa puede ser cualquier valor." };
                    else return { error: true, msg: "Valores incompatibles", label: "Error", explanation: "No puede haber fuerza neta sin aceleración." };
                }
                m_val = F_val / a_val;
                if (m_val < 0) return { error: true, msg: "Masa negativa", label: "Error", explanation: "La masa resultante es negativa." };
                main = `${m_val.toFixed(1)} kg`;
                label = 'Masa';
                steps = [`m = ${F_val} N / ${a_val} m/s²`];
            } else if (target === '2_a') {
                F_val = parseFloat(f.f.value);
                m_val = parseFloat(f.m.value);
                if (isNaN(F_val) || isNaN(m_val)) return null;
                if (m_val < 0) return { error: true, msg: "Masa negativa", label: "Error", explanation: "La masa no puede ser negativa." };
                if (m_val === 0) return { error: true, msg: "Masa cero", label: "Error", explanation: "No hay objetos con masa cero." };
                a_val = F_val / m_val;
                main = `${a_val.toFixed(1)} m/s²`;
                label = 'Aceleración';
                steps = [`a = ${F_val} N / ${m_val} kg`];
            } else if (target === '3') {
                F_val = parseFloat(f.f.value) || 0;
                main = `|F_a| = |F_b| = ${Math.abs(F_val).toFixed(1)} N`;
                label = 'Ley 3 de Newton — Acción y Reacción';
                steps = [`F_a = ${F_val.toFixed(1)} N  |  F_b = ${(-F_val).toFixed(1)} N`];
                extras = [
                    {cls:'info',txt:'Las fuerzas actúan sobre cuerpos DIFERENTES'},
                    {cls:'info',txt:'Por eso no se cancelan entre sí'}
                ];
            }
            return {
                main, label, extras, steps,
                chart(canvas) {
                    FisicaVisual.newton(canvas, m_val, F_val, targetForChart, v_val);
                }
            };
        }
    },
    gravedad: {
        title: 'Gravedad',
        formula: 'Caída libre: h=½·g·t² | Lanzamiento: y=v0·t -½·g·t² | Parabólico',
        vars: [
            { id: 'caida_h', label: 'Caída Libre: Calcular Altura (h)' },
            { id: 'caida_t', label: 'Caída Libre: Calcular Tiempo (t)' },
            { id: 'vertical_h', label: 'Lanz. Vertical: Calcular Posición (y)' },
            { id: 'vertical_v0', label: 'Lanz. Vertical: Calcular Vel. Inicial' },
            { id: 'vertical_t', label: 'Lanz. Vertical: Calcular Tiempo' },
            { id: 'parabolico', label: 'Mov. Parabólico: Calcular Alcance' },
        ],
        fields: [
            { id: 't', label: 'Tiempo (s)', val: '2' },
            { id: 'h', label: 'Altura (m)', val: '' },
            { id: 'v0', label: 'Vel. Inicial (m/s)', val: '20' },
            { id: 'a', label: 'Ángulo (°)', val: '45' }
        ],
        onChange(target, f) {
            Object.keys(f).forEach(key => { f[key].disabled = false; });
            if (target === 'caida_h') {
                f.h.disabled = true;
                f.v0.disabled = true; f.a.disabled = true;
            } else if (target === 'caida_t') {
                f.t.disabled = true;
                f.v0.disabled = true; f.a.disabled = true;
            } else if (target === 'vertical_h') {
                f.h.disabled = true;
                f.a.disabled = true;
            } else if (target === 'vertical_v0') {
                f.v0.disabled = true;
                f.a.disabled = true;
            } else if (target === 'vertical_t') {
                f.t.disabled = true;
                f.a.disabled = true;
            } else if (target === 'parabolico') {
                f.h.disabled = true; f.t.disabled = true;
            }
        },
        calc(f, target) {
            const g = 9.81;
            let main, label, steps = [], extras = [];
            let v0, t, a, h, x_max, y_max;
            
            if (target === 'caida_h') {
                t = parseFloat(f.t.value);
                if (isNaN(t) || t < 0) return { error: true, msg: t < 0 ? 'Tiempo negativo' : 'Ingrese un tiempo válido', label: 'Error' };
                h = 0.5 * g * t * t;
                main = `${h.toFixed(1)} m`;
                label = 'Altura de Caída';
                steps = [`h = ½ × ${g} × ${t}²`];
            } else if (target === 'caida_t') {
                h = parseFloat(f.h.value);
                if (isNaN(h) || h < 0) return { error: true, msg: h < 0 ? 'Altura negativa' : 'Ingrese una altura válida', label: 'Error' };
                t = Math.sqrt(2 * h / g);
                main = `${t.toFixed(2)} s`;
                label = 'Tiempo de Caída';
                steps = [`t = √(2 × ${h} / ${g})`];
            } else if (target === 'vertical_h') {
                v0 = parseFloat(f.v0.value);
                t = parseFloat(f.t.value);
                if (isNaN(v0) || isNaN(t)) return null;
                if (t < 0) extras.push({ cls: 'warn', txt: '⚠️ Tiempo negativo' });
                h = v0*t - 0.5*g*t*t;
                y_max = (v0*v0)/(2*g);
                main = `${h.toFixed(1)} m`;
                label = 'Posición Vertical';
                steps = [`y = ${v0}×${t} - ½×${g}×${t}²`];
                extras = [{ cls:'info', txt:`Altura máxima: ${y_max.toFixed(1)} m` }, ...extras];
                if (h < 0) extras.push({ cls: 'info', txt: '⚠️ Debajo del punto de lanzamiento' });
            } else if (target === 'vertical_v0') {
                h = parseFloat(f.h.value);
                t = parseFloat(f.t.value);
                if (isNaN(h) || isNaN(t)) return null;
                if (t <= 0) return { error: true, msg: 'El tiempo debe ser > 0', label: 'Error' };
                v0 = (h + 0.5*g*t*t) / t;
                main = `${v0.toFixed(2)} m/s`;
                label = 'Velocidad Inicial';
                steps = [`v0 = (${h} + ½×${g}×${t}²) / ${t}`];
            } else if (target === 'vertical_t') {
                v0 = parseFloat(f.v0.value);
                h = parseFloat(f.h.value);
                if (isNaN(v0) || isNaN(h)) return null;
                const disc = v0*v0 - 2*g*h;
                if (disc < 0) return { error: true, msg: 'No se alcanza esa altura con esa velocidad', label: 'Error físico' };
                const t1 = (v0 - Math.sqrt(disc)) / g;
                const t2 = (v0 + Math.sqrt(disc)) / g;
                main = `${t1.toFixed(2)} s (subida), ${t2.toFixed(2)} s (bajada)`;
                label = 'Tiempo en alcanzar y';
                steps = [`t = (${v0} ± √(${v0}² - 2×${g}×${h})) / ${g}`];
            } else if (target === 'parabolico') {
                v0 = parseFloat(f.v0.value);
                a = parseFloat(f.a.value);
                if (isNaN(v0) || isNaN(a)) return null;
                if (v0 <= 0) return { error: true, msg: 'Velocidad inicial no válida', label: 'Error físico', explanation: 'La velocidad inicial debe ser mayor que cero.' };
                const rad = a * Math.PI / 180;
                const t_vuelo = (2 * v0 * Math.sin(rad)) / g;
                x_max = v0 * Math.cos(rad) * t_vuelo;
                y_max = (v0 * Math.sin(rad)) ** 2 / (2 * g);
                main = `${x_max.toFixed(1)} m`;
                label = 'Alcance Horizontal';
                steps = [`x_max = ${v0}² × sin(2×${a}°) / ${g}`];
                extras = [
                    { cls: 'info', txt: `Altura máx: ${y_max.toFixed(1)} m` },
                    { cls: 'info', txt: `Tiempo vuelo: ${t_vuelo.toFixed(1)} s` }
                ];
            }
            let targetKey = target;
            return {
                main, label, extras, steps,
                chart(canvas) {
                    FisicaVisual.gravedad(canvas, targetKey, v0, a, g, t);
                }
            };
        }
    },
    resorte: {
        title: 'Movimiento Armónico Simple (Resorte)',
        formula: 'F = -k·x | T = 2π√(m/k)',
        vars: [
            { id: 'T', label: 'Período (T)' },
            { id: 'k', label: 'Constante (k)' },
            { id: 'm', label: 'Masa (m)' }
        ],
        fields: [
            { id: 'T', label: 'Período (s)', val: '' },
            { id: 'k', label: 'Constante k (N/m)', val: '50' },
            { id: 'm', label: 'Masa (kg)', val: '2' },
            { id: 'A', label: 'Amplitud (m)', val: '0.5' },
            { id: 'amort', label: 'Amortiguado', val: 'false', type: 'select', opts: [{v: 'false', l: 'No'}, {v: 'true', l: 'Sí'}]}
        ],
        onChange(target, f) {
            Object.keys(f).forEach(key => {
                if (['T', 'k', 'm'].includes(key)) {
                    f[key].disabled = key === target;
                    if (key === target) f[key].value = '';
                }
            });
        },
        calc(f, target) {
            let main, label, steps = [], extras = [];
            let T_val, k_val, m_val, fq_val;
            
            if (target === 'T' || !target) {
                k_val = parseFloat(f.k.value); 
                m_val = parseFloat(f.m.value);
                
                if (isNaN(k_val) || isNaN(m_val)) return null;
                
                if (k_val <= 0) {
                    return { error: true, msg: "Constante elástica no válida", label: "Error físico", explanation: "k debe ser positiva. Representa la rigidez del resorte." };
                }
                
                if (m_val <= 0) {
                    return { error: true, msg: "Masa no válida", label: "Error físico", explanation: "La masa debe ser positiva." };
                }
                
                T_val = 2 * Math.PI * Math.sqrt(m_val/k_val);
                fq_val = 1 / T_val;
                main = `${T_val.toFixed(2)} s`;
                label = 'Período de Oscilación';
                steps = [`T = 2π√(${m_val}kg / ${k_val}N/m)`];
                extras = [{ cls: 'info', txt:`Frecuencia: ${fq_val.toFixed(2)} Hz` }];
            } else if (target === 'k') {
                T_val = parseFloat(f.T.value); 
                m_val = parseFloat(f.m.value);
                
                if (isNaN(T_val) || isNaN(m_val)) return null;
                
                if (T_val <= 0) {
                    return { error: true, msg: "Período no válido", label: "Error físico", explanation: "El período debe ser positivo." };
                }
                
                if (m_val <= 0) {
                    return { error: true, msg: "Masa no válida", label: "Error físico", explanation: "La masa debe ser positiva." };
                }
                
                k_val = (4 * Math.PI * Math.PI * m_val)/(T_val * T_val);
                main = `${k_val.toFixed(1)} N/m`;
                label = 'Constante elástica';
                steps = [`k = 4π² × ${m_val} / ${T_val}²`];
            } else if (target === 'm') {
                T_val = parseFloat(f.T.value); 
                k_val = parseFloat(f.k.value);
                
                if (isNaN(T_val) || isNaN(k_val)) return null;
                
                if (T_val <= 0) {
                    return { error: true, msg: "Período no válido", label: "Error físico", explanation: "El período debe ser positivo." };
                }
                
                if (k_val <= 0) {
                    return { error: true, msg: "Constante elástica no válida", label: "Error físico", explanation: "k debe ser positiva." };
                }
                
                m_val = (k_val * T_val * T_val)/(4 * Math.PI * Math.PI);
                main = `${m_val.toFixed(1)} kg`;
                label = 'Masa del cuerpo';
                steps = [`m = k × T² / 4π²`];
            }
            
            const A_val = parseFloat(f.A.value) || 0.5;
            const amort_val = f.amort.value === 'true';
            
            if (A_val < 0) {
                extras.push({ cls: 'info', txt: '⚠️ Amplitud negativa: solo cambia la fase inicial' });
            }
            
            return {
                main, label, extras, steps,
                chart(canvas) {
                    FisicaVisual.resorte(canvas, k_val, m_val, A_val, amort_val);
                }
            };
        }
    },
    ondas: {
        title: 'Ondas',
        formula: 'v = λ·f',
        vars: [
            { id: 'v', label: 'Velocidad (v)' },
            { id: 'lambda', label: 'Longitud de Onda (λ)' },
            { id: 'f', label: 'Frecuencia (f)' }
        ],
        fields: [
            { id: 'v', label: 'Velocidad (m/s)', val: '343', type:'text' },
            { id: 'lambda', label: 'Longitud de Onda (m)', val: '', type:'text' },
            { id: 'f', label: 'Frecuencia (Hz)', val: '440', type:'text' },
            { id: 'A', label: 'Amplitud', val: '1', type:'text' },
            { id: 'tipo', label: 'Tipo', val: 'transversal', type:'select', opts:[{v:'transversal',l:'Transversal'},{v:'longitudinal',l:'Longitudinal'}] }
        ],
        onChange(target, f) {
            Object.keys(f).forEach(key => {
                if (['v', 'lambda', 'f'].includes(key)) {
                    f[key].disabled = key === target;
                    if (key === target) f[key].value = '';
                }
            });
        },
        calc(f, target) {
            let v_val = parseFloat(f.v.value.replace(',','.')) || 343;
            let lambda_val = parseFloat(f.lambda.value.replace(',','.')) || 1;
            let fq_val = parseFloat(f.f.value.replace(',','.')) || 440;
            let A_val = parseFloat(f.A.value.replace(',','.')) || 1;
            let tipo_val = f.tipo.value || 'transversal';
            return {
                main: `${lambda_val.toFixed(3)} m`,
                label: 'Longitud de Onda',
                chart(canvas) {
                    FisicaVisual.ondas(canvas, tipo_val, lambda_val, A_val, fq_val);
                }
            };
        }
    }
};

// =============================================================================
// FÍSICA ESCOLAR (3) — Guard pattern
// =============================================================================
if (!FORMS.fis) FORMS.fis = {};
Object.assign(FORMS.fis, {

    // -------------------------------------------------------------------------
    // FIS13. CAÍDA LIBRE
    // -------------------------------------------------------------------------
    caida_libre: {
        title: 'Caída Libre',
        formula: 'h = ½·g·t²  |  v = g·t',
        vars: [
            { id: 'h', label: 'Altura (h)' },
            { id: 't', label: 'Tiempo (t)' }
        ],
        fields: [
            { id: 'tiempo', label: 'Tiempo (s)', val: '3' },
            { id: 'altura', label: 'Altura (m)', val: '' }
        ],
        onChange(target, f) {
            if (target === 'h') { f.altura.disabled = true; f.altura.value = ''; f.tiempo.disabled = false; }
            else if (target === 't') { f.tiempo.disabled = true; f.tiempo.value = ''; f.altura.disabled = false; }
        },
        calc(f, target) {
            const g = 9.81;
            if (target === 't' || !target) {
                let h = parseFloat(f.altura.value);
                if (isNaN(h) || h < 0) return null;
                let t = Math.sqrt(2 * h / g);
                let v = g * t;
                return {
                    main: `${t.toFixed(2)} s`,
                    label: 'Tiempo de Caída',
                    extras: [
                        { cls: 'info', txt: `Altura: ${h.toFixed(1)} m` },
                        { cls: 'ok', txt: `Velocidad final: ${v.toFixed(2)} m/s (${(v*3.6).toFixed(1)} km/h)` }
                    ],
                    steps: [`t = √(2 × ${h} / ${g})`, `v = ${g} × ${t.toFixed(2)}`],
                    chart(canvas) { FisicaVisual.caidaLibre(canvas, h, t, v, g); }
                };
            } else {
                let t = parseFloat(f.tiempo.value);
                if (isNaN(t) || t < 0) return null;
                let h = 0.5 * g * t * t;
                let v = g * t;
                return {
                    main: `${h.toFixed(2)} m`,
                    label: 'Altura de Caída',
                    extras: [
                        { cls: 'info', txt: `Tiempo: ${t.toFixed(2)} s` },
                        { cls: 'ok', txt: `Velocidad final: ${v.toFixed(2)} m/s (${(v*3.6).toFixed(1)} km/h)` }
                    ],
                    steps: [`h = 0.5 × ${g} × ${t}²`],
                    chart(canvas) { FisicaVisual.caidaLibre(canvas, h, t, v, g); }
                };
            }
        }
    },

    // -------------------------------------------------------------------------
    // FIS14. DENSIDAD
    // -------------------------------------------------------------------------
    densidad: {
        title: 'Densidad',
        formula: 'ρ = m / V',
        vars: [
            { id: 'rho', label: 'Densidad (ρ)' },
            { id: 'm', label: 'Masa (m)' },
            { id: 'v', label: 'Volumen (V)' }
        ],
        fields: [
            { id: 'masa', label: 'Masa (kg)', val: '10' },
            { id: 'volumen', label: 'Volumen (m³)', val: '2' },
            { id: 'dens_res', label: 'Densidad (kg/m³)', val: '' }
        ],
        onChange(target, f) {
            Object.keys(f).forEach(k => { f[k].disabled = (k === target); if (k === target) f[k].value = ''; });
        },
        calc(f, target) {
            if (target === 'rho' || !target) {
                let m = parseFloat(f.masa.value), V = parseFloat(f.volumen.value);
                if (isNaN(m) || isNaN(V) || V === 0) return null;
                let rho = m / V;
                return {
                    main: `${rho.toFixed(3)} kg/m³`,
                    label: 'Densidad',
                    extras: [
                        { cls: 'info', txt: `Equivale a ${(rho/1000).toFixed(3)} g/cm³` },
                        { cls: rho > 1000 ? 'warn' : 'ok', txt: rho > 1000 ? 'Más denso que el agua' : 'Menos denso que el agua' }
                    ],
                    steps: [`ρ = ${m} / ${V} = ${rho.toFixed(3)} kg/m³`],
                    chart(canvas) { FisicaVisual.densidad(canvas, m, V, rho); }
                };
            } else if (target === 'm') {
                let rho = parseFloat(f.dens_res.value), V = parseFloat(f.volumen.value);
                if (isNaN(rho) || isNaN(V)) return null;
                let m = rho * V;
                return { main: `${m.toFixed(3)} kg`, label: 'Masa', steps: [`m = ${rho} × ${V}`], chart(canvas) { FisicaVisual.densidad(canvas, m, V, rho); } };
            } else if (target === 'v') {
                let m = parseFloat(f.masa.value), rho = parseFloat(f.dens_res.value);
                if (isNaN(m) || isNaN(rho) || rho === 0) return null;
                let V = m / rho;
                return { main: `${V.toFixed(4)} m³`, label: 'Volumen', steps: [`V = ${m} / ${rho}`], chart(canvas) { FisicaVisual.densidad(canvas, m, V, rho); } };
            }
            return null;
        }
    },

    // -------------------------------------------------------------------------
    // FIS15. PRESIÓN HIDROSTÁTICA
    // -------------------------------------------------------------------------
    presion_hidrostatica: {
        title: 'Presión Hidrostática',
        formula: 'P = ρ · g · h',
        vars: [
            { id: 'p', label: 'Presión (P)' },
            { id: 'rho', label: 'Densidad (ρ)' },
            { id: 'h', label: 'Altura (h)' }
        ],
        fields: [
            { id: 'densidad', label: 'Densidad ρ (kg/m³)', val: '1000' },
            { id: 'altura', label: 'Altura h (m)', val: '10' },
            { id: 'pres_res', label: 'Presión (Pa)', val: '' }
        ],
        onChange(target, f) {
            Object.keys(f).forEach(k => { f[k].disabled = (k === target); if (k === target) f[k].value = ''; });
        },
        calc(f, target) {
            const g = 9.81;
            if (target === 'p' || !target) {
                let rho = parseFloat(f.densidad.value), h = parseFloat(f.altura.value);
                if (isNaN(rho) || isNaN(h)) return null;
                let P = rho * g * h;
                let atm = P / 101325;
                return {
                    main: `${P.toFixed(2)} Pa`,
                    label: 'Presión Hidrostática',
                    extras: [
                        { cls: 'info', txt: `${(P/1000).toFixed(2)} kPa | ${atm.toFixed(3)} atm` },
                        { cls: 'ok', txt: `Equivale a ${(P/133.322).toFixed(1)} mmHg` }
                    ],
                    steps: [`P = ${rho} × ${g} × ${h} = ${P.toFixed(2)} Pa`],
                    chart(canvas) { FisicaVisual.presionHidrostatica(canvas, rho, h, P, g); }
                };
            } else if (target === 'rho') {
                let P = parseFloat(f.pres_res.value), h = parseFloat(f.altura.value);
                if (isNaN(P) || isNaN(h) || h === 0) return null;
                let rho = P / (g * h);
                return { main: `${rho.toFixed(1)} kg/m³`, label: 'Densidad', steps: [`ρ = ${P} / (${g} × ${h})`], chart(canvas) { FisicaVisual.presionHidrostatica(canvas, rho, h, P, g); } };
            } else if (target === 'h') {
                let P = parseFloat(f.pres_res.value), rho = parseFloat(f.densidad.value);
                if (isNaN(P) || isNaN(rho) || rho === 0) return null;
                let h = P / (rho * g);
                return { main: `${h.toFixed(2)} m`, label: 'Altura', steps: [`h = ${P} / (${rho} × ${g})`], chart(canvas) { FisicaVisual.presionHidrostatica(canvas, rho, h, P, g); } };
            }
            return null;
        }
    }
});

Object.assign(FORMS.fis, {
    impulso: {
        title: 'Impulso y Cantidad de Movimiento',
        formula: 'J = F · Δt = Δp',
        vars: [
            { id: 'j', label: 'Impulso (J)' },
            { id: 'f', label: 'Fuerza (F)' },
            { id: 'dt', label: 'Intervalo de tiempo (Δt)' }
        ],
        fields: [
            { id: 'j', label: 'Impulso (N·s)', val: '' },
            { id: 'f', label: 'Fuerza (N)', val: '50' },
            { id: 'dt', label: 'Δt (s)', val: '2' }
        ],
        onChange(target, f) {
            Object.keys(f).forEach(key => {
                f[key].disabled = (key === target);
                if (key === target) f[key].value = '';
            });
        },
        calc(f, target) {
            let J, F, dt, main, label, steps = [], extras = [];
            if (target === 'j' || !target) {
                F = parseFloat(f.f.value); dt = parseFloat(f.dt.value);
                if (isNaN(F) || isNaN(dt)) return null;
                J = F * dt;
                main = `${J.toFixed(2)} N·s`; label = 'Impulso';
                steps = [`J = ${F} N × ${dt} s`];
            } else if (target === 'f') {
                J = parseFloat(f.j.value); dt = parseFloat(f.dt.value);
                if (isNaN(J) || isNaN(dt) || dt === 0) return null;
                F = J / dt;
                main = `${F.toFixed(2)} N`; label = 'Fuerza';
                steps = [`F = ${J} / ${dt}`];
            } else if (target === 'dt') {
                J = parseFloat(f.j.value); F = parseFloat(f.f.value);
                if (isNaN(J) || isNaN(F) || F === 0) return null;
                dt = J / F;
                main = `${dt.toFixed(3)} s`; label = 'Intervalo de tiempo';
                steps = [`Δt = ${J} / ${F}`];
            }
            return {
                main, label, extras, steps,
                chart(canvas) { FisicaVisual.impulso(canvas, F, dt, J); }
            };
        }
    },
    conservacion_momento: {
        title: 'Conservación del Momento Lineal',
        formula: 'm₁v₁ + m₂v₂ = m₁v₁\' + m₂v₂\'',
        fields: [
            { id: 'm1', label: 'Masa 1 (m₁)', val: '2' },
            { id: 'v1', label: 'Vel. inicial 1 (v₁)', val: '3' },
            { id: 'm2', label: 'Masa 2 (m₂)', val: '3' },
            { id: 'v2', label: 'Vel. inicial 2 (v₂)', val: '-2' },
            { id: 'v1f', label: 'Vel. final 1 (v₁\')', val: '' },
            { id: 'v2f', label: 'Vel. final 2 (v₂\')', val: '' }
        ],
        onChange(target, f) {
            Object.keys(f).forEach(key => {
                f[key].disabled = (key === target);
                if (key === target) f[key].value = '';
            });
        },
        calc(f, target) {
            let m1 = parseFloat(f.m1.value), m2 = parseFloat(f.m2.value);
            let v1 = parseFloat(f.v1.value), v2 = parseFloat(f.v2.value);
            if (isNaN(m1) || isNaN(m2) || isNaN(v1) || isNaN(v2)) return null;
            let pTotal = m1 * v1 + m2 * v2;
            let main, label, steps = [], extras = [];

            if (target === 'v1f') {
                let v2f = parseFloat(f.v2f.value);
                if (isNaN(v2f)) return null;
                let v1f = (pTotal - m2 * v2f) / m1;
                main = `${v1f.toFixed(3)} m/s`; label = 'Velocidad final 1 (v₁\')';
                steps = [`v₁\' = (${pTotal.toFixed(2)} - ${m2}×${v2f}) / ${m1}`];
            } else if (target === 'v2f') {
                let v1f = parseFloat(f.v1f.value);
                if (isNaN(v1f)) return null;
                let v2f = (pTotal - m1 * v1f) / m2;
                main = `${v2f.toFixed(3)} m/s`; label = 'Velocidad final 2 (v₂\')';
                steps = [`v₂\' = (${pTotal.toFixed(2)} - ${m1}×${v1f}) / ${m2}`];
            } else {
                return { error: true, msg: "Debes seleccionar v₁' o v₂' como incógnita", label: "Selecciona variable", explanation: "Elige en la lista la velocidad final que quieres calcular." };
            }

            extras.push({ cls: 'info', txt: `Momento total: ${pTotal.toFixed(3)} kg·m/s` });

            return {
                main, label, extras, steps,
                chart(canvas) { FisicaVisual.conservacion_momento(canvas, m1, m2, v1, v2,
                    target === 'v1f' ? parseFloat(main) : parseFloat(f.v1f.value) || 0,
                    target === 'v2f' ? parseFloat(main) : parseFloat(f.v2f.value) || 0); }
            };
        }
    },
    ley_coulomb: {
        title: 'Ley de Coulomb',
        formula: 'F = k · q₁ · q₂ / r²',
        fields: [
            { id: 'q1', label: 'Carga q₁ (C)', val: '1e-6' },
            { id: 'q2', label: 'Carga q₂ (C)', val: '1e-6' },
            { id: 'r', label: 'Distancia r (m)', val: '0.1' },
            { id: 'f_res', label: 'Fuerza (N)', val: '' }
        ],
        onChange(target, f) {
            Object.keys(f).forEach(key => {
                f[key].disabled = (key === target);
                if (key === target) f[key].value = '';
            });
        },
        calc(f, target) {
            const k = 8.987551787e9;
            let main, label, steps = [], extras = [];

            if (target === 'f_res' || !target) {
                let q1 = parseFloat(f.q1.value), q2 = parseFloat(f.q2.value), r = parseFloat(f.r.value);
                if (isNaN(q1) || isNaN(q2) || isNaN(r) || r === 0) return null;
                let F = k * q1 * q2 / (r * r);
                let signo = q1 * q2 >= 0 ? 'repulsiva' : 'atractiva';
                main = `${F.toFixed(6)} N`; label = 'Fuerza eléctrica';
                steps = [`F = ${k.toExponential(3)} × ${q1} × ${q2} / ${r}²`];
                extras.push({ cls: 'info', txt: `Fuerza ${signo}` });
                if (F > 1) extras.push({ cls: 'warn', txt: 'Fuerza muy grande: posiblemente valores irreales' });
                return { main, label, extras, steps,
                    chart(canvas) { FisicaVisual.ley_coulomb(canvas, q1, q2, r, F); } };
            } else if (target === 'q1') {
                let F = parseFloat(f.f_res.value), q2 = parseFloat(f.q2.value), r = parseFloat(f.r.value);
                if (isNaN(F) || isNaN(q2) || isNaN(r) || r === 0 || q2 === 0) return null;
                let q1 = F * r * r / (k * q2);
                return { main: `${q1.toExponential(6)} C`, label: 'Carga q₁',
                    steps: [`q₁ = ${F} × ${r}² / (k × ${q2})`], extras,
                    chart(canvas) { FisicaVisual.ley_coulomb(canvas, q1, q2, r, F); } };
            } else if (target === 'q2') {
                let F = parseFloat(f.f_res.value), q1 = parseFloat(f.q1.value), r = parseFloat(f.r.value);
                if (isNaN(F) || isNaN(q1) || isNaN(r) || r === 0 || q1 === 0) return null;
                let q2 = F * r * r / (k * q1);
                return { main: `${q2.toExponential(6)} C`, label: 'Carga q₂',
                    steps: [`q₂ = ${F} × ${r}² / (k × ${q1})`], extras,
                    chart(canvas) { FisicaVisual.ley_coulomb(canvas, q1, q2, r, F); } };
            } else if (target === 'r') {
                let F = parseFloat(f.f_res.value), q1 = parseFloat(f.q1.value), q2 = parseFloat(f.q2.value);
                if (isNaN(F) || isNaN(q1) || isNaN(q2) || F === 0 || q1 === 0 || q2 === 0) return null;
                let r = Math.sqrt(k * q1 * q2 / F);
                return { main: `${r.toFixed(6)} m`, label: 'Distancia',
                    steps: [`r = √(k × ${q1} × ${q2} / ${F})`], extras,
                    chart(canvas) { FisicaVisual.ley_coulomb(canvas, q1, q2, r, F); } };
            }
            return null;
        }
    },
    campo_electrico: {
        title: 'Campo Eléctrico',
        formula: 'E = F / q',
        vars: [
            { id: 'e_res', label: 'Campo (E)' },
            { id: 'f_res', label: 'Fuerza (F)' },
            { id: 'q', label: 'Carga (q)' }
        ],
        fields: [
            { id: 'e_res', label: 'Campo E (N/C)', val: '' },
            { id: 'f_res', label: 'Fuerza (N)', val: '1e-3' },
            { id: 'q', label: 'Carga (C)', val: '1e-6' }
        ],
        onChange(target, f) {
            Object.keys(f).forEach(key => {
                f[key].disabled = (key === target);
                if (key === target) f[key].value = '';
            });
        },
        calc(f, target) {
            let main, label, steps = [], extras = [];
            if (target === 'e_res' || !target) {
                let F = parseFloat(f.f_res.value), q = parseFloat(f.q.value);
                if (isNaN(F) || isNaN(q) || q === 0) return null;
                let E = F / q;
                main = `${E.toExponential(4)} N/C`; label = 'Campo Eléctrico';
                steps = [`E = ${F} / ${q}`];
                extras.push({ cls: 'info', txt: `Dirección: ${E >= 0 ? 'misma dirección que F' : 'opuesta a F'}` });
                return { main, label, extras, steps,
                    chart(canvas) { FisicaVisual.campo_electrico(canvas, F, q, E); } };
            } else if (target === 'f_res') {
                let E = parseFloat(f.e_res.value), q = parseFloat(f.q.value);
                if (isNaN(E) || isNaN(q)) return null;
                let F = E * q;
                return { main: `${F.toExponential(4)} N`, label: 'Fuerza',
                    steps: [`F = ${E} × ${q}`], extras,
                    chart(canvas) { FisicaVisual.campo_electrico(canvas, F, q, E); } };
            } else if (target === 'q') {
                let E = parseFloat(f.e_res.value), F = parseFloat(f.f_res.value);
                if (isNaN(E) || isNaN(F) || E === 0) return null;
                let q = F / E;
                return { main: `${q.toExponential(4)} C`, label: 'Carga',
                    steps: [`q = ${F} / ${E}`], extras,
                    chart(canvas) { FisicaVisual.campo_electrico(canvas, F, q, E); } };
            }
            return null;
        }
    },
    potencial_electrico: {
        title: 'Potencial Eléctrico',
        formula: 'V = k · q / r',
        fields: [
            { id: 'q', label: 'Carga q (C)', val: '1e-6' },
            { id: 'r', label: 'Distancia r (m)', val: '0.5' },
            { id: 'v_res', label: 'Potencial V (V)', val: '' }
        ],
        onChange(target, f) {
            Object.keys(f).forEach(key => {
                f[key].disabled = (key === target);
                if (key === target) f[key].value = '';
            });
        },
        calc(f, target) {
            const k = 8.987551787e9;
            let main, label, steps = [], extras = [];
            if (target === 'v_res' || !target) {
                let q = parseFloat(f.q.value), r = parseFloat(f.r.value);
                if (isNaN(q) || isNaN(r) || r === 0) return null;
                let V = k * q / r;
                main = `${V.toExponential(4)} V`; label = 'Potencial Eléctrico';
                steps = [`V = ${k.toExponential(3)} × ${q} / ${r}`];
                extras.push({ cls: 'info', txt: `Signo: ${V >= 0 ? 'potencial positivo (q > 0)' : 'potencial negativo (q < 0)'}` });
                return { main, label, extras, steps,
                    chart(canvas) { FisicaVisual.potencial_electrico(canvas, q, r, V); } };
            } else if (target === 'q') {
                let V = parseFloat(f.v_res.value), r = parseFloat(f.r.value);
                if (isNaN(V) || isNaN(r) || r === 0) return null;
                let q = V * r / k;
                return { main: `${q.toExponential(6)} C`, label: 'Carga',
                    steps: [`q = ${V} × ${r} / k`], extras,
                    chart(canvas) { FisicaVisual.potencial_electrico(canvas, q, r, V); } };
            } else if (target === 'r') {
                let V = parseFloat(f.v_res.value), q = parseFloat(f.q.value);
                if (isNaN(V) || isNaN(q) || V === 0) return null;
                let r = k * q / V;
                return { main: `${r.toExponential(4)} m`, label: 'Distancia',
                    steps: [`r = k × ${q} / ${V}`], extras,
                    chart(canvas) { FisicaVisual.potencial_electrico(canvas, q, r, V); } };
            }
            return null;
        }
    }
});
