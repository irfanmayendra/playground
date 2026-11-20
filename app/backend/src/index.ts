// Main API Entry Point — Hono
import 'dotenv/config';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { serve } from '@hono/node-server';
import { auditMiddleware } from './middleware/audit.js';
import { testConnection } from './lib/db.js';
import instansi from './routes/instansi.js';
import laporan from './routes/laporan.js';
import auth from './routes/auth.js';
import admin from './routes/admin.js';

// Type definitions for context variables
type Variables = {
  user: { sub: string; email: string; preferred_username: string; realm_access: { roles: string[] } };
  userId: string;
  userEmail: string;
  userRole: string;
};

const app = new Hono<{ Variables: Variables }>();

// ============ Global Middleware ============
app.use('*', logger());
app.use('*', secureHeaders());
app.use('*', cors({
  origin: ['http://localhost:5173', 'https://playground.lostinvirtual.com'],
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));
app.use('*', auditMiddleware);

// ============ Routes ============
app.route('/api/auth', auth);
app.route('/api/instansi', instansi);
app.route('/api/laporan', laporan);
app.route('/api/admin', admin);

// Dashboard
app.get('/api/dashboard/overview', async (c) => {
  const { getDashboardOverview } = await import('./lib/db.js');
  const data = await getDashboardOverview();
  return c.json({ data, message: 'Dashboard overview' });
});

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'pengaduan-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found', message: 'Endpoint not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('[ERROR]', err);
  return c.json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  }, 500);
});

// ============ Start Server ============
const port = parseInt(process.env.PORT || '8787');

serve({ fetch: app.fetch, port }, async (info) => {
  console.log(`🚀 Pengaduan API running on http://localhost:${info.port}`);
  console.log(`📖 Health check: http://localhost:${info.port}/health`);
  console.log(`🔐 Keycloak: ${process.env.KEYCLOAK_URL || 'http://localhost:8080'}/realms/${process.env.KEYCLOAK_REALM || 'pengaduan'}`);
  await testConnection();
});

export default app;
