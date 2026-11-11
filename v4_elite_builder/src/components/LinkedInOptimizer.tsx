"use client";

import { FormEvent, useState } from "react";

type Result = {
  mode: string;
  headline: string;
  summary: string;
  recommendations: string[];
  disclaimer: string;
};

export function LinkedInOptimizer() {
  const [headline, setHeadline] = useState("");
  const [summary, setSummary] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch("/api/linkedin-optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ headline, summary })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "تعذر تنفيذ المراجعة.");
      setResult(data as Result);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "حدث خطأ غير متوقع.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <label className="field">
        <span>العنوان المهني</span>
        <input maxLength={180} required value={headline} onChange={(event) => setHeadline(event.target.value)} placeholder="مثال: مهندس برمجيات متخصص في..." />
      </label>
      <label className="field">
        <span>الملخص المهني</span>
        <textarea maxLength={4000} required value={summary} onChange={(event) => setSummary(event.target.value)} placeholder="اكتب ملخص خبرتك وإنجازاتك..." />
      </label>
      <button className="primary" type="submit" disabled={loading}>{loading ? "جارٍ التحليل..." : "مراجعة الملف"}</button>
      {error && <p role="alert">{error}</p>}
      {result && (
        <section aria-live="polite" className="panel" style={{ marginTop: 16 }}>
          <strong>نتيجة المراجعة الأولية</strong>
          <p className="result">{result.headline}</p>
          <ul>{result.recommendations.map((item) => <li key={item}>{item}</li>)}</ul>
          <small>{result.disclaimer}</small>
        </section>
      )}
    </form>
  );
}
