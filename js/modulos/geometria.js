FORMS.geom = {
    circulo: {
        title: 'Círculo Interactivo',
        formula: 'Área = π·r² | r = √(Área/π)',
        vars: [{ id: 'area_in', label: 'Calcular Radio' }, { id: 'radio', label: 'Calcular Área' }],
        fields: [
            { id: 'radio', label: 'Radio (r)', val: '10' },
            { id: 'area_in', label: 'Área conocida (A)', val: '' }
        ],
        onChange(target, f) {
            f.radio.disabled = target === 'radio';
            f.area_in.disabled = target === 'area_in';
            if (target === 'radio') f.area_in.value = '';
            if (target === 'area_in') f.radio.value = '';
        },
        calc(f, target) {
            let main, label, steps = [], extras = [];
            if (target === 'radio') {
                let A = parseFloat(f.area_in.value);
                if (isNaN(A) || A < 0) return null;
                if (A === 0) return { main: "0", label: "Radio", extras: [{cls:'warn', txt:'El área es cero'}] };
                let r = Math.sqrt(A / Math.PI);
                main = r.toFixed(3); label = 'Radio del círculo';
                steps = [`r = √(${A} / π)`];
                extras = [{ cls: 'info', txt: `Perímetro base: ${(2 * Math.PI * r).toFixed(3)}` }];
            } else {
                let r = parseFloat(f.radio.value);
                if (isNaN(r)) return null;
                r = Math.abs(r);
                let area = Math.PI * r * r;
                let per = 2 * Math.PI * r;
                main = area.toFixed(3); label = 'Área del círculo';
                steps = [`A = π * ${r}²`];
                extras = [{ cls: 'info', txt: `Perímetro: ${per.toFixed(3)}` }];
            }
            return { 
                main, label, extras, steps,
                chart(canvas) {
                    if (target === 'radio') {
                        let A = parseFloat(f.area_in.value);
                        let r = Math.sqrt(A / Math.PI);
                        GeometriaVisual.circulo(canvas, r, A);
                    } else {
                        let r = Math.abs(parseFloat(f.radio.value));
                        let area = Math.PI * r * r;
                        GeometriaVisual.circulo(canvas, r, area);
                    }
                }
            };
        }
    },
    triangulo: {
        title: 'Triángulo',
        formula: 'Área = (base × altura) / 2',
        vars: [
            { id: 'area_out', label: 'Área' },
            { id: 'base_out', label: 'Base (b)' },
            { id: 'alt_out', label: 'Altura (h)' }
        ],
        fields: [{ id: 'base', label: 'Base (b)', val: '10' }, { id: 'altura', label: 'Altura (h)', val: '5' }],
        calc(f, target) {
            let b = parseFloat(f.base.value), h = parseFloat(f.altura.value);
            if (isNaN(b) || isNaN(h)) return null;
            if (b <= 0 || h <= 0) return { error: true, msg: "Base y altura deben ser mayores a 0", label: "Triángulo inexistente" };
            let area = (b * h) / 2;
            
            return { 
                main: area.toFixed(2), label: 'Área del triángulo', extras: [], steps: [`A = (${b} * ${h}) / 2`],
                chart(canvas) {
                    GeometriaVisual.triangulo(canvas, b, h, area);
                }
            };
        }
    },
    pitagoras: {
        title: 'Teorema de Pitágoras',
        formula: 'a² + b² = c²',
        vars: [
            { id: 'c', label: 'Hipotenusa (c)' },
            { id: 'a', label: 'Cateto Opuesto (a)' },
            { id: 'b', label: 'Cateto Adyacente (b)' }
        ],
        fields: [
            { id: 'c', label: 'Hipotenusa (c)', val: '' },
            { id: 'a', label: 'Cateto (a)', val: '3' },
            { id: 'b', label: 'Cateto (b)', val: '4' }
        ],
        onChange(target, f) {
            f.c.disabled = target === 'c';
            f.a.disabled = target === 'a';
            f.b.disabled = target === 'b';
            if (target === 'c') f.c.value = '';
            if (target === 'a') f.a.value = '';
            if (target === 'b') f.b.value = '';
        },
        calc(f, target) {
            let a_val, b_val, c_val, main, label, steps = [];
            if (target === 'c' || !target) {
                a_val = parseFloat(f.a.value); b_val = parseFloat(f.b.value);
                if (isNaN(a_val) || isNaN(b_val)) return null;
                c_val = Math.sqrt((a_val * a_val) + (b_val * b_val));
                main = c_val.toFixed(3); label = 'Hipotenusa (c)';
                steps = [`c = √(${a_val}² + ${b_val}²)`];
            } else if (target === 'a') {
                c_val = parseFloat(f.c.value); b_val = parseFloat(f.b.value);
                if (isNaN(c_val) || isNaN(b_val)) return null;
                if (c_val <= b_val) return { error: true, msg: "La hipotenusa debe ser mayor que el cateto", label: "Error geométrico" };
                a_val = Math.sqrt((c_val * c_val) - (b_val * b_val));
                main = a_val.toFixed(3); label = 'Cateto (a)';
                steps = [`a = √(${c_val}² - ${b_val}²)`];
            } else if (target === 'b') {
                c_val = parseFloat(f.c.value); a_val = parseFloat(f.a.value);
                if (isNaN(c_val) || isNaN(a_val)) return null;
                if (c_val <= a_val) return { error: true, msg: "La hipotenusa debe ser mayor que el cateto", label: "Error geométrico" };
                b_val = Math.sqrt((c_val * c_val) - (a_val * a_val));
                main = b_val.toFixed(3); label = 'Cateto (b)';
                steps = [`b = √(${c_val}² - ${a_val}²)`];
            }
            
            return { 
                main, label, extras: [], steps,
                chart(canvas) {
                    GeometriaVisual.pitagoras(canvas, a_val, b_val, c_val);
                }
            };
        }
    },
    esfera: {
        title: 'Esfera',
        formula: 'Volumen = 4/3·π·r³',
        fields: [{ id: 'radio', label: 'Radio (r)', val: '5' }],
        calc(f) {
            let r = parseFloat(f.radio.value);
            if (isNaN(r)) return null;
            if (r <= 0) return { error: true, msg: "El radio debe ser mayor a 0", label: "Esfera inexistente" };
            let vol = (4 / 3) * Math.PI * Math.pow(r, 3);
            let area = 4 * Math.PI * r * r;
            return { main: vol.toFixed(3), label: 'Volumen esfera', extras: [{ cls: 'info', txt: `Superficie: ${area.toFixed(3)}` }], steps: [`V = 4/3 * π * ${r}³`] };
        }
    },
    cilindro: {
        title: 'Cilindro',
        formula: 'Volumen = π·r²·h',
        fields: [{ id: 'radio', label: 'Radio (r)', val: '5' }, { id: 'altura', label: 'Altura (h)', val: '10' }],
        calc(f) {
            let r = parseFloat(f.radio.value), h = parseFloat(f.altura.value);
            if (isNaN(r) || isNaN(h)) return null;
            if (r <= 0 || h <= 0) return { error: true, msg: "Radio y altura deben ser mayores a 0", label: "Cilindro inexistente" };
            let vol = Math.PI * r * r * h;
            return { main: vol.toFixed(3), label: 'Volumen cilindro', extras: [], steps: [`V = π * ${r}² * ${h}`] };
        }
    },
    cono: {
        title: 'Cono',
        formula: 'V = 1/3·π·r²·h | AL = π·r·g',
        fields: [
            { id: 'radio', label: 'Radio (r)', val: '4' },
            { id: 'altura', label: 'Altura (h)', val: '6' }
        ],
        calc(f) {
            let r = parseFloat(f.radio.value);
            let h = parseFloat(f.altura.value);
            if (isNaN(r) || isNaN(h)) return null;
            if (r <= 0 || h <= 0) return { error: true, msg: "Radio y altura deben ser mayores a 0", label: "Cono inexistente" };
            let vol = (1 / 3) * Math.PI * r * r * h;
            let g = Math.sqrt(r * r + h * h);
            let al = Math.PI * r * g;
            return {
                main: vol.toFixed(3), label: 'Volumen del cono',
                extras: [
                    { cls: 'info', txt: `Generatriz (g): ${g.toFixed(3)}` },
                    { cls: 'info', txt: `Área lateral: ${al.toFixed(3)}` }
                ],
                steps: [`V = 1/3 * π * ${r}² * ${h}`],
                chart(canvas) {
                    GeometriaVisual.cono(canvas, r, h, g);
                }
            };
        }
    },
    cubo: {
        title: 'Cubo',
        formula: 'V = a³ | A = 6·a²',
        fields: [
            { id: 'lado', label: 'Lado (a)', val: '5' }
        ],
        calc(f) {
            let lado = parseFloat(f.lado.value);
            if (isNaN(lado)) return null;
            if (lado <= 0) return { error: true, msg: "El lado debe ser mayor a 0", label: "Cubo inexistente" };
            let vol = Math.pow(lado, 3);
            let sup = 6 * lado * lado;
            return {
                main: vol.toFixed(3), label: 'Volumen del cubo',
                extras: [{ cls: 'info', txt: `Superficie: ${sup.toFixed(3)}` }],
                steps: [`V = ${lado}³`],
                chart(canvas) {
                    GeometriaVisual.cubo(canvas, lado);
                }
            };
        }
    },
    elipse: {
        title: 'Elipse',
        formula: 'Área = π·a·b',
        fields: [
            { id: 'semieje_a', label: 'Semieje mayor (a)', val: '5' },
            { id: 'semieje_b', label: 'Semieje menor (b)', val: '3' }
        ],
        calc(f) {
            let a = parseFloat(f.semieje_a.value);
            let b = parseFloat(f.semieje_b.value);
            if (isNaN(a) || isNaN(b)) return null;
            if (a <= 0 || b <= 0) return { error: true, msg: "Los semiejes deben ser mayores a 0", label: "Elipse inexistente" };
            let area = Math.PI * a * b;
            return {
                main: area.toFixed(3), label: 'Área de la elipse',
                extras: [], steps: [`A = π * ${a} * ${b}`],
                chart(canvas) {
                    GeometriaVisual.elipse(canvas, a, b, area);
                }
            };
        }
    },
    trapecio: {
        title: 'Trapecio',
        formula: 'Área = (B + b)·h / 2',
        fields: [
            { id: 'base_mayor', label: 'Base mayor (B)', val: '8' },
            { id: 'base_menor', label: 'Base menor (b)', val: '4' },
            { id: 'altura', label: 'Altura (h)', val: '5' }
        ],
        calc(f) {
            let B = parseFloat(f.base_mayor.value);
            let b = parseFloat(f.base_menor.value);
            let h = parseFloat(f.altura.value);
            if (isNaN(B) || isNaN(b) || isNaN(h)) return null;
            if (B <= 0 || b <= 0 || h <= 0) return { error: true, msg: "Bases y altura deben ser mayores a 0", label: "Trapecio inexistente" };
            let area = ((B + b) * h) / 2;
            return {
                main: area.toFixed(3), label: 'Área del trapecio',
                extras: [], steps: [`A = (${B} + ${b}) * ${h} / 2`],
                chart(canvas) {
                    GeometriaVisual.trapecio(canvas, B, b, h, area);
                }
            };
        }
    }
};

