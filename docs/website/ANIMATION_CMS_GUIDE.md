# CMS guide — Creative Project Builder

This is not a JavaScript editor. You pick a **section type** and an **animation preset**. The public site does the rest.

## Sign in

`/studio` → `studio@kiteagency-eg.com` / `kite-studio`  
Not AgencyOS.

## Build a project

1. **Projects → Create / Edit**  
2. Fill title, client, service, industry, cover.  
3. **Project sections** — Add section, choose type, paste media URLs from Media, write text.  
4. Choose an **Animation** from the list. Adjust intensity / duration if needed.  
5. Set page theme: Default, Cinematic, Editorial, Minimal.  
6. **Save**.  
7. **Preview** (works for drafts).  
8. Set status to **Published** when the page should be public.

`/project/{slug}` is 404 until published. Preview stays behind Studio login.

## Section types

Hero, Text, Full-width image, Image + text, Two images, Three grid, Gallery, Video, Quote, Project info, Website preview, Before/after, Full visual, Story, Closing CTA, Related projects.

## Animation picker

Each section has:

- Preset  
- Intensity  
- Duration  
- Delay  
- Direction (where the preset uses it)  
- Scrub on/off (ignored by presets that do not scrub)

Preview on `/studio/animations` uses the same engine as the live site.

## Website projects

If the project has a website URL:

- Add a **Website preview** section  
- Recommended preset: `pin-scale`  
- The page always shows **Open website**  
- If the iframe is blocked, the section still works

## Rules

- Do not invent results, metrics, or dates. Leave those fields empty.  
- Do not paste JavaScript into any field. It will not run.  
- Reduced-motion visitors always get a readable static (or simple fade) page.
