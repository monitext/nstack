import { StackLine } from "../src/lib/path";

export const STACK_MOCKS = [

    // ──────────────────────────────
    // Node.js basic
    // ──────────────────────────────
    "    at myFn (/home/cat/dev/app.js:12:3)",
    "    at /home/cat/dev/app.js:19:10",
    "    at Function.go (/home/cat/dev/utils.js:42:8)",

    // Node.js with spaces in method/path
    "    at Object.some weird name (/home/cat/with space/file.ts:5:2)",

    // Node.js anonymous
    "    at Object.<anonymous> (/home/cat/app.ts:3:1)",

    // Node.js without parentheses
    "    at /usr/lib/node_modules/pkg/index.js:99:44",

    // ──────────────────────────────
    // Browser — Chrome style
    // ──────────────────────────────
    "    at myFunc (http://localhost:5173/src/main.ts:25:16)",
    "    at http://localhost:3000/assets/chunk.js:120:5",

    // ──────────────────────────────
    // Browser — Firefox style
    // ──────────────────────────────
    "myFunc@http://localhost:3000/src/main.ts:42:17",
    "http://localhost:3000/src/utils.ts:11:3",

    // ──────────────────────────────
    // Vite / dev server transformed
    // ──────────────────────────────
    "    at eval (http://localhost:5173/@fs/home/cat/project/src/App.tsx:30:12)",
    "    at render (http://localhost:5173/@id/dep-react.js:102:21)",

    // ──────────────────────────────
    // Vitest internal
    // ──────────────────────────────
    "    at __vitest_executor (/home/cat/proj/tests/sample.test.ts:7:10)",
    "    at runTest (/home/cat/proj/node_modules/vitest/dist/runtime.js:144:22)",

    // ──────────────────────────────
    // Windows paths
    // ──────────────────────────────
    "    at doThing (C:\\dev\\project\\src\\index.ts:13:2)",
    "    at C:\\Users\\Cat\\Desktop\\code\\app.js:50:14",

    // Windows mixed slash
    "at async doSomething (C:/Users/Call Hs/Projects/My App/src/main.js:45:9)",

    // ──────────────────────────────
    // URL with file://
    // ──────────────────────────────
    "    at file:///Users/cat/dev/app.ts:21:11",
    "    at Module.runMain (file:///home/user/My Documents/project/server.js:22:5)",
    "    at Object.handler (file:///C:/Users/Call Hs/Workspace/Web Project/app.js:101:21)",

    // ──────────────────────────────
    // Paths containing colons (nested)
    // ──────────────────────────────
    "    at handler (/home/cat/code:tools/src/app.ts:14:1)",

    // ──────────────────────────────
    // Bundlers / Webpack style
    // ──────────────────────────────
    "    at __webpack_require__ (http://localhost:8080/main.js:1234:20)",
    "    at module.exports (webpack:///./src/module.ts?:10:5)",

    // ──────────────────────────────
    // Bun
    // ──────────────────────────────
    "    at myFunc (bun:internal/fs:55:14)",

    // ──────────────────────────────
    // Deno
    // ──────────────────────────────
    "    at async file:///home/cat/main.ts:80:3",

    // ──────────────────────────────
    // Node internal w/out coords
    // ──────────────────────────────
    "    at node:internal/modules/cjs/helpers:12",
    "    at Object.run (node:internal/process/task_queues:23)",

    // ──────────────────────────────
    // Anonymous eval
    // ──────────────────────────────
    "    at eval (eval at doThing (http://localhost:3000/app.js:50:10), <anonymous>:1:1)",

    // ──────────────────────────────
    // Your earlier user-space mocks
    // ──────────────────────────────
    "at Object.<anonymous> (/Users/Call Hs/Projects/My App/index.js:10:15)",
    "at /usr/local/lib/node_modules/test-module/lib/index.js:5:3",
    "at async loadConfig (/home/dev/My Project/config loader/config.js:77:11)",
    "at Server.handleRequest (C:/Projects/HTTP Test/server/index.js:50:25)",
    "at async Object.process (/Users/Call Hs/Projects/Async Project/src/process.js:66:12)",
    "at /home/user/Desktop/Test Project/lib/test.js:9:4",
    "at async run (/usr/local/projects/Test Space/main.js:100:20)",
    "at Function.init (C:/Users/Public/Test Folder/lib/init.js:200:30)",
    "at /home/dev/Documents/My App/app.js:120:10",
    "at /home/dev/Documents/My App/app.js:120",
];

console.log(STACK_MOCKS.map(s => StackLine.parse(s)))