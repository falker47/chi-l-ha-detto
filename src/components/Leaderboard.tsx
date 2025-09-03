import React, { useState, useEffect } from 'react';

interface LeaderboardEntry {
  id: number;
  name: string;
  streak: number;
  score: number;
  timestamp: string;
}

interface LeaderboardData {
  achille: LeaderboardEntry[];
  eracle: LeaderboardEntry[];
}

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
  const [playerName, setPlayerName] = useState('');
  const [saving, setSaving] = useState(false);

  // Carica la leaderboard
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        // Usa l'URL di Render in produzione, localhost in sviluppo
        const apiUrl = window.location.hostname === 'localhost' 
          ? 'http://localhost:3001/api/leaderboard'
          : 'https://chi-l-ha-detto.onrender.com/api/leaderboard';
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.success) {
          setLeaderboard(data.data);
        } else {
          setError('Errore nel caricamento della leaderboard');
        }
      } catch (err) {
        setError('Impossibile connettersi al server');
        console.error('Errore nel caricamento della leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  // Controlla se il punteggio attuale merita di essere salvato
  useEffect(() => {
    if (currentStreak > 0 && currentScore > 0) {
      const modeKey = (gameMode === 'millionaire' || gameMode === 'classic') ? 'eracle' : 'achille';
      const currentModeLeaderboard = leaderboard[modeKey];
      
      // Controlla se c'è spazio nella top 5 o se il punteggio è migliore del 5° posto
      if (currentModeLeaderboard.length < 5 || 
          currentStreak > currentModeLeaderboard[4]?.streak ||
          (currentStreak === currentModeLeaderboard[4]?.streak && currentScore > currentModeLeaderboard[4]?.score)) {
        setShowSaveForm(true);
      }
    }
  }, [leaderboard, currentStreak, currentScore, gameMode]);

  const handleSaveRecord = async () => {
    if (!playerName.trim()) return;
    
    try {
      setSaving(true);
      const modeKey = (gameMode === 'millionaire' || gameMode === 'classic') ? 'eracle' : 'achille';
      
      // Usa l'URL di Render in produzione, localhost in sviluppo
      const apiUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:3001/api/leaderboard'
        : 'https://chi-l-ha-detto.onrender.com/api/leaderboard';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: modeKey,
          name: playerName.trim(),
          streak: currentStreak,
          score: currentScore
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Aggiorna la leaderboard locale
        setLeaderboard(prev => ({
          ...prev,
          [modeKey]: data.data
        }));
        
        setShowSaveForm(false);
        setPlayerName('');
        
        if (onSaveRecord) {
          onSaveRecord(playerName.trim());
        }
      } else {
        setError(data.error || 'Errore nel salvataggio del record');
      }
    } catch (err) {
      setError('Impossibile salvare il record');
      console.error('Errore nel salvataggio:', err);
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

  const currentModeLeaderboard = (gameMode === 'millionaire' || gameMode === 'classic') ? leaderboard.eracle : leaderboard.achille;

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

  // Determina i colori in base alla modalità
  const isEracleMode = (gameMode === 'millionaire' || gameMode === 'classic');
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
              🏆 Leaderboard {getModeTitle()}
            </h2>
            <p className={`${accentColor} font-medium`}>
              {getModeDescription()}
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

        {/* Form per salvare nuovo record */}
        {showSaveForm && (
          <div className={`mb-6 p-4 ${isEracleMode ? 'bg-gradient-to-r from-purple-900/60 to-blue-800/60 border-purple-400/50' : 'bg-gradient-to-r from-green-900/60 to-emerald-800/60 border-green-400/50'} rounded-2xl border-2`}>
            <h3 className={`${isEracleMode ? 'text-purple-200' : 'text-green-200'} font-bold mb-3 flex items-center gap-2`}>
              🎉 Nuovo Record!
            </h3>
            <p className={`${isEracleMode ? 'text-purple-100' : 'text-green-100'} text-sm mb-4`}>
              Hai raggiunto {currentStreak} {getStreakLabel().toLowerCase()} con {currentScore} punti!
              Inserisci il tuo nome per entrare nella leaderboard:
            </p>
            
            <div className="flex gap-3">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Il tuo nome..."
                className={`flex-1 px-4 py-2 bg-black/40 border ${isEracleMode ? 'border-purple-400/30 focus:border-purple-400' : 'border-green-400/30 focus:border-green-400'} rounded-xl text-white placeholder-gray-400 focus:outline-none`}
                maxLength={20}
                onKeyPress={(e) => e.key === 'Enter' && handleSaveRecord()}
              />
              <button
                onClick={handleSaveRecord}
                disabled={!playerName.trim() || saving}
                className={`px-6 py-2 ${isEracleMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-green-600 hover:bg-green-700'} disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors duration-200`}
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
                    {entry.streak} {getStreakLabel()}
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
            La leaderboard ordina per {getStreakLabel().toLowerCase()}, poi per punteggio, infine per data
          </p>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
