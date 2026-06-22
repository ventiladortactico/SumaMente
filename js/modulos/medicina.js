FORMS.med = {
    goteo: {
        title: 'Goteo intravenoso',
        formula: 'gotas/min = Vol(mL) \u00d7 factor / tiempo(min)',
        fields: [
            { id: 'vol', label: 'Volumen (mL)', val: '500' },
            { id: 'tiempo', label: 'Tiempo (h)', val: '4' },
            { id: 'factor', label: 'Factor (gotas/mL)', val: '20' },
        ],
        calc(f) {
            let V = parseFloat(f.vol.value), T = parseFloat(f.tiempo.value) * 60, Fc = parseFloat(f.factor.value);
            if (isNaN(V) || isNaN(T) || isNaN(Fc) || T === 0) return null;
            if (V <= 0) return { error: true, msg: "El volumen debe ser mayor a 0", label: "Error" };
            let G = V * Fc / T;
            let mlh = V / (T / 60);
            let extras = [{ cls: 'info', txt: 'Velocidad: ' + mlh.toFixed(1) + ' mL/h' }];
            if (G > 60) extras.push({ cls: 'danger', txt: 'ALERTA: >60 gotas/min' });
            return {
                main: G.toFixed(0) + ' g/min',
                label: 'Velocidad de goteo',
                extras,
                steps: ['Gotas/min = ' + V + ' \u00d7 ' + Fc + ' / ' + T],
                chart(canvas) { MedicinaVisual.goteo(canvas, G, mlh); }
            };
        }
    },
    dosis: {
        title: 'Dosis por Peso',
        formula: 'Dosis total = Dosis/kg \u00d7 Peso',
        fields: [
            { id: 'peso', label: 'Peso (kg)', val: '70' },
            { id: 'dosis_kg', label: 'Dosis por kg (mg/kg)', val: '5' },
        ],
        calc(f) {
            let P = parseFloat(f.peso.value), Dk = parseFloat(f.dosis_kg.value);
            if (isNaN(P) || isNaN(Dk)) return null;
            let dosis = P * Dk;
            return {
                main: dosis.toFixed(0) + ' mg',
                label: 'Dosis total calculada',
                steps: ['Dosis = ' + P + ' kg \u00d7 ' + Dk + ' mg/kg'],
                chart(canvas) { MedicinaVisual.dosis(canvas, dosis, P); }
            };
        }
    },
    imc: {
        title: '\u00cdndice de Masa Corporal (IMC)',
        formula: 'IMC = Peso(kg) / Altura(m)\u00b2',
        fields: [
            { id: 'peso', label: 'Peso (kg)', val: '70' },
            { id: 'altura', label: 'Altura (cm)', val: '170' },
        ],
        calc(f) {
            let P = parseFloat(f.peso.value), A = parseFloat(f.altura.value) / 100;
            if (isNaN(P) || isNaN(A) || A === 0) return null;
            let imc = P / (A * A);
            let cat, cls;
            if (imc < 18.5) { cat = 'Bajo peso'; cls = 'warn'; }
            else if (imc < 25) { cat = 'Normal'; cls = 'ok'; }
            else if (imc < 30) { cat = 'Sobrepeso'; cls = 'warn'; }
            else if (imc < 35) { cat = 'Obesidad G1'; cls = 'danger'; }
            else if (imc < 40) { cat = 'Obesidad G2'; cls = 'danger'; }
            else { cat = 'Obesidad G3'; cls = 'danger'; }
            return {
                main: imc.toFixed(1),
                label: 'IMC calculado',
                extras: [{ cls: cls, txt: 'Clasificaci\u00f3n: ' + cat }],
                steps: ['IMC = ' + P + ' kg / (' + (A*100) + ' cm)\u00b2'],
                chart(canvas) { MedicinaVisual.imc(canvas, imc); }
            };
        }
    },
    tmb: {
        title: 'Tasa Metab\u00f3lica Basal (Mifflin-St Jeor)',
        formula: 'TMB = 10\u00d7P + 6.25\u00d7A \u2212 5\u00d7E + S',
        fields: [
            { id: 'peso', label: 'Peso (kg)', val: '70' },
            { id: 'altura', label: 'Altura (cm)', val: '170' },
            { id: 'edad', label: 'Edad (a\u00f1os)', val: '30' },
            { id: 'sexo', label: 'Sexo', type: 'select', opts: [{v:'m', l:'Masculino'}, {v:'f', l:'Femenino'}] }
        ],
        calc(f) {
            let P = parseFloat(f.peso.value), A = parseFloat(f.altura.value), E = parseFloat(f.edad.value);
            let S = f.sexo.value === 'm' ? 5 : -161;
            if (isNaN(P) || isNaN(A) || isNaN(E)) return null;
            let tmb = 10 * P + 6.25 * A - 5 * E + S;
            return {
                main: tmb.toFixed(0) + ' kcal/d\u00eda',
                label: 'Tasa Metab\u00f3lica Basal',
                extras: [{ cls: 'info', txt: 'Gasto energ\u00e9tico en reposo.' }],
                steps: ['TMB = 10\u00d7' + P + ' + 6.25\u00d7' + A + ' - 5\u00d7' + E + ' + ' + S],
                chart(canvas) { MedicinaVisual.tmb(canvas, tmb, P, A, E, S === 5); }
            };
        }
    },
    crcl: {
        title: 'Aclaramiento de Creatinina (Cockcroft-Gault)',
        formula: 'ClCr = ((140\u2212E)\u00d7P) / (72\u00d7Cr) \u00d7 F',
        fields: [
            { id: 'edad', label: 'Edad (a\u00f1os)', val: '65' },
            { id: 'peso', label: 'Peso (kg)', val: '70' },
            { id: 'creat', label: 'Creatinina (mg/dL)', val: '1.4' },
            { id: 'sexo', label: 'Sexo', type: 'select', opts: [{v:'1', l:'Masculino'}, {v:'0.85', l:'Femenino'}] }
        ],
        calc(f) {
            let E = parseFloat(f.edad.value), P = parseFloat(f.peso.value);
            let Cr = parseFloat(f.creat.value), S = parseFloat(f.sexo.value);
            if (isNaN(E) || isNaN(P) || isNaN(Cr) || Cr === 0) return null;
            if (E <= 0 || P <= 0 || Cr <= 0) return { error: true, msg: "Todos los valores deben ser > 0", label: "Error" };
            let clcr = ((140 - E) * P) / (72 * Cr) * S;
            let estadio = 'G1: Normal (\u226590)';
            let cls = 'ok';
            if (clcr < 15) { estadio = 'G5: Falla Renal (<15)'; cls = 'danger'; }
            else if (clcr < 30) { estadio = 'G4: Da\u00f1o Severo (15-29)'; cls = 'danger'; }
            else if (clcr < 60) { estadio = 'G3: Insuf. Moderada (30-59)'; cls = 'warn'; }
            else if (clcr < 90) { estadio = 'G2: Ca\u00edda Leve (60-89)'; cls = 'info'; }
            return {
                main: clcr.toFixed(1) + ' mL/min',
                label: 'Aclaramiento de Creatinina',
                extras: [{ cls: cls, txt: estadio }],
                steps: ['ClCr = ((140-' + E + ')\u00d7' + P + ') / (72\u00d7' + Cr + ') \u00d7 ' + S],
                chart(canvas) { MedicinaVisual.crcl(canvas, clcr); }
            };
        }
    },
    peso_ideal: {
        title: 'Peso Ideal (Devine)',
        formula: 'H: 50 + 2.3\u00d7((A\u2212152.4)/2.54) | M: 45.5 + ...',
        fields: [
            { id: 'altura', label: 'Altura (cm)', val: '170' },
            { id: 'sexo', label: 'Sexo', type: 'select', opts: [{v:'m', l:'Masculino'}, {v:'f', l:'Femenino'}] }
        ],
        calc(f) {
            let A = parseFloat(f.altura.value), sexo = f.sexo.value;
            if (isNaN(A)) return null;
            let base = sexo === 'm' ? 50 : 45.5;
            let pi = base + 2.3 * ((A - 152.4) / 2.54);
            return {
                main: pi.toFixed(1) + ' kg',
                label: 'Peso Ideal estimado',
                extras: [{ cls: 'info', txt: 'F\u00f3rmula de Devine. Rango \u00b110%.' }],
                steps: ['PI = ' + base + ' + 2.3 \u00d7 (' + A + ' - 152.4) / 2.54'],
                chart(canvas) { MedicinaVisual.pesoIdeal(canvas, pi, sexo === 'm'); }
            };
        }
    },
    asc: {
        title: '\u00c1rea de Superficie Corporal (Mosteller)',
        formula: 'ASC (m\u00b2) = \u221a(P \u00d7 A / 3600)',
        fields: [
            { id: 'peso', label: 'Peso (kg)', val: '70' },
            { id: 'altura', label: 'Altura (cm)', val: '170' },
        ],
        calc(f) {
            let P = parseFloat(f.peso.value), A = parseFloat(f.altura.value);
            if (isNaN(P) || isNaN(A)) return null;
            let asc = Math.sqrt(P * A / 3600);
            return {
                main: asc.toFixed(2) + ' m\u00b2',
                label: 'Superficie Corporal',
                steps: ['ASC = \u221a(' + P + ' \u00d7 ' + A + ' / 3600)'],
                chart(canvas) { MedicinaVisual.asc(canvas, asc, P, A); }
            };
        }
    },
    ascvd: {
        title: 'Riesgo ASCVD (Pooled Cohort)',
        formula: 'Riesgo estimado a 10 a\u00f1os',
        fields: [
            { id: 'edad', label: 'Edad (a\u00f1os)', val: '55' },
            { id: 'hdl', label: 'HDL (mg/dL)', val: '45' },
            { id: 'col_total', label: 'Col. Total (mg/dL)', val: '200' },
            { id: 'pas', label: 'PAS (mmHg)', val: '130' },
            { id: 'hta', label: 'Trat. HTA', type: 'select', opts: [{v:'1', l:'S\u00ed'}, {v:'0', l:'No'}] },
            { id: 'dm', label: 'Diabetes', type: 'select', opts: [{v:'1', l:'S\u00ed'}, {v:'0', l:'No'}] },
            { id: 'tabaco', label: 'Tabaquismo', type: 'select', opts: [{v:'1', l:'S\u00ed'}, {v:'0', l:'No'}] },
            { id: 'sexo', label: 'Sexo', type: 'select', opts: [{v:'m', l:'Masculino'}, {v:'f', l:'Femenino'}] }
        ],
        calc(f) {
            let E = parseFloat(f.edad.value), HDL = parseFloat(f.hdl.value);
            let CT = parseFloat(f.col_total.value), PAS = parseFloat(f.pas.value);
            let HTA = parseFloat(f.hta.value), DM = parseFloat(f.dm.value);
            let TABAQ = parseFloat(f.tabaco.value);
            if (isNaN(E) || isNaN(HDL) || isNaN(CT) || isNaN(PAS)) return null;
            if (E < 40 || E > 79) return { error: true, msg: "Edad fuera de rango (40-79 a\u00f1os)", label: "Error" };
            let lnAge = Math.log(E), lnCT = Math.log(CT), lnHDL = Math.log(HDL);
            let lnPAS = Math.log(PAS);
            let sexM = f.sexo.value === 'm';
            let sum = sexM ? (12.344 * lnAge + 11.853 * lnCT - 2.664 * lnHDL + 1.798 * lnPAS + 1.764 * HTA + 1.764 * DM + 1.764 * TABAQ - 61.18)
                         : (-29.799 * lnAge + 4.884 * lnCT + 13.540 * lnHDL + 2.819 * lnPAS + 1.764 * HTA + 1.764 * DM + 1.764 * TABAQ - 29.18);
            let riesgo = Math.min(100, Math.max(0, 100 * (1 - Math.pow(0.9665, Math.exp(sum)))));
            let cls = riesgo < 5 ? 'ok' : riesgo < 10 ? 'warn' : 'danger';
            let cat = riesgo < 5 ? 'Bajo (<5%)' : riesgo < 7.5 ? 'Fronterizo (5-7.4%)' : riesgo < 20 ? 'Intermedio (7.5-19.9%)' : 'Alto (\u226520%)';
            return {
                main: riesgo.toFixed(1) + '%',
                label: 'Riesgo ASCVD a 10 a\u00f1os',
                extras: [{ cls: cls, txt: 'Categor\u00eda: ' + cat }],
                steps: ['Riesgo estimado seg\u00fan Pooled Cohort Equations'],
                chart(canvas) { MedicinaVisual.ascvd(canvas, riesgo); }
            };
        }
    },
    sofa: {
        title: 'Score SOFA (Sepsis)',
        formula: 'Puntaje: Resp. + Coag. + Hep. + C-V + Renal + Neuro',
        fields: [
            { id: 'pao2', label: 'PaO\u2082/FiO\u2082', val: '250' },
            { id: 'vent', label: 'Ventilaci\u00f3n Mec.', type: 'select', opts: [{v:'1', l:'S\u00ed'}, {v:'0', l:'No'}] },
            { id: 'plaquetas', label: 'Plaquetas (\u00d710\u00b3/\u00b5L)', val: '120' },
            { id: 'bili', label: 'Bilirrubina (mg/dL)', val: '1.5' },
            { id: 'map', label: 'PAM (mmHg)', val: '70' },
            { id: 'creat_s', label: 'Creatinina (mg/dL)', val: '1.2' },
            { id: 'glasgow', label: 'Glasgow', val: '15' },
        ],
        calc(f) {
            let pf = parseFloat(f.pao2.value), plaq = parseFloat(f.plaquetas.value);
            let bili = parseFloat(f.bili.value), map = parseFloat(f.map.value);
            let creat = parseFloat(f.creat_s.value), gcs = parseFloat(f.glasgow.value);
            let vent = parseFloat(f.vent.value);
            if (isNaN(pf) || isNaN(plaq) || isNaN(bili) || isNaN(map) || isNaN(creat) || isNaN(gcs)) return null;
            let resp = pf < 100 ? 4 : pf < 200 ? 3 : pf < 300 ? 2 : pf < 400 ? 1 : 0;
            if (vent === 0) resp = 0;
            let coag = plaq < 20 ? 4 : plaq < 50 ? 3 : plaq < 100 ? 2 : plaq < 150 ? 1 : 0;
            let hep = bili > 12 ? 4 : bili > 6 ? 3 : bili > 2 ? 2 : bili > 1.2 ? 1 : 0;
            let cv = map < 40 ? 4 : map < 50 ? 3 : map < 60 ? 2 : map < 70 ? 1 : 0;
            let renal = creat > 5 ? 4 : creat > 3.5 ? 3 : creat > 2 ? 2 : creat > 1.2 ? 1 : 0;
            let neuro = gcs < 6 ? 4 : gcs < 9 ? 3 : gcs < 12 ? 2 : gcs < 15 ? 1 : 0;
            let total = resp + coag + hep + cv + renal + neuro;
            let cls = total < 6 ? 'ok' : total < 10 ? 'warn' : 'danger';
            let cat = total < 6 ? 'Mortalidad <10%' : total < 10 ? 'Mortalidad ~20-40%' : 'Mortalidad >50%';
            return {
                main: total + ' pts',
                label: 'Score SOFA',
                extras: [{ cls: cls, txt: cat }, { cls: 'info', txt: 'Resp:'+resp+'  Coag:'+coag+'  Hep:'+hep+'  C-V:'+cv+'  Renal:'+renal+'  Neuro:'+neuro }],
                steps: ['SOFA = ' + resp + '+' + coag + '+' + hep + '+' + cv + '+' + renal + '+' + neuro],
                chart(canvas) { MedicinaVisual.sofa(canvas, resp, coag, hep, cv, renal, neuro, total); }
            };
        }
    },
    curb65: {
        title: 'CURB-65 (Neumon\u00eda)',
        formula: 'Confusi\u00f3n + BUN>20 + FR>30 + PAS<90 + Edad>65',
        fields: [
            { id: 'conf', label: 'Confusi\u00f3n mental', type: 'select', opts: [{v:'1', l:'S\u00ed'}, {v:'0', l:'No'}] },
            { id: 'bun', label: 'BUN (mg/dL)', val: '18' },
            { id: 'fr', label: 'Frec. Respiratoria', val: '22' },
            { id: 'pas', label: 'PAS (mmHg)', val: '110' },
            { id: 'edad', label: 'Edad', val: '60' },
        ],
        calc(f) {
            let C = parseFloat(f.conf.value), BUN = parseFloat(f.bun.value);
            let FR = parseFloat(f.fr.value), PAS = parseFloat(f.pas.value), E = parseFloat(f.edad.value);
            if (isNaN(BUN) || isNaN(FR) || isNaN(PAS) || isNaN(E)) return null;
            let score = C + (BUN > 20 ? 1 : 0) + (FR > 30 ? 1 : 0) + (PAS < 90 ? 1 : 0) + (E > 65 ? 1 : 0);
            let cls, cat;
            if (score <= 1) { cls = 'ok'; cat = 'Bajo riesgo. Ambulatorio.'; }
            else if (score === 2) { cls = 'warn'; cat = 'Riesgo moderado. Hospitalizaci\u00f3n.'; }
            else { cls = 'danger'; cat = 'Alto riesgo. UCI.'; }
            return {
                main: score + '/5',
                label: 'CURB-65',
                extras: [{ cls: cls, txt: cat }],
                steps: ['C:'+C+' BUN>20:'+(BUN>20?1:0)+' FR>30:'+(FR>30?1:0)+' PAS<90:'+(PAS<90?1:0)+' Edad>65:'+(E>65?1:0)],
                chart(canvas) { MedicinaVisual.curb65(canvas, score); }
            };
        }
    },
    geneva: {
        title: 'Ginebra TEP (Simplificado)',
        formula: 'Predicci\u00f3n cl\u00ednica de TEP',
        fields: [
            { id: 'edad', label: 'Edad > 65', type: 'select', opts: [{v:'1', l:'S\u00ed'}, {v:'0', l:'No'}] },
            { id: 'tvp', label: 'TVP previa', type: 'select', opts: [{v:'1', l:'S\u00ed'}, {v:'0', l:'No'}] },
            { id: 'cirugia', label: 'Cirug\u00eda/fractura \u22644 sem', type: 'select', opts: [{v:'1', l:'S\u00ed'}, {v:'0', l:'No'}] },
            { id: 'fc', label: 'FC > 95 lpm', type: 'select', opts: [{v:'1', l:'S\u00ed'}, {v:'0', l:'No'}] },
            { id: 'pao2', label: 'PaO\u2082 < 65 mmHg', type: 'select', opts: [{v:'1', l:'S\u00ed'}, {v:'0', l:'No'}] },
        ],
        calc(f) {
            let score = parseFloat(f.edad.value) + parseFloat(f.tvp.value) + parseFloat(f.cirugia.value) +
                        parseFloat(f.fc.value) + parseFloat(f.pao2.value);
            let cls = score < 3 ? 'ok' : 'danger';
            let cat = score < 3 ? 'Baja probabilidad (<10%)' : 'Alta probabilidad (>40%)';
            return {
                main: score + ' pts',
                label: 'Score Ginebra TEP',
                extras: [{ cls: cls, txt: cat }],
                steps: ['Score Ginebra simplificado = ' + score + '/5'],
                chart(canvas) { MedicinaVisual.geneva(canvas, score); }
            };
        }
    },
    gina: {
        title: 'Control de Asma (GINA)',
        formula: 'S\u00edntomas diurnos, nocturnos, actividad y medicaci\u00f3n',
        fields: [
            { id: 'diurnos', label: 'S\u00edntomas diurnos (>2/sem)', type: 'select', opts: [{v:'1', l:'S\u00ed'}, {v:'0', l:'No'}] },
            { id: 'nocturnos', label: 'Despertares nocturnos', type: 'select', opts: [{v:'1', l:'S\u00ed'}, {v:'0', l:'No'}] },
            { id: 'actividad', label: 'Limita actividad', type: 'select', opts: [{v:'1', l:'S\u00ed'}, {v:'0', l:'No'}] },
            { id: 'saba', label: 'Uso SABA (>2/sem)', type: 'select', opts: [{v:'1', l:'S\u00ed'}, {v:'0', l:'No'}] },
        ],
        calc(f) {
            let D = parseFloat(f.diurnos.value), N = parseFloat(f.nocturnos.value);
            let A = parseFloat(f.actividad.value), S = parseFloat(f.saba.value);
            let total = D + N + A + S;
            let nivel, cls, color;
            if (total === 0) { nivel = 'Bien controlado'; cls = 'ok'; }
            else if (total <= 2) { nivel = 'Parcialmente controlado'; cls = 'warn'; }
            else { nivel = 'Mal controlado'; cls = 'danger'; }
            return {
                main: nivel,
                label: 'Nivel de control de asma (GINA)',
                extras: [{ cls: cls, txt: total === 0 ? '0/4 \u00edtems positivos' : total + '/4 \u00edtems positivos' }],
                steps: ['Diurnos:'+D+' Nocturnos:'+N+' Actividad:'+A+' SABA:'+S],
                chart(canvas) { MedicinaVisual.gina(canvas, total); }
            };
        }
    },
    anc: {
        title: 'Recuento Absoluto de Neutr\u00f3filos (ANC)',
        formula: 'ANC = WBC \u00d7 (%Neutr\u00f3filos + %Bandas) / 100',
        fields: [
            { id: 'wbc', label: 'Leucocitos (WBC) /\u00b5L', val: '4000' },
            { id: 'seg', label: 'Segmentados (%)', val: '25' },
            { id: 'band', label: 'Bandas (%)', val: '5' },
        ],
        calc(f) {
            let WBC = parseFloat(f.wbc.value), S = parseFloat(f.seg.value), B = parseFloat(f.band.value);
            if (isNaN(WBC) || isNaN(S) || isNaN(B)) return null;
            let totalNeutro = S + B;
            if (totalNeutro > 100) return { error: true, msg: "La suma de porcentajes no puede superar el 100%", label: "Error" };
            let anc = WBC * totalNeutro / 100;
            let cat = 'Normal';
            let cls = 'ok';
            if (anc < 500) { cat = 'Agranulocitosis / Severo'; cls = 'danger'; }
            else if (anc < 1000) { cat = 'Neutropenia Moderada'; cls = 'danger'; }
            else if (anc < 1500) { cat = 'Neutropenia Leve'; cls = 'warn'; }
            return {
                main: anc.toLocaleString('es-AR', {maximumFractionDigits:0}) + ' /\u00b5L',
                label: 'ANC Calculado',
                extras: [{ cls: cls, txt: 'Condici\u00f3n: ' + cat }],
                steps: ['ANC = ' + WBC + ' \u00d7 (' + S + '% + ' + B + '%) / 100'],
                chart(canvas) { MedicinaVisual.anc(canvas, anc); }
            };
        }
    },
    shock: {
        title: '\u00cdndice de Shock',
        formula: 'IS = FC / PAS',
        fields: [
            { id: 'fc', label: 'Frecuencia Card\u00edaca (lpm)', val: '110' },
            { id: 'pas', label: 'PAS (mmHg)', val: '90' }
        ],
        calc(f) {
            let fc = parseFloat(f.fc.value), pas = parseFloat(f.pas.value);
            if (isNaN(fc) || isNaN(pas) || pas === 0) return null;
            let is = fc / pas;
            let estado = 'Normal (0.5-0.7)';
            let cls = 'ok';
            if (is >= 1.0) { estado = 'Shock Severo (\u22651.0)'; cls = 'danger'; }
            else if (is >= 0.7) { estado = 'Shock Oculto (0.7-0.9)'; cls = 'warn'; }
            return {
                main: is.toFixed(2),
                label: '\u00cdndice de Shock',
                extras: [{ cls: cls, txt: estado }],
                steps: ['IS = ' + fc + ' / ' + pas],
                chart(canvas) { MedicinaVisual.shock(canvas, is, fc); }
            };
        }
    },
    ganzoni: {
        title: 'Ganzoni (D\u00e9ficit de Hierro)',
        formula: 'D\u00e9ficit = peso \u00d7 (Hb_obj - Hb_act) \u00d7 2.4 + 500',
        fields: [
            { id: 'peso', label: 'Peso (kg)', val: '70' },
            { id: 'hb_act', label: 'Hb actual (g/dL)', val: '10' },
            { id: 'hb_obj', label: 'Hb objetivo (g/dL)', val: '14' },
        ],
        calc(f) {
            let P = parseFloat(f.peso.value), HBA = parseFloat(f.hb_act.value), HBO = parseFloat(f.hb_obj.value);
            if (isNaN(P) || isNaN(HBA) || isNaN(HBO)) return null;
            if (HBO <= HBA) return { error: true, msg: "La Hb objetivo debe ser mayor a la actual", label: "Innecesario" };
            let deficit = P * (HBO - HBA) * 2.4 + 500;
            return {
                main: deficit.toFixed(0) + ' mg',
                label: 'D\u00e9ficit total de hierro',
                extras: [{ cls: 'warn', txt: 'Dosis en Hierro Elemental total.' }],
                steps: ['D\u00e9ficit = ' + P + 'kg \u00d7 (' + HBO + '-' + HBA + ') \u00d7 2.4 + 500'],
                chart(canvas) { MedicinaVisual.ganzoni(canvas, deficit); }
            };
        }
    }
};

