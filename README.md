# valeriofrancini.it — v2 ⭐️🧑🏼‍💻🦈

Redesign del sito di Valerio Francini — regista (+o-), Roma.

La mappa: nodi `/ voce` collegati da **fulmini di pellicola** — linee da 1px a zigzag,
tratteggiate, con il tratteggio che scorre come pellicola nel proiettore e uno
sfarfallio occasionale. Nella stessa famiglia di
[Andrea Martinelli](https://caroljpeg.github.io/Andrea_Martinelli/) e
[Davide Paganelli](https://davidepaganelli.it).

## Struttura

- `index.html` — la mappa (home)
- `chi-sono/` — about, testo giustificato con evidenziazioni
- `maskara/`, `scatola-rossa/`, `verra-la-morte/`, `sei-solo/` — pagine progetto
- `candidatura-borotalco/` — **identica alla v1**, usa ancora `assets/style.css`
- `assets/map.css` + `assets/map.js` — stile e motore della mappa (solo pagine nuove)
- `assets/style.css`, `assets/script.js`, `assets/intro.js` — asset v1 (candidatura, intro video, VF che rimbalza, facade YouTube)

## Anteprima locale

```
python3 -m http.server 8080
```

## Sicurezza

- **CSP** (`meta http-equiv` in ogni pagina): script solo dal sito, embed solo
  YouTube, immagini solo dal sito + thumbnail YouTube, niente object/form.
  GitHub Pages non permette header HTTP custom, quindi la policy viaggia nel markup.
- **Anti-clickjacking**: `assets/guard.js` (la 404 lo ha inline) — se il sito viene
  caricato in un iframe altrui, se ne esce.
- **Referrer-Policy**: `strict-origin-when-cross-origin` su ogni pagina.
- **`.well-known/security.txt`** (RFC 9116): contatto per segnalazioni di vulnerabilità.
- **robots.txt**: `Disallow: /llms.txt` per i motori di ricerca classici (non
  compare su Google), con Allow esplicito per i crawler AI (GPTBot, ClaudeBot,
  PerplexityBot, ecc.) che sono i destinatari del file.
- Tutti i link esterni hanno `rel="noopener"`; zero librerie JS esterne.
- Nota onesta: il sito è statico e la repo è pubblica — chi conosce la
  convenzione può sempre digitare /llms.txt a mano. Il file però non è linkato
  da nessuna pagina, non è nella sitemap e non è indicizzato dai motori.

## Checklist go-live (quando la v2 è approvata)

1. Rimuovere `<meta name="robots" content="noindex">` da: `index.html`, `chi-sono/index.html`, `maskara/index.html`, `scatola-rossa/index.html`, `verra-la-morte/index.html`, `sei-solo/index.html` (cercare il commento `STAGING`).
2. Nella **vecchia** repo (`vxlyps/valeriofrancini.it`): Settings → Pages → rimuovere il custom domain.
3. In **questa** repo: Settings → Pages → custom domain `valeriofrancini.it` + **Enforce HTTPS** (importante: forza il redirect https). Aggiungere il file `CNAME` con contenuto `valeriofrancini.it`.
4. Il DNS non si tocca (punta già a GitHub Pages).
5. Verificare https://valeriofrancini.it e ricontrollare la Search Console.
6. Archiviare la vecchia repo (Settings → Archive) come backup.
