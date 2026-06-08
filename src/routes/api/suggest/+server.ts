import { json } from '@sveltejs/kit'
import { trie } from '$lib/engine'
import { suggestCache } from '$lib/server/cache'
import { findClosestMatch } from '$lib/engine/editDistance'
import drugsRaw from '$lib/data/drugs.json' with { type: 'json' }

export async function GET({ url }: { url: URL }) {
  const start = performance.now()
  const q = url.searchParams.get('q')?.trim().toLowerCase() ?? ''

  if (q.length < 1) return json({ results: [] })

  const cached = suggestCache.get(q)
  if (cached) {
    return json(
      { results: cached },
      { headers: { 'X-Cache': 'HIT', 'X-Response-Time': `${(performance.now() - start).toFixed(2)}ms` } }
    )
  }

  let results = trie.search(q)
  let corrected = false
  let original = ''

  if (results.length === 0 && q.length >= 3) {
    const allNames = (drugsRaw as any[]).map((d: any) => d.brand.toLowerCase())
    const closest = findClosestMatch(q, allNames)
    if (closest) {
      results = trie.search(closest.match)
      corrected = true
      original = q
    }
  }

  suggestCache.set(q, results)

  return json(
    { results, ...(corrected ? { corrected: true, original } : {}) },
    { headers: { 'X-Cache': 'MISS', 'X-Response-Time': `${(performance.now() - start).toFixed(2)}ms` } }
  )
}
