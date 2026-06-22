FORMS.redes = {};

function ipv4ToNum(ip) {
    const parts = ip.split('.').map(Number);
    return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}
function numToIpv4(n) {
    return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
}
function cidrToMask(bits) {
    const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
    return numToIpv4(mask);
}
function parseCIDR(cidr) {
    const [ip, bits] = cidr.split('/');
    return { ip: ip.trim(), bits: parseInt(bits) };
}

FORMS.redes.subred = {
    title: 'Subred IPv4 (CIDR)',
    formula: 'Red, Broadcast, Hosts por CIDR',
    fields: [
        { id: 'cidr', label: 'Dirección CIDR (ej: 192.168.1.0/24)', val: '192.168.1.0/24' }
    ],
    calc(f) {
        try {
            const { ip, bits } = parseCIDR(f.cidr.value);
            const num = ipv4ToNum(ip);
            const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
            const net = (num & mask) >>> 0;
            const bcast = (net | (~mask >>> 0)) >>> 0;
            const hosts = bits >= 31 ? (bits === 31 ? 2 : 0) : (1 << (32 - bits)) - 2;
            const first = bits >= 31 ? net : net + 1;
            const last = bits >= 31 ? bcast : bcast - 1;
            return {
                main: `${numToIpv4(net)} / ${bits}`,
                label: 'Dirección de Red',
                extras: [
                    { cls: 'info', txt: `Broadcast: ${numToIpv4(bcast)}` },
                    { cls: 'ok', txt: `Primera IP: ${numToIpv4(first)}` },
                    { cls: 'ok', txt: `Última IP: ${numToIpv4(last)}` },
                    { cls: 'warn', txt: `Hosts utilizables: ${hosts}` }
                ],
                steps: [
                    `IP: ${ip} → ${num} (decimal)`,
                    `Máscara: /${bits} → ${numToIpv4(mask)}`,
                    `Red: ${num} & ${mask >>> 0} = ${net} → ${numToIpv4(net)}`,
                    `Broadcast: ${net} | ${(~mask >>> 0)} = ${bcast} → ${numToIpv4(bcast)}`
                ],
                chart(canvas) { RedesVisual.subred(canvas, ip, bits, net, bcast, hosts); }
            };
        } catch(e) { return null; }
    }
};

FORMS.redes.hosts = {
    title: 'Hosts por Subred',
    formula: 'Hosts = 2^(32-bits) - 2',
    fields: [
        { id: 'bits', label: 'Máscara CIDR (/n)', type: 'select', opts: [
            {v:'8',l:'/8 — 255.0.0.0'},{v:'16',l:'/16 — 255.255.0.0'},{v:'24',l:'/24 — 255.255.255.0'},
            {v:'25',l:'/25'},{v:'26',l:'/26'},{v:'27',l:'/27'},{v:'28',l:'/28'},{v:'29',l:'/29'},{v:'30',l:'/30'},
            {v:'31',l:'/31 — P2P'},{v:'32',l:'/32 — Host único'}
        ]}
    ],
    calc(f) {
        const bits = parseInt(f.bits.value);
        const hosts = bits >= 31 ? (bits === 31 ? 2 : 1) : (1 << (32 - bits)) - 2;
        return {
            main: `${hosts} hosts`,
            label: `Máscara /${bits}`,
            extras: [{ cls: 'info', txt: `Fórmula: 2^(32-${bits}) - 2 = ${hosts}` }],
            chart(canvas) { RedesVisual.hosts(canvas, bits, hosts); }
        };
    }
};

