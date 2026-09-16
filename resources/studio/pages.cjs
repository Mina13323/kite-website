const { esc, layout, flash, badge } = require('./render.cjs');

function statusSelect(name, value) {
  return `<select name="${name}">
    ${['draft', 'published', 'archived'].map((s) => `<option value="${s}" ${value === s ? 'selected' : ''}>${s}</option>`).join('')}
  </select>`;
}

function projectsIndex(projects, query) {
  return layout('Projects', `
    ${flash(query)}
    <h1>Projects</h1>
    <p class="lede">Create, draft, publish, feature, and archive. Unpublished slugs return 404 on the public site.</p>
    <p class="row-actions"><a class="btn" href="/studio/projects/new">Create project</a></p>
    <table class="table">
      <tr><th>Title</th><th>Client</th><th>Status</th><th>Featured</th><th></th></tr>
      ${projects.map((p) => `<tr>
        <td>${esc(p.title)}</td>
        <td>${esc(p.client)}</td>
        <td>${badge(p.status)}</td>
        <td>${p.featured ? 'Yes' : '—'}</td>
        <td class="row-actions">
          <a class="btn ghost" href="/studio/projects/${esc(p.slug)}">Edit</a>
        </td>
      </tr>`).join('')}
    </table>
  `, 'projects');
}

function projectForm(p, services, industries, media, query) {
  const isNew = !p.slug;
  return layout(isNew ? 'New project' : p.title, `
    ${flash(query)}
    <h1>${isNew ? 'New project' : esc(p.title)}</h1>
    <p class="note">Upload files, then Save. Cover 1600 × 1200. Gallery 1800 × 1200. Do not invent metrics or results.</p>
    <form method="post" action="/studio/projects/${isNew ? 'new' : esc(p.slug)}" enctype="multipart/form-data">
      <div class="form-grid">
        <label>Title<input name="title" required value="${esc(p.title || '')}"></label>
        <label>Slug<input name="slug" value="${esc(p.slug || '')}" placeholder="auto from title"></label>
        <label>Client<input name="client" value="${esc(p.client || '')}"></label>
        <label>Year<input name="year" value="${esc(p.year || '')}" placeholder="only if known"></label>
        <label>Industry<select name="industry">${industries.map((i) => `<option value="${esc(i.slug)}" ${p.industry === i.slug ? 'selected' : ''}>${esc(i.name)}</option>`).join('')}</select></label>
        <label>Status${statusSelect('status', p.status || 'draft')}</label>
        <label class="full">Short description<textarea name="short_description">${esc(p.short_description || '')}</textarea></label>
        <label class="full">Full description<textarea name="full_description">${esc(p.full_description || '')}</textarea></label>
        <label class="full">Services
          <div class="checks">${services.map((s) => `<label><input type="checkbox" name="services" value="${esc(s.slug)}" ${(p.services || []).includes(s.slug) ? 'checked' : ''}> ${esc(s.name)}</label>`).join('')}</div>
        </label>
        <label>External website URL<input name="external_url" value="${esc(p.external_url || '')}" placeholder="https://"></label>
        <label class="full">Cover image · 1600 × 1200
          ${p.cover_image ? `<div class="upload-preview"><img src="${esc(p.cover_image)}" alt=""><label class="checks"><input type="checkbox" name="cover_clear" value="1"> Remove</label></div>` : ''}
          <input type="hidden" name="cover_image" value="${esc(p.cover_image || '')}">
          <input type="file" name="cover_file" accept="image/jpeg,image/png,image/webp,image/svg+xml">
        </label>
        <label class="full">Hero image · 1920 × 1080
          ${p.hero_image ? `<div class="upload-preview"><img src="${esc(p.hero_image)}" alt=""><label class="checks"><input type="checkbox" name="hero_clear" value="1"> Remove</label></div>` : ''}
          <input type="hidden" name="hero_image" value="${esc(p.hero_image || '')}">
          <input type="file" name="hero_file" accept="image/jpeg,image/png,image/webp,image/svg+xml">
        </label>
        <label>SEO title<input name="seo_title" value="${esc(p.seo_title || '')}"></label>
        <label class="full">SEO description<textarea name="seo_description">${esc(p.seo_description || '')}</textarea></label>
        <label class="full">Challenge<textarea name="challenge">${esc(p.challenge || '')}</textarea></label>
        <label class="full">Approach<textarea name="approach">${esc(p.approach || '')}</textarea></label>
        <label class="full">Solution<textarea name="solution">${esc(p.solution || '')}</textarea></label>
        <label class="full">Results <span>(leave empty if unknown)</span><textarea name="results">${esc(p.results || '')}</textarea></label>
        <label>Featured
          <div class="checks"><label><input type="checkbox" name="featured" value="1" ${p.featured ? 'checked' : ''}> Feature on homepage</label></div>
        </label>
        <label class="full">Gallery URLs (one per line)<textarea name="gallery">${esc((p.gallery || []).map((g) => g.url || g).join('\n'))}</textarea></label>
        <label>Page theme
          <select name="anim_theme">
            ${['default', 'cinematic', 'editorial', 'minimal'].map((t) => `<option value="${t}" ${(p.animation && p.animation.theme) === t ? 'selected' : ''}>${t}</option>`).join('')}
          </select>
        </label>
        <label>Motion intensity
          <select name="anim_intensity">
            ${['low', 'medium', 'high'].map((t) => `<option value="${t}" ${(p.animation && p.animation.intensity) === t ? 'selected' : ''}>${t}</option>`).join('')}
          </select>
        </label>
      </div>
      <h2 style="margin:28px 0 10px">Project sections</h2>
      <p class="note">Each section has a layout and a <strong>preset</strong> — not custom JavaScript. Save, then preview with the same engine the public site uses.</p>
      <div id="section-builder"></div>
      <p class="row-actions"><button type="button" class="btn ghost" id="add-section">Add section</button></p>
      <textarea name="sections" id="sections-json" hidden>${esc(JSON.stringify(p.sections || []))}</textarea>
      <div class="row-actions" style="margin-top:18px">
        <button class="btn" type="submit">Save</button>
        ${!isNew ? `<a class="btn ghost" href="/studio/preview/project/${esc(p.slug)}" target="_blank">Preview</a>` : ''}
      </div>
      <script src="/assets/js/studio-builder.js?v=1"></script>
    </form>
    ${!isNew ? `<form method="post" action="/studio/projects/${esc(p.slug)}/delete" style="margin-top:28px" onsubmit="return confirm('Delete this project?')">
      <button class="btn danger" type="submit">Delete project</button>
    </form>` : ''}
    ${mediaPicker(media)}
  `, 'projects');
}

