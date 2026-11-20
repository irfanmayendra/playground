import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export default function LaporanCreate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ judul: '', deskripsi: '', kategori_id: '', instansi_id: '' });
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ name: string; size: string; type: string }[]>([]);

  const { data: kategoriData } = useQuery({
    queryKey: ['kategori'],
    queryFn: () => api.get('/api/laporan/kategori/list'),
  });

  const { data: instansiData } = useQuery({
    queryKey: ['instansi'],
    queryFn: () => api.get('/api/instansi'),
  });

  useEffect(() => {
    if (kategoriData?.data?.length && !form.instansi_id) {
      setForm(prev => ({ ...prev, instansi_id: kategoriData.data[0].instansi_id }));
    }
  }, [kategoriData]);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      // Create laporan first
      const result = await api.post('/api/laporan', data);
      const laporanId = result.data.id;

      // Upload files if any
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        const token = localStorage.getItem('token');
        await fetch(`https://api.lostinvirtual.com/api/laporan/${laporanId}/lampiran`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laporan'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      navigate('/laporan');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selected]);
    setPreviews(prev => [
      ...prev,
      ...selected.map(f => ({
        name: f.name,
        size: (f.size / 1024).toFixed(1) + ' KB',
        type: f.type,
      })),
    ]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

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
        {/* Judul */}
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

        {/* Deskripsi */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi *</label>
          <textarea
            value={form.deskripsi}
            onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
            rows={5}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Jelaskan detail laporan secara lengkap..."
            required
          />
        </div>

        {/* Instansi + Kategori */}
        <div className="grid grid-cols-2 gap-4 mb-4">
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

        {/* Upload Dokumentasi */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">📎 Dokumentasi / Bukti</label>
          
          {/* Upload button */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition"
          >
            <div className="text-3xl mb-2">📤</div>
            <div className="text-sm font-medium text-gray-700">
              Klik untuk upload file
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Foto, Video, PDF, DOC, XLS (max 10MB per file)
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.zip"
          />

          {/* File previews */}
          {previews.length > 0 && (
            <div className="mt-3 space-y-2">
              {previews.map((f, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-2xl">
                    {f.type.startsWith('image/') ? '🖼️' :
                     f.type.startsWith('video/') ? '🎬' :
                     f.type.includes('pdf') ? '📄' :
                     f.type.includes('sheet') || f.type.includes('excel') ? '📊' : '📁'}
                  </span>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{f.name}</div>
                    <div className="text-xs text-gray-500">{f.size}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    ✕ Hapus
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="btn-primary px-8 py-3"
        >
          {createMutation.isPending ? 'Mengirim...' : `📨 Kirim Laporan${files.length > 0 ? ` (${files.length} file)` : ''}`}
        </button>
      </form>
    </div>
  );
}
