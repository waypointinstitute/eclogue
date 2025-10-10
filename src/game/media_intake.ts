import { adjustDiet } from '@core/state';

export function logMediaTag(tag: string) {
  adjustDiet(tag, 1);
}

export function decayDiet() {
  // Future hook: gradually decay tags
}
