import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Cropper, { type Area } from "react-easy-crop";
import { Building2, Pencil, Search, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type CreatePlatformTenantInput,
  type PlatformManagedTenant,
  type PlatformTenantStatus,
} from "@/features/platform-admin/api/platform-admin-api";
import {
  useCreatePlatformTenant,
  useManagedPlatformTenants,
  usePlatformTenantOwners,
  useUploadPlatformTenantLogo,
  useUpdatePlatformTenant,
} from "@/features/platform-admin/hooks/use-platform-users";
import { ApiError } from "@/services/api-client";

type PlatformTenantManagementProps = {
  filters: {
    page: number;
    search?: string;
    status?: PlatformTenantStatus;
  };
  onFiltersChange: (filters: PlatformTenantManagementProps["filters"]) => void;
  isCreateDialogOpen: boolean;
  onCreateDialogOpenChange: (isOpen: boolean) => void;
};

export function PlatformTenantManagement({
  filters,
  onFiltersChange,
  isCreateDialogOpen,
  onCreateDialogOpenChange,
}: PlatformTenantManagementProps) {
  const [selectedTenant, setSelectedTenant] =
    useState<PlatformManagedTenant | null>(null);
  const tenantsQuery = useManagedPlatformTenants({ ...filters, limit: 20 });

  function handleFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const search = getRequiredFormValue(formData, "search");
    const status = getTenantStatus(formData.get("status"));
    onFiltersChange({
      page: 1,
      ...(search ? { search } : {}),
      ...(status ? { status } : {}),
    });
  }

  if (tenantsQuery.isPending) return <LoadingState />;
  if (tenantsQuery.isError) return <ErrorState />;

  const tenants = tenantsQuery.data?.data ?? [];

  return (
    <div className="space-y-5">
      <form
        className="grid gap-3 md:grid-cols-[minmax(0,1fr)_10rem_auto]"
        onSubmit={handleFilterSubmit}
      >
        <div className="relative">
          <Label htmlFor="platform-tenant-search" className="sr-only">
            Cari bimbel
          </Label>
          <Search
            className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="platform-tenant-search"
            name="search"
            defaultValue={filters.search}
            placeholder="Cari bimbel atau owner"
            className="pl-9"
          />
        </div>
        <select
          name="status"
          defaultValue={filters.status ?? ""}
          aria-label="Filter status"
          className="h-11 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="">Semua status</option>
          <option value="active">Aktif</option>
          <option value="inactive">Nonaktif</option>
        </select>
        <Button type="submit">Terapkan</Button>
      </form>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[48rem] text-left text-sm">
              <caption className="sr-only">Daftar bimbel atau tenant</caption>
              <thead className="border-b bg-muted/50 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Bimbel
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Owner
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Kontak
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3">
                    <span className="sr-only">Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {tenants.map((tenant) => (
                  <tr key={tenant.id} className="bg-card">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <TenantLogo tenant={tenant} />
                        <span className="font-medium">{tenant.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="block font-medium">
                        {tenant.ownerName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {tenant.ownerEmail}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {tenant.email ?? tenant.whatsappNumber ?? "-"}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={tenant.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTenant(tenant)}
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {tenants.length === 0 ? <EmptyState /> : null}
          {tenantsQuery.data ? (
            <Pagination
              page={tenantsQuery.data.meta.page}
              total={tenantsQuery.data.meta.total}
              totalPages={tenantsQuery.data.meta.totalPages}
              onPageChange={(page) => onFiltersChange({ ...filters, page })}
            />
          ) : null}
        </CardContent>
      </Card>

      {isCreateDialogOpen ? (
        <TenantFormDialog onClose={() => onCreateDialogOpenChange(false)} />
      ) : null}
      {selectedTenant ? (
        <TenantFormDialog
          tenant={selectedTenant}
          onClose={() => setSelectedTenant(null)}
        />
      ) : null}
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

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t px-6 py-4 text-sm">
      <span className="text-muted-foreground">{total} bimbel</span>
      <div className="flex items-center gap-3">
        <span className="text-muted-foreground">
          Halaman {page} dari {totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Sebelumnya
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Berikutnya
        </Button>
      </div>
    </div>
  );
}

function TenantFormDialog({
  tenant,
  onClose,
}: {
  tenant?: PlatformManagedTenant;
  onClose: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const ownersQuery = usePlatformTenantOwners();
  const createMutation = useCreatePlatformTenant();
  const updateMutation = useUpdatePlatformTenant();
  const uploadLogoMutation = useUploadPlatformTenantLogo();
  const [ownerId, setOwnerId] = useState(tenant?.ownerId ?? "");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(
    tenant?.logoUrl ?? null,
  );
  const [cropSource, setCropSource] = useState<File | null>(null);
  const isEditing = tenant !== undefined;
  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    uploadLogoMutation.isPending;

  useEffect(() => {
    return () => {
      if (logoPreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreviewUrl);
      }
    };
  }, [logoPreviewUrl]);

  const hasCurrentOwnerOption =
    !tenant?.ownerId ||
    ownersQuery.data?.some((owner) => owner.id === tenant.ownerId);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    const selectedOwnerId = getRequiredFormValue(formData, "ownerId");
    if (!selectedOwnerId) {
      setError("Pilih owner untuk bimbel ini.");
      return;
    }

    let logoUrl = tenant?.logoUrl ?? null;
    if (logoFile) {
      try {
        const response = await uploadLogoMutation.mutateAsync(logoFile);
        logoUrl = response.logoUrl;
      } catch (mutationError) {
        console.log(mutationError);
        setError(getErrorMessage(mutationError));
        return;
      }
    }

    const input: CreatePlatformTenantInput = {
      ownerId: selectedOwnerId,
      name: getRequiredFormValue(formData, "name"),
      address: getNullableFormValue(formData, "address"),
      whatsappNumber: getNullableFormValue(formData, "whatsappNumber"),
      email: getNullableFormValue(formData, "email"),
      logoUrl,
      status: getStatus(formData.get("status")),
    };

    if (isEditing) {
      updateMutation.mutate(
        { id: tenant.id, input },
        {
          onSuccess: onClose,
          onError: (mutationError) => setError(getErrorMessage(mutationError)),
        },
      );
      return;
    }

    createMutation.mutate(input, {
      onSuccess: onClose,
      onError: (mutationError) => setError(getErrorMessage(mutationError)),
    });
  }

  async function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setError("Logo harus berupa gambar PNG atau JPEG.");
      event.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran logo maksimal 5 MB.");
      event.target.value = "";
      return;
    }

    try {
      const { width, height } = await getImageDimensions(file);
      if (width !== height) {
        setCropSource(file);
        event.target.value = "";
        return;
      }
    } catch {
      setError("File logo tidak dapat dibaca sebagai gambar.");
      event.target.value = "";
      return;
    }

    selectLogoFile(file);
  }

  function selectLogoFile(file: File) {
    setLogoFile(file);
    setLogoPreviewUrl(URL.createObjectURL(file));
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
      role="presentation"
    >
      <section
        className="w-full max-w-2xl overflow-hidden rounded-lg bg-background shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="platform-tenant-dialog-title"
      >
        <div className="create-platform-user-modal-scroll max-h-[calc(100vh-2rem)] overflow-y-auto p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2
                id="platform-tenant-dialog-title"
                className="text-xl font-semibold"
              >
                {isEditing ? "Edit bimbel" : "Tambah bimbel"}
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {isEditing
                  ? "Perbarui informasi dan status operasional bimbel."
                  : "Lengkapi data bimbel sebelum menambahkannya ke platform."}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              disabled={isPending}
              aria-label="Tutup form bimbel"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </Button>
          </div>

          <form
            className="mt-7 space-y-5"
            onSubmit={(event) => void handleSubmit(event)}
          >
            <div className="grid gap-2">
              <Label htmlFor="platform-tenant-owner">Owner</Label>
              <select
                id="platform-tenant-owner"
                name="ownerId"
                value={ownerId}
                onChange={(event) => setOwnerId(event.target.value)}
                required
                disabled={
                  isPending || ownersQuery.isPending || ownersQuery.isError
                }
                className="h-11 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">
                  {ownersQuery.isPending
                    ? "Memuat owner..."
                    : ownersQuery.isError
                      ? "Owner tidak dapat dimuat"
                      : "Pilih owner"}
                </option>
                {!hasCurrentOwnerOption && tenant ? (
                  <option value={tenant.ownerId}>
                    {tenant.ownerName} ({tenant.ownerEmail})
                  </option>
                ) : null}
                {ownersQuery.data?.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name} ({owner.email})
                  </option>
                ))}
              </select>
              {ownersQuery.data?.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Buat akun owner aktif terlebih dahulu dari menu Pengguna.
                </p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="platform-tenant-name">Nama Bimbel</Label>
              <Input
                id="platform-tenant-name"
                name="name"
                defaultValue={tenant?.name ?? ""}
                minLength={2}
                maxLength={150}
                required
                disabled={isPending}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="platform-tenant-address">Alamat</Label>
              <textarea
                id="platform-tenant-address"
                name="address"
                defaultValue={tenant?.address ?? ""}
                maxLength={5000}
                disabled={isPending}
                className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="platform-tenant-whatsapp">Nomor WhatsApp</Label>
                <Input
                  id="platform-tenant-whatsapp"
                  name="whatsappNumber"
                  type="tel"
                  defaultValue={tenant?.whatsappNumber ?? ""}
                  maxLength={20}
                  disabled={isPending}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="platform-tenant-email">Email Bimbel</Label>
                <Input
                  id="platform-tenant-email"
                  name="email"
                  type="email"
                  defaultValue={tenant?.email ?? ""}
                  maxLength={150}
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 items-start">
              <div className="grid gap-2">
                <Label htmlFor="platform-tenant-logo">Logo bimbel</Label>
                <Input
                  id="platform-tenant-logo"
                  name="logo"
                  type="file"
                  accept="image/png,image/jpeg"
                  disabled={isPending}
                  onChange={(event) => void handleLogoChange(event)}
                />
                <p className="text-xs text-muted-foreground">
                  PNG atau JPEG, maksimal 5 MB, dengan rasio 1:1.
                </p>
                {logoPreviewUrl ? (
                  <img
                    src={logoPreviewUrl}
                    alt="Pratinjau logo bimbel"
                    className="aspect-square w-24 rounded-md border object-cover"
                  />
                ) : null}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="platform-tenant-status">Status</Label>
                <select
                  id="platform-tenant-status"
                  name="status"
                  defaultValue={tenant?.status ?? "active"}
                  disabled={isPending}
                  className="h-11 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
              </div>
            </div>

            {error ? (
              <p
                className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                role="alert"
              >
                {error}
              </p>
            ) : null}

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={
                  isPending ||
                  ownersQuery.isPending ||
                  ownersQuery.isError ||
                  ownersQuery.data?.length === 0
                }
              >
                {isPending
                  ? "Menyimpan..."
                  : isEditing
                    ? "Simpan perubahan"
                    : "Tambah bimbel"}
              </Button>
            </div>
          </form>
        </div>
      </section>
      {cropSource ? (
        <LogoCropDialog
          file={cropSource}
          onCancel={() => setCropSource(null)}
          onComplete={(croppedFile) => {
            selectLogoFile(croppedFile);
            setCropSource(null);
          }}
        />
      ) : null}
    </div>,
    document.body,
  );
}

