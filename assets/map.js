/* =========================================================
   VALERIO FRANCINI — LA MAPPA
   Rami: fulmini di pellicola.
   - tracciato a zigzag (fulmine), fisso per ogni ramo
   - tratteggio che scorre come pellicola nel proiettore
   - ogni tanto un ramo sfarfalla per un lampo
   ========================================================= */
(function () {
    var RED = '#E30613';

    var canvas = document.getElementById('bg');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');

    var reduceMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* [genitore, figlio] */
    var LINKS = [
        ['n-root', 'n-about'],
        ['n-root', 'n-video'],
        ['n-root', 'n-corti'],
        ['n-root', 'n-premi'],
        ['n-root', 'n-contatti'],
        ['n-video', 'n-maskara'],
        ['n-video', 'n-scatola'],
        ['n-corti', 'n-verra'],
        ['n-corti', 'n-seisolo'],
        ['n-premi', 'n-emva'],
        ['n-premi', 'n-photovogue'],
        ['n-premi', 'n-wedir'],
        ['n-contatti', 'n-email'],
        ['n-contatti', 'n-ig'],
        ['n-contatti', 'n-imdb']
    ];

    /* toggle: click sulla sezione → i figli appaiono di colpo, come un cut */
    var GROUPS = {
        'n-video':    ['n-maskara', 'n-scatola'],
        'n-corti':    ['n-verra', 'n-seisolo'],
        'n-premi':    ['n-emva', 'n-photovogue', 'n-wedir'],
        'n-contatti': ['n-email', 'n-ig', 'n-imdb']
    };

    Object.keys(GROUPS).forEach(function (tid) {
        var t = document.getElementById(tid);
        if (!t) return;
        t.addEventListener('click', function () {
            GROUPS[tid].forEach(function (kid) {
                var el = document.getElementById(kid);
                if (el) el.classList.toggle('on');
            });
        });
    });

    function resize() {
        var dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    window.addEventListener('resize', resize);
    resize();

    /* random deterministico: lo zigzag di ogni ramo è sempre lo stesso */
    function seededRand(seed) {
        return function () {
            seed |= 0;
            seed = (seed + 0x6D2B79F5) | 0;
            var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    function boltPoints(x1, y1, x2, y2, seed) {
        var rnd = seededRand(seed);
        var pts = [[x1, y1]];
        var segs = 5;
        var dx = x2 - x1, dy = y2 - y1;
        var len = Math.hypot(dx, dy) || 1;
        var nx = -dy / len, ny = dx / len;
        var maxAmp = Math.min(13, len * 0.05); /* rami corti = zigzag più discreto */
        for (var i = 1; i < segs; i++) {
            var t = i / segs;
            var amp = maxAmp * Math.sin(Math.PI * t); /* meno ampiezza vicino ai capi */
            var off = (rnd() * 2 - 1) * amp;
            pts.push([x1 + dx * t + nx * off, y1 + dy * t + ny * off]);
        }
        pts.push([x2, y2]);
        return pts;
    }

    /* sfarfallio: ogni ramo sparisce per ~80ms ogni 3-9 secondi */
    var flick = LINKS.map(function () {
        return { until: 0, next: performance.now() + 2000 + Math.random() * 7000 };
    });

    function visible(el) {
        return el.offsetParent !== null;
    }

    function draw(now) {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        ctx.strokeStyle = RED;
        ctx.lineWidth = 1;
        ctx.setLineDash([7, 5]);
        var offset = reduceMotion ? 0 : -((now / 40) % 12);

        for (var i = 0; i < LINKS.length; i++) {
            var a = document.getElementById(LINKS[i][0]);
            var b = document.getElementById(LINKS[i][1]);
            if (!a || !b || !visible(a) || !visible(b)) continue;

            if (!reduceMotion) {
                var f = flick[i];
                if (now > f.next) {
                    f.until = now + 60 + Math.random() * 70;
                    f.next = now + 3000 + Math.random() * 6000;
                }
                if (now < f.until) continue;
            }

            var ra = a.getBoundingClientRect();
            var rb = b.getBoundingClientRect();
            var pts = boltPoints(
                ra.left + 10, ra.bottom + 3,
                rb.left - 12, rb.top + rb.height / 2,
                i * 97 + 13
            );

            ctx.lineDashOffset = offset;
            ctx.beginPath();
            ctx.moveTo(pts[0][0], pts[0][1]);
            for (var j = 1; j < pts.length; j++) {
                ctx.lineTo(pts[j][0], pts[j][1]);
            }
            ctx.stroke();
        }

        if (!reduceMotion) requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
    /* con reduced-motion: un solo frame statico, ridisegnato al resize/click */
    if (reduceMotion) {
        window.addEventListener('resize', function () { requestAnimationFrame(draw); });
        document.addEventListener('click', function () { requestAnimationFrame(draw); });
    }
})();
