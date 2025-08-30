# 🚀 Deploy su GitHub Pages - Istruzioni Complete

## ✅ **Problema Risolto!**

Il problema del "tutto bianco" era causato da:
1. **Percorsi assoluti** delle immagini (`/images/...`)
2. **Configurazione Vite** non ottimizzata per GitHub Pages
3. **Base URL** non configurato per la sottocartella del repository

## 🔧 **Modifiche Applicate**

### 1. **Configurazione Vite** (`vite.config.ts`)
```typescript
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/chi-l-ha-detto/' : '/',
  // ... altre configurazioni
})
```

### 2. **Percorsi Immagini Aggiornati**
- **Prima**: `/images/personaggi/bismarck.jpg`
- **Dopo**: `images/personaggi/bismarck.jpg` (senza slash iniziale)

### 3. **Workflow GitHub Actions** (`.github/workflows/deploy.yml`)
Deploy automatico ad ogni push su `main`

## 🎯 **Passi per il Deploy**

### **Opzione 1: Deploy Manuale (Raccomandato per il primo deploy)**

1. **Committa e pusha le modifiche:**
   ```bash
   git add .
   git commit -m "Configurazione per GitHub Pages + palette seppia"
   git push origin main
   ```

2. **Configura GitHub Pages:**
   - Vai su GitHub > Repository > **Settings** > **Pages**
   - **Source**: "Deploy from a branch"
   - **Branch**: `main`
   - **Folder**: `/ (root)`
   - Clicca **Save**

3. **Aspetta il deploy** (2-5 minuti)

### **Opzione 2: GitHub Actions (Automatico)**

1. **Pusha le modifiche** (come sopra)
2. **Vai su Actions** per monitorare il deploy
3. **Configura Pages** per usare il branch `gh-pages`

## 🌐 **URL Finale**

L'app sarà disponibile su:
```
https://[username].github.io/chi-l-ha-detto/
```

## 🔍 **Verifica del Deploy**

1. **Controlla la console del browser** per errori
2. **Verifica che le immagini si carichino** correttamente
3. **Testa la funzionalità** del gioco

## 🚨 **Se Ancora Non Funziona**

### **Controlla:**
1. **Repository Settings > Pages** - è configurato correttamente?
2. **Branch** - stai usando `main` o `gh-pages`?
3. **Cartella** - è impostata su `/ (root)`?

### **Debug:**
1. **Console browser** - errori 404 per le immagini?
2. **Network tab** - richieste fallite?
3. **Repository** - le immagini sono nel branch corretto?

## 📁 **Struttura Finale Repository**

```
chi-l-ha-detto/
├── .github/workflows/  # GitHub Actions
├── src/                # Codice sorgente
├── public/images/      # Immagini
├── dist/               # Build (generata)
├── vite.config.ts      # Configurazione Vite
└── README.md           # Documentazione
```

## 🎉 **Risultato Atteso**

Dopo il deploy, dovresti vedere:
- ✅ **Menu principale** con immagine hero seppia
- ✅ **Immagini personaggi** che si caricano correttamente
- ✅ **Palette seppia** coerente con il design
- ✅ **Funzionalità completa** del gioco

## 🆘 **Supporto**

Se hai ancora problemi:
1. Controlla la console del browser
2. Verifica i percorsi delle immagini
3. Controlla la configurazione GitHub Pages
4. Assicurati che il repository sia pubblico
