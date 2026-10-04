import { type FormEvent, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateTutor } from "@/features/tutors/hooks/use-tutors";
import { ApiError } from "@/services/api-client";

type TutorCreateForm = {
  name: string;
  phoneNumber: string;
  email: string;
  address: string;
  expertise: string;
  education: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
};

const initialForm: TutorCreateForm = {
  name: "",
  phoneNumber: "",
  email: "",
  address: "",
  expertise: "",
  education: "",
  bankName: "",
  accountName: "",
  accountNumber: "",
};

export function TutorCreatePage() {
  const navigate = useNavigate();
  const createMutation = useCreateTutor();
  const [form, setForm] = useState<TutorCreateForm>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validationIssues = useMemo(() => {
    const issues: string[] = [];

    if (form.name.trim().length < 2) {
      issues.push("Nama tentor wajib diisi.");
    }

    if (form.phoneNumber.trim().length < 6) {
      issues.push("Nomor HP minimal 6 karakter.");
    }

    return issues;
  }, [form.name, form.phoneNumber]);

  const canSubmit = validationIssues.length === 0 && !createMutation.isPending;

  function updateField(field: keyof TutorCreateForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setSuccessMessage(null);
    if (formError) setFormError(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    setSuccessMessage(null);
    setFormError(null);

    if (validationIssues.length > 0) return;

    createMutation.mutate(
      {
        name: form.name.trim(),
        phoneNumber: form.phoneNumber.trim(),
        sessionRate: "0",
        status: "active",
      },
      {
        onSuccess: () => {
          setSuccessMessage("Tentor baru berhasil ditambahkan.");
          void navigate("/tutors");
        },
        onError: (error: unknown) => setFormError(getMutationError(error)),
      },
    );
  }

  return (
    <div className="min-w-0 font-sans text-[var(--color-text)]">
      <header className="flex min-h-14 items-center justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <h1 className="text-2xl font-bold leading-[1.35] tracking-normal text-[var(--color-text)]">
            Tambah Tentor
          </h1>
        </div>
        <button
          type="button"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[var(--color-border)] bg-white px-3 text-[13px] font-semibold text-[var(--color-text)]"
          onClick={() => void navigate("/tutors")}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Kembali
        </button>
      </header>

      <form className="mt-[18px] space-y-5" onSubmit={handleSubmit}>
        <div className="max-w-[742px] space-y-4">
          <section className="rounded-lg border border-[var(--color-border)] bg-white p-5">
            <SectionHeader
              title="Data Tentor"
              description="Identitas tentor yang dipakai pada kelompok belajar dan laporan"
            />
            <div className="mt-4 grid gap-3.5 md:grid-cols-2">
              <FormField
                id="tutor-name"
                label="Nama"
                value={form.name}
                required
                error={
                  submitted && form.name.trim().length < 2
                    ? "Nama tentor wajib diisi."
                    : undefined
                }
                onChange={(value) => updateField("name", value)}
              />
              <FormField
                id="tutor-phone"
                label="Nomor HP"
                value={form.phoneNumber}
                placeholder="081234567890"
                inputMode="tel"
                onChange={(value) => updateField("phoneNumber", value)}
              />
              <FormField
                id="tutor-email"
                label="Email"
                value={form.email}
                required
                placeholder="nama@email.com"
                type="email"
                onChange={(value) => updateField("email", value)}
              />
              <FormField
                id="tutor-address"
                label="Alamat"
                value={form.address}
                required
                placeholder="Jl. Melati No. 12, Bandung"
                onChange={(value) => updateField("address", value)}
              />
              <FormField
                id="tutor-expertise"
                label="Keahlian"
                value={form.expertise}
                required
                placeholder="Matematika, Fisika"
                onChange={(value) => updateField("expertise", value)}
              />
              <FormField
                id="tutor-education"
                label="Pendidikan"
                value={form.education}
                required
                placeholder="Pendidikan Matematika"
                onChange={(value) => updateField("education", value)}
              />
            </div>
          </section>

          <section className="rounded-lg border border-[var(--color-border)] bg-white p-5">
            <SectionHeader
              title="Data Rekening"
              description="Dipakai untuk invoice atau penggajian"
            />
            <div className="mt-4 grid gap-3.5 md:grid-cols-3">
              <FormField
                id="tutor-bank"
                label="Bank / E-Wallet"
                value={form.bankName}
                required
                placeholder="BCA"
                onChange={(value) => updateField("bankName", value)}
              />
              <FormField
                id="tutor-account-name"
                label="Atas Nama"
                value={form.accountName}
                required
                placeholder="Tentor"
                onChange={(value) => updateField("accountName", value)}
              />
              <FormField
                id="tutor-account-number"
                label="Nomor Rekening"
                value={form.accountNumber}
                required
                placeholder="12345678"
                inputMode="numeric"
                onChange={(value) => updateField("accountNumber", value)}
              />
            </div>
          </section>
        </div>

        {formError ? (
          <p
            className="max-w-[742px] rounded-md border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm font-medium text-[var(--color-danger)]"
            role="alert"
          >
            {formError}
          </p>
        ) : null}
        {successMessage ? (
          <p
            className="flex max-w-[742px] items-center gap-2 rounded-md border border-[var(--color-success-border)] bg-[var(--color-success-bg)] px-3 py-2 text-sm font-medium text-[var(--color-success)]"
            role="status"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            {successMessage}
          </p>
        ) : null}

        <footer className="flex max-w-full flex-col gap-3 rounded-lg border border-[var(--color-border)] bg-white px-[18px] py-3 sm:h-14 sm:flex-row sm:items-center sm:justify-between sm:py-0">
          <p className="text-[13px] font-semibold leading-[1.35] text-[var(--color-muted)]">
            {validationIssues.length > 0
              ? `${validationIssues.length} validasi perlu diperbaiki sebelum menyimpan.`
              : "Data utama siap disimpan."}
          </p>
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              className="inline-flex h-9 items-center justify-center rounded-md border border-[var(--color-border)] bg-white px-4 text-[13px] font-semibold text-[var(--color-text)]"
              onClick={() => void navigate("/tutors")}
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex h-9 items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-gray-50)] px-4 text-[13px] font-semibold text-[var(--color-gray-400)] enabled:border-[var(--color-primary)] enabled:bg-[var(--color-primary)] enabled:text-white"
              disabled={!canSubmit}
            >
              {createMutation.isPending ? "Menyimpan..." : "Simpan Tentor"}
            </button>
          </div>
        </footer>
      </form>
    </div>
  );
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-1">
      <h2 className="text-lg font-bold leading-[1.35] text-[var(--color-text)]">
        {title}
      </h2>
      <p className="text-[13px] leading-[1.35] text-[var(--color-muted)]">
        {description}
      </p>
    </div>
  );
}

function FormField({
  id,
  label,
  value,
  onChange,
  error,
  required = false,
  placeholder,
  type = "text",
  inputMode,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
  inputMode?: "email" | "numeric" | "search" | "tel" | "text" | "url";
}) {
  return (
    <div className="grid gap-[7px]">
      <Label
        htmlFor={id}
        className="flex items-center gap-1 text-[13px] font-bold leading-[1.35] text-[var(--color-text)]"
      >
        {label}
        {required ? (
          <span className="text-[var(--color-danger)]" aria-hidden="true">
            *
          </span>
        ) : null}
      </Label>
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        inputMode={inputMode}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`h-[42px] rounded-md bg-white px-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] ${
          error
            ? "border-[var(--color-danger)] focus-visible:ring-[var(--color-danger)]"
            : "border-[var(--color-border)]"
        }`}
      />
      {error ? (
        <p
          id={`${id}-error`}
          className="text-xs font-semibold leading-[1.35] text-[var(--color-danger)]"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

function getMutationError(error: unknown) {
  if (error instanceof ApiError) return error.message;
  return "Data tentor belum dapat disimpan. Silakan coba lagi.";
}
