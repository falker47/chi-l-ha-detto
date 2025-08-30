# Chi l'ha detto? - Quiz Storico

Un'applicazione interattiva per testare la conoscenza delle citazioni storiche e del loro vero contesto.

## 🎯 Caratteristiche

- **Quiz interattivo** con citazioni storiche
- **Modalità Historical/Context** per contenuti educativi
- **Immagini dei personaggi** storici
- **Sistema di punteggio** e streak
- **Hint e aiuti** durante il gioco
- **Design responsive** con palette seppia storica

## 🚀 Deploy su GitHub Pages

### Metodo 1: Deploy Manuale (Raccomandato)

1. **Build locale:**
   ```bash
   npm run build
   ```

2. **Pusha tutto:**
   ```bash
   git add .
   git commit -m "Aggiornamenti per GitHub Pages"
   git push origin main
   ```

3. **Configura GitHub Pages:**
   - Vai su GitHub > Repository > **Settings** > **Pages**
   - **Source**: "Deploy from a branch"
   - **Branch**: `main`
   - **Folder**: `/ (root)`
   - Clicca **Save**

4. **Aspetta il deploy** (2-5 minuti)

### Metodo 2: GitHub Actions (Opzionale)

1. **Vai su Actions** nel repository
2. **Seleziona** "Manual Deploy to GitHub Pages"
3. **Clicca** "Run workflow"
4. **Configura Pages** per usare branch `gh-pages`

## 🛠️ Sviluppo Locale

```bash
# Installa dipendenze
npm install

# Avvia server di sviluppo
npm run dev

# Build per produzione
npm run build

# Anteprima build
npm run preview

# Validazione dati
npm run validate
```

## 📁 Struttura Progetto

```
├── src/
│   ├── components/     # Componenti React
│   ├── data/          # Dati delle citazioni
│   └── types.ts       # Definizioni TypeScript
├── public/
│   └── images/        # Immagini e personaggi
├── .github/workflows/ # GitHub Actions
└── vite.config.ts     # Configurazione Vite
```

## 🎨 Palette Colori

L'applicazione utilizza una palette seppia storica coerente con l'immagine hero:
- **Sfondo**: Gradiente amber-orange
- **Testi**: Marroni scuri e dorati
- **Accenti**: Seppia caldo e arancioni

## 🌐 Live Demo

[Chi l'ha detto?](https://[username].github.io/chi-l-ha-detto/)

## 📝 Licenza

Progetto educativo per scopi didattici.

