
import os
from PIL import Image, ImageDraw, ImageFont
import google.generativeai as genai

def generate_seo_metadata():
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    prompt = "أعطني عنواناً مثيراً للنقر (Clickbait) ووصفاً قصيراً و5 وسمات (tags) لفيديو يوتيوب قصير عن 'تريند الذهب اليوم'. اجعلها قوية ومناسبة لشركة الزبير للاستثمار."
    response = model.generate_content(prompt)
    
    with open("streams/youtube/assets/metadata.txt", "w", encoding="utf-8") as f:
        f.write(response.text)
    return "✅ تم تجهيز بيانات الـ SEO."

def create_thumbnail():
    # إنشاء صورة بخلفية ذهبية فاخرة (1280x720)
    img = Image.new('RGB', (1280, 720), color=(184, 134, 11))
    draw = ImageDraw.Draw(img)
    
    # إضافة لمسة جمالية (إطار أسود داخلي)
    draw.rectangle([20, 20, 1260, 700], outline="black", width=10)
    
    # ملاحظة: في بيئة جيت هاب سنستخدم الخط الافتراضي لعدم ضمان وجود خطوط عربية
    text = "Zopair Gold Report 2026"
    draw.text((300, 300), text, fill="white")
    
    img.save("streams/youtube/assets/thumbnail.jpg")
    return "✅ تم تصميم الصورة المصغرة."

if __name__ == "__main__":
    print(generate_seo_metadata())
    print(create_thumbnail())
