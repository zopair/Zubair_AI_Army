
import { prisma } from "../lib/prisma";

export const sovereignRules = {
  leader: "Prince Sultan",
  company: "Al-Zubair Tec Investment",
  protocol: "Al-Zubair AI Army Protocol",
  security: "Maximum Sovereign Control",
  immutableRules: [
    "No Simulation Mode",
    "100% Free Resource Usage",
    "Telegram Bot Priority",
    "Prince Sultan is the Absolute Commander"
  ]
};

export async function logMemory(content: string, type: 'SOVEREIGN' | 'EPISODIC') {
  return await prisma.memory.create({
    data: { content, type, status: 'ENCRYPTED' }
  });
}
