"""Slide layouts. Each takes a Canvas and the slide's spec dict and draws native shapes.

Field reference for every layout: references/layout-catalog.md. Common fields on every slide:
layout, tone, kicker, title, subtitle, takeaway, source, notes.
"""

import dk_measure as M
from dk_canvas import BOTTOM, CW, H, LH, MX, TOP, W, plain
from dk_charts import add_chart, add_table, series_colors
from dk_theme import clean, contrast, mix, pick_on, readable

LAYOUTS = {}
NO_FOOTER = set()


def layout(name, footer=True):
    def deco(fn):
        LAYOUTS[name] = fn
        if not footer:
            NO_FOOTER.add(name)
        return fn
    return deco


# ---- helpers ---------------------------------------------------------------------------------
def cols(n, x=MX, w=CW, gap=0.24):
    cw = (w - gap * (n - 1)) / n
    return [(x + i * (cw + gap), cw) for i in range(n)]


def as_items(items):
    """Normalise a list of strings or dicts into dicts with title/text."""
    out = []
    for it in items or []:
        out.append(dict(it) if isinstance(it, dict) else {"text": str(it)})
    return out


def measure_parts(c, parts, w, scale=1.0, min_pt=10):
    total = 0.0
    for content, o in parts:
        base = o.get("size", 14)
        size = base if base < min_pt else max(min_pt, base * scale)
        h, _ = c.measure(content, size, w - (0.22 if o.get("bullets") else 0), o.get("font", "body"), o.get("bold", False),
                         o.get("spacing", 1.0), o.get("para_gap", 0) * scale, o.get("tracking", 0), o.get("caps", False))
        total += h + o.get("gap", 0) * scale
    return total


SHRINK = (1.0, 0.94, 0.88, 0.82, 0.76, 0.7)


def fit_scale(c, groups, grow=1.0, min_pt=10):
    """One text scale for sibling blocks. groups is [(parts, width, max_height)].

    Sparse content is enlarged up to grow, as long as every block still leaves breathing room.
    """
    groups = [([p for p in parts if p and p[0] not in (None, "", [])], w, mh) for parts, w, mh in groups]
    groups = [g for g in groups if g[0]]
    if not groups:
        return 1.0
    ups = []
    g = grow
    while g > 1.04:
        ups.append(g)
        g -= 0.08
    for scale in ups:
        if all(measure_parts(c, parts, w, scale, min_pt) <= mh * 0.86 and _words_fit(c, parts, w, scale, min_pt) for parts, w, mh in groups):
            return scale
    for scale in SHRINK:
        if all(measure_parts(c, parts, w, scale, min_pt) <= mh + 0.01 and _words_fit(c, parts, w, scale, min_pt) for parts, w, mh in groups):
            return scale
    return SHRINK[-1]


def block(c, x, y, w, max_h, parts, on=None, min_pt=10, valign="t", scale=None, grow=1.0):
    """Stack text parts in a column. Shrinks (or, with grow, enlarges) them together to suit max_h. Returns end y."""
    parts = [(p[0], dict(p[1])) for p in parts if p and p[0] not in (None, "", [])]
    if not parts:
        return y
    if scale is None:
        scale = fit_scale(c, [(parts, w, max_h)], grow, min_pt)
    total = measure_parts(c, parts, w, scale, min_pt)
    if valign == "m" and total < max_h:
        y += (max_h - total) / 2
    elif valign == "b" and total < max_h:
        y += max_h - total
    for content, o in parts:
        gap = o.pop("gap", 0) * scale
        base = o.pop("size", 14)
        size = base if base < min_pt else max(min_pt, base * scale)
        if o.get("para_gap"):
            o["para_gap"] = o["para_gap"] * scale
        y = c.put(x, y, w, content, size=size, on=on, gap=gap, **o)
    if total > max_h + 0.02:
        c.boxes[-1]["fits"] = False
        c.boxes[-1]["need"] = c.boxes[-1]["h"] + (total - max_h)
    return y


def list_parts(items, ink, muted, size=15, title_size=None, text_size=None, gap_pt=7):
    """Parts for a list of strings or title/text dicts. Consecutive plain strings share one bulleted text box."""
    parts, pending = [], []

    def flush():
        if pending:
            parts.append((list(pending), {"size": size, "color": ink, "bullets": True, "para_gap": gap_pt, "spacing": 1.04, "gap": 0.14}))
            del pending[:]
    for it in as_items(items):
        if it.get("title"):
            flush()
            parts.append((it["title"], {"size": title_size or size + 1, "bold": True, "color": ink, "gap": 0.04, "spacing": 0.98}))
            parts.append((it.get("text"), {"size": text_size or size - 1.5, "color": muted, "gap": 0.16, "spacing": 1.05}))
        elif it.get("text"):
            pending.append(it["text"])
    flush()
    return parts


def item_parts(it, ink, muted, title_size=16, text_size=13, bullets=False):
    parts = []
    if it.get("title"):
        parts.append((it["title"], {"size": title_size, "bold": True, "color": ink, "gap": 0.06, "spacing": 0.98}))
    if it.get("text"):
        parts.append((it["text"], {"size": text_size, "color": muted if it.get("title") else ink, "gap": 0.12,
                                   "spacing": 1.05, "bullets": bullets and not it.get("title")}))
    return parts


def takeaway(c, d, y1):
    t = d.get("takeaway")
    if not t:
        return y1
    w = CW * 0.9
    h = min(c.measure(t, 16, w, bold=True, spacing=1.02)[0], 0.78)
    c.put(MX, y1 - h, w, t, size=16, bold=True, max_h=h + 0.01, min_size=13, spacing=1.02, name="Takeaway", role="takeaway")
    return y1 - h - 0.24


def head(c, d, **kw):
    return c.header(d.get("kicker"), d.get("title"), d.get("subtitle"), **kw)


def safe_fill(fill, ratio=4.5):
    """Nudge a fill lighter or darker until black or white text on it reaches the contrast ratio."""
    fill = clean(fill)
    for _ in range(14):
        ink = pick_on(fill, "141414", "FFFFFF")
        if contrast(ink, fill) >= ratio:
            break
        fill = mix(fill, "FFFFFF" if ink == "141414" else "000000", 0.1)
    return fill


def _words_fit(c, parts, w, scale, min_pt):
    for content, o in parts:
        base = o.get("size", 14)
        size = base if base < min_pt else max(min_pt, base * scale)
        paras = content if isinstance(content, (list, tuple)) else [content]
        paras = [plain(p).upper() if o.get("caps") else plain(p) for p in paras]
        if M.longest_word(paras, c.font(o.get("font", "body")), size, o.get("bold", False)) > w - (0.22 if o.get("bullets") else 0):
            return False
    return True


def accent_n(c, i):
    a = c.P["accents"]
    return a[i % len(a)]


def tint(c, color, amount=0.82):
    return mix(color, c.P["bg"], amount)


def token(c, value, default=None):
    """Resolve a colour token (ink, muted, accent, accent2, surface, line, bg) or a hex string."""
    if value is None:
        return default
    v = str(value).lower()
    if v in ("ink", "muted", "surface", "line", "bg", "accent"):
        return c.P[v]
    if v.startswith("accent") and v[6:].isdigit():
        return accent_n(c, int(v[6:]) - 1)
    if v in ("none", "transparent"):
        return None
    return clean(value)


# ---- openers and dividers --------------------------------------------------------------------
@layout("cover", footer=False)
def cover(c, d):
    P, T = c.P, c.theme
    y = 0.9
    if d.get("kicker"):
        y = c.kicker(MX, y, d["kicker"]) + 0.2
    title_w = CW * (0.74 if T["header"] == "block" else 0.86)
    y_title = max(y, 1.75)
    y = c.put(MX, y_title, title_w, d.get("title", ""), size=66, max_h=2.75 if d.get("subtitle") else 3.4, min_size=34, font="display",
              bold=c.display_bold(), spacing=0.92, tracking=T["tracking"] * 1.4, max_lines=3, name="Title", role="title")
    tags = d.get("tags") or []
    if d.get("subtitle"):
        floor = 5.42 if tags else 6.0
        y = c.put(MX, y + 0.26, CW * 0.72, d["subtitle"], size=20, color=P["muted"], max_h=max(0.4, floor - (y + 0.26)),
                  min_size=14, spacing=1.08, name="Subtitle", role="subtitle")
    if T["header"] == "block":
        c.rect(W - MX - 2.3, 0.9, 2.3, 2.3, fill=P["accent"], name="Cover block")
        if len(P["accents"]) > 1:
            c.rect(W - MX - 3.45, 3.2, 1.15, 1.15, fill=accent_n(c, 1), name="Cover block 2")
    c.rect(MX, 6.2, CW, 0.02, fill=P["line"] if T["card"] != "bold" else P["ink"], radius=0, name="Cover rule")
    meta = "   \u00b7   ".join(str(v) for v in (d.get("author") or c.deck.meta.get("author"), d.get("date") or c.deck.meta.get("date"), d.get("note")) if v)
    if meta:
        c.put(MX, 6.42, CW * 0.7, meta, size=12, color=P["muted"], max_h=0.4, min_size=10, name="Cover meta")
    x = W - MX
    for i, a in enumerate(reversed(P["accents"][:4])):
        x -= 0.34
        c.rect(x, 6.44, 0.26, 0.26, fill=a, radius=min(0.06, T["radius"]), name="Palette chip")
        x -= 0.06
    tx = MX
    for tag in tags[:5]:
        if tx > MX + CW * 0.8:
            break
        tx += c.pill(tx, 5.62, str(tag), fill=P["surface"] if P["surface"] != P["bg"] else mix(P["bg"], P["ink"], 0.07),
                     color=P["ink"], size=10, h=0.32) + 0.12


