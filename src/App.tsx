import React, { useState, useEffect } from "react";
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
    const isMobile = window.innerWidth < 768; // Breakpoint sm di Tailwind
    
    if (gameMode === 'millionaire') {
      return isMobile ? 'images/eracle-mode-mobile.png' : 'images/eracle-mode.png';
    }
    if (gameMode === 'classic') {
      return isMobile ? 'images/achille-mode-mobile.png' : 'images/achille-mode.png';
    }
    return isMobile ? 'images/hero-bg-mobile.png' : 'images/hero-bg.png'; // Default quando nessuna modalità è selezionata
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
                     <div className="relative mb-6">
             <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-white drop-shadow-2xl relative z-10" 
                 style={{ 
                   textShadow: '4px 4px 8px rgba(0, 0, 0, 0.8), 2px 2px 4px rgba(0, 0, 0, 0.9), 0 0 20px rgba(0, 0, 0, 0.5)' 
                 }}>
               Chi l'ha detto?
             </h1>
             {/* Outline effect per maggiore contrasto */}
             <h1 className="absolute inset-0 text-3xl sm:text-4xl md:text-6xl font-black text-amber-300 opacity-30 blur-sm">
               Chi l'ha detto?
             </h1>
           </div>
           
           <div className="relative mb-8">
            <p className="text-xs sm:text-sm md:text-base text-center max-w-3xl leading-relaxed text-white font-medium relative z-10 px-3"
               style={{ 
                 textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9), 1px 1px 2px rgba(0, 0, 0, 1), 0 0 15px rgba(0, 0, 0, 0.7)' 
               }}>
              Metti alla prova la tua conoscenza delle citazioni e del loro vero contesto storico.
            </p>
            {/* Background semi-trasparente dietro il testo */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-2xl -m-3"></div>
          </div>
          
                                         {/* Toggle per contenuti sensibili - Design accattivante */}
           <div className="mb-6 flex items-center justify-center gap-4">
            <div className="relative group">
              {/* Container principale con effetti avanzati */}
              <div className="flex flex-row items-center space-x-3 sm:space-x-4 bg-gradient-to-r from-amber-900/40 via-orange-900/30 to-red-900/40 backdrop-blur-lg rounded-2xl px-4 sm:px-6 py-3 border-2 border-amber-400/30 shadow-2xl transition-all duration-300 hover:border-amber-400/50 hover:shadow-amber-500/20">
                {/* Testo principale */}
                <div className="flex flex-col">
                  <span className="text-white font-bold text-xs sm:text-sm drop-shadow-lg"
                        style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}>
                    Contenuti Sensibili
                  </span>
                  <span className="text-amber-200 text-xs font-medium">
                    {includeSensitive ? 'Modalità Avanzata' : 'Modalità Sicura'}
                  </span>
                </div>
                
                {/* Toggle switch migliorato */}
                <button
                  onClick={() => setIncludeSensitive(!includeSensitive)}
                  className={`relative inline-flex h-6 w-12 sm:h-7 sm:w-14 items-center rounded-full transition-all duration-300 focus:outline-none shadow-lg transform hover:scale-105 ${
                    includeSensitive 
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-500/30' 
                      : 'bg-gradient-to-r from-gray-600 to-gray-700 shadow-gray-600/30'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 sm:h-5 sm:w-5 transform rounded-full bg-white transition-all duration-300 shadow-md ${
                      includeSensitive ? 'translate-x-7 sm:translate-x-8' : 'translate-x-1'
                    }`}
                  />
                </button>
                
                
              </div>
              
              {/* Effetto glow al hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
            </div>
          </div>

                     {/* Selezione Modalità di Gioco - PRINCIPALE */}
           <div className="mb-10 flex items-center justify-center gap-4">
                         <div className="flex flex-col items-center space-y-3 bg-gradient-to-b from-black/50 to-black/40 backdrop-blur-lg rounded-3xl px-6 py-5 border-2 border-white/30 shadow-2xl transform hover:scale-105 transition-transform duration-300">
              <span className="text-white font-bold text-xl drop-shadow-lg text-center"
                    style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)' }}>
                Scegli la tua Modalità
              </span>
              
                                                                                     <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3">
                                    <button
                     onClick={() => setGameMode('millionaire')}
                     className={`w-54 h-28 px-5 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 flex flex-col items-center justify-center relative overflow-hidden ${
                       gameMode === 'millionaire' 
                         ? 'text-white shadow-xl scale-105 ring-4 ring-purple-400/50' 
                         : 'text-purple-300 border-2 border-purple-300/50 hover:scale-105 hover:bg-purple-500/10'
                     }`}
                   >
                     {/* Immagine di sfondo */}
                     <img 
                       src="images/eracle-btn.png"
                       alt="Eracle"
                       className={`absolute inset-0 w-full h-full object-cover rounded-xl transition-opacity duration-300 ${
                         gameMode === 'millionaire' ? 'opacity-100' : 'opacity-30'
                       }`}
                     />
                     
                     {/* Overlay scuro per il testo */}
                     <div className="absolute inset-0 bg-black/40 rounded-xl"></div>
                     
                     {/* Contenuto del bottone */}
                     <div className="relative z-10 text-center">
                       <div className="text-xl font-black mb-1 drop-shadow-lg">Eracle</div>
                       <div className="text-xs font-semibold opacity-95">Scala l'Olimpo, diventa un Dio. </div>
                     </div>
                   </button>
                                   
                                    <button
                     onClick={() => setGameMode('classic')}
                     className={`w-54 h-28 px-5 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 flex flex-col items-center justify-center relative overflow-hidden ${
                       gameMode === 'classic' 
                         ? 'text-white shadow-xl scale-105 ring-4 ring-amber-400/50' 
                         : 'text-amber-300 border-2 border-amber-300/50 hover:scale-105 hover:bg-amber-500/10'
                     }`}
                   >
                     {/* Immagine di sfondo */}
                     <img 
                       src="images/achille-btn.png"
                       alt="Achille"
                       className={`absolute inset-0 w-full h-full object-cover rounded-xl transition-opacity duration-300 ${
                         gameMode === 'classic' ? 'opacity-100' : 'opacity-30'
                       }`}
                     />
                     
                     {/* Overlay scuro per il testo */}
                     <div className="absolute inset-0 bg-black/40 rounded-xl"></div>
                     
                     {/* Contenuto del bottone */}
                     <div className="relative z-10 text-center">
                       <div className="text-xl font-black mb-1 drop-shadow-lg">Achille</div>
                     <div className="text-xs font-semibold opacity-95">Porta la tua aristeia nell'Iliade.</div>
                   </div>
                 </button>
                </div>
              
                                                           {/* Descrizione della modalità - sempre visibile con grandezza fissa */}
                                 <div className="text-center bg-black/20 rounded-2xl p-2 border border-white/10 w-full max-w-2xl h-24 flex items-center justify-center">
                  <p className="text-white text-xs leading-relaxed font-medium"
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
                        <span className="block">Più vai avanti e resisti, maggiore è la gloria!</span>
                        <span className="block">Quando cadrai, le tue gesta saranno degne di essere ricordate nell'Iliade?</span>
                      </>
                                         ) : (
                       <span className="block text-xl">Seleziona una delle due modalità di gioco!</span>
                     )}
                  </p>
                </div>
            </div>
          </div>
          
                                                                                                                                                                               <button
                onClick={() => onStartGame(getBackgroundImage())}
                disabled={!gameMode}
                className={`group font-bold py-4 px-14 rounded-full shadow-2xl transition-all duration-300 transform text-xl border-2 relative overflow-hidden backdrop-blur-sm ${
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
  const [imagesPreloaded, setImagesPreloaded] = useState(false);

  // Preload delle immagini delle modalità per evitare lag su mobile
  useEffect(() => {
    const preloadImages = () => {
      const imageUrls = [
        'images/hero-bg.png',
        'images/hero-bg-mobile.png',
        'images/achille-mode.png', 
        'images/eracle-mode.png',
        'images/achille-mode-mobile.png',
        'images/eracle-mode-mobile.png',
        'images/achille-btn.png',
        'images/eracle-btn.png'
      ];

      let loadedCount = 0;
      const totalImages = imageUrls.length;

      const onImageLoad = () => {
        loadedCount++;
        if (loadedCount === totalImages) {
          setImagesPreloaded(true);
        }
      };

      imageUrls.forEach(url => {
        const img = new Image();
        img.onload = onImageLoad;
        img.onerror = onImageLoad; // Anche in caso di errore, continua
        img.src = url;
      });

      // Fallback: dopo 2 secondi considera le immagini caricate
      setTimeout(() => {
        setImagesPreloaded(true);
      }, 2000);
    };

    preloadImages();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Indicatore di caricamento per le immagini */}
      {!imagesPreloaded && (
        <div className="fixed inset-0 bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-amber-800 font-medium">Caricamento immagini...</p>
          </div>
        </div>
      )}
      
      {/* Contenuto principale */}
      <div className={`transition-opacity duration-500 ${imagesPreloaded ? 'opacity-100' : 'opacity-0'}`}>
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
    </div>
  );
}

export default App;



