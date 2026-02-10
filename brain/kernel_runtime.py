import time
import json
from brain.state_manager import load_state, save_state
class KernelRuntime:
    def __init__(self): self.state = load_state('state/system.json')
    def heartbeat(self): self.state['last_heartbeat'] = time.time(); save_state('state/system.json', self.state)