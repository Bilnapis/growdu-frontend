import { type FormEvent, useState } from "react";
import { createPortal } from "react-dom";
import { Pencil, Search, Users, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type CreatePlatformUserInput,
  type PlatformUser,
  type PlatformUserRole,
  type PlatformUserStatus,
} from "@/features/platform-admin/api/platform-admin-api";
import {
  useCreatePlatformUser,
  usePlatformUser,
  usePlatformUsers,
  usePlatformTenants,
  useUpdatePlatformUser,
} from "@/features/platform-admin/hooks/use-platform-users";
import { ApiError } from "@/services/api-client";

type PlatformUserManagementProps = {
  filters: {
    page: number;
    search?: string;
    role?: PlatformUserRole;
    status?: PlatformUserStatus;
  };
  onFiltersChange: (filters: PlatformUserManagementProps["filters"]) => void;
  isCreateDialogOpen: boolean;
  onCreateDialogOpenChange: (isOpen: boolean) => void;
};

const roleLabels: Record<PlatformUserRole, string> = {
  owner: "Owner",
  operator: "Operator",
  tutor: "Tutor",
  parent: "Orang tua",
};

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function PlatformUserManagement({
  filters,
  onFiltersChange,
  isCreateDialogOpen,
  onCreateDialogOpenChange,
}: PlatformUserManagementProps) {
  const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null);
  const usersQuery = usePlatformUsers({ ...filters, limit: 20 });

  function handleFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const search = getFormValue(formData, "search");
    const role = getRole(getFormValue(formData, "role"));
    const status = getStatus(getFormValue(formData, "status"));
    onFiltersChange({
      page: 1,
      ...(search ? { search } : {}),
      ...(role ? { role } : {}),
      ...(status ? { status } : {}),
    });
  }

  return (
    <div className="space-y-6">
      <form
        className="grid gap-3 md:grid-cols-[minmax(0,1fr)_10rem_10rem_auto]"
        onSubmit={handleFilterSubmit}
      >
        <div className="relative">
          <Label htmlFor="platform-user-search" className="sr-only">
            Cari pengguna
          </Label>
          <Search
            className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="platform-user-search"
            name="search"
            defaultValue={filters.search}
            placeholder="Cari email pengguna"
            className="pl-9"
          />
        </div>
        <select
          name="role"
          defaultValue={filters.role ?? ""}
          aria-label="Filter peran"
          className="h-11 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="">Semua peran</option>
          {Object.entries(roleLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
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
          {usersQuery.isPending ? <LoadingState /> : null}
          {usersQuery.isError ? <ErrorState /> : null}
          {usersQuery.data ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[54rem] text-left text-sm">
                  <caption className="sr-only">
                    Daftar pengguna seluruh tenant
                  </caption>
                  <thead className="border-b bg-muted/50 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th scope="col" className="px-6 py-3">
                        Pengguna
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Tenant
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Peran
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Login terakhir
                      </th>
                      <th scope="col" className="px-6 py-3">
                        <span className="sr-only">Aksi</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {usersQuery.data.data.map((user) => (
                      <tr key={user.id} className="bg-card">
                        <td className="px-6 py-4 font-medium">{user.email}</td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {user.role === "owner"
                            ? "Pemilik multi-tenant"
                            : (user.tenantName ?? "Belum terhubung tenant")}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {roleLabels[user.role]}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={user.status} />
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {formatDate(user.lastLoginAt)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedUser(user)}
                          >
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                            Kelola
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {usersQuery.data.data.length === 0 ? <EmptyState /> : null}
              <Pagination
                page={usersQuery.data.meta.page}
                total={usersQuery.data.meta.total}
                totalPages={usersQuery.data.meta.totalPages}
                onPageChange={(page) => onFiltersChange({ ...filters, page })}
              />
            </>
          ) : null}
        </CardContent>
      </Card>

      {selectedUser ? (
        <PlatformUserEditor
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      ) : null}
      {isCreateDialogOpen ? (
        <CreatePlatformUserDialog
          onClose={() => onCreateDialogOpenChange(false)}
        />
      ) : null}
    </div>
  );
}

function CreatePlatformUserDialog({ onClose }: { onClose: () => void }) {
  const [role, setRole] = useState<PlatformUserRole>("operator");
  const [error, setError] = useState<string | null>(null);
  const createMutation = useCreatePlatformUser();
  const tenantsQuery = usePlatformTenants();
  const needsTenant = role !== "owner";
  const needsSessionRate = role === "tutor";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = event.currentTarget;
    const formData = new FormData(form);
    const tenantId = getFormValue(formData, "tenantId");
    const sessionRate = getFormValue(formData, "sessionRate");
    const input: CreatePlatformUserInput = {
      role,
      name: getFormValue(formData, "name"),
      phoneNumber: getFormValue(formData, "phoneNumber"),
      email: getFormValue(formData, "email"),
      password: getFormValue(formData, "password", false),
      ...(needsTenant && tenantId ? { tenantId } : {}),
      ...(needsSessionRate && sessionRate ? { sessionRate } : {}),
    };

    createMutation.mutate(input, {
      onSuccess: () => {
        form.reset();
        onClose();
      },
      onError: (mutationError) => setError(getErrorMessage(mutationError)),
    });
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40"
      role="presentation"
    >
      <section
        className="w-full max-w-xl overflow-hidden rounded-lg bg-background shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-platform-user-title"
      >
        <div className="create-platform-user-modal-scroll max-h-[calc(100vh-2rem)] overflow-y-auto p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2
                id="create-platform-user-title"
                className="mt-1 text-xl font-semibold"
              >
                Tambah pengguna
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Lengkapi input data dibawah ini untuk membuat akun baru
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Tutup form tambah pengguna"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </Button>
          </div>

          <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="new-user-role">Peran</Label>
              <select
                id="new-user-role"
                value={role}
                onChange={(event) =>
                  setRole(event.target.value as PlatformUserRole)
                }
                disabled={createMutation.isPending}
                className="h-11 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {Object.entries(roleLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            {needsTenant ? (
              <div className="grid gap-2">
                <Label htmlFor="new-user-tenant">Tenant</Label>
                <select
                  id="new-user-tenant"
                  name="tenantId"
                  required
                  disabled={
                    createMutation.isPending ||
                    tenantsQuery.isPending ||
                    tenantsQuery.isError
                  }
                  className="h-11 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">
                    {tenantsQuery.isPending
                      ? "Memuat tenant..."
                      : tenantsQuery.isError
                        ? "Tenant tidak dapat dimuat"
                        : "Pilih tenant"}
                  </option>
                  {tenantsQuery.data?.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
                Owner dapat memiliki banyak tenant. Tenant baru dibuat melalui
                akun owner setelah akun aktif.
              </p>
            )}
            <div className="grid gap-2">
              <Label htmlFor="new-user-name">Nama Lengkap</Label>
              <Input
                id="new-user-name"
                name="name"
                minLength={2}
                maxLength={150}
                required
                disabled={createMutation.isPending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-user-phone">Nomor WhatsApp</Label>
              <Input
                id="new-user-phone"
                name="phoneNumber"
                type="tel"
                minLength={6}
                maxLength={20}
                required
                disabled={createMutation.isPending}
              />
            </div>
            {needsSessionRate ? (
              <div className="grid gap-2">
                <Label htmlFor="new-user-session-rate">Tarif per sesi</Label>
                <Input
                  id="new-user-session-rate"
                  name="sessionRate"
                  inputMode="decimal"
                  placeholder="150000.00"
                  pattern="\d{1,10}(\.\d{1,2})?"
                  required
                  disabled={createMutation.isPending}
                />
              </div>
            ) : null}
            <div className="grid gap-2">
              <Label htmlFor="new-user-email">Email</Label>
              <Input
                id="new-user-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={createMutation.isPending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-user-password">Kata Sandi</Label>
              <Input
                id="new-user-password"
                name="password"
                type="password"
                minLength={5}
                maxLength={128}
                autoComplete="new-password"
                required
                disabled={createMutation.isPending}
              />
              <p className="text-xs text-muted-foreground">
                Minimal 5 karakter.
              </p>
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
                  createMutation.isPending ||
                  (needsTenant &&
                    (tenantsQuery.isPending || tenantsQuery.isError))
                }
              >
                {createMutation.isPending ? "Membuat akun..." : "Buat pengguna"}
              </Button>
            </div>
          </form>
        </div>
      </section>
    </div>,
    document.body,
  );
}

function PlatformUserEditor({
  user,
  onClose,
}: {
  user: PlatformUser;
  onClose: () => void;
}) {
  const updateMutation = useUpdatePlatformUser();
  const userQuery = usePlatformUser(user.id);
  const tenantsQuery = usePlatformTenants();
  const [error, setError] = useState<string | null>(null);
  const isPending = updateMutation.isPending;

  function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    const email = getFormValue(formData, "email");
    const status = getStatus(getFormValue(formData, "status"));
    const tenantId = getFormValue(formData, "tenantId");
    const sessionRate = getFormValue(formData, "sessionRate");
    const password = getFormValue(formData, "newPassword", false);
    updateMutation.mutate(
      {
        id: user.id,
        input: {
          email,
          name: getFormValue(formData, "name"),
          phoneNumber: getFormValue(formData, "phoneNumber"),
          ...(status ? { status } : {}),
          ...(user.role !== "owner" && tenantId ? { tenantId } : {}),
          ...(user.role === "tutor" && sessionRate ? { sessionRate } : {}),
          ...(password ? { password } : {}),
        },
      },
      {
        onSuccess: onClose,
        onError: (mutationError) => setError(getErrorMessage(mutationError)),
      },
    );
  }

  if (userQuery.isPending) {
    return createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
        <div className="w-full max-w-xl rounded-lg bg-background p-6 shadow-xl">
          <p className="text-sm text-muted-foreground">Memuat data pengguna...</p>
        </div>
      </div>,
      document.body,
    );
  }

  if (userQuery.isError || !userQuery.data) {
    return createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
        <div className="w-full max-w-xl rounded-lg bg-background p-6 shadow-xl">
          <p className="text-sm text-destructive">
            Data pengguna belum dapat dimuat. Silakan coba lagi.
          </p>
        </div>
      </div>,
      document.body,
    );
  }

  const detail = userQuery.data;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
      role="presentation"
    >
      <section
        className="w-full max-w-xl overflow-hidden rounded-lg bg-background shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="platform-user-editor-title"
      >
        <div className="create-platform-user-modal-scroll max-h-[calc(100vh-2rem)] overflow-y-auto p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="platform-user-editor-title"
              className="mt-1 text-xl font-semibold"
            >
              Edit pengguna
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {roleLabels[user.role]} ·{" "}
              {user.tenantName ?? "Belum terhubung tenant"}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Tutup form edit pengguna"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>

          <form className="mt-7 space-y-5" onSubmit={handleUpdate}>
          <div className="grid gap-2">
            <Label htmlFor="platform-user-role">Peran</Label>
            <select
              id="platform-user-role"
              value={detail.role}
              disabled
              className="h-11 rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground"
            >
              <option value={detail.role}>{roleLabels[detail.role]}</option>
            </select>
            <p className="text-xs text-muted-foreground">
              Peran pengguna tidak dapat diubah setelah akun dibuat.
            </p>
          </div>
          {detail.role !== "owner" ? (
            <div className="grid gap-2">
              <Label htmlFor="platform-user-tenant">Tenant</Label>
              <select
                id="platform-user-tenant"
                name="tenantId"
                defaultValue={detail.tenantId ?? ""}
                required
                disabled={
                  isPending || tenantsQuery.isPending || tenantsQuery.isError
                }
                className="h-11 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">
                  {tenantsQuery.isPending
                    ? "Memuat tenant..."
                    : tenantsQuery.isError
                      ? "Tenant tidak dapat dimuat"
                      : "Pilih tenant"}
                </option>
                {tenantsQuery.data?.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="grid gap-2">
              <Label>Tenant yang dimiliki</Label>
              {detail.ownedTenants.length > 0 ? (
                <ul className="divide-y rounded-md border">
                  {detail.ownedTenants.map((tenant) => (
                    <li
                      key={tenant.id}
                      className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                    >
                      <span>{tenant.name}</span>
                      <Badge
                        variant={
                          tenant.status === "active" ? "success" : "secondary"
                        }
                      >
                        {tenant.status === "active" ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
                  Owner ini belum memiliki tenant. Tenant baru dapat dibuat dari
                  akun owner setelah akun aktif.
                </p>
              )}
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="platform-user-name">Nama lengkap</Label>
            <Input
              id="platform-user-name"
              name="name"
              defaultValue={detail.name}
              minLength={2}
              maxLength={150}
              required
              disabled={isPending}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="platform-user-phone">Nomor WhatsApp</Label>
            <Input
              id="platform-user-phone"
              name="phoneNumber"
              type="tel"
              defaultValue={detail.phoneNumber}
              minLength={6}
              maxLength={20}
              required
              disabled={isPending}
            />
          </div>
          {detail.role === "tutor" ? (
            <div className="grid gap-2">
              <Label htmlFor="platform-user-session-rate">Tarif per sesi</Label>
              <Input
                id="platform-user-session-rate"
                name="sessionRate"
                inputMode="decimal"
                defaultValue={detail.sessionRate ?? ""}
                pattern="\d{1,10}(\.\d{1,2})?"
                required
                disabled={isPending}
              />
            </div>
          ) : null}
          <div className="grid gap-2">
            <Label htmlFor="platform-user-email">Email</Label>
            <Input
              id="platform-user-email"
              name="email"
              type="email"
              defaultValue={detail.email}
              autoComplete="email"
              required
              disabled={isPending}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="platform-user-new-password">Kata sandi baru</Label>
            <Input
              id="platform-user-new-password"
              name="newPassword"
              type="password"
              minLength={5}
              maxLength={128}
              autoComplete="new-password"
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">
              Kosongkan jika kata sandi tidak perlu diubah. Minimal 5 karakter.
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="platform-user-status">Status akses</Label>
            <select
              id="platform-user-status"
              name="status"
              defaultValue={detail.status}
              disabled={isPending}
              className="h-11 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </div>
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={
                isPending ||
                (detail.role !== "owner" &&
                  (tenantsQuery.isPending || tenantsQuery.isError))
              }
            >
              {isPending ? "Menyimpan..." : "Simpan perubahan"}
            </Button>
          </div>
        </form>

        {error ? (
          <p
            className="mt-5 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        </div>
      </section>
    </div>,
    document.body,
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
      <span className="text-muted-foreground">{total} pengguna</span>
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

function StatusBadge({ status }: { status: PlatformUserStatus }) {
  return (
    <Badge variant={status === "active" ? "success" : "secondary"}>
      {status === "active" ? "Aktif" : "Nonaktif"}
    </Badge>
  );
}

function LoadingState() {
  return (
    <div className="grid min-h-64 place-items-center p-6 text-sm text-muted-foreground">
      Memuat pengguna...
    </div>
  );
}

function ErrorState() {
  return (
    <div className="grid min-h-64 place-items-center p-6 text-center">
      <div>
        <Users
          className="mx-auto h-6 w-6 text-destructive"
          aria-hidden="true"
        />
        <p className="mt-3 font-medium">Data pengguna belum dapat dimuat.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Periksa koneksi atau coba lagi.
        </p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="grid min-h-48 place-items-center p-6 text-center">
      <div>
        <Users
          className="mx-auto h-6 w-6 text-muted-foreground"
          aria-hidden="true"
        />
        <p className="mt-3 font-medium">Pengguna tidak ditemukan</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Ubah pencarian atau filter untuk melihat akun lain.
        </p>
      </div>
    </div>
  );
}

function getFormValue(formData: FormData, name: string, trim = true) {
  const value = formData.get(name);
  return typeof value === "string" ? (trim ? value.trim() : value) : "";
}

function getRole(value: string): PlatformUserRole | undefined {
  if (
    value === "owner" ||
    value === "operator" ||
    value === "tutor" ||
    value === "parent"
  )
    return value;
  return undefined;
}

function getStatus(value: string): PlatformUserStatus | undefined {
  return value === "active" || value === "inactive" ? value : undefined;
}

function formatDate(value: string | null) {
  if (!value) return "Belum pernah masuk";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Tidak tersedia"
    : dateFormatter.format(date);
}

function getErrorMessage(error: unknown) {
  return error instanceof ApiError
    ? error.message
    : "Perubahan belum dapat disimpan. Silakan coba lagi.";
}