if (!FORMS.geom) FORMS.geom = {};
Object.assign(FORMS.geom, {
    rectangulo: {
        title: 'Rectángulo',
        formula: 'Área = b · h | Perímetro = 2(b + h)',
        fields: [
            { id: 'base', label: 'Base (b)', val: '6' },
            { id: 'altura', label: 'Altura (h)', val: '4' }
        ],
        calc(f) {
            let b = parseFloat(f.base.value), h = parseFloat(f.altura.value);
            if (isNaN(b) || isNaN(h)) return null;
            if (b <= 0 || h <= 0) return { error: true, msg: "Base y altura deben ser mayores a 0", label: "Rectángulo inexistente" };
            let area = b * h;
            let per = 2 * (b + h);
            return {
                main: area.toFixed(3), label: 'Área del rectángulo',
                extras: [{ cls: 'info', txt: `Perímetro: ${per.toFixed(3)}` }],
                steps: [`A = ${b} × ${h}`],
                chart(canvas) {
                    GeometriaVisual.rectangulo(canvas, b, h, area, per);
                }
            };
        }
    },
    rombo: {
        title: 'Rombo',
        formula: 'Área = (D · d) / 2',
        fields: [
            { id: 'diagonal_mayor', label: 'Diagonal mayor (D)', val: '8' },
            { id: 'diagonal_menor', label: 'Diagonal menor (d)', val: '6' }
        ],
        calc(f) {
            let D = parseFloat(f.diagonal_mayor.value), d = parseFloat(f.diagonal_menor.value);
            if (isNaN(D) || isNaN(d)) return null;
            if (D <= 0 || d <= 0) return { error: true, msg: "Las diagonales deben ser mayores a 0", label: "Rombo inexistente" };
            let area = (D * d) / 2;
            return {
                main: area.toFixed(3), label: 'Área del rombo',
                extras: [], steps: [`A = (${D} × ${d}) / 2`],
                chart(canvas) {
                    GeometriaVisual.rombo(canvas, D, d, area);
                }
            };
        }
    },
    poligono_regular: {
        title: 'Polígono Regular',
        formula: 'Área = (n · L²) / (4 · tan(π/n))',
        fields: [
            { id: 'lados', label: 'Número de lados (n)', val: '6' },
            { id: 'longitud_lado', label: 'Longitud lado (L)', val: '5' }
        ],
        calc(f) {
            let n = parseFloat(f.lados.value), L = parseFloat(f.longitud_lado.value);
            if (isNaN(n) || isNaN(L)) return null;
            if (n < 3 || L <= 0) return { error: true, msg: "n ≥ 3 y L > 0", label: "Polígono inválido" };
            let area = (n * L * L) / (4 * Math.tan(Math.PI / n));
            return {
                main: area.toFixed(3), label: 'Área del polígono regular',
                extras: [], steps: [`A = (${n} × ${L}²) / (4 · tan(π/${n}))`],
                chart(canvas) {
                    GeometriaVisual.poligono_regular(canvas, n, L, area);
                }
            };
        }
    },
    prisma_rectangular: {
        title: 'Prisma Rectangular',
        formula: 'Volumen = L · W · H',
        fields: [
            { id: 'largo', label: 'Largo (L)', val: '5' },
            { id: 'ancho', label: 'Ancho (W)', val: '3' },
            { id: 'alto', label: 'Alto (H)', val: '4' }
        ],
        calc(f) {
            let L = parseFloat(f.largo.value), W = parseFloat(f.ancho.value), H = parseFloat(f.alto.value);
            if (isNaN(L) || isNaN(W) || isNaN(H)) return null;
            if (L <= 0 || W <= 0 || H <= 0) return { error: true, msg: "Dimensiones deben ser mayores a 0", label: "Prisma inválido" };
            let vol = L * W * H;
            let sup = 2 * (L * W + L * H + W * H);
            return {
                main: vol.toFixed(3), label: 'Volumen del prisma',
                extras: [{ cls: 'info', txt: `Superficie total: ${sup.toFixed(3)}` }],
                steps: [`V = ${L} × ${W} × ${H}`],
                chart(canvas) {
                    GeometriaVisual.prisma_rectangular(canvas, L, W, H, vol);
                }
            };
        }
    },
    piramide: {
        title: 'Pirámide',
        formula: 'Volumen = (1/3) · Ab · h',
        fields: [
            { id: 'area_base', label: 'Área de la base (Ab)', val: '25' },
            { id: 'altura', label: 'Altura (h)', val: '10' }
        ],
        calc(f) {
            let Ab = parseFloat(f.area_base.value), h = parseFloat(f.altura.value);
            if (isNaN(Ab) || isNaN(h)) return null;
            if (Ab <= 0 || h <= 0) return { error: true, msg: "Área base y altura deben ser mayores a 0", label: "Pirámide inválida" };
            let vol = (1 / 3) * Ab * h;
            return {
                main: vol.toFixed(3), label: 'Volumen de la pirámide',
                extras: [], steps: [`V = 1/3 × ${Ab} × ${h}`],
                chart(canvas) {
                    GeometriaVisual.piramide(canvas, Ab, h, vol);
                }
            };
        }
    },
    sector_circular: {
        title: 'Sector Circular',
        formula: 'Área = (π · r² · θ) / 360',
        fields: [
            { id: 'radio', label: 'Radio (r)', val: '5' },
            { id: 'angulo', label: 'Ángulo (θ °)', val: '60' }
        ],
        calc(f) {
            let r = parseFloat(f.radio.value), theta = parseFloat(f.angulo.value);
            if (isNaN(r) || isNaN(theta)) return null;
            if (r <= 0 || theta <= 0 || theta > 360) return { error: true, msg: "r > 0 y 0 < θ ≤ 360", label: "Sector inválido" };
            let area = (Math.PI * r * r * theta) / 360;
            let arco = (2 * Math.PI * r * theta) / 360;
            return {
                main: area.toFixed(3), label: 'Área del sector circular',
                extras: [{ cls: 'info', txt: `Longitud de arco: ${arco.toFixed(3)}` }],
                steps: [`A = (π × ${r}² × ${theta}°) / 360`],
                chart(canvas) {
                    GeometriaVisual.sector_circular(canvas, r, theta, area);
                }
            };
        }
    }
});

