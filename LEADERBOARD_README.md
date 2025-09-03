# 🏆 Sistema Leaderboard - Chi l'ha detto?

## 📋 Panoramica

Il sistema di leaderboard globale permette ai giocatori di competere per entrare nella top 5 per entrambe le modalità di gioco:

- **Modalità Eracle**: Top 5 per le 12 Fatiche completate
- **Modalità Achille**: Top 5 per la streak più lunga

## 🚀 Avvio del Sistema

### 1. Avvio del Backend
```bash
npm run server
```
Il server si avvierà sulla porta 3001.

### 2. Avvio del Frontend
```bash
npm run dev
```
Il frontend si avvierà sulla porta 5173.

### 3. Avvio Completo (Backend + Frontend)
```bash
npm run dev:full
```

## 🎯 Funzionalità

### 📊 Leaderboard
- **Top 5 globale** per ogni modalità
- **Ordinamento intelligente**:
  1. Streak/Fatica (decrescente)
  2. Punteggio (decrescente) 
  3. Timestamp (crescente - chi arriva prima sta più in alto)

### 💾 Salvataggio Record
- **Automatico**: Quando un giocatore raggiunge un punteggio da top 5
- **Input nome**: Il giocatore inserisce il suo nome al momento del record
- **Validazione**: Controllo che il record meriti di essere salvato

### 🎮 Integrazione nel Gioco
- **Game Over**: La leaderboard appare automaticamente quando il gioco finisce
- **Vittoria Finale**: Appare anche quando si completa la modalità Eracle
- **Menu Principale**: Bottone "Top 5" per visualizzare la leaderboard

## 🔧 API Endpoints

### GET /api/leaderboard
Ottiene la leaderboard completa
```json
{
  "success": true,
  "data": {
    "achille": [...],
    "eracle": [...]
  }
}
```

### GET /api/leaderboard/:mode
Ottiene la leaderboard per una modalità specifica
- `mode`: "achille" o "eracle"

### POST /api/leaderboard
Aggiunge un nuovo record
```json
{
  "mode": "achille",
  "name": "Nome Giocatore",
  "streak": 15,
  "score": 2500
}
```

### GET /api/health
Health check del server

## 📁 Struttura File

```
server/
├── index.js              # Server Express
└── leaderboard.json      # Database JSON (auto-generato)

src/components/
├── Leaderboard.tsx       # Componente UI leaderboard
└── ChiLHaDetto.tsx      # Integrazione nel gioco

src/types.ts             # Tipi TypeScript
```

## 🎨 Design

### 🏆 Leaderboard UI
- **Design epico**: Gradiente amber/orange con effetti glow
- **Posizioni colorate**: 
  - 🥇 1° posto: Oro
  - 🥈 2° posto: Argento  
  - 🥉 3° posto: Bronzo
  - 4°-5° posto: Amber
- **Animazioni**: Fade-in, ping, shimmer
- **Responsive**: Ottimizzato per mobile e desktop

### 📱 Form Salvataggio
- **Validazione**: Nome obbligatorio, max 20 caratteri
- **Feedback**: Messaggi di successo/errore
- **UX**: Input con placeholder e validazione real-time

## 🔒 Sicurezza

- **Validazione input**: Controllo di tutti i parametri
- **CORS**: Configurato per il frontend
- **Error handling**: Gestione errori completa
- **Fallback**: Timeout per caricamento immagini

## 🚀 Deploy

### Sviluppo Locale
1. `npm install`
2. `npm run dev:full`

### Produzione
1. `npm run build`
2. Avvia il server: `npm run server`
3. Servi i file statici dalla cartella `dist/`

## 📊 Dati Leaderboard

### Struttura Record
```json
{
  "id": 1234567890.123,
  "name": "Nome Giocatore",
  "streak": 15,
  "score": 2500,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Modalità Eracle
- **Streak**: Numero di fatiche completate (1-12)
- **Score**: Punteggio totale accumulato
- **Vittoria**: Completare tutte le 12 fatiche

### Modalità Achille  
- **Streak**: Numero di risposte corrette consecutive
- **Score**: Punteggio totale accumulato
- **Obiettivo**: Resistenza infinita

## 🎯 Logica di Ordinamento

```javascript
// 1. Ordina per streak/fatica (decrescente)
if (a.streak !== b.streak) {
  return b.streak - a.streak;
}

// 2. Ordina per punteggio (decrescente)  
if (a.score !== b.score) {
  return b.score - a.score;
}

// 3. Ordina per timestamp (crescente - chi arriva prima sta più in alto)
return new Date(a.timestamp) - new Date(b.timestamp);
```

## 🔧 Configurazione

### Porte
- **Frontend**: 5173 (Vite)
- **Backend**: 3001 (Express)

### Variabili Ambiente
- `PORT`: Porta del server (default: 3001)

## 🐛 Troubleshooting

### Server non si avvia
- Controlla che la porta 3001 sia libera
- Verifica che Node.js sia installato

### Frontend non si connette
- Controlla che il server sia attivo
- Verifica l'URL: `http://localhost:3001`

### Record non si salvano
- Controlla la console per errori
- Verifica che il file `leaderboard.json` sia scrivibile

## 📈 Statistiche

Il sistema traccia:
- **Record totali** per modalità
- **Timestamp** di ogni record
- **Punteggi** e streak
- **Nomi giocatori** (max 20 caratteri)

## 🎮 Esperienza Utente

1. **Gioca** normalmente
2. **Raggiungi** un punteggio da top 5
3. **Inserisci** il tuo nome
4. **Visualizza** la leaderboard
5. **Competi** per salire in classifica!

---

*Sistema leaderboard sviluppato per "Chi l'ha detto? - Ambiguità Edition"* 🏛️⚡
