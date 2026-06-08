import { json } from '@sveltejs/kit'
import { engineStats } from '$lib/engine'
import { getCacheStats } from '$lib/server/cache'

export async function GET() {
  try {
    return json({
      status: 'ok',
      trie: engineStats,
      cache: getCacheStats(),
      uptime: process.uptime(),
      memory: process.memoryUsage()
    })
  } catch {
    return json({ status: 'ok', uptime: process.uptime() })
  }
}
