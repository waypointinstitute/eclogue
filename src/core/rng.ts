export class RNG {
  private seed: number;

  constructor(seed: number = Date.now() % 2147483647) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 48271) % 2147483647;
    return this.seed / 2147483647;
  }

  pick<T>(items: T[]): T {
    return items[Math.floor(this.next() * items.length)];
  }
}

export const rng = new RNG();
