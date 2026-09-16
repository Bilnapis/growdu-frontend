# PRD BimbelKit MVP 1.0

Sumber: `BimbelKit (MVP).docx`

Produk: BimbelKit  
Tagline produk: Operating System untuk Bimbel Indonesia  
Versi dokumen: MVP 1.0  
Status: Draft PRD  
Tanggal: 13 September 2026

## 1. Executive Summary

### Problem Statement

Owner, admin, dan tentor bimbingan belajar kecil hingga menengah masih sering mengelola operasional harian secara manual atau tersebar di banyak alat, sehingga data siswa, jadwal, presensi, invoice, penggajian, dan laporan perkembangan sulit dipantau secara rapi.

Bimbel yang baru berdiri juga membutuhkan sistem sederhana yang bisa langsung dipakai tanpa konfigurasi kompleks, agar proses administrasi dan akademik dapat terdigitalisasi sejak awal.

### Proposed Solution

BimbelKit adalah platform manajemen operasional bimbingan belajar berbasis web yang membantu owner, admin, dan tentor mengelola aktivitas utama bimbel dalam satu sistem terpadu.

MVP 1.0 berfokus pada fitur inti: dashboard operasional, master data, kelompok belajar, jadwal, presensi, invoice SPP bulanan, penggajian tentor, laporan perkembangan belajar, dan pengaturan identitas bimbel.

### Success Criteria

- Minimal 90% aktivitas operasional harian admin untuk data siswa, jadwal, presensi, invoice, dan penggajian dapat dilakukan dari BimbelKit tanpa spreadsheet terpisah.
- Admin dapat membuat kelompok belajar dan jadwal dengan validasi bentrok tentor dan ruangan sebelum data tersimpan.
- Tentor dapat mengisi presensi kelas dan laporan perkembangan siswa dari akun masing-masing.
- Invoice SPP bulanan dapat dibuat otomatis untuk seluruh siswa aktif pada awal bulan.
- Dashboard owner dan admin menampilkan metrik operasional utama secara real-time atau mendekati real-time.

Catatan validasi: target numerik seperti waktu penyelesaian tugas, tingkat aktivasi pengguna, dan retensi bimbel belum disebutkan dalam dokumen sumber dan perlu dikonfirmasi pada tahap discovery lanjutan.

## 2. User Experience & Functionality

### User Personas

#### Owner Bimbel

Owner adalah pemilik atau pengelola utama bimbel yang membutuhkan akses penuh untuk memantau performa operasional, pendapatan, gaji tentor, jumlah siswa aktif, invoice belum dibayar, dan progres belajar.

Kebutuhan utama owner:

- Melihat kondisi operasional bimbel secara cepat dari dashboard.
- Mengakses seluruh data dan pengaturan sistem.
- Memastikan proses pembayaran, penggajian, dan laporan berjalan rapi.

#### Admin

Admin adalah pengguna operasional harian yang mengelola data siswa, data tentor, program belajar, mata pelajaran, ruangan, kelompok belajar, jadwal, invoice, dan laporan.

Kebutuhan utama admin:

- Melakukan CRUD data operasional.
- Membuat kelompok belajar dan jadwal tanpa bentrok tentor atau ruangan.
- Memantau presensi, tunggakan, penggajian, dan laporan perkembangan.
- Mengelola identitas dan branding bimbel.

#### Tentor

Tentor adalah pengajar yang membutuhkan akses terbatas untuk melihat jadwal mengajar, mengisi presensi, dan membuat laporan perkembangan belajar siswa.

Kebutuhan utama tentor:

- Melihat jadwal mengajar hari ini.
- Mengisi kehadiran siswa per kelas.
- Mengisi laporan perkembangan belajar siswa setiap akhir bulan.
- Mengakses slip gaji yang sudah dibuat oleh sistem.

### User Stories

#### Dashboard

- Sebagai owner, saya ingin melihat pendapatan bulan ini, total gaji tentor bulan ini, jumlah siswa aktif, jumlah tentor aktif, invoice belum dibayar, jadwal mengajar hari ini, dan progres belajar agar saya dapat memahami kondisi bimbel dengan cepat.
- Sebagai admin, saya ingin melihat peringatan operasional seperti invoice belum dibayar dan laporan perkembangan yang belum dibuat agar saya dapat menindaklanjuti pekerjaan yang masih tertunda.

#### Master Data

