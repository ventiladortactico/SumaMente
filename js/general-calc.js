let is2nd = false;

function reset2ndUI() {
    is2nd = false;
    const btn2nd = document.getElementById('btn-2nd');
    if (btn2nd) btn2nd.classList.remove('active');
    document.querySelectorAll('.keypad [data-lbl]').forEach(btn => {
        if (btn.dataset.lbl) btn.textContent = btn.dataset.lbl;
    });
}

function genKey(k) { 
    if (genResult === 'Error') genResult = ''; 
    
    if (k === '.') {
        const lastNumberMatch = genExpr.match(/(\d+\.?\d*)$/);
        if (lastNumberMatch && lastNumberMatch[0].includes('.')) {
            return;
        }
        if (!lastNumberMatch) k = '0.'; 
    }

    genExpr += k; 
    document.getElementById('gen-expr').textContent = genExpr; 
}

function showGenPDFBtn() {}
function genClear() { genExpr = ''; genResult = '0'; genLastResult = null; document.getElementById('gen-expr').textContent = ''; document.getElementById('gen-result').textContent = '0'; const cv = document.getElementById('chart-canvas-general'); if (cv) cv.style.display = 'none'; const gc = document.getElementById('graph-controls'); if (gc) gc.style.display = 'none'; }
function genBack() { genExpr = genExpr.slice(0, -1); document.getElementById('gen-expr').textContent = genExpr; }
function genNegate() {
    const match = genExpr.match(/(-?\d+\.?\d*)$/);
    if (match) {
        const num = match[0];
        const newNum = num.startsWith('-') ? num.slice(1) : '-' + num;
        genExpr = genExpr.slice(0, match.index) + newNum;
        document.getElementById('gen-expr').textContent = genExpr;
    } else {
        genKey('-');
    }
}

function toggle2ndMode() {
    is2nd = !is2nd;
    document.getElementById('btn-2nd').classList.toggle('active', is2nd);
    document.querySelectorAll('.keypad [data-lbl]').forEach(btn => {
        if (is2nd && btn.dataset.lbl2) {
            btn.textContent = btn.dataset.lbl2;
        } else {
            btn.textContent = btn.dataset.lbl;
        }
    });
}
function pressKey(normal, alt) {
    if (is2nd && alt) {
        genKey(alt);
        reset2ndUI();
    } else {
        genKey(normal);
    }
}

