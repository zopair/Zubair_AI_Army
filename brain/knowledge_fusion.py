from brain.state_manager import load_state, save_state
class KnowledgeFusion:
    def merge(self, messages):
        memory = load_state('state/swarm_memory.json')
        for msg in messages: memory.setdefault('knowledge', []).append(msg)
        save_state('state/swarm_memory.json', memory); return memory