/* --- FOTO — mappa con rami + collage + visualizzatore ---
   La pagina /photo/ è HTML statico: tutte le foto sono già nel markup
   (così Google le vede). Questo script:
   - apre/chiude i rami (click, o mouse sopra su desktop)
   - calcola l'altezza delle righe del collage perché stia tutto nel riquadro
   - disegna le linee dal centro ai rami (come la home)
   - apre una foto in un riquadro piccolo (frecce, swipe, Esc)
   Senza JavaScript la pagina mostra tutto in fila. */
(function () {
    document.documentElement.classList.add('js');

    function init() {
        var root = document.getElementById('f-root');
        var canvas = document.getElementById('bg');
        if (!root || !canvas) return;
        var ctx = canvas.getContext('2d');
        var RED = '#E30613', GAP = 3;

        var branches = [].slice.call(document.querySelectorAll('.branch')).map(function (el) {
            var panel = el.querySelector('.cluster');
            return {
                id: el.getAttribute('data-b'),
                label: el.getAttribute('data-label'),
                node: el.querySelector('.fb'),
                panel: panel,
                cl: panel.querySelector('.cl'),
                items: [].slice.call(panel.querySelectorAll('a.th'))
            };
        });

        var isMobile = function () { return window.matchMedia('(max-width: 760px)').matches; };
        var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        var cur = null, pinned = null, timer = null;

        /* ---------- collage: trova la riga più alta che sta nel riquadro ---------- */
        function fit(b) {
            var W = b.cl.clientWidth;
            var H = window.innerHeight * 0.54;
            if (!W) return;
            var ratios = b.items.map(function (a) { return parseFloat(a.style.getPropertyValue('--r')) || 1.5; });
            var best = 36;
            for (var h = 170; h >= 36; h -= 2) {
                var rows = 1, x = 0;
                for (var i = 0; i < ratios.length; i++) {
                    var w = ratios[i] * h;
                    if (x > 0 && x + GAP + w > W) { rows++; x = w; }
                    else x += (x ? GAP : 0) + w;
                }
                if (rows * h + (rows - 1) * GAP <= H) { best = h; break; }
            }
            b.cl.style.setProperty('--h', best + 'px');
        }

        /* ---------- apri / chiudi ---------- */
        function open(b) {
            if (cur === b) return;
            close();
            cur = b;
            b.node.setAttribute('aria-expanded', 'true');
            b.panel.classList.add('on');
            fit(b);
            draw();
        }
        function close() {
            if (!cur) return;
            cur.node.setAttribute('aria-expanded', 'false');
            cur.panel.classList.remove('on');
            cur = null; pinned = null;
            draw();
        }
        function later(fn, ms) { clearTimeout(timer); timer = setTimeout(fn, ms); }

        branches.forEach(function (b) {
            b.node.addEventListener('click', function (e) {
                e.stopPropagation();
                if (cur === b && pinned === b) close();
                else { open(b); pinned = b; }
            });
            if (canHover) {
                var enter = function () { clearTimeout(timer); if (cur !== b) later(function () { open(b); pinned = null; }, 120); };
                var leave = function () { clearTimeout(timer); if (cur === b && pinned !== b) later(close, 600); };
                b.node.addEventListener('mouseenter', enter);
                b.node.addEventListener('mouseleave', leave);
                b.panel.addEventListener('mouseenter', function () { clearTimeout(timer); });
                b.panel.addEventListener('mouseleave', leave);
            }
        });
        root.addEventListener('click', close);
        document.addEventListener('click', function (e) {
            if (cur && !cur.panel.contains(e.target) && !lb.contains(e.target)) close();
        });

        /* ---------- linee ---------- */
        function resize() {
            var dpr = window.devicePixelRatio || 1;
            canvas.width = Math.round(window.innerWidth * dpr);
            canvas.height = Math.round(window.innerHeight * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            if (cur) fit(cur);
            draw();
        }
        function link(a, b) {
            var aCx = a.left + a.width / 2, bCx = b.left + b.width / 2;
            var fx = bCx < aCx ? a.left - 6 : a.right + 6;
            var tx = bCx < aCx ? b.right + 6 : b.left - 6;
            ctx.beginPath();
            ctx.moveTo(fx, a.top + a.height / 2);
            ctx.lineTo(tx, b.top + b.height / 2);
            ctx.stroke();
        }
        function draw() {
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            ctx.strokeStyle = RED; ctx.lineWidth = 1;
            var r = root.getBoundingClientRect();
            branches.forEach(function (b) { link(r, b.node.getBoundingClientRect()); });
            if (cur && !isMobile()) {
                /* dal ramo al suo collage: punto più vicino del riquadro */
                var n = cur.node.getBoundingClientRect(), p = cur.panel.getBoundingClientRect();
                var nx = n.left + n.width / 2, ny = n.top + n.height / 2;
                var px = Math.max(p.left, Math.min(nx, p.right)), py = Math.max(p.top, Math.min(ny, p.bottom));
                var sy = py > ny ? n.bottom + 4 : n.top - 4;
                ctx.beginPath(); ctx.moveTo(nx, sy); ctx.lineTo(px, py); ctx.stroke();
            }
        }
        window.addEventListener('resize', resize);
        resize();
        setTimeout(draw, 250);

        /* ---------- visualizzatore ---------- */
        var lb = document.createElement('div');
        lb.className = 'lb';
        lb.setAttribute('role', 'dialog');
        lb.setAttribute('aria-modal', 'true');
        lb.innerHTML =
            '<div class="lb-box">' +
            '<div class="lb-bar lb-top"><span class="lb-title"></span>' +
            '<button type="button" class="lb-x">/ chiudi</button></div>' +
            '<img class="lb-img" alt="">' +
            '<div class="lb-bar lb-bot"><button type="button" class="lb-prev">/ prev</button>' +
            '<span class="lb-count"></span>' +
            '<button type="button" class="lb-next">/ next</button></div></div>';
        document.body.appendChild(lb);
        var img = lb.querySelector('.lb-img');
        var title = lb.querySelector('.lb-title');
        var count = lb.querySelector('.lb-count');
        var list = [], idx = 0, lbOpen = false, opener = null;

        function preload(i) { var p = new Image(); p.src = list[(i + list.length) % list.length].href; }
        function show(i) {
            idx = (i + list.length) % list.length;
            var a = list[idx];
            lb.classList.add('loading');
            img.onload = function () { lb.classList.remove('loading'); };
            img.src = a.href;
            img.alt = a.querySelector('img').alt;
            count.textContent = (idx + 1) + '/' + list.length;
            preload(idx + 1); preload(idx - 1);
        }
        function openViewer(b, a) {
            list = b.items; opener = a; lbOpen = true;
            title.textContent = '/ ' + b.label;
            lb.classList.add('open');
            show(list.indexOf(a));
            lb.querySelector('.lb-x').focus({ preventScroll: true });
        }
        function closeViewer() {
            if (!lbOpen) return;
            lbOpen = false;
            lb.classList.remove('open');
            img.removeAttribute('src');
            if (opener) opener.focus({ preventScroll: true });
        }
        branches.forEach(function (b) {
            b.items.forEach(function (a) {
                a.addEventListener('click', function (e) {
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
                    e.preventDefault();
                    openViewer(b, a);
                });
            });
        });
        lb.querySelector('.lb-x').addEventListener('click', closeViewer);
        lb.querySelector('.lb-prev').addEventListener('click', function () { show(idx - 1); });
        lb.querySelector('.lb-next').addEventListener('click', function () { show(idx + 1); });
        img.addEventListener('click', function () { show(idx + 1); });
        lb.addEventListener('click', function (e) { if (e.target === lb) closeViewer(); });

        document.addEventListener('keydown', function (e) {
            if (lbOpen) {
                if (e.key === 'Escape') closeViewer();
                else if (e.key === 'ArrowRight') show(idx + 1);
                else if (e.key === 'ArrowLeft') show(idx - 1);
                else if (e.key === 'Tab') {
                    var f = [].slice.call(lb.querySelectorAll('button'));
                    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
                    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
                }
            } else if (e.key === 'Escape') close();
        });

        var sx = 0, sy = 0;
        lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
        lb.addEventListener('touchend', function (e) {
            var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) show(idx + (dx < 0 ? 1 : -1));
            else if (Math.abs(dy) > 90 && Math.abs(dy) > Math.abs(dx) * 1.5) closeViewer();
        }, { passive: true });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
