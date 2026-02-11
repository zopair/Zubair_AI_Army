from brain.state_manager import load_state, save_state
class ReputationEngine:
    def update(self, agent_id, score):
        data = load_state('state/swarm_reputation.json')
        rep = data.get('rep', {}); rep[agent_id] = rep.get(agent_id, 0) + score
        save_state('state/swarm_reputation.json', {'rep': rep})