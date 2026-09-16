const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..', '..');
const SEED_PATH = path.join(__dirname, 'website-seed.json');
const STORE_PATH = path.join(ROOT, 'storage', 'app', 'website', 'cms.json');
const UPLOAD_DIR = path.join(ROOT, 'public', 'uploads', 'website');

function loadSeed() {
  return JSON.parse(fs.readFileSync(SEED_PATH, 'utf8'));
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || `item-${Date.now()}`;
}

function uniqueSlug(list, base, currentId) {
  let slug = slugify(base);
  let n = 2;
  while (list.some((item) => item.slug === slug && item.id !== currentId && item.slug !== currentId)) {
    slug = `${slugify(base)}-${n++}`;
  }
  return slug;
}

function now() {
  return new Date().toISOString();
}

function ensureStore() {
  fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  if (!fs.existsSync(STORE_PATH)) {
    const seed = loadSeed();
    write(normalizeSeed(seed));
  }
}

function normalizeSeed(seed) {
  return {
    settings: seed.settings,
    company: seed.company,
    homepage: seed.homepage,
    image_specs: seed.image_specs,
    industries: seed.industries,
    services: seed.services,
    projects: seed.projects.map((p, i) => ({
      ...p,
      id: p.slug,
      sort_order: p.sort_order || i + 1,
      blocks: p.blocks || [],
      gallery: p.gallery || [],
      cover_image: p.cover_image || null,
      hero_image: p.hero_image || null,
      og_image: p.og_image || null,
      featured: false,
      status: 'draft',
      manually_edited: false,
    })),
    clients: seed.clients || [],
    case_studies: seed.case_studies || [],
    media: seed.media || [],
  };
}

function read() {
  ensureStore();
  return JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
}

function write(data) {
  fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2));
}

function published(list) {
  return (list || []).filter((item) => item.status === 'published').sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
}

function stats() {
  const data = read();
  return {
    projects: data.projects.length,
    published_projects: data.projects.filter((p) => p.status === 'published').length,
    draft_projects: data.projects.filter((p) => p.status === 'draft').length,
    archived_projects: data.projects.filter((p) => p.status === 'archived').length,
    featured_projects: data.projects.filter((p) => p.featured && p.status === 'published').length,
    services: data.services.length,
    published_services: published(data.services).length,
    industries: data.industries.length,
    case_studies: data.case_studies.length,
    published_case_studies: published(data.case_studies).length,
    clients: data.clients.length,
    published_clients: published(data.clients).length,
    media: (data.media || []).length,
    missing_email: !data.settings.email,
    missing_address: !data.settings.address,
  };
}

const SERVICE_ART = {
  branding: '/assets/kite/services/branding.jpg',
  'media-production': '/assets/kite/services/media.jpg',
  'web-development': '/assets/kite/services/web.jpg',
  'digital-content': '/assets/kite/services/digital.jpg',
  'marketing-materials': '/assets/kite/services/marketing.jpg',
};

function withServiceArt(service) {
  if (service && !service.cover_image && SERVICE_ART[service.slug]) {
    return { ...service, cover_image: SERVICE_ART[service.slug] };
  }
  return service;
}

function publicPayload() {
  const data = read();
  const projects = published(data.projects);
  const services = published(data.services).map(withServiceArt);
  const clients = published(data.clients);
  const cases = published(data.case_studies);
  const featuredSlugs = data.homepage.featured_project_slugs || [];
  const featured = featuredSlugs
    .map((slug) => projects.find((p) => p.slug === slug))
    .filter(Boolean);
  return {
    settings: data.settings,
    company: data.company,
    homepage: data.homepage,
    image_specs: data.image_specs,
    services,
    industries: published(data.industries.length ? data.industries.map((i) => ({ ...i, status: i.status || 'published' })) : data.industries),
    projects,
    featured_projects: featured.length ? featured : projects.filter((p) => p.featured),
    clients,
    case_studies: cases,
  };
}

