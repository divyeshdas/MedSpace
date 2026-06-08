import { LRUCache } from 'lru-cache'
import type { DrugEntry } from '$lib/engine/Trie'

export const suggestCache = new LRUCache<string, DrugEntry[]>({
  max: 500,
  ttl: 1000 * 60 * 5
})

export const drugCache = new LRUCache<string, DrugEntry>({
  max: 200,
  ttl: 1000 * 60 * 30
})

export function getCacheStats() {
  return {
    suggest: { size: suggestCache.size, max: 500, hitRate: null },
    drug: { size: drugCache.size, max: 200 }
  }
}
