# User Flows And States

Dokumen ini mendefinisikan flow utama, state UI, validasi, responsive behavior, microcopy, dan checklist QA untuk BimbelKit MVP.

## Core User Flows

### Flow 1: Setup Awal Bimbel

Role: Owner/Admin

1. Login.
2. Buka Pengaturan Bimbel.
3. Isi logo, nama bimbel, kontak, warna utama, dan rekening.
4. Tambah program belajar.
5. Tambah mata pelajaran.
6. Tambah ruangan.
7. Tambah tentor.
8. Tambah siswa.
9. Buat kelompok belajar dan jadwal.

UI requirements:

- Dashboard kosong menampilkan setup checklist.
- Tiap checklist item punya CTA ke halaman terkait.
- Setelah item selesai, tampilkan check indicator.

### Flow 2: Admin Membuat Kelompok Belajar

Role: Admin

1. Buka Kelompok Belajar.
2. Klik `Tambah Kelompok`.
3. Isi nama, program, mata pelajaran.
4. Pilih tentor, ruangan, hari, jam mulai, jam selesai.
5. Sistem memvalidasi bentrok jadwal tentor dan ruangan secara realtime.
6. Pada bagian **3. Siswa Peserta**, klik tombol `+ Tambah Siswa`.
7. Modal dialog **Pilih Siswa Peserta** terbuka:
   - Admin dapat melakukan pencarian nama, NISN, atau sekolah.
   - Memfilter berdasarkan jenjang atau status aktif.
   - Memilih satu atau beberapa siswa menggunakan checkbox multi-select.
   - Klik `Tambahkan Siswa (X)` untuk mengonfirmasi.
8. Siswa yang terpilih muncul di dalam **Selected Student List** dengan rincian lengkap:
   - Avatar & Nama Siswa (beserta NISN).
   - Asal Sekolah & Jenjang/Kelas.
   - Alamat Domisili.
   - Tombol CTA `Hapus` untuk membatalkan pilihan per siswa sewaktu-waktu.
9. Simpan kelompok belajar melalui sticky footer bar (`Simpan Kelompok`).

Validation:

- Nama kelompok wajib.
- Program wajib.
- Mata pelajaran wajib.
- Tentor wajib.
- Ruangan wajib.
- Hari wajib.
- Jam selesai harus lebih besar dari jam mulai.
- Bentrok tentor menolak simpan.
- Bentrok ruangan menolak simpan.
- Minimal satu siswa direkomendasikan, tetapi bisa dibuat kosong jika operasional membutuhkan setup awal.

Success state:

- Toast: `Kelompok belajar berhasil dibuat.`
- Redirect ke detail atau list dengan row baru highlighted.

### Flow 3: Admin Mengelola Data Ruangan

Role: Owner/Admin

1. Buka menu **Ruangan** dari navigasi Master Data.
2. Melihat ringkasan metrik (Ruangan Aktif, Sesi Hari Ini, Total Kapasitas, Ruangan Nonaktif/Perbaikan).
3. Melakukan pencarian ruangan, filter kapasitas, atau status.
4. Klik `+ Tambah Ruangan` untuk mendaftarkan ruangan baru:
   - Mengisi Nama Ruangan dan Kode Ruangan unik (e.g. `Ruang Galileo`, `R-01`).
   - Menentukan Kapasitas Maksimal Siswa (e.g. `12 Siswa`).
   - Menambahkan catatan operasional jika ada.
5. Meninjau live preview kartu ruangan dan validasi prasyarat di side column.
6. Menyimpan ruangan melalui sticky footer bar (`Simpan Ruangan`).
7. Pada halaman list atau detail ruangan:
   - Admin dapat melihat utilisasi, statistik okupansi, dan daftar kelompok belajar yang aktif terjadwal di ruangan tersebut.
   - Melakukan `Ubah Data Ruangan` (Edit) jika ada penyesuaian kapasitas.
   - Melakukan `Nonaktifkan Ruangan` dengan modal konfirmasi proteksi bentrok jika ada kelompok belajar aktif.

Validation:

- Nama ruangan wajib diisi.
- Kode ruangan unik dan wajib diisi.
- Kapasitas minimal 1 siswa.
- Menonaktifkan ruangan yang masih memiliki jadwal aktif memunculkan konfirmasi peringatan pengalihan jadwal.

Success state:

- Toast: `Data ruangan berhasil disimpan.` / `Status ruangan berhasil diperbarui.`
- Tampilan tabel/detail terupdate secara realtime.

