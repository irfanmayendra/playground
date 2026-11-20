# CI/CD & Disaster Recovery

## 🔄 CI/CD Pipeline

### Flow

```
git push (main) → GitHub Actions → Test → Build → Deploy → Live
                  (~45 detik total)
```

### Stage Detail

| Stage | Action | Duration | Tool |
|-------|--------|----------|------|
| **Test** | Type check + security audit | ~30s | TypeScript + npm audit |
| **Build** | Compile React → static | ~10s | Vite |
| **Deploy** | Upload ke Cloudflare | ~5s | Wrangler |

### File: `.github/workflows/deploy.yml`

```yaml
on:
  push:
    branches: [main]

jobs:
  test:
    - npm ci
    - npx tsc --noEmit
    - npm audit --audit-level=high

  build-and-deploy:
    needs: test
    - npm run build
    - wrangler pages deploy ./dist
```

### Benefits

| Benefit | Detail |
|---------|--------|
| Auto-deploy | `git push` → live dalam 45 detik |
| Zero downtime | CDN update tanpa service interruption |
| Rollback | Cloudflare version history |
| Preview URLs | Setiap deploy dapat URL unik |
| Security gate | `npm audit` block deploy kalau ada vulnerability |

---

## 🔄 Disaster Recovery & Backup

### Architecture

```
┌─────────────────────────────────────────────┐
│            PRODUCTION                        │
│  Frontend: Cloudflare Pages (auto-saved)     │
│  API: SG Server (PM2 auto-restart)           │
│  Database: Neon PostgreSQL (cloud, auto-snap) │
│  Auth: Keycloak (Docker + local PG)          │
└──────────────────┬──────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│            BACKUP LAYER                      │
│  1. GitHub (code, config, history)           │
│  2. Neon auto-snapshot (daily)               │
│  3. Cloudflare version history               │
│  4. Cron job (daily 2AM, /opt/backups/)      │
└─────────────────────────────────────────────┘
```

### Automated Backup (Cron)

```
Schedule: Daily 2:00 AM (SG time)
Script: /opt/backup-pengaduan.sh
Location: /opt/backups/
Retention: 30 days
```

**What's backed up:**
| Item | Size | Frequency |
|------|------|-----------|
| Keycloak database | ~284KB | Daily |
| Config files (.env, docker-compose) | ~4KB | Daily |
| Docker state (containers, images) | ~2KB | Daily |
| Application code | Git (continuous) | Every push |

### Recovery Scenarios

| Disaster | Recovery | RTO | RPO |
|----------|----------|-----|-----|
| **API crash** | PM2 auto-restart | <1 min | 0 |
| **Server down** | Tunnel reconnect + PM2 | <2 min | 0 |
| **Database crash** | Neon snapshot restore | <5 min | 24h |
| **Code corruption** | `git clone` + restore | <2 min | 0 |
| **Frontend error** | Cloudflare rollback | <30 sec | 0 |
| **Keycloak crash** | Docker restart | <2 min | 24h |
| **Full server loss** | Rebuild from git + backup | <30 min | 24h |

### Recovery Commands

```bash
# Restore database
psql -h <neon-host> neondb < /opt/backups/keycloak_20261120.sql

# Restore config
tar xzf /opt/backups/config_20261120.tar.gz -C /

# Full rebuild
git clone https://github.com/irfanmayendra/playground.git
cd playground/app/backend && npm install
docker compose -f /opt/keycloak/docker-compose.yml up -d
pm2 start npx --name pengaduan-api -- src/index.ts

# Frontend rollback
npx wrangler pages deployment rollback <id> --project-name=pengaduan-playground
```

### Monitoring

| Component | Method | Alert |
|-----------|--------|-------|
| API | `/health` endpoint | PM2 auto-restart |
| Database | Neon dashboard | Email |
| Frontend | Cloudflare analytics | Status page |
| Keycloak | Docker health check | Auto-restart |
| Tunnel | Cloudflare dashboard | Auto-reconnect |
| Backup | `/var/log/backup-pengaduan.log` | Manual check |

---

## 📊 SLA / RTO / RPO Summary

| Metric | Target | Achieved |
|--------|--------|----------|
| **Uptime** | 99.9% | 99.9% (Cloudflare CDN) |
| **Deploy time** | <5 min | ~45 detik |
| **RTO** (Recovery Time) | <5 min | 1-2 min (auto-restart) |
| **RPO** (Recovery Point) | <24h | 24h (daily snapshot) |
| **Backup retention** | 30 days | 30 days (auto-cleanup) |
