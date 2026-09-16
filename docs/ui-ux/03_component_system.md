# Component System

Dokumen ini mendefinisikan komponen UI yang diperlukan untuk membangun BimbelKit MVP.

## Component Principles

- Komponen harus reusable lintas modul operasional.
- Komponen data-heavy harus mendukung loading, empty, error, dan permission states.
- Status bisnis harus memakai satu komponen badge yang sama.
- Form kompleks harus dibagi menjadi section, bukan satu panel panjang tanpa struktur.
- Komponen tentor harus nyaman dipakai di mobile browser.

## App Shell Components

### `AppLayout`

Membungkus halaman setelah login.

Props konseptual:

- `role`
- `navigationItems`
- `tenantBrand`
- `user`
- `children`

Parts:

- `Sidebar`
- `TopBar`
- `MainContent`
- `MobileNav`

Behavior:

- Sidebar expanded di desktop.
- Sidebar collapsed atau drawer di tablet.
- Bottom nav untuk tentor di mobile.

### `SidebarNav`

Item nav:

- Icon.
- Label.
- Active indicator.
- Optional badge count.

Rules:

- Active item memakai `brand.100` background dan `brand.700` text.
- Badge count untuk invoice tertunda atau laporan belum dibuat.

### `TopBar`

Content:

- Page title.
- Optional global search.
- Month selector bila page dashboard/finance.
- User menu.

Mobile:

- Title pendek.
- Menu button.
- User menu dapat masuk drawer.

## Page Structure Components

### `PageHeader`

Usage:

- Title.
- Description singkat.
- Primary action.
- Secondary action menu.

Example:

```tsx
<PageHeader
  title="Data Siswa"
  description="Kelola data siswa aktif dan nonaktif."
  primaryAction={{ label: "Tambah Siswa", icon: Plus }}
/>
```

### `Toolbar`

Usage:

- Search input.
- Filter dropdown.
- Date/month picker.
- View toggle.
- Bulk action.

Behavior:

- Desktop: horizontal.
- Mobile: search full width, filters in sheet.

### `SectionHeader`

Untuk section di form/detail.

Content:

- Title.
- Optional description.
- Optional right action.

## Dashboard Components

### `MetricCard`

Content:

- Label.
- Value.
- Optional icon.
- Optional delta.
- Optional helper text.

Variants:

- Default.
- Success.
- Warning.
- Danger.
- Finance.

Rules:

- Value harus satu baris jika memungkinkan.
- Jangan masukkan chart besar di metric card.

### `AlertQueue`

Menampilkan pekerjaan yang perlu perhatian.

Item:

- Icon status.
- Title.
- Description.
- CTA.
- Severity.

Examples:

- `12 invoice belum dibayar`.
- `8 laporan perkembangan belum dibuat`.
- `Payroll September siap dicek`.

### `TodayScheduleList`

Menampilkan jadwal hari ini.

Item:

- Time.
- Group.
- Subject.
- Tutor.
- Room.
- Student count.
- Attendance status.

## Data Display Components

### `DataTable`

Required features:

- Column header.
- Sorting.
- Pagination.
- Empty state.
- Loading skeleton.
- Row actions.
- Sticky action column optional.
- Horizontal scroll for desktop narrow screens.

Mobile adaptation:

- `DataListCard` for screens frequently opened from phone.

### `DataListCard`

Content:

- Primary title.
- Metadata rows.
- Status badge.
- Row action menu.

Used for:

- Jadwal tentor.
- Presensi mobile.
- Invoice mobile fallback.
- Laporan mobile fallback.

### `StatusBadge`

Single source for all status labels.

Props:

- `domain`
- `status`
- `size`
- `icon`

Examples:

- `Invoice: Lunas`
- `Presensi: Hadir`
- `Payroll: Sudah Dibayar`
- `Laporan: Gagal Terkirim`

## Form Components

### `FormShell`

Wrapper untuk create/edit.

Variants:

- Page form for complex workflows.
- Drawer form for CRUD medium.
- Dialog form for short data.

### `FormSection`

Content:

- Section title.
- Description.
- Fields.

Rules:

- Maksimal 6-8 field per section.
- Field terkait dikelompokkan.

### `Field`

Parts:

- Label.
- Required marker.
- Control.
- Helper text.
- Error text.

Field controls:

