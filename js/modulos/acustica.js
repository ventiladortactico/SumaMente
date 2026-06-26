FORMS.acust = {
    spl: {
        title: 'Nivel de Presión Sonora (dB SPL)',
        formula: 'Lp = 20 × log10(P / 20µPa)',
        fields: [{ id: 'presion', label: 'Presión (Pa)', val: '0.02' }],
        calc(f) {
            let p = parseFloat(f.presion.value);
            if (isNaN(p) || p <= 0) return { error: true, msg: "La presión debe ser mayor a 0", label: "Error" };
            let db = 20 * Math.log10(p / 0.00002);
            let ref = db < 30 ? 'Susurro' : db < 70 ? 'Conversación' : db < 90 ? 'Tráfico pesado' : 'Umbral de dolor';
            
            // Actualización de volumen en tiempo real si el tono continuo está encendido
            if (AcusticaAudio.isPlaying) {
                // Mapeamos el nivel de dB a un volumen intermedio cómodo (0.0 a 0.4)
                AcusticaAudio.updateVolume(Math.min(db / 120, 0.4));
            }

            return {
                main: `${db.toFixed(1)} dB SPL`,
                label: 'Nivel Sonoro',
                extras: [
                    { cls: (db > 85 ? 'danger' : 'info'), txt: `Referencia: ${ref}` },
                    { cls: 'ok', txt: '🔊 Activar/Desactivar Tono Continuo interactivo' }
                ],
                steps: [`Lp = 20 * log10(${p} / 2e-5)`],
                chart(canvas) {
                    AcusticaVisual.spl(canvas, db);
                }
            };
        }
    },
    onda: {
        title: 'Longitud de Onda y Frecuencia',
        formula: 'λ = v / f  |  f = v / λ',
        vars: [{ id: 'l_out', label: 'Calcular λ (Longitud)' }, { id: 'f_out', label: 'Calcular f (Frecuencia)' }],
        fields: [
            { id: 'v', label: 'Velocidad (m/s)', val: '343' },
            { id: 'freq', label: 'Frecuencia (Hz)', val: '1000' },
            { id: 'long', label: 'Longitud de onda (m)', val: '' }
        ],
        onChange(target, f) {
            if (target === 'l_out') {
                f.long.disabled = true; f.long.value = '';
                f.freq.disabled = false;
            } else if (target === 'f_out') {
                f.freq.disabled = true; f.freq.value = '';
                f.long.disabled = false;
            }
        },
        calc(f, target) {
            let v = parseFloat(f.v.value);
            let freq, long;
            
            if (target === 'l_out') {
                freq = parseFloat(f.freq.value);
                if (freq <= 0) return { error: true, msg: "Frecuencia debe ser > 0", label: "Error" };
                long = v / freq;
                
                // Modificación interactiva de audio en vivo
                if (AcusticaAudio.isPlaying) AcusticaAudio.updateFrequency(freq);

                return {
                    main: `${long.toFixed(3)} m`,
                    label: 'Longitud de onda (λ)',
                    extras: [
                        { cls: 'info', txt: `Frecuencia: ${freq} Hz` },
                        { cls: 'ok', txt: '🔊 Activar/Desactivar Tono Continuo interactivo' }
                    ],
                    steps: [`λ = ${v} / ${freq}`],
                    chart(canvas) {
                        AcusticaVisual.onda(canvas, freq, long);
                    }
                };
            } else {
                long = parseFloat(f.long.value);
                if (long <= 0) return { error: true, msg: "Longitud debe ser > 0", label: "Error" };
                freq = v / long;
                
                // Modificación interactiva de audio en vivo
                if (AcusticaAudio.isPlaying) AcusticaAudio.updateFrequency(freq);

                return {
                    main: `${freq.toFixed(1)} Hz`,
                    label: 'Frecuencia (f)',
                    extras: [
                        { cls: 'info', txt: `Longitud: ${long.toFixed(3)} m` },
                        { cls: 'ok', txt: '🔊 Activar/Desactivar Tono Continuo interactivo' }
                    ],
                    steps: [`f = ${v} / ${long}`],
                    chart(canvas) {
                        AcusticaVisual.onda(canvas, freq, long);
                    }
                };
            }
        }
    },
    v_aire: {
        title: 'Velocidad del Sonido en Aire',
        formula: 'v ≈ 331.3 + 0.606 × T(°C)',
        fields: [{ id: 'temp', label: 'Temperatura (°C)', val: '20' }],
        calc(f) {
            let t = parseFloat(f.temp.value);
            if (isNaN(t) || t < -273.15) return null;
            let v = 331.3 + 0.606 * t;
            return {
                main: `${v.toFixed(2)} m/s`,
                label: 'Velocidad del sonido',
                extras: [{ cls: 'info', txt: `${(v * 3.6).toFixed(1)} km/h` }],
                steps: [`v = 331.3 + (0.606 * ${t})`],
                chart(canvas) {
                    AcusticaVisual.velocidad(canvas, v, t);
                }
            };
        }
    },
    rt60: {
        title: 'Tiempo de Reverberación (Sabine)',
        formula: 'RT60 = 0.161 × V / A',
        fields: [
            { id: 'vol', label: 'Volumen sala (m³)', val: '100' },
            { id: 'abs', label: 'Absorción total (Sabines)', val: '20' }
        ],
        calc(f) {
            let v = parseFloat(f.vol.value), a = parseFloat(f.abs.value);
            if (v <= 0 || a <= 0) return { error: true, msg: "Volumen y absorción deben ser > 0", label: "Error" };
            let rt = 0.161 * v / a;
            let cat = rt < 0.6 ? 'Grabación seca' : rt < 1.2 ? 'Habla/Oficina' : 'Música/Concierto';
            return {
                main: `${rt.toFixed(2)} s`,
                label: 'RT60 estimado',
                extras: [{ cls: 'ok', txt: `Uso ideal: ${cat}` }],
                steps: [`RT60 = 0.161 * ${v} / ${a}`],
                chart(canvas) {
                    AcusticaVisual.reverberacion(canvas, rt, cat);
                }
            };
        }
    },
    dist: {
        title: 'Ley del Cuadrado Inverso',
        formula: 'ΔdB = 20 × log10(d2 / d1)',
        fields: [
            { id: 'd1', label: 'Distancia inicial (m)', val: '1' },
            { id: 'd2', label: 'Distancia final (m)', val: '2' }
        ],
        calc(f) {
            let d1 = parseFloat(f.d1.value), d2 = parseFloat(f.d2.value);
            if (isNaN(d1) || isNaN(d2)) return null;
            if (d1 <= 0 || d2 <= 0) return { error: true, msg: "Las distancias deben ser mayores a 0", label: "Error Físico" };
            let ddB = 20 * Math.log10(d2 / d1);
            return {
                main: `-${ddB.toFixed(1)} dB`,
                label: 'Caída de nivel',
                extras: [{ cls: 'warn', txt: `A doble distancia cae 6 dB` }],
                steps: [`Caída = 20 * log10(${d2} / ${d1})`],
                chart(canvas) {
                    AcusticaVisual.distancia(canvas, d1, d2, ddB);
                }
            };
        }
    }
};

