import { type FormEvent, useMemo, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";

import { TutorDialog } from './TutorDialog';

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateTutor, useUpdateTutor } from "@/features/tutors/hooks/use-tutors";
import type { Tutor } from "@/features/tutors/api/tutors-api";
import { ApiError } from "@/services/api-client";
import {
  getYupFieldErrors,
  getYupValidationMessage,
  type FormFieldErrors,
} from "@/lib/yup-validation";

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

const tutorCreateSchema: yup.ObjectSchema<TutorCreateForm> = yup.object({
  name: yup
    .string()
    .trim()
    .min(2, "Nama tentor wajib diisi.")
    .required("Nama tentor wajib diisi."),
  phoneNumber: yup
    .string()
    .trim()
    .min(6, "Nomor HP minimal 6 karakter.")
    .required("Nomor HP minimal 6 karakter."),
  email: yup
    .string()
    .trim()
    .email("Email wajib valid.")
    .required("Email wajib valid."),
  address: yup.string().trim().required("Alamat wajib diisi."),
  expertise: yup.string().trim().required("Keahlian wajib diisi."),
  education: yup.string().trim().required("Jurusan wajib diisi."),
  bankName: yup.string().trim().required("Bank atau e-wallet wajib diisi."),
  accountName: yup
    .string()
    .trim()
    .min(2, "Atas nama rekening minimal 2 karakter.")
    .required("Atas nama rekening minimal 2 karakter."),
  accountNumber: yup
    .string()
    .trim()
    .min(3, "Nomor rekening minimal 3 karakter.")
    .required("Nomor rekening minimal 3 karakter."),
});

