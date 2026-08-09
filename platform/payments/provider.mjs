export class PaymentProvider {
  async createCheckout(_order) { throw new Error('not implemented'); }
  async getStatus(_orderId) { throw new Error('not implemented'); }
  async reconcile(_orderId) { throw new Error('not implemented'); }
}

export function validatePaymentConfig(config) {
  if (!config || config.enabled !== false && config.provider !== 'binance_pay') {
    throw new Error('unsupported payment configuration');
  }
  return { enabled: config.enabled === true, provider: config.provider };
}
