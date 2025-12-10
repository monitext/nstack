import { StackResult } from '../types/look-types';
import { StackTrace } from '../types/stack-types';
import { StackReadParameter } from '../types/utils-types';
import { StackLine } from "./stack";

/**
 * Utility class for processing and reading JavaScript error stacks.
 */
export class StackUtils {

    /**
     * Finds a method in a stack trace, optionally applying an offset.
     *
     * @param param - Parameters for stack lookup.
     * @param param.stack - The stack trace to search.
     * @param param.method - Method name or regex to find in the stack.
     * @param param.offset - Optional offset from the found method.
     * @returns A tuple `[index, StackLine]` of the matched frame or `null` if not found.
     */
    public static findMethodInStack(param: StackReadParameter): StackResult | null {
        const { stack, offset, method: target } = param;

        for (let i = 0; i < stack.length; i++) {
            const line = stack[i];
            const method = line.method;

            if (!method) continue;

            if (method.match(target)) {
                if (typeof offset === "number" && stack[i + offset]) {
                    return [i + offset, stack[i + offset]];
                }
                return [i, line];
            }
        }

        return null;
    }

    /**
     * Processes an Error object into a structured stack trace.
     *
     * @param error - The Error object to process.
     * @returns An array of `StackLine` objects representing the stack frames,
     *          or `null` if the error has no stack.
     */
    public static processError(error: Error): StackTrace | null {
        if (!error.stack) return null;

        return error.stack
            .trimStart()
            .replace(/^Error/i, "")
            .split("\n")
            .filter(s => s.trim() !== "")
            .map(s => new StackLine(s));
    }
}
