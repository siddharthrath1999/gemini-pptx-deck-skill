"""Text measurement so layouts can size and check text without opening PowerPoint.

Uses Pillow with whatever metric-compatible font is installed (Liberation Sans stands in for
Arial, Carlito for Calibri, and so on). Falls back to an average-width estimate.
"""

import os

try:
    from PIL import ImageFont
except Exception:  # Pillow missing: estimates only
    ImageFont = None

# family -> (regular candidates, bold candidates, width factor applied to the stand-in)
CANDIDATES = {
    "arial": (["Arial.ttf", "arial.ttf", "LiberationSans-Regular.ttf", "Arimo-Regular.ttf", "DejaVuSans.ttf"],
              ["Arial Bold.ttf", "arialbd.ttf", "LiberationSans-Bold.ttf", "Arimo-Bold.ttf", "DejaVuSans-Bold.ttf"], 1.0),
    "arial black": (["Arial Black.ttf", "ariblk.ttf"], ["Arial Black.ttf", "ariblk.ttf"], 1.0),
    "georgia": (["Georgia.ttf", "georgia.ttf", "Gelasio-Regular.ttf", "DejaVuSerif.ttf", "LiberationSerif-Regular.ttf"],
                ["Georgia Bold.ttf", "georgiab.ttf", "Gelasio-Bold.ttf", "DejaVuSerif-Bold.ttf", "LiberationSerif-Bold.ttf"], 1.0),
    "times new roman": (["Times New Roman.ttf", "times.ttf", "LiberationSerif-Regular.ttf"],
                        ["Times New Roman Bold.ttf", "timesbd.ttf", "LiberationSerif-Bold.ttf"], 1.0),
    "trebuchet ms": (["Trebuchet MS.ttf", "trebuc.ttf", "LiberationSans-Regular.ttf"],
                     ["Trebuchet MS Bold.ttf", "trebucbd.ttf", "LiberationSans-Bold.ttf"], 1.0),
    "verdana": (["Verdana.ttf", "verdana.ttf", "DejaVuSans.ttf"],
                ["Verdana Bold.ttf", "verdanab.ttf", "DejaVuSans-Bold.ttf"], 1.0),
    "courier new": (["Courier New.ttf", "cour.ttf", "LiberationMono-Regular.ttf", "DejaVuSansMono.ttf"],
                    ["Courier New Bold.ttf", "courbd.ttf", "LiberationMono-Bold.ttf", "DejaVuSansMono-Bold.ttf"], 1.0),
    "calibri": (["Calibri.ttf", "calibri.ttf", "Carlito-Regular.ttf", "LiberationSans-Regular.ttf"],
                ["Calibri Bold.ttf", "calibrib.ttf", "Carlito-Bold.ttf", "LiberationSans-Bold.ttf"], 1.0),
    "cambria": (["Cambria.ttf", "cambria.ttc", "Caladea-Regular.ttf", "LiberationSerif-Regular.ttf"],
                ["Cambria Bold.ttf", "cambriab.ttf", "Caladea-Bold.ttf", "LiberationSerif-Bold.ttf"], 1.0),
}
# Stand-ins that are narrower than the real face need a safety factor.
STANDIN_FACTOR = {
    ("arial black", "LiberationSans-Bold.ttf"): 1.16, ("arial black", "Arial Bold.ttf"): 1.16,
    ("georgia", "LiberationSerif-Regular.ttf"): 1.12, ("georgia", "LiberationSerif-Bold.ttf"): 1.12,
    ("trebuchet ms", "LiberationSans-Regular.ttf"): 1.0, ("calibri", "LiberationSans-Regular.ttf"): 0.92,
}
FONT_DIRS = ["/usr/share/fonts", "/usr/local/share/fonts", "/Library/Fonts", "/System/Library/Fonts"]
SAFETY = 1.04  # PowerPoint and LibreOffice set text slightly wider than FreeType reports

_index = None
_fonts = {}
_missing = set()


def _font_index():
    global _index
    if _index is None:
        _index = {}
        for root in FONT_DIRS:
            if not os.path.isdir(root):
                continue
            for dirpath, _dirs, files in os.walk(root):
                for name in files:
                    if name.lower().endswith((".ttf", ".ttc", ".otf")):
                        _index.setdefault(name.lower(), os.path.join(dirpath, name))
    return _index


def _load(family, bold):
    key = (family.lower(), bool(bold))
    if key in _fonts:
        return _fonts[key]
    result = None
    if ImageFont is not None:
        fam = key[0]
        reg, bld, _ = CANDIDATES.get(fam, CANDIDATES["arial"])
        names = list(bld if bold else reg)
        if fam == "arial black":
            names += ["LiberationSans-Bold.ttf", "Arial Bold.ttf", "DejaVuSans-Bold.ttf"]
        if fam not in CANDIDATES:
            _missing.add(family)
        index = _font_index()
        for name in names:
            path = index.get(name.lower())
            if path:
                try:
                    result = (ImageFont.truetype(path, 100), STANDIN_FACTOR.get((fam, name), 1.0))
                    break
                except Exception:
                    continue
    _fonts[key] = result
    return result


def unmeasured_fonts():
    """Families that had no metrics; their text was measured as Arial."""
    return sorted(_missing)


def text_width(text, family, size, bold=False, tracking=0):
    """Width in inches of one line of text at size (points). tracking is in 1/100 pt per character."""
    if not text:
        return 0.0
    loaded = _load(family, bold)
    if loaded:
        font, factor = loaded
        w = font.getlength(text) * size / 100.0 * factor
    else:
        avg = 0.60 if "courier" in family.lower() else (0.56 if bold else 0.52)
        w = len(text) * size * avg
    w += len(text) * tracking / 100.0
    return w * SAFETY / 72.0


def wrap(text, family, size, width, bold=False, tracking=0):
    """Greedy word wrap. Returns the list of lines for one paragraph."""
    words = str(text).split()
    if not words:
        return [""]
    lines, cur = [], words[0]
    for word in words[1:]:
        trial = cur + " " + word
        if text_width(trial, family, size, bold, tracking) <= width:
            cur = trial
        else:
            lines.append(cur)
            cur = word
    lines.append(cur)
    return lines


def text_height(paragraphs, family, size, width, bold=False, spacing=1.15, para_gap=0.0, tracking=0):
    """Height in inches of paragraphs (list of strings) wrapped to width. Returns (height, line count)."""
    if isinstance(paragraphs, str):
        paragraphs = paragraphs.split("\n")
    total = 0
    for para in paragraphs:
        total += len(wrap(para, family, size, width, bold, tracking))
    gaps = max(0, len(paragraphs) - 1) * para_gap
    return total * size * spacing / 72.0 + gaps / 72.0, total


def longest_word(paragraphs, family, size, bold=False, tracking=0):
    if isinstance(paragraphs, str):
        paragraphs = [paragraphs]
    widest = 0.0
    for para in paragraphs:
        for word in str(para).split():
            widest = max(widest, text_width(word, family, size, bold, tracking))
    return widest


def fit_size(paragraphs, family, width, height, max_size, min_size, bold=False, spacing=1.15,
             para_gap=0.0, tracking=0, max_lines=None):
    """Largest point size from max_size down to min_size that fits the box. Returns (size, fits)."""
    size = float(max_size)
    while size >= min_size:
        h, lines = text_height(paragraphs, family, size, width, bold, spacing, para_gap, tracking)
        if (h <= height + 0.01 and (max_lines is None or lines <= max_lines)
                and longest_word(paragraphs, family, size, bold, tracking) <= width):
            return size, True
        size -= 1 if size > 20 else 0.5
    return float(min_size), False
