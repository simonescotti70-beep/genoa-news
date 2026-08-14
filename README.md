# ⚽ Genoa Calcio News - App Web

Un'app web moderna per seguire tutte le notizie sul FC Genoa in tempo reale, scaricate automaticamente ogni 60 minuti da tutte le principali testate sportive italiane.

## 🎯 Funzionalità

✅ **Scraping automatico ogni 60 minuti** - Aggiornamento continuo da tutte le fonti
✅ **Installabile come app** - PWA per Android e iOS (come app nativa)
✅ **Offline support** - Leggi le notizie salvate anche senza internet
✅ **Multiple testate** - Gazzetta, Sky Sport, Corriere, Repubblica, Il Secolo XIX, ESPN e altri RSS
✅ **Ricerca e filtri** - Trova rapidamente le notizie che cerchi
✅ **Design responsive** - Perfetto su smartphone, tablet e desktop
✅ **Push notifications** - Ricevi notifiche per le notizie importanti

## 📱 Installa su Android

1. Apri l'app da browser (Chrome, Firefox, Edge)
2. Premi il menu (⋮) → "Installa app"
3. L'app si installa come app nativa nel telefono

## 💻 Setup Locale

### Requisiti
- Node.js 16+ (scarica da https://nodejs.org/)
- npm (incluso con Node.js)

### Installazione

```bash
# 1. Scarica il progetto
git clone <repo-url>
cd genoa-calcio-news

# 2. Installa dipendenze
npm install

# 3. Avvia il server
npm start
```

L'app sarà disponibile a `http://localhost:5000`

## 🚀 Deploy su Cloud

### Option 1: Railway (Consigliato - Gratuito)

```bash
# 1. Installa Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Deploy
railway up
```

### Option 2: Heroku

```bash
# 1. Installa Heroku CLI
# 2. Login e crea app
heroku login
heroku create genoa-news

# 3. Deploy
git push heroku main
```

### Option 3: Render

1. Vai a https://render.com
2. Connetti il repo GitHub
3. Seleziona "Node" come runtime
4. Build command: `npm install`
5. Start command: `node server.js`
6. Deploy!

## 📰 Testate Incluse

**RSS Feeds:**
- 📰 Gazzetta dello Sport
- 🏆 Sky Sport
- 🌍 ESPN
- 📄 Corriere della Sera
- 📍 Il Secolo XIX (Genova)
- 🏙️ Repubblica Genova

**Web Scraping:**
- Sky Sport (pagina Genoa)
- Gazzetta dello Sport (pagina Genoa)
- Repubblica Genova (sezione sport)
- Il Secolo XIX (sezione sport)

## 🔧 Configurazione

Crea un file `.env` per configurazioni personalizzate:

```env
PORT=5000
NODE_ENV=production
DATABASE_PATH=./genoa.db
SCRAPE_INTERVAL=60
```

## 📡 API Endpoints

```bash
# Ultime notizie
GET /api/news?limit=50&offset=0

# Notizie da una fonte specifica
GET /api/news/source/Sky%20Sport

# Lista testate
GET /api/sources

# Statistiche
GET /api/stats

# Trigger scraping manuale
POST /api/scrape
```

## 🎨 Customizzazione

### Cambiare colori (Genoa)
Modifica `/public/App.css`:
```css
--primary-color: #DC143C;      /* Rosso Genoa */
--secondary-color: #1E3A8A;    /* Blu Genoa */
```

### Aggiungere nuove testate
In `server.js`, aggiungi nel `RSS_FEEDS` array:
```javascript
{ 
  name: 'Fonte', 
  url: 'https://example.com/rss.xml' 
}
```

## ⚠️ Note Legali

Questo progetto scarica informazioni pubbliche da siti web. Usa con responsabilità e rispetta i termini di servizio dei siti. Non è affiliato a Sky Sport, Gazzetta dello Sport o altre testate.

## 📞 Supporto

Per problemi o domande:
1. Controlla i log: `npm start`
2. Verifica la connessione internet
3. Svuota cache del browser: Ctrl+Shift+Del

## 🔐 Sicurezza

- Nessun dato personale raccolto
- App open-source e trasparente
- Database locale (SQLite)
- HTTPS consigliato per deployment

## 📈 Statistiche

L'app traccia:
- Numero totale articoli
- Numero fonti disponibili
- Ultimo aggiornamento

Nessun dato personale viene raccolto o venduto.

---

**Fatto con ❤️ per i tifosi del Genoa** ⚽🔴🔵
