// Accessibility scan (axe, WCAG 2.2 AA) on every page at desktop and phone sizes.
// Decorative demos are aria-hidden and fade in on scroll, so they are left out.
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const vp of [{ n: "desktop", w: 1440, h: 900 }, { n: "phone", w: 390, h: 844 }]) {
  for (const path of ["/index.html", "/prompts.html", "/releases.html", "/404.html"]) {
    test(`a11y ${path} @ ${vp.n}`, async ({ browser }) => {
      const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, isMobile: vp.n === "phone", reducedMotion: "reduce" });
      const page = await ctx.newPage();
      await page.goto(path);
      // scan the settled page: fade-ins done, the How it works path lit
      await page.evaluate(() => { document.querySelectorAll(".rv").forEach((e) => e.classList.add("in")); document.querySelector("#path")?.classList.add("go"); });
      await page.waitForTimeout(100);
      const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).exclude(".demo").exclude("#fan").analyze();
      expect(r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")}`)).toEqual([]);
      await ctx.close();
    });
  }
}