- `TextInput`
- `Textarea`
- `Select`
- `Combobox`
- `MultiSelect`
- `DatePicker`
- `MonthPicker`
- `TimeInput`
- `CurrencyInput`
- `FileUpload`
- `ColorPicker`
- `Toggle`
- `SegmentedControl`

### `FormFooter`

Actions:

- Cancel.
- Save draft where relevant.
- Save.
- Save and send where relevant.

Behavior:

- Sticky footer for long forms.
- On mobile, primary action full width.

## Schedule Components

### `ScheduleCard`

Content:

- Time range.
- Group name.
- Subject.
- Tutor.
- Room.
- Attendance status.

Variants:

- Admin.
- Tentor.
- Compact.

### `WeekScheduleGrid`

Usage:

- Desktop schedule overview.

Rows/Columns:

- Columns: Monday-Sunday or configured workdays.
- Cards positioned by time blocks.

Fallback:

- Mobile uses list grouped by day.

### `ConflictAlert`

Content:

- Conflict type: tentor or room.
- Existing schedule details.
- Suggested action.

Severity:

- Danger.

Placement:

- Inline in group schedule form.

## Attendance Components

### `AttendanceStatusControl`

Segmented control with:

- Hadir.
- Izin.
- Sakit.
- Alpha.

Rules:

- Must be large enough for mobile tap.
- Selected status uses semantic color.
- Keyboard accessible.

### `AttendanceStudentRow`

Content:

- Student name.
- Metadata.
- Status control.
- Optional note button.

Mobile:

- Stack name and status.

### `AttendanceProgressFooter`

Content:

- Filled count.
- Unsaved changes indicator.
- Save button.

Behavior:

- Sticky bottom on mobile.

## Invoice Components

### `InvoiceStatusMenu`

Actions:

- Mark as Lunas.
- Mark as Belum Bayar.
- Mark as Terlambat.

Rules:

- Status change to paid requires confirmation.
- Store payment date.

### `InvoiceSummaryStrip`

Metrics:

- Total invoice.
- Lunas.
- Belum bayar.
- Terlambat.
- Total nominal.

### `InvoiceDetailPanel`

Content:

- Student.
- Period.
- Amount.
- Due date.
- Status history.
- Payment info.

## Payroll Components

### `PayrollSummaryCard`

Content:

- Period.
- Tutor.
- Total sessions.
- Total salary.
- Status.

### `PayrollSessionTable`

Columns:

- Date.
- Group.
- Subject.
- Attendance saved status.
- Rate.
- Amount.

### `PayrollPaymentConfirmDialog`

Content:

- Total salary.
- Payment date.
- Bank account.
- Snapshot notice.
- Confirm action.

## Progress Report Components

### `ReportForm`

Sections:

- Student summary.
- Attendance summary.
- Learning material.
- Progress.
- Improvement area.
- Tutor note.

### `AttendanceSummaryMini`

Content:

- Hadir count.
- Izin count.
- Sakit count.
- Alpha count.
- Total sessions.

### `EmailPreview`

Preview laporan untuk orang tua.

Content:

- Tenant branding.
- Student and month.
- Report body.
- Footer contact.

### `ReportStatusTimeline`

Events:

- Draft created.
- Saved.
- Email sent.
- Email failed.
- Resent.

## Feedback Components

### `EmptyState`

Content:

- Icon.
- Title.
- Description.
- Primary action.

Examples:

- No students.
- No schedule today.
- No unpaid invoices.
- No reports for selected month.

### `LoadingState`

Use:

- Skeleton metric card.
- Skeleton table rows.
- Spinner only for small inline actions.

### `ErrorState`

Content:

- Clear message.
- Retry action.
- Contact support optional.

### `Toast`

Use for:

- Save success.
- Update status success.
- Email resend queued.
- Non-blocking errors.

Do not use toast as the only way to show validation errors.

### `ConfirmDialog`

Use for:

- Delete/deactivate.
- Mark invoice paid.
- Mark payroll paid.
- Resend email report.
- Generate monthly invoices.

## Component Accessibility Requirements

- Semua interactive component harus reachable via keyboard.
- Form field harus punya label yang terhubung.
- Error harus terbaca screen reader.
- Icon-only button wajib punya accessible label.
- Color tidak boleh menjadi satu-satunya pembeda status; badge text wajib ada.
- Focus ring terlihat jelas memakai `brand.300`.

