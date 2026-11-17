# GrowDu Frontend

Dashboard operasional GrowDu yang dibangun dengan React 18, Vite, TypeScript,
React Router, dan TanStack Query.

Untuk deployment Docker production bersama backend dan MySQL, ikuti
[panduan Docker VPS](../growdu-backend/docs/deploy-docker.md).
Image frontend memakai Caddy untuk file statis, reverse proxy API, dan HTTPS.
`VITE_API_BASE_URL` wajib berupa URL HTTPS absolut saat build; Compose production
mengisinya dari domain aplikasi. Perubahan domain memerlukan rebuild image.

## Menjalankan project

```bash
npm install
cp .env.example .env.local
npm run dev
```

Di PowerShell, gunakan `Copy-Item .env.example .env.local` untuk menyalin file
environment.

## Pengaturan bimbel

`/settings` mengarah ke `/settings/bimbel` untuk mengubah logo, nama, kontak,
website, dan alamat. `/settings/theme` menyediakan lima preset, slider hue,
input HEX, dan preview. Owner serta operator berizin `settings` dapat menyimpan.
Tema tersimpan di backend per bimbel dan berlaku pada dashboard serta tentor;
draft warna hanya berlaku di preview sampai penyimpanan berhasil. Data tenant
diambil ulang ketika jendela kembali aktif setelah cache menjadi stale.

Logo menerima PNG/JPEG maksimal 2 MB dengan crop 1:1. Website tanpa protokol
dinormalisasi menjadi HTTPS. Perubahan identitas dan tema dikirim secara
terpisah agar tidak saling menimpa. Route `/settings/users` tetap tersedia.

Deploy migration/backend pengaturan terlebih dahulu sebelum frontend.
Verifikasi UI dilakukan pada 375, 768, 1280, dan 1440 px, termasuk keyboard,
preview warna terang, gagal simpan, refresh, pergantian bimbel, dan dialog crop.

## Perintah

- `npm run dev` — menjalankan development server.
- `npm run typecheck` — memeriksa tipe TypeScript.
- `npm run lint` — menjalankan ESLint.
- `npm run build` — type-check dan membuat production bundle.
- `npm run preview` — meninjau hasil production build.

## Struktur source

```text
src/
├── app/          # Router dan provider tingkat aplikasi
├── components/   # Komponen presentasional reusable
├── hooks/        # Custom hooks dan query hooks
├── lib/          # Client, formatter, dan utility
├── pages/        # Komponen route-level
└── styles/       # Design tokens dan global styles
```

Dokumentasi desain berada di `docs/ui-ux/`. Tambahkan fitur per domain tanpa
menaruh business logic di komponen presentasional.

