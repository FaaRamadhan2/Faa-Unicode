# FaaUnicode

A professional Unicode Explorer — browse, search, copy, and analyze Unicode characters with a modern dark-themed interface.

## Features

- Browse thousands of Unicode characters by category
- Instant search by character, name, hex, or keyword
- Copy characters and escape sequences (HTML, CSS, JS, JSON, Python, etc.)
- Unicode Inspector — inspect every codepoint in any text
- Text Analyzer — character count, byte length, UTF-8/16 size, word count, emoji count
- Nickname Generator — hundreds of decorated name styles
- Favorites (LocalStorage) — export/import JSON
- Recent History (last 100 copied characters)
- Fully offline after initial load (PWA with Service Worker)
- Responsive — Desktop, Tablet, Mobile

## Tech Stack

- HTML5, CSS3, Vanilla JavaScript (ES2022)
- Node.js (development server only)
- Static website — deploy anywhere

## Installation

```bash
npm install
npm start
```

Open http://localhost:20200

## Deploy to Vercel

Connect your GitHub repository to Vercel. The `vercel.json` is already configured.

## Project Structure

```
FaaUnicode/
├── server.js
├── package.json
├── vercel.json
├── public/
│   ├── index.html
│   ├── css/
│   ├── js/
│   ├── data/
│   ├── pages/
│   ├── components/
│   ├── assets/
│   └── ...
```

## License

MIT
