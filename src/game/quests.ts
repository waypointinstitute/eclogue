import { gameState, queueSpawn } from '@core/state';

export function evaluateQuestTriggers() {
  const fragments = gameState.content?.quests.fragments ?? [];
  const current = gameState.player.location;
  for (const fragment of fragments) {
    if (fragment.conditions.location === current) {
      if (fragment.effects.queueSpawn) {
        queueSpawn(fragment.effects.queueSpawn);
      }
    }
  }
}
