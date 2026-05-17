# Morfyx Backend - Production Setup Guide

## Quick Summary

Your backend is **production-ready**. Below is how to deploy it properly.

## What's Configured

✅ TypeScript compilation  
✅ Environment validation  
✅ Security headers (Helmet)  
✅ CORS for multiple frontends  
✅ Rate limiting (300 req/15min)  
✅ JWT authentication (15m access, 7d refresh)  
✅ MongoDB connection pooling  
✅ Graceful shutdown  
✅ Structured error handling  
✅ Proper logging (dev vs production)  

## Prerequisites

- Node.js >= 18
- npm or yarn
- MongoDB Atlas cluster (connection string)
- Valid external service credentials:
  - Cloudinary (image uploads)
  - Razorpay (payments)
  - SMTP email provider
  - Shipmozo (shipments)

## Local Development

```bash
npm install
npm run dev
```

Server runs on `http://localhost:5000`

## Production Build

```bash
# 1. Install production dependencies only
npm install --production

# 2. Build TypeScript
npm run build

# 3. Start production server
npm start
```

Output directory: `dist/`  
Entry point: `dist/server.js`

## Environment Configuration

### Step 1: Prepare Production `.env`

Copy `.env.example` as reference:

```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/morfyx
JWT_SECRET=<generate-strong-random-32-chars>
JWT_REFRESH_SECRET=<generate-strong-random-32-chars>
CLOUDINARY_NAME=your_account
CLOUDINARY_KEY=your_key
CLOUDINARY_SECRET=your_secret
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_secret
SHIPMOZO_API_KEY=your_key
EMAIL_USER=noreply@morfyx.com
EMAIL_PASS=your_smtp_password
FRONTEND_URL=https://morfyx.com,https://app.morfyx.com
COOKIE_DOMAIN=morfyx.com
```

### Generate Strong Secrets

```bash
# On macOS/Linux:
openssl rand -hex 16

# On Windows (PowerShell):
[Convert]::ToHexString((1..16 | ForEach-Object { [byte](Get-Random -Max 256) }))
```

## Deployment Platforms

### Heroku / Railway / Render

1. **Set environment variables** in platform UI or CLI
2. **Ensure MongoDB URI is accessible** from deployment server
3. **Configure buildpack** (Node.js)
4. **Deploy**:
   - Platforms auto-detect `npm start` from `package.json`
   - Auto-runs `npm install` and `npm run build`

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

```bash
docker build -t morfyx-backend .
docker run -p 5000:5000 --env-file .env morfyx-backend
```

### Manual VPS (AWS EC2, DigitalOcean, etc.)

```bash
# 1. SSH into server
ssh user@your-server.com

# 2. Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Clone repo
git clone <repo-url>
cd morfyx-studio/backend/server

# 4. Create .env
nano .env
# (paste production environment variables)

# 5. Install & build
npm install --production
npm run build

# 6. Use process manager (PM2 recommended)
sudo npm install -g pm2
pm2 start dist/server.js --name "morfyx-api"
pm2 save
pm2 startup

# 7. Setup reverse proxy (Nginx)
sudo apt-get install nginx

# Create /etc/nginx/sites-available/morfyx:
server {
    listen 80;
    server_name api.morfyx.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/morfyx /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 8. SSL (Let's Encrypt)
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d api.morfyx.com
```

## MongoDB Setup

### Create Production Cluster

1. Go to **MongoDB Atlas** (cloud.mongodb.com)
2. **Create free/paid cluster** in desired region
3. **Create database user** with strong password
4. **Whitelist IP address** (or 0.0.0.0/0 for testing)
5. **Get connection string**:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/morfyx
   ```

## Testing Production Deployment

```bash
# Health check
curl https://api.morfyx.com/health

# Response:
{
  "success": true,
  "message": "API healthy"
}
```

## Monitoring & Logging

### Setup Error Tracking (Sentry)

```bash
npm install @sentry/node
```

Add to `src/server.ts`:
```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: env.nodeEnv
});
```

### Application Performance Monitoring

Consider:
- **New Relic** - Full APM
- **DataDog** - Infrastructure + APM
- **Grafana** - Metrics & dashboards

### Log Aggregation

- **ELK Stack** (Elasticsearch, Logstash, Kibana)
- **Splunk**
- **Cloudflare Logpush** (if using Cloudflare)

## Troubleshooting

### MongoDB Connection Fails
- ✓ Check IP is whitelisted in MongoDB Atlas
- ✓ Verify connection string has correct username/password
- ✓ Ensure database user has read/write permissions

### CORS Errors
- ✓ Add frontend URL to `FRONTEND_URL` env var (comma-separated)
- ✓ Ensure protocol matches (http/https)
- ✓ Don't include trailing slash

### JWT Errors
- ✓ Verify `JWT_SECRET` != `JWT_REFRESH_SECRET`
- ✓ Check both are 32+ characters
- ✓ Don't share secrets between environments

### File Upload Fails
- ✓ Verify Cloudinary credentials are correct
- ✓ Check file size limit (currently 2mb for request body)
- ✓ Ensure image format is supported (jpg, png, etc.)

## Security Checklist

- [ ] All env vars stored in production secrets manager (not in git)
- [ ] Database password is strong (16+ chars, mixed case, numbers, symbols)
- [ ] CORS only allows production domains
- [ ] Rate limiting is active
- [ ] HTTPS/SSL enforced in production
- [ ] Helmet security headers enabled
- [ ] No console.log with sensitive data
- [ ] Error messages don't expose internal details

## Scaling

As traffic grows:

1. **Enable MongoDB read replicas**
2. **Setup Redis cache** for sessions/tokens
3. **Use CDN** for static assets
4. **Implement API gateway** (Kong, Nginx)
5. **Setup Kubernetes** for orchestration
6. **Use message queues** (Bull, RabbitMQ) for async tasks

## Support

For issues:
1. Check logs: `pm2 logs morfyx-api`
2. Review MongoDB Atlas dashboard
3. Check external service dashboards (Cloudinary, Razorpay, etc.)
4. Ensure all env vars are set correctly
