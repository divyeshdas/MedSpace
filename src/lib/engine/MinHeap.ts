export class MinHeap<T> {
  private heap: T[] = []
  private comparator: (a: T, b: T) => number
  private maxSize: number

  constructor(comparator: (a: T, b: T) => number, maxSize: number) {
    this.comparator = comparator
    this.maxSize = maxSize
  }

  insert(item: T): void {
    this.heap.push(item)
    this.bubbleUp(this.heap.length - 1)
    if (this.heap.length > this.maxSize) {
      this.extractMin()
    }
  }

  extractMin(): T | undefined {
    if (this.heap.length === 0) return undefined
    if (this.heap.length === 1) return this.heap.pop()

    const min = this.heap[0]
    this.heap[0] = this.heap.pop()!
    this.bubbleDown(0)
    return min
  }

  peek(): T | undefined {
    return this.heap[0]
  }

  size(): number {
    return this.heap.length
  }

  toArray(): T[] {
    return [...this.heap]
  }

  toSortedArray(): T[] {
    return [...this.heap].sort((a, b) => this.comparator(b, a))
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2)
      if (this.comparator(this.heap[index], this.heap[parent]) < 0) {
        ;[this.heap[index], this.heap[parent]] = [this.heap[parent], this.heap[index]]
        index = parent
      } else {
        break
      }
    }
  }

  private bubbleDown(index: number): void {
    const length = this.heap.length
    while (true) {
      const left = 2 * index + 1
      const right = 2 * index + 2
      let smallest = index

      if (left < length && this.comparator(this.heap[left], this.heap[smallest]) < 0) {
        smallest = left
      }
      if (right < length && this.comparator(this.heap[right], this.heap[smallest]) < 0) {
        smallest = right
      }

      if (smallest !== index) {
        ;[this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]]
        index = smallest
      } else {
        break
      }
    }
  }
}
