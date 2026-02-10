class MCPBus:
    def __init__(self): self.queue = []
    def send(self, s, r, p): self.queue.append({'from':s, 'to':r, 'payload':p})