function mediaPicker(media) {
  if (!media?.length) return '<p class="note">Upload files in Media, then paste the URL into an image field.</p>';
  return `<h2 style="margin:28px 0 10px;font-size:20px">Media library</h2>
    <table class="table">${media.slice(0, 12).map((m) => `<tr>
      <td><img class="thumb" src="${esc(m.url)}" alt=""></td>
      <td>${esc(m.filename)}</td>
      <td><code>${esc(m.url)}</code></td>
    </tr>`).join('')}</table>`;
}

function servicesIndex(services, query) {
  return layout('Services', `
    ${flash(query)}
    <h1>Services</h1>
    <p class="lede">Order here becomes SERVICE 01 → 0N on the public horizontal section.</p>
    <p class="row-actions"><a class="btn" href="/studio/services/new">Create service</a></p>
    <form method="post" action="/studio/services/reorder">
      <table class="table">
        <tr><th>Order</th><th>Name</th><th>Status</th><th></th></tr>
        ${services.sort((a, b) => a.sort_order - b.sort_order).map((s) => `<tr>
          <td><input name="order" value="${esc(s.slug)}" type="hidden"><input name="sort_${esc(s.slug)}" value="${s.sort_order}" style="width:70px"></td>
          <td>${esc(s.name)}</td>
          <td>${badge(s.status)}</td>
          <td><a class="btn ghost" href="/studio/services/${esc(s.slug)}">Edit</a></td>
        </tr>`).join('')}
      </table>
      <button class="btn" type="submit" style="margin-top:12px">Save order</button>
    </form>
  `, 'services');
}

