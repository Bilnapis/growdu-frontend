# AGENTS.md — GrowDu Frontend

Panduan ini berlaku untuk seluruh perubahan di `growdu-frontend/`. Baca juga
`../AGENTS.md`; bila ada aturan yang lebih spesifik di file ini, aturan file ini
yang berlaku untuk frontend. Requirement pekerjaan aktif dan aksesibilitas
pengguna tetap menjadi prioritas utama.

## 1. Tanggung Jawab Frontend

Frontend GrowDu bertanggung jawab atas:

- Pengalaman pengguna dan tampilan dashboard web.
- Routing client-side dan composition provider aplikasi.
- Konsumsi REST API GrowDu.
- Pengelolaan server state melalui TanStack Query.
- State interaksi UI, validasi form untuk feedback cepat, dan aksesibilitas.
- Responsive layout untuk layar sempit, tablet, dan desktop.

Frontend bukan pemilik business rule, permission, atau validasi keamanan.
Validasi client-side melengkapi, tetapi tidak menggantikan validasi backend.

## 2. Stack dan Konvensi Runtime

- React 18 dengan function component dan hooks.
- TypeScript strict dan JSX transform `react-jsx`.
- Vite sebagai dev server dan bundler.
- React Router untuk routing.
- TanStack Query untuk server state.
- ESLint dengan type-aware TypeScript rules dan React Hooks rules.
- Alias `@/*` menunjuk ke `src/*`.

Ikuti style source yang sudah ada: single quote, tanpa semicolon, dan trailing
comma pada struktur multiline. Jangan menambah formatter, UI framework, global
state library, form library, atau test runner tanpa kebutuhan serta persetujuan
yang jelas.

## 3. Struktur Source

Struktur dasar yang sudah tersedia:

```text
src/
├── app/          # Router dan provider global aplikasi
├── components/   # Komponen UI reusable lintas domain
├── hooks/        # Custom hook reusable lintas domain
├── lib/          # API client, query client, formatter, dan utility
├── pages/        # Entry component untuk route
└── styles/       # Design tokens serta global style
```

Untuk domain baru, gunakan struktur feature-first:

```text
src/features/<feature>/
├── api/                    # Request function dan kontrak API feature
├── components/             # Komponen khusus feature
├── hooks/                  # Query, mutation, dan UI hooks feature
├── schemas/                # Validasi client jika diperlukan
├── types/                  # Tipe khusus feature jika tidak colocated
└── utils/                  # Utility murni khusus feature
```

- Page harus tetap tipis: menyusun layout, feature, dan route-level state.
- Colocate kode dengan feature pemiliknya.
- Pindahkan komponen/hook ke folder bersama hanya jika sudah benar-benar dipakai
  lebih dari satu feature.
- Jangan membuat barrel file besar. Import langsung dari file agar dependency
  dan bundle tetap mudah dianalisis.
- Gunakan alias `@/` untuk import lintas folder dan relative import untuk file
  yang sangat berdekatan dalam feature yang sama.

## 4. Component dan Hooks

### Component

- Gunakan function component dengan props yang memiliki tipe eksplisit.
- Komponen presentasional menerima data dan callback; jangan melakukan request
  tersembunyi di komponen UI generik.
- Jangan mendefinisikan component di dalam component lain karena identitasnya
  berubah pada setiap render.
- Gunakan composition daripada menambah banyak boolean prop untuk setiap variasi.
- Pertahankan props sekecil dan sestabil yang masuk akal. Jangan mengirim seluruh
  response API bila component hanya memerlukan beberapa field.
- Gunakan controlled atau uncontrolled form secara konsisten pada satu form.
- Jangan menyimpan derived value ke state. Hitung dari props/state saat render.

### Hooks

- Custom hook harus memiliki tujuan yang jelas dan diawali `use`.
- Hook tidak boleh dipanggil secara kondisional.
- Dependency `useEffect`, `useMemo`, dan `useCallback` harus lengkap dan tidak
  diakali dengan menonaktifkan lint rule.
- Logic akibat interaksi pengguna diletakkan di event handler, bukan `useEffect`.
- Gunakan functional state update ketika nilai berikutnya bergantung pada nilai
  sebelumnya.
