import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';

export default function LaporanDetail() {
  const { id } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ['laporan', id],
    queryFn: () => api.get(`/api/laporan/${id}`),
  });

  const l = data?.data;

  return (
    <div>
      {isLoading ? (
        <div className="text-gray-500">Loading...</div>
      ) : l ? (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <span className="font-mono text-sm text-gray-500">{l.nomor_tiket}</span>
            <span className={`status-badge status-${l.status}`}>{l.status}</span>
          </div>

          <div className="card p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">{l.judul}</h2>
            <p className="text-gray-600">{l.deskripsi}</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="font-semibold mb-3">Detail</h3>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Kategori</dt>
                  <dd>{l.kategori_nama}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Prioritas</dt>
                  <dd>{l.priority}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Pelapor</dt>
                  <dd>{l.pelapor_nama}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">SLA Deadline</dt>
                  <dd>{new Date(l.sla_deadline).toLocaleString('id-ID')}</dd>
                </div>
              </dl>
            </div>

            <div className="card p-6">
              <h3 className="font-semibold mb-3">Timeline</h3>
              <div className="text-gray-500 text-sm">
                Dibuat: {new Date(l.created_at).toLocaleString('id-ID')}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-gray-500">Laporan tidak ditemukan</div>
      )}
    </div>
  );
}
