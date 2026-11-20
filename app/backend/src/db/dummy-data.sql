-- Dummy Data: Semua Instansi + Semua Status
-- Status: masuk, verifikasi, proses, selesai, ditutup

-- Clear existing
DELETE FROM status_history;
DELETE FROM komentar;
DELETE FROM laporan;

-- ============================================
-- POLRI (Kepolisian) - Kejahatan Siber, Kekerasan, Penipuan
-- ============================================

-- 1. Selesai
INSERT INTO laporan (nomor_tiket, judul, deskripsi, kategori_id, priority, pelapor_id, instansi_id, status, created_at, sla_deadline, closed_at, first_response_at)
VALUES (
  'LP-2026-POLRI-00001',
  'Phishing Website Bank BNI',
  'Website palsu mengatasnamakan Bank BNI mencuri data nasabah. URL: bni-fake.com. Sudah banyak korban di wilayah Jakarta.',
  '375c3255-2f74-41ab-93cc-7b6b666c938f',
  'critical',
  (SELECT id FROM users WHERE email='user@pengaduan.id'),
  '3c161bdd-fc3e-468c-bd93-ba8362cba171',
  'selesai',
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '9 days'
);

-- 2. Proses
INSERT INTO laporan (nomor_tiket, judul, deskripsi, kategori_id, priority, pelapor_id, instansi_id, status, created_at, sla_deadline, first_response_at)
VALUES (
  'LP-2026-POLRI-00002',
  'Kekerasan dalam Rumah Tangga',
  'Korban melaporkan kekerasan fisik yang dilakukan suami. Butuh pendampingan dan perlindungan.',
  '8a6c34f7-e985-4ccf-8a04-b76b20eca2fb',
  'critical',
  (SELECT id FROM users WHERE email='user@pengaduan.id'),
  '3c161bdd-fc3e-468c-bd93-ba8362cba171',
  'proses',
  NOW() - INTERVAL '3 days',
  NOW() + INTERVAL '1 day',
  NOW() - INTERVAL '2 days'
);

-- 3. Verifikasi
INSERT INTO laporan (nomor_tiket, judul, deskripsi, kategori_id, priority, pelapor_id, instansi_id, status, created_at, sla_deadline, first_response_at)
VALUES (
  'LP-2026-POLRI-00003',
  'Penipuan Online Shop Instagram',
  'Toko @shopmurah_jkt tidak mengirim barang setelah transfer Rp 15.000.000. Ada 50+ korban lain.',
  '771ac3fb-c8a0-47f1-a5cb-93419a222ed0',
  'high',
  (SELECT id FROM users WHERE email='user@pengaduan.id'),
  '3c161bdd-fc3e-468c-bd93-ba8362cba171',
  'verifikasi',
  NOW() - INTERVAL '2 days',
  NOW() + INTERVAL '2 days',
  NOW() - INTERVAL '1 day'
);

-- 4. Masuk
INSERT INTO laporan (nomor_tiket, judul, deskripsi, kategori_id, priority, pelapor_id, instansi_id, status, created_at, sla_deadline)
VALUES (
  'LP-2026-POLRI-00004',
  'Hacker Deface Website Pemda',
  'Website resmi Pemda Kota Bandung di-deface oleh hacker. Halaman depan diganti dengan konten tidak senonoh.',
  '375c3255-2f74-41ab-93cc-7b6b666c938f',
  'high',
  (SELECT id FROM users WHERE email='user@pengaduan.id'),
  '3c161bdd-fc3e-468c-bd93-ba8362cba171',
  'masuk',
  NOW() - INTERVAL '1 day',
  NOW() + INTERVAL '2 days'
);

-- ============================================
-- DINKES (Kesehatan) - Kesehatan Masyarakat, Obat & Makanan
-- ============================================

