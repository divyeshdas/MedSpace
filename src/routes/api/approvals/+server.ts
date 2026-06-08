import { json } from '@sveltejs/kit'
import { LRUCache } from 'lru-cache'

export interface DrugApproval {
  name: string
  date: string
  company: string
}

const FALLBACK_APPROVALS: DrugApproval[] = [
  { name: 'Leqembi', date: 'Jan 2024', company: 'Eisai' },
  { name: 'Talvey', date: 'Sep 2023', company: 'J&J' },
  { name: 'Elrexfio', date: 'Aug 2023', company: 'Pfizer' },
  { name: 'Rivfloza', date: 'Jan 2024', company: 'Novo Nordisk' },
  { name: 'Alhemo', date: 'Nov 2023', company: 'Novo Nordisk' },
  { name: 'Jaypirca', date: 'Jan 2023', company: 'Eli Lilly' },
  { name: 'Omvoh', date: 'Jul 2023', company: 'Eli Lilly' },
  { name: 'Rezdiffra', date: 'Mar 2024', company: 'Madrigal' },
  { name: 'Winrevair', date: 'Mar 2024', company: 'Merck' },
  { name: 'Hympavzi', date: 'Oct 2024', company: 'Pfizer' }
]

const approvalsCache = new LRUCache<string, DrugApproval[]>({
  max: 1,
  ttl: 1000 * 60 * 60
})

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatDate(raw: string): string {
  if (!raw || raw.length < 6) return ''
  const year = raw.slice(0, 4)
  const month = parseInt(raw.slice(4, 6), 10)
  if (!month || month < 1 || month > 12) return ''
  return `${MONTHS[month - 1]} ${year}`
}

async function fetchApprovals(): Promise<DrugApproval[]> {
  const res = await fetch(
    'https://api.fda.gov/drug/drugsfda.json?sort=submissions.submission_status_date:desc&limit=20'
  )
  if (!res.ok) throw new Error(`OpenFDA returned ${res.status}`)

  const data = await res.json()
  const results = data.results ?? []

  const seen = new Set<string>()
  const approvals: DrugApproval[] = []

  for (const entry of results) {
    const name: string =
      entry.openfda?.brand_name?.[0] ?? entry.products?.[0]?.brand_name ?? 'Unknown'

    if (!name || name === 'Unknown' || seen.has(name)) continue
    seen.add(name)

    approvals.push({
      name,
      company: entry.sponsor_name ?? '',
      date: formatDate(entry.submissions?.[0]?.submission_status_date ?? '')
    })

    if (approvals.length >= 15) break
  }

  return approvals
}

export async function GET() {
  const cached = approvalsCache.get('approvals')
  if (cached) return json({ results: cached })

  try {
    const results = await fetchApprovals()
    approvalsCache.set('approvals', results)
    return json({ results })
  } catch {
    return json({ results: FALLBACK_APPROVALS })
  }
}
