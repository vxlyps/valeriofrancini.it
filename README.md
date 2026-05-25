# valeriofrancini.it

Personal portfolio of Valerio Francini — Independent Filmmaker.

Static site hosted on GitHub Pages, served at [valeriofrancini.it](https://valeriofrancini.it).

## Struttura

```
.
├── index.html              # Homepage
├── chi-sono/index.html     # About
├── assets/
│   ├── style.css           # Stili condivisi
│   └── script.js           # JS condiviso (theme, manine, DVD bounce, accordion)
├── images/                 # Immagini, trofei, ritratti
└── CNAME                   # Dominio custom per GitHub Pages
```

## Sviluppo locale

Basta aprire `index.html` in un browser, oppure servire la cartella:

```bash
python3 -m http.server 8000
```

E aprire <http://localhost:8000>.
