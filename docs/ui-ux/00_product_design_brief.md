# Product Design Brief

## Product Positioning

GrowDu adalah operating system untuk bimbel Indonesia. Produk membantu owner, admin, dan tentor mengelola aktivitas harian bimbel dalam satu aplikasi: data siswa, data tentor, kelompok belajar, jadwal, presensi, invoice SPP, penggajian, laporan perkembangan, dan pengaturan identitas bimbel.

MVP bukan aplikasi marketing dan bukan portal pembelajaran. Tampilan pertama setelah login harus langsung menjadi workspace operasional.

## Design Goals

- Membuat status operasional bimbel terlihat dalam 5-10 detik dari dashboard.
- Mengurangi rasa "spreadsheet manual" dengan struktur tabel, filter, status badge, dan aksi yang jelas.
- Membuat alur input data panjang tetap terasa ringan melalui form section, validasi langsung, dan ringkasan sebelum simpan.
- Memastikan admin paham prioritas kerja harian: invoice belum dibayar, jadwal hari ini, presensi, laporan belum dibuat, payroll bulan ini.
- Memastikan tentor bisa menyelesaikan tugas utama dari HP: melihat jadwal, mengisi presensi, membuat laporan, dan melihat slip gaji.

## Experience Principles

### 1. Operational First

Setiap screen harus menjawab "apa yang perlu saya lakukan sekarang?" sebelum menampilkan informasi tambahan. Hindari hero besar, ilustrasi dekoratif, dan copy promosi di area aplikasi.

### 2. Scanable And Dense

Dashboard, tabel, dan daftar harus mudah dipindai. Gunakan hierarchy yang jelas: title, summary metric, filter, table/list, action.

### 3. Guided Data Entry

Form GrowDu berisi banyak data administrasi. Pecah form menjadi section kecil, tampilkan field wajib, beri validasi dekat field, dan pakai default value saat memungkinkan.

### 4. Status Is A First-Class UI

Status seperti aktif, nonaktif, lunas, belum bayar, terlambat, sudah dibayar, draft, terkirim, dan gagal harus terlihat konsisten lewat badge, warna, icon, dan filter.

### 5. Safe Business Actions

Aksi sensitif seperti hapus data, ubah status invoice, proses payroll, kirim ulang email laporan, dan ubah pengaturan branding harus memakai konfirmasi atau preview.

### 6. Mobile-Friendly Tutor Workflow

Screen tentor harus lebih sederhana daripada screen admin. Prioritasnya adalah task completion cepat, tombol besar, list yang jelas, dan sticky action untuk simpan.

## Personas And UX Needs

### Owner

Owner membutuhkan ringkasan kondisi bisnis. Ia memakai dashboard dan laporan untuk menjawab:

- Berapa pendapatan bulan ini?
- Berapa gaji tentor bulan ini?
- Ada berapa invoice belum dibayar atau terlambat?
- Berapa siswa dan tentor aktif?
- Apakah laporan perkembangan sudah dibuat?

Desain untuk owner harus menonjolkan metric, trend sederhana, dan alert operasional.

### Admin

Admin menjalankan operasi harian. Ia membutuhkan CRUD yang cepat, validasi jelas, filter tabel, dan aksi massal yang aman.

Desain untuk admin harus menonjolkan:

- Data table yang kuat.
- Filter dan pencarian.
- Form tambah/edit yang rapi.
- Notifikasi validasi jadwal.
- Queue pekerjaan yang belum selesai.

### Tentor

Tentor membutuhkan akses terbatas dan task-based. Ia tidak perlu melihat seluruh sistem.

Desain untuk tentor harus menonjolkan:

- Jadwal mengajar hari ini.
- Tombol buka presensi.
- Status presensi per siswa.
- Form laporan perkembangan yang mudah diisi.
- Slip gaji yang bisa dilihat atau diunduh.

## Information Architecture

### Global Sections

- Dashboard
- Master Data
- Kelompok & Jadwal
- Presensi
- Invoice SPP
- Penggajian
- Laporan Perkembangan
- Pengaturan Bimbel

### Owner Navigation

- Dashboard
- Siswa
- Tentor
- Program
- Mata Pelajaran
- Ruangan
- Kelompok Belajar
- Jadwal
- Presensi
- Invoice SPP
- Penggajian
- Laporan Perkembangan
- Pengaturan

### Admin Navigation

- Dashboard
- Master Data
  - Siswa
  - Tentor
  - Program
  - Mata Pelajaran
  - Ruangan
- Kelompok Belajar
- Jadwal
- Presensi
- Invoice SPP
- Penggajian
- Laporan Perkembangan
- Pengaturan

### Tentor Navigation

- Dashboard Saya
- Jadwal Mengajar
- Presensi
- Laporan Perkembangan
- Slip Gaji

## App Shell

### Desktop Layout

- Left sidebar fixed width 264px.
- Top bar height 64px with page title, search shortcut, notification/action area, and user menu.
- Main content max width none, with 24px page padding.
- Tables use full available width.
- Dialog or drawer used for create/edit forms depending complexity.

### Tablet Layout

- Sidebar can collapse to icon-only.
- Content padding 20px.
- Tables can switch to horizontal scroll or compact columns.
- Schedule view can show day/week toggle.

### Mobile Browser Layout

- Bottom navigation for tentor role.
- Drawer navigation for owner/admin.
- Content padding 16px.
- Data table transforms into stacked list cards for high-priority mobile views.
- Primary action can be sticky at bottom for presensi and report forms.

## Page Hierarchy Pattern

Setiap halaman operasional mengikuti pola:

1. Page header: title, short context, primary action.
2. Summary strip: metric kecil atau alert bila relevan.
3. Toolbar: search, filter, date/month selector, export/action menu.
4. Main content: table, list, calendar, or form.
5. Secondary details: drawer, modal, or detail page.

## Visual Tone

GrowDu harus terlihat seperti alat kerja modern untuk lembaga pendidikan:

- Warna utama edukatif dan tepercaya.
- Banyak ruang putih, bukan dekorasi ramai.
- Teks jelas dan praktis.
- Icon membantu scan, bukan dekorasi berlebihan.
- Border dan background lembut untuk membedakan area data.

## Role Permission Cues

Jangan hanya mengandalkan backend untuk role. UI juga harus memberi cue:

- Tentor tidak melihat menu admin.
- Owner melihat metrik finansial penuh.
- Admin melihat alat operasional penuh, tetapi tidak perlu wording seperti "akses terbatas" kecuali ada aksi yang memang dikunci.
- Disabled action harus menjelaskan alasannya melalui tooltip atau helper text.