@layout("section", footer=False)
def section(c, d):
    P, T = c.P, c.theme
    num = d.get("number")
    y = 2.2
    if num is not None:
        c.put(MX, 1.2, CW, str(num), size=120 if len(str(num)) <= 2 else 54, font="display", bold=c.display_bold(),
              color=P["accent_big"], spacing=0.9, tracking=T["tracking"], max_h=1.9, min_size=40, max_lines=1, name="Section number")
        y = 3.25
    if d.get("kicker"):
        y = c.kicker(MX, y, d["kicker"]) + 0.14
    y = c.put(MX, y, CW * 0.85, d.get("title", ""), size=48, max_h=2.1, min_size=30, font="display", bold=c.display_bold(),
              spacing=0.95, tracking=T["tracking"], max_lines=3, name="Title", role="title")
    if d.get("subtitle"):
        c.put(MX, y + 0.22, CW * 0.7, d["subtitle"], size=18, color=P["muted"], max_h=1.0, min_size=14, spacing=1.08, name="Subtitle")
    c.footer(None)


@layout("agenda")
def agenda(c, d):
    P = c.P
    y0 = head(c, d)
    items = as_items(d.get("items"))
    n = max(1, len(items))
    if n > 6:
        c.warn("agenda: %d items; keep to 6 or fewer." % n)
    per_row = n if n <= 5 else (n + 1) // 2
    rows = 1 if n <= 5 else 2
    y1 = takeaway(c, d, c.bottom)
    gap = 0.24
    ch = (y1 - y0 - gap * (rows - 1)) / rows
    ch = min(ch, 3.4) if rows == 1 else ch
    for i, it in enumerate(items):
        r, k = divmod(i, per_row)
        x, w = cols(per_row)[k]
        y = y0 + r * (ch + gap)
        ix, iy, iw, ih, fill, ink, muted = c.card(x, y, w, ch, tab=accent_n(c, i), pad=0.26 if per_row <= 4 else 0.2)
        num = str(it.get("number", i + 1))
        c.put(ix, iy, iw, num, size=44, font="display", bold=c.display_bold(), color=ink, on=fill, spacing=0.92,
              max_h=0.75, min_size=30, max_lines=1, name="Agenda number")
        block(c, ix, iy + 0.82, iw, ih - 0.82, item_parts({"title": it.get("title") or it.get("text"),
              "text": it.get("text") if it.get("title") else None}, ink, muted, 17, 13), on=fill)


@layout("statement")
def statement(c, d):
    P, T = c.P, c.theme
    y = 1.2
    if d.get("kicker"):
        y = c.kicker(MX, y, d["kicker"]) + 0.3
    text = d.get("text") or d.get("title") or ""
    support = d.get("support") or d.get("subtitle")
    avail = (c.bottom - y) - (1.1 if support else 0.2)
    h = c.measure(text, 50, CW * 0.9, "display", c.display_bold(), 0.98, tracking=T["tracking"])[0]
    size, _ = M.fit_size([plain(text)], c.font("display"), CW * 0.9, avail, 54, 28, c.display_bold(), 0.98 * LH, 0, 0, 5)
    need = c.measure(text, size, CW * 0.9, "display", c.display_bold(), 0.98, tracking=T["tracking"])[0]
    y = max(y, y + (avail - need) * 0.38)
    y = c.put(MX, y, CW * 0.9, text, size=size, max_h=avail, min_size=26, font="display", bold=c.display_bold(),
              spacing=0.98, tracking=T["tracking"], name="Statement", role="title")
    if support:
        c.put(MX, y + 0.3, CW * 0.72, support, size=18, color=P["muted"], max_h=1.0, min_size=14, spacing=1.08, name="Support")


@layout("closing", footer=False)
def closing(c, d):
    P, T = c.P, c.theme
    y = 2.3
    if d.get("kicker"):
        y = c.kicker(MX, y, d["kicker"]) + 0.2
    y = c.put(MX, y, CW * 0.85, d.get("title", "Questions"), size=60, max_h=2.2, min_size=34, font="display",
              bold=c.display_bold(), spacing=0.94, tracking=T["tracking"], max_lines=2, name="Title", role="title")
    if d.get("subtitle"):
        y = c.put(MX, y + 0.24, CW * 0.7, d["subtitle"], size=20, color=P["muted"], max_h=1.2, min_size=15, spacing=1.08)
    if d.get("contact"):
        c.rect(MX, 6.2, CW, 0.02, fill=P["line"], radius=0)
        c.put(MX, 6.42, CW, d["contact"], size=12, color=P["muted"], max_h=0.4, min_size=10)


# ---- numbers ---------------------------------------------------------------------------------
@layout("big_number")
def big_number(c, d):
    P, T = c.P, c.theme
    y0 = head(c, d)
    y1 = takeaway(c, d, c.bottom)
    side = as_items(d.get("side"))
    lw = CW * (0.58 if side else 0.9)
    value = str(d.get("value", ""))
    size, _ = M.fit_size([value], c.font("display"), lw, 2.4, 150, 60, c.display_bold(), 0.9 * LH, 0, 0, 1)
    y = c.put(MX, y0, lw, value, size=size, font="display", bold=c.display_bold(), color=P["accent_big"] if d.get("accent", True) else P["ink"],
              spacing=0.9, tracking=T["tracking"] * 1.3, max_lines=1, name="Big number", role="stat")
    block(c, MX, y + 0.12, lw, y1 - y - 0.12, [
        (d.get("label"), {"size": 22, "bold": True, "gap": 0.12, "spacing": 1.0}),
        (d.get("text"), {"size": 15, "color": P["muted"], "spacing": 1.08}),
    ])
    if side:
        x = MX + CW * 0.64
        w = CW * 0.36
        n = len(side[:4])
        gap = 0.2
        ch = min(1.5, (y1 - y0 - gap * (n - 1)) / n)
        for i, it in enumerate(side[:4]):
            ix, iy, iw, ih, fill, ink, muted = c.card(x, y0 + i * (ch + gap), w, ch, pad=0.22)
            c.stat(ix, iy, iw, it.get("value", ""), it.get("label") or it.get("text"), size=30, color=ink, on=fill,
                   label_color=muted, max_h=ih - 0.62)


@layout("kpis")
def kpis(c, d):
    P = c.P
    y0 = head(c, d)
    y1 = takeaway(c, d, c.bottom)
    items = as_items(d.get("items"))
    n = len(items)
    if not 2 <= n <= 5:
        c.warn("kpis: %d items; use 2 to 5." % n)
    n = max(1, n)
    has_note = any(it.get("note") or it.get("text") for it in items)
    ch = min(y1 - y0, 3.3 if has_note else 2.5)
    yy = y0 + min(0.3, (y1 - y0 - ch) * 0.3)
    size = 46 if n <= 3 else (40 if n == 4 else 34)
    tile_w = cols(n)[0][1] - 0.56
    base = size
    for it in items:  # tiles share one number size, down to 72% of the standard
        fitted, _ = M.fit_size([str(it.get("value", ""))], c.font("display"), tile_w, base * LH / 72.0 * 1.02, base, base * 0.5,
                               c.display_bold(), 0.95 * LH, 0, 0, 1)
        if fitted < base * 0.72:
            c.warn("kpis: value %r is too long to match the other tiles; shorten it to about 9 characters (for example drop a currency word the label already states), without making the figure ambiguous."
                   % str(it.get("value", "")))
        size = min(size, max(fitted, base * 0.72))
    for i, it in enumerate(items):
        x, w = cols(n)[i]
        ix, iy, iw, ih, fill, ink, muted = c.card(x, yy, w, ch, emphasis=(d.get("emphasis") == i), pad=0.28)
        if it.get("icon"):
            c.icon_badge(it["icon"], ix, iy, 0.5, fill=ink, color=fill)
            iy += 0.66
            ih -= 0.66
        y = c.stat(ix, iy, iw, it.get("value", ""), None, size=size, color=ink, on=fill)
        if it.get("delta"):
            dfill = mix(ink, fill, 0.88)
            c.pill(ix, y + 0.08, str(it["delta"]), fill=dfill, color=ink, size=9, h=0.26)
            y += 0.4
        block(c, ix, y + 0.1, iw, iy + ih - y - 0.1, [
            (it.get("label") or it.get("title"), {"size": 15, "bold": True, "color": ink, "gap": 0.08}),
            (it.get("note") or it.get("text"), {"size": 12.5, "color": muted, "spacing": 1.06}),
        ], on=fill)


