/* =========================================================
   VALERIO FRANCINI — SHARED JS
   ========================================================= */

/* --- THEME SWITCH (con persistenza localStorage) --- */
function setTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    try { localStorage.setItem('vf-theme', theme); } catch (e) {}
}

(function initTheme() {
    let saved = null;
    try { saved = localStorage.getItem('vf-theme'); } catch (e) {}
    if (saved === 'dark') {
        document.body.classList.add('dark-mode');
    }
})();

/* --- ACCORDION (homepage) --- */
const accordionContainer = document.getElementById('accordion-container-vf');
if (accordionContainer) {
    accordionContainer.addEventListener('click', function (e) {
        const btn = e.target.closest('.accordion-button-vf');
        if (!btn) return;
        const item = btn.closest('.accordion-item-vf');
        const wasOpen = item.classList.contains('open');
        document.querySelectorAll('.accordion-item-vf').forEach(acc => acc.classList.remove('open'));
        if (!wasOpen) item.classList.add('open');
    });
}

/* --- MANINE CAOTICHE (contact trigger) --- */
const contactTrigger = document.getElementById('contact-trigger-vf');
if (contactTrigger) {
    contactTrigger.addEventListener('click', function (e) {
        e.preventDefault();
        const footer = document.getElementById('footer-vf');
        const endTarget = document.getElementById('footer-links-target-vf');
        if (!footer || !endTarget) return;

        footer.scrollIntoView({ behavior: 'smooth', block: 'end' });
        document.querySelectorAll('.crazy-arrow-vf').forEach(el => el.remove());

        const startRect = contactTrigger.getBoundingClientRect();
        const startX = startRect.left + (startRect.width / 2);
        const startY = startRect.top + (startRect.height / 2);

        const numArrows = 20;
        for (let i = 0; i < numArrows; i++) {
            setTimeout(() => {
                const endRect = endTarget.getBoundingClientRect();
                const endX = endRect.left + (Math.random() * endRect.width);
                const endY = endRect.top - 50 - (Math.random() * 40);

                const arrow = document.createElement('div');
                arrow.className = 'crazy-arrow-vf';
                arrow.textContent = '👇🏻';
                arrow.style.setProperty('--sx', `${startX}px`);
                arrow.style.setProperty('--sy', `${startY}px`);
                arrow.style.setProperty('--ex', `${endX}px`);
                arrow.style.setProperty('--ey', `${endY}px`);

                const r1 = (Math.random() * 90) - 45;
                const r2 = (Math.random() * 20) - 10;
                arrow.style.setProperty('--r1', `${r1}deg`);
                arrow.style.setProperty('--r2', `${r2}deg`);

                document.body.appendChild(arrow);
                requestAnimationFrame(() => arrow.classList.add('show'));
                setTimeout(() => arrow.remove(), 1500);
            }, i * 60);
        }
    });
}

/* --- DVD BOUNCE (faccia che rimbalza) ---
   Usa transform (GPU) invece di left/top e misura le dimensioni
   solo a init/resize: niente layout forzato a ogni frame. */
(function dvdBounce() {
    const dvdLink = document.getElementById('dvd-link');
    const dvdImage = document.getElementById('dvd-image');
    if (!dvdLink || !dvdImage) return;

    /* base path: su github.io il sito vive in /<repo>/, sul dominio custom in / */
    const VF_BASE = location.hostname.endsWith('github.io') ? '/' + location.pathname.split('/')[1] : '';
    const imgNormale = VF_BASE + '/images/ValerioFrancini/VF.png';
    const imgSbatte = VF_BASE + '/images/ValerioFrancini/ValerioFrancini_arrogante.png';

    let x = 50;
    let y = 50;
    let dx = 2;
    let dy = 2;
    let w = 0;
    let h = 0;

    function measure() {
        const rect = dvdLink.getBoundingClientRect();
        w = rect.width;
        h = rect.height;
    }
    window.addEventListener('resize', measure);

    function step() {
        const winWidth = window.innerWidth;
        const winHeight = window.innerHeight;
        const isMobile = winWidth < 768;
        const margin = isMobile ? 10 : 20;

        let hitEdge = false;

        if (x + w >= winWidth - margin) {
            x = winWidth - w - margin;
            dx = -Math.abs(dx);
            hitEdge = true;
        } else if (x <= margin) {
            x = margin;
            dx = Math.abs(dx);
            hitEdge = true;
        }

        if (y + h >= winHeight - margin) {
            y = winHeight - h - margin;
            dy = -Math.abs(dy);
            hitEdge = true;
        } else if (y <= margin) {
            y = margin;
            dy = Math.abs(dy);
            hitEdge = true;
        }

        if (hitEdge) {
            dvdImage.src = imgSbatte;
            setTimeout(() => { dvdImage.src = imgNormale; }, 200);
        }

        x += dx;
        y += dy;
        dvdLink.style.transform = `translate(${x}px, ${y}px)`;

        requestAnimationFrame(step);
    }

    /* parte solo quando l'intro non copre più la pagina */
    function start() {
        if (document.getElementById('vf-intro-overlay')) {
            setTimeout(start, 400);
            return;
        }
        measure();
        requestAnimationFrame(step);
    }
    start();
})();

// === YOUTUBE FACADE: carica il player solo al click ===
document.querySelectorAll('.yt-lite').forEach(function (btn) {
    btn.addEventListener('click', function () {
        var iframe = document.createElement('iframe');
        iframe.src = 'https://www.youtube.com/embed/' + btn.dataset.id + '?autoplay=1';
        iframe.title = btn.querySelector('img').alt;
        iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
        iframe.allowFullscreen = true;
        btn.replaceWith(iframe);
    });
});
