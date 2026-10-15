"""Pictures the user supplies: photos, screenshots, logos and diagrams. Never generated images.

load() finds the file, turns phone photos the right way up, shrinks very large files to
presentation size, converts formats PowerPoint cannot show, and reports problems in plain words.
"""

import os
import tempfile

from PIL import Image, ImageOps

BASE_DIRS = ["."]          # folders to look in for relative paths (the spec folder is added by build_deck)
MAX_EDGE = 2400            # pixels on the long side; enough for a full 16:9 slide on a 4K screen
MAX_BYTES = 1500000        # files above this are recompressed
NATIVE = {"PNG": ".png", "JPEG": ".jpg", "GIF": ".gif", "BMP": ".bmp", "TIFF": ".tif"}
_cache = {}
_tmp = None


def _tmpdir():
    global _tmp
    if _tmp is None:
        _tmp = tempfile.mkdtemp(prefix="pptx-native-img-")
    return _tmp


def resolve(path):
    """Absolute path of an image, looking in the spec folder and the working folder."""
    path = os.path.expanduser(str(path or "").strip())
    if not path:
        return None
    if os.path.isabs(path):
        return path if os.path.exists(path) else None
    for base in BASE_DIRS:
        candidate = os.path.abspath(os.path.join(base, path))
        if os.path.exists(candidate):
            return candidate
    return None


def load(path):
    """Returns {"path", "px": (w, h), "note"} ready for add_picture, or {"error": message}."""
    key = str(path)
    if key in _cache:
        return _cache[key]
    found = resolve(path)
    if not found:
        result = {"error": "Image not found: %s. Use the attached file's exact name, or a path next to deck.json." % path}
        _cache[key] = result
        return result
    ext = os.path.splitext(found)[1].lower()
    if ext in (".svg", ".svgz"):
        result = {"error": "%s is an SVG, which PowerPoint cannot embed from this kit. Use a PNG of it instead." % os.path.basename(found)}
        _cache[key] = result
        return result
    try:
        img = Image.open(found)
        img.load()
    except Exception as exc:
        hint = " iPhone HEIC photos must be converted to JPEG first." if ext in (".heic", ".heif") else ""
        result = {"error": "Cannot read %s (%s).%s" % (os.path.basename(found), type(exc).__name__, hint)}
        _cache[key] = result
        return result

    notes = []
    fmt = (img.format or "").upper()
    orientation = (img.getexif() or {}).get(274, 1)
    changed = orientation not in (1, None)
    if changed:  # phone photos store rotation as a tag that PowerPoint ignores
        img = ImageOps.exif_transpose(img)
        notes.append("turned upright")
    if max(img.size) > MAX_EDGE:
        img.thumbnail((MAX_EDGE, MAX_EDGE), Image.LANCZOS)
        changed = True
        notes.append("resized to %d px" % MAX_EDGE)
    if fmt not in NATIVE or img.mode == "CMYK":
        changed = True
        notes.append("converted from %s" % (fmt or "an unknown format"))
    if os.path.getsize(found) > MAX_BYTES and fmt == "JPEG":
        changed = True

    out = found
    if changed:
        has_alpha = img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info)
        base = os.path.splitext(os.path.basename(found))[0]
        if has_alpha:
            img = img.convert("RGBA")
            out = os.path.join(_tmpdir(), base + ".png")
            img.save(out, "PNG", optimize=True)
        else:
            img = img.convert("RGB")
            out = os.path.join(_tmpdir(), base + ".jpg")
            img.save(out, "JPEG", quality=86, optimize=True, progressive=True)
    result = {"path": out, "px": img.size, "note": ", ".join(notes), "name": os.path.basename(found)}
    _cache[key] = result
    return result


def cover_crop(px, w, h, focus="center"):
    """Crop fractions (left, top, right, bottom) so an image fills a w x h box without stretching."""
    iw, ih = px
    img_ar, box_ar = iw / float(ih), w / float(h)
    focus = str(focus or "center").lower()
    if abs(img_ar - box_ar) < 0.005:
        return 0.0, 0.0, 0.0, 0.0
    if img_ar > box_ar:  # too wide: crop the sides
        cut = 1 - box_ar / img_ar
        left = 0.0 if focus == "left" else (cut if focus == "right" else cut / 2)
        return left, 0.0, cut - left, 0.0
    cut = 1 - img_ar / box_ar  # too tall: crop top and bottom
    top = 0.0 if focus == "top" else (cut if focus == "bottom" else cut * 0.4 if focus == "center" else cut / 2)
    return 0.0, top, 0.0, cut - top


def contain_box(px, x, y, w, h, align="center"):
    """The largest box with the image's shape that fits inside x, y, w, h."""
    iw, ih = px
    scale = min(w / float(iw), h / float(ih))
    fw, fh = iw * scale, ih * scale
    align = str(align or "center").lower()
    fx = x if align == "left" else (x + w - fw if align == "right" else x + (w - fw) / 2)
    fy = y if align == "top" else (y + h - fh if align == "bottom" else y + (h - fh) / 2)
    return fx, fy, fw, fh
