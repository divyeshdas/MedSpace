import type { Handle } from '@sveltejs/kit'

// Building the Trie takes ~900ms for 10.9k drugs. Kick it off at server boot so it
// overlaps with the first page render instead of landing on the user's first keystroke.
import('$lib/engine')

export const handle: Handle = async ({ event, resolve }) => {
  const start = performance.now()
  const response = await resolve(event)
  response.headers.set('X-Response-Time', `${(performance.now() - start).toFixed(2)}ms`)
  return response
}
