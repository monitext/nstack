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

      expect(res).toHaveProperty("filePart");
      expect(res).toHaveProperty("coordPart");
      expect(res).toHaveProperty("coords");
      expect(Array.isArray(res.coords)).toBe(true);
      expect(res.coords.length).toBeGreaterThanOrEqual(1);
      // optionally, you can assert numbers are positive
      res.coords.forEach((n) => expect(typeof n).toBe("number"));
    });
  });

  it("each parsed line should have it's data be correctly extracted", () => {
    // Example assertion for the first line
    expect(results[0]).toEqual({
      filePart: "/Users/Call Hs/Projects/My App/index.js",
      coordPart: ":10:15",
      coords: [10, 15],
    });

    expect(results[1]).toEqual({
      filePart: "C:/Users/Call Hs/Projects/My App/src/main.js",
      coordPart: ":45:9",
      coords: [45, 9],
    });

    expect(results[2]).toEqual({
      filePart: "file:///home/user/My Documents/project/server.js",
      coordPart: ":22:5",
      coords: [22, 5],
    });

    expect(results[3]).toEqual({
      filePart: "/C:/Users/Public/Downloads/Node Test/utils.js",
      coordPart: ":12:18",
      coords: [12, 18],
    });

    expect(results[4]).toEqual({
      filePart: "/usr/local/lib/node_modules/test-module/lib/index.js",
      coordPart: ":5:3",
      coords: [5, 3],
    });

    expect(results[5]).toEqual({
      filePart: "file:///C:/Users/Call Hs/Workspace/Web Project/app.js",
      coordPart: ":101:21",
      coords: [101, 21],
    });

    expect(results[6]).toEqual({
      filePart: "/mnt/c/Users/Dev/My Project/lib/core.js",
      coordPart: ":33:7",
      coords: [33, 7],
    });

    expect(results[7]).toEqual({
      filePart: "/home/dev/My Project/config loader/config.js",
      coordPart: ":77:11",
      coords: [77, 11],
    });

    expect(results[8]).toEqual({
      filePart: "C:/Projects/HTTP Test/server/index.js",
      coordPart: ":50:25",
      coords: [50, 25],
    });

    expect(results[9]).toEqual({
      filePart: "/Users/Call Hs/Projects/Async Project/src/process.js",
      coordPart: ":66:12",
      coords: [66, 12],
    });

    expect(results[10]).toEqual({
      filePart: "/home/user/Desktop/Test Project/lib/test.js",
      coordPart: ":9:4",
      coords: [9, 4],
    });

    expect(results[11]).toEqual({
      filePart: "file:///C:/Users/Dev/Temp/Node App/index.js",
      coordPart: ":18:2",
      coords: [18, 2],
    });

    expect(results[12]).toEqual({
      filePart: "/usr/local/projects/Test Space/main.js",
      coordPart: ":100:20",
      coords: [100, 20],
    });

    expect(results[13]).toEqual({
      filePart: "C:/Users/Public/Test Folder/lib/init.js",
      coordPart: ":200:30",
      coords: [200, 30],
    });

    expect(results[14]).toEqual({
      filePart: "/home/dev/Documents/My App/app.js",
      coordPart: ":120:10",
      coords: [120, 10],
    });

    expect(results[15]).toEqual({
      filePart: "/home/dev/Documents/My App/app.js",
      coordPart: ":120",
      coords: [120],
    });

    expect(results[16]).toEqual({
      filePart: "http://localhost:3000/app.js",
      coordPart: ":50:10",
      coords: [50, 10],
    });

    expect(results[17]).toEqual({
      filePart: "node:internal/modules/cjs/helpers",
      coordPart: ":12",
      coords: [12],
    });


    expect(results[18]).toEqual({
      filePart: "bun:internal/fs",
      coordPart: ":55:14",
      coords: [55, 14],
    });
  });
});
