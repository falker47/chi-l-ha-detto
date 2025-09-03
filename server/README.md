# 🏆 Leaderboard Backend - Chi l'ha detto?

Backend Express.js per la leaderboard globale del gioco "Chi l'ha detto? - Ambiguità Edition".

## 🚀 Deploy su Render

1. **Fork** questo repository
2. **Vai su** [render.com](https://render.com)
3. **Crea** un nuovo Web Service
4. **Connetti** il tuo repository GitHub
5. **Configura**:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: `Node`
6. **Deploy**!

## 📊 API Endpoints

- `GET /api/leaderboard` - Leaderboard completa
- `GET /api/leaderboard/:mode` - Leaderboard per modalità
- `POST /api/leaderboard` - Aggiungi record
- `GET /api/health` - Health check

## 🔧 Configurazione

Il server si avvia automaticamente sulla porta fornita da Render (variabile `PORT`).

## 📁 Struttura

```
server/
├── index.js              # Server Express
├── package.json          # Dipendenze Node.js
├── leaderboard.json      # Database JSON (auto-generato)
└── README.md            # Questo file
```

## 🎯 Uso

Una volta deployato, aggiorna l'URL nel frontend:

```javascript
// In src/components/Leaderboard.tsx
const response = await fetch('https://tuo-app-name.onrender.com/api/leaderboard');
```
