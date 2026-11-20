import { useQuery } from '@tanstack/react-query';
import { Download, ClipboardText, Plus, PencilSimple, Trash, SignIn } from '@phosphor-icons/react';
import { api } from '../lib/api';

const ACTION_BADGES: Record<string, string> = {
  create: 'badge-green', update: 'badge-blue', delete: 'badge-red', login: 'badge-purple',
};

const ACTION_ICONS: Record<string, React.ReactNode> = {
  create: <Plus size={14} />,
  update: <PencilSimple size={14} />,
  delete: <Trash size={14} />,
  login: <SignIn size={14} />,
};

export default function AuditLog() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-audit'],
    queryFn: () => api.get('/api/admin/audit'),
  });

  const exportCSV = () => {
    const logs = data?.data || [];
    const headers = ['Timestamp', 'User', 'Action', 'Table', 'IP'];
    const rows = logs.map((l: any) => [
      l.created_at,
      l.user_email || '-',
      l.action,
      l.table_name,
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
    <div className="anim-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text2)' }}>Security</p>
          <h2 className="text-3xl font-bold tracking-tight">Audit Log</h2>
        </div>
        <button onClick={exportCSV} className="btn btn-primary">
          <Download size={20} /> Export CSV
        </button>
      </div>

      {isLoading ? (
        <div className="card-static p-12 text-center text-gray-400 text-lg">Loading...</div>
      ) : (
        <div className="card-static overflow-hidden">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Table</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {data?.data?.length > 0 ? (
                  data.data.map((l: any, idx: number) => (
                    <tr key={l.id || idx} className="anim-up" style={{ animationDelay: `${idx * 0.03}s` }}>
                      <td className="text-sm">{new Date(l.created_at).toLocaleString('id-ID')}</td>
                      <td className="font-medium">{l.user_email || '—'}</td>
                      <td>
                        <span className={`badge ${ACTION_BADGES[l.action] || 'badge-gray'}`}>
                          {ACTION_ICONS[l.action] || null} {l.action}
                        </span>
                      </td>
                      <td><span className="badge badge-gray">{l.table_name}</span></td>
                      <td className="font-mono text-sm" style={{ color: 'var(--text2)' }}>{l.ip_address || '—'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-400">
                      <ClipboardText size={48} className="mx-auto mb-4 opacity-30" />
                      <p className="text-lg font-medium">Belum ada audit log</p>
                      <p className="text-sm mt-1">Log akan muncul secara otomatis saat ada aktivitas</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
