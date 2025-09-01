import React, { useState } from "react";
import ChiLHaDetto from "./components/ChiLHaDetto";

function MainMenu({ 
  onStartGame, 
  includeSensitive, 
  setIncludeSensitive 
}: { 
  onStartGame: () => void;
  includeSensitive: boolean;
  setIncludeSensitive: (value: boolean) => void;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="images/hero-bg.png" 
          alt="Personaggi e avvenimenti storici" 
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Overlay scuro per migliorare la leggibilità */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60"></div>
      
      {/* Animated background elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-white/5 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-white/5 rounded-full blur-xl animate-pulse delay-1000"></div>
      
      {/* Content Layer */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-white p-4 sm:p-6 md:p-8">
        <div className="text-center max-w-7xl mx-auto">
          <div className="relative mb-8">
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-white drop-shadow-2xl relative z-10" 
                style={{ 
                  textShadow: '4px 4px 8px rgba(0, 0, 0, 0.8), 2px 2px 4px rgba(0, 0, 0, 0.9), 0 0 20px rgba(0, 0, 0, 0.5)' 
                }}>
              Chi l'ha detto?
            </h1>
            {/* Outline effect per maggiore contrasto */}
            <h1 className="absolute inset-0 text-4xl sm:text-6xl md:text-8xl font-black text-amber-300 opacity-30 blur-sm">
              Chi l'ha detto?
            </h1>
          </div>
          
          <div className="relative mb-12">
            <p className="text-lg sm:text-xl md:text-3xl text-center max-w-4xl leading-relaxed text-white font-medium relative z-10 px-4"
               style={{ 
                 textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9), 1px 1px 2px rgba(0, 0, 0, 1), 0 0 15px rgba(0, 0, 0, 0.7)' 
               }}>
              Metti alla prova la tua conoscenza delle citazioni e del loro vero contesto storico.
            </p>
            {/* Background semi-trasparente dietro il testo */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-2xl -m-4"></div>
          </div>
          
          {/* Toggle per contenuti sensibili */}
          <div className="mb-8 flex items-center justify-center gap-4">
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3 bg-black/40 backdrop-blur-md rounded-2xl px-4 sm:px-6 py-4 border border-white/20 shadow-2xl">
              <span className="text-white font-semibold text-base sm:text-lg drop-shadow-lg text-center sm:text-left"
                    style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}>
                Includi contenuti storici sensibili
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIncludeSensitive(!includeSensitive)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-black/20 shadow-lg ${
                    includeSensitive ? 'bg-amber-500' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                      includeSensitive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-sm text-white font-medium drop-shadow-lg whitespace-nowrap"
                      style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}>
                  {includeSensitive ? '✓ Attivo' : '✗ Disattivo'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Descrizione del toggle */}
          <div className="mb-8 text-center">
            <div className="relative">
              <p className="text-white text-sm max-w-2xl mx-auto leading-relaxed font-medium px-6 py-3 relative z-10"
                 style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.9)' }}>
                {includeSensitive ? (
                  "Le domande includeranno anche citazioni legate a regimi autoritari e contenuti storici controversi."
                ) : (
                  "Verranno escluse le citazioni più controverse per un'esperienza più adatta a tutti i giocatori."
                )}
              </p>
              {/* Background semi-trasparente per la descrizione */}
              <div className="absolute inset-0 bg-black/25 backdrop-blur-sm rounded-xl"></div>
            </div>
          </div>
          
          <button
            onClick={onStartGame}
            className="group bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 font-bold py-5 px-16 rounded-full shadow-2xl hover:shadow-amber-500/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 text-2xl border-2 border-amber-300 relative overflow-hidden backdrop-blur-sm"
          >
            <span className="relative z-10">Inizia la Partita</span>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-100 to-amber-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
          
          <div className="mt-20 text-center">
            <div className="relative inline-block">
              <p className="text-white text-lg font-medium relative z-10 px-4 py-2"
                 style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)' }}>
                Scopri la verità dietro le citazioni più famose
              </p>
              <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [includeSensitive, setIncludeSensitive] = useState(false); // Default: disattivo

  return (
    <div className="min-h-screen">
      {gameStarted ? (
        <ChiLHaDetto 
          includeSensitive={includeSensitive}
          onBackToMenu={() => setGameStarted(false)}
        />
      ) : (
        <MainMenu 
          onStartGame={() => setGameStarted(true)} 
          includeSensitive={includeSensitive}
          setIncludeSensitive={setIncludeSensitive}
        />
      )}
    </div>
  );
}

export default App;



