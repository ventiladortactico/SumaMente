const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');

async function generateFeatureGraphic() {
    const width = 1024;
    const height = 500;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Fondo oscuro (color de tu app)
    ctx.fillStyle = '#0a0b0e';
    ctx.fillRect(0, 0, width, height);

    // Gradiente sutil
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#0a0b0e');
    gradient.addColorStop(1, '#1e232f');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Logo (si existe el archivo)
    try {
        const logo = await loadImage('logo.jpg');
        const logoSize = 120;
        ctx.drawImage(logo, 50, (height - logoSize) / 2, logoSize, logoSize);
    } catch (e) {
        console.log('Logo no encontrado, usando texto');
    }

    // Título principal
    ctx.fillStyle = '#4f9cf9';
    ctx.font = 'bold 72px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('SumaMente', 200, 200);

    // Slogan
    ctx.fillStyle = '#ffffff';
    ctx.font = '32px Arial';
    ctx.fillText('Calculadora científica multifuncional', 200, 260);

    // Iconos de módulos
    const modules = [
        { icon: '🏥', name: 'Medicina' },
        { icon: '💰', name: 'Finanzas' },
        { icon: '⚡', name: 'Electrónica' },
        { icon: '🔬', name: 'Química' },
        { icon: '🏗️', name: 'Ingeniería' },
        { icon: '🌐', name: 'Redes' }
    ];

    ctx.font = '24px Arial';
    let xPos = 200;
    const yPos = 350;
    
    modules.forEach((mod, index) => {
        ctx.fillText(mod.icon + ' ' + mod.name, xPos, yPos);
        xPos += 150;
    });

    // Línea decorativa
    ctx.strokeStyle = '#4f9cf9';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(200, 300);
    ctx.lineTo(900, 300);
    ctx.stroke();

    // Guardar imagen
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('feature-graphic.png', buffer);
    console.log('Imagen generada: feature-graphic.png');
}

generateFeatureGraphic().catch(console.error);
