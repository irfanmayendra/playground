import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ListBullets, Envelope, Lock, ArrowRight, ShieldCheck } from '@phosphor-icons/react';

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
        {/* Logo */}
        <div className="text-center mb-10 anim-up">
          <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #0071E3, #5856D6)',
              borderRadius: '28px',
            }}>
            <ListBullets size={44} weight="bold" color="white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-3">Layanan Pengaduan</h1>
          <p className="text-lg" style={{ color: 'var(--text2)' }}>Multi-Instansi Pemerintah</p>
        </div>

        {/* Login Card */}
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
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text2)' }}>
                  <Envelope size={20} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  style={{ paddingLeft: '48px' }}
                  placeholder="email@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text2)' }}>
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  style={{ paddingLeft: '48px' }}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full" style={{ marginTop: '8px', minHeight: '52px', fontSize: '16px' }}>
              {loading ? 'Memproses...' : (
                <>Masuk <ArrowRight size={20} /></>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm" style={{ color: 'var(--text2)' }}>
              Belum punya akun? <Link to="/register" className="font-semibold" style={{ color: 'var(--blue)' }}>Daftar</Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 anim-fade">
          <div className="flex items-center justify-center gap-2 text-sm" style={{ color: '#C0C0C4' }}>
            <ShieldCheck size={16} />
            <span>Sistem Pengaduan Multi-Instansi</span>
          </div>
        </div>
      </div>
    </div>
  );
}