FORMS.redes.cidr = {
    title: 'Máscara ↔ CIDR',
    formula: 'Conversión bidireccional',
    fields: [
        { id: 'tipo', label: 'Tipo', type: 'select', opts: [
            {v:'mask2cidr',l:'Máscara → /n'},{v:'cidr2mask',l:'/n → Máscara'}
        ]},
        { id: 'val', label: 'Valor', val: '255.255.255.0' }
    ],
    calc(f) {
        if (f.tipo.value === 'mask2cidr') {
            const parts = f.val.value.split('.').map(Number);
            const bin = parts.map(p => p.toString(2).padStart(8, '0')).join('');
            const bits = bin.split('').filter(c => c === '1').length;
            const mask = ipv4ToNum(f.val.value);
            const wild = (~mask >>> 0);
            return {
                main: `/${bits}`,
                label: 'CIDR',
                extras: [
                    { cls: 'info', txt: `Wildcard: ${numToIpv4(wild)}` },
                    { cls: 'ok', txt: `Binario: ${parts.map(p => p.toString(2).padStart(8,'0')).join('.')}` }
                ],
                chart(canvas) { RedesVisual.cidr(canvas, f.val.value, bits); }
            };
        } else {
            const bits = parseInt(f.val.value);
            const mask = cidrToMask(bits);
            const wild = (~(mask)) >>> 0;
            return {
                main: numToIpv4(mask),
                label: 'Máscara de Red',
                extras: [{ cls: 'info', txt: `Wildcard: ${numToIpv4(wild)}` }],
                chart(canvas) { RedesVisual.cidr(canvas, numToIpv4(mask), bits); }
            };
        }
    }
};

FORMS.redes.broadcast = {
    title: 'Dirección Broadcast',
    formula: 'Broadcast = Red | ~Máscara',
    fields: [
        { id: 'cidr', label: 'Dirección CIDR', val: '192.168.1.0/24' }
    ],
    calc(f) {
        try {
            const { ip, bits } = parseCIDR(f.cidr.value);
            const num = ipv4ToNum(ip);
            const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
            const net = (num & mask) >>> 0;
            const bcast = (net | (~mask >>> 0)) >>> 0;
            return {
                main: numToIpv4(bcast),
                label: 'Broadcast',
                steps: [`Red: ${numToIpv4(net)}`, `Máscara: ${numToIpv4(mask)}`, `~Máscara: ${numToIpv4((~mask)>>>0)}`, `Broadcast: ${numToIpv4(net)} | ${numToIpv4((~mask)>>>0)} = ${numToIpv4(bcast)}`],
                chart(canvas) { RedesVisual.broadcast(canvas, ip, bits, bcast); }
            };
        } catch(e) { return null; }
    }
};

FORMS.redes.network = {
    title: 'Dirección de Red',
    formula: 'Red = IP & Máscara',
    fields: [
        { id: 'ip', label: 'Dirección IP', val: '192.168.1.75' },
        { id: 'cidr', label: 'CIDR', type: 'select', opts: [
            {v:'8',l:'/8'},{v:'16',l:'/16'},{v:'24',l:'/24'},{v:'25',l:'/25'},{v:'26',l:'/26'},{v:'27',l:'/27'},{v:'28',l:'/28'},{v:'29',l:'/29'},{v:'30',l:'/30'},{v:'31',l:'/31'},{v:'32',l:'/32'}
        ]}
    ],
    calc(f) {
        try {
            const num = ipv4ToNum(f.ip.value);
            const bits = parseInt(f.cidr.value);
            const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
            const net = (num & mask) >>> 0;
            return {
                main: numToIpv4(net),
                label: 'Dirección de Red',
                extras: [{ cls: 'info', txt: `${f.ip.value} AND ${numToIpv4(mask)} = ${numToIpv4(net)}` }],
                chart(canvas) { RedesVisual.network(canvas, f.ip.value, numToIpv4(mask), numToIpv4(net)); }
            };
        } catch(e) { return null; }
    }
};

