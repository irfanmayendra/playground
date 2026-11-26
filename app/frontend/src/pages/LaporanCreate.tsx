import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

const BASE_URL = 'https://api.lostinvirtual.com';

const uploadFormData = async (path: string, formData: FormData) => {
  const token = localStorage.getItem('token');
  return fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
};

interface Instansi {
  id: number;
  nama: string;
  kategori: string;
}

const LaporanCreate: React.FC = () => {
  const navigate = useNavigate();
  const [instansiList, setInstansiList] = useState<Instansi[]>([]);
  const [form, setForm] = useState({
    judul: '',
    isi: '',
    lokasi: '',
    instansi_id: '',
    kategori: 'pengaduan',
  });
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsData, setGpsData] = useState<{ lat: number; lng: number; address?: string } | null>(null);

  useEffect(() => {
    loadInstansi();
  }, []);

  const loadInstansi = async () => {
    try {
      const res = await api.get('/api/instansi');
      const data = await res.json();
      setInstansiList(data.data || []);
    } catch (err) {
      console.error('Failed to load instansi:', err);
    }
  };

  const detectGPS = () => {
    if (!navigator.geolocation) {
      setError('Browser tidak mendukung GPS');
      return;
    }

    setGpsLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setGpsData({ lat, lng });

        // Reverse geocoding via OpenStreetMap
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { 'Accept-Language': 'id' } }
          );
          const data = await res.json();
          const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          setGpsData({ lat, lng, address });
          setForm((f) => ({ ...f, lokasi: address }));
        } catch {
          const coordStr = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          setGpsData({ lat, lng, address: coordStr });
          setForm((f) => ({ ...f, lokasi: coordStr }));
        }

        setGpsLoading(false);
      },
      (err) => {
        setGpsLoading(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Izin lokasi ditolak. Izinkan akses lokasi di browser.');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Lokasi tidak tersedia. Coba lagi.');
            break;
          case err.TIMEOUT:
            setError('Timeout. Coba lagi.');
            break;
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selected].slice(0, 5));

    selected.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreviews((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('judul', form.judul);
      formData.append('isi', form.isi);
      formData.append('lokasi', form.lokasi);
      formData.append('instansi_id', form.instansi_id);
      formData.append('kategori', form.kategori);

      if (gpsData) {
        formData.append('latitude', gpsData.lat.toString());
        formData.append('longitude', gpsData.lng.toString());
      }

      files.forEach((file) => formData.append('lampiran', file));

      const res = await uploadFormData('/api/laporan', formData);

      if (res.ok) {
        const data = await res.json();
        navigate(`/laporan/${data.data.id}`);
      } else {
        const err = await res.json();
        setError(err.message || 'Gagal membuat laporan');
      }
    } catch {
      setError('Terjadi kesalahan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Buat Laporan Baru</h1>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Judul Laporan *</label>
          <input
            type="text"
            value={form.judul}
            onChange={(e) => setForm({ ...form, judul: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500"
            placeholder="Ringkasan masalah"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Isi Laporan *</label>
          <textarea
            value={form.isi}
            onChange={(e) => setForm({ ...form, isi: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500 h-32"
            placeholder="Jelaskan detail masalah"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Lokasi</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={form.lokasi}
              onChange={(e) => setForm({ ...form, lokasi: e.target.value })}
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500"
              placeholder="Alamat kejadian"
            />
            <button
              type="button"
              onClick={detectGPS}
              disabled={gpsLoading}
              className="px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              {gpsLoading ? (
                <span className="animate-spin">⟳</span>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="12" cy="12" r="3"/>
                  <line x1="12" y1="2" x2="12" y2="4"/>
                  <line x1="12" y1="20" x2="12" y2="22"/>
                  <line x1="2" y1="12" x2="4" y2="12"/>
                  <line x1="20" y1="12" x2="22" y2="12"/>
                </svg>
              )}
              GPS
            </button>
          </div>
          {gpsData && (
            <div className="mt-2 flex items-center gap-2 text-xs text-green-400">
              <span>📍</span>
              <span>
                Lokasi terdeteksi: {gpsData.lat.toFixed(6)}, {gpsData.lng.toFixed(6)}
              </span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Kategori</label>
          <select
            value={form.kategori}
            onChange={(e) => setForm({ ...form, kategori: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="pengaduan">Pengaduan</option>
            <option value="laporan">Laporan</option>
            <option value="saran">Saran</option>
            <option value="permohonan">Permohonan</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Instansi Tujuan *</label>
          <select
            value={form.instansi_id}
            onChange={(e) => setForm({ ...form, instansi_id: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500"
            required
          >
            <option value="">-- Pilih Instansi --</option>
            {instansiList.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.nama}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Lampiran (maks 5 file)</label>
          <div className="space-y-3">
            {previews.map((preview, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                <img src={preview} alt="" className="w-16 h-16 object-cover rounded-lg" />
                <div className="flex-1">
                  <p className="text-white text-sm truncate">{files[i]?.name}</p>
                  <p className="text-gray-500 text-xs">{(files[i]?.size / 1024).toFixed(0)} KB</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="text-red-400 hover:text-red-300"
                >
                  ✕
                </button>
              </div>
            ))}
            <label className="block w-full p-6 rounded-xl border-2 border-dashed border-white/10 text-center cursor-pointer hover:border-blue-500/50 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
              <p className="text-gray-400">+ Tambah Lampiran</p>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-50"
        >
          {loading ? 'Mengirim...' : 'Kirim Laporan'}
        </button>
      </form>
    </div>
  );
};

export default LaporanCreate;
