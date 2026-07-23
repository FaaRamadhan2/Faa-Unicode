const Utils = {
  debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  },

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  },

  codepointToHex(cp) {
    return cp.toString(16).toUpperCase().padStart(4, '0');
  },

  codepointToUtf8(cp) {
    const bytes = [];
    if (cp < 0x80) {
      bytes.push(cp);
    } else if (cp < 0x800) {
      bytes.push(0xC0 | (cp >> 6));
      bytes.push(0x80 | (cp & 0x3F));
    } else if (cp < 0x10000) {
      bytes.push(0xE0 | (cp >> 12));
      bytes.push(0x80 | ((cp >> 6) & 0x3F));
      bytes.push(0x80 | (cp & 0x3F));
    } else {
      bytes.push(0xF0 | (cp >> 18));
      bytes.push(0x80 | ((cp >> 12) & 0x3F));
      bytes.push(0x80 | ((cp >> 6) & 0x3F));
      bytes.push(0x80 | (cp & 0x3F));
    }
    return bytes.map(b => '\\x' + b.toString(16).toUpperCase().padStart(2, '0')).join('');
  },

  getCodepoint(char) {
    return char.codePointAt(0);
  },

  getCharFromCodepoint(cp) {
    return String.fromCodePoint(cp);
  },

  toBinary(num) {
    return num.toString(2).padStart(8, '0');
  },

  escapeJS(char) {
    const cp = char.codePointAt(0);
    if (cp < 0x10000) {
      return '\\u' + cp.toString(16).toUpperCase().padStart(4, '0');
    }
    const high = 0xD800 + ((cp - 0x10000) >> 10);
    const low = 0xDC00 + ((cp - 0x10000) & 0x3FF);
    return '\\u' + high.toString(16).toUpperCase() + '\\u' + low.toString(16).toUpperCase();
  },

  escapeJSON(char) {
    return this.escapeJS(char);
  },

  escapeCSS(char) {
    const cp = char.codePointAt(0);
    return '\\' + cp.toString(16).toLowerCase() + ' ';
  },

  escapeHTML(char) {
    const cp = char.codePointAt(0);
    return '&#' + cp + ';';
  },

  escapePython(char) {
    const cp = char.codePointAt(0);
    if (cp < 0x10000) {
      return '\\u' + cp.toString(16).toUpperCase().padStart(4, '0');
    }
    return '\\U' + cp.toString(16).toUpperCase().padStart(8, '0');
  },

  escapeJava(char) {
    return this.escapeJS(char);
  },

  escapeGo(char) {
    const cp = char.codePointAt(0);
    return '\\u' + cp.toString(16).toUpperCase().padStart(4, '0');
  },

  escapeRust(char) {
    const cp = char.codePointAt(0);
    return '\\u{' + cp.toString(16).toLowerCase() + '}';
  },

  escapeSwift(char) {
    const cp = char.codePointAt(0);
    return '\\u{' + cp.toString(16).toUpperCase() + '}';
  },

  escapeKotlin(char) {
    return this.escapeJS(char);
  },

  escapePHP(char) {
    const cp = char.codePointAt(0);
    return '\\u{' + cp.toString(16).toUpperCase() + '}';
  },

  escapeCSharp(char) {
    const cp = char.codePointAt(0);
    return '\\u' + cp.toString(16).toUpperCase().padStart(4, '0');
  },

  getUTF16(char) {
    const cp = char.codePointAt(0);
    if (cp < 0x10000) {
      return cp.toString(10);
    }
    const high = 0xD800 + ((cp - 0x10000) >> 10);
    const low = 0xDC00 + ((cp - 0x10000) & 0x3FF);
    return high + ', ' + low;
  },

  countEmoji(text) {
    const emojiRegex = /\p{Emoji_Presentation}|\p{Emoji}\uFE0F/gu;
    const matches = text.match(emojiRegex);
    return matches ? matches.length : 0;
  },

  countUnicodeChars(text) {
    return [...text].length;
  },

  countWords(text) {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  },

  countLines(text) {
    if (!text) return 0;
    return text.split(/\r?\n/).length;
  },

  getByteLength(text) {
    return new TextEncoder().encode(text).length;
  },

  getUtf8Size(text) {
    return new TextEncoder().encode(text).length;
  },

  getUtf16Size(text) {
    let size = 0;
    for (const char of text) {
      const cp = char.codePointAt(0);
      size += cp < 0x10000 ? 2 : 4;
    }
    return size;
  },
};
