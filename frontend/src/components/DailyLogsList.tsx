import type { components } from '@/types/api'

type DailyLog = components['schemas']['DailyLog']

interface DailyLogsListProps {
  dailyLogs: DailyLog[]
  isLoadingLogs: boolean
  onRefresh: () => void
}

export default function DailyLogsList({
  dailyLogs,
  isLoadingLogs,
  onRefresh,
}: DailyLogsListProps) {
  return (
    <div className='bg-surface rounded-lg p-6'>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-xl text-brand'>Your Daily Logs</h2>
        <button
          onClick={onRefresh}
          disabled={isLoadingLogs}
          className='bg-accent hover:bg-accent/80 disabled:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors'
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
          <div className='space-y-3'>
            {dailyLogs.map(log => (
              <div key={log.id} className='bg-gray-800 p-4 rounded-lg'>
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
                <div className='text-sm text-gray-300 space-y-1'>
                  <p>
                    Driver: {log.driver?.user?.first_name}{' '}
                    {log.driver?.user?.last_name}
                  </p>
                  <p>Truck: {log.truck?.truck_number || 'Unknown'}</p>
                  <p>Trailer: {log.trailer?.trailer_number || 'Unknown'}</p>
                  <p>Created: {new Date(log.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
