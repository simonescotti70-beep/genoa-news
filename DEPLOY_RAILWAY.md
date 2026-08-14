# 🚀 Deploy su Railway (Gratuito)

Railway è il modo più facile per deployare gratuitamente questa app nel cloud!

## Step 1: Prepara su GitHub

```bash
# 1. Crea un account GitHub (se non hai)
# 2. Crea un nuovo repo

# 3. Inizializza il git locale
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TuoUsername/genoa-news.git
git push -u origin main
```

## Step 2: Deploy su Railway

### Via Browser (Più Facile)

1. Vai a https://railway.app
2. Clicca "Login with GitHub"
3. Autorizza Railway ad accedere ai tuoi repo
4. Clicca "New Project" → "Deploy from GitHub"
5. Seleziona il repo `genoa-news`
6. Aspetta che Railway auto-detected Node.js
7. Clicca "Deploy"

**Fatto!** L'app è online in 2 minuti ⚡

### Via CLI (Alternativa)

```bash
# 1. Installa Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Crea nuovo progetto
railway init

# 4. Deploy
railway up
```

## 📱 Accedi all'App

Dopo il deploy, Railway ti darà un URL come:
```
https://genoa-news-production.up.railway.app
```

### Installa su Android da URL Pubblico

1. Copia l'URL di Railway
2. Apri Chrome sul telefono
3. Incolla l'URL nella barra di ricerca
4. Premi il menu (⋮) → "Installa app"
5. ✅ Fatto!

## 💰 Pricing

Railway offre **gratuitamente**:
- 500MB storage
- 100 ore/mese di esecuzione
- Perfetto per questa app!

## 🔧 Configurazione Railway

### Variabili d'Ambiente

Nel dashboard di Railway:

1. Vai al progetto
2. Vai a "Variables"
3. Aggiungi:
```
PORT=5000
NODE_ENV=production
```

### Database Persistente

Il database SQLite si salva automaticamente su Railway.

## 📊 Monitoring

Nel dashboard Railway puoi vedere:
- 📊 Deployment status
- 📈 CPU e memoria
- 📝 Logs in tempo reale
- 🔄 Restart automatico se crash

## 🛑 Ferma l'App

```bash
railway down
```

O dal dashboard Railway: Project Settings → Danger Zone → Delete

## 🆘 Troubleshooting

### App non si accende
```bash
railway logs --follow
```
Leggi i log per vedere l'errore

### Database corrotto
Railway salva automaticamente il db. Se vuoi resettare:
1. Vai a Storage → Variables
2. Elimina il file genoa.db
3. Riavvia il progetto

### Vuoi usare un dominio personalizzato?

1. Compra dominio (Namecheap, GoDaddy, ecc)
2. Nel dashboard Railway → Networking
3. Connetti il dominio
4. Aggiorna DNS settings

## 🔐 Note Sicurezza

- Railway usa HTTPS per default ✅
- Nessun dato sensibile salvato 🔒
- Database locale solo leggi da DB 📚

## 📞 Supporto Railway

- Docs: https://docs.railway.app
- Community: https://railway.app/community
- Status: https://status.railway.app

---

**Preferisci altri cloud?** Vedi README.md per Heroku, Render, Vercel, ecc.
