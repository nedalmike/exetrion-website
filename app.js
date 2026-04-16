/* ═══════════════════════════════════════════════
   EXETRION CORPORATION — Animation Engine v3
   GSAP + ScrollTrigger + Lenis + Custom Effects
   Upgrade: Parallax, clip-path reveals, staggered
   cards, magnetic hover, cinematic easing
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── Wait for DOM + GSAP + Lenis ──
  function init() {
    if (typeof gsap === 'undefined' || typeof Lenis === 'undefined') {
      setTimeout(init, 50);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // ── LENIS SMOOTH SCROLL ──
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync Lenis with ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // Handle anchor clicks with Lenis
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
          lenis.scrollTo(target, { offset: -80 });
          closeMobileMenu();
        }
      });
    });

    // ── PRELOADER ──
    runPreloader(() => {
      revealHero();
      initScrollAnimations();
      initNavigation();
      initNumberCounters();
      initTimelineProgress();
      initParallax();
      initMagneticHover();
    });
  }

  // ── PRELOADER ──
  function runPreloader(onComplete) {
    const preloader = document.getElementById('preloader');
    const paths = document.querySelectorAll('.preloader__emblem-path');
    const dot = document.querySelector('.preloader__emblem-dot');
    const wordmark = document.querySelector('.preloader__wordmark');
    const lineFill = document.querySelector('.preloader__line-fill');
    const counter = document.querySelector('.preloader__counter');

    if (!preloader) { onComplete(); return; }

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(preloader, {
          opacity: 0,
          duration: 0.6,
          ease: 'power2.inOut',
          onComplete: () => {
            preloader.style.display = 'none';
            document.body.style.overflow = '';
            onComplete();
          }
        });
      }
    });

    document.body.style.overflow = 'hidden';

    tl.to(paths, {
      strokeDashoffset: 0,
      duration: 1.4,
      stagger: 0.2,
      ease: 'power3.inOut'
    });

    tl.to(dot, {
      opacity: 1,
      scale: 1,
      duration: 0.4,
      ease: 'back.out(2)'
    }, '-=0.3');

    tl.to(wordmark, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power3.out'
    }, '-=0.2');

    tl.to(lineFill, {
      width: '100%',
      duration: 1.0,
      ease: 'power2.inOut'
    }, '-=0.4');

    let obj = { val: 0 };
    tl.to(obj, {
      val: 100,
      duration: 1.0,
      ease: 'power2.inOut',
      onUpdate: () => {
        if (counter) counter.textContent = Math.round(obj.val);
      }
    }, '-=1.0');
  }

  // ── HERO REVEAL ──
  function revealHero() {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.to('.hero__eyebrow', {
      opacity: 1,
      duration: 0.8,
    });

    // Title lines — character cascade
    const titleLines = document.querySelectorAll('.hero__title-line');
    titleLines.forEach((line) => {
      const text = line.textContent;
      line.textContent = '';
      line.style.overflow = 'hidden';
      const chars = text.split('').map(char => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.display = 'inline-block';
        span.style.transform = 'translateY(110%)';
        span.style.opacity = '0';
        line.appendChild(span);
        return span;
      });

      tl.to(chars, {
        y: 0,
        opacity: 1,
        duration: 0.7,
        stagger: 0.025,
        ease: 'power3.out'
      }, '-=0.4');
    });

    tl.to('.hero__subtitle', {
      opacity: 1,
      y: 0,
      duration: 0.8,
    }, '-=0.3');

    tl.to('.hero__cta', {
      opacity: 1,
      y: 0,
      duration: 0.6,
    }, '-=0.4');

    tl.to('.hero__scroll-indicator', {
      opacity: 1,
      duration: 0.6,
    }, '-=0.2');
  }

  // ── SCROLL ANIMATIONS ──
  function initScrollAnimations() {
    // ── STAGGERED CARD REVEALS ──
    // Group cards within their parent grids for staggered entrance
    const cardGrids = document.querySelectorAll('.operations__grid, .divisions__grid, .numbers__grid');
    cardGrids.forEach(grid => {
      const cards = grid.querySelectorAll('[data-reveal]');
      if (cards.length === 0) return;

      // Set initial clip-path state for cards
      cards.forEach(card => {
        card.style.clipPath = 'inset(8% 8% 8% 8% round 6px)';
      });

      gsap.to(cards, {
        opacity: 1,
        y: 0,
        clipPath: 'inset(0% 0% 0% 0% round 6px)',
        duration: 0.9,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: grid,
          start: 'top 82%',
          toggleActions: 'play none none none',
        }
      });
    });

    // ── FOUNDER CARDS — special stagger ──
    const founderCards = document.querySelectorAll('.founders__card[data-reveal]');
    if (founderCards.length > 0) {
      founderCards.forEach(card => {
        card.style.clipPath = 'inset(5% 5% 5% 5% round 8px)';
      });
      gsap.to(founderCards, {
        opacity: 1,
        y: 0,
        clipPath: 'inset(0% 0% 0% 0% round 8px)',
        duration: 1.0,
        stagger: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.founders__grid',
          start: 'top 82%',
          toggleActions: 'play none none none',
        }
      });
    }

    // ── STAT CARDS (origin) — stagger from right ──
    const statCards = document.querySelectorAll('.origin__stat-card[data-reveal]');
    if (statCards.length > 0) {
      gsap.to(statCards, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.origin__visual-col',
          start: 'top 82%',
          toggleActions: 'play none none none',
        }
      });
    }

    // ── REMAINING GENERAL REVEALS (non-card) ──
    const reveals = document.querySelectorAll('[data-reveal]');
    reveals.forEach((el) => {
      // Skip if already handled by a parent grid
      if (el.closest('.operations__grid') ||
          el.closest('.divisions__grid') ||
          el.closest('.numbers__grid') ||
          el.closest('.founders__grid') ||
          el.closest('.origin__visual-col')) {
        return;
      }
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
        }
      });
    });

    // ── SECTION HEADINGS — character cascade with word wrap ──
    const splitHeadings = document.querySelectorAll('[data-split]:not(.hero__title)');
    splitHeadings.forEach((heading) => {
      const html = heading.innerHTML;
      const parts = html.split(/<br\s*\/?>/i);
      heading.innerHTML = '';

      const allChars = [];

      parts.forEach((part, pi) => {
        const trimmed = part.replace(/<[^>]*>/g, '').trim();
        const words = trimmed.split(/\s+/);
        words.forEach((word, wi) => {
          const wordWrap = document.createElement('span');
          wordWrap.style.display = 'inline-block';
          wordWrap.style.whiteSpace = 'nowrap';

          const chars = word.split('').map(char => {
            const span = document.createElement('span');
            span.textContent = char;
            span.style.display = 'inline-block';
            span.style.opacity = '0';
            span.style.transform = 'translateY(60px)';
            span.className = 'char';
            wordWrap.appendChild(span);
            return span;
          });
          allChars.push(...chars);
          heading.appendChild(wordWrap);

          if (wi < words.length - 1) {
            const space = document.createElement('span');
            space.innerHTML = '&nbsp;';
            space.style.display = 'inline-block';
            space.style.opacity = '0';
            space.style.transform = 'translateY(60px)';
            space.className = 'char';
            heading.appendChild(space);
            allChars.push(space);
          }
        });

        if (pi < parts.length - 1) {
          heading.appendChild(document.createElement('br'));
        }
      });

      gsap.to(allChars, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.02,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: heading,
          start: 'top 85%',
          toggleActions: 'play none none none',
        }
      });
    });

    // ── TIMELINE ITEMS — staggered with line draw sync ──
    const timelineItems = document.querySelectorAll('.timeline__item[data-reveal]');
    timelineItems.forEach((item, i) => {
      gsap.to(item, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 85%',
          toggleActions: 'play none none none',
        }
      });
    });
  }

  // ── PARALLAX ──
  function initParallax() {
    // Hero background parallax
    const heroBg = document.querySelector('.hero__bg');
    if (heroBg) {
      gsap.to(heroBg, {
        yPercent: 30,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5,
        }
      });
    }

    // Hero grid overlay parallax (slower)
    const heroGrid = document.querySelector('.hero__grid-overlay');
    if (heroGrid) {
      gsap.to(heroGrid, {
        yPercent: 15,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5,
        }
      });
    }

    // Section headings — subtle upward float as you scroll
    document.querySelectorAll('.origin__heading, .operations__heading, .divisions__heading, .numbers__heading, .timeline__heading').forEach(heading => {
      gsap.to(heading, {
        yPercent: -8,
        ease: 'none',
        scrollTrigger: {
          trigger: heading,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.8,
        }
      });
    });

    // Etymology prefixes — gentle parallax
    document.querySelectorAll('.etymology__prefix').forEach((el, i) => {
      gsap.to(el, {
        yPercent: -12 + (i * 4),
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.6,
        }
      });
    });
  }

  // ── MAGNETIC HOVER ──
  function initMagneticHover() {
    // Only on desktop (no touch)
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const magneticEls = document.querySelectorAll('.nav__link, .nav__logo');

    magneticEls.forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(el, {
          x: x * 0.3,
          y: y * 0.3,
          duration: 0.4,
          ease: 'power2.out'
        });
      });

      el.addEventListener('mouseleave', () => {
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: 'elastic.out(1, 0.5)'
        });
      });
    });
  }

  // ── NAVIGATION ──
  function initNavigation() {
    const nav = document.getElementById('nav');
    const menuBtn = document.getElementById('menuBtn');
    let lastScroll = 0;
    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentScroll = window.scrollY;

          if (currentScroll > 100) {
            nav.classList.add('nav--scrolled');
          } else {
            nav.classList.remove('nav--scrolled');
          }

          if (currentScroll > lastScroll && currentScroll > 300) {
            nav.classList.add('nav--hidden');
          } else {
            nav.classList.remove('nav--hidden');
          }

          lastScroll = currentScroll;
          ticking = false;
        });
        ticking = true;
      }
    });

    if (menuBtn) {
      menuBtn.addEventListener('click', () => {
        const isOpen = menuBtn.classList.contains('nav__menu-btn--active');
        if (isOpen) {
          closeMobileMenu();
        } else {
          openMobileMenu();
        }
      });
    }
  }

  function openMobileMenu() {
    const menuBtn = document.getElementById('menuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    if (menuBtn) menuBtn.classList.add('nav__menu-btn--active');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'true');
    if (mobileMenu) {
      mobileMenu.classList.add('mobile-menu--open');
      mobileMenu.setAttribute('aria-hidden', 'false');
    }
  }

  function closeMobileMenu() {
    const menuBtn = document.getElementById('menuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    if (menuBtn) menuBtn.classList.remove('nav__menu-btn--active');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
    if (mobileMenu) {
      mobileMenu.classList.remove('mobile-menu--open');
      mobileMenu.setAttribute('aria-hidden', 'true');
    }
  }

  // ── NUMBER COUNTERS ──
  function initNumberCounters() {
    const counters = document.querySelectorAll('[data-count]');
    counters.forEach((el) => {
      const target = parseInt(el.getAttribute('data-count'), 10);

      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          const obj = { val: 0 };
          gsap.to(obj, {
            val: target,
            duration: 1.8,
            ease: 'power2.out',
            onUpdate: () => {
              el.textContent = Math.round(obj.val).toLocaleString();
            }
          });
        }
      });
    });
  }

  // ── TIMELINE PROGRESS LINE ──
  function initTimelineProgress() {
    const track = document.querySelector('.timeline__track');
    const lineFill = document.querySelector('.timeline__line-fill');

    if (!track || !lineFill) return;

    ScrollTrigger.create({
      trigger: track,
      start: 'top 80%',
      end: 'bottom 20%',
      onUpdate: (self) => {
        gsap.set(lineFill, { height: (self.progress * 100) + '%' });
      }
    });
  }

  // ── INITIALIZE ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