FORMS.med.gcs = {
    title: 'Glasgow Coma Scale (GCS)',
    formula: 'GCS = O + V + M (3-15 pts)',
    fields: [
        { id: 'eyes', label: 'Apertura ocular', type: 'select', opts: [
            {v:'4', l:'4 - Espontánea'}, {v:'3', l:'3 - Al llamado'}, {v:'2', l:'2 - Al dolor'}, {v:'1', l:'1 - Ninguna'}
        ]},
        { id: 'verbal', label: 'Respuesta verbal', type: 'select', opts: [
            {v:'5', l:'5 - Orientada'}, {v:'4', l:'4 - Confusa'}, {v:'3', l:'3 - Inapropiada'}, {v:'2', l:'2 - Sonidos'}, {v:'1', l:'1 - Ninguna'}
        ]},
        { id: 'motor', label: 'Respuesta motora', type: 'select', opts: [
            {v:'6', l:'6 - Obedece órdenes'}, {v:'5', l:'5 - Localiza dolor'}, {v:'4', l:'4 - Retirada'}, {v:'3', l:'3 - Flexión'}, {v:'2', l:'2 - Extensión'}, {v:'1', l:'1 - Ninguna'}
        ]},
    ],
    calc(f) {
        let eyes = parseInt(f.eyes.value), verbal = parseInt(f.verbal.value), motor = parseInt(f.motor.value);
        if (isNaN(eyes) || isNaN(verbal) || isNaN(motor)) return null;
        let total = eyes + verbal + motor;
        let cls, cat;
        if (total >= 13) { cls = 'ok'; cat = 'Leve (13-15)'; }
        else if (total >= 9) { cls = 'warn'; cat = 'Moderado (9-12)'; }
        else { cls = 'danger'; cat = 'Severo (≤8)'; }
        return {
            main: total + '/15',
            label: 'Glasgow Coma Scale',
            extras: [{ cls, txt: 'Severidad: ' + cat }],
            steps: ['O:' + eyes + ' + V:' + verbal + ' + M:' + motor + ' = ' + total],
            chart(canvas) { MedicinaVisual.gcs(canvas, total, eyes, verbal, motor); }
        };
    }
};

