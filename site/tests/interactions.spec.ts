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

test("how it works: steps, autoplay and play again", async ({ page }) => {
  await page.goto("/index.html#how");
  const label = page.locator("#boardLabel");
  await page.locator('#thread [data-step="3"] button').click();
  await expect(label).toHaveText("design");
  await expect(page.locator("#board .scene.active")).toHaveCount(1);
  await page.locator('#thread [data-step="6"] button').click();
  await expect(label).toHaveText("delivery");
  await expect(page.locator("#replayAgain")).toBeVisible();
  await page.locator("#replayAgain").click();
  await expect(label).toHaveText("your request");
  await page.mouse.move(5, 5); // not hovering, so it plays
  await expect(label).toHaveText("research", { timeout: 4000 });
});

test("audiences: tabs, thumbnails, edit slider", async ({ page }) => {
  await page.goto("/index.html#audiences");
  await page.getByRole("tab", { name: "Investor pitch" }).click();
  await expect(page.locator('#audPanel [data-pane="1"]')).toBeVisible();
  await expect(page.locator('#audPanel [data-pane="0"]')).toBeHidden();
  await page.locator("#audThumbs button").nth(2).click();
  await expect(page.locator("#audThumbs button").nth(2)).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#audMain > img.on")).toHaveAttribute("src", /pitch-3/);
  await page.getByRole("tab", { name: "Edit your deck" }).click();
  const ba = page.locator("#ba");
  await expect(ba).toBeVisible();
  await ba.focus();
  const before = Number(await ba.getAttribute("aria-valuenow"));
  await page.keyboard.press("ArrowRight");
  expect(Number(await ba.getAttribute("aria-valuenow"))).toBeGreaterThan(before);
});

test("layouts: filter, expand, collapse", async ({ page }) => {
  await page.goto("/index.html#layouts");
  const visible = () => page.locator("#posterGrid > li:visible").count();
  expect(await visible()).toBe(8);
  await page.locator("#showAll").click();
  expect(await visible()).toBe(34);
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
  const card = page.locator("#exGrid .card").first();
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

test("setup: walkthrough, Antigravity tab, copy command", async ({ page }) => {
  await page.goto("/index.html#setup");
  await page.locator("#walkNext").click();
  await expect(page.locator('#walk button[aria-current="step"]')).toContainText("Open Customise");
  await expect(page.locator("#mockMain .is-target")).toHaveText("Skills");
  await page.getByRole("tab", { name: "Antigravity" }).click();
  await expect(page.locator("#panel-agy")).toBeVisible();
  await page.getByRole("tab", { name: "Windows" }).click();
  await expect(page.locator("#termCmd")).toHaveText(/^irm https/, { timeout: 4000 });
  await page.locator("#copyCmd").click();
  await expect(page.locator("#copyCmd")).toHaveAttribute("data-copied", "1");
  expect(await clip(page)).toMatch(/^irm https:\/\/raw\.githubusercontent\.com\/siddharthrath1999\/pptx-native\/main\/install\.ps1 \| iex$/);
});

test("call-to-action opens the Antigravity tab", async ({ page }) => {
  await page.goto("/index.html");
  await page.locator(".cta a[data-agy]").click();
  await expect(page.getByRole("tab", { name: "Antigravity" })).toHaveAttribute("aria-selected", "true");
});

test("prompt builder composes and copies", async ({ page }) => {
  await page.goto("/index.html#prompts");
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
  await page.getByRole("tab", { name: /Editing decks/ }).click();
  expect(await visible()).toBe(6);
  await page.getByRole("tab", { name: /^All/ }).click();
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
