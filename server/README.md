# Backend storico rimosso

Il vecchio server Express/leaderboard.json per Render non era più usato dal frontend produttivo.
Il codice e le dipendenze sono rimossi; eventuali file leaderboard.json locali non sono stati cancellati.
Il comando npm run server ora esegue scripts/dev-api.ts, adattatore locale della vera Vercel Function.
Vedere [deploy](../DEPLOY_GUIDE.md) e [migrazione](../DATABASE_MIGRATION_README.md).
