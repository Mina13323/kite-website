# Animation system architecture

## Flow

```
CMS user
  → Project
    → Sections[]
      → type + content + media
      → animation { preset, start, end, scrub, intensity, duration, delay, ease, direction }
  → Database / cms.json
  → Public renderer (HTML + data-kite-anim + data-kite-config)
  → kite-presets.js registry
  → GSAP / ScrollTrigger / CSS
  → Browser
```

The CMS never stores JavaScript. It stores a **preset id** and a **safe config object**.

## Layers

| Layer | Owns |
| --- | --- |
| Studio CMS | Section list, preset picker, sliders, preview link |
| `animation-presets.cjs` | Allowed ids and allowed config values |
| Public HTML | Semantic sections; `data-kite-*` attributes only |
| `kite-presets.js` | Registry: id → factory |
| CSS | Layout, clip helpers, reduced-motion fallbacks |

## Config schema

```json
{
  "preset": "image-parallax",
  "start": "top 80%",
  "end": "bottom top",
  "scrub": true,
  "intensity": 0.35,
  "duration": 1.2,
  "delay": 0,
  "ease": "power3.out",
  "direction": "up"
}
```

Unknown presets become `fade-up`. Unknown eases become `power3.out`. Numbers are clamped. This sanitizer runs on **save** and again in the browser.

## Project-level settings

```json
{
  "intensity": "medium",
  "theme": "default",
  "respect_reduced_motion": true
}
```

- `intensity`: `low` | `medium` | `high` — scales travel distance  
- `theme`: `default` | `cinematic` | `editorial` | `minimal` — only tweaks defaults, not CSS branding  
- Reduced motion is always respected when the OS asks, even if the toggle is off

## Section types

`hero`, `text`, `full_image`, `image_text`, `two_image`, `three_grid`, `gallery`, `video`, `quote`, `info`, `website_preview`, `before_after`, `full_visual`, `story`, `cta`, `related`

New types can be added later without changing the animation registry.

## Preview

`/studio/preview/project/{slug}` uses the **same** `kite-presets.js` as the public page. Drafts are visible only with a Studio session.

`/studio/animations` lists presets and runs a live demo of the selected one.

## Failsafe

1. HTML is complete without JS.  
2. The engine only hides elements *after* GSAP is confirmed present and reduced-motion is off.  
3. One factory per section. Horizontal and pin presets are skipped below 800px width.  
4. No `eval`, no Function constructor, no inline event handlers from CMS strings.

## Interaction with existing KITE scroll

Homepage services already use a dedicated pin factory (`kite-services.js`). Project pages use the shared registry. They do not share ScrollTrigger instances. Do not add Lenis.