FORMS.redes.vlsm = {
    title: 'VLSM (Subneteo Variable)',
    formula: 'División de red por hosts requeridos',
    fields: [
        { id: 'red', label: 'Red base (CIDR)', val: '192.168.0.0/24' },
        { id: 'reqs', label: 'Hosts por depto (separados por coma)', val: '50,20,10' },
        { id: 'nombres', label: 'Nombres (opcional, separados por coma)', val: 'Depto A,Depto B,Depto C' }
    ],
    calc(f) {
        try {
            const { ip, bits: redBits } = parseCIDR(f.red.value);
            const reqs = f.reqs.value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n > 0);
            const names = f.nombres.value ? f.nombres.value.split(',').map(s => s.trim()) : [];
            const sorted = reqs.map((r, i) => ({ req: r, idx: i })).sort((a, b) => b.req - a.req);
            let current = ipv4ToNum(ip);
            const results = [];
            let steps = [`Red base: ${f.red.value} = ${numToIpv4(current)}`];
            for (const item of sorted) {
                const needed = item.req + 2;
                let bitsNeeded = Math.ceil(Math.log2(needed));
                if (bitsNeeded < 2) bitsNeeded = 2;
                const maskBits = 32 - bitsNeeded;
                const size = 1 << bitsNeeded;
                const name = names[item.idx] || `Depto ${String.fromCharCode(65 + item.idx)}`;
                results.push({ name, req: item.req, net: current, bits: maskBits, size, idx: item.idx });
                steps.push(`${name}: ${item.req} hosts → /${maskBits} (${size} IPs) → ${numToIpv4(current)}`);
                current += size;
            }
            const table = results.map(r => `${r.name}: ${numToIpv4(r.net)}/${r.bits} (${r.req} hosts)`).join(' | ');
            return {
                main: results.map(r => `${r.name}: ${numToIpv4(r.net)}/${r.bits}`).join(' · '),
                label: 'Subredes VLSM',
                extras: results.map(r => ({ cls: 'ok', txt: `${r.name}: ${numToIpv4(r.net)}/${r.bits} — ${r.req} hosts` })),
                steps,
                chart(canvas) { RedesVisual.vlsm(canvas, results, ip, redBits); }
            };
        } catch(e) { return null; }
    }
};

FORMS.redes.ipv6 = {
    title: 'IPv6 Básico',
    formula: 'Análisis de dirección IPv6',
    fields: [
        { id: 'dir', label: 'Dirección IPv6', val: '2001:db8::1' },
        { id: 'prefijo', label: 'Prefijo', type: 'select', opts: [
            {v:'64',l:'/64 — Estándar'},{v:'48',l:'/48 — Sitio'},{v:'56',l:'/56 — Subred'},{v:'32',l:'/32 — ISP'}
        ]}
    ],
    calc(f) {
        const prefix = parseInt(f.prefijo.value);
        const hostBits = 128 - prefix;
        const hosts = Math.pow(2, hostBits);
        const hostStr = hostBits >= 64 ? '2^64+' : hosts.toLocaleString();
        return {
            main: `${f.dir.value}/${prefix}`,
            label: 'Dirección IPv6',
            extras: [
                { cls: 'info', txt: `Prefijo: /${prefix} (${prefix} bits de red)` },
                { cls: 'ok', txt: `Hosts teóricos: ~${hostStr}` },
                { cls: 'warn', txt: `Bits de host: ${hostBits}` }
            ],
            chart(canvas) { RedesVisual.ipv6(canvas, f.dir.value, prefix); }
        };
    }
};

FORMS.redes.wildcard = {
    title: 'Wildcard Mask',
    formula: 'Wildcard = ~Máscara de Red',
    fields: [
        { id: 'mask', label: 'Máscara de Red', val: '255.255.255.0' }
    ],
    calc(f) {
        try {
            const num = ipv4ToNum(f.mask.value);
            const wild = (~num >>> 0);
            const parts = f.mask.value.split('.').map(Number);
            const wildParts = numToIpv4(wild).split('.').map(Number);
            return {
                main: numToIpv4(wild),
                label: 'Wildcard Mask',
                extras: [
                    { cls: 'info', txt: `Máscara: ${f.mask.value} = ${parts.map(p => p.toString(2).padStart(8,'0')).join('.')}` },
                    { cls: 'ok', txt: `Wildcard: ${numToIpv4(wild)} = ${wildParts.map(p => p.toString(2).padStart(8,'0')).join('.')}` }
                ],
                steps: [`Máscara: ${f.mask.value}`, `Binario: ${parts.map(p => p.toString(2).padStart(8,'0')).join('.')}`, `Invertir bits → Wildcard`, `Wildcard: ${numToIpv4(wild)}`],
                chart(canvas) { RedesVisual.wildcard(canvas, f.mask.value, wildParts); }
            };
        } catch(e) { return null; }
    }
};

