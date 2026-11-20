const MAX_REQUEST_LENGTH = 9000;
const MAX_HEADLINE_LENGTH = 180;
const MAX_SUMMARY_LENGTH = 4000;

/**
 * @param {string} rawBody
 * @returns {{ok: true, headline: string, summary: string} | {ok: false, status: number, error: string}}
 */
export function validateLinkedInOptimizeRequest(rawBody) {
  if (typeof rawBody !== "string" || rawBody.length > MAX_REQUEST_LENGTH) {
    return { ok: false, status: 413, error: "Input exceeds the supported length." };
  }

  let body;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return { ok: false, status: 400, error: "Invalid JSON request." };
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, status: 400, error: "Headline and summary are required." };
  }

  if (typeof body.headline !== "string" || typeof body.summary !== "string") {
    return { ok: false, status: 400, error: "Headline and summary are required." };
  }

  const headline = body.headline.replace(/\s+/g, " ").trim();
  const summary = body.summary.replace(/\s+/g, " ").trim();

  if (!headline || !summary) {
    return { ok: false, status: 400, error: "Headline and summary cannot be empty." };
  }

  if (headline.length > MAX_HEADLINE_LENGTH || summary.length > MAX_SUMMARY_LENGTH) {
    return { ok: false, status: 413, error: "Input exceeds the supported length." };
  }

  return { ok: true, headline, summary };
}

/**
 * @param {{headline: string, summary: string}} profile
 */
export function buildLinkedInRecommendations({ headline, summary }) {
  const recommendations = [];
  if (headline.length > 120) {
    recommendations.push("اختصر العنوان ليظهر التخصص والقيمة خلال قراءة سريعة.");
  }
  if (!/\d/.test(summary)) {
    recommendations.push("أضف نتائج قابلة للقياس وأرقاماً حقيقية تدعم خبرتك.");
  }
  if (summary.split(/[.!؟]+/).filter(Boolean).length < 2) {
    recommendations.push("قسّم الملخص إلى جمل قصيرة توضّح الخبرة والنتائج والتخصص.");
  }
  if (recommendations.length === 0) {
    recommendations.push("راجع دقة المسميات والأرقام، ثم أضف الكلمات المفتاحية التي يستخدمها أصحاب العمل في مجالك.");
  }

  return {
    mode: "rule-based-preview",
    headline,
    summary,
    recommendations,
    disclaimer: "هذه مراجعة أولية بقواعد ثابتة وليست مخرجات نموذج ذكاء اصطناعي أو ضماناً للقبول الوظيفي."
  };
}
