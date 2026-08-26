import { json } from '@sveltejs/kit'
import { trie } from '$lib/engine'
import { suggestCache } from '$lib/server/cache'
import { findClosestMatch } from '$lib/engine/editDistance'
import drugsRaw from '$lib/data/drugs.json' with { type: 'json' }

export async function GET({ url }: { url: URL }) {
  const start = performance.now()
  const q = url.searchParams.get('q')?.trim().toLowerCase() ?? ''

  if (q.length < 1) return json({ results: [] })

  const timing = () => `${(performance.now() - start).toFixed(2)}ms`

  const cached = suggestCache.get(q)
  if (cached) {
    if (cached.length === 0) return notFound(q, { 'X-Cache': 'HIT', 'X-Response-Time': timing() })
    return json(
      { results: cached },
      { headers: { 'X-Cache': 'HIT', 'X-Response-Time': timing() } }
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

  if (results.length === 0) {
    return notFound(q, { 'X-Cache': 'MISS', 'X-Response-Time': timing() })
  }

  return json(
    { results, ...(corrected ? { corrected: true, original } : {}) },
    { headers: { 'X-Cache': 'MISS', 'X-Response-Time': timing() } }
  )
}

function notFound(q: string, headers: Record<string, string>) {
  return json(
    {
      status: 404,
      error: 'Not Found',
      message: `No drug matching "${q}" was found.`,
      results: []
    },
    { status: 404, headers }
  )
}