if (!FORMS.acust) FORMS.acust = {};
Object.assign(FORMS.acust, {
    doppler: {
        title: 'Efecto Doppler',
        formula: "f' = f × (v + vo) / (v + vs)",
        fields: [
            { id: 'f', label: 'Frecuencia fuente (Hz)', val: '440' },
            { id: 'v', label: 'Velocidad sonido (m/s)', val: '343' },
            { id: 'vo', label: 'Velocidad observador (m/s)', val: '0' },
            { id: 'vs', label: 'Velocidad fuente (m/s)', val: '10' }
        ],
        calc(f) {
            let fo = parseFloat(f.f.value), v = parseFloat(f.v.value), vo = parseFloat(f.vo.value), vs = parseFloat(f.vs.value);
            if (isNaN(fo) || isNaN(v) || isNaN(vo) || isNaN(vs)) return null;
            if (fo <= 0 || v <= 0) return { error: true, msg: "Frecuencia y velocidad deben ser > 0", label: "Error" };
            if (v + vs <= 0) return { error: true, msg: "Velocidades inválidas", label: "Error" };
            let fp = fo * (v + vo) / (v + vs);
            let desc = fp > fo ? 'Acercamiento (más agudo)' : fp < fo ? 'Alejamiento (más grave)' : 'Sin movimiento relativo';
            if (AcusticaAudio.isPlaying) AcusticaAudio.updateFrequency(fp);
            return {
                main: `${fp.toFixed(2)} Hz`,
                label: 'Frecuencia percibida',
                extras: [{ cls: 'ok', txt: desc }],
                steps: ["f' = " + fo + " × (" + v + " + " + vo + ") / (" + v + " + " + vs + ") = " + fp.toFixed(2) + " Hz"],
                chart(canvas) {
                    AcusticaVisual.doppler(canvas, fp, fo, vs, vo, v);
                }
            };
        }
    },
    resonancia: {
        title: 'Resonancia en Tubos',
        formula: 'f_n = n × v / (2L)  |  f_n = n × v / (4L)',
        fields: [
            { id: 'n', label: 'Armónico (n)', val: '1' },
            { id: 'v', label: 'Velocidad sonido (m/s)', val: '343' },
            { id: 'L', label: 'Longitud tubo (m)', val: '0.5' },
            { id: 'tipo', label: 'Tipo de tubo', type: 'select', opts: [
                { v: 'abierto', l: 'Abierto (ambos extremos)' },
                { v: 'cerrado', l: 'Cerrado (un extremo)' }
            ]}
        ],
        calc(f) {
            let n = parseInt(f.n.value), v = parseFloat(f.v.value), L = parseFloat(f.L.value), tipo = f.tipo.value;
            if (isNaN(n) || isNaN(v) || isNaN(L) || n < 1) return { error: true, msg: "n debe ser ≥ 1", label: "Error" };
            if (L <= 0 || v <= 0) return { error: true, msg: "Longitud y velocidad deben ser > 0", label: "Error" };
            let fn, tipoStr;
            if (tipo === 'abierto') {
                fn = n * v / (2 * L);
                tipoStr = 'Abierto';
            } else {
                fn = n * v / (4 * L);
                tipoStr = 'Cerrado';
            }
            if (AcusticaAudio.isPlaying) AcusticaAudio.updateFrequency(fn);
            return {
                main: fn.toFixed(2) + " Hz",
                label: 'Frecuencia de resonancia',
                extras: [{ cls: 'info', txt: 'Tubo ' + tipoStr + ' | n=' + n + ' | L=' + L + 'm' }],
                steps: ["f_" + n + " = " + n + " × " + v + " / (" + (tipo === 'abierto' ? 2 : 4) + " × " + L + ") = " + fn.toFixed(2) + " Hz"],
                chart(canvas) {
                    AcusticaVisual.resonancia(canvas, fn, n, v, L, tipo);
                }
            };
        }
    },
    armonicos: {
        title: 'Serie Armónica',
        formula: 'f_n = n × f_1',
        fields: [
            { id: 'f1', label: 'Frecuencia fundamental (Hz)', val: '110' },
            { id: 'n_max', label: 'Armónico máximo', type: 'select', opts: [
                { v: '5', l: '5 armónicos' },
                { v: '8', l: '8 armónicos' },
                { v: '12', l: '12 armónicos' }
            ]}
        ],
        calc(f) {
            let f1 = parseFloat(f.f1.value), nmax = parseInt(f.n_max.value);
            if (isNaN(f1) || f1 <= 0) return { error: true, msg: "Frecuencia debe ser > 0", label: "Error" };
            let armonicos = [];
            for (let i = 1; i <= nmax; i++) {
                armonicos.push({ n: i, f: i * f1 });
            }
            let lista = armonicos.slice(0, 5).map(a => a.n + ':' + a.f.toFixed(0) + 'Hz').join(' | ');
            let extra = nmax > 5 ? ' ... hasta n=' + nmax : '';
            if (AcusticaAudio.isPlaying) AcusticaAudio.updateFrequency(f1);
            return {
                main: armonicos[0].f.toFixed(0) + '–' + armonicos[nmax-1].f.toFixed(0) + ' Hz',
                label: nmax + ' armónicos',
                extras: [{ cls: 'info', txt: lista + extra }],
                steps: ['f_n = n × ' + f1.toFixed(1) + ' para n=1..' + nmax],
                chart(canvas) {
                    AcusticaVisual.armonicos(canvas, f1, nmax, armonicos);
                }
            };
        }
    },
    absorcion: {
        title: 'Coeficiente de Absorción Acústica',
        formula: 'A_total = Σ S_i × α_i',
        fields: [
            { id: 'coef', label: 'Coeficiente α del material', val: '0.7' },
            { id: 'area', label: 'Área del material (m²)', val: '10' }
        ],
        calc(f) {
            let a = parseFloat(f.coef.value), s = parseFloat(f.area.value);
            if (isNaN(a) || isNaN(s) || a < 0 || a > 1) return { error: true, msg: "α debe estar entre 0 y 1", label: "Error" };
            if (s <= 0) return { error: true, msg: "Área debe ser > 0", label: "Error" };
            let absorcion = a * s;
            return {
                main: absorcion.toFixed(2) + ' Sabines',
                label: 'Absorción total',
                extras: [{ cls: a > 0.5 ? 'ok' : 'warn', txt: a > 0.5 ? 'Material absorbente' : 'Poco absorbente' }],
                steps: ['A = ' + s + ' × ' + a + ' = ' + absorcion.toFixed(2) + ' Sabines'],
                chart(canvas) {
                    AcusticaVisual.absorcion(canvas, a, s, absorcion);
                }
            };
        }
    },
    batidos: {
        title: 'Batidos (Pulsaciones)',
        formula: 'f_b = |f_1 − f_2|',
        fields: [
            { id: 'f1', label: 'Frecuencia 1 (Hz)', val: '440' },
            { id: 'f2', label: 'Frecuencia 2 (Hz)', val: '444' }
        ],
        calc(f) {
            let f1 = parseFloat(f.f1.value), f2 = parseFloat(f.f2.value);
            if (isNaN(f1) || isNaN(f2) || f1 <= 0 || f2 <= 0) return { error: true, msg: "Frecuencias deben ser > 0", label: "Error" };
            let fb = Math.abs(f1 - f2);
            if (AcusticaAudio.isPlaying) AcusticaAudio.updateFrequency(f1);
            return {
                main: fb.toFixed(2) + ' Hz',
                label: 'Frecuencia de batido',
                extras: [{ cls: fb < 20 ? 'ok' : 'warn', txt: fb < 20 ? 'Perceptible como pulsación' : 'Muy rápida (>20 Hz)' }],
                steps: ['f_b = |' + f1 + ' − ' + f2 + '| = ' + fb.toFixed(2) + ' Hz'],
                chart(canvas) {
                    AcusticaVisual.batidos(canvas, f1, f2, fb);
                }
            };
        }
    },
    periodo_sonido: {
        title: 'Período del Sonido',
        formula: 'T = 1 / f',
        fields: [
            { id: 'f', label: 'Frecuencia (Hz)', val: '440' }
        ],
        calc(f) {
            let freq = parseFloat(f.f.value);
            if (isNaN(freq) || freq <= 0) return { error: true, msg: "Frecuencia debe ser > 0", label: "Error" };
            let T = 1 / freq;
            if (AcusticaAudio.isPlaying) AcusticaAudio.updateFrequency(freq);
            return {
                main: (T * 1000).toFixed(3) + ' ms',
                label: 'Período',
                extras: [{ cls: 'info', txt: 'T = ' + T.toFixed(6) + ' s' }],
                steps: ['T = 1 / ' + freq + ' = ' + T.toFixed(6) + ' s'],
                chart(canvas) {
                    AcusticaVisual.periodo_sonido(canvas, freq, T);
                }
            };
        }
    },
    potencia_sonora: {
        title: 'Nivel de Potencia Sonora',
        formula: 'L_w = 10 × log₁₀(W / 10⁻¹²)',
        fields: [
            { id: 'w', label: 'Potencia acústica (W)', val: '0.001' }
        ],
        calc(f) {
            let w = parseFloat(f.w.value);
            if (isNaN(w) || w <= 0) return { error: true, msg: "Potencia debe ser > 0", label: "Error" };
            let lw = 10 * Math.log10(w / 1e-12);
            let ref = lw < 30 ? 'Susurro' : lw < 60 ? 'Conversación' : lw < 90 ? 'Taladradora' : 'Avión';
            return {
                main: lw.toFixed(1) + ' dB',
                label: 'Nivel de potencia (Lw)',
                extras: [{ cls: 'ok', txt: 'Referencia: ' + ref }],
                steps: ['L_w = 10 × log₁₀(' + w + ' / 10⁻¹²) = ' + lw.toFixed(1) + ' dB'],
                chart(canvas) {
                    AcusticaVisual.potencia_sonora(canvas, w, lw);
                }
            };
        }
    },
    sonoridad: {
        title: 'Nivel de Sonoridad (Fonos)',
        formula: 'L_N ≈ dB SPL + curva isofónica',
        fields: [
            { id: 'spl', label: 'Nivel dB SPL', val: '70' },
            { id: 'freq_son', label: 'Frecuencia (Hz)', type: 'select', opts: [
                { v: '125', l: '125 Hz' },
                { v: '250', l: '250 Hz' },
                { v: '500', l: '500 Hz' },
                { v: '1000', l: '1000 Hz (ref.)' },
                { v: '2000', l: '2000 Hz' },
                { v: '4000', l: '4000 Hz' }
            ]}
        ],
        calc(f) {
            let db = parseFloat(f.spl.value), freq = parseInt(f.freq_son.value);
            if (isNaN(db) || db < 0) return { error: true, msg: "dB SPL debe ser ≥ 0", label: "Error" };
            let corr = 0;
            if (freq === 125) corr = db < 40 ? 16 : db < 60 ? 12 : 8;
            else if (freq === 250) corr = db < 40 ? 9 : db < 60 ? 6 : 4;
            else if (freq === 500) corr = db < 40 ? 4 : db < 60 ? 2 : 1;
            else if (freq === 1000) corr = 0;
            else if (freq === 2000) corr = -2;
            else if (freq === 4000) corr = -4;
            let fonos = Math.max(0, db - corr);
            if (AcusticaAudio.isPlaying) AcusticaAudio.updateFrequency(freq);
            return {
                main: fonos.toFixed(0) + ' fonos',
                label: 'Nivel de sonoridad',
                extras: [{ cls: 'info', txt: 'Corrección para ' + freq + ' Hz: ' + (corr > 0 ? '−' : '+') + Math.abs(corr) + ' dB' }],
                steps: ['L_N = ' + db + ' − ' + corr + ' (corr. ' + freq + ' Hz) = ' + fonos.toFixed(0) + ' fonos'],
                chart(canvas) {
                    AcusticaVisual.sonoridad(canvas, db, freq, fonos);
                }
            };
        }
    },
    aislacion: {
        title: 'Aislamiento Acústico (Ley de Masa)',
        formula: 'R = 20 × log₁₀(f × m) − 47',
        fields: [
            { id: 'masa', label: 'Masa superficial (kg/m²)', val: '10' },
            { id: 'frec_a', label: 'Frecuencia (Hz)', val: '500' }
        ],
        calc(f) {
            let m = parseFloat(f.masa.value), freq = parseFloat(f.frec_a.value);
            if (isNaN(m) || isNaN(freq) || m <= 0 || freq <= 0) return { error: true, msg: "Valores deben ser > 0", label: "Error" };
            let R = 20 * Math.log10(freq * m) - 47;
            let cat = R < 25 ? 'Bajo' : R < 40 ? 'Medio' : R < 50 ? 'Bueno' : 'Excelente';
            if (AcusticaAudio.isPlaying) AcusticaAudio.updateFrequency(freq);
            return {
                main: R.toFixed(1) + ' dB',
                label: 'Reducción acústica (R)',
                extras: [{ cls: R >= 40 ? 'ok' : 'warn', txt: 'Aislamiento: ' + cat }],
                steps: ['R = 20 × log₁₀(' + freq + ' × ' + m + ') − 47 = ' + R.toFixed(1) + ' dB'],
                chart(canvas) {
                    AcusticaVisual.aislacion(canvas, R, m, freq);
                }
            };
        }
    },
    ruido_fondo: {
        title: 'Ruido de Fondo (NR / NC)',
        formula: 'NR = L_p − 5  |  NC = L_p − 4',
        fields: [
            { id: 'lp', label: 'Nivel de presión (dB)', val: '55' },
            { id: 'curve', label: 'Curva', type: 'select', opts: [
                { v: 'nr', l: 'NR (Noise Rating)' },
                { v: 'nc', l: 'NC (Noise Criteria)' }
            ]}
        ],
        calc(f) {
            let lp = parseFloat(f.lp.value), curve = f.curve.value;
            if (isNaN(lp) || lp < 0) return { error: true, msg: "dB SPL debe ser ≥ 0", label: "Error" };
            let idx = curve === 'nr' ? lp - 5 : lp - 4;
            let confort = idx < 25 ? 'Silencio' : idx < 35 ? 'Muy silencioso' : idx < 50 ? 'Aceptable' : 'Ruidoso';
            return {
                main: curve.toUpperCase() + Math.round(idx),
                label: 'Índice ' + curve.toUpperCase(),
                extras: [{ cls: idx < 50 ? 'ok' : 'warn', txt: 'Condición: ' + confort }],
                steps: [curve.toUpperCase() + ' = ' + lp + ' − ' + (curve === 'nr' ? 5 : 4) + ' = ' + idx.toFixed(1)],
                chart(canvas) {
                    AcusticaVisual.ruido_fondo(canvas, lp, idx, curve, confort);
                }
            };
        }
    }
});