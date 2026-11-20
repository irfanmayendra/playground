// Admin Routes — Instansi & Users management
import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { getInstansi, createInstansi, updateInstansi, sql } from '../lib/db.js';

type Variables = {
  user: { sub: string; email: string; realm_access?: { roles: string[] } };
  userId: string;
  userEmail: string;
  userRole: string;
};

const admin = new Hono<{ Variables: Variables }>();

admin.use('*', authMiddleware);

// GET /api/admin/users — List users (admin only)
admin.get('/users', async (c) => {
  const role = c.get('userRole');
  if (!['platform_superadmin', 'super_admin'].includes(role)) {
    return c.json({ error: 'Forbidden' }, 403);
  }

  const users = await sql`
    SELECT u.id, u.email, u.nama, u.role, u.is_active, u.created_at, u.last_login,
           i.nama as instansi_nama, i.kode as instansi_kode
    FROM users u
    LEFT JOIN instansi i ON u.instansi_id = i.id
    ORDER BY u.created_at DESC
  `;
  return c.json({ data: users, total: users.length });
});

// POST /api/admin/users — Create user (admin only)
admin.post('/users', async (c) => {
  const role = c.get('userRole');
  if (!['platform_superadmin', 'super_admin'].includes(role)) {
    return c.json({ error: 'Forbidden' }, 403);
  }

  const body = await c.req.json();
  const result = await sql`
    INSERT INTO users (keycloak_id, email, nama, role, instansi_id, phone)
    VALUES (${body.keycloak_id || 'manual-' + Date.now()}, ${body.email}, ${body.nama}, ${body.role}, ${body.instansi_id || null}, ${body.phone || null})
    RETURNING *
  `;
  return c.json({ data: result[0] }, 201);
});

// PATCH /api/admin/users/:id — Update user (admin only)
admin.patch('/users/:id', async (c) => {
  const role = c.get('userRole');
  if (!['platform_superadmin', 'super_admin'].includes(role)) {
    return c.json({ error: 'Forbidden' }, 403);
  }

  const id = c.req.param('id');
  const body = await c.req.json();
  const result = await sql`
    UPDATE users SET ${sql(body)}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return c.json({ data: result[0] });
});

// GET /api/admin/instansi — List instansi
admin.get('/instansi', async (c) => {
  const data = await getInstansi();
  return c.json({ data, total: data.length });
});

// POST /api/admin/instansi — Create instansi (admin only)
admin.post('/instansi', async (c) => {
  const role = c.get('userRole');
  if (!['platform_superadmin', 'super_admin'].includes(role)) {
    return c.json({ error: 'Forbidden' }, 403);
  }

  const body = await c.req.json();
  const data = await createInstansi(body);
  return c.json({ data }, 201);
});

// GET /api/admin/audit — Audit log (admin only)
admin.get('/audit', async (c) => {
  const role = c.get('userRole');
  if (!['platform_superadmin', 'super_admin'].includes(role)) {
    return c.json({ error: 'Forbidden' }, 403);
  }

  const logs = await sql`
    SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 50
  `;
  return c.json({ data: logs, total: logs.length });
});

export default admin;
