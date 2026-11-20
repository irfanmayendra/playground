-- ============================================
-- Multi-Tenant SaaS: Layanan Pengaduan Multi-Instansi
-- Database Schema (PostgreSQL 18 / Neon)
-- ============================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_session_jwt";

-- ============================================
-- SHARED SCHEMA (public)
-- ============================================

-- Instansi (Tenant)
CREATE TABLE instansi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama VARCHAR(255) NOT NULL,
  kode VARCHAR(50) UNIQUE NOT NULL,
  alamat TEXT,
  kontak_email VARCHAR(255),
  kontak_phone VARCHAR(50),
  logo_url TEXT,
  sla_hours INT DEFAULT 72,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users (shared across tenants)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keycloak_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  nama VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  role VARCHAR(50) NOT NULL CHECK (role IN ('super_admin','instansi_admin','petugas','supervisor','masyarakat')),
  instansi_id UUID REFERENCES instansi(id),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kategori Laporan
CREATE TABLE kategori (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama VARCHAR(255) NOT NULL,
  deskripsi TEXT,
  instansi_id UUID REFERENCES instansi(id),
  sla_hours INT DEFAULT 72,
  priority_default VARCHAR(20) DEFAULT 'medium' CHECK (priority_default IN ('low','medium','high','critical')),
  form_fields JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Log
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  user_email VARCHAR(255),
  action VARCHAR(50) NOT NULL,
  table_name VARCHAR(100),
  record_id UUID,
  old_value JSONB,
  new_value JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk shared tables
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_keycloak ON users(keycloak_id);
CREATE INDEX idx_users_instansi ON users(instansi_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_kategori_instansi ON kategori(instansi_id);
CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_action ON audit_log(action);
CREATE INDEX idx_audit_table ON audit_log(table_name);
CREATE INDEX idx_audit_created ON audit_log(created_at);

-- ============================================
-- TENANT SCHEMA TEMPLATE
-- (akan di-clone untuk setiap instansi)
-- ============================================

-- Laporan (per-tenant)
CREATE TABLE laporan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor_tiket VARCHAR(50) UNIQUE NOT NULL,
  judul VARCHAR(255) NOT NULL,
  deskripsi TEXT NOT NULL,
  kategori_id UUID REFERENCES kategori(id),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low','medium','high','critical')),
  status VARCHAR(20) DEFAULT 'masuk' CHECK (status IN ('masuk','verifikasi','proses','selesai','ditutup')),
  pelapor_id UUID REFERENCES users(id),
  petugas_id UUID REFERENCES users(id),
  instansi_id UUID REFERENCES instansi(id),
  lokasi TEXT,
  lampiran_count INT DEFAULT 0,
  komentar_count INT DEFAULT 0,
  sla_deadline TIMESTAMPTZ,
  first_response_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  satisfaction_rating INT CHECK (satisfaction_rating BETWEEN 1 AND 5),
  satisfaction_feedback TEXT,
  is_reopened BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lampiran (per-tenant)
CREATE TABLE lampiran (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  laporan_id UUID REFERENCES laporan(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255),
  s3_url TEXT NOT NULL,
  mime_type VARCHAR(100),
  size_bytes BIGINT,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Komentar (per-tenant)
CREATE TABLE komentar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  laporan_id UUID REFERENCES laporan(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  user_nama VARCHAR(255),
  user_role VARCHAR(50),
  isi TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Status History (per-tenant)
CREATE TABLE status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  laporan_id UUID REFERENCES laporan(id) ON DELETE CASCADE,
  from_status VARCHAR(20),
  to_status VARCHAR(20) NOT NULL,
  changed_by UUID REFERENCES users(id),
  changed_by_nama VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk tenant tables
CREATE INDEX idx_laporan_nomor ON laporan(nomor_tiket);
CREATE INDEX idx_laporan_status ON laporan(status);
CREATE INDEX idx_laporan_kategori ON laporan(kategori_id);
CREATE INDEX idx_laporan_pelapor ON laporan(pelapor_id);
CREATE INDEX idx_laporan_petugas ON laporan(petugas_id);
CREATE INDEX idx_laporan_instansi ON laporan(instansi_id);
CREATE INDEX idx_laporan_sla ON laporan(sla_deadline);
CREATE INDEX idx_laporan_created ON laporan(created_at);
CREATE INDEX idx_lampiran_laporan ON lampiran(laporan_id);
CREATE INDEX idx_komentar_laporan ON komentar(laporan_id);
CREATE INDEX idx_status_laporan ON status_history(laporan_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-generate nomor tiket
CREATE OR REPLACE FUNCTION generate_nomor_tiket(instansi_kode VARCHAR)
RETURNS VARCHAR AS $$
DECLARE
  seq INT;
  tahun INT;
BEGIN
  tahun := EXTRACT(YEAR FROM NOW());
  SELECT COALESCE(MAX(CAST(SPLIT_PART(nomor_tiket, '-', 3) AS INT)), 0) + 1
  INTO seq
  FROM laporan
  WHERE nomor_tiket LIKE 'LP-' || tahun || '-' || instansi_kode || '-%';
  RETURN 'LP-' || tahun || '-' || instansi_kode || '-' || LPAD(seq::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_instansi_updated BEFORE UPDATE ON instansi
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_users_updated BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_laporan_updated BEFORE UPDATE ON laporan
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-update laporan counters
CREATE OR REPLACE FUNCTION update_laporan_counters()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'lampiran' THEN
    UPDATE laporan SET lampiran_count = (
      SELECT COUNT(*) FROM lampiran WHERE laporan_id = NEW.laporan_id
    ) WHERE id = NEW.laporan_id;
  ELSIF TG_TABLE_NAME = 'komentar' THEN
    UPDATE laporan SET komentar_count = (
      SELECT COUNT(*) FROM komentar WHERE laporan_id = NEW.laporan_id
    ) WHERE id = NEW.laporan_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_lampiran_counter AFTER INSERT OR DELETE ON lampiran
  FOR EACH ROW EXECUTE FUNCTION update_laporan_counters();
CREATE TRIGGER tr_komentar_counter AFTER INSERT OR DELETE ON komentar
  FOR EACH ROW EXECUTE FUNCTION update_laporan_counters();

-- ============================================
-- SEED DATA
-- ============================================

-- Insert sample instansi
INSERT INTO instansi (nama, kode, alamat, kontak_email, kontak_phone, sla_hours) VALUES
  ('Kepolisian Republik Indonesia', 'POLRI', 'Jakarta, Indonesia', 'pengaduan@polri.go.id', '021-110', 48),
  ('Dinas Kesehatan', 'DINKES', 'Jakarta, Indonesia', 'pengaduan@dinkes.go.id', '021-119', 72),
  ('Dinas Sosial', 'DINSOS', 'Jakarta, Indonesia', 'pengaduan@dinsos.go.id', '021-111', 72),
  ('Dinas Perhubungan', 'DISHUB', 'Jakarta, Indonesia', 'pengaduan@dishub.go.id', '021-115', 48),
  ('Ombudsman Republik Indonesia', 'OMBUDSMAN', 'Jakarta, Indonesia', 'pengaduan@ombudsman.go.id', '021-117', 96);

-- Insert sample kategori
INSERT INTO kategori (nama, deskripsi, instansi_id, sla_hours, priority_default) VALUES
  ('Kejahatan Siber', 'Laporan terkait kejahatan siber dan penipuan online', (SELECT id FROM instansi WHERE kode='POLRI'), 24, 'high'),
  ('Kekerasan', 'Laporan kekerasan fisik dan verbal', (SELECT id FROM instansi WHERE kode='POLRI'), 24, 'critical'),
  ('Penipuan', 'Laporan penipuan dan penggelapan', (SELECT id FROM instansi WHERE kode='POLRI'), 48, 'high'),
  ('Kesehatan Masyarakat', 'Laporan terkait layanan kesehatan', (SELECT id FROM instansi WHERE kode='DINKES'), 72, 'medium'),
  ('Obat & Makanan', 'Laporan produk obat/makanan berbahaya', (SELECT id FROM instansi WHERE kode='DINKES'), 48, 'high'),
  ('Bantuan Sosial', 'Laporan terkait bantuan sosial', (SELECT id FROM instansi WHERE kode='DINSOS'), 72, 'medium'),
  ('Fasilitas Umum', 'Laporan kerusakan fasilitas umum', (SELECT id FROM instansi WHERE kode='DISHUB'), 96, 'low'),
  ('Lalu Lintas', 'Laporan pelanggaran lalu lintas', (SELECT id FROM instansi WHERE kode='DISHUB'), 48, 'medium'),
  ('Maladministrasi', 'Laporan maladministrasi pemerintah', (SELECT id FROM instansi WHERE kode='OMBUDSMAN'), 120, 'medium'),
  ('Pelayanan Publik', 'Laporan kualitas pelayanan publik', (SELECT id FROM instansi WHERE kode='OMBUDSMAN'), 96, 'low');

-- Enable Row Level Security (optional, for extra isolation)
-- ALTER TABLE laporan ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE lampiran ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE komentar ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE instansi = 'Multi-tenant: setiap instansi = 1 tenant';
COMMENT ON TABLE users = 'Shared: user bisa akses multiple instansi';
COMMENT ON TABLE laporan = 'Per-tenant: laporan pengaduan';
COMMENT ON TABLE audit_log = 'Shared: audit trail semua aksi';
