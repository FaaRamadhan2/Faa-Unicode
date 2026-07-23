const Render = {
  charCards(data, container, page = 1, pageSize = CONFIG.PAGE_SIZE) {
    if (!container) return;
    if (!data || data.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="icon">🔍</div><p>No characters found</p></div>';
      return;
    }

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const pageData = data.slice(start, end);
    const totalPages = Math.ceil(data.length / pageSize);

    let html = '';
    for (const item of pageData) {
      const isFav = Storage.isFavorite(item.char) ? 'active' : '';
      const charStr = item.char.replace(/'/g, "&#39;");
      html += `
        <div class="char-card" data-char='${charStr}' data-data='${JSON.stringify(item).replace(/'/g, "&#39;")}'>
          <button class="fav-btn ${isFav}" data-fav="${item.char}" aria-label="Toggle favorite">${isFav ? '♥' : '♡'}</button>
          <button class="copy-char-btn" data-copy="${item.char}" aria-label="Copy character" title="Copy character">Copy</button>
          <div class="char">${item.char}</div>
          <div class="char-name" title="${Utils.escapeHtml(item.name || '')}">${item.name || 'Unknown'}</div>
          <div class="char-codepoint">${item.codepoint || 'U+' + Utils.codepointToHex(Utils.getCodepoint(item.char))}</div>
        </div>
      `;
    }
    container.innerHTML = html;

    container.querySelectorAll('.char-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.fav-btn')) return;
        if (e.target.closest('.copy-char-btn')) return;
        const data = JSON.parse(card.dataset.data);
        Modal.showCharDetail(data);
        if (data.char) {
          Storage.addRecent(data);
        }
      });
    });

    container.querySelectorAll('.copy-char-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        Clipboard.copyWithNotification(btn.dataset.copy, 'Character');
      });
    });

    container.querySelectorAll('.fav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const char = btn.dataset.fav;
        const cardData = Search.getData().find(d => d.char === char);
        if (!cardData) return;
        if (Storage.isFavorite(char)) {
          Storage.removeFavorite(char);
          btn.textContent = '♡';
          btn.classList.remove('active');
          Toast.show('Removed from favorites', 'info');
        } else {
          Storage.addFavorite(cardData);
          btn.textContent = '♥';
          btn.classList.add('active');
          Toast.show('Added to favorites', 'success');
        }
      });
    });

    return totalPages;
  },

  pagination(currentPage, totalPages, container, onPageChange) {
    if (!container) return;
    if (totalPages <= 1) {
      container.innerHTML = '';
      return;
    }

    let html = '';
    html += `<button class="prev" ${currentPage <= 1 ? 'disabled' : ''}>&laquo; Prev</button>`;

    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
      html += `<button data-page="1">1</button>`;
      if (startPage > 2) html += `<button disabled>...</button>`;
    }

    for (let i = startPage; i <= endPage; i++) {
      html += `<button data-page="${i}" class="${i === currentPage ? 'active' : ''}">${i}</button>`;
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) html += `<button disabled>...</button>`;
      html += `<button data-page="${totalPages}">${totalPages}</button>`;
    }

    html += `<button class="next" ${currentPage >= totalPages ? 'disabled' : ''}>Next &raquo;</button>`;

    container.innerHTML = html;

    container.querySelectorAll('[data-page]').forEach(btn => {
      btn.addEventListener('click', () => onPageChange(parseInt(btn.dataset.page)));
    });

    container.querySelector('.prev')?.addEventListener('click', () => {
      if (currentPage > 1) onPageChange(currentPage - 1);
    });

    container.querySelector('.next')?.addEventListener('click', () => {
      if (currentPage < totalPages) onPageChange(currentPage + 1);
    });
  },

  favoritesList(container) {
    if (!container) return;
    const favorites = Storage.getFavorites();
    if (favorites.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="icon">♡</div><p>No favorites yet</p></div>';
      return;
    }
    this.charCards(favorites, container);
  },

  recentList(container) {
    if (!container) return;
    const recent = Storage.getRecent();
    if (recent.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="icon">⏰</div><p>No recent characters</p></div>';
      return;
    }
    this.charCards(recent, container);
  },

  categories(container) {
    if (!container) return;
    const cats = Search.getCategories();
    if (!cats.length) {
      container.innerHTML = '<div class="empty-state"><p>No categories available</p></div>';
      return;
    }
    let html = '';
    for (const cat of cats) {
      html += `
        <div class="cat-card" data-category="${cat.id}">
          <div class="icon">${cat.icon}</div>
          <div class="name">${cat.name}</div>
        </div>
      `;
    }
    container.innerHTML = html;

    container.querySelectorAll('.cat-card').forEach(card => {
      card.addEventListener('click', () => {
        window.location.href = `/pages/explorer.html?category=${card.dataset.category}`;
      });
    });
  },
};
