# 🗄️ Database Migration Guide - Sistema Temi

## 📋 Panoramica

Questo documento descrive le modifiche necessarie al database Supabase per supportare il nuovo sistema di temi implementato nel gioco "Chi l'ha detto?".

## 🎯 Obiettivo

Aggiungere supporto per 4 temi diversi:
- **Classica** (esistente)
- **Intrattenimento** (cinema/videogiochi)
- **Trash** (meme/trash)
- **Mista** (tutti i temi combinati)

## 📊 Schema Attuale

```sql
CREATE TABLE leaderboard (
  id SERIAL PRIMARY KEY,
  mode VARCHAR(50) NOT NULL,        -- 'achille' o 'eracle'
  name VARCHAR(100) NOT NULL,
  streak INTEGER NOT NULL,
  score INTEGER NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

## 🔄 Modifiche Richieste

### 1. Aggiungere Colonna `theme`

```sql
-- Aggiungi la colonna theme con default 'classica'
ALTER TABLE leaderboard 
ADD COLUMN theme VARCHAR(50) NOT NULL DEFAULT 'classica';
```

### 2. Aggiornare Record Esistenti

```sql
-- Assicurati che tutti i record esistenti abbiano theme = 'classica'
UPDATE leaderboard 
SET theme = 'classica' 
WHERE theme IS NULL OR theme = '';
```

### 3. Aggiungere Vincoli di Validazione

```sql
-- Aggiungi vincolo per assicurarsi che solo temi validi vengano inseriti
ALTER TABLE leaderboard 
ADD CONSTRAINT check_theme 
CHECK (theme IN ('classica', 'intrattenimento', 'trash', 'mista'));
```

### 4. Creare Indice per Performance

```sql
-- Crea indice per migliorare le query per tema+modalità
CREATE INDEX idx_leaderboard_theme_mode ON leaderboard(theme, mode);
```

## 📝 Script Completo di Migrazione

```sql
-- =====================================================
-- MIGRATION: Add theme support to leaderboard
-- Created: [DATA ODIERNA]
-- Description: Aggiunge supporto per 4 temi diversi
-- =====================================================

-- Step 1: Aggiungi la colonna theme
ALTER TABLE leaderboard 
ADD COLUMN theme VARCHAR(50) NOT NULL DEFAULT 'classica';

-- Step 2: Aggiorna record esistenti (se necessario)
UPDATE leaderboard 
SET theme = 'classica' 
WHERE theme IS NULL OR theme = '';

-- Step 3: Aggiungi vincolo per temi validi
ALTER TABLE leaderboard 
ADD CONSTRAINT check_theme 
CHECK (theme IN ('classica', 'intrattenimento', 'trash', 'mista'));

-- Step 4: Crea indice per performance
CREATE INDEX idx_leaderboard_theme_mode ON leaderboard(theme, mode);

-- Step 5: Verifica la struttura finale
\d leaderboard;
```

## 🎮 Temi e Modalità Supportate

| Tema | Modalità 1 | Modalità 2 |
|------|------------|------------|
| **Classica** | Eracle | Achille |
| **Intrattenimento** | Verso la Fama | Superstar |
| **Trash** | Verso la Fama | Memelord |
| **Mista** | Gran Sapiarca | Il Supremo |

## 📊 Struttura Finale della Tabella

```sql
CREATE TABLE leaderboard (
  id SERIAL PRIMARY KEY,
  mode VARCHAR(50) NOT NULL,        -- 'achille' o 'eracle'
  theme VARCHAR(50) NOT NULL,       -- 'classica', 'intrattenimento', 'trash', 'mista'
  name VARCHAR(100) NOT NULL,
  streak INTEGER NOT NULL,
  score INTEGER NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  CONSTRAINT check_theme CHECK (theme IN ('classica', 'intrattenimento', 'trash', 'mista'))
);
```

## 🧪 Test di Verifica

### Test 1: Inserimento Record
```sql
-- Test inserimento per ogni tema
INSERT INTO leaderboard (mode, theme, name, streak, score) VALUES 
('eracle', 'classica', 'Test Classica', 5, 1000),
('achille', 'intrattenimento', 'Test Intrattenimento', 3, 800),
('eracle', 'trash', 'Test Trash', 7, 1200),
('achille', 'mista', 'Test Mista', 4, 900);
```

### Test 2: Query per Tema
```sql
-- Verifica che i record vengano filtrati correttamente per tema
SELECT * FROM leaderboard WHERE theme = 'intrattenimento';
SELECT * FROM leaderboard WHERE theme = 'trash' AND mode = 'eracle';
```

### Test 3: Performance
```sql
-- Verifica che l'indice funzioni
EXPLAIN ANALYZE 
SELECT * FROM leaderboard 
WHERE theme = 'classica' AND mode = 'eracle' 
ORDER BY streak DESC, score DESC 
LIMIT 5;
```

## ⚠️ Note Importanti

### Prima dell'Esecuzione
- [ ] **Backup del database** completo
- [ ] **Test in ambiente di sviluppo** prima della produzione
- [ ] **Verifica compatibilità** con il codice esistente

### Durante l'Esecuzione
- [ ] **Monitora i log** per eventuali errori
- [ ] **Verifica che non ci siano lock** sulla tabella
- [ ] **Controlla che tutti i record** vengano aggiornati correttamente

### Dopo l'Esecuzione
- [ ] **Testa l'inserimento** di nuovi record
- [ ] **Verifica le query** dell'applicazione
- [ ] **Controlla le performance** delle query

## 🚀 Come Eseguire

### Opzione A: SQL Editor Supabase
1. Vai su [supabase.com](https://supabase.com)
2. Accedi al tuo progetto
3. Vai su **SQL Editor**
4. Esegui lo script completo di migrazione

### Opzione B: Migrazione Supabase
1. Vai su **Database** → **Migrations**
2. Crea una nuova migrazione
3. Incolla lo script completo
4. Esegui la migrazione

## 🔍 Rollback (se necessario)

```sql
-- ATTENZIONE: Questo rimuoverà la colonna theme e tutti i dati associati
-- Usa solo se assolutamente necessario

-- Rimuovi vincolo
ALTER TABLE leaderboard DROP CONSTRAINT check_theme;

-- Rimuovi indice
DROP INDEX idx_leaderboard_theme_mode;

-- Rimuovi colonna
ALTER TABLE leaderboard DROP COLUMN theme;
```

## 📞 Supporto

Se riscontri problemi durante la migrazione:
1. Controlla i log di Supabase
2. Verifica che tutti i record esistenti abbiano `theme = 'classica'`
3. Testa le query con `EXPLAIN ANALYZE`
4. Contatta il supporto Supabase se necessario

---

**Data Creazione:** [DATA ODIERNA]  
**Versione:** 1.0  
**Stato:** Pronto per l'esecuzione ✅
