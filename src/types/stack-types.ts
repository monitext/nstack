import { StackLine } from "../lib/stack";

/**
 * Represents a single line/frame in a stack trace.
 * Typically corresponds to one call site, including file, line, column, and function info.
 */
export type StackFrame = InstanceType<typeof StackLine>;

/**
 * A complete stack trace as an array of stack frames.
 */
export type StackTrace = StackFrame[];
