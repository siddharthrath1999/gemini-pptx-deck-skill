"""Theme tokens, presets, colour maths and per-slide tones.

A theme is a flat dict of tokens. Presets are starting points: a deck spec names one and
overrides any token, or supplies every token itself. Missing tokens are derived.
"""

SAFE_FONTS = [
    "Arial", "Arial Black", "Georgia", "Times New Roman", "Trebuchet MS", "Verdana",
    "Courier New", "Calibri", "Cambria",
]

PRESETS = {
    "editorial-warm": {
        "bg": "F6F5F1", "surface": "FFFFFF", "ink": "141414", "muted": "5F5F5F", "line": "DCDAD3",
        "dark": "141414", "accents": ["FFD43B", "C6E8CF", "D9D4FF", "FFB89A"],
        "series": ["141414", "E0A800", "3F9B6B", "6C5CE7", "E4572E", "8A887F"],
        "display": "Arial", "body": "Arial", "mono": "Courier New",
        "radius": 0.14, "card": "outline", "header": "kicker", "kicker": "caps", "tracking": -20,
    },
    "boardroom-navy": {
        "bg": "FFFFFF", "surface": "F3F5F9", "ink": "0F1B2D", "muted": "56627A", "line": "D5DBE5",
        "dark": "0F1B2D", "accents": ["1F5EFF", "00A389", "F2A900", "D64545"],
        "series": ["1F5EFF", "0F1B2D", "00A389", "F2A900", "8E9AB0", "D64545"],
        "display": "Georgia", "body": "Arial", "mono": "Courier New",
        "radius": 0.04, "card": "fill", "header": "rule", "kicker": "caps", "tracking": 0,
    },
    "mono-minimal": {
        "bg": "FAFAFA", "surface": "FFFFFF", "ink": "111111", "muted": "666666", "line": "DEDEDE",
        "dark": "111111", "accents": ["E4572E", "111111", "BDBDBD"],
        "series": ["111111", "E4572E", "8C8C8C", "BDBDBD", "4A4A4A", "F2A48F"],
        "display": "Arial", "body": "Arial", "mono": "Courier New",
        "radius": 0.0, "card": "outline", "header": "kicker", "kicker": "mono", "tracking": -10,
    },
    "playful-bright": {
        "bg": "FFF9EF", "surface": "FFFFFF", "ink": "1D1B3A", "muted": "5C5A78", "line": "E9DFCC",
        "dark": "1D1B3A", "accents": ["FF5C7A", "3D5AFE", "FFC53D", "22C3A6"],
        "series": ["3D5AFE", "FF5C7A", "22C3A6", "FFC53D", "8E6CF0", "1D1B3A"],
        "display": "Trebuchet MS", "body": "Trebuchet MS", "mono": "Courier New",
        "radius": 0.24, "card": "bold", "header": "block", "kicker": "pill", "tracking": -10,
    },
    "dark-tech": {
        "bg": "0E1116", "surface": "181D26", "ink": "F2F4F8", "muted": "9AA4B2", "line": "2B3340",
        "dark": "F2F4F8", "accents": ["5EEAD4", "7C9CFF", "FBBF24", "F472B6"],
        "series": ["5EEAD4", "7C9CFF", "FBBF24", "F472B6", "9AA4B2", "A3E635"],
        "display": "Arial", "body": "Arial", "mono": "Courier New",
        "radius": 0.08, "card": "fill", "header": "kicker", "kicker": "mono", "tracking": -10,
    },
    "classic-serif": {
        "bg": "FBF8F3", "surface": "FFFFFF", "ink": "2B2118", "muted": "6B5F54", "line": "E2D9CC",
        "dark": "2B2118", "accents": ["9C3D2A", "2F5D50", "C9A227", "44546A"],
        "series": ["9C3D2A", "2F5D50", "C9A227", "44546A", "B8A999", "2B2118"],
        "display": "Georgia", "body": "Georgia", "mono": "Courier New",
        "radius": 0.0, "card": "rule", "header": "rule", "kicker": "caps", "tracking": 0,
    },
    "soft-pastel": {
        "bg": "F7F5FB", "surface": "FFFFFF", "ink": "2A2540", "muted": "67627F", "line": "E3DFEE",
        "dark": "2A2540", "accents": ["8B7CF6", "F29FB7", "7FD1C7", "F6C177"],
        "series": ["8B7CF6", "2A2540", "49B6A8", "E98AA6", "E5A24A", "B5AED3"],
        "display": "Trebuchet MS", "body": "Arial", "mono": "Courier New",
        "radius": 0.2, "card": "fill", "header": "kicker", "kicker": "pill", "tracking": -10,
    },
    "bold-contrast": {
        "bg": "FFFFFF", "surface": "F2F2F2", "ink": "000000", "muted": "555555", "line": "000000",
        "dark": "000000", "accents": ["FF3B1D", "0047FF", "FFD60A"],
        "series": ["000000", "FF3B1D", "0047FF", "FFD60A", "9A9A9A", "FF9E8E"],
        "display": "Arial Black", "body": "Arial", "mono": "Courier New",
        "radius": 0.0, "card": "bold", "header": "block", "kicker": "caps", "tracking": -20,
    },
    "executive-slate": {
        "bg": "F2F4F5", "surface": "FFFFFF", "ink": "1F2933", "muted": "5B6770", "line": "D3D9DD",
        "dark": "1F2933", "accents": ["0B6E4F", "C2410C", "3B6FB6", "B08900"],
        "series": ["0B6E4F", "1F2933", "3B6FB6", "C2410C", "9AA5AD", "B08900"],
        "display": "Cambria", "body": "Calibri", "mono": "Courier New",
        "radius": 0.06, "card": "outline", "header": "rule", "kicker": "caps", "tracking": 0,
    },
}

