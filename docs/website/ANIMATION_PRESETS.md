# Animation presets

Twelve registered presets. All are implemented in `public/assets/js/kite-presets.js`.

| Id | Category | What it does | Scrub? | Mobile | Reduced motion |
| --- | --- | --- | --- | --- | --- |
| `none` | Basic | No motion | — | Static | Static |
| `fade-up` | Basic | Opacity + translateY | No | Yes | Instant show |
| `fade-left` | Basic | From left | No | Yes | Instant show |
| `fade-right` | Basic | From right | No | Yes | Instant show |
| `scale-in` | Basic | Scale 0.92 → 1 + fade | No | Yes | Instant show |
| `image-wipe` | Image | Overflow wipe, image counter-travels | No | Yes | Instant show |
| `image-clip` | Image | `clip-path: inset` opens | Optional | Yes | Instant show |
| `image-parallax` | Image | Image `yPercent` vs scroll | Yes | Reduced travel | Off |
| `text-stagger` | Type | Lines fade up in sequence | No | Yes | Instant show |
| `text-highlight` | Type | Mark fills on enter | Optional | Yes | Solid mark |
| `horizontal-gallery` | Horizontal | Pin + translateX | Yes | Falls back to fade-up | Off |
| `pin-scale` | Pin | Pin frame, scale 0.92 → 1 | Yes | Falls back to scale-in | Off |

## Suggested pairing

| Section type | Default preset |
| --- | --- |
| Hero | `scale-in` or `image-clip` |
| Story / text | `text-stagger` |
| Full image | `image-wipe` or `image-parallax` |
| Gallery | `horizontal-gallery` or `fade-up` |
| Website preview | `pin-scale` |
| Quote | `fade-up` |
| Closing CTA | `fade-up` |

## Safe config ranges

- `intensity`: 0.1–1.0  
- `duration`: 0.2–2.5s  
- `delay`: 0–1.5s  
- `ease`: `none` | `power2.out` | `power3.out` | `expo.out` | `sine.out`  
- `start` / `end`: whitelist of ScrollTrigger position strings only  

## Testing checklist (per preset)

- [ ] Desktop Chrome  
- [ ] Narrow / mobile fallback  
- [ ] `prefers-reduced-motion`  
- [ ] Missing image  
- [ ] Resize  
- [ ] No console errors  
- [ ] Content visible if GSAP blocked  
