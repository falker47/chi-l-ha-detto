const fs = require('fs');
const path = require('path');

console.log('🚀 Ottimizzazione Immagine Hero');
console.log('===============================');

const heroPath = path.join(__dirname, '../public/images/hero-bg.png');
const outputDir = path.join(__dirname, '../public/images');

// Verifica se l'immagine esiste
if (!fs.existsSync(heroPath)) {
  console.error('❌ Immagine hero-bg.png non trovata!');
  process.exit(1);
}

console.log('📁 Immagine trovata:', heroPath);

// Comandi per ottimizzare l'immagine (richiedono ImageMagick o simili)
console.log('\n🔧 Comandi per ottimizzare l\'immagine:');
console.log('=====================================');

console.log('\n1. Installa ImageMagick:');
console.log('   Windows: https://imagemagick.org/script/download.php#windows');
console.log('   macOS: brew install imagemagick');
console.log('   Linux: sudo apt-get install imagemagick');

console.log('\n2. Converti in WebP (formato moderno, 25-35% più leggero):');
console.log(`   magick "${heroPath}" -quality 85 -resize 1920x1080 "${path.join(outputDir, 'hero-bg.webp')}"`);

console.log('\n3. Crea versione mobile (768x432):');
console.log(`   magick "${heroPath}" -quality 80 -resize 768x432 "${path.join(outputDir, 'hero-bg-mobile.webp')}"`);

console.log('\n4. Fallback JPEG per browser obsoleti:');
console.log(`   magick "${heroPath}" -quality 85 -resize 1920x1080 "${path.join(outputDir, 'hero-bg.jpg')}"`);
console.log(`   magick "${heroPath}" -quality 80 -resize 768x432 "${path.join(outputDir, 'hero-bg-mobile.jpg')}"`);

console.log('\n5. Comando completo per Windows PowerShell:');
console.log(`   magick "${heroPath}" -quality 85 -resize 1920x1080 "${path.join(outputDir, 'hero-bg.webp')}" && magick "${heroPath}" -quality 80 -resize 768x432 "${path.join(outputDir, 'hero-bg-mobile.webp')}" && magick "${heroPath}" -quality 85 -resize 1920x1080 "${path.join(outputDir, 'hero-bg.jpg')}" && magick "${heroPath}" -quality 80 -resize 768x432 "${path.join(outputDir, 'hero-bg-mobile.jpg')}"`);

console.log('\n📊 Risultati attesi:');
console.log('   - PNG originale: ~3MB');
console.log('   - WebP desktop: ~200-400KB (85% riduzione)');
console.log('   - WebP mobile: ~100-200KB (90% riduzione)');
console.log('   - JPEG fallback: ~300-500KB (80% riduzione)');

console.log('\n💡 Alternative online:');
console.log('   - TinyPNG: https://tinypng.com/');
console.log('   - Squoosh: https://squoosh.app/');
console.log('   - ImageOptim: https://imageoptim.com/');

console.log('\n✅ Dopo l\'ottimizzazione, rimuovi il file PNG originale per risparmiare spazio!');
console.log(`   del "${heroPath}"`);
