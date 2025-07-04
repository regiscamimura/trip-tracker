import type { components } from '@/types/api'

type DutyStatus = components['schemas']['DutyStatus']

export interface DotEvent {
  id: number
  hour: number
  percentage: number
  status: string
}

export const useDotEvents = (dutyStatuses: DutyStatus[]) => {
  // Get all dot events for vertical alignment (both previous and new status at each change)
  const getAllDotEvents = (): DotEvent[] => {
    const events: DotEvent[] = []
    if (!dutyStatuses.length) return events

    // Sort by time
    const sorted = [...dutyStatuses].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )

    // Add midnight entry (copy of first entry at 00:00)
    if (sorted.length > 0) {
      const firstEntry = sorted[0]
      events.push({
        id: (firstEntry.id || 0) - 0.1, // Use negative decimal to indicate midnight entry
        hour: 0, // Midnight
        percentage: 0, // Start of hour
        status: firstEntry.duty_status,
      })
    }

    // Iterate over the sorted array and create pairs
    sorted.forEach((entry, index) => {
      const currentTime = new Date(entry.timestamp)
      const currentHour = currentTime.getHours()
      const currentMinute = currentTime.getMinutes()

      // Calculate percentage for current time
      let currentPercentage = 0
      if (currentMinute < 15) currentPercentage = 0
      else if (currentMinute < 30) currentPercentage = 25
      else if (currentMinute < 45) currentPercentage = 50
      else currentPercentage = 75

      // Add the current entry
      events.push({
        id: entry.id || 0,
        hour: currentHour,
        percentage: currentPercentage,
        status: entry.duty_status,
      })

      // Add a copy with the next entry's timestamp (if there is a next entry)
      if (index < sorted.length - 1) {
        const nextEntry = sorted[index + 1]
        const nextTime = new Date(nextEntry.timestamp)
        const nextHour = nextTime.getHours()
        const nextMinute = nextTime.getMinutes()

        // Calculate percentage for next time
        let nextPercentage = 0
        if (nextMinute < 15) nextPercentage = 0
        else if (nextMinute < 30) nextPercentage = 25
        else if (nextMinute < 45) nextPercentage = 50
        else nextPercentage = 75

        // Add copy of current entry with next entry's timestamp and modified ID
        events.push({
          id: (entry.id || 0) + 0.1,
          hour: nextHour,
          percentage: nextPercentage,
          status: entry.duty_status,
        })
      }
    })

    // Add end-of-day entry (copy of last entry at end of hour 23)
    if (sorted.length > 0) {
      const lastEntry = sorted[sorted.length - 1]
      events.push({
        id: (lastEntry.id || 0) + 0.2, // Use positive decimal to indicate end midnight entry
        hour: 23, // Last hour of the day
        percentage: 100, // End of the hour
        status: lastEntry.duty_status,
      })
    }

    // Remove duplicates
    const unique = events.filter(
      (e, i, arr) =>
        i ===
        arr.findIndex(
          x =>
            x.hour === e.hour &&
            x.percentage === e.percentage &&
            x.status === e.status
        )
    )

    return unique
  }

  const getDotEventsByStatus = (): Record<string, Record<number, number[]>> => {
    const events = getAllDotEvents()
    const result: Record<string, Record<number, number[]>> = {}

    events.forEach(event => {
      if (!result[event.status]) {
        result[event.status] = {}
      }
      if (!result[event.status][event.hour]) {
        result[event.status][event.hour] = []
      }
      result[event.status][event.hour].push(event.percentage)
    })

    return result
  }

  const getGlobalTimeline = (): DotEvent[] => {
    return getAllDotEvents().sort((a, b) => {
      // Sort by hour first, then by percentage
      if (a.hour !== b.hour) {
        return a.hour - b.hour
      }
      return a.percentage - b.percentage
    })
  }

  return {
    getAllDotEvents,
    getDotEventsByStatus,
    getGlobalTimeline,
  }
}
