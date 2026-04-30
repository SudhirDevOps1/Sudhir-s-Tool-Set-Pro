import { openDB, type IDBPDatabase } from 'idb';
import type { DownloadRecord } from '../types';

const DB_NAME = 'socialDLDB';
const DB_VERSION = 1;
const STORE_NAME = 'downloads';

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('downloadedAt', 'downloadedAt');
        }
      },
    });
  }
  return dbPromise;
}

// ─── CRUD operations ──────────────────────────────────────────────────────────

export async function addDownloadRecord(record: DownloadRecord): Promise<void> {
  const db = await getDB();
  await db.put(STORE_NAME, record);
}

export async function getAllDownloadRecords(): Promise<DownloadRecord[]> {
  const db = await getDB();
  const all = await db.getAll(STORE_NAME);
  // Sort newest first
  return all.sort((a, b) => b.downloadedAt - a.downloadedAt);
}

export async function deleteDownloadRecord(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}

export async function clearAllDownloadRecords(): Promise<void> {
  const db = await getDB();
  await db.clear(STORE_NAME);
}

export async function getDownloadRecord(id: string): Promise<DownloadRecord | undefined> {
  const db = await getDB();
  return db.get(STORE_NAME, id);
}
