import { NextResponse } from "next/server";

type OptimizeRequest = {
  headline?: unknown;
  summary?: unknown;
};

export async function POST(request: Request) {
  let body: OptimizeRequest;
  try {
    body = (await request.json()) as OptimizeRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON request." }, { status: 400 });
  }

  if (typeof body.headline !== "string" || typeof body.summary !== "string") {
    return NextResponse.json({ error: "Headline and summary are required." }, { status: 400 });
  }

  const headline = body.headline.replace(/\s+/g, " ").trim();
  const summary = body.summary.replace(/\s+/g, " ").trim();

  if (!headline || !summary) {
    return NextResponse.json({ error: "Headline and summary cannot be empty." }, { status: 400 });
  }
  if (headline.length > 180 || summary.length > 4000) {
    return NextResponse.json({ error: "Input exceeds the supported length." }, { status: 413 });
  }

  const recommendations: string[] = [];
  if (headline.length > 120) recommendations.push("اختصر العنوان ليظهر التخصص والقيمة خلال قراءة سريعة.");
  if (!/\d/.test(summary)) recommendations.push("أضف نتائج قابلة للقياس وأرقاماً حقيقية تدعم خبرتك.");
  if (summary.split(/[.!؟]+/).filter(Boolean).length < 2) recommendations.push("قسّم الملخص إلى جمل قصيرة توضّح الخبرة والنتائج والتخصص.");
  if (recommendations.length === 0) recommendations.push("راجع دقة المسميات والأرقام، ثم أضف الكلمات المفتاحية التي يستخدمها أصحاب العمل في مجالك.");

  return NextResponse.json({
    mode: "rule-based-preview",
    headline,
    summary,
    recommendations,
    disclaimer: "هذه مراجعة أولية بقواعد ثابتة وليست مخرجات نموذج ذكاء اصطناعي أو ضماناً للقبول الوظيفي."
  });
}
