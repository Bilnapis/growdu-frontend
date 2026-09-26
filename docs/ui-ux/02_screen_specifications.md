# Screen Specifications

Dokumen ini mendefinisikan screen MVP GrowDu, konten utama, aksi, state, dan kebutuhan UI per role.

## Route And Screen Map

| Route | Screen | Owner | Admin | Tentor |
| --- | --- | --- | --- | --- |
| `/login` | Login | Yes | Yes | Yes |
| `/dashboard` | Dashboard Owner/Admin | Yes | Yes | No |
| `/me` | Dashboard Tentor | No | No | Yes |
| `/students` | Data Siswa | Yes | Yes | No |
| `/tutors` | Data Tentor | Yes | Yes | No |
| `/programs` | Program Belajar | Yes | Yes | No |
| `/subjects` | Mata Pelajaran | Yes | Yes | No |
| `/rooms` | Ruangan | Yes | Yes | No |
| `/study-groups` | Kelompok Belajar | Yes | Yes | No |
| `/schedule` | Jadwal | Yes | Yes | Yes, filtered |
| `/attendance` | Presensi | Yes, read | Yes, read | Yes, own classes |
| `/invoices` | Invoice SPP | Yes | Yes | No |
| `/payroll` | Penggajian | Yes | Yes | No |
| `/salary-slips` | Slip Gaji Tentor | No | No | Yes |
| `/progress-reports` | Laporan Perkembangan | Yes | Yes | Yes, own reports |
| `/settings` | Pengaturan Bimbel | Yes | Yes | No |

## Login Screen

### Purpose

Memberi akses role-based ke aplikasi.

### Layout

- Centered auth panel max width 420px.
- Logo atau nama bimbel/GrowDu di atas form.
- Form email, password, remember session.
- Primary action: `Masuk`.
- Secondary: `Lupa password?` jika fitur tersedia.

### States

- Loading saat submit.
- Error credential salah.
- Error akun nonaktif.
- Error koneksi.

### Notes

Setelah login:

- Owner/Admin diarahkan ke `/dashboard`.
- Tentor diarahkan ke `/me`.

## Dashboard Owner/Admin

### Purpose

Memberi ringkasan operasional dan daftar prioritas kerja.

### Header

- Title: `Dashboard`
- Subtitle: `Ringkasan operasional bulan ini`
- Controls: bulan aktif, refresh, optional export.

### Metric Cards

- Pendapatan bulan ini.
- Total gaji tentor bulan ini.
- Siswa aktif.
- Tentor aktif.
- Kelompok belajar.
- Program belajar.
- Invoice belum dibayar.
- Laporan belum dibuat.

### Main Sections

1. Alert operasional
   - Invoice terlambat.
   - Laporan belum dibuat.
   - Jadwal bentrok tidak boleh masuk ke data, tetapi error terbaru bisa muncul sebagai log ringan bila relevan.

2. Jadwal hari ini
   - Table/list: jam, kelompok, tentor, ruangan, jumlah siswa, status presensi.

3. Progres belajar bulan ini
   - Ringkasan laporan terkirim, draft, belum dibuat.

4. Ringkasan keuangan
   - Pendapatan invoice lunas.
   - Piutang belum bayar/terlambat.
   - Payroll siap dibayar/sudah dibayar.

### Empty State

Jika data awal belum ada:

- Tampilkan setup checklist: tambah siswa, tambah tentor, tambah program, tambah ruangan, buat kelompok.
- Primary action: `Mulai dari Master Data`.

## Dashboard Tentor

### Purpose

Memusatkan tugas tentor hari ini.

### Header

- Title: `Dashboard Saya`
- Subtitle: tanggal hari ini.

### Sections

1. Jadwal mengajar hari ini
   - Kartu per sesi.
   - Tampilkan jam, kelompok, mata pelajaran, ruangan, jumlah siswa.
   - Action: `Isi Presensi`.

