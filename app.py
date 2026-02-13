
import os
import requests
import google.generativeai as genai

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
GEMINI_KEY = os.getenv("GEMINI_API_KEY")
CHAT_ID = "257288843"

def run_system():
    if not BOT_TOKEN: return
    # إرسال إشارة استيقاظ للقائد
    requests.post(f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage", 
                 json={"chat_id": CHAT_ID, "text": "🛡️ قائد Prince Sultan، تم تفعيل جيش الزبير الموحد وهو الآن رهن إشارتك."})
    
    # فحص الرسائل الأخيرة والرد بذكاء Gemini
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/getUpdates"
    res = requests.get(url).json()
    for update in res.get("result", []):
        msg = update.get("message", {})
        if str(msg.get("from", {}).get("id")) == CHAT_ID:
            text = msg.get("text", "")
            genai.configure(api_key=GEMINI_KEY)
            model = genai.GenerativeModel('gemini-1.5-flash')
            reply = model.generate_content(f"أجب كوكيل ذكي لشركة الزبير: {text}").text
            requests.post(f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage", 
                         json={"chat_id": CHAT_ID, "text": reply})

if __name__ == "__main__":
    run_system()
