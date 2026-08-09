export const DEFAULT_REVENUE_POLICY = Object.freeze({
  lanes: ['paid-api', 'micro-saas', 'digital-assets', 'bounties'],
  maxSingleExpense: 10,
  maxDailyOperatingExpense: 50,
  allowedExpenseTypes: ['api', 'compute', 'storage', 'domain'],
  requirePositiveContributionForScale: true,
  investmentEnabled: false,
});

export class RevenuePolicy {
  constructor(policy = DEFAULT_REVENUE_POLICY) {
    this.policy = Object.freeze({ ...DEFAULT_REVENUE_POLICY, ...policy });
    this.dailySpend = 0;
  }

  approveExpense({ amount, type }) {
    if (!Number.isFinite(amount) || amount < 0) return { approved: false, reason: 'invalid_amount' };
    if (!this.policy.allowedExpenseTypes.includes(type)) return { approved: false, reason: 'expense_type_not_allowed' };
    if (amount > this.policy.maxSingleExpense) return { approved: false, reason: 'single_expense_limit' };
    if (this.dailySpend + amount > this.policy.maxDailyOperatingExpense) return { approved: false, reason: 'daily_expense_limit' };
    this.dailySpend += amount;
    return { approved: true, remainingDailyBudget: this.policy.maxDailyOperatingExpense - this.dailySpend };
  }

  canScale({ revenue, variableCost, quality, securityHealthy }) {
    const contribution = Number(revenue) - Number(variableCost);
    return {
      approved: Boolean(securityHealthy && quality >= 0.9 && (!this.policy.requirePositiveContributionForScale || contribution > 0)),
      contribution,
    };
  }
}
