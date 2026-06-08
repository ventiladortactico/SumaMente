FORMS.geom = {
    circulo: {
        title: 'Círculo',
        formula: 'Área = π·r² | Perímetro = 2·π·r',
        fields: [{ id: 'radio', label: 'Radio (r)', val: '10' }],
        calc(f) {
            let r = parseFloat(f.radio.value);
            if (isNaN(r)) return null;
            let area = Math.PI * r * r;
            let per = 2 * Math.PI * r;
            return { main: area.toFixed(3), label: 'Área del círculo', extras: [{ cls: 'info', txt: `Perímetro: ${per.toFixed(3)}` }], steps: [`A = π * ${r}²`] };
        }
    },
    triangulo: {
        title: 'Triángulo',
        formula: 'Área = (base × altura) / 2',
        fields: [{ id: 'base', label: 'Base (b)', val: '10' }, { id: 'altura', label: 'Altura (h)', val: '5' }],
        calc(f) {
            let b = parseFloat(f.base.value), h = parseFloat(f.altura.value);
            if (isNaN(b) || isNaN(h)) return null;
            let area = (b * h) / 2;
            return { main: area.toFixed(2), label: 'Área del triángulo', extras: [], steps: [`A = (${b} * ${h}) / 2`] };
        }
    },
    esfera: {
        title: 'Esfera',
        formula: 'Volumen = 4/3·π·r³',
        fields: [{ id: 'radio', label: 'Radio (r)', val: '5' }],
        calc(f) {
            let r = parseFloat(f.radio.value);
            if (isNaN(r)) return null;
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
            let vol = Math.PI * r * r * h;
            return { main: vol.toFixed(3), label: 'Volumen cilindro', extras: [], steps: [`V = π * ${r}² * ${h}`] };
        }
    }
};