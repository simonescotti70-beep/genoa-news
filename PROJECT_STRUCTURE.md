# 📁 Struttura del Progetto

```
genoa-calcio-news/
│
├── 📄 server.js              # Backend Node.js (scraper + API)
├── 📄 package.json           # Dipendenze e script npm
├── 📄 .env.example           # Variabili di configurazione
├── 📄 .gitignore             # File da escludere da git
│
├── 🐳 Dockerfile             # Per containerizzare l'app
├── 🐳 docker-compose.yml     # Per run con Docker
│
├── 📂 public/                # File statici (frontend)
│   ├── 📄 index.html         # HTML principale
│   ├── 📄 App.jsx            # Componente React principale
│   ├── 📄 App.css            # Stili dell'app
│   ├── 📄 manifest.json      # PWA configuration
│   └── 📄 service-worker.js  # Offline support
│
├── 📚 README.md              # Documentazione completa
├── 🚀 QUICKSTART.md          # Guida veloce (5 minuti)
├── 🌐 DEPLOY_RAILWAY.md      # Deploy su Railway gratuito
└── 📋 PROJECT_STRUCTURE.md   # Questo file
```

## 📖 Cosa fa ogni file

### Backend (Node.js)

**server.js** - Cuore dell'app
- Scraper che scarica da 6+ testate sportive ogni 60 minuti
- API REST per gestire le notizie
- Database SQLite per salvare gli articoli
- Cron job per aggiornamenti automatici

### Frontend (React)

**App.jsx** - Componente principale
- Interfaccia bella e responsive
- Filtri per testate sportive
- Ricerca live
- Caricamento automatico

**App.css** - Stili
- Design Genoa (rosso e blu)
- Mobile-first responsive
- Animazioni fluide
- Dark mode

### PWA (Progressive Web App)

**manifest.json** - Metadata app
- Nome e icona
- Shortcut dall'home screen
- Temi e colori

**service-worker.js** - Funziona offline
- Cache intelligente
- Sync in background
- Push notifications

**index.html** - Entry point
- Setup PWA
- Link alle risorse
- Meta tags ottimizzati

### Configurazione

**package.json** - Dipendenze
```
- express: Server web
- axios: HTTP client per scraping
- cheerio: HTML parsing
- sqlite3: Database
- node-cron: Task scheduler
- rss-parser: Parse RSS feeds
```

**.env.example** - Variabili
- PORT (default 5000)
- NODE_ENV (development/production)
- DATABASE_PATH
- SCRAPE_INTERVAL (60 minuti)

## 🔄 Flusso Dati

```
┌─────────────────────────────────────────────┐
│         Scraper Node.js (server.js)         │
│                                              │
│  Ogni 60 minuti:                            │
│  1. Scarica RSS feeds (Gazzetta, Sky, etc) │
│  2. Scrape HTML da siti (Repubblica, etc)  │
│  3. Salva in SQLite (genoa.db)             │
│  4. Invia API ai client                    │
└──────────────────┬──────────────────────────┘
                   │
                   ↓
        ┌──────────────────────┐
        │   Database SQLite    │
        │      genoa.db        │
        │  (1000+ articoli)    │
        └──────────┬───────────┘
                   │
                   ↓
        ┌──────────────────────┐
        │   API REST Endpoints │
        │  /api/news           │
        │  /api/sources        │
        │  /api/stats          │
        │  /api/scrape         │
        └──────────┬───────────┘
                   │
                   ↓
        ┌──────────────────────┐
        │   React Web App      │
        │   (App.jsx/CSS)      │
        │  Interfaccia bella   │
        └──────────┬───────────┘
                   │
                   ↓
        ┌──────────────────────┐
        │    Telefono Android  │
        │   App installata     │
        │  (PWA nel drawer)    │
        └──────────────────────┘
```

## 🚀 Step per Avviare

### Locale
```bash
npm install
npm start
# Visita http://localhost:5000
```

### Docker
```bash
docker-compose up -d
# App su http://localhost:5000
```

### Cloud (Railway)
```bash
# Vedi DEPLOY_RAILWAY.md
# Deploy in 2 minuti
```

## 📡 Testate Scaricate

### RSS Feeds (Automatico)
- Gazzetta dello Sport
- Sky Sport
- ESPN
- Corriere della Sera
- Il Secolo XIX
- Repubblica

### Web Scraping (HTML)
- Sky Sport (pagina Genoa)
- Gazzetta dello Sport (pagina Genoa)
- Repubblica Genova
- Il Secolo XIX (Sport)

## 🔐 Sicurezza

- Nessun login/password
- Database locale
- HTTPS su cloud
- No dati personali
- Open source

## 💡 Customizzazione

### Aggiungere una fonte
In `server.js`, aggiungi nel `RSS_FEEDS` array

### Cambiare colori
In `App.css`, modifica le CSS variables

### Cambiare intervallo scraping
In `server.js`:
```javascript
cron.schedule('0 * * * *', ...)  // 0 = ogni ora
// Cambia per ogni 30 min: '*/30 * * * *'
```

## 📊 Database

SQLite con struttura semplice:
```sql
CREATE TABLE news (
  id INTEGER PRIMARY KEY,
  title TEXT,
  description TEXT,
  link TEXT UNIQUE,
  source TEXT,
  image TEXT,
  published_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

---

**Pronto a partire?** Leggi QUICKSTART.md! 🚀
