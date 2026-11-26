// Registration + Approval + Email Notification
// POST /api/auth/register — Public registration (creates user with is_active=false)
// POST /api/auth/approve/:id — Admin approve (sets is_active=true, sends email)
// POST /api/auth/reject/:id — Admin reject

import { Hono } from 'hono';
import { Pool } from 'pg';

const KEYCLOAK_URL = process.env.KEYCLOAK_URL || 'http://localhost:8080';
const REALM = process.env.KEYCLOAK_REALM || 'pengaduan';
const CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID || 'pengaduan-app';
const ADMIN_CLIENT_SECRET = process.env.KEYCLOAK_ADMIN_SECRET || '';
const DATABASE_URL = process.env.DATABASE_URL || '';

// Resend email config
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const FROM_EMAIL = 'Pengaduan LostInVirtual <noreply@lostinvirtual.com>';

const pool = new Pool({ connectionString: DATABASE_URL });

// Send email via Resend
async function sendEmail(to: string, subject: string, html: string) {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to,
        subject,
        html,
      }),
    });
    const data = await res.json();
    console.log(`[EMAIL] To: ${to} | Subject: ${subject} | Status: ${res.status} | ID: ${data.id || 'N/A'}`);
    return data;
  } catch (err) {
    console.error('[EMAIL] Failed:', err);
  }
}

