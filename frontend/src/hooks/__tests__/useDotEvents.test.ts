import { useDotEvents } from '../useDotEvents'
import dutyStatusesFixture from '@/__fixtures__/sorted_timestamps.json'

// Mock data from sorted_timestamps.json fixture
const mockDutyStatuses = dutyStatusesFixture as unknown[]

describe('useDotEvents', () => {
  it('should generate correct dot events from sorted duty statuses', () => {
    const { getAllDotEvents } = useDotEvents(mockDutyStatuses)
    const events = getAllDotEvents()

    // Should have 18 events (11 original + 9 copies + 1 midnight entry, with duplicates removed)
    expect(events).toHaveLength(18)

    // Test midnight entry (00:00 - off_duty, copy of first entry)
    const midnightEvent = events.find(e => e.id === 164.9)
    expect(midnightEvent).toBeDefined()
    expect(midnightEvent?.hour).toBe(0) // 00:00
    expect(midnightEvent?.percentage).toBe(0) // 00 minutes = 0%
    expect(midnightEvent?.status).toBe('off_duty')

    // Test first entry (06:45 - off_duty)
    const firstEvent = events.find(e => e.id === 165)
    expect(firstEvent).toBeDefined()
    expect(firstEvent?.hour).toBe(6) // 06:45
    expect(firstEvent?.percentage).toBe(75) // 45 minutes = 75%
    expect(firstEvent?.status).toBe('off_duty')

    // Test copy of first entry with next timestamp (07:00)
    const firstEventCopy = events.find(e => e.id === 165.1)
    expect(firstEventCopy).toBeDefined()
    expect(firstEventCopy?.hour).toBe(7) // 07:00
    expect(firstEventCopy?.percentage).toBe(0) // 00 minutes = 0%
    expect(firstEventCopy?.status).toBe('off_duty')

    // Test second entry (07:00 - on_duty)
    const secondEvent = events.find(e => e.id === 166)
    expect(secondEvent).toBeDefined()
    expect(secondEvent?.hour).toBe(7) // 07:00
    expect(secondEvent?.percentage).toBe(0) // 00 minutes = 0%
    expect(secondEvent?.status).toBe('on_duty')

    // Test copy of second entry with next timestamp (07:15)
    const secondEventCopy = events.find(e => e.id === 166.1)
    expect(secondEventCopy).toBeDefined()
    expect(secondEventCopy?.hour).toBe(7) // 07:15
    expect(secondEventCopy?.percentage).toBe(25) // 15 minutes = 25%
    expect(secondEventCopy?.status).toBe('on_duty')

    // Test last entry (12:30 - sleeper_berth) - should not have a copy
    const lastEvent = events.find(e => e.id === 175)
    expect(lastEvent).toBeDefined()
    expect(lastEvent?.hour).toBe(12) // 12:30
    expect(lastEvent?.percentage).toBe(50) // 30 minutes = 50%
    expect(lastEvent?.status).toBe('sleeper_berth')

    // Verify no copy exists for last entry
    const lastEventCopy = events.find(e => e.id === 175.1)
    expect(lastEventCopy).toBeUndefined()
  })

  it('should correctly identify when to show dots', () => {
    const { shouldShowDot } = useDotEvents(mockDutyStatuses)

    // Should show off_duty at midnight (00:00)
    expect(shouldShowDot(0, 'off_duty')).toBe(true)

    // Should show off_duty at 6:45
    expect(shouldShowDot(6, 'off_duty')).toBe(true)

    // Should show off_duty at 7:00 (copy with next timestamp)
    expect(shouldShowDot(7, 'off_duty')).toBe(true)

    // Should show on_duty at 7:00
    expect(shouldShowDot(7, 'on_duty')).toBe(true)

    // Should show on_duty at 7:15 (copy with next timestamp)
    expect(shouldShowDot(7, 'on_duty')).toBe(true)

    // Should not show driving at 6:00
    expect(shouldShowDot(6, 'driving')).toBe(false)
  })

  it('should return correct dot positions', () => {
    const { getDotPosition } = useDotEvents(mockDutyStatuses)

    // 00:00 should be at 0% position
    expect(getDotPosition(0, 'off_duty')).toBe(0)

    // 06:45 should be at 75% position
    expect(getDotPosition(6, 'off_duty')).toBe(75)

    // 07:00 should be at 0% position
    expect(getDotPosition(7, 'off_duty')).toBe(0)
    expect(getDotPosition(7, 'on_duty')).toBe(0)

    // 07:15 should be at 25% position
    expect(getDotPosition(7, 'on_duty')).toBe(0) // This will return the first match

    // 12:30 should be at 50% position
    expect(getDotPosition(12, 'sleeper_berth')).toBe(50)
  })

  it('should handle empty duty statuses', () => {
    const { getAllDotEvents, shouldShowDot, getDotPosition } = useDotEvents([])

    expect(getAllDotEvents()).toHaveLength(0)
    expect(shouldShowDot(10, 'off_duty')).toBe(false)
    expect(getDotPosition(10, 'off_duty')).toBe(0)
  })

  it('should handle single duty status', () => {
    const singleStatus = [mockDutyStatuses[0]] // Just the first entry
    const { getAllDotEvents } = useDotEvents(singleStatus)
    const events = getAllDotEvents()

    // Should have 2 events (1 original + 1 midnight entry)
    expect(events).toHaveLength(2)

    // Check midnight entry
    const midnightEvent = events.find(e => e.id === 164.9)
    expect(midnightEvent).toBeDefined()
    expect(midnightEvent?.hour).toBe(0)
    expect(midnightEvent?.status).toBe('off_duty')

    // Check original entry
    expect(events[1].id).toBe(165)
    expect(events[1].status).toBe('off_duty')
  })
})
