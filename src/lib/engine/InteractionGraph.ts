interface Interaction {
  severity: 'safe' | 'moderate' | 'danger'
  message: string
}

export class InteractionGraph {
  private graph: Map<string, Map<string, Interaction>> = new Map()

  load(data: Record<string, Interaction>): void {
    for (const [key, interaction] of Object.entries(data)) {
      const [drugA, drugB] = key.split('-').map(d => d.toLowerCase())
      if (!drugA || !drugB) continue

      if (!this.graph.has(drugA)) this.graph.set(drugA, new Map())
      if (!this.graph.has(drugB)) this.graph.set(drugB, new Map())

      this.graph.get(drugA)!.set(drugB, interaction)
      this.graph.get(drugB)!.set(drugA, interaction)
    }
  }

  getInteraction(drug1: string, drug2: string): Interaction | null {
    const d1 = drug1.toLowerCase()
    const d2 = drug2.toLowerCase()

    return (
      this.graph.get(d1)?.get(d2) ??
      this.graph.get(d2)?.get(d1) ??
      null
    )
  }
}