- Sebagai admin, saya ingin menambahkan, melihat, mengubah, dan menghapus data siswa agar data siswa selalu akurat.
- Sebagai admin, saya ingin menambahkan, melihat, mengubah, dan menghapus data tentor agar data pengajar dan data pembayaran tentor selalu terkelola.
- Sebagai admin, saya ingin mengelola program belajar secara bebas agar setiap bimbel bisa menentukan nama programnya sendiri.
- Sebagai admin, saya ingin mengelola mata pelajaran dan ruangan agar keduanya dapat digunakan saat membuat kelompok belajar dan jadwal.

#### Kelompok Belajar dan Jadwal

- Sebagai admin, saya ingin membuat kelompok belajar berisi program, mata pelajaran, tentor, ruangan, hari, jam, dan daftar siswa agar kelas dapat dijadwalkan dengan jelas.
- Sebagai admin, saya ingin sistem mendeteksi bentrok tentor dan ruangan sebelum jadwal disimpan agar jadwal yang saling tumpang tindih dapat dicegah.

#### Presensi

- Sebagai tentor, saya ingin membuka jadwal mengajar hari ini dan memilih kelas agar saya bisa mencatat kehadiran siswa pada sesi tersebut.
- Sebagai tentor, saya ingin menandai setiap siswa dengan status Hadir, Izin, Sakit, atau Alpha agar presensi tercatat secara konsisten.
- Sebagai admin, saya ingin data presensi muncul di dashboard dan digunakan dalam perhitungan gaji agar data operasional dan data penggajian saling terhubung.

#### Invoice SPP

- Sebagai admin, saya ingin sistem membuat invoice SPP bulanan untuk seluruh siswa aktif pada awal bulan agar tagihan tidak perlu dibuat manual satu per satu.
- Sebagai admin, saya ingin mengubah status pembayaran menjadi Lunas, Belum Bayar, atau Terlambat agar piutang dapat dipantau dengan jelas.
- Sebagai admin, saya ingin melihat daftar invoice yang belum dibayar agar saya dapat melakukan tindak lanjut kepada orang tua atau siswa.

#### Penggajian Tentor

- Sebagai admin, saya ingin gaji tentor dihitung dari presensi mengajar dan tarif tentor agar perhitungan gaji lebih cepat dan dapat ditelusuri.
- Sebagai admin, saya ingin mengubah tarif tentor saat proses penggajian agar kasus khusus tetap bisa ditangani.
- Sebagai admin, saya ingin menandai gaji sebagai sudah dibayar dan menyimpan riwayat pembayaran agar catatan keuangan tetap rapi.
- Sebagai tentor, saya ingin mengunduh slip gaji dalam format PDF dan menerimanya di akun saya agar saya memiliki bukti pembayaran.

#### Laporan Perkembangan Belajar

- Sebagai tentor, saya ingin membuat laporan perkembangan belajar bulanan per siswa agar orang tua menerima perkembangan akademik yang terstruktur.
- Sebagai tentor, saya ingin data kehadiran terisi otomatis dari presensi agar laporan menggunakan data yang sudah tersedia.
- Sebagai admin, saya ingin melihat, memfilter, mengedit secara opsional, dan mengirim ulang email laporan perkembangan agar proses pelaporan dapat diawasi.
- Sebagai orang tua, saya ingin menerima email laporan perkembangan yang berisi identitas bimbel, nama siswa, bulan, kehadiran, materi, progres belajar, hal yang perlu ditingkatkan, dan catatan tentor agar saya memahami perkembangan belajar anak.

#### Pengaturan Bimbel

- Sebagai owner atau admin, saya ingin mengatur identitas dan branding bimbel agar invoice, dashboard, email, dan laporan tampil sesuai identitas lembaga.

### Acceptance Criteria

#### Dashboard Acceptance Criteria

- Dashboard menampilkan widget pendapatan bulan ini, total gaji tentor bulan ini, jumlah siswa aktif, jumlah tentor aktif, jumlah kelompok belajar, jumlah program belajar, invoice belum dibayar, jadwal mengajar hari ini, progres belajar bulan ini, dan jumlah laporan perkembangan yang belum dibuat.
- Data dashboard diperbarui setelah data operasional terkait berubah, seperti setelah presensi disimpan, status pembayaran diubah, atau laporan perkembangan dibuat.
- Owner memiliki akses ke seluruh widget dashboard.
- Admin memiliki akses ke widget dashboard operasional yang dibutuhkan untuk pengelolaan harian.

#### Master Data Acceptance Criteria