function genEval() {
    try {
        const dbg = document.getElementById('graph-debug');
        if (dbg) dbg.style.display = 'none';

        if (!genExpr) {
            return;
        }
        let expr = normalizeInput(genExpr).replace(/π/g, 'pi');

        if (/^[+\-*/^]/.test(expr.trim()) && genLastResult !== null && genLastResult !== 'Error') {
            expr = parseFloat(genLastResult) + expr;
        }

        let abiertos = (expr.match(/\(/g) || []).length;
        let cerrados = (expr.match(/\)/g) || []).length;
        if (abiertos > cerrados) expr += ")".repeat(abiertos - cerrados);

        expr = expr.replace(/([+\-*/])\1+/g, '$1');

        expr = expr.replace(/(\d+(?:\.\d+)?)\s*([+\-])\s*(\d+(?:\.\d+)?)\s*%/g, '$1 $2 ($1 * $3 / 100)');
        expr = expr.replace(/(\d+(?:\.\d+)?)\s*%/g, '($1 / 100)');
        
        if (expr.includes(',') && expr.includes('=') && expr.includes('x') && expr.includes('y') && !expr.includes('z')) {
            const eqs = expr.split(',').map(s => s.trim());
            if (eqs.length === 2 && eqs.every(e => e.includes('='))) {
                genPlotSystem2x2(eqs[0], eqs[1]);
                const steps = solveSystem2x2(eqs[0], eqs[1]);
                const sp = document.getElementById('gen-steps') || createStepsPanel();
                sp.innerHTML = '<details style="cursor:pointer"><summary style="color:var(--accent);font-weight:700;font-size:12px;padding:4px 0">Mostrar pasos</summary>' +
                    steps.map(s => `<div class="step">${s}</div>`).join('') + '</details>';
                sp.classList.add('show');
                document.getElementById('gen-expr').textContent = genExpr;
                document.getElementById('gen-result').textContent = genResult || 'Sistema resuelto';
                addHistory('general', 'system', genResult || 'Sistema resuelto', genExpr, genExpr);
                genExpr = '';
                genLastResult = null;
                return;
            }
        }
        
        if (expr.includes('=') && /x/.test(expr) && /y/.test(expr) && !expr.includes(',')) {
            const parts = expr.split('=');
            if (parts.length === 2) {
                const left = parts[0].trim(), right = parts[1].trim();
                if (/^y$/i.test(left) && /x/.test(right)) {
                    genPlotFunc(right);
                    const steps = document.getElementById('gen-steps') || createStepsPanel();
                    steps.innerHTML = '<details style="cursor:pointer"><summary style="color:var(--accent);font-weight:700;font-size:12px;padding:4px 0">Mostrar pasos</summary>' +
                        '<div class="step"><strong>Ecuación:</strong> ' + expr + '</div>' +
                        '<div class="step">Pendiente (m) y ordenada al origen (b) extraídas directamente.</div>' +
                        '<div class="step" style="color:var(--text3)">La gráfica muestra la recta correspondiente.</div></details>';
                    steps.classList.add('show');
                    genResult = `y = ${right}`;
                    document.getElementById('gen-result').textContent = 'y = ' + right;
                    document.getElementById('gen-expr').textContent = genExpr;
                    addHistory('general', 'linear2var', genResult, genExpr, genExpr);
                    genExpr = '';
                    genLastResult = null;
                    return;
                }
                const p = parseLinearEq(expr);
                if (p && p.b !== 0) {
                    const yExpr = `(${p.c} - ${p.a}*x) / ${p.b}`;
                    genPlotFunc(yExpr);
                    const steps = document.getElementById('gen-steps') || createStepsPanel();
                    steps.innerHTML = '<details style="cursor:pointer"><summary style="color:var(--accent);font-weight:700;font-size:12px;padding:4px 0">Mostrar pasos</summary>' +
                        '<div class="step"><strong>Ecuación lineal:</strong> ' + expr + '</div>' +
                        '<div class="step">Despejando y:</div>' +
                        '<div class="step"><strong>y = (' + p.c + ' - ' + p.a + 'x) / ' + p.b + '</strong></div>' +
                        '<div class="step" style="color:var(--text3)">La gráfica muestra la recta correspondiente.</div></details>';
                    steps.classList.add('show');
                    genResult = `y = (${p.c} - ${p.a}x) / ${p.b}`;
                    document.getElementById('gen-result').textContent = 'y despejada';
                    document.getElementById('gen-expr').textContent = genExpr;
                    addHistory('general', 'linear2var', genResult, genExpr, genExpr);
                    genExpr = '';
                    genLastResult = null;
                    return;
                }
            }
        }
        
        if (expr.includes(',') && (expr.match(/=/g) || []).length >= 3) {
            const eqs = expr.split(',').map(s => s.trim());
            if (eqs.length === 3 && eqs.every(e => e.includes('='))) {
                try {
                    const parseCoef = (s) => {
                        if (!s || s === '+' || s.trim() === '') return 1;
                        if (s === '-') return -1;
                        return parseFloat(s);
                    };
                    const coefs = eqs.map(eq => {
                        const m = eq.match(/(-?\d*\.?\d*)\s*\*?\s*x\s*([+-]?\s*\d*\.?\d*)\s*\*?\s*y\s*([+-]?\s*\d*\.?\d*)\s*\*?\s*z\s*=\s*(-?\d+\.?\d*)/);
                        if (!m) return null;
                        return [parseCoef(m[1]), parseCoef(m[2]), parseCoef(m[3]), parseFloat(m[4])];
                    });
                    if (coefs.every(c => c !== null)) {
                        const [a1,b1,c1,d1] = coefs[0], [a2,b2,c2,d2] = coefs[1], [a3,b3,c3,d3] = coefs[2];
                        const det = (m) => m[0]*(m[4]*m[8]-m[5]*m[7]) - m[1]*(m[3]*m[8]-m[5]*m[6]) + m[2]*(m[3]*m[7]-m[4]*m[6]);
                        const D = det([a1,b1,c1,a2,b2,c2,a3,b3,c3]);
                        if (Math.abs(D) > 1e-14) {
                            const Dx = det([d1,b1,c1,d2,b2,c2,d3,b3,c3]);
                            const Dy = det([a1,d1,c1,a2,d2,c2,a3,d3,c3]);
                            const Dz = det([a1,b1,d1,a2,b2,d2,a3,b3,d3]);
                            const x = Dx/D, y = Dy/D, z = Dz/D;
                            genResult = 'x='+x.toFixed(3)+', y='+y.toFixed(3)+', z='+z.toFixed(3);
                            const sp = document.getElementById('gen-steps') || createStepsPanel();
                            sp.innerHTML = '<details style="cursor:pointer"><summary style="color:var(--accent);font-weight:700;font-size:12px;padding:4px 0">Mostrar pasos</summary>' +
                                '<div class="step"><strong>Sistema 3×3 resuelto por Cramer:</strong></div>' +
                                '<div class="step">D = '+D.toFixed(3)+'</div>'+
                                '<div class="step">Dx = '+Dx.toFixed(3)+', Dy = '+Dy.toFixed(3)+', Dz = '+Dz.toFixed(3)+'</div>'+
                                '<div class="step">x = '+x.toFixed(3)+', y = '+y.toFixed(3)+', z = '+z.toFixed(3)+'</div></details>';
                            sp.classList.add('show');
                            document.getElementById('gen-expr').textContent = genExpr;
                            document.getElementById('gen-result').textContent = genResult;
                            addHistory('general', 'system3x3', genResult, genExpr, genExpr);
                            genExpr = ''; genLastResult = null;
                            return;
                        }
                    }
                } catch(e) {}
            }
        }
        
        if (expr.includes(',') && /x\s*=\s*/.test(expr) && /y\s*=\s*/.test(expr)) {
            const parts = expr.split(',').map(s => s.trim());
            if (parts.length === 2) {
                const xExpr = parts[0].replace(/^x\s*=\s*/, '').trim();
                const yExpr = parts[1].replace(/^y\s*=\s*/, '').trim();
                if (xExpr && yExpr) {
                    genPlotParametric(xExpr, yExpr);
                    const sp = document.getElementById('gen-steps') || createStepsPanel();
                    sp.innerHTML = '<details style="cursor:pointer"><summary style="color:var(--accent);font-weight:700;font-size:12px;padding:4px 0">Mostrar pasos</summary>' +
                        '<div class="step"><strong>Ecuaciones paramétricas:</strong></div>' +
                        '<div class="step">x(t) = ' + xExpr + '</div>' +
                        '<div class="step">y(t) = ' + yExpr + '</div>' +
                        '<div class="step" style="color:var(--text3)">La gráfica muestra la curva paramétrica para t ∈ [-10, 10].</div></details>';
                    sp.classList.add('show');
                    genResult = 'Curva paramétrica graficada';
                    document.getElementById('gen-result').textContent = genResult;
                    document.getElementById('gen-expr').textContent = genExpr;
                    addHistory('general', 'parametric', genResult, genExpr, genExpr);
                    genExpr = '';
                    genLastResult = null;
                    return;
                }
            }
        }
        
        const ineqMatch = expr.match(/(>=|<=|>|<)/);
        if (ineqMatch && /x/.test(expr)) {
            const op = ineqMatch[1];
            genPlotInequality(expr, op);
            genResult = null;
            generateAlgebraicSteps(expr);
            document.getElementById('gen-result').textContent = genResult || 'Inecuación graficada';
            const sp = document.getElementById('gen-steps') || createStepsPanel();
            if (sp) sp.classList.add('show');
            document.getElementById('gen-expr').textContent = genExpr;
            addHistory('general', 'inequality', genResult || 'Inecuación', genExpr, genExpr);
            genExpr = '';
            genLastResult = null;
            return;
        }
        
        if (/x/.test(expr)) {
            
            if (/x\^2|x²/.test(expr)) {
                const plotExpr = expr.includes('=') ? expr.split('=')[0].trim() : expr;
                const analysis = analyzeQuadratic(plotExpr);
                if (analysis) {
                    const sp = document.getElementById('gen-steps') || createStepsPanel();
                    sp.innerHTML = '<details open style="cursor:pointer"><summary style="color:var(--accent);font-weight:700;font-size:12px;padding:4px 0">📐 Análisis de la parábola</summary>' +
                        analysis.steps.map(s => `<div class="step">${s}</div>`).join('') + '</details>';
                    sp.classList.add('show');
                    plotMinX = analysis.h - 6;
                    plotMaxX = analysis.h + 6;
                    const yEdge1 = safeMathEval(plotExpr, { x: plotMinX });
                    const yEdge2 = safeMathEval(plotExpr, { x: plotMaxX });
                    const yMinActual = Math.min(analysis.k, yEdge1, yEdge2);
                    const yMaxActual = Math.max(analysis.k, yEdge1, yEdge2);
                    const yRange = yMaxActual - yMinActual || 1;
                    plotMinY = yMinActual - yRange * 0.08;
                    plotMaxY = yMaxActual + yRange * 0.08;
                    genPlotFunc(plotExpr, true);
                    genResult = `Vértice (${parseFloat(analysis.h.toFixed(3))}, ${parseFloat(analysis.k.toFixed(3))})`;
                    document.getElementById('gen-result').textContent = genResult;
                    document.getElementById('gen-expr').textContent = 'f(x) = ' + genExpr;
                    addHistory('general', 'quadratic', genResult, 'f(x) = ' + genExpr, genExpr);
                    showGenPDFBtn();
                    genExpr = '';
                    genLastResult = null;
                    return;
                }
            }
            
            if (expr.includes('=')) {
                genPlotEquation(expr);
                let resultText = 'Ecuación graficada';
                const eqParts = expr.split('=');
                if (eqParts.length === 2) {
                    const eqLeft = eqParts[0].trim();
                    const eqRight = eqParts[1].trim();
                    if (!/x\^2|x²/.test(eqLeft) && !/x\^2|x²/.test(eqRight)) {
                        if (eqLeft.includes('x') && eqRight.includes('x')) {
                            const lc = extractCoefficient(eqLeft, 'x');
                            const rc = extractCoefficient(eqRight, 'x');
                            const lk = extractConstant(eqLeft);
                            const rk = extractConstant(eqRight);
                            const newCoef = lc - rc;
                            const newConst = rk - lk;
                            if (newCoef === 0 && newConst === 0) resultText = 'Infinitas soluciones';
                            else if (newCoef === 0) resultText = 'No tiene solución';
                            else resultText = 'x = ' + formatNumber(newConst / newCoef, 4);
                        } else if (eqLeft.includes('x') && !eqRight.includes('x')) {
                            const lc = extractCoefficient(eqLeft, 'x');
                            const lk = extractConstant(eqLeft);
                            if (lc !== 0) resultText = 'x = ' + formatNumber((parseFloat(eqRight) - lk) / lc, 4);
                        } else if (!eqLeft.includes('x') && eqRight.includes('x')) {
                            const rc = extractCoefficient(eqRight, 'x');
                            const rk = extractConstant(eqRight);
                            if (rc !== 0) resultText = 'x = ' + formatNumber((parseFloat(eqLeft) - rk) / rc, 4);
                        }
                    }
                }
                genResult = null;
                generateAlgebraicSteps(expr);
                if (genResult !== null) {
                    resultText = genResult;
                }
                const sp = document.getElementById('gen-steps') || createStepsPanel();
                if (sp) sp.classList.add('show');
                let eqSteps = [];
                if (sp) {
                    try { eqSteps = Array.from(sp.querySelectorAll('.step')).map(d => d.innerHTML); } catch(e) {}
                }
                genResult = resultText;
                document.getElementById('gen-expr').textContent = genExpr;
                document.getElementById('gen-result').textContent = resultText;
                addHistory('general', 'eq', resultText, genExpr, genExpr, eqSteps);
                genExpr = '';
                genLastResult = null;
                return;
            }
            
            genPlotFunc(expr);
            let r = safeMathEval(expr, { x: 0 });
            if (!isFinite(r)) throw new Error('Resultado infinito');
            genResult = 'f(x) graficada';
            document.getElementById('gen-result').textContent = genResult;
            document.getElementById('gen-expr').textContent = 'f(x) = ' + genExpr;
            addHistory('general', 'func', 'f(x) graficada', 'f(x) = ' + genExpr, genExpr);
            showGenPDFBtn();
            genExpr = '';
            genLastResult = null;
            return;
        }

        let r = safeMathEval(expr);
        if (!isFinite(r)) throw new Error('Resultado infinito');
        genResult = parseFloat(r.toFixed(10)).toString();
        genLastResult = genResult;
        document.getElementById('gen-result').textContent = genResult;
        document.getElementById('gen-expr').textContent = genExpr + ' =';
        
        const numericSteps = generateNumericSteps(expr);
        if (numericSteps && numericSteps.length > 0) {
            const sp = document.getElementById('gen-steps') || createStepsPanel();
            sp.innerHTML = '<details style="cursor:pointer"><summary style="color:var(--accent);font-weight:700;font-size:12px;padding:4px 0">Mostrar pasos</summary>' +
                numericSteps.map(s => `<div class="step">${s}</div>`).join('') + '</details>';
            sp.classList.add('show');
        }
        
        addHistory('general', 'expr', genResult, genExpr, genExpr, numericSteps || []);
        showGenPDFBtn();

        const canvas = document.getElementById('chart-canvas-general');
        if (canvas) canvas.style.display = 'none';

        genExpr = '';
    } catch (e) { 
        var errMsg = friendlyError((e && e.message) || String(e) || 'Error');
        document.getElementById('gen-result').textContent = 'Error'; 
        document.getElementById('gen-expr').textContent = errMsg; 
        genResult = 'Error'; 
        genExpr = ''; 
    }
}

function genMemStore() { genMemory = parseFloat(document.getElementById('gen-result').textContent) || 0; }
function genMemRecall() { genKey(genMemory.toString()); }
function genMemClear() { genMemory = 0; }
function genMemAdd() { genMemory += parseFloat(document.getElementById('gen-result').textContent) || 0; }
function genMemSub() { genMemory -= parseFloat(document.getElementById('gen-result').textContent) || 0; }
function genFactorial() {
    const exprMatch = genExpr.match(/(-?\d+\.?\d*)$/);
    let n = exprMatch ? parseInt(exprMatch[1]) : parseInt(genResult);
    if (isNaN(n) || n < 0 || n > 170) return;
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    genResult = r.toString();
    document.getElementById('gen-result').textContent = genResult;
}

function copyResult() {
    const text = document.getElementById('gen-result').textContent;
    if (text && text !== '0') {
        navigator.clipboard.writeText(text).catch(() => {
            const ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            ta.remove();
        });
    }
}

function toggleAngleMode() {
    angleMode = angleMode === 'deg' ? 'rad' : 'deg';
    const btn = document.getElementById('angle-btn');
    if (btn) btn.textContent = angleMode.toUpperCase();
}
