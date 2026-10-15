// Every interactive part of both pages, used the way a visitor would.
import { test, expect } from "@playwright/test";

test.use({ viewport: { width: 1440, height: 900 }, permissions: ["clipboard-read", "clipboard-write"] });
const clip = (page: import("@playwright/test").Page) => page.evaluate(() => navigator.clipboard.readText());

test("menu on phones opens, closes and navigates", async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto("/index.html");
  const btn = page.locator("#menuBtn");
  await btn.tap();
  await expect(page.locator("#menuSheet")).toBeVisible();
  await expect(btn).toHaveAttribute("aria-expanded", "true");
  await page.locator("#menuSheet a", { hasText: "Set up" }).tap();
  await expect(page.locator("#menuSheet")).toBeHidden();
  await page.waitForTimeout(800);
  expect(await page.evaluate(() => document.querySelector("#setup")!.getBoundingClientRect().top)).toBeLessThan(200);
  await ctx.close();
});

test("how it works: steps light up and slides open", async ({ page }) => {
  await page.goto("/index.html#how");
  await expect(page.locator("#path")).toHaveClass(/go/);
  await expect(page.locator("#path > li")).toHaveCount(5);
  await page.locator("#how .strip button").nth(2).click();
  await expect(page.locator("#lightbox")).toBeVisible();
  await expect(page.locator("#lbCount")).toHaveText("3 / 8");
  await page.keyboard.press("Escape");
  await expect(page.locator("#lightbox")).toBeHidden();
});

test("see what it makes: tabs, audience decks, edit slider", async ({ page }) => {
  await page.goto("/index.html#examples");
  await expect(page.locator("#show-decks")).toBeVisible();
  await page.getByRole("tab", { name: "For every room" }).click();
  await expect(page.locator("#show-rooms")).toBeVisible();
  await expect(page.locator("#show-decks")).toBeHidden();
  await page.locator("#show-rooms .card", { hasText: "Investor pitch" }).click();
  await expect(page.locator("#lbTitle")).toHaveText(/Investor pitch/);
  await expect(page.locator("#lbCount")).toHaveText("1 / 4");
  await page.keyboard.press("Escape");
  await page.getByRole("tab", { name: "Your own deck" }).click();
  const ba = page.locator("#ba");
  await expect(ba).toBeVisible();
  await ba.focus();
  await page.keyboard.press("ArrowRight");
  const v = Number(await ba.getAttribute("aria-valuenow"));
  await page.keyboard.press("ArrowRight");
  expect(Number(await ba.getAttribute("aria-valuenow"))).toBeGreaterThan(v);
});

test("layouts: filter, expand, collapse", async ({ page }) => {
  await page.goto("/prompts.html#layouts");
  const visible = () => page.locator("#posterGrid > li:visible").count();
  expect(await visible()).toBe(8);
  await page.locator("#showAll").click();
  expect(await visible()).toBe(37);
  await expect(page.locator("#showAll")).toHaveText(/Show fewer/);
  await page.locator("#showAll").click();
  expect(await visible()).toBe(8);
  await page.getByRole("tab", { name: /Data/ }).click();
  expect(await visible()).toBe(8);
  await expect(page.locator("#showAll")).toHaveText(/Show all 10 layouts/);
  await page.getByRole("tab", { name: /Teaching/ }).click();
  expect(await visible()).toBe(4);
  await expect(page.locator("#showAll")).toBeHidden();
});

test("examples: slide viewer opens, pages, closes", async ({ page }) => {
  await page.goto("/index.html#examples");
  const card = page.locator("#show-decks .card").first();
  await card.click();
  const dlg = page.locator("#lightbox");
  await expect(dlg).toBeVisible();
  await expect(page.locator("#lbCount")).toHaveText("1 / 8");
  const first = await page.locator("#lbImg").getAttribute("src");
  await page.locator("#lbNext").click();
  await expect(page.locator("#lbCount")).toHaveText("2 / 8");
  expect(await page.locator("#lbImg").getAttribute("src")).not.toBe(first);
  await page.keyboard.press("ArrowLeft");
  await expect(page.locator("#lbCount")).toHaveText("1 / 8");
  await page.keyboard.press("Escape");
  await expect(dlg).toBeHidden();
  await expect(card).toBeFocused();
});

test("setup: download link, system switch, copy command", async ({ page }) => {
  await page.goto("/index.html#setup");
  await expect(page.locator("#setup-gemini a", { hasText: "Download" })).toHaveAttribute("href", /releases\/latest\/download\/pptx-native\.zip$/);
  await page.getByRole("tab", { name: "Windows" }).click();
  await expect(page.locator("#termCmd")).toHaveText(/^irm https/);
  await expect(page.locator("#projCmd")).toHaveText(/^\$env:PPTX_NATIVE_PROJECT = "1"; irm https/);
  await page.getByRole("tab", { name: "macOS · Linux" }).click();
  await expect(page.locator("#projCmd")).toHaveText(/\| bash -s -- --project$/);
  await page.getByRole("tab", { name: "Windows" }).click();
  await page.locator("#copyCmd").click();
  await expect(page.locator("#copyCmd")).toHaveAttribute("data-copied", "1");
  expect(await clip(page)).toMatch(/^irm https:\/\/raw\.githubusercontent\.com\/siddharthrath1999\/pptx-native\/main\/install\.ps1 \| iex$/);
});

