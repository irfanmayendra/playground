import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  SquaresFour, ArrowDown, Spinner, CheckCircle, Clock, PlusCircle, ListChecks,
  Buildings, ChatCircle, Paperclip, ChartLineUp,
} from '@phosphor-icons/react';
import { api } from '../lib/api';

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user.role || 'tenant_user';

  const { data } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/api/dashboard/overview'),
  });

  const stats = data?.data;
  const b = stats?.status_breakdown || {};

  return (
    <div className="anim-up">
      <div className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text2)' }}>Dashboard</p>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
          Halo, {user.name || 'User'}
        </h2>
        <p className="mt-2 text-lg" style={{ color: 'var(--text2)' }}>Berikut ringkasan pengaduan hari ini</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10 stagger">
        <div className="stat">
          <div className="flex items-start justify-between">
            <div>
              <div className="stat-lbl mb-2">Total</div>
              <div className="stat-num">{stats?.total_laporan || 0}</div>
            </div>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(0,113,227,0.08)' }}>
              <SquaresFour size={24} style={{ color: 'var(--blue)' }} />
            </div>
          </div>
        </div>
        <div className="stat">
          <div className="flex items-start justify-between">
            <div>
              <div className="stat-lbl mb-2">Masuk</div>
              <div className="stat-num" style={{ color: 'var(--blue)' }}>{b.masuk || 0}</div>
            </div>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(0,113,227,0.08)' }}>
              <ArrowDown size={24} style={{ color: 'var(--blue)' }} />
            </div>
          </div>
        </div>
        <div className="stat">
          <div className="flex items-start justify-between">
            <div>
              <div className="stat-lbl mb-2">Diproses</div>
              <div className="stat-num" style={{ color: 'var(--purple)' }}>{b.proses || 0}</div>
            </div>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(175,82,222,0.08)' }}>
              <Spinner size={24} style={{ color: 'var(--purple)' }} />
            </div>
          </div>
        </div>
        <div className="stat">
          <div className="flex items-start justify-between">
            <div>
              <div className="stat-lbl mb-2">Selesai</div>
              <div className="stat-num" style={{ color: 'var(--green)' }}>{b.selesai || 0}</div>
            </div>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(52,199,89,0.08)' }}>
              <CheckCircle size={24} style={{ color: 'var(--green)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* SLA + Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div className="card-static p-8">
          <div className="flex items-center gap-3 mb-2">
            <Clock size={22} style={{ color: 'var(--green)' }} />
            <h3 className="text-xl font-bold">SLA Compliance</h3>
          </div>
          <p className="text-sm mb-6" style={{ color: 'var(--text2)' }}>Tingkat penyelesaian sesuai SLA</p>
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${stats?.sla_compliance || 0}%`, background: 'linear-gradient(90deg, #34C759, #30D158)' }} />
              </div>
            </div>
            <div className="text-5xl font-extrabold" style={{ color: 'var(--green)' }}>{stats?.sla_compliance || 0}%</div>
          </div>
        </div>

        <div className="card-static p-8">
          <h3 className="text-xl font-bold mb-6">Aksi Cepat</h3>
          <div className="space-y-3">
            <Link to="/laporan/baru" className="btn btn-primary w-full">
              <PlusCircle size={20} /> Buat Laporan Baru
            </Link>
            <Link to="/laporan" className="btn btn-secondary w-full">
              <ListChecks size={20} /> Lihat Semua Laporan
            </Link>
            {role === 'platform_superadmin' && (
              <Link to="/tenants" className="btn btn-ghost w-full">
                <Buildings size={20} /> Tenant Management
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <div className="card-static p-6">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(0,113,227,0.08)' }}>
            <Buildings size={22} style={{ color: 'var(--blue)' }} />
          </div>
          <h4 className="font-bold mb-1">5 Instansi</h4>
          <p className="text-sm" style={{ color: 'var(--text2)' }}>POLRI, DINKES, DINSOS, DISHUB, OMBUDSMAN</p>
        </div>
        <div className="card-static p-6">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(52,199,89,0.08)' }}>
            <ChatCircle size={22} style={{ color: 'var(--green)' }} />
          </div>
          <h4 className="font-bold mb-1">Diskusi</h4>
          <p className="text-sm" style={{ color: 'var(--text2)' }}>Komunikasi real-time pelapor & petugas</p>
        </div>
        <div className="card-static p-6">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(255,149,0,0.08)' }}>
            <Paperclip size={22} style={{ color: 'var(--orange)' }} />
          </div>
          <h4 className="font-bold mb-1">Bukti</h4>
          <p className="text-sm" style={{ color: 'var(--text2)' }}>Upload foto, video, dokumen</p>
        </div>
        <div className="card-static p-6">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(175,82,222,0.08)' }}>
            <ChartLineUp size={22} style={{ color: 'var(--purple)' }} />
          </div>
          <h4 className="font-bold mb-1">Progress</h4>
          <p className="text-sm" style={{ color: 'var(--text2)' }}>Track status pengaduan real-time</p>
        </div>
      </div>
    </div>
  );
}
