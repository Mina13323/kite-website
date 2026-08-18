// ================= INIT =================
const counterEl = document.getElementById("counter");
const preloaderEl = document.getElementById("preloader");
const heroEl = document.getElementById("hero");
const heroCopyEl = document.querySelector(".hero-copy");
const sunWrapperEl = document.querySelector(".sun-wrapper");
const brandRingEl = document.querySelector(".brand-ring");
const houseEls = gsap.utils.toArray(".house");
const cloudLeftEls = gsap.utils.toArray(".cloud-1, .cloud-2, .cloud-3");
const cloudRightEls = gsap.utils.toArray(".cloud-4, .cloud-5, .cloud-6");
const houseLeftEls = houseEls.slice(0, Math.ceil(houseEls.length / 2));
const houseRightEls = houseEls.slice(Math.ceil(houseEls.length / 2));
let progress = { value: 0 };
let cinematicStarted = false;

// ================= MAIN TIMELINE =================
const tl = gsap.timeline({
  defaults: {
    ease: "expo.out",
  },
});

gsap.set(heroEl, { opacity: 0 });
gsap.set(heroCopyEl, {
  opacity: 0,
  y: 28,
});
gsap.set(brandRingEl, {
  opacity: 0,
  scale: 0.94,
  transformOrigin: "50% 50%",
});
gsap.set(preloaderEl, {
  transformOrigin: "50% 50%",
});

// ================= CLOUD FLOAT (SUBTLE ONLY) =================
gsap.to(".cloud", {
  y: -12,
  duration: 7,
  ease: "sine.inOut",
  stagger: 0.8,
  repeat: -1,
  yoyo: true,
});

// ================= CLOUDS (SLIDE IN) =================
tl.from(
  ".cloud-1, .cloud-2, .cloud-3",
  {
    y: 36,
    opacity: 0,
    duration: 1.8,
    stagger: 0.15,
  },
  0.15,
)
  .from(
    ".cloud-4, .cloud-5, .cloud-6",
    {
      y: 36,
      opacity: 0,
      duration: 1.8,
      stagger: 0.15,
    },
    0.15,
  )
  .from(
    ".sun-wrapper, .counter",
    {
      y: -100,
      opacity: 0,
      duration: 1.5,
      ease: "expo.out",
      stagger: 0.2,
    },
    0.2,
  );

// ================= UI PULSES (POST-ENTRANCE) =================
gsap.to(".counter", {
  scale: 1.05,
  duration: 1,
  repeat: -1,
  yoyo: true,
  ease: "sine.inOut",
  delay: 2, // Wait for entrance
});

// ================= HOUSES (SMOOTH RISE) =================
tl.from(
  ".house",
  {
    y: 150,
    opacity: 0,
    duration: 1.6,
    stagger: {
      each: 0.1,
      from: "center",
    },
  },
  0.45,
)

  // ================= COUNTER (SYNCED) =================
  .to(
    progress,
    {
      value: 100,
      duration: 2.5,
      ease: "power1.out",
      onUpdate: () => {
        counterEl.innerText = Math.floor(progress.value) + "%";
      },
      onComplete: startCinematicTransition,
    },
    "<",
  ); // sync with houses

