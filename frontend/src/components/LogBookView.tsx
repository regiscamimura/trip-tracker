import type { components } from '@/types/api'
import { useDutyStatuses } from '@/hooks/useDutyStatuses'
import { useDutyStatusTotals } from '@/hooks/useDutyStatusTotals'
import LogBookPaperForm from './LogBookPaperForm'

type DailyLog = components['schemas']['DailyLog']

interface LogBookViewProps {
  dailyLog: DailyLog
  onBack: () => void
}

export default function LogBookView({ dailyLog, onBack }: LogBookViewProps) {
  const { dutyStatuses, isLoading } = useDutyStatuses(dailyLog)
  const totals = useDutyStatusTotals(dutyStatuses, dailyLog.created_at)

  if (isLoading) {
    return (
      <div className='bg-surface p-4'>
        <div className='flex justify-center items-center h-64'>
          <div className='text-brand text-lg'>Loading duty statuses...</div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-surface'>
      {/* App Header */}
      <div className='px-6 py-4'>
        {/* Back Button */}
        <div className='mb-4'>
          <button
            onClick={onBack}
            className='btn-outline-sm border-gray-600 hover:bg-gray-600/10 flex items-center gap-1 mb-2'
          >
            <svg
              className='w-4 h-4'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M15 19l-7-7 7-7'
              />
            </svg>
            Back to List
          </button>
        </div>
      </div>

      {/* Paper Form */}
      <LogBookPaperForm
        dailyLog={dailyLog}
        dutyStatuses={dutyStatuses}
        totals={totals}
      />
    </div>
  )
}
