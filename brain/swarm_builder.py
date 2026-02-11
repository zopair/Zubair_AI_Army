from brain.capability_analyzer import CapabilityAnalyzer
from brain.agent_generator import AgentGenerator
class SwarmBuilder:
    def run(self):
        analyzer = CapabilityAnalyzer(); generator = AgentGenerator()
        caps = analyzer.analyze()
        return [generator.build_agent(cap) for cap in caps]