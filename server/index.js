import express from 'express';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import { SocksProxyAgent } from 'socks-proxy-agent';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

const TOR_PROXY = process.env.TOR_PROXY || 'socks5://localhost:9050';
const ALLOWED_HOSTS = process.env.ALLOWED_HOSTS || 'etherscan.io,bscscan.com,polygonscan.com,arbiscan.io,optimistic.etherscan.io,snowtrace.io,basescan.org,blockstream.info,api.trongrid.io,tronscan.org,solscan.io,blockchair.com';
const ALLOWED_HOSTS_LIST = ALLOWED_HOSTS.split(',').map(h => h.trim());

let proxyAgent = null;

try {
  proxyAgent = new SocksProxyAgent(TOR_PROXY);
  console.log(`Tor proxy configured: ${TOR_PROXY}`);
} catch (e) {
  console.log('Tor proxy not available, using direct connections');
}

function isAllowedHost(url: string): boolean {
  try {
    const urlObj = new URL(url);
    if (urlObj.protocol !== 'https:' && urlObj.protocol !== 'http:') {
      return false;
    }
    const hostname = urlObj.hostname.toLowerCase();
    return ALLOWED_HOSTS_LIST.some(host => hostname === host.toLowerCase());
  } catch {
    return false;
  }
}

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https: wss:;");
  next();
});

app.use(express.static(path.join(__dirname, '../dist'), {
  maxAge: '1y',
  etag: true,
  lastModified: true,
}));

app.use(express.json({ limit: '10kb' }));

const rateLimit = new Map();
const RATE_LIMIT = 100;
const RATE_WINDOW = 60000;

function rateLimitMiddleware(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, { count: 0, resetTime: now + RATE_WINDOW });
  }
  
  const userLimit = rateLimit.get(ip);
  
  if (now > userLimit.resetTime) {
    userLimit.count = 0;
    userLimit.resetTime = now + RATE_WINDOW;
  }
  
  userLimit.count++;
  
  if (userLimit.count > RATE_LIMIT) {
    return res.status(429).json({ error: 'Too many requests' });
  }
  
  next();
}

app.use(rateLimitMiddleware);

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: Date.now(),
    tor: proxyAgent ? 'active' : 'inactive'
  });
});

app.get('/api/proxy', async (req, res) => {
  const { url } = req.query;
  
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  if (!isAllowedHost(url)) {
    return res.status(403).json({ error: 'Host not allowed' });
  }

  try {
    const response = await axios.get(url, {
      httpAgent: proxyAgent,
      httpsAgent: proxyAgent,
      timeout: 30000,
    });
    res.json(response.data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(500).json({ error: 'Failed to fetch', details: error.message });
  }
});

app.post('/api/proxy', async (req, res) => {
  const { url, method = 'POST', data } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  if (!isAllowedHost(url)) {
    return res.status(403).json({ error: 'Host not allowed' });
  }

  try {
    const response = await axios({
      method,
      url,
      data,
      httpAgent: proxyAgent,
      httpsAgent: proxyAgent,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(500).json({ error: 'Failed to fetch', details: error.message });
  }
});

app.get('/api/tor-status', (req, res) => {
  res.json({ 
    status: proxyAgent ? 'active' : 'inactive',
    message: proxyAgent ? 'Tor VPN is active' : 'Tor VPN not configured'
  });
});

app.post('/api/vpn/connect', async (req, res) => {
  const { provider } = req.body;
  
  if (provider === 'tor') {
    if (proxyAgent) {
      return res.json({ success: true, message: 'Connected to Tor VPN', provider: 'tor' });
    }
    return res.json({ success: false, error: 'Tor proxy not configured on server' });
  }
  
  res.json({ success: false, error: 'Unknown provider' });
});

app.post('/api/vpn/disconnect', async (req, res) => {
  res.json({ success: true, message: 'Disconnected from VPN' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Tor VPN: ${proxyAgent ? 'Active' : 'Inactive'}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});