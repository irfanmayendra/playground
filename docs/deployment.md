# Deployment Guide

## Architecture

```
playground.lostinvirtual.com     → Cloudflare Pages (React frontend)
auth.lostinvirtual.com           → Cloudflare Tunnel (Keycloak di SG)
Database                         → Neon PostgreSQL
Storage                          → Neon S3
```

## CI/CD Pipeline

### GitHub Actions (auto-deploy)

1. Push ke `main` → triggers pipeline
2. **Test**: type check + security audit
3. **Build**: Vite build frontend
4. **Deploy**: Cloudflare Pages

### Manual Deploy

```bash
# Frontend
cd app/frontend
npm run build
CLOUDFLARE_API_TOKEN=xxx CLOUDFLARE_ACCOUNT_ID=xxx \
  npx wrangler pages deploy ./dist --project-name=pengaduan-playground

# Backend (local/SG server)
cd app/backend
DATABASE_URL=xxx KEYCLOAK_URL=https://auth.lostinvirtual.com \
  npx tsx src/index.ts
```

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Neon PostgreSQL connection | `postgresql://...` |
| `KEYCLOAK_URL` | Keycloak server URL | `https://auth.lostinvirtual.com` |
| `KEYCLOAK_REALM` | Keycloak realm name | `pengaduan` |
| `KEYCLOAK_CLIENT_ID` | Keycloak client ID | `pengaduan-app` |
| `PORT` | API server port | `8787` |

## Monitoring

```bash
# Health check
curl https://api.playground.lostinvirtual.com/health

# Expected response:
# {"status":"ok","service":"pengaduan-api","version":"1.0.0"}
```

## Rollback

```bash
# Cloudflare Pages
CLOUDFLARE_API_TOKEN=xxx CLOUDFLARE_ACCOUNT_ID=xxx \
  npx wrangler pages deployment list --project-name=pengaduan-playground

# Rollback to specific deployment
npx wrangler pages deployment rollback <deployment-id> --project-name=pengaduan-playground
```
