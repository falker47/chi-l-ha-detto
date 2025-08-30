# Script per correggere i percorsi delle immagini
$filePath = "src/components/ChiLHaDetto.tsx"
$content = Get-Content $filePath -Raw

# Sostituisci tutti i percorsi
$content = $content -replace '/chi-l-ha-detto/images/', 'images/'

# Scrivi il file corretto
$content | Set-Content $filePath -NoNewline

Write-Host "✅ Percorsi delle immagini corretti!" -ForegroundColor Green
Write-Host "Rimossi tutti i /chi-l-ha-detto/ dai percorsi" -ForegroundColor Yellow
