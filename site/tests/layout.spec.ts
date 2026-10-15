// Layout and quality checks for both pages at four screen sizes.
// Each run also saves a full-page screenshot to test-results/screens/ for a visual look.
import { test, expect, type Page } from "@playwright/test";

const VIEWPORTS = [
  { name: "phone", width: 390, height: 844, mobile: true },
  { name: "tablet", width: 768, height: 1024, mobile: true },
  { name: "laptop", width: 1024, height: 768, mobile: false },
  { name: "desktop", width: 1440, height: 900, mobile: false },
];
const PAGES = [{ name: "home", path: "/index.html" }, { name: "gallery", path: "/prompts.html" }, { name: "releases", path: "/releases.html" }];

// Grids whose items must never overlap each other.
const GRIDS = [".changes", ".releases", "#path", "#how .strip", "#examples .cards", "#bento", "#setup .two", "#posterGrid", ".principles", ".vs", "#gGrid"];

async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    const step = Math.round(innerHeight * 0.7);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  // let lazy images finish
  // (images parked off to the side in swipe rows load when swiped, so they are skipped)
  await page.waitForFunction(() => Array.from(document.images).filter((i) => {
    const r = i.getBoundingClientRect();
    return i.offsetParent !== null && r.height > 0 && r.left < innerWidth && r.right > 0;
  }).every((i) => i.complete), null, { timeout: 20_000 });
}

for (const vp of VIEWPORTS) {
  for (const pg of PAGES) {
    test(`${pg.name} @ ${vp.name}`, async ({ browser }) => {
      const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: vp.mobile, hasTouch: vp.mobile, deviceScaleFactor: 1 });
      const page = await ctx.newPage();
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
      page.on("console", (m) => { if (m.type() === "error" && !/api\.github\.com/.test(m.text() + m.location().url)) errors.push(`console: ${m.text()} (${m.location().url})`); });
      page.on("requestfailed", (r) => { if (!/api\.github\.com|gemini\.google\.com/.test(r.url())) errors.push(`failed: ${r.url()}`); });

      await page.goto(pg.path);
      await scrollThrough(page);

      // 1. no errors
      expect(errors, "console or network errors").toEqual([]);

      // 2. nothing wider than the screen
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      expect(overflow, "horizontal overflow (px)").toBeLessThanOrEqual(0);

      // 3. every image loaded
      const broken = await page.evaluate(() => Array.from(document.images).filter((i) => { const r = i.getBoundingClientRect(); return i.offsetParent !== null && r.left < innerWidth && r.right > 0 && i.complete && i.naturalWidth === 0; }).map((i) => i.currentSrc || i.src));
      expect(broken, "broken images").toEqual([]);

      // 4. every fade-in block became visible
      const hiddenBlocks = await page.evaluate(() => Array.from(document.querySelectorAll(".rv:not(.in)")).length);
      expect(hiddenBlocks, "blocks that never faded in").toBe(0);

      // 5. in-page links all have a target
      const deadAnchors = await page.evaluate(() => Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')).map((a) => a.getAttribute("href")!).filter((h) => h.length > 1 && !document.querySelector(h)));
      expect(deadAnchors, "links to missing sections").toEqual([]);

      // 6. visible elements stay inside the screen (except deliberate bleeds and scroll areas)
      const outside = await page.evaluate(() => {
        const skip = (el: Element) => el.closest(".fan, .scroll, .tabs, dialog, .bar .tabs, .big, .glow, .dots, .strip, #examples .cards");
        return Array.from(document.querySelectorAll("main *, footer *"))
          .filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && !skip(el) && (r.right > innerWidth + 1 || r.left < -1); })
          .slice(0, 8).map((el) => `${el.tagName.toLowerCase()}.${(el.className as any)?.baseVal ?? el.className}`);
      });
      expect(outside, "elements outside the screen").toEqual([]);

      // 7. grid items never overlap
      const overlaps = await page.evaluate((grids) => {
        const out: string[] = [];
        for (const sel of grids) for (const g of Array.from(document.querySelectorAll(sel))) {
          const kids = Array.from(g.children).filter((k) => (k as HTMLElement).offsetParent !== null).map((k) => k.getBoundingClientRect());
          for (let a = 0; a < kids.length; a++) for (let b = a + 1; b < kids.length; b++) {
            const A = kids[a], B = kids[b];
            const x = Math.min(A.right, B.right) - Math.max(A.left, B.left), y = Math.min(A.bottom, B.bottom) - Math.max(A.top, B.top);
            if (x > 2 && y > 2) out.push(`${sel} items ${a} and ${b} overlap by ${Math.round(x)}x${Math.round(y)}`);
          }
        }
        return out;
      }, GRIDS);
      expect(overlaps, "overlapping items").toEqual([]);

      // 8. text never clipped inside buttons, chips and tabs
      const clipped = await page.evaluate(() => Array.from(document.querySelectorAll<HTMLElement>(".btn, .chip, .tabs button, summary"))
        .filter((el) => el.offsetParent !== null && el.scrollWidth > el.clientWidth + 1).map((el) => el.textContent!.trim().slice(0, 30)));
      expect(clipped, "clipped labels").toEqual([]);

      await page.screenshot({ path: `test-results/screens/${pg.name}-${vp.name}.png`, fullPage: true });
      await ctx.close();
    });
  }
}

test("jumping to a section never hides its heading under the header", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const id of ["why", "how", "examples", "features", "setup", "faq"]) {
    await page.goto(`/index.html#${id}`);
    await page.waitForTimeout(400);
    const { navBottom, headTop, opacity } = await page.evaluate((id) => {
      const nav = document.querySelector(".nav .bar")!.getBoundingClientRect();
      const h = document.querySelector(`#${id} h2`)!;
      return { navBottom: nav.bottom, headTop: h.getBoundingClientRect().top, opacity: getComputedStyle(h.closest(".rv") ?? h).opacity };
    }, id);
    expect(headTop, `#${id} heading below header`).toBeGreaterThan(navBottom);
    expect(Number(opacity), `#${id} heading visible`).toBeGreaterThan(0.9);
  }
});
