// Resolve "folder/file.jpg" (relative to src/assets). Images load on demand, so the build
// only emits the optimised versions that a page actually uses.
import type { ImageMetadata } from "astro";

const files = import.meta.glob<{ default: ImageMetadata }>("../assets/**/*.{jpg,png}");

function loader(path: string) {
  const fn = files[`../assets/${path}`];
  if (!fn) throw new Error(`Missing image: src/assets/${path}`);
  return fn;
}

/** For <Image src={img(...)}>: Astro accepts the import promise directly. */
export function img(path: string): Promise<{ default: ImageMetadata }> {
  return loader(path)();
}

/** For getImage(): the image metadata itself. */
export async function meta(path: string): Promise<ImageMetadata> {
  return (await loader(path)()).default;
}
