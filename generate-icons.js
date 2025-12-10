// Script Node.js para generar iconos PNG desde SVG
// Requiere: npm install sharp
// Uso: node generate-icons.js

const fs = require('fs');
const path = require('path');

// SVG template para el icono
const svgTemplate = (size) => `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#25D366" rx="${size * 0.15}"/>
  <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.3}" fill="white"/>
  <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.15}" fill="#25D366"/>
  <circle cx="${size / 2 - size * 0.05}" cy="${size / 2 - size * 0.05}" r="${size * 0.05}" fill="white"/>
</svg>`;

async function generateIcons() {
  try {
    // Verificar si sharp está instalado
    let sharp;
    try {
      sharp = require('sharp');
    } catch (e) {
      console.log('⚠️  Sharp no está instalado.');
      console.log('📦 Instalando sharp...');
      const { execSync } = require('child_process');
      execSync('npm install sharp', { stdio: 'inherit' });
      sharp = require('sharp');
    }

    const sizes = [16, 48, 128];
    const iconsDir = path.join(__dirname, 'icons');

    console.log('🎨 Generando iconos...\n');

    for (const size of sizes) {
      const svg = svgTemplate(size);
      const outputPath = path.join(iconsDir, `icon${size}.png`);

      await sharp(Buffer.from(svg))
        .png()
        .toFile(outputPath);

      console.log(`✅ Generado: icon${size}.png (${size}x${size})`);
    }

    console.log('\n✨ ¡Iconos generados exitosamente!');
  } catch (error) {
    console.error('❌ Error generando iconos:', error.message);
    console.log('\n💡 Alternativa: Usa create-icons.html en el navegador para generar los iconos manualmente.');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  generateIcons();
}

module.exports = { generateIcons };




