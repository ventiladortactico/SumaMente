FORMS.estad = {
    basica: {
        title: 'Estadística Descriptiva',
        formula: 'Análisis de tendencia central y dispersión',
        fields: [{ id: 'data', label: 'Datos (separados por espacio)', type: 'text', val: '10 15 15 20 25' }],
        calc(f) {
            let raw = f.data.value.trim().split(/[\s,]+/);
            let nums = raw.map(Number).filter(n => !isNaN(n)).sort((a,b) => a-b);
            if (nums.length < 2) return { error: true, msg: "Ingresá al menos 2 números", label: "Insuficiente" };

            let n = nums.length;
            let suma = nums.reduce((a, b) => a + b, 0);
            let media = suma / n;
            
            let med = n % 2 === 0 ? (nums[n/2-1] + nums[n/2]) / 2 : nums[Math.floor(n/2)];

            let varz = nums.reduce((a, b) => a + Math.pow(b - media, 2), 0) / (n - 1);
            let sd = Math.sqrt(varz);

            return {
                main: `Media: ${media.toFixed(2)}`,
                label: `N = ${n} muestras`,
                extras: [
                    { cls: 'info', txt: `Mediana: ${med} | Rango: ${nums[n-1] - nums[0]}` },
                    { cls: 'info', txt: `Desv. Estándar (s): ${sd.toFixed(3)}` },
                    { cls: 'ok', txt: `Suma total: ${suma}` }
                ],
                steps: [`Media = Σx / n = ${suma} / ${n}`, `s = √(Σ(x-μ)² / (n-1))`],
                chart(canvas) {
                    EstadisticaVisual.basica(canvas, nums, media, med, sd);
                }
            };
        }
    },
    percentiles: {
        title: 'Percentiles y Cuartiles',
        formula: 'Posición de datos P_k = k * (n + 1) / 100',
        fields: [
            { id: 'data', label: 'Datos (separados por espacio)', type: 'text', val: '3 5 7 8 9 11 13 15' },
            { id: 'k', label: 'Percentil deseado (k: 1-99)', type: 'text', val: '75' }
        ],
        calc(f) {
            let raw = f.data.value.trim().split(/[\s,]+/);
            let nums = raw.map(Number).filter(n => !isNaN(n)).sort((a,b) => a-b);
            let k = parseFloat(f.k.value);

            if (nums.length < 2) return { error: true, msg: "Faltan datos", label: "Error" };
            if (isNaN(k) || k < 1 || k > 99) return { error: true, msg: "k debe estar entre 1 y 99", label: "Rango Inválido" };

            let n = nums.length;
            // Método de interpolación lineal estándar
            let idx = (k / 100) * (n - 1);
            let low = Math.floor(idx);
            let high = Math.ceil(idx);
            let pVal = nums[low] + (idx - low) * (nums[high] - nums[low]);

            return {
                main: `P(${k}) = ${pVal.toFixed(2)}`,
                label: `Percentil ${k}`,
                extras: [
                    { cls: 'info', txt: `Valor mínimo: ${nums[0]} | Máximo: ${nums[n-1]}` },
                    { cls: 'ok', txt: `Índice calculado pos: ${idx.toFixed(2)}` }
                ],
                steps: [`Posición aproximada = (${k}/100) * (${n}-1)`],
                chart(canvas) {
                    EstadisticaVisual.percentiles(canvas, nums, idx, pVal, k);
                }
            };
        }
    },
    regresion: {
        title: 'Regresión Lineal Simple',
        formula: 'y = mx + b',
        fields: [
            { id: 'x_vals', label: 'Valores X (ej: 1 2 3)', type: 'text', val: '1 2 3 4 5' },
            { id: 'y_vals', label: 'Valores Y (ej: 2 4 5)', type: 'text', val: '3 5 7 9 11' }
        ],
        calc(f) {
            let x = f.x_vals.value.trim().split(/[\s,]+/).map(Number);
            let y = f.y_vals.value.trim().split(/[\s,]+/).map(Number);
            if (x.length !== y.length || x.length < 2) return { error: true, msg: "X e Y deben tener la misma cantidad de datos (min 2)", label: "Desajuste" };

            let n = x.length;
            let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
            for (let i = 0; i < n; i++) {
                sumX += x[i]; sumY += y[i];
                sumXY += x[i] * y[i]; sumXX += x[i] * x[i];
            }
            let m = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
            let b = (sumY - m * sumX) / n;

            return {
                main: `y = ${m.toFixed(2)}x + ${b.toFixed(2)}`,
                label: 'Ecuación de la recta',
                extras: [{ cls: 'info', txt: `Pendiente (m): ${m.toFixed(4)}` }, { cls: 'info', txt: `Intersección (b): ${b.toFixed(4)}` }],
                steps: [`m = (nΣxy - ΣxΣy) / (nΣx² - (Σx)²)`, `b = (Σy - mΣx) / n`],
                chart(canvas) {
                    EstadisticaVisual.regresion(canvas, x, y, m, b);
                }
            };
        }
    },
    normal: {
        title: 'Distribución Normal (Z-Score)',
        formula: 'Z = (x − μ) / σ',
        fields: [
            { id: 'x', label: 'Valor (x)', val: '115' },
            { id: 'm', label: 'Media (μ)', val: '100' },
            { id: 's', label: 'Desv. Estándar (σ)', val: '15' }
        ],
        calc(f) {
            let x = parseFloat(f.x.value), m = parseFloat(f.m.value), s = parseFloat(f.s.value);
            if (isNaN(x) || isNaN(m) || isNaN(s)) return null;
            if (s <= 0) return { error: true, msg: "σ debe ser mayor a 0", label: "Error" };
            let z = (x - m) / s;
            return { 
                main: `Z = ${z.toFixed(4)}`,
                label: 'Puntaje Z',
                extras: [{ cls: 'info', txt: `A ${z.toFixed(2)} desviaciones de la media` }],
                steps: [`Z = (${x} - ${m}) / ${s}`],
                chart(canvas) {
                    EstadisticaVisual.normal(canvas, x, m, s);
                }
            };
        }
    },
    confianza: {
        title: 'Intervalo de Confianza (Media)',
        formula: 'IC = x̄ ± Z * (s / √n)',
        fields: [
            { id: 'media', label: 'Media muestral (x̄)', val: '50' },
            { id: 'sd', label: 'Desv. Estándar (s)', val: '10' },
            { id: 'n', label: 'Tamaño muestra (n)', val: '30' },
            { id: 'conf', label: 'Confianza (90, 95 o 99%)', val: '95' }
        ],
        calc(f) {
            let xBar = parseFloat(f.media.value), s = parseFloat(f.sd.value), n = parseFloat(f.n.value), c = parseFloat(f.conf.value);
            if (s <= 0 || n <= 1) return { error: true, msg: "Parámetros inválidos (n > 1, s > 0)", label: "Error" };
            
            // Valores Z críticos estándar
            let z = 1.96; 
            if (c === 90) z = 1.645;
            else if (c === 99) z = 2.576;

            let margen = z * (s / Math.sqrt(n));
            let li = xBar - margen;
            let ls = xBar + margen;

            return {
                main: `[${li.toFixed(2)} ; ${ls.toFixed(2)}]`,
                label: `Intervalo de Confianza al ${c}%`,
                extras: [{ cls: 'warn', txt: `Margen de Error (E): ±${margen.toFixed(3)}` }],
                steps: [`Error estándar = ${s} / √${n}`, `Margen = ${z} * Error est.`],
                chart(canvas) {
                    EstadisticaVisual.confianza(canvas, li, ls, xBar);
                }
            };
        }
    },
    combinatoria: {
        title: 'Combinatoria y Permutaciones',
        formula: 'nCr = n! / (r!(n-r)!)  |  nPr = n! / (n-r)!',
        fields: [
            { id: 'n', label: 'Elementos Totales (n)', val: '5' },
            { id: 'r', label: 'Elementos Elegidos (r)', val: '3' }
        ],
        calc(f) {
            let n = parseInt(f.n.value), r = parseInt(f.r.value);
            if (isNaN(n) || isNaN(r) || n < 0 || r < 0 || r > n) {
                return { error: true, msg: "Requisitos: n >= r >= 0", label: "Matemática Errónea" };
            }

            const fact = num => num <= 1 ? 1 : num * fact(num - 1);
            
            let comb = fact(n) / (fact(r) * fact(n - r));
            let perm = fact(n) / fact(n - r);

            return {
                main: `nCr: ${comb} | nPr: ${perm}`,
                label: 'Combinaciones y Permutaciones',
                extras: [
                    { cls: 'ok', txt: `Formas de agrupar sin importar orden (nCr): ${comb}` },
                    { cls: 'info', txt: `Formas donde sí importa el orden (nPr): ${perm}` }
                ],
                steps: [`nCr = ${n}! / (${r}! * (${n}-${r})!)`],
                chart(canvas) {
                    EstadisticaVisual.combinatoria(canvas, comb, perm);
                }
            };
        }
    }
};

