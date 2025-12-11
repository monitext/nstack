/**
 * Ultra-Stress Test Stackframes for Parser Validation
 * ---------------------------------------------------
 * This list includes:
 * - malformed coordinates
 * - unicode madness
 * - reversed and partial paths
 * - broken URL/protocol paths
 * - real-world stackframes from major JS tools
 */

export interface StackStressCase {
    name: string
    raw: string
    expected: {
        path: string | null
        coord: string | null
    }
}

export const STACK_STRESS: StackStressCase[] = [

    // --------------------
    // INVALID COORDINATES
    // --------------------
    {
        name: "Coord NaN",
        raw: "at /src/app.ts:NaN:12",
        expected: { path: "/src/app.ts", coord: null }
    },
    {
        name: "Coord reversed",
        raw: "at /src/main.ts:12:-5",
        expected: { path: "/src/main.ts", coord: null }
    },
    {
        name: "Coord missing line",
        raw: "at /x/file.js::90",
        expected: { path: "/x/file.js", coord: null }
    },
    {
        name: "Coord with emoji",
        raw: "at /x/hey.ts:💀:10",
        expected: { path: "/x/hey.ts", coord: null }
    },
    {
        name: "Coord mixed unicode digits",
        raw: "at /x/unicode.ts:１２:９", // fullwidth digits
        expected: { path: "/x/unicode.ts", coord: ":12:9" }
    },

    // --------------------
    // UNICODE / WTF PATHS
    // --------------------
    {
        name: "RTL characters (Arabic) inside path",
        raw: "at /src/مجلد/ملف.ts:9:3",
        expected: { path: "/src/مجلد/ملف.ts", coord: ":9:3" }
    },
    {
        name: "Zero-width joiners",
        raw: "at /a/bo‍y/te‍st.ts:7:1",
        expected: { path: "/a/bo‍y/te‍st.ts", coord: ":7:1" }
    },
    {
        name: "Combining marks",
        raw: "at /tmp/ééé/test.js:2:88",
        expected: { path: "/tmp/ééé/test.js", coord: ":2:88" }
    },
    {
        name: "Emoji interspersed as separators",
        raw: "at /t/💥/💥💥/file💀name.ts:22:2",
        expected: { path: "/t/💥/💥💥/file💀name.ts", coord: ":22:2" }
    },

    // --------------------
    // BROKEN PATHS
    // --------------------
    {
        name: "Missing leading slash",
        raw: "at src/app.ts:4:4",
        expected: { path: "src/app.ts", coord: ":4:4" }
    },
    {
        name: "Double slash at root",
        raw: "at //server//app.ts:7:9",
        expected: { path: "//server//app.ts", coord: ":7:9" }
    },
    {
        name: "Backslashes + forward slashes hybrid",
        raw: "at C:/Users\\cat/dev\\file.js:1:99",
        expected: { path: "C:/Users\\cat/dev\\file.js", coord: ":1:99" }
    },
    {
        name: "Reversed path",
        raw: "at ts.jelif/pp/rcs/:10:2",
        expected: { path: null, coord: null }
    },

    // --------------------
    // REACT DOM
    // --------------------
    {
        name: "React devtools internal frame",
        raw: "at renderWithHooks (http://localhost:3000/static/js/bundle.js:22580:22)",
        expected: {
            path: "http://localhost:3000/static/js/bundle.js",
            coord: ":22580:22"
        }
    },
    {
        name: "React production (minified)",
        raw: "at a.useState (main.8df91.js:formatted:12345:1)",
        expected: {
            path: "main.8df91.js",
            coord: ":12345:1"
        }
    },

    // --------------------
    // VITE
    // --------------------
    {
        name: "Vite stackframe",
        raw: "at /src/components/Button.vue?t=12345:87:10",
        expected: { path: "/src/components/Button.vue", coord: ":87:10" }
    },

    // --------------------
    // WEBPACK
    // --------------------
    {
        name: "Webpack eval frame",
        raw: "at eval (webpack:///./src/index.js?:33:19)",
        expected: {
            path: "webpack:///./src/index.js",
            coord: ":33:19"
        }
    },

    // --------------------
    // ESBUILD
    // --------------------
    {
        name: "Esbuild error",
        raw: "at /src/app.jsx:1249:17 in transform",
        expected: { path: "/src/app.jsx", coord: ":1249:17" }
    },

    // --------------------
    // SWC
    // --------------------
    {
        name: "SWC transform error",
        raw: "at Parser.parseExpr (swc://parser/expr.ts:777:3)",
        expected: { path: "swc://parser/expr.ts", coord: ":777:3" }
    },

    // --------------------
    // TYPESCRIPT
    // --------------------
    {
        name: "TS compiler sourcemap fail",
        raw: "    at Object.getSourceFile (C:\\ts\\typescript.js:140449:27)",
        expected: {
            path: "C:\\ts\\typescript.js",
            coord: ":140449:27"
        }
    },

    {
        name: "TS emits '@:??'",
        raw: "at /src/test.ts:?:?",
        expected: { path: "/src/test.ts", coord: null }
    },

    // --------------------
    // REACT NATIVE / EXPO (Metro)
    // --------------------
    {
        name: "Expo metro bundler",
        raw: "at App (http://192.168.0.7:19000/index.bundle?platform=android&dev=true&hot=false:14583:21)",
        expected: {
            path: "http://192.168.0.7:19000/index.bundle",
            coord: ":14583:21"
        }
    },
    {
        name: "React Native internal",
        raw: "at anonymous (native)",
        expected: { path: null, coord: null }
    },

    // --------------------
    // BUN
    // --------------------
    {
        name: "Bun node:fs",
        raw: "at read (node:fs:203:15)",
        expected: { path: "node:fs", coord: ":203:15" }
    },

    // --------------------
    // DENO
    // --------------------
    {
        name: "Deno op_crash",
        raw: "    at op_crash (ext:core/01_errors.js:53:13)",
        expected: { path: "ext:core/01_errors.js", coord: ":53:13" }
    },

    // --------------------
    // MINIFIED NIGHTMARE
    // --------------------
    {
        name: "Single character method",
        raw: "at a (bundle.min.js:1:1499320)",
        expected: { path: "bundle.min.js", coord: ":1:1499320" }
    },
    {
        name: "Collapsed eval",
        raw: "at eval (eval at <anonymous> (app.min.js:2:14411), <anonymous>:1:1)",
        expected: {
            path: "app.min.js",
            coord: ":2:14411"
        }
    }
]
