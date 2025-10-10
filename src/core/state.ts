import { reactive } from '../util/reactive';
import type { BookEntry, Character, GameContent, Location } from '@content/schema';

export type GameLayer = 'menu' | 'waking' | 'dream' | 'meta';

export interface PlayerStyle {
  cooperative: number;
  manipulative: number;
  withdrawn: number;
}

export interface PlayerDiet {
  [tag: string]: number;
}

export interface SpawnQueueItem {
  tag: string;
  spawn: string;
  triggerSlip: number;
}

export interface PlayerState {
  location: string;
  morality: number; // -100..100
  style: PlayerStyle;
  diet: PlayerDiet;
  loreDiscovered: Set<string>;
  codexUnlocked: Set<string>;
  slipTension: number;
  instability: number;
  slipCount: number;
}

export interface GameFlags {
  lastEcologyHash: string | null;
  pendingSpawnQueue: SpawnQueueItem[];
  lastLayer: GameLayer;
}

export interface SaveSlotData {
  player: PlayerStateSnapshot;
  flags: FlagsSnapshot;
  timestamp: number;
}

export interface PlayerStateSnapshot extends Omit<PlayerState, 'loreDiscovered' | 'codexUnlocked'> {
  loreDiscovered: string[];
  codexUnlocked: string[];
}

export interface FlagsSnapshot {
  lastEcologyHash: string | null;
  pendingSpawnQueue: SpawnQueueItem[];
  lastLayer: GameLayer;
}

export interface GameState {
  layer: GameLayer;
  content: GameContent | null;
  player: PlayerState;
  flags: GameFlags;
  activeDialogue: { character: Character; nodeIndex: number } | null;
  codexFocus: string | null;
  menuVisible: boolean;
  issues: { file: string; message: string }[];
}

const defaultPlayer: PlayerState = {
  location: 'library',
  morality: 0,
  style: {
    cooperative: 0,
    manipulative: 0,
    withdrawn: 0
  },
  diet: {},
  loreDiscovered: new Set(),
  codexUnlocked: new Set(),
  slipTension: 0,
  instability: 0,
  slipCount: 0
};

const defaultFlags: GameFlags = {
  lastEcologyHash: null,
  pendingSpawnQueue: [],
  lastLayer: 'menu'
};

const initialState: GameState = {
  layer: 'menu',
  content: null,
  player: structuredCloneState(defaultPlayer),
  flags: structuredCloneFlags(defaultFlags),
  activeDialogue: null,
  codexFocus: null,
  menuVisible: true,
  issues: []
};

function structuredCloneState(player: PlayerState): PlayerState {
  return {
    location: player.location,
    morality: player.morality,
    style: { ...player.style },
    diet: { ...player.diet },
    loreDiscovered: new Set(player.loreDiscovered),
    codexUnlocked: new Set(player.codexUnlocked),
    slipTension: player.slipTension,
    instability: player.instability,
    slipCount: player.slipCount
  };
}

function structuredCloneFlags(flags: GameFlags): GameFlags {
  return {
    lastEcologyHash: flags.lastEcologyHash,
    pendingSpawnQueue: flags.pendingSpawnQueue.map((item) => ({ ...item })),
    lastLayer: flags.lastLayer
  };
}

export const gameState = reactive(initialState);

export function resetPlayerState() {
  gameState.player = structuredCloneState(defaultPlayer);
  gameState.flags = structuredCloneFlags(defaultFlags);
}

export function setContent(content: GameContent, issues: GameState['issues']) {
  gameState.content = content;
  gameState.issues = issues;
}

export function setLayer(layer: GameLayer) {
  gameState.flags.lastLayer = gameState.layer;
  gameState.layer = layer;
}

export function setMenuVisible(visible: boolean) {
  gameState.menuVisible = visible;
}

export function openDialogue(character: Character, nodeIndex = 0) {
  gameState.activeDialogue = { character, nodeIndex };
}

export function advanceDialogue(nextNodeId: string | null) {
  const active = gameState.activeDialogue;
  if (!active || !gameState.content) return;
  if (nextNodeId === null) {
    gameState.activeDialogue = null;
    return;
  }
  const nextIndex = active.character.dialogue.findIndex((node) => node.id === nextNodeId);
  if (nextIndex >= 0) {
    gameState.activeDialogue = { character: active.character, nodeIndex: nextIndex };
  } else {
    gameState.activeDialogue = null;
  }
}