-- 5. Selesai
INSERT INTO laporan (nomor_tiket, judul, deskripsi, kategori_id, priority, pelapor_id, instansi_id, status, created_at, sla_deadline, closed_at, first_response_at)
VALUES (
  'LP-2026-DINKES-00001',
  'Keracunan Massal di Warung Makan',
  '50 warga keracunan setelah makan di Warung Sederhana. Gejala: muntah, diare. Dilarikan ke RSUD.',
  '93455b15-08d8-4f80-a3ba-b81d09df706a',
  'critical',
  (SELECT id FROM users WHERE email='staff@pengaduan.id'),
  '75f9893e-0aec-4fe6-bfcf-86e31e95ca90',
  'selesai',
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '12 hours',
  NOW() - INTERVAL '6 days'
);

-- 6. Proses
INSERT INTO laporan (nomor_tiket, judul, deskripsi, kategori_id, priority, pelapor_id, instansi_id, status, created_at, sla_deadline, first_response_at)
VALUES (
  'LP-2026-DINKES-00002',
  'Obat Kadaluarsa di Apotek',
  'Apotek Sehat Jaya menjual obat kadaluarsa. Ditemukan 20+ box obat yang sudah lewat tanggal.',
  'f3b8b9aa-4243-48a3-ac49-e7a10af013cd',
  'high',
  (SELECT id FROM users WHERE email='user@pengaduan.id'),
  '75f9893e-0aec-4fe6-bfcf-86e31e95ca90',
  'proses',
  NOW() - INTERVAL '5 days',
  NOW() + INTERVAL '2 days',
  NOW() - INTERVAL '4 days'
);

-- 7. Ditolak (ditutup)
INSERT INTO laporan (nomor_tiket, judul, deskripsi, kategori_id, priority, pelapor_id, instansi_id, status, created_at, sla_deadline, closed_at, first_response_at)
VALUES (
  'LP-2026-DINKES-00003',
  'Vaksin Palsu di Klinik ABC',
  'Laporan vaksin palsu di Klinik ABC. Setelah investigasi, laporan tidak terbukti dan merupakan kesalahpahaman.',
  '93455b15-08d8-4f80-a3ba-b81d09df706a',
  'high',
  (SELECT id FROM users WHERE email='user@pengaduan.id'),
  '75f9893e-0aec-4fe6-bfcf-86e31e95ca90',
  'ditutup',
  NOW() - INTERVAL '15 days',
  NOW() - INTERVAL '8 days',
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '14 days'
);

-- 8. Masuk
INSERT INTO laporan (nomor_tiket, judul, deskripsi, kategori_id, priority, pelapor_id, instansi_id, status, created_at, sla_deadline)
VALUES (
  'LP-2026-DINKES-00004',
  'Jajanan Sekolah Tidak Higienis',
  'Pedagang jajanan di SDN 05 Jakarta tidak menggunakan sarung tangan. Anak-anak sering sakit perut.',
  '93455b15-08d8-4f80-a3ba-b81d09df706a',
  'medium',
  (SELECT id FROM users WHERE email='user@pengaduan.id'),
  '75f9893e-0aec-4fe6-bfcf-86e31e95ca90',
  'masuk',
  NOW() - INTERVAL '6 hours',
  NOW() + INTERVAL '3 days'
);

-- ============================================
-- DINSOS (Sosial) - Bantuan Sosial
-- ============================================

-- 9. Selesai
INSERT INTO laporan (nomor_tiket, judul, deskripsi, kategori_id, priority, pelapor_id, instansi_id, status, created_at, sla_deadline, closed_at, first_response_at)
VALUES (
  'LP-2026-DINSOS-00001',
  'Bantuan Sosial Tidak Tepat Sasaran',
  'Bansos sembako dibagikan ke keluarga mampu. Warga miskin tidak menerima bantuan.',
  'c31c8f59-d368-4f82-8344-9fd5d6cc5e80',
  'high',
  (SELECT id FROM users WHERE email='user@pengaduan.id'),
  '3d123988-3745-4e5a-b487-589aa642961e',
  'selesai',
  NOW() - INTERVAL '8 days',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '18 hours',
  NOW() - INTERVAL '7 days'
);

