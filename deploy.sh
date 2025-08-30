#!/bin/bash

# Script di deploy per GitHub Pages

echo "🚀 Iniziando il deploy per GitHub Pages..."

# Rimuovi la build precedente
echo "🧹 Rimuovendo build precedente..."
rm -rf dist

# Build dell'applicazione
echo "🔨 Building dell'applicazione..."
npm run build

# Verifica che la build sia stata creata
if [ ! -d "dist" ]; then
    echo "❌ Errore: la build non è stata creata!"
    exit 1
fi

echo "✅ Build completata con successo!"
echo "📁 Contenuto della cartella dist:"
ls -la dist

echo ""
echo "🎯 Prossimi passi:"
echo "1. Committa e pusha le modifiche su GitHub"
echo "2. Vai su GitHub > Settings > Pages"
echo "3. Imposta Source su 'Deploy from a branch'"
echo "4. Seleziona branch 'main' e cartella '/ (root)'"
echo "5. Clicca Save"
echo ""
echo "🌐 L'app sarà disponibile su: https://[username].github.io/chi-l-ha-detto/"
