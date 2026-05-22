import { useState } from 'react'
import axios from 'axios'
import './App.css'

function SentimentBadge({ label }) {
  const colors = {
    positive: '#22c55e',
    negative: '#ef4444',
    neutral: '#f59e0b',
  }
  return (
    <span className="badge" style={{ backgroundColor: colors[label] || '#888' }}>
      {label?.toUpperCase()}
    </span>
  )
}

function ScoreBar({ score }) {
  const pct = ((score + 1) / 2) * 100
  const color = score > 0.05 ? '#22c55e' : score < -0.05 ? '#ef4444' : '#f59e0b'
  return (
    <div className="score-bar-wrapper">
      <div className="score-bar-track">
        <div className="score-bar-fill" style={{ width: `${pct}%`, backgroundColor: color }} />
        <div className="score-bar-marker" />
      </div>
      <div className="score-bar-labels">
        <span>Bearish</span>
        <span>Neutral</span>
        <span>Bullish</span>
      </div>
    </div>
  )
}

function HistoryItem({ item, isActive, onClick }) {
  const colors = { positive: '#22c55e', negative: '#ef4444', neutral: '#f59e0b' }
  return (
    <button className={`history-item ${isActive ? 'active' : ''}`} onClick={onClick}>
      <span className="history-ticker">{item.ticker}</span>
      <span className="history-dot" style={{ backgroundColor: colors[item.sentiment_label] }} />
    </button>
  )
}

export default function App() {
  const [ticker, setTicker] = useState('')
  const [current, setCurrent] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeIndex, setActiveIndex] = useState(null)

  const analyzeStock = async () => {
    if (!ticker) return
    setLoading(true)
    setError(null)
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/analyze/', { ticker })
      const data = response.data
      setCurrent(data)
      setHistory(prev => {
        const filtered = prev.filter(h => h.ticker !== data.ticker)
        return [data, ...filtered]
      })
      setActiveIndex(0)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => { if (e.key === 'Enter') analyzeStock() }

  const selectHistory = (item, index) => {
    setCurrent(item)
    setActiveIndex(index)
  }

  const sentimentColor = current
    ? { positive: '#22c55e', negative: '#ef4444', neutral: '#f59e0b' }[current.sentiment_label]
    : '#6366f1'

  return (
    <div className="layout">
      {/* Left Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="logo-mark">S</div>
          <span className="brand-name">SentiStock</span>
        </div>

        <div className="search-section">
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            onKeyDown={handleKey}
            placeholder="Ticker (e.g. AAPL)"
            className="ticker-input"
            maxLength={10}
          />
          <button onClick={analyzeStock} disabled={loading} className="analyze-btn">
            {loading ? <span className="spinner" /> : 'Analyze'}
          </button>
        </div>

        {error && <div className="error-card">{error}</div>}

        {history.length > 0 && (
          <div className="history-section">
            <p className="history-label">Recent</p>
            <div className="history-list">
              {history.map((item, i) => (
                <HistoryItem
                  key={item.ticker}
                  item={item}
                  isActive={activeIndex === i}
                  onClick={() => selectHistory(item, i)}
                />
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="main">
        {!current ? (
          <div className="empty-state">
            <div className="empty-icon">S</div>
            <h2>Enter a stock ticker to get started</h2>
            <p>Get AI-powered sentiment analysis from recent news headlines</p>
          </div>
        ) : (
          <div className="stock-detail" key={current.ticker}>
            <div className="detail-header" style={{ borderColor: sentimentColor }}>
              <div>
                <h1 className="detail-ticker">{current.ticker}</h1>
                <p className="detail-subtitle">Sentiment Analysis</p>
              </div>
              <SentimentBadge label={current.sentiment_label} />
            </div>

            <div className="detail-cards">
              <div className="stat-card">
                <p className="stat-label">Sentiment Score</p>
                <p className="stat-value" style={{ color: sentimentColor }}>
                  {current.average_sentiment.toFixed(4)}
                </p>
              </div>
              <div className="stat-card">
                <p className="stat-label">Verdict</p>
                <p className="stat-value" style={{ color: sentimentColor }}>
                  {current.sentiment_label.charAt(0).toUpperCase() + current.sentiment_label.slice(1)}
                </p>
              </div>
              <div className="stat-card">
                <p className="stat-label">Headlines Analyzed</p>
                <p className="stat-value">{current.recent_headlines.length}</p>
              </div>
            </div>

            <div className="detail-card">
              <p className="section-label">Sentiment Meter</p>
              <ScoreBar score={current.average_sentiment} />
            </div>

            <div className="detail-card">
              <p className="section-label">Recent Headlines</p>
              <ul className="headlines-list">
                {current.recent_headlines.map((h, i) => (
                  <li key={i} className="headline-item">
                    <span className="headline-num">{i + 1}</span>
                    {h.url
                      ? <a href={h.url} target="_blank" rel="noopener noreferrer">{h.title}</a>
                      : h.title}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
