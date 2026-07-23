const Search = {
  data: [],
  categories: [],

  async loadData() {
    const sources = [
      { file: '/data/unicode.json', source: 'unicode' },
      { file: '/data/emoji.json', source: 'emoji' },
      { file: '/data/symbols.json', source: 'symbols' },
      { file: '/data/extra.json', source: 'extra' },
      { file: '/data/extra2.json', source: 'extra' },
      { file: '/data/extra3.json', source: 'extra' },
      { file: '/data/invisible.json', source: 'extra' },
      { file: '/data/extra4.json', source: 'extra' },
      { file: '/data/extra5.json', source: 'extra' },
    ];

    const results = await Promise.allSettled(
      sources.map(s => fetch(s.file).then(r => r.json()).then(d => d.map(e => ({ ...e, source: s.source }))))
    );

    this.data = [];
    for (const r of results) {
      if (r.status === 'fulfilled') {
        this.data.push(...r.value);
      } else {
        console.warn('Failed to load data source:', r.reason);
      }
    }

    try {
      const catRes = await fetch('/data/categories.json');
      this.categories = await catRes.json();
    } catch (err) {
      console.warn('Failed to load categories:', err);
      this.categories = [];
    }
  },

  getData() {
    return this.data;
  },

  getCategories() {
    return this.categories;
  },

  getByCategory(categoryId) {
    const nameKeywords = {
      'rare-unicode': ['MEDEFAIDRIN', 'CUNEIFORM', 'EGYPTIAN', 'PHOENICIAN', 'RUNIC', 'OLD TURKIC', 'OLD PERSIAN', 'GOTHIC', 'OSAGE', 'DESERET', 'SHAVIAN', 'CAUCASIAN', 'BAMUM', 'ADLAM', 'OLD SOUTH'],
      'decorative': ['ORNAMENT', 'FLEURON', 'FLORAL', 'ROSETTE', 'DECORATION', 'HEART BULLET'],
      'emoji': [],
      'rare-emoji': ['FACE', 'SKULL', 'GHOST', 'ALIEN', 'ROBOT', 'OGRE', 'GOBLIN', 'DRAGON', 'MERMAID', 'ELF', 'FAIRY', 'VAMPIRE', 'ZOMBIE', 'GENIE'],
      'stars': ['STAR'],
      'hearts': ['HEART'],
      'flowers': ['FLOWER', 'CHERRY BLOSSOM', 'ROSE', 'HIBISCUS', 'SUNFLOWER', 'TULIP', 'BLOSSOM', 'SEEDLING', 'FOUR LEAF'],
      'arrows': ['ARROW'],
      'chess': ['CHESS'],
      'cards': ['SUIT', 'PLAYING CARD', 'JOKER'],
      'weather': ['SUN', 'CLOUD', 'UMBRELLA', 'SNOWMAN', 'COMET', 'THERMOMETER', 'RAINBOW', 'WATER WAVE', 'VOLCANO', 'MOON'],
      'music': ['MUSICAL', 'NOTE', 'CLEF', 'SHARP', 'FLAT', 'FERMATA'],
      'math': ['SUMMATION', 'PRODUCT', 'INTEGRAL', 'SQUARE ROOT', 'INFINITY', 'PI', 'DELTA', 'PARTIAL', 'EMPTY SET', 'ELEMENT OF', 'SUBSET', 'SUPERSET', 'UNION', 'INTERSECTION', 'FOR ALL', 'THERE EXISTS', 'BECAUSE', 'THEREFORE', 'IDENTICAL', 'EQUAL TO', 'PLUS-MINUS', 'MULTIPLICATION', 'DIVISION', 'MATHEMATICAL', 'N-ARY'],
      'currency': ['SIGN', 'DOLLAR', 'CENT', 'POUND', 'YEN', 'EURO', 'RUBLE', 'RUPEE', 'WON', 'SHEQEL', 'DONG', 'KIP', 'TUGRIK', 'PESO', 'GUARANI', 'HRYVNIA', 'CEDI', 'LIVRE', 'SPESMILO', 'TENGE', 'LIRA', 'MANAT', 'BITCOIN'],
      'braille': ['BRAILLE'],
      'japanese': ['HIRAGANA', 'KATAKANA'],
      'chinese': ['CJK UNIFIED'],
      'korean': ['HANGUL'],
      'arabic': ['ARABIC LETTER'],
      'roman-numerals': ['ROMAN NUMERAL'],
      'superscript': ['SUPERSCRIPT'],
      'subscript': ['SUBSCRIPT'],
      'invisible': ['ZERO WIDTH', 'JOINER', 'WORD JOINER', 'INVISIBLE', 'GRAPHEME JOINER', 'VOWEL SEPARATOR'],
      'spaces': ['SPACE', 'NO-BREAK', 'FIGURE SPACE', 'PUNCTUATION SPACE', 'IDEOGRAPHIC'],
      'combining': ['COMBINING'],
      'box-drawing': ['BOX DRAWINGS'],
      'block-elements': ['BLOCK', 'UPPER HALF', 'LOWER HALF', 'FULL BLOCK', 'LEFT HALF', 'RIGHT HALF', 'EIGHTH'],
      'geometric': ['TRIANGLE', 'CIRCLE', 'SQUARE', 'DIAMOND', 'PENTAGON', 'HEXAGON', 'FISHEYE', 'DOTTED CIRCLE'],
      'ancient': ['ANCIENT', 'HIEROGLYPH', 'CUNEIFORM', 'RUNIC', 'OLD SOUTH', 'PHOENICIAN', 'GOTHIC', 'OSAGE', 'DESERET', 'SHAVIAN', 'ADLAM', 'BAMUM', 'MEDEFAIDRIN'],
      'fantasy': ['ALCHEMICAL', 'UNICORN', 'MERMAID', 'ELF', 'FAIRY', 'VAMPIRE', 'ZOMBIE', 'GENIE', 'DRAGON'],
      'gaming': ['VIDEO GAME', 'JOYSTICK', 'GAME DIE', 'SLOT MACHINE', 'CHESS', 'DIE FACE'],
      'misc': ['WARNING', 'NO ENTRY', 'COPYRIGHT', 'REGISTERED', 'TRADE MARK', 'SERVICE MARK', 'NUMERO', 'TELEPHONE', 'HOURGLASS', 'WATCH', 'VOLTAGE', 'RECYCLING', 'WHEELCHAIR', 'ANKH', 'CROSS', 'PEACE', 'YIN YANG', 'DHARMA', 'FLEUR-DE-LIS', 'ATOM', 'GEAR', 'ALEMBIC', 'STAFF OF', 'CADUCEUS', 'PLACE OF', 'INPUT', 'BUTTON', 'BALLOT', 'POWER', 'SOS', 'VS', 'KOKO', 'PROHIBITED', 'VACANCY', 'PASSING', 'DISCOUNT', 'BARGAIN', 'ACCEPTABLE', 'MEDIUM WHITE', 'MEDIUM BLACK', 'LARGE RED', 'LARGE ORANGE', 'LARGE YELLOW', 'LARGE GREEN', 'LARGE BLUE', 'LARGE PURPLE', 'LARGE BROWN', 'TRIGRAM', 'MERCURY', 'FEMALE', 'MALE', 'JUPITER', 'SATURN', 'URANUS', 'NEPTUNE', 'PLUTO', 'CONJUNCTION', 'OPPOSITION', 'ASCENDING', 'DESCENDING'],
    };

    if (categoryId === 'emoji') {
      return this.data.filter(d => d.source === 'emoji');
    }

    const keywords = nameKeywords[categoryId];
    if (!keywords || keywords.length === 0) return [];

    return this.data.filter(d => {
      const name = (d.name || '').toUpperCase();
      return keywords.some(k => name.includes(k));
    });
  },

  query(text) {
    if (!text || text.length === 0) return this.data;

    const q = text.toLowerCase().trim();

    return this.data.filter(d => {
      if (d.char === q) return true;
      if (d.char.toLowerCase().includes(q)) return true;
      if (d.name && d.name.toLowerCase().includes(q)) return true;
      if (d.codepoint && d.codepoint.toLowerCase() === q) return true;
      if (d.codepoint && d.codepoint.toLowerCase().includes(q)) return true;
      const cp = 'U+' + Utils.getCodepoint(d.char).toString(16).toUpperCase();
      if (cp.toLowerCase().includes(q)) return true;
      return false;
    });
  },
};