# ---- text-led --------------------------------------------------------------------------------
@layout("bullets")
def bullets(c, d):
    P = c.P
    y0 = head(c, d)
    y1 = takeaway(c, d, c.bottom)
    items = as_items(d.get("items"))
    aside = d.get("aside")
    if len(items) > 6:
        c.warn("bullets: %d items; keep to 6, or use cards or a table." % len(items))
    lw = CW * (0.6 if aside else 0.82)
    block(c, MX, y0, lw, y1 - y0, list_parts(items, P["ink"], P["muted"], 18, 19, 15, gap_pt=11), min_pt=12, grow=1.25)
    if aside:
        x, w = MX + CW * 0.66, CW * 0.34
        ix, iy, iw, ih, fill, ink, muted = c.card(x, y0, w, min(y1 - y0, 3.6), emphasis=bool(aside.get("emphasis", True)), pad=0.3)
        if aside.get("value"):
            iy = c.stat(ix, iy, iw, aside["value"], None, size=44, color=ink, on=fill) + 0.1
        block(c, ix, iy, iw, ih - (iy - (y0 + 0.3)), [
            (aside.get("title"), {"size": 17, "bold": True, "color": ink, "gap": 0.1}),
            (aside.get("text"), {"size": 13.5, "color": muted, "spacing": 1.08}),
        ], on=fill)


def _column_parts(col, ink, muted):
    return [(col.get("title"), {"size": 19, "bold": True, "color": ink, "gap": 0.12}),
            (col.get("text"), {"size": 14, "color": muted, "gap": 0.16, "spacing": 1.08})] + list_parts(col.get("items"), ink, muted, 14, 15, 13)


def _column_body(c, col, x, y, w, max_h, ink, muted, on=None, scale=None, grow=1.0):
    """Title, optional text, optional items (strings or title/text dicts, with optional icons)."""
    parts = [(col.get("title"), {"size": 19, "bold": True, "color": ink, "gap": 0.12, "font": "display" if col.get("display") else "body"}),
             (col.get("text"), {"size": 14, "color": muted, "gap": 0.16, "spacing": 1.08})]
    items = as_items(col.get("items"))
    has_icons = any(it.get("icon") for it in items)
    if not has_icons:
        return block(c, x, y, w, max_h, _column_parts(col, ink, muted), on=on, scale=scale, grow=grow)
    y = block(c, x, y, w, 1.6, parts, on=on)
    n = len(items)
    row = min(0.74, (max_h - (y - (y)) - 0.0) / max(n, 1))
    row = min(0.74, max(0.5, (max_h - 0.9) / max(n, 1)))
    for it in items:
        d = min(0.44, row - 0.1)
        c.icon_badge(it.get("icon") or "check", x, y, d, fill=ink, color=on or c.P["bg"])
        block(c, x + d + 0.16, y, w - d - 0.16, row - 0.06, [
            (it.get("title") or it.get("text"), {"size": 14, "bold": bool(it.get("title")), "color": ink, "gap": 0.01, "spacing": 0.98}),
            (it.get("text") if it.get("title") else None, {"size": 12, "color": muted, "spacing": 1.02}),
        ], on=on, valign="m")
        y += row
    return y


@layout("two_column")
def two_column(c, d):
    P = c.P
    y0 = head(c, d)
    y1 = takeaway(c, d, c.bottom)
    left, right = d.get("left") or {}, d.get("right") or {}
    split = float(d.get("split", 0.5))
    gap = 0.5
    lw = (CW - gap) * split
    rw = CW - gap - lw
    inset = 0.64 if d.get("cards") else 0.0
    sc = fit_scale(c, [(_column_parts(left, P["ink"], P["muted"]), lw - inset, y1 - y0 - inset),
                       (_column_parts(right, P["ink"], P["muted"]), rw - inset, y1 - y0 - inset)], grow=1.4)
    if d.get("cards"):
        for col, x, w in ((left, MX, lw), (right, MX + lw + gap, rw)):
            ix, iy, iw, ih, fill, ink, muted = c.card(x, y0, w, y1 - y0, emphasis=bool(col.get("emphasis")), pad=0.32)
            _column_body(c, col, ix, iy, iw, ih, ink, muted, on=fill, scale=sc)
    else:
        _column_body(c, left, MX, y0, lw, y1 - y0, P["ink"], P["muted"], scale=sc)
        c.line(MX + lw + gap / 2, y0 + 0.05, MX + lw + gap / 2, y1, color=P["line"], w=1)
        _column_body(c, right, MX + lw + gap, y0, rw, y1 - y0, P["ink"], P["muted"], scale=sc)


@layout("cards")
def cards(c, d):
    P = c.P
    y0 = head(c, d)
    y1 = takeaway(c, d, c.bottom)
    items = as_items(d.get("items"))
    n = len(items)
    if not 2 <= n <= 8:
        c.warn("cards: %d items; use 2 to 8." % n)
    n = max(1, n)
    per_row = d.get("columns") or (n if n <= 4 else (3 if n in (5, 6, 9) else 4))
    rows = (n + per_row - 1) // per_row
    gap = 0.22
    avail = (y1 - y0 - gap * (rows - 1)) / rows
    grid = cols(per_row, gap=gap)
    pad = 0.26
    iw0 = grid[0][1] - 2 * pad
    needs, groups = [], []
    extras = [(0.7 if it.get("icon") or d.get("numbered") else 0) + (0.72 if it.get("stat") else 0) + (0.4 if it.get("tag") else 0) for it in items]
    for i, it in enumerate(items):
        groups.append((_card_parts(c, it, P["ink"], P["muted"], per_row), iw0, avail - extras[i] - 2 * pad))
    sc = fit_scale(c, groups, grow=1.35 if rows == 1 else 1.2)
    for i, it in enumerate(items):
        needs.append(measure_parts(c, groups[i][0], iw0, sc) + extras[i] + 2 * pad + 0.12)
    ch = avail if rows > 1 else min(avail, max(max(needs + [0]), avail * 0.62, 1.7))
    for i, it in enumerate(items):
        r, k = divmod(i, per_row)
        x, w = grid[k]
        y = y0 + r * (ch + gap)
        ix, iy, iw, ih, fill, ink, muted = c.card(x, y, w, ch, emphasis=(d.get("emphasis") == i),
                                                  tab=accent_n(c, i) if d.get("tabs") else None, pad=pad)
        end = iy + ih
        if it.get("tag"):
            c.pill(ix, iy, str(it["tag"]), fill=mix(ink, fill, 0.88), color=ink, size=9, h=0.26)
            iy += 0.4
        if it.get("icon"):
            c.icon_badge(it["icon"], ix, iy, 0.52, fill=ink if not d.get("accent_icons") else accent_n(c, i), color=None if d.get("accent_icons") else fill)
            iy += 0.7
        elif d.get("numbered"):
            c.badge(ix, iy, 0.5, i + 1, fill=ink, color=fill, size=18)
            iy += 0.7
        if it.get("stat"):
            end -= 0.72
            c.rect(ix, end + 0.08, iw, 0.015, fill=mix(ink, fill, 0.8), radius=0)
            c.put(ix, end + 0.16, iw, str(it["stat"]), size=26, font="display", bold=c.display_bold(), color=ink, on=fill,
                  max_h=0.5, min_size=16, max_lines=1, spacing=0.95, name="Card stat")
        block(c, ix, iy, iw, end - iy, _card_parts(c, it, ink, muted, per_row), on=fill, scale=sc)


def _card_parts(c, it, ink, muted, per_row):
    ts = 18 if per_row <= 3 else 16
    parts = [(it.get("title"), {"size": ts, "bold": True, "color": ink, "gap": 0.1, "spacing": 0.98})]
    if it.get("text"):
        parts.append((it["text"], {"size": 13.5 if per_row <= 3 else 12.5, "color": muted if it.get("title") else ink, "gap": 0.1, "spacing": 1.07}))
    for sub in it.get("items") or []:
        parts.append((str(sub), {"size": 12.5, "color": muted, "gap": 0.06, "bullets": True, "spacing": 1.04}))
    return parts


@layout("comparison")
def comparison(c, d):
    """Side-by-side columns, each a card with a heading, rows and an optional bottom stat."""
    P = c.P
    y0 = head(c, d)
    y1 = takeaway(c, d, c.bottom)
    columns = d.get("columns") or []
    n = max(1, len(columns))
    if n > 4:
        c.warn("comparison: %d columns; use 2 to 4." % n)
    for i, col in enumerate(columns):
        x, w = cols(n)[i]
        emph = bool(col.get("highlight"))
        ix, iy, iw, ih, fill, ink, muted = c.card(x, y0, w, y1 - y0, emphasis=emph, pad=0.28)
        end = iy + ih
        if col.get("icon"):
            c.icon_badge(col["icon"], ix, iy, 0.5, fill=ink, color=accent_n(c, i) if contrast(accent_n(c, i), ink) > 2.5 else fill)
            c.put(ix + 0.66, iy + 0.02, iw - 0.66, col.get("title", ""), size=18, bold=True, color=ink, on=fill, max_h=0.5,
                  min_size=13, valign="m", spacing=0.98, name="Column title")
            iy += 0.7
            col = dict(col, title=None)
        if col.get("tag"):
            c.pill(ix, iy, str(col["tag"]), fill=mix(ink, fill, 0.86), color=ink, size=9, h=0.26)
            iy += 0.4
        if col.get("stat"):
            sh = 0.95 if col.get("stat_label") else 0.62
            end -= sh
            c.rect(ix, end + 0.06, iw, 0.015, fill=mix(ink, fill, 0.8), radius=0)
            c.stat(ix, end + 0.16, iw, col["stat"], col.get("stat_label"), size=28, color=ink, on=fill, label_color=muted, max_h=0.4)
        _column_body(c, col, ix, iy, iw, end - iy, ink, muted, on=fill)


