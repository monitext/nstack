/**
 * Represents a single stack trace line and provides utilities for parsing
 * and extracting information such as method name, file path, line, and column.
 */
export class StackLine {
    /** The method or function name (if available) */
    public method?: string;

    /** The file path (if available) */
    public file?: string;

    /** The line number (if available) */
    public line?: number;

    /** The column number (if available) */
    public column?: number;

    /**
     * Constructs a `StackLine` instance by parsing a raw stack trace line.
     * @param rawLine - The raw stack trace line to parse.
     */
    constructor(private rawLine: string) {
        const parsed = StackLine.parse(rawLine);
        Object.assign(this, parsed);
    }

    // ---------------------
    // Public parser
    // ---------------------

    /**
     * Parses a raw stack trace line into its components (method, file, line, column).
     * @param line - The raw stack trace line to parse.
     * @returns An object containing the parsed method name, file path, line, and column.
     */
    public static parse(line: string) {
        const tokens = line.trim().split(" ");

        // Remove leading "at" if present
        if (tokens[0]?.trim() === "at") tokens.shift();

        // Assume the last token is the file path
        const pathInfo = this.extractFileInfo(tokens.pop() as string);

        // Remaining tokens form the method name (if any)
        const method = tokens.length ? tokens.join(" ") : undefined;

        return {
            method,
            ...pathInfo,
        };
    }

    // ---------------------
    // Regex helper for path detection
    // ---------------------

    /**
     * Generates a regular expression for detecting file paths with optional line/column coordinates.
     * @param coordCount - The number of coordinate parts to match (default is 2 for line and column).
     * @returns A regular expression for matching file paths with coordinates.
     */
    private static pathRegex(coordCount: number = 2): RegExp {
        const prefixOptions = [
            "\\/",        // Unix root /
            "\\~\\/",     // ~/ home
            "\\w+:\\/",   // Windows drive or protocol like C:/, file:/, http:/
            "\\w+:\\w+",  // Fallback for weird prefixes like webpack://
        ].join("|");

        const prefix = `(${prefixOptions})`;
        const filePart = "([\\/\\w\\s\\-_.:@]+)";
        const coordPart = `\\??((:\\d+){${coordCount}})`;

        return new RegExp(`\\(?${prefix}${filePart}${coordPart}\\)?`);
    }

    // ---------------------
    // Extract path + line/column from raw string
    // ---------------------

    /**
     * Extracts file path and line/column coordinates from a raw string.
     * @param raw - The raw string to extract path data from.
     * @returns An object containing the file path, coordinate part, and coordinates array, or `null` if no match is found.
     */
    public static extractPathData(raw: string) {
        for (let coords = 2; coords >= 1; coords--) {
            const match = raw.match(this.pathRegex(coords));
            if (match) {
                const [, prefix, filePart, coordPart] = match;
                const coordsArray = coordPart.slice(1).split(":").map(Number); // [line, column]
                return { file: prefix + filePart, coordPart, coords: coordsArray };
            }
        }
        return null;
    }

    // ---------------------
    // Extract file info with line/column
    // ---------------------

    /**
     * Extracts file information (file path, line, and column) from a string.
     * @param path - The string containing the file path and optional coordinates.
     * @returns An object containing the normalized file path, line, and column.
     */
    private static extractFileInfo(path: string) {
        const normalized = this.normalize(path);
        const coords = this.extractCoordinates(normalized);
        const file = normalized.replace(/:(\d+):(\d+)$|:(\d+)$/, "");
        return {
            file,
            ...coords,
        };
    }

    // ---------------------
    // Extract coordinates from path
    // ---------------------

    /**
     * Extracts line and column numbers from a file path string.
     * @param path - The file path string containing optional line and column numbers.
     * @returns An object containing the line and column numbers, or `undefined` if not present.
     */
    private static extractCoordinates(path: string) {
        const m2 = path.match(/:(\d+):(\d+)$/);
        if (m2) return { line: +m2[1], column: +m2[2] };

        const m1 = path.match(/:(\d+)$/);
        if (m1) return { line: +m1[1], column: 0 };

        return { line: undefined, column: undefined };
    }

    // ---------------------
    // Normalize path
    // ---------------------

    /**
     * Normalizes a file path string by removing unnecessary characters and prefixes.
     * @param path - The raw file path string to normalize.
     * @returns The normalized file path string.
     */
    private static normalize(path: string) {
        return path
            .trim()
            .replace(/^\(|\)$/g, "") // Remove surrounding parentheses
            .replace(/^file:\/\//, ""); // Remove file:// prefix
    }
}
