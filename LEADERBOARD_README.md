# Classifica globale

React/Vite su Vercel → /api/leaderboard (Vercel Function Node 22) → Neon Free Postgres.
Il browser non accede al database. La sola variabile runtime necessaria è DATABASE_URL, sul server.

## Comportamento

Quattro temi (classica, intrattenimento, trash, mista), due modalità (achille, eracle).
Ogni combinazione mostra cinque record ordinati per streak DESC, score DESC, timestamp ASC.
A parità completa si usa id ASC per stabilità. Il tema mista/eracle arriva a 15 livelli; gli altri eracle a 12.

Il nome, con maiuscole/minuscole distinte, identifica un record per modalità e tema. I nuovi nomi vengono
trimmed e limitati a 20 caratteri. Come nel precedente codice Supabase, un nuovo invio SOSTITUISCE il
risultato precedente anche se peggiore. Una transazione READ COMMITTED acquisisce prima un advisory
lock sulla tripla modalità/tema/nome, poi aggiorna la riga esistente o ne inserisce una nuova.
Il runtime usa solo SELECT/INSERT/UPDATE e la sequence, senza DDL né privilegi owner.
Invii concorrenti dalla stessa API sono serializzati: prevale l'ultimo aggiornamento eseguito.
Scrittori SQL esterni devono rispettare lo stesso lock.

Lo schema Frankfurt conserva 36 righe storiche, incluse cinque identità duplicate, e non ha un
vincolo UNIQUE sulla tripla. Per ciascuna identità la lettura e l'aggiornamento selezionano il timestamp
più recente, poi streak/score/id decrescenti per gli spareggi. Le altre righe restano intatte nel DB;
la Top 5 mostra un solo risultato per nome. Gli ID bigint vengono restituiti come stringhe decimali,
senza perdita di precisione; la cache accetta anche i vecchi ID numerici.

## API

GET /api/leaderboard?theme=classica restituisce { data: LeaderboardData }, al massimo dieci righe,
cinque per modalità. Le chiavi degli altri temi sono vuote per compatibilità dell'interfaccia.
È possibile aggiungere &mode=achille per limitare la risposta a cinque righe.
Tema obbligatorio; valori non validi, parametri sconosciuti e ripetuti danno 400.

POST /api/leaderboard con Content-Type: application/json:

```json
{"mode":"achille","theme":"classica","name":"Ada","streak":3,"score":200}
```

Restituisce { data: LeaderboardEntry[] }, la Top 5 della combinazione dopo il salvataggio,
nella stessa transazione. Campi extra (inclusi id e timestamp) sono rifiutati.
400 = input non valido; 405 = metodo non consentito; 415 = tipo di contenuto errato;
503 = database/API indisponibile. Gli errori non restituiscono connessioni, SQL o credenziali.
Le risposte non vengono memorizzate dalla CDN. Le letture fallite vengono ritentate una volta;
le scritture non vengono ritentate automaticamente. Budget: 12 secondi per operazione DB,
30 secondi per Function/client, sufficiente per il normale risveglio Neon.

## Cache e limiti

localStorage conserva chiLHaDetto_leaderboard_backup, inclusi i formati precedenti.
Un errore remoto mostra un avviso neutrale e i dati locali. Un salvataggio remoto fallito può
essere conservato solo sul dispositivo (o solo in memoria se lo storage è bloccato).
I record locali NON vengono sincronizzati automaticamente e possono essere sostituiti al prossimo
caricamento remoto riuscito, come prima. Gli errori di validazione 400/415 non vengono presentati come salvataggi riusciti; errori di disponibilità come 429 usano il fallback.

Il server controlla interi non negativi, lunghezza nomi, modalità, temi e massimi ricavabili dalle
formule del gioco. Achille: al massimo 80 punti per domanda e moltiplicatore streak esistente.
Eracle: somma dei massimi con timer 60 secondi, bonus massimo ×3 solo alla vittoria.
Lo schema conserva valori storici validi anche se creati da versioni precedenti delle formule.
Nomi senza login e punteggi generati dal client NON costituiscono protezione anti-cheat:
un client ostile può fabbricare punteggi plausibili o sostituire il risultato di un omonimo.
Non è implementato un limite distribuito per IP; in caso di abusi usare le regole Firewall Vercel
compatibili col piano, senza cron o servizi a pagamento aggiuntivi.

## Sviluppo e test

```sh
npm ci
npm run dev:full
npm test
npm run typecheck
npm run lint
npm run validate
npm run build
```

Inserire DATABASE_URL in .env.local (ignorato da Git). Vite inoltra /api alla porta locale 3001;
l'adattatore scripts/dev-api.ts esegue lo stesso handler della Function. npm run dev e
npm run preview da soli servono il frontend: senza API compare il fallback locale.
I test eseguono SQL reale in PostgreSQL WASM (PGlite): schema ripetuto, tutte le otto Top 5,
upsert, transazioni, importazione, validazione e errori. PGlite serializza le richieste;
non sostituisce una verifica della concorrenza multi-connessione o del risveglio sul Neon reale.

Setup e passaggio dei dati: [deploy](DEPLOY_GUIDE.md), [migrazione](DATABASE_MIGRATION_README.md).