function serviceForm(s, projects, query) {
  const isNew = !s.slug;
  return layout(isNew ? 'New service' : s.name, `
    ${flash(query)}
    <h1>${isNew ? 'New service' : esc(s.name)}</h1>
    <p class="note">Service image 4:3 · 1600×1200.</p>
    <form method="post" action="/studio/services/${isNew ? 'new' : esc(s.slug)}" enctype="multipart/form-data">
      <div class="form-grid">
        <label>Name<input name="name" required value="${esc(s.name || '')}"></label>
        <label>Slug<input name="slug" value="${esc(s.slug || '')}"></label>
        <label>Statement<input name="statement" value="${esc(s.statement || '')}"></label>
        <label>Status${statusSelect('status', s.status || 'draft')}</label>
        <label class="full">Short description<textarea name="short_description">${esc(s.short_description || '')}</textarea></label>
        <label class="full">Full description<textarea name="description">${esc(s.description || '')}</textarea></label>
        <label class="full">Capabilities (one per line)<textarea name="capabilities">${esc((s.capabilities || []).join('\n'))}</textarea></label>
        <label class="full">Horizontal tags (one per line)
          <span style="text-transform:none;letter-spacing:0;color:rgba(17,17,17,.68);font-size:13px">These chips appear on the homepage Services slider. Leave empty to use capabilities.</span>
          <textarea name="horizon_tags">${esc((s.horizon_tags || []).join('\n'))}</textarea>
        </label>
        <label class="full">Cover image
          <span style="text-transform:none;letter-spacing:0;color:rgba(17,17,17,.68);font-size:13px">1600 × 1200 px · 4:3</span>
          ${s.cover_image ? `<div class="upload-preview"><img src="${esc(s.cover_image)}" alt=""></div>` : ''}
          <input type="hidden" name="cover_image" value="${esc(s.cover_image || '')}">
          <input type="file" name="cover_file" accept="image/jpeg,image/png,image/webp,image/svg+xml">
        </label>
        <label>SEO title<input name="seo_title" value="${esc(s.seo_title || '')}"></label>
        <label class="full">SEO description<textarea name="seo_description">${esc(s.seo_description || '')}</textarea></label>
        <label class="full">Featured projects
          <div class="checks">${projects.map((p) => `<label><input type="checkbox" name="featured_project_slugs" value="${esc(p.slug)}" ${(s.featured_project_slugs || []).includes(p.slug) ? 'checked' : ''}> ${esc(p.title)}</label>`).join('')}</div>
        </label>
        <label>Featured service<div class="checks"><label><input type="checkbox" name="featured" value="1" ${s.featured ? 'checked' : ''}> Feature</label></div></label>
      </div>
      <button class="btn" style="margin-top:16px" type="submit">Save</button>
    </form>
  `, 'services');
}

function industriesPage(industries, query) {
  return layout('Industries', `
    ${flash(query)}
    <h1>Industries</h1>
    <table class="table">
      ${industries.map((i) => `<tr>
        <td>${esc(i.name)}</td><td>${esc(i.slug)}</td><td>${badge(i.status || 'published')}</td>
        <td>
          <form method="post" action="/studio/industries/${esc(i.slug)}" class="row-actions">
            <input type="hidden" name="name" value="${esc(i.name)}">
            <select name="status">${['published', 'draft', 'archived'].map((s) => `<option ${((i.status || 'published') === s) ? 'selected' : ''}>${s}</option>`).join('')}</select>
            <button class="btn ghost" type="submit">Save</button>
          </form>
        </td>
      </tr>`).join('')}
    </table>
    <form method="post" action="/studio/industries/new" style="margin-top:24px" class="form-grid">
      <label>New industry<input name="name" required></label>
      <div><button class="btn" type="submit">Add</button></div>
    </form>
  `, 'industries');
}

function clientsPage(clients, industries, query) {
  return layout('Clients / Kites', `
    ${flash(query)}
    <h1>Clients / Kites</h1>
    <p class="note">Client logos: transparent PNG, display area about 160×64.</p>
    <p class="row-actions"><a class="btn" href="/studio/clients/new">Add client</a></p>
    <table class="table">
      <tr><th>Name</th><th>Logo</th><th>Status</th><th></th></tr>
      ${clients.map((c) => `<tr>
        <td>${esc(c.name)}</td>
        <td>${c.logo ? `<img class="thumb" src="${esc(c.logo)}" alt="">` : '—'}</td>
        <td>${badge(c.status)}</td>
        <td><a class="btn ghost" href="/studio/clients/${esc(c.slug)}">Edit</a></td>
      </tr>`).join('')}
    </table>
  `, 'clients');
}

