/**
 * KITE Case Studies — Skiper16 Card Stack Scroll
 *
 * Interaction Behavior:
 * 1. The section pins the 100vh viewport (.cs-viewport) inside #case-studies.
 * 2. Card 1 (TANWEER) is the active, dominant card in front (z-index: 3).
 *    Card 2 (PACCINO'S) and Card 3 (VOYAGE) reside behind it in the stack.
 * 3. As the user scrolls down, TANWEER smoothly scales/transforms away
 *    (lifting upward with scale reduction and fade) to reveal PACCINO'S.
 * 4. PACCINO'S becomes the dominant card (scale: 1, opacity: 1).
 * 5. On continued scroll, PACCINO'S transforms away to reveal VOYAGE.
 * 6. VOYAGE becomes dominant, and the "View All Case Studies" pill button appears.
 * 7. When the sequence finishes, the sticky section releases and normal scroll continues.
 * 8. Scrolling upward reverses the animation 1:1.
 * 9. The animation is 100% scrubbed to scroll progress (no autoplay, no timers).
 */
(() => {
  function initSkiperCaseStudies() {
    const section = document.getElementById('case-studies');
    if (!section) return;

    if (!window.gsap || !window.ScrollTrigger) {
      setTimeout(initSkiperCaseStudies, 100);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const viewport = section.querySelector('.cs-viewport');
    const card1 = section.querySelector('.cs-card-1');
    const card2 = section.querySelector('.cs-card-2');
    const card3 = section.querySelector('.cs-card-3');
    const actionWrap = section.querySelector('.cs-action-wrap');

    if (!viewport || !card1 || !card2 || !card3) return;

    // Clean up any existing ScrollTrigger instances for this section
    ScrollTrigger.getAll().forEach((st) => {
      if (st.vars && (st.vars.trigger === section || st.vars.pin === viewport || st.vars.pin === section)) {
        st.kill();
      }
    });

    // Ensure pin spacer matches blue background
    function styleSpacer(self) {
      if (self && self.spacer) {
        self.spacer.style.backgroundColor = '#78CBE3';
      }
    }

    // Initial state:
    // Card 1 (Tanweer): Front, fully active, 100% visible
    gsap.set(card1, {
      xPercent: 0,
      yPercent: 0,
      scale: 1,
      opacity: 1,
      filter: 'brightness(1)',
      zIndex: 3,
      transformOrigin: 'center top',
      force3D: true,
    });

    // Card 2 (Paccino's): Resting directly behind Card 1 in the stack
    gsap.set(card2, {
      xPercent: 0,
      yPercent: 0,
      scale: 0.95,
      opacity: 0.75,
      filter: 'brightness(0.92)',
      zIndex: 2,
      transformOrigin: 'center top',
      force3D: true,
    });

    // Card 3 (Voyage): Resting directly behind Card 2 in the stack
    gsap.set(card3, {
      xPercent: 0,
      yPercent: 0,
      scale: 0.90,
      opacity: 0.45,
      filter: 'brightness(0.82)',
      zIndex: 1,
      transformOrigin: 'center top',
      force3D: true,
    });

    if (actionWrap) {
      gsap.set(actionWrap, { opacity: 0, y: 15 });
    }

    // Scroll distance = enough travel for 2 full, deliberate card transitions
    const scrollDistance = Math.max(window.innerHeight * 2.2, 1700);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        pin: viewport,
        start: 'top top',
        end: () => `+=${scrollDistance}`,
        scrub: 0.7,
        anticipatePin: 1,
        pinSpacing: true,
        invalidateOnRefresh: true,
        onRefreshInit: styleSpacer,
        onRefresh: styleSpacer,
      },
    });

    // ─────────────────────────────────────────────────────────────
    // TRANSITION 1: Tanweer scales/transforms away -> reveals Paccino's
    // (Timeline duration: 1.0)
    // ─────────────────────────────────────────────────────────────
    tl.to(card1, {
      yPercent: -105,
      scale: 0.90,
      opacity: 0,
      ease: 'power1.inOut',
      duration: 1,
    }, 0)
    .to(card2, {
      scale: 1,
      opacity: 1,
      filter: 'brightness(1)',
      ease: 'power1.inOut',
      duration: 1,
    }, 0)
    .to(card3, {
      scale: 0.95,
      opacity: 0.75,
      filter: 'brightness(0.92)',
      ease: 'power1.inOut',
      duration: 1,
    }, 0)

    // Reading hold on Paccino's
    .to({}, { duration: 0.25 })

    // ─────────────────────────────────────────────────────────────
    // TRANSITION 2: Paccino's scales/transforms away -> reveals Voyage
    // (Timeline duration: 1.0)
    // ─────────────────────────────────────────────────────────────
    .to(card2, {
      yPercent: -105,
      scale: 0.90,
      opacity: 0,
      ease: 'power1.inOut',
      duration: 1,
    })
    .to(card3, {
      scale: 1,
      opacity: 1,
      filter: 'brightness(1)',
      ease: 'power1.inOut',
      duration: 1,
    }, '<');

    // Reveal "View All Case Studies" button under Voyage
    if (actionWrap) {
      tl.to(actionWrap, {
        opacity: 1,
        y: 0,
        ease: 'power1.out',
        duration: 0.4,
      }, '-=0.35');
    }

    // Final settle hold before unpinning
    tl.to({}, { duration: 0.2 });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSkiperCaseStudies);
  } else {
    initSkiperCaseStudies();
  }

  window.addEventListener('load', () => {
    if (window.ScrollTrigger) {
      ScrollTrigger.refresh();
    }
  });
})();
