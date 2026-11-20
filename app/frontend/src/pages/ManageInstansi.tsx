import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '../lib/api';

export default function ManageInstansi() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ nama: '', kode: '', alamat: '', kontak_email: '', sla_hours: 72 });
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-instansi'],
    queryFn: () => api.get('/api/admin/instansi'),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/api/admin/instansi', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-instansi'] });
      setShowForm(false);
      setForm({ nama: '', kode: '', alamat: '', kontak_email: '', sla_hours: 72 });
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">🏛️ Manage Instansi</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Batal' : '+ Tambah Instansi'}
        </button>
      </div>

      {showForm && (
        <div className="card p-6 mb-6">
          <h3 className="font-semibold mb-4">Tambah Instansi Baru</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Instansi</label>
              <input
                type="text"
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Dinas Pendidikan"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kode</label>
              <input
                type="text"
                value={form.kode}
                onChange={(e) => setForm({ ...form, kode: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="DISDIK"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Kontak</label>
              <input
                type="email"
                value={form.kontak_email}
                onChange={(e) => setForm({ ...form, kontak_email: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SLA (jam)</label>
              <input
                type="number"
                value={form.sla_hours}
                onChange={(e) => setForm({ ...form, sla_hours: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
          </div>
          <button
            onClick={() => createMutation.mutate(form)}
            disabled={!form.nama || !form.kode || createMutation.isPending}
            className="btn-primary"
          >
            {createMutation.isPending ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="text-gray-500">Loading...</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Kode</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Nama</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">SLA</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {data?.data?.map((i: any) => (
                <tr key={i.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-sm">{i.kode}</td>
                  <td className="px-6 py-4">{i.nama}</td>
                  <td className="px-6 py-4 text-gray-500">{i.kontak_email || '-'}</td>
                  <td className="px-6 py-4">{i.sla_hours}h</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${i.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {i.is_active ? 'Active' : 'Inactive'}
                    </span>
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
