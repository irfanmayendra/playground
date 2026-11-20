import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

export default function LaporanList() {
  const { data, isLoading } = useQuery({
    queryKey: ['laporan'],
    queryFn: () => api.get('/api/laporan?limit=20'),
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Laporan</h2>
        <Link to="/laporan/baru" className="btn-primary">+ Buat Laporan</Link>
      </div>

      {isLoading ? (
        <div className="text-gray-500">Loading...</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">No. Tiket</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Judul</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {data?.data?.map((l: any) => (
                <tr key={l.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link to={`/laporan/${l.id}`} className="text-blue-600 hover:underline font-mono text-sm">
                      {l.nomor_tiket}
                    </Link>
                  </td>
                  <td className="px-6 py-4">{l.judul}</td>
                  <td className="px-6 py-4">
                    <span className={`status-badge status-${l.status}`}>{l.status}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {new Date(l.created_at).toLocaleDateString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
