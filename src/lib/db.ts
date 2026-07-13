import { promises as fs } from "fs";
import path from "path";
import { createSeedDatabase } from "./seed";
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

export async function readDb(): Promise<Database> {
  if (memoryCache) return memoryCache;
  await ensureDataDir();
  try {
    const raw = await fs.readFile(DB_PATH, "utf-8");
    memoryCache = JSON.parse(raw) as Database;
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
