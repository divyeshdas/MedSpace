import { json } from '@sveltejs/kit'
import { interactionGraph } from '$lib/engine'

export async function POST({ request }: { request: Request }) {
  const start = performance.now()
  let body: { drug1: string; drug2: string }

  try {
    body = await request.json()
  } catch {
    return new Response('Bad request', { status: 400 })
  }

  if (!body.drug1 || !body.drug2) {
    return new Response('Bad request', { status: 400 })
  }

  try {
    const result = interactionGraph.getInteraction(body.drug1, body.drug2) ?? {
      severity: 'unknown',
      message:
        'No known interaction found in our database. Always consult a pharmacist or physician before combining medications.'
    }

    return json(result, {
      headers: { 'X-Response-Time': `${(performance.now() - start).toFixed(2)}ms` }
    })
  } catch {
    return new Response('Internal server error', { status: 500 })
  }
}
