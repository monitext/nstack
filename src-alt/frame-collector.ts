import { FrameConfidenceEvaluator } from "./confidence-eval"
import { StackFrameDescriptor } from "./stack-frame"
import { EvaluatedFrame, EvaluatedFrameCollection, FrameCollection } from "./types/frame-collector"
import { StackFrame } from "./types/stack-frame"

export class FrameCollector {
  readonly stack: StackFrame[]

  constructor(err: Error) {
    this.stack = FrameCollector.collect(err)
  }

  *[Symbol.iterator](): Generator<StackFrame, void, unknown> {
    for (const frame of this.stack) {
      yield frame
    }
  }

  *entries(): Generator<[number, StackFrame], void, unknown> {
    for (const frame of this.stack.entries()) {
      yield frame
    }
  }

  map<T>(fn: (value: StackFrame, index: number) => T): T[] {
    return this.stack.map(fn)
  }

  withConfidence(): EvaluatedFrame[] {
    return this.map(frame => ({
      frame,
      confidence: FrameConfidenceEvaluator.evaluate(frame)
    }))
  }

  private static collect(err: Error): StackFrame[] {
    if (!err.stack) return []

    return err.stack
      .split("\n")
      .map(StackFrameDescriptor.from)
      .filter(f => f.filePath !== null)
  }
}