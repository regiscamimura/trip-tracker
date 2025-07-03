import type { components } from '@/types/api'
import LogBookDriverInfo from './LogBookDriverInfo'
import LogBookTable from './LogBookTable'
import LogBookTotals from './LogBookTotals'
import LogBookRemarks from './LogBookRemarks'

type DailyLog = components['schemas']['DailyLog']

interface LogBookPaperFormProps {
  dailyLog: DailyLog
  dutyStatuses: any[]
  totals: Record<string, number>
}

export default function LogBookPaperForm({
  dailyLog,
  dutyStatuses,
  totals,
}: LogBookPaperFormProps) {
  return (
    <div className='bg-white text-black p-6 max-w-7xl mx-auto'>
      {/* Paper Form Header */}
      <div className='text-center mb-6'>
        <h1 className='text-2xl font-bold text-black mb-2'>DAILY LOG BOOK</h1>
        <p className='text-gray-600 text-sm'>
          Daily Log #{dailyLog.id} •{' '}
          {new Date(dailyLog.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* Driver Information Section */}
      <LogBookDriverInfo dailyLog={dailyLog} />

      {/* Log Book Grid */}
      <LogBookTable dutyStatuses={dutyStatuses} />

      {/* Totals and Remarks Section */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-6'>
        {/* Totals Section */}
        <LogBookTotals totals={totals} />

        {/* Remarks Section */}
        <LogBookRemarks dutyStatuses={dutyStatuses} />
      </div>
    </div>
  )
}
