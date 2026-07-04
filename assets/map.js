/* =========================================================
   VALERIO FRANCINI — LA MAPPA
   Nome al centro, rami che partono dal centro del nome.
   Click sul nome = apri/chiudi tutte le sezioni.
   Click su una sezione con ramo = apri/chiudi i figli.
   Su mobile la mappa diventa una lista (niente canvas).
   ========================================================= */
(function () {
    var RED = '#E30613';
    var $ = function (id) { return document.getElementById(id); };

    var canvas = $('bg');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');

    var name = $('n-root');
    var sectionIds = ['n-about', 'n-video', 'n-photo', 'n-awards', 'n-contacts'];
    var sections = sectionIds.map($);
    var branches = {
        'n-video':    ['n-maskara', 'n-scatola', 'n-verra', 'n-seisolo'].map($),
        'n-awards':   ['p-emva', 'p-timvf', 'p-tisff', 'p-roma', 'p-fuori'].map($),
        'n-contacts': ['c-email', 'c-ig'].map($)
    };

    function shown(el) { return el && !el.classList.contains('hidden'); }

    /* click sul nome: piega / dispiega tutte le sezioni */
    name.addEventListener('click', function (e) {
        e.preventDefault();
        var any = sections.some(shown);
        sections.forEach(function (el) {
            if (any) el.classList.add('hidden'); else el.classList.remove('hidden');
        });
        if (any) {
            Object.keys(branches).forEach(function (k) {
                branches[k].forEach(function (sub) { sub.classList.remove('on'); });
            });
        }
        draw();
    });

    /* click su una sezione con ramo: apri / chiudi i figli */
    Object.keys(branches).forEach(function (key) {
        $(key).addEventListener('click', function () {
            branches[key].forEach(function (sub) { sub.classList.toggle('on'); });
            draw();
        });
    });

    function resize() {
        var dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(window.innerWidth * dpr);
        canvas.height = Math.round(window.innerHeight * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        draw();
    }
    window.addEventListener('resize', resize);

    /* linea dritta come su davidepaganelli.it: parte dall'inizio o dalla
       fine della parola (a seconda di dove sta il nodo di arrivo) e arriva
       all'inizio o alla fine della parola di destinazione */
    function link(fromEl, toEl) {
        var a = fromEl.getBoundingClientRect();
        var b = toEl.getBoundingClientRect();
        var aCx = a.left + a.width / 2;
        var bCx = b.left + b.width / 2;
        var fromX = bCx < aCx ? a.left - 6 : a.right + 6;
        var toX = bCx < aCx ? b.right + 6 : b.left - 6;
        ctx.beginPath();
        ctx.moveTo(fromX, a.top + a.height / 2);
        ctx.lineTo(toX, b.top + b.height / 2);
        ctx.stroke();
    }

    function draw() {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        ctx.strokeStyle = RED;
        ctx.lineWidth = 1;

        sections.forEach(function (sec) {
            if (shown(sec)) link(name, sec);
        });
        Object.keys(branches).forEach(function (key) {
            var sec = $(key);
            if (!shown(sec)) return;
            branches[key].forEach(function (sub) {
                if (sub.classList.contains('on')) link(sec, sub);
            });
        });
    }

    /* primo disegno quando l'intro non copre più la pagina */
    function start() {
        if ($('vf-intro-overlay')) { setTimeout(start, 300); return; }
        resize();
        setTimeout(draw, 250);
    }
    start();
})();
