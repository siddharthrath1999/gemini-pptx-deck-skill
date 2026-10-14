#!/usr/bin/env python3
"""Assemble slide images into numbered contact sheets so a whole deck can be looked at quickly.

Usage:
  python3 sheet_deck.py FOLDER            FOLDER holds one PNG per slide, named s-1.png, s-2.png, ...
  python3 sheet_deck.py FOLDER --per 12   slides per sheet: 4, 6, 9 (default) or 12
Writes sheet-01.png, sheet-02.png, ... into FOLDER. This script only reads and writes images.
"""

import argparse
import glob
import os
import re
import sys


def page_number(path):
    found = re.findall(r"(\d+)", os.path.basename(path))
    return int(found[-1]) if found else 0


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("folder")
    ap.add_argument("--per", type=int, default=9)
    ap.add_argument("--prefix", default="s-")
    args = ap.parse_args()
    try:
        from PIL import Image, ImageDraw, ImageFont
    except Exception:
        print("SHEETS UNAVAILABLE: Pillow is not installed. Open the slide images one by one instead.")
        return 2
    pages = sorted(glob.glob(os.path.join(args.folder, args.prefix + "*.png")), key=page_number)
    if not pages:
        print("SHEETS UNAVAILABLE: no %s*.png images in %s. Render the deck to PNG first." % (args.prefix, args.folder))
        return 2
    per = args.per if args.per in (4, 6, 9, 12) else 9
    ncol = {4: 2, 6: 3, 9: 3, 12: 4}[per]
    first = Image.open(pages[0])
    tw = {2: 920, 3: 640, 4: 480}[ncol]
    th = int(tw * first.height / first.width)
    pad, label = 14, 26
    try:
        font = ImageFont.load_default(size=18)
    except Exception:
        font = ImageFont.load_default()
    names = []
    for start in range(0, len(pages), per):
        group = pages[start:start + per]
        rows = (len(group) + ncol - 1) // ncol
        sheet = Image.new("RGB", (ncol * (tw + pad) + pad, rows * (th + label + pad) + pad), (70, 70, 74))
        draw = ImageDraw.Draw(sheet)
        for i, page in enumerate(group):
            r, k = divmod(i, ncol)
            x, y = pad + k * (tw + pad), pad + r * (th + label + pad)
            draw.text((x + 2, y + 2), "slide %d" % page_number(page), fill=(255, 255, 255), font=font)
            sheet.paste(Image.open(page).convert("RGB").resize((tw, th)), (x, y + label))
        name = os.path.join(args.folder, "sheet-%02d.png" % (start // per + 1))
        sheet.save(name)
        names.append(name)
    print("Made %d contact sheets from %d slides:" % (len(names), len(pages)))
    for name in names:
        print("  " + name)
    print("Open every sheet and look at every slide before delivering.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
