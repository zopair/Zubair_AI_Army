
import os
import requests
import google.generativeai as genai

def fetch_trending_signals():
    # استخدام Gemini لتحليل التوجهات العالمية بناءً على بيانات اللحظة
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    prompt = '''
    بصفتك محلل بيانات عالمي لشركة الزبير، حدد أهم 3 تريندات (Trends) مالية أو تكنولوجية "ساخنة" الآن في فبراير 2026 
    يمكن استغلالها لصناعة محتوى مربح أو استثمار سريع. 
    ركز على الذهب، الذكاء الاصطناعي، والأسواق الناشئة.
    أعطني النتيجة في شكل نقاط محددة للقائد Prince Sultan.
    '''
    
    response = model.generate_content(prompt)
    return response.text

def alert_leader(trend_report):
    bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
    chat_id = "257288843"
    msg = f"🏹 **رادار التريندات السيادي (شركة الزبير)**\n\n{trend_report}"
    
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    requests.post(url, json={"chat_id": chat_id, "text": msg, "parse_mode": "Markdown"})

if __name__ == "__main__":
    signals = fetch_trending_signals()
    alert_leader(signals)
    # حفظ الإشارة لاستخدامها من قبل وكيل اليوتيوب لاحقاً
    with open("streams/finance/signals/latest_trends.txt", "w", encoding="utf-8") as f:
        f.write(signals)
