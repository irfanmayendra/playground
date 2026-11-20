import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/api/dashboard/overview'),
  });

  const stats = data?.data;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      
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
