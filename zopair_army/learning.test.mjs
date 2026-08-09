import assert from 'node:assert/strict';
import { Curriculum, AgentLearningMemory, AgentTeacher, DEFAULT_CURRICULUM } from './learning_system.mjs';

const curriculum = new Curriculum(DEFAULT_CURRICULUM);
const memory = new AgentLearningMemory();
const agent = { id: 'builder-01', capabilities: ['coding', 'testing', 'automation'] };

assert.equal(curriculum.nextFor(agent, { completed: [] }).id, 'observe');
assert.equal(curriculum.nextFor(agent, { completed: ['observe'] }).id, 'tool-selection');
assert.equal(curriculum.nextFor(agent, { completed: ['observe', 'tool-selection'] }).id, 'verify');

memory.record({ agentId: agent.id, lessonId: 'verify', success: true, score: 1, latencyMs: 100 });
memory.record({ agentId: agent.id, lessonId: 'verify', success: false, score: 0.2, latencyMs: 300 });
assert(memory.mastery(agent.id, 'verify') > 0);

const teacher = new AgentTeacher({
  curriculum,
  memory,
  evaluator: async (_agent, _lesson, result) => ({
    success: result.answer === 42,
    score: result.answer === 42 ? 1 : 0,
    feedback: result.answer === 42 ? 'verified' : 'incorrect',
  }),
});

const outcome = await teacher.train(agent, curriculum.nextFor(agent, { completed: ['observe', 'tool-selection'] }), async () => ({ answer: 42 }));
assert.equal(outcome.success, true);
assert.equal(memory.mastery(agent.id, 'verify') > 0, true);

console.log('learning curriculum checks passed');
