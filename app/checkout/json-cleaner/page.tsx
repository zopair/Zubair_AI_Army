'use client';

import { FormEvent, useState } from 'react';

export default function CheckoutPage() {
  const [customerId, setCustomerId] = useState('');
  const [intent, setIntent] = useState<{ id: string; amount: number; merchantUid: string } | null>(null);
  const [error, setError] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    const res = await fetch('/api/v1/checkout', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ productId: 'json-cleaner', customerId, amount: 0.25 }) });
    const data = await res.json();
    if (!res.ok) return setError(data.error ?? 'Unable to create payment intent');
    setIntent(data);
  }

  return <main style={{ maxWidth: 720, margin: '0 auto', padding: 48 }}>
    <h1>JSON Cleaner API — Beta Access</h1>
    <p>One-time activation payment: <strong>$0.25</strong>. Usage is then metered at $0.01/request.</p>
    <p>Pay via Binance Pay to Merchant UID <strong>717654739</strong>. This is receive-only.</p>
    {!intent ? <form onSubmit={submit}>
      <label>Customer ID<br /><input required value={customerId} onChange={e => setCustomerId(e.target.value)} style={{ padding: 10, width: '100%', margin: '8px 0 16px' }} /></label>
      <button type="submit" style={{ padding: '12px 18px' }}>Create payment order</button>
      {error && <p role="alert">{error}</p>}
    </form> : <section>
      <p>Order: <code>{intent.id}</code></p>
      <p>Amount: <strong>${intent.amount.toFixed(2)}</strong></p>
      <p>After payment, keep the Binance Pay transaction/reference ID. Access is activated only after payment is verified and recorded in the Revenue Ledger.</p>
    </section>}
  </main>;
}
