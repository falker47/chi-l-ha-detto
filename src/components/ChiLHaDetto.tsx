import React, { useEffect, useMemo, useState } from "react";
import type { Item } from "../types";
import itemsRaw from "../data/quotes.json";
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
    if (i < QUESTIONS_PER_GAME - 1) {
      setI((v) => v + 1);
    } else {
      // Fine partita: estrai nuove 10 domande casuali
      const shuffledIndices = shuffle(ITEMS.map((_, k) => k));
      setOrder(shuffledIndices.slice(0, QUESTIONS_PER_GAME));
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
      "Miyamoto Musashi": "images/personaggi/miyamoto-musashi.png",
      "Kanye West": "images/personaggi/kanye-west.jpg",
      "Elon Musk": "images/personaggi/elon-musk.jpg",
      "Camillo Benso, Cavour": "images/personaggi/camillo-cavour.jpg",
      "Camillo Benso di Cavour": "images/personaggi/camillo-cavour.jpg",
      "Gabriele D'Annunzio": "images/personaggi/gabriele-dannunzio.png",
      "Julius Evola": "images/personaggi/julius-evola.jpg",
      "Lorenzo de' Medici": "images/personaggi/lorenzo-de-medici.jpg",
      "Augustus Caesar": "images/personaggi/ottaviano-augusto.jpg",
      "Cesare Augusto": "images/personaggi/ottaviano-augusto.jpg",
      "Lorenz Diefenbach": "images/personaggi/karl-diefenbach.jpg",
      "Karl Diefenbach": "images/personaggi/karl-diefenbach.jpg",
      "Lord Acton": "images/personaggi/john-acton.jpg",
      "John Acton": "images/personaggi/john-acton.jpg",
      "Karl Popper": "images/personaggi/karl-popper.jpg",
      "Theodore Parker": "images/personaggi/theodore-parker.jpg",
      "Ronald Reagan": "images/personaggi/ronald-reagan.jpg",
      "Ayn Rand": "images/personaggi/ayn-rand.jpg",
      "Tony Blair": "images/personaggi/tony-blair.jpeg",
      "Abraham Lincoln": "images/personaggi/abraham-lincoln.jpg",
      "Richard Nixon": "images/personaggi/richard-nixon.jpg",
      "George Washington": "images/personaggi/george-washington.jpg",
      "Andrew Johnson": "images/personaggi/andrew-johnson.jpg",
      "Aristotele": "images/personaggi/aristotele.webp",
      "Aristotle": "images/personaggi/aristotele.webp",
      "Cesare Borgia": "images/personaggi/cesare-borgia.jpg",
      "Malcolm X": "images/personaggi/malcolm-x.jpg",
      "Rosa Parks": "images/personaggi/rosa-parks.jpg",
      "Angela Davis": "images/personaggi/angela-davis.jpg",
      "Woodrow Wilson": "images/personaggi/woodrow-wilson.jpg",
      "Clement Attlee": "images/personaggi/clement-attlee.jpg",
      "Margaret Thatcher": "images/personaggi/margaret-thatcher.png",
      "Napoleon Bonaparte": "images/personaggi/napoleone-bonaparte.jpg",
      "Albert Einstein": "images/personaggi/albert-einstein.jpg",
      "Niels Bohr": "images/personaggi/niels-bohr.jpg",
      "Erwin Schrödinger": "images/personaggi/erwin-schrodinger.jpg",
      "Max Born": "images/personaggi/max-born.jpg",
      "Adam Smith": "images/personaggi/adam-smith.jpg",
      "David Ricardo": "images/personaggi/david-ricardo.jpg",
      "John Locke": "images/personaggi/john-locke.png",
      "Thomas Malthus": "images/personaggi/thomas-malthus.jpeg",
      "Seneca": "images/personaggi/seneca.jpg",
      "Marco Aurelio": "images/personaggi/marco-aurelio.jpg",
      "Cicerone": "images/personaggi/cicerone.jpg",
      "Plinio il Giovane": "images/personaggi/plinio-il-giovane.jpg",
      "Alan Turing": "images/personaggi/alan-turing.jpg",
      "John von Neumann": "images/personaggi/john-von-neumann.jpeg",
      "Claude Shannon": "images/personaggi/claude-shannon.jpg",
      "Norbert Wiener": "images/personaggi/norbert-wiener.jpg",
      "George Santayana": "images/personaggi/george-santayana.webp",
      "Hannah Arendt": "images/personaggi/hannah-arendt.jpg",
      "George Orwell": "images/personaggi/george-orwell.jpg",
      "Simone de Beauvoir": "images/personaggi/simone-de-beauvoir.jpg",
      "Frantz Fanon": "images/personaggi/frantz-fanon.jpg",
      "Max Weber": "images/personaggi/max-weber.jpg",
      "Mahatma Gandhi": "images/personaggi/mahatma-gandhi.jpg",
      "Tito Maccio Plauto": "images/personaggi/tito-maccio-plauto.jpg",
      "Ottaviano Augusto": "images/personaggi/ottaviano-augusto.jpg",
      "Alessandro Magno": "images/personaggi/alessandro-magno.jpg",
      "Marshall McLuhan": "images/personaggi/marshall-mcluhan.jpg",
      "Neil Postman": "images/personaggi/neil-postman.jpg",
      "Walter Benjamin": "images/personaggi/walter-benjamin.jpg",
      "John Culkin": "images/personaggi/john-culkin.jpg",
      "René Descartes": "images/personaggi/rene-descartes.jpg",
      "Blaise Pascal": "images/personaggi/blaise-pascal.jpeg",
      "Baruch Spinoza": "images/personaggi/baruch-spinoza.jpg",
      "Immanuel Kant": "images/personaggi/immanuel-kant.jpg",
      "Patrick Henry": "images/personaggi/patrick-henry.jpeg",
      "Thomas Jefferson": "images/personaggi/thomas-jefferson.jpg",
      "Benjamin Franklin": "images/personaggi/benjamin-franklin.jpg",
      "Will Durant": "images/personaggi/will-durant.jpg",
      "Plutarco": "images/personaggi/plutarco.jpg",
      "Epitteto": "images/personaggi/epitteto.jpeg",
      "Viktor Frankl": "images/personaggi/viktor-frankl.jpg",
      "Arthur Schopenhauer": "images/personaggi/arthur-schopenhauer.jpg",
      "Søren Kierkegaard": "images/personaggi/soren-kierkegaard.jpg",
      "Alfred Korzybski": "images/personaggi/alfred-korzybski.jpg",
      "Gregory Bateson": "images/personaggi/gregory-bateson.jpeg",
      "Isaac Newton": "images/personaggi/isaac-newton.jpg",
      "Galileo Galilei": "images/personaggi/galileo-galilei.jpg",
      "Robert Hooke": "images/personaggi/robert-hooke.jpg",
      "Johannes Kepler": "images/personaggi/johannes-kepler.jpeg",
      "Ludwig Wittgenstein": "images/personaggi/ludwig-wittgenstein.jpg",
      "Martin Heidegger": "images/personaggi/martin-heidegger.jpg",
      "Noam Chomsky": "images/personaggi/noam-chomsky.jpeg",
      "Platone": "images/personaggi/platone.jpeg",
      "Michel Foucault": "images/personaggi/michel-foucault.jpg",
      "Desmond Tutu": "images/personaggi/desmond-tutu.jpg",
      "Vladimir Lenin": "images/personaggi/vladimir-lenin.jpg",
      "Sun Yat-sen": "images/personaggi/sun-yat-sen.jpg",
      "Ludwig Feuerbach": "images/personaggi/ludwig-feuerbach.jpg",
      "Friedrich Engels": "images/personaggi/friedrich-engels.jpg",
      "Richard Feynman": "images/personaggi/richard-feynman.png",
      "Thomas Kuhn": "images/personaggi/thomas-kuhn.jpg",
      "Paul Feyerabend": "images/personaggi/paul-feyerabend.jpg",
      "Pierre-Joseph Proudhon": "images/personaggi/pierre-joseph-proudhon.jpg",
      "John Stuart Mill": "images/personaggi/john-stuart-mill.jpg",
      "Carl von Clausewitz": "images/personaggi/carl-von-clausewitz.jpg",
      "Denis Diderot": "images/personaggi/denis-diderot.jpg",
      "Voltaire": "images/personaggi/voltaire.jpg",
      "Jean-Jacques Rousseau": "images/personaggi/jean-jacques-rousseau.jpg",
      "William Shakespeare": "images/personaggi/william-shakespeare.jpg",
      "Christopher Marlowe": "images/personaggi/christopher-marlowe.jpg",
      "Jane Austen": "images/personaggi/jane-austen.jpg",
      "George Berkeley": "images/personaggi/george-berkeley.jpg",
      "David Hume": "images/personaggi/david-hume.jpg",
      "Albert Camus": "images/personaggi/albert-camus.jpg",
      "Jean-Paul Sartre": "images/personaggi/jean-paul-sartre.jpg",
      "Frederick Douglass": "images/personaggi/frederick-douglass.jpg",
      "Bertrand Russell": "images/personaggi/bertrand-russell.jpg",
      "Francis Bacon": "images/personaggi/francis-bacon.jpg",
      "Montesquieu": "images/personaggi/montesquieu.jpg",
      "Emily Dickinson": "images/personaggi/emily-dickinson.jpg",
      "Mary Wollstonecraft": "images/personaggi/mary-wollstonecraft.jpg",
      "Aldous Huxley": "images/personaggi/aldous-huxley.png",
      "Lev Trotsky": "images/personaggi/lev-trotsky.jpg",
      "Virginia Woolf": "images/personaggi/virginia-woolf.jpg",
      "Karl Marx": "images/personaggi/karl-marx.png",
      "Socrate": "images/personaggi/socrate.jpg",
      "Epicuro": "images/personaggi/epicuro.jpeg",
      "Gaio Giulio Cesare": "images/personaggi/gaio-giulio-cesare.jpg",
      "Tacito": "images/personaggi/tacito.jpeg",
      "Agostino d'Ippona": "images/personaggi/agostino-dippona.jpg",
      "Nelson Mandela": "images/personaggi/nelson-mandela.jpg",
      "Rabindranath Tagore": "images/personaggi/rabindranath-tagore.jpg",
      "Barack Obama": "images/personaggi/barack-obama.webp"
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
              <div className="h-full bg-gradient-to-r from-amber-600 to-orange-600" style={{ width: `${(timeLeft / 20) * 100}%` }} />
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

          {/* Bottoni degli aiuti con layout responsive */}
          <div className="mt-3 sm:mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 text-xs sm:text-sm">
            <button
              onClick={use5050}
              disabled={used5050 || revealed || available5050 <= 0}
              className="px-2 sm:px-3 py-1 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 disabled:opacity-50 relative text-amber-800 font-medium text-xs sm:text-sm"
            >
              50/50
              {available5050 > 0 && (
                <span className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 w-4 h-4 sm:w-5 sm:h-5 bg-amber-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                  {available5050}
                </span>
              )}
            </button>
            <button
              onClick={useHint}
              disabled={hintRevealed || revealed || availableHints <= 0}
              className="px-2 sm:px-3 py-1 rounded-lg border border-orange-300 bg-orange-50 hover:bg-orange-100 disabled:opacity-50 relative text-orange-800 font-medium text-xs sm:text-sm"
            >
              Mostra hint
              {availableHints > 0 && (
                <span className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 w-4 h-4 sm:w-5 sm:h-5 bg-orange-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                  {availableHints}
                </span>
              )}
            </button>
            {hintRevealed && (
              <span className="px-2 py-1 rounded bg-amber-100 border border-amber-300 text-amber-800 text-xs sm:text-sm">
                Hint: {current.hint_short}
              </span>
            )}
          </div>

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

