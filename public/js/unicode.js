const Unicode = {
  planes: [
    { code: 0, name: 'Basic Multilingual Plane (BMP)', range: 'U+0000 - U+FFFF' },
    { code: 1, name: 'Supplementary Multilingual Plane (SMP)', range: 'U+10000 - U+1FFFF' },
    { code: 2, name: 'Supplementary Ideographic Plane (SIP)', range: 'U+20000 - U+2FFFF' },
    { code: 3, name: 'Tertiary Ideographic Plane (TIP)', range: 'U+30000 - U+3FFFF' },
    { code: 14, name: 'Supplementary Special-purpose Plane (SSP)', range: 'U+E0000 - U+EFFFF' },
    { code: 15, name: 'Supplementary Private Use Area-A', range: 'U+F0000 - U+FFFFF' },
    { code: 16, name: 'Supplementary Private Use Area-B', range: 'U+100000 - U+10FFFF' },
  ],

  getPlane(codepoint) {
    const cp = typeof codepoint === 'string' ? parseInt(codepoint.replace('U+', ''), 16) : codepoint;
    const plane = Math.floor(cp / 0x10000);
    return this.planes.find(p => p.code === plane) || { code: plane, name: `Plane ${plane}`, range: '' };
  },

  getCategoryName(cat) {
    const map = {
      'Lu': 'Uppercase Letter',
      'Ll': 'Lowercase Letter',
      'Lt': 'Titlecase Letter',
      'Lm': 'Modifier Letter',
      'Lo': 'Other Letter',
      'Mn': 'Nonspacing Mark',
      'Mc': 'Spacing Mark',
      'Me': 'Enclosing Mark',
      'Nd': 'Decimal Number',
      'Nl': 'Letter Number',
      'No': 'Other Number',
      'Pc': 'Connector Punctuation',
      'Pd': 'Dash Punctuation',
      'Ps': 'Open Punctuation',
      'Pe': 'Close Punctuation',
      'Pi': 'Initial Punctuation',
      'Pf': 'Final Punctuation',
      'Po': 'Other Punctuation',
      'Sm': 'Math Symbol',
      'Sc': 'Currency Symbol',
      'Sk': 'Modifier Symbol',
      'So': 'Other Symbol',
      'Zs': 'Space Separator',
      'Zl': 'Line Separator',
      'Zp': 'Paragraph Separator',
      'Cc': 'Control',
      'Cf': 'Format',
      'Cs': 'Surrogate',
      'Co': 'Private Use',
      'Cn': 'Unassigned',
    };
    return map[cat] || cat || '-';
  },

  getRandomChars(count = 24) {
    const data = Search.getData();
    if (!data.length) return [];
    const shuffled = [...data].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  },

  getRandomHearts(count = 12) {
    const hearts = Search.getByCategory('hearts');
    const shuffled = [...hearts].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  },

  getRandomStars(count = 12) {
    const stars = Search.getByCategory('stars');
    const shuffled = [...stars].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  },
};
