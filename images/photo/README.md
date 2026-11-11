# images/photo

Versioni leggere delle foto della pagina /photo/ (generate, non toccare a mano).

- Gli originali stanno in `photo/<cartelle>/` e NON vanno online (vedi .gitignore).
- La scelta delle foto e i testi alt sono in `tools/photo-selection.json`.
- Per rigenerare immagini + pagina + sitemap: `python3 tools/build-photo.py` (serve Pillow).
- `photos.js` non è più usato dalla pagina (la vecchia lista è stata sostituita).
