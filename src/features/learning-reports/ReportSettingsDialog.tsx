import { useState } from 'react'
import {
  Dialog,
  DialogBody,
  DialogButton,
  DialogFooter,
  DialogForm,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { FormSection } from '@/components/ui/form-section'
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
          <FormSection
            title="Pembuatan Laporan Otomatis"
            description="Atur pembuatan draft laporan bulanan untuk dilengkapi oleh tentor."
          >
            <div className="space-y-3.5 text-[13px]">
              <fieldset
                disabled={mutation.isPending}
                className="grid min-w-0 gap-3.5"
              >
                <legend className="sr-only">Jadwal laporan otomatis</legend>
                <label className="lr-check">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(event) => setEnabled(event.target.checked)}
                  />
                  Aktifkan draft otomatis bulanan
                </label>
                <div className="grid min-w-0 gap-2 [&_label]:font-semibold [&_p]:text-xs [&_p]:text-muted-foreground">
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
                </div>
              </fieldset>
              {settings.nextRunDate ? (
                <p className="text-[13px]">
                  Jadwal berikutnya: {dateLabel(settings.nextRunDate)} · 00.00
                  WIB
                </p>
              ) : null}
              {settings.lastResult ? (
                <p className="text-xs text-muted-foreground">
                  Proses terakhir: {dateLabel(settings.lastResult.processedAt)}.{' '}
                  {settings.lastResult.created} draft dibuat,{' '}
                  {settings.lastResult.skipped} laporan sudah tersedia.
                </p>
              ) : null}
            </div>
          </FormSection>
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
