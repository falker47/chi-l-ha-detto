import React, { useState, useEffect } from "react";
import ChiLHaDetto from "./components/ChiLHaDetto";
import Leaderboard from "./components/Leaderboard";

function MainMenu({ 
  onStartGame, 
  gameMode,
  setGameMode,
  showTutorial,
  setShowTutorial,
  showLeaderboard,
  setShowLeaderboard
}: { 
  onStartGame: (backgroundImage: string) => void;
  gameMode: 'classic' | 'millionaire' | null;
  setGameMode: (mode: 'classic' | 'millionaire' | null) => void;
  showTutorial: boolean;
  setShowTutorial: (value: boolean) => void;
  showLeaderboard: boolean;
  setShowLeaderboard: (value: boolean) => void;
}) {
  
  // Sveglia il server Render all'apertura del menu per evitare attese
  useEffect(() => {
    const wakeUpServer = async () => {
      try {
        // Solo in produzione, non in sviluppo
        if (window.location.hostname !== 'localhost') {
          const apiUrl = 'https://chi-l-ha-detto.onrender.com/api/health';
          await fetch(apiUrl, { 
            method: 'GET',
            signal: AbortSignal.timeout(5000) // Timeout di 5 secondi
          });
          console.log('🌅 Server Render svegliato');
        }
      } catch (err) {
        console.warn('Impossibile svegliare il server:', err);
      }
    };

    wakeUpServer();
  }, []);

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
      <div className="relative z-10 flex flex-col items-center justify-start pt-8 sm:justify-center min-h-screen text-white p-4 sm:p-6 md:p-8 pb-16">
        <div className="text-center max-w-7xl mx-auto scale-96 sm:scale-100">
                     <div className="relative mb-3 sm:mb-6">
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
            <p className="text-xs sm:text-xs md:text-sm text-center max-w-3xl leading-relaxed text-white font-medium relative z-10 px-3"
               style={{ 
                 textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9), 1px 1px 2px rgba(0, 0, 0, 1), 0 0 15px rgba(0, 0, 0, 0.7)' 
               }}>
              Testa la tua conoscenza su citazioni e il loro contesto storico.
            </p>
            {/* Background semi-trasparente dietro il testo */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-2xl -m-3"></div>
          </div>
          
                                         {/* Toggle per contenuti sensibili e Tutorial - Design accattivante */}
           <div className="mb-6 flex flex-row items-center justify-center gap-2 sm:gap-3">
            {/* Container bottoni Top 5, Contenuti Sensibili e Tutorial */}
            <div className="flex flex-row items-center justify-center gap-1 sm:gap-3">
              {/* Bottone Leaderboard */}
              <button
                onClick={() => setShowLeaderboard(true)}
                className="px-2 sm:px-4 py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 bg-black/60 backdrop-blur-sm border border-white/20 text-white hover:bg-black/80 h-12 sm:h-14 flex items-center justify-center w-20 sm:w-28"
              >
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  {/* Icona leaderboard - nuova e migliorata */}
                  <div className="w-3 h-3 sm:w-5 sm:h-5">
                    <svg 
                      className="w-full h-full text-white" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                      <line x1="3" y1="6" x2="21" y2="6"/>
                      <path d="M16 10a4 4 0 0 1-8 0"/>
                      <path d="M12 10v4"/>
                      <path d="M8 14h8"/>
                    </svg>
                  </div>
                  <span className="font-medium text-xs sm:text-sm">Top 5</span>
                </div>
              </button>


              {/* Bottone Tutorial */}
              <button
                onClick={() => setShowTutorial(true)}
                className="px-2 sm:px-4 py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 bg-black/60 backdrop-blur-sm border border-white/20 text-white hover:bg-black/80 h-12 sm:h-14 flex items-center justify-center w-20 sm:w-28"
              >
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  {/* Icona tutorial */}
                  <div className="w-3 h-3 sm:w-5 sm:h-5">
                    <svg 
                      className="w-full h-full text-white" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                      <path d="M12 17h.01"/>
                    </svg>
                  </div>
                  <span className="font-medium text-xs sm:text-sm">Tutorial</span>
                </div>
              </button>
            </div>

          </div>

                     {/* Selezione Modalità di Gioco - PRINCIPALE */}
           <div className="mb-4 flex items-center justify-center gap-4">
                         <div className="flex flex-col items-center space-y-3 bg-gradient-to-b from-black/50 to-black/40 backdrop-blur-lg rounded-3xl px-6 py-5 border-2 border-white/30 shadow-2xl transform hover:scale-105 transition-transform duration-300">
              
                                                                                     <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3">
                                    <button
                     onClick={() => setGameMode('millionaire')}
                     className={`w-65 h-32 px-3 py-1.5 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 flex flex-col items-center justify-center relative overflow-hidden ${
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
                       <div className="text-2xl font-black mb-1 drop-shadow-lg">Eracle</div>
                       <div className="text-base font-semibold opacity-95">Scala l'Olimpo, diventa un Dio. </div>
                     </div>
                   </button>
                                   
                                    <button
                     onClick={() => setGameMode('classic')}
                     className={`w-65 h-32 px-3 py-1.5 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 flex flex-col items-center justify-center relative overflow-hidden ${
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
                       <div className="text-2xl font-black mb-1 drop-shadow-lg">Achille</div>
                     <div className="text-base font-semibold opacity-95">Porta la tua aristeia nell'Iliade.</div>
                   </div>
                 </button>
                </div>
              
                                                           {/* Descrizione della modalità - sempre visibile con grandezza fissa */}
                                 <div className="text-center bg-black/20 rounded-2xl p-2 border border-white/10 w-full max-w-2xl h-24 flex items-center justify-center">
                  <p className="text-white text-xs sm:text-base leading-relaxed font-medium"
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
      
      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-black py-3 z-50">
        <div className="text-center">
          <a 
            href="https://falker47.github.io/Nexus-portfolio/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-amber-300 transition-colors duration-300 hover:underline focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:ring-offset-2 focus:ring-offset-black rounded-sm px-1 py-0.5 active:scale-95 transform transition-transform duration-150 text-sm"
          >
            © {new Date().getFullYear()} Maurizio Falconi - falker47
          </a>
        </div>
      </footer>
    </div>
  );
}

function TutorialScreen({ onBackToMenu }: { onBackToMenu: () => void }) {
  // Determina l'immagine di background per il tutorial
  const getTutorialBackgroundImage = () => {
    const isMobile = window.innerWidth < 768; // Breakpoint sm di Tailwind
    return isMobile ? 'images/hero-bg-mobile.png' : 'images/hero-bg.png';
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={getTutorialBackgroundImage()} 
          alt="Background" 
          className="w-full h-full object-cover"
        />
        {/* Overlay scuro per migliorare la leggibilità */}
        <div className="absolute inset-0 bg-black/60"></div>
      </div>
      <div className="max-w-4xl w-full relative z-10 pb-16">
        {/* Header con bottone torna al menu */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg"
              style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)' }}>
            Tutorial
          </h1>
          
          {/* Bottone Torna al Menu - identico a quello nella schermata di gioco */}
          <button
            onClick={onBackToMenu}
            className="group relative px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white border border-slate-500/30 shadow-lg hover:shadow-xl backdrop-blur-sm"
          >
            <div className="flex items-center justify-center gap-2">
              {/* Freccia curva che torna indietro */}
              <div className="w-4 h-4 sm:w-5 sm:h-5 relative flex items-center justify-center">
                <svg 
                  className="w-full h-full text-white/90 group-hover:text-white transition-colors duration-300" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </div>
              <span className="hidden sm:inline font-medium">Esci</span>
            </div>
            
            {/* Effetto hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>

        {/* Contenuto del tutorial */}
        <div className="bg-black/80 backdrop-blur-sm rounded-3xl p-4 sm:p-6 shadow-2xl border border-white/30">
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-3 drop-shadow-lg"
                  style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)' }}>
                Benvenuto in "Chi l'ha detto?"
              </h2>
              <p className="text-sm md:text-base text-white/90 drop-shadow-lg"
                 style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}>
                Scopri come giocare e diventare un maestro delle citazioni storiche!
              </p>
            </div>

            {/* Come giocare */}
            <div className="bg-gradient-to-r from-green-900/60 to-emerald-800/60 backdrop-blur-sm rounded-2xl p-4 border-2 border-green-400/50">
              <h3 className="text-sm md:text-lg font-bold text-green-200 mb-3 flex items-center gap-2">
                🎯 Come Giocare
              </h3>
              <div className="grid md:grid-cols-2 gap-3 text-xs md:text-sm text-green-100">
                <div>
                  <h4 className="font-bold mb-1">📖 Leggi la Citazione</h4>
                  <p className="text-xs">Ogni domanda presenta una citazione storica famosa</p>
                </div>
                <div>
                  <h4 className="font-bold mb-1">🤔 Scegli l'Autore</h4>
                  <p className="text-xs">Indovina fra 4 opzioni l'autore della citazione</p>
                </div>
                <div>
                  <h4 className="font-bold mb-1">⏰ Attenzione al Tempo</h4>
                  <p className="text-xs">Hai 60s (Eracle) o 45s (Achille) per rispondere!</p>
                </div>
                <div>
                  <h4 className="font-bold mb-1">📚 Impara la Storia</h4>
                  <p className="text-xs">Scopri il contesto e approfondisci con le fonti allegate!</p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Modalità Eracle */}
              <div className="bg-gradient-to-br from-purple-900/60 to-blue-800/60 backdrop-blur-sm rounded-2xl p-4 border-2 border-purple-400/50">
                <h3 className="text-xs md:text-base font-bold text-purple-200 mb-3 flex items-center gap-2">
                  🏛️ Modalità Eracle - "Le 12 Fatiche"
                </h3>
                <ul className="space-y-2 text-xs md:text-xs text-purple-100">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-300 font-bold">•</span>
                    <span>12 domande progressive con difficoltà crescente</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-300 font-bold">•</span>
                    <span>4 aiuti disponibili: 50/50, Hint, Super Hint, 2nd Chance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-300 font-bold">•</span>
                    <span>Un errore = game over (tranne con 2nd Chance)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-300 font-bold">•</span>
                    <span>Obiettivo: Completare tutte le 12 fatiche</span>
                  </li>
                </ul>
              </div>

              {/* Modalità Achille */}
              <div className="bg-gradient-to-br from-orange-900/60 to-red-800/60 backdrop-blur-sm rounded-2xl p-4 border-2 border-orange-400/50">
                <h3 className="text-xs md:text-base font-bold text-orange-200 mb-3 flex items-center gap-2">
                  ⚔️ Modalità Achille - "Aristeia"
                </h3>
                <ul className="space-y-2 text-xs md:text-xs text-orange-100">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-300 font-bold">•</span>
                    <span>Partita infinita senza aiuti</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-300 font-bold">•</span>
                    <span>Difficoltà progressiva automatica</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-300 font-bold">•</span>
                    <span>Sistema di streak per tracciare i successi</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-300 font-bold">•</span>
                    <span>Obiettivo: Resistere il più a lungo possibile</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Aiuti Disponibili */}
            <div className="bg-gradient-to-r from-cyan-900/60 to-teal-800/60 backdrop-blur-sm rounded-2xl p-4 border-2 border-cyan-400/50">
              <h3 className="text-sm md:text-lg font-bold text-cyan-200 mb-3 flex items-center gap-2">
                🛠️ Aiuti Disponibili (Solo Eracle)
              </h3>
              <div className="grid md:grid-cols-2 gap-3 text-xs md:text-sm text-cyan-100">
                <div>
                  <h4 className="font-bold mb-1">🎯 50/50</h4>
                  <p className="text-xs">Elimina 2 risposte sbagliate</p>
                </div>
                <div>
                  <h4 className="font-bold mb-1">💡 Hint</h4>
                  <p className="text-xs">Suggerimento breve sull'autore</p>
                </div>
                <div>
                  <h4 className="font-bold mb-1">🔍 Super Hint</h4>
                  <p className="text-xs">Suggerimento dettagliato</p>
                </div>
                <div>
                  <h4 className="font-bold mb-1">🔄 2nd Chance</h4>
                  <p className="text-xs">Seconda possibilità dopo un errore</p>
                </div>
              </div>
            </div>

            {/* Sistema di Punteggio */}
            <div className="bg-gradient-to-r from-blue-900/60 to-indigo-800/60 backdrop-blur-sm rounded-2xl p-4 border-2 border-blue-400/50">
              <h3 className="text-sm md:text-lg font-bold text-blue-200 mb-3 flex items-center gap-2">
                🏆 Sistema di Punteggio
              </h3>
              <div className="grid md:grid-cols-2 gap-3 text-xs md:text-sm text-blue-100">
                <div>
                  <h4 className="font-bold mb-1 text-purple-200">🏛️ Modalità Eracle</h4>
                  <p className="text-xs mb-1">Punti base: 100 × moltiplicatore livello × moltiplicatore tempo</p>
                  <p className="text-xs">Bonus finale: +50% per ogni aiuto non utilizzato</p>
                </div>
                <div>
                  <h4 className="font-bold mb-1 text-orange-200">⚔️ Modalità Achille</h4>
                  <p className="text-xs mb-1">Punti base: 50 × difficoltà × velocità di risposta</p>
                  <p className="text-xs">Moltiplicatore streak: cresce con i successi consecutivi</p>
                </div>
              </div>
            </div>

            

            {/* Leaderboard */}
            <div className="bg-gradient-to-r from-violet-900/60 to-purple-800/60 backdrop-blur-sm rounded-2xl p-4 border-2 border-violet-400/50">
              <h3 className="text-sm md:text-lg font-bold text-violet-200 mb-3 flex items-center gap-2">
                🏅 Classifica Top 5
              </h3>
              <div className="text-xs md:text-sm text-violet-100">
                <p className="mb-2">Ogni modalità ha la sua classifica separata:</p>
                <ul className="space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-violet-300 font-bold">•</span>
                    <span><strong>Eracle:</strong> Ordinata per fatiche superate, poi per punteggio</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-300 font-bold">•</span>
                    <span><strong>Achille:</strong> Ordinata per streak raggiunta, poi per punteggio</span>
                  </li>
                </ul>
                <p className="mt-2 text-xs">Se entri nella Top 5, potrai salvare il tuo record!</p>
              </div>
            </div>

            {/* Contenuti sensibili */}
            <div className="bg-gradient-to-r from-amber-900/60 to-orange-800/60 backdrop-blur-sm rounded-2xl p-4 border-2 border-amber-400/50">
              <h3 className="text-xs md:text-sm font-bold text-amber-200 mb-3 flex items-center gap-2">
                ⚠️ Contenuti Sensibili
              </h3>
              <p className="text-xs md:text-sm text-amber-100 mb-2">
                Il gioco include citazioni di figure storiche controverse. Puoi attivare o disattivare questa modalità:
              </p>
              <ul className="space-y-1 text-xs md:text-sm text-amber-100">
                <li className="flex items-start gap-2">
                  <span className="text-amber-300 font-bold">•</span>
                  <span><strong>Modalità Sicura:</strong> Solo citazioni di figure generalmente positive</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-300 font-bold">•</span>
                  <span><strong>Modalità Avanzata:</strong> Tutte le citazioni, incluse quelle di figure controverse</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-black py-3 z-50">
        <div className="text-center">
          <a 
            href="https://falker47.github.io/Nexus-portfolio/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-amber-300 transition-colors duration-300 hover:underline focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:ring-offset-2 focus:ring-offset-black rounded-sm px-1 py-0.5 active:scale-95 transform transition-transform duration-150 text-sm"
          >
            © {new Date().getFullYear()} Maurizio Falconi - falker47
          </a>
        </div>
      </footer>
    </div>
  );
}

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameMode, setGameMode] = useState<'classic' | 'millionaire' | null>(null); // Default: nessuna modalità selezionata
  const [backgroundImage, setBackgroundImage] = useState<string>('images/hero-bg.png'); // Immagine di background selezionata
  const [imagesPreloaded, setImagesPreloaded] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

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
        <div className="fixed inset-0 bg-gradient-to-br from-amber-900 via-orange-900 to-red-900 z-50 flex items-center justify-center overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
          </div>
          
          {/* Container principale */}
          <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
            {/* Titolo principale */}
            <div className="mb-12">
              <h1 className="text-5xl sm:text-7xl font-black text-white mb-6 drop-shadow-2xl"
                  style={{ textShadow: '0 0 40px rgba(255, 255, 255, 0.6), 0 0 80px rgba(255, 255, 255, 0.4)' }}>
                Chi l'ha detto?
              </h1>
            </div>
            
            {/* Loading animation principale */}
            <div className="mb-10">
              <div className="inline-flex items-center space-x-4 bg-black/50 backdrop-blur-lg rounded-3xl px-8 py-6 border-2 border-amber-400/30 shadow-2xl">
                {/* Spinner triplo */}
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-amber-300/30 border-t-amber-400 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-orange-300 rounded-full animate-spin" 
                       style={{ animationDirection: 'reverse', animationDuration: '1.2s' }}></div>
                  <div className="absolute inset-1 w-10 h-10 border-4 border-transparent border-t-red-300 rounded-full animate-spin" 
                       style={{ animationDuration: '0.8s' }}></div>
                </div>
                
                {/* Testo di caricamento */}
                <div className="text-white font-bold text-lg">
                  <span className="inline-block animate-pulse">Preparando l'epica</span>
                  <span className="inline-block animate-bounce ml-1" style={{ animationDelay: '0.1s' }}>.</span>
                  <span className="inline-block animate-bounce ml-1" style={{ animationDelay: '0.2s' }}>.</span>
                  <span className="inline-block animate-bounce ml-1" style={{ animationDelay: '0.3s' }}>.</span>
                </div>
              </div>
            </div>
            
            {/* Barra di progresso avanzata */}
            <div className="mb-8">
              <div className="w-full max-w-lg mx-auto bg-black/40 backdrop-blur-lg rounded-full h-3 border-2 border-amber-400/20 overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-amber-500 via-orange-400 to-red-400 rounded-full animate-pulse"
                     style={{ 
                       width: '100%',
                       background: 'linear-gradient(90deg, #f59e0b, #f97316, #ef4444, #dc2626)',
                       backgroundSize: '300% 100%',
                       animation: 'shimmer 3s ease-in-out infinite'
                     }}>
                </div>
              </div>
            </div>
            
            {/* Messaggi motivazionali rotanti */}
            <div className="mb-6">
              <div className="text-amber-200 text-base sm:text-lg font-medium">
                <p className="animate-fade-in">
                  Caricando le gesta degli eroi...
                </p>
              </div>
            </div>
            
            {/* Elementi decorativi */}
            <div className="flex justify-center space-x-4 mb-6">
              <div className="w-3 h-3 bg-amber-400 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
              <div className="w-3 h-3 bg-orange-400 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-3 h-3 bg-red-400 rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
          
          {/* Particelle animate di sfondo */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-amber-300/40 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
            <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-orange-200/60 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute top-1/2 left-3/4 w-2.5 h-2.5 bg-red-400/30 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-1/4 left-1/2 w-2 h-2 bg-amber-300/50 rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></div>
            <div className="absolute top-1/3 right-1/3 w-2.5 h-2.5 bg-orange-200/40 rounded-full animate-ping" style={{ animationDelay: '0.8s' }}></div>
            <div className="absolute bottom-1/3 right-1/2 w-1.5 h-1.5 bg-red-300/60 rounded-full animate-ping" style={{ animationDelay: '1.2s' }}></div>
          </div>
          
          {/* CSS per animazioni personalizzate */}
          <style>{`
            @keyframes shimmer {
              0% { background-position: -300% 0; }
              100% { background-position: 300% 0; }
            }
            @keyframes fade-in {
              0% { opacity: 0; transform: translateY(15px); }
              100% { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in {
              animation: fade-in 1.5s ease-out;
            }
          `}</style>
        </div>
      )}
      
      {/* Contenuto principale */}
      <div className={`transition-opacity duration-500 ${imagesPreloaded ? 'opacity-100' : 'opacity-0'}`}>
        {gameStarted && gameMode ? (
          <ChiLHaDetto 
            gameMode={gameMode}
            backgroundImage={backgroundImage}
            onBackToMenu={() => setGameStarted(false)}
          />
        ) : showTutorial ? (
          <TutorialScreen onBackToMenu={() => setShowTutorial(false)} />
        ) : (
         <MainMenu 
           onStartGame={(bgImage: string) => {
             setBackgroundImage(bgImage);
             setGameStarted(true);
           }} 
           gameMode={gameMode}
           setGameMode={setGameMode}
           showTutorial={showTutorial}
           setShowTutorial={setShowTutorial}
           showLeaderboard={showLeaderboard}
           setShowLeaderboard={setShowLeaderboard}
         />
       )}
      </div>
      
      {/* Leaderboard */}
      {showLeaderboard && (
        <Leaderboard
          onClose={() => setShowLeaderboard(false)}
          gameMode={gameMode === 'classic' ? 'achille' : (gameMode || 'millionaire')}
          currentStreak={0}
          currentScore={0}
        />
      )}
    </div>
  );
}

export default App;