@layout("pros_cons")
def pros_cons(c, d):
    P = c.P
    y0 = head(c, d)
    y1 = takeaway(c, d, c.bottom)
    sides = [(d.get("left") or d.get("pros") or {}, "check"), (d.get("right") or d.get("cons") or {}, "x")]
    sides = [({"title": "For" if i == 0 else "Against", "items": sd} if isinstance(sd, list) else sd, ic) for i, (sd, ic) in enumerate(sides)]
    w0 = cols(2, gap=0.3)[0][1] - 0.64
    sc = fit_scale(c, [(list_parts(sd.get("items"), P["ink"], P["muted"], 15, 16, 13.5, 9), w0, y1 - y0 - 1.34) for sd, _ in sides], grow=1.4)
    for i, (side, icon) in enumerate(sides):
        x, w = cols(2, gap=0.3)[i]
        ix, iy, iw, ih, fill, ink, muted = c.card(x, y0, w, y1 - y0, pad=0.32)
        c.icon_badge(side.get("icon") or icon, ix, iy, 0.46, fill=ink if i == 0 else mix(ink, fill, 0.55), color=fill, round_=True)
        c.put(ix + 0.62, iy, iw - 0.62, side.get("title", ""), size=19, bold=True, color=ink, on=fill, max_h=0.46, min_size=14, valign="m")
        block(c, ix, iy + 0.7, iw, ih - 0.7, list_parts(side.get("items"), ink, muted, 15, 16, 13.5, 9), on=fill, scale=sc)


@layout("before_after")
def before_after(c, d):
    P = c.P
    y0 = head(c, d)
    y1 = takeaway(c, d, c.bottom)
    gap = 0.9
    w = (CW - gap) / 2
    sc = fit_scale(c, [(_column_parts(d.get(k) or {}, P["ink"], P["muted"]), w - 0.68, y1 - y0 - 1.14) for k in ("before", "after")], grow=1.4)
    for i, key in enumerate(("before", "after")):
        side = dict(d.get(key) or {})
        x = MX + i * (w + gap)
        ix, iy, iw, ih, fill, ink, muted = c.card(x, y0, w, y1 - y0, emphasis=(i == 1), pad=0.34)
        c.pill(ix, iy, side.pop("label", "Before" if i == 0 else "After"), fill=mix(ink, fill, 0.86), color=ink, size=9, h=0.26)
        _column_body(c, side, ix, iy + 0.46, iw, ih - 0.46, ink, muted, on=fill, scale=sc)
    mid = MX + w + gap / 2
    cy = (y0 + y1) / 2
    c.oval(mid - 0.3, cy - 0.3, 0.6, 0.6, fill=P["accent"], name="Arrow disc")
    c.icon("arrow-right", mid - 0.17, cy - 0.17, 0.34, color=P["accent_ink"], weight=2.2)


@layout("quote")
def quote(c, d):
    P, T = c.P, c.theme
    y = 1.0
    if d.get("kicker"):
        y = c.kicker(MX, y, d["kicker"]) + 0.1
    c.put(MX, y, 1.6, "\u201c", size=120, font="display", bold=c.display_bold(), color=P["accent_big"], spacing=0.8, name="Quote mark")
    text = d.get("quote") or d.get("text") or ""
    avail = c.bottom - (y + 1.25) - 1.0
    yq = c.put(MX, y + 1.25, CW * 0.86, text, size=34, max_h=avail, min_size=20, font="display", bold=False if T["display"] in ("Georgia", "Cambria") else c.display_bold(),
               spacing=1.05, tracking=T["tracking"] * 0.5, name="Quote", role="title")
    block(c, MX, yq + 0.3, CW * 0.7, 0.8, [
        (d.get("by"), {"size": 16, "bold": True, "gap": 0.04}),
        (d.get("role"), {"size": 13, "color": P["muted"]}),
    ])


@layout("question")
def question(c, d):
    """A question for the room with lettered options. Pairs with an answer slide that follows."""
    P = c.P
    y0 = head(c, d, max_lines=3)
    if d.get("context"):
        y0 = c.put(MX, y0 - 0.06, CW * 0.8, d["context"], size=17, color=P["muted"], max_h=0.9, min_size=13, spacing=1.06) + 0.3
    opts = [str(o) for o in d.get("options") or []]
    n = len(opts)
    icon = d.get("icon")
    gw = CW * (0.66 if icon else 1.0)
    per_row = 2 if n in (2, 4) or n > 3 else n
    per_row = max(1, per_row)
    rows = (n + per_row - 1) // per_row if n else 0
    gap = 0.22
    avail = c.bottom - y0
    rh = min(1.3, (avail - gap * max(0, rows - 1)) / max(1, rows))
    fill = P["surface"]
    for i, opt in enumerate(opts):
        r, k = divmod(i, per_row)
        x, w = cols(per_row, MX, gw, gap)[k]
        y = y0 + r * (rh + gap)
        c.rect(x, y, w, rh, fill=fill, line=P["ink"], line_w=1.5, name="Option")
        d0 = min(0.52, rh - 0.24)
        c.badge(x + 0.2, y + (rh - d0) / 2, d0, "ABCDEFGH"[i], fill=P["ink"], size=d0 * 30)
        c.put(x + 0.36 + d0, y + 0.08, w - d0 - 0.56, opt, size=22, bold=True, color=pick_on(fill, "141414", "FFFFFF"), on=fill,
              max_h=rh - 0.16, min_size=13, valign="m", spacing=0.98, name="Option text")
        c.boxes[-1]["y"], c.boxes[-1]["h"] = y + 0.08, rh - 0.16
        c.slide.shapes[-1].top, c.slide.shapes[-1].height = int(914400 * (y + 0.08)), int(914400 * (rh - 0.16))
    if icon:
        d1 = min(2.4, avail)
        cx = MX + gw + (CW - gw - d1) / 2 + 0.1
        cy = y0 + max(0, (rows * rh + gap * (rows - 1) - d1) / 2)
        c.oval(cx, cy, d1, d1, fill=P["ink"], name="Question disc")
        c.icon(icon, cx + d1 * 0.26, cy + d1 * 0.26, d1 * 0.48, color=P["bg"], weight=3)


@layout("recap")
def recap(c, d):
    P, T = c.P, c.theme
    y0 = head(c, d)
    items = as_items(d.get("items"))
    n = max(1, len(items))
    if n > 5:
        c.warn("recap: %d items; keep to 5." % n)
    y1 = takeaway(c, d, c.bottom)
    gap = 0.14
    rh = min(1.5, (y1 - y0 - gap * (n - 1)) / n)
    rp = lambda it: [(it.get("title") or it.get("text"), {"size": 18, "bold": True, "gap": 0.05, "spacing": 1.0}),
                     (it.get("text") if it.get("title") else None, {"size": 13.5, "color": P["muted"], "spacing": 1.05})]
    sc = fit_scale(c, [(rp(it), CW - 1.45, rh - 0.2) for it in items], grow=1.3, min_pt=11)
    for i, it in enumerate(items):
        y = y0 + i * (rh + gap)
        c.rect(MX, y, CW, 0.015, fill=P["line"], radius=0, name="Rule")
        c.put(MX, y + 0.14, 0.9, "%02d" % (i + 1), size=26, font="display", bold=c.display_bold(), color=P["accent_text"], max_h=0.5, max_lines=1, spacing=0.95)
        block(c, MX + 1.05, y + 0.15, CW - 1.45, rh - 0.2, rp(it), min_pt=11, scale=sc)


@layout("next_steps")
def next_steps(c, d):
    P = c.P
    y0 = head(c, d)
    y1 = takeaway(c, d, c.bottom)
    items = as_items(d.get("items"))
    n = max(1, len(items))
    if n > 6:
        c.warn("next_steps: %d items; keep to 6 per slide." % n)
    gap = 0.14
    rh = min(0.95, (y1 - y0 - gap * (n - 1)) / n)
    has_owner = any(it.get("owner") for it in items)
    has_when = any(it.get("when") for it in items)
    ow, ww = (2.2 if has_owner else 0), (1.7 if has_when else 0)
    for i, it in enumerate(items):
        y = y0 + i * (rh + gap)
        ix, iy, iw, ih, fill, ink, muted = c.card(MX, y, CW, rh, pad=0.2)
        d0 = min(0.44, rh - 0.3)
        c.badge(ix, y + (rh - d0) / 2, d0, i + 1, fill=ink, color=fill, size=d0 * 30)
        tw = iw - d0 - 0.25 - ow - ww - (0.3 if ow or ww else 0)
        block(c, ix + d0 + 0.25, y + 0.1, tw, rh - 0.2, [
            (it.get("action") or it.get("title") or it.get("text"), {"size": 16, "bold": True, "color": ink, "gap": 0.02, "spacing": 0.98}),
            (it.get("text") if (it.get("action") or it.get("title")) else None, {"size": 12, "color": muted}),
        ], on=fill, valign="m", min_pt=10.5)
        x = MX + CW - 0.2 - ww - ow
        if has_owner and it.get("owner"):
            block(c, x, y + 0.1, ow - 0.15, rh - 0.2, [("Owner", {"size": 9, "color": muted, "caps": True, "tracking": 60, "bold": True, "gap": 0.02}),
                  (str(it["owner"]), {"size": 13, "color": ink, "bold": True})], on=fill, valign="m", min_pt=9)
        if has_when and it.get("when"):
            block(c, x + ow, y + 0.1, ww - 0.1, rh - 0.2, [("When", {"size": 9, "color": muted, "caps": True, "tracking": 60, "bold": True, "gap": 0.02}),
                  (str(it["when"]), {"size": 13, "color": ink, "bold": True})], on=fill, valign="m", min_pt=9)


