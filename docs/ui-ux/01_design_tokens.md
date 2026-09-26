# Design Tokens

Token desain ini menjadi fondasi visual GrowDu. Semua komponen sebaiknya memakai token, bukan warna hardcoded, agar branding bimbel bisa dikonfigurasi dari pengaturan.

## Color System

### Brand Palette

Warna brand default dibuat profesional, edukatif, dan tidak terlalu dominan satu hue.

| Token | Hex | Usage |
| --- | --- | --- |
| `brand.50` | `#EEF7FF` | Light selected row, subtle info background |
| `brand.100` | `#D9ECFF` | Active nav background |
| `brand.200` | `#B8DDFF` | Soft border for selected item |
| `brand.300` | `#84C5FF` | Focus ring, chart accent |
| `brand.400` | `#49A6F2` | Hover primary |
| `brand.500` | `#1F8FE5` | Primary action |
| `brand.600` | `#1177C7` | Primary pressed |
| `brand.700` | `#0E5F9E` | Link text on light bg |
| `brand.800` | `#0F4F81` | Strong brand text |
| `brand.900` | `#123F63` | Dark brand surface |

### Neutral Palette

| Token | Hex | Usage |
| --- | --- | --- |
| `neutral.0` | `#FFFFFF` | App surface |
| `neutral.50` | `#F7F9FC` | Page background |
| `neutral.100` | `#EEF2F7` | Subtle section background |
| `neutral.200` | `#E2E8F0` | Border |
| `neutral.300` | `#CBD5E1` | Strong border, disabled stroke |
| `neutral.400` | `#94A3B8` | Placeholder, muted icon |
| `neutral.500` | `#64748B` | Secondary text |
| `neutral.600` | `#475569` | Body muted |
| `neutral.700` | `#334155` | Body text |
| `neutral.800` | `#1E293B` | Heading |
| `neutral.900` | `#0F172A` | Primary text |

### Semantic Palette

| Semantic | Bg | Text | Border | Usage |
| --- | --- | --- | --- | --- |
| Success | `#ECFDF3` | `#027A48` | `#ABEFC6` | Lunas, hadir, aktif, terkirim |
| Warning | `#FFFAEB` | `#B54708` | `#FEDF89` | Belum bayar, laporan belum lengkap |
| Danger | `#FEF3F2` | `#B42318` | `#FECDCA` | Terlambat, alpha, gagal, hapus |
| Info | `#EFF8FF` | `#175CD3` | `#B2DDFF` | Jadwal, sistem, pending info |
| Paid | `#EEF4FF` | `#3538CD` | `#C7D7FE` | Payroll sudah dibayar |
| Neutral | `#F8FAFC` | `#475569` | `#E2E8F0` | Draft, nonaktif, no data |

### Business Status Mapping

| Domain | Status | Token |
| --- | --- | --- |
| Siswa/Tentor | Aktif | Success |
| Siswa/Tentor | Nonaktif | Neutral |
| Invoice | Lunas | Success |
| Invoice | Belum Bayar | Warning |
| Invoice | Terlambat | Danger |
| Presensi | Hadir | Success |
| Presensi | Izin | Info |
| Presensi | Sakit | Warning |
| Presensi | Alpha | Danger |
| Payroll | Draft | Neutral |
| Payroll | Siap Dibayar | Warning |
| Payroll | Sudah Dibayar | Paid |
| Laporan | Belum Dibuat | Warning |
| Laporan | Draft | Neutral |
| Laporan | Terkirim | Success |
| Laporan | Gagal Terkirim | Danger |

## Configurable Tenant Branding

Pengaturan bimbel memiliki `primaryColor`. Warna ini boleh mengganti `brand.500`, tetapi sistem tetap perlu menghasilkan variasi hover, focus, dan selected state.

Rekomendasi:

- Simpan warna utama tenant sebagai hex.
- Gunakan generated shades untuk primary action.
- Jangan gunakan warna tenant untuk semua area; tetap gunakan neutral dan semantic palette agar UI mudah dibaca.
- Jika warna tenant terlalu terang, fallback teks tombol harus otomatis hitam atau sistem memakai shade yang lebih gelap.

## Typography

Gunakan font sans-serif modern yang mudah dibaca di dashboard.

Rekomendasi font:

- Primary: `Inter`
- Fallback: `ui-sans-serif`, `system-ui`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `sans-serif`

| Token | Size | Line Height | Weight | Usage |
| --- | --- | --- | --- | --- |
| `display.sm` | 30px | 38px | 700 | Dashboard main number, modal title khusus |
| `heading.lg` | 24px | 32px | 700 | Page title |
| `heading.md` | 20px | 28px | 700 | Section title |
| `heading.sm` | 18px | 28px | 600 | Card title, drawer section |
| `body.lg` | 16px | 24px | 400 | Important body text |
| `body.md` | 14px | 22px | 400 | Default UI text |
| `body.sm` | 13px | 20px | 400 | Table secondary text |
| `caption` | 12px | 18px | 500 | Badge, helper, metadata |

