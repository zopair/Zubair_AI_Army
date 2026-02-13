
import os
import google.generativeai as genai

def generate_video_script():
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    # دمج رؤية الذهب مع صناعة المحتوى
    prompt = "بصفتك خبير استثمار في شركة الزبير، اكتب سيناريو فيديو قصير (YouTube Short) جذاب جداً عن توقعات الذهب لعام 2026 بناءً على تحليلات اليوم. السيناريو يجب أن يتضمن: مقدمة قوية، معلومة صادمة، ونصيحة استثمارية."
    
    response = model.generate_content(prompt)
    return response.text

if __name__ == "__main__":
    script = generate_video_script()
    # حفظ السيناريو في المجلد المخصص
    with open("streams/youtube/scripts/latest_script.txt", "w", encoding="utf-8") as f:
        f.write(script)
    print("✅ تم توليد السيناريو بنجاح وجاهز للتحويل إلى صوت وفيديو.")
