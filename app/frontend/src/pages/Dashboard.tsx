import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

const ROLE_DASHBOARDS: Record<string, string> = {
  platform_superadmin: 'Platform Overview — Semua Instansi',
  tenant_admin: 'Dashboard Instansi',
  tenant_staff: 'Dashboard Petugas — Laporan Masuk',
  tenant_user: 'Dashboard Saya — Laporan Saya',
};

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user.role || 'tenant_user';

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/api/dashboard/overview'),
  });

  const stats = data?.data;

  return (
    <div>
      <div className="mb-2">
        <span className="text-sm text-gray-500">{ROLE_DASHBOARDS[role] || 'Dashboard'}</span>
      </div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

      {/* Role badge */}
      <div className="card p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
            {(user.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold">{user.name || user.email}</div>
            <div className="text-sm text-gray-500">
              Role: <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{role}</span>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-gray-500">Loading...</div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card p-6">
              <div className="text-sm text-gray-500">Total Laporan</div>
              <div className="text-3xl font-bold mt-1">{stats?.total_laporan || 0}</div>
            </div>
            <div className="card p-6">
              <div className="text-sm text-gray-500">Masuk</div>
              <div className="text-3xl font-bold mt-1 text-blue-600">{stats?.status_breakdown?.masuk || 0}</div>
            </div>
            <div className="card p-6">
              <div className="text-sm text-gray-500">Diproses</div>
              <div className="text-3xl font-bold mt-1 text-purple-600">{stats?.status_breakdown?.proses || 0}</div>
            </div>
            <div className="card p-6">
              <div className="text-sm text-gray-500">Selesai</div>
              <div className="text-3xl font-bold mt-1 text-green-600">{stats?.status_breakdown?.selesai || 0}</div>
            </div>
          </div>

          {/* Role-specific actions */}
          {role === 'platform_superadmin' && (
            <div className="card p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">🔧 Admin Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <button className="btn-primary">Manage Instansi</button>
                <button className="btn-primary">Manage Users</button>
                <button className="btn-primary">View Audit Log</button>
                <button className="btn-primary">Export Reports</button>
              </div>
            </div>
          )}

          {(role === 'tenant_staff' || role === 'tenant_admin') && (
            <div className="card p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">⚡ Petugas Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <button className="btn-primary">Laporan Masuk</button>
                <button className="btn-primary">Proses Laporan</button>
                <button className="btn-primary">Update Status</button>
                <button className="btn-primary">Tambah Komentar</button>
              </div>
            </div>
          )}

          {role === 'tenant_user' && (
            <div className="card p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">👤 User Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <button className="btn-primary">Buat Laporan Baru</button>
                <button className="btn-primary">Lihat Laporan Saya</button>
              </div>
            </div>
          )}

          {/* SLA Compliance */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">SLA Compliance</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-gray-200 rounded-full h-4">
                <div
                  className="bg-green-500 h-4 rounded-full transition-all"
                  style={{ width: `${stats?.sla_compliance || 0}%` }}
                />
              </div>
              <span className="text-lg font-bold">{stats?.sla_compliance || 0}%</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
