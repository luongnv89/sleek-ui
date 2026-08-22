import { loadDesigns } from '@/data/designs';
import { buildAgentPrompt } from '@/lib/agentPrompt';

export async function getRandomPrompt(rng: () => number = Math.random): Promise<string> {
  const designs = await loadDesigns();
  if (designs.length === 0) return buildAgentPrompt('');
  const pick = designs[Math.floor(rng() * designs.length)];
  return buildAgentPrompt(pick.jsonUrl);
}
