import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { PlusCircle } from '@phosphor-icons/react';
import { api } from '../lib/api';

const BADGES: Record<string, string> = {
  masuk: 'badge-blue', verifikasi: 'badge-orange', proses: 'badge-purple', selesai: 'badge-green', ditutup: 'badge-red',
};

export default function LaporanList() {
  const { data, isLoading } = useQuery({
    queryKey: ['laporan'],
    queryFn: () => api.get('/api/laporan?limit=50'),
  });

  return (
    <div className="anim-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text2)' }}>Pengaduan</p>
          <h2 className="text-3xl font-bold tracking-tight">Tiket Pengaduan</h2>
        </div>
        <Link to="/laporan/baru" className="btn btn-primary">
          <PlusCircle size={20} /> Buat Laporan
        </Link>
      </div>

      {isLoading ? (
        <div className="card-static p-12 text-center text-gray-400 text-lg">Loading...</div>
      ) : (
        <div className="card-static overflow-hidden">
          <div className="table-wrap">
            <table className="table">
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
                {data?.data?.map((l: any, i: number) => (
                  <tr key={l.id} className="anim-up" style={{ animationDelay: `${i * 0.05}s` }}>
                    <td>
                      <Link to={`/laporan/${l.id}`} className="font-mono text-sm hover:underline" style={{ color: 'var(--blue)' }}>
                        {l.nomor_tiket}
                      </Link>
                    </td>
                    <td>
                      <Link to={`/laporan/${l.id}`} className="font-medium hover:underline">{l.judul}</Link>
                    </td>
                    <td><span className={`badge ${BADGES[l.status] || 'badge-gray'}`}>{l.status}</span></td>
                    <td style={{ color: 'var(--text2)' }}>{l.pelapor_nama}</td>
                    <td className="text-sm" style={{ color: 'var(--text2)' }}>{new Date(l.created_at).toLocaleDateString('id-ID')}</td>
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
