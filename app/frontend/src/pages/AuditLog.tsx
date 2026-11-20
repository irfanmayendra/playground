import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export default function AuditLog() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-audit'],
    queryFn: () => api.get('/api/admin/audit'),
  });

  const exportCSV = () => {
    const logs = data?.data || [];
    const headers = ['Timestamp', 'User', 'Action', 'Table', 'Record ID', 'IP'];
    const rows = logs.map((l: any) => [
      l.created_at,
      l.user_email || '-',
      l.action,
      l.table_name,
      l.record_id || '-',
      l.ip_address || '-',
    ]);
    
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">📋 Audit Log</h2>
        <button onClick={exportCSV} className="btn-primary">
          📥 Export CSV
        </button>
      </div>

      {isLoading ? (
        <div className="text-gray-500">Loading...</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Timestamp</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">User</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Action</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Table</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">IP</th>
              </tr>
            </thead>
            <tbody>
              {data?.data?.map((l: any) => (
                <tr key={l.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">{new Date(l.created_at).toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4 text-sm">{l.user_email || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      l.action === 'create' ? 'bg-green-100 text-green-700' :
                      l.action === 'delete' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {l.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{l.table_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{l.ip_address || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
