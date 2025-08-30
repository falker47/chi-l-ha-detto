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
    const encoded = encodeURIComponent(name);
    // External avatar service to generate portrait placeholder per person
    return `https://ui-avatars.com/api/?name=${encoded}&background=ececec&color=111111&size=256`;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 text-gray-900">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6 bg-gradient-to-r from-gray-800 to-gray-900 p-4 rounded-xl shadow-md">
          <h1 className="text-3xl font-extrabold tracking-tight text-white text-shadow-2xl">Chi l'ha detto?</h1>
          <div className="flex items-center gap-3 text-sm">
            <span className="pill bg-blue-200 text-blue-800">Punteggio: {score}</span>
            <span className="pill bg-green-200 text-green-800">Streak: {streak}</span>
            <span className="pill bg-yellow-200 text-yellow-800">Tempo: {timeLeft}s</span>
          </div>
        </div>

        {historicalMode && isSensitive && (
          <div className="mt-4 p-3 rounded-xl bg-yellow-50 border border-yellow-200 text-sm">
            <strong>Avviso contenuti storici sensibili.</strong> Questo elemento è mostrato per
            scopi storici e didattici. Alcune citazioni/slogan sono legati a regimi autoritari e a crimini.
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm">Domanda {i + 1} / {ITEMS.length}</div>
          <div className="flex items-center gap-2">
            <div className="w-40 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gray-800" style={{ width: `${(timeLeft / 20) * 100}%` }} />
            </div>
            <span className="text-sm tabular-nums">{timeLeft}s</span>
          </div>
        </div>

        <div className="mt-4 p-4 sm:p-5 bg-white rounded-2xl shadow-lg">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-2 py-1 rounded bg-gray-100 text-xs">{current.year_or_period}</span>
            {current.tags.map((t) => (
              <span key={t} className="px-2 py-1 rounded bg-gray-100 text-xs">{t}</span>
            ))}
            {spiciness && <span className="px-2 py-1 rounded bg-gray-100 text-xs">{spiciness}</span>}
            <span className="px-2 py-1 rounded bg-gray-100 text-xs">Diff: {current.difficulty}</span>
          </div>

          <blockquote className="text-lg sm:text-xl leading-relaxed font-serif">
            “{current.quote}”
          </blockquote>

          <div className="mt-4 flex items-center gap-3 text-sm">
            <button
              onClick={use5050}
              disabled={used5050 || revealed || available5050 <= 0}
              className="px-3 py-1 rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-50 relative"
            >
              50/50
              {available5050 > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                  {available5050}
                </span>
              )}
            </button>
            <button
              onClick={useHint}
              disabled={hintRevealed || revealed || availableHints <= 0}
              className="px-3 py-1 rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-50 relative"
            >
              Mostra hint
              {availableHints > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                  {availableHints}
                </span>
              )}
            </button>
            {hintRevealed && (
              <span className="px-2 py-1 rounded bg-gray-100">Hint: {current.hint_short}</span>
            )}
          </div>

          <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {mappedChoices.map((c, idx) => {
              const isDisabled = disabledOptions.includes(idx) || revealed;
              const isCorrect = idx === correctness;
              const isSelectedWrong = selected === idx && !c.isCorrect;
              const ring = isCorrect ? "ring-2 ring-green-500" : isSelectedWrong ? "ring-2 ring-red-500" : "hover:ring-1 hover:ring-gray-300";
              return (
                <button
                  key={idx}
                  disabled={isDisabled}
                  onClick={() => onAnswer(idx)}
                  className={`group overflow-hidden rounded-xl border bg-white text-left disabled:opacity-60 transition ${ring} shadow-sm hover:shadow aspect-[3/4] flex flex-col`}
                >
                  <div className="w-full bg-gray-100 overflow-hidden relative flex-grow">
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

          {(selected !== null || revealed) && (
            <div className="mt-5 p-4 rounded-xl bg-gray-50 border">
              <div className="flex items-center justify-between">
                <div>
                  {selected !== null && mappedChoices[selected]?.isCorrect ? (
                    <div className="font-semibold">✅ Corretto!</div>
                  ) : (
                    <div className="font-semibold">❌ Errato.</div>
                  )}
                  <div className="text-sm text-gray-700 mt-1">
                    Autore: <span className="font-medium">{current.author}</span>
                  </div>
                </div>
                <a
                  href={current.source_link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm underline"
                >
                  Fonte: {current.source_title}
                </a>
              </div>

              {historicalMode && (
                <div className="mt-3 text-sm leading-relaxed">
                  <p className="mb-2"><span className="font-semibold">Contesto:</span> {current.context}</p>
                  <p className="text-gray-600"><span className="font-semibold">Perché trae in inganno:</span> {current.ambiguity_note}</p>
                </div>
              )}

              <div className="mt-4 flex justify-end">
                <button onClick={next} className="px-4 py-2 rounded-xl border hover:bg-gray-100">
                  {i < ITEMS.length - 1 ? "Prossima" : "Nuovo round"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 text-xs text-gray-500">
          <p>
            Modalità Historical/Context attiva: le citazioni controverse sono presentate con finalità
            educative e contestualizzate. Evitiamo slogan d'odio non contestualizzati e incitazioni.
          </p>
        </div>
      </div>
    </div>
  );
}

