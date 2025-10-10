import { openDB } from 'idb';
import { hydrateFromSnapshot, toSnapshot, type SaveSlotData } from './state';

const DB_NAME = 'overdream-saves';
const STORE_NAME = 'slots';

async function getDb() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME);
    }
  });
}

export async function saveToSlot(slot: string) {
  const db = await getDb();
  const snapshot = toSnapshot();
  const payload: SaveSlotData = { ...snapshot, timestamp: Date.now() };
  await db.put(STORE_NAME, payload, slot);
}

export async function loadFromSlot(slot: string) {
  const db = await getDb();
  const snapshot = (await db.get(STORE_NAME, slot)) as SaveSlotData | undefined;
  if (snapshot) {
    hydrateFromSnapshot(snapshot);
  }
  return snapshot;
}

export async function clearSlot(slot: string) {
  const db = await getDb();
  await db.delete(STORE_NAME, slot);
}

export async function listSlots(): Promise<Record<string, SaveSlotData>> {
  const db = await getDb();
  const entries: Record<string, SaveSlotData> = {};
  let cursor = await db.transaction(STORE_NAME).store.openCursor();
  while (cursor) {
    entries[cursor.key as string] = cursor.value as SaveSlotData;
    cursor = await cursor.continue();
  }
  return entries;
}
