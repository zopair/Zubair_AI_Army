export type Opportunity = {
  id: string;
  title: string;
  description: string;
  status: "preview";
};

export const opportunities: Opportunity[] = [
  {
    id: "profile-review",
    title: "تحسين الملف المهني",
    description: "مراجعة العنوان والملخص والخبرات قبل التقديم على الوظائف.",
    status: "preview"
  },
  {
    id: "cv-structure",
    title: "تنظيم السيرة الذاتية",
    description: "هيكلة الخبرات والإنجازات في صيغة واضحة قابلة للتخصيص.",
    status: "preview"
  },
  {
    id: "application-readiness",
    title: "جاهزية التقديم",
    description: "قائمة تحقق لمطابقة المهارات والمتطلبات قبل إرسال الطلب.",
    status: "preview"
  }
];
