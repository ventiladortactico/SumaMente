// Inicialización del objeto global de formularios para los módulos
window.FORMS = window.FORMS || {};

const DB={
  general:[],
  electro:[
    {name:'Vbe transistor',val:'0.7 V'},
    {name:'LED rojo',val:'2.0 V'},
    {name:'LED verde',val:'2.2 V'},
    {name:'LED azul',val:'3.3 V'},
    {name:'Vz 5V1',val:'5.1 V'},
    {name:'7805 out',val:'5.0 V'},
    {name:'E24 paso',val:'±2.5%'},
    {name:'ρ cobre',val:'0.0178 Ω·mm²/m'},
  ],
  med:[
    {name:'FC normal',val:'60-100 lpm'},
    {name:'TA normal',val:'120/80 mmHg'},
    {name:'Glucemia',val:'70-110 mg/dL'},
    {name:'SpO2 normal',val:'≥95%'},
    {name:'Goteo std',val:'20 gotas/mL'},
    {name:'Urea normal',val:'15-43 mg/dL'},
    {name:'PAM formula',val:'PAD + 1/3(PAS-PAD)'},
  ],
  fin:[
    {name:'UVA ref',val:'~$1,200'},
    {name:'IPC mensual',val:'~5-8%'},
    {name:'TNA prom',val:'~90-110%'},
    {name:'CFT est.',val:'TEA + 5%'},
  ],
  quim:[
    {name:'NaCl PM',val:'58.44 g/mol'},
    {name:'H₂O PM',val:'18.02 g/mol'},
    {name:'HCl PM',val:'36.46 g/mol'},
    {name:'NaOH PM',val:'40.00 g/mol'},
    {name:'H₂SO₄ PM',val:'98.08 g/mol'},
    {name:'Kw agua',val:'1×10⁻¹⁴'},
  ],
  civil:[
    {name:'ρ cobre',val:'0.0178 Ω·mm²/m'},
    {name:'Cemento bolsa',val:'50 kg'},
    {name:'Ladrillo 8cm',val:'400 ud/m³'},
    {name:'Concreto H21',val:'210 kg/cm²'},
  ],
  mec:[
    {name:'g',val:'9.81 m/s²'},
    {name:'ρ nafta',val:'0.75 kg/L'},
    {name:'ρ diesel',val:'0.84 kg/L'},
    {name:'π',val:'3.14159'},
  ],
  geom:[
    {name:'π',val:'3.14159'},
    {name:'φ (Aureo)',val:'1.618'},
    {name:'e',val:'2.718'},
  ],
  unit:[
    {name:'1 pulgada',val:'25.4 mm'},
    {name:'1 libra',val:'0.4536 kg'},
    {name:'1 galón',val:'3.785 L'},
    {name:'1 PSI',val:'0.0689 bar'},
  ],
  fis:[
    {name:'g',val:'9.81 m/s²'},
    {name:'c',val:'299,792 km/s'},
    {name:'G',val:'6.674e-11'},
    {name:'R (gases)',val:'0.08206'},
  ],
  diseno:[
    {name:'1 mm (300dpi)',val:'12 px'},
    {name:'1 cm (300dpi)',val:'118 px'},
    {name:'A4 (300dpi)',val:'2480x3508'},
    {name:'Bleed std',val:'3 mm'},
  ],
};

const MED_CONST = {
  ascvd: {
    wf: { lnAge: -29.799, lnAge2: 4.884, lnTC: 13.540, lnAgeTC: -3.114, lnHDL: -13.578, lnAgeHDL: 3.011, lnSBPT: 2.019, lnSBPTA: 0, lnSBPU: 1.957, lnSBPUA: 0, smoke: 7.574, lnAgeSmoke: -1.665, diab: 0.661, s0: 0.9665, mn: -29.18 },
    af: { lnAge: 17.114, lnAge2: 0, lnTC: 0.940, lnAgeTC: 0, lnHDL: -18.920, lnAgeHDL: 4.475, lnSBPT: 29.081, lnSBPTA: -6.087, lnSBPU: 28.552, lnSBPUA: -6.012, smoke: 0.691, lnAgeSmoke: 0, diab: 0.874, s0: 0.9533, mn: 86.61 },
    wm: { lnAge: 12.344, lnAge2: 0, lnTC: 11.853, lnAgeTC: -2.664, lnHDL: -7.990, lnAgeHDL: 1.769, lnSBPT: 1.797, lnSBPTA: 0, lnSBPU: 1.764, lnSBPUA: 0, smoke: 7.837, lnAgeSmoke: -1.795, diab: 0.658, s0: 0.9144, mn: 61.18 },
    am: { lnAge: 2.469, lnAge2: 0, lnTC: 0.302, lnAgeTC: 0, lnHDL: -0.307, lnAgeHDL: 0, lnSBPT: 1.916, lnSBPTA: 0, lnSBPU: 1.809, lnSBPUA: 0, smoke: 0.549, lnAgeSmoke: 0, diab: 0.645, s0: 0.8954, mn: 19.54 }
  },
  sofa: {
    resp: [400, 300, 200, 100],
    plat: [150, 100, 50, 20],
    bili: [1.2, 2.0, 6.0, 12.0],
    cv: [70],
    gcs: [15, 13, 10, 6],
    crea: [1.2, 2.0, 3.5, 5.0]
  }
};

const FIN_UTILS = {
  calcVPN(r, flows) { return flows.reduce((acc, f, t) => acc + f / Math.pow(1 + r, t), 0); },
  calcTIR(flows) {
    if (flows.length < 2) return null;
    let r = 0.1;
    for (let i = 0; i < 100; i++) {
      let vpn = 0, deriv = 0;
      for (let t = 0; t < flows.length; t++) {
        vpn += flows[t] / Math.pow(1 + r, t);
        if (t > 0) deriv -= t * flows[t] / Math.pow(1 + r, t + 1);
      }
      let nextR = r - vpn / deriv;
      if (Math.abs(nextR - r) < 1e-7) return nextR;
      r = nextR;
    }
    return null;
  }
};