- Data siswa mendukung kolom nama, nomor HP, nama orang tua, email orang tua, sekolah, jenjang, dan status aktif atau nonaktif.
- Data tentor mendukung kolom nama, nomor HP, mata pelajaran, tarif mengajar, rekening tentor, dan status.
- Program belajar mendukung nama program kustom tanpa daftar nama yang dikunci oleh sistem.
- Mata pelajaran mendukung proses tambah, lihat, ubah, dan hapus data.
- Ruangan mendukung proses tambah, lihat, ubah, dan hapus data.
- Data yang dihapus atau dinonaktifkan tidak boleh merusak riwayat presensi, invoice, penggajian, atau laporan yang sudah terbentuk.

#### Kelompok Belajar Acceptance Criteria

- Admin dapat membuat kelompok belajar dengan nama kelompok, program, mata pelajaran, tentor, ruangan, hari, jam mulai, jam selesai, dan daftar siswa.
- Sistem memvalidasi bentrok tentor pada hari dan jam yang saling tumpang tindih sebelum jadwal disimpan.
- Sistem memvalidasi bentrok ruangan pada hari dan jam yang saling tumpang tindih sebelum jadwal disimpan.
- Jika terjadi bentrok, sistem membatalkan proses simpan dan menampilkan notifikasi yang jelas.
- Kelompok belajar yang berhasil disimpan muncul pada tampilan jadwal untuk admin dan tentor yang ditugaskan.

#### Presensi Acceptance Criteria

- Tentor hanya dapat mengakses kelas yang ditugaskan kepadanya.
- Tentor dapat melihat jadwal mengajar untuk hari berjalan.
- Tentor dapat membuka kelas dan melihat daftar siswa yang terdaftar.
- Setiap siswa dapat diberi satu status presensi: Hadir, Izin, Sakit, atau Alpha.
- Presensi yang sudah disimpan dapat dilihat oleh admin.
- Data presensi digunakan dalam perhitungan gaji tentor.
- Data presensi digunakan kembali pada laporan perkembangan belajar bulanan.

#### Invoice SPP Acceptance Criteria

- Sistem membuat invoice bulanan untuk seluruh siswa aktif pada periode awal bulan yang sudah dikonfigurasi.
- Status invoice mendukung Lunas, Belum Bayar, dan Terlambat.
- Admin dapat mengubah status pembayaran secara manual.
- Admin dapat melihat daftar invoice belum dibayar dan invoice terlambat.
- Siswa nonaktif tidak disertakan dalam pembuatan invoice bulanan baru.

#### Penggajian Tentor Acceptance Criteria

- Sistem menghitung gaji tentor dengan rumus: total sesi mengajar x tarif tentor.
- Sesi mengajar dihitung dari presensi yang sudah disimpan dan dikelompokkan berdasarkan kelompok belajar.
- Admin dapat menyesuaikan tarif tentor saat proses perhitungan gaji.
- Admin dapat menandai gaji sebagai Sudah Dibayar.
- Riwayat pembayaran gaji tetap tersimpan setelah pembayaran dilakukan.
- Slip gaji dapat diunduh dalam format PDF.
- Slip gaji muncul di akun tentor setelah penggajian ditandai sudah dibayar.

#### Laporan Perkembangan Belajar Acceptance Criteria

- Tentor dapat membuat laporan perkembangan untuk siswa yang dipilih pada akhir bulan.
- Form laporan berisi materi yang dipelajari, kehadiran, perkembangan belajar, hal yang perlu ditingkatkan, dan catatan tentor.
- Field kehadiran terisi otomatis dari data presensi.
- Admin dapat melihat seluruh laporan perkembangan.
- Admin dapat memfilter laporan berdasarkan bulan, tentor, dan kelompok belajar.
- Admin dapat mengedit laporan secara opsional.
- Admin dapat mengirim ulang email laporan perkembangan.
- Setelah laporan disimpan, sistem mengirim email ke alamat email orang tua.
- Email berisi logo bimbel, nama bimbel, nama siswa, bulan, kehadiran, materi, progres belajar, hal yang perlu ditingkatkan, dan catatan tentor.

#### Pengaturan Bimbel Acceptance Criteria

- Pelanggan dapat mengatur logo, nama bimbel, alamat, nomor WhatsApp, email, website opsional, warna utama aplikasi, dan nomor rekening.
- Identitas yang sudah dikonfigurasi muncul pada dashboard, invoice, email perkembangan belajar, dan laporan.
- Setiap pelanggan hanya dapat mengubah identitas bimbelnya sendiri.

### Non-Goals

