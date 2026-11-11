import { LinkedInOptimizer } from "@/components/LinkedInOptimizer";
import { PaymentSystem } from "@/components/PaymentSystem";
import { opportunities } from "@/lib/opportunities";

export default function Home() {
  return (
    <>
      <header>
        <div className="shell"><span className="brand">ZUBAIR / ELITE BUILDER</span></div>
      </header>
      <main className="shell">
        <section className="hero">
          <span className="eyebrow">مساحة العمل المهنية</span>
          <h1>حوّل خبرتك إلى حضور مهني واضح.</h1>
          <p>أدوات أولية لتحسين العنوان والملخص المهني، وتجهيز الخدمات الرقمية. تعمل المراجعة الحالية محلياً بقواعد واضحة، ولا تدّعي استخدام نموذج ذكاء اصطناعي خارجي.</p>
        </section>
        <section className="grid" aria-label="الأدوات المتاحة">
          <article className="panel">
            <h2>مراجع الملف المهني</h2>
            <p>أدخل عنوانك وملخصك للحصول على مراجعة أولية واقتراحات قابلة للتعديل.</p>
            <LinkedInOptimizer />
          </article>
          <article className="panel">
            <h2>مسارات الخدمات</h2>
            <ul>
              {opportunities.map((item) => (
                <li key={item.id} style={{ marginBottom: 14 }}>
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                </li>
              ))}
            </ul>
          </article>
          <article className="panel">
            <h2>حالة الدفع</h2>
            <PaymentSystem />
          </article>
        </section>
      </main>
      <footer><div className="shell">نسخة تشغيل أولية — لا توجد معالجة دفع أو تكاملات خارجية مفعّلة.</div></footer>
    </>
  );
}
