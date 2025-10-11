import { gameState } from '@core/state';

let consoleEl: HTMLElement | null = null;

export function createDataConsole(root: HTMLElement) {
  consoleEl = document.createElement('div');
  consoleEl.className = 'overlay-panel';
  consoleEl.style.left = '50%';
  consoleEl.style.transform = 'translateX(-50%)';
  consoleEl.style.top = '1rem';
  consoleEl.innerHTML = '<h3>Data Console</h3>';
  root.appendChild(consoleEl);
  renderIssues();
  gameState.subscribe(renderIssues);
}

function renderIssues() {
  if (!consoleEl) return;
  consoleEl.innerHTML = '<h3>Data Console</h3>';
  if (!gameState.issues.length) {
    consoleEl.innerHTML += '<div>All content validated.</div>';
    return;
  }
  consoleEl.innerHTML += `<div class="data-console">${gameState.issues
    .map((issue) => `<div>${issue.file}: ${issue.message}</div>`)
    .join('')}</div>`;
}
