// Runs on every page: header state, menu, section highlight, fade-ins, stars.
import { $, $$ } from "./util";

const nav = $("#nav")!;
const menuBtn = $("#menuBtn")!;

/* menu */
function setMenu(open: boolean) {
  nav.classList.toggle("open", open);
  menuBtn.setAttribute("aria-expanded", String(open));
  menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
}
menuBtn.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
$$("#menuSheet a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

/* header turns solid after the first screenful (no scroll listener) */
const sentinel = document.createElement("div");
sentinel.style.cssText = "position:absolute;top:0;left:0;height:40px;width:1px;pointer-events:none";
document.body.prepend(sentinel);
new IntersectionObserver(([e]) => nav.classList.toggle("scrolled", !e.isIntersecting)).observe(sentinel);

/* highlight the section in view */
const spyLinks = $$<HTMLAnchorElement>(".links a[data-spy]");
if (spyLinks.length) {
  const byId = new Map(spyLinks.map((a) => [a.dataset.spy!, a]));
  const inView = new Set<string>();
  const order = spyLinks.map((a) => a.dataset.spy!);
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) e.isIntersecting ? inView.add(e.target.id) : inView.delete(e.target.id);
    const current = order.filter((id) => inView.has(id)).pop();
    spyLinks.forEach((a) => a.classList.toggle("active", a.dataset.spy === current));
  }, { rootMargin: "-45% 0px -50% 0px" });
  byId.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
}

/* fade-ins: once, the first time a block appears */
const rv = $$(".rv");
const showAll = () => rv.forEach((el) => el.classList.add("in"));
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }, { rootMargin: "0px 0px -6% 0px", threshold: 0.08 });
  rv.forEach((el) => io.observe(el));
} else showAll();
// Jumping to a section (menu, links, back/forward) never shows blank blocks.
if (location.hash) showAll();
window.addEventListener("hashchange", showAll);
document.addEventListener("click", (e) => {
  const a = (e.target as Element).closest?.("a[href*='#']");
  if (a) showAll();
});

/* GitHub stars, only when there are some */
const stars = $("#stars");
if (stars) {
  fetch("https://api.github.com/repos/siddharthrath1999/pptx-native")
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => { if (d && d.stargazers_count > 0) { stars.textContent = `★ ${d.stargazers_count}`; stars.hidden = false; } })
    .catch(() => {});
}