if (!FORMS.estad) FORMS.estad = {};
Object.assign(FORMS.estad, {

    media_geo: {
        title: 'Media Geométrica y Armónica',
        formula: 'G = (∏x)^(1/n)  |  H = n / ∑(1/x)',
        fields: [{ id: 'data', label: 'Datos (separados por espacio)', type: 'text', val: '2 4 8 16' }],
        calc(f) {
            let raw = f.data.value.trim().split(/[\s,]+/);
            let nums = raw.map(Number).filter(n => !isNaN(n) && n > 0);
            if (nums.length < 2) return { error: true, msg: "Ingresá al menos 2 números positivos", label: "Insuficiente" };
            let n = nums.length;
            let prod = nums.reduce((a, b) => a * b, 1);
            let geo = Math.pow(prod, 1 / n);
            let sumInv = nums.reduce((a, b) => a + 1 / b, 0);
            let harm = n / sumInv;
            let arith = nums.reduce((a, b) => a + b, 0) / n;
            return {
                main: `G: ${geo.toFixed(4)} | H: ${harm.toFixed(4)}`,
                label: `n = ${n}`,
                extras: [
                    { cls: 'info', txt: `Media aritmética: ${arith.toFixed(4)}` },
                    { cls: 'ok', txt: `G ≥ H (${geo.toFixed(4)} ≥ ${harm.toFixed(4)})` }
                ],
                steps: [`G = (${nums.join(' × ')})^(1/${n})`, `H = ${n} / (${nums.map(v => '1/' + v).join(' + ')})`],
                chart(canvas) { EstadisticaVisual.media_geo(canvas, arith, geo, harm); }
            };
        }
    },

    probabilidad: {
        title: 'Probabilidad Simple',
        formula: 'P = Casos favorables / Casos posibles',
        fields: [
            { id: 'favorables', label: 'Casos favorables', val: '1' },
            { id: 'posibles', label: 'Casos posibles', val: '6' }
        ],
        calc(f) {
            let fav = parseInt(f.favorables.value);
            let pos = parseInt(f.posibles.value);
            if (isNaN(fav) || isNaN(pos) || pos <= 0 || fav < 0) return { error: true, msg: "Valores inválidos", label: "Error" };
            if (fav > pos) return { error: true, msg: "Favorables no puede superar a posibles", label: "Error" };
            let p = fav / pos;
            let pct = p * 100;
            return {
                main: `P = ${p.toFixed(4)}`,
                label: 'Probabilidad',
                extras: [
                    { cls: 'info', txt: `${pct.toFixed(2)}% de probabilidad` },
                    { cls: 'ok', txt: `Razón: ${fav}:${pos}` }
                ],
                steps: [`P = ${fav} / ${pos}`, `P = ${p.toFixed(6)}`],
                chart(canvas) { EstadisticaVisual.probabilidad(canvas, p, fav, pos); }
            };
        }
    },

    binomial: {
        title: 'Distribución Binomial',
        formula: 'P(X=k) = C(n,k) × p^k × (1-p)^(n-k)',
        fields: [
            { id: 'n', label: 'Número de ensayos (n)', val: '10' },
            { id: 'k', label: 'Éxitos deseados (k)', val: '3' },
            { id: 'p', label: 'Probabilidad de éxito (p)', val: '0.5' }
        ],
        calc(f) {
            let n = parseInt(f.n.value), k = parseInt(f.k.value), p = parseFloat(f.p.value);
            if (isNaN(n) || isNaN(k) || isNaN(p) || n < 0 || k < 0 || k > n || p < 0 || p > 1)
                return { error: true, msg: "Requisitos: n ≥ k ≥ 0, 0 ≤ p ≤ 1", label: "Error" };
            const fact = num => num <= 1 ? 1 : num * fact(num - 1);
            let comb = fact(n) / (fact(k) * fact(n - k));
            let prob = comb * Math.pow(p, k) * Math.pow(1 - p, n - k);
            return {
                main: `P(X=${k}) = ${prob.toFixed(6)}`,
                label: `Binomial(n=${n}, p=${p})`,
                extras: [
                    { cls: 'info', txt: `Media: μ = ${(n * p).toFixed(4)}` },
                    { cls: 'info', txt: `Desv. est: σ = ${(Math.sqrt(n * p * (1 - p))).toFixed(4)}` }
                ],
                steps: [`C(${n},${k}) = ${comb}`, `P = ${comb} × ${p}^${k} × ${(1-p).toFixed(4)}^${n-k}`],
                chart(canvas) { EstadisticaVisual.binomial(canvas, n, p, k, prob); }
            };
        }
    },

    poisson: {
        title: 'Distribución de Poisson',
        formula: 'P(X=k) = (λ^k × e^(-λ)) / k!',
        fields: [
            { id: 'lambda', label: 'Tasa media (λ)', val: '3' },
            { id: 'k', label: 'Valor de k', val: '2' }
        ],
        calc(f) {
            let lam = parseFloat(f.lambda.value), k = parseInt(f.k.value);
            if (isNaN(lam) || isNaN(k) || lam <= 0 || k < 0) return { error: true, msg: "λ > 0, k ≥ 0", label: "Error" };
            const fact = num => num <= 1 ? 1 : num * fact(num - 1);
            let prob = Math.pow(lam, k) * Math.exp(-lam) / fact(k);
            return {
                main: `P(X=${k}) = ${prob.toFixed(6)}`,
                label: `Poisson(λ=${lam})`,
                extras: [
                    { cls: 'info', txt: `Media = Varianza = ${lam.toFixed(4)}` },
                    { cls: 'ok', txt: `Desv. est: ${Math.sqrt(lam).toFixed(4)}` }
                ],
                steps: [`P = (${lam}^${k} × e^(-${lam})) / ${k}!`],
                chart(canvas) { EstadisticaVisual.poisson(canvas, lam, k, prob); }
            };
        }
    },

    chi_cuadrado: {
        title: 'Chi-Cuadrado (χ²)',
        formula: 'χ² = Σ((O-E)²/E)',
        fields: [
            { id: 'observados', label: 'Frecuencias observadas (espacio)', type: 'text', val: '10 12 8 15' },
            { id: 'esperados', label: 'Frecuencias esperadas (espacio)', type: 'text', val: '10 10 10 10' }
        ],
        calc(f) {
            let obs = f.observados.value.trim().split(/[\s,]+/).map(Number).filter(n => !isNaN(n));
            let esp = f.esperados.value.trim().split(/[\s,]+/).map(Number).filter(n => !isNaN(n));
            if (obs.length !== esp.length || obs.length < 2) return { error: true, msg: "Misma cantidad de observados y esperados (min 2)", label: "Desajuste" };
            let chi2 = 0;
            for (let i = 0; i < obs.length; i++) {
                if (esp[i] <= 0) return { error: true, msg: "Esperados deben ser > 0", label: "Error" };
                chi2 += Math.pow(obs[i] - esp[i], 2) / esp[i];
            }
            return {
                main: `χ² = ${chi2.toFixed(4)}`,
                label: `Con ${obs.length - 1} grados de libertad`,
                extras: [
                    { cls: 'info', txt: `Suma observados: ${obs.reduce((a,b) => a+b, 0)}` },
                    { cls: 'info', txt: `Suma esperados: ${esp.reduce((a,b) => a+b, 0)}` }
                ],
                steps: obs.map((o, i) => `(${o} - ${esp[i]})² / ${esp[i]} = ${(Math.pow(o - esp[i], 2) / esp[i]).toFixed(4)}`),
                chart(canvas) { EstadisticaVisual.chi_cuadrado(canvas, obs, esp, chi2); }
            };
        }
    },

    prob_condicional: {
        title: 'Probabilidad Condicional',
        formula: 'P(A|B) = P(A∩B) / P(B)',
        fields: [
            { id: 'p_interseccion', label: 'P(A∩B)', val: '0.3' },
            { id: 'p_b', label: 'P(B)', val: '0.5' }
        ],
        calc(f) {
            let pInt = parseFloat(f.p_interseccion.value);
            let pB = parseFloat(f.p_b.value);
            if (isNaN(pInt) || isNaN(pB) || pB <= 0 || pInt < 0 || pInt > 1 || pB > 1)
                return { error: true, msg: "Rango 0-1, P(B) > 0", label: "Error" };
            let pAGivenB = pInt / pB;
            return {
                main: `P(A|B) = ${pAGivenB.toFixed(4)}`,
                label: 'Probabilidad condicional',
                extras: [
                    { cls: 'info', txt: `P(A∩B) = ${pInt.toFixed(4)}` },
                    { cls: 'info', txt: `P(B) = ${pB.toFixed(4)}` }
                ],
                steps: [`P(A|B) = ${pInt} / ${pB}`],
                chart(canvas) { EstadisticaVisual.prob_condicional(canvas, pAGivenB, pInt, pB); }
            };
        }
    },

    teorema_bayes: {
        title: 'Teorema de Bayes',
        formula: 'P(A|B) = P(B|A) × P(A) / P(B)',
        fields: [
            { id: 'p_b_dado_a', label: 'P(B|A)', val: '0.8' },
            { id: 'p_a', label: 'P(A)', val: '0.3' },
            { id: 'p_b', label: 'P(B)', val: '0.5' }
        ],
        calc(f) {
            let pBdA = parseFloat(f.p_b_dado_a.value);
            let pA = parseFloat(f.p_a.value);
            let pB = parseFloat(f.p_b.value);
            if (isNaN(pBdA) || isNaN(pA) || isNaN(pB) || pB <= 0 || pBdA < 0 || pA < 0 || pBdA > 1 || pA > 1 || pB > 1)
                return { error: true, msg: "Rango 0-1, P(B) > 0", label: "Error" };
            let pAGivenB = (pBdA * pA) / pB;
            return {
                main: `P(A|B) = ${pAGivenB.toFixed(4)}`,
                label: 'Probabilidad posterior',
                extras: [
                    { cls: 'info', txt: `P(B|A) × P(A) = ${(pBdA * pA).toFixed(4)}` },
                    { cls: 'ok', txt: `Razón de verosimilitud: ${(pBdA / pB).toFixed(4)}` }
                ],
                steps: [`P(A|B) = (${pBdA} × ${pA}) / ${pB}`],
                chart(canvas) { EstadisticaVisual.teorema_bayes(canvas, pAGivenB, pBdA, pA, pB); }
            };
        }
    },

    cuartiles: {
        title: 'Cuartiles e IQR',
        formula: 'Q1, Q2 (mediana), Q3, IQR = Q3 - Q1',
        fields: [{ id: 'data', label: 'Datos (separados por espacio)', type: 'text', val: '3 7 8 9 12 15 18 20 25' }],
        calc(f) {
            let raw = f.data.value.trim().split(/[\s,]+/);
            let nums = raw.map(Number).filter(n => !isNaN(n)).sort((a,b) => a-b);
            if (nums.length < 4) return { error: true, msg: "Ingresá al menos 4 números", label: "Insuficiente" };
            let n = nums.length;
            let q2 = n % 2 === 0 ? (nums[n/2-1] + nums[n/2]) / 2 : nums[Math.floor(n/2)];
            let lowerHalf = nums.slice(0, Math.floor(n/2));
            let upperHalf = nums.slice(Math.ceil(n/2));
            let q1 = lowerHalf.length % 2 === 0 ? (lowerHalf[lowerHalf.length/2-1] + lowerHalf[lowerHalf.length/2]) / 2 : lowerHalf[Math.floor(lowerHalf.length/2)];
            let q3 = upperHalf.length % 2 === 0 ? (upperHalf[upperHalf.length/2-1] + upperHalf[upperHalf.length/2]) / 2 : upperHalf[Math.floor(upperHalf.length/2)];
            let iqr = q3 - q1;
            return {
                main: `Q1: ${q1} | Q2: ${q2} | Q3: ${q3}`,
                label: `n = ${n}`,
                extras: [
                    { cls: 'ok', txt: `IQR = ${iqr.toFixed(2)}` },
                    { cls: 'info', txt: `Rango: [${nums[0]}, ${nums[n-1]}]` }
                ],
                steps: [`Datos ordenados: ${nums.join(', ')}`, `Q2 (mediana) = ${q2}`],
                chart(canvas) { EstadisticaVisual.cuartiles(canvas, nums, q1, q2, q3); }
            };
        }
    },

    desviacion_media: {
        title: 'Desviación Media Absoluta',
        formula: 'DM = Σ|x - x̄| / n',
        fields: [{ id: 'data', label: 'Datos (separados por espacio)', type: 'text', val: '10 12 15 18 20' }],
        calc(f) {
            let raw = f.data.value.trim().split(/[\s,]+/);
            let nums = raw.map(Number).filter(n => !isNaN(n));
            if (nums.length < 2) return { error: true, msg: "Ingresá al menos 2 números", label: "Insuficiente" };
            let n = nums.length;
            let media = nums.reduce((a,b) => a+b, 0) / n;
            let desvMed = nums.reduce((a,b) => a + Math.abs(b - media), 0) / n;
            let varz = nums.reduce((a,b) => a + Math.pow(b - media, 2), 0) / (n - 1);
            return {
                main: `DM = ${desvMed.toFixed(4)}`,
                label: 'Desviación media absoluta',
                extras: [
                    { cls: 'info', txt: `Media: ${media.toFixed(4)}` },
                    { cls: 'info', txt: `Varianza: ${varz.toFixed(4)} | Desv. Est: ${Math.sqrt(varz).toFixed(4)}` }
                ],
                steps: [`x̄ = ${media.toFixed(4)}`, `DM = Σ|x - x̄| / ${n}`],
                chart(canvas) { EstadisticaVisual.desviacion_media(canvas, nums, media, desvMed); }
            };
        }
    }

});