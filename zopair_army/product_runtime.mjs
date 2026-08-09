import { randomUUID } from 'node:crypto';

export class ProductRuntime {
  constructor({ router, executor, judge, audit = () => {} }) {
    this.router = router;
    this.executor = executor;
    this.judge = judge;
    this.audit = audit;
  }

  async run(task, context = {}) {
    const runId = randomUUID();
    const started = Date.now();
    const event = (type, data = {}) => this.audit({ runId, type, at: new Date().toISOString(), ...data });

    event('task.received', { task });
    const assignment = await this.router(task, context);
    event('agent.selected', { agentId: assignment.agentId, skillId: assignment.skillId });

    let result;
    try {
      result = await this.executor(assignment, task, context);
      event('execution.completed');
    } catch (error) {
      event('execution.failed', { error: String(error?.message ?? error) });
      return { runId, status: 'failed', error: String(error?.message ?? error), durationMs: Date.now() - started };
    }

    const verdict = await this.judge({ task, assignment, result, context });
    event('judged', { success: verdict.success, score: verdict.score });

    return {
      runId,
      status: verdict.success ? 'completed' : 'rejected',
      agentId: assignment.agentId,
      skillId: assignment.skillId,
      result,
      verdict,
      durationMs: Date.now() - started,
    };
  }
}