2. Laporan yang perlu dibuat
   - List siswa/kelompok/bulan.
   - Action: `Buat Laporan`.

3. Slip gaji terbaru
   - Periode, status, total, download jika sudah dibayar.

### Mobile Priority

Jadwal hari ini harus tampil paling atas dengan tombol besar.

## Data Siswa

### Purpose

CRUD data siswa dan status aktif/nonaktif.

### Table Columns

- Nama siswa.
- Jenjang/sekolah.
- Orang tua.
- Nomor HP.
- Email orang tua.
- Status.
- Kelompok aktif.
- Aksi.

### Filters

- Search nama/sekolah/orang tua.
- Status.
- Jenjang.
- Kelompok.

### Primary Actions

- `Tambah Siswa`.
- Optional later: import spreadsheet.

### Form Fields

- Nama siswa.
- Nomor HP siswa opsional.
- Nama orang tua.
- Email orang tua.
- Nomor HP orang tua.
- Sekolah.
- Jenjang.
- Status.

### States

- Empty: belum ada siswa.
- Validation: email tidak valid, field wajib kosong.
- Delete/Deactivate confirmation: rekomendasikan nonaktif dibanding hapus permanen jika sudah punya riwayat.

## Data Tentor

### Table Columns

- Nama tentor.
- Mata pelajaran.
- Nomor HP.
- Tarif mengajar.
- Rekening.
- Status.
- Jadwal aktif.
- Aksi.

### Form Fields

- Nama.
- Nomor HP.
- Email/login opsional sesuai auth.
- Mata pelajaran.
- Tarif mengajar default.
- Bank dan nomor rekening.
- Status.

### Notes

Tarif default bisa dioverride saat payroll.

## Program Belajar

### Table Columns

- Nama program.
- Jumlah kelompok.
- Siswa aktif.
- Status.
- Aksi.

### Form Fields

- Nama program.
- Deskripsi opsional.
- Status.

Program tidak memakai daftar terkunci. Nama harus bebas.

## Mata Pelajaran

### Table Columns

- Nama mata pelajaran.
- Jumlah tentor.
- Jumlah kelompok.
- Status.
- Aksi.

### Form Fields

- Nama mata pelajaran.
- Status.

## Ruangan

### Purpose

CRUD master data ruangan kelas, kapasitas belajar, pemantauan jadwal harian per ruangan, dan validasi bentrok operasional bimbel.

### Table Columns

- Nama ruangan & kode ruangan.
- Kapasitas maksimal siswa.
- Kelompok aktif yang menggunakan ruangan.
- Jadwal hari ini (ringkasan sesi aktif).
- Status (Aktif / Nonaktif).
- Aksi (Lihat detail, ubah data, nonaktifkan).

### Filters & Toolbar

- Search nama ruangan atau kode.
- Filter status (Semua, Aktif, Nonaktif).
- Filter kapasitas (Kecil <=8, Sedang 9-15, Besar >15).

### Primary Actions

- `Tambah Ruangan`.
- `Export Data`.

### Form Sections & Fields

1. Informasi Dasar Ruangan
   - Nama ruangan (Required).
   - Kode ruangan unik (Required, e.g., `R-01`, `LAB-1`).
   - Kapasitas maksimal siswa (Required, e.g., 12 Siswa).
   - Status awal ruangan (Required: Aktif / Nonaktif).

2. Catatan Operasional
   - Catatan internal admin (Opsional: keterangan penggunaan, penanggung jawab ruangan).

### Detail Screen Sections

- Profile Card: Nama ruangan, kode, badge status, kapasitas siswa.
- Spesifikasi & Informasi Operasional: Grid data lengkap kapasitas, tipe penggunaan, dan riwayat pembaruan.
- Kelompok Belajar Terdaftar: List kelompok belajar yang menggunakan ruangan ini lengkap dengan nama tentor, hari, jam, dan jumlah siswa.
- Ringkasan Utilisasi / Okupansi: Persentase utilisasi mingguan, total sesi per minggu, dan aksi cepat (Ubah, Lihat Kalender, Nonaktifkan).

