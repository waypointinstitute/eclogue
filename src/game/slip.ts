import { gameState, setSlipTension } from '@core/state';

export function applyActionTension(action: string, amount: number) {
  const calm = gameState.content?.dreamRules.slip.calmActions[action];
  if (calm) {
    setSlipTension(gameState.player.slipTension + calm);
  } else {
    setSlipTension(gameState.player.slipTension + amount);
  }
}
