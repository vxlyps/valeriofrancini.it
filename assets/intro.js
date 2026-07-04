/* --- INTRO VIDEO — valeriofrancini.it ---
   Sequenza: fake loader → video → fade out al sito
   SessionStorage: una sola volta per sessione.
*/
(function () {
    if (sessionStorage.getItem('vf_intro_shown')) return;

    /* base path: su github.io il sito vive in /<repo>/, sul dominio custom in / */
    var VF_BASE = location.hostname.endsWith('github.io') ? '/' + location.pathname.split('/')[1] : '';
    var VIDEO_SRC   = VF_BASE + '/images/vid/intro_valeriofrancini.mp4';
    var VIDEO_SPEED = 1.4;   /* velocità riproduzione — aumenta per accorciare */
    var FADE_MS     = 450;
    var FALLBACK_MS = 6000;
    var FADE_BEFORE = 0.4;
    var ZOOM_BEFORE = 2.0;   /* inizia zoom CSS X secondi prima della fine */
    var ZOOM_SCALE  = 1.6;   /* quanto zoommare — aumenta per effetto più drammatico */

    function build() {

        /* ── Overlay ── */
        var overlay = document.createElement('div');
        overlay.id = 'vf-intro-overlay';
        overlay.style.cssText = [
            'position:fixed', 'inset:0', 'z-index:999999',
            'background:#000', 'opacity:1',
            'transition:opacity ' + FADE_MS + 'ms ease'
        ].join(';');

        /* ── Video ── */
        var video = document.createElement('video');
        video.muted       = true;
        video.playsInline = true;
        video.setAttribute('playsinline', '');
        video.preload     = 'auto';
        video.style.cssText = [
            'position:absolute', 'inset:0',
            'width:100%', 'height:100%',
            'object-fit:cover', 'pointer-events:none',
            'opacity:0', 'transition:opacity 0.5s ease'
        ].join(';');
        var src = document.createElement('source');
        src.src  = VIDEO_SRC;
        src.type = 'video/mp4';
        video.appendChild(src);

        /* ── Loader ── */
        var loader = document.createElement('div');
        loader.style.cssText = [
            'position:absolute', 'inset:0',
            'display:flex', 'flex-direction:column',
            'align-items:center', 'justify-content:center',
            'z-index:2', 'pointer-events:none',
            'transition:opacity 0.45s ease'
        ].join(';');

        /* percentuale — unico elemento, bold e cattivo */
        var pctEl = document.createElement('div');
        pctEl.id = 'vf-intro-pct';
        pctEl.textContent = '0%';
        pctEl.style.cssText = [
            'color:#fff',
            "font-family:'Inter',-apple-system,sans-serif",
            'font-size:clamp(3rem,7vw,5.5rem)',
            'font-weight:800',
            'line-height:1',
            'letter-spacing:-0.03em',
            'user-select:none'
        ].join(';');

        loader.appendChild(pctEl);

        /* ── Skip — testo puro, nessun bordo ── */
        var skip = document.createElement('button');
        skip.textContent = '/ skip';
        skip.style.cssText = [
            'position:absolute', 'bottom:26px', 'right:26px',
            'background:none', 'border:none',
            'color:rgba(255,255,255,0.6)',
            "font-family:'Helvetica Neue',Helvetica,Arial,sans-serif",
            'font-size:15px', 'font-weight:400',
            'letter-spacing:normal', 'text-transform:uppercase',
            'padding:10px 14px', 'cursor:pointer', 'z-index:3',
            'opacity:0', 'transition:opacity 0.4s,color 0.2s,background 0.2s',
            '-webkit-tap-highlight-color:transparent'
        ].join(';');
        skip.addEventListener('mouseover', function () {
            skip.style.color = '#fff';
            skip.style.background = '#E30613';
        });
        skip.addEventListener('mouseout', function () {
            skip.style.color = 'rgba(255,255,255,0.6)';
            skip.style.background = 'none';
        });

        /* ── Zoom fine video — amplifica lo zoom nel naso ── */
        var zoomStarted = false;
        video.style.transformOrigin = 'center 47%'; /* leggermente sopra il centro */

        /* ── Dismiss ── */
        var done = false;
        function dismiss() {
            if (done) return;
            done = true;
            clearTimeout(fallback);
            sessionStorage.setItem('vf_intro_shown', '1');
            document.body.style.overflow = '';
            overlay.style.opacity = '0';
            setTimeout(function () {
                if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            }, FADE_MS + 60);
        }

        video.addEventListener('timeupdate', function () {
            if (!video.duration) return;
            /* zoom in negli ultimi ZOOM_BEFORE secondi */
            if (!zoomStarted && video.currentTime >= video.duration - ZOOM_BEFORE) {
                zoomStarted = true;
                var dur = Math.max(video.duration - video.currentTime, 0.3);
                video.style.transition = 'transform ' + dur + 's ease-in, opacity 0.5s ease';
                video.style.transform  = 'scale(' + ZOOM_SCALE + ')';
            }
            /* dissolvi negli ultimi FADE_BEFORE secondi */
            if (video.currentTime >= video.duration - FADE_BEFORE) dismiss();
        });
        video.addEventListener('ended', dismiss);
        video.addEventListener('error', dismiss);
        skip.addEventListener('click', dismiss);

        var fallback = setTimeout(dismiss, FALLBACK_MS);

        /* ── Fake counter ── */
        function runLoader() {
            var count = 0;
            var interval = setInterval(function () {
                count = Math.min(100, count + Math.floor(Math.random() * 4) + 1);
                pctEl.textContent = count + '%';

                if (count >= 100) {
                    clearInterval(interval);
                    setTimeout(function () {
                        loader.style.opacity = '0';
                        video.style.opacity  = '1';
                        skip.style.opacity   = '1';
                        var p = video.play();
                        if (p && p.catch) p.catch(dismiss);
                        video.playbackRate = VIDEO_SPEED;
                        clearTimeout(fallback);
                        /* fallback basato sulla durata reale — evita di tagliare video lunghi */
                        var safetyMs = video.duration
                            ? Math.ceil(video.duration / VIDEO_SPEED * 1000) + 4000
                            : 30000;
                        fallback = setTimeout(dismiss, safetyMs);
                    }, 350);
                }
            }, 28);
        }

        /* ── Mount ── */
        overlay.appendChild(video);
        overlay.appendChild(loader);
        overlay.appendChild(skip);
        document.body.style.overflow = 'hidden';
        document.body.appendChild(overlay);
        video.load();
        runLoader();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', build);
    } else {
        build();
    }
})();
