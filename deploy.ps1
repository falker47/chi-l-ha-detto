# 🚀 Script di Deploy per GitHub Pages
# Esegui questo script per aggiornare il sito

Write-Host "🚀 Avvio deploy GitHub Pages..." -ForegroundColor Green

# 1. Build dell'applicazione
Write-Host "📦 Building dell'applicazione..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build fallita!" -ForegroundColor Red
    exit 1
}

# 2. Rimuovi cartella docs esistente
Write-Host "🗑️ Rimozione cartella docs esistente..." -ForegroundColor Yellow
if (Test-Path "docs") {
    Remove-Item -Recurse -Force "docs"
}

# 3. Crea nuova cartella docs
Write-Host "📁 Creazione cartella docs..." -ForegroundColor Yellow
New-Item -ItemType Directory -Name "docs" | Out-Null

# 4. Copia file build
Write-Host "📋 Copia file build..." -ForegroundColor Yellow
Copy-Item -Path "dist\*" -Destination "docs\" -Recurse -Force

# 5. Aggiungi a git
Write-Host "📝 Aggiunta file a git..." -ForegroundColor Yellow
git add docs/

# 6. Commit
Write-Host "💾 Commit modifiche..." -ForegroundColor Yellow
git commit -m "Deploy automatico $(Get-Date -Format 'yyyy-MM-dd HH:mm')"

# 7. Push
Write-Host "🚀 Push su GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host "✅ Deploy completato!" -ForegroundColor Green
Write-Host "🌐 Il sito sarà disponibile tra 2-5 minuti su:" -ForegroundColor Cyan
Write-Host "   https://falker47.github.io/chi-l-ha-detto/" -ForegroundColor Cyan