### States & Dialogs

- Empty State: Belum ada ruangan, CTA `+ Tambah Ruangan Baru`, ilustrasi icon ruangan, dan helper copy.
- Edit State: Form prefilled, ringkasan delta perubahan di side panel, dan warning proteksi kelompok belajar aktif.
- Modal Konfirmasi Nonaktifkan: Dialog konfirmasi bahaya jika ruangan masih memiliki kelompok belajar aktif dengan peringatan kebutuhan reschedule.
- Mobile View: List card responsif dengan quick actions dan bottom sheet tambah cepat.

## Kelompok Belajar

### Purpose

Membuat kelas/kelompok yang menghubungkan program, mata pelajaran, tentor, ruangan, jadwal, dan siswa.

### Table Columns

- Nama kelompok.
- Program.
- Mata pelajaran.
- Tentor.
- Ruangan.
- Jadwal.
- Jumlah siswa.
- Status.
- Aksi.

### Filters

- Program.
- Mata pelajaran.
- Tentor.
- Ruangan.
- Hari.
- Status.

### Form Sections

1. Info kelompok
   - Nama kelompok.
   - Program.
   - Mata pelajaran.
   - Status.

2. Jadwal dan penugasan
   - Tentor.
   - Ruangan.
   - Hari.
   - Jam mulai.
   - Jam selesai.

3. Daftar siswa peserta
   - Tombol CTA: `+ Tambah Siswa` (memicu modal picker data siswa).
   - Modal Picker Siswa:
     - Search bar (nama, NISN, sekolah).
     - Filter (jenjang, status).
     - Multi-select table dengan checkbox (Nama, NISN, Sekolah, Alamat, Status).
     - Counter siswa terpilih dan tombol `Batal` serta `Tambahkan Siswa (X)`.
   - Selected student list / table:
     - Avatar inisial siswa.
     - Nama siswa dan NISN.
     - Asal sekolah dan jenjang/kelas.
     - Alamat domisili.
     - Tombol CTA `Hapus` per baris untuk membatalkan pilihan.

### Conflict Validation UI

Jika bentrok tentor:

- Inline alert di section jadwal.
- Copy: `Tentor sudah memiliki jadwal pada Senin, 15:00-16:30. Pilih jam atau tentor lain.`

Jika bentrok ruangan:

- Inline alert di section jadwal.
- Copy: `Ruangan sudah digunakan pada rentang waktu ini. Pilih ruangan atau jam lain.`

Save button disabled sampai konflik selesai, atau submit menampilkan error dari backend.

## Jadwal

### Views

- List view default untuk admin.
- Week view untuk melihat persebaran jadwal.
- Today view untuk tentor.

### List Columns

- Hari/tanggal.
- Jam.
- Kelompok.
- Mata pelajaran.
- Tentor.
- Ruangan.
- Jumlah siswa.
- Status presensi.

### Controls

- Toggle `Hari Ini`, `Minggu Ini`, `Semua`.
- Filter tentor, ruangan, mata pelajaran.

### Schedule Card Content

- Time range.
- Group name.
- Subject.
- Tutor.
- Room.
- Student count.
- Attendance status.

## Presensi

### Tentor Flow

1. Tentor membuka jadwal hari ini.
2. Pilih kelas.
3. Sistem menampilkan daftar siswa.
4. Tentor memilih status setiap siswa.
5. Tentor menyimpan presensi.

### Attendance Session Screen

Header:

- Kelompok, mata pelajaran, ruangan.
- Jam dan tanggal.
- Jumlah siswa.
- Status tersimpan/belum.

Controls:

- Bulk action: `Tandai Semua Hadir`.
- Filter kecil: semua, belum diisi, hadir, izin, sakit, alpha.

Student Row:

