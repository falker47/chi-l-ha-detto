import React, { useEffect, useMemo, useState } from "react";
import type { Item } from "../types";
import itemsRaw from "../data/quotes.json";
import { personaggiImageMap } from "../data/imageMappings";
import HeroImagePreloader from "./HeroImagePreloader";

const ITEMS = itemsRaw as Item[];

function shuffle<T>(arr: T[]) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ChiLHaDetto({ 
  includeSensitive, 
  onBackToMenu 
}: { 
  includeSensitive: boolean; 
  onBackToMenu: () => void; 
}) {
  const [historicalMode, setHistoricalMode] = useState(true);
  const [order, setOrder] = useState<number[]>([]);
  const [i, setI] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [revealed, setRevealed] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [used5050, setUsed5050] = useState(false);
  const [disabledOptions, setDisabledOptions] = useState<number[]>([]);
  const [usedHint, setUsedHint] = useState(false);
  const [usedSuperHint, setUsedSuperHint] = useState(false);
  const [hintRevealed, setHintRevealed] = useState(false);
  const [superHintRevealed, setSuperHintRevealed] = useState(false);
  
  // Costanti per la modalità di gioco
  const QUESTIONS_PER_GAME = 10; // Ogni partita ha 10 domande
  
  // TODO: Preparazione per modalità "Chi vuol essere milionario"
  // - Sistema di livelli di difficoltà crescente
  // - Premi progressivi (punti, streak bonus)
  // - Aiuti limitati (50:50, hint, pubblico)
  // - Possibilità di ritirarsi con il punteggio accumulato

  useEffect(() => {
    // Filtra le domande in base alla preferenza per contenuti sensibili
    const filteredItems = includeSensitive 
      ? ITEMS 
      : ITEMS.filter(item => !item.sensitive);
    
    // Estrai casualmente solo 10 domande per ogni partita dal pool filtrato
    const shuffledIndices = shuffle(filteredItems.map((_, k) => {
      // Trova l'indice originale dell'item filtrato
      return ITEMS.findIndex(originalItem => originalItem.id === filteredItems[k].id);
    }));
    setOrder(shuffledIndices.slice(0, QUESTIONS_PER_GAME));
  }, [includeSensitive]);

  const current: Item | null = useMemo(
    () => (order.length ? ITEMS[order[i]] : null),
    [order, i]
  );

  const [choiceOrder, setChoiceOrder] = useState<number[]>([]);
  useEffect(() => {
    if (!current) return;
    setChoiceOrder(shuffle([0, 1, 2, 3]));
    setTimeLeft(45);
    setRevealed(false);
    setSelected(null);
    setDisabledOptions([]);
    setHintRevealed(false);
    setSuperHintRevealed(false);
  }, [current?.id]);

  const mappedChoices = useMemo(() => {
    if (!current) return [] as { label: string; isCorrect: boolean }[];
    return choiceOrder.map((orig) => ({
      label: current.choices[orig],
      isCorrect: orig === current.correctIndex,
    }));
  }, [choiceOrder, current]);

  useEffect(() => {
    if (!current || revealed) return;
    const id = setInterval(() => setTimeLeft((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [current, revealed]);

  useEffect(() => {
    if (timeLeft === 0 && !revealed) {
      setRevealed(true);
      setStreak(0);
    }
  }, [timeLeft, revealed]);

  if (!current) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold">Chi l'ha detto? — Ambiguità Edition</h1>
        <p className="mt-2">Caricamento…</p>
      </div>
    );
  }

  const answered = revealed || selected !== null;
  const isSensitive = !!current.sensitive;
  const correctness = mappedChoices.findIndex((c) => c.isCorrect);
  const spiciness =
    current.spiciness === 0 ? "" : current.spiciness === 1 ? "🌶️" : "🌶️🌶️";

  function onAnswer(k: number) {
    if (revealed) return;
    setSelected(k);
    const correct = mappedChoices[k]?.isCorrect;
    if (correct) {
      const newStreak = streak + 1;
      const gained = 100 + timeLeft * 2 + streak * 10;
      setScore((s) => s + gained);
      setStreak(newStreak);
    } else {
      setStreak(0);
    }
    setRevealed(true);
  }

  function next() {
    if (i < QUESTIONS_PER_GAME - 1) {
      setI((v) => v + 1);
    } else {
      // Fine partita: estrai nuove 10 domande casuali filtrando per contenuti sensibili
      const filteredItems = includeSensitive 
        ? ITEMS 
        : ITEMS.filter(item => !item.sensitive);
      
      const shuffledIndices = shuffle(filteredItems.map((_, k) => {
        // Trova l'indice originale dell'item filtrato
        return ITEMS.findIndex(originalItem => originalItem.id === filteredItems[k].id);
      }));
      setOrder(shuffledIndices.slice(0, QUESTIONS_PER_GAME));
      setI(0);
      setScore(0);
      setStreak(0);
      setUsed5050(false);
      setUsedHint(false);
      setUsedSuperHint(false);
      setHintRevealed(false);
      setSuperHintRevealed(false);
      setDisabledOptions([]);
    }
  }

  function use5050() {
    if (used5050 || revealed) return;
    setUsed5050(true);
    const wrongs = mappedChoices
      .map((c, idx) => ({ ...c, idx }))
      .filter((c) => !c.isCorrect)
      .map((c) => c.idx);
    const keepWrong = wrongs[Math.floor(Math.random() * wrongs.length)];
    const toDisable = [0, 1, 2, 3].filter(
      (idx) => idx !== keepWrong && !mappedChoices[idx].isCorrect
    );
    setDisabledOptions(toDisable);
  }

  function useHint() {
    if (revealed || hintRevealed || usedHint) return;
    setHintRevealed(true);
    setUsedHint(true);
  }

  function useSuperHint() {
    if (revealed || superHintRevealed || usedSuperHint) return;
    setSuperHintRevealed(true);
    setUsedSuperHint(true);
  }

  function getPortrait(name: string) {
    // Se esiste immagine personalizzata, usala
    if (personaggiImageMap[name]) {
      return personaggiImageMap[name];
    }
    
    // Altrimenti usa placeholder generato come fallback
    const encoded = encodeURIComponent(name);
    return `https://ui-avatars.com/api/?name=${encoded}&background=ececec&color=111111&size=256`;
  }

  return (
    <HeroImagePreloader>
      <div className="relative min-h-screen optimize-mobile">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="images/hero-bg.png" 
            alt="Personaggi e avvenimenti storici" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Overlay scuro per migliorare la leggibilità */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
        
        {/* Content Layer */}
        <div className="relative z-10 max-w-7xl mx-auto p-2 sm:p-4 md:p-6 lg:p-8">
        {/* Header con layout responsive migliorato */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 bg-black/40 backdrop-blur-md p-3 sm:p-4 rounded-xl shadow-2xl border border-white/20">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-3 sm:mb-0 text-center sm:text-left"
              style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9), 1px 1px 2px rgba(0, 0, 0, 1)' }}>
            Chi l'ha detto? — 10 Domande
          </h1>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-3 text-xs sm:text-sm">
            <span
                  style={{ 
                    backgroundColor: '#b45309',
                    color: 'white',
                    border: '2px solid #d97706',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '12px',
                    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    display: 'inline-block'
                  }}>
              Punteggio: {score}
            </span>
            <span
                  style={{ 
                    backgroundColor: '#c2410c',
                    color: 'white',
                    border: '2px solid #ea580c',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '12px',
                    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    display: 'inline-block'
                  }}>
              Streak: {streak}
            </span>
            <span
                  style={{ 
                    backgroundColor: '#b91c1c',
                    color: 'white',
                    border: '2px solid #dc2626',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '12px',
                    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    display: 'inline-block'
                  }}>
              Tempo: {timeLeft}s
            </span>
          </div>
        </div>

        {historicalMode && isSensitive && (
          <div className="mt-3 sm:mt-4 p-2 sm:p-3 rounded-xl bg-black/30 backdrop-blur-sm border border-white/20 text-xs sm:text-sm text-white shadow-lg">
            <strong className="drop-shadow-lg">Avviso contenuti storici sensibili.</strong> 
            <span className="drop-shadow-lg"> Questo elemento è mostrato per scopi storici e didattici. Alcune citazioni/slogan sono legati a regimi autoritari e a crimini.</span>
          </div>
        )}

        {/* Barra di progresso e timer responsive */}
        <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 bg-black/20 backdrop-blur-sm p-3 rounded-xl border border-white/10">
          <div className="text-xs sm:text-sm text-white font-semibold text-center sm:text-left drop-shadow-lg"
               style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}>
            Domanda {i + 1} / {QUESTIONS_PER_GAME}
          </div>
          <div className="flex items-center justify-center sm:justify-end gap-2">
            <div className="w-32 sm:w-40 h-3 bg-black/40 rounded-full overflow-hidden border border-white/20 shadow-inner">
              <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg" style={{ width: `${(timeLeft / 45) * 100}%` }} />
            </div>
            <span className="text-xs sm:text-sm tabular-nums text-white font-semibold drop-shadow-lg"
                  style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}>{timeLeft}s</span>
          </div>
        </div>

        {/* Container principale della domanda */}
        <div className="mt-3 sm:mt-4 p-3 sm:p-4 md:p-5 bg-black/30 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20">
          {/* Citazione con font size responsive */}
          <blockquote className="text-base sm:text-lg md:text-xl leading-relaxed font-serif text-white italic text-center sm:text-left drop-shadow-lg"
                      style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9), 1px 1px 2px rgba(0, 0, 0, 1)' }}>
            "{current.quote}"
          </blockquote>

                     {/* Bottoni degli aiuti con layout responsive e grafiche accattivanti */}
           <div className="mt-3 sm:mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 text-xs sm:text-sm">
             <button
               onClick={use5050}
               disabled={used5050 || revealed}
               className={`relative px-3 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                 used5050 || revealed
                   ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-300 text-gray-500'
                   : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl'
               }`}
             >
               <span className="flex items-center gap-1">
                 <span className="text-lg">🎯</span>
                 <span>50/50</span>
               </span>
             </button>
             
             <button
               onClick={useHint}
               disabled={hintRevealed || revealed || usedHint}
               className={`relative px-3 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                 hintRevealed || revealed || usedHint
                   ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-300 text-gray-500'
                   : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 shadow-lg hover:shadow-xl'
               }`}
             >
               <span className="flex items-center gap-1">
                 <span className="text-lg">💡</span>
                 <span>Hint</span>
               </span>
             </button>
             
             <button
               onClick={useSuperHint}
               disabled={superHintRevealed || revealed || usedSuperHint}
               className={`relative px-3 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                 superHintRevealed || revealed || usedSuperHint
                   ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-300 text-gray-500'
                   : 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-xl'
               }`}
             >
               <span className="flex items-center gap-1">
                 <span className="text-lg">🚀</span>
                 <span>Super Hint</span>
               </span>
             </button>
           </div>

           {/* Visualizzazione degli hint con animazioni e stili migliorati */}
           {hintRevealed && (
             <div className="mt-3 animate-fadeIn">
               <div className="px-4 py-3 rounded-xl bg-black/40 backdrop-blur-sm border-2 border-amber-400/50 shadow-2xl">
                 <div className="flex items-center gap-2 mb-2">
                   <span className="text-2xl">💡</span>
                   <span className="font-bold text-amber-300 text-sm drop-shadow-lg">Hint Attivo</span>
                 </div>
                 <p className="text-white text-sm leading-relaxed drop-shadow-lg"
                    style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}>{current.hint_short}</p>
               </div>
             </div>
           )}
           
           {superHintRevealed && (
             <div className="mt-3 animate-fadeIn">
               <div className="px-4 py-3 rounded-xl bg-black/40 backdrop-blur-sm border-2 border-red-400/50 shadow-2xl">
                 <div className="flex items-center gap-2 mb-2">
                   <span className="text-2xl">🚀</span>
                   <span className="font-bold text-red-300 text-sm drop-shadow-lg">Super Hint Attivo</span>
                 </div>
                 <div className="space-y-2">
                   <div className="p-2 bg-black/20 backdrop-blur-sm rounded-lg border border-white/20">
                     <span className="font-semibold text-amber-300 text-xs drop-shadow-lg">💡 Hint:</span>
                     <p className="text-white text-sm mt-1 drop-shadow-lg"
                        style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}>{current.hint_short}</p>
                   </div>
                   <div className="p-2 bg-black/20 backdrop-blur-sm rounded-lg border border-white/20">
                     <span className="font-semibold text-red-300 text-xs drop-shadow-lg">🔍 Dettaglio:</span>
                     <p className="text-white text-sm mt-1 drop-shadow-lg"
                        style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}>{current.hint_more}</p>
                   </div>
                 </div>
               </div>
             </div>
           )}

          {/* Container delle opzioni con grid responsive migliorato */}
          <div className="mt-4 sm:mt-5 relative">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
              {mappedChoices.map((c, idx) => {
                const isDisabled = disabledOptions.includes(idx) || revealed;
                const isCorrect = idx === correctness;
                const isSelectedWrong = selected === idx && !c.isCorrect;
                const ring = isCorrect ? "ring-2 ring-green-600" : isSelectedWrong ? "ring-2 ring-red-600" : "hover:ring-1 hover:ring-amber-400";
                return (
                  <button
                    key={idx}
                    disabled={isDisabled}
                    onClick={() => onAnswer(idx)}
                    className={`group overflow-hidden rounded-xl border border-white/20 bg-black/20 backdrop-blur-sm text-left disabled:opacity-60 transition ${ring} shadow-lg hover:shadow-2xl aspect-[3/4] flex flex-col hover:border-white/40`}
                  >
                    <div className="w-full overflow-hidden relative flex-grow">
                      <img
                        src={getPortrait(c.label)}
                        alt={c.label}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                      {/* Overlay per il nome con font size responsive */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-1 sm:p-2">
                        <div className="font-bold text-xs sm:text-sm md:text-base text-white drop-shadow-lg leading-tight"
                             style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9), 1px 1px 2px rgba(0, 0, 0, 1)' }}>
                          {c.label}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Overlay della risposta con layout responsive */}
            {(selected !== null || revealed) && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-md rounded-2xl border-2 border-white/30 shadow-2xl z-10 flex items-center justify-center p-3 sm:p-6">
                <div className="text-center max-w-xs sm:max-w-2xl w-full">
                  <div className="mb-4 sm:mb-6">
                    {selected !== null && mappedChoices[selected]?.isCorrect ? (
                      <div className="text-2xl sm:text-3xl font-bold text-green-400 mb-2 drop-shadow-lg">✅ Corretto!</div>
                    ) : (
                      <div className="text-2xl sm:text-3xl font-bold text-red-400 mb-2 drop-shadow-lg">❌ Errato.</div>
                    )}
                    <div className="text-base sm:text-lg text-white drop-shadow-lg"
                         style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}>
                      Autore: <span className="font-bold text-amber-300">{current.author}</span>
                    </div>
                  </div>

                  {historicalMode && (
                    <div className="mb-4 sm:mb-6 text-left space-y-2 sm:space-y-3">
                      <div className="p-2 sm:p-3 bg-black/40 backdrop-blur-sm rounded-lg border-l-4 border-amber-500 border border-white/20">
                        <p className="text-xs sm:text-sm leading-relaxed">
                          <span className="font-semibold text-amber-300 drop-shadow-lg">Contesto:</span> 
                          <span className="text-white drop-shadow-lg ml-1"
                                style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}>{current.context}</span>
                        </p>
                      </div>
                      <div className="p-2 sm:p-3 bg-black/40 backdrop-blur-sm rounded-lg border-l-4 border-orange-500 border border-white/20">
                        <p className="text-xs sm:text-sm leading-relaxed">
                          <span className="font-semibold text-orange-300 drop-shadow-lg">Perché trae in inganno:</span> 
                          <span className="text-white drop-shadow-lg ml-1"
                                style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}>{current.ambiguity_note}</span>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Bottoni di azione con layout responsive */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center items-center">
                    <a
                      href={current.source_link}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 sm:px-4 py-2 rounded-lg border border-white/30 bg-black/30 backdrop-blur-sm hover:bg-black/50 text-xs sm:text-sm font-medium transition-colors text-white text-center w-full sm:w-auto drop-shadow-lg"
                      style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}
                    >
                      📚 Fonte: {current.source_title}
                    </a>
                    <button 
                      onClick={next} 
                      className="px-4 sm:px-6 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold hover:from-amber-600 hover:to-orange-600 transition-colors shadow-lg text-sm sm:text-base w-full sm:w-auto drop-shadow-lg"
                      style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}
                    >
                      {i < QUESTIONS_PER_GAME - 1 ? "Prossima Domanda" : "Nuovo Round"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer con testo responsive */}
        <div className="mt-4 sm:mt-6 text-xs text-center sm:text-left">
          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <p className="px-2 sm:px-0 text-white drop-shadow-lg"
               style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}>
              🎓 <strong>Contenuti a scopo educativo:</strong> Le citazioni storiche, anche quelle controverse, sono presentate nel loro contesto per favorire la comprensione critica della storia.
            </p>
          </div>
        </div>
        </div>
      </div>
      </HeroImagePreloader>
   );
 }

