
import os
import requests

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
CHAT_ID = "257288843"

def main():
    if BOT_TOKEN:
        requests.post(f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage", 
                     json={"chat_id": CHAT_ID, "text": "🛡️ النظام الموحد لشركة الزبير جاهز ونظيف تماماً الآن."})

if __name__ == "__main__":
    main()
