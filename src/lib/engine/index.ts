import drugsRaw from '$lib/data/drugs.json' with { type: 'json' }
import { interactions } from '$lib/data/interactions.js'
import { Trie } from './Trie.js'
import { InteractionGraph } from './InteractionGraph.js'
import type { DrugEntry } from './Trie.js'

export const trie = new Trie(5)
export const interactionGraph = new InteractionGraph()

trie.buildFromList(drugsRaw as DrugEntry[])
interactionGraph.load(interactions)

const stats = trie.getStats()
console.log(
  `[MedSpace] Trie built in ${stats.buildTimeMs}ms — ${stats.nodeCount} nodes, ${stats.drugCount} drugs indexed`
)

export const engineStats = stats
export const isReady = true
