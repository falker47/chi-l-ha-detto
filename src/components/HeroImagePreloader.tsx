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
      
      // Determina il formato migliore da usare
      const supportsWebP = document.createElement('canvas')
        .toDataURL('image/webp')
        .indexOf('data:image/webp') === 0;
      
      const isMobile = window.innerWidth <= 768;
      const imagePath = supportsWebP 
        ? (isMobile ? '/images/hero-bg-mobile.webp' : '/images/hero-bg.webp')
        : (isMobile ? '/images/hero-bg-mobile.jpg' : '/images/hero-bg.jpg');

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
      {/* Preload link per l'immagine hero */}
      <link 
        rel="preload" 
        as="image" 
        href="/images/hero-bg.webp"
        type="image/webp"
      />
      <link 
        rel="preload" 
        as="image" 
        href="/images/hero-bg.jpg"
        type="image/jpeg"
      />
      
      {/* Indicatore di caricamento sottile */}
      {!imageLoaded && (
        <div className="fixed inset-0 bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-amber-800 font-medium">Caricamento...</p>
          </div>
        </div>
      )}
      
      {/* Contenuto principale */}
      <div className={`transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}>
        {children}
      </div>
    </>
  );
}
