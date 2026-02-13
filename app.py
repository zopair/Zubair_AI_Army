
import os
import requests
import google.generativeai as genai

# الربط بالمفاتيح السيادية من GitHub Secrets
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
GEMINI_KEY = os.getenv("GEMINI_API_KEY")
GH_TOKEN = os.getenv("GH_TOKEN")
CHAT_ID = "257288843"

# تفعيل Gemini
genai.configure(api_key=GEMINI_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

def handle_command(text):
    if "/check" in text:
        return "📊 نظام جيش الزبير الموحد يعمل بكامل طاقته."
    # هنا سيتم استدعاء الوكلاء الفرعيين لاحقاً
    response = model.generate_content(f"بصفتك قائد جيش الزبير، رد على: {text}")
    return response.text

if __name__ == "__main__":
    print("🛡️ Al-Zubair AI Army is LIVE")
