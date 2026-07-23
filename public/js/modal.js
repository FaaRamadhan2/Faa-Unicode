const Modal = {
  open(contentHtml) {
    this.close();
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay fade-in';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    const modal = document.createElement('div');
    modal.className = 'modal scale-in';
    modal.innerHTML = contentHtml;
    overlay.appendChild(modal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.close();
    });
    document.addEventListener('keydown', this._keyHandler = (e) => {
      if (e.key === 'Escape') this.close();
    });
    document.body.appendChild(overlay);
    this._overlay = overlay;
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }
    const firstInput = modal.querySelector('input, button, textarea, [tabindex]');
    if (firstInput) firstInput.focus();
  },

  close() {
    if (this._overlay) {
      this._overlay.remove();
      this._overlay = null;
    }
    if (this._keyHandler) {
      document.removeEventListener('keydown', this._keyHandler);
      this._keyHandler = null;
    }
  },

  showCharDetail(charData) {
    const cp = Utils.getCodepoint(charData.char);
    const hex = Utils.codepointToHex(cp);
    const utf8 = Utils.codepointToUtf8(cp);
    const utf16 = Utils.getUTF16(charData.char);
    const binary = Utils.toBinary(cp);
    const htmlEntity = Utils.escapeHTML(charData.char);
    const cssEsc = Utils.escapeCSS(charData.char);
    const jsEsc = Utils.escapeJS(charData.char);
    const jsonEsc = Utils.escapeJSON(charData.char);
    const pyEsc = Utils.escapePython(charData.char);
    const javaEsc = Utils.escapeJava(charData.char);
    const goEsc = Utils.escapeGo(charData.char);
    const rustEsc = Utils.escapeRust(charData.char);
    const swiftEsc = Utils.escapeSwift(charData.char);
    const kotlinEsc = Utils.escapeKotlin(charData.char);
    const phpEsc = Utils.escapePHP(charData.char);
    const csEsc = Utils.escapeCSharp(charData.char);
    const isFav = Storage.isFavorite(charData.char);

    const content = `
      <div class="modal-header">
        <h3>Unicode Detail</h3>
        <button class="modal-close" aria-label="Close">&times;</button>
      </div>
      <div class="modal-body">
        <div class="char-preview">${charData.char}</div>
        <div class="detail-grid">
          <div class="detail-item"><span class="label">Character</span><span class="value">${charData.char}</span></div>
          <div class="detail-item"><span class="label">Codepoint</span><span class="value">${charData.codepoint || ('U+' + hex)}</span></div>
          <div class="detail-item"><span class="label">Name</span><span class="value">${charData.name || 'Unknown'}</span></div>
          <div class="detail-item"><span class="label">Block</span><span class="value">${charData.block || '-'}</span></div>
          <div class="detail-item"><span class="label">Category</span><span class="value">${charData.category || '-'}</span></div>
          <div class="detail-item"><span class="label">Decimal</span><span class="value">${cp}</span></div>
          <div class="detail-item"><span class="label">Hex</span><span class="value">${hex}</span></div>
          <div class="detail-item"><span class="label">Binary</span><span class="value">${binary}</span></div>
          <div class="detail-item"><span class="label">UTF-8</span><span class="value" style="font-size:0.75rem">${utf8}</span></div>
          <div class="detail-item"><span class="label">UTF-16</span><span class="value">${utf16}</span></div>
        </div>
        <div style="margin-top:1rem;display:grid;grid-template-columns:1fr 1fr;gap:0.5rem">
          ${this._copyBtn('HTML', htmlEntity)}
          ${this._copyBtn('CSS', cssEsc)}
          ${this._copyBtn('JavaScript', jsEsc)}
          ${this._copyBtn('JSON', jsonEsc)}
          ${this._copyBtn('Python', pyEsc)}
          ${this._copyBtn('Java', javaEsc)}
          ${this._copyBtn('Go', goEsc)}
          ${this._copyBtn('Rust', rustEsc)}
          ${this._copyBtn('Swift', swiftEsc)}
          ${this._copyBtn('Kotlin', kotlinEsc)}
          ${this._copyBtn('PHP', phpEsc)}
          ${this._copyBtn('C#', csEsc)}
        </div>
        <div style="margin-top:1rem;display:flex;gap:0.5rem">
          <button class="btn btn-primary" data-copy-char="${charData.char}" data-format="Character">Copy Character</button>
          <button class="btn btn-secondary" data-fav-char='${JSON.stringify(charData).replace(/'/g, '&#39;')}'>
            ${isFav ? '♥ Favorited' : '♡ Add to Favorites'}
          </button>
        </div>
      </div>
    `;

    this.open(content);

    setTimeout(() => {
      document.querySelector('[data-copy-char]')?.addEventListener('click', (e) => {
        const char = e.target.dataset.copyChar;
        const format = e.target.dataset.format;
        Clipboard.copyWithNotification(char, format);
      });

      document.querySelector('[data-fav-char]')?.addEventListener('click', (e) => {
        const data = JSON.parse(e.target.dataset.favChar);
        if (Storage.isFavorite(data.char)) {
          Storage.removeFavorite(data.char);
          e.target.textContent = '♡ Add to Favorites';
          Toast.show('Removed from favorites', 'info');
        } else {
          Storage.addFavorite(data);
          e.target.textContent = '♥ Favorited';
          Toast.show('Added to favorites', 'success');
        }
      });

      document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          Clipboard.copyWithNotification(btn.dataset.value, btn.dataset.format);
        });
      });
    }, 50);
  },

  _copyBtn(format, value) {
    return `<button class="copy-btn" data-format="${format}" data-value="${Utils.escapeHtml(value)}">${format}</button>`;
  },
};
