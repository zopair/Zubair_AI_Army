
import os
import requests

def test_readiness():
    keys = ["TELEGRAM_BOT_TOKEN", "GEMINI_API_KEY", "GH_TOKEN"]
    missing = [k for k in keys if not os.getenv(k)]
    
    bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
    chat_id = "257288843"
    
    if not missing:
        msg = "✅ [التقرير النهائي]: جميع المفاتيح محقونة! جيش الزبير الموحد جاهز للعمل بكامل طاقته الآن."
    else:
        msg = f"⚠️ [تنبيه]: النظام ما زال ينقصه المفاتيح التالية: {missing}. يرجى إضافتها في Settings المستودع."
    
    if bot_token:
        requests.post(f"https://api.telegram.org/bot{bot_token}/sendMessage", 
                     json={"chat_id": chat_id, "text": msg})

if __name__ == "__main__":
    test_readiness()
