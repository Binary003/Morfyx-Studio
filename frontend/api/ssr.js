import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import serverModule from '../dist/server/server.js';

const server = serverModule && (serverModule.default ?? serverModule);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

function contentTypeForExt(ext) {
    switch (ext.toLowerCase()) {
        case '.js':
        case '.mjs':
            return 'application/javascript; charset=utf-8';
        case '.css':
            return 'text/css; charset=utf-8';
        case '.svg':
            return 'image/svg+xml';
        case '.png':
            return 'image/png';
        case '.jpg':
        case '.jpeg':
            return 'image/jpeg';
        case '.json':
            return 'application/json; charset=utf-8';
        case '.wasm':
            return 'application/wasm';
        case '.html':
            return 'text/html; charset=utf-8';
        case '.map':
            return 'application/json; charset=utf-8';
        default:
            return 'application/octet-stream';
    }
}

async function tryServeStatic(req, res) {
    try {
        const baseUrl = new URL(req.url, 'http://localhost');
        const pathname = decodeURIComponent(baseUrl.pathname);

        // Map requests to files under dist/client
        const clientRoot = path.join(__dirname, '..', 'dist', 'client');

        // Serve root HTML if requesting '/index.html' explicitly
        let candidate = path.join(clientRoot, pathname);

        // If pathname ends with '/', serve index.html in that folder
        if (pathname.endsWith('/')) {
            candidate = path.join(clientRoot, pathname, 'index.html');
        }

        // If requesting '/', try clientRoot/index.html
        if (pathname === '/') {
            candidate = path.join(clientRoot, 'index.html');
        }

        // If the file exists, stream it
        try {
            const stat = await fs.promises.stat(candidate);
            if (stat.isFile()) {
                const ext = path.extname(candidate);
                const ct = contentTypeForExt(ext);
                res.statusCode = 200;
                res.setHeader('content-type', ct);
                const stream = fs.createReadStream(candidate);
                stream.pipe(res);
                return true;
            }
        } catch (e) {
            // file not found; try assets directory fallback
        }

        // assets fallback: /assets/* -> dist/client/assets/*
        if (pathname.startsWith('/assets/')) {
            const assetPath = path.join(clientRoot, pathname);
            try {
                const stat = await fs.promises.stat(assetPath);
                if (stat.isFile()) {
                    const ext = path.extname(assetPath);
                    const ct = contentTypeForExt(ext);
                    res.statusCode = 200;
                    res.setHeader('content-type', ct);
                    const stream = fs.createReadStream(assetPath);
                    stream.pipe(res);
                    return true;
                }
            } catch (e) {
                // not found
            }
        }

        return false;
    } catch (err) {
        console.error('static serve error', err);
        return false;
    }
}

export default async function handler(req, res) {
    try {
        // Try serving static client assets directly from dist/client first
        const served = await tryServeStatic(req, res);
        if (served) return;

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