FORMS.redes.transfer = {
    title: 'Transferencia de Archivos',
    formula: 'Tiempo = Tamaño / Velocidad',
    fields: [
        { id: 'size', label: 'Tamaño del archivo', val: '500' },
        { id: 'sizeUnit', label: 'Unidad tamaño', type: 'select', opts: [
            {v:'MB',l:'MB'},{v:'GB',l:'GB'},{v:'KB',l:'KB'},{v:'bits',l:'bits'}
        ]},
        { id: 'speed', label: 'Velocidad del enlace', val: '100' },
        { id: 'speedUnit', label: 'Unidad velocidad', type: 'select', opts: [
            {v:'Mbps',l:'Mbps'},{v:'Gbps',l:'Gbps'},{v:'Kbps',l:'Kbps'},{v:'Bps',l:'Bps'}
        ]}
    ],
    calc(f) {
        const size = parseFloat(f.size.value);
        const speed = parseFloat(f.speed.value);
        if (isNaN(size) || isNaN(speed) || size <= 0 || speed <= 0) return null;
        const sizeBits = size * ({MB: 8*1e6, GB: 8*1e9, KB: 8*1e3, bits: 1}[f.sizeUnit.value]);
        const speedBps = speed * ({Mbps: 1e6, Gbps: 1e9, Kbps: 1e3, Bps: 8}[f.speedUnit.value]);
        const seconds = sizeBits / speedBps;
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = (seconds % 60);
        const timeStr = hours > 0 ? `${hours}h ${mins}m ${secs.toFixed(1)}s` : mins > 0 ? `${mins}m ${secs.toFixed(1)}s` : `${secs.toFixed(2)}s`;
        return {
            main: timeStr,
            label: 'Tiempo estimado',
            extras: [
                { cls: 'info', txt: `${size} ${f.sizeUnit.value} → ${sizeBits.toLocaleString()} bits` },
                { cls: 'info', txt: `${speed} ${f.speedUnit.value} → ${speedBps.toLocaleString()} bps` }
            ],
            steps: [`Tamaño en bits: ${sizeBits.toLocaleString()}`, `Velocidad en bps: ${speedBps.toLocaleString()}`, `Tiempo: ${sizeBits} / ${speedBps} = ${seconds.toFixed(2)}s`],
            chart(canvas) { RedesVisual.transfer(canvas, size, f.sizeUnit.value, speed, f.speedUnit.value, seconds); }
        };
    }
};

FORMS.redes.mbps = {
    title: 'Mbps ↔ MB/s',
    formula: 'MB/s = Mbps / 8',
    fields: [
        { id: 'tipo', label: 'Tipo', type: 'select', opts: [
            {v:'mbps2mb',l:'Mbps → MB/s'},{v:'mb2mbps',l:'MB/s → Mbps'}
        ]},
        { id: 'val', label: 'Valor', val: '100' }
    ],
    calc(f) {
        const val = parseFloat(f.val.value);
        if (isNaN(val) || val <= 0) return null;
        if (f.tipo.value === 'mbps2mb') {
            const mbps = val / 8;
            return {
                main: `${mbps.toFixed(2)} MB/s`,
                label: `${val} Mbps`,
                extras: [{ cls: 'info', txt: `${val} / 8 = ${mbps.toFixed(2)} MB/s` }],
                chart(canvas) { RedesVisual.mbps(canvas, val, mbps); }
            };
        } else {
            const mbps = val * 8;
            return {
                main: `${mbps.toFixed(2)} Mbps`,
                label: `${val} MB/s`,
                extras: [{ cls: 'info', txt: `${val} × 8 = ${mbps.toFixed(2)} Mbps` }],
                chart(canvas) { RedesVisual.mbps(canvas, mbps, val); }
            };
        }
    }
};

