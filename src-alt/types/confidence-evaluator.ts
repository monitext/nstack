export type FrameConfidenceScore = {
  score: number       // 0 → 1
  factors: ConfidenceFactor[]
}

export type ConfidenceFactor = {
  id: string
  weight: number      // signed contribution
  reason: string
}
