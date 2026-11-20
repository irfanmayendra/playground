import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

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
    <div className="animate-apple-fade-up">
      {/* Header */}
      <div className="mb-10">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Dashboard
        </p>
        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight">
          Halo, {user.name || 'User'} <span className="inline-block animate-apple-scale-in">👋</span>
        </h2>
        <p className="text-gray-500 mt-2 text-lg">
          Berikut ringkasan pengaduan hari ini
        </p>
      </div>

      {/* Bento Grid — Stats */}
      <div className="bento-grid stagger-children mb-10">
        <div className="stat-card bento-item">
          <div className="flex items-start justify-between">
            <div>
              <div className="stat-label mb-2">Total</div>
              <div className="stat-number text-gray-900">{stats?.total_laporan || 0}</div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl">📊</div>
          </div>
        </div>

        <div className="stat-card bento-item">
          <div className="flex items-start justify-between">
            <div>
              <div className="stat-label mb-2">Masuk</div>
              <div className="stat-number" style={{ color: 'var(--apple-blue)' }}>{breakdown.masuk || 0}</div>
            </div>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ background: 'rgba(0,113,227,0.08)' }}>📥</div>
          </div>
        </div>

        <div className="stat-card bento-item">
          <div className="flex items-start justify-between">
            <div>
              <div className="stat-label mb-2">Diproses</div>
              <div className="stat-number" style={{ color: 'var(--apple-purple)' }}>{breakdown.proses || 0}</div>
            </div>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ background: 'rgba(175,82,222,0.08)' }}>⚙️</div>
          </div>
        </div>

        <div className="stat-card bento-item">
          <div className="flex items-start justify-between">
            <div>
              <div className="stat-label mb-2">Selesai</div>
              <div className="stat-number" style={{ color: 'var(--apple-green)' }}>{breakdown.selesai || 0}</div>
            </div>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ background: 'rgba(52,199,89,0.08)' }}>✅</div>
          </div>
        </div>
      </div>

      {/* Bento Grid — Content */}
      <div className="bento-grid stagger-children">
        {/* SLA — wide card */}
        <div className="apple-card-static bento-item bento-span-2 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-2">⏱️ SLA Compliance</h3>
          <p className="text-gray-500 text-sm mb-6">Tingkat penyelesaian sesuai Service Level Agreement</p>
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <div className="apple-progress-track">
                <div
                  className="apple-progress-fill"
                  style={{
                    width: `${stats?.sla_compliance || 0}%`,
                    background: 'linear-gradient(90deg, #34C759, #30D158)',
                  }}
                />
              </div>
            </div>
            <div className="text-5xl font-extrabold tracking-tight" style={{ color: 'var(--apple-green)' }}>
              {stats?.sla_compliance || 0}%
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="apple-card-static bento-item bento-span-2 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">⚡ Aksi Cepat</h3>
          <div className="space-y-3">
            <Link to="/laporan/baru" className="apple-btn apple-btn-primary w-full">
              ➕ Buat Laporan Baru
            </Link>
            <Link to="/laporan" className="apple-btn apple-btn-secondary w-full">
              📝 Lihat Semua Laporan
            </Link>
            {role === 'platform_superadmin' && (
              <Link to="/tenants" className="apple-btn apple-btn-ghost w-full">
                🏢 Tenant Management
              </Link>
            )}
          </div>
        </div>

        {/* Info Cards */}
        <div className="apple-card-static bento-item p-6">
          <div className="text-4xl mb-4">🏛️</div>
          <h4 className="font-bold text-gray-900 mb-1">5 Instansi</h4>
          <p className="text-gray-500 text-sm">POLRI, DINKES, DINSOS, DISHUB, OMBUDSMAN</p>
        </div>

        <div className="apple-card-static bento-item p-6">
          <div className="text-4xl mb-4">💬</div>
          <h4 className="font-bold text-gray-900 mb-1">Diskusi</h4>
          <p className="text-gray-500 text-sm">Komunikasi real-time pelapor ↔ petugas</p>
        </div>

        <div className="apple-card-static bento-item p-6">
          <div className="text-4xl mb-4">📎</div>
          <h4 className="font-bold text-gray-900 mb-1">Bukti</h4>
          <p className="text-gray-500 text-sm">Upload foto, video, dokumen</p>
        </div>

        <div className="apple-card-static bento-item p-6">
          <div className="text-4xl mb-4">📊</div>
          <h4 className="font-bold text-gray-900 mb-1">Progress</h4>
          <p className="text-gray-500 text-sm">Track status pengaduan real-time</p>
        </div>
      </div>
    </div>
  );
}
