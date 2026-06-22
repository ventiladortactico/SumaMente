FORMS.nutri = {
    macros: {
        title: 'Distribución de Macronutrientes',
        formula: 'P/C: 4 kcal/g | Grasas: 9 kcal/g',
        fields: [
            { id: 'kcal', label: 'Calorías totales (kcal)', val: '2000' },
            { id: 'p_pct', label: '% Proteínas', val: '30' },
            { id: 'c_pct', label: '% Carbohidratos', val: '40' },
            { id: 'f_pct', label: '% Grasas', val: '30' }
        ],
        calc(f) {
            let kcal = parseFloat(f.kcal.value), p = parseFloat(f.p_pct.value), c = parseFloat(f.c_pct.value), g = parseFloat(f.f_pct.value);
            if (isNaN(kcal) || isNaN(p) || isNaN(c) || isNaN(g)) return null;
            if (kcal <= 0) return { error: true, msg: "Las calorías deben ser mayores a 0", label: "Error" };
            if (Math.abs((p + c + g) - 100) > 0.1) return { error: true, msg: "La suma de porcentajes debe ser 100%", label: "Suma inválida" };

            let gp = (kcal * p / 100) / 4;
            let gc = (kcal * c / 100) / 4;
            let gg = (kcal * g / 100) / 9;

            return {
                main: `${kcal} kcal`,
                label: 'Distribución diaria',
                extras: [
                    { cls: 'info', txt: `Proteínas: ${gp.toFixed(1)}g (${(gp*4).toFixed(0)} kcal)` },
                    { cls: 'info', txt: `Carbohidratos: ${gc.toFixed(1)}g (${(gc*4).toFixed(0)} kcal)` },
                    { cls: 'info', txt: `Grasas: ${gg.toFixed(1)}g (${(gg*9).toFixed(0)} kcal)` }
                ],
                steps: [
                    `Prot = (${kcal} × ${p}%) / 4 = ${gp.toFixed(1)}g`,
                    `Carb = (${kcal} × ${c}%) / 4 = ${gc.toFixed(1)}g`,
                    `Gras = (${kcal} × ${g}%) / 9 = ${gg.toFixed(1)}g`
                ],
                chart(canvas) {
                    NutricionVisual.macros(canvas, gp, gc, gg);
                }
            };
        }
    },
    mifflin: {
        title: 'Tasa Metabólica Basal (Mifflin-St Jeor)',
        formula: 'Hombres: 10×W + 6.25×H - 5×A + 5 | Mujeres: 10×W + 6.25×H - 5×A - 161',
        fields: [
            { id: 'peso', label: 'Peso (kg)', val: '75' },
            { id: 'altura', label: 'Altura (cm)', val: '175' },
            { id: 'edad', label: 'Edad (años)', val: '30' },
            { id: 'sexo', label: 'Sexo biológico', type: 'select', opts: [{v:'5', l:'Masculino'}, {v:'-161', l:'Femenino'}] },
            { id: 'actividad', label: 'Nivel de actividad', type: 'select', opts: [
                {v:'1.2', l:'Sedentario (Poco/nada ejercicio)'},
                {v:'1.375', l:'Ligero (Ejercicio 1-3 días/sem)'},
                {v:'1.55', l:'Moderado (Ejercicio 3-5 días/sem)'},
                {v:'1.725', l:'Fuerte (Ejercicio 6-7 días/sem)'},
                {v:'1.9', l:'Atleta (Entrenamiento doble diario)'}
            ]}
        ],
        calc(f) {
            let w = parseFloat(f.peso.value), h = parseFloat(f.altura.value), a = parseFloat(f.edad.value);
            let s = parseFloat(f.sexo.value), act = parseFloat(f.actividad.value);

            if (isNaN(w) || isNaN(h) || isNaN(a)) return null;
            if (w <= 0 || h <= 0 || a <= 0) return { error: true, msg: "Los datos corporales deben ser mayores a 0", label: "Error" };

            let tmb = (10 * w) + (6.25 * h) - (5 * a) + s;
            let get = tmb * act;

            return {
                main: `${Math.round(get)} kcal`,
                label: 'Gasto Energético Total Diario (GET)',
                extras: [
                    { cls: 'ok', txt: `Metabolismo basal (TMB): ${Math.round(tmb)} kcal en reposo total.` },
                    { cls: 'info', txt: `Factor de actividad aplicado: x${act}` }
                ],
                steps: [
                    `TMB = (10 × ${w}) + (6.25 × ${h}) - (5 × ${a}) + (${s}) = ${Math.round(tmb)} kcal`,
                    `GET = ${Math.round(tmb)} kcal × ${act} = ${Math.round(get)} kcal`
                ],
                chart(canvas) {
                    NutricionVisual.mifflin(canvas, tmb, get);
                }
            };
        }
    },
    balance: {
        title: 'Balance Objetivo Energético',
        formula: 'Déficit Calórico (-15% a -20%)  |  Superávit (+10% a +15%)',
        fields: [
            { id: 'get', label: 'Gasto Total (GET - kcal)', val: '2500' },
            { id: 'meta', label: 'Meta u Objetivo', type: 'select', opts: [
                {v:'-0.20', l:'Pérdida de Grasa Agresiva (-20%)'},
                {v:'-0.15', l:'Pérdida de Grasa Moderada (-15%)'},
                {v:'0.0', l:'Mantenimiento de Peso (Normocalórica)'},
                {v:'0.10', l:'Volumen Limpio / Masa Muscular (+10%)'},
                {v:'0.15', l:'Volumen Avanzado (+15%)'}
            ]}
        ],
        calc(f) {
            let get = parseFloat(f.get.value), meta = parseFloat(f.meta.value);
            if (isNaN(get) || get <= 0) return null;

            let delta = get * meta;
            let target = get + delta;

            let tipo = meta < 0 ? 'Déficit Calórico' : meta > 0 ? 'Superávit Calórico' : 'Mantenimiento';
            let cls = meta < 0 ? 'warn' : meta > 0 ? 'ok' : 'info';

            return {
                main: `${Math.round(target)} kcal`,
                label: `Calorías Objetivo (${tipo})`,
                extras: [
                    { cls: cls, txt: `Variación: ${meta > 0 ? '+' : ''}${Math.round(delta)} kcal diarias.` },
                    { cls: 'info', txt: `Ideal para planificar pesaje de macros semanales.` }
                ],
                steps: [`Objetivo = ${get} kcal × (1 + (${meta})) = ${Math.round(target)} kcal`],
                chart(canvas) {
                    NutricionVisual.balance(canvas, get, target);
                }
            };
        }
    },
    imc: {
        title: 'Composición: IMC y Peso Ideal',
        formula: 'IMC = Peso / Altura² (m)  |  Devine Ideal = 50 [o 45.5] + 2.3 × (pulgadas > 5ft)',
        fields: [
            { id: 'peso', label: 'Peso Corporal (kg)', val: '72' },
            { id: 'altura', label: 'Altura (cm)', val: '172' },
            { id: 'sexo', label: 'Sexo biológico', type: 'select', opts: [{v:'M', l:'Masculino'}, {v:'F', l:'Femenino'}] }
        ],
        calc(f) {
            let w = parseFloat(f.peso.value), h = parseFloat(f.altura.value), sexo = f.sexo.value;
            if (isNaN(w) || isNaN(h) || h === 0) return null;

            let hM = h / 100;
            let imc = w / (hM * hM);

            // Fórmula Devine (Conversión a pulgadas sobre 5 pies)
            let hInches = h / 2.54;
            let inchesOver5ft = hInches - 60;
            let pesoIdeal = 0;
            if (inchesOver5ft > 0) {
                pesoIdeal = (sexo === 'M' ? 50 : 45.5) + (2.3 * inchesOver5ft);
            } else {
                pesoIdeal = sexo === 'M' ? 50 : 45.5; // Base de corte mínimo
            }

            let rango = 'Normal';
            let cls = 'ok';
            if (imc < 18.5) { rango = 'Bajo Peso'; cls = 'warn'; }
            else if (imc >= 30) { rango = 'Obesidad'; cls = 'danger'; }
            else if (imc >= 25) { rango = 'Sobrepeso'; cls = 'warn'; }

            return {
                main: `${imc.toFixed(1)} kg/m²`,
                label: `Clasificación: ${rango}`,
                extras: [{ cls: cls, txt: `Peso Ideal Estimado (Devine): ${pesoIdeal.toFixed(1)} kg` }],
                steps: [`IMC = ${w} kg / (${hM} m)² = ${imc.toFixed(1)}`],
                chart(canvas) {
                    NutricionVisual.imc(canvas, imc);
                }
            };
        }
    },
    carga_g: {
        title: 'Carga Glucémica (CG)',
        formula: 'CG = (IG × Carbohidratos netos) / 100',
        fields: [
            { id: 'ig', label: 'Índice Glucémico (0-100)', val: '55' },
            { id: 'carbs', label: 'Carbohidratos en la porción (g)', val: '20' }
        ],
        calc(f) {
            let ig = parseFloat(f.ig.value), c = parseFloat(f.carbs.value);
            if (isNaN(ig) || isNaN(c)) return null;
            if (ig < 0 || c < 0) return { error: true, msg: "Valores deben ser positivos", label: "Error" };
            let cg = (ig * c) / 100;
            let cat = cg < 10 ? 'Baja' : cg < 20 ? 'Media' : 'Alta';
            return {
                main: cg.toFixed(1),
                label: `Carga glucémica — ${cat}`,
                extras: [{ cls: cg < 10 ? 'ok' : cg < 20 ? 'warn' : 'danger', txt: `Respuesta insulínica estimada: ${cat}` }],
                steps: [`CG = (${ig} × ${c}g) / 100 = ${cg.toFixed(1)}`],
                chart(canvas) {
                    NutricionVisual.carga_g(canvas, cg);
                }
            };
        }
    }
};

