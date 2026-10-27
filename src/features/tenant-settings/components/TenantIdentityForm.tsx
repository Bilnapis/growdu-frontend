import { getImageDimensions } from '@/lib/image-dimensions'
import { type ChangeEvent, type FormEvent, useEffect, useState } from 'react'
import { Upload } from 'lucide-react'
import { ValidationError } from 'yup'
import { LogoCropDialog } from '@/components/LogoCropDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { OwnedTenant } from '@/features/tenant-context/api/tenant-context-api'
import { uploadTenantLogo } from '../api/tenant-settings-api'
import { useUpdateTenantSettings } from '../hooks/use-update-tenant-settings'
import {
  normalizeWebsite,
  tenantIdentitySchema,
} from '../schemas/tenant-settings-schema'
import { settingsError } from '../utils/settings-error'

const maxLogoBytes = 2 * 1024 * 1024
const fields = [
  {
    name: 'name',
    label: 'Nama Bimbel',
    type: 'text',
    maxLength: 150,
    autoComplete: 'organization',
  },
  {
    name: 'whatsappNumber',
    label: 'No. Telepon / WhatsApp',
    type: 'tel',
    maxLength: 20,
    autoComplete: 'tel',
  },
  {
    name: 'email',
    label: 'Email Bimbel',
    type: 'email',
    maxLength: 150,
    autoComplete: 'email',
  },
  {
    name: 'websiteUrl',
    label: 'Website',
    type: 'text',
    maxLength: 500,
    autoComplete: 'url',
  },
] as const

