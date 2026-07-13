import { promises as fs } from "fs";
import path from "path";
import { createSeedDatabase, STATIONS, STORE_ITEMS } from "./seed";
import type { Database } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "db.json");

let memoryCache: Database | null = null;
let writeQueue: Promise<void> = Promise.resolve();

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    /* exists */
  }
}

/** Keep catalog fields (images, prices) in sync with seed — don't freeze old JSON. */
function hydrateCatalog(db: Database): Database {
  db.stations = STATIONS.map((s) => ({ ...s }));
  db.storeItems = STORE_ITEMS.map((item) => {
    const prev = db.storeItems?.find((i) => i.id === item.id);
    return prev ? { ...item, stock: prev.stock } : { ...item };
  });
  return db;
}

export async function readDb(): Promise<Database> {
  if (memoryCache) return hydrateCatalog(memoryCache);
  await ensureDataDir();
  try {
    const raw = await fs.readFile(DB_PATH, "utf-8");
    memoryCache = hydrateCatalog(JSON.parse(raw) as Database);
    return memoryCache;
  } catch {
    memoryCache = createSeedDatabase();
    await writeDb(memoryCache);
    return memoryCache;
  }
}

export async function writeDb(db: Database): Promise<void> {
  memoryCache = db;
  writeQueue = writeQueue.then(async () => {
    await ensureDataDir();
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
  });
  await writeQueue;
}

export async function updateDb(
  mutator: (db: Database) => void | Promise<void>
): Promise<Database> {
  const db = await readDb();
  await mutator(db);
  await writeDb(db);
  return db;
}

export function invalidateDbCache() {
  memoryCache = null;
}
