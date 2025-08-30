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
      "Otto von Bismarck": "/chi-l-ha-detto/images/personaggi/bismarck.jpg",
      "Winston Churchill": "/chi-l-ha-detto/images/personaggi/winston-churchill.jpg",
      "Adolf Hitler": "/chi-l-ha-detto/images/personaggi/adolf-hitler.jpg",
      "Joseph Goebbels": "/chi-l-ha-detto/images/personaggi/joseph-goebbels.jpg",
      "Heinrich Himmler": "/chi-l-ha-detto/images/personaggi/heinrich-himmler.jpg",
      "Joseph Stalin": "/chi-l-ha-detto/images/personaggi/joseph-stalin.jpg",
      "Iósif Stalin": "/chi-l-ha-detto/images/personaggi/joseph-stalin.jpg",
      "Benito Mussolini": "/chi-l-ha-detto/images/personaggi/benito-mussolini.jpg",
      "Mao Zedong": "/chi-l-ha-detto/images/personaggi/mao-zedong.jpg",
      "Napoleone Bonaparte": "/chi-l-ha-detto/images/personaggi/napoleone-bonaparte.jpg",
      "Niccolò Machiavelli": "/chi-l-ha-detto/images/personaggi/niccolo-machiavelli.jpg",
      "Sun Tzu": "/chi-l-ha-detto/images/personaggi/sun-tzu.jpg",
      "Carl Jung": "/chi-l-ha-detto/images/personaggi/carl-jung.jpg",
      "Friedrich Nietzsche": "/chi-l-ha-detto/images/personaggi/friedrich-nietzsche.jpg",
      "Oscar Wilde": "/chi-l-ha-detto/images/personaggi/oscar-wilde.jpg",
      "Thomas Hobbes": "/chi-l-ha-detto/images/personaggi/thomas-hobbes.jpg",
      "H. P. Lovecraft": "/chi-l-ha-detto/images/personaggi/hp-lovecraft.jpg",
      "H.P. Lovecraft": "/chi-l-ha-detto/images/personaggi/hp-lovecraft.jpg",
      "John F. Kennedy": "/chi-l-ha-detto/images/personaggi/john-kennedy.jpg",
      "Franklin D. Roosevelt": "/chi-l-ha-detto/images/personaggi/franklin-roosevelt.jpg",
      "F. D. Roosevelt": "/chi-l-ha-detto/images/personaggi/franklin-roosevelt.jpg",
      "Martin Luther King Jr.": "/chi-l-ha-detto/images/personaggi/martin-luther-king.jpg",
      "Miyamoto Musashi": "/chi-l-ha-detto/images/personaggi/miyamoto-musashi.jpg",
      "Kanye West": "/chi-l-ha-detto/images/personaggi/kanye-west.jpg",
      "Elon Musk": "/chi-l-ha-detto/images/personaggi/elon-musk.jpg",
      "Camillo Benso, Cavour": "/chi-l-ha-detto/images/personaggi/camillo-cavour.jpg",
      "Camillo Benso di Cavour": "/chi-l-ha-detto/images/personaggi/camillo-cavour.jpg",
      "Gabriele D'Annunzio": "/chi-l-ha-detto/images/personaggi/gabriele-dannunzio.png",
      "Julius Evola": "/chi-l-ha-detto/images/personaggi/julius-evola.jpg",
      "Augustus Caesar": "/chi-l-ha-detto/images/personaggi/ottaviano-augusto.jpg",
      "Cesare Augusto": "/chi-l-ha-detto/images/personaggi/augustus-caesar.jpg",
      "Lorenz Diefenbach": "/chi-l-ha-detto/images/personaggi/karl-diefenbach.jpg",
      "Karl Diefenbach": "/chi-l-ha-detto/images/personaggi/karl-diefenbach.jpg",
      "Lord Acton": "/chi-l-ha-detto/images/personaggi/john-acton.jpg",
      "John Acton": "/chi-l-ha-detto/images/personaggi/john-acton.jpg",
      "Karl Popper": "/chi-l-ha-detto/images/personaggi/karl-popper.jpg",
      "Theodore Parker": "/chi-l-ha-detto/images/personaggi/theodore-parker.jpg",
      "Ronald Reagan": "/chi-l-ha-detto/images/personaggi/ronald-reagan.jpg",
      "Ayn Rand": "/chi-l-ha-detto/images/personaggi/ayn-rand.jpg",
      "Tony Blair": "/chi-l-ha-detto/images/personaggi/tony-blair.jpeg",
      "Abraham Lincoln": "/chi-l-ha-detto/images/personaggi/abraham-lincoln.jpg",
      "Richard Nixon": "/chi-l-ha-detto/images/personaggi/richard-nixon.jpg",
      "George Washington": "/chi-l-ha-detto/images/personaggi/george-washington.jpg",
      "Andrew Johnson": "/chi-l-ha-detto/images/personaggi/andrew-johnson.jpg",
      "Aristotele": "/chi-l-ha-detto/images/personaggi/aristotele.webp",
      "Aristotle": "/chi-l-ha-detto/images/personaggi/aristotele.webp",
      "Cesare Borgia": "/chi-l-ha-detto/images/personaggi/cesare-borgia.jpg",
      "Malcolm X": "/chi-l-ha-detto/images/personaggi/malcolm-x.jpg",
      "Rosa Parks": "/chi-l-ha-detto/images/personaggi/rosa-parks.jpg",
      "Angela Davis": "/chi-l-ha-detto/images/personaggi/angela-davis.jpg",
      "Woodrow Wilson": "/chi-l-ha-detto/images/personaggi/woodrow-wilson.jpg",
      "Clement Attlee": "/chi-l-ha-detto/images/personaggi/clement-attlee.jpg",
      "Margaret Thatcher": "/chi-l-ha-detto/images/personaggi/margaret-thatcher.png",
      "Napoleon Bonaparte": "/chi-l-ha-detto/images/personaggi/napoleone-bonaparte.jpg",
      // Nuovi personaggi mappati
      "Albert Einstein": "/chi-l-ha-detto/images/personaggi/albert-einstein.jpg",
      "Niels Bohr": "/chi-l-ha-detto/images/personaggi/niels-bohr.jpg",
      "Erwin Schrödinger": "/chi-l-ha-detto/images/personaggi/erwin-schrodinger.jpg",
      "Max Born": "/chi-l-ha-detto/images/personaggi/max-born.jpg",
      "Adam Smith": "/chi-l-ha-detto/images/personaggi/adam-smith.jpg",
      "David Ricardo": "/chi-l-ha-detto/images/personaggi/david-ricardo.jpg",
      "John Locke": "/chi-l-ha-detto/images/personaggi/john-locke.png",
      "Thomas Malthus": "/chi-l-ha-detto/images/personaggi/thomas-malthus.jpeg",
      "Seneca": "/chi-l-ha-detto/images/personaggi/seneca.jpg",
      "Marco Aurelio": "/chi-l-ha-detto/images/personaggi/marco-aurelio.jpg",
      "Cicerone": "/chi-l-ha-detto/images/personaggi/cicerone.jpg",
      "Plinio il Giovane": "/chi-l-ha-detto/images/personaggi/plinio-il-giovane.jpg",
      "Alan Turing": "/chi-l-ha-detto/images/personaggi/alan-turing.jpg",
      "John von Neumann": "/chi-l-ha-detto/images/personaggi/john-von-neumann.jpeg",
      "Claude Shannon": "/chi-l-ha-detto/images/personaggi/claude-shannon.jpg",
      "Norbert Wiener": "/chi-l-ha-detto/images/personaggi/norbert-wiener.jpg",
      "George Santayana": "/chi-l-ha-detto/images/personaggi/george-santayana.webp",
      "Hannah Arendt": "/chi-l-ha-detto/images/personaggi/hannah-arendt.jpg",
      "George Orwell": "/chi-l-ha-detto/images/personaggi/george-orwell.jpg",
      "Simone de Beauvoir": "/chi-l-ha-detto/images/personaggi/simone-de-beauvoir.jpg",
      "Frantz Fanon": "/chi-l-ha-detto/images/personaggi/frantz-fanon.jpg",
      "Max Weber": "/chi-l-ha-detto/images/personaggi/max-weber.jpg",
      "Mahatma Gandhi": "/chi-l-ha-detto/images/personaggi/mahatma-gandhi.jpg",
      "Tito Maccio Plauto": "/chi-l-ha-detto/images/personaggi/tito-maccio-plauto.jpg",
      "Ottaviano Augusto": "/chi-l-ha-detto/images/personaggi/ottaviano-augusto.jpg",
      "Alessandro Magno": "/chi-l-ha-detto/images/personaggi/alessandro-magno.jpg",
      "Marshall McLuhan": "/chi-l-ha-detto/images/personaggi/marshall-mcluhan.jpg",
      "Neil Postman": "/chi-l-ha-detto/images/personaggi/neil-postman.jpg",
      "Walter Benjamin": "/chi-l-ha-detto/images/personaggi/walter-benjamin.jpg",
      "John Culkin": "/chi-l-ha-detto/images/personaggi/john-culkin.jpg",
      "René Descartes": "/chi-l-ha-detto/images/personaggi/rene-descartes.jpg",
      "Blaise Pascal": "/chi-l-ha-detto/images/personaggi/blaise-pascal.jpg",
      "Baruch Spinoza": "/chi-l-ha-detto/images/personaggi/baruch-spinoza.jpg",
      "Immanuel Kant": "/chi-l-ha-detto/images/personaggi/immanuel-kant.jpg",
      "Patrick Henry": "/chi-l-ha-detto/images/personaggi/patrick-henry.jpeg",
      "Thomas Jefferson": "/chi-l-ha-detto/images/personaggi/thomas-jefferson.jpg",
      "Benjamin Franklin": "/chi-l-ha-detto/images/personaggi/benjamin-franklin.jpg",
      "Will Durant": "/chi-l-ha-detto/images/personaggi/will-durant.jpg",
      "Plutarco": "/chi-l-ha-detto/images/personaggi/plutarco.jpg",
      "Epitteto": "/chi-l-ha-detto/images/personaggi/epitteto.jpg",
      "Viktor Frankl": "/chi-l-ha-detto/images/personaggi/viktor-frankl.jpg",
      "Arthur Schopenhauer": "/chi-l-ha-detto/images/personaggi/arthur-schopenhauer.jpg",
      "Søren Kierkegaard": "/chi-l-ha-detto/images/personaggi/soren-kierkegaard.jpg",
      "Alfred Korzybski": "/chi-l-ha-detto/images/personaggi/alfred-korzybski.jpg",
      "Gregory Bateson": "/chi-l-ha-detto/images/personaggi/gregory-bateson.jpeg",
      "Isaac Newton": "/chi-l-ha-detto/images/personaggi/isaac-newton.jpg",
      "Galileo Galilei": "/chi-l-ha-detto/images/personaggi/galileo-galilei.jpg",
      "Robert Hooke": "/chi-l-ha-detto/images/personaggi/robert-hooke.jpg",
      "Johannes Kepler": "/chi-l-ha-detto/images/personaggi/johannes-kepler.jpeg",
      "Ludwig Wittgenstein": "/chi-l-ha-detto/images/personaggi/ludwig-wittgenstein.jpg",
      "Martin Heidegger": "/chi-l-ha-detto/images/personaggi/martin-heidegger.jpg",
      "Noam Chomsky": "/chi-l-ha-detto/images/personaggi/noam-chomsky.jpg",
      "Michel Foucault": "/chi-l-ha-detto/images/personaggi/michel-foucault.jpg",
      "Desmond Tutu": "/chi-l-ha-detto/images/personaggi/desmond-tutu.jpg",
      "Vladimir Lenin": "/chi-l-ha-detto/images/personaggi/vladimir-lenin.jpg",
      "Sun Yat-sen": "/chi-l-ha-detto/images/personaggi/sun-yat-sen.jpg",
      "Ludwig Feuerbach": "/chi-l-ha-detto/images/personaggi/ludwig-feuerbach.jpg",
      "Friedrich Engels": "/chi-l-ha-detto/images/personaggi/friedrich-engels.jpg",
      "Richard Feynman": "/chi-l-ha-detto/images/personaggi/richard-feynman.jpeg",
      "Thomas Kuhn": "/chi-l-ha-detto/images/personaggi/thomas-kuhn.jpg",
      "Paul Feyerabend": "/chi-l-ha-detto/images/personaggi/paul-feyerabend.jpg",
      "Pierre-Joseph Proudhon": "/chi-l-ha-detto/images/personaggi/pierre-joseph-proudhon.jpg",
      "John Stuart Mill": "/chi-l-ha-detto/images/personaggi/john-stuart-mill.jpg",
      "Carl von Clausewitz": "/chi-l-ha-detto/images/personaggi/carl-von-clausewitz.jpg",
      "Denis Diderot": "/chi-l-ha-detto/images/personaggi/denis-diderot.jpg",
      "Voltaire": "/chi-l-ha-detto/images/personaggi/voltaire.jpg",
      "Jean-Jacques Rousseau": "/chi-l-ha-detto/images/personaggi/jean-jacques-rousseau.jpg",
      "William Shakespeare": "/chi-l-ha-detto/images/personaggi/william-shakespeare.jpg",
      "Christopher Marlowe": "/chi-l-ha-detto/images/personaggi/christopher-marlowe.jpg",
      "Jane Austen": "/chi-l-ha-detto/images/personaggi/jane-austen.jpg",
      "George Berkeley": "/chi-l-ha-detto/images/personaggi/george-berkeley.jpg",
      "David Hume": "/chi-l-ha-detto/images/personaggi/david-hume.jpg",
      "Albert Camus": "/chi-l-ha-detto/images/personaggi/albert-camus.jpg",
      "Jean-Paul Sartre": "/chi-l-ha-detto/images/personaggi/jean-paul-sartre.jpg",
      "Frederick Douglass": "/chi-l-ha-detto/images/personaggi/frederick-douglass.jpg",
      "Bertrand Russell": "/chi-l-ha-detto/images/personaggi/bertrand-russell.jpg",
      "Francis Bacon": "/chi-l-ha-detto/images/personaggi/francis-bacon.jpg",
      "Montesquieu": "/chi-l-ha-detto/images/personaggi/montesquieu.jpg",
      "Emily Dickinson": "/chi-l-ha-detto/images/personaggi/emily-dickinson.jpg",
      "Mary Wollstonecraft": "/chi-l-ha-detto/images/personaggi/mary-wollstonecraft.jpg",
      "Aldous Huxley": "/chi-l-ha-detto/images/personaggi/aldous-huxley.png",
      "Lev Trotsky": "/chi-l-ha-detto/images/personaggi/lev-trotsky.jpg",
      "Virginia Woolf": "/chi-l-ha-detto/images/personaggi/virginia-woolf.jpg",
      "Karl Marx": "/chi-l-ha-detto/images/personaggi/karl-marx.png",
      "Socrate": "/chi-l-ha-detto/images/personaggi/socrate.jpg",
      "Epicuro": "/chi-l-ha-detto/images/personaggi/epicuro.jpg",
      "Gaio Giulio Cesare": "/chi-l-ha-detto/images/personaggi/gaio-giulio-cesare.jpg",
      "Tacito": "/chi-l-ha-detto/images/personaggi/tacito.jpeg",
      "Agostino d'Ippona": "/chi-l-ha-detto/images/personaggi/agostino-dippona.jpg",
      "Nelson Mandela": "/chi-l-ha-detto/images/personaggi/nelson-mandela.jpg",
      "Rabindranath Tagore": "/chi-l-ha-detto/images/personaggi/rabindranath-tagore.jpg",
      "Barack Obama": "/chi-l-ha-detto/images/personaggi/barack-obama.webp"
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
                     <h1 className="text-3xl font-extrabold tracking-tight text-amber-50 text-shadow-2xl">Chi l'ha detto? — 10 Domande</h1>
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
          <div className="text-sm text-amber-700 font-medium">Domanda {i + 1} / {QUESTIONS_PER_GAME}</div>
          <div className="flex items-center gap-2">
            <div className="w-40 h-2 bg-amber-200 rounded-full overflow-hidden border border-amber-300">
              <div className="h-full bg-gradient-to-r from-amber-600 to-orange-600" style={{ width: `${(timeLeft / 20) * 100}%` }} />
            </div>
            <span className="text-sm tabular-nums text-amber-700 font-medium">{timeLeft}s</span>
          </div>
        </div>

        <div className="mt-4 p-4 sm:p-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg border border-amber-200">
          {/* Rimosse le chip informative per non dare indizi */}

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
                       {i < QUESTIONS_PER_GAME - 1 ? "Prossima Domanda" : "Nuovo Round"}
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