- Aplikasi mobile native Android dan iOS tidak termasuk dalam cakupan MVP 1.0.
- Integrasi payment gateway online belum termasuk dalam cakupan MVP 1.0.
- Portal orang tua belum termasuk dalam cakupan MVP 1.0, selain penerimaan email laporan perkembangan.
- Login siswa belum termasuk dalam cakupan MVP 1.0.
- Analitik akademik lanjutan, penilaian tes, dan pembelajaran adaptif belum termasuk dalam cakupan MVP 1.0.
- Manajemen multi-cabang skala enterprise belum termasuk dalam cakupan MVP 1.0.
- Notifikasi WhatsApp otomatis belum termasuk dalam cakupan MVP 1.0.
- Akuntansi, laporan pajak, dan ledger keuangan penuh belum termasuk dalam cakupan MVP 1.0.

## 3. AI System Requirements

### Tool Requirements

MVP 1.0 tidak membutuhkan fitur khusus berbasis AI berdasarkan dokumen sumber yang tersedia.

Kebutuhan alat dan layanan non-AI:

- Frontend aplikasi web untuk alur kerja owner, admin, dan tentor.
- Backend API untuk autentikasi, otorisasi, aturan bisnis, dan penyimpanan data.
- Database relasional untuk menyimpan data operasional seperti user, siswa, tentor, program, mata pelajaran, ruangan, kelompok belajar, jadwal, presensi, invoice, penggajian, dan laporan perkembangan.
- Layanan pengiriman email untuk mengirim laporan perkembangan belajar ke orang tua.
- Layanan atau library pembuatan PDF untuk slip gaji tentor dan kemungkinan output invoice.

### Evaluation Strategy

Karena MVP 1.0 tidak menggunakan AI, evaluasi difokuskan pada kebenaran alur kerja, keandalan operasional, dan integritas data.

Kriteria evaluasi:

- Validasi bentrok jadwal dapat menangkap bentrok tentor dan ruangan pada skenario pengujian.
- Pembuatan invoice mencakup seluruh siswa aktif dan mengecualikan siswa nonaktif.
- Perhitungan gaji sesuai dengan data presensi dan tarif tentor yang dikonfigurasi.
- Email laporan perkembangan dikirim ke alamat email orang tua yang tepat dengan kolom laporan yang lengkap.
- Kontrol akses berbasis peran mencegah akses tidak sah antara akun owner, admin, dan tentor.

Evaluasi AI untuk rekomendasi, pembuatan draft laporan otomatis, atau ringkasan analitik masih perlu ditentukan jika fitur AI ditambahkan pada versi berikutnya.

## 4. Technical Specifications

### Architecture Overview

BimbelKit sebaiknya diimplementasikan sebagai aplikasi web multi-role dengan backend dan database terpusat.

Rekomendasi arsitektur tingkat tinggi:

- Antarmuka aplikasi web menangani pengalaman pengguna yang sudah login untuk owner, admin, dan tentor.
- API backend mengelola autentikasi, otorisasi berbasis peran, aturan bisnis, dan integrasi.
- Database menyimpan master data dan data transaksi operasional.
- Proses terjadwal membuat invoice SPP bulanan pada periode penagihan yang sudah dikonfigurasi.
- Layanan email mengirim laporan perkembangan belajar kepada orang tua.
- Layanan PDF membuat slip gaji tentor.

Alur data utama:

1. Owner atau admin mengatur identitas bimbel.
2. Admin membuat master data: siswa, tentor, program, mata pelajaran, dan ruangan.
3. Admin membuat kelompok belajar dan jadwal.
4. Sistem memvalidasi bentrok tentor dan ruangan sebelum jadwal disimpan.
5. Tentor melihat jadwal yang ditugaskan dan menyimpan presensi.
6. Presensi menjadi sumber data untuk metrik dashboard, perhitungan gaji, dan kehadiran pada laporan perkembangan.
7. Sistem membuat invoice bulanan untuk siswa aktif.
8. Admin memperbarui status pembayaran invoice.
9. Admin memproses gaji tentor berdasarkan data presensi.
10. Tentor membuat laporan perkembangan bulanan.
11. Sistem mengirim email laporan perkembangan kepada orang tua.

### Recommended Tech Stack

Stack berikut direkomendasikan untuk MVP 1.0 karena pengembangan saat ini berfokus pada aplikasi web berbasis browser. Kebutuhan utama BimbelKit adalah aplikasi web multi-role, CRUD operasional, validasi jadwal, invoice otomatis, penggajian, email, PDF, dan isolasi data antar bimbel.

#### Frontend

