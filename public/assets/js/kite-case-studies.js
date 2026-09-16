/**
 * KITE Case Studies — Skiper16 card stack scroll (Laravel / vanilla JS port).
 *
 * The interaction pattern of Skiper UI "Skiper16 — Card Stack Scroll", rebuilt for
 * Blade/vanilla-JS: sticky viewport + absolutely stacked cards + scroll-scrubbed
 * scale/translate transforms.
 *
 * How it works
 * ------------
 *  #case-studies (.cs16-section) is tall: it supplies the scroll distance
 *  (100vh + one step per card transition + a settle zone).
 *  .cs16-sticky is `position: sticky; top: 0; height: 100vh`, so it parks in the
 *  viewport while the user scrolls through that distance.
 *  Every card lives absolutely inside .cs16-stack. A single scroll progress value
 *  (0 → 1) is converted to a "step" (0 → cards-1) and each card is transformed by
 *  its depth = index - step:
 *
 *    depth  0     → active card: full size, fully opaque
 *    depth  < 0   → leaving: lifts up, scales down, fades out (scrubbed)
 *    depth  > 0   → waiting behind: slightly smaller, nudged down, dimmed
 *
 * Guarantees
 *  - 100% scroll-linked. No autoplay, no timers, no next/prev, no snapping.
 *  - Stop scrolling → the cards freeze at exactly the current progress.
 *  - Scrolling up reverses the sequence 1:1 (Voyage → Paccino's → Tanweer).
 *  - When the last card has settled, the sticky viewport releases and the page
 *    continues scrolling normally into the next section.
 *  - Only `transform`, `opacity` and `filter` are animated (no layout thrash).
 *  - rAF-throttled, and idle (no rAF loop) while the section is off-screen.
 */
