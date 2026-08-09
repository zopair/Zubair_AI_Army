const clamp = (n, min = 0, max = 1) => Math.max(min, Math.min(max, n));

export class ProductMetrics {
  constructor() { this.runs = []; }

  record(event) {
    this.runs.push({
      runId: event.runId,
      status: event.status,
      latencyMs: Number(event.latencyMs ?? 0),
      cost: Number(event.cost ?? 0),
      quality: clamp(Number(event.quality ?? (event.status === 'completed' ? 1 : 0))),
      timestamp: event.timestamp ?? new Date().toISOString(),
    });
  }

  summary() {
    const total = this.runs.length;
    const completed = this.runs.filter(r => r.status === 'completed').length;
    const failed = this.runs.filter(r => r.status === 'failed').length;
    const rejected = this.runs.filter(r => r.status === 'rejected').length;
    const latency = total ? this.runs.reduce((s, r) => s + r.latencyMs, 0) / total : 0;
    const cost = this.runs.reduce((s, r) => s + r.cost, 0);
    const quality = total ? this.runs.reduce((s, r) => s + r.quality, 0) / total : 0;
    return {
      total,
      completed,
      failed,
      rejected,
      successRate: total ? completed / total : 0,
      averageLatencyMs: latency,
      totalCost: cost,
      averageQuality: quality,
      healthScore: clamp(0.5 * (total ? completed / total : 0) + 0.3 * quality + 0.2 * (1 / (1 + latency / 1000))),
    };
  }
}
