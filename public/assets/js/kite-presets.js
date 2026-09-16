(() => {
  const ALLOWED = {
    presets: {
      none: 1, 'fade-up': 1, 'fade-left': 1, 'fade-right': 1, 'scale-in': 1,
      'image-wipe': 1, 'image-clip': 1, 'image-parallax': 1,
      'text-stagger': 1, 'text-highlight': 1,
      'horizontal-gallery': 1, 'pin-scale': 1,
    },
    eases: { none: 1, 'power2.out': 1, 'power3.out': 1, 'expo.out': 1, 'sine.out': 1 },
    starts: { 'top 90%': 1, 'top 80%': 1, 'top 70%': 1, 'top 50%': 1, 'top bottom': 1 },
    ends: { 'top 20%': 1, 'center center': 1, 'bottom top': 1, 'bottom center': 1 },
  };

  function clamp(n, min, max, fallback) {
    const x = Number(n);
    if (Number.isNaN(x)) return fallback;
    return Math.min(max, Math.max(min, x));
  }

  function sanitize(raw) {
    const cfg = raw && typeof raw === 'object' ? raw : {};
    return {
      preset: ALLOWED.presets[cfg.preset] ? cfg.preset : 'fade-up',
      start: ALLOWED.starts[cfg.start] ? cfg.start : 'top 80%',
      end: ALLOWED.ends[cfg.end] ? cfg.end : 'bottom top',
      scrub: cfg.scrub === true || cfg.scrub === '1',
      intensity: clamp(cfg.intensity, 0.1, 1, 0.35),
      duration: clamp(cfg.duration, 0.2, 2.5, 1),
      delay: clamp(cfg.delay, 0, 1.5, 0),
      ease: ALLOWED.eases[cfg.ease] ? cfg.ease : 'power3.out',
      direction: ['up', 'down', 'left', 'right'].includes(cfg.direction) ? cfg.direction : 'up',
    };
  }

  function reduced() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function narrow() {
    return window.innerWidth < 800;
  }

  function travel(cfg) {
    return 28 + cfg.intensity * 48;
  }

  function splitLines(el) {
    if (el.dataset.split === '1') return el.querySelectorAll('.kite-line');
    const text = el.textContent;
    el.textContent = '';
    text.split(/\n+/).map((line) => line.trim()).filter(Boolean).forEach((line) => {
      const wrap = document.createElement('span');
      wrap.className = 'kite-line-mask';
      const inner = document.createElement('span');
      inner.className = 'kite-line';
      inner.textContent = line;
      wrap.appendChild(inner);
      el.appendChild(wrap);
    });
    el.dataset.split = '1';
    return el.querySelectorAll('.kite-line');
  }

  const registry = {
    none() {},

    'fade-up'(el, cfg) {
      const d = travel(cfg);
      gsap.fromTo(el, { autoAlpha: 0, y: d }, {
        autoAlpha: 1, y: 0, duration: cfg.duration, delay: cfg.delay, ease: cfg.ease,
        scrollTrigger: { trigger: el, start: cfg.start },
      });
    },

    'fade-left'(el, cfg) {
      gsap.fromTo(el, { autoAlpha: 0, x: -travel(cfg) }, {
        autoAlpha: 1, x: 0, duration: cfg.duration, delay: cfg.delay, ease: cfg.ease,
        scrollTrigger: { trigger: el, start: cfg.start },
      });
    },

    'fade-right'(el, cfg) {
      gsap.fromTo(el, { autoAlpha: 0, x: travel(cfg) }, {
        autoAlpha: 1, x: 0, duration: cfg.duration, delay: cfg.delay, ease: cfg.ease,
        scrollTrigger: { trigger: el, start: cfg.start },
      });
    },

    'scale-in'(el, cfg) {
      const from = 1 - cfg.intensity * 0.12;
      gsap.fromTo(el, { autoAlpha: 0, scale: from }, {
        autoAlpha: 1, scale: 1, duration: cfg.duration, delay: cfg.delay, ease: cfg.ease,
        scrollTrigger: { trigger: el, start: cfg.start },
      });
    },

    'image-wipe'(el, cfg) {
      const media = el.querySelector('img, .kite-media') || el;
      const dir = cfg.direction === 'right' ? 1 : -1;
      gsap.fromTo(el, { autoAlpha: 1, xPercent: dir * 18 }, {
        xPercent: 0, duration: cfg.duration, ease: cfg.ease,
        scrollTrigger: { trigger: el, start: cfg.start },
      });
      gsap.fromTo(media, { xPercent: -dir * 18, scale: 1.08 }, {
        xPercent: 0, scale: 1, duration: cfg.duration, ease: cfg.ease,
        scrollTrigger: { trigger: el, start: cfg.start },
      });
    },

    'image-clip'(el, cfg) {
      gsap.fromTo(el, { clipPath: 'inset(12% 12% 12% 12%)', autoAlpha: 1 }, {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: cfg.duration,
        ease: cfg.ease,
        scrollTrigger: {
          trigger: el,
          start: cfg.start,
          end: cfg.end,
          scrub: cfg.scrub ? 0.4 : false,
        },
      });
    },

    'image-parallax'(el, cfg) {
      const img = el.querySelector('img') || el;
      const amt = 6 + cfg.intensity * 10;
      gsap.fromTo(img, { yPercent: -amt }, {
        yPercent: amt,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    },

    'text-stagger'(el, cfg) {
      const target = el.querySelector('[data-stagger]') || el;
      const lines = splitLines(target);
      if (!lines.length) {
        registry['fade-up'](el, cfg);
        return;
      }
      gsap.fromTo(lines, { y: travel(cfg), autoAlpha: 0 }, {
        y: 0, autoAlpha: 1, stagger: 0.08, duration: cfg.duration, ease: cfg.ease,
        scrollTrigger: { trigger: el, start: cfg.start },
      });
    },

    'text-highlight'(el, cfg) {
      const marks = el.querySelectorAll('mark');
      if (!marks.length) {
        registry['fade-up'](el, cfg);
        return;
      }
      gsap.fromTo(marks, { backgroundSize: '0% 100%' }, {
        backgroundSize: '100% 100%',
        duration: cfg.duration,
        ease: cfg.ease,
        stagger: 0.12,
        scrollTrigger: { trigger: el, start: cfg.start, end: cfg.end, scrub: cfg.scrub ? 0.3 : false },
      });
    },

    'horizontal-gallery'(el, cfg) {
      if (narrow()) {
        registry['fade-up'](el, cfg);
        return;
      }
      const track = el.querySelector('[data-h-track]');
      if (!track || track.children.length < 2) {
        registry['fade-up'](el, cfg);
        return;
      }
      gsap.to(track, {
        x: () => -(track.scrollWidth - el.clientWidth),
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: () => '+=' + Math.max(track.scrollWidth - el.clientWidth, window.innerWidth),
          pin: true,
          scrub: 0.35,
          invalidateOnRefresh: true,
        },
      });
    },

    'pin-scale'(el, cfg) {
      if (narrow()) {
        registry['scale-in'](el, cfg);
        return;
      }
      const frame = el.querySelector('[data-pin-frame]') || el;
      gsap.fromTo(frame, { scale: 1 - cfg.intensity * 0.12 }, {
        scale: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top 15%',
          end: '+=70%',
          pin: true,
          scrub: 0.4,
        },
      });
    },
  };

  function apply(root) {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);
    const scope = root || document;
    const skipHeavy = reduced();

    scope.querySelectorAll('[data-kite-anim]').forEach((el) => {
      let cfg = {};
      try { cfg = JSON.parse(el.getAttribute('data-kite-config') || '{}'); } catch { cfg = {}; }
      cfg = sanitize(cfg);
      const preset = ALLOWED.presets[el.getAttribute('data-kite-anim')]
        ? el.getAttribute('data-kite-anim')
        : cfg.preset;
      cfg.preset = preset;
      if (skipHeavy && ['image-parallax', 'horizontal-gallery', 'pin-scale'].includes(preset)) {
        return;
      }
      const fn = registry[preset] || registry['fade-up'];
      try { fn(el, cfg); } catch (err) { console.warn('KITE preset skipped', preset, err); }
    });
  }

  window.KiteAnimate = { apply, sanitize, registry, reduced };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => apply(document));
  } else {
    apply(document);
  }
})();
