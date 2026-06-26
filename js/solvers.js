function parseLinearEq(eq) {
    let s = eq.replace(/\s/g, '');
    const parts = s.split('=');
    if (parts.length !== 2) return null;
    const left = parts[0], right = parts[1];
    const leftTerms = left.match(/[+-]?[^+-]+/g) || [];
    const rightTerms = right.match(/[+-]?[^+-]+/g) || [];
    let a = 0, b = 0, c = 0;
    
    const processTerm = (term, coeffSign) => {
        let sign = 1;
        if (term.startsWith('-')) { sign = -1; term = term.slice(1); }
        else if (term.startsWith('+')) { term = term.slice(1); }
        const actualSign = sign * coeffSign;
        if (/y/.test(term)) {
            const coefStr = term.replace(/\*?y/, '');
            b += actualSign * (coefStr === '' ? 1 : parseFloat(coefStr));
        } else if (/x/.test(term)) {
            const coefStr = term.replace(/\*?x/, '');
            a += actualSign * (coefStr === '' ? 1 : parseFloat(coefStr));
        } else {
            const num = parseFloat(term);
            if (!isNaN(num)) {
                c += actualSign * num;
            }
        }
    };
    
    for (let t of leftTerms) processTerm(t, 1);
    for (let t of rightTerms) processTerm(t, -1);
    
    return { a, b, c: -c };
}

function solveSystem2x2(eq1, eq2) {
    const steps = [];
    steps.push(`<strong>Sistema de ecuaciones:</strong>`);
    steps.push(`┌ ① ${eq1}`);
    steps.push(`└ ② ${eq2}`);
    
    const p1 = parseLinearEq(eq1);
    const p2 = parseLinearEq(eq2);
    if (!p1 || !p2) {
        steps.push(`⚠ No se pudieron interpretar las ecuaciones. Usá formato: 2x+y=5, x-y=1`);
        return steps;
    }
    
    const f = (n) => n < 0 ? `(${n})` : `${n}`;
    const t = (n) => formatNumber(n, 4);
    
    steps.push(`<strong>Paso 1:</strong> Identificar coeficientes (Regla de Cramer)`);
    steps.push(`① ${t(p1.a)}x + ${t(p1.b)}y = ${t(p1.c)}`);
    steps.push(`② ${t(p2.a)}x + ${t(p2.b)}y = ${t(p2.c)}`);
    
    const det = p1.a * p2.b - p2.a * p1.b;
    if (Math.abs(det) < 1e-12) {
        steps.push(`⚠ El sistema no tiene solución única (determinante = 0).`);
        return steps;
    }
    
    steps.push(`<strong>Paso 2:</strong> Calcular determinante Δ`);
    steps.push(`Δ = a₁·b₂ - a₂·b₁`);
    steps.push(`Δ = ${t(p1.a)}·${f(p2.b)} - ${t(p2.a)}·${f(p1.b)}`);
    
    const detStep1 = p1.a * p2.b;
    const detStep2 = p2.a * p1.b;
    steps.push(`Δ = ${t(detStep1)} - ${f(detStep2)}`);
    steps.push(`Δ = ${t(detStep1 - detStep2)}`);
    steps.push(`<strong>Δ = ${t(det)}</strong>`);
    
    const xNum1 = p1.c * p2.b;
    const xNum2 = p2.c * p1.b;
    const xNum = xNum1 - xNum2;
    const xVal = xNum / det;
    
    steps.push(`<strong>Paso 3:</strong> Calcular x`);
    steps.push(`x = (c₁·b₂ - c₂·b₁) / Δ`);
    steps.push(`x = (${t(p1.c)}·${f(p2.b)} - ${t(p2.c)}·${f(p1.b)}) / ${t(det)}`);
    steps.push(`x = (${t(xNum1)} - ${f(xNum2)}) / ${t(det)}`);
    steps.push(`x = ${t(xNum1 - xNum2)} / ${t(det)}`);
    steps.push(`<strong>x = ${t(xVal)}</strong>`);
    
    const yNum1 = p1.a * p2.c;
    const yNum2 = p2.a * p1.c;
    const yNum = yNum1 - yNum2;
    const yVal = yNum / det;
    
    steps.push(`<strong>Paso 4:</strong> Calcular y`);
    steps.push(`y = (a₁·c₂ - a₂·c₁) / Δ`);
    steps.push(`y = (${t(p1.a)}·${f(p2.c)} - ${t(p2.a)}·${f(p1.c)}) / ${t(det)}`);
    steps.push(`y = (${t(yNum1)} - ${f(yNum2)}) / ${t(det)}`);
    steps.push(`y = ${t(yNum1 - yNum2)} / ${t(det)}`);
    steps.push(`<strong>y = ${t(yVal)}</strong>`);
    
    steps.push(`<strong>Paso 5:</strong> Verificar solución`);
    const check1 = p1.a * xVal + p1.b * yVal;
    const check2 = p2.a * xVal + p2.b * yVal;
    const ok1 = Math.abs(check1 - p1.c) < 1e-6;
    const ok2 = Math.abs(check2 - p2.c) < 1e-6;
    steps.push(`① ${t(p1.a)}·${f(xVal)} + ${t(p1.b)}·${f(yVal)} = ${t(check1)} ${ok1 ? '✔️' : '❌'} (esperado ${t(p1.c)})`);
    steps.push(`② ${t(p2.a)}·${f(xVal)} + ${t(p2.b)}·${f(yVal)} = ${t(check2)} ${ok2 ? '✔️' : '❌'} (esperado ${t(p2.c)})`);
    
    steps.push(`<div style="padding:8px 10px;margin-top:6px;background:linear-gradient(135deg,rgba(79,252,124,0.12),rgba(79,156,249,0.12));border-left:3px solid var(--accent2);border-radius:0 6px 6px 0;font-size:14px;font-weight:700;color:var(--accent2)">`);
    steps.push(`Solución &rarr; x = ${t(xVal)} &nbsp; y = ${t(yVal)}`);
    steps.push(`</div>`);
    
    genResult = `x=${t(xVal)}, y=${t(yVal)}`;
    return steps;
}