test("hero and final buttons go where they say", async ({ page }) => {
  await page.goto("/index.html");
  await page.locator(".hero .ctas a", { hasText: "See how it works" }).click();
  await expect(page).toHaveURL(/#how$/);
  await page.locator(".cta a", { hasText: "Install in Antigravity" }).click();
  await expect(page).toHaveURL(/#setup-antigravity$/);
  await expect.poll(() => page.evaluate(() => document.querySelector("#setup-antigravity")!.getBoundingClientRect().top)).toBeLessThan(200);
});

test("old links to moved sections still land", async ({ page }) => {
  await page.goto("/index.html#layouts");
  await expect(page).toHaveURL(/prompts\.html#layouts$/);
  await page.goto("/index.html#audiences");
  await expect(page).toHaveURL(/index\.html#examples$/);
});

test("prompt builder composes and copies", async ({ page }) => {
  await page.goto("/prompts.html#build");
  await page.locator('[data-key="len"] button', { hasText: "15" }).click();
  await page.locator('[data-key="extra"] button', { hasText: "one slide per company" }).click();
  await page.locator("#topic").fill("India's solar market");
  await expect(page.locator("#builtText")).toHaveText("Make a 15-slide market analysis on India's solar market for our leadership team, deciding whether to invest. Use the attached files first. Include one slide per company.");
  await page.locator("#copyPrompt").click();
  expect(await clip(page)).toMatch(/^@pptx-native Make a 15-slide/);
});

test("faq opens and closes", async ({ page }) => {
  await page.goto("/index.html#faq");
  const d = page.locator("#faq details").first();
  await d.locator("summary").click();
  await expect(d).toHaveAttribute("open", "");
  await d.locator("summary").click();
  await expect(d).not.toHaveAttribute("open", "");
});

test("gallery: filters, search, empty state, fields, copy", async ({ page }) => {
  await page.goto("/prompts.html");
  const visible = () => page.locator("#gGrid > li:visible").count();
  await expect(page.locator("#gEmpty")).toBeHidden();
  expect(await visible()).toBe(24);
  await page.locator("#gTabs").getByRole("tab", { name: /Editing decks/ }).click();
  expect(await visible()).toBe(6);
  await page.locator("#gTabs").getByRole("tab", { name: /^All/ }).click();
  await page.locator("#gSearch").fill("runbook");
  expect(await visible()).toBe(1);
  await page.locator("#gSearch").fill("zzzz");
  await expect(page.locator("#gEmpty")).toBeVisible();
  await page.locator("#gReset").click();
  await expect(page.locator("#gEmpty")).toBeHidden();
  expect(await visible()).toBe(24);

  const card = page.locator("#gGrid > li").first();
  const field = card.locator(".f").first();
  await field.click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.type("45");
  await page.keyboard.press("Enter");
  await card.locator('[data-act="copy"]').click();
  expect(await clip(page)).toMatch(/^@pptx-native Make a 45-slide analysis/);

  await page.locator("#gFiles").click();
  await page.locator("#gGrid > li").nth(1).locator('[data-act="copy"]').click();
  expect(await clip(page)).toMatch(/Use my attached files first\.$/);
});

test("page weight stays small", async ({ page }) => {
  await page.goto("/index.html", { waitUntil: "networkidle" });
  const r = await page.evaluate(() => {
    const res = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    const sum = (f: (e: PerformanceResourceTiming) => boolean) => Math.round(res.filter(f).reduce((a, e) => a + (e.encodedBodySize || 0), 0) / 1024);
    return {
      totalKB: sum(() => true),
      jsKB: sum((e) => e.name.endsWith(".js")),
      thirdParty: res.map((e) => new URL(e.name).host).filter((h) => h !== location.host && h !== "api.github.com"),
    };
  });
  expect(r.thirdParty, "no third-party requests").toEqual([]);
  expect(r.jsKB, "JavaScript (KB)").toBeLessThan(30);
  expect(r.totalKB, "first-screen weight (KB)").toBeLessThan(900);
});

test("back to top stays on the page you are on", async ({ page }) => {
  for (const path of ["/index.html", "/prompts.html"]) {
    await page.goto(path);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.getByRole("link", { name: "Back to top" }).click();
    await expect(page).toHaveURL(new RegExp(path.replace(".", "\\.") + "#main$"));
    await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(50);
  }
});

test("every internal link lands on a real page and section", async ({ page, request }) => {
  const bad: string[] = [];
  const cache = new Map<string, string>();
  for (const from of ["/index.html", "/prompts.html", "/releases.html"]) {
    await page.goto(from);
    const hrefs = await page.evaluate(() => Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href]")).map((a) => a.href).filter((h) => h.startsWith(location.origin)));
    for (const h of new Set(hrefs)) {
      const u = new URL(h);
      if (!cache.has(u.pathname)) {
        const r = await request.get(u.pathname);
        cache.set(u.pathname, r.ok() ? await r.text() : "");
      }
      const html = cache.get(u.pathname)!;
      if (!html) { bad.push(`${from} → ${u.pathname} (missing page)`); continue; }
      const id = u.hash.slice(1);
      if (id && !new RegExp(`id=["']?${id}["'\\s>]`).test(html)) bad.push(`${from} → ${u.pathname}#${id} (missing section)`);
    }
  }
  expect(bad).toEqual([]);
});

test("release notes: latest first, deep links, download", async ({ page }) => {
  await page.goto("/releases.html");
  const first = page.locator(".rel").first();
  await expect(first.locator(".tag")).toHaveText("Latest");
  await page.locator(".latest").click();
  await expect(page).toHaveURL(/#v\d+-\d+-\d+$/);
  await expect(page.locator(".update .btn")).toHaveAttribute("href", /releases\/latest\/download\/pptx-native\.zip$/);
  await page.goto("/index.html#setup");
  await page.locator("#setup-gemini .ver").click();
  await expect(page).toHaveURL(/releases\.html$/);
});
