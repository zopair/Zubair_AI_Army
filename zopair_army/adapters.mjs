export class ExecutionAdapter {
  constructor(name) {
    if (!name) throw new Error('Adapter name is required');
    this.name = name;
  }

  async execute() {
    throw new Error(`${this.name} adapter must implement execute()`);
  }
}

export class DeterministicAdapter extends ExecutionAdapter {
  constructor() {
    super('deterministic');
  }

  async execute(agent, task) {
    return {
      output: `${agent.role} completed ${task.id}`,
      adapter: this.name,
    };
  }
}

// Future adapters deliberately remain dependency-free. External frameworks
// (LangGraph, AutoGen, CrewAI, MCP, browser runners, cloud sandboxes) should
// implement this interface instead of becoming hard dependencies of the core.
