"""Checks a built deck: geometry (bounds, overflow, contrast, overlap) and copy (AI writing patterns,
weak headlines, missing sources). Findings are dicts: slide, level (error|warn|info), msg."""

import re

from dk_canvas import H, W, plain
from dk_theme import contrast

BANNED = [
    "delve", "leverage", "leveraging", "seamless", "seamlessly", "robust", "cutting-edge", "game-changer",
    "game-changing", "unlock", "unlocking", "unleash", "elevate", "empower", "empowering", "harness",
    "tapestry", "testament", "pivotal", "crucial", "paradigm", "synergy", "synergies", "holistic",
    "revolutionize", "revolutionary", "transformative", "supercharge", "world-class", "best-in-class",
    "next-level", "ever-evolving", "fast-paced", "in today's", "it's worth noting", "it is worth noting",
    "at the end of the day", "moreover", "furthermore", "in conclusion", "needless to say", "deep dive",
    "foster", "streamline", "bustling", "realm", "landscape of", "navigate the", "navigating the",
    "double down", "move the needle", "low-hanging fruit", "boasts", "underscores", "a myriad",
    "stands as", "serves as a", "plays a vital role", "plays a key role", "rich history", "look no further",
]
PATTERNS = [
    (r"\bnot (just|only|merely) [^.;:]{1,60}?,? but\b", "the 'not just X but Y' construction"),
    (r"\b(it|this|that)(\u2019|')?s not (about )?[^.;:]{1,60}?[,;.] ?(it|this|that)(\u2019|')?s\b", "the 'it's not X, it's Y' construction"),
    (r"\bisn(\u2019|')t (just |about )[^.;:]{1,60}?[,;.] ?it(\u2019|')s\b", "the 'isn't X, it's Y' construction"),
    (r"\bmore than just\b", "'more than just'"),
    (r"\b(the (result|catch|best part|takeaway|answer|bottom line))\?", "a self-answered rhetorical question"),
    (r"\bwhether you(\u2019|')re\b", "'whether you're ...'"),
    (r"\b(imagine|picture this)\b[:,]", "an 'imagine...' opener"),
]
EMOJI = re.compile(u"[\U0001F300-\U0001FAFF\u2600-\u26ff\u2700-\u27bf\u2b50\u2b06\u2705\u274c]")
SKIP_KEYS = {"layout", "tone", "icon", "type", "color", "fill", "font", "name", "number_format", "axis_format",
             "format", "preset", "id", "on", "align", "valign", "notes", "code", "x_format", "display_font", "kind"}
LABEL_OK = {"cover", "section", "closing", "agenda", "sources", "recap", "next_steps", "statement", "quote", "custom", "code"}
DATA_LAYOUTS = {"chart", "charts", "table", "bar_list", "heatmap", "scorecard", "big_number", "kpis", "split_bar", "funnel"}


def strings(node, key=None):
    if isinstance(node, dict):
        for k, v in node.items():
            if k in SKIP_KEYS or k.startswith("_"):
                continue
            for s in strings(v, k):
                yield s
    elif isinstance(node, (list, tuple)):
        for v in node:
            for s in strings(v, key):
                yield s
    elif isinstance(node, str) and node.strip():
        yield key, node


