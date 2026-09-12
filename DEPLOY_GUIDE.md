# Deploy Vercel + Neon Frankfurt

## Configurazione definitiva

- Progetto Neon: chi-l-ha-detto, AWS eu-central-1, Frankfurt.
- Database: chi_l_ha_detto; ruolo runtime: chi_l_ha_detto_app.
- Progetto Vercel: chi-l-ha-detto; Node 22, Vite, output dist.
- vercel.json configura regions: ["fra1"] e maxDuration: 30 per api/leaderboard.ts.
- Il fallback SPA esclude /api; gli asset mantengono la cache immutable.

DATABASE_URL è già configurata in .env.local e nell'ambiente Production Vercel. Usare esclusivamente
questa variabile, senza stamparla. Non servono VITE_DATABASE_URL, credenziali Supabase o altri secret
nel frontend. La Function legge la variabile a runtime; Vite non espone variabili senza prefisso VITE_.
Non aggiungere define/process.env o envPrefix permissivi nella configurazione Vite.
.env*, backups/ e .migration-backup/ sono esclusi dall'upload Vercel e da Git (salvo il template).

Schema e dati sono già provisionati. Non eseguire db:migrate o db:import sul database definitivo.
Il runtime richiede SELECT, INSERT, UPDATE, accesso alla sequence e advisory lock; nessun DDL,
DELETE o privilegio owner per il normale funzionamento.

## Verifiche e pubblicazione

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run validate
npm run build
npx vercel@latest link --yes --project chi-l-ha-detto --scope falkers-projects
npx vercel@latest deploy --prod --yes
```

Verificare la risposta JSON di /api/leaderboard per tutti i temi e modalità, il percorso SPA e gli
asset. Provare inserimento e aggiornamento attraverso la API production con un nome di collaudo
univoco, verificare la persistenza e rimuovere esclusivamente le righe di collaudo attraverso un
accesso amministrativo autorizzato. Non modificare i record storici per provare le scritture.
Dopo una variazione delle variabili Vercel è necessario un nuovo deployment.

## Inattività e costi

Neon risveglia il compute su richiesta tramite HTTPS; nessun cron, ping o keep-alive.
La prima lettura ha un retry in caso di errore transitorio; le scritture non vengono ripetute.
Il budget DB è di 12 secondi per operazione, quello Function/client di 30 secondi.
Il piano Free/Hobby è adatto al carico minimo previsto entro le rispettive quote; non sono richiesti
upgrade. Quote, disponibilità dei provider e abusi restano limiti esterni.

Riferimenti: [Neon scale-to-zero](https://neon.com/docs/introduction/scale-to-zero),
[Neon Free](https://neon.com/pricing), [Vercel Hobby](https://vercel.com/docs/plans/hobby),
[regioni Functions](https://vercel.com/docs/functions/configuring-functions/region).

## Vecchio servizio Render: disattivare l'auto-deploy

La configurazione storica Render usava Root Directory `server`, Build Command `npm install`
e Start Command `npm start`. Il commit `d1757ad` ha rimosso intenzionalmente
`server/package.json` e `server/index.js`: quel servizio non è più un target di deployment.
La notifica Render del 11 settembre 2026 riporta un build fallito con stato 254 sullo stesso
commit. La configurazione storica non è più compatibile con il repository; il comando esatto
che ha fallito deve essere confermato nei log Render autenticati.

Nel servizio Render `chi-l-ha-detto`, verificare i log e le impostazioni, quindi disattivare
l'auto-deploy da Git. Questa impostazione appartiene al servizio Render e non viene modificata
da un commit in questo repository. Conservare il servizio e gli eventuali dati storici finché
non viene autorizzata separatamente la loro rimozione.

Non ripristinare il backend Express/JSON né cambiare la root Render per tentare di distribuire
la nuova applicazione: la produzione supportata è Vercel con `/api/leaderboard` e Neon Frankfurt.
Non modificare `DATABASE_URL`, schema o dati per risolvere questa notifica.

## Ripristino

Conservare database e backup. Un eventuale rollback deve usare una versione compatibile con Neon
Frankfurt e DATABASE_URL attuale. Non promuovere il precedente deployment Supabase, non riattivare
Supabase e non usare il progetto Neon americano. La sua eliminazione è una procedura separata.
Lo stato delle verifiche reali è in MIGRATION_STATUS.md.
