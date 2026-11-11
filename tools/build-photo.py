#!/usr/bin/env python3
"""
Costruisce la pagina /photo/ (nel sito si chiama "foto").

Legge   tools/photo-selection.json   (rami + foto scelte + testi alt)
Crea    images/photo/<ramo>-NN.jpg      versione grande (per il visualizzatore)
        images/photo/<ramo>-NN-t.jpg    miniatura (per il collage)
        photo/index.html                pagina statica, SEO-friendly
        sitemap.xml                     con le immagini della pagina

Gli ORIGINALI restano in photo/<cartelle>/ e NON vanno online
(sono esclusi da .gitignore).

Uso (serve Pillow):  python3 tools/build-photo.py [--force]
"""
import json, os, sys, html
from PIL import Image, ImageOps

Image.MAX_IMAGE_PIXELS = None
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://valeriofrancini.it"
FORCE = "--force" in sys.argv
BIG, THUMB = 2000, 480          # lato lungo in px
TODAY = "2026-11-11"

branches = json.load(open(os.path.join(ROOT, "tools", "photo-selection.json"), encoding="utf-8"))
out_dir = os.path.join(ROOT, "images", "photo")
os.makedirs(out_dir, exist_ok=True)


def save(im, path, long_edge, q):
    if os.path.exists(path) and not FORCE:
        return
    c = im.copy()
    c.thumbnail((long_edge, long_edge), Image.LANCZOS)
    c.save(path, "JPEG", quality=q, optimize=True, progressive=True)


# ---------- 1. immagini ----------
keep = set()
n = 0
for br in branches:
    for k, it in enumerate(br["items"], 1):
        name = f"{br['id']}-{k:02d}"
        it["name"] = name
        big, th = os.path.join(out_dir, name + ".jpg"), os.path.join(out_dir, name + "-t.jpg")
        keep.update([name + ".jpg", name + "-t.jpg"])
        if FORCE or not (os.path.exists(big) and os.path.exists(th)):
            im = ImageOps.exif_transpose(Image.open(os.path.join(ROOT, "photo", it["src"]))).convert("RGB")
            save(im, big, BIG, 80)
            save(im, th, THUMB, 76)
        with Image.open(big) as b:
            it["w"], it["h"] = b.size
        with Image.open(th) as t:
            it["tw"], it["th"] = t.size
        n += 1
# toglie le versioni generate in passato e non più usate
for f in os.listdir(out_dir):
    if f.endswith(".jpg") and f not in keep:
        os.remove(os.path.join(out_dir, f))
print(n, "foto elaborate")

# ---------- 2. HTML ----------
esc = html.escape
total = sum(len(b["items"]) for b in branches)
figs_ld = []
parts = []
for br in branches:
    cells = []
    for k, it in enumerate(br["items"], 1):
        ratio = round(it["w"] / it["h"], 3)
        cells.append(
            f'<a class="th" href="../images/photo/{it["name"]}.jpg" style="--r:{ratio}">'
            f'<img src="../images/photo/{it["name"]}-t.jpg" width="{it["tw"]}" height="{it["th"]}" '
            f'alt="{esc(it["alt"], quote=True)}" loading="lazy" decoding="async"></a>'
        )
        figs_ld.append({
            "@type": "ImageObject",
            "@id": f"{SITE}/photo/#{it['name']}",
            "contentUrl": f"{SITE}/images/photo/{it['name']}.jpg",
            "thumbnailUrl": f"{SITE}/images/photo/{it['name']}-t.jpg",
            "name": it["alt"],
            "description": it["alt"],
            "caption": it["alt"],
            "width": it["w"], "height": it["h"],
            "encodingFormat": "image/jpeg",
            "inLanguage": "it",
        })
    parts.append(
        f'<div class="branch" data-b="{br["id"]}" data-label="{esc(br["label"], quote=True)}">\n'
        f'  <button type="button" class="node fb" id="b-{br["id"]}" aria-expanded="false" '
        f'aria-controls="c-{br["id"]}">/ {esc(br["title"])}</button>\n'
        f'  <section class="cluster c-{br["pos"]}" id="c-{br["id"]}" aria-label="{esc(br["label"], quote=True)}">\n'
        f'    <h2 class="sr">{esc(br["label"])}</h2>\n'
        f'    <div class="cl">\n      ' + "\n      ".join(cells) + "\n    </div>\n  </section>\n</div>"
    )

hero = branches[0]["items"][1]          # copertina "Birds of Pray, capitolo 3"
og_img = f"{SITE}/images/photo/{hero['name']}.jpg"
title = "Foto — Valerio Francini · Vanguard, PhotoVogue, pellicola, backstage"
desc = ("Fotografie di Valerio Francini, regista di Roma: l'editoriale Birds of Pray su Vanguard, "
        "PhotoVogue, ritratti Size Five, fotografia analogica, backstage dei set e fotogrammi dai video.")

