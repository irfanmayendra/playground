import { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';

const ROLE_MENUS: Record<string, { label: string; path: string; icon: string }[]> = {
  platform_superadmin: [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Instansi', path: '/instansi', icon: '🏛️' },
    { label: 'Semua Laporan', path: '/laporan', icon: '📝' },
    { label: 'Buat Laporan', path: '/laporan/baru', icon: '➕' },
    { label: 'Users', path: '/users', icon: '👥' },
    { label: 'Audit Log', path: '/audit', icon: '📋' },
  ],
  tenant_admin: [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Laporan Instansi', path: '/laporan', icon: '📝' },
    { label: 'Handle Laporan', path: '/laporan?status=masuk', icon: '⚡' },
    { label: 'Buat Laporan', path: '/laporan/baru', icon: '➕' },
  ],
  tenant_staff: [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Laporan Masuk', path: '/laporan?status=masuk', icon: '📥' },
    { label: 'Semua Laporan', path: '/laporan', icon: '📝' },
  ],
  tenant_user: [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Buat Laporan', path: '/laporan/baru', icon: '➕' },
    { label: 'Laporan Saya', path: '/laporan', icon: '📝' },
  ],
};

const ROLE_LABELS: Record<string, string> = {
  platform_superadmin: 'Super Admin',
  tenant_admin: 'Admin Instansi',
  tenant_staff: 'Petugas',
  tenant_user: 'Masyarakat',
  super_admin: 'Super Admin',
  instansi_admin: 'Admin Instansi',
  petugas: 'Petugas',
  supervisor: 'Supervisor',
  masyarakat: 'Masyarakat',
};

export default function Layout() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      const saved = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(saved);
    } catch {
      navigate('/login');
    }
  }, [navigate]);

  const role = user.role || 'tenant_user';
  const menus = ROLE_MENUS[role] || ROLE_MENUS.tenant_user;
  const roleLabel = ROLE_LABELS[role] || role;

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

        {/* User info */}
        <div className="px-4 pb-4 mb-2 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
              {(user.name || user.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-medium text-white">{user.name || user.email}</div>
              <div className="text-xs px-2 py-0.5 rounded-full bg-blue-600/30 text-blue-200 mt-0.5">
                {roleLabel}
              </div>
            </div>
          </div>
        </div>

        {/* Role-based menu */}
        <nav className="flex-1 px-4">
          {menus.map((menu) => (
            <NavLink
              key={menu.path}
              to={menu.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition ${
                  isActive ? 'bg-white/20 text-white' : 'text-gray-300 hover:bg-white/10'
                }`
              }
            >
              <span>{menu.icon}</span>
              <span>{menu.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
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
