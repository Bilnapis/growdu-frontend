import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import type { ReportGroupDetail } from './api'
import { useReportGroupOptions } from './hooks'
import { ReportError } from './ReportShared'

export function ReportSelectionFields({
  group,
  period,
  tutorId,
  onChange,
}: {
  group?: ReportGroupDetail
  period: string
  tutorId?: string
  onChange: (groupId: string, period: string, tutorId?: string) => void
}) {
  const options = useReportGroupOptions(period)
  const groups = options.data?.pages.flatMap((page) => page.data) ?? []
  return (
    <>
      <div className="lr-field">
        <label htmlFor="report-group">Kelompok belajar *</label>
        <Select
          id="report-group"
          value={group?.id ?? ''}
          disabled={!groups.length && !group}
          onChange={(event) => onChange(event.target.value, period)}
        >
          {!group ? <option value="">Pilih kelompok belajar...</option> : null}
          {group && !groups.some((item) => item.id === group.id) ? (
            <option value={group.id}>{group.name}</option>
          ) : null}
          {groups.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </Select>
        {options.hasNextPage ? (
          <Button
            type="button"
            variant="outline"
            disabled={options.isFetchingNextPage}
            onClick={() => void options.fetchNextPage()}
          >
            {options.isFetchingNextPage ? 'Memuat...' : 'Muat kelompok lainnya'}
          </Button>
        ) : null}
        {options.isError ? (
          <ReportError
            error={options.error}
            retry={() => void options.refetch()}
          />
        ) : null}
      </div>
      <div className="lr-field">
        <label htmlFor="report-period">Periode laporan *</label>
        <Input
          id="report-period"
          type="month"
          min="2000-01"
          max="2099-12"
          value={period}
          onChange={(event) => {
            if (event.target.value)
              onChange(group?.id ?? '', event.target.value)
          }}
        />
      </div>
      <div className="lr-field">
        <label htmlFor="report-tutor">Tentor pengisi laporan *</label>
        <Select
          id="report-tutor"
          value={tutorId ?? ''}
          disabled={!group?.contributions.some((item) => item.canEdit)}
          onChange={(event) =>
            onChange(group?.id ?? '', period, event.target.value)
          }
        >
          {!tutorId ? <option value="">Pilih tentor...</option> : null}
          {group?.contributions
            .filter((item) => item.canEdit)
            .map((item) => (
              <option key={item.tutorId} value={item.tutorId}>
                {item.tutorName}
              </option>
            ))}
        </Select>
      </div>
    </>
  )
}