function startCinematicTransition() {
  if (cinematicStarted) {
    return;
  }

  cinematicStarted = true;
  gsap.killTweensOf(".counter");
  gsap.killTweensOf(".sun-glow");
  gsap.killTweensOf(".cloud");
  gsap.killTweensOf(brandRingEl);

  // Prepare RING DRAW Text
  const ringTextString = "· WE CREATE BRANDS · SHOWS AND KITES ";
  const chars = ringTextString.split("");
  brandRingEl.innerHTML = "";
  const anglePerChar = 360 / chars.length;
  chars.forEach((char, i) => {
    const span = document.createElement("span");
    span.innerHTML = char === " " ? "&nbsp;" : char;
    span.className = "ring-char";
    // 12 o'clock relative positioning
    span.style.transform = `translate(-50%, -50%) rotate(${i * anglePerChar}deg) translateY(-80px)`;
    brandRingEl.appendChild(span);
  });

  const uiBounds = document.querySelector(".ui").getBoundingClientRect();
  const uiCenterY = uiBounds.top;
  const targetY = 30;
  const isMobile = window.innerWidth <= 640;

  const tlTransition = gsap.timeline();

  // BEAT 1 & 2: SMOOTH GLIDE DROP
  const dropStart = 0.1;
  const splitTime = 0.5;

  tlTransition
    .set(".counter, .sun-glow", { opacity: 0 }, dropStart)
    .add(
      () => document.querySelector(".circle").classList.add("no-bg"),
      dropStart,
    )
    .set(brandRingEl, { opacity: 1, scale: 1, rotate: 0 }, dropStart)
    .to(
      sunWrapperEl,
      {
        y: targetY,
        duration: 2.0, // Slow, relaxed glide
        ease: "power3.inOut",
      },
      dropStart,
    );

  // BEAT 3: SPLIT
  tlTransition
    .to(
      houseLeftEls,
      {
        x: isMobile ? "-=10vw" : "-=28vw",
        duration: 1.8,
        ease: "power3.inOut",
        stagger: 0,
      },
      splitTime,
    )
    .to(
      houseRightEls,
      {
        x: isMobile ? "+=6vw" : "+=22vw",
        duration: 1.8,
        ease: "power3.inOut",
        stagger: 0,
      },
      splitTime,
    )
    .to(
      cloudLeftEls,
      {
        x: isMobile ? "-=2vw" : "-=10vw",
        duration: 1.8,
        ease: "power3.inOut",
      },
      splitTime + 0.1,
    )
    .to(
      cloudRightEls,
      {
        x: isMobile ? "+=2vw" : "+=10vw",
        duration: 1.8,
        ease: "power3.inOut",
      },
      splitTime + 0.1,
    );

  // BEAT 4: RING DRAW
  const drawStart = dropStart + 1.8;
  tlTransition.fromTo(
    ".ring-char",
    { opacity: 0, scale: 0.6 },
    {
      opacity: 1,
      scale: 1,
      duration: 0.6,
      stagger: {
        amount: 1.0,
        from: "start",
      },
      ease: "power2.out",
    },
    drawStart,
  );

  // Reveal hero container
  tlTransition
    .to(heroEl, { opacity: 1, duration: 2.0, ease: "power2.inOut" }, splitTime)
    .to(heroCopyEl, { opacity: 1, y: 0, duration: 0.1 }, drawStart + 0.2);

  // BEAT 5: STAGGERED REVEAL
  const heroRevealStart = drawStart + 0.6;

  tlTransition
    .to(
      "#hero h1",
      { opacity: 1, duration: 0.6, ease: "power2.in" },
      heroRevealStart,
    )
    .to(
      "#hero p",
      { opacity: 1, duration: 0.6, ease: "power2.in" },
      heroRevealStart + 0.2,
    )
    .to(
      ".hero-actions",
      { opacity: 1, duration: 0.6, ease: "power2.in" },
      heroRevealStart + 0.4,
    )
    .to(
      ".site-navbar",
      {
        opacity: 1,
        y: 0,
        pointerEvents: "auto",
        duration: 0.8,
        ease: "power2.out",
      },
      heroRevealStart + 0.6,
    )
    .set(preloaderEl, { pointerEvents: "none" }, heroRevealStart + 0.8);

  // BEAT 6: INFINITE SPIN & SCROLL INIT
  tlTransition.call(
    () => {
      gsap.to(brandRingEl, {
        rotate: 360,
        duration: 9,
        ease: "none",
        repeat: -1,
      });
      heroEl.style.pointerEvents = "auto";
      document.documentElement.classList.add("scroll-unlocked");
      document.body.classList.add("scroll-unlocked");
      preloaderEl.classList.add("is-scrollable");

      initScroll();
    },
    undefined,
    drawStart + 1.0,
  );
}

