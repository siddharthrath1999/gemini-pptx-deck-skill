// Small shared helpers. No libraries.
export const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
export const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll<T>(s));
export const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Run `fn` once, the first time `el` is at least `ratio` visible. */
export function onFirstView(el: Element, fn: () => void, ratio = 0.35) {
  if (!("IntersectionObserver" in window)) return fn();
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { io.disconnect(); fn(); }
  }, { threshold: ratio });
  io.observe(el);
}

/** Track whether `el` is on screen; returns a getter. */
export function visibility(el: Element, ratio = 0.2) {
  let on = false;
  new IntersectionObserver(([e]) => { on = e.isIntersecting; }, { threshold: ratio }).observe(el);
  return () => on;
}

export function toast(msg: string) {
  const t = $("#toast");
  if (!t) return;
  t.innerHTML = `<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m10.6 13.8l-2.15-2.15q-.275-.275-.7-.275t-.7.275t-.275.7t.275.7L9.9 15.9q.3.3.7.3t.7-.3l5.65-5.65q.275-.275.275-.7t-.275-.7t-.7-.275t-.7.275zM12 22q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22"/></svg>`;
  t.append(document.createTextNode(msg));
  t.classList.add("on");
  clearTimeout((toast as any).timer);
  (toast as any).timer = setTimeout(() => t.classList.remove("on"), 2200);
}

/** Copy text; flips the button into its "Copied" state for 1.6 s. */
export async function copyText(text: string, btn?: HTMLElement | null) {
  try {
    if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
    else throw new Error("no clipboard");
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); } catch { /* ignore */ }
    ta.remove();
  }
  if (btn) {
    btn.dataset.copied = "1";
    setTimeout(() => { delete btn.dataset.copied; }, 1600);
  }
}
