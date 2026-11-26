import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const BASE_URL = 'https://api.lostinvirtual.com';

const Register: React.FC = () => {
  
  const [form, setForm] = useState({ nama: '', email: '', phone: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      setError('Password tidak sama');
      return;
    }
    if (form.password.length < 8) {
      setError('Password minimal 8 karakter');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: form.nama,
          email: form.email,
          phone: form.phone,
          password: form.password,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Pendaftaran gagal');
      }
    } catch {
      setError('Terjadi kesalahan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg)' }}>
        <div className="max-w-md w-full text-center">
          <div className="card p-8">
            <div style={{ fontSize: 64, marginBottom: 24 }}>✅</div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>
              Pendaftaran Berhasil!
            </h1>
            <p style={{ color: 'var(--text2)', fontSize: 16, lineHeight: 1.6, marginBottom: 24 }}>
              Akun Anda sedang menunggu persetujuan dari admin. Anda akan menerima email notifikasi ketika akun telah diaktifkan.
            </p>
            <div className="card p-4 mb-6" style={{ background: 'rgba(255,149,0,0.08)', border: '1px solid rgba(255,149,0,0.2)' }}>
              <p style={{ color: '#FF9500', fontWeight: 600, fontSize: 15 }}>
                ⏳ Status: Menunggu Persetujuan
              </p>
            </div>
            <Link to="/login" className="btn btn-primary w-full" style={{ display: 'block', textAlign: 'center' }}>
              Kembali ke Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg)' }}>
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.5px' }}>
            Daftar Akun
          </h1>
          <p style={{ color: 'var(--text2)', marginTop: 8, fontSize: 16 }}>
            Sistem Pengaduan Multi-Instansi
          </p>
        </div>

        {error && (
          <div className="card p-4 mb-6" style={{ background: 'rgba(255,59,48,0.08)', border: '1px solid rgba(255,59,48,0.2)' }}>
            <p style={{ color: '#FF3B30', fontSize: 14 }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Nama Lengkap *</label>
            <input
              type="text"
              className="input w-full"
              placeholder="Nama lengkap Anda"
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Email *</label>
            <input
              type="email"
              className="input w-full"
              placeholder="email@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>No. HP</label>
            <input
              type="tel"
              className="input w-full"
              placeholder="08xxxxxxxxxx"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Password *</label>
            <input
              type="password"
              className="input w-full"
              placeholder="Minimal 8 karakter"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Konfirmasi Password *</label>
            <input
              type="password"
              className="input w-full"
              placeholder="Ulangi password"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ minHeight: 52 }}>
            {loading ? 'Mendaftar...' : 'Daftar'}
          </button>
        </form>

        <p className="text-center mt-6" style={{ color: 'var(--text2)', fontSize: 15 }}>
          Sudah punya akun?{' '}
          <Link to="/login" style={{ color: 'var(--blue)', fontWeight: 600 }}>
            Masuk
          </Link>
        </p>

        <div className="card p-4 mt-6" style={{ background: 'rgba(0,113,227,0.05)', border: '1px solid rgba(0,113,227,0.12)' }}>
          <p style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.5 }}>
            ℹ️ Setelah mendaftar, akun perlu disetujui oleh admin sebelum dapat digunakan untuk membuat laporan.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
