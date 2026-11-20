# Fullstack Engineer — Case Study

## 🏛️ Layanan Pengaduan & Penanganan Laporan Multi-Instansi

**Multi-Tenant SaaS — Complaint & Report Management Platform**

| Aspect | Detail |
|--------|--------|
| **Architecture** | Multi-tenant SaaS (5 instansi) |
| **Auth** | Keycloak SSO + RBAC (5 roles) + MFA |
| **Database** | PostgreSQL (Neon) — multi-tenant schema |
| **Frontend** | React 18 + Tailwind + shadcn/ui |
| **Backend** | Node.js (Hono) + Drizzle ORM |
| **Storage** | S3 (lampiran/bukti) |
| **Real-time** | WebSocket (notifikasi) |
| **Compliance** | PDPA, OWASP, ISO 27001 |

## 📋 Project Overview

Sistem pengaduan publik multi-tenant yang menangani laporan dari masyarakat ke berbagai instansi pemerintah. Setiap instansi memiliki workspace terpisah dengan workflow SLA, notifikasi real-time, dan audit trail lengkap.

## 🏗️ Key Features

| Feature | Detail |
|---------|--------|
| **Multi-Tenant** | 5 instansi (POLRI, DINKES, DINSOS, DISHUB, OMBUDSMAN) |
| **RBAC** | 5 roles (super_admin, instansi_admin, petugas, supervisor, masyarakat) |
| **Workflow SLA** | masuk → verifikasi → proses → selesai → ditutup |
| **Dynamic Forms** | Field beda per kategori laporan |
| **Auto Tiket** | `LP-2026-{INSTANSI}-{SEQ}` |
| **Upload Bukti** | Foto/video/dokumen → S3 |
| **SLA Monitoring** | Deadline + auto-escalation |
| **Audit Trail** | Semua action logged |
| **Real-time** | WebSocket notifikasi |
| **Export** | PDF + Excel |

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, shadcn/ui |
| State | React Query, Zustand |
| Backend | Node.js, Hono (edge), Drizzle ORM |
| Database | PostgreSQL 18 (Neon) |
| Auth | Keycloak 24 (SSO, RBAC, MFA) |
| Storage | S3 (Neon) |
| Hosting | Cloudflare Pages + Workers |
| CI/CD | GitHub Actions |
| Testing | Vitest, Playwright |

## 🔐 Authentication & Authorization

| Role | Permissions | MFA |
|------|------------|-----|
| super_admin | Manage semua instansi, user, kategori | ✅ |
| instansi_admin | Manage instansi sendiri, assign petugas | ✅ |
| petugas | Handle laporan, update status, komentar | ✅ |
| supervisor | Review, escalate, approve closure | ✅ |
| masyarakat | Submit laporan, track status, komentar | ❌ |

## 📊 Database Design

```
Shared (public schema):
├── instansi (tenant registry)
├── users (shared accounts)
├── kategori (report categories)
└── audit_log (compliance trail)

Per-tenant (isolated):
├── laporan (complaints)
├── lampiran (attachments)
├── komentar (discussions)
└── status_history (workflow tracking)
```

## 📈 Metrics

- **5+ instansi** — multi-tenant isolated
- **5 roles** — granular RBAC
- **SLA compliance** — real-time monitoring
- **Audit coverage** — 100% action logged
- **PDPA compliant** — consent + data retention

## 🔗 Links

- **Live:** [playground.lostinvirtual.com](https://playground.lostinvirtual.com)
- **API Docs:** [api.playground.lostinvirtual.com/docs](https://api.playground.lostinvirtual.com/docs)
- **Source:** [github.com/irfanmayendra/playground](https://github.com/irfanmayendra/playground)
