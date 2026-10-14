#!/usr/bin/env python3
"""Build a native, editable .pptx from a deck spec, then lint it.

Usage:
  python build_deck.py SPEC -o deck.pptx        SPEC is a .json file or a folder holding deck.json
                                                plus slides-*.json part files (merged in name order)
  python build_deck.py --layouts | --presets | --icons
Exit code 0 = built with no errors, 1 = built but lint found errors, 2 = could not build.
"""

import argparse
import glob
import json
import os
import sys
import traceback

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import dk_lint  # noqa: E402
import dk_measure  # noqa: E402
from dk_canvas import Deck, icon_names  # noqa: E402
from dk_layouts import LAYOUTS, NO_FOOTER  # noqa: E402
from dk_theme import PRESETS, Theme  # noqa: E402


def read_json(path):
    with open(path, encoding="utf-8") as handle:
        raw = handle.read()
    try:
        return json.loads(raw)
    except ValueError as exc:
        line = getattr(exc, "lineno", "?")
        col = getattr(exc, "colno", "?")
        context = raw.split("\n")[line - 1][max(0, col - 60):col + 20] if isinstance(line, int) else ""
        raise SystemExit("JSON error in %s at line %s col %s: %s\n  near: %s" % (path, line, col, getattr(exc, "msg", exc), context))


def load_spec(path):
    if os.path.isdir(path):
        base = os.path.join(path, "deck.json")
        if not os.path.exists(base):
            raise SystemExit("No deck.json in %s" % path)
        spec = read_json(base)
        slides = list(spec.get("slides") or [])
        for part in sorted(glob.glob(os.path.join(path, "slides*.json"))):
            data = read_json(part)
            slides.extend(data.get("slides", []) if isinstance(data, dict) else data)
        spec["slides"] = slides
        return spec
    spec = read_json(path)
    if isinstance(spec, list):
        spec = {"slides": spec}
    for inc in spec.get("include") or []:
        data = read_json(os.path.join(os.path.dirname(path), inc))
        spec.setdefault("slides", []).extend(data.get("slides", []) if isinstance(data, dict) else data)
    return spec


def build(spec, out):
    theme = Theme(spec.get("theme"))
    deck = Deck(theme, spec.get("meta"))
    findings = [{"slide": 0, "level": "warn", "msg": w} for w in theme.warnings]
    slides = spec.get("slides") or []
    for i, s in enumerate(slides, 1):
        name = s.get("layout")
        default_tone = {"section": "dark", "closing": "dark", "question": "accent", "statement": "accent"}.get(name, "light")
        canvas = deck.new_slide(s.get("tone") or default_tone, s)
        if name not in LAYOUTS:
            findings.append({"slide": i, "level": "error", "msg": "Unknown layout %r. Layouts: %s" % (name, ", ".join(sorted(LAYOUTS)))})
            canvas.header(s.get("kicker"), s.get("title") or "Unknown layout %r" % name)
        else:
            try:
                LAYOUTS[name](canvas, s)
            except Exception as exc:
                tb = traceback.format_exc().strip().split("\n")
                findings.append({"slide": i, "level": "error", "msg": "Layout '%s' failed: %s: %s (%s)" % (name, type(exc).__name__, exc, tb[-3].strip() if len(tb) > 2 else "")})
        if name not in NO_FOOTER:
            try:
                canvas.footer(s.get("source"))
            except Exception as exc:
                findings.append({"slide": i, "level": "error", "msg": "Footer failed: %s" % exc})
        canvas.notes(s.get("notes"))
        findings.extend(dk_lint.lint_geometry(canvas))
        findings.extend(dk_lint.lint_copy(s, i))
    findings.extend(dk_lint.lint_deck(slides))
    for fam in dk_measure.unmeasured_fonts():
        findings.append({"slide": 0, "level": "info", "msg": "No metrics for font %r; its text was measured as Arial, so check those slides in the render." % fam})
    seen, unique = set(), []
    for f in findings:
        key = (f["slide"], f["level"], f["msg"])
        if key not in seen:
            seen.add(key)
            unique.append(f)
    deck.save(out)
    return deck, unique


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("spec", nargs="?")
    ap.add_argument("-o", "--out", default="deck.pptx")
    ap.add_argument("--layouts", action="store_true")
    ap.add_argument("--presets", action="store_true")
    ap.add_argument("--icons", action="store_true")
    args = ap.parse_args()
    if args.layouts:
        for name in sorted(LAYOUTS):
            print("%-14s %s" % (name, (LAYOUTS[name].__doc__ or "").strip().split("\n")[0]))
        return 0
    if args.presets:
        for name, p in sorted(PRESETS.items()):
            print("%-16s bg %s ink %s accents %s  fonts %s / %s  card %s header %s" % (
                name, p["bg"], p["ink"], ",".join(p["accents"]), p["display"], p["body"], p["card"], p["header"]))
        return 0
    if args.icons:
        print(" ".join(icon_names()))
        return 0
    if not args.spec:
        ap.print_help()
        return 2
    try:
        spec = load_spec(args.spec)
        deck, findings = build(spec, args.out)
    except SystemExit:
        raise
    except Exception:
        traceback.print_exc()
        return 2
    errors = sum(1 for f in findings if f["level"] == "error")
    warns = sum(1 for f in findings if f["level"] == "warn")
    report = dk_lint.format_findings(findings)
    base = os.path.splitext(args.out)[0]
    with open(base + ".lint.txt", "w", encoding="utf-8") as handle:
        handle.write(report + "\n")
    counts = {}
    for s in spec.get("slides") or []:
        counts[s.get("layout")] = counts.get(s.get("layout"), 0) + 1
    print("Built %s: %d slides, theme %s" % (args.out, len(deck.canvases), deck.theme.name))
    print("Layouts used: " + ", ".join("%s x%d" % (k, v) for k, v in sorted(counts.items(), key=lambda kv: -kv[1])))
    print("Lint: %d errors, %d warnings, %d notes (full list in %s.lint.txt)" % (errors, warns, len(findings) - errors - warns, base))
    if findings:
        print(dk_lint.format_findings(findings, limit=60))
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