@layout("sources")
def sources(c, d):
    P = c.P
    y0 = head(c, d)
    items = [str(i) for i in d.get("items") or []]
    ncol = d.get("columns") or (2 if len(items) > 6 else 1)
    per = (len(items) + ncol - 1) // ncol if items else 0
    numbered = d.get("numbered", True)
    for k in range(ncol):
        x, w = cols(ncol, gap=0.5)[k]
        col_items = items[k * per:(k + 1) * per]
        parts = [(("%d.  %s" % (k * per + j + 1, s)) if numbered else s, {"size": 12, "color": P["ink"], "gap": 0.1, "spacing": 1.05})
                 for j, s in enumerate(col_items)]
        block(c, x, y0, w, c.bottom - y0, parts, min_pt=9)


# ---- data ------------------------------------------------------------------------------------
@layout("table")
def table(c, d):
    y0 = head(c, d)
    y1 = takeaway(c, d, c.bottom)
    spec = d.get("table") or {"columns": d.get("columns"), "rows": d.get("rows")}
    for key in ("highlight_row", "highlight_col", "widths", "align", "zebra", "size", "header"):
        if key in d and key not in spec:
            spec[key] = d[key]
    add_table(c, MX, y0, CW * float(d.get("width", 1.0)), spec, y1 - y0)


def _insights(c, d, x, y0, w, y1):
    P = c.P
    callout = d.get("callout")
    y = y0
    if callout:
        ix, iy, iw, ih, fill, ink, muted = c.card(x, y, w, min(2.3, y1 - y0), emphasis=True, pad=0.28)
        yy = c.stat(ix, iy, iw, callout.get("value", ""), None, size=40, color=ink, on=fill)
        block(c, ix, yy + 0.08, iw, iy + ih - yy - 0.08, [
            (callout.get("label"), {"size": 15, "bold": True, "color": ink, "gap": 0.06}),
            (callout.get("text"), {"size": 12.5, "color": muted, "spacing": 1.06}),
        ], on=fill)
        y += min(2.3, y1 - y0) + 0.28
    parts = []
    for it in as_items(d.get("insights")):
        if it.get("title"):
            parts.append((it["title"], {"size": 15, "bold": True, "gap": 0.04}))
            parts.append((it.get("text"), {"size": 13, "color": P["muted"], "gap": 0.2, "spacing": 1.06}))
        else:
            parts.append((it.get("text"), {"size": 14, "gap": 0.16, "bullets": True, "spacing": 1.05}))
    if parts:
        block(c, x, y, w, y1 - y, parts, min_pt=11)


@layout("chart")
def chart(c, d):
    P = c.P
    y0 = head(c, d)
    y1 = takeaway(c, d, c.bottom)
    side = bool(d.get("insights") or d.get("callout"))
    cw = CW * (0.64 if side else 1.0)
    y = y0
    if d.get("chart_title"):
        y = c.put(MX, y, cw, d["chart_title"], size=12, color=P["muted"], bold=True, max_h=0.4, min_size=10) + 0.08
    add_chart(c, MX - 0.08, y, cw + 0.08, y1 - y, d.get("chart") or {})
    c._rec("region", MX, y, cw, y1 - y, name="chart")
    if side:
        _insights(c, d, MX + CW * 0.68, y0, CW * 0.32, y1)


@layout("charts")
def charts(c, d):
    P = c.P
    y0 = head(c, d)
    y1 = takeaway(c, d, c.bottom)
    specs = d.get("charts") or []
    n = max(1, len(specs))
    if n > 3:
        c.warn("charts: %d charts; use 2 or 3." % n)
    for i, spec in enumerate(specs):
        x, w = cols(n, gap=0.4)[i]
        y = y0
        if spec.get("title"):
            y = c.put(x, y, w, spec["title"], size=14, bold=True, max_h=0.5, min_size=11) + 0.02
        if spec.get("subtitle"):
            y = c.put(x, y, w, spec["subtitle"], size=11.5, color=P["muted"], max_h=0.4, min_size=10) + 0.04
        add_chart(c, x - 0.06, y, w + 0.06, y1 - y, spec)
        c._rec("region", x, y, w, y1 - y, name="chart")


@layout("bar_list")
def bar_list(c, d):
    """Ranked horizontal bars drawn as shapes: label, bar, value. Good for benchmarks of up to 10 rows."""
    P = c.P
    y0 = head(c, d)
    y1 = takeaway(c, d, c.bottom)
    side = bool(d.get("insights") or d.get("callout"))
    w = CW * (0.64 if side else 1.0)
    items = as_items(d.get("items"))
    n = max(1, len(items))
    if n > 10:
        c.warn("bar_list: %d rows; keep to 10." % n)
    vals = [float(it.get("value") or 0) for it in items]
    vmax = float(d.get("max") or max(vals + [1e-9]))
    fmt, unit = d.get("format", "{:,.0f}"), d.get("unit", "")
    rh = min(0.62, (y1 - y0) / n)
    lab_w = min(w * 0.34, max(1.4, max([M.text_width(plain(it.get("label", "")), c.font("body"), 13, True) for it in items] + [1.0]) + 0.2))
    val_w = 1.15
    bar_x, bar_w = MX + lab_w, w - lab_w - val_w
    hl = d.get("highlight")
    neutral = mix(P["ink"], P["bg"], 0.76)
    main = series_colors(c, 1)[0]
    for i, it in enumerate(items):
        y = y0 + i * rh
        on = hl is None or it.get("label") == hl or i == hl or (isinstance(hl, list) and (it.get("label") in hl or i in hl))
        c.put(MX, y, lab_w - 0.15, it.get("label", ""), size=13, bold=on, color=P["ink"], max_h=rh - 0.08, min_size=10, valign="m", spacing=0.98, name="Bar label")
        c.boxes[-1]["h"] = rh - 0.08
        c.slide.shapes[-1].height = int(914400 * (rh - 0.08))
        bh = min(0.34, rh * 0.56)
        by = y + (rh - 0.08 - bh) / 2
        c.rect(bar_x, by, bar_w, bh, fill=mix(P["line"], P["bg"], 0.55), radius=min(c.radius(), bh / 2), name="Bar track")
        frac = max(0.0, min(1.0, vals[i] / vmax)) if vmax else 0
        if frac > 0:
            c.rect(bar_x, by, max(bar_w * frac, 0.06), bh, fill=clean(it["color"]) if it.get("color") else (main if on else neutral),
                   radius=min(c.radius(), bh / 2), name="Bar")
        label = it.get("display") or (fmt.format(vals[i]) + unit)
        c.text(bar_x + bar_w + 0.14, y, val_w - 0.14, rh - 0.08, label, size=14, bold=True, valign="m", name="Bar value")
        if it.get("note"):
            note = str(it["note"])
            filled = bar_w * frac
            need_w = M.text_width(plain(note), c.font("body"), 10) + 0.24
            track = mix(P["line"], P["bg"], 0.55)
            bar_fill = clean(it["color"]) if it.get("color") else (main if on else neutral)
            if need_w <= filled:
                c.text(bar_x + 0.12, by, filled - 0.2, bh, note, size=10, color=pick_on(bar_fill, "141414", "FFFFFF"),
                       valign="m", on=bar_fill, name="Bar note")
            elif need_w <= bar_w - filled:
                c.text(bar_x + filled + 0.12, by, bar_w - filled - 0.2, bh, note, size=10, color=readable(P["muted"], track, 4.5),
                       valign="m", on=track, name="Bar note")
            else:
                c.warn("bar_list: note %r is too long for its bar; keep notes under about %d characters or move them to insights."
                       % (note[:40], max(8, int((bar_w - 0.3) / 0.075 / 2))))
    if side:
        _insights(c, d, MX + CW * 0.68, y0, CW * 0.32, y1)


