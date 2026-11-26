import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { PlusCircle, X, FloppyDisk } from '@phosphor-icons/react';
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
    <div className="anim-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text2)' }}>Management</p>
          <h2 className="text-3xl font-bold tracking-tight">Manage Instansi</h2>
        </div>
        <button onClick={() => setShowForm(!showForm)} className={showForm ? 'btn btn-secondary' : 'btn btn-primary'}>
          {showForm ? <><X size={20} /> Batal</> : <><PlusCircle size={20} /> Tambah Instansi</>}
        </button>
      </div>

      {showForm && (
        <div className="card-static p-8 mb-8 anim-scale">
          <h3 className="text-xl font-bold mb-6">Tambah Instansi Baru</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <div>
              <label className="label">Nama Instansi</label>
              <input type="text" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })}
                className="input" placeholder="Dinas Pendidikan" />
            </div>
            <div>
              <label className="label">Kode</label>
              <input type="text" value={form.kode} onChange={(e) => setForm({ ...form, kode: e.target.value.toUpperCase() })}
                className="input" placeholder="DISDIK" />
            </div>
            <div>
              <label className="label">Email Kontak</label>
              <input type="email" value={form.kontak_email} onChange={(e) => setForm({ ...form, kontak_email: e.target.value })}
                className="input" placeholder="admin@instansi.go.id" />
            </div>
            <div>
              <label className="label">SLA (jam)</label>
              <input type="number" value={form.sla_hours} onChange={(e) => setForm({ ...form, sla_hours: parseInt(e.target.value) })}
                className="input" placeholder="72" />
            </div>
          </div>
          <button onClick={() => createMutation.mutate(form)} disabled={!form.nama || !form.kode || createMutation.isPending}
            className="btn btn-primary">
            <FloppyDisk size={20} /> {createMutation.isPending ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="card-static p-12 text-center text-gray-400 text-lg">Loading...</div>
      ) : (
        <div className="card-static overflow-hidden">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Kode</th>
                  <th>Nama</th>
                  <th>Email</th>
                  <th>SLA</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data?.data?.map((i: any, idx: number) => (
                  <tr key={i.id} className="anim-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                    <td><span className="badge badge-blue">{i.kode}</span></td>
                    <td className="font-medium">{i.nama}</td>
                    <td style={{ color: 'var(--text2)' }}>{i.kontak_email || '—'}</td>
                    <td>{i.sla_hours}h</td>
                    <td>
                      <span className={`badge ${i.is_active ? 'badge-green' : 'badge-red'}`}>
                        {i.is_active ? 'Active' : 'Inactive'}
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