DEFAULTS = {
    "radius": 0.1, "card": "outline", "header": "kicker", "kicker": "caps", "tracking": -10,
    "display": "Arial", "body": "Arial", "mono": "Courier New",
    "title_size": 30, "body_size": 14, "density": "regular",
}


def clean(c):
    c = str(c).strip().lstrip("#").upper()
    if len(c) == 3:
        c = "".join(ch * 2 for ch in c)
    if len(c) != 6 or any(ch not in "0123456789ABCDEF" for ch in c):
        raise ValueError("Bad colour %r: use 6 hex digits like 1F5EFF" % c)
    return c


def rgb(c):
    c = clean(c)
    return tuple(int(c[i:i + 2], 16) for i in (0, 2, 4))


def hexc(t):
    return "%02X%02X%02X" % tuple(max(0, min(255, int(round(v)))) for v in t)


def mix(a, b, t):
    """Blend colour a toward b; t=0 gives a, t=1 gives b."""
    ra, rb = rgb(a), rgb(b)
    return hexc(tuple(ra[i] + (rb[i] - ra[i]) * t for i in range(3)))


def luminance(c):
    def ch(v):
        v = v / 255.0
        return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
    r, g, b = rgb(c)
    return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b)


def contrast(a, b):
    la, lb = luminance(a), luminance(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


def is_dark(c):
    return luminance(c) < 0.22


def pick_on(bg, dark="141414", light="FFFFFF"):
    """Text colour with the better contrast on bg."""
    return dark if contrast(dark, bg) >= contrast(light, bg) else light


def readable(color, bg, ratio=3.0):
    """Shift color away from bg until it reaches the contrast ratio. Used for accent-coloured text."""
    color = clean(color)
    target = "000000" if luminance(bg) > 0.4 else "FFFFFF"
    step = 0
    while contrast(color, bg) < ratio and step < 20:
        color = mix(color, target, 0.12)
        step += 1
    return color


class Theme(object):
    def __init__(self, spec=None):
        spec = dict(spec or {})
        name = spec.pop("preset", None)
        tokens = dict(DEFAULTS)
        if name:
            if name not in PRESETS:
                raise ValueError("Unknown preset %r. Presets: %s" % (name, ", ".join(sorted(PRESETS))))
            tokens.update(PRESETS[name])
        tokens.update(spec.pop("overrides", {}) or {})
        tokens.update(spec)
        t = tokens
        t["bg"] = clean(t.get("bg", "FFFFFF"))
        t["ink"] = clean(t.get("ink", pick_on(t["bg"])))
        dark_theme = is_dark(t["bg"])
        t["surface"] = clean(t.get("surface") or mix(t["bg"], "FFFFFF" if not dark_theme else t["ink"], 0.6 if not dark_theme else 0.07))
        t["muted"] = clean(t.get("muted") or mix(t["ink"], t["bg"], 0.38))
        t["line"] = clean(t.get("line") or mix(t["ink"], t["bg"], 0.84))
        t["dark"] = clean(t.get("dark") or (t["ink"] if not dark_theme else "F4F4F2"))
        accents = [clean(a) for a in (t.get("accents") or ["2F6FED"])]
        t["accents"] = accents
        t["series"] = [clean(s) for s in (t.get("series") or accents)]
        t["radius"] = float(t["radius"])
        self.t = t
        self.name = name or "custom"
        self.warnings = []
        for key in ("display", "body", "mono"):
            if t[key] not in SAFE_FONTS:
                self.warnings.append(
                    "Font %r (%s) is not in the cross-device safe list; it will fall back on machines "
                    "without it. Safe: %s" % (t[key], key, ", ".join(SAFE_FONTS)))
        if contrast(t["ink"], t["bg"]) < 7:
            self.warnings.append("ink on bg contrast is %.1f:1; aim for 7:1 or more." % contrast(t["ink"], t["bg"]))
        if contrast(t["muted"], t["bg"]) < 4.5:
            t["muted"] = readable(t["muted"], t["bg"], 4.5)

    def __getitem__(self, key):
        return self.t[key]

    def get(self, key, default=None):
        return self.t.get(key, default)

    def tone(self, tone="light"):
        """Resolve the palette for one slide. Tones: light, alt, dark, accent, accent2, accent3, accent4."""
        t = self.t
        tone = tone or "light"
        if tone == "alt":
            bg, surface = t["surface"], t["bg"]
            if contrast(bg, surface) < 1.03:
                surface = mix(bg, t["ink"], 0.05)
            ink, muted, line = t["ink"], readable(t["muted"], bg, 4.5), t["line"]
        elif tone == "dark":
            bg = t["dark"]
            ink = pick_on(bg, t["ink"] if not is_dark(t["ink"]) else "141414", "F6F5F1" if is_dark(bg) else "141414")
            if contrast(ink, bg) < 7:
                ink = pick_on(bg)
            surface = mix(bg, ink, 0.09)
            muted = mix(ink, bg, 0.32)
            line = mix(bg, ink, 0.2)
        elif tone.startswith("accent"):
            idx = int(tone[6:] or 1) - 1
            bg = t["accents"][idx % len(t["accents"])]
            ink = pick_on(bg, "141414" if is_dark(t["bg"]) else t["ink"], "FFFFFF")
            for _ in range(10):  # mid-tone accents: nudge the background until body text is legible
                if contrast(ink, bg) >= 4.6:
                    break
                bg = mix(bg, "000000" if not is_dark(ink) else "FFFFFF", 0.06)
            if is_dark(ink):
                surface = mix(bg, "FFFFFF", 0.62)
            else:
                surface = mix(bg, "000000", 0.18)
            muted = mix(ink, bg, 0.22)
            if contrast(muted, bg) < 4.6:
                muted = ink
            line = mix(ink, bg, 0.6)
        else:
            bg, surface, ink, muted, line = t["bg"], t["surface"], t["ink"], t["muted"], t["line"]
            if contrast(bg, surface) < 1.03:
                surface = mix(bg, ink, 0.04)
        accents = list(t["accents"])
        if tone.startswith("accent"):
            # On an accent slide the emphasis colour is the ink itself.
            accent = ink
        else:
            accent = accents[0]
            if contrast(accent, bg) < 1.25:
                accent = next((a for a in accents if contrast(a, bg) >= 1.25), ink)
        return {
            "tone": tone, "bg": bg, "surface": surface, "ink": ink, "muted": muted, "line": line,
            "accent": accent, "accent_ink": pick_on(accent, "141414", "FFFFFF"),
            # Pale accents are for fills. Text takes the first accent that is legible, else the ink.
            "accent_text": next((a for a in ([accent] + accents) if contrast(a, bg) >= 4.5), ink),
            "accent_big": next((a for a in ([accent] + accents) if contrast(a, bg) >= 3.0), ink),
            "accents": accents, "series": list(t["series"]),
        }