FORMS.redes.ancho = {
    title: 'Ancho de Banda Requerido',
    formula: 'BW = Usuarios × Consumo por usuario',
    fields: [
        { id: 'users', label: 'Cantidad de usuarios', val: '50' },
        { id: 'consumo', label: 'Consumo por usuario (Mbps)', val: '5' },
        { id: 'concurrencia', label: 'Concurrencia estimada (%)', val: '80' }
    ],
    calc(f) {
        const users = parseInt(f.users.value);
        const consumo = parseFloat(f.consumo.value);
        const concurrencia = parseFloat(f.concurrencia.value) / 100;
        if (isNaN(users) || isNaN(consumo) || isNaN(concurrencia)) return null;
        const totalBruto = users * consumo;
        const totalConcurrente = totalBruto * concurrencia;
        const recomendado = totalConcurrente * 1.3;
        return {
            main: `${recomendado.toFixed(1)} Mbps`,
            label: 'Ancho de banda recomendado',
            extras: [
                { cls: 'info', txt: `${users} usuarios × ${consumo} Mbps = ${totalBruto} Mbps brutos` },
                { cls: 'warn', txt: `Con ${(concurrencia*100).toFixed(0)}% concurrencia: ${totalConcurrente.toFixed(1)} Mbps` },
                { cls: 'ok', txt: `+30% margen: ${recomendado.toFixed(1)} Mbps` }
            ],
            chart(canvas) { RedesVisual.ancho(canvas, users, consumo, concurrencia, recomendado); }
        };
    }
};

FORMS.redes.utilizacion = {
    title: 'Utilización de Enlace',
    formula: 'Uso% = (Tráfico / Capacidad) × 100',
    fields: [
        { id: 'trafico', label: 'Tráfico actual (Mbps)', val: '300' },
        { id: 'capacidad', label: 'Capacidad total (Mbps)', val: '1000' }
    ],
    calc(f) {
        const trafico = parseFloat(f.trafico.value);
        const capacidad = parseFloat(f.capacidad.value);
        if (isNaN(trafico) || isNaN(capacidad) || capacidad <= 0) return null;
        const pct = (trafico / capacidad) * 100;
        const nivel = pct > 80 ? '⚠ Crítico' : pct > 50 ? '⊙ Moderado' : '✓ Normal';
        return {
            main: `${pct.toFixed(1)}%`,
            label: `Utilización — ${nivel}`,
            extras: [{ cls: pct > 80 ? 'warn' : 'ok', txt: `${trafico} / ${capacidad} Mbps = ${pct.toFixed(1)}%` }],
            chart(canvas) { RedesVisual.utilizacion(canvas, trafico, capacidad, pct); }
        };
    }
};

FORMS.redes.rtt = {
    title: 'RTT / Latencia',
    formula: 'RTT = 2 × Distancia / Velocidad de propagación',
    fields: [
        { id: 'dist', label: 'Distancia (km)', val: '1000' },
        { id: 'vel', label: 'Velocidad propagación', type: 'select', opts: [
            {v:'2e8',l:'Fibra óptica (2×10⁸ m/s)'},{v:'2.5e8',l:'Cobre (2.5×10⁸ m/s)'},
            {v:'3e8',l:'Radio (3×10⁸ m/s)'}
        ]},
        { id: 'dispositivos', label: 'Dispositivos intermedios', val: '5' },
        { id: 'latDispositivo', label: 'Latencia por dispositivo (ms)', val: '1' }
    ],
    calc(f) {
        const dist = parseFloat(f.dist.value) * 1000;
        const vel = parseFloat(f.vel.value);
        const dispositivos = parseInt(f.dispositivos.value);
        const latDispositivo = parseFloat(f.latDispositivo.value);
        if (isNaN(dist) || isNaN(vel) || vel <= 0) return null;
        const propagacion = dist / vel;
        const rtt = 2 * propagacion * 1000;
        const latenciaTotal = rtt + (dispositivos * latDispositivo);
        return {
            main: `${latenciaTotal.toFixed(2)} ms`,
            label: 'RTT Total',
            extras: [
                { cls: 'info', txt: `Propagación ida: ${(propagacion*1000).toFixed(2)} ms` },
                { cls: 'info', txt: `RTT (ida+vuelta): ${rtt.toFixed(2)} ms` },
                { cls: 'warn', txt: `${dispositivos} disp. × ${latDispositivo} ms = ${dispositivos * latDispositivo} ms adicionales` }
            ],
            chart(canvas) { RedesVisual.rtt(canvas, dist/1000, vel, dispositivos, latenciaTotal); }
        };
    }
};

