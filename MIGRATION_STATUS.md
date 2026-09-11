# Stato della migrazione — 11 settembre 2026

## Goal completato: produzione pubblicata e verificata

Database definitivo già migrato: Neon chi-l-ha-detto, AWS eu-central-1 Frankfurt,
chi_l_ha_detto, ruolo chi_l_ha_detto_app. Connessione verificata usando soltanto DATABASE_URL,
senza esporne il valore. Riletti 36 record, ID 1–36: 14 classica/achille e 22 classica/eracle.
Non eseguiti import, DDL o modifiche ai record storici. Baseline completa salvata in locale,
nel file ignorato backups/frankfurt-pre-deploy.json.

Checksum canonico fornito dall'operatore: a612119a5ca4e0febe42d2c4c074437e.
La formula di serializzazione non è disponibile: il controllo indipendente usa il confronto integrale
prima/dopo di ID, nome, modalità, tema, streak, score e timestamp UTC con microsecondi.

## Implementazione

React/Vite → /api/leaderboard → Neon server-side. Solo DATABASE_URL è richiesta dal runtime,
con controllo del target Frankfurt/database/ruolo prima di qualsiasi query. Nessun Supabase, Render,
cron o keep-alive nel runtime. Vercel Function configurata in fra1, Node 22, maxDuration 30 secondi;
routing /api separato dal fallback SPA. Credenziali e backup esclusi da Git e upload Vercel.

Lo schema reale ha ID bigint e cinque gruppi di nomi duplicati, senza UNIQUE sulla tripla
mode/theme/name. Un advisory lock transazionale serializza gli invii per identità; READ COMMITTED
rinnova lo snapshot dopo l'attesa. Aggiornamento della riga più recente o inserimento se manca,
anche con risultato inferiore. Nessun DDL, DELETE o privilegio owner richiesto dalla API.
La lettura sceglie l'ultima riga per nome, preservando fisicamente tutte quelle storiche, e restituisce
solo Top 5 ordinate per streak DESC, score DESC, timestamp ASC, id ASC. ID JSON come stringhe
bigint e timestamp a sei decimali, compatibili con la cache preesistente.

## Verifiche locali completate

- npm ci --no-audit --no-fund: OK, 307 pacchetti.
- npm test: 11 test superati, SQL PostgreSQL PGlite, tutte le 8 combinazioni, aggiornamenti,
  errori, cache, microsecondi e schema Frankfurt senza UNIQUE con ruolo limitato.
- npm run typecheck: OK, frontend/backend/API/script/test.
- npm run lint: 0 errori, 11 warning di variabili inutilizzate nel codice preesistente.
- npm run validate: 159 citazioni valide, warning preesistenti per autori ripetuti.
- npm run build: OK, Vite 5.4.21.
- Bundle dist controllato contro URL, password e hostname reali (mai stampati), DATABASE_URL,
  driver Neon, Supabase e Render: nessuna corrispondenza.
- npm audit fix: applicati aggiornamenti compatibili; restano due segnalazioni nella toolchain
  Vite/esbuild di sviluppo. npm audit --omit=dev: 0 vulnerabilità nelle dipendenze production.

## Verifiche production eseguite

Deployment READY dpl_1uQEp7sGaLvNEL7JpGgEUTjHcqgN, pubblicato tramite Vercel CLI 59.16.0:
https://chi-l-ha-detto.vercel.app
Deployment immutabile: https://chi-l-ha-detto-64md35uc1-falkers-projects.vercel.app
Vercel API conferma regions ["fra1"]; tutte le risposte API di collaudo riportano fra1::fra1.
La macchina di build Vercel era iad1: la regione di build è distinta dalla Function eseguita in fra1.

- GET pubblici su tutte le 8 combinazioni: 200 JSON e Top 5 identiche alla query SQL Frankfurt.
- POST pubblici su tutte le 8 combinazioni: inserimento persistito e successivo aggiornamento
  con risultato inferiore, stesso ID e una sola riga per nuovo nome.
- Quattro POST concorrenti sullo stesso nome esistente: un'unica riga coerente.
- Cinque primi invii simultanei per un nome nuovo: tutti 200, esattamente una riga, poi rimossa;
  confronto finale delle 36 righe storiche ancora identico.
- Input invalido/parametri extra: 400; DELETE sulla API: 405.
- Otto record temporanei rimossi per ID e identità esatta; 36 righe storiche inalterate campo per campo.
- Partita completa da browser: risposta corretta, incremento streak/punti, seconda domanda,
  risposta errata, riepilogo, form Top 5 e conferma. Record QA_UI_260911_A realmente persistito
  in Frankfurt con streak 1 e score 30; rimosso dopo la prova. Nuovo confronto: 36 righe inalterate.
