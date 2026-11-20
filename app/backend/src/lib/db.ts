// Database Connection — Neon PostgreSQL (Raw SQL)
import * as postgresModule from 'postgres';
const postgres = (postgresModule as any).default || postgresModule;

const DATABASE_URL = process.env.DATABASE_URL || 
  'postgresql://neondb_owner:npg_jeRVCvY8lBJ1@ep-proud-truth-bd2ecivx-pooler.c-8.us-east-2.aws.neon.tech/neondb?sslmode=require';

export const sql = postgres(DATABASE_URL, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

// Test connection
export async function testConnection() {
  try {
    const result = await sql`SELECT current_database(), version()`;
    console.log('✅ Database connected:', result[0].current_database);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// ========== INSTANSI ==========
export async function getInstansi() {
  return sql`SELECT * FROM instansi WHERE is_active = true ORDER BY nama`;
}

export async function getInstansiById(id: string) {
  const result = await sql`SELECT * FROM instansi WHERE id = ${id}`;
  return result[0] || null;
}

export async function createInstansi(data: { nama: string; kode: string; alamat?: string; kontak_email?: string; kontak_phone?: string; sla_hours?: number }) {
  const result = await sql`
    INSERT INTO instansi (nama, kode, alamat, kontak_email, kontak_phone, sla_hours)
    VALUES (${data.nama}, ${data.kode}, ${data.alamat || null}, ${data.kontak_email || null}, ${data.kontak_phone || null}, ${data.sla_hours || 72})
    RETURNING *
  `;
  return result[0];
}

export async function updateInstansi(id: string, data: Record<string, unknown>) {
  const result = await sql`
    UPDATE instansi SET ${sql(data)}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return result[0];
}

// ========== KATEGORI ==========
export async function getKategori(instansiId?: string) {
  if (instansiId) {
    return sql`SELECT * FROM kategori WHERE instansi_id = ${instansiId} AND is_active = true ORDER BY nama`;
  }
  return sql`SELECT * FROM kategori WHERE is_active = true ORDER BY nama`;
}

export async function createKategori(data: { nama: string; deskripsi?: string; instansi_id: string; sla_hours?: number; priority_default?: string }) {
  const result = await sql`
    INSERT INTO kategori (nama, deskripsi, instansi_id, sla_hours, priority_default)
    VALUES (${data.nama}, ${data.deskripsi || null}, ${data.instansi_id}, ${data.sla_hours || 72}, ${data.priority_default || 'medium'})
    RETURNING *
  `;
  return result[0];
}

// ========== USERS ==========
export async function getUserByEmail(email: string) {
  const result = await sql`SELECT * FROM users WHERE email = ${email}`;
  return result[0] || null;
}

export async function createUser(data: { keycloak_id: string; email: string; nama: string; role: string; instansi_id?: string; phone?: string }) {
  const result = await sql`
    INSERT INTO users (keycloak_id, email, nama, role, instansi_id, phone)
    VALUES (${data.keycloak_id}, ${data.email}, ${data.nama}, ${data.role}, ${data.instansi_id || null}, ${data.phone || null})
    RETURNING *
  `;
  return result[0];
}

// ========== LAPORAN ==========
export async function getLaporan(filters: { status?: string; kategori_id?: string; instansi_id?: string; page?: number; limit?: number }) {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const offset = (page - 1) * limit;

  let where = sql`WHERE 1=1`;
  if (filters.status) where = sql`${where} AND l.status = ${filters.status}`;
  if (filters.kategori_id) where = sql`${where} AND l.kategori_id = ${filters.kategori_id}`;
  if (filters.instansi_id) where = sql`${where} AND l.instansi_id = ${filters.instansi_id}`;

  const countResult = await sql`SELECT COUNT(*) as total FROM laporan l ${where}`;
  const total = parseInt(countResult[0].total);

  const data = await sql`
    SELECT l.*, k.nama as kategori_nama, u.nama as pelapor_nama, p.nama as petugas_nama
    FROM laporan l
    LEFT JOIN kategori k ON l.kategori_id = k.id
    LEFT JOIN users u ON l.pelapor_id = u.id
    LEFT JOIN users p ON l.petugas_id = p.id
    ${where}
    ORDER BY l.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

  return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getLaporanById(id: string) {
  const result = await sql`
    SELECT l.*, k.nama as kategori_nama, u.nama as pelapor_nama, p.nama as petugas_nama
    FROM laporan l
    LEFT JOIN kategori k ON l.kategori_id = k.id
    LEFT JOIN users u ON l.pelapor_id = u.id
    LEFT JOIN users p ON l.petugas_id = p.id
    WHERE l.id = ${id}
  `;
  return result[0] || null;
}

export async function createLaporan(data: { judul: string; deskripsi: string; kategori_id: string; pelapor_id: string; instansi_id: string; priority?: string; lokasi?: string }) {
  // Look up user ID from keycloak_id
  const userResult = await sql`SELECT id FROM users WHERE keycloak_id = ${data.pelapor_id}`;
  const pelaporId = userResult[0]?.id || data.pelapor_id;

  // Generate nomor tiket
  const tiketResult = await sql`SELECT generate_nomor_tiket(${data.instansi_id}::uuid) as nomor`;
  const nomorTiket = tiketResult[0].nomor;

  // Calculate SLA deadline
  const kategori = await sql`SELECT sla_hours FROM kategori WHERE id = ${data.kategori_id}`;
  const slaHours = kategori[0]?.sla_hours || 72;

  const result = await sql`
    INSERT INTO laporan (nomor_tiket, judul, deskripsi, kategori_id, priority, pelapor_id, instansi_id, lokasi, sla_deadline)
    VALUES (${nomorTiket}, ${data.judul}, ${data.deskripsi}, ${data.kategori_id}, ${data.priority || 'medium'}, ${pelaporId}, ${data.instansi_id}, ${data.lokasi || null}, NOW() + (${slaHours} || ' hours')::interval)
    RETURNING *
  `;
  return result[0];
}

export async function updateLaporanStatus(id: string, status: string, changedBy: string, changedByNama: string, notes?: string) {
  // Get current status
  const current = await sql`SELECT status FROM laporan WHERE id = ${id}`;
  const fromStatus = current[0]?.status;

  // Update laporan
  const result = await sql`
    UPDATE laporan SET status = ${status}, updated_at = NOW(),
      ${status === 'selesai' ? sql`closed_at = NOW(),` : sql``}
      ${status === 'masuk' ? sql`first_response_at = NOW(),` : sql``}
      petugas_id = ${changedBy}
    WHERE id = ${id}
    RETURNING *
  `;

  // Insert status history
  await sql`
    INSERT INTO status_history (laporan_id, from_status, to_status, changed_by, changed_by_nama, notes)
    VALUES (${id}, ${fromStatus}, ${status}, ${changedBy}, ${changedByNama}, ${notes || null})
  `;

  return result[0];
}

// ========== KOMENTAR ==========
export async function getKomentar(laporanId: string) {
  return sql`
    SELECT * FROM komentar 
    WHERE laporan_id = ${laporanId} 
    ORDER BY created_at ASC
  `;
}

export async function createKomentar(data: { laporan_id: string; user_id: string; user_nama: string; user_role: string; isi: string; is_internal?: boolean }) {
  const result = await sql`
    INSERT INTO komentar (laporan_id, user_id, user_nama, user_role, isi, is_internal)
    VALUES (${data.laporan_id}, ${data.user_id}, ${data.user_nama}, ${data.user_role}, ${data.isi}, ${data.is_internal || false})
    RETURNING *
  `;
  return result[0];
}

// ========== DASHBOARD ==========
export async function getDashboardOverview(instansiId?: string) {
  const where = instansiId ? sql`WHERE instansi_id = ${instansiId}` : sql``;

  const statusCounts = await sql`
    SELECT status, COUNT(*) as count FROM laporan ${where} GROUP BY status
  `;

  const total = await sql`SELECT COUNT(*) as total FROM laporan ${where}`;

  const slaCompliance = await sql`
    SELECT COUNT(*) as compliant FROM laporan 
    ${where ? sql`${where} AND` : sql`WHERE`} sla_deadline > NOW() OR status IN ('selesai', 'ditutup')
  `;

  return {
    total_laporan: parseInt(total[0].total),
    status_breakdown: Object.fromEntries(statusCounts.map(r => [r.status, parseInt(r.count)])),
    sla_compliance: total[0].total > 0 ? Math.round((parseInt(slaCompliance[0].compliant) / parseInt(total[0].total)) * 100) : 100,
  };
}

// ========== AUDIT ==========
export async function createAuditLog(data: { user_id?: string; user_email?: string; action: string; table_name: string; record_id?: string; old_value?: unknown; new_value?: unknown; ip_address?: string; user_agent?: string }) {
  await sql`
    INSERT INTO audit_log (user_id, user_email, action, table_name, record_id, old_value, new_value, ip_address, user_agent)
    VALUES (${data.user_id || null}, ${data.user_email || null}, ${data.action}, ${data.table_name}, ${data.record_id || null}, ${data.old_value ? JSON.stringify(data.old_value) : null}, ${data.new_value ? JSON.stringify(data.new_value) : null}, ${data.ip_address || null}, ${data.user_agent || null})
  `;
}
