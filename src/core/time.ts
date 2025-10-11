import { gameState, setSlipTension } from './state';
import type { GameContent } from '@content/schema';

let lastTick = performance.now();

export function resetClock() {
  lastTick = performance.now();
}

export function updateClock(content: GameContent) {
  const now = performance.now();
  const deltaSec = (now - lastTick) / 1000;
  lastTick = now;
  const slipRules = content.dreamRules.slip;
  const multiplier = content.dreamRules.slip.thinPlaceMultipliers[gameState.player.location] ?? 1;
  const tensionGain = (deltaSec / slipRules.baseIntervalSec) * 100 * multiplier;
  if (gameState.layer === 'waking') {
    setSlipTension(gameState.player.slipTension + tensionGain);
  } else if (gameState.layer === 'dream') {
    setSlipTension(gameState.player.slipTension - tensionGain * 0.75);
  }
}
