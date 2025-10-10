export interface Location {
  id: string;
  name: string;
  type?: 'thin_place' | 'normal';
  neighbors: string[];
  description: string;
}

export interface LocationsFile {
  locations: Location[];
}

export interface Portal {
  from: string;
  to: string;
  condition: 'always';
}

export interface PortalsFile {
  portals: Portal[];
}

export interface SlipRules {
  baseIntervalSec: number;
  tensionGainPerAction: number;
  thinPlaceMultipliers: Record<string, number>;
  calmActions: Record<string, number>;
}

export interface IntrusionRules {
  instabilityPerSlip: number;
  metaDreamThreshold: number;
  cooldownSec: number;
}

export interface DreamCondition {
  moralityMin?: number;
  moralityMax?: number;
  manipulativeMin?: number;
  dietHas?: string[];
}

export interface DreamPaletteRule {
  when: DreamCondition;
  apply: string;
}

export interface DreamSpawnRule {
  when: DreamCondition;
  add: string[];
}

export interface DreamMusicRule {
  when: DreamCondition;
  motif: string;
}

export interface DreamPuzzleRule {
  when: DreamCondition;
  mod: string;
}

export interface DreamRulesFile {
  slip: SlipRules;
  intrusion: IntrusionRules;
  palettes: DreamPaletteRule[];
  spawns: DreamSpawnRule[];
  music: DreamMusicRule[];
  puzzles: DreamPuzzleRule[];
}

export interface BookSeed {
  spawn?: string;
  motif?: string;
  delaySlips: number;
}

export interface BookEntry {
  id: string;
  title: string;
  tags: string[];
  excerpt: string;
  seed?: BookSeed;
}

export interface BooksFile extends Array<BookEntry> {}

export interface CodexEntry {
  id: string;
  title: string;
  text: string;
  tags: string[];
}

export interface CodexFile {
  entries: CodexEntry[];
}

export interface DialogueChoiceEffects {
  morality?: number;
  style?: Record<string, number>;
  diet?: Record<string, number>;
  next?: string | null;
}

export interface DialogueChoice {
  text: string;
  effects?: Omit<DialogueChoiceEffects, 'next'>;
  next?: string | null;
}

export interface DialogueNode {
  id: string;
  text: string;
  choices: DialogueChoice[];
}

export interface Character {
  id: string;
  name: string;
  layer: 'waking' | 'dream' | 'meta';
  dialogue: DialogueNode[];
}

export interface CharactersFile extends Array<Character> {}

export interface Faction {
  id: string;
  name: string;
  description: string;
  alignment: string;
}

export interface FactionsFile {
  factions: Faction[];
}

export interface QuestFragmentEffect {
  morality?: number;
  style?: Record<string, number>;
  queueSpawn?: {
    tag: string;
    spawn: string;
    delaySlips: number;
  };
}

export interface QuestFragment {
  id: string;
  title: string;
  conditions: {
    location?: string;
  };
  effects: QuestFragmentEffect;
}

export interface QuestFragmentsFile {
  fragments: QuestFragment[];
}

export interface UiStrings {
  ui: {
    menu: Record<string, string>;
    hud: Record<string, string>;
    codex: Record<string, string>;
    saves: Record<string, string>;
  };
}

export interface GameContent {
  locations: LocationsFile;
  portals: PortalsFile;
  dreamRules: DreamRulesFile;
  books: BooksFile;
  codex: CodexFile;
  characters: CharactersFile;
  factions: FactionsFile;
  quests: QuestFragmentsFile;
  strings: UiStrings;
}
