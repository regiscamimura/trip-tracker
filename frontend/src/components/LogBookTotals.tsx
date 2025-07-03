// Duty status types
const DUTY_STATUSES = {
  OFF_DUTY: 'off_duty',
  SLEEPER_BERTH: 'sleeper_berth',
  DRIVING: 'driving',
  ON_DUTY: 'on_duty',
} as const

// Duty status display names and colors
const DUTY_STATUS_CONFIG = {
  [DUTY_STATUSES.OFF_DUTY]: {
    name: 'OFF DUTY',
    color: 'bg-gray-500',
    borderColor: 'border-gray-400',
    textColor: 'text-gray-300',
  },
  [DUTY_STATUSES.SLEEPER_BERTH]: {
    name: 'SLEEPER BERTH',
    color: 'bg-purple-500',
    borderColor: 'border-purple-400',
    textColor: 'text-purple-300',
  },
  [DUTY_STATUSES.DRIVING]: {
    name: 'DRIVING',
    color: 'bg-green-500',
    borderColor: 'border-green-400',
    textColor: 'text-green-300',
  },
  [DUTY_STATUSES.ON_DUTY]: {
    name: 'ON DUTY',
    color: 'bg-blue-500',
    borderColor: 'border-blue-400',
    textColor: 'text-blue-300',
  },
}

interface LogBookTotalsProps {
  totals: Record<string, number>
}

export default function LogBookTotals({ totals }: LogBookTotalsProps) {
  return (
    <div className='border-2 border-black p-4'>
      <h3 className='text-black font-bold mb-3 text-center border-b border-black pb-2'>
        DAILY TOTALS
      </h3>
      <div className='grid grid-cols-2 gap-4'>
        {Object.entries(DUTY_STATUS_CONFIG).map(([status, config]) => (
          <div key={status} className='text-center'>
            <div className='bg-gray-100 text-black px-3 py-2 text-sm font-bold border border-black'>
              {config.name}
            </div>
            <div className='text-black text-lg font-bold mt-1'>
              {totals[status as keyof typeof totals].toFixed(1)} hrs
            </div>
          </div>
        ))}
      </div>

      {/* Total Hours */}
      <div className='mt-4 pt-4 border-t-2 border-black text-center'>
        <div className='text-gray-700 text-sm font-medium'>TOTAL HOURS</div>
        <div className='text-black text-2xl font-bold'>24.0 hrs</div>
      </div>
    </div>
  )
}
