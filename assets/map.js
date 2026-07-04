/* =========================================================
   VALERIO FRANCINI — LA MAPPA
   Rami = fulmini: linee spezzate solide da 1px.
   Nessun movimento continuo. Quando apri un ramo, il fulmine
   "scarica" (si disegna a scatto). Hover = lampo sul ramo.
   ========================================================= */
(function () {
    var RED = '#E30613';

    var canvas = document.getElementById('bg');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');

    var reduceMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* rami sempre visibili: radice -> sezioni */
    var TRUNK = [
        ['n-root', 'n-about'],
        ['n-root', 'n-video'],
        ['n-root', 'n-photo'],
        ['n-root', 'n-premi']
    ];

    /* sezioni espandibili -> figli */
    var GROUPS = {
        'n-video': ['n-maskara', 'n-scatola', 'n-verra', 'n-seisolo'],
        'n-premi': ['p-emva', 'p-timvf', 'p-tisff', 'p-roma', 'p-fuori', 'p-photovogue', 'p-wedir']
    };

    /* strike[childId] = { t0 } quando il ramo compare */
    var strike = {};
    var highlight = {}; /* linkKey -> until (hover) */
    var animating = false;

    /* --- accordion: un ramo aperto per volta --- */
    Object.keys(GROUPS).forEach(function (pid) {
        var t = document.getElementById(pid);
        if (!t) return;
        t.addEventListener('click', function () {
            var opening = !document.getElementById(GROUPS[pid][0]).classList.contains('on');
            /* chiudi tutti */
            Object.keys(GROUPS).forEach(function (other) {
                GROUPS[other].forEach(function (kid) {
                    document.getElementById(kid).classList.remove('on');
                });
            });
            /* apri questo (se non era già aperto) */
            if (opening) {
                GROUPS[pid].forEach(function (kid, i) {
                    var el = document.getElementById(kid);
                    el.classList.add('on');
                    strike[kid] = { t0: performance.now() + i * 55 };
                });
                kick();
            } else {
                render();
            }
        });
    });

    /* hover: lampo sul ramo che entra nel nodo */
    function linkKey(a, b) { return a + '>' + b; }
    [].concat(TRUNK, GROUPS['n-video'].map(function (k) { return ['n-video', k]; }),
        GROUPS['n-premi'].map(function (k) { return ['n-premi', k]; }))
        .forEach(function (pair) {
            var el = document.getElementById(pair[1]);
            if (!el) return;
            el.addEventListener('mouseenter', function () {
                highlight[linkKey(pair[0], pair[1])] = performance.now() + 260;
                kick();
            });
        });

    function resize() {
        var dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(window.innerWidth * dpr);
        canvas.height = Math.round(window.innerHeight * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        render();
    }
    window.addEventListener('resize', resize);

    /* random deterministico: lo zigzag di ogni ramo è sempre lo stesso */
    function seeded(seed) {
        return function () {
            seed |= 0;
            seed = (seed + 0x6D2B79F5) | 0;
            var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    /* punti di un fulmine da A a B */
    function boltPoints(x1, y1, x2, y2, seed) {
        var rnd = seeded(seed);
        var dx = x2 - x1, dy = y2 - y1;
        var len = Math.hypot(dx, dy) || 1;
        var nx = -dy / len, ny = dx / len;
        var segs = Math.max(3, Math.min(7, Math.round(len / 46)));
        var maxAmp = Math.min(11, len * 0.05);
        var pts = [[x1, y1]];
        for (var i = 1; i < segs; i++) {
            var t = i / segs;
            var amp = maxAmp * Math.sin(Math.PI * t);   /* si stringe ai due capi */
            var off = (rnd() * 2 - 1) * amp;
            pts.push([x1 + dx * t + nx * off, y1 + dy * t + ny * off]);
        }
        pts.push([x2, y2]);
        return pts;
    }

    /* disegna un fulmine, opzionalmente rivelato solo fino a `reveal` (0..1) */
    function drawBolt(pts, reveal, bright) {
        /* lunghezza totale */
        var segLen = [], total = 0;
        for (var i = 1; i < pts.length; i++) {
            var l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
            segLen.push(l); total += l;
        }
        var target = reveal >= 1 ? total : reveal * total;

        ctx.strokeStyle = RED;
        ctx.lineWidth = bright ? 2 : 1;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = bright ? 1 : 0.95;
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        var acc = 0;
        for (var j = 1; j < pts.length; j++) {
            var l2 = segLen[j - 1];
            if (acc + l2 <= target) {
                ctx.lineTo(pts[j][0], pts[j][1]);
                acc += l2;
            } else {
                var f = (target - acc) / l2;
                ctx.lineTo(
                    pts[j - 1][0] + (pts[j][0] - pts[j - 1][0]) * f,
                    pts[j - 1][1] + (pts[j][1] - pts[j - 1][1]) * f
                );
                break;
            }
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
    }

    function visible(el) { return el && el.offsetParent !== null; }

    function anchors(a, b) {
        var ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
        return [ra.left + 6, ra.bottom + 2, rb.left - 10, rb.top + rb.height / 2];
    }

    function activeLinks() {
        var links = TRUNK.slice();
        Object.keys(GROUPS).forEach(function (pid) {
            GROUPS[pid].forEach(function (kid) {
                if (document.getElementById(kid).classList.contains('on')) {
                    links.push([pid, kid]);
                }
            });
        });
        return links;
    }

    function render(now) {
        now = now || performance.now();
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        var stillAnimating = false;
        var links = activeLinks();

        for (var i = 0; i < links.length; i++) {
            var a = document.getElementById(links[i][0]);
            var b = document.getElementById(links[i][1]);
            if (!visible(a) || !visible(b)) continue;

            var an = anchors(a, b);
            var seed = i * 131 + links[i][1].length * 17 + 7;
            var pts = boltPoints(an[0], an[1], an[2], an[3], seed);

            /* scarica in ingresso */
            var reveal = 1;
            var st = strike[links[i][1]];
            if (st && !reduceMotion) {
                var d = now - st.t0;
                if (d < 0) { reveal = 0; stillAnimating = true; }
                else if (d < 220) { reveal = d / 220; stillAnimating = true; }
                else { delete strike[links[i][1]]; }
            }

            /* lampo hover */
            var hk = highlight[linkKey(links[i][0], links[i][1])];
            var bright = false;
            if (hk) {
                if (now < hk) { bright = true; stillAnimating = true; }
                else delete highlight[linkKey(links[i][0], links[i][1])];
            }

            if (reveal > 0) drawBolt(pts, reveal, bright);
        }

        if (stillAnimating) { animating = true; requestAnimationFrame(render); }
        else animating = false;
    }

    function kick() { if (!animating) { animating = true; requestAnimationFrame(render); } }

    /* primo disegno quando l'intro non copre più la pagina */
    function start() {
        if (document.getElementById('vf-intro-overlay')) {
            setTimeout(start, 300);
            return;
        }
        resize();
    }
    start();
})();
