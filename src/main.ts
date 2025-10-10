import '../docs/styles/main.css';
import { loadContent } from '@content/loader';
import { gameState, openDialogue, setContent, setLayer } from '@core/state';
import { setupRenderer } from '@engine/renderer';
import { setupInput } from '@engine/input';
import { updateAudioLayer } from '@engine/audio';
import { watchLayerFx } from '@engine/fx';
import { startGameLoop } from '@game/loop';
import { createHud } from '@ui/hud';
import { createMenu } from '@ui/menu';
import { createCodex } from '@ui/codex';
import { createSettings } from '@ui/settings';
import { createDataConsole } from '@ui/dataConsole';
import { createDialogue } from '@ui/dialogue';
import { evaluateQuestTriggers } from '@game/quests';
import { pickNpcForLayer } from '@game/ai';

async function bootstrap() {
  const { content, issues } = await loadContent();
  setContent(content, issues);

  const appRoot = document.getElementById('app');
  if (!appRoot) throw new Error('App root missing');

  const renderer = setupRenderer(appRoot);
  setupInput();
  watchLayerFx();
  createHud(appRoot);
  await createMenu(appRoot);
  createCodex(appRoot);
  createSettings(appRoot);
  createDataConsole(appRoot);
  createDialogue(appRoot);

  startGameLoop();

  gameState.subscribe((state) => {
    updateAudioLayer();
    if (state.layer === 'waking' || state.layer === 'dream') {
      evaluateQuestTriggers();
    }
  });

  appRoot.addEventListener('click', () => {
    if (!gameState.content || gameState.menuVisible) return;
    const npcs = pickNpcForLayer(gameState.layer === 'dream' ? 'dream' : 'waking');
    const npc = npcs[Math.floor(Math.random() * npcs.length)];
    if (npc) {
      openDialogue(npc);
    }
  });

  setLayer('menu');
  renderer.setLayer('menu');
}

void bootstrap();