-- 10. Proses
INSERT INTO laporan (nomor_tiket, judul, deskripsi, kategori_id, priority, pelapor_id, instansi_id, status, created_at, sla_deadline, first_response_at)
VALUES (
  'LP-2026-DINSOS-00002',
  'Anak Terlantar di Terminal',
  'Ditemukan anak usia 8 tahun terlantar di Terminal Kampung Melayu. Butuh penanganan segera.',
  'c31c8f59-d368-4f82-8344-9fd5d6cc5e80',
  'critical',
  (SELECT id FROM users WHERE email='staff@pengaduan.id'),
  '3d123988-3745-4e5a-b487-589aa642961e',
  'proses',
  NOW() - INTERVAL '2 days',
  NOW() + INTERVAL '5 days',
  NOW() - INTERVAL '1 day'
);

-- ============================================
-- DISHUB (Perhubungan) - Lalu Lintas, Fasilitas Umum
-- ============================================

-- 11. Selesai
INSERT INTO laporan (nomor_tiket, judul, deskripsi, kategori_id, priority, pelapor_id, instansi_id, status, created_at, sla_deadline, closed_at, first_response_at)
VALUES (
  'LP-2026-DISHUB-00001',
  'Traffic Light Mati di Simpang Susun',
  'Traffic light di Simpang Susun Semanggi mati total. Menyebabkan kemacetan parah.',
  'bf0799dc-fbea-4b00-9e2d-be6979928332',
  'high',
  (SELECT id FROM users WHERE email='user@pengaduan.id'),
  'ca3771ae-d2b8-468a-aeba-dda4ab9b8f90',
  'selesai',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '20 hours',
  NOW() - INTERVAL '4 days'
);

-- 12. Proses
INSERT INTO laporan (nomor_tiket, judul, deskripsi, kategori_id, priority, pelapor_id, instansi_id, status, created_at, sla_deadline, first_response_at)
VALUES (
  'LP-2026-DISHUB-00002',
  'Jalan Berlubang di Jl. Sudirman',
  'Lubang besar di jalan utama. Kedalaman 30cm, lebar 1 meter. Membahayakan pengendara.',
  '81828a4f-b37a-4347-9e5b-10c9c44b9aa6',
  'high',
  (SELECT id FROM users WHERE email='user@pengaduan.id'),
  'ca3771ae-d2b8-468a-aeba-dda4ab9b8f90',
  'proses',
  NOW() - INTERVAL '4 days',
  NOW() + INTERVAL '1 day',
  NOW() - INTERVAL '3 days'
);

-- 13. Verifikasi
INSERT INTO laporan (nomor_tiket, judul, deskripsi, kategori_id, priority, pelapor_id, instansi_id, status, created_at, sla_deadline, first_response_at)
VALUES (
  'LP-2026-DISHUB-00003',
  'Angkot Ngetem Sembarangan',
  'Angkot berhenti sembarangan di Jl. Raya Bogor. Menyebabkan kemacetan dan kecelakaan.',
  'bf0799dc-fbea-4b00-9e2d-be6979928332',
  'medium',
  (SELECT id FROM users WHERE email='user@pengaduan.id'),
  'ca3771ae-d2b8-468a-aeba-dda4ab9b8f90',
  'verifikasi',
  NOW() - INTERVAL '1 day',
  NOW() + INTERVAL '2 days',
  NOW() - INTERVAL '12 hours'
);

-- ============================================
-- OMBUDSMAN - Maladministrasi, Pelayanan Publik
-- ============================================

-- 14. Selesai
INSERT INTO laporan (nomor_tiket, judul, deskripsi, kategori_id, priority, pelapor_id, instansi_id, status, created_at, sla_deadline, closed_at, first_response_at)
VALUES (
  'LP-2026-OMBUDSMAN-00001',
  'Pungli di Kantor Samsat',
  'Diminta biaya tambahan Rp 500.000 untuk pengurusan STNK. Tidak ada kwitansi resmi.',
  '32f6f577-6671-4356-9013-507fdf65cfc3',
  'high',
  (SELECT id FROM users WHERE email='user@pengaduan.id'),
  '21f1fd35-c90b-4698-8dc3-05a7d6e81a01',
  'selesai',
  NOW() - INTERVAL '12 days',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '11 days'
);

