require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const sqlite3 = require('sqlite3').verbose();
const cron = require('node-cron');
const Parser = require('rss-parser');
const path = require('path');

const app = express();
const parser = new Parser();

// Database
const db = new sqlite3.Database('./genoa.db', (err) => {
  if (err) console.error('DB Error:', err);
  else console.log('Database connected');
});

// Create tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    link TEXT UNIQUE,
    source TEXT,
    image TEXT,
    published_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ==================== SCRAPER FUNCTIONS ====================

// RSS Feeds
const RSS_FEEDS = [
  { name: 'Gazzetta dello Sport', url: 'https://www.gazzetta.it/rss/calcio.xml' },
  { name: 'Sky Sport', url: 'https://sport.sky.it/rss/calcio.xml' },
  { name: 'ESPN', url: 'https://feeds.espn.com/feeds/site/espn/headline' },
  { name: 'Corriere della Sera', url: 'https://www.corriere.it/rss/calcio.xml' },
  { name: 'Il Secolo XIX', url: 'https://www.ilsecoloxix.it/feed' },
  { name: 'Repubblica Genova', url: 'https://genova.repubblica.it/rss.xml' },
];

// Scraper per Sky Sport
async function scrapeSkyGenoaNews() {
  try {
    const response = await axios.get('https://sport.sky.it/calcio/serie-a/genoa', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 10000
    });
    const $ = cheerio.load(response.data);
    const news = [];

    $('article').each((i, elem) => {
      const title = $(elem).find('h3, h2').text().trim();
      const link = $(elem).find('a').attr('href');
      const description = $(elem).find('p').text().trim();
      const image = $(elem).find('img').attr('src');

      if (title && link && title.toLowerCase().includes('genoa')) {
        news.push({
          title,
          description,
          link: link.startsWith('http') ? link : 'https://sport.sky.it' + link,
          source: 'Sky Sport',
          image
        });
      }
    });
    return news;
  } catch (error) {
    console.error('Sky scraper error:', error.message);
    return [];
  }
}

// Scraper per Gazzetta dello Sport
async function scrapeGazzettaNews() {
  try {
    const response = await axios.get('https://www.gazzetta.it/Calcio/Genoa', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 10000
    });
    const $ = cheerio.load(response.data);
    const news = [];

    $('article').each((i, elem) => {
      const title = $(elem).find('h3, h2, .title').text().trim();
      const link = $(elem).find('a').attr('href');
      const description = $(elem).find('p, .desc').text().trim();
      const image = $(elem).find('img').attr('src');

      if (title && link) {
        news.push({
          title,
          description: description.substring(0, 200),
          link: link.startsWith('http') ? link : 'https://www.gazzetta.it' + link,
          source: 'Gazzetta dello Sport',
          image
        });
      }
    });
    return news;
  } catch (error) {
    console.error('Gazzetta scraper error:', error.message);
    return [];
  }
}

// Scraper per Repubblica Genova
async function scrapeRepubblicaNews() {
  try {
    const response = await axios.get('https://genova.repubblica.it/sport', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 10000
    });
    const $ = cheerio.load(response.data);
    const news = [];

    $('article, .article').each((i, elem) => {
      const title = $(elem).find('h3, h2, .headline').text().trim();
      const link = $(elem).find('a').attr('href');
      const description = $(elem).find('p, .desc').text().trim();
      const image = $(elem).find('img').attr('src');

      if (title && link && title.toLowerCase().includes('genoa')) {
        news.push({
          title,
          description: description.substring(0, 200),
          link: link.startsWith('http') ? link : 'https://genova.repubblica.it' + link,
          source: 'Repubblica Genova',
          image
        });
      }
    });
    return news;
  } catch (error) {
    console.error('Repubblica scraper error:', error.message);
    return [];
  }
}

