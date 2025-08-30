const fs = require('fs');
const path = require('path');

// Leggi il file
const filePath = 'src/components/ChiLHaDetto.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Sostituisci tutti i percorsi
content = content.replace(/\/chi-l-ha-detto\/images\//g, 'images/');

// Scrivi il file corretto
fs.writeFileSync(filePath, content);

console.log('✅ Percorsi delle immagini corretti!');
console.log('Rimossi tutti i /chi-l-ha-detto/ dai percorsi');
