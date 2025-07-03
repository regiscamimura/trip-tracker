import { useDotEvents } from '../useDotEvents'
import dutyStatusesFixture from '@/__fixtures__/sorted_timestamps.json'
import type { components } from '@/types/api'

// Mock data from sorted_timestamps.json fixture
const mockDutyStatuses = dutyStatusesFixture.map(item => ({
  ...item,
  daily_log_id: item.daily_log,
})) as components['schemas']['DutyStatus'][]

describe('useDotEvents', () => {
  it('should generate correct dot events from sorted duty statuses', () => {
    const { getAllDotEvents } = useDotEvents(mockDutyStatuses)
    const events = getAllDotEvents()

    // Should have events (original + copies + midnight entry + end-of-day entry, with duplicates removed)
    expect(events.length).toBeGreaterThan(0)

    // Test midnight entry (00:00 - off_duty, copy of first entry)
    const midnightEvent = events.find(
      e => e.hour === 0 && e.percentage === 0 && e.status === 'off_duty'
    )
    expect(midnightEvent).toBeDefined()
    expect(midnightEvent?.hour).toBe(0) // 00:00
    expect(midnightEvent?.percentage).toBe(0) // 00 minutes = 0%
    expect(midnightEvent?.status).toBe('off_duty')

    // Test first entry (09:45 UTC - off_duty) - converted to local time
    const firstEvent = events.find(e => e.id === 165)
    expect(firstEvent).toBeDefined()
    // The timestamp "2025-07-03T09:45:00Z" will be converted to local timezone
    // For UTC-3 timezone, this becomes 06:45 local time
    expect(firstEvent?.hour).toBe(6) // 06:45 (local time)
    expect(firstEvent?.percentage).toBe(75) // 45 minutes = 75%
    expect(firstEvent?.status).toBe('off_duty')

    // Test copy of first entry with next timestamp (10:00 UTC -> 07:00 local)
    const firstEventCopy = events.find(e => e.id === 165.1)
    expect(firstEventCopy).toBeDefined()
    expect(firstEventCopy?.hour).toBe(7) // 07:00 (local time)
    expect(firstEventCopy?.percentage).toBe(0) // 00 minutes = 0%
    expect(firstEventCopy?.status).toBe('off_duty')

    // Test second entry (10:00 UTC -> 07:00 local - on_duty)
    const secondEvent = events.find(e => e.id === 166)
    expect(secondEvent).toBeDefined()
    expect(secondEvent?.hour).toBe(7) // 07:00 (local time)
    expect(secondEvent?.percentage).toBe(0) // 00 minutes = 0%
    expect(secondEvent?.status).toBe('on_duty')

    // Test copy of second entry with next timestamp (10:15 UTC -> 07:15 local)
    const secondEventCopy = events.find(e => e.id === 166.1)
    expect(secondEventCopy).toBeDefined()
    expect(secondEventCopy?.hour).toBe(7) // 07:15 (local time)
    expect(secondEventCopy?.percentage).toBe(25) // 15 minutes = 25%
    expect(secondEventCopy?.status).toBe('on_duty')

    // Test last entry (15:30 UTC -> 12:30 local - sleeper_berth) - should not have a copy
    const lastEvent = events.find(e => e.id === 175)
    expect(lastEvent).toBeDefined()
    expect(lastEvent?.hour).toBe(12) // 12:30 (local time)
    expect(lastEvent?.percentage).toBe(50) // 30 minutes = 50%
    expect(lastEvent?.status).toBe('sleeper_berth')

    // Verify no copy exists for last entry
    const lastEventCopy = events.find(e => e.id === 175.1)
    expect(lastEventCopy).toBeUndefined()

    // Test end-of-day entry (23:100 - sleeper_berth, copy of last entry)
    const endOfDayEvent = events.find(
      e => e.hour === 23 && e.percentage === 100 && e.status === 'sleeper_berth'
    )
    expect(endOfDayEvent).toBeDefined()
    expect(endOfDayEvent?.hour).toBe(23) // 23:00
    expect(endOfDayEvent?.percentage).toBe(100) // End of hour
    expect(endOfDayEvent?.status).toBe('sleeper_berth')
  })

  it('should return correct dot events by status', () => {
    const { getDotEventsByStatus } = useDotEvents(mockDutyStatuses)
    const eventsByStatus = getDotEventsByStatus()

    // Should have entries for each status
    expect(eventsByStatus).toHaveProperty('off_duty')
    expect(eventsByStatus).toHaveProperty('on_duty')
    expect(eventsByStatus).toHaveProperty('driving')
    expect(eventsByStatus).toHaveProperty('sleeper_berth')

    // Test off_duty events
    expect(eventsByStatus.off_duty).toBeDefined()
    expect(Object.keys(eventsByStatus.off_duty).length).toBeGreaterThan(0)

    // Test on_duty events
    expect(eventsByStatus.on_duty).toBeDefined()
    expect(Object.keys(eventsByStatus.on_duty).length).toBeGreaterThan(0)

    // Test driving events
    expect(eventsByStatus.driving).toBeDefined()
    expect(Object.keys(eventsByStatus.driving).length).toBeGreaterThan(0)

    // Test sleeper_berth events
    expect(eventsByStatus.sleeper_berth).toBeDefined()
    expect(Object.keys(eventsByStatus.sleeper_berth).length).toBeGreaterThan(0)
  })

  it('should return correct global timeline', () => {
    const { getGlobalTimeline } = useDotEvents(mockDutyStatuses)
    const timeline = getGlobalTimeline()

    // Should have events
    expect(timeline.length).toBeGreaterThan(0)

    // Should be sorted by hour and percentage
    for (let i = 1; i < timeline.length; i++) {
      const prev = timeline[i - 1]
      const current = timeline[i]

      if (prev.hour === current.hour) {
        expect(prev.percentage).toBeLessThanOrEqual(current.percentage)
      } else {
        expect(prev.hour).toBeLessThan(current.hour)
      }
    }

    // Should start with midnight entry
    expect(timeline[0].hour).toBe(0)
    expect(timeline[0].percentage).toBe(0)
  })

  it('should handle empty duty statuses', () => {
    const { getAllDotEvents, getDotEventsByStatus, getGlobalTimeline } =
      useDotEvents([])

    expect(getAllDotEvents()).toHaveLength(0)
    expect(getDotEventsByStatus()).toEqual({})
    expect(getGlobalTimeline()).toHaveLength(0)
  })

  it('should handle single duty status', () => {
    const singleStatus = [mockDutyStatuses[0]] // Just the first entry
    const { getAllDotEvents } = useDotEvents(singleStatus)
    const events = getAllDotEvents()

    // Should have 3 events (1 original + 1 midnight entry + 1 end-of-day entry)
    expect(events).toHaveLength(3)

    // Check midnight entry
    const midnightEvent = events.find(e => e.hour === 0 && e.percentage === 0)
    expect(midnightEvent).toBeDefined()
    expect(midnightEvent?.status).toBe('off_duty')

    // Check original entry
    const originalEvent = events.find(e => e.id === 165)
    expect(originalEvent).toBeDefined()
    expect(originalEvent?.status).toBe('off_duty')
    expect(originalEvent?.hour).toBe(6) // 06:45 (local time from 09:45 UTC)

    // Check end-of-day entry
    const endOfDayEvent = events.find(
      e => e.hour === 23 && e.percentage === 100
    )
    expect(endOfDayEvent).toBeDefined()
    expect(endOfDayEvent?.status).toBe('off_duty')
  })

  it('should remove duplicate events', () => {
    const { getAllDotEvents } = useDotEvents(mockDutyStatuses)
    const events = getAllDotEvents()

    // Check for duplicates
    const seen = new Set()
    events.forEach(event => {
      const key = `${event.hour}-${event.percentage}-${event.status}`
      expect(seen.has(key)).toBe(false)
      seen.add(key)
    })
  })
})