FORMS.med.apgar = {
    title: 'APGAR Neonatal',
    formula: 'Apgar = FR + FC + Tono + Reflejo + Color (0-10)',
    fields: [
        { id: 'fr', label: 'Frec. Respiratoria', type: 'select', opts: [
            {v:'0', l:'0 - Ausente'}, {v:'1', l:'1 - Lenta/irregular'}, {v:'2', l:'2 - Buena/llanto'}
        ]},
        { id: 'fc', label: 'Frec. Cardíaca', type: 'select', opts: [
            {v:'0', l:'0 - Ausente'}, {v:'1', l:'1 - <100 lpm'}, {v:'2', l:'2 - ≥100 lpm'}
        ]},
        { id: 'tono', label: 'Tono muscular', type: 'select', opts: [
            {v:'0', l:'0 - Flácido'}, {v:'1', l:'1 - Flexión leve'}, {v:'2', l:'2 - Movimiento activo'}
        ]},
        { id: 'reflejo', label: 'Reflejo/Irritabilidad', type: 'select', opts: [
            {v:'0', l:'0 - Sin respuesta'}, {v:'1', l:'1 - Mueca'}, {v:'2', l:'2 - Estornudo/tos'}
        ]},
        { id: 'color', label: 'Color', type: 'select', opts: [
            {v:'0', l:'0 - Pálido/cianótico'}, {v:'1', l:'1 - Cuerpo rosado, extrem. cian.'}, {v:'2', l:'2 - Completamente rosado'}
        ]},
    ],
    calc(f) {
        let fr = parseInt(f.fr.value), fc = parseInt(f.fc.value);
        let tono = parseInt(f.tono.value), reflejo = parseInt(f.reflejo.value), color = parseInt(f.color.value);
        if (isNaN(fr) || isNaN(fc) || isNaN(tono) || isNaN(reflejo) || isNaN(color)) return null;
        let total = fr + fc + tono + reflejo + color;
        let cls, cat;
        if (total >= 7) { cls = 'ok'; cat = 'Normal (7-10)'; }
        else if (total >= 4) { cls = 'warn'; cat = 'Depresión moderada (4-6)'; }
        else { cls = 'danger'; cat = 'Depresión severa (0-3)'; }
        return {
            main: total + '/10',
            label: 'APGAR Neonatal',
            extras: [{ cls, txt: 'Interpretación: ' + cat }],
            steps: ['FR:' + fr + ' FC:' + fc + ' Tono:' + tono + ' Reflejo:' + reflejo + ' Color:' + color + ' = ' + total],
            chart(canvas) { MedicinaVisual.apgar(canvas, total, fr, fc, tono, reflejo, color); }
        };
    }
};

