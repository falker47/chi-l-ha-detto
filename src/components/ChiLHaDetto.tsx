import React, { useEffect, useMemo, useState, useCallback } from "react";
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
  gameMode,
  backgroundImage,
  onBackToMenu 
}: { 
  includeSensitive: boolean; 
  gameMode: 'classic' | 'millionaire';
  backgroundImage: string;
  onBackToMenu: () => void; 
}) {
  const [historicalMode, setHistoricalMode] = useState(true);
  const [order, setOrder] = useState<number[]>([]);
  const [i, setI] = useState(0);
  const [timeLeft, setTimeLeft] = useState(gameMode === 'millionaire' ? 60 : 45);
  const [revealed, setRevealed] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [finalStreak, setFinalStreak] = useState(0);
  const [usedQuestions, setUsedQuestions] = useState<Set<number>>(new Set());
  
  // Funzione per caricare le domande usate dal localStorage
  const loadUsedQuestions = useCallback((): Set<number> => {
    try {
      const stored = localStorage.getItem('chiLHaDetto_usedQuestions');
      if (stored) {
        const parsed = JSON.parse(stored) as number[];
        return new Set(parsed);
      }
    } catch (error) {
      console.warn('Errore nel caricamento delle domande usate:', error);
    }
    return new Set<number>();
  }, []);
  
  // Funzione per salvare le domande usate nel localStorage
  const saveUsedQuestions = useCallback((questions: Set<number>) => {
    try {
      localStorage.setItem('chiLHaDetto_usedQuestions', JSON.stringify([...questions]));
    } catch (error) {
      console.warn('Errore nel salvataggio delle domande usate:', error);
    }
  }, []);
  
  // Funzione per resettare le domande usate
  const resetUsedQuestions = useCallback(() => {
    const resetUsedQuestions = new Set<number>();
    setUsedQuestions(resetUsedQuestions);
    saveUsedQuestions(resetUsedQuestions);
  }, [saveUsedQuestions]);
  const [used5050, setUsed5050] = useState(false);
  const [disabledOptions, setDisabledOptions] = useState<number[]>([]);
  const [usedHint, setUsedHint] = useState(false);
  const [usedSuperHint, setUsedSuperHint] = useState(false);
  const [used2ndChance, setUsed2ndChance] = useState(false);
  const [is2ndChanceActive, setIs2ndChanceActive] = useState(false);
  const [hintRevealed, setHintRevealed] = useState(false);
  const [superHintRevealed, setSuperHintRevealed] = useState(false);
  const [showClimbingAnimation, setShowClimbingAnimation] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [completedLevels, setCompletedLevels] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [imagesPreloaded, setImagesPreloaded] = useState(false);
  const [showGameOverAnimation, setShowGameOverAnimation] = useState(false);
  const [isTimeoutGameOver, setIsTimeoutGameOver] = useState(false);
  
  // Costanti per la modalità di gioco
  const QUESTIONS_PER_GAME = 12; // Ogni partita ha 12 domande
  
  // Configurazione modalità milionario
  const MILLIONAIRE_DIFFICULTY_MAP = [
    { min: 1, max: 1 },    // Q1: difficoltà 1
    { min: 1, max: 2 },    // Q2: difficoltà 1-2
    { min: 2, max: 2 },    // Q3: difficoltà 2
    { min: 3, max: 3 },    // Q4: difficoltà 3
    { min: 3, max: 4 },    // Q5: difficoltà 3-4
    { min: 4, max: 4 },    // Q6: difficoltà 4
    { min: 4, max: 5 },    // Q7: difficoltà 4-5
    { min: 5, max: 5 },    // Q8: difficoltà 5
    { min: 5, max: 6 },    // Q9: difficoltà 5-6
    { min: 6, max: 6 },    // Q10: difficoltà 6
    { min: 6, max: 7 },    // Q11: difficoltà 6-7
    { min: 7, max: 7 }     // Q12: difficoltà 7
  ];

  useEffect(() => {
    // Carica le domande usate dal localStorage
    const loadedUsedQuestions = loadUsedQuestions();
    setUsedQuestions(loadedUsedQuestions);
    
    // Filtra le domande in base alla preferenza per contenuti sensibili
    const filteredItems = includeSensitive 
      ? ITEMS 
      : ITEMS.filter(item => !item.sensitive);
    
    if (gameMode === 'millionaire') {
      // Modalità milionario: seleziona domande per difficoltà progressiva
      const selectedQuestions: number[] = [];
      
      for (let i = 0; i < QUESTIONS_PER_GAME; i++) {
        const difficultyRange = MILLIONAIRE_DIFFICULTY_MAP[i];
        const availableQuestions = filteredItems.filter((item, index) => 
          item.difficulty >= difficultyRange.min && 
          item.difficulty <= difficultyRange.max &&
          !loadedUsedQuestions.has(index)
        );
        
        if (availableQuestions.length > 0) {
          const randomQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
          const originalIndex = ITEMS.findIndex(item => item.id === randomQuestion.id);
          selectedQuestions.push(originalIndex);
        } else {
          // Fallback: se non ci sono domande per questa difficoltà, prendi una casuale non usata
          const availableFallback = filteredItems.filter((_, index) => !loadedUsedQuestions.has(index));
          if (availableFallback.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableFallback.length);
            const fallbackQuestion = availableFallback[randomIndex];
            const originalIndex = ITEMS.findIndex(item => item.id === fallbackQuestion.id);
            selectedQuestions.push(originalIndex);
          } else {
            // Se tutte le domande sono state usate, resetta e ricomincia
            resetUsedQuestions();
            
            // Riprova con domande non usate
            const randomIndex = Math.floor(Math.random() * filteredItems.length);
            const fallbackQuestion = filteredItems[randomIndex];
            const originalIndex = ITEMS.findIndex(item => item.id === fallbackQuestion.id);
            selectedQuestions.push(originalIndex);
          }
        }
      }
      
      setOrder(selectedQuestions);
    } else {
      // Modalità Battaglia di Achille: inizializza con array vuoto, le domande verranno selezionate dinamicamente
      setOrder([]);
    }
    
    // Reset completo dello stato del gioco quando cambia la modalità
    setI(0);
    setScore(0);
    setStreak(0);
    setFinalStreak(0);
    setUsed5050(false);
    setUsedHint(false);
    setUsedSuperHint(false);
    setUsed2ndChance(false);
    setIs2ndChanceActive(false);
    setHintRevealed(false);
    setSuperHintRevealed(false);
    setIs2ndChanceActive(false);
    setDisabledOptions([]);
    setGameOver(false);
    setRevealed(false);
    setSelected(null);
    setTimeLeft(gameMode === 'millionaire' ? 60 : 45);
    setShowClimbingAnimation(false);
    setCurrentLevel(0);
    setCompletedLevels(0);
    setIsTimeoutGameOver(false);
    setImagesPreloaded(false);
    // Non resettare showGameOverAnimation qui, viene gestito in onAnswer
  }, [includeSensitive, gameMode, loadUsedQuestions, saveUsedQuestions, resetUsedQuestions]);

  // Funzione per selezionare la prossima domanda nella modalità classic
  const selectNextQuestion = useCallback(() => {
    if (gameMode !== 'classic') return;
    
    const filteredItems = includeSensitive ? ITEMS : ITEMS.filter(item => !item.sensitive);
    const availableItems = filteredItems.filter((_, index) => !usedQuestions.has(index));
    
    if (availableItems.length === 0) {
      // Se non ci sono più domande disponibili, resetta le domande usate
      resetUsedQuestions();
      return;
    }
    
    // Calcola la difficoltà target basata sulla progressione
    const progressRatio = i / Math.max(1, filteredItems.length);
    const targetDifficulty = Math.min(7, Math.max(1, Math.floor(1 + progressRatio * 6)));
    
    // Trova domande con difficoltà vicina alla target
    const availableQuestions = availableItems.filter(item => 
      Math.abs(item.difficulty - targetDifficulty) <= 1
    );
    
    let selectedQuestion;
    if (availableQuestions.length > 0) {
      selectedQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    } else {
      selectedQuestion = availableItems[Math.floor(Math.random() * availableItems.length)];
    }
    
    const originalIndex = ITEMS.findIndex(item => item.id === selectedQuestion.id);
    setOrder([originalIndex]);
  }, [gameMode, includeSensitive, usedQuestions, i, saveUsedQuestions, resetUsedQuestions]);

  const current: Item | null = useMemo(() => {
    if (gameMode === 'classic') {
      // Per la modalità classic, seleziona dinamicamente la domanda
      if (order.length === 0) {
        selectNextQuestion();
        return null;
      }
      return ITEMS[order[0]];
    } else {
      // Per la modalità millionaire, usa l'ordine predefinito
      return order.length ? ITEMS[order[i]] : null;
    }
  }, [order, i, gameMode, selectNextQuestion]);

  // Funzione per preload delle immagini dei personaggi
  const preloadCharacterImages = useCallback((choices: string[]) => {
    setImagesPreloaded(false);
    const imagePromises = choices.map(characterName => {
      return new Promise<void>((resolve) => {
        const imageUrl = getPortrait(characterName);
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve(); // Anche in caso di errore, continua
        img.src = imageUrl;
      });
    });
    
    Promise.all(imagePromises).then(() => {
      setImagesPreloaded(true);
    });
  }, []);

  const [choiceOrder, setChoiceOrder] = useState<number[]>([]);
  useEffect(() => {
    if (!current) return;
    setChoiceOrder(shuffle([0, 1, 2, 3]));
    setTimeLeft(gameMode === 'millionaire' ? 60 : 45);
    setRevealed(false);
    setSelected(null);
    setDisabledOptions([]);
    setHintRevealed(false);
    setSuperHintRevealed(false);
    
    // Preload delle immagini dei personaggi per questa domanda
    preloadCharacterImages(current.choices);
  }, [current, preloadCharacterImages]);

  const mappedChoices = useMemo(() => {
    if (!current) return [] as { label: string; isCorrect: boolean }[];
    return choiceOrder.map((orig) => ({
      label: current.choices[orig],
      isCorrect: orig === current.correctIndex,
    }));
  }, [choiceOrder, current]);

  useEffect(() => {
    if (!current || revealed || gameOver) return;
    const id = setInterval(() => setTimeLeft((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [current, revealed, gameOver]);

  useEffect(() => {
    if (timeLeft === 0 && !revealed) {
      // Salva la streak finale prima di resettarla
      setFinalStreak(streak);
      setStreak(0);
      
      // Entrambe le modalità: game over se il timer scade
      setIsTimeoutGameOver(true); // Marca come game over per timeout
      
      if (gameMode === 'millionaire') {
        // Modalità Le 12 Fatiche: mostra animazione game over e poi va in game over definitivo
        setShowGameOverAnimation(true);
        setTimeout(() => {
          setShowGameOverAnimation(false);
          setRevealed(true);
          setGameOver(true); // Game over definitivo per Le 12 Fatiche
        }, 2000);
      } else {
        // Modalità Battaglia di Achille: mostra animazione game over
        setShowGameOverAnimation(true);
        
        // Marca la domanda corrente come usata anche in caso di timeout
        if (current) {
          const currentIndex = ITEMS.findIndex(item => item.id === current.id);
          const newUsedQuestions = new Set([...usedQuestions, currentIndex]);
          setUsedQuestions(newUsedQuestions);
          saveUsedQuestions(newUsedQuestions);
        }
        
        setTimeout(() => {
          setShowGameOverAnimation(false);
          setRevealed(true);
          // Non impostare gameOver qui per permettere alla FASE 4 di rendersi
        }, 2000);
      }
    }
  }, [timeLeft, revealed, gameMode, streak]);

  if (!current || !imagesPreloaded) {
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

  // Funzione helper per calcolare il bonus tempo nella modalità Battaglia di Achille
  function getTimeBonus(timeLeft: number): { multiplier: number; label: string; color: string } {
    if (timeLeft >= 30) {
      return { multiplier: 1.0, label: '100%', color: 'text-green-400' };
    } else if (timeLeft >= 15) {
      return { multiplier: 0.8, label: '80%', color: 'text-yellow-400' };
    } else {
      return { multiplier: 0.6, label: '60%', color: 'text-red-400' };
    }
  }

  function onAnswer(k: number) {
    if (revealed || gameOver) return;
    setSelected(k);
    const correct = mappedChoices[k]?.isCorrect;
    if (correct) {
      const newStreak = streak + 1;
      
      // Sistema di punteggio diverso per ogni modalità
      let gained;
      if (gameMode === 'millionaire') {
        // Modalità Verso l'Olimpo: punteggio fisso
        gained = 100 + timeLeft * 2 + streak * 10;
      } else {
        // Modalità Battaglia di Achille: punteggio basato sulla difficoltà + moltiplicatore streak + bonus tempo
        const basePoints = (current?.difficulty || 1) * 50; // 50 punti per livello di difficoltà
        const streakMultiplier = Math.max(1, newStreak); // Moltiplicatore minimo 1
        
        // Bonus tempo: entro 15s = 100%, entro 30s = 80%, oltre = 60%
        const timeBonus = getTimeBonus(timeLeft);
        
        gained = Math.round(basePoints * streakMultiplier * timeBonus.multiplier);
      }
      
      setScore((s) => s + gained);
      setStreak(newStreak);
      
              // Modalità Verso l'Olimpo: mostra animazione di scalata
        if (gameMode === 'millionaire') {
          const newLevel = i + 1;
          setCurrentLevel(newLevel);
          setCompletedLevels(newLevel); // Aggiorna i livelli completati
          setShowClimbingAnimation(true);
          setRevealed(true); // Importante: imposta revealed per mostrare l'animazione
          
          // Se 2nd Chance era attivo, ora è usato (anche se la risposta era giusta)
          if (is2ndChanceActive) {
            setUsed2ndChance(true);
            setIs2ndChanceActive(false);
          }
          
          // Durata diversa per vittoria finale (livello 12) vs livelli normali
          const animationDuration = newLevel === 12 ? 3000 : 1500;
          setTimeout(() => {
            setShowClimbingAnimation(false);
          }, animationDuration);
        } else {
        // Modalità Battaglia di Achille: mostra animazione di vittoria
        setShowClimbingAnimation(true);
        setRevealed(true); // Importante: imposta revealed per mostrare l'animazione
        
        // Animazione più breve per la battaglia (1000ms)
        setTimeout(() => {
          setShowClimbingAnimation(false);
        }, 1000);
      }
    } else {
      // Salva la streak finale prima di resettarla
      setFinalStreak(streak);
      setStreak(0);
      
      if (gameMode === 'millionaire') {
        // Modalità Verso l'Olimpo: gestisce 2nd Chance
        if (is2ndChanceActive && !used2ndChance) {
          // Seconda chance attiva e prima risposta errata: marca come usata e permette nuovo tentativo
          setUsed2ndChance(true);
          setIs2ndChanceActive(false);
          setSelected(null); // Reset della selezione per permettere nuovo tentativo
          
          // Aggiungi l'opzione errata alle disabilitate per renderla evidente
          setDisabledOptions([k]);
          return; // Non mostra ancora la risposta, permette nuovo tentativo
        } else {
          // Nessun 2nd chance o già usato: game over definitivo
          setShowGameOverAnimation(true);
          
          // Marca la domanda corrente come usata anche in caso di errore
          if (current) {
            const currentIndex = ITEMS.findIndex(item => item.id === current.id);
            const newUsedQuestions = new Set([...usedQuestions, currentIndex]);
            setUsedQuestions(newUsedQuestions);
            saveUsedQuestions(newUsedQuestions);
          }
          
          // Dopo 2 secondi di animazione game over, mostra la risposta corretta
          setTimeout(() => {
            setShowGameOverAnimation(false);
            setRevealed(true);
          }, 2000);
          return;
        }
      } else {
        // Modalità Battaglia di Achille: game over immediato
        setShowGameOverAnimation(true); // Mostra animazione game over
        
        // Marca la domanda corrente come usata anche in caso di timeout
        if (current) {
          const currentIndex = ITEMS.findIndex(item => item.id === current.id);
          const newUsedQuestions = new Set([...usedQuestions, currentIndex]);
          setUsedQuestions(newUsedQuestions);
          saveUsedQuestions(newUsedQuestions);
        }
        
        // Dopo 2 secondi di animazione, mostra la spiegazione
        setTimeout(() => {
          setShowGameOverAnimation(false);
          setRevealed(true); // Imposta revealed solo dopo l'animazione
          setGameOver(true); // Imposta game over solo dopo l'animazione
        }, 2000);
      }
    }
  }

    function next() {
    // Modalità Verso l'Olimpo: se si è sbagliato, non permettere di continuare
    if (gameMode === 'millionaire' && selected !== null && !mappedChoices[selected]?.isCorrect) {
      return;
    }
    
    if (gameMode === 'millionaire') {
      // Modalità Verso l'Olimpo: 12 domande fisse
      if (i < QUESTIONS_PER_GAME - 1) {
        setI((v) => v + 1);
        
        // Reset dello stato per la nuova domanda (mantiene punteggio e streak)
        setRevealed(false);
        setSelected(null);
        setDisabledOptions([]);
        setTimeLeft(60); // Reset timer per la nuova domanda
        setImagesPreloaded(false);
      } else {
        // Fine partita Verso l'Olimpo - ricarica le domande
        const filteredItems = includeSensitive 
          ? ITEMS 
          : ITEMS.filter(item => !item.sensitive);
        
        // Modalità milionario: seleziona domande per difficoltà progressiva
        const selectedQuestions: number[] = [];
        
        for (let i = 0; i < QUESTIONS_PER_GAME; i++) {
          const difficultyRange = MILLIONAIRE_DIFFICULTY_MAP[i];
          const availableQuestions = filteredItems.filter(item => 
            item.difficulty >= difficultyRange.min && item.difficulty <= difficultyRange.max
          );
          
          if (availableQuestions.length > 0) {
            const randomQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
            const originalIndex = ITEMS.findIndex(item => item.id === randomQuestion.id);
            selectedQuestions.push(originalIndex);
          } else {
            // Fallback: se non ci sono domande per questa difficoltà, prendi una casuale
            const randomIndex = Math.floor(Math.random() * filteredItems.length);
            const fallbackQuestion = filteredItems[randomIndex];
            const originalIndex = ITEMS.findIndex(item => item.id === fallbackQuestion.id);
            selectedQuestions.push(originalIndex);
          }
        }
        
        setOrder(selectedQuestions);
        setI(0);
        setScore(0);
        setStreak(0);
        setUsed5050(false);
        setUsedHint(false);
        setUsedSuperHint(false);
        setUsed2ndChance(false);
        setHintRevealed(false);
        setSuperHintRevealed(false);
        setDisabledOptions([]);
        setGameOver(false);
      }
    } else {
      // Modalità Battaglia di Achille: partita infinita, continua con la prossima domanda
      setI((v) => v + 1);
      
      // Marca la domanda corrente come usata
      if (current) {
        const currentIndex = ITEMS.findIndex(item => item.id === current.id);
        const newUsedQuestions = new Set([...usedQuestions, currentIndex]);
        setUsedQuestions(newUsedQuestions);
        saveUsedQuestions(newUsedQuestions);
      }
      
      // Reset dello stato per la nuova domanda (mantiene punteggio e streak)
      setRevealed(false);
      setSelected(null);
      setDisabledOptions([]);
      setTimeLeft(45); // Reset timer per la nuova domanda
      setImagesPreloaded(false);
      
      // Seleziona la prossima domanda
      selectNextQuestion();
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

  function use2ndChance() {
    if (used2ndChance || revealed || gameOver) return;
    setIs2ndChanceActive(true);
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
        {/* Background Image dinamico */}
        <div className="absolute inset-0">
          <img 
            src={backgroundImage} 
            alt="Personaggi e avvenimenti storici" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Overlay scuro per migliorare la leggibilità */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
        
        {/* Content Layer */}
        <div className="relative z-10 max-w-7xl mx-auto p-2 sm:p-4 md:p-6 lg:p-8">
                 {/* Header compatto ottimizzato - layout orizzontale su mobile */}
         <div className="flex flex-row items-center justify-between mb-2 sm:mb-2 bg-black/40 backdrop-blur-md p-2 sm:p-3 rounded-xl shadow-2xl border border-white/20">
           <h1 className="text-sm sm:text-lg md:text-xl font-extrabold tracking-tight text-white text-left truncate flex-1 mr-2"
               style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9), 1px 1px 2px rgba(0, 0, 0, 1)' }}>
             Chi l'ha detto? — {gameMode === 'millionaire' ? 'Le fatiche di Ercole' : 'Aristeia di Achille'}
           </h1>
           <div className="flex items-center gap-2 text-xs sm:text-sm flex-shrink-0">
                           {/* Bottone Torna al Menu - freccia curva */}
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
         </div>

                 {historicalMode && isSensitive && (
           <div className="mt-2 sm:mt-2 py-1 sm:py-2 px-2 rounded-lg bg-black/30 backdrop-blur-sm border border-white/20 text-xs text-white shadow-lg">
             <strong className="drop-shadow-lg">Avviso contenuti storici sensibili.</strong> 
             <span className="drop-shadow-lg"> Questo elemento è mostrato per scopi storici e didattici.</span>
           </div>
         )}

                 {/* Barra di progresso e timer responsive - compatta - layout orizzontale su mobile */}
         <div className="mt-2 sm:mt-2 flex flex-row items-center justify-between gap-2 bg-black/20 backdrop-blur-sm p-2 rounded-lg border border-white/10">
          <div className="text-xs sm:text-sm text-white font-semibold text-center sm:text-left drop-shadow-lg"
               style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}>
            {gameMode === 'millionaire' ? (
              <>
                <div className="text-purple-300 font-bold text-lg sm:text-xl">Liv. {i + 1} di 12</div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                {/* Streak con più rilevanza */}
                <span
                  style={{ 
                    backgroundColor: '#c2410c',
                    color: 'white',
                    border: '2px solid #ea580c',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontWeight: '700',
                    fontSize: '14px',
                    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                    display: 'inline-block'
                  }}>
                  🔥 Streak: {streak}
                </span>
                {/* Score */}
                <span
                  style={{ 
                    backgroundColor: '#7c3aed',
                    color: 'white',
                    border: '2px solid #a855f7',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontWeight: '700',
                    fontSize: '14px',
                    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                    display: 'inline-block'
                  }}>
                  💎 Score: {score}
                </span>
              </div>
            )}
          </div>
          
                     {/* Progress bar accattivante per modalità Verso l'Olimpo - compatta */}
           {gameMode === 'millionaire' && (
             <div className="flex-1 mx-3">
               <div className="w-full h-4 bg-black/50 rounded-full overflow-hidden border-2 border-purple-400/40 shadow-inner relative">
                {/* Sfondo con pattern sottile */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 to-purple-800/30 opacity-50"></div>
                
                {/* Progresso principale con gradiente animato */}
                <div className="h-full bg-gradient-to-r from-purple-400 via-purple-300 to-purple-500 shadow-lg transition-all duration-700 ease-out relative overflow-hidden"
                     style={{ width: `${(completedLevels / 12) * 100}%` }}>
                  
                  {/* Effetto brillante che si muove */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                  
                  {/* Bordo luminoso interno */}
                  <div className="absolute inset-0 rounded-full border border-white/30"></div>
                </div>
                
                {/* Indicatori di livello con piccoli punti - allineamento perfetto */}
                <div className="absolute inset-0 flex items-center justify-between px-1">
                  {Array.from({ length: 13 }, (_, index) => {
                    // Calcola la posizione esatta del punto (0-12)
                    const pointPosition = index;
                    // Calcola la posizione corrente della progress bar (0-12) - si aggiorna solo dopo risposta corretta
                    const currentProgress = completedLevels;
                    // Il punto si illumina solo se la progress bar ha superato la sua posizione
                    const shouldLightUp = pointPosition < currentProgress;
                    
                    return (
                      <div key={index} className={`w-1 h-1 rounded-full transition-all duration-300 ${
                        shouldLightUp ? 'bg-purple-200 shadow-sm' : 'bg-purple-800/50'
                      }`}></div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          
                     <div className="flex items-center justify-end gap-2 sm:gap-3">
            {/* Score per modalità Verso l'Olimpo */}
            {gameMode === 'millionaire' && (
              <span
                style={{ 
                  backgroundColor: '#7c3aed',
                  color: 'white',
                  border: '2px solid #a855f7',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '12px',
                  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  display: 'inline-block'
                }}>
                Score: {score}
              </span>
            )}
            
                         {/* Timer circolare (tipo orologio) - compatto per mobile */}
             <div className="relative w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12">
              {/* Sfondo circolare */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                {/* Sfondo grigio */}
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="rgba(0, 0, 0, 0.3)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {/* Progresso del tempo - calcolo corretto per cerchio */}
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={gameMode === 'millionaire' ? '#8b5cf6' : '#f59e0b'}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="100, 100"
                  strokeDashoffset={100 - ((timeLeft / (gameMode === 'millionaire' ? 60 : 45)) * 100)}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              {/* Tempo al centro - compatto per mobile */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs sm:text-sm tabular-nums text-white font-bold drop-shadow-lg leading-none"
                      style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}>
                  {timeLeft}
                </span>
                <span className="text-xs text-white font-semibold drop-shadow-lg leading-none"
                      style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}>
                  s
                </span>
              </div>
            </div>
          </div>
        </div>

                 {/* Container principale della domanda - compatto */}
         <div className="mt-2 sm:mt-2 p-2 sm:p-3 bg-black/30 backdrop-blur-md rounded-xl shadow-2xl border border-white/20">
                     {/* Citazione con font size responsive - compatto */}
           <blockquote className="text-sm sm:text-base md:text-lg leading-relaxed font-serif text-white italic text-center sm:text-left drop-shadow-lg"
                        style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9), 1px 1px 2px rgba(0, 0, 0, 1)' }}>
             "{current.quote}"
           </blockquote>

                                           {/* Bottoni degli aiuti con layout responsive e grafiche accattivanti - solo per Verso l'Olimpo - compatti */}
            {gameMode === 'millionaire' && (
              <div className="mt-2 sm:mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
             <button
               onClick={use5050}
               disabled={used5050 || revealed || gameOver}
               className={`relative px-1.5 sm:px-4 py-0.5 sm:py-2 rounded-lg font-bold text-xs sm:text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                 used5050 || revealed || gameOver
                   ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-300 text-gray-500'
                   : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl'
               }`}
             >
               <span className="flex items-center gap-1">
                 <span className="text-xs sm:text-lg drop-shadow-lg" style={{ filter: 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.7))' }}>🎯</span>
                 <span>50/50</span>
               </span>
             </button>
             
             <button
               onClick={useHint}
               disabled={hintRevealed || revealed || usedHint || gameOver}
               className={`relative px-1.5 sm:px-4 py-0.5 sm:py-2 rounded-lg font-bold text-xs sm:text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                 hintRevealed || revealed || usedHint || gameOver
                   ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-300 text-gray-500'
                   : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 shadow-lg hover:shadow-xl'
               }`}
             >
               <span className="flex items-center gap-1">
                 <span className="text-xs sm:text-lg drop-shadow-lg" style={{ filter: 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.7))' }}>💡</span>
                 <span>Hint</span>
               </span>
             </button>
             
             <button
               onClick={useSuperHint}
               disabled={superHintRevealed || revealed || usedSuperHint || gameOver}
               className={`relative px-1.5 sm:px-4 py-0.5 sm:py-2 rounded-lg font-bold text-xs sm:text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                 superHintRevealed || revealed || usedSuperHint || gameOver
                   ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-300 text-gray-500'
                   : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-lg hover:shadow-xl'
               }`}
             >
               <span className="flex items-center gap-1">
                 <span className="text-xs sm:text-lg drop-shadow-lg" style={{ filter: 'drop-shadow(0 0 6px rgba(34, 197, 94, 0.7))' }}>🚀</span>
                 <span>Super Hint</span>
               </span>
             </button>
             
             {/* Bottone 2nd Chance - solo per modalità Verso l'Olimpo */}
             {gameMode === 'millionaire' && (
                              <button
                 onClick={use2ndChance}
                 disabled={used2ndChance || revealed || gameOver}
                 className={`relative px-0.5 sm:px-3 py-0.5 sm:py-1.5 rounded-md font-bold text-xs transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                   used2ndChance || revealed || gameOver
                     ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-300 text-gray-500'
                     : is2ndChanceActive
                     ? 'bg-gradient-to-r from-pink-400 to-rose-500 text-white border-0 shadow-lg animate-pulse'
                     : 'bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white border-0 shadow-lg hover:shadow-xl'
                 }`}
               >
                 <span className="flex items-center gap-1">
                                     <span className="text-xs sm:text-lg drop-shadow-lg" style={{ filter: `drop-shadow(0 0 6px ${is2ndChanceActive ? 'rgba(236, 72, 153, 0.7)' : 'rgba(236, 72, 153, 0.7)'})` }}>{is2ndChanceActive ? '✨' : '💖'}</span>
                  <span>{is2ndChanceActive ? 'Attivo' : '2nd Chance'}</span>
                 </span>
               </button>
             )}
           </div>
           )}

           {/* Visualizzazione degli hint con animazioni e stili migliorati */}
           {hintRevealed && (
             <div className="mt-2 animate-fadeIn">
               <div className="px-4 py-3 rounded-xl bg-black/40 backdrop-blur-sm border-2 border-amber-400/50 shadow-2xl">
                 <div className="flex items-center gap-2 mb-2">
                   <span className="text-2xl drop-shadow-lg" style={{ filter: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.8))' }}>💡</span>
                   <span className="font-bold text-amber-300 text-sm drop-shadow-lg">Hint Attivo</span>
                 </div>
                 <p className="text-white text-sm leading-relaxed drop-shadow-lg"
                    style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}>{current.hint_short}</p>
               </div>
             </div>
           )}
           
           {superHintRevealed && (
             <div className="mt-2 animate-fadeIn">
               <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-green-900/60 to-emerald-800/60 backdrop-blur-sm border-2 border-green-400/50 shadow-2xl">
                 <div className="flex items-center gap-2 mb-2">
                   <span className="text-2xl drop-shadow-lg" style={{ filter: 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.8))' }}>🚀</span>
                   <span className="font-bold text-green-300 text-sm drop-shadow-lg">Super Hint Attivo</span>
                 </div>
                 <p className="text-white text-sm leading-relaxed drop-shadow-lg"
                    style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}>{current.hint_more}</p>
               </div>
             </div>
           )}
           


                     {/* Container delle opzioni con grid responsive migliorato - compatto */}
           <div className="mt-2 sm:mt-3 relative min-h-[350px]">
            {/* FASE 1: Cards dei personaggi OPPURE Animazione Game Over */}
            {!gameOver && !revealed && !showGameOverAnimation && (
                         <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 scale-80 sm:scale-100">
              {mappedChoices.map((c, idx) => {
                const isDisabled = disabledOptions.includes(idx);
                const isWrongSelection = isDisabled && used2ndChance; // È l'opzione sbagliata selezionata
                return (
                  <button
                    key={idx}
                    disabled={isDisabled}
                    onClick={() => onAnswer(idx)}
                    className={`group overflow-hidden rounded-xl border transition shadow-lg aspect-[3/4] flex flex-col ${
                      isWrongSelection 
                        ? 'border-red-500 bg-red-900/40 backdrop-blur-sm text-left opacity-70 cursor-not-allowed' 
                        : isDisabled 
                        ? 'border-white/20 bg-black/20 backdrop-blur-sm text-left opacity-60 cursor-not-allowed'
                        : 'border-white/20 bg-black/20 backdrop-blur-sm text-left hover:ring-1 hover:ring-amber-400 hover:shadow-2xl hover:border-white/40'
                    }`}
                  >
                    <div className="w-full overflow-hidden relative flex-grow">
                      <img
                        src={getPortrait(c.label)}
                        alt={c.label}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                      {/* Overlay per l'opzione sbagliata */}
                      {isWrongSelection && (
                        <div className="absolute inset-0 bg-red-600/50 backdrop-blur-sm flex items-center justify-center">
                          <div className="text-4xl sm:text-5xl">❌</div>
                        </div>
                      )}
                      
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
            )}

            {/* FASE 1.5: Animazione Game Over (sostituisce le cards quando si sbaglia) */}
            {!revealed && showGameOverAnimation && (
              <div className="w-full h-full bg-gradient-to-br from-red-900/95 via-red-800/90 to-red-600/95 backdrop-blur-xl rounded-3xl border-2 border-red-300/60 shadow-2xl flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
                {/* Particelle animate di sfondo rosse */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-red-300/60 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
                  <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-red-200/80 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                  <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-red-400/50 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                  <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-red-300/70 rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></div>
                </div>
                
                {/* Contenuto principale */}
                <div className="text-center relative z-10 flex flex-col items-center justify-center h-full py-8">
                  {/* Messaggio di sconfitta */}
                  <div className="text-xl sm:text-2xl text-red-100 font-semibold mb-4 drop-shadow-lg"
                       style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)' }}>
                    {isTimeoutGameOver 
                      ? (gameMode === 'millionaire' 
                          ? `Tempo scaduto alla fatica ${i + 1}`
                          : `Tempo scaduto alla domanda ${i + 1}`)
                      : (gameMode === 'millionaire' 
                          ? `Hai sbagliato alla fatica ${i + 1}`
                          : `Hai sbagliato alla domanda ${i + 1}`)
                    }
                  </div>
                  
                  {/* Emoji finale */}
                  <div className="text-5xl animate-bounce" style={{ animationDuration: '0.8s' }}>
                    {gameMode === 'millionaire' ? '💀' : '⚔️'}
                  </div>
                  

                  
                  {/* Indicatore di caricamento per la risposta corretta */}
                  <div className="mt-4 flex justify-center">
                    <div className="text-sm text-red-300">
                      Mostrando risposta corretta...
                    </div>
                  </div>
                </div>
                
                {/* Bordo luminoso animato rosso */}
                <div className="absolute inset-0 rounded-3xl border-2 border-red-300/40 animate-pulse"></div>
              </div>
            )}

            {/* FASE 2: Animazione di scalata (risposta corretta) */}
            {!gameOver && revealed && selected !== null && mappedChoices[selected]?.isCorrect && showClimbingAnimation && (
              <div className="w-full h-full bg-gradient-to-br from-purple-900/95 via-purple-800/90 to-purple-600/95 backdrop-blur-xl rounded-3xl border-2 border-purple-300/60 shadow-2xl flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
                {/* Particelle animate di sfondo */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-300/60 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
                  <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-purple-200/80 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                  <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-purple-400/50 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                  <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-purple-300/70 rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></div>
                </div>
                
                {/* Contenuto principale */}
                <div className="text-center relative z-10 flex flex-col items-center justify-center h-full py-8">
                  {/* Testo del livello con effetto glow */}
                  <div className="text-4xl sm:text-5xl font-black text-white mb-3 drop-shadow-2xl"
                       style={{ 
                         textShadow: '0 0 20px rgba(168, 85, 247, 0.8), 0 0 40px rgba(168, 85, 247, 0.4)',
                         animation: 'pulse 2s infinite'
                       }}>
                    {gameMode === 'millionaire'
                      ? (currentLevel === 12 ? '🏆 VITTORIA FINALE!' : `Fatica ${currentLevel} Superata!`)
                      : `🔥 Streak: ${streak} 🔥`
                    }
                  </div>
                  
                  {/* Messaggio motivazionale */}
                  <div className="text-xl sm:text-2xl text-purple-100 font-semibold mb-4 drop-shadow-lg"
                       style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)' }}>
                    {gameMode === 'millionaire'
                      ? (currentLevel === 12 
                          ? '🎉 Hai completato tutte le Dodici Fatiche! 🎉' 
                          : 'Continua la scalata verso l\'Olimpo!')
                      : `Continua la battaglia! Score: ${score}`
                    }
                  </div>
                  
                  {/* Emoji finale con animazione */}
                  <div className="text-5xl animate-bounce" style={{ animationDuration: '0.8s' }}>
                    {gameMode === 'millionaire' 
                      ? (currentLevel === 12 ? '🏆' : '⬆️')
                      : '⚔️'
                    }
                  </div>
                  
                  {/* Barra di progresso animata - solo per Verso l'Olimpo */}
                  {gameMode === 'millionaire' && (
                    <>
                      <div className="mt-4 w-48 h-2 bg-purple-800/50 rounded-full overflow-hidden mx-auto">
                        <div className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full animate-pulse"
                             style={{ width: `${(currentLevel / 12) * 100}%` }}></div>
                      </div>
                      
                      {/* Testo progresso */}
                      <div className="mt-2 text-sm text-purple-200 font-medium">
                        {currentLevel}/12 livelli completati
                      </div>
                    </>
                  )}
                  

                </div>
                
                {/* Bordo luminoso animato */}
                <div className="absolute inset-0 rounded-3xl border-2 border-purple-300/40 animate-pulse"></div>
              </div>
            )}







            {/* FASE 4: Overlay della risposta con spiegazioni e bottoni (dopo l'animazione) */}
            {revealed && (selected !== null || isTimeoutGameOver || (gameMode === 'millionaire' && gameOver)) && !showClimbingAnimation && !showGameOverAnimation && (
              <div className="w-full h-full bg-black/80 backdrop-blur-md rounded-2xl border-2 border-white/30 shadow-2xl flex items-center justify-center p-3 sm:p-6">
                <div className="text-center max-w-xs sm:max-w-2xl w-full py-8">
                  <div className="mb-3 sm:mb-4">
                    {isTimeoutGameOver ? (
                      <div className="text-2xl sm:text-3xl font-bold text-red-400 mb-2 drop-shadow-lg">⏰ Tempo Scaduto!</div>
                    ) : (gameMode === 'millionaire' && gameOver) ? (
                      <div className="text-2xl sm:text-3xl font-bold text-red-400 mb-2 drop-shadow-lg">⏰ Tempo Scaduto!</div>
                    ) : (selected !== null && mappedChoices[selected]?.isCorrect) ? (
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
                    <div className="mb-3 sm:mb-4 text-left space-y-2 sm:space-y-2">
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

                  {/* Fonte della citazione */}
                  <div className="mb-3 sm:mb-4 text-center">
                    <a
                      href={current.source_link}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 sm:px-4 py-2 rounded-lg border border-white/30 bg-black/30 backdrop-blur-sm hover:bg-black/50 text-xs sm:text-sm font-medium transition-colors text-white text-center w-full sm:w-auto drop-shadow-lg"
                      style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}
                    >
                      📚 Fonte: {current.source_title}
                    </a>
                  </div>

                                    {/* Statistiche finali per Battaglia di Achille quando si sbaglia o scade il tempo, e per Verso l'Olimpo quando si sbaglia o scade il tempo */}
                  {(gameMode !== 'millionaire' && (isTimeoutGameOver || (selected !== null && !mappedChoices[selected]?.isCorrect))) || 
                   (gameMode === 'millionaire' && (gameOver || (selected !== null && !mappedChoices[selected]?.isCorrect))) ? (
                      <div className="mb-3 sm:mb-4 text-center">
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className={`backdrop-blur-sm rounded-lg border-2 p-2 flex items-center justify-between ${
                            gameMode === 'millionaire' 
                              ? 'bg-gradient-to-r from-purple-900/60 to-blue-800/60 border-purple-400/50' 
                              : 'bg-gradient-to-r from-orange-900/60 to-red-800/60 border-orange-400/50'
                          }`}>
                            <div className="flex items-center gap-2">
                              <div className={`text-xs font-medium ${
                                gameMode === 'millionaire' ? 'text-purple-200' : 'text-orange-200'
                              }`}>
                                {gameMode === 'millionaire' ? 'Fatica' : 'Streak'}
                              </div>
                            </div>
                            <div className={`text-lg font-bold ${
                              gameMode === 'millionaire' ? 'text-purple-300' : 'text-orange-300'
                            }`}>
                              {gameMode === 'millionaire' ? (i + 1) : finalStreak}
                            </div>
                          </div>
                          <div className="bg-gradient-to-r from-blue-900/60 to-indigo-800/60 backdrop-blur-sm rounded-lg border-2 border-blue-400/50 p-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="text-xs text-blue-200 font-medium">Score</div>
                            </div>
                            <div className="text-lg font-bold text-blue-300">{score}</div>
                          </div>
                        </div>

                      </div>
                  ) : null}

                  {/* Bottoni di azione con layout responsive */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center items-center">
                                        {/* Bottoni diversi per modalità Verso l'Olimpo se si è sbagliato O se si è vinto, e per Battaglia di Achille se si è sbagliato O se è scaduto il tempo */}
                    {(gameMode === 'millionaire' && (gameOver || (selected !== null && (!mappedChoices[selected]?.isCorrect || (mappedChoices[selected]?.isCorrect && i === QUESTIONS_PER_GAME - 1))))) || 
                     (gameMode !== 'millionaire' && (isTimeoutGameOver || (selected !== null && !mappedChoices[selected]?.isCorrect))) ? (
                      <>
                        <button 
                          onClick={onBackToMenu} 
                          className="px-4 sm:px-6 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:from-red-600 hover:to-red-700 transition-colors shadow-lg text-sm sm:text-base w-full sm:w-auto drop-shadow-lg"
                          style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}
                        >
                          🏠 Torna al Menu
                        </button>
                        <button 
                          onClick={() => {
                            // Reset completo dello stato
                            setI(0);
                            setScore(0);
                            setStreak(0);
                            setUsed5050(false);
                            setUsedHint(false);
                            setUsedSuperHint(false);
                                                        setUsed2ndChance(false);
                            setIs2ndChanceActive(false);
                            setHintRevealed(false);
                            setSuperHintRevealed(false);
                            setDisabledOptions([]);
                            setRevealed(false);
                            setSelected(null);
                            setTimeLeft(gameMode === 'millionaire' ? 60 : 45);
                            setShowClimbingAnimation(false);
                            setCurrentLevel(0);
                            setCompletedLevels(0);
                            setShowGameOverAnimation(false);
                            setGameOver(false);
                            setIsTimeoutGameOver(false);
                            
                            // Rimescola le domande per la nuova partita
                            const filteredItems = includeSensitive 
                              ? ITEMS 
                              : ITEMS.filter(item => !item.sensitive);
                            
                            if (gameMode === 'millionaire') {
                              // Modalità Verso l'Olimpo: seleziona nuove domande per difficoltà progressiva
                              const selectedQuestions: number[] = [];
                              
                              for (let i = 0; i < QUESTIONS_PER_GAME; i++) {
                                const difficultyRange = MILLIONAIRE_DIFFICULTY_MAP[i];
                                const availableQuestions = filteredItems.filter(item => 
                                  item.difficulty >= difficultyRange.min && item.difficulty <= difficultyRange.max
                                );
                                
                                if (availableQuestions.length > 0) {
                                  const randomQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
                                  const originalIndex = ITEMS.findIndex(item => item.id === randomQuestion.id);
                                  selectedQuestions.push(originalIndex);
                                } else {
                                  // Fallback: se non ci sono domande per questa difficoltà, prendi una casuale
                                  const randomIndex = Math.floor(Math.random() * filteredItems.length);
                                  const fallbackQuestion = filteredItems[randomIndex];
                                  const originalIndex = ITEMS.findIndex(item => item.id === fallbackQuestion.id);
                                  selectedQuestions.push(originalIndex);
                                }
                              }
                              
                              setOrder(selectedQuestions);
                            } else {
                              // Modalità classica: estrai casualmente 10 nuove domande
                              const shuffledIndices = shuffle(filteredItems.map((_, k) => {
                                return ITEMS.findIndex(originalItem => originalItem.id === filteredItems[k].id);
                              }));
                              setOrder(shuffledIndices.slice(0, QUESTIONS_PER_GAME));
                            }
                          }} 
                          className="px-4 sm:px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold hover:from-purple-600 hover:to-purple-700 transition-colors shadow-lg text-sm sm:text-base w-full sm:w-auto drop-shadow-lg"
                          style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}
                        >
                          🔄 Nuova Partita
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={next} 
                        className="px-4 sm:px-6 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold hover:from-amber-600 hover:to-orange-600 transition-colors shadow-lg text-sm sm:text-base w-full sm:w-auto drop-shadow-lg"
                        style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}
                      >
                        {gameMode === 'millionaire' 
                          ? (i < QUESTIONS_PER_GAME - 1 ? "Prossima Domanda" : "Nuovo Round")
                          : (isTimeoutGameOver ? "Nuova Partita" : "Prossima Domanda")
                        }
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

                 {/* Footer con testo responsive - compatto */}
         <div className="mt-2 sm:mt-3 text-xs text-center sm:text-left">
           <div className="bg-black/20 backdrop-blur-sm rounded-lg p-2 border border-white/10">
             <p className="px-2 sm:px-0 text-white drop-shadow-lg"
                style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}>
               🎓 <strong>Contenuti a scopo educativo:</strong> Le citazioni storiche sono presentate nel loro contesto per favorire la comprensione critica della storia.
             </p>
           </div>
         </div>
        </div>
      </div>
      
      
      
      </HeroImagePreloader>
   );
 }