- React Vite dengan TypeScript untuk membangun dashboard web owner, admin, dan tentor.
- React sebagai basis komponen UI.
- Tailwind CSS untuk styling yang cepat, konsisten, dan mudah dirawat.
- shadcn/ui atau komponen internal berbasis Radix UI untuk form, dialog, tabel, dropdown, tab, dan komponen dashboard.
- React Hook Form untuk form kompleks seperti data siswa, kelompok belajar, presensi, invoice, dan laporan perkembangan.
- Zod untuk validasi data form di frontend dan backend agar aturan validasi tetap konsisten.
- TanStack Table untuk tabel data yang membutuhkan filter, sorting, pagination, dan tampilan daftar operasional.
- TanStack Query untuk data fetching, caching, sinkronisasi state server, dan invalidasi data setelah operasi tambah, ubah, atau hapus.
- React Router untuk routing halaman dashboard, master data, presensi, invoice, penggajian, laporan, dan pengaturan.

#### Backend

- NestJS dengan TypeScript sebagai backend utama.
- REST API digunakan sebagai kontrak komunikasi antara React Vite dan NestJS.
- Struktur backend dibagi menjadi module domain, seperti Auth, User, Student, Tutor, Program, Subject, Room, Study Group, Schedule, Attendance, Invoice, Payroll, Report, dan Settings.
- Validasi request menggunakan class-validator dan class-transformer agar payload API konsisten.
- Passport.js dan JWT digunakan untuk autentikasi berbasis token.
- Guard dan decorator NestJS digunakan untuk membatasi akses berdasarkan role Owner, Admin, dan Tentor.
- Swagger atau OpenAPI digunakan untuk dokumentasi endpoint backend.

Rekomendasi MVP: gunakan arsitektur frontend dan backend terpisah sejak awal, dengan React Vite sebagai frontend web dan NestJS sebagai backend API. Pendekatan ini membuat batas aplikasi lebih jelas, memudahkan testing backend, dan memberi ruang jika nanti web dapat diintegrasikan dengan platform lain.

#### Database and ORM

- MySQL sebagai database utama karena kebutuhan BimbelKit didominasi data relasional seperti siswa, tentor, kelompok belajar, jadwal, presensi, invoice, payroll, dan laporan perkembangan.
- Prisma ORM direkomendasikan untuk schema, migration, query type-safe, dan pemodelan relasi MySQL.
- Alternatif ORM adalah TypeORM jika tim ingin mengikuti pola yang umum digunakan pada ekosistem NestJS, tetapi Prisma lebih direkomendasikan untuk produktivitas dan type safety.
- Soft delete atau status nonaktif untuk data penting seperti siswa, tentor, program, dan ruangan agar riwayat operasional tidak rusak.
- Unique constraint perlu diterapkan pada data sensitif terhadap duplikasi, seperti invoice per siswa per periode dan jadwal yang sudah divalidasi.
- Index database perlu disiapkan untuk pencarian siswa, filter invoice, filter laporan, jadwal per tentor, dan data per tenant.

#### Authentication and Authorization

- Autentikasi email dan password dikelola oleh backend NestJS.
- Password disimpan menggunakan hashing yang aman, misalnya bcrypt atau argon2.
- JWT access token dan refresh token digunakan untuk menjaga sesi login.
- Refresh token sebaiknya disimpan melalui HTTP-only cookie agar lebih aman pada aplikasi web.
- Role-based access control dengan role Owner, Admin, dan Tentor.
- Tenant scoping wajib diterapkan pada seluruh query agar data antar bimbel tidak tercampur.
- Session berbasis HTTP-only cookie direkomendasikan untuk aplikasi web dashboard.

#### File Storage

- Cloudflare R2, Amazon S3, atau S3-compatible storage untuk menyimpan logo bimbel dan file PDF.
- File upload perlu membatasi ukuran file, tipe file, dan akses berdasarkan tenant.
- Logo bimbel harus disimpan sebagai aset yang dapat dipakai ulang pada invoice, email, dashboard, dan laporan.

#### Email Service

- Resend, SendGrid, atau Amazon SES untuk pengiriman email laporan perkembangan belajar.
- Template email perlu mendukung identitas bimbel, logo, nama siswa, bulan, kehadiran, materi, progres belajar, hal yang perlu ditingkatkan, dan catatan tentor.
- Sistem perlu menyimpan status pengiriman email agar admin dapat melihat kegagalan dan melakukan kirim ulang.

#### PDF Generation

- React PDF, Puppeteer, atau Playwright PDF untuk membuat slip gaji dalam format PDF.
- Template PDF slip gaji harus mengambil data dari payroll snapshot agar hasil unduhan tetap konsisten walaupun data presensi berubah setelah gaji dibayar.
- Output invoice PDF dapat ditambahkan pada versi berikutnya, tetapi struktur generator PDF sebaiknya dibuat reusable sejak MVP.

#### Background Jobs and Scheduler

