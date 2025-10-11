import { applyMorality, bumpStyle, adjustDiet } from '@core/state';
import type { DialogueChoice } from '@content/schema';

export function applyChoiceEffects(choice: DialogueChoice) {
  if (choice.effects?.morality) {
    applyMorality(choice.effects.morality);
  }
  if (choice.effects?.style) {
    for (const [axis, delta] of Object.entries(choice.effects.style)) {
      bumpStyle(axis as 'cooperative' | 'manipulative' | 'withdrawn', delta);
    }
  }
  if (choice.effects?.diet) {
    for (const [tag, delta] of Object.entries(choice.effects.diet)) {
      adjustDiet(tag, delta);
    }
  }
}
