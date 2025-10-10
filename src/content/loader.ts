import type {
  BooksFile,
  CharactersFile,
  CodexFile,
  DreamRulesFile,
  FactionsFile,
  GameContent,
  LocationsFile,
  PortalsFile,
  QuestFragmentsFile,
  UiStrings
} from './schema';

interface ValidationIssue {
  file: string;
  message: string;
}

const DATA_ROOT = `${import.meta.env.BASE_URL}data`;

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${DATA_ROOT}/${path}`);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.statusText}`);
  }
  return (await response.json()) as T;
}

function assertArray(value: unknown, file: string, field: string, issues: ValidationIssue[]): value is unknown[] {
  if (!Array.isArray(value)) {
    issues.push({ file, message: `${field} must be an array` });
    return false;
  }
  return true;
}

function assertObject(value: unknown, file: string, field: string, issues: ValidationIssue[]): value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    issues.push({ file, message: `${field} must be an object` });
    return false;
  }
  return true;
}

export async function loadContent(): Promise<{ content: GameContent; issues: ValidationIssue[] }> {
  const issues: ValidationIssue[] = [];

  const [locations, portals, dreamRules, books, codex, characters, factions, quests, strings] = await Promise.all([
    fetchJson<LocationsFile>('world/locations.json'),
    fetchJson<PortalsFile>('world/portals.json'),
    fetchJson<DreamRulesFile>('world/dream_rules.json'),
    fetchJson<BooksFile>('lore/books.json'),
    fetchJson<CodexFile>('lore/codex.json'),
    fetchJson<CharactersFile>('npcs/characters.json'),
    fetchJson<FactionsFile>('npcs/factions.json'),
    fetchJson<QuestFragmentsFile>('quests/fragments.json'),
    fetchJson<UiStrings>('ui/strings.en.json')
  ]);

  validateLocations(locations, issues);
  validatePortals(portals, issues);
  validateDreamRules(dreamRules, issues);
  validateBooks(books, issues);
  validateCodex(codex, issues);
  validateCharacters(characters, issues);
  validateFactions(factions, issues);
  validateQuests(quests, issues);

  return {
    content: { locations, portals, dreamRules, books, codex, characters, factions, quests, strings },
    issues
  };
}

function validateLocations(file: LocationsFile, issues: ValidationIssue[]) {
  if (!assertArray(file.locations, 'world/locations.json', 'locations', issues)) {
    return;
  }
  for (const location of file.locations) {
    if (!location.id || !location.name) {
      issues.push({ file: 'world/locations.json', message: 'Location missing id or name' });
    }
    if (!Array.isArray(location.neighbors)) {
      issues.push({ file: 'world/locations.json', message: `Location ${location.id} has invalid neighbors` });
    }
  }
}

function validatePortals(file: PortalsFile, issues: ValidationIssue[]) {
  if (!assertArray(file.portals, 'world/portals.json', 'portals', issues)) {
    return;
  }
  for (const portal of file.portals) {
    if (!portal.from || !portal.to) {
      issues.push({ file: 'world/portals.json', message: 'Portal missing endpoints' });
    }
  }
}

function validateDreamRules(file: DreamRulesFile, issues: ValidationIssue[]) {
  if (!assertObject(file.slip, 'world/dream_rules.json', 'slip', issues)) return;
  if (typeof file.slip.baseIntervalSec !== 'number') {
    issues.push({ file: 'world/dream_rules.json', message: 'Slip baseIntervalSec must be a number' });
  }
}

function validateBooks(file: BooksFile, issues: ValidationIssue[]) {
  if (!assertArray(file, 'lore/books.json', 'books', issues)) return;
  for (const book of file) {
    if (!book.id || !book.title) {
      issues.push({ file: 'lore/books.json', message: 'Book missing id or title' });
    }
  }
}

function validateCodex(file: CodexFile, issues: ValidationIssue[]) {
  if (!assertArray(file.entries, 'lore/codex.json', 'entries', issues)) return;
}

function validateCharacters(file: CharactersFile, issues: ValidationIssue[]) {
  if (!assertArray(file, 'npcs/characters.json', 'characters', issues)) return;
  for (const npc of file) {
    if (!npc.id || !npc.dialogue) {
      issues.push({ file: 'npcs/characters.json', message: 'Character missing fields' });
    }
  }
}

function validateFactions(file: FactionsFile, issues: ValidationIssue[]) {
  if (!assertArray(file.factions, 'npcs/factions.json', 'factions', issues)) return;
}

function validateQuests(file: QuestFragmentsFile, issues: ValidationIssue[]) {
  if (!assertArray(file.fragments, 'quests/fragments.json', 'fragments', issues)) return;
}

export type { ValidationIssue };