- NestJS Schedule, BullMQ, atau worker sederhana untuk menjalankan pembuatan invoice bulanan.
- Job pembuatan invoice harus idempotent agar tidak membuat invoice ganda jika proses dijalankan ulang.
- Job pengiriman email perlu mendukung retry saat provider email gagal sementara.

#### Deployment and Infrastructure

- Frontend React Vite dapat dibuild menjadi static files dan dideploy melalui Nginx, Cloudflare Pages, Netlify, atau layanan static hosting lain.
- Backend NestJS dapat dideploy sebagai Node.js service menggunakan Docker pada VPS, Railway, Render, Fly.io, atau cloud provider lain.
- MySQL produksi dapat menggunakan managed database seperti PlanetScale, Aiven, Railway MySQL, Amazon RDS, atau MySQL server terkelola di VPS.
- Cloudflare R2 atau Amazon S3 dapat digunakan untuk penyimpanan file.
- Environment variable harus dipisahkan antara development, staging, dan production.
- CI/CD perlu menjalankan lint, typecheck, test, dan migration check sebelum deployment produksi.

#### Observability and Monitoring

- Sentry untuk error tracking frontend dan backend.
- Log terstruktur untuk aktivitas penting seperti login, pembuatan invoice, perubahan status pembayaran, proses payroll, dan pengiriman laporan.
- Monitoring uptime sederhana untuk endpoint utama aplikasi.
- Audit log untuk aksi sensitif seperti perubahan invoice, perubahan payroll, edit laporan, dan perubahan pengaturan bimbel.

#### Testing and Quality

- Vitest atau Jest untuk unit test business rules seperti bentrok jadwal, invoice bulanan, dan payroll.
- Playwright untuk end-to-end test alur penting seperti login admin, membuat kelompok belajar, mengisi presensi, membuat invoice, dan mengirim laporan.
- Testing Library untuk test komponen form dan dashboard.
- Seed data lokal untuk mensimulasikan bimbel kecil, bimbel menengah, beberapa tentor, beberapa kelompok belajar, dan invoice lintas bulan.

#### Web Focus

- Fokus pengembangan saat ini adalah aplikasi web berbasis React Vite.
- Tampilan web harus responsif agar tetap nyaman digunakan pada laptop, tablet, dan browser mobile.
- Pengalaman tentor di MVP cukup melalui web responsif untuk melihat jadwal, mengisi presensi, melihat slip gaji, dan membuat laporan perkembangan.
- Aplikasi mobile native tidak menjadi bagian dari stack MVP.

### Functional Modules

#### Authentication and Authorization

- User dapat login sesuai role yang diberikan.
- Role yang didukung adalah Owner, Admin, dan Tentor.
- Owner memiliki akses penuh ke seluruh sistem.
- Admin mengelola fitur operasional.
- Tentor memiliki akses terbatas ke jadwal yang ditugaskan, presensi, laporan perkembangan, dan slip gaji.

#### Dashboard Module

- Mengagregasi metrik operasional dari invoice, penggajian, siswa, tentor, kelompok belajar, program, jadwal, presensi, dan laporan.
- Memberikan visibilitas real-time atau mendekati real-time untuk owner dan admin.

#### Master Data Module

- Mengelola data siswa.
- Mengelola data tentor.
- Mengelola program belajar kustom.
- Mengelola mata pelajaran.
- Mengelola ruangan.

#### Study Group and Schedule Module

- Membuat kelompok belajar.
- Menetapkan program, mata pelajaran, tentor, ruangan, hari, jam, dan siswa.
- Memvalidasi bentrok tentor.
- Memvalidasi bentrok ruangan.
- Menampilkan notifikasi saat terjadi bentrok.

#### Attendance Module

- Menampilkan jadwal mengajar yang ditugaskan kepada tentor.
- Mencatat presensi siswa per sesi kelas.
- Mendukung status presensi: Hadir, Izin, Sakit, Alpha.
- Mengirim data presensi yang sudah disimpan ke dashboard admin.
- Menyediakan data presensi sebagai sumber untuk penggajian dan laporan perkembangan.

#### Invoice Module

- Membuat invoice SPP bulanan secara otomatis untuk siswa aktif.
- Mendukung pembaruan status pembayaran.
- Menampilkan daftar invoice belum dibayar dan terlambat.

#### Tutor Payroll Module

- Menghitung gaji dari jumlah sesi mengajar dan tarif tentor.
- Memungkinkan penyesuaian tarif saat proses penggajian.
- Menyimpan riwayat pembayaran.
- Membuat slip gaji PDF yang dapat diunduh.
- Mengirim atau menampilkan slip gaji pada akun tentor.

