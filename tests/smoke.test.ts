import { describe, it, expect } from 'vitest';
import { generateMetaRoom } from '../src/game/worldgen';

describe('meta room generator', () => {
  it('creates a bounded layout', () => {
    const room = generateMetaRoom();
    expect(room.layout).toHaveLength(5);
    for (const row of room.layout) {
      expect(row).toHaveLength(5);
    }
  });
});
