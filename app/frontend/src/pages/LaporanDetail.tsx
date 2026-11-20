import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { api } from '../lib/api';

const STATUS_FLOW = ['masuk', 'verifikasi', 'proses', 'selesai', 'ditutup'];
const STATUS_LABELS: Record<string, string> = {
  masuk: 'Masuk',
  verifikasi: 'Verifikasi',
  proses: 'Diproses',
  selesai: 'Selesai',
  ditutup: 'Ditolak',
};
const STATUS_ICONS: Record<string, string> = {
  masuk: '📥',
  verifikasi: '🔍',
  proses: '⚙️',
  selesai: '✅',
  ditutup: '❌',
};

function ProgressBar({ currentStatus }: { currentStatus: string }) {
  const currentIndex = STATUS_FLOW.indexOf(currentStatus);
  const isDitolak = currentStatus === 'ditutup';

  return (
    <div className="card p-6 mb-6">
      <h3 className="font-semibold mb-4">📊 Progress Pengaduan</h3>
      <div className="flex items-center justify-between">
        {STATUS_FLOW.map((status, idx) => {
          const isDone = idx <= currentIndex && !isDitolak;
          const isCurrent = status === currentStatus;
          const isDitolakStep = isDitolak && status === 'ditutup';

          return (
            <div key={status} className="flex flex-col items-center flex-1">
              {/* Circle */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition ${
                isDitolakStep ? 'bg-red-500 text-white' :
                isCurrent ? 'bg-blue-600 text-white ring-4 ring-blue-200' :
                isDone ? 'bg-green-500 text-white' :
                'bg-gray-200 text-gray-400'
              }`}>
                {isDitolakStep ? '❌' : isDone ? '✓' : STATUS_ICONS[status]}
              </div>
              
              {/* Label */}
              <div className={`mt-2 text-sm font-medium text-center ${
                isDitolakStep ? 'text-red-600' :
                isCurrent ? 'text-blue-600' :
                isDone ? 'text-green-600' :
                'text-gray-400'
              }`}>
                {STATUS_LABELS[status]}
              </div>

              {/* Line */}
              {idx < STATUS_FLOW.length - 1 && (
                <div className={`absolute h-1 w-full top-6 ${
                  idx < currentIndex && !isDitolak ? 'bg-green-500' : 'bg-gray-200'
                }`} style={{ left: '50%', zIndex: -1 }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Status description */}
      <div className="mt-4 p-3 rounded-lg text-sm text-center ${
        isDitolak ? 'bg-red-50 text-red-700' :
        currentStatus === 'selesai' ? 'bg-green-50 text-green-700' :
        'bg-blue-50 text-blue-700'
      }">
        {isDitolak ? '❌ Pengaduan ditolak / ditutup' :
         currentStatus === 'selesai' ? '✅ Pengaduan sudah selesai ditangani' :
         currentStatus === 'proses' ? '⚙️ Sedang dalam penanganan' :
         currentStatus === 'verifikasi' ? '🔍 Sedang diverifikasi' :
         '📥 Laporan baru diterima'}
      </div>
    </div>
  );
}

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
            </div>
          </div>

          {/* Progress Bar */}
          <ProgressBar currentStatus={l.status} />

          {/* Info */}
          <div className="card p-6 mb-6">
            <h2 className="text-xl font-bold mb-3">{l.judul}</h2>
            <p className="text-gray-600 mb-4">{l.deskripsi}</p>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Kategori</div>
                <div className="font-medium">{l.kategori_nama}</div>
              </div>
              <div>
                <div className="text-gray-500">Pelapor</div>
                <div className="font-medium">{l.pelapor_nama}</div>
              </div>
              <div>
                <div className="text-gray-500">Priority</div>
                <div className="font-medium capitalize">{l.priority}</div>
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
              <div className="flex gap-2 flex-wrap mb-3">
                {STATUS_FLOW.map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus.mutate({ status: s, notes: statusNotes })}
                    disabled={s === l.status || updateStatus.isPending}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      s === l.status
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : s === 'ditutup'
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {STATUS_ICONS[s]} {STATUS_LABELS[s]}
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
              {l.komentar && l.komentar.length > 0 ? (
                l.komentar.map((k: any, idx: number) => (
                  <div key={idx} className={`p-4 rounded-lg ${k.is_internal ? 'bg-yellow-50 border-l-4 border-yellow-400' : 'bg-gray-50'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-medium text-sm">{k.user_nama}</span>
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                          k.user_role === 'tenant_staff' ? 'bg-blue-100 text-blue-700' :
                          k.user_role === 'tenant_admin' ? 'bg-purple-100 text-purple-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>{k.user_role}</span>
                        {k.is_internal && <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-700">Internal</span>}
                      </div>
                      <div className="text-xs text-gray-400">{new Date(k.created_at).toLocaleString('id-ID')}</div>
                    </div>
                    <div className="mt-2 text-sm text-gray-700">{k.isi}</div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-sm">Belum ada komentar</div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-gray-500">Laporan tidak ditemukan</div>
      )}
    </div>
  );
}
