const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 20200;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

function serveFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        serve404(res);
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
      return;
    }
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
}

function serve404(res) {
  const filePath = path.join(PUBLIC_DIR, 'pages', '404.html');
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(data);
  });
}

function log(method, url, status) {
  const ts = new Date().toLocaleTimeString();
  console.log(`[${ts}] ${method} ${url} ${status}`);
}

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];

  if (urlPath === '/' || urlPath === '') {
    urlPath = '/index.html';
  }

  let filePath = path.join(PUBLIC_DIR, urlPath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    serve404(res);
    log(req.method, req.url, 404);
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || stats.isDirectory()) {
      const indexPath = path.join(filePath, 'index.html');
      fs.stat(indexPath, (err2, stats2) => {
        if (!err2 && stats2.isFile()) {
          serveFile(res, indexPath);
          log(req.method, req.url, 200);
        } else {
          serveFile(res, path.join(PUBLIC_DIR, 'pages', urlPath + '.html'), () => {
            serve404(res);
            log(req.method, req.url, 404);
          });
        }
      });
      return;
    }
    serveFile(res, filePath);
    log(req.method, req.url, 200);
  });
});

server.listen(PORT, () => {
  console.log('');
  console.log('  FaaUnicode Server');
  console.log('  ────────────────');
  console.log(`  Local:   http://localhost:${PORT}`);
  console.log('');
});

function shutdown() {
  console.log('\n  Shutting down gracefully...');
  server.close(() => {
    console.log('  Server closed.');
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
