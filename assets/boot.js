/* --- VELO NERO DI AVVIO ---
   Il div #vf-boot è già nel markup, quindi è nero dal primo istante
   (nessun flash del sito su connessioni lente). Questo script decide
   se toglierlo subito (intro da saltare) o lasciarlo al comando di
   intro.js — con una rete di sicurezza nel caso intro.js non arrivi
   mai (rete lentissima, errore, script bloccato).

   Due modalità:
   - normale (es. candidatura-borotalco): intro una sola volta per
     sessione (sessionStorage).
   - data-intro="always" sul tag <script> (home): l'intro parte a OGNI
     caricamento — primo arrivo, link da fuori, refresh — e si salta solo
     quando si arriva dalle pagine interne del sito (es. "/ valerio
     francini" in alto a sinistra), per non rivederla a ogni clic.
   La decisione viene salvata in window.VF_SKIP_INTRO, letta da intro.js.
*/
(function () {
    var tag = document.currentScript;
    var always = !!(tag && tag.getAttribute('data-intro') === 'always');

    function remove() {
        var b = document.getElementById('vf-boot');
        if (b && b.parentNode) b.parentNode.removeChild(b);
    }

    function cameFromInside() {
        try {
            var nav = performance.getEntriesByType('navigation')[0];
            if (nav && nav.type === 'reload') return false;   /* refresh: si rivede */
        } catch (e) {}
        var r = document.referrer;
        if (!r) return false;                                  /* arrivo diretto */
        try { return new URL(r).host === location.host; } catch (e) { return false; }
    }

    var skip;
    if (always) {
        skip = cameFromInside();
    } else {
        try { skip = !!sessionStorage.getItem('vf_intro_shown'); } catch (e) { skip = false; }
    }
    window.VF_SKIP_INTRO = skip;

    if (skip) {
        remove();
    } else {
        setTimeout(remove, 9000);
    }
})();
