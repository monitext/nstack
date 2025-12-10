import { build } from "esbuild";
import { minify } from "terser";
import fs from "node:fs";

async function bundle() {
  // 1. Basic lib.js
  await build({
    entryPoints: ["src/main.ts"],
    outfile: "dist/src-js/lib.js",
    bundle: true,
    format: "esm",
    sourcemap: true,
  });

  // 2. Full bundle (could include all dependencies)
  await build({
    entryPoints: ["src/main.ts"],
    outfile: "dist/src-js/lib.full.js",
    bundle: true,
    format: "esm",
    sourcemap: true,
    minify: false,
  });

  // 3. Minified version
  const js = fs.readFileSync("dist/src-js/lib.full.js", "utf-8");
  const minified = await minify(js, { sourceMap: { filename: "lib-min.js" } });
  fs.writeFileSync("dist/src-js/lib-min.js", minified.code);
}

bundle().catch(err => {
  console.error(err);
  process.exit(1);
});
