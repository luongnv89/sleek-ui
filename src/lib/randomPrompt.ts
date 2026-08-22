import designs from '@/data/designs';
import { buildAgentPrompt } from '@/lib/agentPrompt';

export function getRandomPrompt(rng: () => number = Math.random) {
  const pick = designs[Math.floor(rng() * designs.length)];
  return buildAgentPrompt(pick.jsonUrl);
}
