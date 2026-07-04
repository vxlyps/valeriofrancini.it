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
        'n-contacts': ['c-email', 'c-ig', 'c-imdb'].map($)
    };

    function isMobile() { return window.matchMedia('(max-width: 760px)').matches; }
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

    /* punto sul bordo del riquadro di `rect`, dal suo centro verso (tx,ty) */
    function edgePoint(rect, tx, ty) {
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        var dx = tx - cx, dy = ty - cy;
        if (dx === 0 && dy === 0) return [cx, cy];
        var hw = rect.width / 2 + 5, hh = rect.height / 2 + 5;
        var sx = dx !== 0 ? hw / Math.abs(dx) : Infinity;
        var sy = dy !== 0 ? hh / Math.abs(dy) : Infinity;
        var t = Math.min(sx, sy);
        return [cx + dx * t, cy + dy * t];
    }

    /* linea dritta: dal bordo del nome (verso il figlio) al bordo del figlio */
    function link(fromEl, toEl) {
        var a = fromEl.getBoundingClientRect();
        var b = toEl.getBoundingClientRect();
        var aC = [a.left + a.width / 2, a.top + a.height / 2];
        var bC = [b.left + b.width / 2, b.top + b.height / 2];
        var p1 = edgePoint(a, bC[0], bC[1]);
        var p2 = edgePoint(b, aC[0], aC[1]);
        ctx.beginPath();
        ctx.moveTo(p1[0], p1[1]);
        ctx.lineTo(p2[0], p2[1]);
        ctx.stroke();
    }

    function draw() {
        if (isMobile()) { ctx.clearRect(0, 0, canvas.width, canvas.height); return; }
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
