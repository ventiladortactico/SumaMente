FORMS.prog = {
    bases: {
        title: 'Conversor de Bases Numéricas',
        formula: 'Convertir entre Dec, Bin, Oct, Hex',
        fields: [
            { id: 'val', label: 'Valor', type: 'text', val: '255' },
            { id: 'from', label: 'De base', type: 'select', opts: [{v:'10',l:'Decimal'},{v:'2',l:'Binario'},{v:'8',l:'Octal'},{v:'16',l:'Hexadecimal'}] },
            { id: 'to', label: 'A base', type: 'select', opts: [{v:'2',l:'Binario'},{v:'10',l:'Decimal'},{v:'8',l:'Octal'},{v:'16',l:'Hexadecimal'}] }
        ],
        calc(f) {
            let v = f.val.value.trim();
            let from = parseInt(f.from.value), to = parseInt(f.to.value);
            try {
                let dec = parseInt(v, from);
                if (isNaN(dec)) throw new Error();
                let res = dec.toString(to).toUpperCase();
                return {
                    main: res,
                    label: `Resultado en Base ${to}`,
                    extras: [{ cls: 'info', txt: `Decimal: ${dec}` }],
                    steps: [`Entrada (${v}) base ${from} → Dec: ${dec}`, `Dec → Base ${to}: ${res}`],
                    chart(canvas) {
                        ProgramacionVisual.bases(canvas, v, from, to, res);
                    }
                };
            } catch(e) { return { error: true, msg: "Valor no válido para la base de origen", label: "Error de Formato" }; }
        }
    },
    bitwise: {
        title: 'Operaciones de Bits (32-bit)',
        formula: 'AND, OR, XOR, NOT, SHIFT',
        fields: [
            { id: 'a', label: 'Valor A (Dec)', val: '10' },
            { id: 'b', label: 'Valor B (Dec)', val: '12' },
            { id: 'op', label: 'Operación', type: 'select', opts: [{v:'&',l:'AND'},{v:'|',l:'OR'},{v:'^',l:'XOR'},{v:'<<',l:'L-Shift'},{v:'>>',l:'R-Shift'}] }
        ],
        calc(f) {
            let a = parseInt(f.a.value), b = parseInt(f.b.value), op = f.op.value;
            if (isNaN(a) || isNaN(b)) return null;
            let res = 0;
            if (op === '&') res = a & b;
            else if (op === '|') res = a | b;
            else if (op === '^') res = a ^ b;
            else if (op === '<<') res = a << b;
            else if (op === '>>') res = a >> b;
            return {
                main: res.toString(),
                label: 'Resultado (Dec)',
                extras: [{ cls: 'info', txt: `Binario: ${res.toString(2).padStart(8, '0')}` }],
                steps: [`${a.toString(2)} ${op} ${b.toString(2)} = ${res.toString(2)}`],
                chart(canvas) {
                    ProgramacionVisual.bitwise(canvas, a, b, op, res);
                }
            };
        }
    },
    bigO: {
        title: 'Complejidad Algorítmica (Big O)',
        formula: 'Comparativa de crecimiento n operacional',
        fields: [{ id: 'n', label: 'Tamaño de la entrada (N)', val: '50' }],
        calc(f) {
            let n = parseInt(f.n.value);
            if (isNaN(n) || n <= 0) return { error: true, msg: "N debe ser un entero positivo", label: "Error" };

            let o_logN = Math.log2(n);
            let o_nLogN = n * Math.log2(n);
            let o_n2 = Math.pow(n, 2);

            return {
                main: `O(N) = ${n} ops`,
                label: `Crecimiento para N = ${n}`,
                extras: [
                    { cls: 'ok', txt: `Logarítmico O(log N): ${Math.ceil(o_logN)} operaciones` },
                    { cls: 'warn', txt: `Lineal-Log O(N log N): ${Math.ceil(o_nLogN)} operaciones` },
                    { cls: 'danger', txt: `Cuadrático O(N²): ${o_n2.toLocaleString()} operaciones` }
                ],
                steps: [`Log₂(${n}) ≈ ${o_logN.toFixed(2)}`, `${n} * Log₂(${n}) ≈ ${o_nLogN.toFixed(2)}`],
                chart(canvas) {
                    ProgramacionVisual.bigO(canvas, n);
                }
            };
        }
    },
    cpu: {
        title: 'Tiempo de CPU y Rendimiento',
        formula: 'Tiempo = Ciclos / Frecuencia(Hz)',
        fields: [
            { id: 'cyc', label: 'Ciclos de instrucción', val: '1000000' },
            { id: 'clk', label: 'Reloj / Freq (MHz)', val: '2500' }
        ],
        calc(f) {
            let cyc = parseFloat(f.cyc.value), clk = parseFloat(f.clk.value) * 1e6;
            if (cyc < 0 || clk <= 0) return null;
            let t = cyc / clk;
            let timeStr = t < 0.001 ? `${(t * 1e6).toFixed(2)} µs` : `${(t * 1000).toFixed(3)} ms`;
            return {
                main: timeStr,
                label: 'Tiempo de ejecución',
                extras: [{ cls: 'info', txt: `Instrucciones procesadas a ${f.clk.value} MHz` }],
                steps: [`T = ${cyc} / (${f.clk.value} * 10^6)`],
                chart(canvas) {
                    ProgramacionVisual.cpu(canvas, cyc, clk, timeStr);
                }
            };
        }
    },
    subnet: {
        title: 'Máscara y Hosts (IPv4)',
        formula: 'Hosts = 2^(32-CIDR) - 2',
        fields: [{ id: 'cidr', label: 'Prefijo CIDR (0-32)', val: '24' }],
        calc(f) {
            let c = parseInt(f.cidr.value);
            if (isNaN(c) || c < 0 || c > 32) return { error: true, msg: "CIDR debe estar entre 0 y 32", label: "Rango Inválido" };
            let hosts = c >= 31 ? 0 : Math.pow(2, 32 - c) - 2;
            let mask = [];
            for(let i=0; i<4; i++) {
                let bits = Math.max(0, Math.min(8, c - i*8));
                mask.push(bits === 0 ? 0 : 256 - Math.pow(2, 8-bits));
            }
            return {
                main: mask.join('.'),
                label: 'Máscara de Subred',
                extras: [{ cls: 'ok', txt: `Hosts útiles: ${hosts.toLocaleString()}` }],
                steps: [`Bits de host: ${32-c}`],
                chart(canvas) {
                    ProgramacionVisual.subnet(canvas, c, mask.join('.'), hosts);
                }
            };
        }
    },
    cocomo: {
        title: 'Estimación Software (COCOMO)',
        formula: 'Esfuerzo = a * (KLOC)^b  |  Tiempo = c * (Esfuerzo)^d',
        fields: [
            { id: 'kloc', label: 'Miles de líneas de código (KLOC)', val: '10' },
            { id: 'tipo', label: 'Modelo de proyecto', type: 'select', opts: [{v:'org',l:'Orgánico (Simple)'},{v:'semi',l:'Semi-Acoplado'},{v:'emb',l:'Embebido (Complejo)'}] }
        ],
        calc(f) {
            let kloc = parseFloat(f.kloc.value);
            let tipo = f.tipo.value;
            if (isNaN(kloc) || kloc <= 0) return { error: true, msg: "KLOC debe ser mayor a 0", label: "Error" };

            // Parámetros COCOMO Básico
            let a = 2.4, b = 1.05, c = 2.5, d = 0.38; // Orgánico por defecto
            if (tipo === 'semi') { a = 3.0; b = 1.12; c = 2.5; d = 0.35; }
            else if (tipo === 'emb') { a = 3.6; b = 1.20; c = 2.5; d = 0.32; }

            let esfuerzo = a * Math.pow(kloc, b);
            let tiempo = c * Math.pow(esfuerzo, d);
            let personal = esfuerzo / tiempo;

            return {
                main: `${esfuerzo.toFixed(1)} Meses-Persona`,
                label: 'Esfuerzo estimado de desarrollo',
                extras: [
                    { cls: 'info', txt: `Tiempo de entrega: ${tiempo.toFixed(1)} meses` },
                    { cls: 'ok', txt: `Equipo ideal recomendado: ${Math.ceil(personal)} programador(es)` }
                ],
                steps: [`Esfuerzo = ${a} * (${kloc})^${b}`, `Tiempo = ${c} * (Esfuerzo)^${d}`],
                chart(canvas) {
                    ProgramacionVisual.cocomo(canvas, esfuerzo, tiempo, personal);
                }
            };
        }
    },
    transfer: {
        title: 'Tiempo de Transferencia de Red',
        formula: 'Tiempo = Tamaño (con 10% overhead) / Velocidad',
        fields: [
            { id: 'size', label: 'Tamaño archivo (GB)', val: '1' },
            { id: 'speed', label: 'Velocidad de red (Mbps)', val: '100' }
        ],
        calc(f) {
            let s = parseFloat(f.size.value), v = parseFloat(f.speed.value);
            if (isNaN(s) || isNaN(v)) return null;
            if (v <= 0) return { error: true, msg: "La velocidad debe ser mayor a 0", label: "Error" };

            // Sumamos un 10% de overhead protocolar teórico (TCP/IP) para un cálculo más real
            let bits = s * 8 * 1024 * 1024 * 1024 * 1.10;
            let speedBits = v * 1000000;
            let sec = bits / speedBits;

            let timeStr = sec < 60 ? `${sec.toFixed(1)} s` : sec < 3600 ? `${(sec/60).toFixed(1)} min` : `${(sec/3600).toFixed(2)} h`;

            return {
                main: timeStr,
                label: 'Tiempo estimado real',
                extras: [{ cls: 'warn', txt: `Incluye +10% de control de flujo de paquetes IP` }],
                steps: [`Bits totales (Overhead inc.): ${(bits/1e9).toFixed(2)} Gb`],
                chart(canvas) {
                    ProgramacionVisual.transfer(canvas, s, v, timeStr);
                }
            };
        }
    }
};