export function TenantIdentityForm({ tenant }: { tenant: OwnedTenant }) {
  const [values, setValues] = useState({
    name: tenant.name,
    whatsappNumber: tenant.whatsappNumber ?? '',
    email: tenant.email ?? '',
    websiteUrl: tenant.websiteUrl ?? '',
    address: tenant.address ?? '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState(tenant.logoUrl)
  const [uploadedLogo, setUploadedLogo] = useState<string | null>(null)
  const [cropSource, setCropSource] = useState<File | null>(null)
  const updateMutation = useUpdateTenantSettings()

  useEffect(
    () => () => {
      if (logoPreview?.startsWith('blob:')) URL.revokeObjectURL(logoPreview)
    },
    [logoPreview],
  )

  function selectLogo(file: File) {
    setLogoFile(file)
    setUploadedLogo(null)
    setLogoPreview(URL.createObjectURL(file))
    setSuccess(false)
  }

  async function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setError('')
    if (
      !['image/png', 'image/jpeg'].includes(file.type) ||
      file.size > maxLogoBytes
    ) {
      setError('Pilih gambar PNG atau JPEG maksimal 2 MB.')
      return
    }
    try {
      const { width, height } = await getImageDimensions(file)
      if (width !== height) setCropSource(file)
      else selectLogo(file)
    } catch {
      setError('File logo tidak dapat dibaca sebagai gambar.')
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSaving) return
    setError('')
    setErrors({})
    setSuccess(false)
    let validated
    try {
      validated = tenantIdentitySchema.validateSync(
        { ...values, websiteUrl: normalizeWebsite(values.websiteUrl) },
        { abortEarly: false },
      )
    } catch (validationError) {
      if (validationError instanceof ValidationError) {
        setErrors(
          Object.fromEntries(
            validationError.inner.map((item) => [
              item.path ?? 'form',
              item.message,
            ]),
          ),
        )
        setError('Periksa kembali isian yang ditandai.')
      }
      return
    }
    setIsSaving(true)
    try {
      let logoUrl = uploadedLogo
      if (logoFile && !logoUrl) {
        const uploaded = await uploadTenantLogo(logoFile)
        logoUrl = uploaded.logoUrl
        setUploadedLogo(logoUrl)
      }
      await updateMutation.mutateAsync({
        name: validated.name,
        whatsappNumber: validated.whatsappNumber ?? null,
        email: validated.email ?? null,
        websiteUrl: validated.websiteUrl ?? null,
        address: validated.address ?? null,
        ...(logoUrl ? { logoUrl } : {}),
      })
      setLogoFile(null)
      setUploadedLogo(null)
      if (logoUrl) setLogoPreview(logoUrl)
      setSuccess(true)
    } catch (mutationError) {
      setError(settingsError(mutationError))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <form
        className="tenant-settings-panel"
        onSubmit={(event) => void handleSubmit(event)}
        noValidate
        aria-busy={isSaving}
        onChange={() => setSuccess(false)}
      >
        <h2 className="text-xl font-semibold">Ubah Data Bimbel</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Pengaturan logo, identitas lembaga, alamat, dan kontak.
        </p>
        <fieldset disabled={isSaving} className="mt-6 grid min-w-0 gap-6">
          <legend className="sr-only">Identitas Bimbel</legend>
          <div className="flex flex-wrap items-center gap-5">
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Pratinjau logo bimbel"
                className="h-24 w-24 rounded-lg border border-border object-contain"
              />
            ) : (
              <div
                className="grid h-24 w-24 place-items-center rounded-lg bg-primary text-2xl font-bold text-primary-foreground"
                aria-label="Inisial bimbel"
              >
                {values.name
                  .trim()
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((word) => word[0])
                  .join('')
                  .toUpperCase() || 'B'}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold">Logo Bimbel</p>
              <p
                id="tenant-logo-hint"
                className="mt-1 text-xs leading-5 text-muted-foreground"
              >
                PNG atau JPEG, resolusi optimal 300×300, maksimal 2 MB.
              </p>
              <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-md border border-primary px-3 py-2 text-sm font-medium text-primary-text focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                <Upload size={15} aria-hidden="true" /> Ubah Logo
                <input
                  className="sr-only"
                  type="file"
                  accept="image/png,image/jpeg"
                  aria-label="Ubah logo bimbel"
                  aria-describedby="tenant-logo-hint"
                  onChange={(event) => void handleLogoChange(event)}
                />
              </label>
            </div>
          </div>
          <h3 className="text-sm font-semibold">Identitas Bimbel</h3>
          <div className="grid gap-5 sm:grid-cols-2">
            {fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={`tenant-${field.name}`}>{field.label}</Label>
                <Input
                  id={`tenant-${field.name}`}
                  name={field.name}
                  type={field.type}
                  autoComplete={field.autoComplete}
                  maxLength={field.maxLength}
                  required={field.name === 'name'}
                  value={values[field.name]}
                  onChange={(event) =>
                    setValues({ ...values, [field.name]: event.target.value })
                  }
                  aria-invalid={Boolean(errors[field.name])}
                  aria-describedby={
                    errors[field.name]
                      ? `tenant-${field.name}-error`
                      : undefined
                  }
                />
                {errors[field.name] ? (
                  <p
                    id={`tenant-${field.name}-error`}
                    className="text-xs text-destructive"
                  >
                    {errors[field.name]}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Label htmlFor="tenant-address">Alamat Bimbel</Label>
            <textarea
              id="tenant-address"
              name="address"
              autoComplete="street-address"
              maxLength={5000}
              rows={3}
              className="tenant-settings-textarea"
              value={values.address}
              onChange={(event) =>
                setValues({ ...values, address: event.target.value })
              }
              aria-invalid={Boolean(errors.address)}
              aria-describedby={
                errors.address ? 'tenant-address-error' : undefined
              }
            />
            {errors.address ? (
              <p id="tenant-address-error" className="text-xs text-destructive">
                {errors.address}
              </p>
            ) : null}
          </div>
          <div className="flex justify-end">
            <Button type="submit">
              {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </fieldset>
        {error ? (
          <p role="alert" className="mt-4 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        {success ? (
          <p role="status" className="mt-4 text-sm text-[var(--color-success)]">
            Data bimbel berhasil disimpan.
          </p>
        ) : null}
      </form>
      {cropSource ? (
        <LogoCropDialog
          file={cropSource}
          maxBytes={maxLogoBytes}
          onCancel={() => setCropSource(null)}
          onComplete={(file) => {
            selectLogo(file)
            setCropSource(null)
          }}
        />
      ) : null}
    </>
  )
}
