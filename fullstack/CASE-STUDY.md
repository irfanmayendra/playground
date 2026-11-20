# Fullstack Engineer — Case Study

## 🏛️ Layanan Pengaduan & Penanganan Laporan Multi-Instansi

**Multi-Tenant SaaS — Complaint & Report Management Platform**

### Overview

Sistem pengaduan publik multi-tenant yang menangani laporan dari masyarakat ke berbagai instansi pemerintah. Setiap instansi memiliki workspace terpisah dengan workflow SLA, notifikasi real-time, dan audit trail lengkap.

### Problem

- Pengaduan masyarakat tersebar di banyak instansi (polisi, dinas kesehatan, dinas sosial, dll)
- Tidak ada tracking terpusat — laporan hilang, tidak ada SLA
- Tidak ada transparansi status untuk pelapor
- Tidak ada data analytics untuk evaluasi kinerja instansi

### Solution

Platform SaaS multi-tenant yang:
- Mengelola pengaduan dari 5+ instansi dalam satu sistem
- Workflow otomatis (masuk → verifikasi → proses → selesai)
- SLA monitoring dengan auto-escalation
- Dashboard analytics per instansi dan global
- Notifikasi real-time (email + in-app)

### Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (React)                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │ Dashboard │ │ Laporan  │ │  Users   │ │ Report │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘ │
├─────────────────────────────────────────────────────┤
│                  API (Hono Workers)                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │   Auth   │ │ Laporan  │ │  Upload  │ │ Audit  │ │
│  │  (JWT)   │ │ (CRUD)   │ │  (S3)    │ │  (Log) │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘ │
├─────────────────────────────────────────────────────┤
│              Keycloak (Auth Server)                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │   SSO    │ │   RBAC   │ │   MFA    │            │
│  └──────────┘ └──────────┘ └──────────┘            │
├─────────────────────────────────────────────────────┤
│              PostgreSQL (Neon)                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │  Shared  │ │  Tenant  │ │  Audit   │            │
│  │  Tables  │ │  Schemas │ │   Log    │            │
│  └──────────┘ └──────────┘ └──────────┘            │
└─────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 + Vite + Tailwind + shadcn/ui | Responsive SPA |
| State | React Query + Zustand | Server + client state |
| Backend | Node.js + Hono (edge) | REST API |
| ORM | Drizzle ORM | Type-safe queries |
| Database | PostgreSQL 18 (Neon) | Multi-tenant |
| Auth | Keycloak 24 | SSO + RBAC + MFA |
| Storage | S3 (Neon) | Lampiran upload |
| Real-time | WebSocket | Notifikasi |
| Email | Resend | Email notifikasi |
| Hosting | Cloudflare Pages + Workers | Frontend + API |
| CI/CD | GitHub Actions | Auto-deploy |

### Authentication & Authorization (Keycloak + RBAC)

| Role | Permissions | MFA |
|------|------------|-----|
| **super_admin** | Manage semua instansi, user, kategori | ✅ |
| **instansi_admin** | Manage instansi sendiri, assign petugas | ✅ |
| **petugas** | Handle laporan, update status, komentar | ✅ |
| **supervisor** | Review, escalate, approve closure | ✅ |
| **masyarakat** | Submit laporan, track status, komentar | ❌ |

**Keycloak Features:**
- SSO (Single Sign-On)
- JWT token validation
- Role-based access control (RBAC)
- Multi-factor authentication (MFA/TOTP)
- Tenant isolation
- Session management + auto-logout
- Password policy enforcement

### Multi-Tenant Database Design

```sql
-- Shared schema (public)
instansi, users, kategori, audit_log

-- Per-tenant schema
instansi_polri    → laporan, lampiran, komentar
instansi_dinkes   → laporan, lampiran, komentar
instansi_dinsos   → laporan, lampiran, komentar
instansi_dishub   → laporan, lampiran, komentar
instansi_lainnya  → laporan, lampiran, komentar
```

**Isolation:** Query otomatis filter per `instansi_id`, data tidak bocor antar tenant.

### Workflow SLA

```
[1] Masuk → [2] Verifikasi → [3] Proses → [4] Selesai → [5] Ditutup
     ↓           ↓              ↓            ↓            ↓
  Auto-tiket  Admin cek     Petugas kerja  Review      Rating
  SLA start   Validasi      Progress       Supervisor  Pelapor
  + Notif     + Assign      + Komentar     + Close     + Feedback
```

### Key Features

| Feature | Detail |
|---------|--------|
| **Dynamic Forms** | Field beda per kategori laporan |
| **Auto Tiket** | `LP-2026-{INSTANSI}-{SEQ}` |
| **Upload Bukti** | Foto/video/dokumen → S3 |
| **SLA Timer** | Deadline per kategori + auto-alert |
| **Escalation** | Auto-escalate kalau SLA hampir habis |
| **Komentar** | Diskusi petugas ↔ pelapor |
| **Re-open** | Pelapor bisa buka lagi |
| **Rating** | Evaluasi kepuasan (1-5) |
| **Export** | PDF + Excel |
| **Audit Trail** | Semua action logged |

### Security Implementation

| Control | Implementation |
|---------|---------------|
| **Input Validation** | Zod schema validation (SQLi/XSS prevention) |
| **Rate Limiting** | API + login endpoint |
| **Encryption** | PII at rest (AES-256) + transit (TLS 1.3) |
| **Audit Trail** | Semua CRUD action logged (user, time, old/new value) |
| **Security Headers** | CSP, HSTS, X-Frame-Options, X-Content-Type |
| **RBAC** | Keycloak roles + middleware |
| **Data Retention** | PDPA compliance (auto-delete after retention period) |
| **Consent** | Pelapor consent saat submit |

### Challenges & Solutions

| Challenge | Solution |
|-----------|----------|
| Multi-tenant data isolation | Schema per tenant + row-level security |
| Keycloak di serverless | Hybrid: Keycloak di VPS, sisanya serverless |
| File upload ukuran besar | S3 presigned URL (direct upload) |
| SLA timer akurat | Server-side cron + WebSocket alert |
| Real-time notifikasi | WebSocket + email fallback |
| Export laporan besar | Background job + streaming |

### Metrics

- **Multi-tenant:** 5+ instansi, isolated data
- **Roles:** 5 level dengan permission berbeda
- **SLA compliance:** Real-time monitoring
- **Audit:** 100% action logged
- **Uptime:** 99.9% target

### Links

- **Live:** [playground.lostinvirtual.com](https://playground.lostinvirtual.com)
- **API Docs:** [api.playground.lostinvirtual.com/docs](https://api.playground.lostinvirtual.com/docs)
- **Source:** [github.com/irfanmayendra/playground](https://github.com/irfanmayendra/playground)