if (!FORMS.prog) FORMS.prog = {};
Object.assign(FORMS.prog, {
    ascii: {
        title: 'Texto a Código ASCII',
        formula: 'Código ASCII (Decimal) de cada carácter',
        fields: [
            { id: 'texto', label: 'Texto', type: 'text', val: 'Hola', maxlength: 20 }
        ],
        calc(f) {
            let txt = f.texto.value;
            if (!txt) return { error: true, msg: "Ingrese un texto", label: "Error" };
            let codes = [];
            for (let i = 0; i < txt.length; i++) codes.push(txt.charCodeAt(i));
            let extras = codes.map((c, i) => ({ cls: 'info', txt: `'${txt[i]}' → ${c} (0x${c.toString(16).toUpperCase()})` }));
            return {
                main: codes.join(' '),
                label: 'Códigos ASCII (decimal)',
                extras: extras,
                steps: [`Texto: "${txt}"`, codes.map((c, i) => `'${txt[i]}' = ${c}`).join(' | ')],
                chart(canvas) {
                    ProgramacionVisual.ascii(canvas, txt, codes);
                }
            };
        }
    },
    factorial: {
        title: 'Factorial de un Número (n!)',
        formula: 'n! = n × (n-1) × (n-2) × ... × 1',
        fields: [
            { id: 'numero', label: 'n', val: '5' }
        ],
        calc(f) {
            let n = parseInt(f.numero.value);
            if (isNaN(n) || n < 0) return { error: true, msg: "n debe ser un entero ≥ 0", label: "Error" };
            if (n > 170) return { error: true, msg: "n > 170 produce Infinity", label: "Límite" };
            let r = 1;
            let steps = [];
            for (let i = 2; i <= n; i++) { r *= i; }
            let chain = Array.from({ length: n }, (_, i) => n - i).join('×');
            return {
                main: r.toLocaleString('fullwide', { useGrouping: true }),
                label: `${n}! = ${r.toLocaleString()}`,
                extras: [{ cls: 'info', txt: `${n}! = ${chain || '1'}` }],
                steps: [`${n}! = ${chain}`, `= ${r.toLocaleString()}`],
                chart(canvas) {
                    ProgramacionVisual.factorial(canvas, n, r);
                }
            };
        }
    },
    fibonacci: {
        title: 'Sucesión de Fibonacci',
        formula: 'F(n) = F(n-1) + F(n-2)  |  F(0)=0, F(1)=1',
        fields: [
            { id: 'termino', label: 'Término n', val: '10' }
        ],
        calc(f) {
            let n = parseInt(f.termino.value);
            if (isNaN(n) || n < 0) return { error: true, msg: "n debe ser un entero ≥ 0", label: "Error" };
            if (n > 78) return { error: true, msg: "n > 78 excede Number.MAX_SAFE_INTEGER", label: "Límite" };
            let a = 0, b = 1;
            for (let i = 2; i <= n; i++) { let t = a + b; a = b; b = t; }
            let result = n === 0 ? 0 : n === 1 ? 1 : b;
            let seq = [0, 1];
            for (let i = 2; i <= Math.min(n, 20); i++) seq.push(seq[i - 1] + seq[i - 2]);
            return {
                main: result.toLocaleString(),
                label: `F(${n})`,
                extras: [{ cls: 'info', txt: `Serie: ${seq.join(', ')}${n > 20 ? '...' : ''}` }],
                steps: [`F(${n}) = ${result.toLocaleString()}`],
                chart(canvas) {
                    ProgramacionVisual.fibonacci(canvas, n, result);
                }
            };
        }
    },
    mcd_mcm: {
        title: 'MCD y MCM',
        formula: 'MCD(a,b) = algoritmo de Euclides  |  MCM = a·b / MCD',
        fields: [
            { id: 'a', label: 'Valor A', val: '48' },
            { id: 'b', label: 'Valor B', val: '36' }
        ],
        calc(f) {
            let a = parseInt(f.a.value), b = parseInt(f.b.value);
            if (isNaN(a) || isNaN(b) || a <= 0 || b <= 0) return { error: true, msg: "Ambos deben ser enteros positivos", label: "Error" };
            let x = a, y = b;
            while (y) { let t = y; y = x % y; x = t; }
            let mcd = x;
            let mcm = (a / mcd) * b;
            return {
                main: `MCD: ${mcd} | MCM: ${mcm}`,
                label: 'Máximo Común Divisor y Mínimo Común Múltiplo',
                extras: [
                    { cls: 'ok', txt: `MCD(${a}, ${b}) = ${mcd}` },
                    { cls: 'info', txt: `MCM(${a}, ${b}) = ${mcm}` }
                ],
                steps: [`MCD = ${mcd} (Euclides)`, `MCM = ${a} × ${b} / ${mcd} = ${mcm}`],
                chart(canvas) {
                    ProgramacionVisual.mcd_mcm(canvas, a, b, mcd, mcm);
                }
            };
        }
    },
    primos: {
        title: 'Números Primos',
        formula: 'Un número es primo si solo es divisible por 1 y sí mismo',
        fields: [
            { id: 'numero', label: 'Número', val: '29' }
        ],
        calc(f) {
            let n = parseInt(f.numero.value);
            if (isNaN(n) || n < 2) return { error: true, msg: "Ingrese un entero ≥ 2", label: "Error" };
            let esPrimo = true;
            for (let i = 2; i * i <= n; i++) { if (n % i === 0) { esPrimo = false; break; } }
            let primosHasta = [];
            for (let i = 2; i <= n; i++) {
                let p = true;
                for (let j = 2; j * j <= i; j++) { if (i % j === 0) { p = false; break; } }
                if (p) primosHasta.push(i);
            }
            return {
                main: esPrimo ? `${n} es primo` : `${n} no es primo`,
                label: esPrimo ? 'Número primo ✓' : 'Número compuesto ✗',
                extras: [{ cls: esPrimo ? 'ok' : 'warn', txt: `Primos hasta ${n}: ${primosHasta.join(', ')}` }],
                steps: [`Divisores de ${n}: ${primosHasta.filter(p => n % p === 0).join(', ') || 'ninguno (es primo)'}`],
                chart(canvas) {
                    ProgramacionVisual.primos(canvas, n, esPrimo, primosHasta);
                }
            };
        }
    },
    hash_djb2: {
        title: 'Hash DJB2',
        formula: 'hash = hash×33 + code(c)  |  hash inicial = 5381',
        fields: [
            { id: 'texto', label: 'Texto', type: 'text', val: 'hello' }
        ],
        calc(f) {
            let txt = f.texto.value;
            if (!txt) return { error: true, msg: "Ingrese un texto", label: "Error" };
            let hash = 5381;
            for (let i = 0; i < txt.length; i++) hash = ((hash << 5) + hash) + txt.charCodeAt(i);
            hash = hash >>> 0;
            let hex = hash.toString(16).toUpperCase().padStart(8, '0');
            return {
                main: `${hash} (0x${hex})`,
                label: 'Hash DJB2 (32-bit unsigned)',
                extras: [{ cls: 'info', txt: `Hexadecimal: 0x${hex}` }],
                steps: [`Texto: "${txt}"`, `Hash: 0x${hex} (${hash})`],
                chart(canvas) {
                    ProgramacionVisual.hash_djb2(canvas, txt, hash, hex);
                }
            };
        }
    },
    cesar: {
        title: 'Cifrado César',
        formula: 'Cifrado: c = (p + k) mod 26  |  Descifrado: p = (c − k) mod 26',
        fields: [
            { id: 'texto', label: 'Texto', type: 'text', val: 'Hola Mundo', maxlength: 20 },
            { id: 'desplazamiento', label: 'Desplazamiento (k)', val: '3' }
        ],
        calc(f) {
            let txt = f.texto.value, k = parseInt(f.desplazamiento.value);
            if (!txt) return { error: true, msg: "Ingrese un texto", label: "Error" };
            if (isNaN(k)) return null;
            let res = '';
            let steps = [];
            for (let c of txt) {
                if (c >= 'a' && c <= 'z') {
                    let code = ((c.charCodeAt(0) - 97 + k) % 26 + 26) % 26 + 97;
                    let shifted = String.fromCharCode(code);
                    res += shifted;
                    steps.push(`'${c}' → '${shifted}' (${k} pos.)`);
                } else if (c >= 'A' && c <= 'Z') {
                    let code = ((c.charCodeAt(0) - 65 + k) % 26 + 26) % 26 + 65;
                    let shifted = String.fromCharCode(code);
                    res += shifted;
                    steps.push(`'${c}' → '${shifted}'`);
                } else {
                    res += c;
                }
            }
            return {
                main: res,
                label: `Cifrado César (k=${k})`,
                extras: [{ cls: 'info', txt: `Desplazamiento: ${k} posiciones` }],
                steps: steps.length <= 5 ? steps : [steps.slice(0, 5).join(' | '), `... (${steps.length} caracteres)`],
                chart(canvas) {
                    ProgramacionVisual.cesar(canvas, txt, k, res);
                }
            };
        }
    },
    distancia_hamming: {
        title: 'Distancia de Hamming',
        formula: 'Posiciones donde los caracteres difieren',
        fields: [
            { id: 's1', label: 'Cadena 1', type: 'text', val: '101010' },
            { id: 's2', label: 'Cadena 2', type: 'text', val: '111010' }
        ],
        calc(f) {
            let s1 = f.s1.value, s2 = f.s2.value;
            if (!s1 || !s2) return { error: true, msg: "Ingrese ambas cadenas", label: "Error" };
            if (s1.length !== s2.length) return { error: true, msg: "Las cadenas deben tener igual longitud", label: "Error" };
            let dist = 0;
            let diffs = [];
            for (let i = 0; i < s1.length; i++) {
                if (s1[i] !== s2[i]) { dist++; diffs.push(i); }
            }
            return {
                main: dist.toString(),
                label: `Distancia de Hamming (${s1.length} posiciones)`,
                extras: [{ cls: dist === 0 ? 'ok' : 'warn', txt: `Difieren en ${dist} posición(es): índice(s) ${diffs.join(', ') || 'ninguno'}` }],
                steps: [`"${s1}" vs "${s2}"`, `Distancia = ${dist}`],
                chart(canvas) {
                    ProgramacionVisual.distancia_hamming(canvas, s1, s2, dist, diffs);
                }
            };
        }
    }
});