@layout("split_bar")
def split_bar(c, d):
    """One to three 100% bars split into labelled segments, for showing where a total goes."""
    P = c.P
    y0 = head(c, d)
    y1 = takeaway(c, d, c.bottom)
    bars = d.get("bars") or []
    n = max(1, len(bars))
    if n > 3:
        c.warn("split_bar: %d bars; use 1 to 3." % n)
    slot = min(1.75, (y1 - y0) / n)
    palette = series_colors(c, 8)
    hl = d.get("highlight")
    for i, bar in enumerate(bars):
        y = y0 + i * slot
        if bar.get("label"):
            y = c.put(MX, y, CW, bar["label"], size=15, bold=True, max_h=0.36, min_size=12, max_lines=1) + 0.1
        bh = min(0.95, y0 + (i + 1) * slot - y - 0.28)
        segs = bar.get("segments") or []
        total = sum(float(s.get("value") or 0) for s in segs) or 1.0
        x = MX
        gap = 0.04
        usable = CW - gap * (len(segs) - 1)
        bar_hl = bar.get("highlight", hl)
        if not any(s.get("label") == bar_hl or j == bar_hl for j, s in enumerate(segs)):
            bar_hl = None
        for j, s in enumerate(segs):
            sw = usable * float(s.get("value") or 0) / total
            emph = bar_hl is not None and (s.get("label") == bar_hl or j == bar_hl)
            base = clean(s["color"]) if s.get("color") else palette[j % len(palette)]
            fill = safe_fill(base if (bar_hl is None or emph) else mix(base, P["bg"], 0.72))
            if sw > 0.02:
                c.rect(x, y, sw, bh, fill=fill, radius=min(c.radius(), 0.08), name="Segment")
                label = s.get("display") or s.get("label", "")
                ink = pick_on(fill, "141414", "FFFFFF")
                size, fits = M.fit_size([plain(label)], c.font("body"), sw - 0.16, bh - 0.1, 15, 9, True, LH, 0, 0, 2)
                if fits and sw > 0.5:
                    c.text(x + 0.08, y, sw - 0.16, bh, label, size=size, bold=True, color=ink, on=fill, align="c", valign="m", name="Segment label")
                else:
                    c.warn("split_bar: segment %r is too narrow for its label; shorten it or put the figure in the takeaway." % label)
            x += sw + gap


@layout("heatmap")
def heatmap(c, d):
    """A grid of values shaded by size: rows are entities, columns are criteria or periods."""
    P = c.P
    y0 = head(c, d)
    y1 = takeaway(c, d, c.bottom)
    columns = [str(v) for v in d.get("columns") or []]
    rows = d.get("rows") or []
    nr, nc = max(1, len(rows)), max(1, len(columns))
    lab_w = min(3.2, max(1.5, max([M.text_width(plain(str(r.get("name", ""))), c.font("body"), 13, True) for r in rows] + [1.0]) + 0.25))
    cw = (CW - lab_w) / nc
    hh = 0.5
    rh = min(0.7, (y1 - y0 - hh) / nr)
    vals = [float(v) for r in rows for v in (r.get("values") or []) if isinstance(v, (int, float))]
    lo, hi = (min(vals), max(vals)) if vals else (0, 1)
    fmt = d.get("format", "{:,.0f}")
    base = token(c, d.get("color")) or (P["accent"] if contrast(P["accent"], P["bg"]) >= 1.25 else series_colors(c, 1)[0])
    for j, col in enumerate(columns):
        c.text(MX + lab_w + j * cw + 0.04, y0, cw - 0.08, hh - 0.08, col, size=11, bold=True, color=P["muted"], align="c", valign="b",
               caps=True, tracking=40, fit=8, name="Column head")
    for i, r in enumerate(rows):
        y = y0 + hh + i * rh
        c.text(MX, y, lab_w - 0.15, rh - 0.06, str(r.get("name", "")), size=13, bold=True, valign="m", fit=10, name="Row label")
        for j in range(nc):
            v = (r.get("values") or [])[j] if j < len(r.get("values") or []) else None
            if isinstance(v, (int, float)):
                t = (float(v) - lo) / (hi - lo) if hi > lo else 0.5
                if d.get("reverse"):
                    t = 1 - t
                fill = safe_fill(mix(mix(base, P["bg"], 0.9), base, t))
                label = fmt.format(v)
            else:
                fill, label = mix(P["line"], P["bg"], 0.5), "" if v is None else str(v)
            c.rect(MX + lab_w + j * cw + 0.03, y, cw - 0.06, rh - 0.06, fill=fill, radius=min(c.radius(), 0.06), name="Cell")
            c.text(MX + lab_w + j * cw + 0.03, y, cw - 0.06, rh - 0.06, label, size=13, bold=True, color=pick_on(fill, "141414", "FFFFFF"),
                   on=fill, align="c", valign="m", fit=9, name="Cell value")


@layout("scorecard")
def scorecard(c, d):
    """Benchmark grid: rows scored on criteria with filled dots (0 to scale), plus an optional note column."""
    P = c.P
    y0 = head(c, d)
    y1 = takeaway(c, d, c.bottom)
    columns = [str(v) for v in d.get("columns") or []]
    rows = d.get("rows") or []
    scale = int(d.get("scale", 5))
    nr, nc = max(1, len(rows)), max(1, len(columns))
    has_note = any(r.get("note") for r in rows)
    note_w = CW * 0.24 if has_note else 0
    lab_w = min(3.0, max(1.6, max([M.text_width(plain(str(r.get("name", ""))), c.font("body"), 14, True) for r in rows] + [1.0]) + 0.3))
    cw = (CW - lab_w - note_w) / nc
    hh = 0.55
    rh = min(0.78, (y1 - y0 - hh) / nr)
    hl = d.get("highlight")
    main = series_colors(c, 1)[0]
    for j, col in enumerate(columns):
        c.text(MX + lab_w + j * cw + 0.04, y0, cw - 0.08, hh - 0.1, col, size=11, bold=True, color=P["muted"], align="c", valign="b",
               caps=True, tracking=40, fit=8, name="Criterion")
    if has_note:
        c.text(MX + lab_w + nc * cw + 0.15, y0, note_w - 0.15, hh - 0.1, d.get("note_title", "Note"), size=11, bold=True, color=P["muted"],
               valign="b", caps=True, tracking=40, name="Note head")
    c.rect(MX, y0 + hh - 0.04, CW, 0.02, fill=P["ink"], radius=0, name="Head rule")
    for i, r in enumerate(rows):
        y = y0 + hh + i * rh
        on_fill = P["bg"]
        if hl is not None and (r.get("name") == hl or i == hl):
            on_fill = mix(P["accent"], P["bg"], 0.8)
            c.rect(MX - 0.12, y + 0.02, CW + 0.24, rh - 0.04, fill=on_fill, radius=min(c.radius(), 0.1), name="Row highlight")
        elif i < nr - 1:
            c.rect(MX, y + rh - 0.01, CW, 0.012, fill=P["line"], radius=0, name="Row rule")
        c.text(MX, y, lab_w - 0.15, rh, str(r.get("name", "")), size=14, bold=True, valign="m", fit=10, on=on_fill, name="Row label")
        for j in range(nc):
            v = (r.get("scores") or [])[j] if j < len(r.get("scores") or []) else None
            cx = MX + lab_w + j * cw
            if isinstance(v, (int, float)):
                dd = min(0.19, (cw - 0.3) / scale * 0.8)
                step = dd * 1.28
                x0 = cx + (cw - (step * (scale - 1) + dd)) / 2
                for k in range(scale):
                    filled = k < round(v)
                    c.oval(x0 + k * step, y + (rh - dd) / 2, dd, dd, fill=main if filled else None,
                           line=None if filled else mix(P["ink"], on_fill, 0.6), line_w=1.0, name="Score dot")
            elif v is not None:
                c.text(cx + 0.04, y, cw - 0.08, rh, str(v), size=13, bold=True, align="c", valign="m", fit=9, on=on_fill, name="Score text")
        if has_note and r.get("note"):
            c.text(MX + lab_w + nc * cw + 0.15, y + 0.04, note_w - 0.15, rh - 0.08, str(r["note"]), size=12, color=readable(P["muted"], on_fill, 4.5),
                   valign="m", fit=9, on=on_fill, name="Row note")


# ---- flows and structures --------------------------------------------------------------------
@layout("timeline")
def timeline(c, d):
    P = c.P
    y0 = head(c, d)
    y1 = takeaway(c, d, c.bottom)
    items = as_items(d.get("items"))
    n = max(1, len(items))
    if n > 7:
        c.warn("timeline: %d milestones; keep to 7 per slide." % n)
    grid = cols(n, gap=0.2)
    big = n <= 5
    ly = y0 + (0.78 if big else 0.62)
    c.rect(MX, ly - 0.012, CW, 0.024, fill=P["ink"], radius=0, name="Timeline line")
    hl = d.get("highlight")
    tp = lambda it: [(it.get("title"), {"size": 17 if big else 14, "bold": True, "gap": 0.09, "spacing": 0.98}),
                     (it.get("text"), {"size": 13.5 if big else 12, "color": P["muted"], "spacing": 1.07})]
    sc = fit_scale(c, [(tp(it), grid[0][1] - 0.05, y1 - ly - 0.3) for it in items], grow=1.25, min_pt=9.5)
    for i, it in enumerate(items):
        x, w = grid[i]
        on = hl is not None and (i == hl or it.get("date") == hl)
        c.put(x, y0, w, str(it.get("date", "")), size=24 if big else 16, bold=c.display_bold(), color=P["accent_big"] if on or hl is None else P["muted"],
              max_h=0.55 if big else 0.4, min_size=12, max_lines=1, font="display", spacing=0.95, name="Date")
        c.oval(x, ly - 0.09, 0.18, 0.18, fill=P["accent"] if (on or hl is None) else P["bg"], line=P["ink"], line_w=1.5, name="Milestone dot")
        block(c, x, ly + 0.3, w - 0.05, y1 - ly - 0.3, tp(it), min_pt=9.5, scale=sc)


