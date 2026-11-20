import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export default function LaporanCreate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ judul: '', deskripsi: '', kategori_id: '', instansi_id: '' });

  // Fetch kategori & instansi
  const { data: kategoriData } = useQuery({
    queryKey: ['kategori'],
    queryFn: () => api.get('/api/laporan/kategori/list'),
  });

  const { data: instansiData } = useQuery({
    queryKey: ['instansi'],
    queryFn: () => api.get('/api/instansi'),
  });

  // Auto-select instansi from first kategori
  useEffect(() => {
    if (kategoriData?.data?.length && !form.instansi_id) {
      setForm(prev => ({ ...prev, instansi_id: kategoriData.data[0].instansi_id }));
    }
  }, [kategoriData]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/api/laporan', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laporan'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      navigate('/laporan');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Buat Laporan Baru</h2>

      {createMutation.isError && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
          {createMutation.error?.message || 'Gagal membuat laporan'}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-6 max-w-2xl">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Judul Laporan *</label>
          <input
            type="text"
            value={form.judul}
            onChange={(e) => setForm({ ...form, judul: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Judul singkat laporan"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi *</label>
          <textarea
            value={form.deskripsi}
            onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
            rows={5}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Jelaskan detail laporan..."
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instansi *</label>
            <select
              value={form.instansi_id}
              onChange={(e) => setForm({ ...form, instansi_id: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Pilih instansi</option>
              {instansiData?.data?.map((i: any) => (
                <option key={i.id} value={i.id}>{i.nama}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori *</label>
            <select
              value={form.kategori_id}
              onChange={(e) => setForm({ ...form, kategori_id: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Pilih kategori</option>
              {kategoriData?.data?.map((k: any) => (
                <option key={k.id} value={k.id}>{k.nama} (SLA: {k.sla_hours}h)</option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={createMutation.isPending}
          className="btn-primary px-8 py-3"
        >
          {createMutation.isPending ? 'Mengirim...' : 'Kirim Laporan'}
        </button>
      </form>
    </div>
  );
}
