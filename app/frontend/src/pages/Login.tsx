import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('https://api.lostinvirtual.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        setError(data.error || 'Login gagal');
      }
    } catch {
      setError('Gagal terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: 'linear-gradient(180deg, #F5F5F7 0%, #E8E8ED 100%)',
    }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-10 anim-up">
          <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center text-5xl shadow-2xl" style={{
            background: 'linear-gradient(135deg, #0071E3, #5856D6)',
            borderRadius: '28px',
          }}>📋</div>
          <h1 className="text-4xl font-bold tracking-tight mb-3">Layanan Pengaduan</h1>
          <p className="text-lg" style={{ color: 'var(--text2)' }}>Multi-Instansi Pemerintah</p>
        </div>

        <div className="card-static p-10 anim-scale" style={{ borderRadius: '28px' }}>
          <h2 className="text-2xl font-bold mb-8 tracking-tight">Masuk</h2>

          {error && (
            <div className="p-4 rounded-2xl mb-6 text-sm font-medium" style={{ background: 'rgba(255,59,48,0.08)', color: 'var(--red)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="label">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="email@example.com" required />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="••••••••" required />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary w-full" style={{ marginTop: '8px', minHeight: '52px', fontSize: '16px' }}>
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm" style={{ color: 'var(--text2)' }}>
              Belum punya akun? <a href="#" className="font-semibold" style={{ color: 'var(--blue)' }}>Daftar</a>
            </p>
          </div>
        </div>

        <div className="text-center mt-8 anim-fade">
          <p className="text-sm" style={{ color: '#C0C0C4' }}>🔒 Sistem Pengaduan Multi-Instansi</p>
        </div>
      </div>
    </div>
  );
}
