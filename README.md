# MedSpace

Drug search and interaction checker powered by a custom Trie engine.

**Live:** https://medspace-orcin.vercel.app

## Features
- Prefix autocomplete with typo tolerance
- Drug interaction checker with severity ratings
- Lookalike drug name warnings
- Sub-2ms responses on cached queries

## Data structures & algorithms

### Trie + Min-Heap (`src/lib/engine/Trie.ts`, `MinHeap.ts`)
A standard prefix Trie (`Map<string, TrieNode>` per node), but each node also keeps a **bounded Min-Heap** of the top-K drugs that pass through it, ordered by search frequency. On insert, the heap evicts the lowest-frequency entry once it exceeds size K, so each node always holds a pre-sorted shortlist. Autocomplete is then just a node walk — O(m) for a prefix of length m — with **zero scanning or sorting at query time**, since the answer is already sitting at the node.

### LRU cache (`src/lib/server/cache.ts`, via `lru-cache`)
Sits in front of the Trie and caches the suggestion results for recent prefixes (500 entries, 5-minute TTL). High-frequency prefixes like "par" or "ibu" resolve in under 1ms straight from the cache, skipping the Trie walk entirely.

### Levenshtein edit distance (`src/lib/engine/editDistance.ts`)
Classic O(m·n) dynamic-programming edit distance over a 2D matrix. Two uses:
1. **Typo correction** — when a prefix returns no Trie matches, the closest drug name within 2 edits is suggested instead.
2. **Lookalike detection** — flags drug name pairs that are dangerously similar (e.g. "Hydroxyzine" vs "Hydralazine"), surfaced as a warning badge on the drug card.

### Interaction graph (`src/lib/engine/InteractionGraph.ts`)
Drug-drug interactions are modeled as an **undirected graph using adjacency maps** (`Map<string, Map<string, Interaction>>`). Loading an interaction inserts edges in both directions, so a severity/message lookup between any two drugs is an O(1) double map access regardless of how many drugs or interactions exist.

## Stack
SvelteKit · TypeScript · lru-cache · OpenFDA · Railway

## Performance
Measured with autocannon, 100 concurrent connections:

| Endpoint | p50 | p99 | RPS |
|---|---|---|---|
| /api/suggest (cache hit) | 2ms | 7ms | 35,000+ |
| /api/suggest (cache miss) | 2ms | 9ms | 32,000+ |
| /api/interact | 1ms | 5ms | 30,000+ |

Cache hit rate: ~100% on repeated queries within TTL window

## Run locally
```bash
pnpm install
pnpm run seed
pnpm dev
```

## Author
Divyesh Das
