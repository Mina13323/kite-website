(() => {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  gsap.registerPlugin(ScrollTrigger);

  const wait = document.body.classList.contains('home-intro')
    && !document.body.classList.contains('scroll-unlocked');

  if (wait) {
    document.addEventListener('kite:ready', start, { once: true });
    window.setTimeout(start, 8500);
  } else {
    start();
  }

  let started = false;
  function start() {
    if (started) return;
    started = true;
    initProgress();
    initReveals();
    initImageWipes();
    initParallax();
    initStaggers();
    initFooterScrub();
    initPathDraw();
    ScrollTrigger.refresh();
  }

  function initProgress() {
    let bar = document.querySelector('.scroll-progress');
    if (!bar) {
      bar = document.createElement('div');
      bar.className = 'scroll-progress';
      bar.setAttribute('aria-hidden', 'true');
      document.body.appendChild(bar);
    }
    gsap.set(bar, { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.to(bar, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: { scrub: 0.2 },
    });
  }

  function animateFrom(elem, direction) {
    const dir = direction || 1;
    let x = 0;
    let y = dir * 56;
    if (elem.classList.contains('from-left')) {
      x = -72;
      y = 0;
    } else if (elem.classList.contains('from-right')) {
      x = 72;
      y = 0;
    }
    gsap.fromTo(elem, { x, y, autoAlpha: 0 }, {
      duration: 1.1,
      x: 0,
      y: 0,
      autoAlpha: 1,
      ease: 'expo.out',
      overwrite: 'auto',
    });
  }

  function initReveals() {
    const targets = document.querySelectorAll([
      '.section-head',
      '.page-hero h1',
      '.page-hero p',
      '.about-copy',
      '.about-tabs',
      '.about-visual',
      '.cta-band h2',
      '.cta-band p',
      '.cta-band .btn',
      '.contact-box',
      '.office',
      '.bang-copy',
      '.filters',
      '.article h1',
      '.article .lead',
    ].join(','));

    targets.forEach((elem) => {
      if (elem.closest('#preloader')) return;
      gsap.set(elem, { autoAlpha: 0 });
      ScrollTrigger.create({
        trigger: elem,
        start: 'top 88%',
        onEnter: () => animateFrom(elem),
        onEnterBack: () => animateFrom(elem, -1),
      });
    });
  }

  function initImageWipes() {
    document.querySelectorAll('.reveal-media').forEach((container) => {
      const image = container.querySelector('img');
      if (!image) return;
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top 86%',
          toggleActions: 'play none none none',
        },
      });
      tl.from(container, { xPercent: -18, autoAlpha: 0, duration: 1.05, ease: 'power2.out' })
        .from(image, { scale: 1.18, duration: 1.15, ease: 'power2.out' }, 0);
    });
  }

  function initParallax() {
    document.querySelectorAll('.svc-frame img, .about-visual img, .bang-media img').forEach((img) => {
      gsap.fromTo(img, { yPercent: -8 }, {
        yPercent: 8,
        ease: 'none',
        scrollTrigger: {
          trigger: img.closest('.svc-art, .about-visual, .bang-item') || img,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    });

    document.querySelectorAll('.svc-giant').forEach((el) => {
      gsap.fromTo(el, { y: 40 }, {
        y: -80,
        ease: 'none',
        scrollTrigger: {
          trigger: el.closest('.service-slide') || el,
          start: 'left 90%',
          end: 'left -10%',
          scrub: true,
        },
      });
    });
  }

  function initStaggers() {
    const groups = [
      ['.work-card', '.work-wrap'],
      ['.case-card', '.cases'],
      ['.project-tile', '.project-grid'],
      ['.client-logo', '.clients'],
      ['.svc-chips span', '.svc-chips'],
    ];
    groups.forEach(([itemSel, parentSel]) => {
      document.querySelectorAll(parentSel).forEach((parent) => {
        const items = parent.querySelectorAll(itemSel);
        if (!items.length) return;
        gsap.from(items, {
          y: 36,
          autoAlpha: 0,
          stagger: 0.08,
          duration: 0.8,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: parent,
            start: 'top 86%',
          },
        });
      });
    });
  }

  function initFooterScrub() {
    const giant = document.querySelector('.site-footer .giant');
    if (!giant) return;
    gsap.fromTo(giant, { y: 40, scale: 0.92 }, {
      y: 0,
      scale: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: '.site-footer',
        start: 'top 90%',
        end: 'top 40%',
        scrub: true,
      },
    });
  }

  function initPathDraw() {
    const path = document.querySelector('.kite-draw-path');
    if (!path) return;
    const length = path.getTotalLength();
    path.style.strokeDasharray = String(length);
    path.style.strokeDashoffset = String(length);
    gsap.to(path, {
      strokeDashoffset: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: '.kite-draw',
        start: 'top 85%',
        end: 'bottom 55%',
        scrub: 0.4,
      },
    });
  }
})();
