import { gameState, moveToLocation } from '@core/state';

export function setupInput() {
  window.addEventListener('keydown', (event) => {
    if (!gameState.content) return;
    const current = gameState.player.location;
    const neighbors = gameState.content.locations.locations.find((loc) => loc.id === current)?.neighbors ?? [];
    if (event.key === 'ArrowRight' || event.key === 'd') {
      const next = neighbors[0];
      if (next) moveToLocation(next);
    }
    if (event.key === 'ArrowLeft' || event.key === 'a') {
      const prev = neighbors[neighbors.length - 1];
      if (prev) moveToLocation(prev);
    }
  });
}
