import { IntermediateStackFrame, StackFrame } from '../types/stackframe-descriptor';
import { CoordinateDescriptor } from "./coordinate-descriptor";
import { Nullable } from "../types/type-utils";

export class StackFrameDescriptor implements StackFrame {

    rawInput!: string
    filePath!: Nullable<string>
    rawCoord!: Nullable<string>
    method!: Nullable<string>
    line!: Nullable<number>
    col!: Nullable<number>

    constructor(raw: string | StackFrame) {
        Object.assign(this, typeof raw === "string" ? StackFrameDescriptor.from(raw) : raw)
    }

    public static from(raw: string): StackFrame {
        const rawInputs = raw.trim().split(/^at\s|\sat\s|\(?at\s|\sat\)?/).filter(i => i.trim() != "");
        const inputChunks = rawInputs.map(i => StackFrameDescriptor.reversePathExtraction(i))
        const [_, bestChunk] = StackFrameDescriptor.rankPaths(inputChunks);
        const method = StackFrameDescriptor.tryMethodExtractionOn(rawInputs[_], bestChunk);
        return {
            rawInput: raw,
            ...bestChunk,
            method
        }
    }

    private static tryMethodExtractionOn(raw: string, chunk: IntermediateStackFrame): Nullable<string> {
        if (!chunk.filePath) {
            return null
        }
        const pathStartIndex = raw.indexOf(chunk.filePath);

        if (pathStartIndex <= 0) {
            return null;
        }

        // Get everything before the path
        let before = raw.slice(0, pathStartIndex).trim();

        // Remove leading "at "
        before = before.replace(/^at\s+/, "");

        // Remove trailing and leading ")|("
        before = before.replace(/^\(|\($/g, "").trim();

        // Clean method separators like @
        before = before.replace(/@$/, "").trim();

        // If nothing remains, it's anonymous or not a method
        if (!before || before.match(/^[\(\)\s]+$/)) {
            return null;
        }

        return before;
    }

    private static rankingPoints = {
        oneThirtyieth: 0.03,
        oneTenth: 0.1,
        half: 0.5,
        one: 1,
        hundread: 100
    }

    private static rankPaths(paths: IntermediateStackFrame[]): [index: number, frame: IntermediateStackFrame] {
        if (paths.length === 1) {
            return [0, paths[0]]
        }

        let bestIndex = 0;
        let bestScore: Nullable<number> = null;
        let points = StackFrameDescriptor.rankingPoints

        for (const [index, path] of paths.entries()) {
            const current = path.filePath;

            if (current === null) {
                continue
            }

            // Base score (position weight)
            let score = points.half / (index + 1);

            // Boost longer, nested paths
            score += (current.match(/[\/\\]/g)?.length ?? 0) * points.oneThirtyieth;

            // Penalize anonymous / virtual frames: <anonymous>
            if (/<[^>]+>/.test(current)) {
                score -= points.one;
            }

            // Penalize native frames: native:1:1
            if (/^native/.test(current)) {
                score -= (points.half - points.oneTenth);
            }

            // Boost filesystem-like paths
            if (/[\/\\]/.test(current)) {
                score += points.half;
            }

            // Boost paths with real extensions
            if (/\.[a-z0-9]+$/i.test(current)) {
                score += points.half;
            }

            // Pick best scored entry (tie-breaker = longer path)
            if (
                bestScore === null
                || score > bestScore
                || (score == bestScore && (
                    current.length > (paths[bestIndex].filePath?.length ?? 0)
                ))
            ) {
                bestIndex = index;
                bestScore = score;
            }
        }

        return [bestIndex, paths[bestIndex]]
    }

    public static reversePathExtraction(raw: string): IntermediateStackFrame {
        const rawInput = raw.trim();
        const coords = new CoordinateDescriptor(raw);

        if (!coords.rawCoord) {
            return {
                filePath: null,
                ...coords
            }
        }

        const rawPath = rawInput.slice(0, rawInput.lastIndexOf(coords.rawCoord)).split("");
        const result = [];

        let justifiableSpace: boolean;

        /**
         * Walk the rawPath backward,
         * Append to result whatever that is not a space (" ") character
         * If a space is found, try to justify it with a "/" or a "\" further ahead
         * If a space is justifed, flush it to result, along with any direct neighbouring space
         * If a space char cannot be justified, break and return the result in reverse (forward)
        */
        for (let i = rawPath.length - 1; i >= 0; i--) {
            let current = rawPath[i];
            if (current != " ") {
                result.push(current);
                continue;
            }

            justifiableSpace = false;

            for (let y = i; y >= 0; y--) {
                let next = rawPath[y];
                if (next == "/" || next == "\\") {
                    justifiableSpace = true;
                    break
                }
            }

            if (!justifiableSpace) {
                break;
            }

            ++i;

            while (rawInput[i - 1] === " ") {
                result.push(rawInput[--i]);
            }
        }

        return {
            filePath: StackFrameDescriptor.normalize(result.reverse().join("")),
            ...coords
        }
    }

    private static normalize(path: string) {
        return path.replace(/^\(|\)$/g, "");
    }
}


const mock = [
    "at myFunc (/usr/local/app/src/index.js:10:2)",
    "at doThing (C:\\Projects\\App\\src\\main.ts:5:1)",
    "at spacedMethod (C:/Program Files/My App/file.js:22:7)",
    "fetchData https://example.com/assets/app.js:99:13",
    "at buildStep (git+ssh://repo.com/project/src/mod.ts:14:3)",
    "crazy <comp> 💀/dev/http:thing/C:/tmp  /🔥/file.ts:3:1",
    "at (eval mockup /🔥/file.ts:3:1 (at <anonumous>2:5)",
    "at (less:1:1) at mock (git+ssh://repo.com/project/src/mod.ts:14:3)"
].map(s => new StackFrameDescriptor(s))