function parseQuadraticCoefs(expr) {
    let s = expr.replace(/\s+/g, '').replace(/π/g, 'pi');
    if (s.includes('=')) s = s.split('=')[0];
    s = s.replace(/(\d)x/g, '$1*x').replace(/x\^2/g, 'x²').replace(/\*?\*?x²/g, 'x²');
    let a = 0, b = 0, c = 0;
    const termParts = s.match(/[+-]?[^+-]+/g) || [];
    for (let term of termParts) {
        let sign = 1;
        if (term.startsWith('-')) { sign = -1; term = term.slice(1); }
        else if (term.startsWith('+')) { term = term.slice(1); }
        if (/x\*?\^?\s*2|x²/.test(term)) {
            let coef = term.replace(/[\*]?x\^?\s*2|x²/, '');
            a = sign * (coef === '' || coef === '1' ? 1 : coef === '-' ? -1 : parseFloat(coef));
        } else if (/x/.test(term)) {
            let coef = term.replace(/\*?x/, '');
            b = sign * (coef === '' || coef === '1' ? 1 : coef === '-' ? -1 : parseFloat(coef));
        } else {
            let val = parseFloat(term);
            if (!isNaN(val)) c = sign * val;
        }
    }
    return { a, b, c };
}

function analyzeQuadratic(expr) {
    const { a, b, c } = parseQuadraticCoefs(expr);
    if (a === 0) return null;
    const steps = [];
    const nf = v => formatNumber(v, 4);
    const t = v => v < 0 ? `(${v})` : `${v}`;
    steps.push(`<strong>Función cuadrática: f(x) = ${expr}</strong>`);
    steps.push(`<strong>Paso 1:</strong> Identificar coeficientes`);
    steps.push(`a = ${nf(a)}, b = ${nf(b)}, c = ${nf(c)}`);
    const opensUp = a > 0;
    steps.push(`a = ${nf(a)} → <strong>${opensUp ? 'Abre hacia ARRIBA (∪)' : 'Abre hacia ABAJO (∩)'}</strong>`);
    if (opensUp) {
        steps.push(`El vértice es el <strong>punto mínimo</strong> de la parábola`);
    } else {
        steps.push(`El vértice es el <strong>punto máximo</strong> de la parábola`);
    }
    const h = -b / (2 * a);
    const k = safeMathEval(expr, { x: h });
    steps.push(`<strong>Paso 2:</strong> Calcular el vértice`);
    steps.push(`x_v = -b / (2a) = -(${nf(b)}) / (2·${nf(a)}) = ${nf(h)}`);
    steps.push(`y_v = f(x_v) = ${expr.replace(/x/g, t(h)).replace(/pi/g, 'π')}`);
    steps.push(`y_v = ${nf(k)}`);
    steps.push(`<strong>Vértice → (${nf(h)}, ${nf(k)})</strong>`);
    steps.push(`<strong>Paso 3:</strong> Intercepto con el eje Y`);
    steps.push(`f(0) = c = ${nf(c)} → <strong>(0, ${nf(c)})</strong>`);
    const disc = b * b - 4 * a * c;
    steps.push(`<strong>Paso 4:</strong> Calcular el discriminante`);
    steps.push(`Δ = b² - 4ac = ${nf(b)}² - 4·${nf(a)}·${nf(c)} = ${nf(disc)}`);
    if (disc > 0) {
        const x1 = (-b + Math.sqrt(disc)) / (2 * a);
        const x2 = (-b - Math.sqrt(disc)) / (2 * a);
        steps.push(`Δ > 0 → <strong>Dos raíces reales distintas</strong>`);
        steps.push(`x₁ = (-b + √Δ) / (2a) = (-(${nf(b)}) + √${nf(disc)}) / (2·${nf(a)}) = ${nf(x1)}`);
        steps.push(`x₂ = (-b - √Δ) / (2a) = (-(${nf(b)}) - √${nf(disc)}) / (2·${nf(a)}) = ${nf(x2)}`);
        steps.push(`<strong>Raíces → (${nf(x1)}, 0) y (${nf(x2)}, 0)</strong>`);
    } else if (disc === 0) {
        const x0 = -b / (2 * a);
        steps.push(`Δ = 0 → <strong>Una raíz real doble</strong>`);
        steps.push(`x₀ = -b / (2a) = ${nf(x0)}`);
        steps.push(`<strong>Raíz → (${nf(x0)}, 0)</strong>`);
    } else {
        steps.push(`Δ < 0 → <strong>No tiene raíces reales</strong>`);
        steps.push(`La parábola no cruza el eje X`);
    }
    steps.push(`<div style="padding:8px 10px;margin-top:6px;background:linear-gradient(135deg,rgba(79,252,124,0.12),rgba(79,156,249,0.12));border-left:3px solid var(--accent2);border-radius:0 6px 6px 0;font-size:14px;font-weight:700;color:var(--accent2)">`);
    steps.push(`Resumen → Vértice (${nf(h)}, ${nf(k)}) · ${opensUp ? 'Abre arriba' : 'Abre abajo'} · Δ = ${nf(disc)}`);
    steps.push(`</div>`);
    return { steps, h, k, a };
}

