#!/usr/bin/env python3
"""tools/char_frames.py — PLACEHOLDER 5-frame walk cycle for little-me,
roughly matching Nash's stick-figure doodles. Replace img/char/walk-N.TODO.svg
with his own drawings (same canvas, feet on the bottom line) and drop .TODO."""
import math, os, random

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'img', 'char')
W, H = 150, 392
random.seed(4)

def j(v, a=1.6):  # pencil wobble
    return v + random.uniform(-a, a)

def leg(hx, hy, ang, bend):
    a = math.radians(ang)
    kx, ky = hx + math.sin(a) * 70, hy + math.cos(a) * 70
    b = math.radians(ang - bend)
    fx, fy = kx + math.sin(b) * 66, min(H - 6, ky + math.cos(b) * 66)
    return f'M{j(hx):.1f} {hy:.1f} Q{j(kx):.1f} {j(ky):.1f} {j(fx):.1f} {fy:.1f} l{j(10):.1f} {j(0):.1f}'

for i in range(5):
    ph = i / 5 * 2 * math.pi
    swing = 26 * math.sin(ph)
    bob = abs(math.sin(ph)) * 7
    top = 18 + bob
    hy = 250 + bob
    parts = [
        f'<circle cx="{j(75):.1f}" cy="{top + 44:.1f}" r="40"/>',
        f'<path d="M62 {top + 38:.1f} l0.5 3 M88 {top + 37:.1f} l0.5 3"/>',
        f'<path d="M60 {top + 58:.1f} Q75 {top + 68:.1f} 90 {top + 57:.1f}"/>',
        f'<path d="M{j(75):.1f} {top + 84:.1f} L{j(75):.1f} {hy:.1f}"/>',
        f'<path d="M75 {top + 120:.1f} L{75 - 34 * math.cos(math.radians(swing)):.1f} {top + 185 - swing * .6:.1f}"/>',
        f'<path d="M75 {top + 120:.1f} L{75 + 34 * math.cos(math.radians(swing)):.1f} {top + 185 + swing * .6:.1f}"/>',
        f'<path d="{leg(75, hy, swing, 18 if swing < 0 else 4)}"/>',
        f'<path d="{leg(75, hy, -swing, 18 if swing > 0 else 4)}"/>',
    ]
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" fill="none" stroke="currentColor" '
           f'stroke-width="5" stroke-linecap="round" stroke-linejoin="round">'
           f'<!-- PLACEHOLDER walk frame {i + 1}/5: replace with Nash\'s drawing -->{"".join(parts)}</svg>\n')
    open(os.path.join(OUT, f'walk-{i + 1}.TODO.svg'), 'w').write(svg)
print('5 frames →', OUT)
