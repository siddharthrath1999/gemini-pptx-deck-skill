// PPTX Native website.
// Base path and output folder come from the environment so one build script can publish
// the preview (/pptx-native/next/ -> ../docs/next) or the live site (/pptx-native/ -> ../docs).
import { defineConfig, fontProviders } from "astro/config";

const base = process.env.SITE_BASE || "/";
const outDir = process.env.SITE_OUT || "./dist";

export default defineConfig({
  site: "https://siddharthrath1999.github.io",
  base,
  outDir,
  trailingSlash: "ignore",
  build: { format: "file", assets: "_astro", inlineStylesheets: "auto" },
  compressHTML: true,
  image: { responsiveStyles: false },
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Geist",
      cssVariable: "--font-sans",
      weights: [400, 500, 600],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["system-ui", "sans-serif"],
      display: "swap",
    },
    {
      provider: fontProviders.google(),
      name: "Geist Mono",
      cssVariable: "--font-mono",
      weights: [400, 500],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["ui-monospace", "monospace"],
      display: "swap",
    },
  ],
});
