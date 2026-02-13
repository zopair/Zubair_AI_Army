
import os
import requests
import google.generativeai as genai
from datetime import datetime

def get_gold_report():
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    # طلب تحليل شامل من جيمناي بناءً على بيانات السوق العالمية الافتراضية لليوم
    prompt = "Analyze global gold market trends for today Feb 13, 2026. Provide a concise summary in Arabic for 'Prince Sultan', covering insights from US, China, and Russia markets. Use emojis."
    
    response = model.generate_content(prompt)
    return response.text

def send_to_telegram(text):
    bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
    chat_id = "257288843"
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    requests.post(url, json={"chat_id": chat_id, "text": f"🪙 **نشرة الذهب السيادية (شركة الزبير)**\n\n{text}", "parse_mode": "Markdown"})

if __name__ == "__main__":
    report = get_gold_report()
    send_to_telegram(report)
