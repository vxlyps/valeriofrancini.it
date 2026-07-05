/* --- PHOTO SLIDESHOW ---
   Foto grande cliccabile (click = prossima) + strip di thumbnails.
   La lista foto vive in images/photo/photos.js (window.VF_PHOTOS). */
(function () {
    var list = window.VF_PHOTOS || [];
    var stage = document.getElementById('stage');
    var cap = document.getElementById('cap');
    var thumbsBox = document.getElementById('thumbs');
    if (!stage) return;

    if (!list.length) {
        var ph = document.createElement('div');
        ph.className = 'slide-ph';
        ph.textContent = '/ presto';
        stage.appendChild(ph);
        return;
    }

    function fileOf(item) { return typeof item === 'string' ? item : item.file; }
    function capOf(item) { return typeof item === 'string' ? '' : (item.cap || ''); }

    var big = document.createElement('img');
    big.className = 'slide-img';
    big.decoding = 'async';
    big.title = 'click = prossima foto';
    stage.appendChild(big);

    var thumbs = list.map(function (item, idx) {
        var t = document.createElement('img');
        t.src = '../images/photo/' + fileOf(item);
        t.alt = capOf(item) || ('foto ' + (idx + 1));
        t.loading = 'lazy';
        t.decoding = 'async';
        t.addEventListener('click', function () { show(idx); });
        thumbsBox.appendChild(t);
        return t;
    });

    var i = 0;
    function show(n) {
        i = (n + list.length) % list.length;
        big.src = '../images/photo/' + fileOf(list[i]);
        big.alt = capOf(list[i]) || 'Valerio Francini';
        cap.textContent = capOf(list[i]) ? '/ ' + capOf(list[i]) : '';
        thumbs.forEach(function (t, k) { t.classList.toggle('cur', k === i); });
    }

    /* click sulla foto grande = avanti */
    big.addEventListener('click', function () { show(i + 1); });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') show(i + 1);
        else if (e.key === 'ArrowLeft') show(i - 1);
    });

    show(0);
})();
