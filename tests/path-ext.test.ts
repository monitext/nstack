import { describe, it, expect } from "vitest";
import { StackLine } from "../src/lib/path";

describe("StackLine.splitAtPathPart", () => {
  const stackLines = [
    "at Object.<anonymous> (/Users/Call Hs/Projects/My App/index.js:10:15)",
    "at async doSomething (C:/Users/Call Hs/Projects/My App/src/main.js:45:9)",
    "at Module.runMain (file:///home/user/My Documents/project/server.js:22:5)",
    "at async fetchData (/C:/Users/Public/Downloads/Node Test/utils.js:12:18)",
    "at /usr/local/lib/node_modules/test-module/lib/index.js:5:3",
    "at Object.handler (file:///C:/Users/Call Hs/Workspace/Web Project/app.js:101:21)",
    "at Function.execute (/mnt/c/Users/Dev/My Project/lib/core.js:33:7)",
    "at async loadConfig (/home/dev/My Project/config loader/config.js:77:11)",
    "at Server.handleRequest (C:/Projects/HTTP Test/server/index.js:50:25)",
    "at async Object.process (/Users/Call Hs/Projects/Async Project/src/process.js:66:12)",
    "at /home/user/Desktop/Test Project/lib/test.js:9:4",
    "at Object.<anonymous> (file:///C:/Users/Dev/Temp/Node App/index.js:18:2)",
    "at async run (/usr/local/projects/Test Space/main.js:100:20)",
    "at Function.init (C:/Users/Public/Test Folder/lib/init.js:200:30)",
    "at /home/dev/Documents/My App/app.js:120:10",
    "at /home/dev/Documents/My App/app.js:120",
    "at eval (eval at doThing (http://localhost:3000/app.js:50:10), <anonymous>:1:1)",
    "at node:internal/modules/cjs/helpers:12",

    // --- Bun style ---
    "at myFunc (bun:internal/fs:55:14)",
  ];

  const results = stackLines.map((s) => StackLine.extractPathData(s));

  it("parses stack lines into filePart, coordPart and coords", () => {
    results.forEach((res, i) => {
      if (!res) {
        console.warn(`Line ${i} could not be parsed:`, stackLines[i]);
        return;
      }

      expect(res).toHaveProperty("matched");
      expect(res).toHaveProperty("file");
      expect(res).toHaveProperty("coordPart");
      expect(res).toHaveProperty("coords");
      expect(res).toHaveProperty("line");
      expect(res).toHaveProperty("column");
      expect(Array.isArray(res.coords)).toBe(true);
      expect(res.coords.length).toBeGreaterThanOrEqual(1);
      res.coords.forEach((n) => expect(typeof n).toBe("number"));
    });
  });

  it("each parsed line should have it's data be correctly extracted", () => {
    // Example assertion for the first line
    expect(results[0]).toEqual({
      matched: "(/Users/Call Hs/Projects/My App/index.js:10:15)",
      file: "/Users/Call Hs/Projects/My App/index.js",
      coordPart: ":10:15",
      coords: [10, 15],
      line: 10,
      column: 15,
    });

    expect(results[1]).toEqual({
      matched: "(C:/Users/Call Hs/Projects/My App/src/main.js:45:9)",
      file: "C:/Users/Call Hs/Projects/My App/src/main.js",
      coordPart: ":45:9",
      coords: [45, 9],
      line: 45,
      column: 9,
    });

    expect(results[2]).toEqual({
      matched: "(file:///home/user/My Documents/project/server.js:22:5)",
      file: "file:///home/user/My Documents/project/server.js",
      coordPart: ":22:5",
      coords: [22, 5],
      line: 22,
      column: 5,
    });

    expect(results[3]).toEqual({
      matched: "(/C:/Users/Public/Downloads/Node Test/utils.js:12:18)",
      file: "/C:/Users/Public/Downloads/Node Test/utils.js",
      coordPart: ":12:18",
      coords: [12, 18],
      line: 12,
      column: 18,
    });

    expect(results[4]).toEqual({
      matched: "/usr/local/lib/node_modules/test-module/lib/index.js:5:3",
      file: "/usr/local/lib/node_modules/test-module/lib/index.js",
      coordPart: ":5:3",
      coords: [5, 3],
      line: 5,
      column: 3,
    });

    expect(results[5]).toEqual({
      matched: "(file:///C:/Users/Call Hs/Workspace/Web Project/app.js:101:21)",
      file: "file:///C:/Users/Call Hs/Workspace/Web Project/app.js",
      coordPart: ":101:21",
      coords: [101, 21],
      line: 101,
      column: 21,
    });

    expect(results[6]).toEqual({
      matched: "(/mnt/c/Users/Dev/My Project/lib/core.js:33:7)",
      file: "/mnt/c/Users/Dev/My Project/lib/core.js",
      coordPart: ":33:7",
      coords: [33, 7],
      line: 33,
      column: 7,
    });

    expect(results[7]).toEqual({
      matched: "(/home/dev/My Project/config loader/config.js:77:11)",
      file: "/home/dev/My Project/config loader/config.js",
      coordPart: ":77:11",
      coords: [77, 11],
      line: 77,
      column: 11,
    });

    expect(results[8]).toEqual({
      matched: "(C:/Projects/HTTP Test/server/index.js:50:25)",
      file: "C:/Projects/HTTP Test/server/index.js",
      coordPart: ":50:25",
      coords: [50, 25],
      line: 50,
      column: 25,
    });

    expect(results[9]).toEqual({
      matched: "(/Users/Call Hs/Projects/Async Project/src/process.js:66:12)",
      file: "/Users/Call Hs/Projects/Async Project/src/process.js",
      coordPart: ":66:12",
      coords: [66, 12],
      line: 66,
      column: 12,
    });

    expect(results[10]).toEqual({
      matched: "/home/user/Desktop/Test Project/lib/test.js:9:4",
      file: "/home/user/Desktop/Test Project/lib/test.js",
      coordPart: ":9:4",
      coords: [9, 4],
      line: 9,
      column: 4,
    });

    expect(results[11]).toEqual({
      matched: "(file:///C:/Users/Dev/Temp/Node App/index.js:18:2)",
      file: "file:///C:/Users/Dev/Temp/Node App/index.js",
      coordPart: ":18:2",
      coords: [18, 2],
      line: 18,
      column: 2,
    });

    expect(results[12]).toEqual({
      matched: "(/usr/local/projects/Test Space/main.js:100:20)",
      file: "/usr/local/projects/Test Space/main.js",
      coordPart: ":100:20",
      coords: [100, 20],
      line: 100,
      column: 20,
    });

    expect(results[13]).toEqual({
      matched: "(C:/Users/Public/Test Folder/lib/init.js:200:30)",
      file: "C:/Users/Public/Test Folder/lib/init.js",
      coordPart: ":200:30",
      coords: [200, 30],
      line: 200,
      column: 30,
    });

    expect(results[14]).toEqual({
      matched: "/home/dev/Documents/My App/app.js:120:10",
      file: "/home/dev/Documents/My App/app.js",
      coordPart: ":120:10",
      coords: [120, 10],
      line: 120,
      column: 10,
    });

    expect(results[15]).toEqual({
      matched: "/home/dev/Documents/My App/app.js:120",
      file: "/home/dev/Documents/My App/app.js",
      coordPart: ":120",
      coords: [120],
      line: 120,
      column: 1,
    });

    expect(results[16]).toEqual({
      matched: "(http://localhost:3000/app.js:50:10)",
      file: "http://localhost:3000/app.js",
      coordPart: ":50:10",
      coords: [50, 10],
      line: 50,
      column: 10,
    });

    expect(results[17]).toEqual({
      matched: "node:internal/modules/cjs/helpers:12",
      file: "node:internal/modules/cjs/helpers",
      coordPart: ":12",
      coords: [12],
      line: 12,
      column: 1,
    });

    expect(results[18]).toEqual({
      matched: "(bun:internal/fs:55:14)",
      file: "bun:internal/fs",
      coordPart: ":55:14",
      coords: [55, 14],
      line: 55,
      column: 14,
    });
  });
});
