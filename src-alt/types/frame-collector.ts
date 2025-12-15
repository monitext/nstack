import { FrameConfidenceScore } from "./confidence-evaluator";
import { StackFrame } from "./stackframe-descriptor";

export interface FrameCollection {
    readonly stack: StackFrame[]
}

export type EvaluatedFrame = {
  frame: StackFrame
  confidence: FrameConfidenceScore
}

export type EvaluatedFrameCollection = EvaluatedFrame[]
