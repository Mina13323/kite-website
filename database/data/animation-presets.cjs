const PRESETS = [
  { id: 'none', label: 'None', category: 'Basic', mobile: 'Yes', reduced: 'Yes', status: 'active' },
  { id: 'fade-up', label: 'Fade up', category: 'Basic', mobile: 'Yes', reduced: 'Yes', status: 'active' },
  { id: 'fade-left', label: 'Fade left', category: 'Basic', mobile: 'Yes', reduced: 'Yes', status: 'active' },
  { id: 'fade-right', label: 'Fade right', category: 'Basic', mobile: 'Yes', reduced: 'Yes', status: 'active' },
  { id: 'scale-in', label: 'Scale in', category: 'Basic', mobile: 'Yes', reduced: 'Yes', status: 'active' },
  { id: 'image-wipe', label: 'Image wipe', category: 'Image', mobile: 'Yes', reduced: 'Yes', status: 'active' },
  { id: 'image-clip', label: 'Image clip reveal', category: 'Image', mobile: 'Yes', reduced: 'Yes', status: 'active' },
  { id: 'image-parallax', label: 'Image parallax', category: 'Image', mobile: 'Reduced', reduced: 'Off', status: 'active' },
  { id: 'text-stagger', label: 'Staggered lines', category: 'Typography', mobile: 'Yes', reduced: 'Yes', status: 'active' },
  { id: 'text-highlight', label: 'Text highlight', category: 'Typography', mobile: 'Yes', reduced: 'Yes', status: 'active' },
  { id: 'horizontal-gallery', label: 'Horizontal gallery', category: 'Horizontal', mobile: 'Fallback', reduced: 'Off', status: 'active' },
  { id: 'pin-scale', label: 'Pin + scale', category: 'Pinned', mobile: 'Fallback', reduced: 'Off', status: 'active' },
];

const SECTION_TYPES = [
  { id: 'hero', label: 'Project hero' },
  { id: 'text', label: 'Text introduction' },
  { id: 'story', label: 'Text story' },
  { id: 'full_image', label: 'Full width image' },
  { id: 'full_visual', label: 'Full screen visual' },
  { id: 'image_text', label: 'Image + text' },
  { id: 'two_image', label: 'Two image split' },
  { id: 'three_grid', label: 'Three image grid' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'before_after', label: 'Before / after' },
  { id: 'video', label: 'Video' },
  { id: 'quote', label: 'Quote' },
  { id: 'info', label: 'Project information' },
  { id: 'website_preview', label: 'Website preview' },
  { id: 'cta', label: 'Closing CTA' },
  { id: 'related', label: 'Related projects' },
];

const EASES = ['none', 'power2.out', 'power3.out', 'expo.out', 'sine.out'];
const STARTS = ['top 90%', 'top 80%', 'top 70%', 'top 50%', 'top bottom'];
const ENDS = ['top 20%', 'center center', 'bottom top', 'bottom center'];
const DIRECTIONS = ['up', 'down', 'left', 'right'];
const THEMES = ['default', 'cinematic', 'editorial', 'minimal'];
const INTENSITIES = ['low', 'medium', 'high'];

function clamp(n, min, max, fallback) {
  const x = Number(n);
  if (Number.isNaN(x)) return fallback;
  return Math.min(max, Math.max(min, x));
}

function sanitizeAnimation(raw = {}) {
  const preset = PRESETS.some((p) => p.id === raw.preset) ? raw.preset : 'fade-up';
  return {
    preset,
    start: STARTS.includes(raw.start) ? raw.start : 'top 80%',
    end: ENDS.includes(raw.end) ? raw.end : 'bottom top',
    scrub: raw.scrub === true || raw.scrub === '1' || raw.scrub === 'on',
    intensity: clamp(raw.intensity, 0.1, 1, 0.35),
    duration: clamp(raw.duration, 0.2, 2.5, 1),
    delay: clamp(raw.delay, 0, 1.5, 0),
    ease: EASES.includes(raw.ease) ? raw.ease : 'power3.out',
    direction: DIRECTIONS.includes(raw.direction) ? raw.direction : 'up',
  };
}

function sanitizeProjectAnimation(raw = {}) {
  return {
    intensity: INTENSITIES.includes(raw.intensity) ? raw.intensity : 'medium',
    theme: THEMES.includes(raw.theme) ? raw.theme : 'default',
    respect_reduced_motion: raw.respect_reduced_motion !== false && raw.respect_reduced_motion !== '0',
  };
}

function defaultSection(type = 'text') {
  return {
    id: `sec-${Date.now().toString(36)}`,
    type: SECTION_TYPES.some((t) => t.id === type) ? type : 'text',
    heading: '',
    text: '',
    media: [],
    video_url: '',
    animation: sanitizeAnimation({ preset: type === 'gallery' ? 'horizontal-gallery' : type === 'website_preview' ? 'pin-scale' : type === 'hero' ? 'scale-in' : 'fade-up' }),
  };
}

module.exports = {
  PRESETS,
  SECTION_TYPES,
  EASES,
  STARTS,
  ENDS,
  DIRECTIONS,
  THEMES,
  INTENSITIES,
  sanitizeAnimation,
  sanitizeProjectAnimation,
  defaultSection,
};