function solveCubic(expr) {
    const s = expr.replace(/\s/g, '');
    const terms = s.match(/[+-]?[^+-]+/g) || [];
    let a = 0, b = 0, c = 0, d = 0;
    for (let term of terms) {
        let sign = 1;
        let t = term;
        if (t.startsWith('-')) { sign = -1; t = t.slice(1); }
        else if (t.startsWith('+')) { t = t.slice(1); }
        if (/x\^3/.test(t)) {
            const coefStr = t.replace(/\*?x\^3/, '');
            a += sign * (coefStr === '' ? 1 : parseFloat(coefStr));
        } else if (/x\^2/.test(t)) {
            const coefStr = t.replace(/\*?x\^2/, '');
            b += sign * (coefStr === '' ? 1 : parseFloat(coefStr));
        } else if (/x(?!\^)/.test(t)) {
            const coefStr = t.replace(/\*?x/, '');
            c += sign * (coefStr === '' ? 1 : parseFloat(coefStr));
        } else {
            d += sign * parseFloat(t);
        }
    }
    return { a, b, c, d };
}

function formatCubicRoot(x) {
    if (Math.abs(x) < 1e-10) return '0';
    return formatNumber(x, 4);
}

function cubicRoots(a, b, c, d) {
    const A = b / a, B = c / a, C = d / a;
    const p = B - A*A/3;
    const q = C - A*B/3 + 2*A*A*A/27;
    const disc = q*q/4 + p*p*p/27;
    const roots = [];
    if (disc > 0) {
        const u = Math.cbrt(-q/2 + Math.sqrt(disc));
        const v = Math.cbrt(-q/2 - Math.sqrt(disc));
        roots.push(u + v - A/3);
    } else if (Math.abs(disc) < 1e-14) {
        const u = Math.cbrt(-q/2);
        roots.push(2*u - A/3);
        roots.push(-u - A/3);
    } else {
        const r = Math.sqrt(-p*p*p/27);
        const phi = Math.acos(-q / (2*r));
        for (let k = 0; k < 3; k++) {
            roots.push(2 * Math.cbrt(r) * Math.cos((phi + 2*k*Math.PI)/3) - A/3);
        }
    }
    return roots.filter((v, i) => roots.indexOf(v) === i).sort((a,b) => a-b);
}

