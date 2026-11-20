# 🚀 Playground — Portfolio

**Fullstack Engineer | DevOps & CI/CD | Cybersecurity**

## 🏛️ Featured Project: Layanan Pengaduan Multi-Instansi

**Multi-Tenant SaaS — Complaint & Report Management Platform**

Sistem pengaduan publik multi-tenant yang menangani laporan dari masyarakat ke berbagai instansi pemerintah. Dilengkapi workflow SLA, Keycloak RBAC, audit trail, dan compliance PDPA.

| Aspect | Detail |
|--------|--------|
| **Architecture** | Hybrid (Cloudflare serverless + VPS) |
| **Auth** | Keycloak SSO + RBAC + MFA |
| **Database** | PostgreSQL (Neon) — multi-tenant schema |
| **Frontend** | React + Tailwind + shadcn/ui |
| **Backend** | Node.js (Hono) + Cloudflare Workers |
| **Storage** | S3 (lampiran/bukti) |
| **Compliance** | PDPA, OWASP, ISO 27001 |

[→ Baca case study lengkap](/fullstack)

---

## 🎯 Focus Areas

| Section | Focus | Highlights |
|---------|-------|-----------|
| **[Fullstack](/fullstack)** | Multi-tenant SaaS | Keycloak RBAC, workflow SLA, PostgreSQL |
| **[DevOps](/devops)** | Hybrid architecture | Cloudflare + VPS, CI/CD, Docker |
| **[Cybersecurity](/cybersecurity)** | Security & compliance | OWASP, PDPA, CVSS, MITRE ATT&CK |

## 📊 Quick Stats

- **Multi-tenant SaaS** — 5 instansi, 5 roles, workflow SLA
- **Hybrid architecture** — serverless + VPS (cost-optimized)
- **Security-first** — OWASP, PDPA, encryption, RBAC
- **CI/CD pipeline** — auto-deploy dari Git push

## 🛠️ Tech Stack

```
Frontend:  React 18, Vite, Tailwind CSS, shadcn/ui
Backend:   Node.js, Hono (edge), Drizzle ORM
Database:  PostgreSQL 18 (Neon), multi-tenant schema
Auth:      Keycloak 24 (SSO, RBAC, MFA)
Storage:   S3-compatible (Neon)
Hosting:   Cloudflare Pages + Workers, VPS (Keycloak)
CI/CD:     GitHub Actions, Docker
Testing:   Vitest, Playwright
Security:  OWASP, CVSS v3.1, MITRE ATT&CK
```

## 🏗️ Architecture

```
Users → Cloudflare (DNS, SSL, WAF)
         ├── Pages (React frontend) → Auto-deploy
         ├── Workers (Hono API) → Edge compute
         └── Tunnel → VPS (Keycloak auth)

Database: Neon PostgreSQL (multi-tenant)
Storage:  Neon S3 (lampiran/bukti)
```

## 📁 Structure

```
├── fullstack/        → Multi-tenant SaaS case study
├── devops/           → Hybrid architecture & CI/CD
├── cybersecurity/    → Security & compliance
└── docs/             → Skills matrix, certifications
```

## 📫 Contact

- **GitHub:** [@irfanmayendra](https://github.com/irfanmayendra)
- **Email:** irfanmayendra@gmail.com

---

*Built with ❤️ and lots of ☕*
