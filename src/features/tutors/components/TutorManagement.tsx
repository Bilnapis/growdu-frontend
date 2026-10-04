import { type FormEvent, useMemo, useState } from "react";
import {
  CheckCircle2,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  GraduationCap,
  Mail,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Upload,
  UserRoundX,
  UserX,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type Tutor,
  type TutorInput,
  type TutorStatus,
} from "@/features/tutors/api/tutors-api";
import {
  useCreateTutor,
  useTutors,
  useUpdateTutor,
} from "@/features/tutors/hooks/use-tutors";
import { ApiError } from "@/services/api-client";

type TutorManagementProps = {
  filters: {
    page: number;
    search?: string;
    status?: TutorStatus;
  };
  onFiltersChange: (filters: TutorManagementProps["filters"]) => void;
};

type TutorEditorState =
  | {
      mode: "create";
    }
  | {
      mode: "edit";
      tutor: Tutor;
    }
  | null;

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  currency: "IDR",
  maximumFractionDigits: 0,
  style: "currency",
});

export function TutorManagement({
  filters,
  onFiltersChange,
}: TutorManagementProps) {
  const [editorState, setEditorState] = useState<TutorEditorState>(null);
  const [isDefaultActionMenu, setIsDefaultActionMenu] = useState(true);
  const [openActionTutorId, setOpenActionTutorId] = useState<string | null>(
    null,
  );
  const tutorsQuery = useTutors({ ...filters, limit: 20 });
  const updateMutation = useUpdateTutor();
  const summary = useMemo(() => {
    const tutors = tutorsQuery.data?.data ?? [];

    return {
      active: tutors.filter((tutor) => tutor.status === "active").length,
      missingGroup: tutors.filter((tutor) => !tutor.userId).length,
      missingRate: tutors.filter((tutor) => Number(tutor.sessionRate) <= 0)
        .length,
      inactive: tutors.filter((tutor) => tutor.status === "inactive").length,
      total: tutorsQuery.data?.meta.total ?? 0,
    };
  }, [tutorsQuery.data]);
  const visibleActionTutorId = isDefaultActionMenu
    ? tutorsQuery.data?.data[0]?.id
    : openActionTutorId;

  function handleFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const search = getFormValue(formData, "search");
    const status = getOptionalStatus(getFormValue(formData, "status"));

    onFiltersChange({
      page: 1,
      ...(search ? { search } : {}),
      ...(status ? { status } : {}),
    });
  }

  function handleDeactivateTutor(tutor: Tutor) {
    updateMutation.mutate({
      id: tutor.id,
      input: {
        name: tutor.name,
        phoneNumber: tutor.phoneNumber,
        sessionRate: tutor.sessionRate,
        status: "inactive",
      },
    });
  }

  return (
    <div
      className="min-w-0 font-sans text-[var(--color-text)]"
      aria-labelledby="tutors-title"
    >
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1
            id="tutors-title"
            className="text-[26px] font-bold leading-[1.3] tracking-normal text-[var(--color-text)]"
          >
            Data Tentor
          </h1>
          <p className="text-sm leading-[1.3] text-[var(--color-muted)]">
            Kelola data tentor aktif dan nonaktif.
          </p>
        </div>
        <div className="flex h-[33px] flex-wrap gap-2.5">
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-[var(--color-border)] bg-white px-4 py-2 text-[13px] font-semibold leading-[1.3] text-[var(--color-text)]"
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            Import
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-[var(--color-primary)] px-4 py-2 text-[13px] font-semibold leading-[1.3] text-white"
            onClick={() => setEditorState({ mode: "create" })}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Tambah Siswa
          </button>
        </div>
      </header>

      <section
        className="mt-5 grid gap-3.5 md:grid-cols-2 xl:grid-cols-4"
        aria-label="Ringkasan tentor"
      >
        <SummaryCard
          icon={Users}
          label="Tentor Aktif"
          value={summary.active || summary.total}
          toneClass="bg-[var(--color-success-bg)] text-[var(--color-success)]"
        />
        <SummaryCard
          icon={UserRoundX}
          label="Nonaktif"
          value={summary.inactive}
          toneClass="bg-[var(--color-gray-50)] text-[var(--color-muted)]"
        />
        <SummaryCard
          icon={Mail}
          label="Tarif Mengajar Kosong"
          value={summary.missingRate}
          toneClass="bg-[var(--color-warning-bg)] text-[var(--color-warning)]"
        />
        <SummaryCard
          icon={BookOpen}
          label="Belum Masuk Kelompok"
          value={summary.missingGroup}
          toneClass="bg-[var(--color-danger-bg)] text-[var(--color-danger)]"
        />
      </section>

      <section className="mt-5 rounded-lg border border-[var(--color-border)] bg-white p-[18px]">
        {tutorsQuery.isPending ? <LoadingState /> : null}
        {tutorsQuery.isError ? <ErrorState /> : null}
        {tutorsQuery.data ? (
          <>
            <form
              className="flex flex-col gap-3 md:flex-row md:items-center"
              onSubmit={handleFilterSubmit}
            >
              <div className="min-w-0 flex-1">
                <Label htmlFor="tutor-search" className="sr-only">
                  Cari tentor
                </Label>
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[var(--color-muted)]"
                    aria-hidden="true"
                  />
                  <Input
                    id="tutor-search"
                    name="search"
                    defaultValue={filters.search}
                    placeholder="Cari nama tentor, keahlian, atau jurusan"
                    className="h-10 rounded-md border-[var(--color-border)] bg-[var(--color-gray-50)] pl-10 text-[13px] font-medium text-[var(--color-text)] placeholder:text-[var(--color-muted)]"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Label htmlFor="tutor-status" className="sr-only">
                  Filter status tentor
                </Label>
                <div className="relative">
                  <select
                    id="tutor-status"
                    name="status"
                    defaultValue={filters.status ?? ""}
                    className="h-10 appearance-none rounded-md border border-[var(--color-border)] bg-white py-2 pl-3.5 pr-9 text-[13px] font-semibold text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Status</option>
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
                  <SlidersHorizontal
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]"
                    aria-hidden="true"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[var(--color-border)] bg-white px-3.5 text-[13px] font-semibold text-[var(--color-text)]"
                >
                  Kelompok
                  <ChevronDown
                    className="h-4 w-4 text-[var(--color-muted)]"
                    aria-hidden="true"
                  />
                </button>
              </div>
            </form>

            <div className="mt-3.5 overflow-x-auto">
              <table className="w-full min-w-[1000px] border-separate border-spacing-0 text-left">
                <caption className="sr-only">Daftar tentor bimbel</caption>
                <thead>
                  <tr className="h-11 rounded-md bg-[var(--color-gray-50)] text-xs font-bold leading-[1.3] text-[var(--color-muted)]">
                    <th scope="col" className="w-[150px] rounded-l-md px-3">
                      Nama Tentor
                    </th>
                    <th scope="col" className="w-[140px] px-3">
                      Keahlian / Jurusan
                    </th>
                    <th scope="col" className="w-[120px] px-3">
                      Rekening
                    </th>
                    <th scope="col" className="w-[145px] px-3">
                      Kontak & Email
                    </th>
                    <th scope="col" className="w-[170px] px-3">
                      Alamat
                    </th>
                    <th scope="col" className="w-[95px] px-3">
                      Kelompok
                    </th>
                    <th scope="col" className="w-[78px] px-3">
                      Status
                    </th>
                    <th scope="col" className="w-[52px] rounded-r-md px-3">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tutorsQuery.data.data.map((tutor) => (
                    <tr
                      key={tutor.id}
                      className="relative h-[70px] border-b border-[var(--color-neutral-100)] text-xs leading-[1.3] text-[var(--color-text)]"
                    >
                      <th
                        scope="row"
                        className="border-b border-[var(--color-neutral-100)] px-3 py-3 text-[13px] font-bold"
                      >
                        {tutor.name}
                      </th>
                      <td className="whitespace-pre-line border-b border-[var(--color-neutral-100)] px-3 py-3 font-medium">
                        {getTutorExpertise(tutor)}
                      </td>
                      <td className="whitespace-pre-line border-b border-[var(--color-neutral-100)] px-3 py-3 font-semibold">
                        {getTutorBankInfo(tutor)}
                      </td>
                      <td className="whitespace-pre-line border-b border-[var(--color-neutral-100)] px-3 py-3 font-medium">
                        {getTutorContact(tutor)}
                      </td>
                      <td className="border-b border-[var(--color-neutral-100)] px-3 py-3 font-medium">
                        {getTutorAddress()}
                      </td>
                      <td className="border-b border-[var(--color-neutral-100)] px-3 py-3 font-semibold">
                        {getTutorGroup(tutor)}
                      </td>
                      <td className="border-b border-[var(--color-neutral-100)] px-3 py-3">
                        <TutorStatusBadge status={tutor.status} />
                      </td>
                      <td className="relative border-b border-[var(--color-neutral-100)] px-3 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="grid h-[18px] w-[18px] place-items-center text-[var(--color-primary)]"
                            onClick={() =>
                              setEditorState({ mode: "edit", tutor })
                            }
                            aria-label={`Edit ${tutor.name}`}
                          >
                            <Pencil
                              className="h-[18px] w-[18px]"
                              aria-hidden="true"
                            />
                          </button>
                          <button
                            type="button"
                            className="grid h-[18px] w-[18px] place-items-center text-[var(--color-muted)]"
                            onClick={() => {
                              setIsDefaultActionMenu(false);
                              setOpenActionTutorId((current) =>
                                current === tutor.id ? null : tutor.id,
                              );
                            }}
                            aria-label={`Menu aksi ${tutor.name}`}
                          >
                            <MoreHorizontal
                              className="h-[18px] w-[18px]"
                              aria-hidden="true"
                            />
                          </button>
                        </div>
                        {visibleActionTutorId === tutor.id ? (
                          <TutorActionMenu
                            tutor={tutor}
                            onEdit={() =>
                              setEditorState({ mode: "edit", tutor })
                            }
                            onDeactivate={() => handleDeactivateTutor(tutor)}
                          />
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {tutorsQuery.data.data.length === 0 ? <EmptyState /> : null}
            <Pagination
              page={tutorsQuery.data.meta.page}
              total={tutorsQuery.data.meta.total}
              totalPages={tutorsQuery.data.meta.totalPages}
              onPageChange={(page) => onFiltersChange({ ...filters, page })}
            />
          </>
        ) : null}
      </section>

      {editorState ? (
        <TutorEditor state={editorState} onClose={() => setEditorState(null)} />
      ) : null}
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  toneClass,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  toneClass: string;
}) {
  return (
    <article className="rounded-lg border border-[var(--color-border)] bg-white p-4">
      <div className="flex items-center gap-2">
        <span
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-md ${toneClass}`}
        >
          <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
        </span>
        <h2 className="min-w-0 text-xs font-bold leading-[1.3] text-[var(--color-muted)]">
          {label}
        </h2>
      </div>
      <p className="mt-1.5 text-[26px] font-bold leading-[1.3] text-[var(--color-text)]">
        {value}
      </p>
    </article>
  );
}

function TutorActionMenu({
  tutor,
  onEdit,
  onDeactivate,
}: {
  tutor: Tutor;
  onEdit: () => void;
  onDeactivate: () => void;
}) {
  return (
    <div className="absolute right-0 top-[46px] z-10 w-[180px] rounded-lg border border-[var(--color-border)] bg-white p-2 shadow-[0_8px_24px_rgb(15_23_42_/_10%)]">
      <button
        type="button"
        className="flex w-full items-center justify-center gap-2 rounded-md border border-[var(--color-border)] bg-white px-4 py-2 text-[13px] font-semibold text-[var(--color-text)]"
        aria-label={`Lihat detail ${tutor.name}`}
      >
        <Eye className="h-4 w-4" aria-hidden="true" />
        Lihat detail
      </button>
      <button
        type="button"
        className="mt-1 flex w-full items-center justify-center gap-2 rounded-md bg-[var(--color-primary)] px-4 py-2 text-[13px] font-semibold text-white"
        onClick={onEdit}
      >
        <Pencil className="h-4 w-4" aria-hidden="true" />
        Ubah data
      </button>
      <button
        type="button"
        className="mt-1 flex w-full items-center justify-center gap-2 rounded-md border border-[var(--color-danger-border)] bg-white px-4 py-2 text-[13px] font-semibold text-[var(--color-danger)]"
        onClick={onDeactivate}
      >
        <UserX className="h-4 w-4" aria-hidden="true" />
        Nonaktifkan tentor
      </button>
    </div>
  );
}

function TutorEditor({
  state,
  onClose,
}: {
  state: Exclude<TutorEditorState, null>;
  onClose: () => void;
}) {
  const createMutation = useCreateTutor();
  const updateMutation = useUpdateTutor();
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const isEdit = state.mode === "edit";
  const tutor = isEdit ? state.tutor : null;
  const isPending = createMutation.isPending || updateMutation.isPending;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    const input = getTutorInput(new FormData(event.currentTarget));
    const mutationOptions = {
      onSuccess: () => {
        setSuccessMessage(
          isEdit
            ? "Profil tentor berhasil diperbarui."
            : "Tentor baru berhasil ditambahkan.",
        );
        if (!isEdit) {
          event.currentTarget.reset();
        }
      },
      onError: (error: unknown) => setFormError(getMutationError(error)),
    };

    if (isEdit && tutor) {
      updateMutation.mutate({ id: tutor.id, input }, mutationOptions);
      return;
    }

    createMutation.mutate(input, mutationOptions);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 p-0 sm:p-4"
      role="presentation"
    >
      <section
        className="h-full w-full max-w-xl overflow-y-auto bg-background p-5 shadow-xl sm:rounded-lg sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutor-editor-title"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              {isEdit ? "Edit tentor" : "Tambah tentor"}
            </span>
            <h2 id="tutor-editor-title" className="mt-1 text-xl font-semibold">
              {tutor?.name ?? "Profil tentor baru"}
            </h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Tutup pengaturan tentor"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>

        <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="tutor-name">Nama tentor</Label>
            <Input
              id="tutor-name"
              name="name"
              defaultValue={tutor?.name}
              minLength={2}
              maxLength={150}
              required
              disabled={isPending}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tutor-phone">Nomor WhatsApp</Label>
            <Input
              id="tutor-phone"
              name="phoneNumber"
              defaultValue={tutor?.phoneNumber}
              minLength={6}
              maxLength={20}
              placeholder="081234567890"
              required
              disabled={isPending}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tutor-rate">Tarif per sesi</Label>
            <Input
              id="tutor-rate"
              name="sessionRate"
              defaultValue={tutor?.sessionRate}
              inputMode="decimal"
              pattern="^\d{1,10}(\.\d{1,2})?$"
              placeholder="150000"
              required
              disabled={isPending}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tutor-editor-status">Status</Label>
            <select
              id="tutor-editor-status"
              name="status"
              defaultValue={tutor?.status ?? "active"}
              className="h-11 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              disabled={isPending}
            >
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Menyimpan..." : "Simpan tentor"}
          </Button>
        </form>

        {formError ? (
          <p
            className="mt-5 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            role="alert"
          >
            {formError}
          </p>
        ) : null}
        {successMessage ? (
          <p
            className="mt-5 flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
            role="status"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            {successMessage}
          </p>
        ) : null}
      </section>
    </div>
  );
}

function Pagination({
  page,
  total,
  totalPages,
  onPageChange,
}: {
  page: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (total === 0) return null;

  const pages = Array.from({ length: Math.min(totalPages, 3) }, (_, index) => {
    return index + 1;
  });
  const firstItem = (page - 1) * 20 + 1;
  const lastItem = Math.min(page * 20, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 text-xs leading-[1.3] text-[var(--color-muted)]">
      <span>
        Menampilkan {firstItem}-{lastItem} dari {total} tentor
      </span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          className="grid h-8 min-w-9 place-items-center rounded-md border border-[var(--color-border)] bg-white px-2.5 text-[var(--color-muted)] disabled:opacity-50"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        {pages.map((paginationPage) => (
          <button
            key={paginationPage}
            type="button"
            className={`grid h-8 min-w-9 place-items-center rounded-md px-3 text-[13px] font-semibold ${
              paginationPage === page
                ? "bg-[var(--color-primary)] text-white"
                : "border border-[var(--color-border)] bg-white text-[var(--color-muted)]"
            }`}
            onClick={() => onPageChange(paginationPage)}
            aria-current={paginationPage === page ? "page" : undefined}
          >
            {paginationPage}
          </button>
        ))}
        <button
          type="button"
          className="grid h-8 min-w-9 place-items-center rounded-md border border-[var(--color-border)] bg-white px-2.5 text-[var(--color-muted)] disabled:opacity-50"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Halaman berikutnya"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function TutorStatusBadge({ status }: { status: TutorStatus }) {
  const isActive = status === "active";

  return (
    <span
      className={`inline-flex rounded-[5px] px-2 py-1 text-[11px] font-bold leading-[1.3] ${
        isActive
          ? "bg-[var(--color-success-bg)] text-[var(--color-success)]"
          : "bg-[var(--color-gray-50)] text-[var(--color-muted)]"
      }`}
    >
      {status === "active" ? "Aktif" : "Nonaktif"}
    </span>
  );
}

function LoadingState() {
  return (
    <div className="grid min-h-64 place-items-center p-6 text-sm text-muted-foreground">
      Memuat data tentor...
    </div>
  );
}

function ErrorState() {
  return (
    <div className="grid min-h-64 place-items-center p-6 text-center">
      <div>
        <GraduationCap
          className="mx-auto h-6 w-6 text-destructive"
          aria-hidden="true"
        />
        <p className="mt-3 font-medium">Data tentor belum dapat dimuat.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Pastikan bimbel sudah dipilih atau coba muat ulang halaman.
        </p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="grid min-h-48 place-items-center p-6 text-center">
      <div>
        <GraduationCap
          className="mx-auto h-6 w-6 text-muted-foreground"
          aria-hidden="true"
        />
        <p className="mt-3 font-medium">Tentor tidak ditemukan</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Tambah tentor baru atau ubah filter pencarian.
        </p>
      </div>
    </div>
  );
}

function getTutorInput(formData: FormData): TutorInput {
  return {
    name: getFormValue(formData, "name"),
    phoneNumber: getFormValue(formData, "phoneNumber"),
    sessionRate: getFormValue(formData, "sessionRate"),
    status: getOptionalStatus(getFormValue(formData, "status")) ?? "active",
  };
}

function formatRate(value: string) {
  const amount = Number(value);
  return Number.isFinite(amount) ? rupiahFormatter.format(amount) : value;
}

function getTutorExpertise(tutor: Tutor) {
  return tutor.userId ? "Mapel belum diisi\nJurusan belum diisi" : "-";
}

function getTutorBankInfo(tutor: Tutor) {
  return `Tarif sesi\n${formatRate(tutor.sessionRate)}`;
}

function getTutorContact(tutor: Tutor) {
  return `${tutor.phoneNumber}\nEmail belum diisi`;
}

function getTutorAddress() {
  return "Alamat belum diisi";
}

function getTutorGroup(tutor: Tutor) {
  if (tutor.status === "inactive") return "Nonaktif";
  return tutor.userId ? "Terhubung" : "-";
}

function getFormValue(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function getOptionalStatus(value: string): TutorStatus | undefined {
  return value === "active" || value === "inactive" ? value : undefined;
}

function getMutationError(error: unknown) {
  if (error instanceof ApiError) return error.message;
  return "Data tentor belum dapat disimpan. Silakan coba lagi.";
}
