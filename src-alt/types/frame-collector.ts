import { FrameConfidenceScore } from "./confidence-eval";
import { StackFrame } from "./stack-frame";

export interface FrameCollection {
    readonly stack: StackFrame[]
}

export type EvaluatedFrame = {
  frame: StackFrame
  confidence: FrameConfidenceScore
}

export type EvaluatedFrameCollection = EvaluatedFrame[]