- Menu, Top 5 Eracle/Achille, temi Classica/Intrattenimento/Trash/Mista, tutorial e ritorno al menu:
  verificati nel browser. Provati anche timeout, nuova partita, livello 1/15 Mista e tutti i quattro
  aiuti (50/50, Hint, Super Hint e seconda possibilità), con prosecuzione e incremento punti.
  Nessun errore JavaScript osservato.
- / e /partita/test-spa: 200 HTML; /api/missing: 404, senza fallback HTML.
- Asset pubblicati: 200 e cache immutable; assenza di riferimenti runtime Supabase/Render/secret.
  Le richieste a /.env.local e /backups/frankfurt-pre-deploy.json restituiscono solo il fallback SPA.

Rapporti locali ignorati: backups/production-verification.json, backups/cold-start-baseline.json,
backups/cold-start-verification.json e backups/concurrent-first-insert-verification.json.
SHA-256 del confronto canonico indipendente delle 36 righe:
1e10fe04ffa0c2d0abe34ea3163e4e0e6eb53c3025a00c1736f2f0be14acc925.
Nessun dato reimportato; la sequence avanza normalmente per gli inserimenti di collaudo e non viene
riportata indietro. Il normale runtime non richiede DELETE: la rimozione dei soli record di collaudo
è un'operazione separata e non esiste nella API.

## Risveglio automatico verificato

Dopo 389 secondi senza query di collaudo, la prima richiesta alla API production ha restituito 200
con entrambe le Top 5 in 2631 ms (17:41:17 UTC). Header fra1::fra1.
pg_postmaster_start_time è passato da 17:26:26.767797 UTC a 17:41:16.241155 UTC:
il compute è stato effettivamente riavviato su richiesta, senza intervento manuale o keep-alive.
Conteggio dopo il risveglio: 36. Non è una simulazione di mesi trascorsi, ma verifica reale del
meccanismo di scale-to-zero e risveglio su cui si basa il recupero dopo inattività prolungata.

Nessuna operazione manuale di infrastruttura o deployment rimane per questa migrazione.

## Vincoli permanenti

Supabase resta inattivo. Il Neon americano non deve essere usato; sarà eliminato separatamente.
Nessun reimport o migrazione schema sul Frankfurt già provisionato. Snapshot e sequence sono
stati preparati dall'operatore. Le utility db:migrate/db:import restano archiviate per database nuovi.
Un eventuale rollback deve restare compatibile con Frankfurt; non riattivare il vecchio deployment
Supabase. I dati di gioco, immagini e regole non sono stati modificati.


## File e documentazione

Nuovi: api/leaderboard.ts; backend/{database,leaderboard,validation}.ts; shared/leaderboard.ts;
src/lib/leaderboard.ts; tests/leaderboard.test.ts; eslint.config.mjs; tsconfig.leaderboard.json;
.env.example; .vercelignore; migrations/001_leaderboard.sql e utility scripts/*leaderboard*.ts,
scripts/dev-api.ts, scripts/export-supabase.ts.
Aggiornati: Leaderboard.tsx (API/cache), App.tsx (rimosso soltanto ping Render), configurazione Vercel/Vite,
package/lockfile, .gitignore, validatore dati e documentazione deploy/classifica/migrazione.
Rimossi: src/lib/supabase.ts, dipendenza Supabase, workflow keep-supabase-alive, SQL keepalive,
backend Express/Render e suo vecchio test. docs/ rimane archivio escluso dal deployment.

## Limiti e ripristino

I punteggi restano generati dal browser e i nomi non sono autenticati: nessuna pretesa anti-cheat.
Il fallback locale non sincronizza automaticamente gli invii. Gli advisory lock coordinano gli
scrittori della API: eventuali scrittori SQL esterni devono adottare lo stesso protocollo.
PGlite serializza le connessioni; le prove concorrenti reali sono state eseguite separatamente su Vercel.
Il piano gratuito resta soggetto alle quote e disponibilità dei provider, senza garanzia perpetua.
Un eventuale ripristino applicativo deve mantenere DATABASE_URL Frankfurt e preservare le nuove righe;
mai riattivare Supabase né puntare alla copia Neon americana.

Le verifiche iniziali sono state eseguite sul deployment CLI delle modifiche locali (gitDirty=1).
La revisione Git di chiusura raccoglie implementazione, test, configurazione e documentazione su main.
.env viene rimosso dal tracciamento Git; .env.local, credenziali e backup restano esclusi.
I successivi deployment da main usano quindi il backend Neon Frankfurt verificato.
