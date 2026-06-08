import { MinHeap } from './MinHeap.js'

export interface DrugEntry {
  id: number
  brand: string
  generic: string
  category: string
  dose: string
  maxDaily: string
  description: string
  lookalike: string | null
  frequency: number
}

interface TrieNode {
  children: Map<string, TrieNode>
  topK: DrugEntry[]
  isEnd: boolean
  drug?: DrugEntry
}

export class Trie {
  private root: TrieNode
  private k: number
  private nodeCount: number = 0
  private drugCount: number = 0
  private buildTimeMs: number = 0

  constructor(k = 5) {
    this.k = k
    this.root = this.createNode()
  }

  private createNode(): TrieNode {
    this.nodeCount++
    return { children: new Map(), topK: [], isEnd: false }
  }

  private insertWord(word: string, drug: DrugEntry): void {
    let node = this.root
    for (const char of word.toLowerCase()) {
      if (!node.children.has(char)) {
        node.children.set(char, this.createNode())
      }
      node = node.children.get(char)!
      const heap = new MinHeap<DrugEntry>((a, b) => a.frequency - b.frequency, this.k)
      for (const existing of node.topK) {
        if (existing.id !== drug.id) heap.insert(existing)
      }
      heap.insert(drug)
      node.topK = heap.toSortedArray()
    }
    node.isEnd = true
    node.drug = drug
  }

  insert(drug: DrugEntry): void {
    this.insertWord(drug.brand.toLowerCase(), drug)
    if (drug.generic.toLowerCase() !== drug.brand.toLowerCase()) {
      this.insertWord(drug.generic.toLowerCase(), drug)
    }
    this.drugCount++
  }

  search(prefix: string): DrugEntry[] {
    let node = this.root
    for (const char of prefix.toLowerCase()) {
      if (!node.children.has(char)) return []
      node = node.children.get(char)!
    }
    return node.topK
  }

  buildFromList(drugs: DrugEntry[]): void {
    const start = Date.now()
    const sorted = [...drugs].sort((a, b) => b.frequency - a.frequency)
    for (const drug of sorted) {
      this.insert(drug)
    }
    this.buildTimeMs = Date.now() - start
  }

  getStats(): { nodeCount: number; drugCount: number; buildTimeMs: number } {
    return { nodeCount: this.nodeCount, drugCount: this.drugCount, buildTimeMs: this.buildTimeMs }
  }
}