### Flow 4: Tentor Mengisi Presensi

Role: Tentor

1. Login.
2. Melihat `Jadwal Mengajar Hari Ini`.
3. Tap `Isi Presensi`.
4. Melihat daftar siswa.
5. Tap `Tandai Semua Hadir` bila sesuai.
6. Ubah status siswa tertentu menjadi Izin/Sakit/Alpha.
7. Simpan presensi.

Validation:

- Semua siswa harus punya status sebelum simpan.
- Jika ada perubahan belum disimpan dan user keluar, tampilkan confirmation.

Success state:

- Toast: `Presensi berhasil disimpan.`
- Jadwal card berubah menjadi `Presensi tersimpan`.

Mobile:

- Status control minimal height 44px.
- Footer save sticky.
- Progress count selalu terlihat.

### Flow 5: Admin Memantau Invoice

Role: Admin

1. Buka Invoice SPP.
2. Pilih periode bulan.
3. Lihat status invoice.
4. Filter `Belum Bayar` atau `Terlambat`.
5. Buka detail siswa.
6. Ubah status pembayaran menjadi `Lunas`.

Validation:

- Perubahan ke lunas membutuhkan tanggal pembayaran.
- Invoice tidak boleh dobel untuk siswa dan periode yang sama.

Success state:

- Status badge berubah.
- Dashboard metric pendapatan/piutang diperbarui.

### Flow 6: Admin Memproses Payroll

Role: Admin

1. Buka Penggajian.
2. Pilih periode.
3. Review daftar tentor.
4. Buka detail payroll.
5. Cek rincian sesi.
6. Override tarif jika diperlukan.
7. Simpan atau tandai sudah dibayar.
8. Slip gaji tersedia untuk tentor.

Validation:

- Payroll dihitung dari presensi tersimpan.
- Payroll `Sudah Dibayar` tidak boleh berubah tanpa proses koreksi eksplisit.
- Jika ada sesi tanpa presensi, tampilkan warning.

Success state:

- Badge `Sudah Dibayar`.
- Action `Download Slip`.
- Tentor melihat slip di akun.

### Flow 7: Tentor Membuat Laporan Perkembangan

Role: Tentor

1. Buka Laporan Perkembangan.
2. Pilih siswa/periode yang perlu laporan.
3. Sistem mengisi kehadiran otomatis.
4. Isi materi, progres, peningkatan, dan catatan.
5. Simpan draft atau simpan dan kirim.

Validation:

- Materi wajib.
- Perkembangan belajar wajib.
- Hal yang perlu ditingkatkan wajib.
- Catatan tentor opsional.
- Email orang tua wajib tersedia sebelum kirim.

Success state:

- Draft: `Laporan disimpan sebagai draft.`
- Send: `Laporan disimpan dan email sedang dikirim.`
- Failed send: status `Gagal Terkirim`, action `Kirim Ulang`.

## Global UI States

### Loading

Use skeleton for:

- Dashboard metric.
- Table rows.
- Schedule cards.
- Report preview.

Use spinner for:

- Button submit.
- Inline refresh.
- File upload.

### Empty

Empty state harus actionable.

Examples:

| Context | Title | Description | Action |
| --- | --- | --- | --- |
| Siswa | `Belum ada siswa` | `Tambahkan siswa agar bisa dimasukkan ke kelompok belajar.` | `Tambah Siswa` |
| Ruangan | `Belum ada ruangan` | `Tambahkan ruangan kelas agar dapat digunakan saat membuat kelompok belajar.` | `Tambah Ruangan` |
| Jadwal Tentor | `Tidak ada jadwal hari ini` | `Jadwal mengajar Anda untuk hari ini kosong.` | None |
| Invoice | `Tidak ada invoice pada periode ini` | `Generate invoice bulanan untuk siswa aktif.` | `Generate Invoice` |
| Laporan | `Belum ada laporan` | `Laporan akan muncul setelah tentor membuat laporan perkembangan.` | None |

### Error

Error message harus spesifik.

Examples:

- `Gagal memuat data siswa. Coba muat ulang.`
- `Jadwal tidak dapat disimpan karena ruangan bentrok.`
- `Email laporan gagal dikirim. Periksa alamat email orang tua lalu kirim ulang.`

### Success

Success message harus singkat dan menyebut objek.

Examples:

- `Data siswa berhasil disimpan.`
- `Invoice ditandai lunas.`
- `Slip gaji berhasil dibuat.`
- `Laporan berhasil dikirim.`

