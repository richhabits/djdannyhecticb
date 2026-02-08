/**
 * services/storageService.ts (v2)
 * LocalStorage DB with extended Station schema + bulk upsert + category linking.
 */
export type ID = string;

export type Category = {
  id: ID;
  name: string;
  color?: string;
  createdAt: number;
};

export type Station = {
  id: ID;
  stationuuid?: string;
  name: string;
  streamUrl: string;
  homepage?: string;
  favicon?: string;
  city?: string;
  country?: string;
  language?: string;
  categoryIds: ID[];
  tags?: string[];
  codec?: string;
  bitrate?: number;
  isPremium?: boolean;
  listenerCount?: number;
  createdAt: number;
};

export type AIDJBlueprint = {
  id: ID;
  name: string;
  steps: Array<{ id: ID; kind: string; config: Record<string, unknown> }>;
  createdAt: number;
};

type DB = {
  version: number;
  categories: Category[];
  stations: Station[];
  blueprints: AIDJBlueprint[];
};

const LS_KEY = "hectic.db.v2";
const bus = new EventTarget();
const emit = () => bus.dispatchEvent(new Event("dbchange"));
window.addEventListener("storage", (e) => { if (e.key === LS_KEY) emit(); });

function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 0xf) >> 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function emptyDB(): DB {
  return { version: 2, categories: [], stations: [], blueprints: [] };
}

function save(db: DB) {
  localStorage.setItem(LS_KEY, JSON.stringify(db));
  emit();
}

function load(): DB {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) {
      const seeded = seed();
      save(seeded);
      return seeded;
    }
    const parsed = JSON.parse(raw) as DB;
    return { ...emptyDB(), ...parsed };
  } catch {
    const seeded = seed();
    save(seeded);
    return seeded;
  }
}

// Minimal seed
function seed(): DB {
  return { version: 2, categories: [], stations: [], blueprints: [] };
}

let cache = load();
export function getDB(): DB { return cache; }
export function subscribe(fn: (db: DB) => void): () => void {
  const handler = () => { cache = load(); fn(cache); };
  bus.addEventListener("dbchange", handler);
  Promise.resolve().then(() => fn(cache));
  return () => bus.removeEventListener("dbchange", handler);
}

// Category CRUD
export function upsertCategory(partial: Partial<Category> & { name: string; id?: ID }): Category {
  const db = load();
  let cat: Category;
  if (partial.id) {
    const idx = db.categories.findIndex((c) => c.id === partial.id);
    if (idx >= 0) {
      cat = { ...db.categories[idx], ...partial } as Category;
      db.categories[idx] = cat;
    } else {
      cat = { id: partial.id, name: partial.name, color: partial.color, createdAt: Date.now() };
      db.categories.push(cat);
    }
  } else {
    cat = { id: uuid(), name: partial.name, color: partial.color, createdAt: Date.now() };
    db.categories.push(cat);
  }
  save(db);
  return cat;
}

export function ensureCategories(names: string[]): ID[] {
  const db = load();
  const ids: ID[] = [];
  for (const n of names) {
    const found = db.categories.find(c => c.name.toLowerCase() == n.toLowerCase());
    if (found) { ids.push(found.id); }
    else {
      const c: Category = { id: uuid(), name: n, createdAt: Date.now() };
      db.categories.push(c); ids.push(c.id);
    }
  }
  save(db);
  return ids;
}

// Station CRUD / bulk
export function upsertStation(partial: Partial<Station> & { name: string; streamUrl: string; id?: ID }): Station {
  const db = load();
  let st: Station;
  if (partial.id) {
    const idx = db.stations.findIndex((s) => s.id === partial.id);
    if (idx >= 0) {
      st = { ...db.stations[idx], ...partial } as Station;
      db.stations[idx] = st;
    } else {
      st = makeStation(partial);
      db.stations.push(st);
    }
  } else {
    st = makeStation(partial);
    db.stations.push(st);
  }
  save(db);
  return st;
}

export function upsertStationsBulk(incoming: Partial<Station>[]): { created: number; updated: number } {
  const db = load();
  let created = 0, updated = 0;
  for (const raw of incoming) {
    // dedupe by stationuuid or streamUrl
    const existingIdx = raw.stationuuid
      ? db.stations.findIndex(s => s.stationuuid === raw.stationuuid)
      : db.stations.findIndex(s => s.streamUrl === raw.streamUrl);

    if (existingIdx >= 0) {
      db.stations[existingIdx] = { ...db.stations[existingIdx], ...raw } as Station;
      updated++;
    } else {
      db.stations.push(makeStation(raw));
      created++;
    }
  }
  save(db);
  return { created, updated };
}

function makeStation(p: Partial<Station> & { name: string; streamUrl: string }): Station {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : (Math.random().toString(36).slice(2)),
    stationuuid: p.stationuuid,
    name: p.name,
    streamUrl: p.streamUrl,
    homepage: p.homepage,
    favicon: p.favicon,
    city: p.city,
    country: p.country,
    language: p.language || "en",
    categoryIds: p.categoryIds || [],
    tags: p.tags || [],
    codec: p.codec,
    bitrate: p.bitrate,
    isPremium: !!p.isPremium,
    listenerCount: p.listenerCount ?? 0,
    createdAt: Date.now(),
  };
}

export function deleteStation(id: ID) { const db = load(); db.stations = db.stations.filter(s => s.id !== id); save(db); }
export function deleteCategory(id: ID) {
  const db = load();
  db.categories = db.categories.filter((c) => c.id !== id);
  db.stations = db.stations.map((s) => ({ ...s, categoryIds: s.categoryIds.filter((cid) => cid !== id) }));
  save(db);
}

// Helpers
export function getBroadcastHealth(db = getDB()): { healthPct: number; activeListeners: number } {
  const base = db.stations.length === 0 ? 0 : 96;
  const diversity = Math.min(4, db.stations.length);
  const healthPct = db.stations.length === 0 ? 0 : Math.min(99.9, base + diversity);
  const activeListeners = db.stations.reduce((sum, s) => sum + (s.listenerCount || 0), 0);
  return { healthPct, activeListeners };
}
