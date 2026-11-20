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
        {/* Logo */}
        <div className="text-center mb-10 animate-apple-fade-up">
          <div className="w-24 h-24 rounded-[28px] mx-auto mb-6 flex items-center justify-center text-5xl shadow-2xl" style={{
            background: 'linear-gradient(135deg, #0071E3, #5856D6)',
          }}>
            📋
          </div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-3">
            Layanan Pengaduan
          </h1>
          <p className="text-gray-500 text-lg">
            Multi-Instansi Pemerintah
          </p>
        </div>

        {/* Login Card */}
        <div className="apple-card-static p-10 animate-apple-scale-in" style={{
          animationDelay: '0.15s',
          borderRadius: 'var(--apple-radius-lg)',
        }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-8 tracking-tight">Masuk</h2>

          {error && (
            <div className="p-4 rounded-2xl mb-6 text-sm font-medium animate-apple-scale-in" style={{
              background: 'rgba(255,59,48,0.08)',
              color: 'var(--apple-red)',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="apple-label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="apple-input"
                placeholder="email@example.com"
                required
              />
            </div>

            <div>
              <label className="apple-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="apple-input"
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="apple-btn apple-btn-primary w-full text-base" style={{
              marginTop: '8px',
            }}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Memproses...
                </span>
              ) : (
                'Masuk'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Belum punya akun?{' '}
              <a href="#" className="font-semibold" style={{ color: 'var(--apple-blue)' }}>Daftar</a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 animate-apple-fade-in" style={{ animationDelay: '0.3s' }}>
          <p className="text-gray-400 text-sm">
            🔒 Sistem Pengaduan Multi-Instansi
          </p>
        </div>
      </div>
    </div>
  );
}
