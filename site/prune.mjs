// After a build: delete images in _astro/ that no page, script or stylesheet references.
// (Astro copies the original JPGs next to the optimised WebP files even when only the WebP is used.)
import { readdir, readFile, rm } from "node:fs/promises";
import { join } from "node:path";

const out = process.argv[2] || "dist";
const assets = join(out, "_astro");
const files = await readdir(assets, { recursive: true });
const text = [];
for (const f of [...(await readdir(out)).filter((f) => f.endsWith(".html")).map((f) => join(out, f)),
                 ...files.filter((f) => /\.(js|css)$/.test(f)).map((f) => join(assets, f))]) {
  text.push(await readFile(f, "utf8"));
}
const all = text.join("\n");
let removed = 0, bytes = 0;
for (const f of files.filter((f) => /\.(jpe?g|png)$/i.test(f))) {
  const name = f.split("/").pop();
  if (all.includes(name)) continue;
  const p = join(assets, f);
  bytes += (await readFile(p)).length;
  await rm(p);
  removed++;
}
console.log(`prune: removed ${removed} unused images (${Math.round(bytes / 1024)} KB) from ${assets}`);