(() => {
  const section = document.querySelector('[data-cs16-section]');
  if (!section) return;

  const sticky = section.querySelector('[data-cs16-sticky]');
  const stack = section.querySelector('[data-cs16-stack]');
  const cards = Array.prototype.slice.call(section.querySelectorAll('[data-cs16-card]'));
  const action = section.querySelector('[data-cs16-action]');
  if (!sticky || !stack || cards.length < 2) return;

  const reduceMotion =
    typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canObserve = typeof IntersectionObserver === 'function';

  if (reduceMotion) {
    section.classList.add('is-static');
    return;
  }

  const COUNT = cards.length;
  const TRANSITIONS = COUNT - 1; // 3 cards → 2 scrubbed transitions
  const SETTLE = 0.12; // last slice of the scroll: hold on the final card before release
  const EXIT_TRAVEL = 1.18; // leaving card lifts this × stack height
  const EXIT_SCALE = 0.1; // leaving card shrinks by this much
  const PEEK = 0.055; // downward offset per waiting card (× stack height)
  const DEPTH_SCALE = 0.045; // scale reduction per waiting card
  const DEPTH_FADE = 0.14; // opacity reduction per waiting card
  const DEPTH_DIM = 0.05; // brightness reduction per waiting card

  let travel = 1; // scrollable distance inside the section
  let stackHeight = stack.offsetHeight || 1;
  let sectionTop = 0; // document offset of the section
  let progress = -1;
  let frame = null;
  let inView = true;
  let resizeTimer = null;
  let pinMode = 'sticky'; // 'sticky' (native) or 'pinned' (JS-driven fallback)

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const smoothstep = (t) => t * t * (3 - 2 * t);
  const scrollY = () => window.pageYOffset || window.scrollY || 0;

  function measure() {
    travel = Math.max(section.offsetHeight - window.innerHeight, 1);
    stackHeight = stack.offsetHeight || 1;
    sectionTop = section.getBoundingClientRect().top + scrollY();
  }

  /**
   * Fallback for pages where an ancestor is a scroll container (for example
   * `html, body { overflow-x: hidden }` in kite-intro.css), which silently
   * disables `position: sticky`. In that case the sticky element is absolutely
   * positioned inside the section and translated to follow the viewport.
   */
  function applyPin(p) {
    if (pinMode === 'pinned') {
      const offset = clamp(scrollY() - sectionTop, 0, Math.max(section.offsetHeight - sticky.offsetHeight, 0));
      sticky.style.transform = 'translate3d(0,' + offset.toFixed(2) + 'px,0)';
      return;
    }

    // While inside the pinned range the viewport must rest at top: 0.
    if (p > 0.03 && p < 0.97 && Math.abs(sticky.getBoundingClientRect().top) > 4) {
      pinMode = 'pinned';
      section.classList.add('cs16-pinned');
      measure();
      applyPin(p);
    }
  }

  function readProgress() {
    const rect = section.getBoundingClientRect();
    return clamp(-rect.top / travel, 0, 1);
  }

  function paint(p) {
    const animated = clamp(p / (1 - SETTLE), 0, 1);
    const step = animated * TRANSITIONS;

    // Only the card closest to the front is interactive, so a click in the
    // middle of a transition always hits the card the user actually sees.
    const dominant = Math.round(step);

    for (let i = 0; i < COUNT; i += 1) {
      const card = cards[i];
      const depth = i - step;
      let y = 0;
      let scale = 1;
      let opacity = 1;
      let dim = 1;

      if (depth < 0) {
        // Leaving the stack: lift up + scale down + fade out.
        const t = smoothstep(clamp(-depth, 0, 1));
        y = -t * stackHeight * EXIT_TRAVEL;
        scale = 1 - EXIT_SCALE * t;
        opacity = 1 - t;
      } else {
        // Waiting in the stack behind the active card.
        const d = Math.min(depth, TRANSITIONS);
        y = d * stackHeight * PEEK;
        scale = Math.max(1 - DEPTH_SCALE * d, 0.8);
        opacity = Math.max(1 - DEPTH_FADE * d, 0.4);
        dim = Math.max(1 - DEPTH_DIM * d, 0.82);
      }

      card.style.transform = 'translate3d(0,' + y.toFixed(2) + 'px,0) scale(' + scale.toFixed(4) + ')';
      card.style.opacity = opacity.toFixed(3);
      card.style.filter = depth > 0 ? 'brightness(' + dim.toFixed(3) + ')' : 'none';

      const isActive = i === dominant;
      card.style.pointerEvents = isActive ? 'auto' : 'none';
      card.style.visibility = opacity < 0.02 ? 'hidden' : 'visible';
      card.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    }

    if (action) {
      // "View All Case Studies" fades in as Voyage takes over.
      const a = clamp((p - (1 - SETTLE - 0.18)) / 0.18, 0, 1);
      action.style.opacity = a.toFixed(3);
      action.style.transform = 'translate3d(0,' + ((1 - a) * 14).toFixed(2) + 'px,0)';
    }
  }

  function run() {
    frame = null;
    if (!inView) return;
    const p = readProgress();
    if (p === progress) return; // nothing moved → no repaint, no extra rAF
    progress = p;
    applyPin(p);
    paint(p);
  }

  function schedule() {
    if (frame === null) frame = window.requestAnimationFrame(run);
  }

  function onResize() {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      measure();
      progress = -1;
      schedule();
    }, 120);
  }

  // Initial state: the stack is already laid out, so paint where we are now.
  measure();
  progress = readProgress();
  paint(progress);
  applyPin(progress);

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);

  if (canObserve) {
    const io = new IntersectionObserver(
      (entries) => {
        for (let i = 0; i < entries.length; i += 1) {
          if (entries[i].isIntersecting) inView = true;
          else if (entries.length === 1) inView = false;
        }
        if (inView) {
          measure();
          progress = -1;
          schedule();
        }
      },
      { rootMargin: '25% 0px 25% 0px', threshold: 0 }
    );
    io.observe(section);
  }

  // Images/fonts can change the stack height after first paint.
  window.addEventListener('load', () => {
    measure();
    progress = -1;
    schedule();
  });
})();
