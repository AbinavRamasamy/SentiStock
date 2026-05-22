from rest_framework.decorators import api_view
from rest_framework.response import Response
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import yfinance as yf

analyzer = SentimentIntensityAnalyzer()

@api_view(['POST'])
def analyze_stock(request):
    try:
        ticker_symbol = request.data.get('ticker', '')
        stock = yf.Ticker(ticker_symbol)
        news_list = stock.news
        headlines = []

        if not news_list:
            return Response({"error": "No news found for this ticker"}, status=404)
        
        articles = [
            {
                "title": news['content']['title'],
                "url": news['content'].get('canonicalUrl', {}).get('url', ''),
            }
            for news in news_list if 'content' in news and 'title' in news['content']
        ]

        headlines = [a['title'] for a in articles]
        compound_scores = [analyzer.polarity_scores(h)['compound'] for h in headlines]
        avg_score = (sum(compound_scores) / len(compound_scores)) if compound_scores else 0
        label = "positive" if avg_score > 0.05 else "negative" if avg_score < -0.05 else "neutral"

        return Response({
            "ticker": ticker_symbol,
            "average_sentiment": avg_score,
            "sentiment_label": label,
            "recent_headlines": articles[:10],
        })
    except Exception as e:
        return Response({"error": str(e)}, status=500)
    