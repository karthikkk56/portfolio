(function () {
    'use strict';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Theme toggle ---------- */
    const root = document.documentElement;
    const themeBtn = document.getElementById('theme-toggle');
    const stored = localStorage.getItem('theme');

    const applyTheme = (theme) => {
        root.setAttribute('data-theme', theme);
        const meta = document.querySelector('meta[name="theme-color"]:not([media])');
        if (meta) meta.setAttribute('content', theme === 'dark' ? '#0c090d' : '#FAFAF9');
    };

    const initialTheme = stored || 'dark';
    applyTheme(initialTheme);

    themeBtn?.addEventListener('click', () => {
        const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        localStorage.setItem('theme', next);
    });

    /* ---------- Mobile menu ---------- */
    const menuBtn = document.getElementById('menu-toggle');
    const navList = document.getElementById('nav-list');

    const closeMenu = () => {
        navList?.classList.remove('open');
        menuBtn?.setAttribute('aria-expanded', 'false');
    };

    menuBtn?.addEventListener('click', () => {
        const isOpen = navList.classList.toggle('open');
        menuBtn.setAttribute('aria-expanded', String(isOpen));
    });

    navList?.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', (e) => {
        if (!navList?.classList.contains('open')) return;
        if (!navList.contains(e.target) && !menuBtn.contains(e.target)) closeMenu();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMenu();
    });

    /* ---------- Header scroll + scroll progress ---------- */
    const header = document.getElementById('header');
    const progressBar = document.getElementById('scrollProgress');

    let ticking = false;
    const onScroll = () => {
        const y = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (y / docHeight) * 100 : 0;
        if (progressBar) progressBar.style.width = progress + '%';
        if (header) header.classList.toggle('scrolled', y > 20);
        ticking = false;
    };
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(onScroll);
            ticking = true;
        }
    }, { passive: true });
    onScroll();

    /* ---------- Active nav link on scroll ---------- */
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    if ('IntersectionObserver' in window) {
        const obs = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const id = entry.target.id;
                        navLinks.forEach((link) => {
                            const isActive = link.getAttribute('href') === `#${id}`;
                            link.classList.toggle('active', isActive);
                        });
                    }
                });
            },
            { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
        );
        sections.forEach((s) => obs.observe(s));
    }

    /* ---------- Reveal on scroll ---------- */
    const revealEls = document.querySelectorAll('.reveal');
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        revealEls.forEach((el) => el.classList.add('visible'));
    } else {
        const revealObs = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        revealObs.unobserve(entry.target);
                    }
                });
            },
            { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
        );
        revealEls.forEach((el) => revealObs.observe(el));
    }

    /* ---------- Count-up stats ---------- */
    const counters = document.querySelectorAll('[data-count]');
    if (!prefersReducedMotion && 'IntersectionObserver' in window) {
        const countObs = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    const el = entry.target;
                    const target = parseInt(el.dataset.count, 10);
                    const duration = 1200;
                    const start = performance.now();
                    const animate = (now) => {
                        const t = Math.min((now - start) / duration, 1);
                        const eased = 1 - Math.pow(1 - t, 3);
                        const current = Math.floor(eased * target);
                        el.textContent = current;
                        if (t < 1) requestAnimationFrame(animate);
                        else el.textContent = target;
                    };
                    requestAnimationFrame(animate);
                    countObs.unobserve(el);
                });
            },
            { threshold: 0.5 }
        );
        counters.forEach((c) => countObs.observe(c));
    } else {
        counters.forEach((c) => { c.textContent = c.dataset.count; });
    }

    /* ---------- Copy to clipboard ---------- */
    const copyBtn = document.getElementById('copyEmail');
    const toast = document.getElementById('toast');
    let toastTimer;

    const showToast = (msg) => {
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
    };

    copyBtn?.addEventListener('click', async () => {
        const text = copyBtn.dataset.copy;
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
            showToast('✓ Email copied to clipboard');
        } catch {
            const ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand('copy'); showToast('✓ Email copied'); }
            catch { showToast('✗ Could not copy'); }
            document.body.removeChild(ta);
        }
    });

    /* ---------- Footer year ---------- */
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
