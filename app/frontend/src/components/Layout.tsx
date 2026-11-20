import { useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';

export default function Layout() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Check token expiry
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } catch {
      navigate('/login');
    }
  }, [navigate]);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="sidebar w-64 flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold">📋 Pengaduan</h1>
          <p className="text-sm text-gray-400 mt-1">Multi-Instansi</p>
        </div>

        <nav className="flex-1 px-4">
          <NavLink to="/dashboard" className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition ${isActive ? 'bg-white/20 text-white' : 'text-gray-300 hover:bg-white/10'}`
          }>
            📊 Dashboard
          </NavLink>
          <NavLink to="/laporan" className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition ${isActive ? 'bg-white/20 text-white' : 'text-gray-300 hover:bg-white/10'}`
          }>
            📝 Laporan
          </NavLink>
          <NavLink to="/laporan/baru" className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition ${isActive ? 'bg-white/20 text-white' : 'text-gray-300 hover:bg-white/10'}`
          }>
            ➕ Buat Laporan
          </NavLink>
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="text-sm text-gray-300 mb-2">
            {user.name || user.email || 'User'}
          </div>
          <div className="text-xs text-gray-500 mb-3 capitalize">
            {user.role || 'masyarakat'}
          </div>
          <button onClick={handleLogout} className="text-gray-400 hover:text-white text-sm">
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
