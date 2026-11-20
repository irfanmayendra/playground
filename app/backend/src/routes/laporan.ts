// Laporan Routes — DB Connected
import { Hono } from 'hono';
import { authMiddleware, requirePetugas } from '../middleware/auth.js';
import { getLaporan, getLaporanById, createLaporan, updateLaporanStatus, getKomentar, createKomentar, getKategori } from '../lib/db.js';

type Variables = { user: { sub: string; email: string; preferred_username: string }; userId: string; userEmail: string; userRole: string; };

const laporan = new Hono<{ Variables: Variables }>();
laporan.use('*', authMiddleware);

// GET /api/laporan — List laporan with filters
laporan.get('/', async (c) => {
  const status = c.req.query('status');
  const kategori_id = c.req.query('kategori_id');
  const instansi_id = c.req.query('instansi_id');
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');

  const result = await getLaporan({ status, kategori_id, instansi_id, page, limit });
  return c.json(result);
});

// POST /api/laporan — Create laporan
laporan.post('/', async (c) => {
  const body = await c.req.json();
  const user = c.get('user');
  const data = await createLaporan({
    ...body,
    pelapor_id: user.sub,
  });
  return c.json({ data, message: 'Laporan created' }, 201);
});

// GET /api/laporan/:id — Get detail
laporan.get('/:id', async (c) => {
  const data = await getLaporanById(c.req.param('id'));
  if (!data) return c.json({ error: 'Not found' }, 404);
  return c.json({ data });
});

// PATCH /api/laporan/:id/status — Update status (petugas/admin)
laporan.patch('/:id/status', requirePetugas, async (c) => {
  const id = c.req.param('id');
  const { status, notes } = await c.req.json();
  const user = c.get('user');
  const data = await updateLaporanStatus(id, status, user.sub, user.preferred_username || user.email, notes);
  return c.json({ data, message: 'Status updated' });
});

// GET /api/laporan/:id/komentar — Get comments
laporan.get('/:id/komentar', async (c) => {
  const data = await getKomentar(c.req.param('id'));
  return c.json({ data, total: data.length });
});

// POST /api/laporan/:id/komentar — Add comment
laporan.post('/:id/komentar', async (c) => {
  const id = c.req.param('id');
  const { isi, is_internal } = await c.req.json();
  const user = c.get('user');
  const data = await createKomentar({
    laporan_id: id,
    user_id: user.sub,
    user_nama: user.preferred_username || user.email,
    user_role: c.get('userRole'),
    isi,
    is_internal,
  });
  return c.json({ data, message: 'Komentar added' }, 201);
});

// GET /api/kategori — List kategori
laporan.get('/kategori/list', async (c) => {
  const instansi_id = c.req.query('instansi_id');
  const data = await getKategori(instansi_id);
  return c.json({ data, total: data.length });
});

export default laporan;
