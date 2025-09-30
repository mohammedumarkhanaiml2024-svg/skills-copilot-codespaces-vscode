# Deployment Configuration for Mood AI

## Environment Variables Required

### Backend (.env)
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://your-mongodb-url/moodai
DATABASE_PATH=./database/moodai.db
JWT_SECRET=your-super-secure-jwt-secret-key-64-chars-minimum
JWT_EXPIRES_IN=7d
ENCRYPTION_KEY=your-32-character-encryption-key-for-aes256
```

### Frontend (.env)
```env
PORT=3001
REACT_APP_API_URL=https://your-backend-url.com
WDS_SOCKET_PORT=0
```

## Deployment Options

### 1. Heroku Deployment

**Backend (Heroku)**
```bash
# Create Heroku app
heroku create mood-ai-backend

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret
heroku config:set MONGODB_URI=your-mongodb-atlas-url

# For SQL option, add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# Deploy
git push heroku main
```

**Frontend (Vercel/Netlify)**
```bash
# Build for production
cd frontend && npm run build

# Deploy to Vercel
vercel --prod

# Or deploy to Netlify
netlify deploy --prod --dir=build
```

### 2. Docker Deployment

**Docker Compose (docker-compose.yml)**
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  backend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/moodai
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    ports:
      - "3001:3001"
    environment:
      - REACT_APP_API_URL=http://localhost:3000

volumes:
  mongodb_data:
```

**Run with Docker**
```bash
docker-compose up --build
```

### 3. VPS/Cloud Server Deployment

**Setup Script (deploy.sh)**
```bash
#!/bin/bash

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
npm install -g pm2

# Clone repository
git clone <your-repo-url> mood-ai
cd mood-ai

# Install dependencies
npm install
cd frontend && npm install && cd ..

# Build frontend
cd frontend && npm run build && cd ..

# Create production environment file
cp .env.example .env
# Edit .env with production values

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 4. AWS/Azure/GCP Deployment

**AWS Elastic Beanstalk**
```bash
# Install EB CLI
pip install awsebcli

# Initialize EB application
eb init

# Create environment and deploy
eb create production
eb deploy
```

**Azure App Service**
```bash
# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Create resource group and app service
az group create --name mood-ai-rg --location eastus
az appservice plan create --name mood-ai-plan --resource-group mood-ai-rg --sku B1
az webapp create --name mood-ai-app --resource-group mood-ai-rg --plan mood-ai-plan

# Deploy
az webapp deployment source config-zip --resource-group mood-ai-rg --name mood-ai-app --src deploy.zip
```

## Database Setup for Production

### MongoDB Atlas (Recommended)
```bash
# 1. Create MongoDB Atlas cluster
# 2. Get connection string
# 3. Set MONGODB_URI environment variable
```

### PostgreSQL (For SQL option)
```bash
# Heroku PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# AWS RDS PostgreSQL
# Create RDS instance and update DATABASE_URL
```

## Security Checklist

- [ ] Strong JWT secret (64+ characters)
- [ ] HTTPS enabled in production
- [ ] Environment variables secured
- [ ] Database connections encrypted
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation active
- [ ] Error logging configured

## Performance Optimization

### Backend
- Enable gzip compression
- Add Redis for session storage
- Implement database indexing
- Add API caching
- Monitor with New Relic/DataDog

### Frontend
- Code splitting implemented
- Assets optimization
- CDN for static files
- Service worker for caching
- Bundle size analysis

## Monitoring & Logging

### Recommended Tools
- **Application Monitoring**: New Relic, DataDog
- **Error Tracking**: Sentry
- **Logging**: Winston + Elasticsearch
- **Uptime Monitoring**: Pingdom, UptimeRobot
- **Performance**: Lighthouse CI

### Health Checks
```bash
# Backend health
curl https://your-backend-url.com/health

# Frontend health
curl https://your-frontend-url.com
```

## Backup Strategy

### Database Backup
```bash
# MongoDB
mongodump --uri="your-mongodb-uri" --out=/backup/$(date +%Y%m%d)

# PostgreSQL
pg_dump your-database-url > backup-$(date +%Y%m%d).sql
```

### Automated Backups
- Set up daily database backups
- Store backups in cloud storage (S3, GCS)
- Test restore procedures regularly

## SSL/TLS Configuration

### Let's Encrypt (Free SSL)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Scaling Considerations

### Horizontal Scaling
- Load balancer (nginx, AWS ALB)
- Multiple server instances
- Database read replicas
- CDN for static assets

### Vertical Scaling
- Monitor CPU/Memory usage
- Upgrade server resources as needed
- Database performance tuning

---

**Ready for production deployment! 🚀**