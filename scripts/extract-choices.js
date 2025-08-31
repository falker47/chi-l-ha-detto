const fs = require('fs');
const path = require('path');

console.log('🔍 Estrazione scelte uniche da quotes.json');
console.log('==========================================');

// Leggi quotes.json
const quotesPath = path.join(__dirname, '../src/data/quotes.json');
const quotes = JSON.parse(fs.readFileSync(quotesPath, 'utf8'));

// Estrai tutte le scelte uniche
const allChoices = new Set();
quotes.forEach(quote => {
  if (quote.choices && Array.isArray(quote.choices)) {
    quote.choices.forEach(choice => {
      allChoices.add(choice);
    });
  }
});

// Leggi ChiLHaDetto.tsx per estrarre le mappature esistenti
const componentPath = path.join(__dirname, '../src/components/ChiLHaDetto.tsx');
const componentContent = fs.readFileSync(componentPath, 'utf8');

// Estrai le chiavi dalla mappa delle immagini
const imageMapRegex = /"([^"]+)":\s*"images\/personaggi\/[^"]+"/g;
const existingMappings = new Set();
let match;

while ((match = imageMapRegex.exec(componentContent)) !== null) {
  existingMappings.add(match[1]);
}

console.log(`\n📊 Statistiche:`);
console.log(`   Scelte totali uniche: ${allChoices.size}`);
console.log(`   Mappature esistenti: ${existingMappings.size}`);
console.log(`   Scelte mancanti: ${allChoices.size - existingMappings.size}`);

// Trova le scelte mancanti
const missingChoices = Array.from(allChoices).filter(choice => !existingMappings.has(choice));

console.log(`\n❌ Scelte mancanti (${missingChoices.length}):`);
console.log('=====================================');
missingChoices.sort().forEach((choice, index) => {
  console.log(`${(index + 1).toString().padStart(3, ' ')}. ${choice}`);
});

// Trova le mappature che non corrispondono a scelte
const unusedMappings = Array.from(existingMappings).filter(mapping => !allChoices.has(mapping));

if (unusedMappings.length > 0) {
  console.log(`\n⚠️  Mappature non utilizzate (${unusedMappings.length}):`);
  console.log('==========================================');
  unusedMappings.sort().forEach((mapping, index) => {
    console.log(`${(index + 1).toString().padStart(3, ' ')}. ${mapping}`);
  });
}

// Suggerisci le immagini da aggiungere
console.log(`\n💡 Suggerimenti per le immagini mancanti:`);
console.log('=========================================');
missingChoices.forEach(choice => {
  // Genera un nome file basato sul nome
  const fileName = choice
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[ç]/g, 'c');
  
  console.log(`   "${choice}": "images/personaggi/${fileName}.jpg",`);
});

console.log(`\n✨ Per aggiungere le mappature mancanti:`);
console.log('   1. Aggiungi le immagini nella cartella public/images/personaggi/');
console.log('   2. Aggiungi le mappature nel file ChiLHaDetto.tsx');
console.log('   3. Assicurati che i nomi dei file corrispondano esattamente');
