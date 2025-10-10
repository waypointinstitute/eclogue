let panel: HTMLElement | null = null;

export function createSettings(root: HTMLElement) {
  panel = document.createElement('div');
  panel.className = 'overlay-panel';
  panel.style.top = 'auto';
  panel.style.bottom = '1rem';
  panel.style.right = '1rem';
  panel.innerHTML = `
    <h3>Accessibility</h3>
    <label>
      Text Scale
      <input type="range" min="0.8" max="1.4" step="0.05" value="1" />
    </label>
  `;
  panel.querySelector('input')?.addEventListener('input', (event) => {
    const scale = Number((event.target as HTMLInputElement).value);
    document.documentElement.style.fontSize = `${scale * 100}%`;
  });
  root.appendChild(panel);
}