function LogoCropDialog({
  file,
  onCancel,
  onComplete,
}: {
  file: File;
  onCancel: () => void;
  onComplete: (file: File) => void;
}) {
  const [imageUrl] = useState(() => URL.createObjectURL(file));
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  async function handleComplete() {
    if (!imageUrl || !croppedAreaPixels) return;

    try {
      const croppedFile = await createCroppedImageFile(file, croppedAreaPixels);
      if (croppedFile.size > 5 * 1024 * 1024) {
        setError("Hasil crop melebihi ukuran maksimum 5 MB.");
        return;
      }
      onComplete(croppedFile);
    } catch {
      setError("Gagal membuat gambar hasil crop. Silakan coba lagi.");
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4"
      role="presentation"
    >
      <section
        className="w-full max-w-lg rounded-lg bg-background p-5 shadow-xl sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="platform-tenant-logo-crop-title"
      >
        <h2
          id="platform-tenant-logo-crop-title"
          className="text-xl font-semibold"
        >
          Atur crop logo
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Geser gambar untuk memilih area logo, lalu gunakan zoom bila
          diperlukan.
        </p>

        <div
          className="relative mt-5 h-80 overflow-hidden rounded-md bg-muted sm:h-96"
          role="group"
          aria-label="Area crop logo"
        >
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={1}
            showGrid
            onCropChange={setCrop}
            onCropComplete={(_area, pixels) => setCroppedAreaPixels(pixels)}
            onZoomChange={setZoom}
          />
        </div>

        <div className="mt-5 grid gap-2">
          <Label htmlFor="platform-tenant-logo-zoom">Perbesar gambar</Label>
          <input
            id="platform-tenant-logo-zoom"
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
          />
        </div>

        {error ? (
          <p
            className="mt-5 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <Button
            type="button"
            disabled={!croppedAreaPixels}
            onClick={() => void handleComplete()}
          >
            Gunakan hasil crop
          </Button>
        </div>
      </section>
    </div>,
    document.body,
  );
}

function createCroppedImageFile(
  sourceFile: File,
  cropArea: Area,
): Promise<File> {
  return createImageBitmap(sourceFile).then(async (image) => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(cropArea.width);
      canvas.height = Math.round(cropArea.height);
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas is not supported");

      context.drawImage(
        image,
        cropArea.x,
        cropArea.y,
        cropArea.width,
        cropArea.height,
        0,
        0,
        canvas.width,
        canvas.height,
      );

      return await createImageFileFromCanvas(canvas, sourceFile);
    } finally {
      image.close();
    }
  });
}

function createImageFileFromCanvas(
  canvas: HTMLCanvasElement,
  sourceFile: File,
): Promise<File> {
  const outputType =
    sourceFile.type === "image/png" ? "image/png" : "image/jpeg";
  const extension = outputType === "image/png" ? "png" : "jpg";
  const baseName = sourceFile.name.replace(/\.[^.]+$/, "") || "logo";

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Unable to create cropped image"));
          return;
        }
        resolve(
          new File([blob], `${baseName}-cropped.${extension}`, {
            type: outputType,
          }),
        );
      },
      outputType,
      outputType === "image/jpeg" ? 0.92 : undefined,
    );
  });
}

function getImageDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  const imageUrl = URL.createObjectURL(file);

  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(imageUrl);
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = () => {
      URL.revokeObjectURL(imageUrl);
      reject(new Error("Unable to read image"));
    };
    image.src = imageUrl;
  });
}

function StatusBadge({ status }: { status: PlatformManagedTenant["status"] }) {
  return (
    <Badge variant={status === "active" ? "success" : "secondary"}>
      {status === "active" ? "Aktif" : "Nonaktif"}
    </Badge>
  );
}

function TenantLogo({ tenant }: { tenant: PlatformManagedTenant }) {
  if (tenant.logoUrl) {
    return (
      <img
        src={tenant.logoUrl}
        alt={`Logo ${tenant.name}`}
        className="h-10 w-10 shrink-0 rounded-md border object-cover"
      />
    );
  }

  return (
    <span
      className="grid h-10 w-10 shrink-0 place-items-center rounded-md border bg-muted text-muted-foreground"
      aria-hidden="true"
    >
      <Building2 className="h-5 w-5" />
    </span>
  );
}

function LoadingState() {
  return (
    <Card>
      <CardContent className="grid min-h-64 place-items-center text-sm text-muted-foreground">
        Memuat daftar bimbel...
      </CardContent>
    </Card>
  );
}

function ErrorState() {
  return (
    <Card>
      <CardContent className="grid min-h-64 place-items-center text-center">
        <div>
          <Building2
            className="mx-auto h-6 w-6 text-destructive"
            aria-hidden="true"
          />
          <p className="mt-3 font-medium">Data bimbel belum dapat dimuat.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Periksa koneksi atau coba lagi.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="grid min-h-48 place-items-center p-6 text-center">
      <div>
        <Building2
          className="mx-auto h-6 w-6 text-muted-foreground"
          aria-hidden="true"
        />
        <p className="mt-3 font-medium">Belum ada bimbel</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Tambahkan bimbel pertama untuk mulai mengelolanya di platform.
        </p>
      </div>
    </div>
  );
}

function getRequiredFormValue(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function getNullableFormValue(formData: FormData, name: string) {
  const value = getRequiredFormValue(formData, name);
  return value || null;
}

function getStatus(value: FormDataEntryValue | null): "active" | "inactive" {
  return value === "inactive" ? "inactive" : "active";
}

function getTenantStatus(
  value: FormDataEntryValue | null,
): PlatformTenantStatus | undefined {
  if (value === "active" || value === "inactive") return value;
  return undefined;
}

function getErrorMessage(error: unknown) {
  return error instanceof ApiError
    ? error.message
    : "Data bimbel belum dapat disimpan. Silakan coba lagi.";
}
