/**
 * Detects the current JavaScript runtime environment.
 *
 * @returns {string} A string representing the runtime environment:
 * - `"bun"` if running in the Bun runtime.
 * - `"deno"` if running in the Deno runtime.
 * - `"node"` if running in a Node.js environment.
 * - `"browser"` if running in a web browser.
 * - `"unknown"` if the runtime cannot be determined.
 */
export function detectRuntime():
  | "bun"
  | "deno"
  | "node"
  | "browser"
  | "unknown" {
  if (typeof Bun !== "undefined") return "bun";
  if (typeof Deno !== "undefined") return "deno";
  if (typeof process !== "undefined" && process.versions?.node) return "node";
  if (typeof window !== "undefined" && typeof window.document !== "undefined")
    return "browser";
  return "unknown";
}
