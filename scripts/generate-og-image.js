const { createCanvas, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');

if (process.platform === 'win32') {
  try { registerFont('C:\\Windows\\Fonts\\arialbd.ttf', { family: 'Arial Bold' }); } catch {}
  try { registerFont('C:\\Windows\\Fonts\\arial.ttf', { family: 'Arial' }); } catch {}
}

const W = 1200;
const H = 630;
const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

const bgGrad = ctx.createLinearGradient(0, 0, W, H);
bgGrad.addColorStop(0, '#0a0b0e');
bgGrad.addColorStop(0.5, '#0f1119');
bgGrad.addColorStop(1, '#14161f');
ctx.fillStyle = bgGrad;
ctx.fillRect(0, 0, W, H);

const gridSpacing = 40;
ctx.strokeStyle = 'rgba(79, 156, 249, 0.04)';
ctx.lineWidth = 1;
for (let x = 0; x < W; x += gridSpacing) {
  ctx.beginPath();
  ctx.moveTo(x, 0);
  ctx.lineTo(x, H);
  ctx.stroke();
}
for (let y = 0; y < H; y += gridSpacing) {
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(W, y);
  ctx.stroke();
}

const symbols = [
  { char: '\u2211', x: 850, y: 140, size: 72 },
  { char: '\u222B', x: 980, y: 220, size: 80 },
  { char: '\u03C0', x: 870, y: 340, size: 64 },
  { char: '\u221A', x: 1020, y: 400, size: 76 },
  { char: '\u0394', x: 920, y: 480, size: 56 },
  { char: '\u221E', x: 780, y: 500, size: 60 },
];

ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
for (const sym of symbols) {
  ctx.font = `bold ${sym.size}px sans-serif`;
  ctx.fillStyle = 'rgba(79, 156, 249, 0.07)';
  ctx.fillText(sym.char, sym.x, sym.y);
}

const accentBarY = 480;
const barGrad = ctx.createLinearGradient(40, 0, 400, 0);
barGrad.addColorStop(0, '#4f9cf9');
barGrad.addColorStop(1, '#38e8c8');
ctx.fillStyle = barGrad;
ctx.beginPath();
ctx.roundRect(40, accentBarY, 320, 5, 3);
ctx.fill();

ctx.textAlign = 'left';
ctx.textBaseline = 'bottom';
ctx.font = "bold 72px sans-serif";
ctx.fillStyle = '#e8edf5';
ctx.fillText('SumaMente', 40, 280);

ctx.textBaseline = 'top';
ctx.font = "28px sans-serif";
ctx.fillStyle = '#4f9cf9';
ctx.fillText('Calculadora Cient\u00EDfica', 40, 290);

ctx.textBaseline = 'top';
ctx.font = "16px sans-serif";
ctx.fillStyle = '#4a5570';
ctx.fillText('Herramienta de c\u00E1lculos matem\u00E1ticos y conversiones', 40, 330);

ctx.textBaseline = 'bottom';
ctx.font = "14px sans-serif";
ctx.fillStyle = '#3a4155';
ctx.fillText('suma-mente.vercel.app', 40, H - 30);

const outputPath = path.resolve(__dirname, '..', 'og-image.png');
const buf = canvas.toBuffer('image/png');
fs.writeFileSync(outputPath, buf);
console.log('\u2713 og-image.png generado (1200x630)');
