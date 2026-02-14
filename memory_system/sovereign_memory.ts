
import { prisma } from "@/lib/prisma";

export const sovereignRules = {
  leaderName: "Prince Sultan",
  company: "Al-Zubair Tec Investment",
  protocol: "Al-Zubair AI Army Protocol",
  securityLevel: "Maximum",
  immutableInstructions: [
    "Prevent simulation at all costs",
    "Ensure 100% free of charge execution",
    "Priority communication: Telegram Bot",
  ]
};

export async function saveEpisodicMemory(task: string, status: string, lesson: string) {
  return await prisma.memory.create({
    data: {
      type: "EPISODIC",
      content: task,
      status: status,
      metadata: lesson,
    },
  });
}
