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
    // remove leading "at "
    const raw = line.trim().replace(/^at\s+/, "");

    const pathData = this.extractPathData(raw);

    let method: string | undefined = undefined;

    if (pathData) {
      // Remove only the matched path portion (the last occurrence)
      method = raw.slice(0, raw.lastIndexOf(pathData.matched)).trim();
      if (method === "") method = undefined;
    }

    return {
      method,
      file: pathData?.file,
      line: pathData?.line,
      column: pathData?.column,
    };
  }

  // ---------------------
  // Regex helper for path detection
  // ---------------------

  /**
   * Returns a list of three-slotted regular expressions for extracting path information.
   *
   * Each regex captures three groups:
   * 1. `prefix`   – Path prefix, e.g., "/", "~/", "C:\", or protocol like "file:", "http:", "webpack:"
   * 2. `filePath` – The main file path (Unix, Windows, Linux, etc.)
   * 3. `coordPart` – Optional coordinates, e.g., ":line" or ":line:column"
   *
   * Ordering matters when matching:
   * - `genericPath` should be tested first, as it covers standard filesystem paths and protocols.
   * - `nativePath` covers symbolic/internal paths like "module:line:col", split_name:line:col, or dash-name:line:col.
   *
   * @returns An array of regular expressions for path extraction.
   */
  private static pathRegex(): RegExp[] {
    const prefixOptions = [
      "\\/", // Unix root /
      "\\~\\/", // ~/ home
      "\\w+:\\w", // Fallback for weird prefixes like webpack://
      "\\w+:\\/", // Windows drive mixed slash & file:/, http:/
      "\\w+:\\\\", // Windows drive or protocol like C:\,
    ].join("|");

    const prefix = `(${prefixOptions})`;
    const filePart = "([\\/\\w\\s\\-_.:@\\\\]+)";

    const coordPart = `\\??(:\\d+)`;
    const coordPart2 = `\\??(:\\d+:\\d+)`;

    const nativePath = `([\\w-_\\.]+)()`;
    const genericPath = `${prefix}${filePart}`;

    return [
      /**
       * Handles filesystem and protocol paths:
       * - Windows (C:\path\to\file)
       * - Unix/Linux (/home/user/file)
       * - Protocol paths (file:, http:, webpack://)
       */
      genericPath,

      /**
       * Handles symbolic/internal paths:
       * - split_name:line:col
       * - dash-name:line:col
       * - virtual sources like "native:1:11"
       */
      nativePath,
    ]
      .map((path) => [
        `\\(?${path}${coordPart2}\\)?`,
        `\\(?${path}${coordPart}\\)?`,
      ])
      .flat()
      .map((path) => new RegExp(path));
  }

  public static tryPathExtraction(raw: string) {
    const regexps = this.pathRegex();

    for (const exp of regexps) {
      const match = raw.match(exp);
      console.log(match);

      if (!match) continue;

      const [matched, prefix, filePart, coordPart] = match;

      return {
        matched,
        prefix,
        filePart,
        coordPart,
      };
    }

    return null;
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
    const match = this.tryPathExtraction(raw);

    if (match) {
      const { matched, prefix, filePart, coordPart } = match;
      const coordinates = this.extractCoordinates(coordPart);
      console.log(matched, match);
      return {
        matched,
        file: this.normalize(prefix + filePart),
        coordPart,
        ...coordinates,
      };
    }

    return null;
  }

  public static removePathPart(raw: string, withStr = "") {
    const match = this.tryPathExtraction(raw);
    return match ? raw.replace(match.matched, withStr) : raw;
  }

  // ---------------------
  // Extract coordinates from path
  // ---------------------

  /**
   * Extracts line and column numbers from a file path string.
   * @param path - The file path string containing optional line and column numbers.
   * @returns An object containing the line and column numbers, if not present.
   */
  private static extractCoordinates(coordStr: string) {
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
