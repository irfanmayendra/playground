# DevOps & CI/CD — Case Study

## 🏗️ Hybrid Architecture — Multi-Tenant SaaS Deployment

### Overview

Deployment infrastructure untuk Layanan Pengaduan Multi-Instansi dengan arsitektur hybrid: Cloudflare serverless (frontend + API + database) + VPS (Keycloak auth server). Cost-optimized, auto-scaling, dan global CDN.

### Architecture Decision: Hybrid vs Monolithic

| Aspect | Monolithic (All VPS) | Hybrid (Cloudflare + VPS) |
|--------|---------------------|--------------------------|
| **RAM needed** | ~2GB ❌ (exceeds VPS) | ~750MB ✅ |
| **Scalability** | Limited to 1 VPS | Unlimited (serverless) |
| **Uptime** | Single point of failure | Multi-region |
| **Maintenance** | Manage everything | Managed services |
| **Cost** | VPS only | Free tier + VPS |
| **Deploy** | Manual | Auto-deploy (Git push) |
| **Global CDN** | ❌ | ✅ Edge locations |
| **Auto-scaling** | ❌ | ✅ Workers scale otomatis |

**Decision:** Hybrid architecture — optimalkan resource, minimize maintenance.

### Infrastructure Diagram

```
┌─────────────────────────────────────────────────────┐
│                    Cloudflare (Free)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │ Pages (React) │  │ Workers (API)│  │    WAF    │ │
│  │ Auto-deploy  │  │ Edge compute │  │  DDoS     │ │
│  └──────────────┘  └──────────────┘  └───────────┘ │
│           │                │                         │
│           └────────┬───────┘                         │
│                    ↓                                 │
│  ┌──────────────────────────────────────────────┐   │
│  │              Cloudflare Tunnel               │   │
│  └──────────────────────────────────────────────┘   │
│                    │                                 │
└────────────────────┼─────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│                 Server SG (VPS)                      │
│  ┌──────────────┐  ┌──────────────┐                 │
│  │ NPM (Nginx)  │  │  Keycloak    │                 │
│  │ Reverse proxy│  │  (Docker)    │                 │
│  └──────────────┘  └──────────────┘                 │
│                                                      │
│  RAM: 750MB / 1.9GB (39%) ✅                         │
└─────────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│                Neon (Managed DB)                     │
│  ┌──────────────┐  ┌──────────────┐                 │
│  │ PostgreSQL   │  │  S3 Storage  │                 │
│  │ Multi-tenant │  │  Lampiran    │                 │
│  └──────────────┘  └──────────────┘                 │
└─────────────────────────────────────────────────────┘
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy Pipeline
on:
  push:
    branches: [main]
jobs:
  test:
    - Lint (ESLint + Prettier)
    - Unit test (Vitest)
    - Type check (TypeScript)
    - Security scan (npm audit)
  
  build:
    - Build frontend (Vite)
    - Build API (Wrangler)
    - Docker build (Keycloak config)
  
  deploy:
    - Deploy frontend (Cloudflare Pages)
    - Deploy API (Cloudflare Workers)
    - Run DB migration (Drizzle Kit)
    - Health check verification
```

### Key DevOps Components

| Component | Tool | Purpose |
|-----------|------|---------|
| **Container** | Docker + docker-compose | Keycloak + dependencies |
| **CI/CD** | GitHub Actions | Auto test + build + deploy |
| **IaC** | Wrangler CLI | Cloudflare config as code |
| **DB Migration** | Drizzle Kit | Versioned schema changes |
| **Reverse Proxy** | Nginx (NPM) | SSL + routing |
| **Tunnel** | Cloudflare Tunnel | Secure VPS exposure |
| **Monitoring** | Health checks + logging | Uptime + debugging |
| **Backup** | Automated DB backup | Disaster recovery |

### Resource Management

```
Server SG (existing):
├── NPM (Nginx Proxy Manager)    → 200MB RAM
├── Cloudflare Tunnel (cf1, cf2) → 50MB RAM
├── Keycloak (Docker)            → 500MB RAM ← NEW
└── Buffer                       → 150MB RAM

Total: 900MB / 1.9GB (47%) ✅
Disk: +2GB (Keycloak image + data)
```

### Deployment Strategy

| Environment | Frontend | API | Database | Auth |
|------------|----------|-----|----------|------|
| **Development** | localhost:5173 | localhost:8787 | Neon (dev schema) | Keycloak (local) |
| **Staging** | preview.pages.dev | staging.workers.dev | Neon (staging schema) | Keycloak (staging) |
| **Production** | playground.lostinvirtual.com | api.lostinvirtual.com | Neon (prod schema) | Keycloak (prod) |

### Monitoring & Observability

| Aspect | Implementation |
|--------|---------------|
| **Health Check** | `GET /health` → status, version, uptime |
| **Logging** | Structured JSON logs (timestamp, level, message) |
| **Error Tracking** | Cloudflare Workers logs |
| **Uptime** | External monitoring (cron health check) |
| **Performance** | Response time tracking |
| **Database** | Query performance monitoring |

### Disaster Recovery

| Component | Backup | Restore Time |
|-----------|--------|-------------|
| **Database** | Daily automated (Neon) | < 5 minutes |
| **Config** | Git (version controlled) | < 1 minute |
| **Keycloak** | Docker volume backup | < 10 minutes |
| **Static files** | S3 (Neon) | N/A (redundant) |

### Cost Analysis

| Service | Cost | Notes |
|---------|------|-------|
| **Cloudflare Pages** | Free | Unlimited bandwidth |
| **Cloudflare Workers** | Free | 100K requests/day |
| **Neon PostgreSQL** | Free | 0.5GB storage |
| **Neon S3** | Free | 5GB storage |
| **VPS (existing)** | Already paid | Keycloak only |
| **Total** | **$0/month** | 🎉 |

### Key Achievements

- ✅ **Zero-downtime deployments** (auto-deploy on push)
- ✅ **Global CDN** (Cloudflare edge locations)
- ✅ **Auto-scaling** (Workers scale per request)
- ✅ **Cost-optimized** (free tier utilization)
- ✅ **Secure** (Tunnel + WAF + SSL)
- ✅ **Monitored** (health checks + logging)
