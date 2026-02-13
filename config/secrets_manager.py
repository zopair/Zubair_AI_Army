
import os

class SecretsManager:
    @staticmethod
    def get(key_name):
        # الأولوية لمتغيرات بيئة جيت هاب أو كولاب
        val = os.getenv(key_name)
        if val: return val
        
        # البحث في ملفات الإعدادات المحلية (لو وجدت)
        return None

    @property
    def telegram_token(self): return self.get("TELEGRAM_BOT_TOKEN")
    
    @property
    def gemini_key(self): return self.get("GOOGLE_API_KEY")
