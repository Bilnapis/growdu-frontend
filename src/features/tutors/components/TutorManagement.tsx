import {
  type CSSProperties,
  type FormEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  GraduationCap,
  Mail,
  MoreHorizontal,
  Pencil,
  SlidersHorizontal,
  UserRoundX,
  UserX,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { AddButton } from '@/components/ui/add-button'
import { DebouncedSearchInput } from '@/components/ui/debounced-search-input'
import { TableSkeletonRows } from '@/components/ui/table-skeleton-rows'
import { Label } from "@/components/ui/label";
import {
  type Tutor,
  type TutorStatus,
} from "@/features/tutors/api/tutors-api";
import {
  useTutors,
  useUpdateTutor,
} from "@/features/tutors/hooks/use-tutors";

type TutorManagementProps = {
  filters: {
    page: number;
    search?: string;
    status?: TutorStatus;
  };
  onFiltersChange: (filters: TutorManagementProps["filters"]) => void;
};

type ActionMenuState = {
  tutorId: string;
  top: number;
  left: number;
} | null;

const actionMenuWidth = 180;

export function TutorManagement({
  filters,
  onFiltersChange,
}: TutorManagementProps) {
  const navigate = useNavigate();
  const actionMenuBoundaryRef = useRef<HTMLElement | null>(null);
  const [actionMenu, setActionMenu] = useState<ActionMenuState>(null);
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
  const openActionTutor =
    tutorsQuery.data?.data.find((tutor) => tutor.id === actionMenu?.tutorId) ??
    null;

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

  function handleActionMenuToggle(tutor: Tutor, button: HTMLButtonElement) {
    setActionMenu((current) => {
      if (current?.tutorId === tutor.id) return null;

      const boundary = actionMenuBoundaryRef.current;
      if (!boundary) return current;

      const buttonRect = button.getBoundingClientRect();
      const boundaryRect = boundary.getBoundingClientRect();
      const maxLeft = Math.max(8, boundaryRect.width - actionMenuWidth - 8);
      const preferredLeft =
        buttonRect.right - boundaryRect.left - actionMenuWidth;

      return {
        tutorId: tutor.id,
        top: buttonRect.bottom - boundaryRect.top + 8,
        left: Math.max(8, Math.min(preferredLeft, maxLeft)),
      };
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
        <AddButton
          type="button"
          onClick={() => void navigate("/tutors/new")}
        >
          Tambah Tentor
        </AddButton>
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

      <section
        ref={actionMenuBoundaryRef}
        className="relative mt-5 rounded-lg border border-[var(--color-border)] bg-white p-[18px]"
      >
        <form
          className="flex flex-col gap-3 md:flex-row md:items-center"
          onSubmit={handleFilterSubmit}
        >
          <div className="min-w-0 flex-1">
            <Label htmlFor="tutor-search" className="sr-only">
              Cari tentor
            </Label>
            <DebouncedSearchInput
              id="tutor-search"
              name="search"
              value={filters.search}
              onSearch={(search) =>
                onFiltersChange({
                  ...filters,
                  page: 1,
                  search: search || undefined,
                })
              }
              placeholder="Cari nama tentor, keahlian, atau jurusan"
            />
          </div>
          <div className="flex gap-3">
            <Label htmlFor="tutor-status" className="sr-only">
              Filter status tentor
            </Label>
            <div className="relative">
              <select
                id="tutor-status"
                name="status"
                defaultValue={filters.status ?? ''}
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

        {tutorsQuery.isError ? <ErrorState /> : null}
        {tutorsQuery.isPending || tutorsQuery.data ? (
          <>
            <div
              className="mt-[14px] overflow-x-auto rounded-md border focus-visible:ring-2 focus-visible:ring-ring"
              role="region"
              aria-label="Tabel tentor, geser untuk melihat semua kolom"
              tabIndex={0}
            >
              <table className="w-full min-w-[1080px] border-collapse text-left text-[13px]">
                <caption className="sr-only">Daftar tentor bimbel</caption>
                <thead className="bg-slate-50 text-muted-foreground">
                  <tr className="h-11">
                    <th scope="col" className="w-[150px] px-[18px] font-bold">
                      Nama Tentor
                    </th>
                    <th scope="col" className="w-[140px] px-[18px] font-bold">
                      Keahlian / Jurusan
                    </th>
                    <th scope="col" className="w-[120px] px-[18px] font-bold">
                      Rekening
                    </th>
                    <th scope="col" className="w-[145px] px-[18px] font-bold">
                      Kontak & Email
                    </th>
                    <th scope="col" className="w-[170px] px-[18px] font-bold">
                      Alamat
                    </th>
                    <th scope="col" className="w-[95px] px-[18px] font-bold">
                      Kelompok
                    </th>
                    <th scope="col" className="w-[78px] px-[18px] font-bold">
                      Status
                    </th>
                    <th scope="col" className="w-[72px] px-3 font-bold">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody
                  className="divide-y divide-slate-100"
                  aria-busy={tutorsQuery.isPending}
                >
                  {tutorsQuery.isPending ? (
                    <TableSkeletonRows
                      columns={8}
                      label="Memuat data tentor..."
                    />
                  ) : null}
                  {tutorsQuery.data?.data.map((tutor) => (
                    <tr
                      key={tutor.id}
                      className="relative h-[70px] bg-card text-[13px] leading-[1.3] text-foreground"
                    >
                      <th
                        scope="row"
                        className="px-[18px] py-3 font-bold"
                      >
                        {tutor.name}
                      </th>
                      <td className="whitespace-pre-line px-[18px] py-3 font-medium">
                        {getTutorExpertise(tutor)}
                      </td>
                      <td className="whitespace-pre-line px-[18px] py-3 font-semibold">
                        {getTutorBankInfo(tutor)}
                      </td>
                      <td className="whitespace-pre-line px-[18px] py-3 font-medium">
                        {getTutorContact(tutor)}
                      </td>
                      <td className="px-[18px] py-3 font-medium">
                        {getTutorAddress(tutor)}
                      </td>
                      <td className="px-[18px] py-3 font-semibold">
                        {getTutorGroup(tutor)}
                      </td>
                      <td className="px-[18px] py-3">
                        <TutorStatusBadge status={tutor.status} />
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="grid h-[18px] w-[18px] place-items-center text-[var(--color-primary-text)]"
                            onClick={() => {
                              setActionMenu(null);
                              void navigate(`/tutors/${tutor.id}/edit`);
                            }}
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
                            onClick={(event) =>
                              handleActionMenuToggle(tutor, event.currentTarget)
                            }
                            aria-label={`Menu aksi ${tutor.name}`}
                          >
                            <MoreHorizontal
                              className="h-[18px] w-[18px]"
                              aria-hidden="true"
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {tutorsQuery.data?.data.length === 0 ? <EmptyState /> : null}
            {tutorsQuery.data ? (
              <Pagination
                page={tutorsQuery.data.meta.page}
                total={tutorsQuery.data.meta.total}
                totalPages={tutorsQuery.data.meta.totalPages}
                onPageChange={(page) => onFiltersChange({ ...filters, page })}
              />
            ) : null}
            {openActionTutor && actionMenu ? (
              <TutorActionMenu
                tutor={openActionTutor}
                style={{
                  left: actionMenu.left,
                  top: actionMenu.top,
                }}
                onEdit={() => {
                  setActionMenu(null);
                  void navigate(`/tutors/${openActionTutor.id}/edit`);
                }}
                onDeactivate={() => {
                  setActionMenu(null);
                  handleDeactivateTutor(openActionTutor);
                }}
              />
            ) : null}
          </>
        ) : null}
      </section>

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
  style,
  onEdit,
  onDeactivate,
}: {
  tutor: Tutor;
  style: CSSProperties;
  onEdit: () => void;
  onDeactivate: () => void;
}) {
  return (
    <div
      className="absolute z-20 w-[180px] rounded-lg border border-[var(--color-border)] bg-white p-2 shadow-[0_8px_24px_rgb(15_23_42_/_10%)]"
      style={style}
    >
      <Link
        to={`/tutors/${tutor.id}`}
        className="flex w-full items-center justify-center gap-2 rounded-md border border-[var(--color-border)] bg-white px-4 py-2 text-[13px] font-semibold text-[var(--color-text)]"
        aria-label={`Lihat detail ${tutor.name}`}
      >
        <Eye className="h-4 w-4" aria-hidden="true" />
        Lihat detail
      </Link>
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
            className={`grid h-8 min-w-9 place-items-center rounded-md px-3 text-[13px] font-semibold ${paginationPage === page
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
      className={`inline-flex rounded-full px-2.5 py-[5px] text-xs font-bold leading-[1.2] ${isActive
        ? "bg-[var(--color-success-bg)] text-[var(--color-success)]"
        : "bg-slate-100 text-muted-foreground"
        }`}
    >
      {status === "active" ? "Aktif" : "Nonaktif"}
    </span>
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

function getTutorExpertise(tutor: Tutor) {
  const expertise = tutor.expertise?.trim() || 'Keahlian belum diisi'
  const education = tutor.education?.trim() || 'Jurusan belum diisi'

  return `${expertise}\n${education}`
}

function getTutorBankInfo(tutor: Tutor) {
  const bankName = tutor.bankName?.trim() || 'Bank belum diisi'
  const accountNumber = tutor.accountNumber?.trim() || 'Nomor rekening belum diisi'
  const accountName = tutor.accountName?.trim()

  return `${bankName}\n${accountNumber}\n${accountName ? `a.n. ${accountName}` : 'Nama pemilik belum diisi'}`
}

function getTutorContact(tutor: Tutor) {
  const email = tutor.email?.trim() || 'Email belum diisi'

  return `${tutor.phoneNumber}\n${email}`
}

function getTutorAddress(tutor: Tutor) {
  return tutor.address?.trim() || 'Alamat belum diisi'
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
