import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

interface DrugEntry {
  id: number
  brand: string
  generic: string
  category: string
  dose: string
  maxDaily: string
  description: string
  lookalike: null
  frequency: number
}

async function fetchSlice(letter: string, skip: number): Promise<{ results: any[]; total: number }> {
  const search = `generic_name:${letter}*`
  const url = `https://api.fda.gov/drug/ndc.json?search=${encodeURIComponent(search)}&limit=100&skip=${skip}`
  try {
    const res = await fetch(url)
    if (!res.ok) return { results: [], total: 0 }
    const data = await res.json()
    return { results: data.results ?? [], total: data.meta?.results?.total ?? 0 }
  } catch {
    return { results: [], total: 0 }
  }
}

function truncate(s: string | undefined, max: number): string {
  if (!s) return ''
  return s.length > max ? s.slice(0, max - 1) + '…' : s
}

function normalize(r: any): { brand: string; generic: string; category: string; dose: string; description: string } | null {
  const brand = r.brand_name?.trim()
  const generic = r.generic_name?.trim()
  if (!brand || !generic) return null

  const type: string = r.product_type ?? ''
  if (type.includes('ANIMAL') || type.includes('PLASMA') || type.includes('BULK')) return null

  const strength = r.active_ingredients?.[0]?.strength ?? ''
  const form = r.dosage_form ?? ''
  const route = r.route?.[0] ?? ''
  const dose = truncate([strength, form, route ? `(${route.toLowerCase()})` : ''].filter(Boolean).join(' — '), 60)
  const pharm = r.pharm_class?.[0] ?? r.marketing_category ?? type ?? ''
  const category = truncate(pharm.split(';')[0].split(',')[0].trim(), 60) || 'Pharmaceutical'
  const description = truncate(
    [r.product_type === 'HUMAN OTC DRUG' ? 'OTC.' : 'Prescription.', form, route ? `Administered ${route.toLowerCase()}.` : ''].filter(Boolean).join(' '),
    180
  )

  return { brand, generic, category, dose, description }
}

async function fetchLetter(letter: string, maxPerLetter: number): Promise<any[]> {
  const first = await fetchSlice(letter, 0)
  if (first.total === 0) return first.results

  const pages = Math.min(Math.ceil(Math.min(first.total, maxPerLetter) / 100), 250)
  const results = [...first.results]

  const CONCURRENCY = 8
  for (let p = 1; p < pages; p += CONCURRENCY) {
    const batch = Array.from({ length: Math.min(CONCURRENCY, pages - p) }, (_, i) => (p + i) * 100)
    const fetched = await Promise.all(batch.map(s => fetchSlice(letter, s)))
    fetched.forEach(f => results.push(...f.results))
    await new Promise(r => setTimeout(r, 200))
  }

  return results
}

async function main() {
  const letters = 'abcdefghijklmnopqrstuvwxyz'.split('')
  const MAX_PER_LETTER = 5000  // cap per letter to avoid runaway fetches

  const allRaw: any[] = []

  for (const letter of letters) {
    process.stdout.write(`  ${letter.toUpperCase()} ...`)
    const results = await fetchLetter(letter, MAX_PER_LETTER)
    allRaw.push(...results)
    process.stdout.write(` ${results.length} records (total ${allRaw.length})\n`)
    await new Promise(r => setTimeout(r, 150))
  }

  console.log(`\nNormalizing ${allRaw.length} raw records...`)

  // Normalize and deduplicate by generic name
  const seen = new Map<string, DrugEntry>()
  let idx = 0

  for (const r of allRaw) {
    const n = normalize(r)
    if (!n) continue

    const key = n.generic.toLowerCase()
    const existing = seen.get(key)
    if (!existing) {
      seen.set(key, {
        id: 0,
        brand: n.brand,
        generic: n.generic,
        category: n.category,
        dose: n.dose,
        maxDaily: 'See label',
        description: n.description,
        lookalike: null,
        frequency: 0
      })
    } else {
      // Prefer entries where brand name differs from generic (named brand)
      const existingHasBrand = existing.brand.toLowerCase() !== existing.generic.toLowerCase()
      const newHasBrand = n.brand.toLowerCase() !== n.generic.toLowerCase()
      if (!existingHasBrand && newHasBrand) {
        seen.set(key, { ...existing, brand: n.brand, category: n.category, dose: n.dose, description: n.description })
      }
    }
    idx++
  }

  // Assign sequential IDs and descending frequency
  const deduped = [...seen.values()].map((d, i) => ({
    ...d,
    id: i + 1,
    frequency: seen.size - i
  }))

  const outDir = join(__dirname, '../src/lib/data')
  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, 'drugs.json'), JSON.stringify(deduped, null, 2))

  console.log(`Seeded ${deduped.length} drugs to src/lib/data/drugs.json`)
}

main().catch(err => { console.error(err); process.exit(1) })
