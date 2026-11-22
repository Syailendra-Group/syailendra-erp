'use client'

/**
 * idb.ts — Promise-based IndexedDB wrapper for the Mitra offline queue.
 * Syailendra Group ERP
 *
 * Schema v1:
 * - outbox : id, payload, route, createdAt, attempts, lastError
 * - drafts : id, kind, payload, savedAt, expiresAt (TTL = 7 days)
 */

const DB_NAME = 'mitra-offbox'
const DB_VERSION = 1
const OUTBOX_STORE = 'outbox'
const DRAFT_STORE = 'drafts'

export type OutboxRecord = {
  id: string
  payload: unknown
  route: string
  createdAt: number
  attempts: number
  lastError: string | null
}

export type DraftRecord = {
  id: string
  kind: string
  payload: unknown
  savedAt: number
  expiresAt: number
}

let dbPromise: Promise<IDBDatabase> | null = null

function isAvailable(): boolean {
  return typeof window !== 'undefined' && Boolean(window.indexedDB)
}

function openDatabase(): Promise<IDBDatabase> {
  if (!isAvailable()) {
    return Promise.reject(new Error('INDEXEDDB_UNAVAILABLE'))
  }
  if (dbPromise) {
    return dbPromise
  }
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(OUTBOX_STORE)) {
        database.createObjectStore(OUTBOX_STORE, { keyPath: 'id' })
      }
      if (!database.objectStoreNames.contains(DRAFT_STORE)) {
        database.createObjectStore(DRAFT_STORE, { keyPath: 'id' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
    request.onblocked = () => reject(new Error('INDEXEDDB_BLOCKED'))
  })
  return dbPromise
}

function requestOf<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function transact<T>(storeName: string, mode: IDBTransactionMode, work: (store: IDBObjectStore) => T | Promise<T>): Promise<T> {
  return openDatabase().then(
    (database) =>
      new Promise<T>((resolve, reject) => {
        const transaction = database.transaction(storeName, mode)
        transaction.oncomplete = () => resolve(undefined as unknown as T)
        transaction.onerror = () => reject(transaction.error)
        transaction.onabort = () => reject(new Error('INDEXEDDB_ABORTED'))
        const result = work(transaction.objectStore(storeName))
        if (result instanceof Promise) {
          result.then(resolve, reject)
        } else {
          resolve(result)
        }
      })
  )
}

export const idb = {
  outboxPut: (record: OutboxRecord): Promise<void> =>
    transact(OUTBOX_STORE, 'readwrite', (store) => {
      store.put(record)
    }),

  outboxGet: (id: string): Promise<OutboxRecord | undefined> => transact(OUTBOX_STORE, 'readonly', (store) => requestOf(store.get(id))),

  outboxGetAll: (): Promise<OutboxRecord[]> => transact(OUTBOX_STORE, 'readonly', (store) => requestOf(store.getAll())),

  outboxUpdate: (id: string, patch: Partial<OutboxRecord>): Promise<void> =>
    transact(OUTBOX_STORE, 'readonly', (store) => requestOf(store.get(id))).then((existing) => {
      if (!existing) {
        return Promise.reject(new Error('OUTBOX_NOT_FOUND'))
      }
      return transact(OUTBOX_STORE, 'readwrite', (store) => {
        store.put({ ...existing, ...patch })
      })
    }),

  outboxDelete: (id: string): Promise<void> => transact(OUTBOX_STORE, 'readwrite', (store) => requestOf(store.delete(id))),

  draftPut: (record: DraftRecord): Promise<void> =>
    transact(DRAFT_STORE, 'readwrite', (store) => {
      store.put(record)
    }),

  draftGet: (id: string): Promise<DraftRecord | undefined> => transact(DRAFT_STORE, 'readonly', (store) => requestOf(store.get(id))),

  draftGetAll: (): Promise<DraftRecord[]> => transact(DRAFT_STORE, 'readonly', (store) => requestOf(store.getAll())),

  draftRemove: (id: string): Promise<void> => transact(DRAFT_STORE, 'readwrite', (store) => requestOf(store.delete(id))),

  draftListExpired: (now: number): Promise<string[]> =>
    transact(DRAFT_STORE, 'readonly', (store) =>
      requestOf(store.getAll()).then((drafts) => drafts.filter((draft) => draft.expiresAt <= now).map((draft) => draft.id))
    ),

  draftPruneExpired: (now: number): Promise<void> =>
    idb.draftListExpired(now).then((ids) => Promise.all(ids.map((id) => idb.draftRemove(id))).then(() => undefined))
}
