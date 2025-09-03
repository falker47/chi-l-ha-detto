# 🚀 Guida Deploy Completa - Chi l'ha detto?

## 📋 Panoramica

Questa guida ti spiega come deployare sia il frontend che il backend per avere un sistema leaderboard completamente funzionante.

## 🎯 Architettura

- **Frontend**: Vercel/Netlify (React + Vite)
- **Backend**: Render (Express.js + JSON)
- **Database**: File JSON persistente su Render

## 🔧 Deploy Backend su Render

### **1. Preparazione**
✅ **File già creati**:
- `server/package.json` - Dipendenze Node.js
- `server/.gitignore` - File da ignorare
- `server/README.md` - Documentazione
- `server/index.js` - Server Express

### **2. Deploy su Render**

#### **Passo 1: Crea Account**
1. Vai su [render.com](https://render.com)
2. Clicca "Get Started for Free"
3. Registrati con GitHub

#### **Passo 2: Crea Web Service**
1. Clicca "New +" → "Web Service"
2. Connetti il tuo repository GitHub
3. Seleziona il repository "chi l'ha detto"

#### **Passo 3: Configurazione**
```
Name: chi-l-ha-detto-leaderboard
Environment: Node
Region: Oregon (US West)
Branch: main
Root Directory: server
Build Command: npm install
Start Command: npm start
```

#### **Passo 4: Variabili Ambiente**
Non servono variabili speciali, Render usa automaticamente `PORT`.

#### **Passo 5: Deploy**
1. Clicca "Create Web Service"
2. Aspetta il deploy (2-3 minuti)
3. Copia l'URL: `https://chi-l-ha-detto-leaderboard.onrender.com`

### **3. Test Backend**
```bash
# Test health check
curl https://chi-l-ha-detto-leaderboard.onrender.com/api/health

# Test leaderboard
curl https://chi-l-ha-detto-leaderboard.onrender.com/api/leaderboard
```

## 🎨 Deploy Frontend su Vercel

### **1. Preparazione**
✅ **File già configurati**:
- `package.json` - Script di build
- `vite.config.ts` - Configurazione Vite
- `vercel.json` - Configurazione Vercel

### **2. Deploy su Vercel**

#### **Passo 1: Crea Account**
1. Vai su [vercel.com](https://vercel.com)
2. Clicca "Sign Up"
3. Connetti GitHub

#### **Passo 2: Import Project**
1. Clicca "New Project"
2. Seleziona il repository "chi l'ha detto"
3. Clicca "Import"

#### **Passo 3: Configurazione**
```
Framework Preset: Vite
Root Directory: ./
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

#### **Passo 4: Deploy**
1. Clicca "Deploy"
2. Aspetta il build (1-2 minuti)
3. Copia l'URL: `https://chi-l-ha-detto.vercel.app`

## 🔗 Configurazione URL

### **Aggiorna URL Backend**
Nel file `src/components/Leaderboard.tsx`, l'URL è già configurato:

```javascript
const apiUrl = process.env.NODE_ENV === 'production' 
  ? 'https://chi-l-ha-detto-leaderboard.onrender.com/api/leaderboard'
  : 'http://localhost:3001/api/leaderboard';
```

### **Se l'URL di Render è diverso**
Sostituisci `chi-l-ha-detto-leaderboard` con il nome del tuo servizio Render.

## 🧪 Test Completo

### **1. Test Frontend**
1. Vai su `https://chi-l-ha-detto.vercel.app`
2. Clicca "Top 5" nel menu
3. Verifica che la leaderboard si carichi

### **2. Test Salvataggio**
1. Gioca una partita
2. Raggiungi un punteggio da top 5
3. Inserisci il tuo nome
4. Verifica che il record si salvi

### **3. Test Persistenza**
1. Ricarica la pagina
2. Verifica che i record siano ancora lì
3. Testa da un altro browser/dispositivo

## 🔧 Troubleshooting

### **Backend non si avvia**
- Controlla i log su Render
- Verifica che `package.json` sia corretto
- Controlla che `index.js` sia nella cartella `server`

### **Frontend non si connette**
- Verifica l'URL del backend
- Controlla la console per errori CORS
- Testa l'API direttamente

### **Record non si salvano**
- Controlla i log del backend
- Verifica che il file `leaderboard.json` sia scrivibile
- Testa l'endpoint POST manualmente

## 📊 Monitoraggio

### **Render Dashboard**
- **Logs**: Monitora errori e performance
- **Metrics**: CPU, RAM, richieste
- **Deploys**: Cronologia deploy

### **Vercel Dashboard**
- **Analytics**: Visite e performance
- **Functions**: Log delle API calls
- **Deployments**: Cronologia build

## 💰 Costi

### **Render (Backend)**
- **Free Tier**: 750 ore/mese
- **Limiti**: Si "addormenta" dopo 15 min di inattività
- **Risveglio**: 30 secondi al primo accesso

### **Vercel (Frontend)**
- **Free Tier**: Illimitato per progetti personali
- **Limiti**: 100GB bandwidth/mese
- **Performance**: Ottima per progetti statici

## 🚀 Ottimizzazioni

### **Backend**
- **Keep-alive**: Configura per evitare il "sonno"
- **Caching**: Aggiungi cache per le richieste GET
- **Compression**: Abilita gzip

### **Frontend**
- **CDN**: Vercel usa automaticamente CDN globale
- **Caching**: Headers di cache per asset statici
- **PWA**: Aggiungi service worker per offline

## 📱 Test Mobile

### **Responsive Design**
- Testa su dispositivi reali
- Verifica touch interactions
- Controlla performance su connessioni lente

### **PWA Features**
- Aggiungi manifest.json
- Implementa service worker
- Abilita installazione app

## 🔒 Sicurezza

### **Backend**
- **Rate Limiting**: Limita richieste per IP
- **Input Validation**: Già implementato
- **CORS**: Configurato per il frontend

### **Frontend**
- **HTTPS**: Forzato su Vercel
- **CSP**: Content Security Policy
- **XSS Protection**: Headers di sicurezza

## 📈 Analytics

### **Google Analytics**
```javascript
// Aggiungi in index.html
gtag('config', 'GA_MEASUREMENT_ID');
```

### **Vercel Analytics**
```bash
npm install @vercel/analytics
```

## 🎯 Prossimi Passi

1. **Deploy Backend** su Render
2. **Deploy Frontend** su Vercel
3. **Test Completo** del sistema
4. **Monitoraggio** performance
5. **Ottimizzazioni** se necessario

---

*Guida deploy per "Chi l'ha detto? - Ambiguità Edition"* 🏛️⚡
