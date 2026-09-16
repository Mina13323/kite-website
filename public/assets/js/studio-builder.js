(() => {
  const TYPES = [
    ['hero', 'Project hero'], ['text', 'Text introduction'], ['story', 'Text story'],
    ['full_image', 'Full width image'], ['full_visual', 'Full screen visual'],
    ['image_text', 'Image + text'], ['two_image', 'Two image split'],
    ['three_grid', 'Three image grid'], ['gallery', 'Gallery'],
    ['before_after', 'Before / after'], ['video', 'Video'], ['quote', 'Quote'],
    ['info', 'Project information'], ['website_preview', 'Website preview'],
    ['cta', 'Closing CTA'], ['related', 'Related projects'],
  ];
  const PRESETS = [
    ['fade-up', 'Fade up'], ['fade-left', 'Fade left'], ['fade-right', 'Fade right'],
    ['scale-in', 'Scale in'], ['image-wipe', 'Image wipe'], ['image-clip', 'Image clip'],
    ['image-parallax', 'Image parallax'], ['text-stagger', 'Staggered lines'],
    ['text-highlight', 'Text highlight'], ['horizontal-gallery', 'Horizontal gallery'],
    ['pin-scale', 'Pin + scale'], ['none', 'None'],
  ];

  const root = document.getElementById('section-builder');
  const field = document.getElementById('sections-json');
  const addBtn = document.getElementById('add-section');
  if (!root || !field) return;

  let sections = [];
  try { sections = JSON.parse(field.value || '[]'); } catch { sections = []; }
  if (!Array.isArray(sections)) sections = [];

  function uid() { return `sec-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`; }

  function empty() {
    return {
      id: uid(),
      type: 'text',
      heading: '',
      text: '',
      media: [],
      video_url: '',
      animation: { preset: 'fade-up', start: 'top 80%', end: 'bottom top', scrub: false, intensity: 0.35, duration: 1, delay: 0, ease: 'power3.out', direction: 'up' },
    };
  }

  function opt(list, value) {
    return list.map(([id, label]) => `<option value="${id}" ${value === id ? 'selected' : ''}>${label}</option>`).join('');
  }

  function sync() {
    field.value = JSON.stringify(sections);
  }

  function readCard(card, i) {
    const a = sections[i].animation || {};
    sections[i] = {
      id: sections[i].id || uid(),
      type: card.querySelector('[data-f=type]').value,
      heading: card.querySelector('[data-f=heading]').value,
      text: card.querySelector('[data-f=text]').value,
      media: card.querySelector('[data-f=media]').value.split('\n').map((s) => s.trim()).filter(Boolean),
      video_url: card.querySelector('[data-f=video]').value,
      animation: {
        preset: card.querySelector('[data-f=preset]').value,
        start: card.querySelector('[data-f=start]').value,
        end: a.end || 'bottom top',
        scrub: card.querySelector('[data-f=scrub]').checked,
        intensity: Number(card.querySelector('[data-f=intensity]').value),
        duration: Number(card.querySelector('[data-f=duration]').value),
        delay: Number(card.querySelector('[data-f=delay]').value),
        ease: 'power3.out',
        direction: card.querySelector('[data-f=direction]').value,
      },
    };
    sync();
  }

  function bind(card, i) {
    card.querySelectorAll('input, select, textarea').forEach((el) => {
      el.addEventListener('input', () => readCard(card, i));
      el.addEventListener('change', () => readCard(card, i));
    });
    card.querySelector('[data-remove]').addEventListener('click', () => {
      sections.splice(i, 1);
      draw();
    });
    card.querySelector('[data-up]').addEventListener('click', () => {
      if (i === 0) return;
      const [row] = sections.splice(i, 1);
      sections.splice(i - 1, 0, row);
      draw();
    });
    card.querySelector('[data-down]').addEventListener('click', () => {
      if (i >= sections.length - 1) return;
      const [row] = sections.splice(i, 1);
      sections.splice(i + 1, 0, row);
      draw();
    });
  }

  function draw() {
    root.innerHTML = sections.map((s, i) => {
      const a = s.animation || {};
      return `<article class="block" data-i="${i}">
        <div class="row-actions" style="margin-bottom:10px">
          <strong>Section ${String(i + 1).padStart(2, '0')}</strong>
          <button type="button" class="btn ghost" data-up>Up</button>
          <button type="button" class="btn ghost" data-down>Down</button>
          <button type="button" class="btn danger" data-remove>Remove</button>
        </div>
        <div class="form-grid">
          <label>Type<select data-f="type">${opt(TYPES, s.type)}</select></label>
          <label>Animation<select data-f="preset">${opt(PRESETS, a.preset || 'fade-up')}</select></label>
          <label class="full">Heading<input data-f="heading" value="${(s.heading || '').replace(/"/g, '&quot;')}"></label>
          <label class="full">Text<textarea data-f="text">${s.text || ''}</textarea></label>
          <label class="full">Media URLs (one per line)<textarea data-f="media">${(s.media || []).join('\n')}</textarea></label>
          <label>Video URL<input data-f="video" value="${(s.video_url || '').replace(/"/g, '&quot;')}"></label>
          <label>Start<select data-f="start">${['top 90%', 'top 80%', 'top 70%', 'top 50%', 'top bottom'].map((v) => `<option ${((a.start || 'top 80%') === v) ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
          <label>Direction<select data-f="direction">${['up', 'down', 'left', 'right'].map((v) => `<option ${((a.direction || 'up') === v) ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
          <label>Intensity ${a.intensity || 0.35}<input data-f="intensity" type="range" min="0.1" max="1" step="0.05" value="${a.intensity || 0.35}"></label>
          <label>Duration<input data-f="duration" type="number" min="0.2" max="2.5" step="0.1" value="${a.duration || 1}"></label>
          <label>Delay<input data-f="delay" type="number" min="0" max="1.5" step="0.1" value="${a.delay || 0}"></label>
          <label>Scrub<div class="checks"><label><input data-f="scrub" type="checkbox" ${a.scrub ? 'checked' : ''}> On</label></div></label>
        </div>
      </article>`;
    }).join('') || '<p class="note">No sections yet. Add one to start the story.</p>';
    root.querySelectorAll('.block').forEach((card, i) => bind(card, i));
    sync();
  }

  addBtn?.addEventListener('click', () => {
    sections.push(empty());
    draw();
  });

  draw();
})();
