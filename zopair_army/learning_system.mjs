export const OUTCOME_LABELS = Object.freeze({
  success: 1,
  failure: 0,
});

const clamp = (n, min = 0, max = 1) => Math.max(min, Math.min(max, n));

export class Curriculum {
  constructor(lessons = []) {
    this.lessons = new Map(lessons.map(lesson => [lesson.id, { ...lesson }]));
  }

  add(lesson) {
    if (!lesson?.id) throw new Error('Lesson id is required');
    this.lessons.set(lesson.id, { ...lesson });
  }

  nextFor(agent, state = {}) {
    return [...this.lessons.values()]
      .filter(lesson => !(state.completed ?? []).includes(lesson.id))
      .filter(lesson => !lesson.prerequisites?.some(p => !(state.completed ?? []).includes(p)))
      .filter(lesson => !lesson.requiredCapabilities?.length || lesson.requiredCapabilities.some(c => agent.capabilities?.includes(c)))
      .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))[0] ?? null;
  }
}

export class AgentLearningMemory {
  constructor() {
    this.records = new Map();
  }

  key(agentId, lessonId) {
    return `${agentId}:${lessonId}`;
  }

  record({ agentId, lessonId, success, score = success ? 1 : 0, latencyMs = 0, notes = '' }) {
    const key = this.key(agentId, lessonId);
    const old = this.records.get(key) ?? { attempts: 0, successes: 0, averageScore: 0, averageLatencyMs: 0, notes: [] };
    const attempts = old.attempts + 1;
    this.records.set(key, {
      attempts,
      successes: old.successes + (success ? 1 : 0),
      averageScore: ((old.averageScore * old.attempts) + clamp(score)) / attempts,
      averageLatencyMs: ((old.averageLatencyMs * old.attempts) + latencyMs) / attempts,
      notes: notes ? [...old.notes, notes].slice(-10) : old.notes,
    });
  }

  mastery(agentId, lessonId) {
    const record = this.records.get(this.key(agentId, lessonId));
    if (!record) return 0;
    const confidence = 1 - Math.exp(-record.attempts / 5);
    const successRate = record.successes / Math.max(1, record.attempts);
    return clamp((0.7 * record.averageScore + 0.3 * successRate) * confidence);
  }

  export() {
    return Object.fromEntries(this.records.entries());
  }
}

export class AgentTeacher {
  constructor({ curriculum, memory = new AgentLearningMemory(), evaluator, maxRetries = 2 } = {}) {
    if (!curriculum) throw new Error('Curriculum is required');
    if (!evaluator) throw new Error('Independent evaluator is required');
    this.curriculum = curriculum;
    this.memory = memory;
    this.evaluator = evaluator;
    this.maxRetries = Math.max(1, maxRetries);
  }

  async train(agent, lesson, execute) {
    let last = null;
    for (let attempt = 1; attempt <= this.maxRetries; attempt += 1) {
      const started = Date.now();
      let result;
      try {
        result = await execute(agent, lesson);
      } catch (error) {
        last = { success: false, score: 0, feedback: String(error?.message ?? error) };
      }
      if (result) {
        const verdict = await this.evaluator(agent, lesson, result);
        last = { ...verdict, latencyMs: Date.now() - started };
      }
      this.memory.record({
        agentId: agent.id,
        lessonId: lesson.id,
        success: Boolean(last?.success),
        score: last?.score ?? 0,
        latencyMs: last?.latencyMs ?? Date.now() - started,
        notes: last?.feedback ?? '',
      });
      if (last?.success) return { ...last, attempt };
    }
    return { ...last, attempt: this.maxRetries };
  }

  async trainNext(agent, state, execute) {
    const lesson = this.curriculum.nextFor(agent, state);
    if (!lesson) return { completed: true, lesson: null };
    const result = await this.train(agent, lesson, execute);
    return { completed: false, lesson, result, mastery: this.memory.mastery(agent.id, lesson.id) };
  }
}

export const DEFAULT_CURRICULUM = [
  { id: 'observe', title: 'Observe before acting', priority: 10, requiredCapabilities: ['research'], objective: 'Identify task constraints and required evidence before execution.' },
  { id: 'tool-selection', title: 'Select the minimum sufficient tool', priority: 20, requiredCapabilities: ['research', 'api', 'coding'], prerequisites: ['observe'], objective: 'Choose the least privileged capable tool.' },
  { id: 'verify', title: 'Verify independently', priority: 30, requiredCapabilities: ['testing', 'security'], prerequisites: ['observe'], objective: 'Check outputs against an independent criterion.' },
  { id: 'recover', title: 'Recover from failure', priority: 40, requiredCapabilities: ['coding', 'automation'], prerequisites: ['verify'], objective: 'Diagnose failure and retry with a bounded alternative.' },
  { id: 'optimize', title: 'Optimize after correctness', priority: 50, requiredCapabilities: ['coding', 'api', 'automation'], prerequisites: ['recover'], objective: 'Reduce cost or latency without reducing verified quality.' },
];
