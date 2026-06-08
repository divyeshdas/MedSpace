import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { Trie } from '../src/lib/engine/Trie.js'
import { levenshtein, isLookalike } from '../src/lib/engine/editDistance.js'
import { InteractionGraph } from '../src/lib/engine/InteractionGraph.js'
import { interactions } from '../src/lib/data/interactions.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const drugs = JSON.parse(
  readFileSync(join(__dirname, '../src/lib/data/drugs.json'), 'utf-8')
)

const trie = new Trie(5)
trie.buildFromList(drugs)

const graph = new InteractionGraph()
graph.load(interactions)

let passed = 0
let failed = 0

function test(name: string, result: boolean) {
  if (result) {
    console.log(`  PASS  ${name}`)
    passed++
  } else {
    console.log(`  FAIL  ${name}`)
    failed++
  }
}

console.log('\nRunning engine tests...\n')

test('1. trie.search("para") returns array length > 0',
  trie.search('para').length > 0)

test('2. trie.search("para")[0].brand includes "para" (case-insensitive)',
  trie.search('para')[0]?.brand?.toLowerCase().includes('para') ?? false)

test('3. trie.search("ibu").some(d => brand includes "ibu")',
  trie.search('ibu').some(d => d.brand.toLowerCase().includes('ibu')))

test('4. trie.search("xyz123") returns []',
  trie.search('xyz123').length === 0)

test('5. levenshtein("paracetamol", "paracetamool") === 1',
  levenshtein('paracetamol', 'paracetamool') === 1)

test('6. levenshtein("aspirin", "aspirin") === 0',
  levenshtein('aspirin', 'aspirin') === 0)

test('7. levenshtein("ibuprofen", "ibuproffen") === 1',
  levenshtein('ibuprofen', 'ibuproffen') === 1)

test('8. isLookalike("celebrex", "cerebyx") === true',
  isLookalike('celebrex', 'cerebyx'))

test('9. getInteraction("Ibuprofen", "Aspirin") severity === "danger"',
  graph.getInteraction('Ibuprofen', 'Aspirin')?.severity === 'danger')

test('10. getInteraction("Aspirin", "Ibuprofen") severity === "danger" (reverse)',
  graph.getInteraction('Aspirin', 'Ibuprofen')?.severity === 'danger')

test('11. getInteraction("Metformin", "Amlodipine") severity === "safe"',
  graph.getInteraction('Metformin', 'Amlodipine')?.severity === 'safe')

test('12. getInteraction("Unknown", "Drug") === null',
  graph.getInteraction('Unknown', 'Drug') === null)

console.log(`\nResults: ${passed}/12 passed`)

const stats = trie.getStats()
const memMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)
console.log(`\nEngine stats:`)
console.log(`  Trie build time: ${stats.buildTimeMs}ms`)
console.log(`  Trie nodes:      ${stats.nodeCount}`)
console.log(`  Drugs indexed:   ${stats.drugCount}`)
console.log(`  Memory (heap):   ${memMB}MB`)

if (failed > 0) process.exit(1)
