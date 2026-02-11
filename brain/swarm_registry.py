from brain.state_manager import load_state, save_state
class SwarmRegistry:
    def register(self, agent_id, cap):
        data = load_state('state/swarm_agents.json')
        agents = data.get('agents', []); agents.append({'id': agent_id, 'capability': cap})
        save_state('state/swarm_agents.json', {'agents': agents})