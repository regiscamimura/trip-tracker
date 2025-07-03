import type { components } from '@/types/api'

type DailyLog = components['schemas']['DailyLog']

interface DailyLogsListProps {
  dailyLogs: DailyLog[]
  isLoadingLogs: boolean
  onRefresh: () => void
  onShowMap: (dailyLog: DailyLog) => void
  onShowChart: (dailyLog: DailyLog) => void
}

export default function DailyLogsList({
  dailyLogs,
  isLoadingLogs,
  onRefresh,
  onShowMap,
  onShowChart,
}: DailyLogsListProps) {
  return (
    <div className='bg-surface p-4'>
      <div className='flex justify-between items-center mb-2'>
        <h2 className='text-xl text-brand'>Your Daily Logs</h2>
        <button
          onClick={onRefresh}
          disabled={isLoadingLogs}
          className='btn-outline-sm border-accent hover:bg-accent/10 disabled:border-gray-600 disabled:bg-transparent'
        >
          {isLoadingLogs ? 'Loading...' : 'Refresh'}
        </button>
      </div>
      <div className='text-white'>
        {isLoadingLogs ? (
          <p className='text-gray-400'>Loading daily logs...</p>
        ) : dailyLogs.length === 0 ? (
          <p className='text-gray-400'>
            No daily logs found. Use the simulation above to generate sample
            data!
          </p>
        ) : (
          <div className='space-y-2'>
            {dailyLogs.map(log => (
              <div key={log.id} className='bg-gray-800 p-4'>
                <div className='flex justify-between items-start mb-2'>
                  <h3 className='text-brand font-medium'>
                    Daily Log #{log.id}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      log.status === 'completed'
                        ? 'bg-green-600'
                        : 'bg-yellow-600'
                    }`}
                  >
                    {log.status}
                  </span>
                </div>
                <div className='text-sm text-gray-300 space-y-1 mb-3'>
                  <p>
                    Driver: {log.driver?.user?.first_name}{' '}
                    {log.driver?.user?.last_name}
                  </p>
                  <p>Truck: {log.truck?.truck_number || 'Unknown'}</p>
                  <p>Trailer: {log.trailer?.trailer_number || 'Unknown'}</p>
                  <p>Created: {new Date(log.created_at).toLocaleString()}</p>
                </div>
                <div className='flex gap-2'>
                  <button
                    onClick={() => onShowMap(log)}
                    className='btn-outline-sm border-blue-600 hover:bg-blue-600/10 flex items-center gap-1'
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
                    Map View
                  </button>
                  <button
                    onClick={() => onShowChart(log)}
                    className='btn-outline-sm border-purple-600 hover:bg-purple-600/10 flex items-center gap-1'
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
                        d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                      />
                    </svg>
                    Chart View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
