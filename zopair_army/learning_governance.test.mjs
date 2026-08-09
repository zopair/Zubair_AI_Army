import assert from 'node:assert/strict';
import { MasteryGate, SpacedRepetition, DEFAULT_RED_TEAM_LESSONS, promote } from './learning_governance.mjs';
import { AgentLearningMemory } from './learning_system.mjs';

const memory = new AgentLearningMemory();
const agent = { id: 'guardian-01' };
const lesson = { id: 'verify' };

memory.record({ agentId: agent.id, lessonId: lesson.id, success: true, score: 1, latencyMs: 10 });
memory.record({ agentId: agent.id, lessonId: lesson.id, success: true, score: 1, latencyMs: 10 });
memory.record({ agentId: agent.id, lessonId: lesson.id, success: true, score: 1, latencyMs: 10 });

const gate = new MasteryGate({ threshold: 0.8, minAttempts: 3 });
assert.equal(promote(agent, lesson, memory, gate).promoted, true);

const scheduler = new SpacedRepetition({ halfLifeDays: 10 });
const now = Date.now();
assert.equal(scheduler.needsReview({ lastSeenAt: now - 100 * 86400000 }, now), true);
assert.equal(scheduler.needsReview({ lastSeenAt: now }, now), false);
assert.equal(DEFAULT_RED_TEAM_LESSONS.length >= 4, true);

console.log('learning governance checks passed');
