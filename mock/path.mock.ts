import { StackLine } from "../src/lib/path";

console.log([
    // --- Node.js basic ---
    "    at myFn (/home/cat/dev/app.js:12:3)",
    "    at /home/cat/dev/app.js:19:10",
    "    at Function.go (/home/cat/dev/utils.js:42:8)",
    
    // --- Node.js with spaces in method/path ---
    "    at Object.some weird name (/home/cat/with space/file.ts:5:2)",
    
    // --- Node.js without parentheses (rare but valid) ---
    "    at /usr/lib/node_modules/pkg/index.js:99:44",

    // --- Node.js with anonymous funcs ---
    "    at Object.<anonymous> (/home/cat/app.ts:3:1)",

    // --- Browser chrome style ---
    "    at myFunc (http://localhost:5173/src/main.ts:25:16)",
    "    at http://localhost:3000/assets/chunk.js:120:5",

    // --- Browser firefox style ---
    "myFunc@http://localhost:3000/src/main.ts:42:17",
    "http://localhost:3000/src/utils.ts:11:3",

    // --- Vite transformed paths ---
    "    at eval (http://localhost:5173/@fs/home/cat/project/src/App.tsx:30:12)",
    "    at render (http://localhost:5173/@id/dep-react.js:102:21)",

    // --- Vitest internal mocked stack ---
    "    at __vitest_executor (/home/cat/proj/tests/sample.test.ts:7:10)",
    "    at runTest (/home/cat/proj/node_modules/vitest/dist/runtime.js:144:22)",

    // --- Windows paths ---
    "    at doThing (C:\\dev\\project\\src\\index.ts:13:2)",
    "    at C:\\Users\\Cat\\Desktop\\code\\app.js:50:14",

    // --- URL with file:// ---
    "    at file:///Users/cat/dev/app.ts:21:11",

    // --- Nested colons inside path (important test) ---
    "    at handler (/home/cat/code:tools/src/app.ts:14:1)",

    // --- Bundlers / Webpack style ---
    "    at __webpack_require__ (http://localhost:8080/main.js:1234:20)",
    "    at module.exports (webpack:///./src/module.ts?:10:5)",

    // --- Bun style ---
    "    at myFunc (bun:internal/fs:55:14)",

    // --- Deno style ---
    "    at async file:///home/cat/main.ts:80:3",

    // --- No coordinates ---
    "    at node:internal/modules/cjs/helpers:12",
    "    at Object.run (node:internal/process/task_queues:23)",

    // --- Method with arrow function ---
    "    at Object.<anonymous> (/home/cat/app.js:30:12)",

    // --- Anonymous eval ---
    "    at eval (eval at doThing (http://localhost:3000/app.js:50:10), <anonymous>:1:1)"
    
].map(s => StackLine.extractPathData(s)));
