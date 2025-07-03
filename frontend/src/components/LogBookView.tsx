import type { components } from '@/types/api'
import { useDutyStatuses } from '@/hooks/useDutyStatuses'
import { useDutyStatusTotals } from '@/hooks/useDutyStatusTotals'
import LogBookPaperForm from './LogBookPaperForm'

type DailyLog = components['schemas']['DailyLog']

interface LogBookViewProps {
  dailyLog: DailyLog
  onBack: () => void
  onViewMap: () => void
}

export default function LogBookView({
  dailyLog,
  onBack,
  onViewMap,
}: LogBookViewProps) {
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
      <div className='px-2 sm:px-6 py-4'>
        {/* Navigation Buttons */}
        <div className='mb-4'>
          <div className='flex flex-col sm:flex-row gap-2'>
            <button
              onClick={onBack}
              className='btn-outline-sm border-gray-600 hover:bg-gray-600/10 flex items-center gap-1 w-full sm:w-auto'
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
            <button
              onClick={onViewMap}
              className='btn-outline-sm border-blue-600 hover:bg-blue-600/10 flex items-center gap-1 w-full sm:w-auto'
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
                  d='M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3'
                />
              </svg>
              View Map
            </button>
          </div>
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