FORMS.med.pf_ratio = {
    title: 'Índice PaO₂/FiO₂ (P/F Ratio)',
    formula: 'PF = PaO₂(mmHg) / FiO₂(decimal)',
    fields: [
        { id: 'pao2', label: 'PaO₂ (mmHg)', val: '80' },
        { id: 'fio2', label: 'FiO₂ (%)', val: '40' },
    ],
    calc(f) {
        let pao2 = parseFloat(f.pao2.value), fio2 = parseFloat(f.fio2.value) / 100;
        if (isNaN(pao2) || isNaN(fio2) || fio2 === 0) return null;
        if (pao2 <= 0) return { error: true, msg: "PaO₂ debe ser > 0", label: "Error" };
        let pf = pao2 / fio2;
        let cls, cat;
        if (pf >= 400) { cls = 'ok'; cat = 'Normal (≥400)'; }
        else if (pf >= 300) { cls = 'ok'; cat = 'Leve (300-399)'; }
        else if (pf >= 200) { cls = 'warn'; cat = 'Moderado (200-299) - ALI'; }
        else if (pf >= 100) { cls = 'danger'; cat = 'Severo (100-199) - SDRA moderado'; }
        else { cls = 'danger'; cat = 'Crítico (<100) - SDRA severo'; }
        return {
            main: pf.toFixed(1),
            label: 'Índice P/F (PaO₂/FiO₂)',
            extras: [{ cls, txt: 'Categoría: ' + cat }],
            steps: ['PF = ' + pao2 + ' / ' + (fio2 * 100).toFixed(0) + '% = ' + pf.toFixed(1)],
            chart(canvas) { MedicinaVisual.pfRatio(canvas, pf); }
        };
    }
};

