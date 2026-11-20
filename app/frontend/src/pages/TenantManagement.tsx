import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '../lib/api';

export default function TenantManagement() {
  const queryClient = useQueryClient();
  const [selectedInstansi, setSelectedInstansi] = useState<any>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [userForm, setUserForm] = useState({ email: '', nama: '', role: 'tenant_user' });

  const { data: instansiData } = useQuery({
    queryKey: ['tenant-instansi'],
    queryFn: () => api.get('/api/admin/instansi'),
  });

  const { data: usersData } = useQuery({
    queryKey: ['tenant-users', selectedInstansi?.id],
    queryFn: () => api.get('/api/admin/users'),
    enabled: !!selectedInstansi,
  });

  const { data: laporanData } = useQuery({
    queryKey: ['tenant-laporan', selectedInstansi?.id],
    queryFn: () => api.get(`/api/laporan?instansi_id=${selectedInstansi.id}&limit=100`),
    enabled: !!selectedInstansi,
  });

  const addUser = useMutation({
    mutationFn: (data: any) => api.post('/api/admin/users', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-users'] });
      setShowAddUser(false);
      setUserForm({ email: '', nama: '', role: 'tenant_user' });
    },
  });

  const filteredUsers = usersData?.data?.filter((u: any) => u.instansi_id === selectedInstansi?.id) || [];
  const filteredLaporan = laporanData?.data || [];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">🏛️ Tenant Management</h2>

      {/* Instansi Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {instansiData?.data?.map((i: any) => (
          <div
            key={i.id}
            onClick={() => setSelectedInstansi(i)}
            className={`card p-4 cursor-pointer transition border-2 ${
              selectedInstansi?.id === i.id ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
                {i.kode.charAt(0)}
              </div>
              <div>
                <div className="font-semibold">{i.nama}</div>
                <div className="text-sm text-gray-500">{i.kode} • SLA: {i.sla_hours}h</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Tenant */}
      {selectedInstansi && (
        <div>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="card p-4">
              <div className="text-sm text-gray-500">Users</div>
              <div className="text-2xl font-bold">{filteredUsers.length}</div>
            </div>
            <div className="card p-4">
              <div className="text-sm text-gray-500">Total Laporan</div>
              <div className="text-2xl font-bold">{filteredLaporan.length}</div>
            </div>
            <div className="card p-4">
              <div className="text-sm text-gray-500">SLA</div>
              <div className="text-2xl font-bold">{selectedInstansi.sla_hours}h</div>
            </div>
          </div>

          {/* Users Table */}
          <div className="card p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">👥 Users di {selectedInstansi.kode}</h3>
              <button onClick={() => setShowAddUser(!showAddUser)} className="btn-primary text-sm">
                + Tambah User
              </button>
            </div>

            {showAddUser && (
              <div className="flex gap-3 mb-4">
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  placeholder="Email"
                  className="flex-1 px-3 py-2 border rounded-lg text-sm"
                />
                <input
                  type="text"
                  value={userForm.nama}
                  onChange={(e) => setUserForm({ ...userForm, nama: e.target.value })}
                  placeholder="Nama"
                  className="flex-1 px-3 py-2 border rounded-lg text-sm"
                />
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="tenant_user">User</option>
                  <option value="tenant_staff">Staff</option>
                  <option value="tenant_admin">Admin</option>
                </select>
                <button
                  onClick={() => addUser.mutate({ ...userForm, instansi_id: selectedInstansi.id })}
                  className="btn-primary text-sm"
                >
                  Simpan
                </button>
              </div>
            )}

            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Nama</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Email</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Role</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u: any) => (
                  <tr key={u.id} className="border-t">
                    <td className="px-4 py-2">{u.nama}</td>
                    <td className="px-4 py-2 text-gray-500">{u.email}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        u.role === 'tenant_admin' ? 'bg-purple-100 text-purple-700' :
                        u.role === 'tenant_staff' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Laporan Table */}
          <div className="card p-6">
            <h3 className="font-semibold mb-4">📝 Laporan di {selectedInstansi.kode}</h3>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">No. Tiket</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Judul</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {filteredLaporan.map((l: any) => (
                  <tr key={l.id} className="border-t">
                    <td className="px-4 py-2 font-mono text-sm">{l.nomor_tiket}</td>
                    <td className="px-4 py-2">{l.judul}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        l.status === 'selesai' ? 'bg-green-100 text-green-700' :
                        l.status === 'proses' ? 'bg-purple-100 text-purple-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>{l.status}</span>
                    </td>
                    <td className="px-4 py-2 text-gray-500 text-sm">{new Date(l.created_at).toLocaleDateString('id-ID')}</td>
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
