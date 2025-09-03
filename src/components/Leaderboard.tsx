import React, { useState, useEffect } from 'react';
import { leaderboardApi, type LeaderboardData, type LeaderboardEntry } from '../lib/supabase';

interface LeaderboardProps {
  onClose: () => void;
  gameMode: 'achille' | 'millionaire' | 'classic';
  currentStreak?: number;
  currentScore?: number;
  onSaveRecord?: (name: string) => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ 
  onClose, 
  gameMode, 
  currentStreak = 0, 
  currentScore = 0,
  onSaveRecord 
}) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardData>({ achille: [], eracle: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSaveForm, setShowSaveForm] = useState(false);
  
  // Reset del form quando si apre la leaderboard
  useEffect(() => {
    setShowSaveForm(false);
  }, []);
  const [playerName, setPlayerName] = useState('');
  const [saving, setSaving] = useState(false);
  const [recordAlreadySaved, setRecordAlreadySaved] = useState(false);
  const [showMode, setShowMode] = useState<'achille' | 'eracle'>(
    (gameMode === 'millionaire' || gameMode === 'classic') ? 'eracle' : 'eracle'
  );

  // Carica la leaderboard
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        
        // Prima prova a caricare dal localStorage come fallback
        const localBackup = localStorage.getItem('chiLHaDetto_leaderboard_backup');
        if (localBackup) {
          try {
            const backupData = JSON.parse(localBackup);
            setLeaderboard(backupData);
            console.log('📦 Caricata leaderboard dal backup locale');
          } catch (e) {
            console.warn('Errore nel parsing del backup locale:', e);
          }
        }
        
        // Carica da Supabase
        const data = await leaderboardApi.getAll();
        setLeaderboard(data);
        
        // Salva il backup locale
        localStorage.setItem('chiLHaDetto_leaderboard_backup', JSON.stringify(data));
        console.log('💾 Backup locale aggiornato con dati da Supabase');
        
      } catch (err) {
        console.warn('Supabase non disponibile, usando backup locale:', err);
        // Se Supabase non risponde, usa il backup locale se disponibile
        const localBackup = localStorage.getItem('chiLHaDetto_leaderboard_backup');
        if (localBackup) {
          try {
            const backupData = JSON.parse(localBackup);
            setLeaderboard(backupData);
            setError('Supabase temporaneamente non disponibile - usando dati locali');
          } catch (e) {
            setError('Impossibile connettersi a Supabase e nessun backup disponibile');
          }
        } else {
          setError('Impossibile connettersi a Supabase');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  // Controlla se il punteggio attuale merita di essere salvato
  useEffect(() => {
    console.log('=== DEBUG LEADERBOARD VALIDATION ===');
    console.log('currentStreak:', currentStreak);
    console.log('currentScore:', currentScore);
    console.log('recordAlreadySaved:', recordAlreadySaved);
    console.log('loading:', loading);
    
    // Solo se abbiamo un punteggio valido, non è già stato salvato, e la leaderboard è stata caricata
    if (currentStreak > 0 && currentScore > 0 && !recordAlreadySaved && !loading) {
      const modeKey = (gameMode === 'millionaire' || gameMode === 'classic') ? 'eracle' : 'achille';
      const currentModeLeaderboard = leaderboard[modeKey];
      
      console.log('Mode:', modeKey);
      console.log('Leaderboard data:', currentModeLeaderboard);
      
      let isTop5 = false;
      
      if (currentModeLeaderboard.length < 5) {
        // Se ci sono meno di 5 record, c'è spazio
        isTop5 = true;
        console.log('✅ Top 5: Meno di 5 record');
      } else if (currentModeLeaderboard.length >= 5) {
        // Se ci sono già 5 record, controlla se il punteggio è migliore del 5° posto
        const fifthPlace = currentModeLeaderboard[4];
        console.log('5° posto:', fifthPlace);
        
        if (currentStreak > fifthPlace.streak) {
          isTop5 = true;
          console.log('✅ Top 5: Streak maggiore');
        } else if (currentStreak === fifthPlace.streak && currentScore > fifthPlace.score) {
          isTop5 = true;
          console.log('✅ Top 5: Stessa streak, score maggiore');
        } else {
          console.log('❌ Non Top 5: Punteggio insufficiente');
        }
      }
      
      console.log('Risultato isTop5:', isTop5);
      if (isTop5) {
        console.log('✅ Mostrando form di salvataggio');
        setShowSaveForm(true);
      } else {
        console.log('❌ Nascondendo form di salvataggio - punteggio insufficiente');
        setShowSaveForm(false);
      }
    } else {
      console.log('❌ Condizioni non soddisfatte per validazione - nascondendo form');
      setShowSaveForm(false);
    }
    console.log('=====================================');
  }, [leaderboard, currentStreak, currentScore, gameMode, recordAlreadySaved, loading]);

  // Reset del flag quando si chiude la leaderboard
  useEffect(() => {
    return () => {
      setRecordAlreadySaved(false);
    };
  }, []);



  const handleSaveRecord = async () => {
    if (!playerName.trim()) return;
    
    try {
      setSaving(true);
      const modeKey = (gameMode === 'millionaire' || gameMode === 'classic') ? 'eracle' : 'achille';
      
      // Salva su Supabase
      const updatedRecords = await leaderboardApi.addRecord(
        modeKey,
        playerName.trim(),
        currentStreak,
        currentScore
      );
      
      // Aggiorna la leaderboard locale
      const newLeaderboard = {
        ...leaderboard,
        [modeKey]: updatedRecords
      };
      setLeaderboard(newLeaderboard);
      
      // Aggiorna anche il backup locale
      localStorage.setItem('chiLHaDetto_leaderboard_backup', JSON.stringify(newLeaderboard));
      console.log('💾 Record salvato su Supabase e backup locale aggiornato');
      
      setShowSaveForm(false);
      setPlayerName('');
      setRecordAlreadySaved(true); // Previene salvataggi duplicati
      
      if (onSaveRecord) {
        onSaveRecord(playerName.trim());
      }
      
    } catch (err) {
      console.error('Errore nel salvataggio:', err);
      
      // Fallback: salva localmente anche se Supabase non risponde
      const modeKey = (gameMode === 'millionaire' || gameMode === 'classic') ? 'eracle' : 'achille';
      const currentModeLeaderboard = leaderboard[modeKey] || [];
      
      // Crea il nuovo record
      const newRecord = {
        id: Date.now(), // ID temporaneo
        name: playerName.trim(),
        streak: currentStreak,
        score: currentScore,
        timestamp: new Date().toISOString()
      };
      
      // Aggiungi il record alla leaderboard locale
      const updatedLeaderboard = [...currentModeLeaderboard, newRecord]
        .sort((a, b) => {
          if (b.streak !== a.streak) return b.streak - a.streak;
          if (b.score !== a.score) return b.score - a.score;
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        })
        .slice(0, 5); // Mantieni solo i top 5
      
      const newLeaderboard = {
        ...leaderboard,
        [modeKey]: updatedLeaderboard
      };
      
      setLeaderboard(newLeaderboard);
      localStorage.setItem('chiLHaDetto_leaderboard_backup', JSON.stringify(newLeaderboard));
      
      setShowSaveForm(false);
      setPlayerName('');
      setRecordAlreadySaved(true);
      
      setError('Supabase non disponibile - record salvato localmente');
      
      if (onSaveRecord) {
        onSaveRecord(playerName.trim());
      }
    } finally {
      setSaving(false);
    }
  };

  const getModeTitle = () => {
    return (gameMode === 'millionaire' || gameMode === 'classic') ? 'Eracle' : 'Achille';
  };

  const getModeDescription = () => {
    return (gameMode === 'millionaire' || gameMode === 'classic')
      ? 'Le 12 Fatiche - Top 5' 
      : 'Aristeia Infinita - Top 5';
  };

  const getStreakLabel = () => {
    return (gameMode === 'millionaire' || gameMode === 'classic') ? 'Fatica' : 'Streak';
  };

  const currentModeLeaderboard = showMode === 'eracle' ? leaderboard.eracle : leaderboard.achille;

  if (loading) {
    const isEracleMode = (gameMode === 'millionaire' || gameMode === 'classic');
    const containerGradient = isEracleMode 
      ? 'bg-gradient-to-br from-purple-900 to-blue-900' 
      : 'bg-gradient-to-br from-amber-900 to-orange-900';
    const borderColor = isEracleMode 
      ? 'border-purple-400/30' 
      : 'border-amber-400/30';
    const spinnerColor = isEracleMode 
      ? 'border-purple-300/30 border-t-purple-400' 
      : 'border-amber-300/30 border-t-amber-400';

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className={`${containerGradient} rounded-3xl p-8 border-2 ${borderColor} shadow-2xl`}>
          <div className="text-center">
            <div className={`w-12 h-12 border-4 ${spinnerColor} rounded-full animate-spin mx-auto mb-4`}></div>
            <p className="text-white font-semibold">Caricamento leaderboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Determina i colori in base alla modalità visualizzata
  const isEracleMode = showMode === 'eracle';
  const containerGradient = isEracleMode 
    ? 'bg-gradient-to-br from-purple-900 to-blue-900' 
    : 'bg-gradient-to-br from-amber-900 to-orange-900';
  const borderColor = isEracleMode 
    ? 'border-purple-400/30' 
    : 'border-amber-400/30';
  const accentColor = isEracleMode 
    ? 'text-purple-200' 
    : 'text-amber-200';

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`${containerGradient} rounded-3xl p-6 border-2 ${borderColor} shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-black text-white mb-2 drop-shadow-lg">
              Leaderboard {showMode === 'eracle' ? 'Eracle' : 'Achille'}
            </h2>
            <p className={`${accentColor} font-medium`}>
              {showMode === 'eracle' ? 'Le 12 Fatiche - Top 5' : 'Aristeia Infinita - Top 5'}
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors duration-200 p-2 hover:bg-white/10 rounded-full"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mode Switch */}
        <div className="flex items-center justify-center mb-6">
          <div className="bg-white/10 rounded-2xl p-1 backdrop-blur-sm">
            <button 
              onClick={() => setShowMode('eracle')}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${
                showMode === 'eracle' ? 'bg-purple-500 text-white shadow-lg' : 'text-white/70 hover:text-white/90'
              }`}
            >
              🏛️ Eracle
            </button>
            <button 
              onClick={() => setShowMode('achille')}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${
                showMode === 'achille' ? 'bg-amber-500 text-white shadow-lg' : 'text-white/70 hover:text-white/90'
              }`}
            >
              ⚡ Achille
            </button>
          </div>
        </div>

        {/* Form per salvare nuovo record */}
        {showSaveForm && (
          <div className={`mb-6 p-4 ${isEracleMode ? 'bg-gradient-to-r from-purple-900/60 to-blue-800/60 border-purple-400/50' : 'bg-gradient-to-r from-green-900/60 to-emerald-800/60 border-green-400/50'} rounded-2xl border-2`}>
            <h3 className={`${isEracleMode ? 'text-purple-200' : 'text-green-200'} font-bold mb-3 flex items-center gap-2`}>
              🎉 Nuovo Record!
            </h3>
            <p className={`${isEracleMode ? 'text-purple-100' : 'text-green-100'} text-sm mb-4`}>
              {isEracleMode 
                ? `Hai superato ${currentStreak} ${currentStreak === 1 ? 'fatica' : 'fatiche'} con ${currentScore} punti!`
                : `Hai totalizzato una streak di ${currentStreak} con ${currentScore} punti!`
              }
              <br />
              Inserisci il tuo nome per entrare nella leaderboard:
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Il tuo nome..."
                className={`w-full sm:flex-1 px-4 py-2 bg-black/40 border ${isEracleMode ? 'border-purple-400/30 focus:border-purple-400' : 'border-green-400/30 focus:border-green-400'} rounded-xl text-white placeholder-gray-400 focus:outline-none text-sm sm:text-base`}
                maxLength={13}
                onKeyPress={(e) => e.key === 'Enter' && handleSaveRecord()}
              />
              <button
                onClick={handleSaveRecord}
                disabled={!playerName.trim() || saving}
                className={`w-full sm:w-auto px-6 py-2 ${isEracleMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-green-600 hover:bg-green-700'} disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors duration-200 text-sm sm:text-base`}
              >
                {saving ? 'Salvando...' : 'Salva'}
              </button>
            </div>
          </div>
        )}

        {/* Errore */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/60 rounded-2xl border-2 border-red-400/50">
            <p className="text-red-200 font-medium">{error}</p>
          </div>
        )}

        {/* Leaderboard */}
        <div className="space-y-3">
          {currentModeLeaderboard.length === 0 ? (
            <div className="text-center py-8">
              <p className={`${accentColor} text-lg font-medium`}>
                Nessun record ancora! Sii il primo a entrare nella leaderboard!
              </p>
            </div>
          ) : (
            currentModeLeaderboard.map((entry, index) => (
              <div
                key={entry.id}
                className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-200 ${
                  index === 0 
                    ? 'bg-gradient-to-r from-yellow-600/40 to-amber-600/40 border-yellow-400/50 shadow-lg' 
                    : index === 1
                    ? 'bg-gradient-to-r from-gray-500/40 to-gray-600/40 border-gray-400/50'
                    : index === 2
                    ? 'bg-gradient-to-r from-orange-600/40 to-red-600/40 border-orange-400/50'
                    : 'bg-gradient-to-r from-amber-800/40 to-orange-800/40 border-amber-400/30'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Posizione */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${
                    index === 0 ? 'bg-yellow-500 text-black' :
                    index === 1 ? 'bg-gray-400 text-black' :
                    index === 2 ? 'bg-orange-500 text-white' :
                    'bg-amber-600 text-white'
                  }`}>
                    {index + 1}
                  </div>
                  
                  {/* Nome */}
                  <div>
                    <p className="text-white font-bold text-lg">{entry.name}</p>
                    <p className={`${accentColor} text-sm`}>
                      {new Date(entry.timestamp).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                </div>
                
                {/* Statistiche */}
                <div className="text-right">
                  <p className="text-white font-bold text-lg">
                    {entry.streak} {showMode === 'eracle' ? (entry.streak === 1 ? 'Fatica' : 'Fatiche') : 'Streak'}
                  </p>
                  <p className={`${accentColor} text-sm`}>
                    {entry.score.toLocaleString()} pts
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className={`mt-6 pt-4 border-t ${isEracleMode ? 'border-purple-400/20' : 'border-amber-400/20'}`}>
          <p className={`${accentColor} text-sm text-center`}>
            {showMode === 'eracle' 
              ? 'Ordinati per fatiche superate, poi per punteggio.'
              : 'Ordinati per streak raggiunta, poi per punteggio.'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
