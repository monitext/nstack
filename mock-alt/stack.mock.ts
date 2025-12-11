/**
 * Mock stackframe generator for testing nstack parsing
 *
 * Each entry describes:
 *  - raw: the input line as it appears in an error stack
 *  - path: expected parsed path
 *  - coord: expected parsed coordinate (:line:col)
 *
 * Path samples include:
 *  - Windows + spaces
 *  - Linux
 *  - Protocols (file://, http://)
 *  - Emoji folder names
 *  - Weird framework insanity
 */

export interface StackMock {
    name: string
    raw: string
    expected: {
        path: string | null,
        coord: string | null
    }
}

export const STACK_MOCKS: StackMock[] = [
    {
        name: "Linux — simple path",
        raw: "at /usr/lib/project/file.ts:12:9",
        expected: {
            path: "/usr/lib/project/file.ts",
            coord: ":12:9"
        }
    },

    {
        name: "Windows — Program Files with spaces",
        raw: "    at C:\\Program Files (x86)\\App\\main.js:44:1",
        expected: {
            path: "C:\\Program Files (x86)\\App\\main.js",
            coord: ":44:1"
        }
    },

    {
        name: "Emoji folder name",
        raw: "Error at C:/tmp  /💀/file.ts:3:1",
        expected: {
            path: "C:/tmp  /💀/file.ts",
            coord: ":3:1"
        }
    },

    {
        name: "Protocol path (file://)",
        raw: "at file:///Users/cat/dev/test.mjs:55:12",
        expected: {
            path: "file:///Users/cat/dev/test.mjs",
            coord: ":55:12"
        }
    },

    {
        name: "Bun-style stackframe",
        raw: "    at read (node:fs:203:15)",
        expected: {
            path: "node:fs",
            coord: ":203:15"
        }
    },

    {
        name: "Deno-style 'op_crash' weird frame",
        raw: "      at op_crash (ext:core/01_errors.js:53:13)",
        expected: {
            path: "ext:core/01_errors.js",
            coord: ":53:13"
        }
    },

    {
        name: "Mixed garbage with symbols before path",
        raw: "yuy _bn : C:/tmp  /💀/file.ts:3:1 jkjkjf5 rawCoord....",
        expected: {
            path: "C:/tmp  /💀/file.ts",
            coord: ":3:1"
        }
    },

    {
        name: "Framework psychopathy",
        raw: "  at +++Some<Random>(Path!)::💥 /weird/ƒolder/app.jsx:88:2",
        expected: {
            path: "/weird/ƒolder/app.jsx",
            coord: ":88:2"
        }
    },

    {
        name: "Node internal module",
        raw: "at async Module.load (node:internal/modules/cjs/loader:1225:14)",
        expected: {
            path: "node:internal/modules/cjs/loader",
            coord: ":1225:14"
        }
    }
];