function projectBySlug(slug, { allowUnpublished = false } = {}) {
  const p = read().projects.find((x) => x.slug === slug);
  if (!p) return null;
  if (!allowUnpublished && p.status !== 'published') return null;
  return p;
}

function serviceBySlug(slug, { allowUnpublished = false } = {}) {
  const s = read().services.find((x) => x.slug === slug);
  if (!s) return null;
  if (!allowUnpublished && s.status !== 'published') return null;
  return withServiceArt(s);
}

function caseBySlug(slug, { allowUnpublished = false } = {}) {
  const c = read().case_studies.find((x) => x.slug === slug);
  if (!c) return null;
  if (!allowUnpublished && c.status !== 'published') return null;
  return c;
}

function projectsForService(serviceSlug) {
  return published(read().projects).filter((p) => (p.services || []).includes(serviceSlug));
}

function upsert(listName, id, patch, createFn) {
  const data = read();
  const list = data[listName];
  const idx = list.findIndex((item) => item.id === id || item.slug === id);
  if (idx < 0) {
    const created = createFn(data, patch);
    list.push(created);
    write(data);
    return created;
  }
  list[idx] = { ...list[idx], ...patch, id: list[idx].id };
  write(data);
  return list[idx];
}

function removeItem(listName, id) {
  const data = read();
  const before = data[listName].length;
  data[listName] = data[listName].filter((item) => item.id !== id && item.slug !== id);
  write(data);
  return data[listName].length !== before;
}

function reorder(listName, slugs) {
  const data = read();
  slugs.forEach((slug, i) => {
    const item = data[listName].find((x) => x.slug === slug || x.id === slug);
    if (item) item.sort_order = i + 1;
  });
  write(data);
}

function saveProject(id, patch) {
  const data = read();
  let project = data.projects.find((p) => p.id === id || p.slug === id);
  if (!project) {
    const slug = uniqueSlug(data.projects, patch.slug || patch.title);
    project = {
      id: slug,
      slug,
      title: patch.title || 'Untitled',
      client: patch.client || patch.title || '',
      industry: patch.industry || 'other',
      services: patch.services || [],
      service_labels: patch.service_labels || [],
      short_description: '',
      full_description: '',
      featured: false,
      status: 'draft',
      external_url: null,
      year: null,
      challenge: null,
      approach: null,
      solution: null,
      results: null,
      credits: null,
      blocks: [],
      gallery: [],
      cover_image: null,
      hero_image: null,
      og_image: null,
      seo_title: null,
      seo_description: null,
      sort_order: data.projects.length + 1,
      sections: [],
      animation: { intensity: 'medium', theme: 'default', respect_reduced_motion: true },
      manually_edited: true,
    };
    data.projects.push(project);
  }
  Object.assign(project, patch, { manually_edited: true, id: project.id });
  if (patch.slug) project.slug = uniqueSlug(data.projects, patch.slug, project.id);
  if (project.status === 'published' && !project.published_at) project.published_at = now();
  write(data);
  return project;
}

function saveService(id, patch) {
  const data = read();
  let service = data.services.find((s) => s.slug === id || s.id === id);
  if (!service) {
    const slug = uniqueSlug(data.services, patch.slug || patch.name);
    service = {
      id: slug,
      slug,
      name: patch.name || 'Untitled service',
      short_description: '',
      description: '',
      statement: '',
      capabilities: [],
      featured: false,
      status: 'draft',
      cover_image: null,
      images: [],
      featured_project_slugs: [],
      seo_title: null,
      seo_description: null,
      sort_order: data.services.length + 1,
    };
    data.services.push(service);
  }
  Object.assign(service, patch);
  write(data);
  return service;
}

function saveClient(id, patch) {
  const data = read();
  let client = data.clients.find((c) => c.slug === id || c.id === id);
  if (!client) {
    const slug = uniqueSlug(data.clients, patch.slug || patch.name);
    client = {
      id: slug,
      slug,
      name: patch.name || 'Client',
      logo: null,
      website_url: null,
      industry: null,
      sort_order: data.clients.length + 1,
      status: 'draft',
    };
    data.clients.push(client);
  }
  Object.assign(client, patch);
  write(data);
  return client;
}