function clientForm(c, industries, query) {
  const isNew = !c.slug;
  return layout(isNew ? 'New client' : c.name, `
    ${flash(query)}
    <h1>${isNew ? 'New client' : esc(c.name)}</h1>
    <form method="post" action="/studio/clients/${isNew ? 'new' : esc(c.slug)}">
      <div class="form-grid">
        <label>Name<input name="name" required value="${esc(c.name || '')}"></label>
        <label>Slug<input name="slug" value="${esc(c.slug || '')}"></label>
        <label>Logo URL<input name="logo" value="${esc(c.logo || '')}"></label>
        <label>Website URL<input name="website_url" value="${esc(c.website_url || '')}"></label>
        <label>Industry<select name="industry"><option value="">—</option>${industries.map((i) => `<option value="${esc(i.slug)}" ${c.industry === i.slug ? 'selected' : ''}>${esc(i.name)}</option>`).join('')}</select></label>
        <label>Status${statusSelect('status', c.status || 'draft')}</label>
        <label>Display order<input name="sort_order" type="number" value="${esc(c.sort_order || 0)}"></label>
      </div>
      <button class="btn" style="margin-top:16px" type="submit">Save</button>
    </form>
    ${!isNew ? `<form method="post" action="/studio/clients/${esc(c.slug)}/delete" style="margin-top:20px"><button class="btn danger" type="submit">Remove client</button></form>` : ''}
  `, 'clients');
}

function casesIndex(cases, query) {
  return layout('Case Studies', `
    ${flash(query)}
    <h1>Case Studies</h1>
    <p class="lede">Optional deeper write-ups. Leave challenge / results empty if you do not have them. Never invent numbers.</p>
    <p class="row-actions"><a class="btn" href="/studio/case-studies/new">New case study</a></p>
    <table class="table">
      ${cases.map((c) => `<tr>
        <td>${esc(c.title)}</td><td>${esc(c.project_slug || '')}</td><td>${badge(c.status)}</td>
        <td><a class="btn ghost" href="/studio/case-studies/${esc(c.slug)}">Edit</a></td>
      </tr>`).join('') || '<tr><td>None yet.</td></tr>'}
    </table>
  `, 'cases');
}

function caseForm(c, projects, services, industries, query) {
  const isNew = !c.slug;
  return layout(isNew ? 'New case study' : c.title, `
    ${flash(query)}
    <h1>${isNew ? 'New case study' : esc(c.title)}</h1>
    <form method="post" action="/studio/case-studies/${isNew ? 'new' : esc(c.slug)}">
      <div class="form-grid">
        <label>Title<input name="title" required value="${esc(c.title || '')}"></label>
        <label>Slug<input name="slug" value="${esc(c.slug || '')}"></label>
        <label>Linked project<select name="project_slug"><option value="">—</option>${projects.map((p) => `<option value="${esc(p.slug)}" ${c.project_slug === p.slug ? 'selected' : ''}>${esc(p.title)}</option>`).join('')}</select></label>
        <label>Status${statusSelect('status', c.status || 'draft')}</label>
        <label class="full">Introduction<textarea name="introduction">${esc(c.introduction || '')}</textarea></label>
        <label class="full">Challenge<textarea name="challenge">${esc(c.challenge || '')}</textarea></label>
        <label class="full">Approach<textarea name="approach">${esc(c.approach || '')}</textarea></label>
        <label class="full">Solution<textarea name="solution">${esc(c.solution || '')}</textarea></label>
        <label class="full">Results (optional — leave blank if unknown)<textarea name="results">${esc(c.results || '')}</textarea></label>
        <label>Industry<select name="industry"><option value="">—</option>${industries.map((i) => `<option value="${esc(i.slug)}" ${c.industry === i.slug ? 'selected' : ''}>${esc(i.name)}</option>`).join('')}</select></label>
        <label>Website URL<input name="website_url" value="${esc(c.website_url || '')}"></label>
        <label class="full">Related services
          <div class="checks">${services.map((s) => `<label><input type="checkbox" name="services" value="${esc(s.slug)}" ${(c.services || []).includes(s.slug) ? 'checked' : ''}> ${esc(s.name)}</label>`).join('')}</div>
        </label>
        <label>Featured<div class="checks"><label><input type="checkbox" name="featured" value="1" ${c.featured ? 'checked' : ''}> Feature on homepage</label></div></label>
        <label class="full">Gallery URLs<textarea name="gallery">${esc((c.gallery || []).join('\n'))}</textarea></label>
      </div>
      <button class="btn" style="margin-top:16px" type="submit">Save</button>
    </form>
  `, 'cases');
}

