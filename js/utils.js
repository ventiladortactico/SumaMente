function formatNumber(num, decimals = 4) {
    if (num === null || num === undefined || isNaN(num)) return num;
    const n = Number(num);
    if (Number.isInteger(n)) return n.toString();
    return parseFloat(n.toFixed(decimals)).toString();
}

function escHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}

function normalizeInput(str) {
    const subscripts = { '₀':'0','₁':'1','₂':'2','₃':'3','₄':'4','₅':'5','₆':'6','₇':'7','₈':'8','₉':'9' };
    const superscripts = { '²':'^2','³':'^3','¹':'^1' };
    let result = str.replace(/[₀₁₂₃₄₅₆₇₈₉]/g, c => subscripts[c] || c);
    result = result.replace(/[²³¹]/g, c => superscripts[c] || c);
    result = result.replace(/[\u2070-\u2079]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x2050));
    return result;
}

function friendlyError(msg) {
    if (!msg) return 'Ocurrió un error inesperado.';
    if (/caracter.*inv|lido/.test(msg)) return 'No entendí ese formato. Intentá escribirlo de otra forma (ej. "log base 2" en lugar de "log₂").';
    if (/división por cero|division by zero|infinito/.test(msg)) return 'La operación da una división por cero. Revisá los valores.';
    if (/identificador.*inv|lido/.test(msg)) return 'No reconozco ese símbolo. Usá solo letras, números y operadores básicos.';
    if (/par.*ntesis.*desbal/.test(msg)) return 'Falta cerrar un paréntesis. Revisá la expresión.';
    if (/faltan.*arg|faltan.*oper/.test(msg)) return 'Faltan números o argumentos en la expresión.';
    if (/factorial/.test(msg)) return 'El factorial necesita un número entero entre 0 y 170.';
    return msg;
}

function expandSquares(expr) {
    return expr.replace(/\(([^)]+)\)\^2/g, (match, inner) => {
        inner = inner.replace(/\s/g, '');
        let a = 0, b = 0;
        let m = inner.match(/^(-?\d*\.?\d*)\*?x\s*([+-]\s*\d+\.?\d*)?$/);
        if (m) {
            a = m[1] === '' || m[1] === '-' ? (m[1] === '-' ? -1 : 1) : parseFloat(m[1]);
            b = m[2] ? parseFloat(m[2].replace(/\s/g, '')) : 0;
        } else {
            m = inner.match(/^x\s*([+-]\s*\d+\.?\d*)?$/);
            if (m) {
                a = 1;
                b = m[1] ? parseFloat(m[1].replace(/\s/g, '')) : 0;
            } else {
                return match;
            }
        }
        let res = '';
        const a2 = a * a, ab2 = 2 * a * b, b2 = b * b;
        if (a2 !== 0) res += (a2 === 1 ? '' : (a2 === -1 ? '-' : a2.toString())) + 'x^2';
        if (ab2 !== 0) {
            res += (ab2 > 0 && res !== '' ? '+' : '') + (Math.abs(ab2) === 1 ? (ab2 < 0 ? '-' : '') : ab2.toString()) + 'x';
        }
        if (b2 !== 0) res += (b2 > 0 ? '+' : '') + b2.toString();
        return res || '0';
    });
}

function formatExpr(coef, constVal, variable) {
    let str = '';
    if (coef === 1) str = variable;
    else if (coef === -1) str = '-' + variable;
    else str = coef + variable;
    if (constVal > 0) str += ' + ' + constVal;
    else if (constVal < 0) str += ' - ' + Math.abs(constVal);
    return str;
}

function extractCoefficient(expr, variable) {
    try {
        const cleaned = expr.replace(/\s/g, '');
        const match = cleaned.match(/(-?\d*\.?\d*)\*?x/);
        if (match) {
            const coef = match[1];
            return coef === '' || coef === '-' ? (coef === '-' ? -1 : 1) : parseFloat(coef);
        }
        if (cleaned.includes(variable)) return 1;
        return 0;
    } catch (e) {
        return 0;
    }
}

function extractConstant(expr) {
    try {
        const cleaned = expr.replace(/\s/g, '');
        const withoutX = cleaned.replace(/(-?\d*\.?\d*)\*?x/g, '').replace(/[+-]/g, ' $&');
        const matches = withoutX.match(/-?\d+\.?\d*/g);
        if (matches) {
            return matches.reduce((sum, val) => sum + parseFloat(val), 0);
        }
        return 0;
    } catch (e) {
        return 0;
    }
}

