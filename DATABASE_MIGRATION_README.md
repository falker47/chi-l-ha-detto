# Migrazione completata: Neon Frankfurt

## Stato definitivo

La migrazione dei dati è stata completata prima di questo aggiornamento applicativo. La sola
sorgente runtime è DATABASE_URL, verso chi_l_ha_detto sul progetto Neon chi-l-ha-detto in Frankfurt.
Non reimportare i dati, non eseguire DDL e non chiedere privilegi owner al ruolo applicativo.
Supabase resta inattivo; il Neon americano è solo una copia temporanea di sicurezza e non va usato.

Baseline comunicata e verificata in lettura: 36 righe, ID 1–36, classica/achille 14,
classica/eracle 22. Checksum canonico comunicato dall'operatore:
a612119a5ca4e0febe42d2c4c074437e. La relativa formula di serializzazione non è presente nel repository.
Per il controllo prima/dopo viene inoltre confrontato ogni campo delle 36 righe con il file locale
ignorato backups/frankfurt-pre-deploy.json, inclusi ID e timestamp UTC a sei decimali.
Identity già riallineata e snapshot di sicurezza già creato dall'operatore.

## Schema effettivo e compatibilità

La tabella esistente usa id bigint identity, name/mode text, theme varchar, streak/score integer,
timestamp timestamptz. Esistono PK, check del tema e indice tema/modalità. Non esiste UNIQUE su
mode/theme/name e sono presenti cinque gruppi duplicati; nessuna riga viene eliminata o deduplicata
fisicamente. L'API sceglie l'ultimo timestamp per identità (spareggio streak, score, id DESC), quindi
ordina la Top 5 per streak DESC, score DESC, timestamp ASC, id ASC.

Il salvataggio prende un advisory lock transazionale sull'identità e aggiorna la riga selezionata,
oppure inserisce se manca. READ COMMITTED garantisce uno snapshot nuovo dopo l'attesa del lock.
I test includono lo schema senza UNIQUE e un ruolo con soli SELECT/INSERT/UPDATE + sequence.
Nessuna migrazione schema viene eseguita all'avvio, durante la build o nelle richieste API.

## Utility archiviate

migrations/001_leaderboard.sql e gli script db:migrate/db:import sono utility per un NUOVO database
vuoto, con schema a unicità esplicita; non sono adatti né necessari per convertire lo schema storico
Frankfurt. Il factory attuale è vincolato al target e ruolo Frankfurt: per riutilizzare queste utility
su una futura destinazione occorre prima adattare esplicitamente quella procedura amministrativa. Non eseguirli sulla produzione attuale. L'importatore effettua dry-run per default,
valida l'intero file e conserva il backup prima di applicare un'importazione esplicitamente richiesta.
Lo script di export Supabase è un'utility locale storica e non è parte del runtime o del deployment.
Non usarlo per riaprire la migrazione già conclusa.

## Backup e rollback

backups/ e .migration-backup/ sono esclusi da Git e dall'upload Vercel. Non pubblicare connessioni,
export o copie delle vecchie variabili. Non eliminare nessuno dei database durante il collaudo.
In caso di problemi applicativi distribuire una correzione o una versione compatibile con Frankfurt.
Il vecchio deployment Supabase non è un rollback consentito. Nessun restore o reimport automatico.

Esiti delle prove production e conservazione dei dati: MIGRATION_STATUS.md.