function homepageForm(home, projects, cases, clients, query) {
  return layout('Homepage', `
    ${flash(query)}
    <h1>Homepage content</h1>
    <p class="lede">Preloader animation stays in code. You manage the words, CTAs, and featured lists.</p>
    <form method="post" action="/studio/homepage">
      <h2>Hero</h2>
      <div class="form-grid">
        <label class="full">Headline<input name="hero_headline" value="${esc(home.hero.headline)}"></label>
        <label class="full">Supporting text<textarea name="hero_supporting">${esc(home.hero.supporting)}</textarea></label>
        <label>Primary CTA<label style="display:none"></label><input name="hero_cta_label" value="${esc(home.hero.cta_label)}"></label>
        <label>Primary URL<input name="hero_cta_url" value="${esc(home.hero.cta_url)}"></label>
        <label>Secondary CTA<input name="hero_secondary_cta_label" value="${esc(home.hero.secondary_cta_label || '')}"></label>
        <label>Secondary URL<input name="hero_secondary_cta_url" value="${esc(home.hero.secondary_cta_url || '')}"></label>
      </div>
      <h2 style="margin-top:22px">Services intro</h2>
      <div class="form-grid">
        <label>Title<input name="svc_title" value="${esc(home.services_intro.title)}"></label>
        <label>Statement<input name="svc_statement" value="${esc(home.services_intro.statement)}"></label>
        <label class="full">Supporting<textarea name="svc_supporting">${esc(home.services_intro.supporting)}</textarea></label>
      </div>
      <h2 style="margin-top:22px">About</h2>
      <div class="form-grid">
        <label>Title<input name="about_title" value="${esc(home.about.title)}"></label>
        <label>Main statement<input name="about_main" value="${esc(home.about.main_statement)}"></label>
        <label class="full">Description<textarea name="about_description">${esc(home.about.description)}</textarea></label>
        <label class="full">Mission<textarea name="about_mission">${esc(home.about.mission || '')}</textarea></label>
        <label class="full">Vision<textarea name="about_vision">${esc(home.about.vision || '')}</textarea></label>
        <label class="full">How we work<textarea name="about_how">${esc(home.about.how_we_work || '')}</textarea></label>
      </div>
      <h2 style="margin-top:22px">CTA</h2>
      <div class="form-grid">
        <label>Headline<input name="cta_headline" value="${esc(home.cta.headline)}"></label>
        <label>Button<label style="display:none"></label><input name="cta_label" value="${esc(home.cta.cta_label)}"></label>
        <label class="full">Supporting<input name="cta_supporting" value="${esc(home.cta.supporting)}"></label>
        <label>Destination<input name="cta_url" value="${esc(home.cta.cta_url)}"></label>
      </div>
      <h2 style="margin-top:22px">Featured projects</h2>
      <div class="checks">${projects.map((p) => `<label><input type="checkbox" name="featured_project_slugs" value="${esc(p.slug)}" ${(home.featured_project_slugs || []).includes(p.slug) ? 'checked' : ''}> ${esc(p.title)} (${esc(p.status)})</label>`).join('')}</div>
      <h2 style="margin-top:22px">Featured case studies</h2>
      <div class="checks">${cases.length ? cases.map((c) => `<label><input type="checkbox" name="featured_case_study_slugs" value="${esc(c.slug)}" ${(home.featured_case_study_slugs || []).includes(c.slug) ? 'checked' : ''}> ${esc(c.title)}</label>`).join('') : '<p class="note">No case studies yet.</p>'}</div>
      <h2 style="margin-top:22px">Clients on homepage</h2>
      <div class="checks">${clients.map((c) => `<label><input type="checkbox" name="featured_client_slugs" value="${esc(c.slug)}" ${(home.featured_client_slugs || []).includes(c.slug) ? 'checked' : ''}> ${esc(c.name)}</label>`).join('')}</div>
      <button class="btn" style="margin-top:20px" type="submit">Save homepage</button>
    </form>
  `, 'home');
}

