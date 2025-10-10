import { adjustDiet, consumeSpawnQueue, gameState, recordEcologyHash } from '@core/state';
import type { DreamCondition, DreamRulesFile } from '@content/schema';

interface EcologyOutcome {
  palette: string | null;
  spawns: string[];
  music: string[];
  puzzles: string[];
}

export function applyDreamEcology() {
  if (!gameState.content) return;
  const rules = gameState.content.dreamRules;
  const outcome = evaluateRules(rules);
  const queued = consumeSpawnQueue();
  if (queued.length) {
    outcome.spawns.push(...queued.map((item) => item.spawn));
  }
  recordEcologyHash(JSON.stringify(outcome));
  if (outcome.music.length > 0) {
    for (const motif of outcome.music) {
      adjustDiet(motif, 0.2);
    }
  }
}

function evaluateRules(rules: DreamRulesFile): EcologyOutcome {
  const outcome: EcologyOutcome = { palette: null, spawns: [], music: [], puzzles: [] };
  for (const palette of rules.palettes) {
    if (conditionMatches(palette.when)) {
      outcome.palette = palette.apply;
    }
  }
  for (const spawn of rules.spawns) {
    if (conditionMatches(spawn.when)) {
      outcome.spawns.push(...spawn.add);
    }
  }
  for (const music of rules.music) {
    if (conditionMatches(music.when)) {
      outcome.music.push(music.motif);
    }
  }
  for (const puzzle of rules.puzzles) {
    if (conditionMatches(puzzle.when)) {
      outcome.puzzles.push(puzzle.mod);
    }
  }
  return outcome;
}

function conditionMatches(condition: DreamCondition): boolean {
  const player = gameState.player;
  if (condition.moralityMin !== undefined && player.morality < condition.moralityMin) return false;
  if (condition.moralityMax !== undefined && player.morality > condition.moralityMax) return false;
  if (condition.manipulativeMin !== undefined && player.style.manipulative < condition.manipulativeMin) return false;
  if (condition.dietHas) {
    for (const tag of condition.dietHas) {
      if (!player.diet[tag] || player.diet[tag] <= 0) return false;
    }
  }
  return true;
}
