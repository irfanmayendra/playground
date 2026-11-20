import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { api } from '../lib/api';

const STATUS_FLOW = ['masuk', 'verifikasi', 'proses', 'selesai', 'ditutup'];
const STATUS_COLORS: Record<string, string> = {
  masuk: 'bg-blue-100 text-blue-700',
  verifikasi: 'bg-orange-100 text-orange-700',
  proses: 'bg-purple-100 text-purple-700',
  selesai: 'bg-green-100 text-green-700',
  ditutup: 'bg-gray-100 text-gray-700',
};

export default function LaporanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user.role || 'tenant_user';
  const canUpdate = ['platform_superadmin', 'super_admin', 'tenant_admin', 'instansi_admin', 'tenant_staff', 'petugas', 'supervisor'].includes(role);

  const [newComment, setNewComment] = useState('');
  const [statusNotes, setStatusNotes] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['laporan', id],
    queryFn: () => api.get(`/api/laporan/${id}`),
  });

  const updateStatus = useMutation({
    mutationFn: (data: { status: string; notes?: string }) =>
      api.patch(`/api/laporan/${id}/status`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laporan', id] });
      queryClient.invalidateQueries({ queryKey: ['laporan'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const addComment = useMutation({
    mutationFn: (data: { isi: string; is_internal?: boolean }) =>
      api.post(`/api/laporan/${id}/komentar`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laporan', id] });
      setNewComment('');
    },
  });

  const l = data?.data;

  return (
    <div>
      {isLoading ? (
        <div className="text-gray-500">Loading...</div>
      ) : l ? (
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/laporan')} className="text-gray-500 hover:text-gray-700">← Kembali</button>
              <span className="font-mono text-sm text-gray-500">{l.nomor_tiket}</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[l.status]}`}>{l.status}</span>
            </div>
          </div>

          {/* Info */}
          <div className="card p-6 mb-6">
            <h2 className="text-xl font-bold mb-3">{l.judul}</h2>
            <p className="text-gray-600 mb-4">{l.deskripsi}</p>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Kategori</div>
                <div className="font-medium">{l.kategori_nama}</div>
              </div>
              <div>
                <div className="text-gray-500">Pelapor</div>
                <div className="font-medium">{l.pelapor_nama}</div>
              </div>
              <div>
                <div className="text-gray-500">SLA Deadline</div>
                <div className="font-medium">{new Date(l.sla_deadline).toLocaleString('id-ID')}</div>
              </div>
            </div>
          </div>

          {/* Status Update (petugas/admin only) */}
          {canUpdate && (
            <div className="card p-6 mb-6">
              <h3 className="font-semibold mb-4">⚡ Update Status</h3>
              <div className="flex gap-3 mb-3">
                {STATUS_FLOW.map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus.mutate({ status: s, notes: statusNotes })}
                    disabled={s === l.status || updateStatus.isPending}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      s === l.status
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="Catatan (opsional)..."
                className="w-full px-4 py-2 border rounded-lg text-sm"
              />
            </div>
          )}

          {/* Komentar */}
          <div className="card p-6">
            <h3 className="font-semibold mb-4">💬 Komentar</h3>

            {/* Add comment */}
            <div className="flex gap-3 mb-6">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Tulis komentar..."
                className="flex-1 px-4 py-2 border rounded-lg"
              />
              <button
                onClick={() => addComment.mutate({ isi: newComment })}
                disabled={!newComment || addComment.isPending}
                className="btn-primary px-6"
              >
                Kirim
              </button>
            </div>

            {/* Comment list */}
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Laporan dibuat — {new Date(l.created_at).toLocaleString('id-ID')}</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-gray-500">Laporan tidak ditemukan</div>
      )}
    </div>
  );
}
