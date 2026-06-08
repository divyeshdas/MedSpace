export function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const matrix: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = 1 + Math.min(matrix[i - 1][j], matrix[i][j - 1], matrix[i - 1][j - 1])
      }
    }
  }

  return matrix[m][n]
}

export function findClosestMatch(
  query: string,
  candidates: string[]
): { match: string; distance: number } | null {
  let best: { match: string; distance: number } | null = null

  for (const candidate of candidates) {
    const distance = levenshtein(query, candidate)
    if (!best || distance < best.distance) {
      best = { match: candidate, distance }
    }
  }

  if (best && best.distance <= 2) return best
  return null
}

export function isLookalike(a: string, b: string): boolean {
  const na = a.toLowerCase()
  const nb = b.toLowerCase()
  return levenshtein(na, nb) <= 3 && Math.abs(na.length - nb.length) <= 3
}
