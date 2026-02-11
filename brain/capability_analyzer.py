from brain.state_manager import load_state
class CapabilityAnalyzer:
    def analyze(self):
        tasks = load_state('state/tasks.json').get('tasks', [])
        return [str(t).split()[0] for t in tasks]