#### Learning Progress Report Module

- Memungkinkan tentor membuat laporan bulanan untuk siswa.
- Mengambil data kehadiran secara otomatis.
- Menyimpan materi yang dipelajari, perkembangan belajar, hal yang perlu ditingkatkan, dan catatan tentor.
- Memungkinkan admin meninjau, memfilter, mengedit secara opsional, dan mengirim ulang email.
- Mengirim email laporan perkembangan kepada orang tua.

#### Bimbel Settings Module

- Menyimpan logo, nama bimbel, alamat, nomor WhatsApp, email, website opsional, warna utama aplikasi, dan nomor rekening.
- Menerapkan identitas dan branding pada dashboard, invoice, email perkembangan belajar, dan laporan.

### Suggested Data Model

#### Core Entities

- Pelanggan atau Tenant
- User
- Role
- Siswa
- Kontak Orang Tua
- Tentor
- Program
- Mata Pelajaran
- Ruangan
- Kelompok Belajar
- Jadwal
- Sesi Presensi
- Catatan Presensi
- Invoice
- Status Pembayaran Invoice
- Periode Penggajian
- Item Penggajian
- Slip Gaji
- Laporan Perkembangan Belajar
- Pengaturan Bimbel

#### Key Relationships

- Satu pelanggan memiliki banyak user, siswa, tentor, program, mata pelajaran, ruangan, kelompok belajar, invoice, data penggajian, dan laporan.
- Satu kelompok belajar terhubung dengan satu program, satu mata pelajaran, satu tentor, satu ruangan, dan banyak siswa.
- Satu jadwal terhubung dengan satu kelompok belajar.
- Satu sesi presensi terhubung dengan satu jadwal atau satu kelompok belajar.
- Satu catatan presensi terhubung dengan satu sesi presensi dan satu siswa.
- Satu invoice terhubung dengan satu siswa dan satu periode penagihan.
- Satu item penggajian terhubung dengan satu tentor dan satu periode penggajian.
- Satu laporan perkembangan belajar terhubung dengan satu siswa, satu tentor, satu bulan, dan secara opsional satu kelompok belajar.

### Integration Points

- Layanan email untuk pengiriman laporan perkembangan kepada orang tua.
- Pembuatan PDF untuk unduhan slip gaji.
- Proses terjadwal atau cron worker untuk pembuatan invoice SPP bulanan.
- Penyedia autentikasi atau sistem autentikasi internal.
- Penyimpanan file untuk aset logo bimbel.

Payment gateway, WhatsApp API, dan integrasi akuntansi eksternal belum termasuk dalam MVP 1.0 kecuali ditambahkan melalui konfirmasi cakupan berikutnya.

### Security & Privacy

- Setiap pelanggan hanya boleh mengakses data bimbelnya sendiri.
- Kontrol akses berbasis peran harus diterapkan pada setiap endpoint backend.
- Tentor tidak boleh mengakses kelas, siswa, penggajian, atau laporan di luar penugasannya.
- Email orang tua, rekening tentor, nomor HP, dan data siswa harus diperlakukan sebagai data pribadi.
- Password harus di-hash menggunakan algoritma hashing yang aman jika sistem memakai autentikasi internal.
- Upload file logo bimbel harus memvalidasi tipe dan ukuran file.
- Kolom audit perlu disimpan untuk data penting: dibuat oleh, dibuat pada, diubah oleh, dan diubah pada.
- Riwayat pembayaran dan penggajian tidak boleh dihapus permanen setelah ditandai sudah dibayar.

### Business Rules

- Hanya siswa aktif yang menerima invoice SPP bulanan baru.
- Pembuatan invoice berjalan pada periode awal bulan yang sudah dikonfigurasi.
- Jadwal tidak dapat disimpan jika tentor yang sama memiliki jadwal dengan hari dan jam yang tumpang tindih.
- Jadwal tidak dapat disimpan jika ruangan yang sama memiliki jadwal dengan hari dan jam yang tumpang tindih.
- Presensi harus disimpan sebelum dapat dihitung dalam penggajian.
- Perhitungan gaji tentor menggunakan data presensi yang dikelompokkan berdasarkan sesi mengajar.
- Admin dapat menyesuaikan tarif tentor saat proses penggajian.
- Kehadiran pada laporan perkembangan diambil dari data presensi.
- Email laporan perkembangan dikirim setelah laporan disimpan.

### Platform and Technical Constraints