function initScroll() {
  const lenis = new Lenis({
    smooth: true,
    lerp: 0.05, // Lower lerp means silkier, slower global scroll momentum
  });

  // We only need gsap.ticker. The dual RAF call creates severe glitching with Lenis.
  gsap.registerPlugin(ScrollTrigger);
  
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // HERO SCROLL EFFECT
  gsap.to("#hero", {
    opacity: 0.7,
    scale: 0.96,
    scrollTrigger: {
      trigger: "#preloader",
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });

  gsap.to(".scene-bg, .cloud, .skyline", {
    opacity: 0,
    scrollTrigger: {
      trigger: "#preloader",
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });

  // PHASE 2 — HORIZONTAL EDITORIAL STORYTELLING
  const containers = gsap.utils.toArray(".timeline-cols-container");
  const navItems = gsap.utils.toArray(".nav-item");

  containers.forEach((container) => {
    const timelineCols = container.querySelector(".timeline-cols");
    const slides = gsap.utils.toArray(container.querySelectorAll(".timeline-col"));

    // Only apply horizontal slide logic if there's more than 1 slide
    if (slides.length > 1) {
      let scrollTween = gsap.to(timelineCols, {
        x: () => -(timelineCols.scrollWidth - window.innerWidth),
        ease: "none",
        scrollTrigger: {
          trigger: container,
          pin: true,
          scrub: 0.1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          end: () => "+=" + (timelineCols.scrollWidth)
        }
      });

      // ——— SLIDE-BY-SLIDE CONTENT ANIMATIONS ———
      slides.forEach((slide) => {
        // Headline animations
        const headlines = slide.querySelectorAll(".slide-headline");
        headlines.forEach((headline) => {
          gsap.from(headline, {
            y: 60,
            opacity: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: slide,
              containerAnimation: scrollTween,
              start: "left 70%",
              toggleActions: "play none none reverse"
            }
          });
        });

        // Year label
        const year = slide.querySelector(".slide-year");
        if (year) {
          gsap.from(year, {
            y: -20,
            opacity: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: slide,
              containerAnimation: scrollTween,
              start: "left 75%",
              toggleActions: "play none none reverse"
            }
          });
        }

        // Gallery images
        const galleryImgs = slide.querySelectorAll(".gallery-img");
        if (galleryImgs.length) {
          gsap.from(galleryImgs, {
            y: 80,
            opacity: 0,
            rotation: -4,
            stagger: 0.15,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: slide,
              containerAnimation: scrollTween,
              start: "left 60%",
              toggleActions: "play none none reverse"
            }
          });
        }

        // Hero images
        const heroImgs = slide.querySelectorAll(".slide-hero-img");
        heroImgs.forEach((img) => {
          gsap.from(img, {
            scale: 1.15,
            opacity: 0,
            duration: 1.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: slide,
              containerAnimation: scrollTween,
              start: "left 65%",
              toggleActions: "play none none reverse"
            }
          });
        });

        // Body text
        const bodies = slide.querySelectorAll(".slide-body");
        bodies.forEach((body) => {
          gsap.from(body, {
            y: 40,
            opacity: 0,
            duration: 1,
            delay: 0.3,
            ease: "power2.out",
            scrollTrigger: {
              trigger: slide,
              containerAnimation: scrollTween,
              start: "left 55%",
              toggleActions: "play none none reverse"
            }
          });
        });

        // Circle images
        const circles = slide.querySelectorAll(".circle-img");
        if (circles.length) {
          gsap.from(circles, {
            scale: 0,
            rotation: 12,
            stagger: 0.2,
            duration: 1,
            ease: "back.out(1.4)",
            scrollTrigger: {
              trigger: slide,
              containerAnimation: scrollTween,
              start: "left 60%",
              toggleActions: "play none none reverse"
            }
          });
        }

        // Book image
        const book = slide.querySelector(".slide-book");
        if (book) {
          gsap.from(book, {
            y: 100,
            opacity: 0,
            rotation: -5,
            duration: 1.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: slide,
              containerAnimation: scrollTween,
              start: "left 55%",
              toggleActions: "play none none reverse"
            }
          });
        }

        // Quote text
        const quote = slide.querySelector(".slide-quote");
        if (quote) {
          gsap.from(quote, {
            y: 30,
            opacity: 0,
            duration: 0.8,
            delay: 0.4,
            ease: "power2.out",
            scrollTrigger: {
              trigger: slide,
              containerAnimation: scrollTween,
              start: "left 50%",
              toggleActions: "play none none reverse"
            }
          });
        }

        // Divider line
        const divider = slide.querySelector(".slide-divider");
        if (divider) {
          gsap.from(divider, {
            scaleX: 0,
            transformOrigin: "left center",
            duration: 0.8,
            ease: "power2.inOut",
            scrollTrigger: {
              trigger: slide,
              containerAnimation: scrollTween,
              start: "left 60%",
              toggleActions: "play none none reverse"
            }
          });
        }

        // SVG Marker Path Drawing
        const paths = slide.querySelectorAll(".draw-path");
        if (paths.length) {
          paths.forEach((path) => {
            gsap.to(path, {
              strokeDashoffset: 0,
              duration: 1.5,
              ease: "power2.out",
              scrollTrigger: {
                trigger: slide,
                containerAnimation: scrollTween,
                start: "left 55%",
                toggleActions: "play none none reverse"
              }
            });
          });
        }
      });
    }
  });

  // ——— NAV CLICK → HORIZONTAL SCROLL POSITION ———
  navItems.forEach((nav, i) => {
    nav.addEventListener("click", () => {
      const containerTop = document.querySelector(".timeline-cols-container").offsetTop;
      gsap.to(window, {
        scrollTo: { y: containerTop, offsetY: 0 },
        duration: 1.2,
        ease: "power3.inOut",
      });
    });
  });

  // 'View work' button update — Scroll to Overview
  const viewWorkBtn = document.querySelector(".btn-primary");
  if (viewWorkBtn) {
    viewWorkBtn.addEventListener("click", (e) => {
      e.preventDefault();
      gsap.to(window, {
        scrollTo: { y: ".timeline-nav", offsetY: 0 },
        duration: 1.2,
        ease: "power3.inOut",
      });
    });
  }
}

// Reset scroll on reload
window.onbeforeunload = function () {
  window.scrollTo(0, 0);
};

window.addEventListener("load", () => {
  // Use a small timeout to ensure DOM is ready
  setTimeout(() => {
    // Already handled by startCinematicTransition completion
  }, 100);
});
