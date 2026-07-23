const Storage = {
  get(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      console.warn('Storage full or unavailable');
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {
    }
  },

  getFavorites() {
    return this.get(CONFIG.STORAGE_KEYS.FAVORITES) || [];
  },

  setFavorites(favorites) {
    this.set(CONFIG.STORAGE_KEYS.FAVORITES, favorites);
  },

  addFavorite(charData) {
    const favorites = this.getFavorites();
    if (!favorites.some(f => f.char === charData.char)) {
      favorites.unshift(charData);
      this.setFavorites(favorites);
    }
    return favorites;
  },

  removeFavorite(char) {
    let favorites = this.getFavorites();
    favorites = favorites.filter(f => f.char !== char);
    this.setFavorites(favorites);
    return favorites;
  },

  isFavorite(char) {
    return this.getFavorites().some(f => f.char === char);
  },

  getRecent() {
    return this.get(CONFIG.STORAGE_KEYS.RECENT) || [];
  },

  setRecent(recent) {
    this.set(CONFIG.STORAGE_KEYS.RECENT, recent);
  },

  addRecent(charData) {
    let recent = this.getRecent();
    recent = recent.filter(r => r.char !== charData.char);
    recent.unshift(charData);
    if (recent.length > CONFIG.RECENT_LIMIT) {
      recent = recent.slice(0, CONFIG.RECENT_LIMIT);
    }
    this.setRecent(recent);
    return recent;
  },

  getSettings() {
    return this.get(CONFIG.STORAGE_KEYS.SETTINGS) || {};
  },

  setSettings(settings) {
    this.set(CONFIG.STORAGE_KEYS.SETTINGS, settings);
  },

  updateSetting(key, value) {
    const settings = this.getSettings();
    settings[key] = value;
    this.setSettings(settings);
  },

  exportFavorites() {
    const favorites = this.getFavorites();
    const blob = new Blob([JSON.stringify(favorites, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'faunicode-favorites.json';
    a.click();
    URL.revokeObjectURL(url);
  },

  importFavorites(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (Array.isArray(data)) {
            this.setFavorites(data);
            resolve(data);
          } else {
            reject(new Error('Invalid format'));
          }
        } catch {
          reject(new Error('Invalid JSON'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  },
};
