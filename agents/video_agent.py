
import os
from moviepy.editor import TextClip, AudioFileClip, ColorClip, CompositeVideoClip

def create_final_video():
    # 1. إعداد المسارات
    audio_path = "streams/youtube/assets/latest_audio.mp3"
    output_path = "streams/youtube/assets/final_short.mp4"
    
    if not os.path.exists(audio_path):
        print("❌ لا يوجد ملف صوتي للبدء!")
        return

    # 2. تحميل الصوت وتحديد مدة الفيديو بناءً عليه
    audio = AudioFileClip(audio_path)
    duration = audio.duration

    # 3. إنشاء خلفية ملونة (مؤقتاً حتى نربط Pexels API)
    # سنستخدم اللون الذهبي بما أننا نتحدث عن شركة الزبير للاستثمار
    background = ColorClip(size=(1080, 1920), color=(184, 134, 11), duration=duration)

    # 4. إضافة النص (Subtitles) - محرك بسيط
    txt_clip = TextClip("Zubair AI Army\nGold Insights 2026", fontsize=70, color='white', font='Arial-Bold')
    txt_clip = txt_clip.set_pos('center').set_duration(duration)

    # 5. دمج كل العناصر
    video = CompositeVideoClip([background, txt_clip])
    video = video.set_audio(audio)

    # 6. التصدير النهائي (Vertical 9:16 for Shorts)
    video.write_videofile(output_path, fps=24, codec="libx264", audio_codec="aac")
    print(f"✅ تم إنتاج الفيديو النهائي بنجاح: {output_path}")

if __name__ == "__main__":
    create_final_video()
