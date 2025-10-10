import { loadFromSlot, saveToSlot, clearSlot, listSlots } from '@core/save';
import { gameState, resetPlayerState, setLayer, setMenuVisible, type SaveSlotData } from '@core/state';

let slotsCache: Record<string, SaveSlotData> = {};

let menuEl: HTMLElement | null = null;

export async function createMenu(root: HTMLElement) {
  menuEl = document.createElement('div');
  menuEl.className = 'overlay-panel';
  menuEl.style.right = '1rem';
  menuEl.style.left = 'auto';
  root.appendChild(menuEl);
  await refreshSlots();
  gameState.subscribe(renderMenu);
}

function renderMenu() {
  if (!menuEl) return;
  const strings = gameState.content?.strings.ui;
  const slots = slotsCache;
  menuEl.style.display = gameState.menuVisible ? 'block' : 'none';
  menuEl.innerHTML = `
    <h2>${strings?.menu.title ?? 'Overdream'}</h2>
    <button data-action="start">${strings?.menu.start ?? 'Begin'}</button>
    <button data-action="continue">${strings?.menu.continue ?? 'Continue'}</button>
    <h3>${strings?.saves.slot ?? 'Slot'}s</h3>
    <div class="save-slots">
      ${[1, 2, 3]
        .map((slot) => {
          const data = slots[`slot-${slot}`];
          const label = data ? new Date(data.timestamp).toLocaleTimeString() : 'Empty';
          return `
            <div>
              <button data-action="load" data-slot="slot-${slot}">${strings?.saves.load ?? 'Load'} ${slot}</button>
              <button data-action="save" data-slot="slot-${slot}">${strings?.saves.save ?? 'Save'} ${slot}</button>
              <button data-action="clear" data-slot="slot-${slot}">${strings?.saves.clear ?? 'Clear'} ${slot}</button>
              <div>${label}</div>
            </div>
          `;
        })
        .join('')}
    </div>
  `;
  menuEl.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', onMenuClick);
  });
}

async function onMenuClick(event: Event) {
  const target = event.currentTarget as HTMLButtonElement;
  const action = target.dataset.action;
  const slot = target.dataset.slot;
  switch (action) {
    case 'start':
      resetPlayerState();
      setLayer('waking');
      setMenuVisible(false);
      break;
    case 'continue':
      if (slot) await loadFromSlot(slot);
      setLayer(gameState.flags.lastLayer === 'menu' ? 'waking' : gameState.flags.lastLayer);
      setMenuVisible(false);
      break;
    case 'load':
      if (slot) await loadFromSlot(slot);
      setLayer('waking');
      setMenuVisible(false);
      break;
    case 'save':
      if (slot) await saveToSlot(slot);
      break;
    case 'clear':
      if (slot) await clearSlot(slot);
      break;
  }
  await refreshSlots();
}

async function refreshSlots() {
  slotsCache = await listSlots();
  renderMenu();
}
