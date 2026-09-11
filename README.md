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

La classifica globale usa una Vercel Function e Neon Free PostgreSQL, con risveglio su richiesta
senza cron. Il database definitivo è Neon Frankfurt (chi_l_ha_detto), con Function Vercel fra1.
DATABASE_URL resta esclusivamente sul server. I 36 record storici sono già migrati: non reimportarli.

- [Setup Neon/Vercel e variabili](DEPLOY_GUIDE.md)
- [Migrazione dati e rollback](DATABASE_MIGRATION_README.md)
- [API, cache e test](LEADERBOARD_README.md)

## 🛠️ Tecnologie

- **React 18** con TypeScript
- **Vite** per build e sviluppo
- **Tailwind CSS** per styling responsive
- **Vercel** per deploy e hosting
- **GitHub** per version control

## 🛠️ Sviluppo Locale

```bash
# Installa dipendenze
npm ci

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