// Get Keycloak admin token
async function getAdminToken(): Promise<string | null> {
  try {
    const res = await fetch(`${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: 'client_credentials',
        client_secret: ADMIN_CLIENT_SECRET,
      }),
    });
    const data = await res.json();
    return data.access_token || null;
  } catch {
    return null;
  }
}

const register = new Hono();

// POST /api/auth/register — Public registration
register.post('/register', async (c) => {
  const body = await c.req.json();
  const { nama, email, phone, password } = body;

  if (!nama || !email || !password) {
    return c.json({ error: 'Nama, email, dan password wajib diisi' }, 400);
  }

  if (password.length < 8) {
    return c.json({ error: 'Password minimal 8 karakter' }, 400);
  }

  try {
    // Check if email already exists in Neon DB
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return c.json({ error: 'Email sudah terdaftar' }, 400);
    }

    // Create user in database (pending approval)
    const result = await pool.query(
      `INSERT INTO users (keycloak_id, email, nama, phone, role, is_active) 
       VALUES ($1, $2, $3, $4, 'masyarakat', false) 
       RETURNING id, email, nama, is_active`,
      [`pending_${Date.now()}`, email, nama, phone || null]
    );

    const user = result.rows[0];

    // Send registration confirmation email
    await sendEmail(email, 'Pendaftaran Berhasil — Menunggu Persetujuan Admin', `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
        <div style="max-width:600px;margin:0 auto;background:#ffffff;">
          <!-- Header -->
          <div style="background:linear-gradient(135deg,#0071e3,#5856d6);padding:40px 32px;text-align:center;">
            <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0;">Sistem Pengaduan</h1>
            <p style="color:rgba(255,255,255,0.8);font-size:14px;margin:8px 0 0;">Multi-Instansi Pemerintah</p>
          </div>
          <!-- Body -->
          <div style="padding:32px;">
            <h2 style="color:#1d1d1f;font-size:20px;font-weight:600;margin:0 0 16px;">Pendaftaran Berhasil ✅</h2>
            <p style="color:#1d1d1f;font-size:16px;line-height:1.6;margin:0 0 16px;">
              Halo <strong>${nama}</strong>,
            </p>
            <p style="color:#1d1d1f;font-size:16px;line-height:1.6;margin:0 0 16px;">
              Terima kasih telah mendaftar di Sistem Pengaduan Multi-Instansi. Pendaftaran Anda telah kami terima.
            </p>
            <div style="background:#f5f5f7;border-radius:12px;padding:20px;margin:24px 0;">
              <p style="color:#86868b;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 8px;">Status Pendaftaran</p>
              <p style="color:#ff9500;font-size:18px;font-weight:700;margin:0;">⏳ Menunggu Persetujuan Admin</p>
            </div>
            <p style="color:#1d1d1f;font-size:16px;line-height:1.6;margin:0 0 16px;">
              Akun Anda sedang dalam proses review oleh admin. Anda akan menerima email notifikasi ketika akun telah disetujui dan siap digunakan.
            </p>
            <p style="color:#86868b;font-size:14px;line-height:1.6;margin:24px 0 0;">
              Email ini dikirim otomatis. Mohon tidak membalas email ini.
            </p>
          </div>
          <!-- Footer -->
          <div style="background:#f5f5f7;padding:24px 32px;text-align:center;">
            <p style="color:#86868b;font-size:12px;margin:0;">
              © ${new Date().getFullYear()} LostInVirtual — Sistem Pengaduan Multi-Instansi
            </p>
          </div>
        </div>
      </body>
      </html>
    `);

    // Notify admin
    await sendEmail('admin@pengaduan.id', 'Pendaftaran Baru — Menunggu Persetujuan', `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#fff;padding:32px;">
        <h2 style="color:#1d1d1f;">Pendaftaran Baru</h2>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr><td style="padding:8px 0;color:#86868b;width:120px;">Nama</td><td style="padding:8px 0;color:#1d1d1f;font-weight:600;">${nama}</td></tr>
          <tr><td style="padding:8px 0;color:#86868b;">Email</td><td style="padding:8px 0;color:#1d1d1f;font-weight:600;">${email}</td></tr>
          <tr><td style="padding:8px 0;color:#86868b;">Phone</td><td style="padding:8px 0;color:#1d1d1f;font-weight:600;">${phone || '-'}</td></tr>
          <tr><td style="padding:8px 0;color:#86868b;">Status</td><td style="padding:8px 0;color:#ff9500;font-weight:600;">⏳ Menunggu Persetujuan</td></tr>
        </table>
        <p style="color:#86868b;font-size:14px;">Login ke dashboard admin untuk menyetujui atau menolak pendaftaran ini.</p>
      </div>
    `);

    return c.json({
      success: true,
      message: 'Pendaftaran berhasil. Menunggu persetujuan admin.',
      data: { id: user.id, email: user.email, nama: user.nama, is_active: user.is_active },
    }, 201);
  } catch (err: any) {
    console.error('[REGISTER] Error:', err.message);
    return c.json({ error: 'Gagal mendaftar. Coba lagi.' }, 500);
  }
});

// POST /api/auth/approve/:id — Admin approve user
register.post('/approve/:id', async (c) => {
  const userId = c.req.param('id');

  try {
    // Get user
    const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length === 0) {
      return c.json({ error: 'User tidak ditemukan' }, 404);
    }

    const user = userRes.rows[0];

    // Activate user
    await pool.query(
      'UPDATE users SET is_active = true, updated_at = NOW() WHERE id = $1',
      [userId]
    );

    // Send approval email
    await sendEmail(user.email, 'Akun Anda Telah Diaktifkan ✅', `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
        <div style="max-width:600px;margin:0 auto;background:#ffffff;">
          <!-- Header -->
          <div style="background:linear-gradient(135deg,#34c759,#0071e3);padding:40px 32px;text-align:center;">
            <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0;">Sistem Pengaduan</h1>
            <p style="color:rgba(255,255,255,0.8);font-size:14px;margin:8px 0 0;">Multi-Instansi Pemerintah</p>
          </div>
          <!-- Body -->
          <div style="padding:32px;">
            <h2 style="color:#1d1d1f;font-size:20px;font-weight:600;margin:0 0 16px;">Akun Aktif! 🎉</h2>
            <p style="color:#1d1d1f;font-size:16px;line-height:1.6;margin:0 0 16px;">
              Halo <strong>${user.nama}</strong>,
            </p>
            <p style="color:#1d1d1f;font-size:16px;line-height:1.6;margin:0 0 16px;">
              Kabar baik! Akun Anda telah <strong>disetujui dan diaktifkan</strong> oleh admin. Anda sekarang dapat mengakses Sistem Pengaduan Multi-Instansi.
            </p>
            <div style="background:#f5f5f7;border-radius:12px;padding:20px;margin:24px 0;">
              <p style="color:#86868b;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 8px;">Status Akun</p>
              <p style="color:#34c759;font-size:18px;font-weight:700;margin:0;">✅ Aktif — Siap Digunakan</p>
            </div>
            <div style="text-align:center;margin:32px 0;">
              <a href="https://playground.lostinvirtual.com/login" style="background:#0071e3;color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:12px;font-size:16px;font-weight:600;display:inline-block;">
                Masuk ke Dashboard
              </a>
            </div>
            <p style="color:#86868b;font-size:14px;line-height:1.6;margin:24px 0 0;">
              Anda sekarang dapat membuat laporan, melacak status pengaduan, dan berkomunikasi dengan instansi terkait.
            </p>
          </div>
          <!-- Footer -->
          <div style="background:#f5f5f7;padding:24px 32px;text-align:center;">
            <p style="color:#86868b;font-size:12px;margin:0;">
              © ${new Date().getFullYear()} LostInVirtual — Sistem Pengaduan Multi-Instansi
            </p>
          </div>
        </div>
      </body>
      </html>
    `);

    return c.json({
      success: true,
      message: 'User berhasil diaktifkan',
      data: { id: userId, email: user.email, is_active: true },
    });
  } catch (err: any) {
    console.error('[APPROVE] Error:', err.message);
    return c.json({ error: 'Gagal mengaktifkan user' }, 500);
  }
});

// POST /api/auth/reject/:id — Admin reject user
register.post('/reject/:id', async (c) => {
  const userId = c.req.param('id');

  try {
    const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length === 0) {
      return c.json({ error: 'User tidak ditemukan' }, 404);
    }

    const user = userRes.rows[0];

    // Delete user (rejected)
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);

    // Send rejection email
    await sendEmail(user.email, 'Pendaftaran Tidak Disetujui', `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#fff;padding:32px;">
        <h2 style="color:#1d1d1f;">Pendaftaran Tidak Disetujui</h2>
        <p style="color:#1d1d1f;font-size:16px;line-height:1.6;">
          Halo <strong>${user.nama}</strong>,
        </p>
        <p style="color:#1d1d1f;font-size:16px;line-height:1.6;">
          Mohon maaf, pendaftaran Anda tidak dapat disetujui saat ini. Jika memiliki pertanyaan, silakan hubungi admin.
        </p>
      </div>
    `);

    return c.json({ success: true, message: 'User ditolak' });
  } catch (err: any) {
    console.error('[REJECT] Error:', err.message);
    return c.json({ error: 'Gagal menolak user' }, 500);
  }
});

// GET /api/auth/pending — List users awaiting approval
register.get('/pending', async (c) => {
  try {
    const result = await pool.query(
      `SELECT id, email, nama, phone, is_active, created_at 
       FROM users WHERE is_active = false ORDER BY created_at DESC`
    );
    return c.json({ data: result.rows });
  } catch (err: any) {
    console.error('[PENDING] Error:', err.message);
    return c.json({ error: 'Gagal mengambil data' }, 500);
  }
});

export default register;
