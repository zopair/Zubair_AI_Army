export function PaymentSystem() {
  return (
    <div>
      <p>الدفع الإلكتروني غير مفعّل في هذه النسخة. لن يتم تحصيل أي أموال أو إرسال معاملات.</p>
      <div className="notice" role="note">وضع تجريبي فقط — سيتم فتح الدفع بعد إثبات الطلب والإيرادات واعتماد مزود مناسب.</div>
      <button className="primary" type="button" disabled aria-disabled="true" style={{ marginTop: 14 }}>
        الدفع غير متاح حالياً
      </button>
    </div>
  );
}