Object.assign(FORMS.geom, {
    hexagono: {
        title: 'Hexágono Regular',
        formula: 'Área = (3√3 · L²) / 2 | Perímetro = 6 · L',
        fields: [
            { id: 'lado', label: 'Lado (L)', val: '6' }
        ],
        calc(f) {
            let L = parseFloat(f.lado.value);
            if (isNaN(L)) return null;
            if (L <= 0) return { error: true, msg: "El lado debe ser mayor a 0", label: "Hexágono inexistente" };
            let area = (3 * Math.sqrt(3) * L * L) / 2;
            let per = 6 * L;
            return {
                main: area.toFixed(3), label: 'Área del hexágono regular',
                extras: [{ cls: 'info', txt: `Perímetro: ${per.toFixed(3)}` }],
                steps: [`A = (3√3 × ${L}²) / 2`],
                chart(canvas) { GeometriaVisual.hexagono(canvas, L, area); }
            };
        }
    },
    octogono: {
        title: 'Octógono Regular',
        formula: 'Área = 2 · (1+√2) · L² | Perímetro = 8 · L',
        fields: [
            { id: 'lado', label: 'Lado (L)', val: '5' }
        ],
        calc(f) {
            let L = parseFloat(f.lado.value);
            if (isNaN(L)) return null;
            if (L <= 0) return { error: true, msg: "El lado debe ser mayor a 0", label: "Octógono inexistente" };
            let area = 2 * (1 + Math.sqrt(2)) * L * L;
            let per = 8 * L;
            return {
                main: area.toFixed(3), label: 'Área del octógono regular',
                extras: [{ cls: 'info', txt: `Perímetro: ${per.toFixed(3)}` }],
                steps: [`A = 2 × (1+√2) × ${L}²`],
                chart(canvas) { GeometriaVisual.octogono(canvas, L, area); }
            };
        }
    },
    corona_circular: {
        title: 'Corona Circular',
        formula: 'Área = π · (R² − r²)',
        fields: [
            { id: 'radio_ext', label: 'Radio exterior (R)', val: '8' },
            { id: 'radio_int', label: 'Radio interior (r)', val: '5' }
        ],
        calc(f) {
            let R = parseFloat(f.radio_ext.value), r = parseFloat(f.radio_int.value);
            if (isNaN(R) || isNaN(r)) return null;
            if (R <= 0 || r <= 0 || r >= R) return { error: true, msg: "R > r > 0", label: "Corona inválida" };
            let area = Math.PI * (R * R - r * r);
            return {
                main: area.toFixed(3), label: 'Área de la corona circular',
                extras: [{ cls: 'info', txt: `R = ${R.toFixed(2)}, r = ${r.toFixed(2)}` }],
                steps: [`A = π × (${R}² − ${r}²)`],
                chart(canvas) { GeometriaVisual.corona_circular(canvas, R, r, area); }
            };
        }
    },
    segmento_circular: {
        title: 'Segmento Circular',
        formula: 'Área = (R²/2) · (θ − sen θ)',
        fields: [
            { id: 'radio', label: 'Radio (R)', val: '6' },
            { id: 'angulo', label: 'Ángulo θ (°)', val: '90' }
        ],
        calc(f) {
            let R = parseFloat(f.radio.value), theta = parseFloat(f.angulo.value);
            if (isNaN(R) || isNaN(theta)) return null;
            if (R <= 0 || theta <= 0 || theta > 360) return { error: true, msg: "R > 0 y 0 < θ ≤ 360", label: "Segmento inválido" };
            let rad = theta * Math.PI / 180;
            let area = (R * R / 2) * (rad - Math.sin(rad));
            return {
                main: area.toFixed(3), label: 'Área del segmento circular',
                extras: [], steps: [`A = (${R}²/2) × (${theta}° rad − sen ${theta}°)`],
                chart(canvas) { GeometriaVisual.segmento_circular(canvas, R, theta, area); }
            };
        }
    },
    tronco_cono: {
        title: 'Tronco de Cono',
        formula: 'Volumen = (π·h/3) · (R² + r² + R·r)',
        fields: [
            { id: 'radio_mayor', label: 'Radio mayor (R)', val: '6' },
            { id: 'radio_menor', label: 'Radio menor (r)', val: '3' },
            { id: 'altura', label: 'Altura (h)', val: '8' }
        ],
        calc(f) {
            let R = parseFloat(f.radio_mayor.value), r = parseFloat(f.radio_menor.value), h = parseFloat(f.altura.value);
            if (isNaN(R) || isNaN(r) || isNaN(h)) return null;
            if (R <= 0 || r <= 0 || h <= 0 || r >= R) return { error: true, msg: "R > r > 0 y h > 0", label: "Tronco inválido" };
            let vol = (Math.PI * h / 3) * (R * R + r * r + R * r);
            let g = Math.sqrt((R - r) * (R - r) + h * h);
            let al = Math.PI * (R + r) * g;
            return {
                main: vol.toFixed(3), label: 'Volumen del tronco de cono',
                extras: [
                    { cls: 'info', txt: `Generatriz (g): ${g.toFixed(3)}` },
                    { cls: 'info', txt: `Área lateral: ${al.toFixed(3)}` }
                ],
                steps: [`V = (π × ${h}/3) × (${R}² + ${r}² + ${R}×${r})`],
                chart(canvas) { GeometriaVisual.tronco_cono(canvas, R, r, h, g); }
            };
        }
    }
});
