import { StackTrace } from "./stack-types";

/**
 * Parameters for reading/searching a stack trace.
 */
export interface StackReadParameter {
    /** The method name or regex to search for in the stack. */
    method: string | RegExp;

    /** The stack trace to search within. */
    stack: StackTrace;

    /** Offset from the found method in the stack. */
    offset: number;
}
