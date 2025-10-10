import { gameState } from '@core/state';

export function pickNpcForLayer(layer: 'waking' | 'dream') {
  return (gameState.content?.characters ?? []).filter((c) => c.layer === layer);
}