@layout("process")
def process(c, d):
    P = c.P
    y0 = head(c, d)
    y1 = takeaway(c, d, c.bottom)
    steps = as_items(d.get("steps") or d.get("items"))
    n = max(1, len(steps))
    if n > 6:
        c.warn("process: %d steps; keep to 6 per slide." % n)
    gap = 0.42
    grid = cols(n, gap=gap)
    pad = 0.24
    sc = fit_scale(c, [(_card_parts(c, s, P["ink"], P["muted"], n), grid[0][1] - 2 * pad, y1 - y0 - 0.75 - 2 * pad) for s in steps], grow=1.3)
    need = max([measure_parts(c, _card_parts(c, s, P["ink"], P["muted"], n), grid[0][1] - 2 * pad, sc) for s in steps] + [0.5]) + 0.8 + 2 * pad
    ch = min(y1 - y0, max(need, (y1 - y0) * 0.62))
    for i, s in enumerate(steps):
        x, w = grid[i]
        ix, iy, iw, ih, fill, ink, muted = c.card(x, y0, w, ch, emphasis=(d.get("emphasis") == i), pad=pad)
        if s.get("icon"):
            c.icon_badge(s["icon"], ix, iy, 0.5, fill=ink, color=fill)
        else:
            c.badge(ix, iy, 0.5, i + 1, fill=ink, color=fill, size=18)
        block(c, ix, iy + 0.7, iw, ih - 0.7, _card_parts(c, s, ink, muted, n), on=fill, scale=sc)
        if i < n - 1:
            ax = x + w + gap / 2
            c.icon("arrow-right", ax - 0.13, y0 + ch / 2 - 0.13, 0.26, color=P["ink"], weight=2)


@layout("funnel")
def funnel(c, d):
    P = c.P
    y0 = head(c, d)
    y1 = takeaway(c, d, c.bottom)
    stages = d.get("stages") or d.get("items") or []
    n = max(1, len(stages))
    if n > 6:
        c.warn("funnel: %d stages; keep to 6." % n)
    gap = 0.1
    rh = min(0.82, (y1 - y0 - gap * (n - 1)) / n)
    vals = [float(s.get("value") or 0) for s in stages]
    top = max(vals + [1e-9])
    area_x, area_w = MX + CW * 0.2, CW * 0.52
    main = series_colors(c, 1)[0]
    fmt = d.get("format", "{:,.0f}")
    for i, s in enumerate(stages):
        y = y0 + i * (rh + gap)
        frac = max(0.16, vals[i] / top) if top else 0.2
        bw = area_w * frac
        bx = area_x + (area_w - bw) / 2
        fill = safe_fill(mix(main, P["bg"], min(0.6, i * 0.6 / max(1, n - 1))))
        c.rect(bx, y, bw, rh, fill=fill, radius=min(c.radius(), 0.1), name="Stage")
        c.text(bx, y, bw, rh, s.get("display") or fmt.format(vals[i]), size=18, bold=True, color=pick_on(fill, "141414", "FFFFFF"), on=fill,
               align="c", valign="m", fit=11, name="Stage value")
        c.text(MX, y, CW * 0.2 - 0.2, rh, str(s.get("label", "")), size=15, bold=True, align="r", valign="m", fit=10, name="Stage label")
        note = s.get("note")
        if note is None and i > 0 and vals[i - 1]:
            note = "%.0f%% of previous" % (100.0 * vals[i] / vals[i - 1])
        if note:
            c.text(area_x + area_w + 0.25, y, CW - (CW * 0.2 + area_w) - 0.25, rh, str(note), size=12.5, color=P["muted"], valign="m", fit=9.5, name="Stage note")


@layout("matrix")
def matrix(c, d):
    """A 2x2. quadrants are listed top-left, top-right, bottom-left, bottom-right."""
    P = c.P
    y0 = head(c, d)
    y1 = takeaway(c, d, c.bottom)
    quads = as_items(d.get("quadrants"))[:4]
    ax = 0.46
    gx, gy, gw, gh = MX + ax, y0, CW - ax, y1 - y0 - ax
    gap = 0.16
    qw, qh = (gw - gap) / 2, (gh - gap) / 2
    hl = d.get("highlight")
    for i, q in enumerate(quads):
        r, k = divmod(i, 2)
        x, y = gx + k * (qw + gap), gy + r * (qh + gap)
        ix, iy, iw, ih, fill, ink, muted = c.card(x, y, qw, qh, emphasis=(hl == i), pad=0.24)
        parts = [(q.get("title"), {"size": 17, "bold": True, "color": ink, "gap": 0.08}),
                 (q.get("text"), {"size": 13, "color": muted, "gap": 0.1, "spacing": 1.06})]
        for sub in q.get("items") or []:
            parts.append((str(sub), {"size": 12.5, "color": muted, "gap": 0.05, "bullets": True}))
        block(c, ix, iy, iw, ih, parts, on=fill)
    ya = d.get("y_axis") or {}
    xa = d.get("x_axis") or {}
    ya = {"label": ya} if isinstance(ya, str) else ya
    xa = {"label": xa} if isinstance(xa, str) else xa
    c.line(gx - 0.2, gy + gh, gx - 0.2, gy, color=P["ink"], w=1.25, arrow=True, name="Y axis")
    c.line(gx, gy + gh + 0.2, gx + gw, gy + gh + 0.2, color=P["ink"], w=1.25, arrow=True, name="X axis")
    c.text(gx - 0.32 - gh / 2, gy + gh / 2 - 0.12, gh, 0.24, str(ya.get("label", "")), size=10.5, bold=True, color=P["muted"],
           align="c", caps=True, tracking=50, rotation=-90, name="Y axis label")
    c.text(gx, gy + gh + 0.26, gw, 0.22, str(xa.get("label", "")), size=10.5, bold=True, color=P["muted"], align="c", caps=True, tracking=50, name="X axis label")


@layout("layers")
def layers(c, d):
    """Stacked bands, top to bottom, for architectures, value chains or pyramids of needs."""
    P = c.P
    y0 = head(c, d)
    y1 = takeaway(c, d, c.bottom)
    items = as_items(d.get("layers") or d.get("items"))
    n = max(1, len(items))
    if n > 6:
        c.warn("layers: %d layers; keep to 6." % n)
    gap = 0.12
    rh = min(1.05, (y1 - y0 - gap * (n - 1)) / n)
    main = series_colors(c, 1)[0]
    pyramid = bool(d.get("pyramid"))
    for i, it in enumerate(items):
        y = y0 + i * (rh + gap)
        fill = safe_fill(mix(main, P["bg"], 0.1 + 0.72 * i / max(1, n - 1)) if n > 1 else main)
        w = CW * (0.45 + 0.55 * (i + 1) / n) if pyramid else CW
        x = MX + (CW - w) / 2 if pyramid else MX
        c.rect(x, y, w, rh, fill=fill, name="Layer")
        ink = pick_on(fill, "141414", "FFFFFF")
        tw = min(3.4, w * 0.32)
        c.put(x + 0.3, y + 0.08, tw - 0.2, it.get("title") or "", size=20, bold=True, color=ink, on=fill, max_h=rh - 0.16, min_size=11, valign="m", spacing=0.98)
        c.boxes[-1]["h"] = rh - 0.16
        c.slide.shapes[-1].height = int(914400 * (rh - 0.16))
        if it.get("text"):
            c.put(x + 0.3 + tw, y + 0.08, w - tw - 0.6, it["text"], size=15, color=ink, on=fill, max_h=rh - 0.16, min_size=10, valign="m", spacing=1.04)
            c.boxes[-1]["h"] = rh - 0.16
            c.slide.shapes[-1].height = int(914400 * (rh - 0.16))


