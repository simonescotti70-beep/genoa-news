# 🚀 Quick Start - Inizia in 5 minuti

## ⬇️ Step 1: Scarica e Installa

### Su Windows
```bash
# Apri PowerShell e copia-incolla:
git clone <repo-url>
cd genoa-calcio-news
npm install
npm start
```

### Su Mac/Linux
```bash
git clone <repo-url>
cd genoa-calcio-news
npm install
npm start
```

## 🌐 Step 2: Apri nel Browser

Vai a **http://localhost:5000** sul tuo computer

## 📱 Step 3: Installa su Android

1. Apri Chrome → vai a http://localhost:5000
2. Premi il menu (⋮) in alto a destra
3. Seleziona "Installa app"
4. L'app compare nel drawer del telefono!

## 🔧 Troubleshooting

### "npm not found"
- Installa Node.js da https://nodejs.org/
- Riavvia PowerShell/Terminale

### "Port 5000 already in use"
```bash
# Cambia porta in server.js:
const PORT = 3000;  // Cambia questo numero
```

### "Database error"
```bash
# Elimina e ricrea il database:
rm genoa.db
npm start
```

### Le notizie non si aggiornano
- Controlla di avere internet
- Leggi i log nel terminale per errori
- Premi il bottone 🔄 Aggiorna manualmente

## 📈 Prossimi Step

1. **Deploy su cloud** → Vedi README.md
2. **Aggiungere notifiche** → Configura push notifications
3. **Personalizzare colori** → Modifica App.css
4. **Aggiungere fonti** → Modifica server.js

## 💡 Pro Tips

- L'app cre il database automaticamente la prima volta
- Le notizie si aggiornano ogni 60 minuti
- Puoi aggiornare manualmente col bottone 🔄
- L'app funziona offline leggendo il cache

---

**Hai domande?** Controlla README.md o i log del terminale
