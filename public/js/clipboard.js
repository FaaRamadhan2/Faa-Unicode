const Clipboard = {
  async copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        return true;
      } catch {
        return false;
      } finally {
        document.body.removeChild(textarea);
      }
    }
  },

  copyChar(char) {
    return this.copy(char);
  },

  copyWithNotification(char, format) {
    this.copy(char).then(success => {
      if (success) {
        Toast.show(`Copied ${format}: ${char.length > 20 ? char.slice(0, 20) + '...' : char}`, 'success');
        if (char.length === 1 || (char.length > 1 && !char.startsWith('\\'))) {
          const charToStore = char.length === 1 ? char : char;
          const cp = Utils.getCodepoint(charToStore);
          Storage.addRecent({
            char: charToStore,
            codepoint: 'U+' + Utils.codepointToHex(cp),
            name: '',
          });
        }
      } else {
        Toast.show('Failed to copy', 'error');
      }
    });
  },
};
