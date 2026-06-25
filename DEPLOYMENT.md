# Deployment Guide

## Cache Strategy (Production)

This project now uses a production-grade cache policy:

- `index.html` is always non-cacheable (`no-cache, no-store, must-revalidate`).
- API responses are non-cacheable (`no-store`).
- Fingerprinted static assets are long-cacheable (`public, max-age=31536000, immutable`).
- SPA routes always rewrite to the latest `index.html`.
- Legacy service worker registrations and old Cache Storage entries are removed on app load.

### Why this invalidates cache automatically on every deployment

- Vite emits hashed asset filenames (for example `index-abc123.js`).
- Every deployment creates new hashes when content changes.
- Since `index.html` is never cached, clients always fetch the newest HTML that points to the newest hashed assets.
- Old assets can stay cached safely without causing stale UI.

### Platform-specific cache config

- Netlify:
  - `Frontend/netlify.toml`
  - `Frontend/public/_headers`
  - `Frontend/public/_redirects`
- Vercel:
  - `Frontend/vercel.json`
- Nginx:
  - `Frontend/nginx.conf`
- Render:
  - For Static Site, configure equivalent response headers in dashboard:
    - `/` and `/index.html` => `Cache-Control: no-cache, no-store, must-revalidate`
    - `/assets/*` => `Cache-Control: public, max-age=31536000, immutable`
    - `/api/*` => `Cache-Control: no-store`
  - Add SPA rewrite rule `/* -> /index.html`.

## 🌐 Full-Stack Deployment

This guide covers deploying your portfolio to production.

---

## Frontend Deployment

### Option 1: Vercel (Recommended)

**Easiest option with automatic deployments**

1. **Build your project**
```bash
cd Frontend
npm run build
```

