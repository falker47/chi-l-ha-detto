import React, { useEffect, useState } from 'react';

interface HeroImagePreloaderProps {
  children: React.ReactNode;
}

export default function HeroImagePreloader({ children }: HeroImagePreloaderProps) {
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // Preload dell'immagine hero
    const preloadHeroImage = () => {
      const img = new Image();
      
      // Usa l'immagine compressa ottimizzata
      const imagePath = '/images/hero-bg-compressed.png';

      img.onload = () => {
        setImageLoaded(true);
        // Aggiungi la classe CSS per attivare l'immagine
        document.documentElement.classList.add('hero-image-loaded');
      };

      img.onerror = () => {
        // Fallback se l'immagine non carica
        console.warn('Hero image failed to load, using fallback');
        setImageLoaded(true);
      };

      img.src = imagePath;
    };

    // Avvia il preload
    preloadHeroImage();
    
    // Marca come caricato dopo un breve delay per evitare flash
    const timer = setTimeout(() => setHeroLoaded(true), 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Preload link per l'immagine hero compressa */}
      <link 
        rel="preload" 
        as="image" 
        href="/images/hero-bg-compressed.png"
        type="image/png"
      />
      
      {/* Rimossa la vecchia schermata di preload per evitare flash */}
      
      {/* Contenuto principale - sempre visibile per evitare flash */}
      <div>
        {children}
      </div>
    </>
  );
}
