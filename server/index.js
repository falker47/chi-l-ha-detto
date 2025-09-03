import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Path per il file della leaderboard
const LEADERBOARD_FILE = path.join(__dirname, 'leaderboard.json');

// Inizializza il file leaderboard se non esiste
const initializeLeaderboard = () => {
  if (!fs.existsSync(LEADERBOARD_FILE)) {
    const initialData = {
      achille: [],
      eracle: []
    };
    fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(initialData, null, 2));
  }
};

// Carica la leaderboard
const loadLeaderboard = () => {
  try {
    const data = fs.readFileSync(LEADERBOARD_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Errore nel caricamento della leaderboard:', error);
    return { achille: [], eracle: [] };
  }
};

// Salva la leaderboard
const saveLeaderboard = (data) => {
  try {
    fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Errore nel salvataggio della leaderboard:', error);
    return false;
  }
};

// Funzione per ordinare la leaderboard
const sortLeaderboard = (entries) => {
  return entries.sort((a, b) => {
    // Prima ordina per streak/fatica (decrescente)
    if (a.streak !== b.streak) {
      return b.streak - a.streak;
    }
    // Poi per punteggio (decrescente)
    if (a.score !== b.score) {
      return b.score - a.score;
    }
    // Infine per timestamp (crescente - chi arriva prima sta più in alto)
    return new Date(a.timestamp) - new Date(b.timestamp);
  });
};

// Funzione per aggiungere un nuovo record
const addRecord = (mode, playerName, streak, score) => {
  const leaderboard = loadLeaderboard();
  const modeKey = mode === 'achille' ? 'achille' : 'eracle';
  
  const newRecord = {
    id: Date.now() + Math.random(), // ID univoco
    name: playerName,
    streak: streak,
    score: score,
    timestamp: new Date().toISOString()
  };
  
  // Aggiungi il nuovo record
  leaderboard[modeKey].push(newRecord);
  
  // Ordina e mantieni solo i top 5
  leaderboard[modeKey] = sortLeaderboard(leaderboard[modeKey]).slice(0, 5);
  
  // Salva
  if (saveLeaderboard(leaderboard)) {
    return { success: true, leaderboard: leaderboard[modeKey] };
  } else {
    return { success: false, error: 'Errore nel salvataggio' };
  }
};

// Routes

// GET /api/leaderboard - Ottieni la leaderboard completa
app.get('/api/leaderboard', (req, res) => {
  try {
    const leaderboard = loadLeaderboard();
    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Errore nel caricamento della leaderboard'
    });
  }
});

// GET /api/leaderboard/:mode - Ottieni la leaderboard per una modalità specifica
app.get('/api/leaderboard/:mode', (req, res) => {
  try {
    const { mode } = req.params;
    const leaderboard = loadLeaderboard();
    
    if (mode !== 'achille' && mode !== 'eracle') {
      return res.status(400).json({
        success: false,
        error: 'Modalità non valida. Usa "achille" o "eracle"'
      });
    }
    
    res.json({
      success: true,
      data: leaderboard[mode]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Errore nel caricamento della leaderboard'
    });
  }
});

// POST /api/leaderboard - Aggiungi un nuovo record
app.post('/api/leaderboard', (req, res) => {
  try {
    const { mode, name, streak, score } = req.body;
    
    // Validazione
    if (!mode || !name || streak === undefined || score === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Parametri mancanti: mode, name, streak, score sono richiesti'
      });
    }
    
    if (mode !== 'achille' && mode !== 'eracle') {
      return res.status(400).json({
        success: false,
        error: 'Modalità non valida. Usa "achille" o "eracle"'
      });
    }
    
    if (typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Nome non valido'
      });
    }
    
    if (typeof streak !== 'number' || streak < 0) {
      return res.status(400).json({
        success: false,
        error: 'Streak non valido'
      });
    }
    
    if (typeof score !== 'number' || score < 0) {
      return res.status(400).json({
        success: false,
        error: 'Punteggio non valido'
      });
    }
    
    // Aggiungi il record
    const result = addRecord(mode, name.trim(), streak, score);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Record aggiunto con successo',
        data: result.leaderboard
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Errore interno del server'
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server leaderboard attivo',
    timestamp: new Date().toISOString()
  });
});

// Inizializza e avvia il server
initializeLeaderboard();

app.listen(PORT, () => {
  console.log(`🚀 Server leaderboard attivo sulla porta ${PORT}`);
  console.log(`📊 API disponibili:`);
  console.log(`   GET  /api/leaderboard - Leaderboard completa`);
  console.log(`   GET  /api/leaderboard/:mode - Leaderboard per modalità`);
  console.log(`   POST /api/leaderboard - Aggiungi record`);
  console.log(`   GET  /api/health - Health check`);
});
