import { useState } from 'react'
import {
  Dialog,
  DialogBody,
  DialogButton,
  DialogFooter,
  DialogForm,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { saveReportSettings, type ReportSettings } from './api'
import { useReportMutation } from './hooks'
import { dateLabel } from './format'
import { ReportError } from './ReportShared'

export function ReportSettingsDialog({
  settings,
  onClose,
}: {
  settings: ReportSettings
  onClose: () => void
}) {
  const [enabled, setEnabled] = useState(settings.enabled)
  const [day, setDay] = useState(String(settings.generationDay))
  const [version] = useState(settings.version)
  const mutation = useReportMutation(saveReportSettings)
  return (
    <Dialog
      title="Pengaturan Laporan"
      description="Buat draft laporan bulan sebelumnya secara otomatis."
      size="small"
      isPending={mutation.isPending}
      onDismiss={onClose}
    >
      <DialogForm
        onSubmit={(event) => {
          event.preventDefault()
          mutation.mutate(
            { version, enabled, generationDay: Number(day) },
            { onSuccess: onClose },
          )
        }}
      >
        <DialogBody>
          <fieldset disabled={mutation.isPending} className="lr-fields">
            <label className="lr-check">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(event) => setEnabled(event.target.checked)}
              />
              Aktifkan draft otomatis bulanan
            </label>
            <label htmlFor="report-generation-day">
              Tanggal pembuatan setiap bulan
            </label>
            <Input
              id="report-generation-day"
              type="number"
              min={1}
              max={31}
              required
              value={day}
              onChange={(event) => setDay(event.target.value)}
            />
            <p>
              Diproses mulai pukul 00.00 WIB. Jika tanggal tidak tersedia,
              gunakan hari terakhir bulan tersebut.
            </p>
            <p>
              Contoh: tanggal {day || '1'} Oktober membuat draft laporan
              September. Tentor melengkapi isi dan menerbitkan laporannya
              sendiri.
            </p>
          </fieldset>
          {settings.nextRunDate ? (
            <p className="mt-4 text-sm">
              Jadwal berikutnya: {dateLabel(settings.nextRunDate)} · 00.00 WIB
            </p>
          ) : null}
          {settings.lastResult ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Proses terakhir: {dateLabel(settings.lastResult.processedAt)}.{' '}
              {settings.lastResult.created} draft dibuat,{' '}
              {settings.lastResult.skipped} laporan sudah tersedia.
            </p>
          ) : null}
          {mutation.isError ? <ReportError error={mutation.error} /> : null}
        </DialogBody>
        <DialogFooter>
          <DialogButton
            variant="outline"
            disabled={mutation.isPending}
            onClick={onClose}
          >
            Batal
          </DialogButton>
          <DialogButton type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Menyimpan...' : 'Simpan pengaturan'}
          </DialogButton>
        </DialogFooter>
      </DialogForm>
    </Dialog>
  )
}
