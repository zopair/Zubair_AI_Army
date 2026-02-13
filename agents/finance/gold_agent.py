
import os
import requests
import google.generativeai as genai
from datetime import datetime

# الإعدادات السيادية
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
GEMINI_KEY = os.getenv("GEMINI_API_KEY")
CHAT_ID = "257288843"

def get_market_data():
    # محاكاة جلب البيانات العالمية (سوف يتم ربطها بـ NewsAPI و SerpApi لاحقاً)
    sources = [
        "Bloomberg (EN): Gold prices stabilize amid rate hike fears.",
        "Sina Finance (CN): 黄金价格小幅上涨，需求增加 (Gold up slightly, demand rising).",
        "Finam.ru (RU): Золото как защитный актив в 2026 году (Gold as a safe haven).",
        "Investing (AR): الذهب يقترب من مستويات قياسية تاريخية اليوم."
    ]
    return "\n".join(sources)

def generate_report(data):
    genai.configure(api_key=GEMINI_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash')
    prompt = f"بصفتك محلل مالي دولي لشركة الزبير، لخص هذه البيانات العالمية للذهب بتاريخ اليوم {datetime.now().date()} في نشرة احترافية قصيرة ومحددة للقائد Prince Sultan: {data}"
    response = model.generate_content(prompt)
    return response.text

def send_to_leader(report):
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    payload = {"chat_id": CHAT_ID, "text": f"🪙 **نشرة الذهب اليومية - شركة الزبير**\n\n{report}"}
    requests.post(url, json=payload)

if __name__ == "__main__":
    market_data = get_market_data()
    final_report = generate_report(market_data)
    send_to_leader(final_report)
