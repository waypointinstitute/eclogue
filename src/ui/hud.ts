import { gameState } from '@core/state';

let hudEl: HTMLElement | null = null;

export function createHud(root: HTMLElement) {
  hudEl = document.createElement('div');
  hudEl.className = 'overlay-panel';
  root.appendChild(hudEl);
  renderHud();
  gameState.subscribe(renderHud);
}

function renderHud() {
  if (!hudEl) return;
  const strings = gameState.content?.strings.ui;
  const location = gameState.content?.locations.locations.find((loc) => loc.id === gameState.player.location);
  hudEl.innerHTML = `
    <div class="hud-meter">
      <strong>${strings?.hud.location ?? 'Location'}:</strong> ${location?.name ?? 'Unknown'}
    </div>
    <div class="hud-meter">
      <strong>${strings?.hud.slip ?? 'Slip Tension'}</strong>
      <progress max="100" value="${Math.round(gameState.player.slipTension)}"></progress>
    </div>
    <div class="hud-meter">
      <strong>${strings?.hud.morality ?? 'Morality'}</strong>
      <progress max="200" value="${gameState.player.morality + 100}"></progress>
    </div>
    <div class="hud-meter">
      <strong>${strings?.hud.interaction ?? 'Interaction'}</strong>
      <div>Cooperative: ${gameState.player.style.cooperative.toFixed(1)}</div>
      <div>Manipulative: ${gameState.player.style.manipulative.toFixed(1)}</div>
    </div>
    ${gameState.flags.lastEcologyHash ? `<div>${strings?.hud.ecologyHint ?? 'Ecology changed'}</div>` : ''}
  `;
}
