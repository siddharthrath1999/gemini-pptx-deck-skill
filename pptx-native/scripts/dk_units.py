"""Unit helpers. Layouts are designed on a 13.333 x 7.5 in slide; SCALE maps them onto other 16:9 sizes."""

from pptx.util import Inches as _inches, Pt as _pt

SCALE = 1.0


def set_scale(value):
    global SCALE
    SCALE = float(value)


def Inches(value):
    return _inches(value * SCALE)


def Pt(value):
    return _pt(value * SCALE)


def emu(value):
    return int(_inches(value * SCALE))
