import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

const STATUS_BADGES: Record<string, string> = {
  masuk: 'badge-blue',
  verifikasi: 'badge-orange',
  proses: 'badge-purple',
  selesai: 'badge-green',
  ditutup: 'badge-red',
};

export default function LaporanList() {
  const { data, isLoading } = useQuery({
    queryKey: ['laporan'],
    queryFn: () => api.get('/api/laporan?limit=50'),
  });

  return (
    <div className="animate-fade-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Pengaduan</p>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Tiket Pengaduan</h2>
        </div>
        <Link to="/laporan/baru" className="apple-btn apple-btn-primary">
          ➕ Buat Laporan
        </Link>
      </div>

      {isLoading ? (
        <div className="apple-card-static p-12 text-center">
          <div className="animate-pulse text-gray-400 text-lg">Loading...</div>
        </div>
      ) : (
        <div className="apple-card-static overflow-hidden">
          <div className="apple-table-wrap">
            <table className="apple-table">
              <thead>
                <tr>
                  <th>No. Tiket</th>
                  <th>Judul</th>
                  <th>Status</th>
                  <th>Pelapor</th>
                  <th>Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {data?.data?.map((l: any, idx: number) => (
                  <tr key={l.id} className="animate-fade-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                    <td>
                      <Link to={`/laporan/${l.id}`} className="font-mono text-sm hover:underline" style={{ color: 'var(--apple-blue)' }}>
                        {l.nomor_tiket}
                      </Link>
                    </td>
                    <td>
                      <Link to={`/laporan/${l.id}`} className="font-medium hover:underline">
                        {l.judul}
                      </Link>
                    </td>
                    <td>
                      <span className={`apple-badge ${STATUS_BADGES[l.status] || 'badge-gray'}`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="text-gray-500">{l.pelapor_nama}</td>
                    <td className="text-gray-500 text-sm">{new Date(l.created_at).toLocaleDateString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
