# MedSpace

Drug search and interaction checker powered by a custom Trie engine.

## Features
- Prefix autocomplete with typo tolerance
- Drug interaction checker with severity ratings
- Lookalike drug name warnings
- Sub-2ms responses on cached queries

## How it works

### Trie engine
Each node in the Trie pre-stores the top-5 drug suggestions using a Min-Heap sorted by search frequency. This means search is O(m) where m is the prefix length — no scanning, no sorting at query time.

### LRU cache
An LRU cache sits in front of the Trie. Common prefixes like "par", "ibu" hit the cache in under 1ms. Cache holds 500 entries with a 5-minute TTL.

### Levenshtein edit distance
Typo correction runs when a prefix returns no Trie results. The edit distance algorithm finds the closest matching drug name within 2 character edits. Also used to detect lookalike drug names.

### Interaction graph
Drug interactions are stored as a bidirectional adjacency list. Any pair lookup is O(1) regardless of how many drugs exist.

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
