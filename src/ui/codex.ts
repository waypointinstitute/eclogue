import { codexEntries, readBook } from '@game/lore';
import { gameState, setCodexFocus } from '@core/state';

let codexEl: HTMLElement | null = null;

export function createCodex(root: HTMLElement) {
  codexEl = document.createElement('div');
  codexEl.className = 'overlay-panel';
  codexEl.style.bottom = '1rem';
  root.appendChild(codexEl);
  renderCodex();
  gameState.subscribe(renderCodex);
}

function renderCodex() {
  if (!codexEl) return;
  const entries = codexEntries();
  const focus = gameState.codexFocus;
  const books = gameState.content?.books ?? [];
  codexEl.innerHTML = `
    <h3>${gameState.content?.strings.ui.codex.discovered ?? 'Codex'}</h3>
    <div>
      ${books
        .map(
          (book) => `
            <button data-book="${book.id}">Read: ${book.title}</button>
          `
        )
        .join('')}
    </div>
    <div class="codex-list">
      ${entries
        .map((entry) => `
          <button data-entry="${entry.id}" ${focus === entry.id ? 'disabled' : ''}>${entry.title}</button>
        `)
        .join('')}
    </div>
    ${focus ? renderEntry(entries.find((entry) => entry.id === focus)?.text ?? '') : ''}
  `;
  codexEl.querySelectorAll('button[data-entry]').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      const id = (event.currentTarget as HTMLButtonElement).dataset.entry!;
      setCodexFocus(id);
    });
  });
  codexEl.querySelectorAll('button[data-book]').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      const id = (event.currentTarget as HTMLButtonElement).dataset.book!;
      const book = books.find((b) => b.id === id);
      if (book) {
        readBook(book);
      }
    });
  });
}

function renderEntry(text: string) {
  return `<div class="codex-entry">${text}</div>`;
}
