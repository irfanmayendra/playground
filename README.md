# 🚀 Playground — Portfolio

**Fullstack Engineer | DevOps & CI/CD | Cybersecurity**

## 🏛️ Layanan Pengaduan & Penanganan Laporan Multi-Instansi

**Multi-Tenant SaaS — Complaint & Report Management Platform**

| Aspect | Detail |
|--------|--------|
| **Architecture** | Multi-tenant SaaS (5 instansi pemerintah) |
| **Auth** | Keycloak SSO + RBAC (4 roles) + custom claims |
| **Database** | PostgreSQL (Neon) — 8 tables, multi-tenant |
| **Frontend** | React 18 + TypeScript + Tailwind CSS |
| **Backend** | Node.js (Hono) + raw SQL |
| **CI/CD** | GitHub Actions → Cloudflare Pages |
| **Compliance** | OWASP, PDPA, audit trail |

### Live Demo

- **Frontend**: `playground.lostinvirtual.com`
- **Auth**: `auth.lostinvirtual.com` (Keycloak SSO)
- **API Docs**: [OpenAPI Spec](docs/api/openapi.yaml)

### Features

- ✅ Multi-tenant (5 instansi pemerintah)
- ✅ Keycloak SSO + RBAC (platform_superadmin, tenant_admin, tenant_staff, tenant_user)
- ✅ Custom JWT claims (tenant_id, roles)
- ✅ Laporan workflow (masuk → verifikasi → proses → selesai → ditutup)
- ✅ SLA tracking + deadline otomatis
- ✅ Nomor tiket auto-generate (`LP-2026-{KODE}-{SEQ}`)
- ✅ Komentar (diskusi pelapor ↔ petugas)
- ✅ Dashboard analytics + SLA compliance
- ✅ Audit trail (compliance-ready)
- ✅ Security headers + CORS

### Tech Stack

```
Frontend:  React 18 + TypeScript + Vite + Tailwind CSS
Backend:   Node.js (Hono) + PostgreSQL (Neon)
Auth:      Keycloak 24 (OIDC/OAuth2 + RBAC)
Database:  Neon PostgreSQL (serverless)
Hosting:   Cloudflare Pages + Workers
CI/CD:     GitHub Actions
```

## 📂 Portfolio

| Section | Description |
|---------|-------------|
| [Fullstack](/fullstack) | Keycloak RBAC, multi-tenant DB, workflow SLA, React UI |
| [DevOps](/devops) | Hybrid architecture, CI/CD, Docker, monitoring |
| [Cybersecurity](/cybersecurity) | OWASP, PDPA, CVSS, MITRE ATT&CK, audit |

## 📖 Documentation

| Document | Link |
|----------|------|
| Architecture | [docs/architecture.md](docs/architecture.md) |
| API Spec (OpenAPI) | [docs/api/openapi.yaml](docs/api/openapi.yaml) |
| Deployment Guide | [docs/deployment.md](docs/deployment.md) |
| Skills Matrix | [docs/skills-matrix.md](docs/skills-matrix.md) |
| Certifications | [docs/certifications.md](docs/certifications.md) |

## 🛠️ Local Development

```bash
# Backend
cd app/backend
cp .env.example .env  # Fill with your credentials
npm install
npx tsx src/index.ts  # → http://localhost:8787

# Frontend
cd app/frontend
npm install
npx vite  # → http://localhost:5173
```

## 🔒 Security

| Layer | Implementation |
|-------|---------------|
| Authentication | Keycloak SSO (OIDC/OAuth2) |
| Authorization | RBAC (4 roles) |
| Data Protection | HTTPS (Cloudflare SSL) |
| Audit | Full audit trail |
| Headers | CSP, HSTS, X-Frame-Options |

## 📧 Contact

**Irfan Mayendra** — [GitHub](https://github.com/irfanmayendra)
