
import os
import requests
from google import genai

def fetch_trending_signals():
    client = genai.Client(api_key=os.environ.get('GOOGLE_API_KEY'))
    prompt = "أهم 3 تريندات مالية اليوم 13 فبراير 2026 لاستثمار الذهب. لشركة الزبير."
    response = client.models.generate_content(model="gemini-1.5-flash", contents=prompt)
    return response.text

if __name__ == "__main__":
    try:
        signals = fetch_trending_signals()
        with open("streams/finance/signals/latest_trends.txt", "w", encoding="utf-8") as f:
            f.write(signals)
        print("✅ تم صيد التريند بنجاح.")
    except Exception as e:
        print(f"❌ فشل الصيد: {e}")