function saveCaseStudy(id, patch) {
  const data = read();
  let item = data.case_studies.find((c) => c.slug === id || c.id === id);
  if (!item) {
    const slug = uniqueSlug(data.case_studies, patch.slug || patch.title);
    item = {
      id: slug,
      slug,
      title: patch.title || 'Case study',
      project_slug: patch.project_slug || null,
      introduction: '',
      challenge: '',
      approach: '',
      solution: '',
      results: '',
      visuals: [],
      gallery: [],
      website_url: null,
      services: [],
      industry: null,
      featured: false,
      status: 'draft',
      sort_order: data.case_studies.length + 1,
    };
    data.case_studies.push(item);
  }
  Object.assign(item, patch);
  if (item.status === 'published' && !item.published_at) item.published_at = now();
  write(data);
  return item;
}

function saveIndustry(id, patch) {
  const data = read();
  let item = data.industries.find((c) => c.slug === id);
  if (!item) {
    const slug = uniqueSlug(data.industries, patch.slug || patch.name);
    item = { name: patch.name || 'Industry', slug, sort_order: data.industries.length + 1, status: 'published', description: null };
    data.industries.push(item);
  }
  Object.assign(item, patch);
  write(data);
  return item;
}

function saveHomepage(patch) {
  const data = read();
  data.homepage = {
    ...data.homepage,
    ...patch,
    hero: { ...data.homepage.hero, ...(patch.hero || {}) },
    services_intro: { ...data.homepage.services_intro, ...(patch.services_intro || {}) },
    about: { ...data.homepage.about, ...(patch.about || {}) },
    cta: { ...data.homepage.cta, ...(patch.cta || {}) },
  };
  write(data);
  return data.homepage;
}

function saveSettings(patch) {
  const data = read();
  data.settings = {
    ...data.settings,
    ...patch,
    socials: { ...data.settings.socials, ...(patch.socials || {}) },
  };
  write(data);
  return data.settings;
}

function saveCompany(patch) {
  const data = read();
  data.company = { ...data.company, ...patch };
  write(data);
  return data.company;
}

function addMedia({ filename, url, mime, size, kind }) {
  const data = read();
  const item = {
    id: crypto.randomBytes(6).toString('hex'),
    filename,
    url,
    mime,
    size,
    kind: kind || 'image',
    created_at: now(),
  };
  data.media = data.media || [];
  data.media.unshift(item);
  write(data);
  return item;
}

function removeMedia(id) {
  const data = read();
  data.media = (data.media || []).filter((m) => m.id !== id);
  write(data);
}

function saveUpload(filename, buffer) {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const name = `${Date.now()}-${safe}`;
  const dest = path.join(UPLOAD_DIR, name);
  fs.writeFileSync(dest, buffer);
  const url = `/uploads/website/${name}`;
  return addMedia({
    filename: safe,
    url,
    mime: guessMime(safe),
    size: buffer.length,
    kind: 'image',
  });
}

function guessMime(name) {
  if (name.endsWith('.png')) return 'image/png';
  if (name.endsWith('.webp')) return 'image/webp';
  if (name.endsWith('.gif')) return 'image/gif';
  if (name.endsWith('.svg')) return 'image/svg+xml';
  return 'image/jpeg';
}

module.exports = {
  read,
  write,
  stats,
  publicPayload,
  published,
  projectBySlug,
  serviceBySlug,
  caseBySlug,
  projectsForService,
  saveProject,
  saveService,
  saveClient,
  saveCaseStudy,
  saveIndustry,
  saveHomepage,
  saveSettings,
  saveCompany,
  removeItem,
  reorder,
  addMedia,
  removeMedia,
  saveUpload,
  slugify,
  SERVICE_ART,
  withServiceArt,
  UPLOAD_DIR,
};
