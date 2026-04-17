import React, { useState, useEffect } from 'react';
import { leaderboardApi, type LeaderboardData, type LeaderboardEntry } from '../lib/supabase';

interface LeaderboardProps {
  onClose: () => void;
  gameMode: 'achille' | 'millionaire' | 'classic';
  currentTheme?: 'classica' | 'intrattenimento' | 'trash' | 'mista';
  currentStreak?: number;
  currentScore?: number;
  onSaveRecord?: (name: string) => void;
  disableModeSwitch?: boolean; // Nuovo parametro per disabilitare i bottoni di switch
}

const Leaderboard: React.FC<LeaderboardProps> = ({ 
  onClose, 
  gameMode, 
  currentTheme = 'classica',
  currentStreak = 0, 
  currentScore = 0,
  onSaveRecord,
  disableModeSwitch = false
}) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardData>({ 
    achille: [], 
    eracle: [],
    intrattenimento_achille: [],
    intrattenimento_eracle: [],
    trash_achille: [],
    trash_eracle: [],
    mista_achille: [],
    mista_eracle: []
  });
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
    (gameMode === 'millionaire' || gameMode === 'classic') ? 'eracle' : 'achille'
  );

  // Funzione per ottenere la chiave della leaderboard in base al tema e modalità
  const getLeaderboardKey = (theme: string, mode: 'achille' | 'eracle'): keyof LeaderboardData => {
    if (theme === 'classica') {
      return mode;
    }
    return `${theme}_${mode}` as keyof LeaderboardData;
  };

  // Funzione per ottenere i colori dei bottoni di switch in base al tema
  const getSwitchButtonColors = (mode: 'achille' | 'eracle') => {
    if (currentTheme === 'intrattenimento') {
      if (mode === 'eracle') {
        // HOLLYWOOD - viola
        return {
          selected: 'bg-purple-500 text-white shadow-lg',
          unselected: 'text-white/70 hover:text-white/90 hover:bg-purple-500/20'
        };
      } else {
        // Superstar - fucsia/rosa
        return {
          selected: 'bg-pink-500 text-white shadow-lg',
          unselected: 'text-white/70 hover:text-white/90 hover:bg-pink-500/20'
        };
      }
    } else if (currentTheme === 'trash') {
      if (mode === 'eracle') {
        // Memelord - blu elettrico
        return {
          selected: 'bg-blue-500 text-white shadow-lg',
          unselected: 'text-white/70 hover:text-white/90 hover:bg-blue-500/20'
        };
      } else {
        // Memegod - verde neon
        return {
          selected: 'bg-green-500 text-white shadow-lg',
          unselected: 'text-white/70 hover:text-white/90 hover:bg-green-500/20'
        };
      }
    } else if (currentTheme === 'mista') {
      if (mode === 'eracle') {
        // Gran Sapiarca - arancione
        return {
          selected: 'bg-orange-500 text-white shadow-lg',
          unselected: 'text-white/70 hover:text-white/90 hover:bg-orange-500/20'
        };
      } else {
        // Il Supremo - giallo
        return {
          selected: 'bg-yellow-500 text-white shadow-lg',
          unselected: 'text-white/70 hover:text-white/90 hover:bg-yellow-500/20'
        };
      }
    } else {
      // Tema classica - colori originali
      if (mode === 'eracle') {
        return {
          selected: 'bg-purple-500 text-white shadow-lg',
          unselected: 'text-white/70 hover:text-white/90 hover:bg-purple-500/20'
        };
      } else {
        return {
          selected: 'bg-amber-500 text-white shadow-lg',
          unselected: 'text-white/70 hover:text-white/90 hover:bg-amber-500/20'
        };
      }
    }
  };

  // Blocca il cambio di modalità se disableModeSwitch è true
  useEffect(() => {
    if (disableModeSwitch) {
      const currentMode = (gameMode === 'millionaire' || gameMode === 'classic') ? 'eracle' : 'achille';
      setShowMode(currentMode);
    }
  }, [disableModeSwitch, gameMode]);

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
      const currentMode = (gameMode === 'millionaire' || gameMode === 'classic') ? 'eracle' : 'achille';
      const leaderboardKey = getLeaderboardKey(currentTheme, currentMode);
      const currentModeLeaderboard = leaderboard[leaderboardKey];
      
      console.log('Mode:', currentMode);
      console.log('Theme:', currentTheme);
      console.log('Leaderboard key:', leaderboardKey);
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
      const currentMode = (gameMode === 'millionaire' || gameMode === 'classic') ? 'eracle' : 'achille';
      
      // Salva su Supabase
      const updatedRecords = await leaderboardApi.addRecord(
        currentMode,
        currentTheme,
        playerName.trim(),
        currentStreak,
        currentScore
      );
      
      // Aggiorna la leaderboard locale
      const newLeaderboard = {
        ...leaderboard,
        [leaderboardKey]: updatedRecords
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
      const currentMode = (gameMode === 'millionaire' || gameMode === 'classic') ? 'eracle' : 'achille';
      const leaderboardKey = getLeaderboardKey(currentTheme, currentMode);
      const currentModeLeaderboard = leaderboard[leaderboardKey] || [];
      
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
    const baseMode = (gameMode === 'millionaire' || gameMode === 'classic') ? 'Eracle' : 'Achille';
    
    // Mappa i temi ai nomi delle modalità
    const themeNames = {
      'classica': { eracle: 'Eracle', achille: 'Achille' },
      'intrattenimento': { eracle: 'Verso la Fama', achille: 'Superstar' },
      'trash': { eracle: 'Verso la Fama', achille: 'Memelord' },
      'mista': { eracle: 'Gran Sapiarca', achille: 'Il Supremo' }
    };
    
    return themeNames[currentTheme][showMode] || baseMode;
  };

  const getModeDescription = () => {
    const descriptions = {
      'classica': { eracle: '🏛️ Le 12 Fatiche - Top 5', achille: '🏛️ Aristeia Infinita - Top 5' },
      'intrattenimento': { eracle: '🎬 Hollywood - Top 5', achille: '🎬 Superstar - Top 5' },
      'trash': { eracle: '🗑️ Memelord - Top 5', achille: '🗑️ Memegod - Top 5' },
      'mista': { eracle: '🌟 Gran Sapiarca - Top 5', achille: '🌟 Il Supremo - Top 5' }
    };
    
    return descriptions[currentTheme][showMode] || '🌟 Top 5';
  };

  const getStreakLabel = () => {
    return (gameMode === 'millionaire' || gameMode === 'classic') ? 'Fatica' : 'Streak';
  };

  // Crea una versione temporanea della leaderboard con il nuovo record se presente
  const getCurrentLeaderboard = () => {
    const leaderboardKey = getLeaderboardKey(currentTheme, showMode);
    const baseLeaderboard = leaderboard[leaderboardKey] || [];
    
    // Se c'è un nuovo record da salvare, inseriscilo temporaneamente nella classifica
    if (showSaveForm && currentStreak > 0 && currentScore > 0) {
      const newRecord = {
        id: 'temp-' + Date.now(),
        name: 'Tu',
        streak: currentStreak,
        score: currentScore,
        timestamp: new Date().toISOString(),
        isTemporary: true
      };
      
      // Inserisci il nuovo record nella posizione corretta
      const updatedLeaderboard = [...baseLeaderboard, newRecord]
        .sort((a, b) => {
          if (b.streak !== a.streak) return b.streak - a.streak;
          if (b.score !== a.score) return b.score - a.score;
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        })
        .slice(0, 5); // Mantieni solo i top 5
      
      return updatedLeaderboard;
    }
    
    return baseLeaderboard;
  };

  const currentModeLeaderboard = getCurrentLeaderboard();

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
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
        <div className={`${containerGradient} rounded-2xl p-4 sm:p-6 border-2 ${borderColor} shadow-2xl`}>
          <div className="text-center">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 border-4 ${spinnerColor} rounded-full animate-spin mx-auto mb-3`}></div>
            <p className="text-white font-semibold text-sm sm:text-base">Caricamento leaderboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Determina i colori in base alla modalità visualizzata e al tema
  const isEracleMode = showMode === 'eracle';
  
  // Colori specifici per tema
  const getThemeColors = () => {
    if (currentTheme === 'intrattenimento') {
      return {
        containerGradient: isEracleMode 
          ? 'bg-gradient-to-br from-purple-900 to-indigo-900' // HOLLYWOOD - gradiente viola
          : 'bg-gradient-to-br from-pink-900 to-rose-900', // superstar - gradiente fucsia/rosa
        borderColor: isEracleMode 
          ? 'border-purple-400/30' 
          : 'border-pink-400/30',
        accentColor: isEracleMode 
          ? 'text-purple-200' 
          : 'text-pink-200'
      };
    } else if (currentTheme === 'trash') {
      return {
        containerGradient: isEracleMode 
          ? 'bg-gradient-to-br from-blue-900 to-cyan-900' // memelord - gradiente blu elettrico
          : 'bg-gradient-to-br from-green-900 to-emerald-900', // memegod - gradiente verde neon
        borderColor: isEracleMode 
          ? 'border-blue-400/30' 
          : 'border-green-400/30',
        accentColor: isEracleMode 
          ? 'text-blue-200' 
          : 'text-green-200'
      };
    } else {
      // Tema classica o mista - colori originali
      return {
        containerGradient: isEracleMode 
          ? 'bg-gradient-to-br from-purple-900 to-blue-900' 
          : 'bg-gradient-to-br from-amber-900 to-orange-900',
        borderColor: isEracleMode 
          ? 'border-purple-400/30' 
          : 'border-amber-400/30',
        accentColor: isEracleMode 
          ? 'text-purple-200' 
          : 'text-amber-200'
      };
    }
  };
  
  const themeColors = getThemeColors();
  const containerGradient = themeColors.containerGradient;
  const borderColor = themeColors.borderColor;
  const accentColor = themeColors.accentColor;

  // Funzione per ottenere i colori delle posizioni in base al tema
  const getPositionColors = (index: number) => {
    if (currentTheme === 'intrattenimento') {
      if (isEracleMode) {
        // HOLLYWOOD - gradiente viola
        return index === 0 
          ? 'bg-gradient-to-r from-purple-600/40 to-indigo-600/40 border-purple-400/50 shadow-lg'
          : index === 1
          ? 'bg-gradient-to-r from-purple-500/40 to-indigo-500/40 border-purple-400/50'
          : index === 2
          ? 'bg-gradient-to-r from-purple-400/40 to-indigo-400/40 border-purple-300/50'
          : 'bg-gradient-to-r from-purple-800/40 to-indigo-800/40 border-purple-400/30';
      } else {
        // superstar - gradiente fucsia/rosa
        return index === 0 
          ? 'bg-gradient-to-r from-pink-600/40 to-rose-600/40 border-pink-400/50 shadow-lg'
          : index === 1
          ? 'bg-gradient-to-r from-pink-500/40 to-rose-500/40 border-pink-400/50'
          : index === 2
          ? 'bg-gradient-to-r from-pink-400/40 to-rose-400/40 border-pink-300/50'
          : 'bg-gradient-to-r from-pink-800/40 to-rose-800/40 border-pink-400/30';
      }
    } else if (currentTheme === 'trash') {
      if (isEracleMode) {
        // memelord - gradiente blu elettrico
        return index === 0 
          ? 'bg-gradient-to-r from-blue-600/40 to-cyan-600/40 border-blue-400/50 shadow-lg'
          : index === 1
          ? 'bg-gradient-to-r from-blue-500/40 to-cyan-500/40 border-blue-400/50'
          : index === 2
          ? 'bg-gradient-to-r from-blue-400/40 to-cyan-400/40 border-blue-300/50'
          : 'bg-gradient-to-r from-blue-800/40 to-cyan-800/40 border-blue-400/30';
      } else {
        // memegod - gradiente verde neon
        return index === 0 
          ? 'bg-gradient-to-r from-green-600/40 to-emerald-600/40 border-green-400/50 shadow-lg'
          : index === 1
          ? 'bg-gradient-to-r from-green-500/40 to-emerald-500/40 border-green-400/50'
          : index === 2
          ? 'bg-gradient-to-r from-green-400/40 to-emerald-400/40 border-green-300/50'
          : 'bg-gradient-to-r from-green-800/40 to-emerald-800/40 border-green-400/30';
      }
    } else {
      // Tema classica o mista - colori originali
      return index === 0 
        ? 'bg-gradient-to-r from-yellow-600/40 to-amber-600/40 border-yellow-400/50 shadow-lg' 
        : index === 1
        ? 'bg-gradient-to-r from-gray-500/40 to-gray-600/40 border-gray-400/50'
        : index === 2
        ? 'bg-gradient-to-r from-orange-600/40 to-red-600/40 border-orange-400/50'
        : 'bg-gradient-to-r from-amber-800/40 to-orange-800/40 border-amber-400/30';
    }
  };

  // Funzione per ottenere i colori dei numeri di posizione
  const getPositionNumberColors = (index: number) => {
    if (currentTheme === 'intrattenimento') {
      if (isEracleMode) {
        // HOLLYWOOD - viola
        return index === 0 ? 'bg-purple-500 text-white' :
               index === 1 ? 'bg-purple-400 text-white' :
               index === 2 ? 'bg-purple-300 text-black' :
               'bg-purple-600 text-white';
      } else {
        // superstar - fucsia/rosa
        return index === 0 ? 'bg-pink-500 text-white' :
               index === 1 ? 'bg-pink-400 text-white' :
               index === 2 ? 'bg-pink-300 text-black' :
               'bg-pink-600 text-white';
      }
    } else if (currentTheme === 'trash') {
      if (isEracleMode) {
        // memelord - blu elettrico
        return index === 0 ? 'bg-blue-500 text-white' :
               index === 1 ? 'bg-blue-400 text-white' :
               index === 2 ? 'bg-blue-300 text-black' :
               'bg-blue-600 text-white';
      } else {
        // memegod - verde neon
        return index === 0 ? 'bg-green-500 text-white' :
               index === 1 ? 'bg-green-400 text-white' :
               index === 2 ? 'bg-green-300 text-black' :
               'bg-green-600 text-white';
      }
    } else {
      // Tema classica o mista - colori originali
      return index === 0 ? 'bg-yellow-500 text-black' :
             index === 1 ? 'bg-gray-400 text-black' :
             index === 2 ? 'bg-orange-500 text-white' :
             'bg-amber-600 text-white';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className={`${containerGradient} rounded-2xl p-3 sm:p-4 border-2 ${borderColor} shadow-2xl max-w-xl w-full max-h-[95vh] overflow-y-auto`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white mb-1 drop-shadow-lg">
              Leaderboard {getModeTitle()}
            </h2>
            <p className={`${accentColor} font-medium text-sm`}>
              {getModeDescription()}
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors duration-200 p-1 sm:p-2 hover:bg-white/10 rounded-full"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mode Switch - Solo se non disabilitato */}
        {!disableModeSwitch && (
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <div className="bg-white/10 rounded-xl p-1 backdrop-blur-sm">
              <button 
                onClick={() => setShowMode('eracle')}
                className={`px-4 sm:px-6 py-2 rounded-lg font-semibold transition-all duration-200 text-sm ${
                  showMode === 'eracle' 
                    ? getSwitchButtonColors('eracle').selected 
                    : getSwitchButtonColors('eracle').unselected
                }`}
              >
                {currentTheme === 'classica' ? '🏔️ Eracle' : 
                 currentTheme === 'intrattenimento' ? '🏔️ Hollywood' :
                 currentTheme === 'trash' ? '🏔️ Memelord' :
                 '🏔️ Gran Sapiarca'}
              </button>
              <button 
                onClick={() => setShowMode('achille')}
                className={`px-4 sm:px-6 py-2 rounded-lg font-semibold transition-all duration-200 text-sm ${
                  showMode === 'achille' 
                    ? getSwitchButtonColors('achille').selected 
                    : getSwitchButtonColors('achille').unselected
                }`}
              >
                {currentTheme === 'classica' ? '⚔️ Achille' : 
                 currentTheme === 'intrattenimento' ? '⚔️ Superstar' :
                 currentTheme === 'trash' ? '⚔️ Memegod' :
                 '⚔️ Il Supremo'}
              </button>
            </div>
          </div>
        )}

        {/* Form per salvare nuovo record */}
        {showSaveForm && (
          <div className={`mb-3 sm:mb-4 p-3 ${isEracleMode ? 'bg-gradient-to-r from-purple-900/60 to-blue-800/60 border-purple-400/50' : 'bg-gradient-to-r from-green-900/60 to-emerald-800/60 border-green-400/50'} rounded-xl border-2`}>
            <h3 className={`${isEracleMode ? 'text-purple-200' : 'text-green-200'} font-bold mb-2 flex items-center gap-2 text-sm`}>
              🎉 Sei nella Top 5!
            </h3>
            <p className={`${isEracleMode ? 'text-purple-100' : 'text-green-100'} text-xs mb-3`}>
              Inserisci il tuo nome per confermare il record:
            </p>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Il tuo nome..."
                className={`w-full sm:flex-1 px-3 py-2 bg-black/40 border ${isEracleMode ? 'border-purple-400/30 focus:border-purple-400' : 'border-green-400/30 focus:border-green-400'} rounded-lg text-white placeholder-gray-400 focus:outline-none text-sm`}
                maxLength={20}
                onKeyPress={(e) => e.key === 'Enter' && handleSaveRecord()}
              />
              <button
                onClick={handleSaveRecord}
                disabled={!playerName.trim() || saving}
                className={`w-full sm:w-auto px-4 py-2 ${isEracleMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-green-600 hover:bg-green-700'} disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200 text-sm`}
              >
                {saving ? 'Salvando...' : 'Conferma'}
              </button>
            </div>
          </div>
        )}

        {/* Errore */}
        {error && (
          <div className="mb-3 sm:mb-4 p-3 bg-red-900/60 rounded-xl border-2 border-red-400/50">
            <p className="text-red-200 font-medium text-sm">{error}</p>
          </div>
        )}

        {/* Leaderboard */}
        <div className="space-y-2">
          {currentModeLeaderboard.length === 0 ? (
            <div className="text-center py-4">
              <p className={`${accentColor} text-sm font-medium`}>
                Nessun record ancora! Sii il primo a entrare nella leaderboard!
              </p>
            </div>
          ) : (
            currentModeLeaderboard.map((entry, index) => {
              const isTemporary = (entry as any).isTemporary;
              return (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all duration-200 ${
                    isTemporary
                      ? 'bg-gradient-to-r from-green-600/60 to-emerald-600/60 border-green-400/70 shadow-xl animate-pulse'
                      : getPositionColors(index)
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Posizione */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                      isTemporary
                        ? 'bg-green-500 text-white'
                        : getPositionNumberColors(index)
                    }`}>
                      {index + 1}
                    </div>
                    
                    {/* Nome */}
                    <div>
                      <p className={`font-bold text-sm sm:text-base ${
                        isTemporary ? 'text-green-100' : 'text-white'
                      }`}>
                        {entry.name}
                        {isTemporary && <span className="ml-2 text-green-300">✨</span>}
                      </p>
                      <p className={`text-xs ${
                        isTemporary ? 'text-green-200' : accentColor
                      }`}>
                        {isTemporary ? 'Nuovo record!' : new Date(entry.timestamp).toLocaleDateString('it-IT')}
                      </p>
                    </div>
                  </div>
                  
                  {/* Statistiche */}
                  <div className="text-right">
                    <p className={`font-bold text-sm sm:text-base ${
                      isTemporary ? 'text-green-100' : 'text-white'
                    }`}>
                      {entry.streak} {showMode === 'eracle' ? (entry.streak === 1 ? 'Fatica' : 'Fatiche') : 'Streak'}
                    </p>
                    <p className={`text-xs ${
                      isTemporary ? 'text-green-200' : accentColor
                    }`}>
                      {entry.score.toLocaleString()} pts
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className={`mt-2 sm:mt-3 pt-1.5 sm:pt-2 border-t ${borderColor.replace('/30', '/20')}`}>
          <p className={`${accentColor} text-xs text-center`}>
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