// Scraper per Il Secolo XIX
async function scrapeSecoloNews() {
  try {
    const response = await axios.get('https://www.ilsecoloxix.it/sport/', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 10000
    });
    const $ = cheerio.load(response.data);
    const news = [];

    $('article, .article-item').each((i, elem) => {
      const title = $(elem).find('h3, h2, .title').text().trim();
      const link = $(elem).find('a').attr('href');
      const description = $(elem).find('p').text().trim();
      const image = $(elem).find('img').attr('src');

      if (title && link && title.toLowerCase().includes('genoa')) {
        news.push({
          title,
          description: description.substring(0, 200),
          link: link.startsWith('http') ? link : 'https://www.ilsecoloxix.it' + link,
          source: 'Il Secolo XIX',
          image
        });
      }
    });
    return news;
  } catch (error) {
    console.error('Secolo XIX scraper error:', error.message);
    return [];
  }
}

// Parse RSS Feeds
async function parseRSSFeeds() {
  const allNews = [];

  for (const feed of RSS_FEEDS) {
    try {
      const rss = await parser.parseURL(feed.url);
      const genoaItems = rss.items.filter(item => 
        item.title.toLowerCase().includes('genoa') || 
        (item.content && item.content.toLowerCase().includes('genoa'))
      );

      genoaItems.forEach(item => {
        allNews.push({
          title: item.title,
          description: item.content || item.contentSnippet || '',
          link: item.link,
          source: feed.name,
          image: item.image?.url || null,
          published_at: new Date(item.pubDate)
        });
      });
    } catch (error) {
      console.error(`Error parsing ${feed.name}:`, error.message);
    }
  }

  return allNews;
}

