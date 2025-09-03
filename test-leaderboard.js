// Script per testare e aggiungere record alla leaderboard
// Esegui con: node test-leaderboard.js

const API_URL = 'https://chi-l-ha-detto.onrender.com/api/leaderboard';

// Funzione per aggiungere un record
async function addRecord(mode, name, streak, score) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mode: mode, // 'achille' o 'eracle'
        name: name,
        streak: streak,
        score: score
      })
    });
    
    const data = await response.json();
    console.log('Record aggiunto:', data);
    return data;
  } catch (error) {
    console.error('Errore:', error);
  }
}

// Funzione per vedere la leaderboard
async function getLeaderboard() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    console.log('Leaderboard attuale:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Errore:', error);
  }
}

// Esempi di utilizzo
async function main() {
  console.log('=== LEADERBOARD ATTUALE ===');
  await getLeaderboard();
  
  console.log('\n=== AGGIUNGO RECORD DI TEST ===');
  
  // Aggiungi record per modalità Achille
  await addRecord('achille', 'TestPlayer1', 25, 5000);
  await addRecord('achille', 'TestPlayer2', 20, 4200);
  await addRecord('achille', 'TestPlayer3', 18, 3800);
  
  // Aggiungi record per modalità Eracle
  await addRecord('eracle', 'TestDio1', 12, 12000);
  await addRecord('eracle', 'TestDio2', 11, 11500);
  await addRecord('eracle', 'TestDio3', 10, 10800);
  
  console.log('\n=== LEADERBOARD AGGIORNATA ===');
  await getLeaderboard();
}

// Esegui se chiamato direttamente
if (require.main === module) {
  main();
}

module.exports = { addRecord, getLeaderboard };
