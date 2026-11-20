// Laporan Routes — DB Connected + Tenant Filtering
import { Hono } from 'hono';
import { authMiddleware, requirePetugas } from '../middleware/auth.js';
import { getLaporan, getLaporanById, createLaporan, updateLaporanStatus, getKomentar, createKomentar, getKategori, getInstansi, getUserByEmail } from '../lib/db.js';

type Variables = {
  user: { sub: string; email: string; realm_access?: { roles: string[] } };
  userId: string;
  userEmail: string;
  userRole: string;
};

const laporan = new Hono<{ Variables: Variables }>();

// All routes require auth
laporan.use('*', authMiddleware);

// GET /api/laporan — List with tenant filtering
laporan.get('/', async (c) => {
  const role = c.get('userRole');
  const email = c.get('userEmail');
  
  // Get user's instansi_id from DB
  const user = await getUserByEmail(email);
  const userInstansiId = user?.instansi_id;

  const { status, kategori_id, instansi_id, page, limit } = c.req.query();

  // Tenant filtering: non-admin can only see their own instansi
  let filterInstansi = instansi_id;
  if (role !== 'platform_superadmin' && role !== 'super_admin') {
    filterInstansi = userInstansiId || instansi_id;
  }

  const result = await getLaporan({
    status,
    kategori_id,
    instansi_id: filterInstansi,
    page: page ? parseInt(page) : 1,
    limit: limit ? parseInt(limit) : 20,
  });

  return c.json(result);
});

// GET /api/laporan/kategori/list
laporan.get('/kategori/list', async (c) => {
  const role = c.get('userRole');
  const email = c.get('userEmail');
  const user = await getUserByEmail(email);
  
  const data = await getKategori(role === 'platform_superadmin' ? undefined : user?.instansi_id);
  return c.json({ data, total: data.length });
});

// GET /api/laporan/:id
laporan.get('/:id', async (c) => {
  const id = c.req.param('id');
  const role = c.get('userRole');
  const email = c.get('userEmail');
  
  const laporan = await getLaporanById(id);
  if (!laporan) {
    return c.json({ error: 'Not Found', message: 'Laporan tidak ditemukan' }, 404);
  }

  // Tenant check
  const user = await getUserByEmail(email);
  if (role !== 'platform_superadmin' && role !== 'super_admin') {
    if (laporan.instansi_id !== user?.instansi_id) {
      return c.json({ error: 'Forbidden', message: 'Anda tidak memiliki akses ke laporan ini' }, 403);
    }
  }

  return c.json({ data: laporan });
});

// POST /api/laporan — Create
laporan.post('/', async (c) => {
  const body = await c.req.json();
  const userId = c.get('userId');
  const email = c.get('userEmail');

  if (!body.judul || !body.deskripsi || !body.kategori_id || !body.instansi_id) {
    return c.json({ error: 'Validation', message: 'Semua field wajib diisi' }, 400);
  }

  // Tenant check: non-admin can only create for their own instansi
  const role = c.get('userRole');
  const user = await getUserByEmail(email);
  if (role !== 'platform_superadmin' && role !== 'super_admin') {
    if (body.instansi_id !== user?.instansi_id) {
      return c.json({ error: 'Forbidden', message: 'Anda hanya bisa membuat laporan untuk instansi Anda' }, 403);
    }
  }

  const data = await createLaporan({ ...body, pelapor_id: userId });
  return c.json({ data, message: 'Laporan berhasil dibuat' }, 201);
});

// PATCH /api/laporan/:id/status — Update status (petugas/admin only)
laporan.patch('/:id/status', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const role = c.get('userRole');
  const userId = c.get('userId');
  const email = c.get('userEmail');

  // RBAC: only petugas/admin can update status
  const allowedRoles = ['platform_superadmin', 'super_admin', 'tenant_admin', 'instansi_admin', 'tenant_staff', 'petugas', 'supervisor'];
  if (!allowedRoles.includes(role)) {
    return c.json({ error: 'Forbidden', message: `Requires role: ${allowedRoles.join(' or ')}` }, 403);
  }

  // Tenant check
  const existing = await getLaporanById(id);
  if (!existing) {
    return c.json({ error: 'Not Found' }, 404);
  }
  const user = await getUserByEmail(email);
  if (role !== 'platform_superadmin' && role !== 'super_admin') {
    if (existing.instansi_id !== user?.instansi_id) {
      return c.json({ error: 'Forbidden', message: 'Laporan ini bukan dari instansi Anda' }, 403);
    }
  }

  const data = await updateLaporanStatus(id, body.status, userId, email, body.notes);
  return c.json({ data, message: 'Status berhasil diupdate' });
});

// POST /api/laporan/:id/komentar
laporan.post('/:id/komentar', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const userId = c.get('userId');
  const email = c.get('userEmail');
  const role = c.get('userRole');

  if (!body.isi) {
    return c.json({ error: 'Validation', message: 'Komentar wajib diisi' }, 400);
  }

  const user = await getUserByEmail(email);
  const data = await createKomentar({
    laporan_id: id,
    user_id: userId,
    user_nama: email,
    user_role: role,
    isi: body.isi,
    is_internal: body.is_internal || false,
  });

  return c.json({ data, message: 'Komentar berhasil ditambahkan' }, 201);
});

// POST /api/laporan/:id/lampiran — Upload file
laporan.post('/:id/lampiran', async (c) => {
  const id = c.req.param('id');
  const userId = c.get('userId');
  const email = c.get('userEmail');

  try {
    const body = await c.req.parseBody();
    const file = body['file'] as File;
    
    if (!file) {
      return c.json({ error: 'Validation', message: 'File wajib diupload' }, 400);
    }

    // Save file info to DB (in production, upload to S3)
    const { sql } = await import('../lib/db.js');
    const user = await getUserByEmail(email);
    
    const result = await sql`
      INSERT INTO lampiran (laporan_id, filename, s3_url, mime_type, size_bytes, uploaded_by)
      VALUES (${id}, ${file.name}, ${'local://' + file.name}, ${file.type}, ${file.size}, ${user?.id || userId})
      RETURNING *
    `;

    return c.json({ data: result[0], message: 'File berhasil diupload' }, 201);
  } catch (err) {
    return c.json({ error: 'Upload failed', message: String(err) }, 500);
  }
});

export default laporan;
