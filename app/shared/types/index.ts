// Shared Types
export type Role = 'super_admin' | 'instansi_admin' | 'petugas' | 'supervisor' | 'masyarakat';

export type LaporanStatus = 'masuk' | 'verifikasi' | 'proses' | 'selesai' | 'ditutup';

export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface User {
  id: string;
  keycloak_id: string;
  email: string;
  nama: string;
  phone?: string;
  role: Role;
  instansi_id?: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface Instansi {
  id: string;
  nama: string;
  kode: string;
  alamat?: string;
  kontak_email?: string;
  kontak_phone?: string;
  logo_url?: string;
  sla_hours: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Kategori {
  id: string;
  nama: string;
  deskripsi?: string;
  instansi_id: string;
  sla_hours: number;
  priority_default: Priority;
  form_fields: FormField[];
  is_active: boolean;
  created_at: string;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number' | 'date' | 'file';
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export interface Laporan {
  id: string;
  nomor_tiket: string;
  judul: string;
  deskripsi: string;
  kategori_id: string;
  priority: Priority;
  status: LaporanStatus;
  pelapor_id: string;
  petugas_id?: string;
  instansi_id: string;
  lokasi?: string;
  lampiran_count: number;
  komentar_count: number;
  sla_deadline: string;
  first_response_at?: string;
  closed_at?: string;
  satisfaction_rating?: number;
  satisfaction_feedback?: string;
  is_reopened: boolean;
  created_at: string;
  updated_at: string;
}

export interface Lampiran {
  id: string;
  laporan_id: string;
  filename: string;
  original_name?: string;
  s3_url: string;
  mime_type?: string;
  size_bytes?: number;
  uploaded_by: string;
  created_at: string;
}

export interface Komentar {
  id: string;
  laporan_id: string;
  user_id: string;
  user_nama: string;
  user_role: Role;
  isi: string;
  is_internal: boolean;
  created_at: string;
}

export interface StatusHistory {
  id: string;
  laporan_id: string;
  from_status?: LaporanStatus;
  to_status: LaporanStatus;
  changed_by: string;
  changed_by_nama: string;
  notes?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  user_email?: string;
  action: string;
  table_name: string;
  record_id?: string;
  old_value?: Record<string, unknown>;
  new_value?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface JWTPayload {
  sub: string;
  email: string;
  name: string;
  preferred_username: string;
  realm_access: { roles: Role[] };
  azp: string;
  iss: string;
  exp: number;
  iat: number;
}
