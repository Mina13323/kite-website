(() => {
  const preloaderEl = document.getElementById('preloader');
  const heroEl = document.getElementById('hero');
  const heroTrackEl = document.querySelector('.hero-illustration-track');
  const sunWrapperEl = document.querySelector('.sun-wrapper');
  const brandRingEl = document.querySelector('.brand-ring');
  const uiEl = document.querySelector('.ui');
  const heroCopyEl = document.querySelector('.hero-copy');
  if (!preloaderEl || !heroEl) return;

  function getBottomOffset() {
    if (!heroTrackEl) return 0;
    const trackHeight = heroTrackEl.offsetHeight || (window.innerHeight * 2.2);
    return -(trackHeight - window.innerHeight);
  }

  let unlocked = false;
  function unlockScroll() {
    if (unlocked) return;
    unlocked = true;
    document.documentElement.classList.add('scroll-unlocked');
    document.body.classList.add('scroll-unlocked');
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    preloaderEl.classList.add('is-scrollable');
    preloaderEl.style.pointerEvents = 'none';
    heroEl.style.pointerEvents = 'auto';
    heroEl.style.opacity = '1';
    if (uiEl) uiEl.style.opacity = '1';
    if (sunWrapperEl) sunWrapperEl.style.opacity = '1';
    if (heroCopyEl) {
      heroCopyEl.style.opacity = '1';
      heroCopyEl.style.transform = 'none';
    }
    document.querySelectorAll('#hero h1, #hero p, .hero-actions, .site-header').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    document.dispatchEvent(new CustomEvent('kite:ready'));

    if (typeof ScrollTrigger !== 'undefined' && heroTrackEl) {
      requestAnimationFrame(() => {
        gsap.to(heroTrackEl, {
          y: () => window.innerHeight * 0.22,
          ease: 'none',
          scrollTrigger: {
            trigger: preloaderEl,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.3,
            invalidateOnRefresh: true,
          },
        });

        gsap.to('.hero-copy', {
          y: -40,
          opacity: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: preloaderEl,
            start: 'top top',
            end: '55% top',
            scrub: 0.2,
            invalidateOnRefresh: true,
          },
        });

        ScrollTrigger.refresh();
      });
    }
  }

  // Fallback safety timer
  window.setTimeout(unlockScroll, 9000);

  if (typeof gsap === 'undefined') {
    unlockScroll();
    return;
  }

  let cinematicStarted = false;

  // Initial States: Logo, text, UI elements are completely hidden
  gsap.set(uiEl, { opacity: 0 });
  gsap.set(sunWrapperEl, { opacity: 0, scale: 0.85, transformOrigin: '50% 50%' });
  gsap.set(brandRingEl, { opacity: 0, scale: 0.85, transformOrigin: '50% 50%' });
  gsap.set(heroEl, { opacity: 0 });
  gsap.set(heroCopyEl, { opacity: 0 });
  gsap.set('#hero h1', { opacity: 0, y: 30 });
  gsap.set('#hero p', { opacity: 0, y: 22 });
  gsap.set('.hero-actions', { opacity: 0, y: 18 });
  gsap.set('.site-header', { opacity: 0 });

  // Start positioned at the bottom street level
  if (heroTrackEl) {
    gsap.set(heroTrackEl, { y: getBottomOffset() });
  }

  window.addEventListener('resize', () => {
    if (!cinematicStarted && heroTrackEl) {
      gsap.set(heroTrackEl, { y: getBottomOffset() });
    }
  });

  // Prepare Circular Brand Ring text
  const ringTextString = '· WE CREATE BRANDS · SHOWS AND KITES ';
  const chars = ringTextString.split('');
  if (brandRingEl) {
    brandRingEl.innerHTML = '';
    const anglePerChar = 360 / chars.length;
    chars.forEach((char, i) => {
      const span = document.createElement('span');
      span.innerHTML = char === ' ' ? '&nbsp;' : char;
      span.className = 'ring-char';
      span.style.transform = `translate(-50%, -50%) rotate(${i * anglePerChar}deg) translateY(-80px)`;
      brandRingEl.appendChild(span);
    });
  }

  function startCinematicIntro() {
    if (cinematicStarted) return;
    cinematicStarted = true;

    // Refresh bottom offset with exact loaded dimensions
    if (heroTrackEl) {
      gsap.set(heroTrackEl, { y: getBottomOffset() });
    }

    // Main Intro Animation:
    // 1. Hold on bottom street level for 0.65s so the visitor sees the architecture
    // 2. Smoothly pan up through the illustration
    // 3. Once the pan reaches the top sky, reveal the KITE logo and the hero text
    const panDuration = 2.8;
    const tl = gsap.timeline({
      delay: 0.65,
    });

    // Pan from bottom street level up to open sky
    tl.to(heroTrackEl, {
      y: 0,
      duration: panDuration,
      ease: 'power2.inOut',
    }, 0);

    // Reveal moment: After the pan completes / reaches the sky at the top
    const revealTime = panDuration - 0.2;

    // Reveal KITE Logo (Sun & Rotating Brand Ring)
    tl.to(uiEl, { opacity: 1, duration: 0.4 }, revealTime)
      .to(sunWrapperEl, { opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(1.4)' }, revealTime)
      .set(brandRingEl, { opacity: 1, scale: 1, rotate: 0 }, revealTime + 0.1)
      .fromTo('.ring-char', { opacity: 0, scale: 0.5 }, {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        stagger: { amount: 0.7, from: 'start' },
        ease: 'back.out(1.5)',
      }, revealTime + 0.1);

    // Reveal Hero Text & CTA Buttons
    tl.to(heroEl, { opacity: 1, duration: 0.5 }, revealTime + 0.1)
      .to(heroCopyEl, { opacity: 1, duration: 0.4 }, revealTime + 0.1)
      .to('#hero h1', { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, revealTime + 0.25)
      .to('#hero p', { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, revealTime + 0.4)
      .to('.hero-actions', { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, revealTime + 0.55)
      .to('.hero-clients', { opacity: 1, duration: 0.8, ease: 'power2.out' }, revealTime + 0.65)
      .to('.site-header', { opacity: 1, duration: 0.6 }, revealTime + 0.6)
      .set(preloaderEl, { pointerEvents: 'none' }, revealTime + 0.8)
      .call(() => {
        gsap.to(brandRingEl, { rotate: 360, duration: 9.5, ease: 'none', repeat: -1 });
        unlockScroll();
      }, undefined, revealTime + 0.8);
  }

  // Wait for the hero illustration image to load before running the intro
  const heroImg = heroTrackEl ? heroTrackEl.querySelector('.hero-illustration-img') : null;
  if (heroImg && !heroImg.complete) {
    heroImg.addEventListener('load', startCinematicIntro, { once: true });
    heroImg.addEventListener('error', startCinematicIntro, { once: true });
    window.setTimeout(startCinematicIntro, 2000);
  } else {
    startCinematicIntro();
  }

  // Primary CTA click handler
  document.querySelector('.btn-primary')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('latest')?.scrollIntoView({ behavior: 'smooth' });
  });
})();