function generateNumericSteps(expr) {
    try {
        if (/[a-zA-Z]/.test(expr)) return null;
        const ops = ['^', { '/':'/', '*':'*' }, { '+':'+', '-':'-' }];
        const steps = [];
        let current = expr;
        steps.push(`<strong>Expresión original:</strong> ${current}`);
        let stepNum = 1;
        while (true) {
            current = current.replace(/\s/g, '');
            if (/^-?\d+\.?\d*$/.test(current)) break;

            let bestMatch = null;

            const parenRe = /\(([^()]+)\)/;
            let parenM = current.match(parenRe);
            if (parenM) {
                let inner = parenM[1];
                let innerResult = inner;
                while (true) {
                    innerResult = innerResult.replace(/\s/g, '');
                    if (/^-?\d+\.?\d*$/.test(innerResult)) break;
                    let ibest = null;
                    for (let prec of ops) {
                        if (typeof prec === 'string') {
                            let m = innerResult.match(/(\d+\.?\d*)\s*\^\s*(\d+\.?\d*)/);
                            if (m) { ibest = { op: '^', a: parseFloat(m[1]), b: parseFloat(m[2]), idx: m.index, len: m[0].length }; break; }
                        } else {
                            for (let op of Object.keys(prec)) {
                                const escapedOp = op.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                                const re = new RegExp('(-?\\d+\\.?\\d*)\\s*' + escapedOp + '\\s*(-?\\d+\\.?\\d*)');
                                let m = innerResult.match(re);
                                if (m && (!ibest || m.index < ibest.idx)) {
                                    ibest = { op, a: parseFloat(m[1]), b: parseFloat(m[2]), idx: m.index, len: m[0].length };
                                }
                            }
                            if (ibest) break;
                        }
                    }
                    if (!ibest) break;
                    let r;
                    switch (ibest.op) {
                        case '^': r = Math.pow(ibest.a, ibest.b); break;
                        case '*': r = ibest.a * ibest.b; break;
                        case '/': r = ibest.a / ibest.b; break;
                        case '+': r = ibest.a + ibest.b; break;
                        case '-': r = ibest.a - ibest.b; break;
                    }
                    innerResult = innerResult.slice(0, ibest.idx) + formatNumber(r, 4) + innerResult.slice(ibest.idx + ibest.len);
                }
                steps.push(`<strong>Paso ${stepNum++}:</strong> Resolver (${inner}) = ${innerResult}`);
                current = current.slice(0, parenM.index) + innerResult + current.slice(parenM.index + parenM[0].length);
                steps.push(`<strong>→</strong> ${current}`);
                continue;
            }

            for (let prec of ops) {
                if (typeof prec === 'string') {
                    const re = /(\d+\.?\d*)\s*\^\s*(\d+\.?\d*)/;
                    let m = current.match(re);
                    if (m) { bestMatch = { op: '^', a: parseFloat(m[1]), b: parseFloat(m[2]), idx: m.index, len: m[0].length }; break; }
                } else {
                    for (let op of Object.keys(prec)) {
                        const escapedOp = op.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                        const re = new RegExp('(-?\\d+\\.?\\d*)\\s*' + escapedOp + '\\s*(-?\\d+\\.?\\d*)');
                        let m = current.match(re);
                        if (m && (!bestMatch || m.index < bestMatch.idx)) {
                            bestMatch = { op, a: parseFloat(m[1]), b: parseFloat(m[2]), idx: m.index, len: m[0].length };
                        }
                    }
                    if (bestMatch) break;
                }
            }
            if (!bestMatch) break;
            let result;
            switch (bestMatch.op) {
                case '^': result = Math.pow(bestMatch.a, bestMatch.b); break;
                case '*': result = bestMatch.a * bestMatch.b; break;
                case '/': result = bestMatch.a / bestMatch.b; break;
                case '+': result = bestMatch.a + bestMatch.b; break;
                case '-': result = bestMatch.a - bestMatch.b; break;
            }
            steps.push(`<strong>Paso ${stepNum++}:</strong> ${bestMatch.a} ${bestMatch.op} ${bestMatch.b} = ${formatNumber(result, 4)}`);
            current = current.slice(0, bestMatch.idx) + formatNumber(result, 4) + current.slice(bestMatch.idx + bestMatch.len);
            steps.push(`<strong>→</strong> ${current}`);
        }
        return steps;
    } catch (e) {
        return null;
    }
}

function extractQuadraticCoefficients(expr) {
    let s = expr.replace(/\s/g, '');
    const terms = s.match(/[+-]?[^+-]+/g) || [];
    let a = 0, b = 0, c = 0;
    for (let term of terms) {
        let sign = 1;
        if (term.startsWith('-')) { sign = -1; term = term.slice(1); }
        else if (term.startsWith('+')) { term = term.slice(1); }
        if (/x\^2/.test(term)) {
            const coefStr = term.replace(/\*?x\^2/, '');
            a += sign * (coefStr === '' ? 1 : parseFloat(coefStr));
        } else if (/x(?!\^)/.test(term)) {
            const coefStr = term.replace(/\*?x/, '');
            b += sign * (coefStr === '' ? 1 : parseFloat(coefStr));
        } else {
            c += sign * parseFloat(term);
        }
    }
    return { a, b, c };
}

function extractParenContent(str, startIdx) {
    let depth = 1, idx = startIdx + 1;
    while (idx < str.length && depth > 0) {
        if (str[idx] === '(') depth++;
        else if (str[idx] === ')') depth--;
        if (depth > 0) idx++;
    }
    return str.slice(startIdx + 1, idx);
}
