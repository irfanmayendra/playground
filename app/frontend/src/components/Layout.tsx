import { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';

const ROLE_MENUS: Record<string, { label: string; path: string; icon: string }[]> = {
  platform_superadmin: [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Tenant Management', path: '/tenants', icon: '🏢' },
    { label: 'Instansi', path: '/instansi', icon: '🏛️' },
    { label: 'Semua Laporan', path: '/laporan', icon: '📝' },
    { label: 'Buat Laporan', path: '/laporan/baru', icon: '➕' },
    { label: 'Users', path: '/users', icon: '👥' },
    { label: 'Audit Log', path: '/audit', icon: '📋' },
  ],
  tenant_admin: [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Laporan', path: '/laporan', icon: '📝' },
    { label: 'Buat Laporan', path: '/laporan/baru', icon: '➕' },
  ],
  tenant_staff: [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Laporan Masuk', path: '/laporan', icon: '📥' },
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
};

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      setUser(JSON.parse(localStorage.getItem('user') || '{}'));
    } catch { navigate('/login'); }
  }, [navigate]);

  useEffect(() => { setSidebarOpen(false); }, [location]);

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
    <div className="flex h-screen overflow-hidden">
      {/* Overlay */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''} flex flex-col`} style={{ width: 260, minWidth: 260 }}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg"
              style={{ background: 'linear-gradient(135deg, #0071E3, #5856D6)' }}>📋</div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Pengaduan</h1>
              <p className="text-xs text-gray-500">Multi-Instansi</p>
            </div>
          </div>
        </div>

        {/* User */}
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #0071E3, #5856D6)' }}>
              {(user.name || user.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-900 truncate">{user.name || user.email}</div>
              <div className="mt-1">
                <span className="apple-badge badge-blue" style={{ fontSize: 11 }}>{roleLabel}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">Menu</div>
          {menus.map((menu) => (
            <NavLink key={menu.path} to={menu.path} className={({ isActive }) => `sidebar-link mb-1 ${isActive ? 'active' : ''}`}>
              <span className="text-lg">{menu.icon}</span>
              <span>{menu.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-100">
          <button onClick={handleLogout} className="sidebar-link w-full text-left">
            <span className="text-lg">🚪</span>
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto main-content">
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 z-40 border-b border-gray-100 px-4 py-3"
          style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-gray-100">
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              <div>
                <h1 className="text-base font-bold text-gray-900">📋 Pengaduan</h1>
                <p className="text-xs text-gray-500">{roleLabel}</p>
              </div>
            </div>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #0071E3, #5856D6)' }}>
              {(user.name || 'U').charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>

      {/* FAB */}
      <button className="mobile-menu-btn md:hidden" onClick={() => navigate('/laporan/baru')}>➕</button>
    </div>
  );
}
