# Production Deployment Checklist

Complete this checklist before deploying to production.

## Environment Variables
- [ ] All variables in `.env.example` are configured
- [ ] `NODE_ENV=production`
- [ ] `JWT_SECRET` is a strong random string (min 32 chars)
- [ ] `JWT_REFRESH_SECRET` is a strong random string (min 32 chars)
- [ ] `MONGODB_URI` is set to production MongoDB cluster
- [ ] `FRONTEND_URL` contains production domain(s)
- [ ] `COOKIE_DOMAIN` matches production domain
- [ ] All external service credentials are valid:
  - [ ] Cloudinary
  - [ ] Razorpay
  - [ ] Shipmozo
  - [ ] Resend email API key and verified sender

## Security
- [ ] `.env` file is NOT committed to git
- [ ] All secrets are stored in production secrets manager
- [ ] CORS only allows production frontend URLs
- [ ] Rate limiting is configured appropriately
- [ ] JWT expiry times are reasonable (15m access, 7d refresh)

## Database
- [ ] MongoDB production database is created
- [ ] Database user has minimal required permissions
- [ ] Database backups are configured
- [ ] MongoDB Atlas IP whitelist includes deployment server
- [ ] Connection pooling is configured for production

## Code
- [ ] No development logging (Morgan logs only in structured format)
- [ ] Error responses don't expose internal details
- [ ] All environment variables are validated at startup
- [ ] TypeScript is compiled successfully: `npm run build`
- [ ] No console.log statements remain (only use structured logging)

## Build & Testing
- [ ] `npm run build` completes without errors
- [ ] `npm start` starts without errors
- [ ] Health check endpoint works: `curl /health`
- [ ] All critical API routes tested
- [ ] Payment integration tested with Razorpay
- [ ] Email notifications tested

## Deployment
- [ ] Deployment server has Node.js >= 18
- [ ] All dependencies installed: `npm install --production`
- [ ] Process manager configured (PM2, systemd, etc.)
- [ ] Graceful shutdown handling enabled
- [ ] Server logs are captured
- [ ] Error tracking configured (Sentry, etc.)

## Monitoring
- [ ] Uptime monitoring configured
- [ ] Error alerts configured
- [ ] Database connection monitoring
- [ ] API performance monitoring
- [ ] Memory/CPU usage alerts

## Final
- [ ] Dry run deployment tested
- [ ] Rollback plan documented
- [ ] Team notified of deployment
- [ ] Production backup created before deployment

Generated for Morfyx Studio Backend
