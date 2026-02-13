
import os
import asyncio
import edge_tts

# الأصوات المختارة: ar-EG-ShakirNeural (صوت وقور) أو ar-EG-SalmaNeural
VOICE = "ar-EG-ShakirNeural"
OUTPUT_FILE = "streams/youtube/assets/latest_audio.mp3"

async def generate_audio():
    # 1. قراءة آخر سيناريو تم توليده
    script_path = "streams/youtube/scripts/latest_script.txt"
    if not os.path.exists(script_path):
        text = "مرحباً بكم في شركة الزبير للاستثمار. لا يوجد سيناريو متاح حالياً."
    else:
        with open(script_path, "r", encoding="utf-8") as f:
            text = f.read()

    # 2. تحويل النص إلى صوت
    communicate = edge_tts.Communicate(text, VOICE)
    await communicate.save(OUTPUT_FILE)
    print(f"✅ تم توليد الملف الصوتي بنجاح: {OUTPUT_FILE}")

if __name__ == "__main__":
    asyncio.run(generate_audio())
