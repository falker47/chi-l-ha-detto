import React, { useEffect, useMemo, useState } from "react";
import type { Item } from "../types";
import itemsRaw from "../data/quotes.json";

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
  const [timeLeft, setTimeLeft] = useState(20);
  const [revealed, setRevealed] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [used5050, setUsed5050] = useState(false);
  const [disabledOptions, setDisabledOptions] = useState<number[]>([]);
  const [available5050, setAvailable5050] = useState(1);
  const [availableHints, setAvailableHints] = useState(1);
  const [hintRevealed, setHintRevealed] = useState(false);

  useEffect(() => {
    setOrder(shuffle(ITEMS.map((_, k) => k)));
  }, []);

  const current: Item | null = useMemo(
    () => (order.length ? ITEMS[order[i]] : null),
    [order, i]
  );

  const [choiceOrder, setChoiceOrder] = useState<number[]>([]);
  useEffect(() => {
    if (!current) return;
    setChoiceOrder(shuffle([0, 1, 2, 3]));
    setTimeLeft(20);
    setRevealed(false);
    setSelected(null);
    setUsed5050(false);
    setDisabledOptions([]);
    setHintRevealed(false);
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
      if (newStreak % 4 === 0) setAvailable5050((n) => n + 1);
      if (newStreak % 7 === 0) setAvailableHints((n) => n + 1);
    } else {
      setStreak(0);
    }
    setRevealed(true);
  }

  function next() {
    if (i < ITEMS.length - 1) setI((v) => v + 1);
    else {
      setOrder(shuffle(ITEMS.map((_, k) => k)));
      setI(0);
      setScore(0);
      setStreak(0);
    }
  }

  function use5050() {
    if (used5050 || revealed || available5050 <= 0) return;
    setUsed5050(true);
    setAvailable5050((n) => Math.max(0, n - 1));
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
    if (revealed || hintRevealed || availableHints <= 0) return;
    setHintRevealed(true);
    setAvailableHints((n) => Math.max(0, n - 1));
  }

  function getPortrait(name: string) {
    // Mappa nomi a file immagine locali
    const imageMap: Record<string, string> = {
      "Otto von Bismarck": "images/personaggi/bismarck.jpg",
      "Winston Churchill": "images/personaggi/winston-churchill.jpg",
      "Adolf Hitler": "images/personaggi/adolf-hitler.jpg",
      "Joseph Goebbels": "images/personaggi/joseph-goebbels.jpg",
      "Heinrich Himmler": "images/personaggi/heinrich-himmler.jpg",
      "Joseph Stalin": "images/personaggi/joseph-stalin.jpg",
      "Iósif Stalin": "images/personaggi/joseph-stalin.jpg",
      "Benito Mussolini": "images/personaggi/benito-mussolini.jpg",
      "Mao Zedong": "images/personaggi/mao-zedong.jpg",
      "Napoleone Bonaparte": "images/personaggi/napoleone-bonaparte.jpg",
      "Niccolò Machiavelli": "images/personaggi/niccolo-machiavelli.jpg",
      "Sun Tzu": "images/personaggi/sun-tzu.jpg",
      "Carl Jung": "images/personaggi/carl-jung.jpg",
      "Friedrich Nietzsche": "images/personaggi/friedrich-nietzsche.jpg",
      "Oscar Wilde": "images/personaggi/oscar-wilde.jpg",
      "Thomas Hobbes": "images/personaggi/thomas-hobbes.jpg",
      "H. P. Lovecraft": "images/personaggi/hp-lovecraft.jpg",
      "H.P. Lovecraft": "images/personaggi/hp-lovecraft.jpg",
      "John F. Kennedy": "images/personaggi/john-kennedy.jpg",
      "Franklin D. Roosevelt": "images/personaggi/franklin-roosevelt.jpg",
      "F. D. Roosevelt": "images/personaggi/franklin-roosevelt.jpg",
      "Martin Luther King Jr.": "images/personaggi/martin-luther-king.jpg",
      "Miyamoto Musashi": "images/personaggi/miyamoto-musashi.jpg",
      "Kanye West": "images/personaggi/kanye-west.jpg",
      "Elon Musk": "images/personaggi/elon-musk.jpg",
      "Camillo Benso, Cavour": "images/personaggi/camillo-cavour.jpg",
      "Camillo Benso di Cavour": "images/personaggi/camillo-cavour.jpg",
      "Gabriele D'Annunzio": "images/personaggi/gabriele-dannunzio.png",
      "Julius Evola": "images/personaggi/julius-evola.jpg",
      "Augustus Caesar": "images/personaggi/augustus-caesar.jpg",
      "Cesare Augusto": "images/personaggi/augustus-caesar.jpg",
      "Lorenz Diefenbach": "images/personaggi/karl-diefenbach.jpg",
      "Karl Diefenbach": "images/personaggi/karl-diefenbach.jpg",
      "Lord Acton": "images/personaggi/john-acton.jpg",
      "John Acton": "images/personaggi/john-acton.jpg"
    };
    
    // Se esiste immagine personalizzata, usala
    if (imageMap[name]) {
      return imageMap[name];
    }
    
    // Altrimenti usa placeholder generato come fallback
    const encoded = encodeURIComponent(name);
    return `https://ui-avatars.com/api/?name=${encoded}&background=ececec&color=111111&size=256`;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 text-amber-900">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6 bg-gradient-to-r from-amber-800 via-orange-800 to-amber-900 p-4 rounded-xl shadow-lg border border-amber-700">
          <h1 className="text-3xl font-extrabold tracking-tight text-amber-50 text-shadow-2xl">Chi l'ha detto?</h1>
          <div className="flex items-center gap-3 text-sm">
            <span className="pill bg-amber-200 text-amber-800 border border-amber-300">Punteggio: {score}</span>
            <span className="pill bg-orange-200 text-orange-800 border border-orange-300">Streak: {streak}</span>
            <span className="pill bg-yellow-200 text-yellow-800 border border-yellow-300">Tempo: {timeLeft}s</span>
          </div>
        </div>

        {historicalMode && isSensitive && (
          <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-300 text-sm text-amber-800">
            <strong>Avviso contenuti storici sensibili.</strong> Questo elemento è mostrato per
            scopi storici e didattici. Alcune citazioni/slogan sono legati a regimi autoritari e a crimini.
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-amber-700 font-medium">Domanda {i + 1} / {ITEMS.length}</div>
          <div className="flex items-center gap-2">
            <div className="w-40 h-2 bg-amber-200 rounded-full overflow-hidden border border-amber-300">
              <div className="h-full bg-gradient-to-r from-amber-600 to-orange-600" style={{ width: `${(timeLeft / 20) * 100}%` }} />
            </div>
            <span className="text-sm tabular-nums text-amber-700 font-medium">{timeLeft}s</span>
          </div>
        </div>

        <div className="mt-4 p-4 sm:p-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg border border-amber-200">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-2 py-1 rounded bg-amber-200 text-amber-800 text-xs font-medium border border-amber-300">{current.year_or_period}</span>
            {current.tags.map((t) => (
              <span key={t} className="px-2 py-1 rounded bg-orange-200 text-orange-800 text-xs font-medium border border-orange-300">{t}</span>
            ))}
            {spiciness && <span className="px-2 py-1 rounded bg-red-200 text-red-800 text-xs font-medium border border-red-300">{spiciness}</span>}
            <span className="px-2 py-1 rounded bg-yellow-200 text-yellow-800 text-xs font-medium border border-yellow-300">Diff: {current.difficulty}</span>
          </div>

          <blockquote className="text-lg sm:text-xl leading-relaxed font-serif text-amber-900 italic">
            “{current.quote}”
          </blockquote>

          <div className="mt-4 flex items-center gap-3 text-sm">
            <button
              onClick={use5050}
              disabled={used5050 || revealed || available5050 <= 0}
              className="px-3 py-1 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 disabled:opacity-50 relative text-amber-800 font-medium"
            >
              50/50
              {available5050 > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-amber-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                  {available5050}
                </span>
              )}
            </button>
            <button
              onClick={useHint}
              disabled={hintRevealed || revealed || availableHints <= 0}
              className="px-3 py-1 rounded-lg border border-orange-300 bg-orange-50 hover:bg-orange-100 disabled:opacity-50 relative text-orange-800 font-medium"
            >
              Mostra hint
              {availableHints > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-orange-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                  {availableHints}
                </span>
              )}
            </button>
            {hintRevealed && (
              <span className="px-2 py-1 rounded bg-amber-100 border border-amber-300 text-amber-800">Hint: {current.hint_short}</span>
            )}
          </div>

          <div className="mt-5 relative">
            {/* Container delle opzioni con posizione relativa */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
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
                      {/* Overlay per il nome con sfondo semi-trasparente */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2">
                        <div className="font-bold text-sm sm:text-base text-white drop-shadow-lg">{c.label}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Overlay della risposta che copre le opzioni */}
            {(selected !== null || revealed) && (
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50/95 via-orange-50/95 to-amber-100/95 backdrop-blur-sm rounded-2xl border-2 border-amber-300 shadow-2xl z-10 flex items-center justify-center p-6">
                <div className="text-center max-w-2xl">
                                      <div className="mb-6">
                    {selected !== null && mappedChoices[selected]?.isCorrect ? (
                      <div className="text-3xl font-bold text-green-700 mb-2">✅ Corretto!</div>
                    ) : (
                      <div className="text-3xl font-bold text-red-700 mb-2">❌ Errato.</div>
                    )}
                    <div className="text-lg text-amber-800">
                      Autore: <span className="font-bold text-amber-900">{current.author}</span>
                    </div>
                  </div>

                  {historicalMode && (
                    <div className="mb-6 text-left">
                      <div className="mb-3 p-3 bg-amber-100 rounded-lg border-l-4 border-amber-500 border border-amber-300">
                        <p className="text-sm leading-relaxed">
                          <span className="font-semibold text-amber-900">Contesto:</span> <span className="text-amber-800">{current.context}</span>
                        </p>
                      </div>
                      <div className="p-3 bg-orange-100 rounded-lg border-l-4 border-orange-500 border border-orange-300">
                        <p className="text-sm leading-relaxed">
                          <span className="font-semibold text-orange-900">Perché trae in inganno:</span> <span className="text-orange-800">{current.ambiguity_note}</span>
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                    <a
                      href={current.source_link}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-lg border border-amber-400 bg-amber-50 hover:bg-amber-100 text-sm font-medium transition-colors text-amber-800"
                    >
                      📚 Fonte: {current.source_title}
                    </a>
                    <button 
                      onClick={next} 
                      className="px-6 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold hover:from-amber-700 hover:to-orange-700 transition-colors shadow-lg"
                    >
                      {i < ITEMS.length - 1 ? "Prossima Domanda" : "Nuovo Round"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 text-xs text-amber-600">
          <p>
            Modalità Historical/Context attiva: le citazioni controverse sono presentate con finalità
            educative e contestualizzate. Evitiamo slogan d'odio non contestualizzati e incitazioni.
          </p>
        </div>
      </div>
    </div>
  );
}