FORMS.redes.throughput = {
    title: 'Throughput Real',
    formula: 'Throughput = Capacidad × (1 - Overhead/100)',
    fields: [
        { id: 'capacidad', label: 'Capacidad nominal (Mbps)', val: '100' },
        { id: 'overhead', label: 'Overhead (%)', val: '10' }
    ],
    calc(f) {
        const capacidad = parseFloat(f.capacidad.value);
        const overhead = parseFloat(f.overhead.value);
        if (isNaN(capacidad) || isNaN(overhead) || capacidad <= 0) return null;
        const efectivo = capacidad * (1 - overhead / 100);
        return {
            main: `${efectivo.toFixed(2)} Mbps`,
            label: 'Throughput real',
            extras: [{ cls: 'warn', txt: `${overhead}% overhead → ${(capacidad-efectivo).toFixed(2)} Mbps perdidos` }],
            steps: [`Capacidad: ${capacidad} Mbps`, `Overhead: ${overhead}%`, `Throughput: ${capacidad} × ${(1-overhead/100)} = ${efectivo.toFixed(2)} Mbps`],
            chart(canvas) { RedesVisual.throughput(canvas, capacidad, overhead, efectivo); }
        };
    }
};

FORMS.redes.poe = {
    title: 'PoE (Power over Ethernet)',
    formula: 'Potencia total = Σ(Potencia por dispositivo)',
    fields: [
        { id: 'disp', label: 'Cantidad de dispositivos', val: '8' },
        { id: 'potencia', label: 'Consumo por dispositivo (W)', val: '15' },
        { id: 'perdida', label: 'Pérdida en cable (%)', val: '10' },
        { id: 'estandar', label: 'Estándar PoE', type: 'select', opts: [
            {v:'802.3af',l:'802.3af (15.4W)'},{v:'802.3at',l:'802.3at (30W)'},
            {v:'802.3bt',l:'802.3bt (60-100W)'}
        ]}
    ],
    calc(f) {
        const disp = parseInt(f.disp.value);
        const potencia = parseFloat(f.potencia.value);
        const perdida = parseFloat(f.perdida.value);
        if (isNaN(disp) || isNaN(potencia) || disp <= 0) return null;
        const total = disp * potencia;
        const conPerdida = total * (1 + perdida / 100);
        const maxEst = { '802.3af': 15.4, '802.3at': 30, '802.3bt': 100 }[f.estandar.value];
        const suficiente = conPerdida <= maxEst * Math.ceil(disp / 1);
        return {
            main: `${conPerdida.toFixed(1)} W`,
            label: 'Potencia total requerida',
            extras: [
                { cls: 'info', txt: `${disp} disp. × ${potencia} W = ${total} W` },
                { cls: 'warn', txt: `+${perdida}% pérdida cable: ${conPerdida.toFixed(1)} W` },
                { cls: suficiente ? 'ok' : 'warn', txt: suficiente ? `✓ Dentro del ${f.estandar.value}` : `⚠ Supera ${f.estandar.value}` }
            ],
            chart(canvas) { RedesVisual.poe(canvas, disp, potencia, conPerdida, f.estandar.value); }
        };
    }
};

