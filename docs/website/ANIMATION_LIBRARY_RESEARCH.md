# Animation library research

**Source:** [FreeFrontend — 60+ GSAP ScrollTrigger Examples](https://freefrontend.com/scroll-trigger-js/)  
**Reviewed:** Pages 1–4 of the collection (the complete paginated set).  
**Date:** 18 August 2026  
**Rule:** This collection is a research library. It is not a feature checklist.

## How the collection was read

The listing spans four pages of GSAP / ScrollTrigger demos. Each demo was classified by interaction type, dependencies, production risk, and whether it belongs on a KITE project page (editorial, artwork-first, cream/sky, Outfit + Cormorant).

External branding, demo copy, and whole pens were not copied. Only reusable *patterns* were kept.

## Category map

| Category | Typical examples in the collection | Pattern |
| --- | --- | --- |
| Basic reveals | Scroll-Based Reveal Animations; GreenSock `gs_reveal` | `onEnter` fade / slide |
| Image reveal / wipe | Image reveal with overflow mask; gradient mask wipe; blinds | Clip or overflow wipe + opposite image travel |
| Parallax | GSAP ScrollTrigger Parallax; Smooth Parallax Gallery; jungle leaves | `scrub` + `yPercent` / layered x |
| Horizontal pin | Horizontal Scroll Section; Simple Horizontal Scroll; KITE services | `pin` + `x` / `xPercent` |
| Pin + transform | Pin + Scale website mockups; pinned split-screen mask | Pin section, scrub scale/clip |
| Typography | Staggered Text Scroll Reveal; SplitText parallax; text highlights | Line/word stagger or highlight scrub |
| Card / stack | ScrollTrigger List Expansion; movie stacking; cover flow | Pin + scale/y of stacked cards |
| SVG / path | SVG clip-path scroll; motion path; cicada genomics | DrawSVG / MotionPath |
| Smooth scroll | Lenis pages; ScrollSmoother galleries | Hijack native scroll |
| 3D / WebGL | Three.js fire; particle fields; 3D carousels | Three.js + camera scrub |
| Novelty / UI chrome | iOS time picker; Godzilla walk; custom cursor | One-off toys |

## Recommendation matrix

| Pattern | Source example (collection) | Dependencies | Complexity | Perf risk | Mobile | A11y | KITE? | Why |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Fade / directional reveal | Scroll-Based Reveal Animations | GSAP, ScrollTrigger | Low | Low | Yes | Low | **P0 Yes** | Default for text sections. Failsafe if JS missing. |
| Image wipe / overflow reveal | GreenSock-style image reveal | GSAP, ScrollTrigger | Low | Low | Yes | Low | **P0 Yes** | Artwork enters without covering type. |
| Clip-path reveal | SVG clip-path; hero clip | GSAP, ScrollTrigger | Medium | Medium | Yes (simpler inset) | Low | **P0 Yes** | Hero and full-bleed stills. Use `inset`/`circle`, not SVG clubs. |
| Image parallax | GSAP Parallax Effect | GSAP, ScrollTrigger | Low | Low if transform-only | Reduce on small screens | Medium (motion) | **P0 Yes** | Depth on photography. Honor reduced motion. |
| Scale / fade+scale | Pin + scale mockups | GSAP, ScrollTrigger | Low | Low | Yes | Low | **P0 Yes** | Heroes and website frames. |
| Staggered lines | Staggered Text Scroll Reveal | GSAP; SplitType optional | Medium | Medium if char-split | Yes | Medium | **P0 Yes** | Split by lines only — no per-character DOM explosion. |
| Text highlight | Scroll-Triggered Text Highlights | GSAP, ScrollTrigger | Low | Low | Yes | Low | **P1 Yes** | Story emphasis. CSS background-size, not paint. |
| Horizontal gallery | Horizontal Scroll Section; KITE services engine | GSAP, ScrollTrigger | Medium | Medium if over-pinned | Vertical fallback | Medium | **P0 Yes** | Galleries. Reuse existing pin factory. |
| Pin + scale (preview) | Pinned split-screen / mockup | GSAP, ScrollTrigger | Medium | Medium | Disable pin on narrow | Medium | **P1 Yes** | Website preview sections only. |
| Card stack | List Expansion; movie stacking | GSAP, ScrollTrigger | Medium | Medium | Vertical stack | Medium | **P1 Optional** | Case-study galleries. One pin per page max. |
| SVG path draw | SVG section transition | GSAP; DrawSVG is Club | Medium | Low | Yes | Low | **P2 Later** | Footer already has a dashoffset draw. Club plugin not required. |
| Motion path | Cicada / Godzilla | MotionPathPlugin | High | High | Poor | High | **No** | Spectacle, not portfolio storytelling. |
| Lenis / ScrollSmoother | Lenis GSAP pages | Lenis or Club ScrollSmoother | High | High in iframes | Poor | High | **No (now)** | Already rejected: it froze this preview. Do not add a second scroller. |
| Three.js / particles | On-scroll fire; particle fields | Three.js | High | Very high | Poor | High | **No** | Special campaigns only, never a CMS preset. |
| Infinite 3D carousel | Seamless infinite carousel | GSAP, Draggable | High | High | Poor | High | **No** | Breaks artwork reading. |
| Custom cursor / blend | “10 popular UI effects” | Extra JS | Medium | Medium | No | High | **No** | Not KITE, not accessible. |
| Audio / destroy toys | Godzilla; slideshow SFX | Audio APIs | High | Medium | No | High | **No** | Novelty. |
| Draggable timelines | Draggable + ScrollTrigger | Draggable | Medium | Medium | Mixed | Medium | **No as preset** | Optional later for studio tools only. |

## Selected KITE presets (12)

A small engine, not sixty demos:

1. `none` — static, always available  
2. `fade-up`  
3. `fade-left`  
4. `fade-right`  
5. `scale-in`  
6. `image-wipe`  
7. `image-clip`  
8. `image-parallax`  
9. `text-stagger`  
10. `text-highlight`  
11. `horizontal-gallery`  
12. `pin-scale`

These cover the three example project narratives in the brief (cinematic / editorial / minimal) without new dependencies beyond GSAP + ScrollTrigger already on the site.

## Explicitly not implemented

Three.js, MotionPath showpieces, Lenis/ScrollSmoother, Club plugins (SplitText, DrawSVG, Inertia), infinite 3D carousels, custom cursors, audio, and any demo that ships another brand’s visual system.

## Dependencies we will use

| Library | Role | Already on KITE? |
| --- | --- | --- |
| GSAP 3.12 | Tweens | Yes |
| ScrollTrigger | Pin, scrub, enter | Yes |
| Native CSS | Fallback visibility | Yes |

No Lenis. No SplitText. Line stagger uses a tiny, local splitter.

## Performance and a11y stance

- Animate `transform` and `opacity` (and `clip-path` for two presets).  
- Never require animation for content to exist in the DOM.  
- `prefers-reduced-motion: reduce` → skip parallax, pin, scrub, stagger; keep a short fade or nothing.  
- Mobile: horizontal and pin presets fall back to vertical fade-up.  
- If GSAP fails to load, sections stay fully readable.