FORMS.med.correccion_sodio = {
    title: 'Corrección de Sodio por Hiperglucemia',
    formula: 'Na_corr = Na_med + 1.6 × (Glu - 100) / 100',
    fields: [
        { id: 'na_med', label: 'Na medido (mEq/L)', val: '135' },
        { id: 'glucosa', label: 'Glucosa (mg/dL)', val: '400' },
    ],
    calc(f) {
        let na = parseFloat(f.na_med.value), glu = parseFloat(f.glucosa.value);
        if (isNaN(na) || isNaN(glu)) return null;
        let naCorr = na + 1.6 * (glu - 100) / 100;
        return {
            main: naCorr.toFixed(1) + ' mEq/L',
            label: 'Sodio corregido',
            extras: [
                { cls: 'info', txt: 'Na medido: ' + na + ' mEq/L | Glu: ' + glu + ' mg/dL' },
                { cls: naCorr > 145 ? 'warn' : 'ok', txt: naCorr > 145 ? 'Hipernatremia corregida' : 'Na corregido dentro de rango' }
            ],
            steps: ['Na_corr = ' + na + ' + 1.6 × (' + glu + ' - 100) / 100 = ' + naCorr.toFixed(1)],
            chart(canvas) { MedicinaVisual.correccionSodio(canvas, na, naCorr, glu); }
        };
    }
};

