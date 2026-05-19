# SentiStock

A full-stack financial sentiment analysis platform that processes real-time news headlines for any publicly traded stock and classifies market sentiment as positive, negative, or neutral.

## How It Works

1. User enters a stock ticker (e.g. `AAPL`, `TSLA`)
2. The Django backend fetches up to 10 recent news headlines via Yahoo Finance
3. VADER Sentiment Analysis generates a compound volatility score for each headline
4. The average score is used to classify overall sentiment
5. Results are displayed in the React frontend in real time

## Tech Stack

**Backend:** Python, Django, Django REST Framework, VADER Sentiment Analysis, yfinance  
**Frontend:** React, Vite, Axios  

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/AbinavRamasamy/SentiStock
cd SentiStock
```

### 2. Backend

```bash
cd backend
pip install django djangorestframework django-cors-headers vaderSentiment yfinance
python manage.py migrate
python manage.py runserver
```

Backend runs at `http://127.0.0.1:8000`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

Sentiment label thresholds:
- `positive` → score > 0.05
- `negative` → score < -0.05  
- `neutral` → score between -0.05 and 0.05
