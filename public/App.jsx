import React, { useState, useEffect, useRef } from 'react';
import './App.css';

export default function App() {
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [sources, setSources] = useState([]);
  const [selectedSource, setSelectedSource] = useState('Tutti');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const scrollRef = useRef(null);

  // Fetch news
  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/news?limit=100');
      const data = await response.json();
      setNews(data);
      filterNews(data, selectedSource, searchTerm);
      fetchStats();
      setLastUpdate(new Date().toLocaleTimeString('it-IT'));
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch sources
  const fetchSources = async () => {
    try {
      const response = await fetch('/api/sources');
      const data = await response.json();
      setSources(['Tutti', ...data]);
    } catch (error) {
      console.error('Error fetching sources:', error);
    }
  };

  // Fetch players
  const fetchPlayers = async () => {
    try {
      const response = await fetch('/api/players');
      const data = await response.json();
      setPlayers(data);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Filter news
  const filterNews = (newsArray, source, search) => {
    let filtered = newsArray;

    if (source !== 'Tutti') {
      filtered = filtered.filter(n => n.source === source);
    }

    if (search) {
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredNews(filtered);
  };

  // Handle source change
  const handleSourceChange = (source) => {
    setSelectedSource(source);
    filterNews(news, source, searchTerm);
  };

  // Handle search
  const handleSearch = (term) => {
    setSearchTerm(term);
    filterNews(news, selectedSource, term);
  };

  // Manual refresh
  const handleRefresh = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/scrape', { method: 'POST' });
      const data = await response.json();
      console.log('Scrape triggered:', data);
      await fetchNews();
    } catch (error) {
      console.error('Error triggering scrape:', error);
    }
  };

  // Highlight player names in text
  const highlightPlayerNames = (text) => {
    if (!text || players.length === 0) return text;

    // Sort players by name length (longest first) to avoid partial matches
    const sortedPlayers = [...players].sort((a, b) => b.name.length - a.name.length);

    let result = text;
    sortedPlayers.forEach(player => {
      const regex = new RegExp(`\\b${player.name}\\b`, 'gi');
      result = result.replace(regex, `<span class="player-link" data-player-id="${player.id}">${player.name}</span>`);
    });

    return result;
  };

  // Handle player click
  const handlePlayerClick = (e) => {
    if (e.target.classList.contains('player-link')) {
      const playerId = parseInt(e.target.dataset.playerId);
      const player = players.find(p => p.id === playerId);
      if (player) {
        setSelectedPlayer(player);
        setShowPlayerModal(true);
      }
    }
  };

  // Initial load
  useEffect(() => {
    fetchNews();
    fetchSources();
    fetchPlayers();
    // Auto refresh every 5 minutes
    const interval = setInterval(fetchNews, 300000);
    return () => clearInterval(interval);
  }, []);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT') + ' ' + date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1>⚽ Genoa Calcio News</h1>
          <p className="last-update">
            Aggiornato: {lastUpdate || 'in caricamento...'}
          </p>
        </div>
      </header>

      {/* Stats Bar */}
      {stats && (
        <div className="stats-bar">
          <div className="stat">
            <span className="stat-label">📰 Articoli</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          <div className="stat">
            <span className="stat-label">📡 Fonti</span>
            <span className="stat-value">{stats.sources}</span>
          </div>
          <button className="refresh-btn" onClick={handleRefresh}>
            🔄 Aggiorna
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Cerca notizie..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Source Filter */}
      <div className="sources-container">
        {sources.map(source => (
          <button
            key={source}
            className={`source-btn ${selectedSource === source ? 'active' : ''}`}
            onClick={() => handleSourceChange(source)}
          >
            {source}
          </button>
        ))}
      </div>

      {/* News List */}
      <main className="news-container" ref={scrollRef}>
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Caricamento notizie...</p>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="empty">
            <p>❌ Nessuna notizia trovata</p>
            <p className="empty-subtitle">Prova a cambiare i filtri</p>
          </div>
        ) : (
          <div className="news-list">
            {filteredNews.map((article, index) => (
              <a
                key={index}
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="news-card"
              >
                {article.image && (
                  <div className="news-image">
                    <img 
                      src={article.image} 
                      alt={article.title}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}
                <div className="news-content" onClick={handlePlayerClick}>
                  <span className="news-source">{article.source}</span>
                  <h2 className="news-title">{article.title}</h2>
                  {article.description && (
                    <p 
                      className="news-description"
                      dangerouslySetInnerHTML={{ 
                        __html: highlightPlayerNames(article.description.substring(0, 120)) + '...'
                      }}
                    />
                  )}
                  <div className="news-meta">
                    <span className="news-date">
                      📅 {formatDate(article.published_at)}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </main>

      {/* Player Modal */}
      {showPlayerModal && selectedPlayer && (
        <div className="modal-overlay" onClick={() => setShowPlayerModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowPlayerModal(false)}>✕</button>
            
            <div className="player-modal">
              <div className="player-header">
                <div className="player-number">{selectedPlayer.number}</div>
                <div className="player-name-section">
                  <h1 className="player-name">{selectedPlayer.firstName} {selectedPlayer.name}</h1>
                  <p className="player-role">{selectedPlayer.role}</p>
                </div>
              </div>

              <div className="player-info-grid">
                <div className="player-info-item">
                  <span className="info-label">Nazionalità</span>
                  <span className="info-value">{selectedPlayer.nationality}</span>
                </div>
                <div className="player-info-item">
                  <span className="info-label">Ruolo</span>
                  <span className="info-value">{selectedPlayer.role}</span>
                </div>
                <div className="player-info-item">
                  <span className="info-label">Numero Maglia</span>
                  <span className="info-value">#{selectedPlayer.number}</span>
                </div>
                <div className="player-info-item">
                  <span className="info-label">Anno di Nascita</span>
                  <span className="info-value">{selectedPlayer.birthYear}</span>
                </div>
              </div>

              <div className="player-stats">
                <p className="player-desc">
                  📊 Giocatore della Squadra del Genoa CFC
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <p>Genoa Calcio News • Notizie in tempo reale dal web</p>
        <p className="footer-note">Prossimo aggiornamento: tra ~{Math.floor(Math.random() * 30 + 30)} minuti</p>
      </footer>
    </div>
  );
}
