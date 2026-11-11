# Rakez Performance Command Center | مركز قيادة الأداء التسويقي

**Arabic-first bilingual prototype (العربية هي اللغة الافتراضية)**

A responsive, Arabic-first executive dashboard concept for the Senior Performance Marketing Lead role at Rakez Real Estate. The interface includes a live Arabic/English language switch and supports RTL/LTR layout.

لوحة قيادة تنفيذية متجاوبة، تبدأ باللغة العربية وتتيح التبديل الفوري إلى الإنجليزية، مع دعم اتجاه الكتابة من اليمين إلى اليسار ومن اليسار إلى اليمين.

## Features | الخصائص

- Portfolio KPIs: ad spend, leads, qualified leads, CPQL and cost per deposit.
- مؤشرات المحفظة: الإنفاق الإعلاني، العملاء المحتملون، العملاء المؤهلون، تكلفة العميل المؤهل، وتكلفة العربون.
- Project, channel and date-range filters with recalculated KPIs.
- تصفية حسب المشروع والمنصة والفترة الزمنية مع إعادة حساب المؤشرات.
- Project-level operating table with explainable Scale / Optimize / Pause decision heuristics.
- جدول أداء للمشروعات مع توصيات تشغيلية قابلة للتفسير: زيادة تدريجية / تحسين / تحسين أو إيقاف.
- Daily decision queue and budget reallocation scenario simulator.
- مركز للقرارات اليومية ومحاكي لسيناريوهات إعادة توزيع الميزانية.
- Responsive RTL/LTR interface; no paid services, external APIs, build step or third-party runtime dependencies.
- واجهة متجاوبة دون خدمات مدفوعة أو واجهات خارجية أو اعتماديات تشغيلية خارجية.

## Run locally | التشغيل

Open `index.html` in any modern browser. No build step or server is required.

افتح ملف `index.html` مباشرةً في أي متصفح حديث. لا يلزم تثبيت حزم أو تشغيل خادم.

## Data integrity | نزاهة البيانات

**All records, project names, amounts, conversion counts and trends are synthetic demonstration data. They are not Rakez data, client results, or claims about actual campaign performance.**

**جميع المشروعات والأرقام والإنفاق والعملاء والتحويلات والاتجاهات بيانات افتراضية مُنشأة لأغراض العرض فقط. لا تمثل بيانات شركة راكز، ولا نتائج حملات حقيقية، ولا ادعاءً بتحقيق نتائج فعلية.**

## Metric definitions | تعريف المؤشرات

- **CPQL** = Ad spend / Qualified leads.
- **تكلفة العميل المؤهل** = الإنفاق الإعلاني ÷ عدد العملاء المؤهلين.
- **Cost per deposit** = Ad spend / Recorded deposits.
- **تكلفة العربون** = الإنفاق الإعلاني ÷ عدد العربونات المسجلة.
- **Lead qualification rate** = Qualified leads / Total leads.
- **معدل تأهيل العملاء** = العملاء المؤهلون ÷ إجمالي العملاء المحتملين.

## Decision logic | منطق التوصيات

Illustrative thresholds only:
- Scale candidate: CPQL below SAR 360 and qualification rate above 28%.
- Optimize/Pause candidate: CPQL above SAR 520 or qualification rate below 19%.
- Otherwise: Optimize.

هذه الحدود توضيحية وليست أهدافًا معتمدة من راكز:
- مرشح للزيادة التدريجية: تكلفة العميل المؤهل أقل من 360 ريالًا، ومعدل التأهيل أعلى من 28%.
- مرشح للتحسين أو الإيقاف: تكلفة العميل المؤهل أعلى من 520 ريالًا، أو معدل التأهيل أقل من 19%.
- فيما عدا ذلك: تحسين ومتابعة.

يجب استبدال الحدود بأهداف راكز الفعلية، وقواعد الإسناد المعتمدة، ونتائج فريق المبيعات، واقتصاديات كل مشروع قبل أي استخدام تشغيلي.

## Suggested production integration | التكامل الإنتاجي المقترح

Snapchat Ads, TikTok Ads, Meta Ads, Google Ads, GA4/GTM, CRM and deposit/revenue events through documented APIs or approved exports.

يمكن ربط المنصات الإعلانية Snapchat وTikTok وMeta وGoogle مع GA4/GTM ونظام إدارة علاقات العملاء CRM وأحداث العربون والإيرادات، عبر واجهات موثقة أو ملفات تصدير معتمدة.

Production use requires reconciliation of platform spend, CRM lead identity, sales qualification, deposits, refunds/cancellations and attribution windows before automated decisions.

يتطلب التشغيل الفعلي مطابقة الإنفاق مع بيانات العملاء في CRM، والتحقق من التأهيل بواسطة المبيعات، وربط العربونات والإلغاءات والاستردادات ونوافذ الإسناد قبل أتمتة أي قرار.
