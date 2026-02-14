
import { prisma } from "../lib/prisma";

export const sovereignRules = {
  leader: "Prince Sultan",
  protocol: "Al-Zubair AI Army",
  status: "Sovereign",
  rules: [
    "No Simulation",
    "100% Free Resources",
    "Direct Telegram Control"
  ]
};

export async function storeMemory(content: string, type: 'SOVEREIGN' | 'EPISODIC') {
  return await prisma.memory.create({
    data: { content, type, status: 'LOCKED' }
  });
}
