import { useQuery } from '@tanstack/react-query';
import { PlusCircle, User } from '@phosphor-icons/react';
import { api } from '../lib/api';

export default function ManageUsers() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/api/admin/users'),
  });

  return (
    <div className="anim-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text2)' }}>Management</p>
          <h2 className="text-3xl font-bold tracking-tight">Manage Users</h2>
        </div>
        <button className="btn btn-primary">
          <PlusCircle size={20} /> Tambah User
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
                  <th>Nama</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Instansi</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data?.data?.map((u: any, idx: number) => (
                  <tr key={u.id} className="anim-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white"
                          style={{ background: 'linear-gradient(135deg, #0071E3, #5856D6)' }}>
                          <User size={16} weight="bold" />
                        </div>
                        <span className="font-medium">{u.nama}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text2)' }}>{u.email}</td>
                    <td>
                      <span className={`badge ${
                        u.role === 'platform_superadmin' ? 'badge-red' :
                        u.role === 'tenant_admin' ? 'badge-purple' :
                        u.role === 'tenant_staff' ? 'badge-blue' : 'badge-gray'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td>{u.instansi_kode || '—'}</td>
                    <td>
                      <span className={`badge ${u.is_active ? 'badge-green' : 'badge-red'}`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
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
