/* MWG clone — interactions */
(function () {
  'use strict';

  var on = function (el, ev, fn) { if (el) el.addEventListener(ev, fn); };
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- preloader ---------- */
  window.addEventListener('load', function () {
    var pre = $('.preloader');
    if (pre) setTimeout(function () { pre.classList.add('is-done'); }, 350);
  });

  /* ---------- sticky header ---------- */
  var header = $('.site-header');
  var toTop = $('.to-top');
  function onScroll() {
    var y = window.pageYOffset;
    if (header) header.classList.toggle('is-stuck', y > 40);
    if (toTop) toTop.classList.toggle('is-visible', y > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  on(toTop, 'click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  /* ---------- mobile nav ---------- */
  var burger = $('.burger');
  var drawer = $('.mobile-nav');
  on(burger, 'click', function () {
    var open = burger.classList.toggle('is-open');
    if (drawer) drawer.classList.toggle('is-open', open);
    document.body.classList.toggle('no-scroll', open);
  });

  /* ---------- reveal on scroll ---------- */
  var items = $$('[data-reveal]');
  if ('IntersectionObserver' in window && items.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px' });
    items.forEach(function (el, i) {
      el.style.transitionDelay = (Math.min(i % 6, 5) * 70) + 'ms';
      io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- tabs ---------- */
  $$('[data-tabs]').forEach(function (root) {
    var btns = $$('.tabs__btn', root);
    var panels = $$('.tab-panel', root);
    btns.forEach(function (btn, i) {
      on(btn, 'click', function () {
        btns.forEach(function (b) { b.classList.remove('is-active'); });
        panels.forEach(function (p) { p.classList.remove('is-active'); });
        btn.classList.add('is-active');
        if (panels[i]) panels[i].classList.add('is-active');
      });
    });
  });

  /* ---------- portfolio filters ---------- */
  $$('[data-filterable]').forEach(function (root) {
    var btns = $$('.filter-btn', root);
    var cards = $$('.project-card', root);
    btns.forEach(function (btn) {
      on(btn, 'click', function () {
        var f = (btn.getAttribute('data-filter') || 'ALL').toUpperCase();
        btns.forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        cards.forEach(function (card) {
          var cat = (card.getAttribute('data-cat') || '').toUpperCase();
          card.classList.toggle('is-hidden', f !== 'ALL' && cat !== f);
        });
      });
    });
  });

  /* ---------- load more ---------- */
  $$('[data-load-more]').forEach(function (btn) {
    var target = document.getElementById(btn.getAttribute('data-load-more'));
    on(btn, 'click', function () {
      if (!target) return;
      var hidden = $$('.js-more', target);
      hidden.forEach(function (el) { el.classList.remove('js-more'); el.style.display = ''; });
      btn.style.display = 'none';
    });
  });

  /* ---------- simple slide counters (service pages) ---------- */
  $$('[data-slider]').forEach(function (root) {
    var dots = $$('.slider-dots button', root);
    var idx = 0;
    function set(i) {
      idx = (i + dots.length) % dots.length;
      dots.forEach(function (d, n) { d.classList.toggle('is-active', n === idx); });
    }
    dots.forEach(function (d, i) { on(d, 'click', function () { set(i); }); });
    on($('[data-slide-prev]', root), 'click', function () { set(idx - 1); });
    on($('[data-slide-next]', root), 'click', function () { set(idx + 1); });
    if (dots.length) { set(0); setInterval(function () { set(idx + 1); }, 5200); }
  });

  /* ---------- multiselect ---------- */
  $$('.multiselect').forEach(function (ms) {
    var toggle = $('.multiselect__toggle', ms);
    var all = $('.check--all input', ms);
    var boxes = $$('.multiselect__panel .check:not(.check--all) input', ms);
    var label = $('.multiselect__label', ms);

    function sync() {
      var picked = boxes.filter(function (b) { return b.checked; });
      if (label) {
        label.textContent = picked.length === 0
          ? 'Select Services'
          : (picked.length === boxes.length ? 'All Services' : picked.length + ' selected');
      }
      if (all) all.checked = picked.length === boxes.length && boxes.length > 0;
    }
    on(toggle, 'click', function (e) { e.preventDefault(); ms.classList.toggle('is-open'); });
    on(all, 'change', function () {
      boxes.forEach(function (b) { b.checked = all.checked; });
      sync();
    });
    boxes.forEach(function (b) { on(b, 'change', sync); });
    document.addEventListener('click', function (e) {
      if (!ms.contains(e.target)) ms.classList.remove('is-open');
    });
    sync();
  });

  /* ---------- forms ---------- */
  $$('form[data-mock-form]').forEach(function (form) {
    on(form, 'submit', function (e) {
      e.preventDefault();
      var ok = $('.form-success', form);
      if (ok) ok.classList.add('is-visible');
      form.reset();
      $$('.multiselect__label', form).forEach(function (l) { l.textContent = 'Select Services'; });
    });
  });

  /* ---------- duplicate marquee content for a seamless loop ---------- */
  $$('.marquee__track, .client-track').forEach(function (track) {
    if (track.getAttribute('data-cloned')) return;
    track.setAttribute('data-cloned', '1');
    track.innerHTML += track.innerHTML;
  });

  /* ---------- hide broken remote images gracefully ---------- */
  $$('img').forEach(function (img) {
    on(img, 'error', function () { img.style.opacity = '0'; });
  });
})();
