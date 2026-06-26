function safeMathEval(expr, vars) {
    expr = expr.replace(/²/g, '^2');
    if (vars) {
        let prepared = expr;
        if (vars.x !== undefined && expr.includes('x')) {
            prepared = prepared.replace(/(\d|\))x/g, '$1*x').replace(/x(\d)/g, 'x*$1');
            prepared = prepared.replace(/x/g, '(' + vars.x + ')');
        }
        if (vars.y !== undefined && expr.includes('y')) {
            prepared = prepared.replace(/(\d|\))y/g, '$1*y').replace(/y(\d)/g, 'y*$1');
            prepared = prepared.replace(/y/g, '(' + vars.y + ')');
        }
        prepared = prepared.replace(/\^/g, '**');
        if (prepared !== expr && !(angleMode === 'deg' && /(sin|cos|tan)\(/.test(expr))) {
            try {
                const result = eval(prepared);
                return result;
            } catch(e) {
            }
        }
    }
    
    const tokens = [];
    let i = 0;
    const len = expr.length;
    
    while (i < len) {
        const char = expr[i];
        
        if (/\s/.test(char)) { i++; continue; }
        
        if (/\d/.test(char) || (char === '.' && i + 1 < len && /\d/.test(expr[i+1]))) {
            let num = '';
            while (i < len && /[\d.]/.test(expr[i])) { num += expr[i]; i++; }
            if (i < len && (expr[i] === 'e' || expr[i] === 'E')) {
                const eIdx = i;
                num += expr[i]; i++;
                if (i < len && (expr[i] === '+' || expr[i] === '-')) { num += expr[i]; i++; }
                const digitStart = i;
                while (i < len && /\d/.test(expr[i])) { num += expr[i]; i++; }
                if (i === digitStart) {
                    i = eIdx;
                }
            }
            tokens.push({ type: 'number', value: parseFloat(num) });
            continue;
        }
        
        if ('+-*/()^'.includes(char)) {
            if (char === '-' && (tokens.length === 0 || 
                (tokens[tokens.length-1].type === 'operator' && tokens[tokens.length-1].value !== ')') ||
                (tokens[tokens.length-1].type === 'postfix'))) {
                let j = i + 1;
                while (j < len && /\s/.test(expr[j])) j++;
                if (j < len && /\d/.test(expr[j])) {
                    let num = '-';
                    i = j;
                    while (i < len && /[\d.]/.test(expr[i])) { num += expr[i]; i++; }
                    tokens.push({ type: 'number', value: parseFloat(num) });
                    continue;
                } else if (j < len && /[a-zA-Z\u03B1-\u03C9]/.test(expr[j])) {
                    tokens.push({ type: 'number', value: 0 });
                }
            }
            tokens.push({ type: 'operator', value: char });
            i++;
            continue;
        }
        
        if (char === '!') {
            tokens.push({ type: 'postfix', value: '!' });
            i++;
            continue;
        }
        
        if (/[a-zA-Z\u03B1-\u03C9]/.test(char)) {
            let name = '';
            while (i < len && /[a-zA-Z0-9\u03B1-\u03C9]/.test(expr[i])) { name += expr[i]; i++; }
            tokens.push({ type: 'ident', value: name });
            continue;
        }
        
        throw new Error('Caracter inválido: ' + char);
    }
    
    const output = [];
    const stack = [];
    const precedence = { '+': 1, '-': 1, '*': 2, '/': 2, '^': 3 };
    const rightAssoc = { '^': true };
    const funcs = ['sin', 'cos', 'tan', 'sqrt', 'log', 'ln', 'log2', 'cot', 'cbrt', 'abs', 'sec', 'csc'];
    const consts = { 'pi': Math.PI, 'e': Math.E };
    
    for (const token of tokens) {
        if (token.type === 'number') { output.push(token.value); continue; }
        if (token.type === 'ident') {
            const val = consts[token.value.toLowerCase()];
            if (val !== undefined) { output.push(val); continue; }
            if (vars && vars[token.value] !== undefined) { output.push(vars[token.value]); continue; }
            if (funcs.includes(token.value.toLowerCase())) { stack.push(token.value.toLowerCase()); continue; }
            throw new Error('Identificador inválido: ' + token.value);
        }
        if (token.type === 'postfix') {
            output.push('!');
            continue;
        }
        if (token.type === 'operator') {
            if (token.value === '(') {
                stack.push('(');
                continue;
            }
            if (token.value === ')') {
                while (stack.length > 0 && stack[stack.length - 1] !== '(') {
                    output.push(stack.pop());
                }
                if (stack.length === 0) throw new Error('Paréntesis desbalanceados');
                stack.pop();
                if (stack.length > 0 && funcs.includes(stack[stack.length - 1])) {
                    output.push(stack.pop());
                }
                continue;
            }
            while (stack.length > 0) {
                const top = stack[stack.length - 1];
                if (top === '(' || funcs.includes(top)) break;
                const topPrec = precedence[top] || 0;
                const currPrec = precedence[token.value];
                if (rightAssoc[token.value] ? currPrec < topPrec : currPrec <= topPrec) {
                    output.push(stack.pop());
                } else break;
            }
            stack.push(token.value);
            continue;
        }
    }
    
    while (stack.length > 0) {
        if (stack[stack.length - 1] === '(') throw new Error('Paréntesis desbalanceados');
        output.push(stack.pop());
    }
    
    const evalStack = [];
    for (const token of output) {
        if (typeof token === 'number') { evalStack.push(token); continue; }
        if (funcs.includes(token)) {
            if (evalStack.length < 1) throw new Error('Faltan argumentos');
            const a = evalStack.pop();
            let res;
            switch(token) {
                case 'sin': res = Math.sin(angleMode === 'deg' ? a * Math.PI / 180 : a); break;
                case 'cos': res = Math.cos(angleMode === 'deg' ? a * Math.PI / 180 : a); break;
                case 'tan': res = Math.tan(angleMode === 'deg' ? a * Math.PI / 180 : a); break;
                case 'sqrt': res = Math.sqrt(a); break;
                case 'log': res = Math.log10(a); break;
                case 'ln': res = Math.log(a); break;
                case 'log2': res = Math.log2(a); break;
                case 'cot': res = 1 / Math.tan(angleMode === 'deg' ? a * Math.PI / 180 : a); break;
                case 'sec': res = 1 / Math.cos(angleMode === 'deg' ? a * Math.PI / 180 : a); break;
                case 'csc': res = 1 / Math.sin(angleMode === 'deg' ? a * Math.PI / 180 : a); break;
                case 'cbrt': res = Math.cbrt(a); break;
                case 'abs': res = Math.abs(a); break;
            }
            evalStack.push(res);
            continue;
        }
        if (token === '!') {
            if (evalStack.length < 1) throw new Error('Faltan operandos');
            const a = evalStack.pop();
            if (a < 0 || a > 170 || !Number.isInteger(a)) throw new Error('Factorial requiere entero >= 0 y <= 170');
            let res = 1;
            for (let j = 2; j <= a; j++) res *= j;
            evalStack.push(res);
            continue;
        }
        if ('+-*/^'.includes(token)) {
            if (evalStack.length < 2) throw new Error('Faltan operandos');
            const b = evalStack.pop();
            const a = evalStack.pop();
            let res;
            switch(token) {
                case '+': res = a + b; break;
                case '-': res = a - b; break;
                case '*': res = a * b; break;
                case '/': if (b === 0) throw new Error('División por cero'); res = a / b; break;
                case '^': res = Math.pow(a, b); break;
            }
            evalStack.push(res);
        }
    }
    
    if (evalStack.length !== 1) throw new Error('Expresión inválida');
    return evalStack[0];
}