ld = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": ["CollectionPage", "ImageGallery"],
            "@id": f"{SITE}/photo/#gallery",
            "url": f"{SITE}/photo/",
            "name": "Foto — Valerio Francini",
            "description": desc,
            "inLanguage": "it",
            "isPartOf": {"@id": f"{SITE}/#website"},
            "author": {"@id": f"{SITE}/#person"},
            "creator": {"@id": f"{SITE}/#person"},
            "about": {"@id": f"{SITE}/#person"},
            "primaryImageOfPage": {"@id": f"{SITE}/photo/#{hero['name']}"},
            "numberOfItems": total,
            "image": figs_ld,
        },
        {
            "@type": "BreadcrumbList",
            "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "Valerio Francini", "item": f"{SITE}/"},
                {"@type": "ListItem", "position": 2, "name": "Foto", "item": f"{SITE}/photo/"},
            ],
        },
    ],
}

page = f'''<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- Sicurezza: CSP (niente script esterni, embed solo YouTube), referrer minimale, scudo anti-clickjacking -->
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https://i.ytimg.com data:; media-src 'self'; frame-src https://www.youtube.com https://www.youtube-nocookie.com; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; upgrade-insecure-requests">
    <meta name="referrer" content="strict-origin-when-cross-origin">
    <script src="../assets/guard.js"></script>

    <title>{esc(title)}</title>
    <meta name="description" content="{esc(desc, quote=True)}">
    <meta name="author" content="Valerio Francini">
    <meta name="robots" content="index, follow, max-image-preview:large">

    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Valerio Francini">
    <meta property="og:locale" content="it_IT">
    <meta property="og:url" content="{SITE}/photo/">
    <meta property="og:title" content="Foto — Valerio Francini">
    <meta property="og:description" content="Vanguard, PhotoVogue, pellicola, backstage. Roma.">
    <meta property="og:image" content="{og_img}">
    <meta property="og:image:width" content="{hero['w']}">
    <meta property="og:image:height" content="{hero['h']}">
    <meta property="og:image:alt" content="{esc(hero['alt'], quote=True)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Foto — Valerio Francini">
    <meta name="twitter:description" content="Vanguard, PhotoVogue, pellicola, backstage. Roma.">
    <meta name="twitter:image" content="{og_img}">
    <link rel="canonical" href="{SITE}/photo/">

    <link rel="icon" href="../images/favicon-upsidedown.png" type="image/png">
    <link rel="stylesheet" href="../assets/map.css?v=20261111">
    <script src="../assets/gallery.js?v=20261111"></script>

    <script type="application/ld+json">
{json.dumps(ld, ensure_ascii=False, indent=1)}
    </script>
</head>
<body class="foto">

<canvas id="bg"></canvas>
<a class="home-link" href="../">/ valerio francini</a>

<main id="fmap">
<h1 class="node" id="f-root">/ foto</h1>

{chr(10).join(parts)}
</main>

<footer class="site-footer">/ &copy;2026 valeriofrancini.it ⭐️🧑🏼‍💻🦈 &mdash; roma &mdash; website inspired by the crazy mind of <a href="https://caroljpeg.github.io/Andrea_Martinelli/" target="_blank" rel="noopener">andrea martinelli</a></footer>
</body>
</html>
'''
open(os.path.join(ROOT, "photo", "index.html"), "w", encoding="utf-8").write(page)
print("photo/index.html scritta")

# ---------- 3. sitemap ----------
pages = [
    ("/", "monthly", "1.0", False),
    ("/chi-sono/", "monthly", "0.9", False),
    ("/photo/", "monthly", "0.8", True),
    ("/maskara/", "yearly", "0.8", False),
    ("/scatola-rossa/", "yearly", "0.6", False),
    ("/verra-la-morte/", "yearly", "0.6", False),
    ("/sei-solo/", "yearly", "0.6", False),
]
sm = ['<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" '
      'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">']
for path, freq, pr, imgs in pages:
    sm.append("  <url>")
    sm.append(f"    <loc>{SITE}{path}</loc>")
    if path in ("/", "/photo/"):
        sm.append(f"    <lastmod>{TODAY}</lastmod>")
    sm.append(f"    <changefreq>{freq}</changefreq>")
    sm.append(f"    <priority>{pr}</priority>")
    if imgs:
        for br in branches:
            for it in br["items"]:
                sm.append("    <image:image>")
                sm.append(f"      <image:loc>{SITE}/images/photo/{it['name']}.jpg</image:loc>")
                sm.append(f"      <image:caption>{esc(it['alt'])}</image:caption>")
                sm.append("    </image:image>")
    sm.append("  </url>")
sm.append("</urlset>")
open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8").write("\n".join(sm) + "\n")
print("sitemap.xml scritta")
