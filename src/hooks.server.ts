import type { Handle } from '@sveltejs/kit'

export const handle: Handle = async ({ event, resolve }) => {
  const start = performance.now()
  const response = await resolve(event)
  response.headers.set('X-Response-Time', `${(performance.now() - start).toFixed(2)}ms`)
  return response
}
