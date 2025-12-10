# nstack

**The missing toolkit for parsing, normalizing, and manipulating JavaScript stack traces across all runtimes.**

`nstack` provides utilities to read error stacks, extract method and file information, perform adaptive lookups, and normalize stack traces in Node.js, browsers, Deno, or Bun.

---

## Features

* Parse raw error stacks into structured `StackFrame` objects.
* Extract method names, file paths, line numbers, and columns from stack traces.
* Lookup methods in stacks with optional offsets and predicates.
* Adaptive lookups based on the current runtime.
* Provides both raw TypeScript and bundled JS versions (`lib.js`, `lib.min.js`, `lib.full.js`).
* Compatible with ESM, CJS, and TypeScript projects.

---

## Installation

```bash
npm install "@monitext/nstack"
```

or using yarn:

```bash
yarn add "@monitext/nstack"
```

---

## Basic Usage

```ts
import nstack, { lookUp, adaptiveLookUp, StackUtils, StackLine } from "@monitext/nstack";

try {
    // Some code that throws
    throw new Error("Oops!");
} catch (err) {
    // Parse stack
    const stack = StackUtils.processError(err);
    
    // Find a method in the stack
    const result = lookUp({ err, method: /myFunction/, offset: 0 });
    
    console.log(result);
    
    // Adaptive lookup across runtime
    const adaptive = adaptiveLookUp([
        { mode: "method", err, method: /myFunction/, offset: 0, runtime: "node" },
        { mode: "index", err, index: 1, runtime: "browser" }
    ]);
    
    console.log(adaptive);
}
```

---

## API

### `StackLine`

Represents a single line/frame in a stack trace.

```ts
const line = new StackLine("at myFunction (file.ts:10:5)");
console.log(line.method); // "myFunction"
console.log(line.file);   // "file.ts"
console.log(line.line);   // 10
console.log(line.column); // 5
```

---

### `StackUtils`

Utilities for processing stacks.

* `StackUtils.processError(error: Error): StackTrace | null`
  Converts an error’s stack into an array of `StackLine`.

* `StackUtils.findMethodInStack(param: StackReadParameter): StackResult | null`
  Finds a method in a stack trace with an optional offset.

---

### `lookUp`

```ts
lookUp({ err: Error, method: string | RegExp, offset: number }): StackResult | null
```

Search for a method in a stack trace. Returns `[index, StackLine]` or `null`.

---

### `adaptiveLookUp`

```ts
adaptiveLookUp(lookups: AdaptiveLookUp): StackResult | null
```

Iterates over multiple lookups, detects the current runtime, and returns the first successful match.

Supports optional predicates to validate results before returning.

---

## Types

* `StackFrame` – Single stack frame (instance of `StackLine`).
* `StackTrace` – Array of `StackFrame`.
* `StackResult` – `[index: number, StackFrame]`.
* `LookUpParameter`, `StackReadParameter` – Parameters for lookups.
* `LookUp`, `AdaptiveLookUp` – Lookup configurations.

---

## Supported Runtimes

* Node.js
* Browser
* Deno
* Bun

`adaptiveLookUp` automatically selects the proper runtime.

---

## Bundles

* **TypeScript**: `dist/src` (raw `.ts`)
* **JS Bundles**: `dist/src-js`

| File          | Description                       |
| ------------- | --------------------------------- |
| `lib.js`      | Standard ESM bundle               |
| `lib.full.js` | Full bundle with all dependencies |
| `lib-min.js`  | Minified production bundle        |

---

## License

Apache 2.0
