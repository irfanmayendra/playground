import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

const ROLE_DASHBOARDS: Record<string, string> = {
  platform_superadmin: 'Platform Overview — Semua Instansi',
  tenant_admin: 'Dashboard Instansi',
  tenant_staff: 'Dashboard Petugas',
  tenant_user: 'Dashboard Saya',
};

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user.role || 'tenant_user';

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/api/dashboard/overview'),
  });

  const stats = data?.data;
  const breakdown = stats?.status_breakdown || {};

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm text-gray-500 mb-1">{ROLE_DASHBOARDS[role]}</p>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
          Selamat datang, {user.name || 'User'} 👋
        </h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-label">Total</div>
              <div className="stat-number text-gray-900">{stats?.total_laporan || 0}</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">📊</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-label">Masuk</div>
              <div className="stat-number text-blue-600">{breakdown.masuk || 0}</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl">📥</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-label">Diproses</div>
              <div className="stat-number text-purple-600">{breakdown.proses || 0}</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-2xl">⚙️</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-label">Selesai</div>
              <div className="stat-number text-green-600">{breakdown.selesai || 0}</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-2xl">✅</div>
          </div>
        </div>
      </div>

      {/* SLA + Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* SLA Compliance */}
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">⏱️ SLA Compliance</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-400 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${stats?.sla_compliance || 0}%` }}
                />
              </div>
              <span className="text-2xl font-bold text-green-600">{stats?.sla_compliance || 0}%</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">Laporan diselesaikan sesuai SLA</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ Aksi Cepat</h3>
            <div className="space-y-3">
              <Link to="/laporan/baru" className="btn btn-primary w-full">
                ➕ Buat Laporan Baru
              </Link>
              <Link to="/laporan" className="btn btn-outline w-full">
                📝 Lihat Semua Laporan
              </Link>
              {role === 'platform_superadmin' && (
                <Link to="/tenants" className="btn btn-ghost w-full">
                  🏢 Tenant Management
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Role-specific info */}
      <div className="card">
        <div className="card-body">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">ℹ️ Informasi</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-blue-50">
              <div className="text-2xl mb-2">🏛️</div>
              <div className="font-semibold text-gray-900">5 Instansi</div>
              <div className="text-sm text-gray-500">POLRI, DINKES, DINSOS, DISHUB, OMBUDSMAN</div>
            </div>
            <div className="p-4 rounded-xl bg-green-50">
              <div className="text-2xl mb-2">💬</div>
              <div className="font-semibold text-gray-900">Diskusi Real-time</div>
              <div className="text-sm text-gray-500">Komunikasi pelapor ↔ petugas</div>
            </div>
            <div className="p-4 rounded-xl bg-purple-50">
              <div className="text-2xl mb-2">📎</div>
              <div className="font-semibold text-gray-900">Upload Bukti</div>
              <div className="text-sm text-gray-500">Foto, video, dokumen pendukung</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