-- 15. Proses
INSERT INTO laporan (nomor_tiket, judul, deskripsi, kategori_id, priority, pelapor_id, instansi_id, status, created_at, sla_deadline, first_response_at)
VALUES (
  'LP-2026-OMBUDSMAN-00002',
  'KTP Ditahan Oknum Kelurahan',
  'Pengajuan KTP baru ditahan dengan alasan tidak jelas. Diminta uang Rp 200.000.',
  '32f6f577-6671-4356-9013-507fdf65cfc3',
  'medium',
  (SELECT id FROM users WHERE email='user@pengaduan.id'),
  '21f1fd35-c90b-4698-8dc3-05a7d6e81a01',
  'proses',
  NOW() - INTERVAL '6 days',
  NOW() + INTERVAL '3 days',
  NOW() - INTERVAL '5 days'
);

-- 16. Ditolak
INSERT INTO laporan (nomor_tiket, judul, deskripsi, kategori_id, priority, pelapor_id, instansi_id, status, created_at, sla_deadline, closed_at, first_response_at)
VALUES (
  'LP-2026-OMBUDSMAN-00003',
  'Pelayanan Lambat di RSUD',
  'Keluhan pelayanan lambat di RSUD. Setelah investigasi, sistem sudah membaik dan keluhan selesai.',
  '4827cd35-6293-46c4-9121-8c0a796ce05e',
  'low',
  (SELECT id FROM users WHERE email='user@pengaduan.id'),
  '21f1fd35-c90b-4698-8dc3-05a7d6e81a01',
  'ditutup',
  NOW() - INTERVAL '20 days',
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '9 days',
  NOW() - INTERVAL '19 days'
);

-- 17. Masuk
INSERT INTO laporan (nomor_tiket, judul, deskripsi, kategori_id, priority, pelapor_id, instansi_id, status, created_at, sla_deadline)
VALUES (
  'LP-2026-OMBUDSMAN-00004',
  'Diskriminasi Pelayanan Publik',
  'Warga difabel tidak mendapat prioritas pelayanan di kantor kelurahan. Antrian sangat panjang.',
  '4827cd35-6293-46c4-9121-8c0a796ce05e',
  'medium',
  (SELECT id FROM users WHERE email='user@pengaduan.id'),
  '21f1fd35-c90b-4698-8dc3-05a7d6e81a01',
  'masuk',
  NOW() - INTERVAL '4 hours',
  NOW() + INTERVAL '4 days'
);

-- Add status history for completed ones
INSERT INTO status_history (laporan_id, from_status, to_status, changed_by, changed_by_nama, notes, created_at)
SELECT id, 'proses', 'selesai', pelapor_id, 'System', 'Laporan diselesaikan', closed_at
FROM laporan WHERE status = 'selesai';

INSERT INTO status_history (laporan_id, from_status, to_status, changed_by, changed_by_nama, notes, created_at)
SELECT id, 'proses', 'ditutup', pelapor_id, 'System', 'Laporan ditutup (tidak terbukti)', closed_at
FROM laporan WHERE status = 'ditutup';

INSERT INTO status_history (laporan_id, from_status, to_status, changed_by, changed_by_nama, notes, created_at)
SELECT id, 'masuk', 'proses', pelapor_id, 'System', 'Mulai diproses', first_response_at
FROM laporan WHERE status IN ('proses', 'selesai', 'ditutup') AND first_response_at IS NOT NULL;

-- Verify
SELECT status, COUNT(*) FROM laporan GROUP BY status ORDER BY status;
SELECT instansi_id, COUNT(*) FROM laporan GROUP BY instansi_id;
SELECT COUNT(*) as total FROM laporan;
