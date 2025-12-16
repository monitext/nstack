import { FrameConfidenceScore } from "../types/confidence-evaluator";
import { FrameCollection } from "../types/frame-collector";
import { StackSearchCriteria } from "../types/lookup-functions";
import { StackFrame } from "../types/stackframe-descriptor";
import { Nullable } from "../types/type-utils";
import { FrameConfidenceEvaluator } from "./confidence-evaluator";
import { detectRuntime } from "./detect-runtime";
import { FrameCollector } from "./frame-collector";

/**
 * Searches a stack trace or frame collection for a frame matching the given criteria.
 *
 * You can search by:
 * - `symbol`: function name or RegExp to match
 * - `offset`: absolute index in the stack, or relative index from the matched frame
 *
 * If both `symbol` and `offset` are provided, `offset` is **relative to the matched frame**.
 *
 * @template T - The type of the error or frame collection to search.
 * @param {StackSearchCriteria<T>} criteria - The criteria to locate the desired frame.
 * @returns {Nullable<StackFrame>} - The matched frame, or `null` if not found.
 *
 * @example
 * // Search by function name
 * const frame = findStackFrame({
 *   error,
 *   symbol: "myFunc"
 * });
 *
 * @example
 * // Search by stack offset
 * const frame = findStackFrame({
 *   error,
 *   offset: 2
 * });
 *
 * @example
 * // Search with both symbol and offset
 * const frame = findStackFrame({
 *   error,
 *   symbol: /render/,
 *   offset: 1
 * });
 */
export function findStackFrame<T extends Error | FrameCollection>(
  criteria: StackSearchCriteria<T>
): Nullable<StackFrame> {
  const { error, options } = criteria;
  const offset = "offset" in criteria ? criteria.offset : undefined;
  const symbol = "symbol" in criteria ? criteria.symbol : undefined;

  const { stack } = error instanceof Error ? new FrameCollector(error) : error;

  if (offset != null && symbol == null) {
    return stack[offset] ?? null;
  }

  if (offset == null && symbol == null) {
    console.warn(
      "[monitext/nstack]: no offset nor symbol provided to: `findStackFrame`"
    );
    return null;
  }

  if (symbol == null) return null;

  for (const [i, frame] of stack.entries()) {
    let { method } = frame;

    if (options?.firefoxCompatibility) {
      const { filePath } = frame;
      const firefoxPrefix = filePath?.match(/^[^\/\\@]+@/)?.[0];
      if (firefoxPrefix) {
        method = firefoxPrefix + (method ?? "");
      }
    }

    if (method == null || method.trim() === "") {
      continue;
    }

    const match =
      typeof symbol === "string"
        ? method.includes(symbol)
        : symbol.test(method);

    if (!match) continue;

    const targetIndex = offset == null ? i : i + offset;
    return stack[targetIndex] ?? frame;
  }

  return null;
}

export interface StackFrameResolution<T> {
  error: T;
  options?: {
    firefoxCompatibility?: boolean;
    evaluateAllPossibilities?: boolean;
    evaluateAllPosWith?: (
      param: Array<[StackFrame, FrameConfidenceScore]>
    ) => StackFrame | null;
  };
  strategies: Array<
    {
      runtime?: Set<"node" | "bun" | "deno" | "browser">;
      accept?: (frame: StackFrame, collection: FrameCollection) => boolean;
    } & (
      | { symbol?: string | RegExp; offset: number }
      | { symbol: string | RegExp; offset?: number }
    )
  >;
}

export function resolveStackFrame<T extends Error | FrameCollection>(
  plan: StackFrameResolution<T>
): StackFrame | null {
  const { error, options, strategies } = plan;

  if (!strategies || strategies.length === 0) {
    console.warn(
      "[monitext/nstack]: no strategies provided to: `resolveStackFrame`"
    );
    return null;
  }

  if (!error) {
    return null;
  }

  const buf = [];
  const collection: FrameCollection =
    error instanceof Error ? new FrameCollector(error) : error;

  for (const strategy of strategies) {
    const { runtime, symbol, offset, accept } = strategy;

    if (Array.isArray(runtime) && !runtime.includes(detectRuntime())) {
      continue;
    }

    const frame = findStackFrame({
      error: collection,
      symbol: symbol as NonNullable<typeof symbol>,
      offset: offset as NonNullable<typeof offset>,
      options,
    });

    if (frame == null) {
      continue;
    }

    if (typeof accept === "function" && accept(frame, collection) !== true) {
      continue;
    }

    if (options?.evaluateAllPossibilities === true) {
      buf.push(frame);
    } else {
      return frame;
    }
  }

  if (buf.length === 1) {
    return buf[0];
  } else if (buf.length > 1) {
    const evalutedFrames: [StackFrame, FrameConfidenceScore][] = buf.map(
      (frame) => [frame, new FrameConfidenceEvaluator(frame)]
    );
    if (typeof options?.evaluateAllPosWith === "function") {
      return options.evaluateAllPosWith(evalutedFrames);
    }
    
    const best = evalutedFrames.reduce((prev, cur) => {
      const { score: prevScore } = prev[1]
      const { score } = cur[1];
      
      if(prevScore == null || score > prevScore){
        return cur
      }

      return prev
    })

    return best[0];
  }

  return null;
}
