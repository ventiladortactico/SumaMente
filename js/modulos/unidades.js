
FORMS.unit = {
 
    // ─── 1. LONGITUD ─────────────────────────────────────────────────────────
    longitud: {
        title: 'Conversión de longitud',
        formula: 'Base: metros',
        fields: [
            { id: 'val',   label: 'Valor', val: '1' },
            { id: 'desde', label: 'Desde', val: 'm', type: 'select', opts: [
                {v:'m',   l:'Metros (m)'},   {v:'cm',  l:'Centímetros (cm)'},
                {v:'mm',  l:'Milímetros (mm)'},{v:'km', l:'Kilómetros (km)'},
                {v:'in',  l:'Pulgadas (in)'}, {v:'ft',  l:'Pies (ft)'},
                {v:'yd',  l:'Yardas (yd)'},   {v:'mi',  l:'Millas (mi)'},
                {v:'nm',  l:'Millas náuticas'},{v:'um',  l:'Micrómetros (µm)'}
            ]}
        ],
        calc(f) {
            const toM = { m:1, cm:0.01, mm:0.001, km:1000, in:0.0254, ft:0.3048, yd:0.9144, mi:1609.344, nm:1852, um:1e-6 };
            let v = parseFloat(f.val.value);
            if (isNaN(v)) return null;
            let base = Math.abs(v) * toM[f.desde.value];
            if (isNaN(base)) return null;
            let extras = [
                { cls:'info', txt:`${(base).toFixed(6)} m` },
                { cls:'info', txt:`${(base*100).toFixed(4)} cm  |  ${(base*1000).toFixed(3)} mm` },
                { cls:'info', txt:`${(base/0.0254).toFixed(4)} in  |  ${(base/0.3048).toFixed(4)} ft  |  ${(base/0.9144).toFixed(4)} yd` },
                { cls:'info', txt:`${(base/1609.344).toFixed(6)} mi  |  ${(base/1852).toFixed(6)} nm` },
            ];
            return { main:`${base.toFixed(6)} m`, label:'Resultado en metros', extras, steps:[`Base metros: ${base.toFixed(8)}`], chart(cv) { UnidadesVisual.longitud(cv, base); } };
        }
    },
 
    // ─── 2. MASA ─────────────────────────────────────────────────────────────
    masa: {
        title: 'Conversión de masa',
        formula: 'Base: kilogramos',
        fields: [
            { id: 'val',   label: 'Valor', val: '1' },
            { id: 'desde', label: 'Unidad', val: 'kg', type: 'select', opts: [
                {v:'kg',  l:'Kilogramos (kg)'}, {v:'g',   l:'Gramos (g)'},
                {v:'mg',  l:'Miligramos (mg)'}, {v:'t',   l:'Tonelada métrica'},
                {v:'lb',  l:'Libras (lb)'},      {v:'oz',  l:'Onzas (oz)'},
                {v:'st',  l:'Stones (st)'},       {v:'gr',  l:'Granos (gr)'}
            ]}
        ],
        calc(f) {
            const toKg = { kg:1, g:0.001, mg:1e-6, t:1000, lb:0.453592, oz:0.0283495, st:6.35029, gr:0.0000648 };
            let v = parseFloat(f.val.value);
            if (isNaN(v)) return null;
            let kg = Math.abs(v) * toKg[f.desde.value];
            if (isNaN(kg)) return null;
            let extras = [
                { cls:'info', txt:`${kg.toFixed(4)} kg  |  ${(kg*1000).toFixed(2)} g  |  ${(kg*1e6).toFixed(0)} mg` },
                { cls:'info', txt:`${(kg/0.453592).toFixed(4)} lb  |  ${(kg/0.0283495).toFixed(3)} oz  |  ${(kg/6.35029).toFixed(4)} st` },
                { cls:'info', txt:`${(kg/1000).toFixed(6)} t (tonelada métrica)` },
            ];
            return { main:`${kg.toFixed(4)} kg`, label:'Masa en kilogramos', extras, steps:[`Base kg: ${kg.toFixed(8)}`], chart(cv) { UnidadesVisual.masa(cv, kg); } };
        }
    },
 
    // ─── 3. TEMPERATURA ──────────────────────────────────────────────────────
    temp: {
        title: 'Conversión de temperatura',
        formula: '°F = °C × 9/5 + 32  |  K = °C + 273.15',
        fields: [
            { id: 'val',   label: 'Valor', val: '25' },
            { id: 'desde', label: 'Unidad', val: 'c', type: 'select', opts: [
                {v:'c', l:'Celsius (°C)'}, {v:'f', l:'Fahrenheit (°F)'},
                {v:'k', l:'Kelvin (K)'},   {v:'r', l:'Rankine (°R)'}
            ]}
        ],
        calc(f) {
            let v = parseFloat(f.val.value), d = f.desde.value;
            if (isNaN(v)) return null;
            let c = d==='c' ? v : d==='f' ? (v-32)*5/9 : d==='k' ? v-273.15 : (v-491.67)*5/9;
            let fahr = c*9/5+32, kel = c+273.15, rank = kel*9/5;
 
            let cls = c < 0 ? 'info' : c < 37 ? 'ok' : c < 100 ? 'warn' : 'danger';
            let desc = c < 0 ? 'Bajo cero' : c < 20 ? 'Frío' : c < 30 ? 'Temperatura ambiente' : c < 37 ? 'Cálido' : c < 60 ? 'Caliente' : 'Muy caliente';
 
            return {
                main:  `${c.toFixed(2)} °C`,
                label: 'Resultado en Celsius',
                extras: [
                    { cls:'info', txt:`${fahr.toFixed(2)} °F  |  ${kel.toFixed(2)} K  |  ${rank.toFixed(2)} °R` },
                    { cls, txt:`Referencia: ${desc}` },
                    { cls:'info', txt:`Agua: congela a 0°C / 32°F | hierve a 100°C / 212°F` }
                ],
                steps: [`°C = ${c.toFixed(4)}`, `°F = ${fahr.toFixed(4)}`, `K = ${kel.toFixed(4)}`],
                chart(cv) { UnidadesVisual.temp(cv, c); }
            };
        }
    },
 
    // ─── 4. ÁREA Y VOLUMEN ───────────────────────────────────────────────────
    area_vol: {
        title: 'Área y volumen',
        formula: 'm² ↔ cm² ↔ ft²  |  m³ ↔ L ↔ cm³ ↔ gal',
        fields: [
            { id: 'val',   label: 'Valor', val: '1' },
            { id: 'desde', label: 'Desde', val: 'm2', type: 'select', opts: [
                {v:'m2',  l:'Metros² (m²)'},    {v:'cm2', l:'Centímetros² (cm²)'},
                {v:'mm2', l:'Milímetros² (mm²)'},{v:'km2', l:'Kilómetros² (km²)'},
                {v:'ft2', l:'Pies² (ft²)'},      {v:'in2', l:'Pulgadas² (in²)'},
                {v:'ha',  l:'Hectáreas (ha)'},   {v:'ac',  l:'Acres (ac)'},
                {v:'m3',  l:'Metros³ (m³)'},     {v:'cm3', l:'Centímetros³ (cm³)'},
                {v:'l',   l:'Litros (L)'},        {v:'ml',  l:'Mililitros (mL)'},
                {v:'gal', l:'Galones US (gal)'},  {v:'ft3', l:'Pies³ (ft³)'}
            ]}
        ],
        calc(f) {
            let v = parseFloat(f.val.value), d = f.desde.value;
            if (isNaN(v)) return null;
 
            const AREA = { m2:1, cm2:1e-4, mm2:1e-6, km2:1e6, ft2:0.092903, in2:0.000645, ha:10000, ac:4046.86 };
            const VOL  = { m3:1, cm3:1e-6, l:0.001, ml:1e-6, gal:0.00378541, ft3:0.0283168 };
 
            if (AREA[d] !== undefined) {
                let m2 = v * AREA[d];
                return {
                    main: `${m2.toFixed(6)} m²`,
                    label: 'Área en metros cuadrados',
                    extras: [
                        { cls:'info', txt:`${(m2*1e4).toFixed(2)} cm²  |  ${(m2*1e6).toFixed(0)} mm²` },
                        { cls:'info', txt:`${(m2/0.092903).toFixed(4)} ft²  |  ${(m2/0.000645).toFixed(2)} in²` },
                        { cls:'info', txt:`${(m2/10000).toFixed(6)} ha  |  ${(m2/4046.86).toFixed(6)} acres` },
                    ],
                    steps: [`m² base: ${m2.toFixed(8)}`],
                    chart(cv) { UnidadesVisual.area_vol(cv, m2, true); }
                };
            } else {
                let m3 = v * VOL[d];
                return {
                    main: `${m3.toFixed(6)} m³`,
                    label: 'Volumen en metros cúbicos',
                    extras: [
                        { cls:'info', txt:`${(m3*1000).toFixed(4)} L  |  ${(m3*1e6).toFixed(2)} mL / cm³` },
                        { cls:'info', txt:`${(m3/0.00378541).toFixed(4)} gal US  |  ${(m3/0.0283168).toFixed(4)} ft³` },
                        { cls:'info', txt:`${(m3*1000).toFixed(2)} kg de agua (densidad 1 kg/L)` },
                    ],
                    steps: [`m³ base: ${m3.toFixed(8)}`],
                    chart(cv) { UnidadesVisual.area_vol(cv, m3, false); }
                };
            }
        }
    },
 
    // ─── 5. PRESIÓN ──────────────────────────────────────────────────────────
    presion: {
        title: 'Conversión de presión',
        formula: 'Base: Pascal (Pa)',
        fields: [
            { id: 'val',   label: 'Valor', val: '1' },
            { id: 'desde', label: 'Desde', val: 'bar', type: 'select', opts: [
                {v:'pa',   l:'Pascal (Pa)'},     {v:'kpa',  l:'Kilopascal (kPa)'},
                {v:'mpa',  l:'Megapascal (MPa)'},{v:'bar',  l:'Bar'},
                {v:'mbar', l:'Milibar (mbar)'},  {v:'psi',  l:'PSI (lb/in²)'},
                {v:'atm',  l:'Atmósfera (atm)'}, {v:'mmhg', l:'mmHg / Torr'},
                {v:'inhg', l:'Pulgadas Hg (inHg)'}
            ]}
        ],
        calc(f) {
            const toPa = { pa:1, kpa:1000, mpa:1e6, bar:1e5, mbar:100, psi:6894.76, atm:101325, mmhg:133.322, inhg:3386.39 };
            let pa = parseFloat(f.val.value) * toPa[f.desde.value];
            if (isNaN(pa)) return null;
 
            let cls = pa > 500000 ? 'danger' : pa > 100000 ? 'warn' : 'ok';
            let ref = pa < 10000 ? 'Presión baja (vacío parcial)' : pa < 95000 ? 'Por debajo de la presión atmosférica' : pa < 110000 ? 'Presión atmosférica normal' : 'Presión por encima de la atmosférica';
 
            return {
                main: `${pa.toFixed(2)} Pa`,
                label: 'Presión en Pascal',
                extras: [
                    { cls:'info', txt:`${(pa/1000).toFixed(4)} kPa  |  ${(pa/1e5).toFixed(6)} bar  |  ${(pa/1e6).toFixed(8)} MPa` },
                    { cls:'info', txt:`${(pa/6894.76).toFixed(4)} PSI  |  ${(pa/101325).toFixed(6)} atm  |  ${(pa/133.322).toFixed(3)} mmHg` },
                    { cls, txt:`Referencia: ${ref}` }
                ],
                steps: [`Pa base: ${pa.toFixed(4)}`],
                chart(cv) { UnidadesVisual.presion(cv, pa); }
            };
        }
    },
 
    // ─── 6. VELOCIDAD ────────────────────────────────────────────────────────
    velocidad: {
        title: 'Conversión de velocidad',
        formula: 'Base: m/s',
        fields: [
            { id: 'val',   label: 'Valor', val: '100' },
            { id: 'desde', label: 'Desde', val: 'kmh', type: 'select', opts: [
                {v:'ms',   l:'Metros/segundo (m/s)'},
                {v:'kmh',  l:'Kilómetros/hora (km/h)'},
                {v:'mph',  l:'Millas/hora (mph)'},
                {v:'kt',   l:'Nudos (kn/kt)'},
                {v:'fts',  l:'Pies/segundo (ft/s)'},
                {v:'mach', l:'Mach (a nivel del mar)'}
            ]}
        ],
        calc(f) {
            const toMs = { ms:1, kmh:1/3.6, mph:0.44704, kt:0.514444, fts:0.3048, mach:340.29 };
            let ms = parseFloat(f.val.value) * toMs[f.desde.value];
            if (isNaN(ms)) return null;
 
            let cls = ms > 340 ? 'danger' : ms > 100 ? 'warn' : 'ok';
            let ref = ms < 0.5 ? 'Paso lento' : ms < 5 ? 'Paso humano / viento suave' : ms < 30 ? 'Vehículo urbano' : ms < 100 ? 'Autopista / avión comercial (aterrizaje)' : ms < 340 ? 'Avión subsónico' : 'Supersónico';
 
            return {
                main: `${ms.toFixed(4)} m/s`,
                label: 'Velocidad en metros por segundo',
                extras: [
                    { cls:'info', txt:`${(ms*3.6).toFixed(3)} km/h  |  ${(ms/0.44704).toFixed(3)} mph  |  ${(ms/0.514444).toFixed(3)} kn` },
                    { cls:'info', txt:`${(ms/0.3048).toFixed(3)} ft/s  |  Mach ${(ms/340.29).toFixed(4)}` },
                    { cls, txt:`Referencia: ${ref}` }
                ],
                steps: [`m/s base: ${ms.toFixed(6)}`],
                chart(cv) { UnidadesVisual.velocidad(cv, ms); }
            };
        }
    },
 
    // ─── 7. ENERGÍA / POTENCIA ───────────────────────────────────────────────
    energia: {
        title: 'Energía y potencia',
        formula: 'Base energía: Joule (J) | Base potencia: Watt (W)',
        fields: [
            { id: 'val',   label: 'Valor', val: '1' },
            { id: 'desde', label: 'Desde', val: 'j', type: 'select', opts: [
                // Energía
                {v:'j',    l:'Joule (J)'},        {v:'kj',   l:'Kilojoule (kJ)'},
                {v:'cal',  l:'Caloría (cal)'},     {v:'kcal', l:'Kilocaloría (kcal)'},
                {v:'kwh',  l:'kWh'},               {v:'ev',   l:'Electronvolt (eV)'},
                {v:'btu',  l:'BTU'},               {v:'ftlb', l:'Pie-libra fuerza'},
                // Potencia
                {v:'w',    l:'Watt (W)'},          {v:'kw',   l:'Kilowatt (kW)'},
                {v:'mw',   l:'Megawatt (MW)'},     {v:'hp',   l:'Caballo de vapor (HP)'},
                {v:'cv',   l:'Caballo vapor métrico (CV)'},
                {v:'btu_h',l:'BTU/hora'}
            ]}
        ],
        calc(f) {
            const ENERGIA_J = { j:1, kj:1000, cal:4.184, kcal:4184, kwh:3.6e6, ev:1.60218e-19, btu:1055.06, ftlb:1.35582 };
            const POTENCIA_W = { w:1, kw:1000, mw:1e6, hp:745.7, cv:735.499, btu_h:0.293071 };
 
            let v = parseFloat(f.val.value), d = f.desde.value;
            if (isNaN(v)) return null;
 
            if (ENERGIA_J[d] !== undefined) {
                let j = v * ENERGIA_J[d];
                return {
                    main: `${j.toFixed(4)} J`,
                    label: 'Energía en Joules',
                    extras: [
                        { cls:'info', txt:`${(j/1000).toFixed(4)} kJ  |  ${(j/4184).toFixed(4)} kcal  |  ${(j/4.184).toFixed(4)} cal` },
                        { cls:'info', txt:`${(j/3.6e6).toFixed(8)} kWh  |  ${(j/1055.06).toFixed(6)} BTU` },
                        { cls:'info', txt:`${(j/1.60218e-19).toExponential(4)} eV` }
                    ],
                    steps: [`J base: ${j.toFixed(6)}`],
                    chart(cv) { UnidadesVisual.energia(cv, j, true); }
                };
            } else {
                let w = v * POTENCIA_W[d];
                return {
                    main: `${w.toFixed(4)} W`,
                    label: 'Potencia en Watts',
                    extras: [
                        { cls:'info', txt:`${(w/1000).toFixed(4)} kW  |  ${(w/1e6).toFixed(8)} MW` },
                        { cls:'info', txt:`${(w/745.7).toFixed(4)} HP  |  ${(w/735.499).toFixed(4)} CV` },
                        { cls:'info', txt:`${(w/0.293071).toFixed(2)} BTU/h` }
                    ],
                    steps: [`W base: ${w.toFixed(6)}`],
                    chart(cv) { UnidadesVisual.energia(cv, w, false); }
                };
            }
        }
    },
 
    // ─── 8. ÁNGULOS ──────────────────────────────────────────────────────────
    angulos: {
        title: 'Conversión de ángulos',
        formula: 'rad = grados × π/180  |  grad = grados × 10/9',
        fields: [
            { id: 'val',   label: 'Valor', val: '90' },
            { id: 'desde', label: 'Desde', val: 'deg', type: 'select', opts: [
                {v:'deg',  l:'Grados (°)'},
                {v:'rad',  l:'Radianes (rad)'},
                {v:'grad', l:'Gradianes / gon'},
                {v:'turn', l:'Vueltas completas'},
                {v:'arcmin',l:'Minutos de arco (′)'},
                {v:'arcsec',l:'Segundos de arco (″)'}
            ]}
        ],
        calc(f) {
            const toDeg = { deg:1, rad:180/Math.PI, grad:0.9, turn:360, arcmin:1/60, arcsec:1/3600 };
            let deg = parseFloat(f.val.value) * toDeg[f.desde.value];
            if (isNaN(deg)) return null;
 
            let rad  = deg * Math.PI / 180;
            let grad = deg * 10/9;
            let turn = deg / 360;
 
            // Normalizar a 0–360
            let norm = ((deg % 360) + 360) % 360;
            let cuadrante = norm < 90 ? '1° cuadrante' : norm < 180 ? '2° cuadrante' : norm < 270 ? '3° cuadrante' : '4° cuadrante';
 
            return {
                main: `${deg.toFixed(6)} °`,
                label: 'Grados decimales',
                extras: [
                    { cls:'info', txt:`${rad.toFixed(6)} rad  |  ${grad.toFixed(4)} grad  |  ${turn.toFixed(6)} vueltas` },
                    { cls:'info', txt:`${Math.floor(deg)}° ${Math.floor((deg%1)*60)}′ ${((deg%1*60)%1*60).toFixed(1)}″ (DMS)` },
                    { cls:'info', txt:`sin(${deg.toFixed(1)}°) = ${Math.sin(rad).toFixed(6)}  |  cos = ${Math.cos(rad).toFixed(6)}  |  tan = ${Math.abs(Math.tan(rad)) > 1e6 ? '∞' : Math.tan(rad).toFixed(6)}` },
                    { cls:'ok',   txt:`${norm.toFixed(2)}° normalizado → ${cuadrante}` }
                ],
                steps: [`Grados: ${deg.toFixed(6)}`, `Rad: ${rad.toFixed(8)}`],
                chart(cv) { UnidadesVisual.angulos(cv, deg); }
            };
        }
    },
 
    // ─── 9. DATOS DIGITALES ──────────────────────────────────────────────────
    datos: {
        title: 'Datos digitales',
        formula: '1 byte = 8 bits  |  1 KB = 1024 bytes',
        fields: [
            { id: 'val',   label: 'Valor', val: '1' },
            { id: 'desde', label: 'Desde', val: 'gb', type: 'select', opts: [
                {v:'bit',  l:'Bit'},            {v:'byte', l:'Byte (B)'},
                {v:'kb',   l:'Kilobyte (KB)'},   {v:'mb',   l:'Megabyte (MB)'},
                {v:'gb',   l:'Gigabyte (GB)'},   {v:'tb',   l:'Terabyte (TB)'},
                {v:'pb',   l:'Petabyte (PB)'},
                {v:'kbit', l:'Kilobit (kbit)'},  {v:'mbit', l:'Megabit (Mbit)'},
                {v:'gbit', l:'Gigabit (Gbit)'}
            ]}
        ],
        calc(f) {
            const toByte = {
                bit:0.125, byte:1,
                kb:1024, mb:1024**2, gb:1024**3, tb:1024**4, pb:1024**5,
                kbit:125, mbit:125000, gbit:125000000
            };
            let bytes = parseFloat(f.val.value) * toByte[f.desde.value];
            if (isNaN(bytes)) return null;
 
            // Humanizar
            let units = ['B','KB','MB','GB','TB','PB'];
            let idx = 0, disp = bytes;
            while (disp >= 1024 && idx < units.length-1) { disp /= 1024; idx++; }
 
            return {
                main: `${disp.toFixed(3)} ${units[idx]}`,
                label: 'Tamaño normalizado',
                extras: [
                    { cls:'info', txt:`${bytes.toFixed(0)} bytes  |  ${(bytes*8).toFixed(0)} bits` },
                    { cls:'info', txt:`${(bytes/1024).toFixed(4)} KB  |  ${(bytes/1024**2).toFixed(4)} MB  |  ${(bytes/1024**3).toFixed(6)} GB` },
                    { cls:'info', txt:`Velocidad de transferencia referencia: ${(bytes*8/1e6).toFixed(2)} Mbit` }
                ],
                steps: [`Bytes base: ${bytes.toFixed(0)}`],
                chart(cv) { UnidadesVisual.datos(cv, bytes); }
            };
        }
    },
 
    // ─── 10. FLUJO VOLUMÉTRICO ────────────────────────────────────────────────
    flujo: {
        title: 'Flujo volumétrico',
        formula: 'Base: m³/s',
        fields: [
            { id: 'val',   label: 'Valor', val: '10' },
            { id: 'desde', label: 'Desde', val: 'lmin', type: 'select', opts: [
                {v:'m3s',  l:'m³/s'},
                {v:'m3h',  l:'m³/hora'},
                {v:'lmin', l:'Litros/minuto (L/min)'},
                {v:'lh',   l:'Litros/hora (L/h)'},
                {v:'ls',   l:'Litros/segundo (L/s)'},
                {v:'gpm',  l:'Galones/minuto US (GPM)'},
                {v:'gph',  l:'Galones/hora US (GPH)'},
                {v:'cfm',  l:'Pies³/minuto (CFM)'},
                {v:'cfs',  l:'Pies³/segundo (CFS)'}
            ]}
        ],
        calc(f) {
            const toM3s = {
                m3s:1, m3h:1/3600, lmin:1/60000, lh:1/3600000,
                ls:0.001, gpm:6.30902e-5, gph:1.04167e-6,
                cfm:4.71947e-4, cfs:0.0283168
            };
            let m3s = parseFloat(f.val.value) * toM3s[f.desde.value];
            if (isNaN(m3s)) return null;
 
            return {
                main: `${m3s.toFixed(6)} m³/s`,
                label: 'Flujo en metros cúbicos por segundo',
                extras: [
                    { cls:'info', txt:`${(m3s*1000).toFixed(4)} L/s  |  ${(m3s*60000).toFixed(3)} L/min  |  ${(m3s*3600000).toFixed(2)} L/h` },
                    { cls:'info', txt:`${(m3s*3600).toFixed(4)} m³/h  |  ${(m3s/6.30902e-5).toFixed(3)} GPM  |  ${(m3s/4.71947e-4).toFixed(3)} CFM` },
                    { cls:'ok',   txt:`Peso del flujo (agua): ${(m3s*1000).toFixed(4)} kg/s = ${(m3s*3600).toFixed(2)} t/h` }
                ],
                steps: [`m³/s base: ${m3s.toFixed(8)}`],
                chart(cv) { UnidadesVisual.flujo(cv, m3s); }
            };
        }
    },

    // ─── 11. TIEMPO ──────────────────────────────────────────────────────
    tiempo: {
        title: 'Conversor de tiempo',
        formula: 'h, min, s',
        fields: [
            { id: 'val', label: 'Valor', val: '3600' },
            { id: 'desde', label: 'Desde', val: 'h', type: 'select', opts: [
                {v:'h', l:'Horas (h)'},
                {v:'min', l:'Minutos (min)'},
                {v:'s', l:'Segundos (s)'}
            ]},
            { id: 'hasta', label: 'Hasta', val: 'min', type: 'select', opts: [
                {v:'h', l:'Horas (h)'},
                {v:'min', l:'Minutos (min)'},
                {v:'s', l:'Segundos (s)'}
            ]}
        ],
        calc(f) {
            const toS = { h:3600, min:60, s:1 };
            let v = parseFloat(f.val.value);
            if (isNaN(v)) return null;
            let base = Math.abs(v) * toS[f.desde.value];
            if (isNaN(base)) return null;
            let result = base / toS[f.hasta.value];
            return {
                main: `${result.toFixed(6)} ${f.hasta.value}`,
                label: 'Resultado',
                extras: [
                    { cls:'info', txt:`${base.toFixed(2)} s  |  ${(base/60).toFixed(4)} min  |  ${(base/3600).toFixed(6)} h` }
                ],
                steps: [`Base segundos: ${base.toFixed(4)}`],
                chart(cv) { UnidadesVisual.tiempo(cv, base); }
            };
        }
    },

    // ─── 12. DENSIDAD ────────────────────────────────────────────────────
    densidad: {
        title: 'Conversor de densidad',
        formula: 'kg/m³ ↔ g/cm³',
        fields: [
            { id: 'val', label: 'Valor', val: '1' },
            { id: 'desde', label: 'Desde', val: 'kgm3', type: 'select', opts: [
                {v:'kgm3', l:'kg/m³'},
                {v:'gcm3', l:'g/cm³'}
            ]},
            { id: 'hasta', label: 'Hasta', val: 'gcm3', type: 'select', opts: [
                {v:'kgm3', l:'kg/m³'},
                {v:'gcm3', l:'g/cm³'}
            ]}
        ],
        calc(f) {
            const toBase = { kgm3:1, gcm3:1000 };
            let v = parseFloat(f.val.value);
            if (isNaN(v)) return null;
            let base = Math.abs(v) * toBase[f.desde.value];
            if (isNaN(base)) return null;
            let result = base / toBase[f.hasta.value];
            return {
                main: `${result.toFixed(6)} ${f.hasta.value}`,
                label: 'Resultado',
                extras: [
                    { cls:'info', txt:`${base.toFixed(4)} kg/m³  |  ${(base/1000).toFixed(6)} g/cm³` }
                ],
                steps: [`Base kg/m³: ${base.toFixed(4)}`],
                chart(cv) { UnidadesVisual.densidad(cv, base); }
            };
        }
    },

    // ─── 13. FRECUENCIA ──────────────────────────────────────────────────
    frecuencia_hz: {
        title: 'Conversor de frecuencia',
        formula: 'Hz, RPM, kHz',
        fields: [
            { id: 'val', label: 'Valor', val: '60' },
            { id: 'desde', label: 'Desde', val: 'rpm', type: 'select', opts: [
                {v:'hz', l:'Hertz (Hz)'},
                {v:'rpm', l:'RPM'},
                {v:'khz', l:'Kilohertz (kHz)'}
            ]},
            { id: 'hasta', label: 'Hasta', val: 'hz', type: 'select', opts: [
                {v:'hz', l:'Hertz (Hz)'},
                {v:'rpm', l:'RPM'},
                {v:'khz', l:'Kilohertz (kHz)'}
            ]}
        ],
        calc(f) {
            const toHz = { hz:1, rpm:1/60, khz:1000 };
            let v = parseFloat(f.val.value);
            if (isNaN(v)) return null;
            let base = Math.abs(v) * toHz[f.desde.value];
            if (isNaN(base)) return null;
            let result = base / toHz[f.hasta.value];
            return {
                main: `${result.toFixed(6)} ${f.hasta.value}`,
                label: 'Resultado',
                extras: [
                    { cls:'info', txt:`${base.toFixed(4)} Hz  |  ${(base*60).toFixed(4)} RPM  |  ${(base/1000).toFixed(6)} kHz` }
                ],
                steps: [`Base Hz: ${base.toFixed(4)}`],
                chart(cv) { UnidadesVisual.frecuencia_hz(cv, base); }
            };
        }
    },

    // ─── 14. FUERZA ──────────────────────────────────────────────────────
    fuerza_newton: {
        title: 'Conversor de fuerza',
        formula: 'N, kgf, dyn, lbf',
        fields: [
            { id: 'val', label: 'Valor', val: '1' },
            { id: 'desde', label: 'Desde', val: 'n', type: 'select', opts: [
                {v:'n', l:'Newton (N)'},
                {v:'kgf', l:'Kilogramo-fuerza (kgf)'},
                {v:'dyn', l:'Dina (dyn)'},
                {v:'lbf', l:'Libra-fuerza (lbf)'}
            ]},
            { id: 'hasta', label: 'Hasta', val: 'kgf', type: 'select', opts: [
                {v:'n', l:'Newton (N)'},
                {v:'kgf', l:'Kilogramo-fuerza (kgf)'},
                {v:'dyn', l:'Dina (dyn)'},
                {v:'lbf', l:'Libra-fuerza (lbf)'}
            ]}
        ],
        calc(f) {
            const toN = { n:1, kgf:9.80665, dyn:1e-5, lbf:4.44822 };
            let v = parseFloat(f.val.value);
            if (isNaN(v)) return null;
            let base = Math.abs(v) * toN[f.desde.value];
            if (isNaN(base)) return null;
            let result = base / toN[f.hasta.value];
            return {
                main: `${result.toFixed(6)} ${f.hasta.value}`,
                label: 'Resultado',
                extras: [
                    { cls:'info', txt:`${base.toFixed(4)} N  |  ${(base/9.80665).toFixed(6)} kgf  |  ${(base/4.44822).toFixed(6)} lbf  |  ${(base/1e-5).toFixed(2)} dyn` }
                ],
                steps: [`Base N: ${base.toFixed(4)}`],
                chart(cv) { UnidadesVisual.fuerza_newton(cv, base); }
            };
        }
    },

    // ─── 15. CARGA ELÉCTRICA ─────────────────────────────────────────────
    carga_electrica: {
        title: 'Conversor de carga eléctrica',
        formula: 'C, mAh, Ah',
        fields: [
            { id: 'val', label: 'Valor', val: '1' },
            { id: 'desde', label: 'Desde', val: 'c', type: 'select', opts: [
                {v:'c', l:'Coulomb (C)'},
                {v:'mah', l:'Miliamperio-hora (mAh)'},
                {v:'ah', l:'Amperio-hora (Ah)'}
            ]},
            { id: 'hasta', label: 'Hasta', val: 'mah', type: 'select', opts: [
                {v:'c', l:'Coulomb (C)'},
                {v:'mah', l:'Miliamperio-hora (mAh)'},
                {v:'ah', l:'Amperio-hora (Ah)'}
            ]}
        ],
        calc(f) {
            const toC = { c:1, mah:3.6, ah:3600 };
            let v = parseFloat(f.val.value);
            if (isNaN(v)) return null;
            let base = Math.abs(v) * toC[f.desde.value];
            if (isNaN(base)) return null;
            let result = base / toC[f.hasta.value];
            return {
                main: `${result.toFixed(6)} ${f.hasta.value}`,
                label: 'Resultado',
                extras: [
                    { cls:'info', txt:`${base.toFixed(4)} C  |  ${(base/3.6).toFixed(4)} mAh  |  ${(base/3600).toFixed(6)} Ah` }
                ],
                steps: [`Base C: ${base.toFixed(4)}`],
                chart(cv) { UnidadesVisual.carga_electrica(cv, base); }
            };
        }
    },

    // ─── 16. TORQUE ──────────────────────────────────────────────────────
    torque: {
        title: 'Conversor de torque',
        formula: 'N·m ↔ lb·ft',
        fields: [
            { id: 'val', label: 'Valor', val: '1' },
            { id: 'desde', label: 'Desde', val: 'nm', type: 'select', opts: [
                {v:'nm', l:'Newton-metro (N·m)'},
                {v:'lbft', l:'Libra-pie (lb·ft)'}
            ]},
            { id: 'hasta', label: 'Hasta', val: 'lbft', type: 'select', opts: [
                {v:'nm', l:'Newton-metro (N·m)'},
                {v:'lbft', l:'Libra-pie (lb·ft)'}
            ]}
        ],
        calc(f) {
            const toNm = { nm:1, lbft:1.35582 };
            let v = parseFloat(f.val.value);
            if (isNaN(v)) return null;
            let base = Math.abs(v) * toNm[f.desde.value];
            if (isNaN(base)) return null;
            let result = base / toNm[f.hasta.value];
            return {
                main: `${result.toFixed(6)} ${f.hasta.value}`,
                label: 'Resultado',
                extras: [
                    { cls:'info', txt:`${base.toFixed(4)} N·m  |  ${(base/1.35582).toFixed(4)} lb·ft` }
                ],
                steps: [`Base N·m: ${base.toFixed(4)}`],
                chart(cv) { UnidadesVisual.torque(cv, base); }
            };
        }
    },

    // ─── 17. FLOPS (POTENCIA INFORMÁTICA) ─────────────────────────────────
    flops: {
        title: 'Potencia informática (FLOPS)',
        formula: 'FLOPS, kFLOPS, MFLOPS, GFLOPS, TFLOPS, PFLOPS',
        fields: [
            { id: 'val', label: 'Valor', val: '1' },
            { id: 'desde', label: 'Desde', val: 'gflops', type: 'select', opts: [
                {v:'flops', l:'FLOPS'},
                {v:'kflops', l:'kFLOPS (10³)'},
                {v:'mflops', l:'MFLOPS (10⁶)'},
                {v:'gflops', l:'GFLOPS (10⁹)'},
                {v:'tflops', l:'TFLOPS (10¹²)'},
                {v:'pflops', l:'PFLOPS (10¹⁵)'}
            ]}
        ],
        calc(f) {
            const toFlops = { flops:1, kflops:1e3, mflops:1e6, gflops:1e9, tflops:1e12, pflops:1e15 };
            let v = parseFloat(f.val.value);
            if (isNaN(v)) return null;
            let base = Math.abs(v) * toFlops[f.desde.value];
            if (isNaN(base)) return null;

            let units = ['FLOPS','kFLOPS','MFLOPS','GFLOPS','TFLOPS','PFLOPS'];
            let idx = 0, disp = base;
            while (disp >= 1000 && idx < units.length - 1) { disp /= 1000; idx++; }

            return {
                main: `${disp.toFixed(3)} ${units[idx]}`,
                label: 'Rendimiento normalizado',
                extras: [
                    { cls:'info', txt:`${base.toFixed(0)} FLOPS` },
                    { cls:'info', txt:`${(base/1e9).toFixed(4)} GFLOPS  |  ${(base/1e12).toFixed(6)} TFLOPS` },
                    { cls:'info', txt:`Equivale aprox. a ${(base/1e9*0.5).toFixed(2)} CPUs x86 modernas (est.)` }
                ],
                steps: [`Base FLOPS: ${base.toFixed(0)}`],
                chart(cv) { UnidadesVisual.flops(cv, base); }
            };
        }
    },

    // ─── 18. VISCOSIDAD ──────────────────────────────────────────────────
    viscosidad: {
        title: 'Conversor de viscosidad',
        formula: 'Poise (P), Stokes (St)',
        fields: [
            { id: 'val', label: 'Valor', val: '1' },
            { id: 'desde', label: 'Desde', val: 'poise', type: 'select', opts: [
                {v:'poise', l:'Poise (P)'},
                {v:'cpoise', l:'Centipoise (cP)'},
                {v:'stokes', l:'Stokes (St)'},
                {v:'cstokes', l:'Centistokes (cSt)'}
            ]},
            { id: 'hasta', label: 'Hasta', val: 'cpoise', type: 'select', opts: [
                {v:'poise', l:'Poise (P)'},
                {v:'cpoise', l:'Centipoise (cP)'},
                {v:'stokes', l:'Stokes (St)'},
                {v:'cstokes', l:'Centistokes (cSt)'}
            ]}
        ],
        calc(f) {
            const toPoise = { poise:1, cpoise:0.01, stokes:1, cstokes:0.01 };
            let v = parseFloat(f.val.value);
            if (isNaN(v)) return null;
            let base = Math.abs(v) * toPoise[f.desde.value];
            if (isNaN(base)) return null;
            let result = base / toPoise[f.hasta.value];

            let ref = base < 0.01 ? 'Muy fluido (gas)' : base < 1 ? 'Fluido ligero (agua: ~1 cP)' : base < 10 ? 'Líquido moderado' : 'Viscoso (miel: ~2000 cP)';

            return {
                main: `${result.toFixed(6)} ${f.hasta.value}`,
                label: 'Resultado',
                extras: [
                    { cls:'info', txt:`${base.toFixed(4)} P  |  ${(base*100).toFixed(2)} cP` },
                    { cls: base < 0.01 ? 'ok' : base < 10 ? 'info' : 'warn', txt:`Referencia: ${ref}` }
                ],
                steps: [`Base Poise: ${base.toFixed(4)}`],
                chart(cv) { UnidadesVisual.viscosidad(cv, base); }
            };
        }
    },

    // ─── 19. CONDUCTIVIDAD ELÉCTRICA ──────────────────────────────────────
    conductividad: {
        title: 'Conductividad eléctrica',
        formula: 'S/m, mS/cm, µS/cm',
        fields: [
            { id: 'val', label: 'Valor', val: '1' },
            { id: 'desde', label: 'Desde', val: 'sm', type: 'select', opts: [
                {v:'sm', l:'Siemens/metro (S/m)'},
                {v:'mscm', l:'mS/cm'},
                {v:'uscm', l:'µS/cm'}
            ]},
            { id: 'hasta', label: 'Hasta', val: 'uscm', type: 'select', opts: [
                {v:'sm', l:'Siemens/metro (S/m)'},
                {v:'mscm', l:'mS/cm'},
                {v:'uscm', l:'µS/cm'}
            ]}
        ],
        calc(f) {
            const toSm = { sm:1, mscm:0.1, uscm:0.0001 };
            let v = parseFloat(f.val.value);
            if (isNaN(v)) return null;
            let base = Math.abs(v) * toSm[f.desde.value];
            if (isNaN(base)) return null;
            let result = base / toSm[f.hasta.value];

            let ref = base < 1e-6 ? 'Aislante' : base < 0.01 ? 'Agua pura' : base < 1 ? 'Agua dulce' : base < 10 ? 'Agua de mar (~5 S/m)' : 'Conductor';

            return {
                main: `${result.toFixed(6)} ${f.hasta.value}`,
                label: 'Resultado',
                extras: [
                    { cls:'info', txt:`${base.toFixed(6)} S/m  |  ${(base*10).toFixed(4)} mS/cm  |  ${(base*10000).toFixed(2)} µS/cm` },
                    { cls: base < 1e-6 ? 'warn' : 'info', txt:`Referencia: ${ref}` }
                ],
                steps: [`Base S/m: ${base.toFixed(6)}`],
                chart(cv) { UnidadesVisual.conductividad(cv, base); }
            };
        }
    },

    // ─── 20. ILUMINANCIA ──────────────────────────────────────────────────
    iluminancia: {
        title: 'Conversor de iluminancia',
        formula: 'Lux (lm/m²), Foot-candle (fc)',
        fields: [
            { id: 'val', label: 'Valor', val: '1' },
            { id: 'desde', label: 'Desde', val: 'lux', type: 'select', opts: [
                {v:'lux', l:'Lux (lm/m²)'},
                {v:'fc', l:'Foot-candle (fc)'}
            ]},
            { id: 'hasta', label: 'Hasta', val: 'fc', type: 'select', opts: [
                {v:'lux', l:'Lux (lm/m²)'},
                {v:'fc', l:'Foot-candle (fc)'}
            ]}
        ],
        calc(f) {
            const toLux = { lux:1, fc:10.7639 };
            let v = parseFloat(f.val.value);
            if (isNaN(v)) return null;
            let base = Math.abs(v) * toLux[f.desde.value];
            if (isNaN(base)) return null;
            let result = base / toLux[f.hasta.value];

            let ref = base < 1 ? 'Noche sin luna' : base < 50 ? 'Sala oscura' : base < 200 ? 'Hogar' : base < 500 ? 'Oficina' : base < 1000 ? 'Supermercado' : 'Plena luz solar';

            return {
                main: `${result.toFixed(6)} ${f.hasta.value}`,
                label: 'Resultado',
                extras: [
                    { cls:'info', txt:`${base.toFixed(4)} lux (lm/m²)  |  ${(base/10.7639).toFixed(4)} fc` },
                    { cls:'info', txt:`Referencia: ${ref}` }
                ],
                steps: [`Base lux: ${base.toFixed(4)}`],
                chart(cv) { UnidadesVisual.iluminancia(cv, base); }
            };
        }
    }
};