export function TutorForm({ tutor, onClose }: { tutor?: Tutor; onClose?: () => void }) {
  const navigate = useNavigate();
  const createMutation = useCreateTutor();
  const updateMutation = useUpdateTutor();
  const isPending = createMutation.isPending || updateMutation.isPending;
  const closeForm = onClose ?? (() => void navigate('/tutors', { replace: true }));
  const [form, setForm] = useState<TutorCreateForm>(() => tutor ? {
    name: tutor.name,
    phoneNumber: normalizeTutorPhoneNumber(tutor.phoneNumber),
    email: tutor.email ?? '',
    address: tutor.address ?? '',
    expertise: tutor.expertise ?? '',
    education: tutor.education ?? '',
    bankName: tutor.bankName ?? '',
    accountName: tutor.accountName ?? '',
    accountNumber: tutor.accountNumber ?? '',
  } : initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validation = useMemo<{
    errors: FormFieldErrors<keyof TutorCreateForm>;
    issues: string[];
  }>(() => {
    try {
      tutorCreateSchema.validateSync(form, { abortEarly: false });
      return {
        errors: {},
        issues: [],
      };
    } catch (error) {
      return {
        errors: getYupFieldErrors<keyof TutorCreateForm>(error),
        issues: error instanceof yup.ValidationError ? error.errors : [],
      };
    }
  }, [form]);

  const canSubmit = validation.issues.length === 0 && !isPending;

  function updateField(field: keyof TutorCreateForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setSuccessMessage(null);
    if (formError) setFormError(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;
    setSubmitted(true);
    setSuccessMessage(null);
    setFormError(null);

    let input: TutorCreateForm;
    try {
      input = tutorCreateSchema.validateSync(form, { abortEarly: false });
    } catch (error) {
      setFormError(
        getYupValidationMessage(error, "Periksa kembali data tentor."),
      );
      return;
    }

    const payload = {
      ...input,
      phoneNumber: `+62${normalizeTutorPhoneNumber(input.phoneNumber)}`,
      sessionRate: tutor?.sessionRate ?? '0',
      status: tutor?.status ?? 'active',
    };
    const options = {
      onSuccess: () => {
        setSuccessMessage(tutor ? 'Data tentor berhasil diperbarui.' : 'Tentor baru berhasil ditambahkan.');
        closeForm();
      },
      onError: (error: unknown) => setFormError(getMutationError(error)),
    };
    if (tutor) {
      updateMutation.mutate({ id: tutor.id, input: payload }, options);
    } else {
      createMutation.mutate(payload, options);
    }
  }

  const content = (
    <div className="min-w-0 font-sans text-[var(--color-text)]">
      <header className="flex items-center justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <h1 id="tutor-form-title" className="text-2xl font-bold leading-[1.35] tracking-normal text-[var(--color-text)]">
            {tutor ? 'Ubah Data Tentor' : 'Tambah Tentor'}
          </h1>
        </div>
        <button
          type="button"
          disabled={isPending}
          aria-label={tutor ? "Tutup modal ubah tentor" : "Tutup modal tambah tentor"}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-[var(--color-muted)] hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
          onClick={closeForm}
        >
          <X className="h-6 w-6" aria-hidden="true" />
        </button>
      </header>

      <form className="mt-5 space-y-5" onSubmit={handleSubmit}>
        <fieldset disabled={isPending} className="min-w-0 space-y-4">
          <section className="rounded-lg border border-[var(--color-border)] bg-white p-5">
            <SectionHeader
              title="Data Diri Tentor"
              description="Identitas tentor yang dipakai pada kelompok belajar dan laporan"
            />
            <div className="mt-4 grid gap-3.5 md:grid-cols-2">
              <FormField
                id="tutor-name"
                label="Nama"
                value={form.name}
                required
                error={submitted ? validation.errors.name : undefined}
                onChange={(value) => updateField("name", value)}
              />
              <FormField
                id="tutor-phone"
                label="Nomor HP"
                value={form.phoneNumber}
                required
                error={submitted ? validation.errors.phoneNumber : undefined}
                placeholder="81234567890"
                isPhone
                type="tel"
                onChange={(value) => updateField("phoneNumber", value)}
              />
              <FormField
                id="tutor-email"
                label="Email"
                value={form.email}
                required
                error={submitted ? validation.errors.email : undefined}
                placeholder="nama@email.com"
                type="email"
                onChange={(value) => updateField("email", value)}
              />
              <FormField
                id="tutor-address"
                label="Alamat"
                value={form.address}
                required
                error={submitted ? validation.errors.address : undefined}
                placeholder="Jl. Melati No. 12, Bandung"
                onChange={(value) => updateField("address", value)}
              />
              <FormField
                id="tutor-expertise"
                label="Keahlian"
                value={form.expertise}
                required
                placeholder="Matematika, Bahasa Inggris"
                error={submitted ? validation.errors.expertise : undefined}
                onChange={(value) => updateField("expertise", value)}
              />
              <FormField
                id="tutor-education"
                label="Jurusan"
                value={form.education}
                required
                placeholder="Pendidikan Matematika"
                error={submitted ? validation.errors.education : undefined}
                onChange={(value) => updateField("education", value)}
              />
            </div>
          </section>

          <section className="rounded-lg border border-[var(--color-border)] bg-white p-5">
            <SectionHeader
              title="Data Rekening Tentor"
              description={"Dipakai untuk invoice atau penggajian"}
            />
            <div className="mt-4 grid gap-3.5 md:grid-cols-3">
              <FormField
                id="tutor-bank"
                label="Bank / E-Wallet"
                value={form.bankName}
                required
                placeholder="Contoh: BCA, Mandiri, GoPay"
                error={submitted ? validation.errors.bankName : undefined}
                onChange={(value) => updateField("bankName", value)}
              />
              <FormField
                id="tutor-account-name"
                label="Atas Nama"
                value={form.accountName}
                required
                error={submitted ? validation.errors.accountName : undefined}
                placeholder="Tentor"
                onChange={(value) => updateField("accountName", value)}
              />
              <FormField
                id="tutor-account-number"
                label="Nomor Rekening"
                value={form.accountNumber}
                required
                error={submitted ? validation.errors.accountNumber : undefined}
                placeholder="12345678"
                inputMode="numeric"
                onChange={(value) => updateField("accountNumber", value)}
              />
            </div>
          </section>
        </fieldset>

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

        <footer className="flex max-w-full flex-col gap-3 bg-white py-3 sm:min-h-14 sm:flex-row sm:items-center sm:justify-end sm:py-0">
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              disabled={isPending}
              className="inline-flex h-9 items-center justify-center rounded-md border border-[var(--color-border)] bg-white px-4 focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 text-[13px] font-semibold text-[var(--color-text)]"
              onClick={closeForm}
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex h-9 items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-gray-50)] px-4 text-[13px] font-semibold text-[var(--color-gray-400)] enabled:border-[var(--color-primary)] enabled:bg-[var(--color-primary)] enabled:text-white focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              disabled={!canSubmit}
            >
              {isPending ? "Menyimpan..." : tutor ? "Simpan Perubahan" : "Simpan Tentor"}
            </button>
          </div>
        </footer>
      </form>
    </div>
  );

  return (
    <TutorDialog isPending={isPending} onDismiss={closeForm}>
      {content}
    </TutorDialog>
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
  isPhone = false,
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
  isPhone?: boolean;
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
        isPhone={isPhone}
        aria-required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`h-[42px] rounded-md bg-white px-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] ${error
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

function normalizeTutorPhoneNumber(value: string) {
  return value.replace(/\D/g, '').replace(/^(?:62|0+)/, '');
}

function getMutationError(error: unknown) {
  if (error instanceof ApiError && error.status === 403) return 'Anda tidak memiliki izin untuk mengubah data tentor.';
  return "Data tentor belum dapat disimpan. Silakan coba lagi.";
}