def lint_copy(spec, number):
    out = []
    add = lambda level, msg: out.append({"slide": number, "level": level, "msg": msg})
    layout = spec.get("layout", "")
    seen = set()
    for key, s in list(strings(spec)) + [("notes", spec.get("notes") or "")]:
        low = s.lower()
        quote = lambda: '"%s"' % (plain(s)[:70] + ("..." if len(s) > 70 else ""))
        if "\u2014" in s or re.search(r"\s\u2013\s", s) or " -- " in s:
            add("error", "Dash used as punctuation in %s. Rewrite with a comma, colon, full stop or brackets." % quote())
        if EMOJI.search(s):
            add("error", "Emoji in %s. Use an icon field or plain words." % quote())
        if key != "notes" and "!" in s and not re.search(r"!\[|!=", s):
            add("warn", "Exclamation mark in %s." % quote())
        for word in BANNED:
            if re.search(r"(?<![a-z])" + re.escape(word) + r"(?![a-z])", low) and (word, key) not in seen:
                seen.add((word, key))
                add("warn", "Stock AI phrasing '%s' in %s. Say the specific thing instead." % (word, quote()))
        for pat, label in PATTERNS:
            if re.search(pat, low):
                add("warn", "Uses %s in %s. State the point directly." % (label, quote()))
        if re.search(r"\b(lorem ipsum|tbd|tbc|xx+)\b", low) or re.search(r"\[[^\]]{0,40}\]", s):
            add("info", "Placeholder to resolve or report in the handoff: %s" % quote())
    title = spec.get("title")
    if layout not in ("cover", "closing", "statement", "quote", "section") and not title and layout != "custom":
        add("warn", "No title. Give the slide a sentence headline that states its point.")
    if title:
        words = plain(title).split()
        if len(plain(title)) > 110:
            add("warn", "Title is %d characters. Keep headlines under about 110 so they fit in two lines." % len(plain(title)))
        caps = [w for w in words if w[:1].isupper()]
        if len(words) >= 5 and len(caps) >= len(words) * 0.75 and layout not in ("cover",):
            add("warn", "Title looks like Title Case. Use sentence case: \"%s\"" % plain(title)[:60])
        if len(words) <= 2 and layout not in LABEL_OK:
            add("warn", "Title \"%s\" is a label. Write the finding as a short sentence." % plain(title))
    if layout in DATA_LAYOUTS and not spec.get("source") and not spec.get("no_source"):
        add("warn", "Data slide without a source line. Add \"source\", or \"no_source\": true if the data is the user's own.")
    charts = [spec.get("chart")] if spec.get("chart") else list(spec.get("charts") or [])
    for ch in charts:
        if isinstance(ch, dict) and ch.get("type", "column") in ("column", "stacked_column", "stacked100_column", "waterfall", "line", "area"):
            cats = [str(x) for x in ch.get("categories") or []]
            longest = max([len(x) for x in cats] + [0])
            if cats and longest * len(cats) > 90:
                add("warn", "Chart category labels are long for a column chart (%d labels, longest %d characters); they will be "
                            "drawn at an angle. Shorten them to two or three words, or use a bar chart." % (len(cats), longest))
    if layout == "bullets" and len(spec.get("items") or []) > 6:
        add("warn", "More than 6 bullets. Split the slide or change layout.")
    return out


