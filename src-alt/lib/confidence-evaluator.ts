import { FrameConfidenceScore, ConfidenceFactor } from "../types/confidence-evaluator"
import { StackFrame } from "../types/stackframe-descriptor"

export class FrameConfidenceEvaluator implements FrameConfidenceScore {

  constructor(input: StackFrame){
    Object.assign(this, FrameConfidenceEvaluator.evaluate(input));
  }
  score!: number;
  factors!: ConfidenceFactor[];

  static evaluate(frame: StackFrame): FrameConfidenceScore {
    const factors: ConfidenceFactor[] = []
    let score = 0

    // additive model
    function add(id: string, weight: number, reason: string) {
      factors.push({ id, weight, reason })
      score += weight
    }

    if (frame.filePath) {
      add("has-file", 0.3, "Frame has a resolved file path")
    }

    if (frame.line !== null) {
      add("has-line", 0.2, "Line number present")
    }

    if (frame.col !== null) {
      add("has-column", 0.1, "Column number present")
    }

    if (/[\/\\]/.test(frame.filePath ?? "")) {
      add("filesystem-path", 0.2, "Path looks like a filesystem path")
    }

    if (/<anonymous>|eval/.test(frame.rawInput)) {
      add("anonymous", -0.4, "Anonymous or eval frame")
    }

    // clamp
    score = Math.min(1, Math.max(0, score))

    return { score, factors }
  }
}
