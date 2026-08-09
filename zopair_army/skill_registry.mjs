const normalize = (value) => String(value ?? '').trim().toLowerCase();

export class SkillRegistry {
  constructor(skills = []) {
    this.skills = new Map();
    for (const skill of skills) this.register(skill);
  }

  register(skill) {
    if (!skill?.id) throw new Error('Skill id is required');
    if (!Array.isArray(skill.capabilities) || skill.capabilities.length === 0) {
      throw new Error(`Skill ${skill.id} must declare capabilities`);
    }
    if (!skill.permissions) skill.permissions = [];
    this.skills.set(skill.id, { ...skill, capabilities: skill.capabilities.map(normalize) });
    return this.skills.get(skill.id);
  }

  get(id) {
    return this.skills.get(id);
  }

  findForTask(task) {
    const requested = new Set((task.capabilities ?? []).map(normalize));
    const requiredPermissions = new Set(task.requiredPermissions ?? []);

    return [...this.skills.values()]
      .map(skill => {
        const matched = skill.capabilities.filter(capability => requested.has(capability)).length;
        const permissionOk = [...requiredPermissions].every(permission => skill.permissions.includes(permission));
        const fit = requested.size ? matched / requested.size : 0;
        return { skill, fit, permissionOk };
      })
      .filter(item => item.permissionOk && item.fit > 0)
      .sort((a, b) => b.fit - a.fit);
  }
}

export const DEFAULT_SKILLS = [
  {
    id: 'research-discovery',
    name: 'Research & Discovery',
    capabilities: ['research', 'discovery', 'api-discovery'],
    permissions: ['read:web', 'read:repo'],
    riskClass: 'low',
  },
  {
    id: 'software-build',
    name: 'Software Build & Test',
    capabilities: ['coding', 'implementation', 'testing'],
    permissions: ['read:repo', 'write:workspace', 'execute:test'],
    riskClass: 'medium',
  },
  {
    id: 'browser-automation',
    name: 'Browser & API Operations',
    capabilities: ['browser', 'api', 'automation'],
    permissions: ['read:web', 'network:outbound'],
    riskClass: 'high',
  },
  {
    id: 'security-review',
    name: 'Security & Policy Review',
    capabilities: ['security', 'policy', 'audit'],
    permissions: ['read:repo', 'read:policy'],
    riskClass: 'low',
  },
];