// Save news to DB
async function saveNews(newsArray) {
  for (const news of newsArray) {
    db.run(
      `INSERT OR IGNORE INTO news (title, description, link, source, image, published_at) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        news.title,
        news.description?.substring(0, 500) || '',
        news.link,
        news.source,
        news.image || '',
        news.published_at || new Date()
      ],
      (err) => {
        if (err && !err.message.includes('UNIQUE')) console.error('Insert error:', err);
      }
    );
  }
}

// Main scraper function
async function scrapeAllNews() {
  console.log('🔍 Starting scrape at', new Date().toLocaleTimeString('it-IT'));

  const allNews = [];

  // Scrape RSS feeds
  const rssNews = await parseRSSFeeds();
  allNews.push(...rssNews);

  // Scrape HTML pages
  const skyNews = await scrapeSkyGenoaNews();
  const gazzettaNews = await scrapeGazzettaNews();
  const repubblica = await scrapeRepubblicaNews();
  const secolo = await scrapeSecoloNews();

  allNews.push(...skyNews, ...gazzettaNews, ...repubblica, ...secolo);

  // Remove duplicates
  const unique = Array.from(new Map(allNews.map(n => [n.link, n])).values());

  // Save to DB
  await saveNews(unique);

  console.log(`✅ Found ${unique.length} news articles about Genoa`);
  return unique.length;
}

// ==================== CRON JOB ====================
// Scrape every 60 minutes
cron.schedule('0 * * * *', async () => {
  await scrapeAllNews();
});

// Also scrape on startup
scrapeAllNews();

// ==================== API ROUTES ====================

// Get all news
app.get('/api/news', (req, res) => {
  const limit = req.query.limit || 50;
  const offset = req.query.offset || 0;

  db.all(
    `SELECT * FROM news ORDER BY published_at DESC LIMIT ? OFFSET ?`,
    [limit, offset],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Get news by source
app.get('/api/news/source/:source', (req, res) => {
  db.all(
    `SELECT * FROM news WHERE source = ? ORDER BY published_at DESC LIMIT 20`,
    [req.params.source],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Get sources list
app.get('/api/sources', (req, res) => {
  db.all(
    `SELECT DISTINCT source FROM news ORDER BY source`,
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows.map(r => r.source));
    }
  );
});

// Manual trigger scrape
app.post('/api/scrape', async (req, res) => {
  const count = await scrapeAllNews();
  res.json({ success: true, newsCount: count });
});

// Stats
app.get('/api/stats', (req, res) => {
  db.get(
    `SELECT COUNT(*) as total, 
            COUNT(DISTINCT source) as sources,
            MAX(published_at) as lastUpdate
     FROM news`,
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(row);
    }
  );
});

// ==================== PLAYER DATABASE ====================
const GENOA_PLAYERS = [
  // Portieri
  { id: 1, name: 'Gollini', firstName: 'Pierluigi', role: 'Portiere', number: 1, nationality: 'Italia', birthYear: 1995 },
  { id: 2, name: 'Semper', firstName: 'Stefano', role: 'Portiere', number: 27, nationality: 'Italia', birthYear: 1998 },
  
  // Difensori
  { id: 3, name: 'Bani', firstName: 'Matteo', role: 'Difensore', number: 4, nationality: 'Italia', birthYear: 1994 },
  { id: 4, name: 'Vasquez', firstName: 'Johan', role: 'Difensore', number: 2, nationality: 'Ecuador', birthYear: 1998 },
  { id: 5, name: 'De Winter', firstName: 'Koni', role: 'Difensore', number: 6, nationality: 'Olanda', birthYear: 2002 },
  { id: 6, name: 'Sabelli', firstName: 'Andrea', role: 'Difensore', number: 33, nationality: 'Italia', birthYear: 1994 },
  { id: 7, name: 'Vogliacco', firstName: 'Jacopo', role: 'Difensore', number: 28, nationality: 'Italia', birthYear: 1997 },
  
  // Centrocampisti
  { id: 8, name: 'Blessin', firstName: 'Alexander', role: 'Centrocampista', number: 14, nationality: 'Germania', birthYear: 1989 },
  { id: 9, name: 'Frendrup', firstName: 'Morten', role: 'Centrocampista', number: 26, nationality: 'Danimarca', birthYear: 2001 },
  { id: 10, name: 'Strootman', firstName: 'Kevin', role: 'Centrocampista', number: 8, nationality: 'Olanda', birthYear: 1990 },
  { id: 11, name: 'Rovella', firstName: 'Nicolò', role: 'Centrocampista', number: 7, nationality: 'Italia', birthYear: 2002 },
  { id: 12, name: 'Badelj', firstName: 'Milan', role: 'Centrocampista', number: 15, nationality: 'Croazia', birthYear: 1990 },
  
  // Attaccanti
  { id: 13, name: 'Simeone', firstName: 'Giovanni', role: 'Attaccante', number: 9, nationality: 'Argentina', birthYear: 1995 },
  { id: 14, name: 'Ekuban', firstName: 'Caleb', role: 'Attaccante', number: 11, nationality: 'Ghana', birthYear: 1994 },
  { id: 15, name: 'Pinamonti', firstName: 'Andrea', role: 'Attaccante', number: 10, nationality: 'Italia', birthYear: 1999 },
  { id: 16, name: 'Aramu', firstName: 'Mattia', role: 'Attaccante', number: 23, nationality: 'Italia', birthYear: 1997 },
  { id: 17, name: 'Yeboah', firstName: 'Joseph', role: 'Attaccante', number: 17, nationality: 'Ghana', birthYear: 2002 },
  { id: 18, name: 'Melegoni', firstName: 'Paolo', role: 'Attaccante', number: 19, nationality: 'Italia', birthYear: 2000 },
];

// API: Get all players
app.get('/api/players', (req, res) => {
  res.json(GENOA_PLAYERS);
});

// API: Get single player
app.get('/api/players/:id', (req, res) => {
  const player = GENOA_PLAYERS.find(p => p.id === parseInt(req.params.id));
  if (!player) {
    return res.status(404).json({ error: 'Player not found' });
  }
  res.json(player);
});

// API: Search player by name
app.get('/api/players/search/:name', (req, res) => {
  const searchTerm = req.params.name.toLowerCase();
  const results = GENOA_PLAYERS.filter(p => 
    p.name.toLowerCase().includes(searchTerm) || 
    p.firstName.toLowerCase().includes(searchTerm)
  );
  res.json(results);
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Access app at http://localhost:${PORT}`);
  console.log(`🔄 Scraper runs every 60 minutes`);
});

process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});
