'use client'

import { create } from 'zustand'

import { idb } from '@/lib/mitra/idb'

import type { DraftRecord } from '@/lib/mitra/idb'

const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000

interface DraftState {
  byKind: Map<string, DraftRecord>
  load: () => Promise<void>
  saveDraft: (kind: string, payload: unknown) => Promise<void>
  getDraft: (kind: string) => DraftRecord | undefined
  removeDraft: (kind: string) => Promise<void>
  hasDraft: (kind: string) => boolean
  pruneExpired: (now?: number) => Promise<void>
}

export const useDraftStore = create<DraftState>((set, get) => ({
  byKind: new Map(),

  load: async () => {
    try {
      const now = Date.now()
      const drafts = await idb.draftGetAll()
      const valid = drafts.filter((draft) => draft.expiresAt > now)
      await idb.draftPruneExpired(now)
      set({ byKind: new Map(valid.map((draft) => [draft.kind, draft])) })
    } catch {
      set({ byKind: new Map() })
    }
  },

  saveDraft: async (kind, payload) => {
    const now = Date.now()
    const record: DraftRecord = {
      id: kind,
      kind,
      payload,
      savedAt: now,
      expiresAt: now + DRAFT_TTL_MS
    }
    await idb.draftPut(record)
    set((state) => {
      const next = new Map(state.byKind)
      next.set(kind, record)
      return { byKind: next }
    })
  },

  getDraft: (kind) => get().byKind.get(kind),

  removeDraft: async (kind) => {
    await idb.draftRemove(kind)
    set((state) => {
      const next = new Map(state.byKind)
      next.delete(kind)
      return { byKind: next }
    })
  },

  hasDraft: (kind) => get().byKind.has(kind),

  pruneExpired: async (now = Date.now()) => {
    const expired = await idb.draftListExpired(now)
    for (const id of expired) {
      await idb.draftRemove(id)
      set((state) => {
        const next = new Map(state.byKind)
        next.delete(id)
        return { byKind: next }
      })
    }
  }
}))
