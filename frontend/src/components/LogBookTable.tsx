import { useDotEvents } from '@/hooks/useDotEvents'
import type { components } from '@/types/api'
import { useEffect, useRef } from 'react'

type DutyStatus = components['schemas']['DutyStatus']

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
  dutyStatuses: DutyStatus[]
}

export default function LogBookTable({ dutyStatuses }: LogBookTableProps) {
  const timeSlots = generateTimeSlots()
  const { getDotEventsByStatus, getGlobalTimeline } = useDotEvents(dutyStatuses)
  const dots = getDotEventsByStatus()
  const globalTimeline = getGlobalTimeline()
  const tableRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Function to draw lines between dots using actual coordinates
  const drawLines = () => {
    if (!tableRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size to match the table container
    const tableRect = tableRef.current.getBoundingClientRect()
    canvas.width = tableRect.width
    canvas.height = tableRect.height

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Get all dot elements
    const dotElements = tableRef.current.querySelectorAll('[data-dot]')
    const dotPositions: Array<{
      x: number
      y: number
      status: string
      hour: number
      percentage: number
    }> = []

    // Get positions of all dots
    dotElements.forEach(dotElement => {
      const rect = dotElement.getBoundingClientRect()
      const tableRect = tableRef.current!.getBoundingClientRect()

      const x = rect.left - tableRect.left + rect.width / 2
      const y = rect.top - tableRect.top + rect.height / 2
      const status = dotElement.getAttribute('data-status') || ''
      const hour = parseInt(dotElement.getAttribute('data-hour') || '0')
      const percentage = parseFloat(
        dotElement.getAttribute('data-percentage') || '0'
      )

      dotPositions.push({ x, y, status, hour, percentage })
    })

    // Create a map to find dots by their timeline properties
    const dotMap = new Map<string, { x: number; y: number }>()
    dotPositions.forEach(dot => {
      const key = `${dot.status}-${dot.hour}-${dot.percentage}`
      dotMap.set(key, { x: dot.x, y: dot.y })
    })

    // Only draw lines if we have dots
    if (dotPositions.length < 2) return

    // Draw lines following the global timeline order
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 2
    ctx.beginPath()

    let isFirst = true
    for (let i = 1; i < globalTimeline.length; i++) {
      const prevEvent = globalTimeline[i - 1]
      const currentEvent = globalTimeline[i]

      const prevKey = `${prevEvent.status}-${prevEvent.hour}-${prevEvent.percentage}`
      const currentKey = `${currentEvent.status}-${currentEvent.hour}-${currentEvent.percentage}`

      const prevDot = dotMap.get(prevKey)
      const currentDot = dotMap.get(currentKey)

      if (prevDot && currentDot) {
        if (isFirst) {
          ctx.moveTo(prevDot.x, prevDot.y)
          isFirst = false
        }
        ctx.lineTo(currentDot.x, currentDot.y)
      }
    }

    ctx.stroke()
  }

  // Redraw lines when component mounts or updates
  useEffect(() => {
    // Small delay to ensure DOM is rendered
    const timer = setTimeout(drawLines, 100)
    return () => clearTimeout(timer)
  }, [dots, globalTimeline])

  // Redraw lines on window resize
  useEffect(() => {
    const handleResize = () => {
      drawLines()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className='relative overflow-x-auto' ref={tableRef}>
      {/* Canvas overlay for drawing lines */}
      <canvas
        ref={canvasRef}
        className='absolute inset-0 w-full h-full pointer-events-none z-10'
        style={{ left: 0, top: 0 }}
      />

      <div className='relative min-w-[800px]'>
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
            {Object.entries(DUTY_STATUS_CONFIG).map(([statusKey, config]) => (
              <tr key={statusKey}>
                {/* Row Label */}
                <td className='whitespace-nowrap pr-1 border-b-2 border-black w-[120px] text-right'>
                  {config.name}
                </td>

                {/* Hour Columns */}
                {timeSlots.map((slot, index) => {
                  return (
                    <td
                      key={index}
                      className='h-[40px] w-[40px] border-2 border-black bg-white relative'
                    >
                      {/* Scale lines */}
                      <div className='absolute inset-0 pointer-events-none'>
                        {/* Middle line (50% height) */}
                        <div
                          className='absolute w-px bg-black'
                          style={{
                            left: '50%',
                            top: '0%',
                            height: '50%',
                            transform: 'translateX(-50%)',
                          }}
                        />
                        {/* Left line (30% height) */}
                        <div
                          className='absolute w-px bg-black'
                          style={{
                            left: '25%',
                            top: '0%',
                            height: '30%',
                            transform: 'translateX(-50%)',
                          }}
                        />
                        {/* Right line (30% height) */}
                        <div
                          className='absolute w-px bg-black'
                          style={{
                            left: '75%',
                            top: '0%',
                            height: '30%',
                            transform: 'translateX(-50%)',
                          }}
                        />
                      </div>

                      {/* Dots */}
                      {dots[statusKey][slot.hour]?.map(
                        (percentage, dotIndex) => (
                          <div
                            key={dotIndex}
                            className='absolute rounded-full w-[5px] h-[5px] bg-red-500 z-20'
                            style={{
                              left: `calc(${percentage}% - 2px)`,
                            }}
                            data-dot='true'
                            data-status={statusKey}
                            data-hour={slot.hour}
                            data-percentage={percentage}
                          />
                        )
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