- Jenis produk: aplikasi web.
- MVP harus memprioritaskan alur kerja yang sederhana dan mudah dipahami oleh owner dan admin bimbel.
- Stack teknologi rekomendasi untuk MVP adalah React Vite, TypeScript, NestJS, MySQL, Prisma ORM, Tailwind CSS, layanan email, storage file, PDF generator, dan job scheduler.
- Lingkungan penerapan direkomendasikan menggunakan static hosting untuk frontend React Vite, Node.js service atau Docker untuk backend NestJS, managed MySQL untuk database, dan storage berbasis S3-compatible untuk file.
- SLA, target uptime, dan kebijakan backup masih perlu ditentukan.

## 5. Risks & Roadmap

### Phased Rollout

#### MVP 1.0

Cakupan yang termasuk:

- Dashboard
- Data siswa
- Data tentor
- Program belajar
- Mata pelajaran
- Ruangan
- Kelompok belajar
- Jadwal
- Presensi
- Invoice SPP
- Penggajian tentor
- Laporan perkembangan belajar
- Pengaturan branding bimbel

Tujuan utama:

- Menghadirkan sistem operasional yang sederhana dan dapat digunakan oleh bimbel kecil hingga menengah.

#### Version 1.1

Potensi cakupan berikutnya:

- Arsip laporan untuk orang tua.
- Output invoice dalam format PDF.
- Alur pengingat pembayaran.
- Integrasi notifikasi WhatsApp.
- Import data siswa dan tentor dari spreadsheet.
- Filter dashboard yang lebih detail berdasarkan program, tentor, dan bulan.

#### Version 2.0

Potensi cakupan masa depan:

- Optimasi pengalaman web responsif untuk tentor.
- Manajemen multi-cabang.
- Payment gateway online.
- Analitik performa akademik.
- Portal siswa.
- Bantuan AI untuk membuat draft laporan perkembangan.
- Laporan keuangan dan akuntansi lanjutan.

### Technical Risks

#### Schedule Conflict Edge Cases

Risiko: Validasi bentrok jadwal dapat melewatkan overlap jika rentang waktu, format hari, atau jadwal yang diedit tidak ditangani secara konsisten.  
Mitigasi: Terapkan validasi bentrok secara terpusat di backend dan lengkapi dengan unit test untuk overlap penuh, overlap sebagian, jam yang bersebelahan, dan skenario update.

#### Invoice Generation Accuracy

Risiko: Otomatisasi invoice bulanan dapat membuat invoice ganda atau melewatkan siswa aktif.  
Mitigasi: Gunakan unique constraint berdasarkan siswa dan periode tagihan, serta scheduled job yang idempotent.

#### Payroll Calculation Integrity

Risiko: Penggajian dapat menjadi tidak akurat jika presensi diubah setelah gaji diproses.  
Mitigasi: Bekukan data sumber penggajian saat gaji ditandai sudah dibayar, atau simpan snapshot penggajian untuk kebutuhan audit.

#### Email Delivery Reliability

Risiko: Email laporan perkembangan dapat gagal terkirim atau masuk ke spam.  
Mitigasi: Simpan status pengiriman email, sediakan aksi kirim ulang, dan gunakan penyedia email yang reputasinya baik dengan sender domain yang sudah diverifikasi.

#### Multi-Tenant Data Isolation

Risiko: Data dari satu bimbel dapat terlihat oleh pelanggan lain jika pembatasan tenant tidak konsisten.  
Mitigasi: Wajibkan scope tenant atau pelanggan pada setiap query dan terapkan pengujian otorisasi backend.

#### Simplicity vs Feature Creep

Risiko: MVP dapat menjadi terlalu luas dan memperlambat peluncuran jika semua edge case operasional dimasukkan.  
Mitigasi: Pertahankan MVP pada alur kerja yang sudah terdokumentasi dan pindahkan payment gateway, portal orang tua, WhatsApp, dan analitik lanjutan ke versi berikutnya.

### Open Questions

- Apa target waktu peluncuran MVP 1.0?
- Apakah BimbelKit akan memakai model multi-tenant SaaS sejak MVP?
- Apakah owner dan admin bisa dibuat lebih dari satu akun per bimbel?
- Apakah invoice SPP memiliki nominal tetap per siswa, per program, atau bisa berbeda per siswa?
- Apakah laporan perkembangan perlu disimpan sebagai PDF, HTML email, atau cukup email berbasis template?
- Apakah presensi bisa diedit setelah disimpan, dan siapa yang berwenang mengeditnya?
- Apakah penggajian dihitung bulanan saja atau mendukung periode kustom?
- Apakah sistem perlu mendukung masa coba, paket harga SaaS, atau penagihan untuk pelanggan BimbelKit?
