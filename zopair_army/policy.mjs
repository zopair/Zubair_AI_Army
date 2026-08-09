const DEFAULT_ALLOWED_RISK = new Set(['low', 'medium']);

export class SkillPolicy {
  constructor({ allowedRiskClasses = DEFAULT_ALLOWED_RISK, approvedSkills = [] } = {}) {
    this.allowedRiskClasses = new Set(allowedRiskClasses);
    this.approvedSkills = new Set(approvedSkills);
  }

  canActivate(skill, { approval = false } = {}) {
    if (!skill?.id) return { allowed: false, reason: 'missing-skill-id' };
    if (!this.allowedRiskClasses.has(skill.riskClass)) {
      if (approval && this.approvedSkills.has(skill.id)) {
        return { allowed: true, reason: 'explicit-approval' };
      }
      return { allowed: false, reason: `risk-class-blocked:${skill.riskClass}` };
    }
    return { allowed: true, reason: 'policy-allow' };
  }
}

export const DEFAULT_SKILL_POLICY = new SkillPolicy();