if (!FORMS.nutri) FORMS.nutri = {};
Object.assign(FORMS.nutri, {
    calorias_alimento: {
        title: 'Calorías de un Alimento',
        formula: 'Calorías = P×4 + HC×4 + G×9',
        fields: [
            { id: 'proteinas', label: 'Proteínas (g)', val: '10' },
            { id: 'carbos', label: 'Carbohidratos (g)', val: '20' },
            { id: 'grasas', label: 'Grasas (g)', val: '5' }
        ],
        calc(f) {
            let p = parseFloat(f.proteinas.value), c = parseFloat(f.carbos.value), g = parseFloat(f.grasas.value);
            if (isNaN(p) || isNaN(c) || isNaN(g)) return null;
            if (p < 0 || c < 0 || g < 0) return { error: true, msg: "Los valores deben ser positivos", label: "Error" };
            let kcal = p*4 + c*4 + g*9;
            return {
                main: `${kcal.toFixed(1)} kcal`,
                label: 'Calorías totales del alimento',
                extras: [
                    { cls: 'info', txt: `Proteínas: ${(p*4).toFixed(0)} kcal (${p}g)` },
                    { cls: 'info', txt: `Carbohidratos: ${(c*4).toFixed(0)} kcal (${c}g)` },
                    { cls: 'info', txt: `Grasas: ${(g*9).toFixed(0)} kcal (${g}g)` }
                ],
                steps: [
                    `Calorías = ${p}×4 + ${c}×4 + ${g}×9`,
                    `Calorías = ${(p*4).toFixed(0)} + ${(c*4).toFixed(0)} + ${(g*9).toFixed(0)} = ${kcal.toFixed(1)} kcal`
                ],
                chart(canvas) {
                    NutricionVisual.calorias_alimento(canvas, p, c, g, kcal);
                }
            };
        }
    },
    agua_diaria: {
        title: 'Agua Diaria Recomendada',
        formula: 'Agua = Peso × 35 mL/kg',
        fields: [
            { id: 'peso', label: 'Peso (kg)', val: '70' }
        ],
        calc(f) {
            let w = parseFloat(f.peso.value);
            if (isNaN(w) || w <= 0) return null;
            let agua = w * 35;
            return {
                main: `${Math.round(agua)} mL`,
                label: 'Recomendación diaria de agua',
                extras: [
                    { cls: 'ok', txt: `Equivale a ${(agua/1000).toFixed(1)} litros` },
                    { cls: 'info', txt: 'Incluye agua de bebidas y alimentos' }
                ],
                steps: [`Agua = ${w} kg × 35 mL/kg = ${Math.round(agua)} mL`],
                chart(canvas) {
                    NutricionVisual.agua_diaria(canvas, w, agua);
                }
            };
        }
    },
    grasa_corporal: {
        title: 'Porcentaje de Grasa Corporal (Deurenberg)',
        formula: '%G = 1.20×IMC + 0.23×Edad - 10.8×Sexo - 5.4',
        fields: [
            { id: 'imc', label: 'Índice de Masa Corporal (IMC)', val: '24.5' },
            { id: 'edad', label: 'Edad (años)', val: '30' },
            { id: 'sexo', label: 'Sexo', type: 'select', opts: [{v:'1', l:'Masculino'}, {v:'0', l:'Femenino'}] }
        ],
        calc(f) {
            let imc = parseFloat(f.imc.value), edad = parseFloat(f.edad.value), sexo = parseFloat(f.sexo.value);
            if (isNaN(imc) || isNaN(edad)) return null;
            let grasa = 1.20 * imc + 0.23 * edad - 10.8 * sexo - 5.4;
            grasa = Math.max(3, Math.min(60, grasa));
            let cat = grasa < 20 ? 'Atleta' : grasa < 25 ? 'Saludable' : grasa < 30 ? 'Aceptable' : 'Elevado';
            let cls = grasa < 20 ? 'ok' : grasa < 25 ? 'info' : grasa < 30 ? 'warn' : 'danger';
            return {
                main: `${grasa.toFixed(1)}%`,
                label: `Grasa corporal — ${cat}`,
                extras: [{ cls, txt: `Clasificación: ${cat}` }],
                steps: [`%G = 1.20×${imc} + 0.23×${edad} - 10.8×${sexo} - 5.4`, `%G = ${grasa.toFixed(1)}%`],
                chart(canvas) {
                    NutricionVisual.grasa_corporal(canvas, grasa);
                }
            };
        }
    },
    cintura_cadera: {
        title: 'Índice Cintura-Cadera (ICC)',
        formula: 'ICC = Cintura / Cadera',
        fields: [
            { id: 'cintura', label: 'Cintura (cm)', val: '80' },
            { id: 'cadera', label: 'Cadera (cm)', val: '95' }
        ],
        calc(f) {
            let c = parseFloat(f.cintura.value), cad = parseFloat(f.cadera.value);
            if (isNaN(c) || isNaN(cad) || cad === 0) return null;
            let icc = c / cad;
            let riesgo = icc > 0.90 ? 'Riesgo alto' : icc > 0.85 ? 'Riesgo moderado' : 'Riesgo bajo';
            let cls = icc > 0.90 ? 'danger' : icc > 0.85 ? 'warn' : 'ok';
            return {
                main: icc.toFixed(2),
                label: `ICC — ${riesgo}`,
                extras: [{ cls, txt: `Clasificación: ${riesgo}` }],
                steps: [`ICC = ${c} cm / ${cad} cm = ${icc.toFixed(2)}`],
                chart(canvas) {
                    NutricionVisual.cintura_cadera(canvas, icc);
                }
            };
        }
    },
    cintura_altura: {
        title: 'Índice Cintura-Altura (ICT)',
        formula: 'ICT = Cintura / Altura',
        fields: [
            { id: 'cintura', label: 'Cintura (cm)', val: '80' },
            { id: 'altura', label: 'Altura (cm)', val: '170' }
        ],
        calc(f) {
            let c = parseFloat(f.cintura.value), h = parseFloat(f.altura.value);
            if (isNaN(c) || isNaN(h) || h === 0) return null;
            let ict = c / h;
            let riesgo = ict > 0.6 ? 'Riesgo muy alto' : ict > 0.5 ? 'Riesgo alto' : 'Normal';
            let cls = ict > 0.6 ? 'danger' : ict > 0.5 ? 'warn' : 'ok';
            return {
                main: ict.toFixed(2),
                label: `ICT — ${riesgo}`,
                extras: [{ cls, txt: `Clasificación: ${riesgo}` }],
                steps: [`ICT = ${c} cm / ${h} cm = ${ict.toFixed(2)}`],
                chart(canvas) {
                    NutricionVisual.cintura_altura(canvas, ict);
                }
            };
        }
    },
    proteina_peso: {
        title: 'Proteína Recomendada por Peso',
        formula: 'Proteína = Peso × Factor (g/kg)',
        fields: [
            { id: 'peso', label: 'Peso (kg)', val: '70' },
            { id: 'factor', label: 'Factor', type: 'select', opts: [
                {v:'0.8', l:'Sedentario (0.8 g/kg)'},
                {v:'1.2', l:'Actividad moderada (1.2 g/kg)'},
                {v:'1.6', l:'Deportista (1.6 g/kg)'},
                {v:'2.0', l:'Culturista (2.0 g/kg)'}
            ]}
        ],
        calc(f) {
            let w = parseFloat(f.peso.value), factor = parseFloat(f.factor.value);
            if (isNaN(w) || isNaN(factor) || w <= 0) return null;
            let prot = w * factor;
            return {
                main: `${prot.toFixed(1)} g/día`,
                label: 'Proteína recomendada',
                extras: [
                    { cls: 'info', txt: `Factor aplicado: ${factor} g/kg/día` },
                    { cls: 'ok', txt: `Calorías de proteína: ${(prot*4).toFixed(0)} kcal/día` }
                ],
                steps: [`Proteína = ${w} kg × ${factor} g/kg = ${prot.toFixed(1)} g/día`],
                chart(canvas) {
                    NutricionVisual.proteina_peso(canvas, w, factor, prot);
                }
            };
        }
    },
    peso_ideal_nutri: {
        title: 'Peso Ideal Simple',
        formula: 'Hombres: 50+0.9×(h-150) | Mujeres: 45+0.9×(h-150)',
        fields: [
            { id: 'altura', label: 'Altura (cm)', val: '170' },
            { id: 'sexo', label: 'Sexo', type: 'select', opts: [{v:'M', l:'Masculino'}, {v:'F', l:'Femenino'}] }
        ],
        calc(f) {
            let h = parseFloat(f.altura.value), sexo = f.sexo.value;
            if (isNaN(h) || h <= 0) return null;
            let base = sexo === 'M' ? 50 : 45;
            let peso = base + 0.9 * (h - 150);
            let rangoMin = peso * 0.9, rangoMax = peso * 1.1;
            return {
                main: `${peso.toFixed(1)} kg`,
                label: 'Peso Ideal Estimado',
                extras: [
                    { cls: 'info', txt: `Rango saludable: ${rangoMin.toFixed(1)} - ${rangoMax.toFixed(1)} kg` },
                    { cls: 'ok', txt: `Fórmula: ${sexo === 'M' ? 'Masculino' : 'Femenino'}` }
                ],
                steps: [`PI = ${base} + 0.9 × (${h} - 150)`, `PI = ${peso.toFixed(1)} kg`],
                chart(canvas) {
                    NutricionVisual.peso_ideal_nutri(canvas, peso, sexo);
                }
            };
        }
    },
    deficit_calorico: {
        title: 'Déficit / Superávit Calórico',
        formula: 'Balance = GET − Ingesta',
        fields: [
            { id: 'get', label: 'Gasto Total (GET - kcal)', val: '2500' },
            { id: 'ingesta', label: 'Ingesta calórica (kcal)', val: '2000' }
        ],
        calc(f) {
            let get = parseFloat(f.get.value), ing = parseFloat(f.ingesta.value);
            if (isNaN(get) || isNaN(ing) || get <= 0) return null;
            let balance = get - ing;
            let pct = Math.abs(balance / get) * 100;
            let tipo = balance > 0 ? 'Déficit calórico' : balance < 0 ? 'Superávit calórico' : 'Mantenimiento';
            let cls = balance > 0 ? 'ok' : balance < 0 ? 'warn' : 'info';
            return {
                main: `${Math.round(balance)} kcal`,
                label: tipo,
                extras: [
                    { cls, txt: `${pct.toFixed(1)}% del GET (${Math.round(get)} kcal)` },
                    { cls: 'info', txt: balance > 0 ? 'Promueve pérdida de peso (~' + Math.round(balance/77) + 'g grasa/sem)' : balance < 0 ? 'Promueve aumento de peso' : 'Peso estable' }
                ],
                steps: [`Balance = ${get} - ${ing} = ${Math.round(balance)} kcal/día`],
                chart(canvas) {
                    NutricionVisual.deficit_calorico(canvas, get, ing, balance);
                }
            };
        }
    },
    frecuencia_cardiaca: {
        title: 'Frecuencia Cardíaca y Zonas de Entrenamiento',
        formula: 'FCM = 220 − Edad',
        fields: [
            { id: 'edad', label: 'Edad (años)', val: '30' }
        ],
        calc(f) {
            let edad = parseFloat(f.edad.value);
            if (isNaN(edad) || edad <= 0) return null;
            let fcm = 220 - edad;
            let zonas = [
                { name: 'Recuperación', min: 50, max: 60 },
                { name: 'Quema de grasa', min: 60, max: 70 },
                { name: 'Cardio', min: 70, max: 80 },
                { name: 'Anaerobic', min: 80, max: 90 },
                { name: 'Máximo', min: 90, max: 100 }
            ];
            let extras = zonas.map(z => {
                let lo = Math.round(fcm * z.min / 100);
                let hi = Math.round(fcm * z.max / 100);
                return { cls: 'info', txt: `${z.name}: ${lo}-${hi} lpm` };
            });
            return {
                main: `${fcm} lpm`,
                label: 'Frecuencia Cardíaca Máxima',
                extras: extras,
                steps: [`FCM = 220 - ${edad} = ${fcm} lpm`],
                chart(canvas) {
                    NutricionVisual.frecuencia_cardiaca(canvas, fcm, edad);
                }
            };
        }
    },
    met_actividad: {
        title: 'Gasto Energético por Actividad (MET)',
        formula: 'Gasto (kcal) = MET × Peso × Horas',
        fields: [
            { id: 'met', label: 'MET de la actividad', type: 'select', opts: [
                {v:'1.0', l:'Reposo (1.0 MET)'},
                {v:'3.0', l:'Caminar 5 km/h (3.0 MET)'},
                {v:'5.0', l:'Bicicleta moderada (5.0 MET)'},
                {v:'8.0', l:'Correr 8 km/h (8.0 MET)'},
                {v:'12.0', l:'Natación intensa (12.0 MET)'}
            ]},
            { id: 'peso', label: 'Peso (kg)', val: '70' },
            { id: 'horas', label: 'Duración (horas)', val: '1' }
        ],
        calc(f) {
            let met = parseFloat(f.met.value), w = parseFloat(f.peso.value), hrs = parseFloat(f.horas.value);
            if (isNaN(met) || isNaN(w) || isNaN(hrs) || w <= 0 || hrs < 0) return null;
            let gasto = met * w * hrs;
            return {
                main: `${gasto.toFixed(1)} kcal`,
                label: 'Gasto energético de la actividad',
                extras: [
                    { cls: 'info', txt: `MET = ${met} | Peso = ${w} kg | Tiempo = ${hrs} h` },
                    { cls: 'ok', txt: `Equivale a ~${(gasto/9).toFixed(1)}g de grasa` }
                ],
                steps: [`Gasto = ${met} × ${w} kg × ${hrs} h = ${gasto.toFixed(1)} kcal`],
                chart(canvas) {
                    NutricionVisual.met_actividad(canvas, met, w, hrs, gasto);
                }
            };
        }
    }
});

