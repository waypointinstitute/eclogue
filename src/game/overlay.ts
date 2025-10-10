import { adjustInstability, gameState, setLayer, setSlipTension } from '@core/state';
import type { IntrusionRules } from '@content/schema';
import { forceMetaDream } from './loop';
import { applySlipFx } from '@engine/fx';

let lastIntrusion = 0;

export function triggerMetaDreamIfNeeded(rules: IntrusionRules) {
  const now = performance.now();
  if (gameState.player.instability >= rules.metaDreamThreshold && now - lastIntrusion > rules.cooldownSec * 1000) {
    forceMetaDream();
    adjustInstability(-rules.metaDreamThreshold / 2);
    setSlipTension(20);
    lastIntrusion = now;
    window.setTimeout(() => {
      exitMetaDream();
    }, 10000);
  }
}

export function exitMetaDream() {
  setLayer('waking');
  setSlipTension(0);
  applySlipFx('waking');
}
