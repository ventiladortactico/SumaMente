FORMS.alg = {
    cuadratica: {
        title: 'Ecuación Cuadrática',
        formula: 'x = (\u2013b \u00b1 \u221a(b\u00b2 \u2013 4ac)) / 2a',
        fields: [
            { id: 'a', label: 'Coeficiente a', val: '1' },
            { id: 'b', label: 'Coeficiente b', val: '5' },
            { id: 'c', label: 'Coeficiente c', val: '6' }
        ],
        calc(f) {
            let a = parseFloat(f.a.value), b = parseFloat(f.b.value), c = parseFloat(f.c.value);
            if (isNaN(a) || isNaN(b) || isNaN(c)) return null;
            if (a === 0) return { error: true, msg: 'El coeficiente a no puede ser 0', label: 'No es cuadr\u00e1tica' };
            let d = b * b - 4 * a * c;
            let steps = ['\u0394 = ' + b + '\u00b2 \u2013 4\u00b7' + a + '\u00b7' + c + ' = ' + d];
            let extras = [{ cls: 'info', txt: 'Discriminante \u0394 = ' + d }];
            let x1, x2, main;
            if (d < 0) {
                let real = (-b / (2 * a)).toFixed(3);
                let imag = (Math.sqrt(Math.abs(d)) / (2 * a)).toFixed(3);
                main = real + ' \u00b1 ' + imag + 'i';
                steps.push('x = ' + real + ' \u00b1 ' + imag + 'i (ra\u00edces complejas)');
                extras.push({ cls: 'warn', txt: 'Ra\u00edces complejas conjugadas' });
            } else {
                let sqrtD = Math.sqrt(d);
                x1 = (-b + sqrtD) / (2 * a);
                x2 = (-b - sqrtD) / (2 * a);
                main = 'x\u2081 = ' + x1.toFixed(3) + ',  x\u2082 = ' + x2.toFixed(3);
                steps.push('x\u2081 = (\u2013' + b + ' + \u221a' + d + ') / (2\u00b7' + a + ') = ' + x1.toFixed(3));
                steps.push('x\u2082 = (\u2013' + b + ' \u2013 \u221a' + d + ') / (2\u00b7' + a + ') = ' + x2.toFixed(3));
                if (d === 0) extras.push({ cls: 'info', txt: 'Una ra\u00edz real doble' });
                else extras.push({ cls: 'info', txt: 'Dos ra\u00edces reales distintas' });
            }
            return {
                main, label: 'Soluci\u00f3n', extras, steps,
                chart(canvas) {
                    AlgebraVisual.parabola(canvas, a, b, c);
                }
            };
        }
    },
    lineal: {
        title: 'Ecuaci\u00f3n Lineal',
        formula: 'y = mx + b',
        vars: [
            { id: 'y', label: 'Calcular y' },
            { id: 'x', label: 'Calcular x' }
        ],
        fields: [
            { id: 'm', label: 'Pendiente (m)', val: '2' },
            { id: 'b', label: 'Intersecci\u00f3n (b)', val: '3' },
            { id: 'x', label: 'Valor de x', val: '5' },
            { id: 'y', label: 'Valor de y', val: '' }
        ],
        onChange(target, f) {
            f.y.disabled = target === 'y';
            f.x.disabled = target === 'x';
            if (target === 'y') f.y.value = '';
            if (target === 'x') f.x.value = '';
        },
        calc(f, target) {
            let m = parseFloat(f.m.value), b = parseFloat(f.b.value);
            if (isNaN(m) || isNaN(b)) return null;
            if (target === 'y' || !target) {
                let x = parseFloat(f.x.value);
                if (isNaN(x)) return null;
                let y = m * x + b;
                return { main: y.toFixed(3), label: 'y', steps: ['y = ' + m + '\u00b7' + x + ' + ' + b], extras: [], chart(c) { AlgebraVisual.linea(c, m, b, x); } };
            } else {
                let y = parseFloat(f.y.value);
                if (isNaN(y)) return null;
                if (m === 0) return { error: true, msg: 'm = 0, x no depende de y', label: 'Indeterminado' };
                let x = (y - b) / m;
                return { main: x.toFixed(3), label: 'x', steps: ['x = (' + y + ' \u2013 ' + b + ') / ' + m], extras: [], chart(c) { AlgebraVisual.linea(c, m, b, x); } };
            }
        }
    },
    discriminante: {
        title: 'Discriminante',
        formula: '\u0394 = b\u00b2 \u2013 4ac',
        fields: [
            { id: 'a', label: 'Coeficiente a', val: '1' },
            { id: 'b', label: 'Coeficiente b', val: '5' },
            { id: 'c', label: 'Coeficiente c', val: '6' }
        ],
        calc(f) {
            let a = parseFloat(f.a.value), b = parseFloat(f.b.value), c = parseFloat(f.c.value);
            if (isNaN(a) || isNaN(b) || isNaN(c)) return null;
            let d = b * b - 4 * a * c;
            let type = d > 0 ? 'Dos ra\u00edces reales' : d === 0 ? 'Una ra\u00edz real doble' : 'Ra\u00edces complejas';
            return { main: d.toFixed(3), label: 'Discriminante \u0394', extras: [{ cls: d < 0 ? 'warn' : 'info', txt: type }], steps: ['\u0394 = ' + b + '\u00b2 \u2013 4\u00b7' + a + '\u00b7' + c + ' = ' + d], chart(c) { AlgebraVisual.numberLine(c, d); } };
        }
    },
    sistema2x2: {
        title: 'Sistema 2\u00d72',
        formula: 'a\u2081x + b\u2081y = c\u2081  |  a\u2082x + b\u2082y = c\u2082',
        fields: [
            { id: 'a1', label: 'a\u2081', val: '2' },
            { id: 'b1', label: 'b\u2081', val: '3' },
            { id: 'c1', label: 'c\u2081', val: '8' },
            { id: 'a2', label: 'a\u2082', val: '4' },
            { id: 'b2', label: 'b\u2082', val: '-1' },
            { id: 'c2', label: 'c\u2082', val: '2' }
        ],
        calc(f) {
            let a1=parseFloat(f.a1.value), b1=parseFloat(f.b1.value), c1=parseFloat(f.c1.value);
            let a2=parseFloat(f.a2.value), b2=parseFloat(f.b2.value), c2=parseFloat(f.c2.value);
            if ([a1,b1,c1,a2,b2,c2].some(isNaN)) return null;
            let det = a1 * b2 - a2 * b1;
            if (det === 0) return { error: true, msg: 'Sistema indeterminado o incompatible (det = 0)', label: 'Sin soluci\u00f3n \u00fanica' };
            let x = (c1 * b2 - c2 * b1) / det;
            let y = (a1 * c2 - a2 * c1) / det;
            return {
                main: 'x = ' + x.toFixed(3) + ',  y = ' + y.toFixed(3), label: 'Soluci\u00f3n',
                steps: ['\u0394 = ' + a1 + '\u00b7' + b2 + ' \u2013 ' + a2 + '\u00b7' + b1 + ' = ' + det, 'x = (' + c1 + '\u00b7' + b2 + ' \u2013 ' + c2 + '\u00b7' + b1 + ') / ' + det + ' = ' + x.toFixed(3), 'y = (' + a1 + '\u00b7' + c2 + ' \u2013 ' + a2 + '\u00b7' + c1 + ') / ' + det + ' = ' + y.toFixed(3)],
                extras: [], chart(c) { AlgebraVisual.sistema2x2(c, a1, b1, c1, a2, b2, c2, x, y); }
            };
        }
    },
    regla3: {
        title: 'Regla de Tres',
        formula: 'a / b = c / d',
        vars: [
            { id: 'd', label: 'Calcular d' },
            { id: 'a', label: 'Calcular a' },
            { id: 'b', label: 'Calcular b' },
            { id: 'c', label: 'Calcular c' }
        ],
        fields: [
            { id: 'a', label: 'a', val: '2' },
            { id: 'b', label: 'b', val: '4' },
            { id: 'c', label: 'c', val: '6' },
            { id: 'd', label: 'd', val: '' }
        ],
        onChange(target, f) {
            f.a.disabled = target === 'a'; f.b.disabled = target === 'b';
            f.c.disabled = target === 'c'; f.d.disabled = target === 'd';
            if (target === 'a') f.a.value = ''; if (target === 'b') f.b.value = '';
            if (target === 'c') f.c.value = ''; if (target === 'd') f.d.value = '';
        },
        calc(f, target) {
            if (target === 'd' || !target) {
                let a = parseFloat(f.a.value), b = parseFloat(f.b.value), c = parseFloat(f.c.value);
                if (isNaN(a) || isNaN(b) || isNaN(c)) return null;
                if (b === 0 || a === 0) return { error: true, msg: 'a y b no pueden ser 0', label: 'Error' };
                let d = (c * b) / a;
                return { main: d.toFixed(4), label: 'd', steps: ['a/b = c/d', 'd = (c\u00d7b)/a = (' + c + '\u00d7' + b + ')/' + a + ' = ' + d.toFixed(4)], extras: [] };
            } else if (target === 'a') {
                let b = parseFloat(f.b.value), c = parseFloat(f.c.value), d = parseFloat(f.d.value);
                if (isNaN(b) || isNaN(c) || isNaN(d)) return null;
                if (b === 0) return { error: true, msg: 'b no puede ser 0', label: 'Error' };
                let a = (c * b) / d;
                return { main: a.toFixed(4), label: 'a', steps: ['a/b = c/d', 'a = (c\u00d7b)/d = (' + c + '\u00d7' + b + ')/' + d + ' = ' + a.toFixed(4)], extras: [] };
            } else if (target === 'b') {
                let a = parseFloat(f.a.value), c = parseFloat(f.c.value), d = parseFloat(f.d.value);
                if (isNaN(a) || isNaN(c) || isNaN(d)) return null;
                if (d === 0) return { error: true, msg: 'd no puede ser 0', label: 'Error' };
                let b = (a * d) / c;
                return { main: b.toFixed(4), label: 'b', steps: ['a/b = c/d', 'b = (a\u00d7d)/c = (' + a + '\u00d7' + d + ')/' + c + ' = ' + b.toFixed(4)], extras: [] };
            } else {
                let a = parseFloat(f.a.value), b = parseFloat(f.b.value), d = parseFloat(f.d.value);
                if (isNaN(a) || isNaN(b) || isNaN(d)) return null;
                if (b === 0) return { error: true, msg: 'b no puede ser 0', label: 'Error' };
                let c = (a * d) / b;
                return { main: c.toFixed(4), label: 'c', steps: ['a/b = c/d', 'c = (a\u00d7d)/b = (' + a + '\u00d7' + d + ')/' + b + ' = ' + c.toFixed(4)], extras: [] };
            }
        }
    },
    progresion: {
        title: 'Progresi\u00f3n Aritm\u00e9tica',
        formula: 'a\u2099 = a\u2081 + (n \u2013 1)\u00b7d',
        vars: [
            { id: 'an', label: 'Calcular a\u2099' },
            { id: 'a1', label: 'Calcular a\u2081' },
            { id: 'd', label: 'Calcular diferencia (d)' },
            { id: 'n', label: 'Calcular n (t\u00e9rmino)' }
        ],
        fields: [
            { id: 'a1', label: 'Primer t\u00e9rmino (a\u2081)', val: '3' },
            { id: 'd', label: 'Diferencia (d)', val: '4' },
            { id: 'n', label: 'N\u00famero de t\u00e9rmino (n)', val: '10' },
            { id: 'an', label: 'T\u00e9rmino n-\u00e9simo (a\u2099)', val: '' }
        ],
        onChange(target, f) {
            f.a1.disabled = target === 'a1'; f.d.disabled = target === 'd';
            f.n.disabled = target === 'n'; f.an.disabled = target === 'an';
            if (target === 'a1') f.a1.value = ''; if (target === 'd') f.d.value = '';
            if (target === 'n') f.n.value = ''; if (target === 'an') f.an.value = '';
        },
        calc(f, target) {
            if (target === 'an' || !target) {
                let a1 = parseFloat(f.a1.value), d = parseFloat(f.d.value), n = parseFloat(f.n.value);
                if (isNaN(a1) || isNaN(d) || isNaN(n)) return null;
                if (n < 1 || !Number.isInteger(n)) return { error: true, msg: 'n debe ser entero \u2265 1', label: 'Error' };
                let an = a1 + (n - 1) * d;
                return { main: an.toFixed(4), label: 'a' + parseInt(n), steps: ['a\u2099 = a\u2081 + (n\u20131)d', 'a' + parseInt(n) + ' = ' + a1 + ' + (' + parseInt(n) + '\u20131)\u00b7' + d + ' = ' + an.toFixed(4)], extras: [], chart(c) { AlgebraVisual.progresionPuntos(c, a1, d, n); } };
            } else if (target === 'a1') {
                let d = parseFloat(f.d.value), n = parseFloat(f.n.value), an = parseFloat(f.an.value);
                if (isNaN(d) || isNaN(n) || isNaN(an)) return null;
                if (n < 1 || !Number.isInteger(n)) return { error: true, msg: 'n debe ser entero \u2265 1', label: 'Error' };
                let a1 = an - (n - 1) * d;
                return { main: a1.toFixed(4), label: 'a\u2081', steps: ['a\u2081 = a\u2099 \u2013 (n\u20131)d', 'a\u2081 = ' + an + ' \u2013 (' + parseInt(n) + '\u20131)\u00b7' + d + ' = ' + a1.toFixed(4)], extras: [], chart(c) { AlgebraVisual.progresionPuntos(c, a1, d, n); } };
            } else if (target === 'd') {
                let a1 = parseFloat(f.a1.value), n = parseFloat(f.n.value), an = parseFloat(f.an.value);
                if (isNaN(a1) || isNaN(n) || isNaN(an)) return null;
                if (n < 2) return { error: true, msg: 'n debe ser \u2265 2 para calcular d', label: 'Error' };
                let d = (an - a1) / (n - 1);
                return { main: d.toFixed(4), label: 'd', steps: ['d = (a\u2099 \u2013 a\u2081) / (n\u20131)', 'd = (' + an + ' \u2013 ' + a1 + ') / (' + parseInt(n) + '\u20131) = ' + d.toFixed(4)], extras: [], chart(c) { AlgebraVisual.progresionPuntos(c, a1, d, n); } };
            } else {
                let a1 = parseFloat(f.a1.value), d = parseFloat(f.d.value), an = parseFloat(f.an.value);
                if (isNaN(a1) || isNaN(d) || isNaN(an)) return null;
                if (d === 0) return { error: true, msg: 'd = 0, n no se puede determinar', label: 'Error' };
                let n = (an - a1) / d + 1;
                if (n < 1 || !Number.isInteger(n)) return { error: true, msg: 'n debe ser entero \u2265 1. Verificar datos.', label: 'Error' };
                return { main: n.toString(), label: 'n = ' + parseInt(n), steps: ['n = (a\u2099 \u2013 a\u2081)/d + 1', 'n = (' + an + ' \u2013 ' + a1 + ')/' + d + ' + 1 = ' + parseInt(n)], extras: [], chart(c) { AlgebraVisual.progresionPuntos(c, a1, d, n); } };
            }
        }
    },
    progresion_geo: {
        title: 'Progresi\u00f3n Geom\u00e9trica',
        formula: 'a\u2099 = a\u2081 \u00b7 r^(n\u20131)',
        vars: [
            { id: 'an', label: 'Calcular a\u2099' },
            { id: 'a1', label: 'Calcular a\u2081' },
            { id: 'r', label: 'Calcular raz\u00f3n (r)' },
            { id: 'n', label: 'Calcular n (t\u00e9rmino)' }
        ],
        fields: [
            { id: 'a1', label: 'Primer t\u00e9rmino (a\u2081)', val: '2' },
            { id: 'r', label: 'Raz\u00f3n (r)', val: '3' },
            { id: 'n', label: 'T\u00e9rmino (n)', val: '6' },
            { id: 'an', label: 'T\u00e9rmino n-\u00e9simo (a\u2099)', val: '' }
        ],
        onChange(target, f) {
            f.a1.disabled = target === 'a1'; f.r.disabled = target === 'r';
            f.n.disabled = target === 'n'; f.an.disabled = target === 'an';
            if (target === 'a1') f.a1.value = ''; if (target === 'r') f.r.value = '';
            if (target === 'n') f.n.value = ''; if (target === 'an') f.an.value = '';
        },
        calc(f, target) {
            if (target === 'an' || !target) {
                let a1 = parseFloat(f.a1.value), r = parseFloat(f.r.value), n = parseFloat(f.n.value);
                if (isNaN(a1) || isNaN(r) || isNaN(n)) return null;
                if (n < 1 || !Number.isInteger(n)) return { error: true, msg: 'n debe ser entero \u2265 1', label: 'Error' };
                let an = a1 * Math.pow(r, n - 1);
                return { main: an.toFixed(4), label: 'a' + parseInt(n), steps: ['a\u2099 = a\u2081\u00b7r^(n\u20131)', 'a' + parseInt(n) + ' = ' + a1 + '\u00b7' + r + '^(' + parseInt(n) + '\u20131) = ' + an.toFixed(4)], extras: [], chart(c) { AlgebraVisual.progresionGeoCurva(c, a1, r, n); } };
            } else if (target === 'a1') {
                let r = parseFloat(f.r.value), n = parseFloat(f.n.value), an = parseFloat(f.an.value);
                if (isNaN(r) || isNaN(n) || isNaN(an)) return null;
                if (n < 1 || !Number.isInteger(n)) return { error: true, msg: 'n debe ser entero \u2265 1', label: 'Error' };
                if (r === 0) return { error: true, msg: 'r = 0, a\u2081 no se puede determinar', label: 'Error' };
                let a1 = an / Math.pow(r, n - 1);
                return { main: a1.toFixed(4), label: 'a\u2081', steps: ['a\u2081 = a\u2099 / r^(n\u20131)', 'a\u2081 = ' + an + ' / ' + r + '^(' + parseInt(n) + '\u20131) = ' + a1.toFixed(4)], extras: [], chart(c) { AlgebraVisual.progresionGeoCurva(c, a1, r, n); } };
            } else if (target === 'r') {
                let a1 = parseFloat(f.a1.value), n = parseFloat(f.n.value), an = parseFloat(f.an.value);
                if (isNaN(a1) || isNaN(n) || isNaN(an)) return null;
                if (n < 2) return { error: true, msg: 'n debe ser \u2265 2 para calcular r', label: 'Error' };
                if (a1 === 0) return { error: true, msg: 'a\u2081 = 0, r no se puede determinar', label: 'Error' };
                let r = Math.pow(an / a1, 1 / (n - 1));
                return { main: r.toFixed(4), label: 'r', steps: ['r = (a\u2099/a\u2081)^(1/(n\u20131))', 'r = (' + an + '/' + a1 + ')^(1/' + (parseInt(n)-1) + ') = ' + r.toFixed(4)], extras: [], chart(c) { AlgebraVisual.progresionGeoCurva(c, a1, r, n); } };
            } else {
                let a1 = parseFloat(f.a1.value), r = parseFloat(f.r.value), an = parseFloat(f.an.value);
                if (isNaN(a1) || isNaN(r) || isNaN(an)) return null;
                if (a1 === 0 || r === 0) return { error: true, msg: 'a\u2081 y r no pueden ser 0', label: 'Error' };
                if (an / a1 <= 0) return { error: true, msg: 'a\u2099/a\u2081 debe ser > 0', label: 'Error' };
                let n = Math.log(an / a1) / Math.log(r) + 1;
                if (n < 1 || Math.abs(n - Math.round(n)) > 0.001) return { error: true, msg: 'n debe ser entero \u2265 1. Verificar datos.', label: 'Error' };
                n = Math.round(n);
                return { main: n.toString(), label: 'n = ' + n, steps: ['n = log(a\u2099/a\u2081) / log(r) + 1', 'n = log(' + an + '/' + a1 + ') / log(' + r + ') + 1 = ' + n], extras: [], chart(c) { AlgebraVisual.progresionGeoCurva(c, a1, r, n); } };
            }
        }
    },
    factorial: {
        title: 'Factorial',
        formula: 'n! = n \u00b7 (n\u20131) \u00b7 ... \u00b7 1',
        fields: [{ id: 'n', label: 'n (entero \u2265 0)', val: '7' }],
        calc(f) {
            let n = parseInt(f.n.value);
            if (isNaN(n) || n < 0) return { error: true, msg: 'n debe ser entero \u2265 0', label: 'Error' };
            if (n > 170) return { error: true, msg: 'n demasiado grande (m\u00e1x 170)', label: 'Error' };
            let r = 1, steps = ['0! = 1 (por definici\u00f3n)'];
            for (let i = 2; i <= n; i++) { r *= i; steps.push(i + '! = ' + r); }
            return { main: r.toLocaleString('es-AR'), label: n + '!', extras: n > 50 ? [{ cls: 'warn', txt: 'Resultado aproximado (> 50)' }] : [], steps: n === 0 ? ['0! = 1'] : steps, chart(c) { AlgebraVisual.barrasFactorial(c, n); } };
        }
    },
    coeficiente_binomial: {
        title: 'Coeficiente Binomial',
        formula: 'C(n,k) = n! / (k! \u00b7 (n\u2013k)!)',
        fields: [
            { id: 'n', label: 'n (total)', val: '10' },
            { id: 'k', label: 'k (selecci\u00f3n)', val: '3' }
        ],
        calc(f) {
            let n = parseInt(f.n.value), k = parseInt(f.k.value);
            if (isNaN(n) || isNaN(k)) return null;
            if (n < 0 || k < 0) return { error: true, msg: 'n y k deben ser \u2265 0', label: 'Error' };
            if (k > n) return { error: true, msg: 'k no puede ser mayor que n', label: 'Error' };
            if (n > 170) return { error: true, msg: 'n demasiado grande', label: 'Error' };
            function fact(x) { let r = 1; for (let i = 2; i <= x; i++) r *= i; return r; }
            let c = fact(n) / (fact(k) * fact(n - k));
            return { main: Math.round(c).toLocaleString('es-AR'), label: 'C(' + n + ',' + k + ')', steps: ['C(' + n + ',' + k + ') = ' + n + '! / (' + k + '! \u00b7 (' + n + '\u2013' + k + ')!)'], extras: [] };
        }
    },
    permutaciones: {
        title: 'Permutaciones',
        formula: 'P(n,k) = n! / (n\u2013k)!',
        fields: [
            { id: 'n', label: 'n (total)', val: '10' },
            { id: 'k', label: 'k (selecci\u00f3n)', val: '3' }
        ],
        calc(f) {
            let n = parseInt(f.n.value), k = parseInt(f.k.value);
            if (isNaN(n) || isNaN(k)) return null;
            if (n < 0 || k < 0) return { error: true, msg: 'n y k deben ser \u2265 0', label: 'Error' };
            if (k > n) return { error: true, msg: 'k no puede ser mayor que n', label: 'Error' };
            if (n > 170) return { error: true, msg: 'n demasiado grande', label: 'Error' };
            function fact(x) { let r = 1; for (let i = 2; i <= x; i++) r *= i; return r; }
            let p = fact(n) / fact(n - k);
            return { main: Math.round(p).toLocaleString('es-AR'), label: 'P(' + n + ',' + k + ')', steps: ['P(' + n + ',' + k + ') = ' + n + '! / (' + n + '\u2013' + k + ')!'], extras: [] };
        }
    },
    logaritmo: {
        title: 'Logaritmo',
        formula: 'log\u2096(x) = y  \u2194  b^y = x',
        vars: [
            { id: 'y', label: 'Calcular y (log)' },
            { id: 'x', label: 'Calcular x (argumento)' },
            { id: 'b', label: 'Calcular b (base)' }
        ],
        fields: [
            { id: 'b', label: 'Base (b)', val: '10' },
            { id: 'x', label: 'Argumento (x)', val: '100' },
            { id: 'y', label: 'Logaritmo (y)', val: '' }
        ],
        onChange(target, f) {
            f.y.disabled = target === 'y';
            f.x.disabled = target === 'x';
            f.b.disabled = target === 'b';
            if (target === 'y') f.y.value = '';
            if (target === 'x') f.x.value = '';
            if (target === 'b') f.b.value = '';
        },
        calc(f, target) {
            if (target === 'y' || !target) {
                let b = parseFloat(f.b.value), x = parseFloat(f.x.value);
                if (isNaN(b) || isNaN(x)) return null;
                if (b <= 0 || b === 1) return { error: true, msg: 'Base debe ser > 0 y \u2260 1', label: 'Error' };
                if (x <= 0) return { error: true, msg: 'Argumento debe ser > 0', label: 'Error' };
                let y = Math.log(x) / Math.log(b);
                return { main: y.toFixed(6), label: 'log\u2096(x)', steps: ['y = ln(' + x + ') / ln(' + b + ')'], extras: [], chart(c) { AlgebraVisual.logCurva(c, b, x); } };
            } else if (target === 'x') {
                let b = parseFloat(f.b.value), y = parseFloat(f.y.value);
                if (isNaN(b) || isNaN(y)) return null;
                if (b <= 0 || b === 1) return { error: true, msg: 'Base debe ser > 0 y \u2260 1', label: 'Error' };
                let x = Math.pow(b, y);
                return { main: x.toFixed(6), label: 'Argumento (x)', steps: ['x = ' + b + '^' + y], extras: [], chart(c) { AlgebraVisual.logCurva(c, b, x); } };
            } else {
                let x = parseFloat(f.x.value), y = parseFloat(f.y.value);
                if (isNaN(x) || isNaN(y)) return null;
                if (x <= 0) return { error: true, msg: 'Argumento debe ser > 0', label: 'Error' };
                if (y === 0) return { error: true, msg: 'log(x) = 0 solo si x = 1', label: 'Error' };
                let b = Math.pow(x, 1 / y);
                return { main: b.toFixed(6), label: 'Base (b)', steps: ['b = ' + x + '^(1/' + y + ')'], extras: [], chart(c) { AlgebraVisual.logCurva(c, b, x); } };
            }
        }
    },
    mcd: {
        title: 'M\u00e1ximo Com\u00fan Divisor',
        formula: 'MCD(a,b) = ?',
        fields: [
            { id: 'a', label: 'N\u00famero a', val: '48' },
            { id: 'b', label: 'N\u00famero b', val: '36' }
        ],
        calc(f) {
            let a = parseInt(f.a.value), b = parseInt(f.b.value);
            if (isNaN(a) || isNaN(b)) return null;
            if (a === 0 || b === 0) return { error: true, msg: 'Los n\u00fameros deben ser distintos de 0', label: 'Error' };
            a = Math.abs(a); b = Math.abs(b);
            let steps = ['Algoritmo de Euclides:'], x = a, y = b, temp;
            while (y !== 0) {
                steps.push(x + ' = ' + y + ' \u00d7 ' + Math.floor(x / y) + ' + ' + (x % y));
                temp = y; y = x % y; x = temp;
            }
            return { main: x.toString(), label: 'MCD(' + a + ',' + b + ')', extras: [], steps: steps.length > 1 ? steps : ['MCD = ' + a] };
        }
    },
    mcm: {
        title: 'M\u00ednimo Com\u00fan M\u00faltiplo',
        formula: 'MCM(a,b) = a\u00b7b / MCD(a,b)',
        fields: [
            { id: 'a', label: 'N\u00famero a', val: '48' },
            { id: 'b', label: 'N\u00famero b', val: '36' }
        ],
        calc(f) {
            let a = parseInt(f.a.value), b = parseInt(f.b.value);
            if (isNaN(a) || isNaN(b)) return null;
            if (a === 0 || b === 0) return { error: true, msg: 'Los n\u00fameros deben ser distintos de 0', label: 'Error' };
            a = Math.abs(a); b = Math.abs(b);
            let x = a, y = b, origA = a, origB = b;
            while (y !== 0) { let t = y; y = x % y; x = t; }
            let mcd = x, mcm = (a / mcd) * b;
            return { main: mcm.toString(), label: 'MCM(' + origA + ',' + origB + ')', steps: ['MCD(' + origA + ',' + origB + ') = ' + mcd, 'MCM = (' + origA + ' \u00d7 ' + origB + ') / ' + mcd + ' = ' + mcm], extras: [] };
        }
    },
    ec2puntos: {
        title: 'Ecuaci\u00f3n de la Recta (2 Puntos)',
        formula: '(y\u2082\u2013y\u2081) = m(x\u2082\u2013x\u2081)',
        fields: [
            { id: 'x1', label: 'x\u2081', val: '1' },
            { id: 'y1', label: 'y\u2081', val: '2' },
            { id: 'x2', label: 'x\u2082', val: '4' },
            { id: 'y2', label: 'y\u2082', val: '8' }
        ],
        calc(f) {
            let x1=parseFloat(f.x1.value),y1=parseFloat(f.y1.value),x2=parseFloat(f.x2.value),y2=parseFloat(f.y2.value);
            if ([x1,y1,x2,y2].some(isNaN)) return null;
            if (x1 === x2) return { error: true, msg: 'Recta vertical: x = ' + x1, label: 'Pendiente indefinida' };
            let m = (y2 - y1) / (x2 - x1);
            let b = y1 - m * x1;
            let signo = b >= 0 ? '+' : '';
            return { main: 'y = ' + m.toFixed(3) + 'x ' + signo + b.toFixed(3), label: 'Ecuaci\u00f3n de la recta', steps: ['m = (' + y2 + '\u2013' + y1 + ') / (' + x2 + '\u2013' + x1 + ') = ' + m.toFixed(3), 'b = ' + y1 + ' \u2013 ' + m.toFixed(3) + '\u00b7' + x1 + ' = ' + b.toFixed(3)], extras: [{ cls: 'info', txt: 'Pendiente (m) = ' + m.toFixed(3) }, { cls: 'info', txt: 'Ordenada al origen (b) = ' + b.toFixed(3) }], chart(c) { AlgebraVisual.segmento(c, x1, y1, x2, y2); } };
        }
    },
    pendiente: {
        title: 'Pendiente entre 2 Puntos',
        formula: 'm = (y\u2082\u2013y\u2081) / (x\u2082\u2013x\u2081)',
        fields: [
            { id: 'x1', label: 'x\u2081', val: '1' },
            { id: 'y1', label: 'y\u2081', val: '2' },
            { id: 'x2', label: 'x\u2082', val: '4' },
            { id: 'y2', label: 'y\u2082', val: '8' }
        ],
        calc(f) {
            let x1=parseFloat(f.x1.value),y1=parseFloat(f.y1.value),x2=parseFloat(f.x2.value),y2=parseFloat(f.y2.value);
            if ([x1,y1,x2,y2].some(isNaN)) return null;
            if (x1 === x2) return { error: true, msg: 'Pendiente indefinida (recta vertical)', label: 'Error' };
            let m = (y2 - y1) / (x2 - x1);
            return { main: m.toFixed(3), label: 'Pendiente (m)', steps: ['m = (' + y2 + '\u2013' + y1 + ') / (' + x2 + '\u2013' + x1 + ')'], extras: [], chart(c) { AlgebraVisual.segmento(c, x1, y1, x2, y2); } };
        }
    },
    distancia: {
        title: 'Distancia entre 2 Puntos',
        formula: 'd = \u221a((x\u2082\u2013x\u2081)\u00b2 + (y\u2082\u2013y\u2081)\u00b2)',
        fields: [
            { id: 'x1', label: 'x\u2081', val: '1' },
            { id: 'y1', label: 'y\u2081', val: '2' },
            { id: 'x2', label: 'x\u2082', val: '4' },
            { id: 'y2', label: 'y\u2082', val: '8' }
        ],
        calc(f) {
            let x1=parseFloat(f.x1.value),y1=parseFloat(f.y1.value),x2=parseFloat(f.x2.value),y2=parseFloat(f.y2.value);
            if ([x1,y1,x2,y2].some(isNaN)) return null;
            let d = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            return { main: d.toFixed(3), label: 'Distancia (d)', steps: ['d = \u221a((' + x2 + '\u2013' + x1 + ')\u00b2 + (' + y2 + '\u2013' + y1 + ')\u00b2)'], extras: [], chart(c) { AlgebraVisual.segmento(c, x1, y1, x2, y2); } };
        }
    },
    punto_medio: {
        title: 'Punto Medio',
        formula: 'Pm = ((x\u2081+x\u2082)/2 , (y\u2081+y\u2082)/2)',
        fields: [
            { id: 'x1', label: 'x\u2081', val: '1' },
            { id: 'y1', label: 'y\u2081', val: '2' },
            { id: 'x2', label: 'x\u2082', val: '4' },
            { id: 'y2', label: 'y\u2082', val: '8' }
        ],
        calc(f) {
            let x1=parseFloat(f.x1.value),y1=parseFloat(f.y1.value),x2=parseFloat(f.x2.value),y2=parseFloat(f.y2.value);
            if ([x1,y1,x2,y2].some(isNaN)) return null;
            let xm = (x1 + x2) / 2, ym = (y1 + y2) / 2;
            return { main: '(' + xm.toFixed(3) + ' , ' + ym.toFixed(3) + ')', label: 'Punto medio', steps: ['x = (' + x1 + ' + ' + x2 + ') / 2 = ' + xm.toFixed(3), 'y = (' + y1 + ' + ' + y2 + ') / 2 = ' + ym.toFixed(3)], extras: [], chart(c) { AlgebraVisual.puntoMedio(c, x1, y1, x2, y2, xm, ym); } };
        }
    },
    binomio_cuadrado: {
        title: 'Binomio al Cuadrado',
        formula: '(a \u00b1 b)\u00b2 = a\u00b2 \u00b1 2ab + b\u00b2',
        fields: [
            { id: 'a', label: 'a', val: '5' },
            { id: 'b', label: 'b', val: '3' }
        ],
        calc(f) {
            let a = parseFloat(f.a.value), b = parseFloat(f.b.value);
            if (isNaN(a) || isNaN(b)) return null;
            let suma = (a + b) * (a + b), resta = (a - b) * (a - b);
            let a2 = a * a, b2 = b * b, ab2 = 2 * a * b;
            return { main: suma.toFixed(3) + '  /  ' + resta.toFixed(3), label: '(a+b)\u00b2 / (a\u2013b)\u00b2', steps: ['(a+b)\u00b2 = ' + a2 + ' + ' + ab2 + ' + ' + b2 + ' = ' + suma.toFixed(3), '(a\u2013b)\u00b2 = ' + a2 + ' \u2013 ' + ab2 + ' + ' + b2 + ' = ' + resta.toFixed(3)], extras: [], chart(c) { AlgebraVisual.binomioCuadrado(c, a, b); } };
        }
    },
    sumatoria_aritmetica: {
        title: 'Sumatoria Aritm\u00e9tica',
        formula: 'S\u2099 = n\u00b7(a\u2081 + a\u2099) / 2',
        fields: [
            { id: 'a1', label: 'Primer t\u00e9rmino (a\u2081)', val: '2' },
            { id: 'an', label: '\u00daltimo t\u00e9rmino (a\u2099)', val: '20' },
            { id: 'n', label: 'Cantidad (n)', val: '10' }
        ],
        calc(f) {
            let a1 = parseFloat(f.a1.value), an = parseFloat(f.an.value), n = parseFloat(f.n.value);
            if (isNaN(a1) || isNaN(an) || isNaN(n)) return null;
            if (n < 1) return { error: true, msg: 'n debe ser \u2265 1', label: 'Error' };
            let s = n * (a1 + an) / 2;
            return { main: s.toFixed(3), label: 'Suma (S\u2099)', steps: ['S\u2099 = ' + n + ' \u00b7 (' + a1 + ' + ' + an + ') / 2'], extras: [], chart(c) { AlgebraVisual.sumatoriaBarras(c, a1, an, n); } };
        }
    },
    valor_absoluto: {
        title: 'Valor Absoluto',
        formula: '|x| = x si x \u2265 0, \u2013x si x < 0',
        fields: [{ id: 'x', label: 'N\u00famero (x)', val: '-8' }],
        calc(f) {
            let x = parseFloat(f.x.value);
            if (isNaN(x)) return null;
            let abs = Math.abs(x);
            return { main: abs.toString(), label: '|' + x + '|', steps: [x < 0 ? '|' + x + '| = \u2013(' + x + ') = ' + abs : '|' + x + '| = ' + abs], extras: [], chart(c) { AlgebraVisual.valorAbsoluto(c, x); } };
        }
    },
    cubica: {
        title: 'Ecuaci\u00f3n C\u00fabica',
        formula: 'ax\u00b3 + bx\u00b2 + cx + d = 0',
        fields: [
            { id: 'a', label: 'Coeficiente a (x\u00b3)', val: '1' },
            { id: 'b', label: 'Coeficiente b (x\u00b2)', val: '-6' },
            { id: 'c', label: 'Coeficiente c (x)', val: '11' },
            { id: 'd', label: 'T\u00e9rmino independiente d', val: '-6' }
        ],
        calc(f) {
            let a = parseFloat(f.a.value), b = parseFloat(f.b.value), c = parseFloat(f.c.value), d = parseFloat(f.d.value);
            if (isNaN(a) || isNaN(b) || isNaN(c) || isNaN(d)) return null;
            if (a === 0) return { error: true, msg: 'El coeficiente a no puede ser 0', label: 'No es c\u00fabica' };
            // Normalize
            const A = b / a, B = c / a, C = d / a;
            const p = B - A*A/3;
            const q = C - A*B/3 + 2*A*A*A/27;
            const disc = q*q/4 + p*p*p/27;
            let roots = [], steps = [];
            steps.push('Ecuaci\u00f3n: ' + a + 'x\u00b3 + ' + b + 'x\u00b2 + ' + c + 'x + ' + d + ' = 0');
            steps.push('Forma normal: x\u00b3 + ' + A.toFixed(3) + 'x\u00b2 + ' + B.toFixed(3) + 'x + ' + C.toFixed(3) + ' = 0');
            steps.push('p = B - A\u00b2/3 = ' + p.toFixed(3));
            steps.push('q = C - AB/3 + 2A\u00b3/27 = ' + q.toFixed(3));
            steps.push('\u0394 = q\u00b2/4 + p\u00b3/27 = ' + disc.toFixed(3));
            if (disc > 0) {
                const u = Math.cbrt(-q/2 + Math.sqrt(disc));
                const v = Math.cbrt(-q/2 - Math.sqrt(disc));
                roots.push(u + v - A/3);
                steps.push('Una ra\u00edz real (discriminante > 0)');
            } else if (Math.abs(disc) < 1e-14) {
                const u = Math.cbrt(-q/2);
                roots.push(2*u - A/3);
                roots.push(-u - A/3);
                steps.push('Ra\u00edces reales (discriminante = 0)');
            } else {
                const r = Math.sqrt(-p*p*p/27);
                const phi = Math.acos(-q / (2*r));
                for (let k = 0; k < 3; k++) {
                    roots.push(2 * Math.cbrt(r) * Math.cos((phi + 2*k*Math.PI)/3) - A/3);
                }
                steps.push('Tres ra\u00edces reales (discriminante < 0)');
            }
            let sub = ['\u2081','\u2082','\u2083'];
            let main = roots.map((x, i) => 'x' + sub[i] + ' = ' + x.toFixed(3)).join(', ');
            steps.push('Ra\u00edces: ' + main);
            return { main, label: 'Soluci\u00f3n', steps, extras: [] };
        }
    },
    exponencial: {
        title: 'Ecuaci\u00f3n Exponencial',
        formula: 'a\u1d63 = b',
        fields: [
            { id: 'base', label: 'Base (a)', val: '2' },
            { id: 'val', label: 'Valor (b)', val: '8' }
        ],
        calc(f) {
            let base = parseFloat(f.base.value), val = parseFloat(f.val.value);
            if (isNaN(base) || isNaN(val)) return null;
            if (base <= 0 || base === 1) return { error: true, msg: 'La base debe ser > 0 y \u2260 1', label: 'Error' };
            if (val <= 0) return { error: true, msg: 'El valor debe ser > 0', label: 'Error' };
            let x = Math.log(val) / Math.log(base);
            let steps = [
                base + '\u1d63 = ' + val,
                'log(' + base + '\u1d63) = log(' + val + ')',
                'x \u00b7 log(' + base + ') = log(' + val + ')',
                'x = log(' + val + ') / log(' + base + ') = ' + x.toFixed(4)
            ];
            return { main: x.toFixed(4), label: 'x =', steps, extras: [] };
        }
    },
    logaritmica: {
        title: 'Ecuaci\u00f3n Logar\u00edtmica',
        formula: 'log\u2090(x) = b',
        fields: [
            { id: 'base', label: 'Base del log', val: '10' },
            { id: 'val', label: 'Valor (b)', val: '2' }
        ],
        calc(f) {
            let base = parseFloat(f.base.value), val = parseFloat(f.val.value);
            if (isNaN(base) || isNaN(val)) return null;
            if (base <= 0 || base === 1) return { error: true, msg: 'La base debe ser > 0 y \u2260 1', label: 'Error' };
            let x = Math.pow(base, val);
            function toSub(n) { return n.toString().split('').map(d => String.fromCharCode(0x2080 + parseInt(d))).join(''); }
            let steps = [
                'log' + toSub(base) + '(x) = ' + val,
                base + '\u207b\u1d63 = x',
                'x = ' + base + '\u00b3\u1d63 = ' + x.toFixed(4)
            ];
            return { main: x.toFixed(4), label: 'x =', steps, extras: [] };
        }
    },
    radical: {
        title: 'Ecuaci\u00f3n con Ra\u00edz',
        formula: '\u221ax = b',
        fields: [
            { id: 'val', label: 'Valor (b)', val: '3' }
        ],
        calc(f) {
            let val = parseFloat(f.val.value);
            if (isNaN(val)) return null;
            if (val < 0) return { error: true, msg: 'La ra\u00edz cuadrada no puede ser negativa', label: 'Error' };
            let x = val * val;
            let steps = [
                '\u221ax = ' + val,
                'x = ' + val + '\u00b2 = ' + x.toFixed(4)
            ];
            return { main: x.toFixed(4), label: 'x =', steps, extras: [] };
        }
    },
    sistema3x3: {
        title: 'Sistema 3\u00d73',
        formula: 'a\u2081x + b\u2081y + c\u2081z = d\u2081',
        fields: [
            { id: 'a1', label: 'a\u2081', val: '2' }, { id: 'b1', label: 'b\u2081', val: '1' },
            { id: 'c1', label: 'c\u2081', val: '-1' }, { id: 'd1', label: 'd\u2081', val: '5' },
            { id: 'a2', label: 'a\u2082', val: '1' }, { id: 'b2', label: 'b\u2082', val: '-1' },
            { id: 'c2', label: 'c\u2082', val: '2' }, { id: 'd2', label: 'd\u2082', val: '3' },
            { id: 'a3', label: 'a\u2083', val: '3' }, { id: 'b3', label: 'b\u2083', val: '2' },
            { id: 'c3', label: 'c\u2083', val: '1' }, { id: 'd3', label: 'd\u2083', val: '10' }
        ],
        calc(f) {
            let a1=parseFloat(f.a1.value),b1=parseFloat(f.b1.value),c1=parseFloat(f.c1.value),d1=parseFloat(f.d1.value);
            let a2=parseFloat(f.a2.value),b2=parseFloat(f.b2.value),c2=parseFloat(f.c2.value),d2=parseFloat(f.d2.value);
            let a3=parseFloat(f.a3.value),b3=parseFloat(f.b3.value),c3=parseFloat(f.c3.value),d3=parseFloat(f.d3.value);
            if ([a1,b1,c1,d1,a2,b2,c2,d2,a3,b3,c3,d3].some(isNaN)) return null;
            // Cramer's rule for 3x3
            const det = (m) => m[0]*(m[4]*m[8]-m[5]*m[7]) - m[1]*(m[3]*m[8]-m[5]*m[6]) + m[2]*(m[3]*m[7]-m[4]*m[6]);
            const D = det([a1,b1,c1,a2,b2,c2,a3,b3,c3]);
            if (Math.abs(D) < 1e-14) return { error: true, msg: 'El sistema no tiene soluci\u00f3n \u00fanica (det = 0)', label: 'Error' };
            const Dx = det([d1,b1,c1,d2,b2,c2,d3,b3,c3]);
            const Dy = det([a1,d1,c1,a2,d2,c2,a3,d3,c3]);
            const Dz = det([a1,b1,d1,a2,b2,d2,a3,b3,d3]);
            const x = Dx/D, y = Dy/D, z = Dz/D;
            let steps = [
                'Sistema 3\u00d73:',
                a1+'x + '+b1+'y + '+c1+'z = '+d1,
                a2+'x + '+b2+'y + '+c2+'z = '+d2,
                a3+'x + '+b3+'y + '+c3+'z = '+d3,
                'Determinante principal D = ' + D.toFixed(3),
                'Dx = ' + Dx.toFixed(3) + ', Dy = ' + Dy.toFixed(3) + ', Dz = ' + Dz.toFixed(3),
                'x = Dx/D = ' + x.toFixed(3),
                'y = Dy/D = ' + y.toFixed(3),
                'z = Dz/D = ' + z.toFixed(3)
            ];
            return { main: 'x='+x.toFixed(3)+', y='+y.toFixed(3)+', z='+z.toFixed(3), label: 'Soluci\u00f3n', steps, extras: [] };
        }
    }
};
