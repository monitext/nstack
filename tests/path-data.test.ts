import { describe, it, expect } from "vitest";
import { StackLine } from "../src/lib/path";

describe("StackLine.splitAtPathPart", () => {
  const Paths = {
    "Unix-like Paths (Linux/macOS)": [
      // 1. Standard named function
      "    at myFn (/home/cat/dev/app.js:12:3)",

      // 2. No function name (just path)
      "    at /home/cat/dev/app.js:19:10",

      // 3. Spaces in both Method Name AND Path
      "    at Object.some weird name (/home/cat/with space/file.ts:5:2)",

      // 4. Anonymous function with Spaces in Path
      "    at Object.<anonymous> (/Users/Call Hs/Projects/My App/index.js:10:15)",

      // 5. Edge Case: Colon inside directory name (Unix allow this)
      "    at handler (/home/cat/code:tools/src/app.ts:14:1)",

      // 6. WSL / Mount style path (/mnt/c/...)
      "    at Function.execute (/mnt/c/Users/Dev/My Project/lib/core.js:33:7)",

      // 7. Async prefix with spaces
      "    at async loadConfig (/home/dev/My Project/config loader/config.js:77:11)",

      // 8. Missing column number (rare but valid)
      "    at /home/dev/Documents/My App/app.js:120",
    ],
    "Windows Paths": [
      // 1. Standard Backslash (Native Windows)
      "    at doThing (C:\\dev\\project\\src\\index.ts:13:2)",

      // 2. Forward Slash + Spaces (Common in Jest/Vite on Windows)
      "    at async doSomething (C:/Users/Call Hs/Projects/My App/src/main.js:45:9)",

      // 3. Git Bash / Cygwin Style (Leading slash before drive letter)
      "    at async fetchData (/C:/Users/Public/Downloads/Node Test/utils.js:12:18)",

      // --- NEW EDGE CASES ADDED BELOW ---

      // 4. Parentheses in Path (Crucial for 'Program Files (x86)')
      // *Why this matters:* If your regex blindly looks for the last closing parenthesis `)`,
      // it will stop early at `(x86)` and fail to capture the full path.
      "    at start (C:\\Program Files (x86)\\App\\app.js:20:5)",

      // 5. UNC Path (Network Share)
      // *Why this matters:* Node.js can run files from network shares.
      // There is no drive letter here, just double backslashes.
      "    at load (\\\\Server\\Share\\users\\cat\\app.js:10:1)",

      // 6. Mixed Slashes
      // *Why this matters:* Windows APIs allow mixed slashes.
      // Some build tools concatenate paths incorrectly, resulting in mix-matched separators.
      "    at awkward (C:\\Users\\Dev/projects/mixed\\file.js:5:1)",
    ],
    "Network & Protocol URLs (http/file)": [
      "    at myFunc (http://localhost:5173/src/main.ts:25:16)",
      "    at http://localhost:3000/assets/chunk.js:120:5",
      "    at file:///Users/cat/dev/app.ts:21:11",
      "    at async file:///home/cat/main.ts:80:3",
      "    at Module.runMain (file:///home/user/My Documents/project/server.js:22:5)",
      "    at Object.handler (file:///C:/Users/Call Hs/Workspace/Web Project/app.js:101:21)",
      "    at Object.<anonymous> (file:///C:/Users/Dev/Temp/Node App/index.js:18:2)",
    ],
    "Runtime Internals (Node/Bun)": [
      "    at node:internal/modules/cjs/helpers:12",
      "    at Object.run (node:internal/process/task_queues:23)",
      "    at myFunc (bun:internal/fs:55:14)",
    ],
    "Virtual, Eval & Build Tools": [
      "    at eval (http://localhost:5173/@fs/home/cat/project/src/App.tsx:30:12)",
      "    at render (http://localhost:5173/@id/dep-react.js:102:21)",
      "    at __webpack_require__ (http://localhost:8080/main.js:1234:20)",
      "    at module.exports (webpack:///./src/module.ts?:10:5)",
      "    at eval (eval at doThing (http://localhost:3000/app.js:50:10), <anonymous>:1:1)",
    ],
    "Non-V8 Formats (Firefox/SpiderMonkey)": [
      "myFunc@http://localhost:3000/src/main.ts:42:17",
      "http://localhost:3000/src/utils.ts:11:3",
    ],
  };

  function parseArr(arr: string[]) {
    return arr.map((line) => StackLine.extractPathData(line));
  }

  it("should correctly parse unix-like paths", () => {
    const results = parseArr(Paths["Unix-like Paths (Linux/macOS)"]);

    expect(results[0]).toEqual({
      filePart: "/home/cat/dev/app.js",
      coordPart: ":12:3",
      coords: [12, 3],
    });
  });

  it("should correctly parse windows paths", () => {
    const results = parseArr(Paths["Windows Paths"]);

    expect(results[0]).toEqual({
      filePart: "C:\\dev\\project\\src\\index.ts",
      coordPart: ":13:2",
      coords: [13, 2],
    });
  });

  it("should correctly parse network and protocol URLs", () => {
    const results = parseArr(Paths["Network & Protocol URLs (http/file)"]);

    expect(results[0]).toEqual({
      filePart: "http://localhost:5173/src/main.ts",
      coordPart: ":25:16",
      coords: [25, 16],
    });
  });

  it("should correctly parse runtime internals", () => {
    const results = parseArr(Paths["Runtime Internals (Node/Bun)"]);

    expect(results[0]).toEqual({
      filePart: "node:internal/modules/cjs/helpers",
      coordPart: ":12",
      coords: [12],
    });
  });

  it("should correctly parse virtual, eval, and build tools paths", () => {
    const results = parseArr(Paths["Virtual, Eval & Build Tools"]);

    expect(results[0]).toEqual({
      filePart: "http://localhost:5173/@fs/home/cat/project/src/App.tsx",
      coordPart: ":30:12",
      coords: [30, 12],
    });
  });

  it("should correctly parse non-V8 formats", () => {
    const results = parseArr(Paths["Non-V8 Formats (Firefox/SpiderMonkey)"]);

    expect(results[0]).toEqual({
      filePart: "http://localhost:3000/src/main.ts",
      coordPart: ":42:17",
      coords: [42, 17],
    });
  });
});
