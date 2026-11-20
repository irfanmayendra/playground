# DevOps & CI/CD — Case Studies

## Projects

| # | Project | Stack | Highlights |
|---|---------|-------|-----------|
| 1 | Multi-Region Infrastructure | Docker, NPM, Cloudflare | 3 VPS, 20+ domains |
| 2 | CI/CD Pipeline | Git, Wrangler, auto-deploy | Push-to-deploy, rollback |
| 3 | Monitoring Stack | Prometheus, Grafana | Real-time alerting |
| 4 | Disaster Recovery | Backup, restore, testing | 99.9% uptime |

## Key Capabilities

- **Containerization:** Docker, docker-compose, Kubernetes
- **CI/CD:** GitLab CI, Jenkins, GitHub Actions, Wrangler
- **Infrastructure:** Terraform, Ansible, Bash automation
- **Monitoring:** Prometheus, Grafana, ELK stack
- **Security:** Hardening, firewall, SSL/TLS, access control

## Infrastructure Overview

```
Users → Cloudflare (DNS, SSL, WAF)
         ├── Pages (Frontend) → Auto-deploy
         ├── Workers (API) → Edge compute
         └── Tunnel (Internal) → VPS
              ├── US Server (Docker, PostgreSQL, Redis)
              └── SG Server (NPM, Cloudflare tunnels)
```
