(function () {
    'use strict';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Theme toggle (with persistence + system preference) ---------- */
    const root = document.documentElement;
    const themeBtn = document.getElementById('theme-toggle');
    const stored = localStorage.getItem('theme');

    const applyTheme = (theme) => {
        root.setAttribute('data-theme', theme);
        const meta = document.querySelector('meta[name="theme-color"]:not([media])');
        if (meta) meta.setAttribute('content', theme === 'dark' ? '#0b1020' : '#ffffff');
    };

    const initialTheme = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
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

    /* ---------- Header scroll effect ---------- */
    const header = document.getElementById('header');
    let lastScroll = 0;
    const onScroll = () => {
        const y = window.scrollY;
        header.classList.toggle('scrolled', y > 20);
        lastScroll = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
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

    /* ---------- Footer year ---------- */
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
