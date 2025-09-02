# Chi l'ha detto? - Ambiguità Edition

Un quiz interattivo che mette alla prova la tua conoscenza delle citazioni storiche e del loro vero contesto. Scopri chi ha davvero pronunciato le frasi più famose della storia!

## 🎯 Caratteristiche

- **Due modalità di gioco**: Eracle (Le 12 Fatiche) e Achille (Aristeia)
- **Quiz interattivo** con citazioni storiche autentiche
- **Sistema anti-duplicati** per esperienza sempre fresca
- **Contenuti educativi** con contesto storico e note di ambiguità
- **Immagini dei personaggi** storici
- **Sistema di punteggio** e streak
- **Hint e aiuti** durante il gioco
- **Design responsive** ottimizzato per mobile e desktop
- **Favicon e meta tag** per condivisione social

## 🚀 Deploy

### 🌐 Vercel (Raccomandato)

Il progetto è attualmente deployato su Vercel:
- **URL**: [https://chi-l-ha-detto.vercel.app/](https://chi-l-ha-detto.vercel.app/)
- **Deploy automatico** ad ogni push su main
- **Performance ottimizzate** per mobile e desktop

### 📄 GitHub Pages (Alternativo)

#### Metodo 1: Deploy Manuale

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

## 🛠️ Tecnologie

- **React 18** con TypeScript
- **Vite** per build e sviluppo
- **Tailwind CSS** per styling responsive
- **Vercel** per deploy e hosting
- **GitHub** per version control

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

## 🎨 Design

L'applicazione utilizza un design moderno e responsive:
- **Sfondo**: Immagini storiche con overlay scuri
- **Modalità Eracle**: Palette viola/indaco per "Le 12 Fatiche"
- **Modalità Achille**: Palette amber/arancione per "Aristeia"
- **Testi**: Bianco con ombre per leggibilità
- **Footer**: Nero fisso con link al portfolio

## 🌐 Live Demo

🎮 **[Gioca ora su Vercel](https://chi-l-ha-detto.vercel.app/)**

Testa la tua conoscenza delle citazioni storiche direttamente online!

## 📝 Licenza

Progetto educativo per scopi didattici.

