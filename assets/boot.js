/* --- VELO NERO DI AVVIO ---
   Il div #vf-boot è già nel markup, quindi è nero dal primo istante
   (nessun flash del sito su connessioni lente). Questo script decide
   se toglierlo subito (intro già vista in questa sessione) o lasciarlo
   al comando di intro.js — con una rete di sicurezza nel caso intro.js
   non arrivi mai (rete lentissima, errore, script bloccato).
*/
(function () {
    function remove() {
        var b = document.getElementById('vf-boot');
        if (b && b.parentNode) b.parentNode.removeChild(b);
    }
    if (sessionStorage.getItem('vf_intro_shown')) {
        remove();
    } else {
        setTimeout(remove, 9000);
    }
})();
