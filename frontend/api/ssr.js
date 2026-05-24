import serverModule from '../dist/server/server.js';

const server = serverModule && (serverModule.default ?? serverModule);

function headersFromNode(headersObj) {
  const headers = new Headers();
  for (const [key, value] of Object.entries(headersObj || {})) {
    if (value === undefined) continue;
    if (Array.isArray(value)) headers.set(key, value.join(','));
    else headers.set(key, String(value));
  }
  return headers;
}

async function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  try {
    if (!server || typeof server.fetch !== 'function') {
      res.statusCode = 500;
      res.end('Server entry not available');
      return;
    }

    const proto = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host || 'localhost';
    const url = `${proto}://${host}${req.url}`;

    const headers = headersFromNode(req.headers);

    let body;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      body = await getRequestBody(req);
      if (body && body.length === 0) body = undefined;
    }

    const request = new Request(url, {
      method: req.method,
      headers,
      body,
    });

    const response = await server.fetch(request, {}, {});

    res.statusCode = response.status;
    // copy headers
    response.headers.forEach((value, key) => {
      // Node will set its own transfer-encoding
      if (key.toLowerCase() === 'transfer-encoding') return;
      res.setHeader(key, value);
    });

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.end(buffer);
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
}
