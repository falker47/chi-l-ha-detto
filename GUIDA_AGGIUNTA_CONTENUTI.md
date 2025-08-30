# Guida per Aggiungere Nuove Domande e Immagini

## 📝 Come Aggiungere Nuove Domande

### 1. Modifica il File JSON
Apri `src/data/quotes.json` e aggiungi nuovi elementi seguendo questo schema:

```json
{
  "id": "q11",
  "quote": "La tua citazione qui",
  "author": "Nome Autore",
  "choices": ["Scelta 1", "Scelta 2", "Scelta 3", "Scelta 4"],
  "correctIndex": 0,
  "year_or_period": "Anno o periodo",
  "source_title": "Titolo della fonte",
  "source_link": "https://link-alla-fonte.com",
  "tags": ["tag1", "tag2", "tag3"],
  "difficulty": 3,
  "spiciness": 1,
  "hint_short": "Hint breve",
  "hint_more": "Hint più dettagliato",
  "ambiguity_note": "Perché trae in inganno",
  "language_orig": "IT",
  "sensitive": false,
  "context": "Contesto storico e spiegazione"
}
```

### 2. Regole Importanti
- **`correctIndex`**: Deve corrispondere alla posizione dell'autore corretto in `choices`
- **`choices`**: Esattamente 4 scelte, nessuna duplicata
- **`difficulty`**: Da 1 (facile) a 5 (difficile)
- **`spiciness`**: 0 (classico), 1 (misto), 2 (controverso)
- **`sensitive`**: `true` solo per contenuti storici sensibili

### 3. Validazione
Dopo aver aggiunto domande, esegui:
```bash
npm run validate
```

## 🖼️ Come Aggiungere Immagini

### 1. Immagine Hero (Menu Principale)

#### Opzione A: Immagine Locale
1. Metti la tua immagine in `public/images/hero-bg.jpg`
2. Sostituisci il placeholder in `src/App.tsx`:

```jsx
// Sostituisci questo div:
<div className="w-full h-full bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 flex items-center justify-center">
  {/* contenuto placeholder */}
</div>

// Con questa immagine:
<img 
  src="/images/hero-bg.jpg" 
  alt="Personaggi e avvenimenti storici" 
  className="w-full h-full object-cover"
/>
```

#### Opzione B: URL Esterno
```jsx
<img 
  src="https://tuo-sito.com/immagine-hero.jpg" 
  alt="Personaggi e avvenimenti storici" 
  className="w-full h-full object-cover"
/>
```

### 2. Immagini dei Personaggi

#### Opzione A: Immagini Locali
1. Crea cartella `public/images/personaggi/`
2. Aggiungi le tue immagini: `bismarck.jpg`, `churchill.jpg`, etc.
3. Modifica `src/components/ChiLHaDetto.tsx`:

```typescript
function getPortrait(name: string) {
  // Mappa nomi a file immagine
  const imageMap: Record<string, string> = {
    "Otto von Bismarck": "/images/personaggi/bismarck.jpg",
    "Winston Churchill": "/images/personaggi/churchill.jpg",
    "Adolf Hitler": "/images/personaggi/hitler.jpg",
    // Aggiungi altri personaggi...
  };
  
  // Se esiste immagine personalizzata, usala
  if (imageMap[name]) {
    return imageMap[name];
  }
  
  // Altrimenti usa placeholder generato
  const encoded = encodeURIComponent(name);
  return `https://ui-avatars.com/api/?name=${encoded}&background=ececec&color=111111&size=256`;
}
```

#### Opzione B: URL Esterni
```typescript
function getPortrait(name: string) {
  const imageMap: Record<string, string> = {
    "Otto von Bismarck": "https://esempio.com/bismarck.jpg",
    "Winston Churchill": "https://esempio.com/churchill.jpg",
    // ... altri personaggi
  };
  
  return imageMap[name] || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=ececec&color=111111&size=256`;
}
```

## 🎯 Esempio Completo

### Nuova Domanda con Immagini
```json
{
  "id": "q11",
  "quote": "La democrazia è la peggiore forma di governo, eccetto tutte le altre.",
  "author": "Winston Churchill",
  "choices": ["Winston Churchill", "Abraham Lincoln", "John F. Kennedy", "Franklin D. Roosevelt"],
  "correctIndex": 0,
  "year_or_period": "1947",
  "source_title": "Discorso alla Camera dei Comuni",
  "source_link": "https://en.wikipedia.org/wiki/Winston_Churchill",
  "tags": ["democrazia", "politica", "storia"],
  "difficulty": 2,
  "spiciness": 0,
  "hint_short": "Primo ministro britannico",
  "hint_more": "Leader durante la Seconda Guerra Mondiale",
  "ambiguity_note": "Spesso attribuita a Lincoln per il tema democratico",
  "language_orig": "EN",
  "context": "Churchill difende la democrazia come sistema imperfetto ma migliore delle alternative autoritarie.",
  "sensitive": false
}
```

### Immagine Corrispondente
```typescript
const imageMap: Record<string, string> = {
  "Winston Churchill": "/images/personaggi/churchill.jpg",
  // ... altri personaggi
};
```

## 🔧 Struttura Cartelle Consigliata

```
public/
├── images/
│   ├── hero-bg.jpg          # Immagine menu principale
│   └── personaggi/
│       ├── bismarck.jpg
│       ├── churchill.jpg
│       ├── hitler.jpg
│       └── ...
```

## ✅ Checklist di Validazione

- [ ] ID unico per ogni domanda
- [ ] 4 scelte diverse
- [ ] `correctIndex` corrisponde all'autore corretto
- [ ] Fonte verificabile
- [ ] Immagini caricate e linkate correttamente
- [ ] `npm run validate` passa senza errori
- [ ] App si avvia correttamente

## 🚀 Prossimi Passi

1. **Aggiungi domande** modificando `quotes.json`
2. **Carica immagini** in `public/images/`
3. **Aggiorna il codice** per usare le tue immagini
4. **Valida** con `npm run validate`
5. **Testa** con `npm run dev`

## 💡 Suggerimenti

- **Immagini Hero**: Usa formati JPG/PNG, dimensioni 1920x1080px o superiori
- **Personaggi**: Mantieni proporzioni portrait (3:4 o simili)
- **Fonte**: Assicurati che i link siano affidabili e verificabili
- **Contesto**: Fornisci sempre spiegazioni educative per contenuti sensibili
