import { describe, it, expect, beforeEach } from 'vitest';
import { applyMorality, bumpStyle, resetPlayerState, gameState } from '../src/core/state';

describe('player morality and style', () => {
  beforeEach(() => {
    resetPlayerState();
  });

  it('applies morality within bounds', () => {
    applyMorality(50);
    expect(gameState.player.morality).toBe(50);
    applyMorality(100);
    expect(gameState.player.morality).toBe(100);
  });

  it('updates style axes', () => {
    bumpStyle('cooperative', 0.5);
    expect(gameState.player.style.cooperative).toBeCloseTo(0.5);
  });
});
