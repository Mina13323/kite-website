function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]));
}

function layout(title, body, active) {
  const links = [
    ['/studio', 'Dashboard', 'dash'],
    ['/studio/homepage', 'Homepage', 'home'],
    ['/studio/projects', 'Projects', 'projects'],
    ['/studio/case-studies', 'Case Studies', 'cases'],
    ['/studio/services', 'Services', 'services'],
    ['/studio/industries', 'Industries', 'industries'],
    ['/studio/clients', 'Clients / Kites', 'clients'],
    ['/studio/media', 'Media', 'media'],
    ['/studio/animations', 'Animation library', 'anims'],
    ['/studio/contact', 'Contact & SEO', 'contact'],
  ];
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>${esc(title)} · KITE Studio</title>
  <link rel="icon" href="/assets/kite/preloader/logo-icon.svg">
  <link rel="stylesheet" href="/assets/css/studio.css?v=2">
</head>
<body>
  <div class="studio-shell">
    <aside class="studio-side">
      <div class="mark">kite</div>
      <div class="sub">Website content · not AgencyOS</div>
      <nav>
        ${links.map(([href, label, key]) => `<a href="${href}" class="${active === key ? 'is-on' : ''}">${label}</a>`).join('')}
        <a href="/home" target="_blank">View public site</a>
        <form method="post" action="/studio/logout"><button class="linkish" type="submit">Sign out</button></form>
      </nav>
    </aside>
    <main class="studio-main">${body}</main>
  </div>
</body>
</html>`;
}

function flash(query) {
  if (query.saved) return '<div class="flash">Saved.</div>';
  if (query.deleted) return '<div class="flash">Deleted.</div>';
  if (query.error) return `<div class="error">${esc(query.error)}</div>`;
  return '';
}

function badge(status) {
  const cls = status === 'published' ? 'pub' : status === 'archived' ? 'arch' : 'draft';
  return `<span class="badge ${cls}">${esc(status)}</span>`;
}

function loginPage(error) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Sign in · KITE Studio</title>
  <link rel="stylesheet" href="/assets/css/studio.css?v=2">
</head>
<body class="login-wrap">
  <form class="login-card" method="post" action="/studio/login">
    <div class="sub">Website content</div>
    <h1>KITE</h1>
    <p class="lede">Manage the public website. This is not AgencyOS.</p>
    ${error ? `<div class="error">${esc(error)}</div>` : ''}
    <div class="form-grid" style="grid-template-columns:1fr">
      <label>Email<input type="email" name="email" required value="studio@kiteagency-eg.com"></label>
      <label>Password<input type="password" name="password" required></label>
    </div>
    <button class="btn" type="submit" style="margin-top:18px">Enter</button>
  </form>
</body>
</html>`;
}

function dashboard(stats, query) {
  return layout('Dashboard', `
    ${flash(query)}
    <h1>Website content</h1>
    <p class="lede">This is the control layer for kiteagency-eg.com. Draft and archived items stay off the public site.</p>
    <div class="stat-grid">
      <div class="stat"><strong>${stats.published_projects}</strong><span>Published projects</span></div>
      <div class="stat"><strong>${stats.draft_projects}</strong><span>Draft projects</span></div>
      <div class="stat"><strong>${stats.featured_projects}</strong><span>Featured projects</span></div>
      <div class="stat"><strong>${stats.published_services}</strong><span>Live services</span></div>
      <div class="stat"><strong>${stats.published_case_studies}</strong><span>Case studies live</span></div>
      <div class="stat"><strong>${stats.published_clients}</strong><span>Clients live</span></div>
      <div class="stat"><strong>${stats.media}</strong><span>Media files</span></div>
      <div class="stat"><strong>${stats.industries}</strong><span>Industries</span></div>
    </div>
    <p class="note">${stats.missing_email ? 'Email is CONTENT_REQUIRED. ' : ''}${stats.missing_address ? 'Street address is CONTENT_REQUIRED.' : ''}</p>
    <div class="row-actions">
      <a class="btn" href="/studio/projects/new">New project</a>
      <a class="btn ghost" href="/studio/homepage">Edit homepage</a>
      <a class="btn ghost" href="/studio/media">Upload media</a>
    </div>
  `, 'dash');
}

module.exports = { esc, layout, flash, badge, loginPage, dashboard };
