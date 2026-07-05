/* --- ANTI-CLICKJACKING ---
   GitHub Pages non permette header HTTP custom (X-Frame-Options /
   frame-ancestors), quindi il blocco si fa lato client: se il sito
   viene caricato dentro un iframe di un altro dominio, se ne esce. */
(function () {
    if (window.top === window.self) return;
    try {
        window.top.location.replace(window.self.location.href);
    } catch (e) {
        /* iframe cross-origin che blocca la navigazione: pagina oscurata */
        document.documentElement.style.display = 'none';
    }
})();
