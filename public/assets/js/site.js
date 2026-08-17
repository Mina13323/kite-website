(() => {
  const header = document.querySelector('.site-header');
  const menuBtn = document.querySelector('.menu-btn');
  const mobile = document.querySelector('.mobile-nav');

  const onScroll = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 20);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if (menuBtn && mobile) {
    menuBtn.addEventListener('click', () => {
      mobile.classList.toggle('open');
      document.body.style.overflow = mobile.classList.contains('open') ? 'hidden' : '';
    });
  }

  document.querySelectorAll('.about-tabs button').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.about-tabs button').forEach((b) => b.classList.remove('is-on'));
      document.querySelectorAll('.about-panel').forEach((p) => (p.hidden = true));
      btn.classList.add('is-on');
      const panel = document.getElementById(btn.dataset.panel);
      if (panel) panel.hidden = false;
    });
  });

  document.querySelectorAll('[data-filter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.filter;
      document.querySelectorAll('[data-filter]').forEach((b) => b.classList.remove('is-on'));
      btn.classList.add('is-on');
      document.querySelectorAll('[data-cat]').forEach((card) => {
        card.style.display = key === 'all' || card.dataset.cat === key ? '' : 'none';
      });
    });
  });

  const dd = document.querySelector('.services-dd');
  if (dd) {
    const toggle = dd.querySelector('[data-services-toggle]');
    toggle?.addEventListener('click', (e) => {
      e.preventDefault();
      dd.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
      if (!dd.contains(e.target)) dd.classList.remove('open');
    });
    const boxes = dd.querySelectorAll('input[type="checkbox"]');
    const selectAll = dd.querySelector('[data-select-all]');
    selectAll?.addEventListener('change', () => {
      boxes.forEach((b) => {
        if (b !== selectAll) b.checked = selectAll.checked;
      });
    });
  }

  document.querySelectorAll('form[data-lead]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const note = form.querySelector('.form-note');
      if (note) {
        note.style.display = 'block';
        note.textContent = 'Thank you. Our team will get in touch shortly.';
      }
      form.reset();
    });
  });

  const path = location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav a[href]').forEach((a) => {
    const href = a.getAttribute('href');
    if (!href || href === '#') return;
    if (href === path || (href !== '/' && path.startsWith(href))) {
      a.classList.add('is-active');
    }
  });
})();
