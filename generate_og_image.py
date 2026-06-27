#!/usr/bin/env python3
"""Generate og-card.png — the social-share preview image (1200×630).

Run once; commit the output. Re-run only if the name/title text changes.
Uses Liberation Serif/Sans as close stand-ins for Newsreader/Inter.
"""
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
NAVY = (29, 58, 138)
INK = (22, 24, 29)
MUTED = (113, 122, 135)
BG = (255, 255, 255)

SERIF = "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf"
SANS = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
SANS_BOLD = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"

img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)

# Left navy accent bar (echoes the sidebar in the site layout)
d.rectangle([0, 0, 12, H], fill=NAVY)

# Eyebrow
eyebrow = ImageFont.truetype(SANS_BOLD, 28)
d.text((80, 110), "PHD CANDIDATE  ·  MULTIMODAL AI FOR MEDICINE", font=eyebrow, fill=NAVY)

# Name (large serif)
name = ImageFont.truetype(SERIF, 96)
d.text((80, 170), "Mohamed Alhaskir", font=name, fill=INK)

# Tagline
tag = ImageFont.truetype(SANS, 36)
d.text((80, 330),
       "Building multimodal, LLM-powered AI for medicine —",
       font=tag, fill=INK)
d.text((80, 380),
       "trustworthy, privacy-preserving, clinically deployable.",
       font=tag, fill=INK)

# Footer URL
url = ImageFont.truetype(SANS, 28)
d.text((80, 520), "mohamed-alhaskir.github.io", font=url, fill=MUTED)
d.text((80, 560), "RWTH Aachen University  ·  Institute of Medical Informatics",
       font=url, fill=MUTED)

img.save("/home/mo/mohamed-alhaskir.github.io/og-card.png", optimize=True)
print("Wrote og-card.png")