def lint_geometry(canvas):
    out = []
    n = canvas.number
    add = lambda level, msg: out.append({"slide": n, "level": level, "msg": msg})
    for msg in canvas.warnings:
        add("warn", msg)
    for msg in getattr(canvas, "errors", []):
        add("error", msg)
    if True:
        for m in getattr(canvas.deck, "marks", []):
            for b in canvas.boxes:
                if b["kind"] not in ("text", "image") or b.get("role") == "footer" and b.get("name") == "Page":
                    continue
                ix = min(b["x"] + b["w"], m["x"] + m["w"]) - max(b["x"], m["x"])
                iy = min(b["y"] + b["h"], m["y"] + m["h"]) - max(b["y"], m["y"])
                if ix > 0.05 and iy > 0.05:
                    add("warn", "%s sits on the template's %s. Move or shorten it, or pick another layout for this slide." % (b.get("name") or b["kind"], m["name"]))
                    break
    texts = []
    for b in canvas.boxes:
        x, y, w, h = b["x"], b["y"], b["w"], b["h"]
        label = b.get("name") or b["kind"]
        if b["kind"] in ("region",):
            continue
        if x < -0.01 or y < -0.01 or x + w > W + 0.01 or y + h > H + 0.01:
            add("error", "%s runs off the slide (x %.2f to %.2f, y %.2f to %.2f)." % (label, x, x + w, y, y + h))
        elif b["kind"] == "text" and (x < 0.3 or x + w > W - 0.3 or y < 0.25 or y + h > H - 0.12):
            add("warn", "%s sits inside the slide margin (x %.2f to %.2f, y %.2f to %.2f)." % (label, x, x + w, y, y + h))
        if b["kind"] in ("text", "cell"):
            snippet = b.get("text", "")[:50]
            if not b.get("fits", True) or b.get("need", 0) > h + 0.04:
                add("error", "Text overflows its box by about %.2f in: \"%s\". Shorten it, cut an item, or split the slide."
                    % (max(0.0, b.get("need", 0) - h), snippet))
            size = b.get("size", 12)
            floor = 8 if b.get("role") in ("footer", "pill", "badge") else 9
            if size < floor - 0.01 and b["kind"] == "text":
                add("warn", "Text at %.1f pt is too small to read: \"%s\"." % (size, snippet))
            ratio = contrast(b.get("color", "000000"), b.get("on", "FFFFFF"))
            need = 3.0 if size >= 18 else 4.5
            if ratio < need - 0.05:
                add("warn" if ratio >= need * 0.75 else "error",
                    "Low contrast (%.1f:1, needs %.1f:1) for \"%s\"." % (ratio, need, snippet))
            if b["kind"] == "text" and b.get("role") not in ("badge", "footer"):
                used = min(h, b.get("need", h)) if b.get("need") else h
                texts.append((x, y, w, used, snippet))
    for i in range(len(texts)):
        for j in range(i + 1, len(texts)):
            a, b = texts[i], texts[j]
            ix = min(a[0] + a[2], b[0] + b[2]) - max(a[0], b[0])
            iy = min(a[1] + a[3], b[1] + b[3]) - max(a[1], b[1])
            if ix > 0.05 and iy > 0.05:
                small = min(a[2] * a[3], b[2] * b[3]) or 1
                if ix * iy / small > 0.25:
                    add("error", "Text boxes overlap: \"%s\" and \"%s\"." % (a[4][:30], b[4][:30]))
    return out


def lint_deck(specs):
    out = []
    add = lambda slide, level, msg: out.append({"slide": slide, "level": level, "msg": msg})
    streak, prev = 0, None
    titles = {}
    for i, s in enumerate(specs, 1):
        lay = s.get("layout")
        streak = streak + 1 if lay == prev else 1
        prev = lay
        if streak == 4 and lay not in ("steps", "sources"):
            add(i, "warn", "Four '%s' slides in a row. Vary the layout to keep the rhythm." % lay)
        t = plain(s.get("title") or "").strip().lower()
        if t and lay not in ("section",):
            if t in titles:
                add(i, "warn", "Same title as slide %d. Each headline should make its own point." % titles[t])
            titles.setdefault(t, i)
    n = len(specs)
    if n:
        bullets = sum(1 for s in specs if s.get("layout") == "bullets")
        if bullets > max(2, n * 0.15):
            add(0, "warn", "%d of %d slides are bullet lists. Turn most into cards, tables, charts or statements." % (bullets, n))
        if n >= 16 and not any(s.get("layout") == "section" for s in specs):
            add(0, "warn", "A %d-slide deck with no section dividers. Add 'section' slides between parts." % n)
        if n >= 10 and len({s.get("tone", "light") for s in specs}) == 1:
            add(0, "info", "Every slide uses the same tone. Use dark or accent tones for dividers, questions and statements.")
        if not any(s.get("notes") for s in specs):
            add(0, "info", "No speaker notes anywhere. Add notes unless the user asked for none.")
    return out


def format_findings(findings, limit=None):
    order = {"error": 0, "warn": 1, "info": 2}
    findings = sorted(findings, key=lambda f: (order[f["level"]], f["slide"]))
    lines = []
    for f in findings[:limit] if limit else findings:
        where = "deck" if not f["slide"] else "slide %d" % f["slide"]
        lines.append("[%s] %s: %s" % (f["level"].upper(), where, f["msg"]))
    if limit and len(findings) > limit:
        lines.append("... and %d more (see the .lint.txt file)" % (len(findings) - limit))
    return "\n".join(lines)