Object.assign(FORMS.nutri, {
    imc_infantil: {
        title: 'IMC Infantil (Percentiles)',
        formula: 'IMC = Peso / Talla² | Percentil según tablas OMS',
        fields: [
            { id: 'ni_peso', label: 'Peso (kg)', val: '25' },
            { id: 'ni_talla', label: 'Talla (cm)', val: '120' },
            { id: 'ni_edad', label: 'Edad (años)', val: '8' },
            { id: 'ni_sexo', label: 'Sexo', type: 'select', opts: [{v:'M', l:'Masculino'}, {v:'F', l:'Femenino'}] }
        ],
        calc(f) {
            let w = parseFloat(f.ni_peso.value), h = parseFloat(f.ni_talla.value) / 100, edad = parseFloat(f.ni_edad.value);
            if (isNaN(w) || isNaN(h) || isNaN(edad) || h <= 0) return null;
            let imc = w / (h * h);
            let pct = Math.min(97, Math.max(3, 50 + (imc - 17) * 8 - edad * 0.5));
            let cat = pct < 5 ? 'Bajo peso' : pct < 85 ? 'Normal' : pct < 95 ? 'Sobrepeso' : 'Obesidad';
            let cls = pct < 5 ? 'warn' : pct < 85 ? 'ok' : pct < 95 ? 'warn' : 'danger';
            return {
                main: `${imc.toFixed(1)} kg/m²`,
                label: `Percentil estimado: ${Math.round(pct)}% — ${cat}`,
                extras: [{ cls, txt: `Clasificación: ${cat} (P${Math.round(pct)})` }],
                steps: [`IMC = ${w} / (${(h*100).toFixed(0)}cm)² = ${imc.toFixed(1)}`, `Percentil ~${Math.round(pct)}% para ${Math.round(edad)} años ${f.ni_sexo.value === 'M' ? 'varón' : 'mujer'}`],
                chart(canvas) { NutricionVisual.imc_infantil(canvas, imc, pct, cat); }
            };
        }
    },
    tdee: {
        title: 'Gasto Energético Total (TDEE)',
        formula: 'TDEE = TMB × Factor_actividad',
        fields: [
            { id: 'td_peso', label: 'Peso (kg)', val: '75' },
            { id: 'td_altura', label: 'Altura (cm)', val: '175' },
            { id: 'td_edad', label: 'Edad (años)', val: '30' },
            { id: 'td_sexo', label: 'Sexo', type: 'select', opts: [{v:'5', l:'Masculino'}, {v:'-161', l:'Femenino'}] },
            { id: 'td_act', label: 'Actividad', type: 'select', opts: [
                {v:'1.2', l:'Sedentario'},
                {v:'1.375', l:'Ligero'},
                {v:'1.55', l:'Moderado'},
                {v:'1.725', l:'Activo'},
                {v:'1.9', l:'Muy activo'}
            ]}
        ],
        calc(f) {
            let w = parseFloat(f.td_peso.value), h = parseFloat(f.td_altura.value), a = parseFloat(f.td_edad.value), s = parseFloat(f.td_sexo.value), act = parseFloat(f.td_act.value);
            if (isNaN(w) || isNaN(h) || isNaN(a) || w <= 0 || h <= 0) return { error: true, msg: "Datos corporales deben ser > 0", label: "Error" };
            let tmb = 10 * w + 6.25 * h - 5 * a + s;
            let tdee = tmb * act;
            return {
                main: `${Math.round(tdee)} kcal/día`,
                label: 'Gasto Energético Total (TDEE)',
                extras: [
                    { cls: 'info', txt: `TMB: ${Math.round(tmb)} kcal/día` },
                    { cls: 'ok', txt: `Factor actividad: ×${act}` }
                ],
                steps: [`TMB = 10×${w} + 6.25×${h} − 5×${a} + ${s} = ${Math.round(tmb)}`, `TDEE = ${Math.round(tmb)} × ${act} = ${Math.round(tdee)} kcal/día`],
                chart(canvas) { NutricionVisual.tdee(canvas, tmb, tdee, act); }
            };
        }
    },
    ffmi: {
        title: 'FFMI (Fat Free Mass Index)',
        formula: 'FFMI = Masa_magra_kg / Altura_m² + 6.1 × (1.8 − Altura_m)',
        fields: [
            { id: 'ff_peso', label: 'Peso total (kg)', val: '75' },
            { id: 'ff_grasa', label: '% Grasa corporal', val: '15' },
            { id: 'ff_altura', label: 'Altura (cm)', val: '175' }
        ],
        calc(f) {
            let w = parseFloat(f.ff_peso.value), pct = parseFloat(f.ff_grasa.value), h = parseFloat(f.ff_altura.value) / 100;
            if (isNaN(w) || isNaN(pct) || isNaN(h) || w <= 0 || h <= 0) return null;
            if (pct < 2 || pct > 60) return { error: true, msg: "% Grasa debe estar entre 2 y 60", label: "Error" };
            let ffm = w * (1 - pct / 100);
            let ffmi = ffm / (h * h) + 6.1 * (1.8 - h);
            let cat = ffmi < 16.5 ? 'Bajo' : ffmi < 18 ? 'Promedio' : ffmi < 20 ? 'Musculoso' : ffmi < 22 ? 'Muy musculoso' : 'Élite (posible doping)';
            let cls = ffmi < 16.5 ? 'warn' : ffmi < 20 ? 'info' : ffmi < 22 ? 'ok' : 'danger';
            return {
                main: ffmi.toFixed(2),
                label: `FFMI — ${cat}`,
                extras: [
                    { cls, txt: `Masa magra: ${ffm.toFixed(1)} kg` },
                    { cls: 'info', txt: `Clasificación: ${cat}` }
                ],
                steps: [`Masa magra = ${w} × (1 − ${pct}/100) = ${ffm.toFixed(1)} kg`, `FFMI = ${ffm.toFixed(1)} / ${(h*100).toFixed(0)}² + 6.1×(1.8−${h.toFixed(2)}) = ${ffmi.toFixed(2)}`],
                chart(canvas) { NutricionVisual.ffmi(canvas, ffmi, cat); }
            };
        }
    },
    bai: {
        title: 'Índice de Adiposidad Corporal (BAI)',
        formula: 'BAI = (Cadera_cm / (Altura_m)^1.5) − 18',
        fields: [
            { id: 'ba_cadera', label: 'Cadera (cm)', val: '95' },
            { id: 'ba_altura', label: 'Altura (cm)', val: '170' }
        ],
        calc(f) {
            let cad = parseFloat(f.ba_cadera.value), h = parseFloat(f.ba_altura.value) / 100;
            if (isNaN(cad) || isNaN(h) || cad <= 0 || h <= 0) return null;
            let bai = (cad / Math.pow(h, 1.5)) - 18;
            let cat = bai < 18 ? 'Bajo' : bai < 25 ? 'Normal' : bai < 30 ? 'Sobrepeso' : 'Obesidad';
            let cls = bai < 18 ? 'warn' : bai < 25 ? 'ok' : bai < 30 ? 'warn' : 'danger';
            let grasaEst = bai;
            return {
                main: bai.toFixed(1),
                label: `BAI: ${grasaEst.toFixed(1)}% — ${cat}`,
                extras: [{ cls, txt: `Clasificación: ${cat} (estimado ${grasaEst.toFixed(1)}% grasa)` }],
                steps: [`BAI = ${cad} / (${(h*100).toFixed(0)})^1.5 − 18 = ${bai.toFixed(1)}%`],
                chart(canvas) { NutricionVisual.bai(canvas, bai, cat); }
            };
        }
    },
    calorias_receta: {
        title: 'Calorías por Receta',
        formula: 'Total = Σ (Cantidad × Calorías_por_100g / 100)',
        fields: [
            { id: 'rc_ing1', label: 'Ingrediente 1 (g)', val: '200' },
            { id: 'rc_kcal1', label: 'Cal/100g ing. 1', val: '55' },
            { id: 'rc_ing2', label: 'Ingrediente 2 (g)', val: '150' },
            { id: 'rc_kcal2', label: 'Cal/100g ing. 2', val: '89' },
            { id: 'rc_ing3', label: 'Ingrediente 3 (g)', val: '50' },
            { id: 'rc_kcal3', label: 'Cal/100g ing. 3', val: '180' },
            { id: 'rc_porc', label: 'Porciones', val: '4' }
        ],
        calc(f) {
            let i1 = parseFloat(f.rc_ing1.value), k1 = parseFloat(f.rc_kcal1.value);
            let i2 = parseFloat(f.rc_ing2.value), k2 = parseFloat(f.rc_kcal2.value);
            let i3 = parseFloat(f.rc_ing3.value), k3 = parseFloat(f.rc_kcal3.value);
            let porc = parseFloat(f.rc_porc.value);
            if (isNaN(i1) || isNaN(i2) || isNaN(i3) || isNaN(k1) || isNaN(k2) || isNaN(k3) || isNaN(porc) || porc <= 0) return { error: true, msg: "Todos los valores deben ser numéricos", label: "Error" };
            let total = i1 * k1 / 100 + i2 * k2 / 100 + i3 * k3 / 100;
            let porcion = total / porc;
            let ingredientes = [
                { g: i1, kcal: k1, sub: i1 * k1 / 100 },
                { g: i2, kcal: k2, sub: i2 * k2 / 100 },
                { g: i3, kcal: k3, sub: i3 * k3 / 100 }
            ];
            let extras = ingredientes.map((ing, idx) => ({ cls: 'info', txt: `Ing${idx+1}: ${ing.g}g × ${ing.kcal}/100g = ${ing.sub.toFixed(1)} kcal` }));
            return {
                main: `${Math.round(total)} kcal totales`,
                label: `${porcion.toFixed(0)} kcal/porción (${porc} porciones)`,
                extras: extras,
                steps: [`Total = ${ingredientes.map(ing => `${ing.g}×${ing.kcal}/100`).join(' + ')} = ${total.toFixed(0)} kcal`, `Por porción: ${total.toFixed(0)} / ${porc} = ${porcion.toFixed(0)} kcal`],
                chart(canvas) { NutricionVisual.calorias_receta(canvas, ingredientes, total, porcion); }
            };
        }
    }
});