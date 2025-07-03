import { useDotEvents } from '@/hooks/useDotEvents'

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

// Generate 24 hours (one column per hour)
const generateTimeSlots = () => {
  const slots = []
  for (let hour = 0; hour < 24; hour++) {
    let timeLabel = ''

    if (hour === 0) {
      timeLabel = 'MIDNIGHT'
    } else if (hour === 12) {
      timeLabel = 'NOON'
    } else {
      timeLabel = hour.toString()
    }

    slots.push({ timeLabel, hour })
  }
  return slots
}

interface LogBookTableProps {
  dutyStatuses: any[]
}

export default function LogBookTable({ dutyStatuses }: LogBookTableProps) {
  const { shouldShowDot, getDotPosition } = useDotEvents(dutyStatuses)
  const timeSlots = generateTimeSlots()

  return (
    <div className=''>
      <table className='border-collapse'>
        {/* Time Header Row */}
        <thead>
          <tr>
            <th></th>
            {timeSlots.map((slot, index) => (
              <th
                key={index}
                className='text-xs text-black text-center py-2 relative'
              >
                <div
                  className={`absolute text-xs font-bold text-black left-0 -translate-x-1/2`}
                >
                  {slot.timeLabel}
                </div>
              </th>
            ))}
            {/* Extra column for closing midnight label */}
            <th className='text-xs text-black text-center py-2 relative'>
              <div className='absolute text-xs font-bold text-black left-0 -translate-x-1/2'>
                MIDNIGHT
              </div>
            </th>
          </tr>
        </thead>

        {/* Duty Status Rows */}
        <tbody>
          {Object.entries(DUTY_STATUS_CONFIG).map(([status, config]) => (
            <tr key={status}>
              {/* Row Label */}
              <td className='whitespace-nowrap pr-1 border-b-2 border-black'>
                {config.name}
              </td>

              {/* Hour Columns */}
              {timeSlots.map((slot, index) => {
                const shouldShow = shouldShowDot(slot.hour, status)
                return (
                  <td
                    key={index}
                    className='h-[50px] w-[40px] border-x-2 border-b-2 border-black bg-white relative'
                  >
                    {/* Status indicator dot */}
                    {shouldShow && (
                      <div
                        className='absolute w-1 h-1 bg-red-500 rounded-full -translate-x-1/2'
                        style={{
                          left: `${getDotPosition(slot.hour, status)}%`,
                        }}
                      />
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
