import React, { useState } from "react";
import ChiLHaDetto from "./components/ChiLHaDetto";

function MainMenu({ 
  onStartGame, 
  includeSensitive, 
  setIncludeSensitive,
  gameMode,
  setGameMode
}: { 
  onStartGame: (backgroundImage: string) => void;
  includeSensitive: boolean;
  setIncludeSensitive: (value: boolean) => void;
  gameMode: 'classic' | 'millionaire' | null;
  setGameMode: (mode: 'classic' | 'millionaire' | null) => void;
}) {
  // Determina l'immagine di background in base alla modalità selezionata
  const getBackgroundImage = () => {
    if (gameMode === 'millionaire') return 'images/eracle-mode.png';
    if (gameMode === 'classic') return 'images/achille-mode.png';
    return 'images/hero-bg.png'; // Default quando nessuna modalità è selezionata
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image dinamico */}
      <div className="absolute inset-0">
        <img 
          src={getBackgroundImage()} 
          alt="Personaggi e avvenimenti storici" 
          className="w-full h-full object-cover transition-all duration-1000"
        />
      </div>
      
      {/* Overlay scuro per migliorare la leggibilità */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60"></div>
      
      {/* Animated background elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-white/5 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-white/5 rounded-full blur-xl animate-pulse delay-1000"></div>
      
      {/* Content Layer */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-white p-4 sm:p-6 md:p-8">
        <div className="text-center max-w-7xl mx-auto scale-96 sm:scale-100">
          <div className="relative mb-8">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white drop-shadow-2xl relative z-10" 
                style={{ 
                  textShadow: '4px 4px 8px rgba(0, 0, 0, 0.8), 2px 2px 4px rgba(0, 0, 0, 0.9), 0 0 20px rgba(0, 0, 0, 0.5)' 
                }}>
              Chi l'ha detto?
            </h1>
            {/* Outline effect per maggiore contrasto */}
            <h1 className="absolute inset-0 text-4xl sm:text-5xl md:text-7xl font-black text-amber-300 opacity-30 blur-sm">
              Chi l'ha detto?
            </h1>
          </div>
          
          <div className="relative mb-12">
            <p className="text-sm sm:text-base md:text-lg text-center max-w-4xl leading-relaxed text-white font-medium relative z-10 px-4"
               style={{ 
                 textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9), 1px 1px 2px rgba(0, 0, 0, 1), 0 0 15px rgba(0, 0, 0, 0.7)' 
               }}>
              Metti alla prova la tua conoscenza delle citazioni e del loro vero contesto storico.
            </p>
            {/* Background semi-trasparente dietro il testo */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-2xl -m-4"></div>
          </div>
          
                    {/* Toggle per contenuti sensibili - ridotto del 20% su mobile */}
          <div className="mb-8 flex items-center justify-center gap-4">
            <div className="flex flex-row items-center space-x-5 bg-black/25 backdrop-blur-sm rounded-xl px-5 py-4 border border-white/10 shadow-lg scale-80 sm:scale-100">
              <span className="text-white font-medium text-base drop-shadow-lg"
                    style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}>
                Contenuti sensibili
              </span>
              
              <button
                onClick={() => setIncludeSensitive(!includeSensitive)}
                className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none shadow-md ${
                  includeSensitive ? 'bg-amber-500' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                    includeSensitive ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
              
              <span className="text-sm text-white/80 font-medium whitespace-nowrap"
                    style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}>
                {includeSensitive ? '✓ Inclusi' : '✗ Esclusi'}
              </span>
            </div>
          </div>

          {/* Selezione Modalità di Gioco - PRINCIPALE */}
          <div className="mb-12 flex items-center justify-center gap-4">
            <div className="flex flex-col items-center space-y-5 bg-gradient-to-b from-black/50 to-black/40 backdrop-blur-lg rounded-3xl px-7 py-7 border-2 border-white/30 shadow-2xl transform hover:scale-105 transition-transform duration-300">
              <span className="text-white font-bold text-2xl drop-shadow-lg text-center"
                    style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)' }}>
                Scegli la tua Modalità
              </span>
              
                                          <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
                                    <button
                     onClick={() => setGameMode('millionaire')}
                     className={`w-64 h-32 px-6 py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 flex flex-col items-center justify-center relative overflow-hidden ${
                       gameMode === 'millionaire' 
                         ? 'text-white shadow-xl scale-105 ring-4 ring-purple-400/50' 
                         : 'text-purple-300 border-2 border-purple-300/50 hover:scale-105 hover:bg-purple-500/10'
                     }`}
                   >
                     {/* Immagine di sfondo */}
                     <div className={`absolute inset-0 bg-cover bg-center rounded-xl transition-opacity duration-300 ${
                       gameMode === 'millionaire' ? 'opacity-100' : 'opacity-30'
                     }`} style={{ backgroundImage: 'url(images/eracle-btn.png)' }}></div>
                     
                     {/* Overlay scuro per il testo */}
                     <div className="absolute inset-0 bg-black/40 rounded-xl"></div>
                     
                     {/* Contenuto del bottone */}
                     <div className="relative z-10 text-center">
                       <div className="text-2xl font-black mb-2 drop-shadow-lg">Eracle</div>
                       <div className="text-sm font-semibold opacity-95">Scala l'Olimpo, diventa un Dio. </div>
                     </div>
                   </button>
                                   
                                    <button
                     onClick={() => setGameMode('classic')}
                     className={`w-64 h-32 px-6 py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 flex flex-col items-center justify-center relative overflow-hidden ${
                       gameMode === 'classic' 
                         ? 'text-white shadow-xl scale-105 ring-4 ring-amber-400/50' 
                         : 'text-amber-300 border-2 border-amber-300/50 hover:scale-105 hover:bg-amber-500/10'
                     }`}
                   >
                     {/* Immagine di sfondo */}
                     <div className={`absolute inset-0 bg-cover bg-center rounded-xl transition-opacity duration-300 ${
                       gameMode === 'classic' ? 'opacity-100' : 'opacity-30'
                     }`} style={{ backgroundImage: 'url(images/achille-btn.png)' }}></div>
                     
                     {/* Overlay scuro per il testo */}
                     <div className="absolute inset-0 bg-black/40 rounded-xl"></div>
                     
                     {/* Contenuto del bottone */}
                     <div className="relative z-10 text-center">
                       <div className="text-2xl font-black mb-2 drop-shadow-lg">Achille</div>
                     <div className="text-sm font-semibold opacity-95">Porta la tua aristeia nell'Iliade.</div>
                   </div>
                 </button>
                </div>
              
                                                           {/* Descrizione della modalità - sempre visibile con grandezza fissa */}
                <div className="text-center bg-black/20 rounded-2xl p-3 border border-white/10 w-full max-w-2xl h-24 flex items-center justify-center">
                  <p className="text-white text-sm leading-relaxed font-medium"
                     style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.9)' }}>
                    {gameMode === 'millionaire' ? (
                      <>
                        <span className="block">12 fatiche di difficoltà crescente.</span>
                        <span className="block">Ogni risposta ti porta più in alto nella scalata verso la vetta dell'Olimpo.</span>
                        <span className="block">Riuscirai a diventere un Dio?</span>
                      </>
                    ) : gameMode === 'classic' ? (
                      <>
                        <span className="block">Partita infinita senza aiuti.</span>
                        <span className="block">Più vai avanti e resisti, più la gloria aumenta!</span>
                        <span className="block">Quando cadrai, le tue gesta saranno degne di essere ricordate nell'Iliade?</span>
                      </>
                    ) : (
                      <span className="block">Seleziona una delle due modalità di gioco!</span>
                    )}
                  </p>
                </div>
            </div>
          </div>
          
                                                                                                                                                                               <button
                onClick={() => onStartGame(getBackgroundImage())}
                disabled={!gameMode}
                className={`group font-bold py-5 px-16 rounded-full shadow-2xl transition-all duration-300 transform text-2xl border-2 relative overflow-hidden backdrop-blur-sm ${
                  gameMode === 'millionaire'
                    ? 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 hover:shadow-purple-500/25 hover:scale-105 hover:-translate-y-1 border-purple-300' 
                    : gameMode === 'classic'
                    ? 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 hover:shadow-amber-500/25 hover:scale-105 hover:-translate-y-1 border-amber-300'
                    : 'bg-gray-400 text-gray-600 border-gray-400 cursor-not-allowed opacity-60'
                }`}
              >
                <span className="relative z-10">
                  Inizia la Partita
                </span>
                {gameMode === 'millionaire' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-purple-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                )}
                {gameMode === 'classic' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-100 to-amber-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                )}
              </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [includeSensitive, setIncludeSensitive] = useState(false); // Default: disattivo
  const [gameMode, setGameMode] = useState<'classic' | 'millionaire' | null>(null); // Default: nessuna modalità selezionata
  const [backgroundImage, setBackgroundImage] = useState<string>('images/hero-bg.png'); // Immagine di background selezionata

  return (
    <div className="min-h-screen">
                    {gameStarted && gameMode ? (
          <ChiLHaDetto 
            includeSensitive={includeSensitive}
            gameMode={gameMode}
            backgroundImage={backgroundImage}
            onBackToMenu={() => setGameStarted(false)}
          />
        ) : (
         <MainMenu 
           onStartGame={(bgImage: string) => {
             setBackgroundImage(bgImage);
             setGameStarted(true);
           }} 
           includeSensitive={includeSensitive}
           setIncludeSensitive={setIncludeSensitive}
           gameMode={gameMode}
           setGameMode={setGameMode}
         />
       )}
    </div>
  );
}

export default App;



