export class StackFrame {
    
    method!: string | null;
    coords!: [line: number, column: number] | [line: number] | [];
    line!: number | null;
    column!: number | null;
    pathString?: string | null | undefined;
    coordString?: string | undefined;
    fullPath!: string; 

    constructor(line: string){
        Object.assign(StackFrame.parseLine(line) ?? {})
    }

    public static parseLine(raw: string) {
        const rawInputs = raw.trim()
            .split(/^at|\sat\s/g)
            .filter(i => i.trim() != "")
            .map(i => i.trim());

        const paths = rawInputs.map(input => StackFrame.backwardPathExtraction(input));

        let pathData: ReturnType<typeof StackFrame["processExtractedPath"]>;

        switch (paths.length) {
            case 0:
                return null;
            case 1:
                pathData = StackFrame.processExtractedPath(paths[0]);
                break;
            default:
                pathData = StackFrame.processExtractedPath(StackFrame.rankPaths(paths));
                break;
        }

        if (!pathData.pathString) {
            return pathData; // no method possible
        }

        const method = StackFrame.extractMethod(raw, pathData.pathString);

        return {
            ...pathData,
            method
        };
    }

    static extractMethod(raw: string, pathString: string): string | null {
        const pathIndex = raw.indexOf(pathString);

        if (pathIndex <= 0) {
            return null;
        }

        // Get everything before the path
        let before = raw.slice(0, pathIndex).trim();

        // Remove leading "at "
        before = before.replace(/^at\s+/, "");

        // Remove trailing "("
        before = before.replace(/\($/, "").trim();

        // Clean method separators like @
        before = before.replace(/@$/, "").trim();

        // If nothing remains, it's anonymous or not a method
        if (!before || before.match(/^[\(\)\s]+$/)) {
            return null;
        }

        return before;
    }


    static rankPaths(
        paths: ({ pathString: string | null; coordString: string } | null)[]
    ) {
        const point = {
            oneThirtyieth: 0.03,
            oneTenth: 0.1,
            half: 0.5,
            one: 1,
            two: 2,
            hundred: 100
        };

        let best: [number | null, number | null] = [null, null];

        for (let i = 0; i < paths.length; i++) {
            const curr = paths[i]?.pathString;

            // Base score (position weight)
            let currPoint = point.half / (i + 1);

            // Reject invalid or native frames
            if (curr == null || /^\(?native\)?/i.test(curr.trim())) {
                currPoint -= point.hundred;
                continue;
            }

            // Boost longer, nested paths
            currPoint += (curr.match(/[\/\\]/g)?.length ?? 0) * point.oneThirtyieth;

            // Penalize anonymous / virtual frames: <anonymous>
            if (/<[^>]+>/.test(curr)) {
                currPoint -= point.one;
            }

            // Boost filesystem-like paths
            if (/[\/\\]/.test(curr)) {
                currPoint += point.half;
            }

            // Boost paths with real extensions
            if (/\.[a-z0-9]+$/i.test(curr)) {
                currPoint += point.half;
            }

            // Pick best scored entry (tie-breaker = longer path)
            if (best[0] === null ||
                currPoint > best[0] ||
                (currPoint === best[0] &&
                    curr.length > (paths[best[1] ?? 0]?.pathString?.length ?? 0))) {
                best = [currPoint, i];
            }
        }

        return paths[best[1] ?? 0];
    }


    static processExtractedPath(
        param: ReturnType<typeof StackFrame["backwardPathExtraction"]>
    ) {
        return {
            fullPath: (param?.pathString ?? "") + (param?.coordString ?? ""),
            ...param,
            ...StackFrame.parseCoordinate(param?.coordString ?? "")
        }
    }

    /**
     * Extracts line and column numbers from a file path string.
     * @param path - The file path string containing optional line and column numbers.
     * @returns An object containing the line and column numbers, if not present.
     */
    private static parseCoordinate(coordStr: string) {
        const coords = coordStr.slice(1).split(":").map(Number) as
            | [line: number, column: number]
            | [line: number]
            | [];
        return {
            coords,
            line: coords[0] ?? null,
            column: coords[1] ?? (coordStr[0] ? 1 : null),
        };
    }


    static backwardPathExtraction(raw: string) {
        const coordString = StackFrame.extractCoordinateIn(raw);

        if (!coordString) {
            return null
        }

        const pathString = StackFrame.extractPathFrom({ coordString, raw })

        return { pathString, coordString }
    }

    static extractPathFrom({ raw, coordString }: { coordString: string, raw: string }) {
        const rawInput = raw.trim();
        const endPath = rawInput.indexOf(coordString);

        if (endPath < 0) {
            return null;
        }

        const input = rawInput.split("");
        const result = [];

        // Start scanning backward before the first char of coordString
        for (let i = endPath - 1; i >= 0; i--) {
            const current = input[i];

            // Non-space → part of the path
            if (current !== " ") {
                result.push(current);
                continue;
            }

            // We hit a space → check if a slash BEFORE it exist
            let justifiable = false;

            for (let y = i - 1; y > 0; y--) {
                const next = input[y];

                // If we see a slash → path is still valid
                if (/[\/\\]/.test(next)) {
                    justifiable = true
                    break;
                }
            }

            if (!justifiable) {
                break
            }

            // otherwise, preserve the space
            result.push(current);

            // flush next direct spaces
            for (let y = i - 1; y >= 0; y--) {
                const next = input[y]
                if (next != " ")
                    break;
                result.push(next);
                i--;
            }
        }

        const finalResult = result.reverse().join("");
        return finalResult !== "" ? StackFrame.normalize(finalResult) : null
    }

    /**
     * Extract the coordinate part of a stackframe
     * it does so by walking the string in reverse
     * 
     * if a number is found, it temporaly stop to look and grab ahead patern (\d|\:)
     * and push em to a temporary buffer
     * 
     * if a non matching char is found, it stop grabing ahead, and look at the buffer's content backward (to nullify the previous backward walk)
     * if it macth (:\d){2} the col is return need, else continue to start of input
     * 
     **/
    static extractCoordinateIn(raw: string) {
        const rawInput = raw.trim().split("").reverse();

        const patterns = [
            /(:\d+:\d+)$/,  // :line:column
            /(:\d+)$/,      // :line
        ];

        let buf: string[] = [];

        for (let i = 0; i < rawInput.length; i++) {
            const current = rawInput[i];

            // A fresh digit → start a NEW capture
            if (/\d/.test(current)) {

                buf = []; // IMPORTANT: clear old failed buffer

                let y = i;

                // Capture maximal [0-9:] run
                while (rawInput[y] && /[\d:]/.test(rawInput[y])) {
                    buf.push(rawInput[y]);
                    y++;
                }

                // Reverse to restore forward order
                const forward = buf.slice().reverse().join("");

                // Try both patterns
                for (const p of patterns) {
                    const m = forward.match(p);
                    if (m && m[0] !== "") {
                        return m[0];
                    }
                }

                // Not a coordinate → continue scanning
                // (buf is already cleared at next iteration)
            }
        }

        return null;
    }

    /**
     * Normalizes a file path string by removing unnecessary characters and prefixes.
     * @param path - The raw file path string to normalize.
     * @returns The normalized file path string.
     */
    private static normalize(path: string) {
        return path
            .trim()
            .replace(/^\(|[\)\:\?]+$/g, "") // Remove surrounding parentheses
    }
}

[
    "at myFunc (/usr/local/app/src/index.js:10:2)",
    "at doThing (C:\\Projects\\App\\src\\main.ts:5:1)",
    "at spacedMethod (C:/Program Files/My App/file.js:22:7)",
    "fetchData https://example.com/assets/app.js:99:13",
    "at buildStep (git+ssh://repo.com/project/src/mod.ts:14:3)",
    "crazy <comp> 💀/dev/http:thing/C:/tmp  /🔥/file.ts:3:1"
].map(StackFrame.parseLine).every(console.log);

