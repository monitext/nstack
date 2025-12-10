import { StackUtils } from "./utils";
import { detectRuntime } from "./runtime";
import { StackFrame } from "../types/stack-types";
import { LookUpParameter, StackResult } from "../types/look-types";


/**
 * Lookup a method in the stack trace of an error.
 * @param param0 - The lookup parameters: error, method, and offset.
 * @returns A tuple of [index, StackFrame] if found, or null otherwise.
 */
export function lookUp({ err, method, offset }: LookUpParameter): [number, StackFrame] | null {
    const stack = StackUtils.processError(err);
    if (!stack) return null;
    return StackUtils.findMethodInStack({ method, offset, stack }) as [number, StackFrame] | null;
}

/**
 * Defines a single lookup configuration.
 */
export type LookUp =
  | {
      mode: "index";
      err: Error;
      index: number;
      /**
       * Optional predicate to validate the result before returning.
       */
      predicate?: (result: StackResult) => boolean;
    }
  | {
      mode: "method";
      err: Error;
      method: string | RegExp;
      offset: number;
      /**
       * Optional predicate to validate the result before returning.
       */
      predicate?: (result: StackResult) => boolean;
    };

/**
 * Top-level lookup array, annotated with runtime.
 */
export type AdaptiveLookUp = (LookUp & { runtime?: "node" | "browser" | "deno" | "bun" })[];

/**
 * 🚀 Performs an adaptive stack lookup based on the current runtime.
 *
 * Iterates through each provided lookup configuration:
 * 1. Skips if runtime does not match.
 * 2. Processes the error stack.
 * 3. Executes the lookup based on 'mode' (index or method).
 * 4. Applies optional predicate if provided.
 * 5. Returns the first successful result.
 *
 * @param lookups Array of lookup configurations.
 * @returns The first successful StackResult ([index, StackFrame]) or null if none matched.
 */
export function adaptiveLookUp(lookups: AdaptiveLookUp): StackResult | null {
    const currentRuntime = detectRuntime();

    for (const lookup of lookups) {
        if (lookup.runtime && lookup.runtime !== currentRuntime) continue;

        const stack = StackUtils.processError(lookup.err);
        if (!stack) continue;

        let result: StackResult | null = null;

        if (lookup.mode === "method") {
            result = StackUtils.findMethodInStack({
                method: lookup.method,
                offset: lookup.offset,
                stack
            }) as StackResult | null;
        } else if (lookup.mode === "index") {
            if (lookup.index >= 0 && lookup.index < stack.length) {
                result = [lookup.index, stack[lookup.index]];
            }
        }

        if (result) {
            if (lookup.predicate && !lookup.predicate(result)) continue;
            return result;
        }
    }

    return null;
}
