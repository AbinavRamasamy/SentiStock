import { useState } from 'react'
import axios from 'axios'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [ticker, setTicker] = useState('')
  const [sentimentData, setSentimentData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const analyzeStock = async () => {
    
    if (!ticker) return

    setLoading(true)
    setError(null)
    setSentimentData(null)

    try {
      console.log("CHECKPOINT: Sending request to Django...")
      const response = await axios.post('http://127.0.0.1:8000/api/analyze/', {
        ticker: ticker
      })
      console.log("CHECKPOINT: Success! The response data is: ", response.data)
      setSentimentData(response.data)
    } catch (err) {
      console.error("Error:", err)
      setError("Failed to fetch data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>SentiStock</h1>
      <div className="card">
        <input 
          type="text" 
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          placeholder="Enter Stock Ticker (e.g. AAPL)"
          style={{ padding: '10px', fontSize: '16px', width: '225px', margin: '10px' }}
        />
        <button onClick={analyzeStock} disabled={loading}>
          {loading ? 'Analyzing...' : 'Analyze Stock'}
        </button>
        <p>
          Sentiment: {sentimentData ? sentimentData.sentiment_label : 'N/A'}, {sentimentData ? sentimentData.average_sentiment.toFixed(5) : 'N/A'}
          <br />
          Headlines: {sentimentData ? JSON.stringify(sentimentData.recent_headlines) : 'No Recent headlines'}
        </p>
      </div>
    </>
  )
}

export default App
