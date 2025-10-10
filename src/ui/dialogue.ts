import { advanceDialogue, gameState } from '@core/state';
import { applyChoiceEffects } from '@game/morality';

let dialogueEl: HTMLElement | null = null;

export function createDialogue(root: HTMLElement) {
  dialogueEl = document.createElement('div');
  dialogueEl.className = 'overlay-panel';
  dialogueEl.style.bottom = '1rem';
  dialogueEl.style.left = '50%';
  dialogueEl.style.transform = 'translateX(-50%)';
  root.appendChild(dialogueEl);
  renderDialogue();
  gameState.subscribe(renderDialogue);
}

function renderDialogue() {
  if (!dialogueEl) return;
  const active = gameState.activeDialogue;
  if (!active) {
    dialogueEl.innerHTML = '<div>Approach an NPC to converse.</div>';
    return;
  }
  const node = active.character.dialogue[active.nodeIndex];
  dialogueEl.innerHTML = `
    <div><strong>${active.character.name}</strong></div>
    <div>${node.text}</div>
    <div>
      ${node.choices
        .map(
          (choice, index) => `
            <button data-choice="${index}">${choice.text}</button>
          `
        )
        .join('')}
    </div>
  `;
  dialogueEl.querySelectorAll('button[data-choice]').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      const index = Number((event.currentTarget as HTMLButtonElement).dataset.choice);
      const choice = node.choices[index];
      applyChoiceEffects(choice);
      advanceDialogue(choice.next ?? null);
    });
  });
}