Object.assign(FORMS.prog, {
    base64: {
        title: 'Base64 Encode / Decode',
        formula: 'Base64 transforma binario a texto ASCII de 64 caracteres',
        fields: [
            { id: 'b64_texto', label: 'Texto', type: 'text', val: 'Hola Mundo' },
            { id: 'b64_dir', label: 'Dirección', type: 'select', opts: [
                {v:'encode', l:'Encode (→ Base64)'},
                {v:'decode', l:'Decode (Base64 →)'}
            ]}
        ],
        calc(f) {
            let txt = f.b64_texto.value, dir = f.b64_dir.value;
            if (!txt) return { error: true, msg: "Ingrese un texto", label: "Error" };
            try {
                if (dir === 'encode') {
                    let encoded = btoa(unescape(encodeURIComponent(txt)));
                    return {
                        main: encoded,
                        label: 'Texto codificado en Base64',
                        extras: [{ cls: 'info', txt: `Longitud original: ${txt.length} caracteres` }],
                        steps: [`"${txt}" → Base64: ${encoded}`],
                        chart(canvas) { ProgramacionVisual.base64(canvas, txt, encoded, 'encode'); }
                    };
                } else {
                    let decoded = decodeURIComponent(escape(atob(txt)));
                    return {
                        main: decoded,
                        label: 'Texto decodificado desde Base64',
                        extras: [{ cls: 'warn', txt: 'Asegurate que la cadena Base64 sea válida' }],
                        steps: [`Base64 → "${decoded}"`],
                        chart(canvas) { ProgramacionVisual.base64(canvas, txt, decoded, 'decode'); }
                    };
                }
            } catch(e) {
                return { error: true, msg: "Error: " + (dir === 'encode' ? 'No se pudo codificar' : 'Base64 inválido'), label: "Error" };
            }
        }
    },
    sha256: {
        title: 'SHA-256 Hash',
        formula: 'SHA-256 produce hash de 256 bits (64 caracteres hex)',
        fields: [
            { id: 's256_texto', label: 'Texto', type: 'text', val: 'Hello World' }
        ],
        calc(f) {
            let txt = f.s256_texto.value;
            if (!txt) return { error: true, msg: "Ingrese un texto", label: "Error" };

            const K = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
            let msg = [];
            for (let i = 0; i < txt.length; i++) {
                let c = txt.charCodeAt(i);
                if (c < 0x80) msg.push(c);
                else if (c < 0x800) msg.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
                else msg.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
            }
            let bitLen = msg.length * 8;
            msg.push(0x80);
            while ((msg.length * 8) % 512 !== 448) msg.push(0);
            for (let i = 0; i < 8; i++) msg.push((bitLen >>> ((7 - i) * 8)) & 0xff);

            let H = new Uint32Array([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]);
            let W = new Uint32Array(64);
            let rr = (x, n) => (x >>> n) | (x << (32 - n));

            for (let block = 0; block < msg.length / 64; block++) {
                for (let t = 0; t < 16; t++) W[t] = (msg[block * 64 + t * 4] << 24) | (msg[block * 64 + t * 4 + 1] << 16) | (msg[block * 64 + t * 4 + 2] << 8) | msg[block * 64 + t * 4 + 3];
                for (let t = 16; t < 64; t++) {
                    let s0 = rr(W[t - 15], 7) ^ rr(W[t - 15], 18) ^ (W[t - 15] >>> 3);
                    let s1 = rr(W[t - 2], 17) ^ rr(W[t - 2], 19) ^ (W[t - 2] >>> 10);
                    W[t] = (W[t - 16] + s0 + W[t - 7] + s1) >>> 0;
                }
                let a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
                for (let t = 0; t < 64; t++) {
                    let S1 = rr(e, 6) ^ rr(e, 11) ^ rr(e, 25);
                    let ch = (e & f) ^ ((~e) & g);
                    let temp1 = (h + S1 + ch + K[t] + W[t]) >>> 0;
                    let S0 = rr(a, 2) ^ rr(a, 13) ^ rr(a, 22);
                    let maj = (a & b) ^ (a & c) ^ (b & c);
                    let temp2 = (S0 + maj) >>> 0;
                    h = g; g = f; f = e; e = (d + temp1) >>> 0;
                    d = c; c = b; b = a; a = (temp1 + temp2) >>> 0;
                }
                H[0] = (H[0] + a) >>> 0; H[1] = (H[1] + b) >>> 0; H[2] = (H[2] + c) >>> 0; H[3] = (H[3] + d) >>> 0;
                H[4] = (H[4] + e) >>> 0; H[5] = (H[5] + f) >>> 0; H[6] = (H[6] + g) >>> 0; H[7] = (H[7] + h) >>> 0;
            }
            let hash = '';
            for (let i = 0; i < 8; i++) hash += H[i].toString(16).padStart(8, '0');

            return {
                main: hash,
                label: 'SHA-256 Hash (64 caracteres hex)',
                extras: [{ cls: 'info', txt: `"${txt}" → ${hash.substring(0, 16)}…` }],
                steps: [`SHA-256("${txt}")`, `= ${hash}`],
                chart(canvas) { ProgramacionVisual.sha256(canvas, txt, hash); }
            };
        }
    },
    md5: {
        title: 'MD5 Hash',
        formula: 'MD5 produce hash de 128 bits (32 caracteres hex)',
        fields: [
            { id: 'md5_texto', label: 'Texto', type: 'text', val: 'Hello World' }
        ],
        calc(f) {
            let txt = f.md5_texto.value;
            if (!txt) return { error: true, msg: "Ingrese un texto", label: "Error" };

            const S = [7,12,17,22,7,12,17,22,7,12,17,22,7,12,17,22,5,9,14,20,5,9,14,20,5,9,14,20,5,9,14,20,4,11,16,23,4,11,16,23,4,11,16,23,4,11,16,23,6,10,15,21,6,10,15,21,6,10,15,21,6,10,15,21];
            const T = new Uint32Array(64);
            for (let i = 0; i < 64; i++) T[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000);

            let toBytes = str => {
                let bytes = []; 
                for (let i = 0; i < str.length; i++) { let c = str.charCodeAt(i); if (c < 0x80) bytes.push(c); else if (c < 0x800) bytes.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f)); else bytes.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f)); }
                return bytes;
            };
            let msg = toBytes(txt);
            let bitLen = msg.length * 8;
            msg.push(0x80);
            while ((msg.length * 8) % 512 !== 448) msg.push(0);
            for (let i = 0; i < 8; i++) msg.push((bitLen >>> (i * 8)) & 0xff);

            let h0 = 0x67452301, h1 = 0xefcdab89, h2 = 0x98badcfe, h3 = 0x10325476;
            for (let block = 0; block < msg.length / 64; block++) {
                let X = new Uint32Array(16);
                for (let i = 0; i < 16; i++) X[i] = msg[block * 64 + i * 4] | (msg[block * 64 + i * 4 + 1] << 8) | (msg[block * 64 + i * 4 + 2] << 16) | (msg[block * 64 + i * 4 + 3] << 24);
                let A = h0, B = h1, C = h2, D = h3;
                for (let i = 0; i < 64; i++) {
                    let F, g;
                    if (i < 16) { F = (B & C) | ((~B) & D); g = i; }
                    else if (i < 32) { F = (D & B) | ((~D) & C); g = (5 * i + 1) % 16; }
                    else if (i < 48) { F = B ^ C ^ D; g = (3 * i + 5) % 16; }
                    else { F = C ^ (B | (~D)); g = (7 * i) % 16; }
                    let dTemp = D;
                    D = C; C = B; B = (B + ((A + F + T[i] + X[g]) << S[i] | (A + F + T[i] + X[g]) >>> (32 - S[i]))) >>> 0; A = dTemp;
                }
                h0 = (h0 + A) >>> 0; h1 = (h1 + B) >>> 0; h2 = (h2 + C) >>> 0; h3 = (h3 + D) >>> 0;
            }

            let le = v => (v & 0xff).toString(16).padStart(2, '0') + ((v >>> 8) & 0xff).toString(16).padStart(2, '0') + ((v >>> 16) & 0xff).toString(16).padStart(2, '0') + ((v >>> 24) & 0xff).toString(16).padStart(2, '0');
            let hash = le(h0) + le(h1) + le(h2) + le(h3);

            return {
                main: hash,
                label: 'MD5 Hash (32 caracteres hex)',
                extras: [{ cls: 'info', txt: `"${txt}" → ${hash.substring(0, 16)}…` }],
                steps: [`MD5("${txt}")`, `= ${hash}`],
                chart(canvas) { ProgramacionVisual.md5(canvas, txt, hash); }
            };
        }
    },
    uuid: {
        title: 'UUID v4 Generator',
        formula: 'UUID v4: 32 dígitos hex en formato 8-4-4-4-12',
        fields: [
            { id: 'uuid_cant', label: 'Cantidad a generar', val: '1' }
        ],
        calc(f) {
            let n = parseInt(f.uuid_cant.value);
            if (isNaN(n) || n < 1) return { error: true, msg: "Cantidad debe ser ≥ 1", label: "Error" };

            let uuids = [];
            for (let j = 0; j < Math.min(n, 20); j++) {
                let u = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                    let r = Math.random() * 16 | 0;
                    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
                });
                uuids.push(u);
            }

            return {
                main: uuids[0],
                label: n > 1 ? `UUID v4 (mostrando 1 de ${n})` : 'UUID v4 generado',
                extras: [{ cls: 'ok', txt: n > 1 ? `Generados ${n} UUIDs` : 'UUID único listo para copiar' }],
                steps: ['UUID v4: 122 bits aleatorios + 6 bits de versión/variante'],
                chart(canvas) { ProgramacionVisual.uuid(canvas, uuids[0]); }
            };
        }
    },
    json_tool: {
        title: 'JSON Formatter / Validator',
        formula: 'Valida, formatea y embellece JSON',
        fields: [
            { id: 'json_input', label: 'JSON', type: 'text', val: '{"nombre":"Juan","edad":30,"activo":true,"datos":{"ciudad":"Buenos Aires","codigo":1001}}' }
        ],
        calc(f) {
            let input = f.json_input.value.trim();
            if (!input) return { error: true, msg: "Ingrese un JSON para validar/formatear", label: "Error" };
            try {
                let parsed = JSON.parse(input);
                let formatted = JSON.stringify(parsed, null, 4);
                let tipo = Array.isArray(parsed) ? 'Array' : typeof parsed === 'object' && parsed !== null ? 'Objeto' : typeof parsed;
                let keys = typeof parsed === 'object' && parsed !== null ? Object.keys(parsed).length : 0;
                return {
                    main: formatted.length > 120 ? formatted.substring(0, 120) + '…' : formatted,
                    label: 'JSON válido y formateado',
                    extras: [
                        { cls: 'ok', txt: `Tipo: ${tipo} | Claves raíz: ${keys} | Longitud: ${formatted.length} caracteres` },
                        { cls: 'info', txt: 'JSON válido ✓' }
                    ],
                    steps: ['JSON parseado correctamente', `${keys > 0 ? keys + ' propiedades raíz' : 'Valor simple'}`],
                    chart(canvas) { ProgramacionVisual.json_tool(canvas, formatted, tipo, keys); }
                };
            } catch(e) {
                return { error: true, msg: "JSON inválido: " + e.message, label: "Error de sintaxis" };
            }
        }
    }
});