2. **Create Vercel Account**
- Go to [vercel.com](https://vercel.com)
- Sign up with GitHub

3. **Deploy**
- Connect GitHub repository
- Select `Frontend` folder as root
- Add environment variables
- Deploy!

4. **Update API URL**
Edit `Frontend/.env`:
```
VITE_API_URL=https://your-backend-url/api
```

### Option 2: Netlify

1. **Build project**
```bash
npm run build
```

2. **Deploy**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

3. **Configure**
- Set environment variables
- Enable auto-deploys from Git

### Option 3: GitHub Pages

1. **Update vite.config.js**
```javascript
export default {
  base: '/portfolio/',
  // ... rest of config
}
```

2. **Build and push**
```bash
npm run build
git add dist
git commit -m "Deploy"
git push
```

---

## Backend Deployment

### Option 1: Railway (Recommended)

1. **Create Account**
- Go to [railway.app](https://railway.app)
- Sign up with GitHub

2. **Connect Repository**
- Select GitHub repo
- Configure build command: `npm install`
- Set start command: `npm start`

3. **Add Environment Variables**
```
PORT=5000
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=portfolio_db
JWT_SECRET=your-secret-key
NODE_ENV=production
```

4. **Deploy**
- Railway automatically deploys on push

### Option 2: Render

1. **Create Account**
- Go to [render.com](https://render.com)
- Sign up with GitHub

2. **Create Web Service**
- Connect GitHub repo
- Build command: `npm install`
- Start command: `npm start`

3. **Add Environment Variables**
(Same as above)

### Option 3: Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create portfolio-backend

# Add MySQL addon
heroku addons:create cleardb:ignite

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret

# Deploy
git push heroku main
```

---

## Database Deployment

### Option 1: AWS RDS (Recommended)

1. **Create RDS Instance**
- AWS Console → RDS → Create DB
- Engine: MySQL 8.0
- Instance class: db.t3.micro (free tier)
- Storage: 20 GB

2. **Configure Security**
- Allow inbound: Port 3306
- Create security group
- Add your IP address

3. **Update Backend .env**
```
DB_HOST=your-rds-endpoint
DB_USER=admin
DB_PASSWORD=your-password
DB_NAME=portfolio_db
```

4. **Import Schema**
```bash
mysql -h your-rds-endpoint -u admin -p < Backend/database.sql
```

### Option 2: PlanetScale

1. **Create Account**
- Go to [planetscale.com](https://planetscale.com)
- Free MySQL hosting

2. **Create Database**
- Create new database
- Copy connection string

3. **Update .env**
```
DB_HOST=your-planetscale-host
DB_USER=your-user
DB_PASSWORD=your-password
DB_NAME=portfolio_db
```

### Option 3: Google Cloud SQL

Similar to AWS RDS but hosted on Google Cloud Platform.

---

## GitHub Secrets (for CI/CD)

If using GitHub Actions for auto-deployment:

1. **Go to Repository Settings**
2. **Secrets and variables → Actions**
3. **Add secrets**

```
DB_HOST
DB_USER
DB_PASSWORD
DB_NAME
JWT_SECRET
```

---

## Environment Variables Checklist

### Frontend
```
VITE_API_URL=https://your-api-domain/api
```

### Backend
```
PORT=5000
DB_HOST=your-host
DB_USER=your-user
DB_PASSWORD=your-password
DB_NAME=portfolio_db
JWT_SECRET=your-strong-secret-key
NODE_ENV=production
```

---

## DNS Configuration

1. **Point your domain to frontend**
```
CNAME → your-vercel-deployment.vercel.app
```

2. **Create API subdomain** (optional)
```
CNAME api → your-backend-domain
```

3. **Update frontend .env**
```
VITE_API_URL=https://api.yourdomain.com
```

---

## SSL/HTTPS

Most platforms handle SSL automatically. If not:

- Use Let's Encrypt (free)
- Enable in hosting platform settings
- Redirect HTTP to HTTPS

---

## Monitoring & Logs

## Cache Verification Checklist

After each deployment, verify in browser DevTools (Network):

1. `index.html` response header includes `no-cache, no-store, must-revalidate`.
2. `/api/*` responses include `Cache-Control: no-store`.
3. Hashed files under `/assets/` include `public, max-age=31536000, immutable`.
4. Hard refresh and normal refresh both show the latest deployed UI.
5. Direct route access (for example `/admin/projects`) serves the current app shell without stale content.

### Vercel
- Dashboard → Analytics
- Real-time logs for debugging

### Railway
- Deployments → Logs tab
- Real-time console output

### Custom Monitoring
```bash
# Backend logs
npm install pm2
pm2 start src/server.js --name "portfolio"
pm2 logs portfolio
```

---

## Performance Optimization

### Frontend
```bash
# Build analysis
npm install --save-dev vite-plugin-visualizer

# Lighthouse audit
# Chrome → DevTools → Lighthouse → Analyze page load
```

### Backend
- Enable gzip compression
- Use connection pooling
- Add caching headers

---

## Backup Strategy

### Database Backups
```bash
# Automatic backups
# Most providers offer daily automated backups

# Manual backup
mysqldump -h host -u user -p database > backup.sql

# Restore
mysql -h host -u user -p database < backup.sql
```

### Code Backups
- Use GitHub for version control
- Create releases/tags
- Automated backups by providers

---

## Cost Estimation

### Free Tier Options
- **Frontend**: Vercel/Netlify (free)
- **Backend**: Railway (free credits), Render (free tier)
- **Database**: PlanetScale (free tier)
- **Total**: $0 initially

### Estimated Monthly Costs
- Frontend: $0-20 (traffic dependent)
- Backend: $7-50 (compute)
- Database: $20-100 (storage/traffic)
- Domain: $10-15/year
- **Total**: $37-165/month at scale

---

## Troubleshooting Deployment

### Frontend won't load
- Check build output: `npm run build`
- Verify environment variables set
- Check CORS headers from backend

### Backend errors
- Check logs on hosting platform
- Verify database connection
- Review environment variables

### Database connection fails
- Verify credentials
- Check IP whitelist
- Test connection manually

---

## Post-Deployment Checklist

- [ ] Frontend loads on custom domain
- [ ] All pages respond correctly
- [ ] API endpoints return data
- [ ] Contact form submits successfully
- [ ] Database backups enabled
- [ ] Monitoring/logging working
- [ ] SSL/HTTPS working
- [ ] Performance acceptable
- [ ] Error handling working
- [ ] Logs being collected

---

## Next Steps

1. **Monitor Performance**
- Set up alerts
- Track error rates
- Monitor response times

2. **Continuous Deployment**
- Set up GitHub Actions
- Auto-deploy on push
- Run tests before deployment

3. **Security Updates**
- Keep dependencies updated
- Monitor for vulnerabilities
- Regular security audits

---

For more help:
- Check deployment platform docs
- Review logs in hosting dashboard
- Test locally before deploying
