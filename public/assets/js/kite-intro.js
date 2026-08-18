(() => {
  const counterEl = document.getElementById('counter');
  const preloaderEl = document.getElementById('preloader');
  const heroEl = document.getElementById('hero');
  if (!preloaderEl || !heroEl) return;

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
    const copy = document.querySelector('.hero-copy');
    if (copy) copy.style.opacity = '1';
    document.querySelectorAll('#hero h1, #hero p, .hero-actions, .site-header').forEach((el) => {
      el.style.opacity = '1';
    });
    document.dispatchEvent(new CustomEvent('kite:ready'));
    if (typeof ScrollTrigger !== 'undefined') {
      requestAnimationFrame(() => ScrollTrigger.refresh());
    }
  }

  window.setTimeout(unlockScroll, 8000);

  if (typeof gsap === 'undefined') {
    unlockScroll();
    return;
  }

  const heroCopyEl = document.querySelector('.hero-copy');
  const sunWrapperEl = document.querySelector('.sun-wrapper');
  const brandRingEl = document.querySelector('.brand-ring');
  const houseEls = gsap.utils.toArray('.house');
  const cloudLeftEls = gsap.utils.toArray('.cloud-1, .cloud-2, .cloud-3');
  const cloudRightEls = gsap.utils.toArray('.cloud-4, .cloud-5, .cloud-6');
  const houseLeftEls = houseEls.slice(0, Math.ceil(houseEls.length / 2));
  const houseRightEls = houseEls.slice(Math.ceil(houseEls.length / 2));
  const progress = { value: 0 };
  let cinematicStarted = false;

  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  gsap.set(heroEl, { opacity: 0 });
  gsap.set(heroCopyEl, { opacity: 0, y: 28 });
  gsap.set(brandRingEl, { opacity: 0, scale: 0.94, transformOrigin: '50% 50%' });

  gsap.to('.cloud', { y: -12, duration: 7, ease: 'sine.inOut', stagger: 0.8, repeat: -1, yoyo: true });

  tl.from('.cloud-1, .cloud-2, .cloud-3', { y: 36, opacity: 0, duration: 1.8, stagger: 0.15 }, 0.15)
    .from('.cloud-4, .cloud-5, .cloud-6', { y: 36, opacity: 0, duration: 1.8, stagger: 0.15 }, 0.15)
    .from('.sun-wrapper, .counter', { y: -100, opacity: 0, duration: 1.5, stagger: 0.2 }, 0.2)
    .from('.house', { y: 150, opacity: 0, duration: 1.6, stagger: { each: 0.1, from: 'center' } }, 0.45)
    .to(progress, {
      value: 100,
      duration: 2.5,
      ease: 'power1.out',
      onUpdate: () => { if (counterEl) counterEl.innerText = `${Math.floor(progress.value)}%`; },
      onComplete: startCinematicTransition,
    }, '<');

  gsap.to('.counter', { scale: 1.05, duration: 1, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 2 });

  function startCinematicTransition() {
    if (cinematicStarted) return;
    cinematicStarted = true;
    gsap.killTweensOf('.counter');
    gsap.killTweensOf('.sun-glow');
    gsap.killTweensOf('.cloud');

    const ringTextString = '· WE CREATE BRANDS · SHOWS AND KITES ';
    const chars = ringTextString.split('');
    brandRingEl.innerHTML = '';
    const anglePerChar = 360 / chars.length;
    chars.forEach((char, i) => {
      const span = document.createElement('span');
      span.innerHTML = char === ' ' ? '&nbsp;' : char;
      span.className = 'ring-char';
      span.style.transform = `translate(-50%, -50%) rotate(${i * anglePerChar}deg) translateY(-80px)`;
      brandRingEl.appendChild(span);
    });

    const isMobile = window.innerWidth <= 640;
    const tlTransition = gsap.timeline();
    const dropStart = 0.1;
    const splitTime = 0.5;

    tlTransition
      .set('.counter, .sun-glow', { opacity: 0 }, dropStart)
      .set(brandRingEl, { opacity: 1, scale: 1, rotate: 0 }, dropStart)
      .to(sunWrapperEl, { y: 30, duration: 2, ease: 'power3.inOut' }, dropStart)
      .to(houseLeftEls, { x: isMobile ? '-=10vw' : '-=28vw', duration: 1.8, ease: 'power3.inOut' }, splitTime)
      .to(houseRightEls, { x: isMobile ? '+=6vw' : '+=22vw', duration: 1.8, ease: 'power3.inOut' }, splitTime)
      .to(cloudLeftEls, { x: isMobile ? '-=2vw' : '-=10vw', duration: 1.8, ease: 'power3.inOut' }, splitTime + 0.1)
      .to(cloudRightEls, { x: isMobile ? '+=2vw' : '+=10vw', duration: 1.8, ease: 'power3.inOut' }, splitTime + 0.1);

    const drawStart = dropStart + 1.8;
    tlTransition.fromTo('.ring-char', { opacity: 0, scale: 0.6 }, {
      opacity: 1, scale: 1, duration: 0.6,
      stagger: { amount: 1, from: 'start' }, ease: 'power2.out',
    }, drawStart);

    tlTransition
      .to(heroEl, { opacity: 1, duration: 2, ease: 'power2.inOut' }, splitTime)
      .to(heroCopyEl, { opacity: 1, y: 0, duration: 0.1 }, drawStart + 0.2);

    const heroRevealStart = drawStart + 0.6;
    tlTransition
      .to('#hero h1', { opacity: 1, duration: 0.6, ease: 'power2.in' }, heroRevealStart)
      .to('#hero p', { opacity: 1, duration: 0.6, ease: 'power2.in' }, heroRevealStart + 0.2)
      .to('.hero-actions', { opacity: 1, duration: 0.6, ease: 'power2.in' }, heroRevealStart + 0.4)
      .to('.site-header', { opacity: 1, duration: 0.6 }, heroRevealStart + 0.5)
      .set(preloaderEl, { pointerEvents: 'none' }, heroRevealStart + 0.8)
      .call(() => {
        gsap.to(brandRingEl, { rotate: 360, duration: 9, ease: 'none', repeat: -1 });
        unlockScroll();
      }, undefined, drawStart + 1);

    document.querySelector('.btn-primary')?.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('latest')?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  window.onbeforeunload = () => window.scrollTo(0, 0);
})();
