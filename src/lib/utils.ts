import { StackLine } from "./path";

interface Param {
    method: string | RegExp,
    stack: StackLine[],
    offset: number
}

export class StackUtils {

    public static findMethodInStack(param: Param): [index: number, line: StackLine] | null {
        
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

    public static processError(error: Error): StackLine[] | null  {

        if (!error.stack) {
            return null
        }

        return error.stack
            .trimStart()
            .replace(/^Error/i, "")
            .split("\n")
            .filter(s => s.trim() != "")
            .map(s => new StackLine(s));
    }
}