(() => {
  function initServiceTabs() {
    const section = document.querySelector('.services-showcase-section, #services');
    if (!section) return;

    const tabs = Array.from(section.querySelectorAll('.svc-tab-btn'));
    const panes = Array.from(section.querySelectorAll('.svc-pane'));
    if (!tabs.length || !panes.length) return;

    function switchTab(targetId) {
      tabs.forEach((tab) => {
        const isActive = tab.dataset.tab === targetId;
        tab.classList.toggle('is-active', isActive);
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      panes.forEach((pane) => {
        const isActive = pane.id === `svc-pane-${targetId}` || pane.dataset.pane === targetId;
        pane.classList.toggle('is-active', isActive);
      });
    }

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        if (target) switchTab(target);
      });

      tab.addEventListener('keydown', (e) => {
        let newIndex = index;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          newIndex = (index + 1) % tabs.length;
          tabs[newIndex].focus();
          tabs[newIndex].click();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          newIndex = (index - 1 + tabs.length) % tabs.length;
          tabs[newIndex].focus();
          tabs[newIndex].click();
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initServiceTabs);
  } else {
    initServiceTabs();
  }
})();
