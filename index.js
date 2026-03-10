const express = require('express');
const puppeteer = require('puppeteer');
const http = require('http');
const https = require('https');
const url = require('url');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

let browser;

// Initialize Puppeteer browser
async function initBrowser() {
  browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
}

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Serve the main HTML interface
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Proxy endpoint
app.post('/proxy', async (req, res) => {
  const { targetUrl, method = 'GET', headers = {}, body = null } = req.body;

  if (!targetUrl) {
    return res.status(400).json({ error: 'targetUrl is required' });
  }

  try {
    const page = await browser.newPage();
    
    // Set request interception to modify headers if needed
    await page.setRequestInterception(true);

    page.on('request', (request) => {
      request.continue();
    });

    // Navigate to the target URL
    await page.goto(targetUrl, { waitUntil: 'networkidle2' });

    // Get page content
    const content = await page.content();
    const cookies = await page.cookies();

    res.json({
      success: true,
      content: content,
      cookies: cookies,
      url: page.url()
    });

    await page.close();
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch content',
      message: error.message
    });
  }
});

// HTTP/HTTPS request proxy endpoint
app.post('/fetch', async (req, res) => {
  const { targetUrl, method = 'GET', headers = {} } = req.body;

  if (!targetUrl) {
    return res.status(400).json({ error: 'targetUrl is required' });
  }

  try {
    const parsedUrl = url.parse(targetUrl);
    const protocol = parsedUrl.protocol === 'https:' ? https : http;

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.path,
      method: method,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ...headers
      }
    };

    const proxyReq = protocol.request(options, (proxyRes) => {
      let data = '';

      proxyRes.on('data', (chunk) => {
        data += chunk;
      });

      proxyRes.on('end', () => {
        res.json({
          success: true,
          status: proxyRes.statusCode,
          headers: proxyRes.headers,
          body: data
        });
      });
    });

    proxyReq.on('error', (error) => {
      res.status(500).json({
        error: 'Failed to fetch content',
        message: error.message
      });
    });

    proxyReq.end();
  } catch (error) {
    res.status(500).json({
      error: 'Failed to process request',
      message: error.message
    });
  }
});

// Start server
async function startServer() {
  await initBrowser();
  
  app.listen(PORT, () => {
    console.log(`Proxy server running at http://localhost:${PORT}`);
  });
}

// Graceful shutdown
process.on('SIGINT', async () => {
  if (browser) {
    await browser.close();
  }
  process.exit();
});

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