- Gunakan `useRef` untuk nilai transient yang tidak memengaruhi render.
- Jangan memakai memoization secara default. Tambahkan hanya untuk komputasi
  mahal atau referential stability yang memang dibutuhkan.

## 5. Routing dan Page

- Daftarkan route di `src/app/router.tsx` atau pecah konfigurasi secara modular
  jika jumlah route sudah besar.
- Setiap route harus memiliki loading, error, not-found, dan authorization state
  yang sesuai kebutuhan.
- Gunakan route-level lazy loading untuk page/dependency besar bila berdampak
  nyata pada initial bundle.
- Redirect di frontend bukan mekanisme authorization. Backend tetap harus
  memverifikasi permission.
- Jangan hard-code URL navigasi di banyak tempat jika route memiliki parameter
  atau dipakai lintas feature; buat helper yang typed dan terfokus.
- Page tidak boleh melakukan transformasi data kompleks langsung dalam JSX.

## 6. API dan TanStack Query

### Transport API

- Base URL dibaca dari `env.apiBaseUrl` di `src/lib/env.ts`.
- Jangan hard-code hostname atau port API di component, page, atau feature.
- Pusatkan transport HTTP, parsing response, auth header, dan normalisasi error di
  `src/lib/`.
- Periksa `response.ok` sebelum memakai payload dan bedakan network error dari
  application error.
- Gunakan `AbortSignal` jika request dapat dibatalkan oleh query lifecycle.
- Jangan menampilkan raw stack trace atau pesan internal backend kepada user.
- Tipe request dan response harus mengikuti Swagger backend. Jangan menggunakan
  assertion tipe untuk menyembunyikan ketidaksesuaian data runtime.

### Query

- Semua server state memakai TanStack Query, bukan disalin ke global/local state.
- Query key berbentuk array, deterministik, dan mencakup seluruh filter yang
  memengaruhi hasil.
- Letakkan query option/hook dekat feature pemiliknya.
- Gunakan `enabled` untuk dependency yang memang wajib tersedia sebelum request.
- Jalankan query independen secara paralel; hindari waterfall yang tidak perlu.
- Gunakan `select` untuk transformasi terfokus dan memoized oleh query lifecycle.
- Pilih `staleTime` sesuai sifat data. Jangan mengubah global query defaults untuk
  memperbaiki kebutuhan satu endpoint.

### Mutation

- Tangani pending, success, error, dan retry behavior dengan sengaja.
- Cegah double submit pada operasi non-idempotent.
- Invalidasi atau update cache hanya pada query yang terdampak.
- Gunakan optimistic update hanya jika rollback dan conflict behavior jelas.
- Jangan menganggap mutation berhasil sebelum server mengonfirmasi.

## 7. State Management

Pilih state berdasarkan pemiliknya:

1. Server state: TanStack Query.
2. URL state: path, search params, dan route params.
3. Local UI state: `useState`/`useReducer` di owner terdekat.
4. App-wide client state: Context hanya untuk data yang benar-benar lintas pohon
   seperti theme atau session facade.

Jangan menambah global state library hanya untuk menghindari prop passing pendek.
Jika state sangat sering berubah, pertimbangkan memisahkan context agar tidak
memicu render seluruh aplikasi.

## 8. TypeScript dan Data Modeling

- `any`, non-null assertion, dan unsafe type assertion harus dihindari.
- Gunakan `unknown` untuk input eksternal lalu lakukan narrowing/validation.
- Model state yang saling eksklusif dengan discriminated union bila sesuai.
- Jangan menduplikasi tipe domain yang sama di banyak feature.
- Tipe API menggambarkan kontrak transport; tipe view model menggambarkan
  kebutuhan tampilan. Pisahkan bila bentuk dan lifecycle-nya berbeda.
- Tangani `null`, `undefined`, empty collection, dan optional field secara
  eksplisit.
- Jangan melemahkan compiler option atau lint rule untuk mengatasi satu error.

## 9. Styling, Responsive UI, dan Accessibility

- Gunakan design token di `src/styles/tokens.css` untuk warna, spacing, radius,
  shadow, typography, dan motion.
