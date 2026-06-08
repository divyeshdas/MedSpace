import autocannon from 'autocannon'

const BASE = process.env.BENCH_URL ?? 'http://localhost:5173'

interface BenchResult {
  label: string
  rps: number
  p50: number
  p99: number
  total: number
  errors: number
}

function run(opts: autocannon.Options, label: string): Promise<BenchResult> {
  return new Promise((resolve, reject) => {
    const instance = autocannon(opts, (err, result) => {
      if (err) return reject(err)
      resolve({
        label,
        rps: Math.round(result.requests.mean),
        p50: result.latency.p50,
        p99: result.latency.p99,
        total: result.requests.total,
        errors: result.errors
      })
    })
    autocannon.track(instance, { renderProgressBar: true })
  })
}

async function main() {
  console.log(`\nBenchmarking ${BASE}\n`)

  const t1 = await run(
    { url: `${BASE}/api/suggest?q=para`, connections: 100, duration: 10 },
    'Suggest cold (cache miss)'
  )

  const t2 = await run(
    { url: `${BASE}/api/suggest?q=para`, connections: 100, duration: 10 },
    'Suggest warm (cache hit)'
  )

  const t3 = await run(
    {
      url: `${BASE}/api/interact`,
      method: 'POST',
      body: JSON.stringify({ drug1: 'Ibuprofen', drug2: 'Aspirin' }),
      headers: { 'content-type': 'application/json' },
      connections: 50,
      duration: 10
    },
    'Interact endpoint'
  )

  console.log('\n─────────────────────────────────────────────────────────')
  console.log('Benchmark Results')
  console.log('─────────────────────────────────────────────────────────')

  for (const r of [t1, t2, t3]) {
    const hitTarget =
      r.label.includes('cold') ? r.p99 < 20 && r.rps > 200
      : r.label.includes('warm') ? r.p99 < 2 && r.rps > 500
      : r.p99 < 10 && r.rps > 300

    console.log(`\n${r.label}`)
    console.log(`  p50:    ${r.p50}ms`)
    console.log(`  p99:    ${r.p99}ms`)
    console.log(`  rps:    ${r.rps}`)
    console.log(`  total:  ${r.total}`)
    console.log(`  errors: ${r.errors}`)
    console.log(`  target: ${hitTarget ? '✓ met' : '✗ not met'}`)
  }

  console.log('\n─────────────────────────────────────────────────────────\n')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