### Permission

Jika user membuka route yang tidak sesuai role:

- Tampilkan page `Akses tidak tersedia`.
- Copy: `Akun Anda tidak memiliki akses ke halaman ini.`
- CTA: `Kembali ke Dashboard`.

## Validation UX

### Inline Validation

Gunakan inline validation untuk:

- Field wajib.
- Format email.
- Nomor HP.
- Jam selesai lebih awal dari jam mulai.
- Nominal/tarif tidak valid.

### Server Validation

Gunakan alert block untuk:

- Bentrok jadwal.
- Invoice duplikat.
- Tenant access violation.
- Payroll sudah terkunci.

### Dirty State

Form panjang harus mendeteksi perubahan belum disimpan.

Copy dialog:

- Title: `Keluar tanpa menyimpan?`
- Description: `Perubahan yang belum disimpan akan hilang.`
- Actions: `Tetap di halaman`, `Keluar`.

## Responsive Behavior

### Breakpoints

| Breakpoint | Width | Behavior |
| --- | --- | --- |
| Mobile | `< 640px` | Single column, drawer nav, bottom nav for tentor |
| Tablet | `640px - 1023px` | Collapsible nav, 2-column cards |
| Desktop | `>= 1024px` | Sidebar, table-first layout |
| Wide | `>= 1440px` | Wider tables, dashboard grid 4 columns |

### Dashboard Grid

- Mobile: 1 column.
- Tablet: 2 columns.
- Desktop: 4 columns.

### Forms

- Mobile: 1 column.
- Desktop: 2 columns for related short fields.
- Long text areas full width.

### Tables

Desktop:

- Full table with filters.

Mobile:

- Use card list for tentor workflow.
- Admin tables may horizontal scroll if rarely used on mobile.
- Critical row actions should not hide behind tiny tap targets.

## Content And Microcopy Rules

### Language

Gunakan Bahasa Indonesia yang jelas dan operasional.

Preferred labels:

- `Tambah Siswa`, not `Create Student`.
- `Simpan`, not `Submit`.
- `Belum Bayar`, not `Unpaid`.
- `Terlambat`, not `Overdue`.
- `Tandai Lunas`, not `Set Paid`.

### Button Labels

- Primary action starts with verb: `Tambah`, `Simpan`, `Kirim`, `Generate`, `Download`.
- Destructive action explicit: `Nonaktifkan Siswa`, `Hapus Ruangan`.
- Avoid vague labels like `OK` except simple confirmation.

### Helper Text

Use helper text for:

- Tarif tentor.
- Rekening.
- Warna utama.
- Logo upload.
- Email orang tua.

Example:

- `Email ini dipakai untuk mengirim laporan perkembangan belajar.`

## Accessibility Checklist

- Kontras teks memenuhi WCAG AA.
- Focus state terlihat di semua input dan button.
- Semua icon-only button memiliki `aria-label`.
- Badge status memakai teks, bukan warna saja.
- Error form terhubung dengan field.
- Modal trap focus.
- Escape menutup popover/dialog jika aman.
- Table punya header yang jelas.
- Touch target minimal 44px pada mobile.

## UI QA Checklist

Gunakan checklist ini sebelum screen dianggap siap.

### App Shell

- Sidebar active state benar.
- Role hanya melihat menu yang sesuai.
- Top bar tidak overlap dengan content.
- Mobile navigation nyaman disentuh.

### Dashboard

- Metric loading, empty, dan data state tersedia.
- Angka besar tidak overflow.
- Alert operasional punya CTA.
- Month selector mempengaruhi data.

### Forms

- Field wajib ditandai.
- Error muncul di dekat field.
- Save disabled/loading state jelas.
- Form panjang punya sticky footer.
- Dirty state warning tersedia.

### Tables

- Search dan filter bekerja.
- Empty state actionable.
- Pagination tidak memotong data.
- Row action jelas.
- Status badge konsisten.

### Presensi

- Semua status mudah dipilih di mobile.
- Progress count akurat.
- Save sticky tidak menutup konten terakhir.
- Unsaved change warning bekerja.

### Invoice And Payroll

- Status finansial jelas.
- Aksi pembayaran butuh konfirmasi.
- Total nominal diformat Rupiah.
- Snapshot payroll dikomunikasikan saat pembayaran.

### Reports

- Kehadiran otomatis terlihat.
- Textarea cukup tinggi.
- Email preview memakai branding bimbel.
- Failed email punya action kirim ulang.