- Hindari hard-coded value berulang. Tambahkan token semantik jika pola sudah
  stabil dan dipakai ulang.
- CSS component/feature harus memiliki scope nama yang jelas dan tidak merusak
  style global.
- Layout harus tetap usable pada viewport sempit tanpa horizontal overflow yang
  tidak disengaja.
- Gunakan semantic HTML sebelum menambah ARIA.
- Setiap input memiliki label; error form terhubung dan dapat dibaca assistive
  technology.
- Elemen interaktif harus dapat digunakan dengan keyboard dan memiliki focus
  indicator yang terlihat.
- Icon-only button wajib memiliki accessible name.
- Jangan menyampaikan status hanya melalui warna.
- Hormati `prefers-reduced-motion` untuk animasi non-esensial.
- Pastikan loading tidak menyebabkan layout shift besar dan sediakan empty state
  yang memberi tindakan selanjutnya.

## 10. Performance

- Hilangkan request waterfall sebelum menambah memoization.
- Lazy-load route atau komponen berat yang tidak dibutuhkan pada initial render.
- Import library secara langsung dan hindari mengimpor seluruh icon/utility set.
- Jangan melakukan filter, sort, atau lookup mahal berulang kali di loop/render;
  gunakan struktur `Map`/`Set` atau memoization bila terukur.
- Untuk daftar panjang, gunakan pagination terlebih dahulu dan virtualization
  bila jumlah node tetap terlalu besar.
- Gunakan passive listener untuk event scroll/touch manual.
- Jangan menaruh data besar atau sensitif di `localStorage`. Jika menyimpan
  preference, beri versi schema dan fallback yang aman.
- Ukur bundle/render/network sebelum dan sesudah optimasi yang material.

## 11. Environment dan Security

- Variable frontend harus berawalan `VITE_` dan dianggap dapat dibaca publik.
- Secret, private key, database credential, dan server token tidak boleh berada
  pada source atau environment frontend.
- Tambahkan variable baru ke `.env.example` dengan nilai contoh aman.
- Normalisasi dan validasi environment melalui `src/lib/env.ts`.
- Hindari `dangerouslySetInnerHTML`. Jika benar-benar dibutuhkan, sanitasi HTML
  dengan solusi yang sesuai dan dokumentasikan sumber kontennya.
- Jangan mengandalkan penyembunyian menu/tombol sebagai authorization.
- Jangan log token, credential, atau data pribadi sensitif ke console.

## 12. Testing dan Verifikasi

Project saat ini belum memiliki script atau dependency test frontend. Jangan
mengklaim automated test berjalan jika infrastrukturnya belum tersedia. Saat
fitur membutuhkan test runner, sepakati dan tambahkan setup secara terpisah agar
scope dependency jelas.

Ketika testing frontend sudah tersedia:

- Test perilaku pengguna, bukan implementation detail.
- Prioritaskan route penting, form, permission state, query success/error, dan
  mutation behavior.
- Mock boundary network, bukan internal component secara berlebihan.
- Gunakan query berbasis role/label pada test UI.
- Hindari snapshot besar sebagai satu-satunya assertion.

Quality gate minimum saat ini, dijalankan dari `growdu-frontend/`:

```bash
npm run typecheck
npm run lint
npm run build
```

Untuk pengembangan lokal:

```bash
npm install
npm run dev
```

## 13. Checklist Selesai

- Kode ditempatkan pada page, feature, component, hook, atau lib yang tepat.
- Server state dikelola TanStack Query dan tidak diduplikasi tanpa alasan.
- Loading, empty, error, unauthorized, dan success state sudah ditangani.
- UI responsif dan dapat digunakan dengan keyboard.
- API base URL serta environment tidak di-hard-code.
- Tidak ada secret, unsafe type assertion, debug log, atau dependency yang tidak
  digunakan.
- Kontrak request/response selaras dengan backend dan Swagger.
- `.env.example`, dokumentasi, dan test diperbarui bila diperlukan.
- Typecheck, lint, dan build berhasil, atau kendala verifikasi dilaporkan dengan
  jelas.
