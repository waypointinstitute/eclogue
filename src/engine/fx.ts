import { gameState } from '@core/state';

export function applySlipFx(layer: 'dream' | 'waking' | 'meta') {
  const body = document.body;
  body.style.transition = 'background 0.8s ease';
  switch (layer) {
    case 'dream':
      body.style.background = 'radial-gradient(circle at top, rgba(247, 168, 214, 0.2), transparent), var(--bg-dream)';
      break;
    case 'meta':
      body.style.background = 'radial-gradient(circle at center, rgba(255, 111, 145, 0.25), transparent), var(--bg-meta)';
      break;
    default:
      body.style.background = 'radial-gradient(circle at top, rgba(126, 249, 198, 0.1), transparent), var(--bg-waking)';
  }
}

export function watchLayerFx() {
  gameState.subscribe((state) => {
    if (state.layer === 'waking' || state.layer === 'dream' || state.layer === 'meta') {
      applySlipFx(state.layer);
    }
  });
}
