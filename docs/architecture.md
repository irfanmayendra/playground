# Architecture — Layanan Pengaduan Multi-Instansi

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USERS (Browser/Mobile)                    │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Cloudflare (CDN + SSL)                       │
├──────────────────────────┬──────────────────────────────────────┤
│                          │                                       │
│    playground.lostinvirtual.com    auth.lostinvirtual.com        │
│         (Pages)                (Cloudflare Tunnel)               │
│              │                       │                           │
└──────────────┼───────────────────────┼───────────────────────────┘
               │                       │
               ▼                       ▼
┌──────────────────────┐   ┌──────────────────────────────────────┐
│  Cloudflare Pages    │   │  SG Server (43.134.5.138)            │
│  (React + Vite)      │   │  ┌────────────────────────────────┐  │
│                      │   │  │  cf1 Tunnel (cloudflared)      │  │
│  • Dashboard         │   │  └──────────┬─────────────────────┘  │
│  • Laporan CRUD      │   │             │                        │
│  • Auth Guard        │   │             ▼                        │
│  • Responsive UI     │   │  ┌────────────────────────────────┐  │
└──────────┬───────────┘   │  │  Keycloak 24 (Docker)         │  │
           │               │  │  • OIDC/OAuth2 SSO             │  │
           │               │  │  • RBAC (4 roles)              │  │
           │               │  │  • Custom claims (tenant_id)   │  │
           │               │  └──────────┬─────────────────────┘  │
           │               │             │                        │
           │               │  ┌──────────▼─────────────────────┐  │
           │               │  │  PostgreSQL (Docker)           │  │
           │               │  │  (Keycloak storage)            │  │
           │               │  └────────────────────────────────┘  │
           │               └──────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API Server (Hono + Node.js)                   │
│                    localhost:8787                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │ Auth Routes │  │ CRUD Routes  │  │ Dashboard Routes       │  │
│  │ /api/auth   │  │ /api/laporan │  │ /api/dashboard         │  │
│  └──────┬──────┘  └──────┬───────┘  └───────────┬────────────┘  │
│         │                │                       │               │
│  ┌──────▼────────────────▼───────────────────────▼────────────┐  │
│  │                  Middleware Layer                           │  │
│  │  • JWT Validation (Keycloak)                               │  │
│  │  • RBAC (4 roles)                                          │  │
│  │  • Audit Logging                                           │  │
│  │  • CORS + Security Headers                                 │  │
│  └──────┬─────────────────────────────────────────────────────┘  │
│         │                                                        │
│  ┌──────▼─────────────────────────────────────────────────────┐  │
│  │                  Database Layer (Raw SQL)                   │  │
│  │  • Auto-sync user (Keycloak → DB)                          │  │
│  │  • Multi-tenant schema                                     │  │
│  │  • SLA tracking                                            │  │
│  └──────┬─────────────────────────────────────────────────────┘  │
└─────────┼────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Neon PostgreSQL (Cloud)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Tables: 8                                                       │
│  ├── instansi (5 rows)          ← Multi-tenant                  │
│  ├── users                      ← Auto-synced from Keycloak     │
│  ├── kategori (10 rows)         ← Kategori laporan              │
│  ├── laporan                    ← Main entity                   │
│  ├── lampiran                   ← File uploads (S3)             │
│  ├── komentar                   ← Discussion thread              │
│  ├── status_history             ← Status change tracking        │
│  └── audit_log                  ← Compliance audit trail        │
│                                                                  │
│  Functions:                                                      │
│  ├── generate_nomor_tiket()     ← LP-2026-{KODE}-{SEQ}          │
│  ├── update_updated_at()        ← Auto-update timestamp          │
│  └── update_laporan_counters()  ← Auto-count lampiran/komentar   │
│                                                                  │
│  Triggers: 3                                                     │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
1. User buka playground.lostinvirtual.com
2. React app load → auth guard cek token
3. Login → POST /api/auth/login → Keycloak verify
4. Keycloak return JWT (dengan claims: roles, tenant_id)
5. User create laporan → POST /api/laporan
6. API validasi JWT → RBAC check → insert ke DB
7. Auto-generate nomor tiket (LP-2026-{KODE}-{SEQ})
8. Auto-set SLA deadline (berdasarkan kategori)
9. Audit log tercatat
10. Dashboard update real-time
```

## Security Layers

```
┌─────────────────────────────────────┐
│  Layer 1: Cloudflare (WAF + SSL)    │
├─────────────────────────────────────┤
│  Layer 2: JWT Validation (Keycloak) │
├─────────────────────────────────────┤
│  Layer 3: RBAC (4 roles)            │
├─────────────────────────────────────┤
│  Layer 4: Input Validation          │
├─────────────────────────────────────┤
│  Layer 5: Audit Logging             │
├─────────────────────────────────────┤
│  Layer 6: Security Headers          │
└─────────────────────────────────────┘
```

## Multi-Tenant Model

```
Platform (Super Admin)
├── Instansi A (Tenant Admin)
│   ├── Staff A1 (Tenant Staff) → handle laporan
│   ├── Staff A2 (Tenant Staff) → handle laporan
│   └── User A3 (Tenant User) → submit laporan
├── Instansi B (Tenant Admin)
│   ├── Staff B1 (Tenant Staff)
│   └── User B2 (Tenant User)
└── Instansi C ...
```
