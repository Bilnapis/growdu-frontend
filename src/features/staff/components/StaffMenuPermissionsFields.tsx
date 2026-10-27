import { useId } from 'react'
import { operatorMenus, type OperatorMenu } from '@/lib/menu-access'

type Props = {
  value: OperatorMenu[]
  onChange: (value: OperatorMenu[]) => void
  disabled?: boolean
}

export function StaffMenuPermissionsFields({
  value,
  onChange,
  disabled,
}: Props) {
  const id = useId()

  return (
    <fieldset
      disabled={disabled}
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
      className="min-w-0 space-y-3 rounded-xl border bg-card p-4 sm:px-6 sm:py-[18px]"
    >
      <div className="space-y-1.5">
        <h2 id={`${id}-title`} className="text-lg font-bold leading-[1.3]">
          Hak akses menu
        </h2>
        <p
          id={`${id}-description`}
          className="text-[13px] leading-[1.4] text-muted-foreground"
        >
          Centang menu yang boleh dibuka oleh pegawai ini.
        </p>
      </div>
      <div className="space-y-2.5">
        {operatorMenus.map((menu) => (
          <label
            key={menu.id}
            className="flex min-h-[54px] cursor-pointer items-start gap-2.5 rounded-lg border bg-[var(--color-bg-light)] px-3 py-2.5 has-[:disabled]:cursor-default has-[:disabled]:opacity-60"
          >
            <input
              type="checkbox"
              name="menuPermissions"
              value={menu.id}
              checked={value.includes(menu.id)}
              onChange={(event) =>
                onChange(
                  event.target.checked
                    ? [...value, menu.id]
                    : value.filter((item) => item !== menu.id),
                )
              }
              aria-describedby={`${id}-${menu.id}-description`}
              className="mt-0.5 h-4 w-4 shrink-0 accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
            <span className="min-w-0 space-y-0.5">
              <span className="block text-[13px] font-semibold leading-[1.3]">
                {menu.label}
              </span>
              <span
                id={`${id}-${menu.id}-description`}
                className="block text-xs leading-[1.4] text-muted-foreground"
              >
                {menu.description}
              </span>
            </span>
          </label>
        ))}
      </div>
      {value.length === 0 ? (
        <p
          role="status"
          className="text-xs leading-relaxed text-muted-foreground"
        >
          Tanpa menu terpilih, pegawai dapat masuk tetapi belum dapat membuka
          menu operasional.
        </p>
      ) : null}
    </fieldset>
  )
}
