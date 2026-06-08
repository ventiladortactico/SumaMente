FORMS.med = {
    goteo: {
        title: 'Goteo intravenoso',
        formula: 'gotas/min = Vol(mL) × factor / tiempo(min)',
        fields: [
            { id: 'vol', label: 'Volumen (mL)', val: '500' },
            { id: 'tiempo', label: 'Tiempo (h)', val: '4' },
            { id: 'factor', label: 'Factor (gotas/mL)', val: '20' },
        ],
        calc(f) {
            let V = parseFloat(f.vol.value), T = parseFloat(f.tiempo.value) * 60, Fc = parseFloat(f.factor.value);
            if (isNaN(V) || isNaN(T) || isNaN(Fc) || T === 0) return null;
            let G = V * Fc / T;
            let mlh = V / (T / 60);
            let extras = [{ cls: 'info', txt: `Velocidad: ${mlh.toFixed(1)} mL/h` }];
            if (G > 60) extras.push({ cls: 'danger', txt: 'ALERTA: >60 gotas/min' });
            return { main: `${G.toFixed(0)} g/min`, label: 'Velocidad de goteo', extras, steps: [`Gotas/min = ${V} × ${Fc} / ${T}`] };
        }
    },
    dosis: {
        title: 'Dosis mg/kg',
        formula: 'Dosis total = peso(kg) × dosis(mg/kg)',
        fields: [
            { id: 'peso', label: 'Peso (kg)', val: '70' },
            { id: 'dosis', label: 'Dosis (mg/kg)', val: '10' },
        ],
        calc(f) {
            let P = parseFloat(f.peso.value), D = parseFloat(f.dosis.value);
            if (isNaN(P) || isNaN(D)) return null;
            let total = P * D;
            return { main: `${total.toFixed(1)} mg`, label: 'Dosis total', extras: [{ cls: 'info', txt: `${P} kg × ${D} mg/kg` }], steps: [`Dosis = ${P} × ${D} = ${total} mg`] };
        }
    },
    imc: {
        title: 'Índice de Masa Corporal',
        formula: 'IMC = peso(kg) / talla(m)²',
        fields: [
            { id: 'peso', label: 'Peso (kg)', val: '75' },
            { id: 'talla', label: 'Talla (cm)', val: '170' },
        ],
        calc(f) {
            let P = parseFloat(f.peso.value), T = parseFloat(f.talla.value) / 100;
            if (isNaN(P) || isNaN(T) || T === 0) return null;
            let imc = P / (T * T);
            let cat = imc < 18.5 ? 'Bajo peso' : imc < 25 ? 'Peso normal' : imc < 30 ? 'Sobrepeso' : 'Obesidad';
            return { main: imc.toFixed(2), label: 'IMC kg/m²', extras: [{ cls: 'info', txt: cat }], steps: [`IMC = ${P} / (${T})²`] };
        }
    },
    tmb: {
        title: 'Tasa Metabólica Basal (Harris-Benedict)',
        formula: 'TMB según sexo, peso, talla, edad',
        fields: [
            { id: 'sexo', label: 'Sexo', val: 'M', type: 'select', opts: [{ v: 'M', l: 'Masculino' }, { v: 'F', l: 'Femenino' }] },
            { id: 'peso', label: 'Peso (kg)', val: '75' },
            { id: 'talla', label: 'Talla (cm)', val: '175' },
            { id: 'edad', label: 'Edad (años)', val: '30' },
        ],
        calc(f) {
            let S = f.sexo.value, P = parseFloat(f.peso.value), T = parseFloat(f.talla.value), E = parseFloat(f.edad.value);
            if (isNaN(P) || isNaN(T) || isNaN(E)) return null;
            let tmb;
            if (S === 'M') {
                tmb = 88.362 + (13.397 * P) + (4.799 * T) - (5.677 * E);
            } else {
                tmb = 447.593 + (9.247 * P) + (3.098 * T) - (4.330 * E);
            }
            return { main: `${tmb.toFixed(0)} kcal/día`, label: 'TMB', extras: [{ cls: 'info', txt: `Basal sin actividad` }], steps: [`Harris-Benedict (${S === 'M' ? 'Hombre' : 'Mujer'})`] };
        }
    },
    crcl: {
        title: 'Clearance de Creatinina (Cockcroft-Gault)',
        formula: 'CrCl = (140-edad) × peso / (72 × Cr) × 0.85 (mujeres)',
        fields: [
            { id: 'sexo', label: 'Sexo', val: 'M', type: 'select', opts: [{ v: 'M', l: 'Masculino' }, { v: 'F', l: 'Femenino' }] },
            { id: 'edad', label: 'Edad (años)', val: '65' },
            { id: 'peso', label: 'Peso (kg)', val: '70' },
            { id: 'cr', label: 'Creatinina (mg/dL)', val: '1.2' },
        ],
        calc(f) {
            let S = f.sexo.value, E = parseFloat(f.edad.value), P = parseFloat(f.peso.value), Cr = parseFloat(f.cr.value);
            if (isNaN(E) || isNaN(P) || isNaN(Cr) || Cr === 0) return null;
            let crcl = ((140 - E) * P) / (72 * Cr);
            if (S === 'F') crcl *= 0.85;
            let cat = crcl > 90 ? 'Normal' : crcl > 60 ? 'Leve ↓' : crcl > 30 ? 'Moderado ↓' : crcl > 15 ? 'Severo ↓' : 'Fallida';
            return { main: `${crcl.toFixed(1)} mL/min`, label: 'CrCl', extras: [{ cls: crcl > 60 ? 'ok' : 'warn', txt: cat }], steps: [`Cockcroft-Gault`] };
        }
    },
    peso_ideal: {
        title: 'Peso Ideal (Devine)',
        formula: 'PI según sexo y talla',
        fields: [
            { id: 'sexo', label: 'Sexo', val: 'M', type: 'select', opts: [{ v: 'M', l: 'Masculino' }, { v: 'F', l: 'Femenino' }] },
            { id: 'talla', label: 'Talla (cm)', val: '175' },
        ],
        calc(f) {
            let S = f.sexo.value, T = parseFloat(f.talla.value);
            if (isNaN(T)) return null;
            let pi;
            if (S === 'M') {
                pi = 50 + 2.3 * ((T / 2.54) - 60);
            } else {
                pi = 45.5 + 2.3 * ((T / 2.54) - 60);
            }
            return { main: `${pi.toFixed(1)} kg`, label: 'Peso Ideal', extras: [{ cls: 'info', txt: `Fórmula Devine` }], steps: [`PI base + 2.3 × (pulgadas - 60)`] };
        }
    },
    asc: {
        title: 'Área Superficie Corporal (Mosteller)',
        formula: 'ASC = √(peso × talla / 3600)',
        fields: [
            { id: 'peso', label: 'Peso (kg)', val: '70' },
            { id: 'talla', label: 'Talla (cm)', val: '175' },
        ],
        calc(f) {
            let P = parseFloat(f.peso.value), T = parseFloat(f.talla.value);
            if (isNaN(P) || isNaN(T)) return null;
            let asc = Math.sqrt((P * T) / 3600);
            return { main: `${asc.toFixed(2)} m²`, label: 'ASC', extras: [{ cls: 'info', txt: `Mosteller` }], steps: [`√(${P} × ${T} / 3600)`] };
        }
    },
    ascvd: {
        title: 'Riesgo Cardiovascular ASCVD',
        formula: 'Riesgo a 10 años según ACC/AHA',
        fields: [
            { id: 'sexo', label: 'Sexo', val: 'M', type: 'select', opts: [{ v: 'M', l: 'Masculino' }, { v: 'F', l: 'Femenino' }, { v: 'wf', l: 'Mujer Blanca' }, { v: 'af', l: 'Mujer Afroamericana' }, { v: 'wm', l: 'Hombre Blanco' }, { v: 'am', l: 'Hombre Afroamericano' }] },
            { id: 'edad', label: 'Edad (años)', val: '55' },
            { id: 'tc', label: 'Colesterol Total (mg/dL)', val: '200' },
            { id: 'hdl', label: 'HDL (mg/dL)', val: '45' },
            { id: 'sbp', label: 'PAS (mmHg)', val: '130' },
            { id: 'tratado', label: 'Tratado HTA', val: 'no', type: 'select', opts: [{ v: 'no', l: 'No' }, { v: 'si', l: 'Sí' }] },
            { id: 'fuma', label: 'Fumador', val: 'no', type: 'select', opts: [{ v: 'no', l: 'No' }, { v: 'si', l: 'Sí' }] },
            { id: 'diab', label: 'Diabetes', val: 'no', type: 'select', opts: [{ v: 'no', l: 'No' }, { v: 'si', l: 'Sí' }] },
        ],
        calc(f) {
            let S = f.sexo.value, E = parseFloat(f.edad.value), TC = parseFloat(f.tc.value), HDL = parseFloat(f.hdl.value), SBP = parseFloat(f.sbp.value), TRAT = f.tratado.value === 'si', FUMA = f.fuma.value === 'si', DIAB = f.diab.value === 'si';
            if (isNaN(E) || isNaN(TC) || isNaN(HDL) || isNaN(SBP)) return null;
            if (!MED_CONST.ascvd[S]) return null;
            let c = MED_CONST.ascvd[S];
            let sum = c.mn + (c.lnAge * Math.log(E)) + (c.lnAge2 * Math.log(E) * Math.log(E)) + (c.lnTC * Math.log(TC)) + (c.lnAgeTC * Math.log(E) * Math.log(TC)) + (c.lnHDL * Math.log(HDL)) + (c.lnAgeHDL * Math.log(E) * Math.log(HDL)) + (TRAT ? c.lnSBPT : c.lnSBPU) * Math.log(SBP) + (TRAT ? c.lnSBPTA : c.lnSBPUA) * Math.log(E) * Math.log(SBP) + (FUMA ? c.smoke : 0) + (FUMA ? c.lnAgeSmoke : 0) * Math.log(E) + (DIAB ? c.diab : 0);
            let riesgo = 1 - Math.pow(c.s0, Math.exp(sum));
            let cat = riesgo < 5 ? 'Bajo' : riesgo < 7.5 ? 'Borde' : riesgo < 10 ? 'Moderado' : riesgo < 20 ? 'Alto' : 'Muy alto';
            return { main: `${(riesgo * 100).toFixed(1)}%`, label: 'Riesgo 10 años', extras: [{ cls: riesgo < 7.5 ? 'ok' : 'warn', txt: cat }], steps: [`Pooled Cohort Equations (${S})`] };
        }
    },
    sofa: {
        title: 'Score SOFA',
        formula: 'Evaluación de disfunción orgánica',
        fields: [
            { id: 'resp', label: 'PaO2/FiO2 (mmHg)', val: '400' },
            { id: 'plat', label: 'Plaquetas (×10³/µL)', val: '200' },
            { id: 'bili', label: 'Bilirrubina (mg/dL)', val: '1.0' },
            { id: 'cv', label: 'PAM (mmHg) o vasopresores', val: '80' },
            { id: 'gcs', label: 'Glasgow (15-3)', val: '15' },
            { id: 'crea', label: 'Creatinina (mg/dL) o diuresis', val: '1.0' },
        ],
        calc(f) {
            let R = parseFloat(f.resp.value), PL = parseFloat(f.plat.value), B = parseFloat(f.bili.value), CV = parseFloat(f.cv.value), GCS = parseFloat(f.gcs.value), CR = parseFloat(f.crea.value);
            if (isNaN(R) || isNaN(PL) || isNaN(B) || isNaN(CV) || isNaN(GCS) || isNaN(CR)) return null;
            let score = 0;
            score += R >= 300 ? 0 : R >= 200 ? 1 : R >= 100 ? 2 : R < 100 ? 3 : 4;
            score += PL >= 150 ? 0 : PL >= 100 ? 1 : PL >= 50 ? 2 : PL >= 20 ? 3 : 4;
            score += B < 1.2 ? 0 : B < 2 ? 1 : B < 6 ? 2 : B < 12 ? 3 : 4;
            score += CV >= 70 ? 0 : CV < 70 ? 1 : 2;
            score += GCS === 15 ? 0 : GCS >= 13 ? 1 : GCS >= 10 ? 2 : GCS >= 6 ? 3 : 4;
            score += CR < 1.2 ? 0 : CR < 2 ? 1 : CR < 3.5 ? 2 : CR < 5 ? 3 : 4;
            let cat = score < 2 ? 'Leve' : score < 6 ? 'Moderado' : score < 10 ? 'Severo' : 'Muy severo';
            return { main: `${score}/24`, label: 'SOFA', extras: [{ cls: score < 6 ? 'ok' : score < 10 ? 'warn' : 'danger', txt: cat }], steps: [`Suma de 6 sistemas`] };
        }
    },
    curb65: {
        title: 'Score CURB-65 (Neumonía)',
        formula: 'Confusión, Urea, RR, BP, 65+ años',
        fields: [
            { id: 'conf', label: 'Confusión', val: 'no', type: 'select', opts: [{ v: 'no', l: 'No' }, { v: 'si', l: 'Sí' }] },
            { id: 'urea', label: 'Urea (mg/dL)', val: '20' },
            { id: 'rr', label: 'Frecuencia Resp (/min)', val: '20' },
            { id: 'bp', label: 'PAS (mmHg)', val: '130' },
            { id: 'edad', label: 'Edad (años)', val: '60' },
        ],
        calc(f) {
            let CONF = f.conf.value === 'si', U = parseFloat(f.urea.value), RR = parseFloat(f.rr.value), BP = parseFloat(f.bp.value), E = parseFloat(f.edad.value);
            if (isNaN(U) || isNaN(RR) || isNaN(BP) || isNaN(E)) return null;
            let score = 0;
            if (CONF) score++;
            if (U > 19) score++;
            if (RR >= 30) score++;
            if (BP < 90 || BP < 60) score++;
            if (E >= 65) score++;
            let rec = score === 0 ? 'Ambulatorio' : score <= 1 ? 'Ambulatorio/observación' : score === 2 ? 'Hospitalizar' : 'UTI';
            return { main: `${score}/5`, label: 'CURB-65', extras: [{ cls: score <= 1 ? 'ok' : score === 2 ? 'warn' : 'danger', txt: rec }], steps: [`Puntos: ${score}`] };
        }
    },
    geneva: {
        title: 'Score Ginebra (TEP)',
        formula: 'Probabilidad de Tromboembolismo Pulmonar',
        fields: [
            { id: 'edad', label: 'Edad (años)', val: '50' },
            { id: 'dolor', label: 'Dolor torácico', val: 'no', type: 'select', opts: [{ v: 'no', l: 'No' }, { v: 'si', l: 'Sí' }] },
            { id: 'disnea', label: 'Disnea súbita', val: 'no', type: 'select', opts: [{ v: 'no', l: 'No' }, { v: 'si', l: 'Sí' }] },
            { id: 'hemoptisis', label: 'Hemoptisis', val: 'no', type: 'select', opts: [{ v: 'no', l: 'No' }, { v: 'si', l: 'Sí' }] },
            { id: 'fc', label: 'FC (lpm)', val: '80' },
            { id: 'fr', label: 'FR (/min)', val: '18' },
            { id: 'dvt', label: 'TVP previa', val: 'no', type: 'select', opts: [{ v: 'no', l: 'No' }, { v: 'si', l: 'Sí' }] },
            { id: 'cirugia', label: 'Cirugía reciente', val: 'no', type: 'select', opts: [{ v: 'no', l: 'No' }, { v: 'si', l: 'Sí' }] },
        ],
        calc(f) {
            let E = parseFloat(f.edad.value), DOL = f.dolor.value === 'si', DISP = f.disnea.value === 'si', HEM = f.hemoptisis.value === 'si', FC = parseFloat(f.fc.value), FR = parseFloat(f.fr.value), DVT = f.dvt.value === 'si', CIR = f.cirugia.value === 'si';
            if (isNaN(E) || isNaN(FC) || isNaN(FR)) return null;
            let score = 0;
            if (E >= 65) score++;
            if (DOL) score++;
            if (DISP) score++;
            if (HEM) score++;
            if (FC >= 95) score++;
            if (FR >= 20) score++;
            if (DVT) score++;
            if (CIR) score++;
            let prob = score <= 3 ? 'Baja' : score <= 5 ? 'Moderada' : 'Alta';
            return { main: `${score}/8`, label: 'Ginebra', extras: [{ cls: score <= 3 ? 'ok' : score <= 5 ? 'warn' : 'danger', txt: prob }], steps: [`Puntos: ${score}`] };
        }
    },
    gina: {
        title: 'Asma GINA (Control)',
        formula: 'Evaluación de control de asma',
        fields: [
            { id: 'sintomas', label: 'Síntomas diurnos (días/semana)', val: '2' },
            { id: 'despertar', label: 'Despertar nocturno (días/semana)', val: '0' },
            { id: 'rescate', label: 'Uso de rescate (días/semana)', val: '1' },
            { id: 'limitacion', label: 'Limitación actividad', val: 'no', type: 'select', opts: [{ v: 'no', l: 'No' }, { v: 'si', l: 'Sí' }] },
        ],
        calc(f) {
            let S = parseFloat(f.sintomas.value), D = parseFloat(f.despertar.value), R = parseFloat(f.rescate.value), L = f.limitacion.value === 'si';
            if (isNaN(S) || isNaN(D) || isNaN(R)) return null;
            let score = 0;
            if (S > 2) score++;
            if (D > 0) score++;
            if (R > 2) score++;
            if (L) score++;
            let control = score === 0 ? 'Bien controlado' : score <= 2 ? 'Parcialmente controlado' : 'No controlado';
            return { main: `${score}/4`, label: 'GINA', extras: [{ cls: score === 0 ? 'ok' : score <= 2 ? 'warn' : 'danger', txt: control }], steps: [`Puntos: ${score}`] };
        }
    },
    anc: {
        title: 'ANC (Absoluto Neutrófilos Conteo)',
        formula: 'ANC = WBC × %neutrófilos / 100',
        fields: [
            { id: 'wbc', label: 'WBC (×10³/µL)', val: '7.5' },
            { id: 'neutro', label: '% Neutrófilos', val: '60' },
        ],
        calc(f) {
            let W = parseFloat(f.wbc.value), N = parseFloat(f.neutro.value);
            if (isNaN(W) || isNaN(N)) return null;
            let anc = W * N / 100;
            let cat = anc >= 1.5 ? 'Normal' : anc >= 0.5 ? 'Leucopenia' : anc >= 0.1 ? 'Neutropenia severa' : 'Agranulocitosis';
            return { main: `${anc.toFixed(2)} ×10³/µL`, label: 'ANC', extras: [{ cls: anc >= 1.5 ? 'ok' : 'danger', txt: cat }], steps: [`ANC = ${W} × ${N}% / 100`] };
        }
    },
    ganzoni: {
        title: 'Ganzoni (Déficit Hierro)',
        formula: 'Déficit = peso × (Hb_obj - Hb_act) × 2.3 + 500',
        fields: [
            { id: 'peso', label: 'Peso (kg)', val: '70' },
            { id: 'hb_act', label: 'Hb actual (g/dL)', val: '10' },
            { id: 'hb_obj', label: 'Hb objetivo (g/dL)', val: '14' },
        ],
        calc(f) {
            let P = parseFloat(f.peso.value), HBA = parseFloat(f.hb_act.value), HBO = parseFloat(f.hb_obj.value);
            if (isNaN(P) || isNaN(HBA) || isNaN(HBO)) return null;
            let deficit = P * (HBO - HBA) * 2.3 + 500;
            return { main: `${deficit.toFixed(0)} mg`, label: 'Déficit Fe', extras: [{ cls: 'info', txt: `+500mg reserva` }], steps: [`Ganzoni: ${P} × (${HBO}-${HBA}) × 2.3 + 500`] };
        }
    }
};