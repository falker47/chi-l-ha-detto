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

export default function ChiLHaDetto() {
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
    // Estrai casualmente solo 10 domande per ogni partita
    const shuffledIndices = shuffle(ITEMS.map((_, k) => k));
    setOrder(shuffledIndices.slice(0, QUESTIONS_PER_GAME));
  }, []);

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
    setUsed5050(false);
    setDisabledOptions([]);
    setHintRevealed(false);
    setSuperHintRevealed(false);
    setUsedHint(false);
    setUsedSuperHint(false);
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
      // Fine partita: estrai nuove 10 domande casuali
      const shuffledIndices = shuffle(ITEMS.map((_, k) => k));
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
      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 text-amber-900 optimize-mobile">
      <div className="max-w-7xl mx-auto p-2 sm:p-4 md:p-6 lg:p-8">
        {/* Header con layout responsive migliorato */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 bg-gradient-to-r from-amber-800 via-orange-800 to-amber-900 p-3 sm:p-4 rounded-xl shadow-lg border border-amber-700">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-amber-50 text-shadow-2xl mb-3 sm:mb-0 text-center sm:text-left">
            Chi l'ha detto? — 10 Domande
          </h1>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-3 text-xs sm:text-sm">
            <span className="pill bg-amber-200 text-amber-800 border border-amber-300 px-2 py-1 rounded-lg">
              Punteggio: {score}
            </span>
            <span className="pill bg-orange-200 text-orange-800 border border-orange-300 px-2 py-1 rounded-lg">
              Streak: {streak}
            </span>
            <span className="pill bg-yellow-200 text-yellow-800 border border-yellow-300 px-2 py-1 rounded-lg">
              Tempo: {timeLeft}s
            </span>
          </div>
        </div>

        {historicalMode && isSensitive && (
          <div className="mt-3 sm:mt-4 p-2 sm:p-3 rounded-xl bg-amber-50 border border-amber-300 text-xs sm:text-sm text-amber-800">
            <strong>Avviso contenuti storici sensibili.</strong> Questo elemento è mostrato per
            scopi storici e didattici. Alcune citazioni/slogan sono legati a regimi autoritari e a crimini.
          </div>
        )}

        {/* Barra di progresso e timer responsive */}
        <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
          <div className="text-xs sm:text-sm text-amber-700 font-medium text-center sm:text-left">
            Domanda {i + 1} / {QUESTIONS_PER_GAME}
          </div>
          <div className="flex items-center justify-center sm:justify-end gap-2">
            <div className="w-32 sm:w-40 h-2 bg-amber-200 rounded-full overflow-hidden border border-amber-300">
              <div className="h-full bg-gradient-to-r from-amber-600 to-orange-600" style={{ width: `${(timeLeft / 45) * 100}%` }} />
            </div>
            <span className="text-xs sm:text-sm tabular-nums text-amber-700 font-medium">{timeLeft}s</span>
          </div>
        </div>

        {/* Container principale della domanda */}
        <div className="mt-3 sm:mt-4 p-3 sm:p-4 md:p-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg border border-amber-200">
          {/* Citazione con font size responsive */}
          <blockquote className="text-base sm:text-lg md:text-xl leading-relaxed font-serif text-amber-900 italic text-center sm:text-left">
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
               {used5050 && (
                 <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
               )}
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
               {usedHint && (
                 <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
               )}
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
               {usedSuperHint && (
                 <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
               )}
             </button>
           </div>

           {/* Visualizzazione degli hint con animazioni e stili migliorati */}
           {hintRevealed && (
             <div className="mt-3 animate-fadeIn">
               <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 shadow-lg">
                 <div className="flex items-center gap-2 mb-2">
                   <span className="text-2xl">💡</span>
                   <span className="font-bold text-amber-800 text-sm">Hint Attivo</span>
                 </div>
                 <p className="text-amber-900 text-sm leading-relaxed">{current.hint_short}</p>
               </div>
             </div>
           )}
           
           {superHintRevealed && (
             <div className="mt-3 animate-fadeIn">
               <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 shadow-lg">
                 <div className="flex items-center gap-2 mb-2">
                   <span className="text-2xl">🚀</span>
                   <span className="font-bold text-red-800 text-sm">Super Hint Attivo</span>
                 </div>
                 <div className="space-y-2">
                   <div className="p-2 bg-white/50 rounded-lg border border-red-200">
                     <span className="font-semibold text-red-700 text-xs">💡 Hint:</span>
                     <p className="text-red-800 text-sm mt-1">{current.hint_short}</p>
                   </div>
                   <div className="p-2 bg-white/50 rounded-lg border border-red-200">
                     <span className="font-semibold text-red-700 text-xs">🔍 Dettaglio:</span>
                     <p className="text-red-800 text-sm mt-1">{current.hint_more}</p>
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
                    className={`group overflow-hidden rounded-xl border border-amber-200 bg-amber-50 text-left disabled:opacity-60 transition ${ring} shadow-sm hover:shadow aspect-[3/4] flex flex-col hover:border-amber-300`}
                  >
                    <div className="w-full bg-amber-100 overflow-hidden relative flex-grow">
                      <img
                        src={getPortrait(c.label)}
                        alt={c.label}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                      {/* Overlay per il nome con font size responsive */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-1 sm:p-2">
                        <div className="font-bold text-xs sm:text-sm md:text-base text-white drop-shadow-lg leading-tight">
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
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50/95 via-orange-50/95 to-amber-100/95 backdrop-blur-sm rounded-2xl border-2 border-amber-300 shadow-2xl z-10 flex items-center justify-center p-3 sm:p-6">
                <div className="text-center max-w-xs sm:max-w-2xl w-full">
                  <div className="mb-4 sm:mb-6">
                    {selected !== null && mappedChoices[selected]?.isCorrect ? (
                      <div className="text-2xl sm:text-3xl font-bold text-green-700 mb-2">✅ Corretto!</div>
                    ) : (
                      <div className="text-2xl sm:text-3xl font-bold text-red-700 mb-2">❌ Errato.</div>
                    )}
                    <div className="text-base sm:text-lg text-amber-800">
                      Autore: <span className="font-bold text-amber-900">{current.author}</span>
                    </div>
                  </div>

                  {historicalMode && (
                    <div className="mb-4 sm:mb-6 text-left space-y-2 sm:space-y-3">
                      <div className="p-2 sm:p-3 bg-amber-100 rounded-lg border-l-4 border-amber-500 border border-amber-300">
                        <p className="text-xs sm:text-sm leading-relaxed">
                          <span className="font-semibold text-amber-900">Contesto:</span> <span className="text-amber-800">{current.context}</span>
                        </p>
                      </div>
                      <div className="p-2 sm:p-3 bg-orange-100 rounded-lg border-l-4 border-orange-500 border border-orange-300">
                        <p className="text-xs sm:text-sm leading-relaxed">
                          <span className="font-semibold text-orange-900">Perché trae in inganno:</span> <span className="text-orange-800">{current.ambiguity_note}</span>
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
                      className="px-3 sm:px-4 py-2 rounded-lg border border-amber-400 bg-amber-50 hover:bg-amber-100 text-xs sm:text-sm font-medium transition-colors text-amber-800 text-center w-full sm:w-auto"
                    >
                      📚 Fonte: {current.source_title}
                    </a>
                    <button 
                      onClick={next} 
                      className="px-4 sm:px-6 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold hover:from-amber-700 hover:to-orange-700 transition-colors shadow-lg text-sm sm:text-base w-full sm:w-auto"
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
        <div className="mt-4 sm:mt-6 text-xs text-amber-600 text-center sm:text-left">
          <p className="px-2 sm:px-0">
            Modalità Historical/Context attiva: le citazioni controverse sono presentate con finalità
            educative e contestualizzate. Evitiamo slogan d'odio non contestualizzati e incitazioni.
          </p>
                 </div>
       </div>
     </div>
      </HeroImagePreloader>
   );
 }

