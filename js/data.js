// Inicialización del objeto global de formularios para los módulos
window.FORMS = window.FORMS || {};

const DB={
  general:[
    {name:'Velocidad luz (c)',val:'3×10⁸ m/s'},
    {name:'Constante Planck (h)',val:'6.626×10⁻³⁴ J·s'},
    {name:'Constante gravitación (G)',val:'6.674×10⁻¹¹ N·m²/kg²'},
    {name:'Número Avogadro (NA)',val:'6.022×10²³ mol⁻¹'},
    {name:'Carga elemental (e)',val:'1.602×10⁻¹⁹ C'},
    {name:'Constante gas ideal (R)',val:'8.314 J/(mol·K)'},
    {name:'Presión atmósfera (1 atm)',val:'101325 Pa'},
    {name:'Gravedad terrestre (g)',val:'9.807 m/s²'},
    {name:'π (pi)',val:'3.1415926535'},
    {name:'e (Euler)',val:'2.7182818284'},
  ],
  acust:[
    {name:'Velocidad sonido (20°C)',val:'343 m/s'},
    {name:'Umbral audición (0 dB SPL)',val:'2×10⁻⁵ Pa'},
    {name:'RT60 sala promedio',val:'0.6-1.0 s'},
    {name:'SPL umbral dolor',val:'~120 dB'},
    {name:'Frecuencia LA4',val:'440 Hz'},
  ],
  estad:[
    {name:'Media aritmética',val:'Σx/n'},
    {name:'Desviación estándar',val:'σ = √(Σ(x-μ)²/n)'},
    {name:'Z 95% confianza',val:'1.96'},
    {name:'Coef. Pearson (r)',val:'-1 a 1'},
    {name:'Combinatoria C(n,k)',val:'n!/(k!(n-k)!)'},
  ],
  nutri:[
    {name:'TMB Harris-Benedict',val:'~10·P+6.25·A-5·E'},
    {name:'IMC normal',val:'18.5-24.9'},
    {name:'FC máxima',val:'220 - edad'},
    {name:'Agua diaria',val:'~35 mL/kg'},
    {name:'Proteína diaria',val:'0.8-2.2 g/kg'},
  ],
  prog:[
    {name:'ASCII A-Z',val:'65-90'},
    {name:'ASCII a-z',val:'97-122'},
    {name:'8 bits (1 byte)',val:'0-255'},
    {name:'IPv4 máscara',val:'32 bits'},
    {name:'César k=3 clásico',val:'ROT3'},
  ],
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
  redes:[
    {name:'Máscara /24',val:'255.255.255.0'},
    {name:'Máscara /16',val:'255.255.0.0'},
    {name:'Máscara /8',val:'255.0.0.0'},
    {name:'1000BASE-T máx',val:'100 m'},
    {name:'Fast Ethernet',val:'100 Mbps'},
    {name:'GigE estándar',val:'1000 Mbps'},
    {name:'PoE (af) W',val:'15.4 W'},
    {name:'PoE+ (at) W',val:'30 W'},
    {name:'UDP header',val:'8 bytes'},
    {name:'TCP header',val:'20-60 bytes'},
    {name:'MTU Ethernet',val:'1500 bytes'},
    {name:'RTT típico fibra',val:'~5 ms'},
    {name:'RTT típico RF',val:'~30 ms'},
    {name:'802.11n máx',val:'600 Mbps'},
    {name:'802.11ac máx',val:'~1.3 Gbps'},
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