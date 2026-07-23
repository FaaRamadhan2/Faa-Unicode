const Router = {
  init() {
    document.querySelectorAll('[data-nav]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href) {
          this.navigate(href);
        }
      });
    });

    this.highlightActive();
  },

  navigate(url) {
    window.location.href = url;
  },

  highlightActive() {
    const current = window.location.pathname;
    document.querySelectorAll('[data-nav]').forEach(link => {
      const href = link.getAttribute('href');
      link.classList.toggle('active', href === current || (current === '/' && href === '/'));
    });
  },

  getCurrentPage() {
    const path = window.location.pathname;
    if (path === '/' || path === '/index.html') return 'home';
    return path.replace('/pages/', '').replace('.html', '');
  },
};
