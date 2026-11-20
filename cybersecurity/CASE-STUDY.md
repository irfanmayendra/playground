# Cybersecurity — Case Study

## 🔒 Security Assessment & Compliance — Multi-Tenant SaaS

### Overview

Implementasi security-first approach untuk Layanan Pengaduan Multi-Instansi. Mencakup secure coding, authentication hardening, data protection, audit trail, dan compliance PDPA/ISO 27001.

### Security Framework

```
┌─────────────────────────────────────────────────────┐
│              SECURITY LAYERS                         │
├─────────────────────────────────────────────────────┤
│  Layer 1: Network Security                          │
│  ├── Cloudflare WAF + DDoS protection               │
│  ├── SSL/TLS 1.3 (auto-renewal)                     │
│  └── Cloudflare Tunnel (encrypted VPS access)       │
├─────────────────────────────────────────────────────┤
│  Layer 2: Application Security                      │
│  ├── Input validation (Zod schema)                  │
│  ├── Rate limiting (API + login)                    │
│  ├── CORS policy enforcement                        │
│  ├── Security headers (CSP, HSTS, X-Frame)          │
│  └── SQLi/XSS prevention (parameterized queries)    │
├─────────────────────────────────────────────────────┤
│  Layer 3: Authentication & Authorization            │
│  ├── Keycloak SSO + RBAC (5 roles)                  │
│  ├── MFA/TOTP (admin + petugas)                     │
│  ├── JWT token validation                           │
│  ├── Session management + auto-logout               │
│  └── Password policy (12+ chars, complexity)        │
├─────────────────────────────────────────────────────┤
│  Layer 4: Data Protection                           │
│  ├── PII encryption at rest (AES-256)               │
│  ├── TLS 1.3 in transit                             │
│  ├── Multi-tenant data isolation                    │
│  ├── S3 presigned URL (secure file upload)          │
│  └── Data retention policy (PDPA)                   │
├─────────────────────────────────────────────────────┤
│  Layer 5: Monitoring & Audit                        │
│  ├── Complete audit trail (all CRUD actions)        │
│  ├── Login/logout logging                           │
│  ├── IP + user agent tracking                       │
│  ├── Anomaly detection                              │
│  └── Compliance reporting                           │
└─────────────────────────────────────────────────────┘
```

### OWASP Top 10 Compliance

| # | Vulnerability | Implementation | Status |
|---|--------------|----------------|--------|
| A01 | Broken Access Control | Keycloak RBAC + middleware | ✅ |
| A02 | Cryptographic Failures | AES-256 + TLS 1.3 | ✅ |
| A03 | Injection (SQLi/XSS) | Parameterized queries + Zod | ✅ |
| A04 | Insecure Design | Threat modeling + security review | ✅ |
| A05 | Security Misconfiguration | Security headers + hardening | ✅ |
| A06 | Vulnerable Components | npm audit + dependency scanning | ✅ |
| A07 | Auth Failures | Keycloak + MFA + rate limiting | ✅ |
| A08 | Data Integrity Failures | Input validation + audit trail | ✅ |
| A09 | Logging Failures | Comprehensive audit logging | ✅ |
| A10 | SSRF | URL validation + allowlist | ✅ |

### PDPA Compliance (Singapore)

| Requirement | Implementation |
|-------------|---------------|
| **Consent** | Pelapor consent saat submit laporan |
| **Purpose Limitation** | Data hanya untuk penanganan laporan |
| **Notification** | Privacy policy + terms of service |
| **Access & Correction** | Pelapor bisa akses + update data sendiri |
| **Accuracy** | Data validation + verification workflow |
| **Protection** | Encryption + access control + audit |
| **Retention Limitation** | Auto-delete setelah retention period |
| **Transfer Limitation** | Data tidak keluar dari tenant |
| **Accountability** | Audit trail + compliance reporting |
| **Breach Notification** | Incident response plan |

### CVSS v3.1 Scoring Example

Finding: **Exposed admin panel tanpa rate limiting**

```
CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H
Score: 9.8 (CRITICAL)

Breakdown:
- AV:N (Network) = 0.85
- AC:L (Low) = 0.77
- PR:N (None) = 0.85
- UI:N (None) = 0.85
- C:H (High) = 0.56
- I:H (High) = 0.56
- A:H (High) = 0.56

Exploitability = 8.22 × 0.85 × 0.77 × 0.85 × 0.85 = 3.89
Impact = 6.42 × (1-(1-0.56)(1-0.56)(1-0.56)) = 5.91
Total = 3.89 + 5.91 = 9.8 (CRITICAL)
```

### MITRE ATT&CK Mapping

| Finding | ATT&CK Technique | Tactic |
|---------|-----------------|--------|
| Exposed admin panel | T1190 | Initial Access |
| Brute force login | T1110 | Credential Access |
| SQL injection | T1190 | Initial Access |
| Data exfiltration | T1530 | Collection |
| Privilege escalation | T1068 | Privilege Escalation |

### Security Controls Implementation

| Control | Technology | Purpose |
|---------|-----------|---------|
| **WAF** | Cloudflare WAF | Block malicious requests |
| **Rate Limiting** | Hono middleware | Prevent brute force |
| **Input Validation** | Zod schema | SQLi/XSS prevention |
| **CORS** | Hono CORS | Cross-origin protection |
| **Security Headers** | CSP, HSTS, X-Frame | Browser-level protection |
| **Encryption** | AES-256 + TLS 1.3 | Data protection |
| **RBAC** | Keycloak | Access control |
| **MFA** | TOTP | Account protection |
| **Audit Trail** | Custom logging | Compliance |
| **SAST** | npm audit + ESLint | Code security |

### Incident Response Plan

```
1. Detection (audit log anomaly)
2. Containment (block IP, disable account)
3. Eradication (fix vulnerability)
4. Recovery (restore from backup)
5. Lessons Learned (update security controls)
6. Notification (PDPA breach notification if needed)
```

### Vulnerability Assessment Tools

| Tool | Purpose | Frequency |
|------|---------|-----------|
| **Nuclei** | CVE scanning | Weekly |
| **npm audit** | Dependency vulnerabilities | Every deploy |
| **ESLint Security** | Code analysis | Every commit |
| **OWASP ZAP** | Web app scanning | Monthly |
| **sqlmap** | SQLi verification | Monthly |
| **testssl.sh** | SSL/TLS testing | Monthly |

### Security Metrics

| Metric | Target | Current |
|--------|--------|---------|
| **Critical vulnerabilities** | 0 | 0 ✅ |
| **Mean time to patch** | < 48 hours | 24 hours ✅ |
| **Audit coverage** | 100% | 100% ✅ |
| **MFA adoption** | 100% (admin) | 100% ✅ |
| **Encryption coverage** | 100% PII | 100% ✅ |
| **PDPA compliance** | Full | Full ✅ |

### Key Security Achievements

- ✅ **OWASP Top 10 compliant**
- ✅ **PDPA compliant** (Singapore data protection)
- ✅ **Zero critical vulnerabilities**
- ✅ **Complete audit trail** (100% action logged)
- ✅ **Multi-tenant data isolation**
- ✅ **MFA + RBAC** (enterprise-grade auth)
- ✅ **Encryption at rest + transit**
- ✅ **Incident response plan** documented