- Nama siswa.
- Sekolah/jenjang kecil.
- Segmented control: Hadir, Izin, Sakit, Alpha.
- Catatan opsional jika diperlukan nanti.

Sticky Footer:

- Progress: `18/20 siswa sudah diisi`.
- Primary action: `Simpan Presensi`.

### Admin Read Screen

Admin melihat presensi per sesi:

- Filter tanggal, tentor, kelompok.
- Status sesi.
- Detail kehadiran per siswa.

## Invoice SPP

### Purpose

Memantau invoice bulanan dan status pembayaran.

### Table Columns

- Nomor invoice.
- Periode.
- Nama siswa.
- Program/kelompok.
- Nominal.
- Jatuh tempo.
- Status.
- Terakhir diubah.
- Aksi.

### Filters

- Periode bulan.
- Status: lunas, belum bayar, terlambat.
- Program/kelompok.
- Search siswa.

### Actions

- Ubah status pembayaran.
- Lihat detail invoice.
- Generate invoice bulanan.
- Optional later: download invoice PDF.

### Status Change UI

Gunakan confirm dialog saat mengubah ke `Lunas`:

- Tampilkan siswa, periode, nominal.
- Field tanggal pembayaran.
- Optional catatan.

## Penggajian Tentor

### Purpose

Menghitung dan membayar gaji tentor dari data presensi.

### Payroll List Columns

- Periode.
- Tentor.
- Total sesi.
- Tarif default.
- Penyesuaian.
- Total gaji.
- Status.
- Aksi.

### Payroll Detail

Sections:

1. Ringkasan payroll
   - Tentor, periode, status, total gaji.

2. Rincian sesi
   - Tanggal, kelompok, mata pelajaran, status presensi, tarif.

3. Penyesuaian
   - Override tarif atau adjustment.
   - Catatan admin.

4. Slip gaji
   - Preview data yang masuk PDF.
   - Download jika sudah dibayar.

### Actions

- Hitung ulang.
- Simpan draft.
- Tandai sudah dibayar.
- Download slip PDF.

### Confirmation

Saat `Tandai Sudah Dibayar`, tampilkan warning bahwa snapshot payroll akan disimpan untuk audit.

## Laporan Perkembangan Belajar

### Admin Screen

Table Columns:

- Periode.
- Siswa.
- Kelompok.
- Tentor.
- Status laporan.
- Status email.
- Terakhir dikirim.
- Aksi.

Filters:

- Bulan.
- Tentor.
- Kelompok.
- Status.

Actions:

- Lihat.
- Edit opsional.
- Kirim ulang email.

### Tentor Report Form

Header:

- Siswa.
- Kelompok.
- Bulan.
- Data kehadiran otomatis.

Fields:

- Materi yang dipelajari.
- Kehadiran otomatis dari presensi.
- Perkembangan belajar.
- Hal yang perlu ditingkatkan.
- Catatan tentor.

Actions:

- Simpan draft.
- Simpan dan kirim.

### Email Preview

Admin dan tentor sebaiknya bisa melihat preview:

- Logo bimbel.
- Nama bimbel.
- Nama siswa.
- Bulan.
- Kehadiran.
- Materi.
- Progres belajar.
- Hal yang perlu ditingkatkan.
- Catatan tentor.

## Pengaturan Bimbel

### Purpose

Mengatur identitas yang tampil di dashboard, invoice, email, dan laporan.

### Sections

1. Identitas bimbel
   - Logo.
   - Nama bimbel.
   - Alamat.
   - WhatsApp.
   - Email.
   - Website opsional.

2. Branding
   - Warna utama aplikasi.
   - Preview sidebar/button/badge.

3. Rekening
   - Nama bank.
   - Nomor rekening.
   - Atas nama.

4. Invoice dan laporan
   - Preview header invoice/email.

### Validation

- Logo: tipe file dan ukuran.
- Email valid.
- WhatsApp format Indonesia.
- Warna utama valid hex.