function mediaPage(media, specs, query) {
  return layout('Media', `
    ${flash(query)}
    <h1>Media</h1>
    <p class="lede">Upload artwork here, then attach the URL on a project, service, or client.</p>
    ${Object.entries(specs || {}).map(([key, spec]) => `<div class="spec"><strong>${esc(key.replace(/_/g, ' '))}</strong> — ${esc(spec.ratio)} · ${esc(spec.suggested)}. ${esc(spec.notes)}</div>`).join('')}
    <form method="post" action="/studio/media" enctype="multipart/form-data" style="margin:18px 0">
      <label>Image file (jpg, png, webp, svg · max 8MB)
        <input type="file" name="image" accept="image/jpeg,image/png,image/webp,image/svg+xml" required>
      </label>
      <button class="btn" type="submit" style="margin-top:12px">Upload</button>
    </form>
    <table class="table">
      <tr><th></th><th>File</th><th>URL</th><th></th></tr>
      ${(media || []).map((m) => `<tr>
        <td><img class="thumb" src="${esc(m.url)}" alt=""></td>
        <td>${esc(m.filename)}</td>
        <td><code>${esc(m.url)}</code></td>
        <td><form method="post" action="/studio/media/${esc(m.id)}/delete"><button class="btn danger" type="submit">Remove</button></form></td>
      </tr>`).join('') || '<tr><td colspan="4">No uploads yet.</td></tr>'}
    </table>
  `, 'media');
}

function contactPage(settings, company, query) {
  return layout('Contact & SEO', `
    ${flash(query)}
    <h1>Contact, footer & company</h1>
    <form method="post" action="/studio/contact">
      <div class="form-grid">
        <label>Company name<input name="company_name" value="${esc(settings.company_name)}"></label>
        <label>Tagline<input name="tagline" value="${esc(settings.tagline)}"></label>
        <label>Phone<input name="phone" value="${esc(settings.phone || '')}"></label>
        <label>Website<input name="website" value="${esc(settings.website || '')}"></label>
        <label>Email<input name="email" value="${esc(settings.email || '')}" placeholder="CONTENT_REQUIRED if empty"></label>
        <label>Address<input name="address" value="${esc(settings.address || '')}" placeholder="CONTENT_REQUIRED if empty"></label>
        <label>Behance<input name="behance" value="${esc(settings.socials.behance || '')}"></label>
        <label>Instagram<input name="instagram" value="${esc(settings.socials.instagram || '')}"></label>
        <label>Facebook<input name="facebook" value="${esc(settings.socials.facebook || '')}"></label>
        <label>LinkedIn<input name="linkedin" value="${esc(settings.socials.linkedin || '')}"></label>
        <label>WhatsApp<input name="whatsapp" value="${esc(settings.socials.whatsapp || '')}"></label>
        <label class="full">Company story<textarea name="story">${esc(company.story || '')}</textarea></label>
        <label class="full">Mission<textarea name="mission">${esc(company.mission || '')}</textarea></label>
        <label class="full">Vision<textarea name="vision">${esc(company.vision || '')}</textarea></label>
      </div>
      <button class="btn" style="margin-top:16px" type="submit">Save</button>
    </form>
  `, 'contact');
}

function animationsPage(presets, query) {
  return layout('Animation library', `
    ${flash(query)}
    <h1>Animation library</h1>
    <p class="lede">Registered presets only. The CMS cannot run custom JavaScript. Preview uses the public engine.</p>
    <table class="table">
      <tr><th>Preset</th><th>Category</th><th>Mobile</th><th>Reduced motion</th><th>Status</th></tr>
      ${presets.map((p) => `<tr>
        <td>${p.label} <code>${p.id}</code></td>
        <td>${p.category}</td>
        <td>${p.mobile}</td>
        <td>${p.reduced}</td>
        <td>${p.status}</td>
      </tr>`).join('')}
    </table>
    <h2 style="margin:28px 0 12px">Live preview</h2>
    <p class="note">Same <code>kite-presets.js</code> as the public site.</p>
    <section class="kite-sec text" data-kite-anim="fade-up" data-kite-config='{"preset":"fade-up","start":"top 90%","duration":1,"intensity":0.4,"ease":"power3.out"}'>
      <div class="wrap"><h2>Fade up</h2><p>Scroll this page. This block uses the registered fade-up preset.</p></div>
    </section>
    <link rel="stylesheet" href="/assets/css/kite-project.css?v=1">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
    <script src="/assets/js/kite-presets.js?v=1"></script>
  `, 'anims');
}

module.exports = {
  projectsIndex,
  projectForm,
  animationsPage,
  servicesIndex,
  serviceForm,
  industriesPage,
  clientsPage,
  clientForm,
  casesIndex,
  caseForm,
  homepageForm,
  mediaPage,
  contactPage,
};