FORMS.med.anion_gap = {
    title: 'Anion Gap (Brecha Aniónica)',
    formula: 'AG = Na - (Cl + HCO₃)',
    fields: [
        { id: 'na', label: 'Sodio (Na - mEq/L)', val: '140' },
        { id: 'cl', label: 'Cloro (Cl - mEq/L)', val: '105' },
        { id: 'hco3', label: 'Bicarbonato (HCO₃ - mEq/L)', val: '24' },
    ],
    calc(f) {
        let na = parseFloat(f.na.value), cl = parseFloat(f.cl.value), hco3 = parseFloat(f.hco3.value);
        if (isNaN(na) || isNaN(cl) || isNaN(hco3)) return null;
        let ag = na - (cl + hco3);
        let cls, cat;
        if (ag >= 12) { cls = 'danger'; cat = 'Elevado (≥12) - Acidosis metabólica'; }
        else if (ag >= 8) { cls = 'warn'; cat = 'Límite (8-11) - Monitorizar'; }
        else { cls = 'ok'; cat = 'Normal (<8)'; }
        return {
            main: ag.toFixed(1) + ' mEq/L',
            label: 'Anion Gap (AG)',
            extras: [{ cls, txt: cat }],
            steps: ['AG = ' + na + ' - (' + cl + ' + ' + hco3 + ') = ' + ag.toFixed(1)],
            chart(canvas) { MedicinaVisual.anionGap(canvas, ag, na, cl, hco3); }
        };
    }
};
