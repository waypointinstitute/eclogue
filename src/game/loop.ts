import { updateClock } from '@core/time';
import { adjustInstability, computeEcologyHash, gameState, incrementSlipCount, recordEcologyHash, setLayer, setSlipTension } from '@core/state';
import { applyDreamEcology } from './ecology';
import { triggerMetaDreamIfNeeded } from './overlay';
import { applySlipFx } from '@engine/fx';

let rafId = 0;

export function startGameLoop() {
  const tick = () => {
    if (!gameState.content) {
      rafId = requestAnimationFrame(tick);
      return;
    }
    updateClock(gameState.content);
    evaluateSlip();
    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);
}

function evaluateSlip() {
  const tension = gameState.player.slipTension;
  const rules = gameState.content!.dreamRules;
  if (gameState.layer === 'waking' && tension >= 100) {
    enterDream();
  } else if (gameState.layer === 'dream' && tension <= 10) {
    returnToWaking();
  }
  triggerMetaDreamIfNeeded(rules.intrusion);
}

function enterDream() {
  setLayer('dream');
  setSlipTension(50);
  incrementSlipCount();
  adjustInstability(gameState.content!.dreamRules.intrusion.instabilityPerSlip);
  applyDreamEcology();
  applySlipFx('dream');
}

function returnToWaking() {
  setLayer('waking');
  setSlipTension(0);
  applySlipFx('waking');
  const hash = computeEcologyHash();
  recordEcologyHash(hash);
}

export function forceMetaDream() {
  setLayer('meta');
  applySlipFx('meta');
}

export function stopGameLoop() {
  cancelAnimationFrame(rafId);
}
