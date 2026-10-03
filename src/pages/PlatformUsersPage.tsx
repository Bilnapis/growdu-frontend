import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PlatformUserManagement } from "@/features/platform-admin/components/PlatformUserManagement";
import {
  type PlatformUserRole,
  type PlatformUserStatus,
} from "@/features/platform-admin/api/platform-admin-api";

export function PlatformUsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const role = getRole(searchParams.get("role"));
  const status = getStatus(searchParams.get("status"));
  const search = searchParams.get("search");
  const filters = {
    page: getPage(searchParams.get("page")),
    ...(search ? { search } : {}),
    ...(role ? { role } : {}),
    ...(status ? { status } : {}),
  };

  function handleFiltersChange(nextFilters: typeof filters) {
    const nextSearchParams = new URLSearchParams();
    if (nextFilters.page > 1)
      nextSearchParams.set("page", String(nextFilters.page));
    if (nextFilters.search) nextSearchParams.set("search", nextFilters.search);
    if (nextFilters.role) nextSearchParams.set("role", nextFilters.role);
    if (nextFilters.status) nextSearchParams.set("status", nextFilters.status);
    setSearchParams(nextSearchParams);
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">
          Manajemen pengguna
        </h1>
        <Button type="button" onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Tambah pengguna
        </Button>
      </div>
      <div className="mt-8">
        <PlatformUserManagement
          filters={filters}
          onFiltersChange={handleFiltersChange}
          isCreateDialogOpen={isCreateDialogOpen}
          onCreateDialogOpenChange={setIsCreateDialogOpen}
        />
      </div>
    </div>
  );
}

function getPage(value: string | null) {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function getRole(value: string | null): PlatformUserRole | undefined {
  if (
    value === "owner" ||
    value === "operator" ||
    value === "tutor" ||
    value === "parent"
  )
    return value;
  return undefined;
}

function getStatus(value: string | null): PlatformUserStatus | undefined {
  if (value === "active" || value === "inactive") return value;
  return undefined;
}
