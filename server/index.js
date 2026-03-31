import express from 'express';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import { SocksProxyAgent } from 'socks-proxy-agent';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

const TOR_PROXY = 'socks5://127.0.0.1:9050';
const proxyAgent = new SocksProxyAgent(TOR_PROXY);

app.use(express.static(path.join(__dirname, '../dist')));

app.get('/api/proxy', async (req, res) => {
  const { url } = req.query;
  
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing url parameter' });
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
    status: 'available',
    message: 'Tor proxy endpoint ready at /api/proxy'
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
