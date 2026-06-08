import { json } from '@sveltejs/kit'
import drugsRaw from '$lib/data/drugs.json' with { type: 'json' }
import { drugCache } from '$lib/server/cache'

export async function GET({ params }: { params: { id: string } }) {
  const start = performance.now()
  const id = params.id

  try {
    const cached = drugCache.get(id)
    if (cached) {
      return json(cached, {
        headers: { 'X-Cache': 'HIT', 'X-Response-Time': `${(performance.now() - start).toFixed(2)}ms` }
      })
    }

    const drug = (drugsRaw as any[]).find(d => String(d.id) === id)
    if (!drug) return new Response('Not found', { status: 404 })

    drugCache.set(id, drug)
    return json(drug, {
      headers: { 'X-Cache': 'MISS', 'X-Response-Time': `${(performance.now() - start).toFixed(2)}ms` }
    })
  } catch {
    return new Response('Internal server error', { status: 500 })
  }
}
