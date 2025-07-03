import type { components } from '@/types/api'

type DutyStatus = components['schemas']['DutyStatus']

// Duty status types
const DUTY_STATUSES = {
  OFF_DUTY: 'off_duty',
  SLEEPER_BERTH: 'sleeper_berth',
  DRIVING: 'driving',
  ON_DUTY: 'on_duty',
} as const

// Get duty status for a specific hour
const getDutyStatusAtHour = (
  hour: number,
  dutyStatuses: DutyStatus[],
  dailyLogCreatedAt: string
) => {
  const targetTime = new Date(dailyLogCreatedAt)
  targetTime.setHours(hour, 0, 0, 0)

  // Find the most recent duty status before or at this time
  const relevantStatus = dutyStatuses
    .filter(status => {
      const statusTime = new Date(status.timestamp)
      return statusTime <= targetTime
    })
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0]

  return relevantStatus?.duty_status || DUTY_STATUSES.OFF_DUTY
}

export const useDutyStatusTotals = (
  dutyStatuses: DutyStatus[],
  dailyLogCreatedAt: string
) => {
  // Calculate totals for each duty status
  const calculateTotals = () => {
    const totals = {
      [DUTY_STATUSES.OFF_DUTY]: 0,
      [DUTY_STATUSES.SLEEPER_BERTH]: 0,
      [DUTY_STATUSES.DRIVING]: 0,
      [DUTY_STATUSES.ON_DUTY]: 0,
    }

    for (let hour = 0; hour < 24; hour++) {
      const status = getDutyStatusAtHour(hour, dutyStatuses, dailyLogCreatedAt)
      totals[status as keyof typeof totals] += 1 // 1 hour
    }

    return totals
  }

  return calculateTotals()
}