Rules:

- Jangan gunakan font scaling berdasarkan viewport width.
- Letter spacing default `0`.
- Metric number boleh lebih besar, tetapi tetap harus muat di card.

## Spacing

Gunakan base 4px.

| Token | Value | Usage |
| --- | --- | --- |
| `space.1` | 4px | Icon gap, tight stack |
| `space.2` | 8px | Button icon gap, compact padding |
| `space.3` | 12px | Field gap, badge padding |
| `space.4` | 16px | Card padding mobile, form row gap |
| `space.5` | 20px | Tablet padding |
| `space.6` | 24px | Desktop page padding, section gap |
| `space.8` | 32px | Large section gap |
| `space.10` | 40px | Dashboard group gap |

## Radius

Cards dan controls harus modern tetapi tidak terlalu bulat.

| Token | Value | Usage |
| --- | --- | --- |
| `radius.xs` | 4px | Badge, table chips |
| `radius.sm` | 6px | Input, button |
| `radius.md` | 8px | Card, dialog, dropdown |
| `radius.lg` | 12px | Mobile sheet, larger panel only |

Rule: card default maksimum 8px kecuali mobile bottom sheet.

## Borders And Shadows

| Token | Value | Usage |
| --- | --- | --- |
| `border.default` | `1px solid #E2E8F0` | Cards, tables, inputs |
| `border.strong` | `1px solid #CBD5E1` | Focused group, table header |
| `shadow.sm` | `0 1px 2px rgba(15, 23, 42, 0.06)` | Dropdown, card subtle |
| `shadow.md` | `0 8px 24px rgba(15, 23, 42, 0.10)` | Dialog, popover |

Jangan gunakan shadow besar untuk layout utama. Gunakan border dan background untuk memisahkan area.

## Icon System

Rekomendasi icon: `lucide-react`.

| Domain | Suggested Icons |
| --- | --- |
| Dashboard | `LayoutDashboard`, `Activity` |
| Siswa | `Users` |
| Tentor | `GraduationCap` |
| Program | `BookOpen` |
| Mata Pelajaran | `Library` |
| Ruangan | `DoorOpen` |
| Jadwal | `CalendarDays`, `Clock` |
| Presensi | `ClipboardCheck` |
| Invoice | `ReceiptText` |
| Penggajian | `WalletCards` |
| Laporan | `FileText`, `Send` |
| Pengaturan | `Settings` |
| Alert | `AlertTriangle`, `CircleAlert` |
| Success | `CheckCircle2` |
| Download | `Download` |

Icon button harus punya tooltip atau accessible label.

## Motion

Motion harus ringan dan fungsional.

| Token | Value | Usage |
| --- | --- | --- |
| `motion.fast` | 120ms ease-out | Hover, active controls |
| `motion.base` | 180ms ease-out | Dropdown, tabs |
| `motion.slow` | 240ms ease-out | Drawer, modal |

Hindari animasi dekoratif. Gunakan skeleton loading untuk tabel dan metric.

## Chart Colors

Untuk dashboard dan ringkasan:

| Token | Hex | Usage |
| --- | --- | --- |
| `chart.blue` | `#1F8FE5` | Pendapatan, jadwal |
| `chart.green` | `#12B76A` | Lunas, hadir |
| `chart.amber` | `#F79009` | Belum bayar, pending |
| `chart.red` | `#F04438` | Terlambat, alpha |
| `chart.indigo` | `#6172F3` | Payroll |
| `chart.teal` | `#15B8A6` | Program/kelompok |

## Tailwind Token Draft

```ts
// tailwind.config.ts excerpt
export const bimbelKitTheme = {
  colors: {
    brand: {
      50: "#EEF7FF",
      100: "#D9ECFF",
      200: "#B8DDFF",
      300: "#84C5FF",
      400: "#49A6F2",
      500: "#1F8FE5",
      600: "#1177C7",
      700: "#0E5F9E",
      800: "#0F4F81",
      900: "#123F63",
    },
    neutral: {
      0: "#FFFFFF",
      50: "#F7F9FC",
      100: "#EEF2F7",
      200: "#E2E8F0",
      300: "#CBD5E1",
      400: "#94A3B8",
      500: "#64748B",
      600: "#475569",
      700: "#334155",
      800: "#1E293B",
      900: "#0F172A",
    },
  },
  borderRadius: {
    xs: "4px",
    sm: "6px",
    md: "8px",
    lg: "12px",
  },
};
```

