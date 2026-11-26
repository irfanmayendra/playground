import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, Clock, Envelope, Phone, User } from '@phosphor-icons/react';

const BASE_URL = 'https://api.lostinvirtual.com';

const apiGet = async (path: string) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

const apiPost = async (path: string) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

const PendingUsers: React.FC = () => {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['pending-users'],
    queryFn: () => apiGet('/api/auth/pending'),
    refetchInterval: 30000,
  });

  const approve = useMutation({
    mutationFn: (id: string) => apiPost(`/api/auth/approve/${id}`),
    onSuccess: (data) => {
      setMessage({ type: 'success', text: data.message || 'User diaktifkan' });
      queryClient.invalidateQueries({ queryKey: ['pending-users'] });
      setTimeout(() => setMessage(null), 5000);
    },
    onError: (err: any) => {
      setMessage({ type: 'error', text: err.message || 'Gagal' });
      setTimeout(() => setMessage(null), 5000);
    },
  });

  const reject = useMutation({
    mutationFn: (id: string) => apiPost(`/api/auth/reject/${id}`),
    onSuccess: (data) => {
      setMessage({ type: 'success', text: data.message || 'User ditolak' });
      queryClient.invalidateQueries({ queryKey: ['pending-users'] });
      setTimeout(() => setMessage(null), 5000);
    },
    onError: (err: any) => {
      setMessage({ type: 'error', text: err.message || 'Gagal' });
      setTimeout(() => setMessage(null), 5000);
    },
  });

  const users = data?.data || [];

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text2)' }}>
          User Management
        </p>
        <h2 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
          Pending Approval
        </h2>
        <p className="mt-2 text-lg" style={{ color: 'var(--text2)' }}>
          {users.length} user menunggu persetujuan
        </p>
      </div>

      {message && (
        <div
          className="card p-4 mb-6"
          style={{
            background: message.type === 'success' ? 'rgba(52,199,89,0.08)' : 'rgba(255,59,48,0.08)',
            border: `1px solid ${message.type === 'success' ? 'rgba(52,199,89,0.2)' : 'rgba(255,59,48,0.2)'}`,
          }}
        >
          <p style={{ color: message.type === 'success' ? '#34C759' : '#FF3B30', fontSize: 14 }}>
            {message.text}
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="card p-8 text-center">
          <p style={{ color: 'var(--text2)' }}>Loading...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="card p-12 text-center">
          <Clock size={48} style={{ color: 'var(--text2)', margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text2)', fontSize: 18 }}>Tidak ada user yang menunggu persetujuan</p>
        </div>
      ) : (
        <div className="space-y-4">
          {users.map((user: any) => (
            <div key={user.id} className="card p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(0,113,227,0.08)' }}
                  >
                    <User size={22} style={{ color: 'var(--blue)' }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{user.nama}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1" style={{ color: 'var(--text2)', fontSize: 14 }}>
                        <Envelope size={14} /> {user.email}
                      </span>
                      {user.phone && (
                        <span className="flex items-center gap-1" style={{ color: 'var(--text2)', fontSize: 14 }}>
                          <Phone size={14} /> {user.phone}
                        </span>
                      )}
                    </div>
                    <p style={{ color: 'var(--text2)', fontSize: 12, marginTop: 4 }}>
                      Daftar: {new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => approve.mutate(user.id)}
                    disabled={approve.isPending}
                    className="btn btn-primary"
                    style={{ minHeight: 42, padding: '0 20px' }}
                  >
                    <CheckCircle size={18} /> Setujui
                  </button>
                  <button
                    onClick={() => reject.mutate(user.id)}
                    disabled={reject.isPending}
                    className="btn"
                    style={{ minHeight: 42, padding: '0 20px', background: 'rgba(255,59,48,0.1)', color: '#FF3B30' }}
                  >
                    <XCircle size={18} /> Tolak
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingUsers;