@layout("roadmap")
def roadmap(c, d):
    """Lanes of bars across periods. Each item has label, start and end (period indexes, 0-based, end exclusive)."""
    P = c.P
    y0 = head(c, d)
    y1 = takeaway(c, d, c.bottom)
    periods = [str(p) for p in d.get("periods") or []]
    lanes = d.get("lanes") or []
    np_, nl = max(1, len(periods)), max(1, len(lanes))
    lab_w = 2.1
    pw = (CW - lab_w) / np_
    hh = 0.42
    lh = (y1 - y0 - hh) / nl
    for j, p in enumerate(periods):
        x = MX + lab_w + j * pw
        c.text(x + 0.06, y0, pw - 0.12, hh - 0.1, p, size=11, bold=True, color=P["muted"], caps=True, tracking=40, valign="m", fit=8, name="Period")
        c.line(x, y0 + hh, x, y1, color=P["line"], w=0.75, dash=True)
    c.rect(MX, y0 + hh - 0.02, CW, 0.02, fill=P["ink"], radius=0)
    palette = series_colors(c, 6)
    for i, lane in enumerate(lanes):
        y = y0 + hh + i * lh
        if i:
            c.rect(MX, y, CW, 0.012, fill=P["line"], radius=0)
        c.text(MX, y + 0.06, lab_w - 0.2, lh - 0.12, str(lane.get("name", "")), size=13.5, bold=True, valign="m", fit=10, name="Lane")
        items = lane.get("items") or []
        tracks = []
        for it in items:
            s, e = float(it.get("start", 0)), float(it.get("end", it.get("start", 0) + 1))
            t = 0
            while t < len(tracks) and tracks[t] > s + 1e-6:
                t += 1
            if t == len(tracks):
                tracks.append(e)
            else:
                tracks[t] = e
            it["_track"] = t
        nt = max(1, len(tracks))
        bh = min(0.52, (lh - 0.16) / nt - 0.06)
        for it in items:
            s, e = float(it.get("start", 0)), float(it.get("end", it.get("start", 0) + 1))
            x = MX + lab_w + s * pw + 0.05
            w = max(0.3, (e - s) * pw - 0.1)
            by = y + 0.1 + it["_track"] * (bh + 0.06) + max(0, (lh - 0.2 - nt * (bh + 0.06)) / 2)
            fill = clean(it["color"]) if it.get("color") else palette[i % len(palette)]
            if it.get("milestone"):
                c.rect(x, by, bh, bh, fill=fill, kind="diamond", name="Milestone")
                c.text(x + bh + 0.08, by, max(1.0, w), bh, str(it.get("label", "")), size=11, bold=True, valign="m", name="Milestone label")
            else:
                c.rect(x, by, w, bh, fill=fill, radius=min(c.radius(), bh / 2), name="Roadmap bar")
                c.text(x + 0.1, by, w - 0.2, bh, str(it.get("label", "")), size=13, bold=True, color=pick_on(fill, "141414", "FFFFFF"), on=fill,
                       valign="m", fit=8.5, max_lines=2, name="Bar label")


@layout("steps")
def steps(c, d):
    """Runbook steps: numbered rows with what to do, an optional command, and owner/time columns."""
    P = c.P
    y0 = head(c, d)
    y1 = takeaway(c, d, c.bottom)
    items = as_items(d.get("steps") or d.get("items"))
    n = max(1, len(items))
    if n > 6:
        c.warn("steps: %d steps; keep to 6 per slide and continue on the next." % n)
    start = int(d.get("start", 1))
    gap = 0.12
    rh = min(1.45, (y1 - y0 - gap * (n - 1)) / n)
    meta_keys = [k for k in ("owner", "time", "check") if any(it.get(k) for it in items)]
    mw = 1.75 * len(meta_keys)
    for i, it in enumerate(items):
        y = y0 + i * (rh + gap)
        c.rect(MX, y, CW, 0.015, fill=P["line"] if i else P["ink"], radius=0)
        c.put(MX, y + 0.13, 0.8, "%02d" % (start + i), size=22, font="mono", bold=True, color=P["accent_text"], max_h=0.42, max_lines=1)
        tw = CW - 0.95 - mw - (0.2 if mw else 0)
        yy = block(c, MX + 0.95, y + 0.13, tw, rh - 0.18 - (0.36 if it.get("code") else 0), [
            (it.get("title") or it.get("text"), {"size": 16, "bold": True, "gap": 0.03, "spacing": 0.98}),
            (it.get("text") if it.get("title") else None, {"size": 12.5, "color": P["muted"], "spacing": 1.05}),
        ], min_pt=10)
        if it.get("code"):
            cy = min(yy + 0.06, y + rh - 0.34)
            c.rect(MX + 0.95, cy, tw, 0.3, fill=P["ink"], radius=min(c.radius(), 0.06), name="Command")
            c.text(MX + 1.07, cy, tw - 0.24, 0.3, str(it["code"]), size=11, font="mono", color=P["bg"], on=P["ink"], valign="m", fit=8, max_lines=1, name="Command text")
        for k, key in enumerate(meta_keys):
            if it.get(key):
                x = MX + CW - mw + k * 1.75
                block(c, x, y + 0.14, 1.65, rh - 0.2, [(key, {"size": 9, "color": P["muted"], "caps": True, "tracking": 60, "bold": True, "gap": 0.02}),
                      (str(it[key]), {"size": 12.5, "bold": True})], min_pt=9)


@layout("code")
def code(c, d):
    P = c.P
    y0 = head(c, d)
    y1 = takeaway(c, d, c.bottom)
    side = bool(d.get("insights"))
    w = CW * (0.64 if side else 1.0)
    src = str(d.get("code", "")).rstrip("\n")
    lines = src.split("\n")
    fill = P["ink"] if not c.P["tone"] == "dark" else P["surface"]
    ink = pick_on(fill, "141414", "F4F4F2")
    c.rect(MX, y0, w, y1 - y0, fill=fill, name="Code panel")
    yy = y0 + 0.22
    if d.get("caption"):
        yy = c.put(MX + 0.3, yy, w - 0.6, d["caption"], size=10.5, font="mono", color=mix(ink, fill, 0.4), on=fill, caps=True, tracking=30, max_h=0.3) + 0.12
    longest = max(lines, key=len) if lines else ""
    size = 14.0
    while size > 8 and (M.text_width(longest, c.font("mono"), size) > w - 0.6 or len(lines) * size * LH / 72.0 > y1 - yy - 0.2):
        size -= 0.5
    if M.text_width(longest, c.font("mono"), size) > w - 0.6 or len(lines) * size * LH / 72.0 > y1 - yy - 0.2:
        c.warn("code: %d lines, longest %d chars, does not fit at 8 pt; trim or split." % (len(lines), len(longest)))
    c.text(MX + 0.3, yy, w - 0.6, y1 - yy - 0.2, lines, size=size, font="mono", color=ink, on=fill, name="Code")
    c.boxes[-1]["fits"] = True
    if side:
        _insights(c, d, MX + CW * 0.68, y0, CW * 0.32, y1)


# ---- free canvas -----------------------------------------------------------------------------
@layout("custom")
def custom(c, d):
    """Free placement. elements is a list of dicts with type and x, y, w, h in inches. See the catalog."""
    P = c.P
    if d.get("title") or d.get("kicker"):
        head(c, d)
    for el in d.get("elements") or []:
        t = el.get("type", "text")
        x, y, w, h = [float(el.get(k, 0)) for k in ("x", "y", "w", "h")]
        on = token(c, el.get("on"))
        if t == "text":
            kw = dict(size=el.get("size", 14), color=token(c, el.get("color")) or (pick_on(on, "141414", "FFFFFF") if on else None), font=el.get("font", "body"), bold=bool(el.get("bold")),
                      italic=bool(el.get("italic")), align=el.get("align", "l"), valign=el.get("valign", "t"),
                      caps=bool(el.get("caps")), tracking=el.get("tracking", 0), on=on, bullets=bool(el.get("bullets")),
                      spacing=el.get("spacing", 1.0), name=el.get("name"))
            if h:
                c.text(x, y, w, h, el.get("text", ""), fit=el.get("min_size", max(9, kw["size"] * 0.7)), **kw)
            else:
                c.put(x, y, w, el.get("text", ""), **kw)
        elif t in ("rect", "oval", "chevron", "pentagon", "arrow", "triangle", "diamond", "hexagon"):
            c.rect(x, y, w, h, fill=token(c, el.get("fill")), line=token(c, el.get("line")), line_w=el.get("line_w", 1.0),
                   radius=el.get("radius"), kind=None if t == "rect" else t, alpha=el.get("alpha"), name=el.get("name"), rotation=el.get("rotation", 0))
        elif t == "line":
            c.line(x, y, float(el.get("x2", x + w)), float(el.get("y2", y + h)), color=token(c, el.get("color")), w=el.get("line_w", 1.0),
                   dash=bool(el.get("dash")), arrow=bool(el.get("arrow")))
        elif t == "icon":
            c.icon(el.get("name"), x, y, w or h or 0.5, color=token(c, el.get("color")))
        elif t == "icon_badge":
            c.icon_badge(el.get("name"), x, y, w or h or 0.6, fill=token(c, el.get("fill")), color=token(c, el.get("color")), round_=bool(el.get("round")))
        elif t == "pill":
            c.pill(x, y, str(el.get("text", "")), fill=token(c, el.get("fill")), color=token(c, el.get("color")), size=el.get("size", 10))
        elif t == "badge":
            c.badge(x, y, w or 0.5, el.get("text", ""), fill=token(c, el.get("fill")), color=token(c, el.get("color")))
        elif t == "stat":
            c.stat(x, y, w, el.get("value", ""), el.get("label"), size=el.get("size", 40), color=token(c, el.get("color")), on=on)
        elif t == "card":
            ix, iy, iw, ih, fill, ink, muted = c.card(x, y, w, h, emphasis=bool(el.get("emphasis")), tab=token(c, el.get("tab")))
            parts = [(el.get("title"), {"size": 17, "bold": True, "color": ink, "gap": 0.08}),
                     (el.get("text"), {"size": 13, "color": muted, "spacing": 1.06, "gap": 0.1})]
            for sub in el.get("items") or []:
                parts.append((str(sub), {"size": 12.5, "color": muted, "gap": 0.05, "bullets": True}))
            block(c, ix, iy, iw, ih, parts, on=fill)
        elif t == "chart":
            add_chart(c, x, y, w, h, el.get("chart") or {})
            c._rec("region", x, y, w, h, name="chart")
        elif t == "table":
            add_table(c, x, y, w, el.get("table") or {}, h or (c.bottom - y))
        else:
            c.warn("custom: unknown element type %r." % t)
