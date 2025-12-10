import { StackFrame } from "./stack-types";

/**
 * The return type for a successful lookup: [stack index, StackFrame]
 */
export type StackResult = [number, StackFrame];

/**
 * Parameters for a stack method lookup.
 */
export type LookUpParameter = {
    err: Error;
    method: string | RegExp;
    offset: number;
};
