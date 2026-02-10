class BaseAgent:
    def __init__(self, id, cap): self.id=id; self.cap=cap
    def execute(self, task): return f'Executed {task}'