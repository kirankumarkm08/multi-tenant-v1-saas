const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const httpProxy = require('http-proxy-middleware');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

// Disable SSL verification for development
if (dev) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      const { pathname } = parsedUrl;

      // Handle API proxy
      if (pathname.startsWith('/api')) {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://165.227.182.17/api';
        const target = apiBase.replace('/api', '');
        
        const proxy = httpProxy.createProxyMiddleware({
          target: target,
          changeOrigin: true,
          secure: false, // Allow self-signed certificates
          pathRewrite: {
            '^/api': '/api',
          },
          onError: (err, req, res) => {
            console.error('Proxy error:', err);
            res.status(500).json({ error: 'Proxy error', details: err.message });
          },
        });
        
        return proxy(req, res);
      }

      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});