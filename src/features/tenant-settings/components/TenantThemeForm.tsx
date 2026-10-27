import { type FormEvent, useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUpdateTenantSettings } from '../hooks/use-update-tenant-settings'
import {
  colorHsl,
  defaultPrimaryColor,
  getThemeTokens,
  isHexColor,
  themePresets,
  withHue,
} from '../utils/theme'
import { settingsError } from '../utils/settings-error'

export function TenantThemeForm({
  primaryColor,
  tenantName,
}: {
  primaryColor: string
  tenantName: string
}) {
  const [hexInput, setHexInput] = useState(primaryColor || defaultPrimaryColor)
  const [previewColor, setPreviewColor] = useState(
    primaryColor || defaultPrimaryColor,
  )
  const [success, setSuccess] = useState(false)
  const mutation = useUpdateTenantSettings()
  const valid = isHexColor(hexInput)

  function changeColor(color: string) {
    setHexInput(color)
    if (isHexColor(color)) setPreviewColor(color.toUpperCase())
    setSuccess(false)
    mutation.reset()
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!valid || mutation.isPending) return
    setSuccess(false)
    try {
      await mutation.mutateAsync({ primaryColor: hexInput.toUpperCase() })
      setSuccess(true)
    } catch {
      /* Error is rendered from the mutation state. */
    }
  }

  return (
    <form
      className="tenant-settings-panel"
      onSubmit={(event) => void handleSubmit(event)}
      aria-busy={mutation.isPending}
    >
      <h2 className="text-xl font-semibold">Warna Tema Sistem</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Pilih warna aksen utama untuk identitas visual bimbel Anda.
      </p>
      <fieldset
        disabled={mutation.isPending}
        className="mt-6 grid min-w-0 gap-6"
      >
        <legend className="sr-only">Pilihan warna tema</legend>
        <div className="rounded-md border border-border bg-[var(--color-bg-light)] p-4">
          <Label htmlFor="tenant-theme-hue">Pilih warna kustom</Label>
          <input
            id="tenant-theme-hue"
            type="range"
            min={0}
            max={359}
            step={1}
            value={Math.round(colorHsl(previewColor).hue)}
            onChange={(event) =>
              changeColor(withHue(previewColor, Number(event.target.value)))
            }
            className="tenant-theme-hue mt-4"
            aria-valuetext={`${Math.round(colorHsl(previewColor).hue)} derajat`}
          />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span
              className="h-9 w-9 shrink-0 rounded border border-border"
              style={{ backgroundColor: previewColor }}
              aria-hidden="true"
            />
            <div className="w-36">
              <Label className="sr-only" htmlFor="tenant-theme-hex">
                Kode warna HEX
              </Label>
              <Input
                id="tenant-theme-hex"
                value={hexInput}
                maxLength={7}
                spellCheck={false}
                onChange={(event) =>
                  changeColor(event.target.value.toUpperCase())
                }
                aria-invalid={!valid}
                aria-describedby="tenant-theme-hint"
              />
            </div>
            <p
              id="tenant-theme-hint"
              className={`text-xs ${valid ? 'text-muted-foreground' : 'text-destructive'}`}
            >
              {valid
                ? 'Geser spektrum atau masukkan kode HEX.'
                : 'Gunakan format #RRGGBB, contoh #1F8FE5.'}
            </p>
          </div>
        </div>
        <fieldset className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          <legend className="sr-only">Preset warna tema</legend>
          {themePresets.map((preset) => (
            <label
              key={preset.color}
              className={`tenant-theme-option ${valid && hexInput.toUpperCase() === preset.color ? 'tenant-theme-option-selected' : ''}`}
            >
              <input
                className="sr-only"
                type="radio"
                name="tenant-theme-preset"
                value={preset.color}
                checked={valid && hexInput.toUpperCase() === preset.color}
                onChange={() => changeColor(preset.color)}
              />
              <span
                className="relative grid h-9 w-9 place-items-center rounded-full border border-black/10"
                style={{ backgroundColor: preset.color }}
              >
                {valid && hexInput.toUpperCase() === preset.color ? (
                  <Check
                    size={18}
                    style={{ color: 'white' }}
                    aria-hidden="true"
                  />
                ) : null}
              </span>
              <span className="text-xs font-medium">{preset.name}</span>
            </label>
          ))}
        </fieldset>
        <section
          className="rounded-md border border-border bg-[var(--color-bg-light)] p-4"
          aria-label="Preview tampilan tema"
          style={getThemeTokens(previewColor)}
        >
          <h3 className="text-sm font-semibold">Preview Tampilan</h3>
          <div className="mt-4 overflow-hidden rounded-md border border-border bg-card">
            <div className="bg-primary px-4 py-3 text-sm font-semibold text-white">
              {tenantName}
            </div>
            <div className="flex flex-wrap items-center gap-4 p-4">
              <span className="rounded bg-[var(--color-primary-soft)] px-4 py-2 text-xs font-medium text-primary-text">
                Dashboard
              </span>
              <Button
                type="button"
                tabIndex={-1}
                aria-disabled="true"
                className="pointer-events-none"
              >
                Simpan Data
              </Button>
            </div>
          </div>
        </section>
        <div className="flex justify-end">
          <Button type="submit" disabled={!valid || mutation.isPending}>
            {mutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </div>
      </fieldset>
      {mutation.isError ? (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {settingsError(mutation.error)}
        </p>
      ) : null}
      {success ? (
        <p role="status" className="mt-4 text-sm text-[var(--color-success)]">
          Warna tema berhasil disimpan.
        </p>
      ) : null}
    </form>
  )
}
