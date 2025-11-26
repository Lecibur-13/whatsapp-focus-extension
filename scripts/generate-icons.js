// Node.js script to generate PNG icons from SVG
// Requires: npm install sharp
// Usage: node generate-icons.js

const fs = require('fs');
const path = require('path');

// SVG template for the icon
const svgTemplate = (size) => `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#25D366" rx="${size * 0.15}"/>
  <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.3}" fill="white"/>
  <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.15}" fill="#25D366"/>
  <circle cx="${size / 2 - size * 0.05}" cy="${size / 2 - size * 0.05}" r="${size * 0.05}" fill="white"/>
</svg>`;

async function generateIcons() {
  try {
    // Check if sharp is installed
    let sharp;
    try {
      sharp = require('sharp');
    } catch (e) {
      console.log('⚠️  Sharp is not installed.');
      console.log('📦 Installing sharp...');
      const { execSync } = require('child_process');
      execSync('npm install sharp', { stdio: 'inherit' });
      sharp = require('sharp');
    }

    const sizes = [16, 48, 128];
    const iconsDir = path.join(__dirname, '..', 'assets', 'icons');

    console.log('🎨 Generating icons...\n');

    for (const size of sizes) {
      const svg = svgTemplate(size);
      const outputPath = path.join(iconsDir, `icon${size}.png`);

      await sharp(Buffer.from(svg))
        .png()
        .toFile(outputPath);

      console.log(`✅ Generated: icon${size}.png (${size}x${size})`);
    }

    console.log('\n✨ Icons generated successfully!');
  } catch (error) {
    console.error('❌ Error generating icons:', error.message);
    console.log('\n💡 Alternative: Use create-icons.html in the browser to generate icons manually.');
  }
}

// Execute if called directly
if (require.main === module) {
  generateIcons();
}

module.exports = { generateIcons };

