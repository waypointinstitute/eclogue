import { rng } from '@core/rng';

export interface MetaRoom {
  layout: string[];
  rule: string;
}

const wallTiles = ['#', '%', '*'];

export function generateMetaRoom(): MetaRoom {
  const size = 5;
  const layout: string[] = [];
  for (let y = 0; y < size; y++) {
    let row = '';
    for (let x = 0; x < size; x++) {
      if (x === 0 || y === 0 || x === size - 1 || y === size - 1) {
        row += rng.pick(wallTiles);
      } else {
        row += rng.next() > 0.7 ? rng.pick(['.', ':']) : ' ';
      }
    }
    layout.push(row);
  }
  return {
    layout,
    rule: rng.pick(['gravity_inverts', 'doors_shuffle', 'text_scramble'])
  };
}
