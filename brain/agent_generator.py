import os
from tools.gemini_client import GeminiClient
from brain.swarm_registry import SwarmRegistry
class AgentGenerator:
    def __init__(self):
        self.gemini = GeminiClient(); self.registry = SwarmRegistry()
    def build_agent(self, cap):
        code = f'class {cap.capitalize()}Agent: pass'
        path = f'agents/generated/{cap}_agent.py'
        with open(path, 'w') as f: f.write(code)
        self.registry.register(f'{cap}_agent', cap)
        return path