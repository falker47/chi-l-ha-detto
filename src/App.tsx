import React, { useState } from "react";
import ChiLHaDetto from "./components/ChiLHaDetto";

function MainMenu({ onStartGame }: { onStartGame: () => void }) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image - SOSTITUISCI QUI L'IMMAGINE */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900">
        {/* PLACEHOLDER: Sostituisci questo div con la tua immagine */}
        <div className="w-full h-full bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="text-8xl mb-6">🖼️</div>
            <p className="text-2xl font-medium">Immagine Hero a Schermo Intero</p>
            <p className="text-lg opacity-75 mt-2">Sostituisci con la tua immagine storica</p>
            <p className="text-sm opacity-50 mt-4">Dimensioni consigliate: 1920x1080px o superiore</p>
          </div>
        </div>
        
        {/* SOSTITUISCI IL DIV SOPRA CON QUESTO COMMENTO:
        <img 
          src="/path/to/your/hero-image.jpg" 
          alt="Personaggi e avvenimenti storici" 
          className="w-full h-full object-cover"
        />
        */}
      </div>
      
      {/* Overlay scuro per migliorare la leggibilità */}
      <div className="absolute inset-0 bg-black/30"></div>
      
      {/* Animated background elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-white/5 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-white/5 rounded-full blur-xl animate-pulse delay-1000"></div>
      
      {/* Content Layer */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-white p-4">
        <div className="text-center max-w-7xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-black mb-8 text-shadow-2xl bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            Chi l'ha detto?
          </h1>
          
          <p className="text-xl md:text-3xl mb-12 text-center max-w-4xl leading-relaxed text-white/90 font-light">
            Metti alla prova la tua conoscenza delle citazioni e del loro vero contesto storico.
          </p>
          
          <button
            onClick={onStartGame}
            className="group bg-gradient-to-r from-white to-blue-50 text-blue-700 font-bold py-5 px-16 rounded-full shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 text-2xl border-0 relative overflow-hidden backdrop-blur-sm"
          >
            <span className="relative z-10">Inizia la Partita</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
          
          <div className="mt-20 text-white/70 text-lg">
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



