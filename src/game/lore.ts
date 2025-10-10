import { gameState, setCodexFocus, unlockLore } from '@core/state';
import type { BookEntry } from '@content/schema';

export function readBook(book: BookEntry) {
  unlockLore(book);
  gameState.player.codexUnlocked.add(book.id);
  setCodexFocus(book.id);
}

export function codexEntries() {
  if (!gameState.content) return [];
  return gameState.content.codex.entries.filter((entry) => gameState.player.loreDiscovered.has(entry.id));
}
