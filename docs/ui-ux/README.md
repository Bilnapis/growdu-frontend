# GrowDu UI/UX Design Setup

Dokumen ini adalah paket setup desain untuk implementasi tampilan GrowDu MVP 1.0 berdasarkan `PRD_GrowDu_MVP.md`.

Produk MVP difokuskan sebagai aplikasi web dashboard multi-role untuk owner, admin, dan tentor. Desain harus terasa operasional, rapi, cepat dipindai, dan tidak seperti landing page. Pengguna utama akan memakai aplikasi ini berulang setiap hari untuk mengelola data, jadwal, presensi, pembayaran, payroll, dan laporan perkembangan belajar.

## Struktur Dokumen

- [00 Product Design Brief](00_product_design_brief.md)  
  Arah desain, prinsip UX, persona, information architecture, role-based navigation, dan karakter pengalaman produk.

- [01 Design Tokens](01_design_tokens.md)  
  Warna, tipografi, spacing, radius, shadow, status, chart colors, icon rules, motion, dan mapping token untuk Tailwind.

- [02 Screen Specifications](02_screen_specifications.md)  
  Daftar screen MVP, layout, konten utama, aksi, state, dan detail per role.

- [03 Component System](03_component_system.md)  
  Komponen UI yang diperlukan: app shell, table, form, metric card, schedule view, attendance controls, invoice/payroll/report components, dan feedback components.

- [04 User Flows And States](04_user_flows_and_states.md)  
  Flow utama, validasi, empty/loading/error/success states, accessibility, responsive behavior, microcopy, dan checklist QA UI.

## Prinsip Implementasi Cepat

1. Bangun dari app shell dan navigasi role terlebih dahulu.
2. Gunakan design tokens sejak awal agar branding bimbel bisa berubah tanpa merombak UI.
3. Prioritaskan tabel, form, filter, dan workflow operasional dibanding dekorasi visual.
4. Buat pengalaman tentor nyaman di mobile browser karena tentor kemungkinan mengisi presensi dari HP.
5. Semua status bisnis harus punya warna, label, dan aksi yang konsisten.

## Target Kualitas Visual

GrowDu harus terasa:

- Profesional, bersih, dan dipercaya untuk data operasional.
- Padat namun tidak sesak.
- Mudah dipahami oleh admin non-teknis.
- Responsif untuk desktop, tablet, dan mobile browser.
- Konsisten untuk dashboard, invoice, payroll, presensi, dan laporan.