FORMS.redes.dns = {
    title: 'DNS Lookup',
    formula: 'Registros DNS: A, AAAA, MX, CNAME, NS',
    fields: [
        { id: 'dominio', label: 'Nombre de dominio', val: 'google.com' }
    ],
    calc(f) {
        const dominio = f.dominio.value.trim() || 'ejemplo.com';
        const ext = dominio.split('.').pop();
        const registros = [
            { tipo: 'A Record', valor: `IPv4 → Resolución a dirección IP` },
            { tipo: 'AAAA Record', valor: `IPv6 → Resolución IPv6` },
            { tipo: 'MX Record', valor: `Mail Exchange → servidor de correo` },
            { tipo: 'CNAME', valor: `Alias canónico → nombre canónico` },
            { tipo: 'NS Record', valor: `Name Servers → DNS autoritativos` },
            { tipo: 'TTL', valor: `Tiempo de vida en caché (segundos)` }
        ];
        return {
            main: dominio,
            label: 'Registros DNS',
            extras: registros.map(r => ({ cls: 'info', txt: `${r.tipo}: ${r.valor}` })),
            steps: [
                `Consulta: ${dominio}`,
                `Resolución A → IP del servidor`,
                `Resolución AAAA → IPv6 (si aplica)`,
                `MX → servidor(es) de correo`,
                `CNAME → alias (si configurado)`,
                `NS → servidores DNS autoritativos`
            ],
            chart(canvas) { RedesVisual.dns(canvas, dominio, registros); }
        };
    }
};

FORMS.redes.fragmentacion = {
    title: 'MTU y Fragmentación',
    formula: 'Fragmentos = ceil(Tamaño / MTU)',
    fields: [
        { id: 'paquete', label: 'Tamaño del paquete (bytes)', val: '5000' },
        { id: 'mtu', label: 'MTU de la red (bytes)', val: '1500' },
        { id: 'cabFrag', label: 'Cabecera por fragmento (bytes)', val: '20' }
    ],
    calc(f) {
        const paquete = parseInt(f.paquete.value);
        const mtu = parseInt(f.mtu.value);
        const cabFrag = parseInt(f.cabFrag.value);
        if (isNaN(paquete) || isNaN(mtu) || isNaN(cabFrag) || paquete <= 0 || mtu <= 20) return null;
        const datosPorFrag = mtu - cabFrag;
        const fragmentos = Math.ceil(paquete / datosPorFrag);
        const ultimo = paquete - (fragmentos - 1) * datosPorFrag;
        return {
            main: `${fragmentos} fragmentos`,
            label: `${paquete} bytes @ MTU ${mtu}`,
            extras: [
                { cls: 'info', txt: `Datos por fragmento: ${datosPorFrag} bytes` },
                { cls: 'ok', txt: `Último fragmento: ${ultimo} bytes de datos` },
                { cls: 'warn', txt: `Total con cabeceras: ${paquete + fragmentos * cabFrag} bytes` }
            ],
            steps: [
                `Paquete original: ${paquete} bytes`,
                `MTU: ${mtu} bytes`,
                `Cabecera/fragmento: ${cabFrag} bytes`,
                `Datos útiles por frag: ${mtu} - ${cabFrag} = ${datosPorFrag} bytes`,
                `Cantidad: ceil(${paquete} / ${datosPorFrag}) = ${fragmentos}`,
                `Último fragmento: ${ultimo} bytes de datos`
            ],
            chart(canvas) { RedesVisual.fragmentacion(canvas, paquete, mtu, fragmentos); }
        };
    }
};

FORMS.redes.vlan = {
    title: 'VLAN Capacity',
    formula: 'VLAN IDs: 1 – 4094 (IEEE 802.1Q)',
    fields: [
        { id: 'vlanId', label: 'VLAN ID específico (opcional)', val: '' }
    ],
    calc(f) {
        const total = 4094;
        const reservadas = [0, 1, 1002, 1003, 1004, 1005, 4095];
        const disponibles = total - reservadas.length;
        const vlanInput = parseInt(f.vlanId.value);
        let extras = [
            { cls: 'info', txt: `ID disponibles: 1–4094 (excluyendo reservadas)` },
            { cls: 'ok', txt: `Total VLANs utilizables: ${disponibles}` },
            { cls: 'warn', txt: `Reservadas: ${reservadas.join(', ')}` }
        ];
        if (!isNaN(vlanInput) && vlanInput >= 1 && vlanInput <= 4094) {
            const valida = !reservadas.includes(vlanInput);
            extras.push({ cls: valida ? 'ok' : 'warn', txt: `VLAN ${vlanInput}: ${valida ? '✓ Disponible' : '⚠ Reservada'}` });
        }
        return {
            main: `1 – 4094`,
            label: 'VLAN IDs',
            extras,
            steps: [
                `Rango IEEE 802.1Q: 1 – 4094`,
                `Reservadas: ${reservadas.join(', ')}`,
                `Disponibles: ${disponibles}`
            ],
            chart(canvas) { RedesVisual.vlan(canvas); }
        };
    }
};

