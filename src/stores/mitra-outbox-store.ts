'use client'

import { create } from 'zustand'

import { idb } from '@/lib/mitra/idb'
import { processOutbox } from '@/lib/mitra/outbox-runner'

import type { OutboxRecord } from '@/lib/mitra/idb'

export type OutboxItem = OutboxRecord

interface OutboxState {
  items: OutboxItem[]
  isSyncing: boolean
  lastSyncAt: number | null
  error: string | null
  load: () => Promise<void>
  enqueue: (input: Omit<OutboxItem, 'id'>) => Promise<string>
  remove: (id: string) => Promise<void>
  sync: () => Promise<{ sent: number; failed: number } | undefined>
}

export const useOutboxStore = create<OutboxState>((set, get) => ({
  items: [],
  isSyncing: false,
  lastSyncAt: null,
  error: null,

  load: async () => {
    try {
      const items = await idb.outboxGetAll()
      set({ items, error: null })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Gagal memuat antrean keluar'
      })
    }
  },

  enqueue: async (input) => {
    const record: OutboxItem = {
      ...input,
      id: crypto.randomUUID(),
      attempts: 0,
      lastError: null
    }
    await idb.outboxPut(record)
    set((state) => ({ items: [...state.items, record], error: null }))
    // No auto-pump: the caller owns the single send path. Pumping here raced the
    // direct submit and produced two identical submissions per user action.
    return record.id
  },

  remove: async (id) => {
    await idb.outboxDelete(id)
    set((state) => ({ items: state.items.filter((item) => item.id !== id) }))
  },

  sync: async () => {
    set({ isSyncing: true, error: null })
    try {
      const result = await processOutbox()
      await get().load()
      set({ lastSyncAt: Date.now(), isSyncing: false, error: null })
      return result
    } catch (error) {
      set({
        isSyncing: false,
        error: error instanceof Error ? error.message : 'Sinkronisasi gagal'
      })
    }
  }
}))
