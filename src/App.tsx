import React, { useState } from "react";
import ChiLHaDetto from "./components/ChiLHaDetto";

function MainMenu({ onStartGame }: { onStartGame: () => void }) {
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
      <div className="absolute inset-0 bg-black/30"></div>
      
      {/* Animated background elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-white/5 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-white/5 rounded-full blur-xl animate-pulse delay-1000"></div>
      
      {/* Content Layer */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-white p-4">
        <div className="text-center max-w-7xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-black mb-8 text-shadow-2xl bg-gradient-to-r from-amber-100 to-orange-100 bg-clip-text text-transparent">
            Chi l'ha detto?
          </h1>
          
          <p className="text-xl md:text-3xl mb-12 text-center max-w-4xl leading-relaxed text-amber-100/90 font-light">
            Metti alla prova la tua conoscenza delle citazioni e del loro vero contesto storico.
          </p>
          
          <button
            onClick={onStartGame}
            className="group bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 font-bold py-5 px-16 rounded-full shadow-2xl hover:shadow-amber-500/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 text-2xl border-2 border-amber-300 relative overflow-hidden backdrop-blur-sm"
          >
            <span className="relative z-10">Inizia la Partita</span>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-100 to-amber-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
          
          <div className="mt-20 text-amber-100/70 text-lg">
            <p>Scopri la verità dietro le citazioni più famose</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [gameStarted, setGameStarted] = useState(false);

  return (
    <div className="min-h-screen">
      {gameStarted ? (
        <ChiLHaDetto />
      ) : (
        <MainMenu onStartGame={() => setGameStarted(true)} />
      )}
    </div>
  );
}

export default App;



