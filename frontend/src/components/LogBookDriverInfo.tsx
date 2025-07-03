import type { components } from '@/types/api'

type DailyLog = components['schemas']['DailyLog']

interface LogBookDriverInfoProps {
  dailyLog: DailyLog
}

export default function LogBookDriverInfo({
  dailyLog,
}: LogBookDriverInfoProps) {
  return (
    <div className='border-2 border-black mb-6'>
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 p-4 text-sm'>
        <div>
          <label className='text-gray-700 block font-medium'>
            Truck Number:
          </label>
          <span className='text-black font-bold'>
            {dailyLog.truck?.truck_number || 'N/A'}
          </span>
        </div>
        <div>
          <label className='text-gray-700 block font-medium'>
            Trailer Number:
          </label>
          <span className='text-black font-bold'>
            {dailyLog.trailer?.trailer_number || 'N/A'}
          </span>
        </div>
        <div>
          <label className='text-gray-700 block font-medium'>Driver:</label>
          <span className='text-black font-bold'>
            {dailyLog.driver?.user?.first_name}{' '}
            {dailyLog.driver?.user?.last_name}
          </span>
        </div>
        <div>
          <label className='text-gray-700 block font-medium'>Co-Driver:</label>
          <span className='text-black font-bold'>N/A</span>
        </div>
      </div>
    </div>
  )
}
