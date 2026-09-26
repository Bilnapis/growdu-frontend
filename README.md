# GrowDu Frontend

Dashboard operasional GrowDu yang dibangun dengan React 18, Vite, TypeScript,
React Router, dan TanStack Query.

## Menjalankan project

```bash
npm install
cp .env.example .env.local
npm run dev
```

Di PowerShell, gunakan `Copy-Item .env.example .env.local` untuk menyalin file
environment.

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

