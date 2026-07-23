(function () {
  const settings = Storage.getSettings();

  if (settings.theme === 'light') {
    document.documentElement.classList.add('theme-light');
  }

  if (settings.animations === 'disabled') {
    document.documentElement.classList.add('theme-animations-disabled');
  }

  if (settings.fontSize) {
    document.documentElement.classList.add('font-size-' + settings.fontSize);
  }

  document.addEventListener('click', (e) => {
    const hamburger = e.target.closest('.hamburger');
    if (hamburger) {
      document.querySelector('.sidebar')?.classList.toggle('open');
      document.querySelector('.sidebar-overlay')?.classList.toggle('active');
      return;
    }

    const overlay = e.target.closest('.sidebar-overlay');
    if (overlay) {
      document.querySelector('.sidebar')?.classList.remove('open');
      document.querySelector('.sidebar-overlay')?.classList.remove('active');
      return;
    }

    const sidebarLink = e.target.closest('.sidebar-nav a');
    if (sidebarLink && window.innerWidth <= 768) {
      document.querySelector('.sidebar')?.classList.remove('open');
      document.querySelector('.sidebar-overlay')?.classList.remove('active');
    }
  });

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const searchInput = document.querySelector('.search-bar input');
      if (searchInput) searchInput.focus();
    }
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  }

  Router.init();

  const currentPage = Router.getCurrentPage();

  if (currentPage === 'home' || currentPage === 'index') {
    initHomePage();
  } else if (currentPage === 'explorer') {
    initExplorerPage();
  } else if (currentPage === 'categories') {
    initCategoriesPage();
  } else if (currentPage === 'inspector') {
    initInspectorPage();
  } else if (currentPage === 'analyzer') {
    initAnalyzerPage();
  } else if (currentPage === 'nickname') {
    initNicknamePage();
  } else if (currentPage === 'favorites') {
    initFavoritesPage();
  } else if (currentPage === 'recent') {
    initRecentPage();
  } else if (currentPage === 'settings') {
    initSettingsPage();
  }

  async function initHomePage() {
    const statsContainer = document.getElementById('stats');
    const categoriesContainer = document.getElementById('home-categories');
    const recentContainer = document.getElementById('home-recent');
    const favContainer = document.getElementById('home-favorites');
    const randomContainer = document.getElementById('home-random');
    const searchInput = document.getElementById('home-search');

    await Search.loadData();

    if (statsContainer) {
      const data = Search.getData();
      statsContainer.innerHTML = `
        <div class="stat-grid">
          <div class="card stat-card"><div class="value">${data.length.toLocaleString()}</div><div class="label">Characters</div></div>
          <div class="card stat-card"><div class="value">${Search.getCategories().length}</div><div class="label">Categories</div></div>
          <div class="card stat-card"><div class="value">${Object.keys(CONFIG.ROUTES).length - 1}</div><div class="label">Tools</div></div>
          <div class="card stat-card"><div class="value">${Storage.getFavorites().length}</div><div class="label">Favorites</div></div>
        </div>
      `;
    }

    if (categoriesContainer) Render.categories(categoriesContainer);
    if (recentContainer) Render.recentList(recentContainer);
    if (favContainer) Render.favoritesList(favContainer);

    if (randomContainer) {
      const randomData = Unicode.getRandomChars(CONFIG.RANDOM_COUNT);
      Render.charCards(randomData, randomContainer);
    }

    if (searchInput) {
      searchInput.addEventListener('input', Utils.debounce((e) => {
        const q = e.target.value.trim();
        if (q.length > 0) {
          const results = Search.query(q);
          const container = document.getElementById('search-results');
          if (container) {
            container.style.display = results.length > 0 ? 'grid' : 'none';
            Render.charCards(results, container);
          }
        } else {
          const container = document.getElementById('search-results');
          if (container) container.style.display = 'none';
        }
      }, CONFIG.SEARCH_DEBOUNCE));
    }
  }

  async function initExplorerPage() {
    const container = document.getElementById('explorer-grid');
    const paginationContainer = document.getElementById('explorer-pagination');
    const searchInput = document.getElementById('explorer-search');
    const categoryTitle = document.getElementById('category-title');

    await Search.loadData();

    let currentPage = 1;
    let currentData = [];
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category');

    if (category && categoryTitle) {
      const cats = Search.getCategories();
      const found = cats.find(c => c.id === category);
      if (found) categoryTitle.textContent = found.name;
    }

    function getData() {
      if (category) {
        return Search.getByCategory(category);
      }
      return Search.getData();
    }

    function render() {
      currentData = getData();
      const totalPages = Render.charCards(currentData, container, currentPage);
      Render.pagination(currentPage, totalPages || 1, paginationContainer, (page) => {
        currentPage = page;
        render();
      });
    }

    render();

    if (searchInput) {
      searchInput.addEventListener('input', Utils.debounce((e) => {
        const q = e.target.value.trim();
        currentData = q ? Search.query(q) : getData();
        currentPage = 1;
        const totalPages = Render.charCards(currentData, container, currentPage);
        Render.pagination(currentPage, totalPages || 1, paginationContainer, (page) => {
          currentPage = page;
          render();
        });
      }, CONFIG.SEARCH_DEBOUNCE));
    }
  }

  async function initCategoriesPage() {
    const container = document.getElementById('categories-grid');
    await Search.loadData();
    Render.categories(container);
  }

  async function initInspectorPage() {
    const textarea = document.getElementById('inspector-input');
    const resultsContainer = document.getElementById('inspector-results');

    await Search.loadData();

    if (textarea && resultsContainer) {
      textarea.addEventListener('input', Utils.debounce(() => {
        const text = textarea.value;
        if (!text) {
          resultsContainer.innerHTML = '<div class="empty-state"><div class="icon">🔍</div><p>Type or paste text above to inspect codepoints</p></div>';
          return;
        }

        const chars = [...text];
        let html = '<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(300px,1fr))">';
        for (const char of chars) {
          const cp = Utils.getCodepoint(char);
          const hex = Utils.codepointToHex(cp);
          const utf8 = Utils.codepointToUtf8(cp);
          const utf16 = Utils.getUTF16(char);
          html += `
            <div class="card" style="cursor:pointer" data-char='${char.replace(/'/g, "&#39;")}'>
              <div style="display:flex;align-items:center;gap:1rem">
                <span style="font-size:2rem">${char}</span>
                <div>
                  <div style="font-family:var(--font-mono);font-size:0.875rem">U+${hex}</div>
                  <div style="font-size:0.75rem;color:var(--text-muted)">UTF-8: ${utf8}</div>
                  <div style="font-size:0.75rem;color:var(--text-muted)">UTF-16: ${utf16}</div>
                </div>
              </div>
            </div>
          `;
        }
        html += '</div>';
        resultsContainer.innerHTML = html;

        resultsContainer.querySelectorAll('.card').forEach(card => {
          card.addEventListener('click', () => {
            const char = card.dataset.char;
            const data = Search.getData().find(d => d.char === char) || { char, codepoint: 'U+' + Utils.codepointToHex(Utils.getCodepoint(char)), name: '' };
            Modal.showCharDetail(data);
          });
        });
      }, 200));
    }
  }

  async function initAnalyzerPage() {
    const textarea = document.getElementById('analyzer-input');
    const resultsContainer = document.getElementById('analyzer-results');

    if (textarea && resultsContainer) {
      textarea.addEventListener('input', Utils.debounce(() => {
        const text = textarea.value;
        if (!text) {
          resultsContainer.innerHTML = '';
          return;
        }

        const chars = Utils.countUnicodeChars(text);
        const bytes = Utils.getByteLength(text);
        const utf8 = Utils.getUtf8Size(text);
        const utf16 = Utils.getUtf16Size(text);
        const words = Utils.countWords(text);
        const lines = Utils.countLines(text);
        const emoji = Utils.countEmoji(text);

        resultsContainer.innerHTML = `
          <div class="analyzer-results">
            <div class="analyzer-item"><div class="value">${chars}</div><div class="label">Characters</div></div>
            <div class="analyzer-item"><div class="value">${bytes}</div><div class="label">Bytes</div></div>
            <div class="analyzer-item"><div class="value">${utf8}</div><div class="label">UTF-8 Size</div></div>
            <div class="analyzer-item"><div class="value">${utf16}</div><div class="label">UTF-16 Size</div></div>
            <div class="analyzer-item"><div class="value">${words}</div><div class="label">Words</div></div>
            <div class="analyzer-item"><div class="value">${lines}</div><div class="label">Lines</div></div>
            <div class="analyzer-item"><div class="value">${emoji}</div><div class="label">Emoji</div></div>
          </div>
        `;
      }, 300));
    }
  }

  async function initNicknamePage() {
    const input = document.getElementById('nickname-input');
    const outputContainer = document.getElementById('nickname-output');
    const generateBtn = document.getElementById('nickname-generate');
    const countBadge = document.getElementById('nickname-count');

    await Search.loadData();

    async function loadDecorations() {
      try {
        const res = await fetch('/data/nickname.json');
        return await res.json();
      } catch {
        return [];
      }
    }

    const decorations = await loadDecorations();

    function generate(name) {
      if (!name || !name.trim()) {
        outputContainer.innerHTML = '<div class="empty-state"><div class="icon">✏️</div><p>Enter a name to generate decorations</p></div>';
        if (countBadge) countBadge.textContent = '0';
        return;
      }

      const trimmed = name.trim();
      const results = decorations.map(d => d.left + trimmed + d.right);
      const unique = [...new Set(results)];

      let html = '<div class="nickname-output">';
      for (const nick of unique) {
        html += `<div class="nickname-item" data-nickname="${Utils.escapeHtml(nick)}">${Utils.escapeHtml(nick)}</div>`;
      }
      html += '</div>';
      outputContainer.innerHTML = html;
      if (countBadge) countBadge.textContent = unique.length;

      outputContainer.querySelectorAll('.nickname-item').forEach(item => {
        item.addEventListener('click', () => {
          Clipboard.copyWithNotification(item.dataset.nickname, 'Nickname');
        });
      });
    }

    if (input && generateBtn) {
      generateBtn.addEventListener('click', () => generate(input.value));
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') generate(input.value);
      });
      generate('ItsFaa');
    }
  }

  async function initFavoritesPage() {
    const container = document.getElementById('favorites-grid');
    const exportBtn = document.getElementById('favorites-export');
    const importBtn = document.getElementById('favorites-import');
    const importFile = document.getElementById('favorites-file');

    await Search.loadData();
    Render.favoritesList(container);

    if (exportBtn) {
      exportBtn.addEventListener('click', () => Storage.exportFavorites());
    }

    if (importBtn && importFile) {
      importBtn.addEventListener('click', () => importFile.click());
      importFile.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
          await Storage.importFavorites(file);
          Toast.show('Favorites imported successfully', 'success');
          Render.favoritesList(container);
        } catch (err) {
          Toast.show(err.message, 'error');
        }
        importFile.value = '';
      });
    }
  }

  async function initRecentPage() {
    const container = document.getElementById('recent-grid');
    const clearBtn = document.getElementById('recent-clear');

    await Search.loadData();
    Render.recentList(container);

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        Storage.setRecent([]);
        Render.recentList(container);
        Toast.show('Recent history cleared', 'info');
      });
    }
  }

  function initSettingsPage() {
    const themeSelect = document.getElementById('setting-theme');
    const fontSizeSelect = document.getElementById('setting-font-size');
    const animSelect = document.getElementById('setting-animations');
    const resetBtn = document.getElementById('setting-reset');

    const settings = Storage.getSettings();

    if (themeSelect) {
      themeSelect.value = settings.theme || 'dark';
      themeSelect.addEventListener('change', () => {
        const val = themeSelect.value;
        Storage.updateSetting('theme', val);
        document.documentElement.classList.toggle('theme-light', val === 'light');
      });
    }

    if (fontSizeSelect) {
      fontSizeSelect.value = settings.fontSize || 'medium';
      fontSizeSelect.addEventListener('change', () => {
        const val = fontSizeSelect.value;
        Storage.updateSetting('fontSize', val);
        document.documentElement.className = document.documentElement.className
          .replace(/font-size-\w+/g, '')
          .trim();
        document.documentElement.classList.add('font-size-' + val);
      });
    }

    if (animSelect) {
      animSelect.value = settings.animations || 'enabled';
      animSelect.addEventListener('change', () => {
        const val = animSelect.value;
        Storage.updateSetting('animations', val);
        document.documentElement.classList.toggle('theme-animations-disabled', val === 'disabled');
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        Storage.remove(CONFIG.STORAGE_KEYS.SETTINGS);
        location.reload();
      });
    }
  }
})();
