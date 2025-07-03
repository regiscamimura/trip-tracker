// Manual test script for useDotEvents logic
// Run with: node test-dot-events-manual.js

// Load fixture data
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const fixturePath = path.join(
  __dirname,
  '../src/__fixtures__/sorted_timestamps.json'
)
const mockDutyStatuses = JSON.parse(fs.readFileSync(fixturePath, 'utf8'))

// Simplified version of the useDotEvents logic
function getAllDotEvents(dutyStatuses) {
  const events = []
  if (!dutyStatuses.length) return events

  // Sort by time
  const sorted = [...dutyStatuses].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
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

// Test the function
console.log('=== Testing useDotEvents Logic ===\n')

const events = getAllDotEvents(mockDutyStatuses)

console.log(`Total events generated: ${events.length}`)
console.log(
  'Expected: ~19 events (11 original + 9 copies + 1 midnight entry + 1 end-of-day entry, with duplicates removed)\n'
)

console.log('=== All Events ===')
events.forEach((event, index) => {
  const timeStr = `${event.hour.toString().padStart(2, '0')}:${Math.floor(
    event.percentage * 0.6
  )
    .toString()
    .padStart(2, '0')}`
  console.log(
    `${index + 1}. ID: ${event.id}, Time: ${timeStr}, Hour: ${
      event.hour
    }, Percentage: ${event.percentage}%, Status: ${event.status}`
  )
})

console.log('\n=== Analysis ===')

// Check for specific patterns
const offDutyEvents = events.filter(e => e.status === 'off_duty')
const onDutyEvents = events.filter(e => e.status === 'on_duty')
const drivingEvents = events.filter(e => e.status === 'driving')
const sleeperEvents = events.filter(e => e.status === 'sleeper_berth')

console.log(`Off Duty events: ${offDutyEvents.length}`)
console.log(`On Duty events: ${onDutyEvents.length}`)
console.log(`Driving events: ${drivingEvents.length}`)
console.log(`Sleeper Berth events: ${sleeperEvents.length}`)

// Check for ID patterns
const originalIds = events.filter(e => Number.isInteger(e.id))
const copyIds = events.filter(
  e => !Number.isInteger(e.id) && e.id > 0 && e.id % 1 === 0.1
)
const midnightIds = events.filter(e => e.id < 0)
const endOfDayIds = events.filter(
  e => !Number.isInteger(e.id) && e.id > 0 && e.id % 1 === 0.2
)

console.log(`\nOriginal entries: ${originalIds.length}`)
console.log(`Copy entries: ${copyIds.length}`)
console.log(`Midnight entries: ${midnightIds.length}`)
console.log(`End-of-day entries: ${endOfDayIds.length}`)

// Show some specific examples
console.log('\n=== Examples ===')
const midnightEvent = events.find(
  e => e.hour === 0 && e.percentage === 0 && e.status === 'off_duty'
)
const firstEvent = events.find(e => e.id === 165)
const firstCopy = events.find(e => e.id === 165.1)
const lastEvent = events.find(e => e.id === 175)
const endOfDayEvent = events.find(
  e => e.hour === 23 && e.percentage === 100 && e.status === 'sleeper_berth'
)

if (midnightEvent) {
  console.log(
    `Midnight event: ${midnightEvent.status} at 00:00 (ID: ${midnightEvent.id})`
  )
}
if (firstEvent) {
  console.log(
    `First event (ID 165): ${firstEvent.status} at ${firstEvent.hour}:${Math.floor(
      firstEvent.percentage * 0.6
    )
      .toString()
      .padStart(2, '0')}`
  )
}
if (firstCopy) {
  console.log(
    `First copy (ID 165.1): ${firstCopy.status} at ${firstCopy.hour}:${Math.floor(
      firstCopy.percentage * 0.6
    )
      .toString()
      .padStart(2, '0')}`
  )
}
if (lastEvent) {
  console.log(
    `Last event (ID 175): ${lastEvent.status} at ${lastEvent.hour}:${Math.floor(
      lastEvent.percentage * 0.6
    )
      .toString()
      .padStart(2, '0')}`
  )
}
if (endOfDayEvent) {
  console.log(
    `End-of-day event: ${endOfDayEvent.status} at 23:00 (ID: ${endOfDayEvent.id})`
  )
}

console.log('\n=== Test Complete ===')