function generateAlgebraicSteps(equation) {
    try {
        equation = normalizeInput(equation);
        const inequalMatch = equation.match(/([><]=?)/);
        const isInequality = !!inequalMatch;
        const sep = isInequality ? inequalMatch[1] : '=';
        const parts = equation.split(sep === '<=' ? '<=' : sep === '>=' ? '>=' : sep);
        if (parts.length !== 2) return;
        
        const left = parts[0].trim();
        const right = parts[1].trim();
        const steps = [];
        
        const evalNum = (s) => {
            try { return safeMathEval(s); } catch(e) { return NaN; }
        };
        
        let combined = left;
        if (sep === '=' && right !== '0' && parseFloat(right) !== 0) {
            const rightTerms = right.match(/[+-]?[^+-]+/g) || [];
            for (let t of rightTerms) {
                if (t === '') continue;
                if (t.startsWith('-')) combined += '+' + t.slice(1);
                else if (t.startsWith('+')) combined += '-' + t.slice(1);
                else combined += '-' + t;
            }
        } else if (sep === '=' && (right === '0' || parseFloat(right) === 0)) {
            combined = left;
        }
        let cleaned = expandSquares(combined).replace(/--/g, '+').replace(/\+-/g, '-').replace(/-\+/g, '-').replace(/\+\+/g, '+').replace(/^\+/, '');
        
        if (/x\^3|x³/.test(cleaned)) {
            const { a, b, c, d } = solveCubic(cleaned);
            steps.push(`<strong>Paso 1:</strong> Identificar ecuación cúbica`);
            steps.push(`${cleaned} = 0`);
            steps.push(`<strong>Paso 2:</strong> Coeficientes: a = ${a}, b = ${b}, c = ${c}, d = ${d}`);
            if (a === 0) {
                steps.push(`El coeficiente de x³ es 0, no es cúbica.`);
            } else {
                const roots = cubicRoots(a, b, c, d);
                steps.push(`<strong>Paso 3:</strong> Resolver ecuación cúbica`);
                steps.push(`Discriminante calculado.`);
                if (roots.length === 1) {
                    steps.push(`<strong>Solución:</strong> x = ${formatCubicRoot(roots[0])} (1 real)`);
                    genResult = `x = ${formatCubicRoot(roots[0])}`;
                } else if (roots.length === 2) {
                    steps.push(`<strong>Solución:</strong> x₁ = ${formatCubicRoot(roots[0])}, x₂ = ${formatCubicRoot(roots[1])} (raíz doble)`);
                    genResult = `x₁ = ${formatCubicRoot(roots[0])}, x₂ = ${formatCubicRoot(roots[1])}`;
                } else {
                    steps.push(`<strong>Solución:</strong> x₁ = ${formatCubicRoot(roots[0])}, x₂ = ${formatCubicRoot(roots[1])}, x₃ = ${formatCubicRoot(roots[2])}`);
                    genResult = `x₁ = ${formatCubicRoot(roots[0])}, x₂ = ${formatCubicRoot(roots[1])}, x₃ = ${formatCubicRoot(roots[2])}`;
                }
            }
        
        } else if (/[0-9)]+\^x\b|\([^)]+\)\^x/.test(cleaned) || /x\^/.test(cleaned) === false && /(\d+\.?\d*)\^/.test(cleaned) && !cleaned.includes('x^')) {
            const expMatch = cleaned.match(/(\d+\.?\d*)\^x\b/);
            if (expMatch) {
                const base = parseFloat(expMatch[1]);
                const constVal = evalNum(right);
                steps.push(`<strong>Ecuación exponencial:</strong> ${base}^x = ${constVal || '?'}`);
                if (constVal > 0) {
                    const x = Math.log(constVal) / Math.log(base);
                    steps.push(`<strong>Paso 1:</strong> Aplicar logaritmo a ambos lados`);
                    steps.push(`log(${base}^x) = log(${constVal})`);
                    steps.push(`x · log(${base}) = log(${constVal})`);
                    steps.push(`<strong>Solución:</strong> x = log(${constVal}) / log(${base}) = ${formatNumber(x, 4)}`);
                    genResult = `x = ${formatNumber(x, 4)}`;
                } else {
                    steps.push(`El valor debe ser positivo para resolver la exponencial.`);
                }
            }
        
        } else if (/log(?:10)?\(/.test(cleaned) || /ln\(/.test(cleaned)) {
            const isLn = cleaned.includes('ln(');
            const funcName = isLn ? 'ln' : 'log';
            const logMatch = cleaned.match(new RegExp(funcName + '\\(([^)]+)\\)'));
            if (logMatch) {
                const arg = logMatch[1].trim();
                const rhs = evalNum(right);
                steps.push(`<strong>Ecuación logarítmica:</strong> ${funcName}(${arg}) = ${rhs}`);
                if (!isNaN(rhs)) {
                    if (arg === 'x') {
                        const val = isLn ? Math.exp(rhs) : Math.pow(10, rhs);
                        steps.push(`<strong>Paso 1:</strong> Aplicar exponencial a ambos lados`);
                        if (isLn) steps.push(`e^(${funcName}(x)) = e^(${rhs})`);
                        else steps.push(`10^(${funcName}(x)) = 10^(${rhs})`);
                        steps.push(`x = ${formatNumber(val, 4)}`);
                        steps.push(`<strong>Solución:</strong> x = ${formatNumber(val, 4)}`);
                        genResult = `x = ${formatNumber(val, 4)}`;
                    } else if (/x/.test(arg)) {
                        const aMatch = arg.match(/(-?\d*\.?\d*)\*?x/);
                        const a = aMatch ? (aMatch[1] === '' || aMatch[1] === '-' ? (aMatch[1] === '-' ? -1 : 1) : parseFloat(aMatch[1])) : 1;
                        const bVal = -extractConstant(arg);
                        const expVal = isLn ? Math.exp(rhs) : Math.pow(10, rhs);
                        const x = (expVal + bVal) / a;
                        steps.push(`<strong>Paso 1:</strong> Aplicar exponencial`);
                        steps.push(`${arg} = ${formatNumber(expVal, 4)}`);
                        steps.push(`<strong>Paso 2:</strong> Despejar x`);
                        steps.push(`x = (${formatNumber(expVal, 4)} ${bVal >= 0 ? '+ ' + bVal : '- ' + Math.abs(bVal)}) / ${a}`);
                        steps.push(`<strong>Solución:</strong> x = ${formatNumber(x, 4)}`);
                        genResult = `x = ${formatNumber(x, 4)}`;
                    }
                } else {
                    steps.push(`No se pudo evaluar el lado derecho.`);
                }
            } else {
                steps.push(`Ecuación logarítmica detectada, pero no se pudo extraer el argumento.`);
            }
        
        } else if (/sqrt\(/.test(cleaned)) {
            const sqrtMatch = cleaned.match(/sqrt\(([^)]+)\)/);
            if (sqrtMatch) {
                const arg = sqrtMatch[1].trim();
                const rhs = evalNum(right);
                steps.push(`<strong>Ecuación con raíz:</strong> √(${arg}) = ${rhs}`);
                if (!isNaN(rhs) && rhs >= 0) {
                    if (arg === 'x') {
                        const val = rhs * rhs;
                        steps.push(`<strong>Paso 1:</strong> Elevar al cuadrado ambos lados`);
                        steps.push(`x = ${rhs}² = ${formatNumber(val, 4)}`);
                        steps.push(`<strong>Solución:</strong> x = ${formatNumber(val, 4)}`);
                        genResult = `x = ${formatNumber(val, 4)}`;
                    } else if (/x/.test(arg)) {
                        const aMatch = arg.match(/(-?\d*\.?\d*)\*?x/);
                        const a = aMatch ? (aMatch[1] === '' || aMatch[1] === '-' ? (aMatch[1] === '-' ? -1 : 1) : parseFloat(aMatch[1])) : 1;
                        const bVal = -extractConstant(arg);
                        const sq = rhs * rhs;
                        const x = (sq + bVal) / a;
                        steps.push(`<strong>Paso 1:</strong> Elevar al cuadrado`);
                        steps.push(`${arg} = ${rhs}² = ${formatNumber(sq, 4)}`);
                        steps.push(`<strong>Paso 2:</strong> Despejar x`);
                        steps.push(`x = (${formatNumber(sq, 4)} ${bVal >= 0 ? '+ ' + bVal : '- ' + Math.abs(bVal)}) / ${a}`);
                        steps.push(`<strong>Solución:</strong> x = ${formatNumber(x, 4)}`);
                        genResult = `x = ${formatNumber(x, 4)}`;
                    }
                } else if (!isNaN(rhs) && rhs < 0) {
                    steps.push(`La raíz cuadrada no puede ser negativa. No hay solución real.`);
                    genResult = 'No tiene solución real';
                }
            }
        
        } else if (/\d\/\(/.test(cleaned) && /x/.test(cleaned)) {
            const ratMatch = cleaned.match(/(-?\d+\.?\d*)\s*\/\s*\(([^)]+)\)/);
            if (ratMatch) {
                const num = parseFloat(ratMatch[1]);
                const den = ratMatch[2].trim();
                const rhs = evalNum(right);
                steps.push(`<strong>Ecuación racional:</strong> ${num} / (${den}) = ${rhs}`);
                if (!isNaN(rhs) && rhs !== 0) {
                    const aMatch = den.match(/(-?\d*\.?\d*)\*?x/);
                    if (aMatch) {
                        const a = aMatch[1] === '' || aMatch[1] === '-' ? (aMatch[1] === '-' ? -1 : 1) : parseFloat(aMatch[1]);
                        const bVal = -extractConstant(den);
                        const div = num / rhs;
                        const x = (div + bVal) / a;
                        steps.push(`<strong>Paso 1:</strong> Multiplicar ambos lados por (${den})`);
                        steps.push(`${num} = ${rhs} · (${den})`);
                        steps.push(`<strong>Paso 2:</strong> Despejar x`);
                        steps.push(`${den} = ${num} / ${rhs} = ${formatNumber(div, 4)}`);
                        steps.push(`x = (${formatNumber(div, 4)} ${bVal >= 0 ? '+ ' + bVal : '- ' + Math.abs(bVal)}) / ${a}`);
                        steps.push(`<strong>Solución:</strong> x = ${formatNumber(x, 4)}`);
                        steps.push(`⚠ Verificar que el denominador no se anule.`);
                        genResult = `x = ${formatNumber(x, 4)}`;
                    }
                } else if (rhs === 0) {
                    steps.push(`Una fracción igual a 0 requiere numerador = 0.`);
                    steps.push(`El numerador ${num} ≠ 0, no hay solución.`);
                    genResult = 'No tiene solución';
                }
            } else {
                steps.push(`Ecuación racional detectada pero no se pudo analizar.`);
            }
        
        } else if (left.includes('x^2') || right.includes('x^2') || cleaned.includes('x^2')) {
            let combined;
            if (left.includes('x^2') && right.includes('x^2')) {
                combined = left;
                const rTerms = right.match(/[+-]?[^+-]+/g) || [];
                for (let t of rTerms) {
                    if (t === '') continue;
                    if (t.startsWith('-')) combined += '+' + t.slice(1);
                    else if (t.startsWith('+')) combined += '-' + t.slice(1);
                    else combined += '-' + t;
                }
            } else {
                combined = cleaned;
            }
            const c = expandSquares(combined).replace(/--/g, '+').replace(/\+-/g, '-').replace(/-\+/g, '-').replace(/\+\+/g, '+').replace(/^\+/, '');
            steps.push(`<strong>Paso 1:</strong> Identificar ecuación cuadrática`);
            steps.push(`${c} = 0`);
            const { a, b, c: constC } = extractQuadraticCoefficients(c);
            if (a === 0 && b === 0) {
                steps.push(`<strong>Solución:</strong> ${constC === 0 ? 'Infinitas soluciones' : 'No tiene solución (contradicción)'}`);
                genResult = constC === 0 ? 'Infinitas soluciones' : 'Sin solución';
            } else if (a === 0) {
                const x = -constC / b;
                steps.push(`<strong>Solución:</strong> x = ${formatNumber(x, 4)} (ecuación lineal)`);
                genResult = `x = ${formatNumber(x, 4)}`;
            } else {
                steps.push(`<strong>Paso 2:</strong> Coeficientes: a = ${a}, b = ${b}, c = ${constC}`);
                const disc = b * b - 4 * a * constC;
                steps.push(`<strong>Paso 3:</strong> Calcular discriminante`);
                steps.push(`Δ = b² - 4ac = ${b}² - 4·${a}·${constC} = ${disc}`);
                if (disc > 0) {
                    const sqrtD = Math.sqrt(disc);
                    const x1 = (-b + sqrtD) / (2*a);
                    const x2 = (-b - sqrtD) / (2*a);
                    steps.push(`Δ > 0 → dos soluciones reales`);
                    steps.push(`x = (-b ± √Δ) / 2a`);
                    steps.push(`x₁ = (${-b} + ${formatNumber(sqrtD, 4)}) / ${2*a} = ${formatNumber(x1, 4)}`);
                    steps.push(`x₂ = (${-b} - ${formatNumber(sqrtD, 4)}) / ${2*a} = ${formatNumber(x2, 4)}`);
                    steps.push(`<strong>Solución:</strong> x₁ = ${formatNumber(x1, 4)}, x₂ = ${formatNumber(x2, 4)}`);
                    genResult = `x₁ = ${formatNumber(x1, 4)}, x₂ = ${formatNumber(x2, 4)}`;
                } else if (disc === 0) {
                    const x = -b / (2*a);
                    steps.push(`Δ = 0 → una solución real (doble)`);
                    steps.push(`x = -b / 2a = ${-b} / ${2*a} = ${formatNumber(x, 4)}`);
                    steps.push(`<strong>Solución:</strong> x = ${formatNumber(x, 4)}`);
                    genResult = `x = ${formatNumber(x, 4)}`;
                } else {
                    const real = formatNumber(-b / (2*a), 4);
                    const imag = formatNumber(Math.sqrt(-disc) / (2*a), 4);
                    steps.push(`Δ < 0 → dos soluciones complejas conjugadas`);
                    steps.push(`x₁ = ${real} + ${imag}i`);
                    steps.push(`x₂ = ${real} - ${imag}i`);
                    steps.push(`<strong>Solución:</strong> x₁ = ${real} + ${imag}i, x₂ = ${real} - ${imag}i`);
                    genResult = `x₁ = ${real} + ${imag}i, x₂ = ${real} - ${imag}i`;
                }
            }
        
        } else if (left.includes('x') && right.includes('x')) {
            steps.push(`<strong>Paso 1:</strong> Identificar términos con x y constantes`);
            steps.push(`Lado izquierdo: ${left}`);
            steps.push(`Lado derecho: ${right}`);
            
            const leftCoef = extractCoefficient(left, 'x');
            const rightCoef = extractCoefficient(right, 'x');
            const leftConst = extractConstant(left);
            const rightConst = extractConstant(right);
            
            steps.push(`<strong>Análisis:</strong>`);
            steps.push(`• Coeficiente de x (izquierda): ${leftCoef}`);
            steps.push(`• Coeficiente de x (derecha): ${rightCoef}`);
            steps.push(`• Constante (izquierda): ${leftConst}`);
            steps.push(`• Constante (derecha): ${rightConst}`);
            
            steps.push(`<strong>Paso 2:</strong> Agrupar términos con x en el lado izquierdo`);
            steps.push(`Restar ${rightCoef}x de ambos lados`);
            const newLeftCoef = leftCoef - rightCoef;
            steps.push(`${newLeftCoef}x ${leftConst >= 0 ? '+ ' + leftConst : leftConst} = ${rightConst}`);
            
            steps.push(`<strong>Paso 3:</strong> Agrupar constantes en el lado derecho`);
            steps.push(`Restar ${leftConst} de ambos lados`);
            const finalRight = rightConst - leftConst;
            steps.push(`${newLeftCoef}x = ${finalRight}`);
            
            if (newLeftCoef === 0) {
                if (finalRight === 0) {
                    steps.push(`<strong>Conclusión:</strong> ${finalRight} = ${finalRight} → la ecuación es una identidad.`);
                    steps.push(`<strong>Infinitas soluciones.</strong> Cualquier valor de x cumple la igualdad.`);
                } else {
                    steps.push(`<strong>Conclusión:</strong> 0 = ${finalRight} → contradicción.`);
                    steps.push(`<strong>No existe</strong> un valor de x que cumpla esta ecuación.`);
                }
            } else {
                steps.push(`<strong>Paso 4:</strong> Despejar x dividiendo por ${newLeftCoef}`);
                const result = finalRight / newLeftCoef;
                steps.push(`x = ${finalRight} / ${newLeftCoef}`);
                steps.push(`x = ${formatNumber(result, 4)}`);
                
                steps.push(`<strong>Verificación:</strong>`);
                steps.push(`Sustituir x = ${formatNumber(result, 4)} en la ecuación original`);
            }
            
        } else if (/(sin|cos|tan)\(/.test(left)) {
            const trigF = left.match(/(sin|cos|tan)\(/);
            const func = trigF[1];
            const parenStart = trigF.index + trigF[0].length - 1;
            const inner = extractParenContent(left, parenStart);
            const rhs = safeMathEval(right);
            
            steps.push(`<strong>Ecuación trigonométrica:</strong> ${func}(${inner}) = ${rhs}`);
            
            if (isNaN(rhs) || Math.abs(rhs) > 1) {
                steps.push(`⚠ El valor debe estar entre -1 y 1 para ${func}.`);
            } else {
                const invMap = { sin: 'arcsin', cos: 'arccos', tan: 'arctan' };
                const invFunc = invMap[func];
                
                let a = 0, b = 0;
                if (/x/.test(inner)) {
                    const innerClean = inner.replace(/\s/g, '');
                    const xMatch = innerClean.match(/(-?\d*\.?\d*)\*?x/);
                    if (xMatch) {
                        a = xMatch[1] === '' || xMatch[1] === '-' ? (xMatch[1] === '-' ? -1 : 1) : parseFloat(xMatch[1]);
                    }
                    const noX = innerClean.replace(/(-?\d*\.?\d*)\*?x/g, '');
                    const constMatch = noX.match(/[+-]?\d+\.?\d*/g);
                    if (constMatch) {
                        b = constMatch.reduce((s, v) => s + parseFloat(v), 0);
                    }
                } else {
                    a = 1;
                    b = safeMathEval(inner);
                }
                
                const principalRad = func === 'sin' ? Math.asin(rhs) : func === 'cos' ? Math.acos(rhs) : Math.atan(rhs);
                
                if (angleMode === 'deg') {
                    const principalDeg = principalRad * 180 / Math.PI;
                    steps.push(`<strong>Paso 1:</strong> Calcular ángulo principal (modo DEG)`);
                    steps.push(`${func}(${inner}) = ${rhs}`);
                    steps.push(`${inner} = ${invFunc}(${rhs})`);
                    steps.push(`${inner} = ${principalDeg.toFixed(4)}°`);
                    
                    steps.push(`<strong>Paso 2:</strong> Soluciones generales para el argumento interno`);
                    let sols = [];
                    if (func === 'sin') {
                        sols.push(`${principalDeg.toFixed(4)}° + 360°·n`);
                        sols.push(`${(180 - principalDeg).toFixed(4)}° + 360°·n`);
                    } else if (func === 'cos') {
                        sols.push(`${principalDeg.toFixed(4)}° + 360°·n`);
                        sols.push(`${(-principalDeg).toFixed(4)}° + 360°·n`);
                    } else {
                        sols.push(`${principalDeg.toFixed(4)}° + 180°·n`);
                    }
                    sols.forEach(s => steps.push(`${inner} = ${s}`));
                    
                    if (a !== 1 || b !== 0) {
                        steps.push(`<strong>Paso 3:</strong> Despejar x (transformación lineal ${a}x + ${b})`);
                        const finalSols = sols.map(s => `(${s} - (${b})) / ${a}`);
                        finalSols.forEach((s, idx) => steps.push(`x = ${s}`));
                        genResult = `x = ${finalSols[0]}`;
                    } else {
                        genResult = `x = ${sols[0]}`;
                    }
                } else {
                    steps.push(`<strong>Paso 1:</strong> Calcular ángulo principal (modo RAD)`);
                    steps.push(`${func}(${inner}) = ${rhs}`);
                    steps.push(`${inner} = ${invFunc}(${rhs})`);
                    steps.push(`${inner} = ${principalRad.toFixed(4)} rad`);
                    
                    steps.push(`<strong>Paso 2:</strong> Soluciones generales para el argumento interno`);
                    let sols = [];
                    if (func === 'sin') {
                        sols.push(`${principalRad.toFixed(4)} + 2πn`);
                        sols.push(`${(Math.PI - principalRad).toFixed(4)} + 2πn`);
                    } else if (func === 'cos') {
                        sols.push(`${principalRad.toFixed(4)} + 2πn`);
                        sols.push(`${(-principalRad).toFixed(4)} + 2πn`);
                    } else {
                        sols.push(`${principalRad.toFixed(4)} + πn`);
                    }
                    sols.forEach(s => steps.push(`${inner} = ${s}`));
                    
                    if (a !== 1 || b !== 0) {
                        steps.push(`<strong>Paso 3:</strong> Despejar x (transformación lineal ${a}x + ${b})`);
                        const finalSols = sols.map(s => `(${s} - (${b})) / ${a}`);
                        finalSols.forEach((s, idx) => steps.push(`x = ${s}`));
                        genResult = `x = ${finalSols[0]}`;
                    } else {
                        genResult = `x = ${sols[0]}`;
                    }
                }
            }
            
        } else if (left.includes('x') || right.includes('x')) {
            const sideWithX = left.includes('x') ? 'izquierdo' : 'derecho';

            if (sideWithX === 'izquierdo') {
                const coef = extractCoefficient(left, 'x');
                if (coef === 0) return;
                const constVal = extractConstant(left);
                const coefStr = coef === 1 ? 'x' : coef === -1 ? '-x' : coef + 'x';

                steps.push(`<strong>Ecuación:</strong> ${formatExpr(coef, constVal, 'x')} = ${right}`);
                steps.push(`<strong>Paso 1:</strong> Identificar términos`);
                steps.push(`Término con x: ${coefStr}`);
                if (constVal !== 0) {
                    steps.push(`Constante: ${constVal > 0 ? '+ ' + constVal : '- ' + Math.abs(constVal)}`);
                }

                let stepNum = 2;
                if (constVal !== 0) {
                    const op = constVal > 0 ? 'Restar' : 'Sumar';
                    const val = Math.abs(constVal);
                    steps.push(`<strong>Paso ${stepNum}:</strong> ${op} ${val} a ambos lados`);
                    stepNum++;
                }
                const newRight = evalNum(right) - constVal;
                steps.push(`${coefStr} = ${newRight}`);

                if (coef !== 1 && coef !== -1) {
                    steps.push(`<strong>Paso ${stepNum}:</strong> Dividir por ${coef}`);
                    steps.push(`x = ${newRight} / ${coef}`);
                }
                steps.push(`<strong>Solución:</strong> x = ${formatNumber(newRight / coef, 4)}`);

             } else {
                  const coef = extractCoefficient(right, 'x');
                  if (coef === 0) return;
                  const constVal = extractConstant(right);
                  const coefStr = coef === 1 ? 'x' : coef === -1 ? '-x' : coef + 'x';

                  steps.push(`<strong>Ecuación:</strong> ${left} = ${formatExpr(coef, constVal, 'x')}`);
                  steps.push(`<strong>Paso 1:</strong> Identificar términos`);
                  steps.push(`Término con x: ${coefStr}`);
                  if (constVal !== 0) {
                      steps.push(`Constante: ${constVal > 0 ? '+ ' + constVal : '- ' + Math.abs(constVal)}`);
                  }

                  let stepNum = 2;
                  if (constVal !== 0) {
                      const op = constVal > 0 ? 'Restar' : 'Sumar';
                      const val = Math.abs(constVal);
                      steps.push(`<strong>Paso ${stepNum}:</strong> ${op} ${val} a ambos lados`);
                      stepNum++;
                  }
                  const newLeft = evalNum(left) - constVal;
                  steps.push(`${newLeft} = ${coefStr}`);

                  if (coef !== 1 && coef !== -1) {
                      steps.push(`<strong>Paso ${stepNum}:</strong> Dividir por ${coef}`);
                      steps.push(`x = ${newLeft} / ${coef}`);
                  }
                  steps.push(`<strong>Solución:</strong> x = ${formatNumber(newLeft / coef, 4)}`);
            }
            
        } else {
            steps.push(`<strong>Ecuación:</strong> ${left} = ${right}`);
            steps.push(`<strong>Paso 1:</strong> Esta ecuación no contiene variable x`);
            steps.push(`<strong>Paso 2:</strong> Evaluar ambos lados`);
            steps.push(`<strong>Paso 3:</strong> Verificar si la igualdad es verdadera`);
        }
        
        if (isInequality) {
            const op = inequalMatch[1];
            const f = (x) => {
                try { return safeMathEval(left, { x }) - safeMathEval(right, { x }); } catch(e) { return NaN; }
            };
            const roots = [];
            for (let i = -100; i <= 100; i++) {
                const x1 = i / 5, x2 = (i + 0.5) / 5;
                const y1 = f(x1), y2 = f(x2);
                if (isFinite(y1) && isFinite(y2) && y1 * y2 < 0) {
                    const root = x1 - y1 * (x2 - x1) / (y2 - y1);
                    roots.push(parseFloat(root.toFixed(4)));
                }
            }
            const uniqRoots = [...new Set(roots)].sort((a,b) => a-b);
            if (uniqRoots.length > 0) {
                steps.push(`<strong>Puntos críticos (raíces):</strong> ${uniqRoots.join(', ')}`);
                const testPoints = [-10, ...uniqRoots.map(r => r + 0.1), 10];
                const intervals = [];
                for (let k = 0; k < testPoints.length - 1; k++) {
                    const mid = (testPoints[k] + testPoints[k+1]) / 2;
                    const val = f(mid);
                    if (isFinite(val)) intervals.push({ from: testPoints[k], to: testPoints[k+1], satisfies: op === '>' ? val > 0 : op === '>=' ? val >= 0 : op === '<' ? val < 0 : val <= 0 });
                }
                const solutionIntervals = intervals.filter(i => i.satisfies).map(i => `${formatNumber(i.from,2)} ≤ x ≤ ${formatNumber(i.to,2)}`);
                if (solutionIntervals.length > 0) {
                    steps.push(`<strong>Solución (intervalos):</strong> ${solutionIntervals.join(' ∪ ')}`);
                }
            }
        }

        const sp = document.getElementById('gen-steps');
        if (sp && steps.length > 0) {
            sp.innerHTML = '<details open style="cursor:pointer"><summary style="color:var(--accent);font-weight:700;font-size:12px;padding:4px 0">📐 Pasos de resolución</summary>' +
                steps.map(s => `<div class="step">${s}</div>`).join('') + '</details>';
            sp.classList.add('show');
        }
    } catch (e) {
        console.log('generateAlgebraicSteps error:', e);
    }
}