FORMS.redes.dhcp = {
    title: 'DHCP Scope',
    formula: 'Disponibles = Total IPs - Reservas',
    fields: [
        { id: 'red', label: 'Red (CIDR)', val: '192.168.1.0/24' },
        { id: 'reservas', label: 'Reservas fijas', val: '20' },
        { id: 'gateway', label: '¿Incluir gateway?', type: 'select', opts: [
            {v:'si',l:'Sí — resta 1 IP'},{v:'no',l:'No'}
        ]}
    ],
    calc(f) {
        try {
            const { ip, bits } = parseCIDR(f.red.value);
            const reservas = parseInt(f.reservas.value);
            if (isNaN(reservas) || reservas < 0) return null;
            const total = bits >= 31 ? (bits === 31 ? 2 : 1) : (1 << (32 - bits)) - 2;
            const incluirGw = f.gateway.value === 'si';
            const resta = reservas + (incluirGw ? 1 : 0);
            const disponibles = Math.max(0, total - resta);
            return {
                main: `${disponibles} IPs`,
                label: 'DHCP Scope',
                extras: [
                    { cls: 'info', txt: `Red: ${f.red.value} → ${total} IPs utilizables` },
                    { cls: 'warn', txt: `Reservas: ${reservas} IPs` },
                    ...(incluirGw ? [{ cls: 'warn', txt: `Gateway: -1 IP` }] : []),
                    { cls: 'ok', txt: `Disponibles para DHCP: ${disponibles} IPs` }
                ],
                steps: [
                    `Red: ${f.red.value}`,
                    `Hosts totales: 2^(32-${bits}) - 2 = ${total}`,
                    ...(incluirGw ? [`Gateway: ${numToIpv4(ipv4ToNum(ip) + 1)} (resta 1 IP)`] : []),
                    `Reservas: ${reservas}`,
                    `Disponibles: ${total} - ${resta} = ${disponibles}`
                ],
                chart(canvas) { RedesVisual.dhcp(canvas, total, reservas, disponibles); }
            };
        } catch(e) { return null; }
    }
};

FORMS.redes.overhead_tcp = {
    title: 'Cálculo de Overhead TCP/IP',
    formula: 'Overhead% = Cabeceras / Total × 100',
    fields: [
        { id: 'paquete', label: 'Tamaño total del paquete (bytes)', val: '1500' },
        { id: 'cabeceras', label: 'Cabeceras TCP/IP (bytes)', val: '40' }
    ],
    calc(f) {
        const paquete = parseInt(f.paquete.value);
        const cabeceras = parseInt(f.cabeceras.value);
        if (isNaN(paquete) || isNaN(cabeceras) || paquete <= 0 || cabeceras < 0 || cabeceras > paquete) return null;
        const datosUtiles = paquete - cabeceras;
        const overheadPct = (cabeceras / paquete) * 100;
        return {
            main: `${overheadPct.toFixed(1)}%`,
            label: 'Overhead TCP/IP',
            extras: [
                { cls: 'info', txt: `Tamaño total: ${paquete} bytes` },
                { cls: 'warn', txt: `Cabeceras: ${cabeceras} bytes` },
                { cls: 'ok', txt: `Datos útiles: ${datosUtiles} bytes` }
            ],
            steps: [
                `Paquete total: ${paquete} B`,
                `Cabeceras: ${cabeceras} B`,
                `Datos útiles: ${paquete} - ${cabeceras} = ${datosUtiles} B`,
                `Overhead: (${cabeceras} / ${paquete}) × 100 = ${overheadPct.toFixed(1)}%`
            ],
            chart(canvas) { RedesVisual.overhead_tcp(canvas, paquete, cabeceras, datosUtiles, overheadPct); }
        };
    }
};
