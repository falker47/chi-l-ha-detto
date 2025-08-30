# Chi l'ha detto? — Ambiguità Edition

Quiz a 4 opzioni con timer, punteggio, hint 50/50 e modalità Historical/Context che mostra una breve contestualizzazione didattica dopo ogni risposta. Include avviso per contenuti sensibili quando applicabile e dataset JSON validato con Zod.

## Avvio
```bash
npm i
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Validazione dataset
```bash
npm run validate
```
Lo script verifica lo schema Zod e ulteriori invarianti: ID unici, nessuna scelta duplicata, autore uguale alla scelta corretta, coerenza `sensitive`/`spiciness`.

## Linee guida contenuti
- Le citazioni sensibili o controverse sono ammesse solo se corredate di contestualizzazione educativa e fonte.
- Nessuna incitazione all’odio, violenza o discriminazione.
- La modalità Historical/Context mette in evidenza il contesto e “perché trae in inganno”.

## Aggiungere item
1. Modifica `src/data/quotes.json` aggiungendo elementi che rispettino il tipo `Item` in `src/types.ts`.
2. Esegui la validazione:
```bash
npm run validate
```
3. Avvia l’app in sviluppo per testare:
```bash
npm run dev
```

## Struttura principale
- `src/components/ChiLHaDetto.tsx`: logica del gioco (timer 20s, punteggio 100 + 2*s + 10*streak, hint 50/50, pannello educativo, banner sensibili)
- `scripts/validate.ts`: validazione Zod del dataset

