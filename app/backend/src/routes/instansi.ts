// Instansi Routes (Tenant Management) — DB Connected
import { Hono } from 'hono';
import { authMiddleware, requireSuperAdmin } from '../middleware/auth.js';
import { getInstansi, getInstansiById, createInstansi, updateInstansi } from '../lib/db.js';

type Variables = { user: { sub: string; email: string }; userId: string; userEmail: string; userRole: string; };

const instansi = new Hono<{ Variables: Variables }>();
instansi.use('*', authMiddleware);

// GET /api/instansi — List all instansi
instansi.get('/', async (c) => {
  const data = await getInstansi();
  return c.json({ data, total: data.length });
});

// GET /api/instansi/:id — Get single instansi
instansi.get('/:id', async (c) => {
  const data = await getInstansiById(c.req.param('id'));
  if (!data) return c.json({ error: 'Not found' }, 404);
  return c.json({ data });
});

// POST /api/instansi — Create instansi (super_admin only)
instansi.post('/', requireSuperAdmin, async (c) => {
  const body = await c.req.json();
  const data = await createInstansi(body);
  return c.json({ data, message: 'Instansi created' }, 201);
});

// PUT /api/instansi/:id — Update instansi (super_admin only)
instansi.put('/:id', requireSuperAdmin, async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const data = await updateInstansi(id, body);
  return c.json({ data, message: 'Instansi updated' });
});

export default instansi;