export function setCodexFocus(entryId: string | null) {
  gameState.codexFocus = entryId;
}

export function unlockLore(book: BookEntry) {
  gameState.player.loreDiscovered.add(book.id);
  if (book.seed?.spawn) {
    queueSpawn({ tag: book.tags[0] ?? 'general', spawn: book.seed.spawn, delaySlips: book.seed.delaySlips });
  }
  if (book.seed?.motif) {
    gameState.player.diet[book.seed.motif] = (gameState.player.diet[book.seed.motif] ?? 0) + 1;
  }
}

export function queueSpawn(item: { tag: string; spawn: string; delaySlips: number }) {
  const triggerSlip = gameState.player.slipCount + item.delaySlips;
  gameState.flags.pendingSpawnQueue.push({ tag: item.tag, spawn: item.spawn, triggerSlip });
}

export function consumeSpawnQueue(): SpawnQueueItem[] {
  const triggered = gameState.flags.pendingSpawnQueue.filter((item) => item.triggerSlip <= gameState.player.slipCount);
  gameState.flags.pendingSpawnQueue = gameState.flags.pendingSpawnQueue.filter((item) => item.triggerSlip > gameState.player.slipCount);
  return triggered;
}

export function applyMorality(delta: number) {
  gameState.player.morality = clamp(gameState.player.morality + delta, -100, 100);
}

export function bumpStyle(axis: keyof PlayerStyle, delta: number) {
  gameState.player.style[axis] = clamp(gameState.player.style[axis] + delta, 0, 1);
}

export function adjustDiet(tag: string, delta: number) {
  gameState.player.diet[tag] = (gameState.player.diet[tag] ?? 0) + delta;
}

export function moveToLocation(locationId: string) {
  gameState.player.location = locationId;
}

export function setSlipTension(value: number) {
  gameState.player.slipTension = clamp(value, 0, 100);
}

export function incrementSlipCount() {
  gameState.player.slipCount += 1;
}

export function adjustInstability(delta: number) {
  gameState.player.instability = Math.max(0, gameState.player.instability + delta);
}

export function computeEcologyHash(): string {
  const { morality, style, diet } = gameState.player;
  return JSON.stringify({ morality, style, diet });
}

export function recordEcologyHash(hash: string) {
  gameState.flags.lastEcologyHash = hash;
}

export function setIssues(issues: GameState['issues']) {
  gameState.issues = issues;
}

export function toSnapshot(): { player: PlayerStateSnapshot; flags: FlagsSnapshot } {
  const { player, flags } = gameState;
  return {
    player: {
      location: player.location,
      morality: player.morality,
      style: { ...player.style },
      diet: { ...player.diet },
      loreDiscovered: Array.from(player.loreDiscovered),
      codexUnlocked: Array.from(player.codexUnlocked),
      slipTension: player.slipTension,
      instability: player.instability,
      slipCount: player.slipCount
    },
    flags: {
      lastEcologyHash: flags.lastEcologyHash,
      pendingSpawnQueue: flags.pendingSpawnQueue.map((p) => ({ ...p })),
      lastLayer: flags.lastLayer
    }
  };
}

export function hydrateFromSnapshot(snapshot: { player: PlayerStateSnapshot; flags: FlagsSnapshot }) {
  gameState.player = {
    location: snapshot.player.location,
    morality: snapshot.player.morality,
    style: { ...snapshot.player.style },
    diet: { ...snapshot.player.diet },
    loreDiscovered: new Set(snapshot.player.loreDiscovered),
    codexUnlocked: new Set(snapshot.player.codexUnlocked),
    slipTension: snapshot.player.slipTension,
    instability: snapshot.player.instability,
    slipCount: snapshot.player.slipCount
  };
  gameState.flags = {
    lastEcologyHash: snapshot.flags.lastEcologyHash,
    pendingSpawnQueue: snapshot.flags.pendingSpawnQueue.map((p) => ({ ...p })),
    lastLayer: snapshot.flags.lastLayer
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function currentLocation(): Location | undefined {
  return gameState.content?.locations.locations.find((loc) => loc.id === gameState.player.location);
}
