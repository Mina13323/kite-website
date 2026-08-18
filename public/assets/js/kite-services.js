(() => {
  const pin = document.querySelector('.services-horizon-pin');
  const track = document.querySelector('.services-track');
  if (!pin || !track) return;

  const slides = Array.from(track.querySelectorAll('.service-slide'));
  const dots = Array.from(document.querySelectorAll('[data-svc-go]'));
  if (slides.length < 2) return;

  const canPin = typeof gsap !== 'undefined'
    && typeof ScrollTrigger !== 'undefined'
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (document.body.classList.contains('home-intro') && !document.body.classList.contains('scroll-unlocked')) {
    document.addEventListener('kite:ready', start, { once: true });
    window.setTimeout(start, 9000);
  } else {
    start();
  }

  let started = false;
  function start() {
    if (started) return;
    started = true;
    if (!canPin) {
      pin.classList.add('is-native-x');
      bindNativeDots();
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    window.setTimeout(initPin, 50);
  }

  function setActive(index) {
    dots.forEach((dot, i) => dot.classList.toggle('is-on', i === index));
  }

  function bindNativeDots() {
    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const i = Number(dot.dataset.svcGo);
        const slide = slides[i];
        if (!slide) return;
        pin.scrollTo({ left: slide.offsetLeft, behavior: 'smooth' });
        setActive(i);
      });
    });
    pin.addEventListener('scroll', () => {
      const i = Math.round(pin.scrollLeft / Math.max(pin.clientWidth, 1));
      setActive(i);
    }, { passive: true });
  }

  function initPin() {
    const tween = gsap.to(track, {
      x: () => -(track.scrollWidth - window.innerWidth),
      ease: 'none',
      scrollTrigger: {
        trigger: pin,
        start: 'top top',
        end: () => '+=' + Math.max(track.scrollWidth - window.innerWidth, window.innerWidth),
        pin: true,
        pinSpacing: true,
        scrub: 0.35,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          setActive(Math.round(self.progress * (slides.length - 1)));
        },
      },
    });

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const i = Number(dot.dataset.svcGo);
        const st = tween.scrollTrigger;
        if (!st || Number.isNaN(i)) return;
        const y = st.start + (st.end - st.start) * (i / (slides.length - 1));
        window.scrollTo({ top: y, behavior: 'smooth' });
      });
    });

    slides.forEach((slide, i) => {
      if (i === 0) return;
      const bits = slide.querySelectorAll('.svc-frame, .service-copy > *');
      if (!bits.length) return;
      gsap.from(bits, {
        y: 40,
        opacity: 0,
        stagger: 0.07,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: slide,
          containerAnimation: tween,
          start: 'left 75%',
          toggleActions: 'play none none reverse',
        },
      });
    });

    ScrollTrigger.refresh();
    setActive(0);
  }
})();
